"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NormalMapNode = NormalMapNode;

function NormalMapNode(value, scale) {
  TempNode.call(this, 'v3');
  this.value = value;
  this.scale = scale || new THREE.Vector2Node(1, 1);
}

NormalMapNode.Nodes = function () {
  var perturbNormal2Arb = new THREE.FunctionNode("vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 map, vec2 vUv, vec2 normalScale ) {\t\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\t\tvec2 st0 = dFdx( vUv.st );\t\tvec2 st1 = dFdy( vUv.st );\t\tfloat scale = sign( st1.t * st0.s - st0.t * st1.s );\t\tvec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );\t\tvec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );\t\tvec3 N = normalize( surf_norm );\t\tvec3 mapN = map * 2.0 - 1.0;\t\tmapN.xy *= normalScale;\t\t#ifdef DOUBLE_SIDED\t\t\t\t\tif ( dot( cross( S, T ), N ) < 0.0 ) mapN.xy *= - 1.0;\t\t#else\t\t\tmapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\t\t#endif\t\tmat3 tsn = mat3( S, T, N );\t\treturn normalize( tsn * mapN );\t}", null, {
    derivatives: true
  });
  return {
    perturbNormal2Arb: perturbNormal2Arb
  };
}();

NormalMapNode.prototype = Object.create(THREE.TempNode.prototype);
NormalMapNode.prototype.constructor = NormalMapNode;
NormalMapNode.prototype.nodeType = "NormalMap";

NormalMapNode.prototype.generate = function (builder, output) {
  if (builder.isShader('fragment')) {
    var perturbNormal2Arb = builder.include(NormalMapNode.Nodes.perturbNormal2Arb);
    this.normal = this.normal || new THREE.NormalNode();
    this.position = this.position || new THREE.PositionNode(PositionNode.VIEW);
    this.uv = this.uv || new THREE.UVNode();
    var scale = this.scale.build(builder, 'v2');

    if (builder.material.side === BackSide) {
      scale = '-' + scale;
    }

    return builder.format(perturbNormal2Arb + '( -' + this.position.build(builder, 'v3') + ', ' + this.normal.build(builder, 'v3') + ', ' + this.value.build(builder, 'v3') + ', ' + this.uv.build(builder, 'v2') + ', ' + scale + ' )', this.getType(builder), output);
  } else {
    console.warn("THREE.NormalMapNode is not compatible with " + builder.shader + " shader.");
    return builder.format('vec3( 0.0 )', this.getType(builder), output);
  }
};

NormalMapNode.prototype.copy = function (source) {
  TempNode.prototype.copy.call(this, source);
  this.value = source.value;
  this.scale = source.scale;
  return this;
};

NormalMapNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.value = this.value.toJSON(meta).uuid;
    data.scale = this.scale.toJSON(meta).uuid;
  }

  return data;
};