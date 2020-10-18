"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TextureCubeUVNode = TextureCubeUVNode;

function TextureCubeUVNode(value, uv, bias) {
  TempNode.call(this, 'v4');
  this.value = value, this.uv = uv;
  this.bias = bias;
}

TextureCubeUVNode.Nodes = function () {
  var TextureCubeUVData = new THREE.StructNode("struct TextureCubeUVData {\t\t\tvec4 tl;\t\t\tvec4 tr;\t\t\tvec4 br;\t\t\tvec4 bl;\t\t\tvec2 f;\t\t}");
  var cubeUV_maxMipLevel = new THREE.ConstNode("float cubeUV_maxMipLevel 8.0", true);
  var cubeUV_minMipLevel = new ConstNode("float cubeUV_minMipLevel 4.0", true);
  var cubeUV_maxTileSize = new ConstNode("float cubeUV_maxTileSize 256.0", true);
  var cubeUV_minTileSize = new ConstNode("float cubeUV_minTileSize 16.0", true);
  var getFace = new THREE.FunctionNode("float getFace(vec3 direction) {\t\t\t\tvec3 absDirection = abs(direction);\t\t\t\tfloat face = -1.0;\t\t\t\tif (absDirection.x > absDirection.z) {\t\t\t\t\tif (absDirection.x > absDirection.y)\t\t\t\t\t\tface = direction.x > 0.0 ? 0.0 : 3.0;\t\t\t\t\telse\t\t\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\t\t\t\t} else {\t\t\t\t\tif (absDirection.z > absDirection.y)\t\t\t\t\t\tface = direction.z > 0.0 ? 2.0 : 5.0;\t\t\t\t\telse\t\t\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\t\t\t\t}\t\t\t\treturn face;\t\t}");
  getFace.useKeywords = false;
  var getUV = new FunctionNode("vec2 getUV(vec3 direction, float face) {\t\t\t\tvec2 uv;\t\t\t\tif (face == 0.0) {\t\t\t\t\tuv = vec2(direction.z, direction.y) / abs(direction.x);\t\t\t\t} else if (face == 1.0) {\t\t\t\t\tuv = vec2(-direction.x, -direction.z) / abs(direction.y);\t\t\t\t} else if (face == 2.0) {\t\t\t\t\tuv = vec2(-direction.x, direction.y) / abs(direction.z);\t\t\t\t} else if (face == 3.0) {\t\t\t\t\tuv = vec2(-direction.z, direction.y) / abs(direction.x);\t\t\t\t} else if (face == 4.0) {\t\t\t\t\tuv = vec2(-direction.x, direction.z) / abs(direction.y);\t\t\t\t} else {\t\t\t\t\tuv = vec2(direction.x, direction.y) / abs(direction.z);\t\t\t\t}\t\t\t\treturn 0.5 * (uv + 1.0);\t\t}");
  getUV.useKeywords = false;
  var bilinearCubeUV = new FunctionNode("TextureCubeUVData bilinearCubeUV(sampler2D envMap, vec3 direction, float mipInt) {\t\t\tfloat face = getFace(direction);\t\t\tfloat filterInt = max(cubeUV_minMipLevel - mipInt, 0.0);\t\t\tmipInt = max(mipInt, cubeUV_minMipLevel);\t\t\tfloat faceSize = exp2(mipInt);\t\t\tfloat texelSize = 1.0 / (3.0 * cubeUV_maxTileSize);\t\t\tvec2 uv = getUV(direction, face) * (faceSize - 1.0);\t\t\tvec2 f = fract(uv);\t\t\tuv += 0.5 - f;\t\t\tif (face > 2.0) {\t\t\t\tuv.y += faceSize;\t\t\t\tface -= 3.0;\t\t\t}\t\t\tuv.x += face * faceSize;\t\t\tif(mipInt < cubeUV_maxMipLevel){\t\t\t\tuv.y += 2.0 * cubeUV_maxTileSize;\t\t\t}\t\t\tuv.y += filterInt * 2.0 * cubeUV_minTileSize;\t\t\tuv.x += 3.0 * max(0.0, cubeUV_maxTileSize - 2.0 * faceSize);\t\t\tuv *= texelSize;\t\t\tvec4 tl = texture2D(envMap, uv);\t\t\tuv.x += texelSize;\t\t\tvec4 tr = texture2D(envMap, uv);\t\t\tuv.y += texelSize;\t\t\tvec4 br = texture2D(envMap, uv);\t\t\tuv.x -= texelSize;\t\t\tvec4 bl = texture2D(envMap, uv);\t\t\treturn TextureCubeUVData( tl, tr, br, bl, f );\t\t}", [TextureCubeUVData, getFace, getUV, cubeUV_maxMipLevel, cubeUV_minMipLevel, cubeUV_maxTileSize, cubeUV_minTileSize]);
  bilinearCubeUV.useKeywords = false;
  var r0 = new ConstNode("float r0 1.0", true);
  var v0 = new ConstNode("float v0 0.339", true);
  var m0 = new ConstNode("float m0 -2.0", true);
  var r1 = new ConstNode("float r1 0.8", true);
  var v1 = new ConstNode("float v1 0.276", true);
  var m1 = new ConstNode("float m1 -1.0", true);
  var r4 = new ConstNode("float r4 0.4", true);
  var v4 = new ConstNode("float v4 0.046", true);
  var m4 = new ConstNode("float m4 2.0", true);
  var r5 = new ConstNode("float r5 0.305", true);
  var v5 = new ConstNode("float v5 0.016", true);
  var m5 = new ConstNode("float m5 3.0", true);
  var r6 = new ConstNode("float r6 0.21", true);
  var v6 = new ConstNode("float v6 0.0038", true);
  var m6 = new ConstNode("float m6 4.0", true);
  var defines = [r0, v0, m0, r1, v1, m1, r4, v4, m4, r5, v5, m5, r6, v6, m6];
  var roughnessToMip = new FunctionNode("float roughnessToMip(float roughness) {\t\t\tfloat mip = 0.0;\t\t\tif (roughness >= r1) {\t\t\t\tmip = (r0 - roughness) * (m1 - m0) / (r0 - r1) + m0;\t\t\t} else if (roughness >= r4) {\t\t\t\tmip = (r1 - roughness) * (m4 - m1) / (r1 - r4) + m1;\t\t\t} else if (roughness >= r5) {\t\t\t\tmip = (r4 - roughness) * (m5 - m4) / (r4 - r5) + m4;\t\t\t} else if (roughness >= r6) {\t\t\t\tmip = (r5 - roughness) * (m6 - m5) / (r5 - r6) + m5;\t\t\t} else {\t\t\t\tmip = -2.0 * log2(1.16 * roughness)\t\t\t}\t\t\treturn mip;\t\t}", defines);
  return {
    bilinearCubeUV: bilinearCubeUV,
    roughnessToMip: roughnessToMip,
    m0: m0,
    cubeUV_maxMipLevel: cubeUV_maxMipLevel
  };
}();

TextureCubeUVNode.prototype = Object.create(THREE.TempNode.prototype);
TextureCubeUVNode.prototype.constructor = TextureCubeUVNode;
TextureCubeUVNode.prototype.nodeType = "TextureCubeUV";

TextureCubeUVNode.prototype.bilinearCubeUV = function (builder, texture, uv, mipInt) {
  var bilinearCubeUV = new THREE.FunctionCallNode(TextureCubeUVNode.Nodes.bilinearCubeUV, [texture, uv, mipInt]);
  this.colorSpaceTL = this.colorSpaceTL || new THREE.ColorSpaceNode(new THREE.ExpressionNode('', 'v4'));
  this.colorSpaceTL.fromDecoding(builder.getTextureEncodingFromMap(this.value.value));
  this.colorSpaceTL.input.parse(bilinearCubeUV.build(builder) + '.tl');
  this.colorSpaceTR = this.colorSpaceTR || new ColorSpaceNode(new ExpressionNode('', 'v4'));
  this.colorSpaceTR.fromDecoding(builder.getTextureEncodingFromMap(this.value.value));
  this.colorSpaceTR.input.parse(bilinearCubeUV.build(builder) + '.tr');
  this.colorSpaceBL = this.colorSpaceBL || new ColorSpaceNode(new ExpressionNode('', 'v4'));
  this.colorSpaceBL.fromDecoding(builder.getTextureEncodingFromMap(this.value.value));
  this.colorSpaceBL.input.parse(bilinearCubeUV.build(builder) + '.bl');
  this.colorSpaceBR = this.colorSpaceBR || new ColorSpaceNode(new ExpressionNode('', 'v4'));
  this.colorSpaceBR.fromDecoding(builder.getTextureEncodingFromMap(this.value.value));
  this.colorSpaceBR.input.parse(bilinearCubeUV.build(builder) + '.br');
  var context = {
    include: builder.isShader('vertex'),
    ignoreCache: true
  };
  builder.addContext(context);
  this.colorSpaceTLExp = new ExpressionNode(this.colorSpaceTL.build(builder, 'v4'), 'v4');
  this.colorSpaceTRExp = new ExpressionNode(this.colorSpaceTR.build(builder, 'v4'), 'v4');
  this.colorSpaceBLExp = new ExpressionNode(this.colorSpaceBL.build(builder, 'v4'), 'v4');
  this.colorSpaceBRExp = new ExpressionNode(this.colorSpaceBR.build(builder, 'v4'), 'v4');
  builder.removeContext();
  var output = new ExpressionNode("mix( mix( cubeUV_TL, cubeUV_TR, cubeUV.f.x ), mix( cubeUV_BL, cubeUV_BR, cubeUV.f.x ), cubeUV.f.y )", 'v4');
  output.keywords['cubeUV_TL'] = this.colorSpaceTLExp;
  output.keywords['cubeUV_TR'] = this.colorSpaceTRExp;
  output.keywords['cubeUV_BL'] = this.colorSpaceBLExp;
  output.keywords['cubeUV_BR'] = this.colorSpaceBRExp;
  output.keywords['cubeUV'] = bilinearCubeUV;
  return output;
};

TextureCubeUVNode.prototype.generate = function (builder, output) {
  if (builder.isShader('fragment')) {
    var uv = this.uv;
    var bias = this.bias || builder.context.roughness;
    var mipV = new FunctionCallNode(TextureCubeUVNode.Nodes.roughnessToMip, [bias]);
    var mip = new THREE.MathNode(mipV, TextureCubeUVNode.Nodes.m0, TextureCubeUVNode.Nodes.cubeUV_maxMipLevel, MathNode.CLAMP);
    var mipInt = new MathNode(mip, MathNode.FLOOR);
    var mipF = new MathNode(mip, MathNode.FRACT);
    var color0 = this.bilinearCubeUV(builder, this.value, uv, mipInt);
    var color1 = this.bilinearCubeUV(builder, this.value, uv, new THREE.OperatorNode(mipInt, new THREE.FloatNode(1).setReadonly(true), OperatorNode.ADD));
    var color1Mix = new MathNode(color0, color1, mipF, MathNode.MIX);
    return builder.format(color1Mix.build(builder), 'v4', output);
  } else {
    console.warn("THREE.TextureCubeUVNode is not compatible with " + builder.shader + " shader.");
    return builder.format('vec4( 0.0 )', this.getType(builder), output);
  }
};

TextureCubeUVNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.value = this.value.toJSON(meta).uuid;
    data.uv = this.uv.toJSON(meta).uuid;
    data.bias = this.bias.toJSON(meta).uuid;
  }

  return data;
};