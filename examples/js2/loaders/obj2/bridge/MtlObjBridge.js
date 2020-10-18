"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MtlObjBridge = void 0;
var MtlObjBridge = {
  link: function link(processResult, assetLoader) {
    if (typeof assetLoader.addMaterials === 'function') {
      assetLoader.addMaterials(this.addMaterialsFromMtlLoader(processResult), true);
    }
  },
  addMaterialsFromMtlLoader: function addMaterialsFromMtlLoader(materialCreator) {
    var newMaterials = {};

    if (materialCreator instanceof THREE.MTLLoader.MaterialCreator) {
      materialCreator.preload();
      newMaterials = materialCreator.materials;
    }

    return newMaterials;
  }
};
THREE.MtlObjBridge = MtlObjBridge;