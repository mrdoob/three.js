"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CubeTextureNode = CubeTextureNode;

function CubeTextureNode(value, uv, bias) {
  InputNode.call(this, 'v4', {
    shared: true
  });
  this.value = value;
  this.uv = uv || new THREE.ReflectNode();
  this.bias = bias;
}

CubeTextureNode.prototype = Object.create(THREE.InputNode.prototype);
CubeTextureNode.prototype.constructor = CubeTextureNode;
CubeTextureNode.prototype.nodeType = "CubeTexture";

CubeTextureNode.prototype.getTexture = function (builder, output) {
  return InputNode.prototype.generate.call(this, builder, output, this.value.uuid, 'tc');
};

CubeTextureNode.prototype.generate = function (builder, output) {
  if (output === 'samplerCube') {
    return this.getTexture(builder, output);
  }

  var cubetex = this.getTexture(builder, output);
  var uv = this.uv.build(builder, 'v3');
  var bias = this.bias ? this.bias.build(builder, 'f') : undefined;

  if (bias === undefined && builder.context.bias) {
    bias = builder.context.bias.setTexture(this).build(builder, 'f');
  }

  var code;
  if (bias) code = 'texCubeBias( ' + cubetex + ', ' + uv + ', ' + bias + ' )';else code = 'texCube( ' + cubetex + ', ' + uv + ' )';
  var context = {
    include: builder.isShader('vertex'),
    ignoreCache: true
  };
  var outputType = this.getType(builder);
  builder.addContext(context);
  this.colorSpace = this.colorSpace || new THREE.ColorSpaceNode(new THREE.ExpressionNode('', outputType));
  this.colorSpace.fromDecoding(builder.getTextureEncodingFromMap(this.value));
  this.colorSpace.input.parse(code);
  code = this.colorSpace.build(builder, outputType);
  builder.removeContext();
  return builder.format(code, outputType, output);
};

CubeTextureNode.prototype.copy = function (source) {
  InputNode.prototype.copy.call(this, source);
  if (source.value) this.value = source.value;
  this.uv = source.uv;
  if (source.bias) this.bias = source.bias;
  return this;
};

CubeTextureNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.value = this.value.uuid;
    data.uv = this.uv.toJSON(meta).uuid;
    if (this.bias) data.bias = this.bias.toJSON(meta).uuid;
  }

  return data;
};