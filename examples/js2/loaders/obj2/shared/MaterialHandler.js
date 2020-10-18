"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MaterialHandler = void 0;

var MaterialHandler = function MaterialHandler() {
  this.logging = {
    enabled: false,
    debug: false
  };
  this.callbacks = {
    onLoadMaterials: null
  };
  this.materials = {};
};

THREE.MaterialHandler = MaterialHandler;
MaterialHandler.prototype = {
  constructor: MaterialHandler,
  setLogging: function setLogging(enabled, debug) {
    this.logging.enabled = enabled === true;
    this.logging.debug = debug === true;
  },
  _setCallbacks: function _setCallbacks(onLoadMaterials) {
    if (onLoadMaterials !== undefined && onLoadMaterials !== null && onLoadMaterials instanceof Function) {
      this.callbacks.onLoadMaterials = onLoadMaterials;
    }
  },
  createDefaultMaterials: function createDefaultMaterials(overrideExisting) {
    var defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0xDCF1FF
    });
    defaultMaterial.name = 'defaultMaterial';
    var defaultVertexColorMaterial = new MeshStandardMaterial({
      color: 0xDCF1FF
    });
    defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
    defaultVertexColorMaterial.vertexColors = true;
    var defaultLineMaterial = new THREE.LineBasicMaterial();
    defaultLineMaterial.name = 'defaultLineMaterial';
    var defaultPointMaterial = new THREE.PointsMaterial({
      size: 0.1
    });
    defaultPointMaterial.name = 'defaultPointMaterial';
    var runtimeMaterials = {};
    runtimeMaterials[defaultMaterial.name] = defaultMaterial;
    runtimeMaterials[defaultVertexColorMaterial.name] = defaultVertexColorMaterial;
    runtimeMaterials[defaultLineMaterial.name] = defaultLineMaterial;
    runtimeMaterials[defaultPointMaterial.name] = defaultPointMaterial;
    this.addMaterials(runtimeMaterials, overrideExisting);
  },
  addPayloadMaterials: function addPayloadMaterials(materialPayload) {
    var material, materialName;
    var materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
    var newMaterials = {};

    if (materialCloneInstructions !== undefined && materialCloneInstructions !== null) {
      var materialNameOrg = materialCloneInstructions.materialNameOrg;
      materialNameOrg = materialNameOrg !== undefined && materialNameOrg !== null ? materialNameOrg : "";
      var materialOrg = this.materials[materialNameOrg];

      if (materialOrg) {
        material = materialOrg.clone();
        materialName = materialCloneInstructions.materialName;
        material.name = materialName;
        Object.assign(material, materialCloneInstructions.materialProperties);
        this.materials[materialName] = material;
        newMaterials[materialName] = material;
      } else {
        if (this.logging.enabled) {
          console.info('Requested material "' + materialNameOrg + '" is not available!');
        }
      }
    }

    var materials = materialPayload.materials.serializedMaterials;

    if (materials !== undefined && materials !== null && Object.keys(materials).length > 0) {
      var loader = new THREE.MaterialLoader();
      var materialJson;

      for (materialName in materials) {
        materialJson = materials[materialName];

        if (materialJson !== undefined && materialJson !== null) {
          material = loader.parse(materialJson);

          if (this.logging.enabled) {
            console.info('De-serialized material with name "' + materialName + '" will be added.');
          }

          this.materials[materialName] = material;
          newMaterials[materialName] = material;
        }
      }
    }

    materials = materialPayload.materials.runtimeMaterials;
    newMaterials = this.addMaterials(materials, true, newMaterials);
    return newMaterials;
  },
  addMaterials: function addMaterials(materials, overrideExisting, newMaterials) {
    if (newMaterials === undefined || newMaterials === null) {
      newMaterials = {};
    }

    if (materials !== undefined && materials !== null && Object.keys(materials).length > 0) {
      var material;
      var existingMaterial;
      var add;

      for (var materialName in materials) {
        material = materials[materialName];
        add = overrideExisting === true;

        if (!add) {
          existingMaterial = this.materials[materialName];
          add = existingMaterial === null || existingMaterial === undefined;
        }

        if (add) {
          this.materials[materialName] = material;
          newMaterials[materialName] = material;
        }

        if (this.logging.enabled && this.logging.debug) {
          console.info('Material with name "' + materialName + '" was added.');
        }
      }
    }

    if (this.callbacks.onLoadMaterials) {
      this.callbacks.onLoadMaterials(newMaterials);
    }

    return newMaterials;
  },
  getMaterials: function getMaterials() {
    return this.materials;
  },
  getMaterial: function getMaterial(materialName) {
    return this.materials[materialName];
  },
  getMaterialsJSON: function getMaterialsJSON() {
    var materialsJSON = {};
    var material;

    for (var materialName in this.materials) {
      material = this.materials[materialName];
      materialsJSON[materialName] = material.toJSON();
    }

    return materialsJSON;
  },
  clearMaterials: function clearMaterials() {
    this.materials = {};
  }
};