"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LoadedMeshUserOverride = THREE.MeshReceiver = void 0;

var MeshReceiver = function MeshReceiver(materialHandler) {
  this.logging = {
    enabled: false,
    debug: false
  };
  this.callbacks = {
    onProgress: null,
    onMeshAlter: null
  };
  this.materialHandler = materialHandler;
};

THREE.MeshReceiver = MeshReceiver;
MeshReceiver.prototype = {
  constructor: MeshReceiver,
  setLogging: function setLogging(enabled, debug) {
    this.logging.enabled = enabled === true;
    this.logging.debug = debug === true;
  },
  _setCallbacks: function _setCallbacks(onProgress, onMeshAlter) {
    if (onProgress !== null && onProgress !== undefined && onProgress instanceof Function) {
      this.callbacks.onProgress = onProgress;
    }

    if (onMeshAlter !== null && onMeshAlter !== undefined && onMeshAlter instanceof Function) {
      this.callbacks.onMeshAlter = onMeshAlter;
    }
  },
  buildMeshes: function buildMeshes(meshPayload) {
    var meshName = meshPayload.params.meshName;
    var buffers = meshPayload.buffers;
    var bufferGeometry = new THREE.BufferGeometry();

    if (buffers.vertices !== undefined && buffers.vertices !== null) {
      bufferGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffers.vertices), 3));
    }

    if (buffers.indices !== undefined && buffers.indices !== null) {
      bufferGeometry.setIndex(new BufferAttribute(new Uint32Array(buffers.indices), 1));
    }

    if (buffers.colors !== undefined && buffers.colors !== null) {
      bufferGeometry.setAttribute('color', new BufferAttribute(new Float32Array(buffers.colors), 3));
    }

    if (buffers.normals !== undefined && buffers.normals !== null) {
      bufferGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(buffers.normals), 3));
    } else {
      bufferGeometry.computeVertexNormals();
    }

    if (buffers.uvs !== undefined && buffers.uvs !== null) {
      bufferGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(buffers.uvs), 2));
    }

    if (buffers.skinIndex !== undefined && buffers.skinIndex !== null) {
      bufferGeometry.setAttribute('skinIndex', new BufferAttribute(new Uint16Array(buffers.skinIndex), 4));
    }

    if (buffers.skinWeight !== undefined && buffers.skinWeight !== null) {
      bufferGeometry.setAttribute('skinWeight', new BufferAttribute(new Float32Array(buffers.skinWeight), 4));
    }

    var material, materialName, key;
    var materialNames = meshPayload.materials.materialNames;
    var createMultiMaterial = meshPayload.materials.multiMaterial;
    var multiMaterials = [];

    for (key in materialNames) {
      materialName = materialNames[key];
      material = this.materialHandler.getMaterial(materialName);
      if (createMultiMaterial) multiMaterials.push(material);
    }

    if (createMultiMaterial) {
      material = multiMaterials;
      var materialGroups = meshPayload.materials.materialGroups;
      var materialGroup;

      for (key in materialGroups) {
        materialGroup = materialGroups[key];
        bufferGeometry.addGroup(materialGroup.start, materialGroup.count, materialGroup.index);
      }
    }

    var meshes = [];
    var mesh;
    var callbackOnMeshAlterResult;
    var useOrgMesh = true;
    var geometryType = meshPayload.geometryType === null ? 0 : meshPayload.geometryType;

    if (this.callbacks.onMeshAlter) {
      callbackOnMeshAlterResult = this.callbacks.onMeshAlter({
        detail: {
          meshName: meshName,
          bufferGeometry: bufferGeometry,
          material: material,
          geometryType: geometryType
        }
      });
    }

    if (callbackOnMeshAlterResult) {
      if (callbackOnMeshAlterResult.isDisregardMesh()) {
        useOrgMesh = false;
      } else if (callbackOnMeshAlterResult.providesAlteredMeshes()) {
        for (var i in callbackOnMeshAlterResult.meshes) {
          meshes.push(callbackOnMeshAlterResult.meshes[i]);
        }

        useOrgMesh = false;
      }
    }

    if (useOrgMesh) {
      if (meshPayload.computeBoundingSphere) bufferGeometry.computeBoundingSphere();

      if (geometryType === 0) {
        mesh = new Mesh(bufferGeometry, material);
      } else if (geometryType === 1) {
        mesh = new THREE.LineSegments(bufferGeometry, material);
      } else {
        mesh = new THREE.Points(bufferGeometry, material);
      }

      mesh.name = meshName;
      meshes.push(mesh);
    }

    var progressMessage = meshPayload.params.meshName;

    if (meshes.length > 0) {
      var meshNames = [];

      for (var _i in meshes) {
        mesh = meshes[_i];
        meshNames[_i] = mesh.name;
      }

      progressMessage += ': Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
      progressMessage += ' (' + (meshPayload.progress.numericalValue * 100).toFixed(2) + '%)';
    } else {
      progressMessage += ': Not adding mesh: ' + meshName;
      progressMessage += ' (' + (meshPayload.progress.numericalValue * 100).toFixed(2) + '%)';
    }

    if (this.callbacks.onProgress) {
      this.callbacks.onProgress('progress', progressMessage, meshPayload.progress.numericalValue);
    }

    return meshes;
  }
};

var LoadedMeshUserOverride = function LoadedMeshUserOverride(disregardMesh, alteredMesh) {
  this.disregardMesh = disregardMesh === true;
  this.alteredMesh = alteredMesh === true;
  this.meshes = [];
};

THREE.LoadedMeshUserOverride = LoadedMeshUserOverride;
LoadedMeshUserOverride.prototype = {
  constructor: LoadedMeshUserOverride,
  addMesh: function addMesh(mesh) {
    this.meshes.push(mesh);
    this.alteredMesh = true;
  },
  isDisregardMesh: function isDisregardMesh() {
    return this.disregardMesh;
  },
  providesAlteredMeshes: function providesAlteredMeshes() {
    return this.alteredMesh;
  }
};