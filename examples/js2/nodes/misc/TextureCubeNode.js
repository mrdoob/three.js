"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TextureCubeNode = TextureCubeNode;

function TextureCubeNode(value, uv, bias) {
  TempNode.call(this, 'v4');
  this.value = value;
  this.radianceNode = new THREE.TextureCubeUVNode(this.value, uv || new THREE.ReflectNode(ReflectNode.VECTOR), bias);
  this.irradianceNode = new TextureCubeUVNode(this.value, new THREE.NormalNode(NormalNode.WORLD), new THREE.FloatNode(1).setReadonly(true));
}

TextureCubeNode.prototype = Object.create(THREE.TempNode.prototype);
TextureCubeNode.prototype.constructor = TextureCubeNode;
TextureCubeNode.prototype.nodeType = "TextureCube";

TextureCubeNode.prototype.generate = function (builder, output) {
  if (builder.isShader('fragment')) {
    builder.require('irradiance');

    if (builder.context.bias) {
      builder.context.bias.setTexture(this.value);
    }

    var scopeNode = builder.slot === 'irradiance' ? this.irradianceNode : this.radianceNode;
    return scopeNode.build(builder, output);
  } else {
    console.warn("THREE.TextureCubeNode is not compatible with " + builder.shader + " shader.");
    return builder.format('vec4( 0.0 )', this.getType(builder), output);
  }
};

TextureCubeNode.prototype.copy = function (source) {
  TempNode.prototype.copy.call(this, source);
  this.value = source.value;
  return this;
};

TextureCubeNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.value = this.value.toJSON(meta).uuid;
  }

  return data;
};