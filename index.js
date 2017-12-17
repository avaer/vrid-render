const http = require('http');

const express = require('express');
const etag = require('etag');
const puppeteer = require('puppeteer');

const port = process.env['PORT'] || 8080;
const size = 640;
const maxAge = 10 * 60 * 1000;

const LRU = require('lru-cache');
const cache = new LRU({
  max: 100,
  maxAge,
});
let running = false;
const queue = [];
const _requestTicket = fn => {
  if (!running) {
    running = true;

    fn(() => {
      running = false;

      if (queue.length > 0) {
        _requestTicket(queue.shift());
      }
    });
  } else {
    queue.push(fn);
  }

  console.log('request ticket queue length', queue.length);
};

const app = express();
app.use('/static', express.static(__dirname));
app.get('/render/:fileId/:fileName/:ext', (req, res, next) => {
  const u = `${req.params.fileId}/${req.params.fileName}/${req.params.ext}`;

  let promise = cache.get(u);
  if (!promise) {
    promise = new Promise((accept, reject) => {
      _requestTicket(next => {
        (async () => {
          const page = await browser.newPage();
          await page.setViewport({
            width: size,
            height: size,
          });
          page.on('error', err => {
            reject(err);

            next();
          });
          page.on('pageerror', err => {
            reject(err);

            next();
          });
          /* page.on('request', req => {
            console.log('request', req.url);
          });
          page.on('response', res => {
            console.log('response', res.url);
          });
          page.on('requestfinished', req => {
            console.log('requestfinished', req.url);
          });
          page.on('requestfailed', err => {
            console.log('request failed', err);
          });  */
          page.on('console', async msg => {
            if (msg.type === 'log' && msg.args.length === 1 && msg.args[0]._remoteObject.value === 'loaded') {
              const buffer = await page.screenshot({
                // type: 'jpeg',
                omitBackground: true,
              });
              buffer.etag = etag(buffer);

              accept(buffer);

              page.close();
              clearTimeout(timeout);

              next();
            } else if (msg.type === 'warning' && msg.args.length === 3 && msg.args[0]._remoteObject.value === 'error') {
              const err = new Error(msg.args[2]._remoteObject.value);
              err.statusCode = msg.args[1]._remoteObject.value;

              reject(err);

              page.close();
              clearTimeout(timeout);

              next();
            } else {
              console.log(msg.text);
            }
          });
          const timeout = setTimeout(() => {
            const err = new Error('timed out');
            reject(err);

            page.close();

            next();
          }, 30 * 1000);
          await page.goto(`http://127.0.0.1:${port}/static?u=${encodeURIComponent(u)}&s=${size}`);
        })()
          .catch(err => {
            reject(err);

            next();
          });
      });
    });
    cache.set(u, promise);
  }
  promise
    .then(buffer => {
      res.type('image/png');
      res.set('Etag', buffer.etag);
      res.set('Cache-Control', `public, max-age=${maxAge}`);

      if (req.headers['if-none-match'] === buffer.etag) {
        res.status(304);
        res.end();
      } else {
        res.end(buffer);
      }
    })
    .catch(err => {
      res.status(err.statusCode || 500);
      res.end(err.stack);
    });
});

let browser = null;
puppeteer.launch({
  args: [
    '--no-sandbox',
    '--no-zygote',
  ],
})
  .then(newBrowser => {
    browser = newBrowser;
    const _disconnected = () => {
      const err = new Error('browser disconnected');
      throw err;
    };
    browser.on('disconnected', _disconnected);

    const server = http.createServer(app);
    server.listen(port, err => {
      if (!err) {
        console.log(`listening on http://0.0.0.0:${port}/`);
      } else {
        throw err;
      }
    });

    const _sigterm = () => {
      browser.removeListener('disconnected', _disconnected);

      process.exit(0);
    };
    process.on('SIGINT', _sigterm);
    process.on('SIGTERM', _sigterm);
  })
  .catch(err => {
    throw err;
  });
