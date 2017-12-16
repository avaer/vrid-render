import React from 'react';
import THREE from '../lib/three';
// import THREEGridHelperLib from '../lib/three-extra/GridHelper.js';
import THREEOBJLoaderLib from '../lib/three-extra/OBJLoader.js';
import THREEMTLLoaderLib from '../lib/three-extra/MTLLoader.js';
import THREEDDSLoaderLib from '../lib/three-extra/DDSLoader.js';
import THREEColladaLoaderLib from '../lib/three-extra/ColladaLoader.js';
import THREEFBXLoaderLib from '../lib/three-extra/FBXLoader.js';
import THREEGLTFLoaderLib from '../lib/three-extra/GLTFLoader.js';
import untar from 'js-untar';
// import tar from 'tarify';
import Zlib from '../lib/zlib_and_gzip'

// const THREEGridHelper = THREEGridHelperLib({THREE});
const THREEOBJLoader = THREEOBJLoaderLib({THREE});
const THREEMTLLoader = THREEMTLLoaderLib({THREE});
const THREEDDSLoader = THREEDDSLoaderLib({THREE});
const THREEColladaLoader = THREEColladaLoaderLib({THREE});
const THREEFBXLoader = THREEFBXLoaderLib({THREE, Zlib});
const THREEGLTFLoader = THREEGLTFLoaderLib({THREE, Zlib});

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function _resArrayBuffer(res) {
  if (res.status >= 200 && res.status < 300) {
    return res.arrayBuffer();
  } else {
    return Promise.reject({
      status: res.status,
      stack: 'API returned invalid status code: ' + res.status,
    });
  }
}
const _isWindowsAbsolute = url => /^[a-z]+:(?:\/|\\)/i.test(url);
const _isImageFileName = fileName => /\.(?:png|jpg|jfif|gif|svg|bmp)$/i.test(fileName);
const _getUrlTexture = url => {
  const img = new Image();
  img.src = url;
  img.onload = () => {
    texture.needsUpdate = true;
  };
  img.onerror = err => {
    console.warn(err);
  };
  const texture = new THREE.Texture(
    img,
    THREE.UVMapping,
    THREE.ClampToEdgeWrapping,
    THREE.ClampToEdgeWrapping,
    THREE.LinearFilter,
    THREE.LinearFilter,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
    1
  );
  return texture;
};
const _getFileTexture = file => {
  const fileUrl = file.getBlobUrl();

  const img = new Image();
  img.src = fileUrl;
  img.onload = () => {
    URL.revokeObjectURL(fileUrl);

    texture.needsUpdate = true;
  };
  img.onerror = err => {
    URL.revokeObjectURL(fileUrl);

    console.warn(err);
  };
  const texture = new THREE.Texture(
    img,
    THREE.UVMapping,
    THREE.ClampToEdgeWrapping,
    THREE.ClampToEdgeWrapping,
    THREE.LinearFilter,
    THREE.LinearFilter,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
    1
  );
  return texture;
};

const _isImage = url => new Promise((accept, reject) => {
  const img = new Image();
  img.onload = () => {
    accept(true);
  };
  img.onerror = err => {
    accept(false);
  };
  img.crossOrigin = 'Anonymous';
  img.src = url;
});
const _isVideo = url => new Promise((accept, reject) => {
  const video = document.createElement('video');
  video.oncanplay = () => {
    accept(true);
  };
  video.onerror = err => {
    accept(false);
  };
  video.crossOrigin = 'Anonymous';
  video.src = url;
});
function _requestMediaType(url) {
  if (url) {
    return new Promise((accept, reject) => {
      const imagePromise = _isImage(url);
      const videoPromise = _isVideo(url);

      imagePromise.then(ok => {
        if (ok) {
          accept('image');
        }
      });
      videoPromise.then(ok => {
        if (ok) {
          accept('video');
        }
      });
      Promise.all([
        imagePromise,
        videoPromise,
      ])
        .then(() => {
          accept(null);
        })
        .catch(reject);
    });
  } else {
    return Promise.resolve(null);
  }
}

class TarLoader extends THREE.LoadingManager {
  constructor() {
    super();

    this.setURLModifier(url => {
// console.log('load url', url, new Error().stack);
      if (/^(?:blob:|^https:\/\/)/.test(url)) {
        return url;
      } else {
        const match = url.match(/(^.+?\/)(.+)$/);
        const prefix = match[1];
        let fileName = match[2];
        if (_isWindowsAbsolute(fileName)) {
          fileName = fileName.replace(/^.*(?:\/|\\)([^\/\\]+)$/, '$1');
        }

        const localFiles = this.files[prefix];
        let file = localFiles.find(file => file.name === fileName);
        if (!file && _isImageFileName(fileName)) {
          file = localFiles.find(file => _isImageFileName(file.name));
        }

        if (file) {
          return file.getBlobUrl();
        } else {
          return url;
        }
      }
    });
    this.onProgress = url => {
      if (/blob:/.test(url)) {
        URL.revokeObjectURL(url);
      }
    };
    this.onError = url => {
      console.log('error', url);

      if (/blob:/.test(url)) {
        URL.revokeObjectURL(url);
      }
    };

    this.files = {};
  }

  setFiles(texturePath, files) {
    this.files[texturePath] = files;
  }

  clearFiles(texturePath) {
    this.files[texturePath] = null;
  }
}
const tarLoader = new TarLoader();
THREE.Loader.Handlers.add(/\.dds$/i, (() => {
  const loader = new THREEDDSLoader(tarLoader);
  loader.load = (load => function(url, onLoad, onProgress, onError) {
    return load.call(this, tarLoader.resolveURL(url), onLoad, onProgress, onError);
  })(loader.load);
  return loader;
})());

const _requestObj = (url, materials = null) => new Promise((accept, reject) => {
  const loader = new THREEOBJLoader(tarLoader);

  if (materials) {
    loader.setMaterials(materials);
  }

  loader.load(url, o => {
    accept(o);
  }, progress => {
    // console.log('progress', progress);
  }, err => {
    reject(err);
  });
});
const _requestMtl = (url, texturePath) => new Promise((accept, reject) => {
  const loader = new THREEMTLLoader(tarLoader);
  if (texturePath) {
    loader.setTexturePath(texturePath);
  }
  loader.load(url, o => {
    accept(o);
  }, progress => {
    // console.log('progress', progress);
  }, err => {
    reject(err);
  });
});
const _requestDae = url => new Promise((accept, reject) => {
  const loader = new THREEColladaLoader(tarLoader);
  loader.load(url, ({scene}) => {
    accept(scene);
  }, progress => {
    // console.log('progress', progress);
  }, err => {
    reject(err);
  });
});
const _requestFbx = url => new Promise((accept, reject) => {
  const loader = new THREEFBXLoader(tarLoader);
  loader.load(url, o => {
    accept(o);
  }, progress => {
    // console.log('progress', progress);
  }, err => {
    reject(err);
  });
});
const _requestGltf = (url, texturePath) => new Promise((accept, reject) => {
  const loader = new THREEGLTFLoader(tarLoader);
  if (texturePath) {
    loader.setPath(texturePath);
  }
  loader.load(url, ({scene}) => {
    accept(scene);
  }, progress => {
    // console.log('progress', progress);
  }, err => {
    reject(err);
  });
});

class Scene extends React.Component {
  constructor(props) {
    super(props);

    this.renderer = null;
  }

  componentDidMount() {
    const {canvas} = this.refs;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    // renderer.setClearColor(0x000000, 1);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.matrixAutoUpdate = false;

    const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);
    scene.add(camera);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    directionalLight.position.set(1, 1, 1);
    directionalLight.updateMatrixWorld();
    scene.add(directionalLight);

    const boundingBox = new THREE.Box3().setFromObject(this.props.model);
    let size = Math.max(Math.abs(boundingBox.min.x), Math.abs(boundingBox.min.y)/2, Math.abs(boundingBox.min.z), Math.abs(boundingBox.max.x), Math.abs(boundingBox.max.y)/2, Math.abs(boundingBox.max.z));
    const center = boundingBox.getCenter();

    const oversizeFactor = size / 100;
    if (oversizeFactor > 1) {
      const scale = 1/oversizeFactor;
      this.props.model.scale.multiplyScalar(scale);
      this.props.model.updateMatrixWorld();

      size *= scale;
      center.multiplyScalar(scale);
    }
    const undersizeFactor = size;
    if (undersizeFactor < 1) {
      const scale = 1/undersizeFactor;
      this.props.model.scale.multiplyScalar(scale);
      this.props.model.updateMatrixWorld();

      size *= scale;
      center.multiplyScalar(scale);
    }
    size *= 1.5;

    camera.position.copy(center)
      .add(new THREE.Vector3(size/2, size/4, size));
    camera.lookAt(center);
    camera.updateMatrixWorld();

    // const grid = new THREEGridHelper();
    // scene.add(grid);

    scene.add(this.props.model);

    renderer.render(scene, camera);
  }

  render() {
    return <canvas
      width={this.props.width * window.devicePixelRatio}
      height={this.props.height * window.devicePixelRatio}
      style={{width: `${this.props.width}px`, height: `${this.props.width}px`}}
      ref="canvas"
    />
  }
}

let texturePathId = 0;
export default class App extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    this.state = {
      pending: 1,
      type: null,
      preview: null,
    };

    class Texture extends THREE.Texture {
      constructor(...args) {
        super(...args);

        self.setState({
          pending: self.state.pending + 1,
        });

        const img = args[0];
        img.addEventListener('load', () => {
          self.setState({
            pending: self.state.pending - 1,
          });
        });
        img.addEventListener('error', err => {
          console.warn(err);

          self.setState({
            pending: self.state.pending - 1,
          });
        });
      }
    }
    THREE.Texture = Texture;


    const id = getParameterByName('id', window.location.href);
    const name = getParameterByName('name', window.location.href);
    const ext = name.match(/\.([^\.]+)$/)[1];
    const file = {
      ext,
      file: {
        id,
        name,
      },
    };

    const _subDefaultTextures = (model, files) => {
      const defaultImageFile = files.find(file => _isImageFileName(file.name));
      if (defaultImageFile) {
        const _recurse = o => {
          if (o.constructor === THREE.Mesh && !o.material.map) {
            o.material.map = _getFileTexture(defaultImageFile);
          }

          for (let i = 0; i < o.children.length; i++) {
            _recurse(o.children[i]);
          }
        };
        _recurse(model);
      }
    };
    const _requestPreview = () => {
      if (file) {
        if (/obj/i.test(file.ext)) {
          return _requestObj(`https://my-site.zeovr.io/files/${file.file.id}/${file.file.name}`);
        } else if (/dae/i.test(file.ext)) {
          return _requestDae(`https://my-site.zeovr.io/files/${file.file.id}/${file.file.name}`);
        } else if (/fbx/i.test(file.ext)) {
          return _requestFbx(`https://my-site.zeovr.io/files/${file.file.id}/${file.file.name}`);
        } else if (/gltf/i.test(file.ext)) {
          return _requestGltf(`https://my-site.zeovr.io/files/${file.file.id}/${file.file.name}`);
        } else if (file.ext === 'tar') {
          return fetch(`https://my-site.zeovr.io/files/${file.file.id}/${file.file.name}`)
            .then(_resArrayBuffer)
            .then(untar)
            .then(tarFiles => {
              let modelFile = null;
              let loader = null;

              const texturePath = String(texturePathId++) + '/';
              tarLoader.setFiles(texturePath, tarFiles);

              if (modelFile = tarFiles.find(({name}) => /\.obj$/i.test(name))) {
                const materialFile = tarFiles.find(({name}) => /\.mtl$/i.test(name))

                if (materialFile) {
                  const materialFileUrl = materialFile.getBlobUrl();

                  loader = modelFileUrl => _requestMtl(materialFileUrl, texturePath)
                    .then(materials => {
                      URL.revokeObjectURL(materialFileUrl);

                      return _requestObj(modelFileUrl, materials);
                    })
                    .catch(err => {
                      URL.revokeObjectURL(materialFileUrl);

                      return Promise.reject(err);
                    });
                } else {
                  loader = _requestObj;
                }
              } else if (modelFile = tarFiles.find(({name}) => /\.dae$/i.test(name))) {
                loader = _requestDae;
              } else if (modelFile = tarFiles.find(({name}) => /\.fbx$/i.test(name))) {
                loader = _requestFbx;
              } else if (modelFile = tarFiles.find(({name}) => /\.gltf$/i.test(name))) {
                loader = url => _requestGltf(url, texturePath);
              }

              if (modelFile) {
                const modelFileUrl = modelFile.getBlobUrl();

                return loader(modelFileUrl)
                  .then(preview => {
                    URL.revokeObjectURL(modelFileUrl);
                    tarLoader.clearFiles(texturePath);

                    _subDefaultTextures(preview, tarFiles);

                    return preview;
                  })
                  .catch(err => {
                    URL.revokeObjectURL(modelFileUrl);
                    tarLoader.clearFiles(texturePath);

                    return Promise.reject(err);
                  });
              } else {
                tarLoader.clearFiles(texturePath);

                return Promise.resolve(null);
              }
            });
        } else {
          return Promise.resolve(null);
        }
      } else {
        return Promise.resolve(null);
      }
    };
    _requestPreview()
      .then(preview => {
        this.setState({
          pending: this.state.pending - 1,
          preview,
        });
      })
      .catch(err => {
        console.warn(err);

        this.setState({
          pending: this.state.pending - 1,
        });
      });
  }

  render() {
    if (this.state.pending === 0) {
      return <Scene width={640} height={480} model={this.state.preview}/>;
    } else {
      return null;
    }
  }
};
