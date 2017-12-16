const http = require('http');

const express = require('express');
const etag = require('etag');
const puppeteer = require('puppeteer');

const port = process.env['PORT'] || 8080;
const size = 1280;
const maxAge = 10 * 60 * 1000;

const LRU = require('lru-cache');
const cache = new LRU({
  max: 100,
  maxAge,
});

const app = express();
app.use('/static', express.static(__dirname));
app.get('/render', (req, res, next) => {
  const {u} = req.query;

  const entry = cache.get(u);
  if (entry) {
    res.type('image/jpeg');
    res.set('Etag', entry.etag);
    res.set('Cache-Control', `public, max-age=${maxAge}`);

    if (req.headers['if-none-match'] === entry.etag) {
      res.status(304);
      res.end();
    } else {
      res.end(entry);
    }
  } else {
    (async () => {
      try {
        const page = await browser.newPage();
        await page.setViewport({
          width: size,
          height: size,
        });
        page.on('error', err => {
          res.status(500);
          res.end(err.stack);
        });
        page.on('pageerror', err => {
          res.status(500);
          res.end(err.stack);
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
              type: 'jpeg',
            });
            buffer.etag = etag(buffer);

            cache.set(u, buffer);

            res.type('image/jpeg');
            res.set('Etag', buffer.etag);
            res.set('Cache-Control', `public, max-age=${maxAge}`);
            if (req.headers['if-none-match'] === buffer.etag) {
              res.status(304);
              res.end();
            } else {
              res.end(buffer);
            }

            page.close();
            clearTimeout(timeout);
          } else if (msg.type === 'warning' && msg.args.length === 3 && msg.args[0]._remoteObject.value === 'error') {
            res.status(msg.args[1]._remoteObject.value);
            res.end(msg.args[2]._remoteObject.value);

            page.close();
            clearTimeout(timeout);
          }
        });
        const timeout = setTimeout(() => {
          res.status(500);
          res.end('timed out');

          page.close();
        }, 5 * 1000);
        await page.goto(`http://127.0.0.1:${port}/static?u=${encodeURIComponent(u)}&s=${size}`);
      } catch(err) {
        res.status(500);
        res.end(err.stack);
      }
    })();
  }
});

let browser = null;
puppeteer.launch({
  args: [
    '--no-sandbox',
    '--no-zygote',
    '--disable-http-cache',
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
