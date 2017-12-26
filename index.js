const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const childProcess = require('child_process');

const express = require('express');
const etag = require('etag');
const tmp = require('tmp');
const rimraf = require('rimraf');
const modulequery = require('modulequery');
const puppeteer = require('puppeteer');

const font = require('./font');

const mq = modulequery();

const port = process.env['PORT'] || 8080;
const securePort = 443;
const imageSize = 640;
const videoSize = 480;
const maxAge = 10 * 60 * 1000;

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
class TempDir {
  constructor(path, cleanup) {
    this.path = path;
    this.cleanup = cleanup;
  }
}
const _requestTempDir = () => new Promise((accept, reject) => {
  tmp.dir({
    keep: true,
  }, (err, path) => {
    if (!err) {
      accept(new TempDir(path, () => new Promise((accept, reject) => {
        rimraf(path, err => {
          if (!err) {
            accept();
          } else {
            reject(err);
          }
        });
      })));
    } else {
      reject(err);
    }
  });
});
function _pad(n, width) {
  n = n + '';
  return n.length >= width ? n : Array(width - n.length + 1).join('0') + n;
}

const app = express();
app.use('/static', express.static(__dirname));
app.get('/render/:fileId/:fileName/:ext', (req, res, next) => {
  const u = `${req.params.fileId}/${req.params.fileName}/${req.params.ext}`;

  const promise = new Promise((accept, reject) => {
    _requestTicket(next => {
      (async () => {
        const page = await browser.newPage();
        await page.setViewport({
          width: imageSize,
          height: imageSize,
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
          reject(new Error('timed out'));

          page.close();

          next();
        }, 30 * 1000);
        await page.goto(`http://127.0.0.1:${port}/static?u=${encodeURIComponent(u)}&s=${imageSize}`);
      })()
        .catch(err => {
          reject(err);

          next();
        });
    });
  });
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

app.get('/readme/:name/:version', (req, res, next) => {
  const {name, version} = req.params;
  const width = parseInt(req.query.width, 10) || 640;
  const height = parseInt(req.query.height, 10) || 480;
  const devicePixelRatio = parseInt(req.query.devicePixelRatio, 10) || 1;

  mq.getModule(name)
    .then(modSpec => {
      browser.newPage()
        .then(page => {
          return page.setViewport({
            width,
            height,
            deviceScaleFactor: devicePixelRatio,
          })
          .then(() => page.goto(
            `data:text/html,\
              <!doctype html>\
              <html>\
                <head>\
                  <style>
                    ${font}
                    body {
                      font-family: 'Open Sans';
                      line-height: 1.4;
                    }
                    a {
                      color: '2196F3';
                    }
                  </style>
                </head>
                <body>
                  ${modSpec.readme || '<div style="margin: 50px 0; font-size: 40px; text-align: center;">No readme</div>'}
                </body>
              </html>`
            ))
            .then(() => page.screenshot({
              type: 'png',
              fullPage: true,
            }))
            .then(screenshot => {
              page.close();

              return screenshot;
            })
            .catch(err => {
              res.status(500);
              res.end();

              page.close();
            });
        });
    })
    .then(screenshot => {
      res.type('image/png');
      res.end(screenshot);
    })
    .catch(err => {
      res.status(err.statusCode || 500);
      res.send(err.stack);
    });
});

app.get('/preview/:protocol/:host/:port', (req, res, next) => {
  const {protocol, host} = req.params;
  const port = parseInt(req.params.port, 10);

  const captureTime = 10 * 1000;

  res.type('video/webm');
  res.set('Cache-Control', `public, max-age=${maxAge}`);

  const promise = new Promise((accept, reject) => {
    _requestTicket(next => {
      (async () => {
        const tempDir = await _requestTempDir();
        next = (next => () => {
          tempDir.cleanup()
            .catch(err => {
              console.warn(err);
            });

          next();
        })(next);

        const page = await browser.newPage();
        await page.setViewport({
          width: videoSize,
          height: videoSize,
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
        let frame = 0;
        page.on('console', async msg => {
          if (msg.type === 'log' && msg.args.length === 2 && msg.args[0]._remoteObject.value === 'data') {
            const d = new Buffer(msg.args[1]._remoteObject.value.replace(/^.*?,/, ''), 'base64');

            console.log('server preview stream frame', d.length);

            fs.writeFile(
              path.join(tempDir.path, 'frame' + _pad(frame++, 4) + '.jpg'),
              d,
              err => {
                if (err) {
                  console.warn('server preview frame write error', err);
                }
              }
            );
          } else if (msg.type === 'log' && msg.args.length === 1 && msg.args[0]._remoteObject.value === 'end') {
            console.log('server preview stream end');

            const ffmpeg = childProcess.spawn('ffmpeg', ['-framerate', '24', '-i', path.join(tempDir.path, 'frame%04d.jpg'), '-f', 'webm', 'pipe:1']);
            res.type('video/webm');
            ffmpeg.stdout.pipe(res, {end: false});
            ffmpeg.on('error', err => {
              accept(err);

              next();
            });
            ffmpeg.on('close', () => {
              console.log('server preview encode end');

              accept();

              next();
            });

            page.close();
            clearTimeout(timeout);
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
          reject(new Error('timed out'));

          page.close();

          next();
        }, 10 * 1000 + captureTime);
        await page.goto(`${protocol}://${host}:${port}/?ci=1`);
      })()
        .catch(err => {
          reject(err);

          next();
        });
    });
  });
  promise
    .then(() => {
      res.end();
    })
    .catch(err => {
      res.status(err.statusCode || 500);
      res.end(err.stack);
    });
});

app.get('/spectate/:protocol/:host/:port', (req, res, next) => {
  const {protocol, host} = req.params;
  const port = parseInt(req.params.port, 10);

  const captureTime = 10 * 1000;

  res.type('video/webm');
  res.set('Cache-Control', `public, max-age=${maxAge}`);

  const promise = new Promise((accept, reject) => {
    _requestTicket(next => {
      (async () => {
        const page = await browser.newPage();
        await page.setViewport({
          width: videoSize,
          height: videoSize,
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
          if (msg.type === 'log' && msg.args.length === 2 && msg.args[0]._remoteObject.value === 'data') {
            const d = new Buffer(msg.args[1]._remoteObject.value, 'base64');

            console.log('server spectate stream frame', d.length);

            res.write(d);
          } else if (msg.type === 'log' && msg.args.length === 1 && msg.args[0]._remoteObject.value === 'end') {
            console.log('server spectate stream end');

            accept();

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
          reject(new Error('timed out'));

          page.close();

          next();
        }, 10 * 1000 + captureTime);
        await page.goto(`${protocol}://${host}:${port}/?cv=1`);
      })()
        .catch(err => {
          reject(err);

          next();
        });
    });
  });
  promise
    .then(() => {
      res.end();
    })
    .catch(err => {
      res.status(err.statusCode || 500);
      res.end(err.stack);
    });
});

const _requestBrowser = () => puppeteer.launch({
  args: [
    '--no-sandbox',
    '--no-zygote',
  ],
});
const _readFile = p => new Promise((accept, reject) => {
  fs.readFile(p, (err, d) => {
    if (!err) {
      accept(d);
    } else {
      reject(err);
    }
  });
});

let browser = null;
Promise.all([
  Promise.all([
    _readFile(path.join('/', 'certs', 'cert.pem')),
    _readFile(path.join('/', 'certs', 'key.pem')),
  ])
    .then(([
      cert,
      key,
    ]) => ({
      cert,
      key,
    }))
    .catch(err => {
      if (err.code === 'ENOENT') {
        return Promise.resolve(null);
      } else {
        return Promise.reject(err);
      }
    }),
  _requestBrowser(),
])
  .then(([
    certs,
    newBrowser,
  ]) => {
    browser = newBrowser;
    const _disconnected = () => {
      console.warn(new Error('browser disconnected, restarting...'));

      _requestBrowser()
        .then(() => {
          browser = newBrowser;
          browser.on('disconnected', _disconnected);
        })
        .catch(err => {
          throw err; // nothing else we can do
        });
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
    if (certs) {
      const secureServer = https.createServer({
        cert: certs.cert,
        key: certs.key,
      }, app);
      secureServer.listen(securePort, err => {
        if (!err) {
          console.log(`listening on https://0.0.0.0:${securePort}/`);
        } else {
          throw err;
        }
      });
    }

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
