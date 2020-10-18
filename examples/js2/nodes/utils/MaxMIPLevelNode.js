"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MaxMIPLevelNode = MaxMIPLevelNode;

function MaxMIPLevelNode(texture) {
  FloatNode.call(this);
  this.texture = texture;
  this.maxMIPLevel = 0;
}

MaxMIPLevelNode.prototype = Object.create(THREE.FloatNode.prototype);
MaxMIPLevelNode.prototype.constructor = MaxMIPLevelNode;
MaxMIPLevelNode.prototype.nodeType = "MaxMIPLevel";
Object.defineProperties(MaxMIPLevelNode.prototype, {
  value: {
    get: function get() {
      if (this.maxMIPLevel === 0) {
        var image = this.texture.value.image;
        if (Array.isArray(image)) image = image[0];
        this.maxMIPLevel = image !== undefined ? Math.log(Math.max(image.width, image.height)) * Math.LOG2E : 0;
      }

      return this.maxMIPLevel;
    },
    set: function set() {}
  }
});

MaxMIPLevelNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.texture = this.texture.uuid;
  }

  return data;
};