"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MMDLoader = void 0;

var MMDLoader = function () {
  function MMDLoader(manager) {
    Loader.call(this, manager);
    this.loader = new THREE.FileLoader(this.manager);
    this.parser = null;
    this.meshBuilder = new MeshBuilder(this.manager);
    this.animationBuilder = new AnimationBuilder();
  }

  MMDLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
    constructor: MMDLoader,
    setAnimationPath: function setAnimationPath(animationPath) {
      this.animationPath = animationPath;
      return this;
    },
    load: function load(url, onLoad, onProgress, onError) {
      var builder = this.meshBuilder.setCrossOrigin(this.crossOrigin);
      var resourcePath;

      if (this.resourcePath !== '') {
        resourcePath = this.resourcePath;
      } else if (this.path !== '') {
        resourcePath = this.path;
      } else {
        resourcePath = THREE.LoaderUtils.extractUrlBase(url);
      }

      var modelExtension = this._extractExtension(url).toLowerCase();

      if (modelExtension !== 'pmd' && modelExtension !== 'pmx') {
        if (onError) onError(new Error('THREE.MMDLoader: Unknown model file extension .' + modelExtension + '.'));
        return;
      }

      this[modelExtension === 'pmd' ? 'loadPMD' : 'loadPMX'](url, function (data) {
        onLoad(builder.build(data, resourcePath, onProgress, onError));
      }, onProgress, onError);
    },
    loadAnimation: function loadAnimation(url, object, onLoad, onProgress, onError) {
      var builder = this.animationBuilder;
      this.loadVMD(url, function (vmd) {
        onLoad(object.isCamera ? builder.buildCameraAnimation(vmd) : builder.build(vmd, object));
      }, onProgress, onError);
    },
    loadWithAnimation: function loadWithAnimation(modelUrl, vmdUrl, onLoad, onProgress, onError) {
      var scope = this;
      this.load(modelUrl, function (mesh) {
        scope.loadAnimation(vmdUrl, mesh, function (animation) {
          onLoad({
            mesh: mesh,
            animation: animation
          });
        }, onProgress, onError);
      }, onProgress, onError);
    },
    loadPMD: function loadPMD(url, onLoad, onProgress, onError) {
      var parser = this._getParser();

      this.loader.setMimeType(undefined).setPath(this.path).setResponseType('arraybuffer').setRequestHeader(this.requestHeader).setWithCredentials(this.withCredentials).load(url, function (buffer) {
        onLoad(parser.parsePmd(buffer, true));
      }, onProgress, onError);
    },
    loadPMX: function loadPMX(url, onLoad, onProgress, onError) {
      var parser = this._getParser();

      this.loader.setMimeType(undefined).setPath(this.path).setResponseType('arraybuffer').setRequestHeader(this.requestHeader).setWithCredentials(this.withCredentials).load(url, function (buffer) {
        onLoad(parser.parsePmx(buffer, true));
      }, onProgress, onError);
    },
    loadVMD: function loadVMD(url, onLoad, onProgress, onError) {
      var urls = Array.isArray(url) ? url : [url];
      var vmds = [];
      var vmdNum = urls.length;

      var parser = this._getParser();

      this.loader.setMimeType(undefined).setPath(this.animationPath).setResponseType('arraybuffer').setRequestHeader(this.requestHeader).setWithCredentials(this.withCredentials);

      for (var i = 0, il = urls.length; i < il; i++) {
        this.loader.load(urls[i], function (buffer) {
          vmds.push(parser.parseVmd(buffer, true));
          if (vmds.length === vmdNum) onLoad(parser.mergeVmds(vmds));
        }, onProgress, onError);
      }
    },
    loadVPD: function loadVPD(url, isUnicode, onLoad, onProgress, onError) {
      var parser = this._getParser();

      this.loader.setMimeType(isUnicode ? undefined : 'text/plain; charset=shift_jis').setPath(this.animationPath).setResponseType('text').setRequestHeader(this.requestHeader).setWithCredentials(this.withCredentials).load(url, function (text) {
        onLoad(parser.parseVpd(text, true));
      }, onProgress, onError);
    },
    _extractExtension: function _extractExtension(url) {
      var index = url.lastIndexOf('.');
      return index < 0 ? '' : url.slice(index + 1);
    },
    _getParser: function _getParser() {
      if (this.parser === null) {
        if (typeof MMDParser === 'undefined') {
          throw new Error('THREE.MMDLoader: Import MMDParser https://github.com/takahirox/mmd-parser');
        }

        this.parser = new MMDParser.Parser();
      }

      return this.parser;
    }
  });
  var DEFAULT_TOON_TEXTURES = ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/bWiiMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh8aBHZBl14e8wAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOUlEQVRYR+3WMREAMAwDsYY/yoDI7MLwIiP40+RJklfcCCBAgAABAgTqArfb/QMCCBAgQIAAgbbAB3z/e0F3js2cAAAAAElFTkSuQmCC', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAN0lEQVRYR+3WQREAMBACsZ5/B5ilMvgEBTt5cW37hjsBBAgQIECAwFwgyfYPCCBAgAABAgTWAh81dWyx0gFwKAAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAOklEQVRYR+3WoREAMAwDsWb/UQtCy9wxTOQJ/oQ8SXKKGwEECBAgQIBAXeDt7f4BAQQIECBAgEBb4AOz8Hzx7WLY4wAAAABJRU5ErkJggg==', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABPUlEQVRYR+1XwW7CMAy1+f9fZOMysSEOEweEOPRNdm3HbdOyIhAcklPrOs/PLy9RygBALxzcCDQFmgJNgaZAU6Ap0BR4PwX8gsRMVLssMRH5HcpzJEaWL7EVg9F1IHRlyqQohgVr4FGUlUcMJSjcUlDw0zvjeun70cLWmneoyf7NgBTQSniBTQQSuJAZsOnnaczjIMb5hCiuHKxokCrJfVnrctyZL0PkJAJe1HMil4nxeyi3Ypfn1kX51jpPvo/JeCNC4PhVdHdJw2XjBR8brF8PEIhNVn12AgP7uHsTBguBn53MUZCqv7Lp07Pn5k1Ro+uWmUNn7D+M57rtk7aG0Vo73xyF/fbFf0bPJjDXngnGocDTdFhygZjwUQrMNrDcmZlQT50VJ/g/UwNyHpu778+yW+/ksOz/BFo54P4AsUXMfRq7XWsAAAAASUVORK5CYII=', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACMElEQVRYR+2Xv4pTQRTGf2dubhLdICiii2KnYKHVolhauKWPoGAnNr6BD6CvIVaihYuI2i1ia0BY0MZGRHQXjZj/mSPnnskfNWiWZUlzJ5k7M2cm833nO5Mziej2DWWJRUoCpQKlAntSQCqgw39/iUWAGmh37jrRnVsKlgpiqmkoGVABA7E57fvY+pJDdgKqF6HzFCSADkDq+F6AHABtQ+UMVE5D7zXod7fFNhTEckTbj5XQgHzNN+5tQvc5NG7C6BNkp6D3EmpXHDR+dQAjFLchW3VS9rlw3JBh+B7ys5Cf9z0GW1C/7P32AyBAOAz1q4jGliIH3YPuBnSfQX4OGreTIgEYQb/pBDtPnEQ4CivXYPAWBk13oHrB54yA9QuSn2H4AcKRpEILDt0BUzj+RLR1V5EqjD66NPRBVpLcQwjHoHYJOhsQv6U4mnzmrIXJCFr4LDwm/xBUoboG9XX4cc9VKdYoSA2yk5NQLJaKDUjTBoveG3Z2TElTxwjNK4M3LEZgUdDdruvcXzKBpStgp2NPiWi3ks9ZXxIoFVi+AvHLdc9TqtjL3/aYjpPlrzOcEnK62Szhimdd7xX232zFDTgtxezOu3WNMRLjiKgjtOhHVMd1loynVHvOgjuIIJMaELEqhJAV/RCSLbWTcfPFakFgFlALTRRvx+ok6Hlp/Q+v3fmx90bMyUzaEAhmM3KvHlXTL5DxnbGf/1M8RNNACLL5MNtPxP/mypJAqcDSFfgFhpYqWUzhTEAAAAAASUVORK5CYII=', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII=', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAL0lEQVRYR+3QQREAAAzCsOFfNJPBJ1XQS9r2hsUAAQIECBAgQIAAAQIECBAgsBZ4MUx/ofm2I/kAAAAASUVORK5CYII='];

  function MeshBuilder(manager) {
    this.geometryBuilder = new GeometryBuilder();
    this.materialBuilder = new MaterialBuilder(manager);
  }

  MeshBuilder.prototype = {
    constructor: MeshBuilder,
    crossOrigin: 'anonymous',
    setCrossOrigin: function setCrossOrigin(crossOrigin) {
      this.crossOrigin = crossOrigin;
      return this;
    },
    build: function build(data, resourcePath, onProgress, onError) {
      var geometry = this.geometryBuilder.build(data);
      var material = this.materialBuilder.setCrossOrigin(this.crossOrigin).setResourcePath(resourcePath).build(data, geometry, onProgress, onError);
      var mesh = new THREE.SkinnedMesh(geometry, material);
      var skeleton = new THREE.Skeleton(initBones(mesh));
      mesh.bind(skeleton);
      return mesh;
    }
  };

  function initBones(mesh) {
    var geometry = mesh.geometry;
    var bones = [],
        bone,
        gbone;
    var i, il;

    if (geometry && geometry.bones !== undefined) {
      for (i = 0, il = geometry.bones.length; i < il; i++) {
        gbone = geometry.bones[i];
        bone = new THREE.Bone();
        bones.push(bone);
        bone.name = gbone.name;
        bone.position.fromArray(gbone.pos);
        bone.quaternion.fromArray(gbone.rotq);
        if (gbone.scl !== undefined) bone.scale.fromArray(gbone.scl);
      }

      for (i = 0, il = geometry.bones.length; i < il; i++) {
        gbone = geometry.bones[i];

        if (gbone.parent !== -1 && gbone.parent !== null && bones[gbone.parent] !== undefined) {
          bones[gbone.parent].add(bones[i]);
        } else {
          mesh.add(bones[i]);
        }
      }
    }

    mesh.updateMatrixWorld(true);
    return bones;
  }

  function GeometryBuilder() {}

  GeometryBuilder.prototype = {
    constructor: GeometryBuilder,
    build: function build(data) {
      var positions = [];
      var uvs = [];
      var normals = [];
      var indices = [];
      var groups = [];
      var bones = [];
      var skinIndices = [];
      var skinWeights = [];
      var morphTargets = [];
      var morphPositions = [];
      var iks = [];
      var grants = [];
      var rigidBodies = [];
      var constraints = [];
      var offset = 0;
      var boneTypeTable = {};

      for (var i = 0; i < data.metadata.vertexCount; i++) {
        var v = data.vertices[i];

        for (var j = 0, jl = v.position.length; j < jl; j++) {
          positions.push(v.position[j]);
        }

        for (var j = 0, jl = v.normal.length; j < jl; j++) {
          normals.push(v.normal[j]);
        }

        for (var j = 0, jl = v.uv.length; j < jl; j++) {
          uvs.push(v.uv[j]);
        }

        for (var j = 0; j < 4; j++) {
          skinIndices.push(v.skinIndices.length - 1 >= j ? v.skinIndices[j] : 0.0);
        }

        for (var j = 0; j < 4; j++) {
          skinWeights.push(v.skinWeights.length - 1 >= j ? v.skinWeights[j] : 0.0);
        }
      }

      for (var i = 0; i < data.metadata.faceCount; i++) {
        var face = data.faces[i];

        for (var j = 0, jl = face.indices.length; j < jl; j++) {
          indices.push(face.indices[j]);
        }
      }

      for (var i = 0; i < data.metadata.materialCount; i++) {
        var material = data.materials[i];
        groups.push({
          offset: offset * 3,
          count: material.faceCount * 3
        });
        offset += material.faceCount;
      }

      for (var i = 0; i < data.metadata.rigidBodyCount; i++) {
        var body = data.rigidBodies[i];
        var value = boneTypeTable[body.boneIndex];
        value = value === undefined ? body.type : Math.max(body.type, value);
        boneTypeTable[body.boneIndex] = value;
      }

      for (var i = 0; i < data.metadata.boneCount; i++) {
        var boneData = data.bones[i];
        var bone = {
          parent: boneData.parentIndex,
          name: boneData.name,
          pos: boneData.position.slice(0, 3),
          rotq: [0, 0, 0, 1],
          scl: [1, 1, 1],
          rigidBodyType: boneTypeTable[i] !== undefined ? boneTypeTable[i] : -1
        };

        if (bone.parent !== -1) {
          bone.pos[0] -= data.bones[bone.parent].position[0];
          bone.pos[1] -= data.bones[bone.parent].position[1];
          bone.pos[2] -= data.bones[bone.parent].position[2];
        }

        bones.push(bone);
      }

      if (data.metadata.format === 'pmd') {
        for (var i = 0; i < data.metadata.ikCount; i++) {
          var ik = data.iks[i];
          var param = {
            target: ik.target,
            effector: ik.effector,
            iteration: ik.iteration,
            maxAngle: ik.maxAngle * 4,
            links: []
          };

          for (var j = 0, jl = ik.links.length; j < jl; j++) {
            var link = {};
            link.index = ik.links[j].index;
            link.enabled = true;

            if (data.bones[link.index].name.indexOf('ひざ') >= 0) {
              link.limitation = new THREE.Vector3(1.0, 0.0, 0.0);
            }

            param.links.push(link);
          }

          iks.push(param);
        }
      } else {
        for (var i = 0; i < data.metadata.boneCount; i++) {
          var ik = data.bones[i].ik;
          if (ik === undefined) continue;
          var param = {
            target: i,
            effector: ik.effector,
            iteration: ik.iteration,
            maxAngle: ik.maxAngle,
            links: []
          };

          for (var j = 0, jl = ik.links.length; j < jl; j++) {
            var link = {};
            link.index = ik.links[j].index;
            link.enabled = true;

            if (ik.links[j].angleLimitation === 1) {
              var rotationMin = ik.links[j].lowerLimitationAngle;
              var rotationMax = ik.links[j].upperLimitationAngle;
              var tmp1 = -rotationMax[0];
              var tmp2 = -rotationMax[1];
              rotationMax[0] = -rotationMin[0];
              rotationMax[1] = -rotationMin[1];
              rotationMin[0] = tmp1;
              rotationMin[1] = tmp2;
              link.rotationMin = new Vector3().fromArray(rotationMin);
              link.rotationMax = new Vector3().fromArray(rotationMax);
            }

            param.links.push(link);
          }

          iks.push(param);
        }
      }

      if (data.metadata.format === 'pmx') {
        for (var i = 0; i < data.metadata.boneCount; i++) {
          var boneData = data.bones[i];
          var grant = boneData.grant;
          if (grant === undefined) continue;
          var param = {
            index: i,
            parentIndex: grant.parentIndex,
            ratio: grant.ratio,
            isLocal: grant.isLocal,
            affectRotation: grant.affectRotation,
            affectPosition: grant.affectPosition,
            transformationClass: boneData.transformationClass
          };
          grants.push(param);
        }

        grants.sort(function (a, b) {
          return a.transformationClass - b.transformationClass;
        });
      }

      function updateAttributes(attribute, morph, ratio) {
        for (var i = 0; i < morph.elementCount; i++) {
          var element = morph.elements[i];
          var index;

          if (data.metadata.format === 'pmd') {
            index = data.morphs[0].elements[element.index].index;
          } else {
            index = element.index;
          }

          attribute.array[index * 3 + 0] += element.position[0] * ratio;
          attribute.array[index * 3 + 1] += element.position[1] * ratio;
          attribute.array[index * 3 + 2] += element.position[2] * ratio;
        }
      }

      for (var i = 0; i < data.metadata.morphCount; i++) {
        var morph = data.morphs[i];
        var params = {
          name: morph.name
        };
        var attribute = new THREE.Float32BufferAttribute(data.metadata.vertexCount * 3, 3);
        attribute.name = morph.name;

        for (var j = 0; j < data.metadata.vertexCount * 3; j++) {
          attribute.array[j] = positions[j];
        }

        if (data.metadata.format === 'pmd') {
          if (i !== 0) {
            updateAttributes(attribute, morph, 1.0);
          }
        } else {
          if (morph.type === 0) {
            for (var j = 0; j < morph.elementCount; j++) {
              var morph2 = data.morphs[morph.elements[j].index];
              var ratio = morph.elements[j].ratio;

              if (morph2.type === 1) {
                updateAttributes(attribute, morph2, ratio);
              } else {}
            }
          } else if (morph.type === 1) {
            updateAttributes(attribute, morph, 1.0);
          } else if (morph.type === 2) {} else if (morph.type === 3) {} else if (morph.type === 4) {} else if (morph.type === 5) {} else if (morph.type === 6) {} else if (morph.type === 7) {} else if (morph.type === 8) {}
        }

        morphTargets.push(params);
        morphPositions.push(attribute);
      }

      for (var i = 0; i < data.metadata.rigidBodyCount; i++) {
        var rigidBody = data.rigidBodies[i];
        var params = {};

        for (var key in rigidBody) {
          params[key] = rigidBody[key];
        }

        if (data.metadata.format === 'pmx') {
          if (params.boneIndex !== -1) {
            var bone = data.bones[params.boneIndex];
            params.position[0] -= bone.position[0];
            params.position[1] -= bone.position[1];
            params.position[2] -= bone.position[2];
          }
        }

        rigidBodies.push(params);
      }

      for (var i = 0; i < data.metadata.constraintCount; i++) {
        var constraint = data.constraints[i];
        var params = {};

        for (var key in constraint) {
          params[key] = constraint[key];
        }

        var bodyA = rigidBodies[params.rigidBodyIndex1];
        var bodyB = rigidBodies[params.rigidBodyIndex2];

        if (bodyA.type !== 0 && bodyB.type === 2) {
          if (bodyA.boneIndex !== -1 && bodyB.boneIndex !== -1 && data.bones[bodyB.boneIndex].parentIndex === bodyA.boneIndex) {
            bodyB.type = 1;
          }
        }

        constraints.push(params);
      }

      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
      geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
      geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
      geometry.setIndex(indices);

      for (var i = 0, il = groups.length; i < il; i++) {
        geometry.addGroup(groups[i].offset, groups[i].count, i);
      }

      geometry.bones = bones;
      geometry.morphTargets = morphTargets;
      geometry.morphAttributes.position = morphPositions;
      geometry.morphTargetsRelative = false;
      geometry.userData.MMD = {
        bones: bones,
        iks: iks,
        grants: grants,
        rigidBodies: rigidBodies,
        constraints: constraints,
        format: data.metadata.format
      };
      geometry.computeBoundingSphere();
      return geometry;
    }
  };

  function MaterialBuilder(manager) {
    this.manager = manager;
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.tgaLoader = null;
  }

  MaterialBuilder.prototype = {
    constructor: MaterialBuilder,
    crossOrigin: 'anonymous',
    resourcePath: undefined,
    setCrossOrigin: function setCrossOrigin(crossOrigin) {
      this.crossOrigin = crossOrigin;
      return this;
    },
    setResourcePath: function setResourcePath(resourcePath) {
      this.resourcePath = resourcePath;
      return this;
    },
    build: function build(data, geometry) {
      var materials = [];
      var textures = {};
      this.textureLoader.setCrossOrigin(this.crossOrigin);

      for (var i = 0; i < data.metadata.materialCount; i++) {
        var material = data.materials[i];
        var params = {
          userData: {}
        };
        if (material.name !== undefined) params.name = material.name;
        params.color = new THREE.Color().fromArray(material.diffuse);
        params.opacity = material.diffuse[3];
        params.emissive = new Color().fromArray(material.ambient);
        params.transparent = params.opacity !== 1.0;
        params.skinning = geometry.bones.length > 0 ? true : false;
        params.morphTargets = geometry.morphTargets.length > 0 ? true : false;
        params.fog = true;
        params.blending = THREE.CustomBlending;
        params.blendSrc = THREE.SrcAlphaFactor;
        params.blendDst = THREE.OneMinusSrcAlphaFactor;
        params.blendSrcAlpha = SrcAlphaFactor;
        params.blendDstAlpha = THREE.DstAlphaFactor;

        if (data.metadata.format === 'pmx' && (material.flag & 0x1) === 1) {
          params.side = THREE.DoubleSide;
        } else {
          params.side = params.opacity === 1.0 ? FrontSide : DoubleSide;
        }

        if (data.metadata.format === 'pmd') {
          if (material.fileName) {
            var fileName = material.fileName;
            var fileNames = fileName.split('*');
            params.map = this._loadTexture(fileNames[0], textures);

            if (fileNames.length > 1) {
              var extension = fileNames[1].slice(-4).toLowerCase();
              params.envMap = this._loadTexture(fileNames[1], textures);
              params.combine = extension === '.sph' ? MultiplyOperation : THREE.AddOperation;
            }
          }

          var toonFileName = material.toonIndex === -1 ? 'toon00.bmp' : data.toonTextures[material.toonIndex].fileName;
          params.gradientMap = this._loadTexture(toonFileName, textures, {
            isToonTexture: true,
            isDefaultToonTexture: this._isDefaultToonTexture(toonFileName)
          });
          params.userData.outlineParameters = {
            thickness: material.edgeFlag === 1 ? 0.003 : 0.0,
            color: [0, 0, 0],
            alpha: 1.0,
            visible: material.edgeFlag === 1
          };
        } else {
          if (material.textureIndex !== -1) {
            params.map = this._loadTexture(data.textures[material.textureIndex], textures);
          }

          if (material.envTextureIndex !== -1 && (material.envFlag === 1 || material.envFlag == 2)) {
            params.envMap = this._loadTexture(data.textures[material.envTextureIndex], textures);
            params.combine = material.envFlag === 1 ? MultiplyOperation : AddOperation;
          }

          var toonFileName, isDefaultToon;

          if (material.toonIndex === -1 || material.toonFlag !== 0) {
            toonFileName = 'toon' + ('0' + (material.toonIndex + 1)).slice(-2) + '.bmp';
            isDefaultToon = true;
          } else {
            toonFileName = data.textures[material.toonIndex];
            isDefaultToon = false;
          }

          params.gradientMap = this._loadTexture(toonFileName, textures, {
            isToonTexture: true,
            isDefaultToonTexture: isDefaultToon
          });
          params.userData.outlineParameters = {
            thickness: material.edgeSize / 300,
            color: material.edgeColor.slice(0, 3),
            alpha: material.edgeColor[3],
            visible: (material.flag & 0x10) !== 0 && material.edgeSize > 0.0
          };
        }

        if (params.map !== undefined) {
          if (!params.transparent) {
            this._checkImageTransparency(params.map, geometry, i);
          }

          params.emissive.multiplyScalar(0.2);
        }

        materials.push(new THREE.MeshToonMaterial(params));
      }

      if (data.metadata.format === 'pmx') {
        var checkAlphaMorph = function checkAlphaMorph(elements, materials) {
          for (var i = 0, il = elements.length; i < il; i++) {
            var element = elements[i];
            if (element.index === -1) continue;
            var material = materials[element.index];

            if (material.opacity !== element.diffuse[3]) {
              material.transparent = true;
            }
          }
        };

        for (var i = 0, il = data.morphs.length; i < il; i++) {
          var morph = data.morphs[i];
          var elements = morph.elements;

          if (morph.type === 0) {
            for (var j = 0, jl = elements.length; j < jl; j++) {
              var morph2 = data.morphs[elements[j].index];
              if (morph2.type !== 8) continue;
              checkAlphaMorph(morph2.elements, materials);
            }
          } else if (morph.type === 8) {
            checkAlphaMorph(elements, materials);
          }
        }
      }

      return materials;
    },
    _getTGALoader: function _getTGALoader() {
      if (this.tgaLoader === null) {
        if (TGALoader === undefined) {
          throw new Error('THREE.MMDLoader: Import TGALoader');
        }

        this.tgaLoader = new TGALoader(this.manager);
      }

      return this.tgaLoader;
    },
    _isDefaultToonTexture: function _isDefaultToonTexture(name) {
      if (name.length !== 10) return false;
      return /toon(10|0[0-9])\.bmp/.test(name);
    },
    _loadTexture: function _loadTexture(filePath, textures, params, onProgress, onError) {
      params = params || {};
      var scope = this;
      var fullPath;

      if (params.isDefaultToonTexture === true) {
        var index;

        try {
          index = parseInt(filePath.match(/toon([0-9]{2})\.bmp$/)[1]);
        } catch (e) {
          console.warn('THREE.MMDLoader: ' + filePath + ' seems like a ' + 'not right default texture path. Using toon00.bmp instead.');
          index = 0;
        }

        fullPath = DEFAULT_TOON_TEXTURES[index];
      } else {
        fullPath = this.resourcePath + filePath;
      }

      if (textures[fullPath] !== undefined) return textures[fullPath];
      var loader = this.manager.getHandler(fullPath);

      if (loader === null) {
        loader = filePath.slice(-4).toLowerCase() === '.tga' ? this._getTGALoader() : this.textureLoader;
      }

      var texture = loader.load(fullPath, function (t) {
        if (params.isToonTexture === true) {
          t.image = scope._getRotatedImage(t.image);
          t.magFilter = THREE.NearestFilter;
          t.minFilter = NearestFilter;
        }

        t.flipY = false;
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = RepeatWrapping;

        for (var i = 0; i < texture.readyCallbacks.length; i++) {
          texture.readyCallbacks[i](texture);
        }

        delete texture.readyCallbacks;
      }, onProgress, onError);
      texture.readyCallbacks = [];
      textures[fullPath] = texture;
      return texture;
    },
    _getRotatedImage: function _getRotatedImage(image) {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var width = image.width;
      var height = image.height;
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.translate(width / 2.0, height / 2.0);
      context.rotate(0.5 * Math.PI);
      context.translate(-width / 2.0, -height / 2.0);
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, width, height);
    },
    _checkImageTransparency: function _checkImageTransparency(map, geometry, groupIndex) {
      map.readyCallbacks.push(function (texture) {
        function createImageData(image) {
          var canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          var context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, canvas.width, canvas.height);
        }

        function detectImageTransparency(image, uvs, indices) {
          var width = image.width;
          var height = image.height;
          var data = image.data;
          var threshold = 253;
          if (data.length / (width * height) !== 4) return false;

          for (var i = 0; i < indices.length; i += 3) {
            var centerUV = {
              x: 0.0,
              y: 0.0
            };

            for (var j = 0; j < 3; j++) {
              var index = indices[i * 3 + j];
              var uv = {
                x: uvs[index * 2 + 0],
                y: uvs[index * 2 + 1]
              };
              if (getAlphaByUv(image, uv) < threshold) return true;
              centerUV.x += uv.x;
              centerUV.y += uv.y;
            }

            centerUV.x /= 3;
            centerUV.y /= 3;
            if (getAlphaByUv(image, centerUV) < threshold) return true;
          }

          return false;
        }

        function getAlphaByUv(image, uv) {
          var width = image.width;
          var height = image.height;
          var x = Math.round(uv.x * width) % width;
          var y = Math.round(uv.y * height) % height;
          if (x < 0) x += width;
          if (y < 0) y += height;
          var index = y * width + x;
          return image.data[index * 4 + 3];
        }

        var imageData = texture.image.data !== undefined ? texture.image : createImageData(texture.image);
        var group = geometry.groups[groupIndex];

        if (detectImageTransparency(imageData, geometry.attributes.uv.array, geometry.index.array.slice(group.start, group.start + group.count))) {
          map.transparent = true;
        }
      });
    }
  };

  function AnimationBuilder() {}

  AnimationBuilder.prototype = {
    constructor: AnimationBuilder,
    build: function build(vmd, mesh) {
      var tracks = this.buildSkeletalAnimation(vmd, mesh).tracks;
      var tracks2 = this.buildMorphAnimation(vmd, mesh).tracks;

      for (var i = 0, il = tracks2.length; i < il; i++) {
        tracks.push(tracks2[i]);
      }

      return new THREE.AnimationClip('', -1, tracks);
    },
    buildSkeletalAnimation: function buildSkeletalAnimation(vmd, mesh) {
      function pushInterpolation(array, interpolation, index) {
        array.push(interpolation[index + 0] / 127);
        array.push(interpolation[index + 8] / 127);
        array.push(interpolation[index + 4] / 127);
        array.push(interpolation[index + 12] / 127);
      }

      var tracks = [];
      var motions = {};
      var bones = mesh.skeleton.bones;
      var boneNameDictionary = {};

      for (var i = 0, il = bones.length; i < il; i++) {
        boneNameDictionary[bones[i].name] = true;
      }

      for (var i = 0; i < vmd.metadata.motionCount; i++) {
        var motion = vmd.motions[i];
        var boneName = motion.boneName;
        if (boneNameDictionary[boneName] === undefined) continue;
        motions[boneName] = motions[boneName] || [];
        motions[boneName].push(motion);
      }

      for (var key in motions) {
        var array = motions[key];
        array.sort(function (a, b) {
          return a.frameNum - b.frameNum;
        });
        var times = [];
        var positions = [];
        var rotations = [];
        var pInterpolations = [];
        var rInterpolations = [];
        var basePosition = mesh.skeleton.getBoneByName(key).position.toArray();

        for (var i = 0, il = array.length; i < il; i++) {
          var time = array[i].frameNum / 30;
          var position = array[i].position;
          var rotation = array[i].rotation;
          var interpolation = array[i].interpolation;
          times.push(time);

          for (var j = 0; j < 3; j++) {
            positions.push(basePosition[j] + position[j]);
          }

          for (var j = 0; j < 4; j++) {
            rotations.push(rotation[j]);
          }

          for (var j = 0; j < 3; j++) {
            pushInterpolation(pInterpolations, interpolation, j);
          }

          pushInterpolation(rInterpolations, interpolation, 3);
        }

        var targetName = '.bones[' + key + ']';
        tracks.push(this._createTrack(targetName + '.position', THREE.VectorKeyframeTrack, times, positions, pInterpolations));
        tracks.push(this._createTrack(targetName + '.quaternion', THREE.QuaternionKeyframeTrack, times, rotations, rInterpolations));
      }

      return new AnimationClip('', -1, tracks);
    },
    buildMorphAnimation: function buildMorphAnimation(vmd, mesh) {
      var tracks = [];
      var morphs = {};
      var morphTargetDictionary = mesh.morphTargetDictionary;

      for (var i = 0; i < vmd.metadata.morphCount; i++) {
        var morph = vmd.morphs[i];
        var morphName = morph.morphName;
        if (morphTargetDictionary[morphName] === undefined) continue;
        morphs[morphName] = morphs[morphName] || [];
        morphs[morphName].push(morph);
      }

      for (var key in morphs) {
        var array = morphs[key];
        array.sort(function (a, b) {
          return a.frameNum - b.frameNum;
        });
        var times = [];
        var values = [];

        for (var i = 0, il = array.length; i < il; i++) {
          times.push(array[i].frameNum / 30);
          values.push(array[i].weight);
        }

        tracks.push(new THREE.NumberKeyframeTrack('.morphTargetInfluences[' + morphTargetDictionary[key] + ']', times, values));
      }

      return new AnimationClip('', -1, tracks);
    },
    buildCameraAnimation: function buildCameraAnimation(vmd) {
      function pushVector3(array, vec) {
        array.push(vec.x);
        array.push(vec.y);
        array.push(vec.z);
      }

      function pushQuaternion(array, q) {
        array.push(q.x);
        array.push(q.y);
        array.push(q.z);
        array.push(q.w);
      }

      function pushInterpolation(array, interpolation, index) {
        array.push(interpolation[index * 4 + 0] / 127);
        array.push(interpolation[index * 4 + 1] / 127);
        array.push(interpolation[index * 4 + 2] / 127);
        array.push(interpolation[index * 4 + 3] / 127);
      }

      var tracks = [];
      var cameras = vmd.cameras === undefined ? [] : vmd.cameras.slice();
      cameras.sort(function (a, b) {
        return a.frameNum - b.frameNum;
      });
      var times = [];
      var centers = [];
      var quaternions = [];
      var positions = [];
      var fovs = [];
      var cInterpolations = [];
      var qInterpolations = [];
      var pInterpolations = [];
      var fInterpolations = [];
      var quaternion = new Quaternion();
      var euler = new THREE.Euler();
      var position = new Vector3();
      var center = new Vector3();

      for (var i = 0, il = cameras.length; i < il; i++) {
        var motion = cameras[i];
        var time = motion.frameNum / 30;
        var pos = motion.position;
        var rot = motion.rotation;
        var distance = motion.distance;
        var fov = motion.fov;
        var interpolation = motion.interpolation;
        times.push(time);
        position.set(0, 0, -distance);
        center.set(pos[0], pos[1], pos[2]);
        euler.set(-rot[0], -rot[1], -rot[2]);
        quaternion.setFromEuler(euler);
        position.add(center);
        position.applyQuaternion(quaternion);
        pushVector3(centers, center);
        pushQuaternion(quaternions, quaternion);
        pushVector3(positions, position);
        fovs.push(fov);

        for (var j = 0; j < 3; j++) {
          pushInterpolation(cInterpolations, interpolation, j);
        }

        pushInterpolation(qInterpolations, interpolation, 3);

        for (var j = 0; j < 3; j++) {
          pushInterpolation(pInterpolations, interpolation, 4);
        }

        pushInterpolation(fInterpolations, interpolation, 5);
      }

      var tracks = [];
      tracks.push(this._createTrack('target.position', VectorKeyframeTrack, times, centers, cInterpolations));
      tracks.push(this._createTrack('.quaternion', QuaternionKeyframeTrack, times, quaternions, qInterpolations));
      tracks.push(this._createTrack('.position', VectorKeyframeTrack, times, positions, pInterpolations));
      tracks.push(this._createTrack('.fov', NumberKeyframeTrack, times, fovs, fInterpolations));
      return new AnimationClip('', -1, tracks);
    },
    _createTrack: function _createTrack(node, typedKeyframeTrack, times, values, interpolations) {
      if (times.length > 2) {
        times = times.slice();
        values = values.slice();
        interpolations = interpolations.slice();
        var stride = values.length / times.length;
        var interpolateStride = interpolations.length / times.length;
        var index = 1;

        for (var aheadIndex = 2, endIndex = times.length; aheadIndex < endIndex; aheadIndex++) {
          for (var i = 0; i < stride; i++) {
            if (values[index * stride + i] !== values[(index - 1) * stride + i] || values[index * stride + i] !== values[aheadIndex * stride + i]) {
              index++;
              break;
            }
          }

          if (aheadIndex > index) {
            times[index] = times[aheadIndex];

            for (var i = 0; i < stride; i++) {
              values[index * stride + i] = values[aheadIndex * stride + i];
            }

            for (var i = 0; i < interpolateStride; i++) {
              interpolations[index * interpolateStride + i] = interpolations[aheadIndex * interpolateStride + i];
            }
          }
        }

        times.length = index + 1;
        values.length = (index + 1) * stride;
        interpolations.length = (index + 1) * interpolateStride;
      }

      var track = new typedKeyframeTrack(node, times, values);

      track.createInterpolant = function InterpolantFactoryMethodCubicBezier(result) {
        return new CubicBezierInterpolation(this.times, this.values, this.getValueSize(), result, new Float32Array(interpolations));
      };

      return track;
    }
  };

  function CubicBezierInterpolation(parameterPositions, sampleValues, sampleSize, resultBuffer, params) {
    Interpolant.call(this, parameterPositions, sampleValues, sampleSize, resultBuffer);
    this.interpolationParams = params;
  }

  CubicBezierInterpolation.prototype = Object.assign(Object.create(Interpolant.prototype), {
    constructor: CubicBezierInterpolation,
    interpolate_: function interpolate_(i1, t0, t, t1) {
      var result = this.resultBuffer;
      var values = this.sampleValues;
      var stride = this.valueSize;
      var params = this.interpolationParams;
      var offset1 = i1 * stride;
      var offset0 = offset1 - stride;
      var weight1 = t1 - t0 < 1 / 30 * 1.5 ? 0.0 : (t - t0) / (t1 - t0);

      if (stride === 4) {
        var x1 = params[i1 * 4 + 0];
        var x2 = params[i1 * 4 + 1];
        var y1 = params[i1 * 4 + 2];
        var y2 = params[i1 * 4 + 3];

        var ratio = this._calculate(x1, x2, y1, y2, weight1);

        Quaternion.slerpFlat(result, 0, values, offset0, values, offset1, ratio);
      } else if (stride === 3) {
        for (var i = 0; i !== stride; ++i) {
          var x1 = params[i1 * 12 + i * 4 + 0];
          var x2 = params[i1 * 12 + i * 4 + 1];
          var y1 = params[i1 * 12 + i * 4 + 2];
          var y2 = params[i1 * 12 + i * 4 + 3];

          var ratio = this._calculate(x1, x2, y1, y2, weight1);

          result[i] = values[offset0 + i] * (1 - ratio) + values[offset1 + i] * ratio;
        }
      } else {
        var x1 = params[i1 * 4 + 0];
        var x2 = params[i1 * 4 + 1];
        var y1 = params[i1 * 4 + 2];
        var y2 = params[i1 * 4 + 3];

        var ratio = this._calculate(x1, x2, y1, y2, weight1);

        result[0] = values[offset0] * (1 - ratio) + values[offset1] * ratio;
      }

      return result;
    },
    _calculate: function _calculate(x1, x2, y1, y2, x) {
      var c = 0.5;
      var t = c;
      var s = 1.0 - t;
      var loop = 15;
      var eps = 1e-5;
      var math = Math;
      var sst3, stt3, ttt;

      for (var i = 0; i < loop; i++) {
        sst3 = 3.0 * s * s * t;
        stt3 = 3.0 * s * t * t;
        ttt = t * t * t;
        var ft = sst3 * x1 + stt3 * x2 + ttt - x;
        if (math.abs(ft) < eps) break;
        c /= 2.0;
        t += ft < 0 ? c : -c;
        s = 1.0 - t;
      }

      return sst3 * y1 + stt3 * y2 + ttt;
    }
  });
  return MMDLoader;
}();

THREE.MMDLoader = MMDLoader;