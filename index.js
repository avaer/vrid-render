const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const childProcess = require('child_process');

const express = require('express');
const etag = require('etag');
const tmp = require('tmp');
const rimraf = require('rimraf');
const httpProxy = require('http-proxy');
const modulequery = require('modulequery');
const dockerode = require('dockerode');
const puppeteer = require('puppeteer');

const font = require('./font');

const proxy = httpProxy.createProxyServer();
const mq = modulequery();
const docker = dockerode();

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
app.all('*', (req, res, next) => {
  if (req.headers['host'] === 'try.zeovr.io') {
    if (bundleAddress !== null && bundlePort !== null) {
      proxy.web(req, res, {
        target: `http://${bundleAddress}:${bundlePort}`,
      }, err => {
        res.status(500);
        res.end(err.stack);
      });
    } else {
      res.status(404);
      res.end(http.STATUS_CODES[404]);
    }
  } else {
    next();
  }
});
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

            // console.log('server preview stream frame', d.length);

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
            // ffmpeg.stderr.pipe(process.stderr);
            ffmpeg.on('error', err => {
              reject(err);

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
        }, 1 * 60 * 1000);
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

            // console.log('server spectate stream frame', d.length);

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
        }, 1 * 60 * 1000);
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

app.get('/release.tar.gz', (req, res, next) => {
  if (bundleTgz !== null) {
    res.type('application/gzip');

    const _recurse = (i = 0) => {
      if (i < bundleTgz.length) {
        const _next = () => {
          _recurse(i + 1);
        };

        if (res.write(bundleTgz[i])) {
          process.nextTick(_next);
        } else {
          res.once('drain', _next);
        }
      } else {
        res.end();
      }
    };
    _recurse();
  } else {
    res.status(404);
    res.end(http.STATUS_CODES[404]);
  }
});

let bundlePromise = null;
let bundleQueued = false;
let bundleAddress = null;
let bundlePort = null;
let bundleTgz = null;
const _refreshBundle = () => {
  if (!bundlePromise) {
    console.log('refreshing bundle');

    bundlePromise = new Promise((accept, reject) => {
      docker.listContainers((err, containers) => {
        if (!err) {
          const oldBundleContainers = containers.filter(containerSpec => containerSpec.Image === 'modulesio/zeo:latest');

          docker.pull('modulesio/zeo:latest', (err, stream) => {
            if (!err) {
              stream.resume();
              stream.on('end', () => {
                docker.createContainer({
                  Image: 'modulesio/zeo:latest',
                  Cmd: ['/root/zeo/scripts/offline.sh'],
                  ExposedPorts: {
                    '8000/tcp': {},
                  },
                  PortBindings: {
                    '8000/tcp': [{ 'HostPort': '' }],
                  },
                }, (err, container) => {
                  if (!err) {
                    container.start(err => {
                      if (!err) {
                        container.inspect((err, containerSpec) => {
                          if (!err) {
                            bundleAddress = containerSpec.NetworkSettings.Gateway;
                            bundlePort = containerSpec.NetworkSettings.Ports['8000/tcp'][0].HostPort;

                            const containerId = containerSpec.Id;
                            Promise.all([
                              new Promise((accept, reject) => {
                                const newBundleTgz = [];
                                const cp = childProcess.spawn('bash', ['-c', `docker cp ${containerId}:/root/zeo - | bsdtar -czf - --exclude=zeo/data @-`]);
                                cp.stdout.on('data', d => {
                                  newBundleTgz.push(d);
                                });
                                cp.stdout.on('end', () => {
                                  bundleTgz = newBundleTgz;
                                  console.log('bundle size', bundleTgz.length);

                                  accept();
                                });
                                // cp.stderr.pipe(process.stderr);
                                cp.on('error', reject);
                              }),
                              Promise.all(oldBundleContainers.map(oldBundleContainerSpec => new Promise((accept, reject) => {
                                docker.getContainer(oldBundleContainerSpec.Id).remove({
                                  force: true,
                                }, err => {
                                  if (!err) {
                                    accept();
                                  } else {
                                    reject(err);
                                  }
                                });
                              }))),
                            ])
                              .then(() => {
                                accept();
                              }, reject);
                          } else {
                            reject(err);
                          }
                        });
                      } else {
                        reject(err);
                      }
                    });
                  } else {
                    reject(err);
                  }
                });
              });
              stream.on('error', err => {
                reject(err);
              });
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    })
    .then(() => {
      console.log('successfully refreshed bundle');

      bundlePromise = null;

      if (bundleQueued) {
        bundleQueued = false;

        _refreshBundle();
      }
    })
    .catch(err => {
      bundlePromise = null;

      return Promise.reject(err);
    });
  } else {
    bundleQueued = true;
  }

  return bundlePromise;
};
_refreshBundle()
  .catch(err => {
    console.warn(err);
  });
app.post('/webhooks/docker/zeo', (req, res, next) => {
  console.log('got bundle webhook');

  _refreshBundle();

  res.end();
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
