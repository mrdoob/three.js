"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ReflectNode = ReflectNode;

function ReflectNode(scope) {
  TempNode.call(this, 'v3');
  this.scope = scope || ReflectNode.CUBE;
}

ReflectNode.CUBE = 'cube';
ReflectNode.SPHERE = 'sphere';
ReflectNode.VECTOR = 'vector';
ReflectNode.prototype = Object.create(THREE.TempNode.prototype);
ReflectNode.prototype.constructor = ReflectNode;
ReflectNode.prototype.nodeType = "Reflect";

ReflectNode.prototype.getUnique = function (builder) {
  return !builder.context.viewNormal;
};

ReflectNode.prototype.getType = function () {
  switch (this.scope) {
    case ReflectNode.SPHERE:
      return 'v2';
  }

  return this.type;
};

ReflectNode.prototype.generate = function (builder, output) {
  var isUnique = this.getUnique(builder);

  if (builder.isShader('fragment')) {
    var result;

    switch (this.scope) {
      case ReflectNode.VECTOR:
        var viewNormalNode = new THREE.NormalNode(NormalNode.VIEW);
        var roughnessNode = builder.context.roughness;
        var viewNormal = viewNormalNode.build(builder, 'v3');
        var viewPosition = new THREE.PositionNode(PositionNode.VIEW).build(builder, 'v3');
        var roughness = roughnessNode ? roughnessNode.build(builder, 'f') : undefined;
        var method = "reflect( -normalize( ".concat(viewPosition, " ), ").concat(viewNormal, " )");

        if (roughness) {
          method = "normalize( mix( ".concat(method, ", ").concat(viewNormal, ", ").concat(roughness, " * ").concat(roughness, " ) )");
        }

        var code = "inverseTransformDirection( ".concat(method, ", viewMatrix )");

        if (isUnique) {
          builder.addNodeCode("vec3 reflectVec = ".concat(code, ";"));
          result = 'reflectVec';
        } else {
          result = code;
        }

        break;

      case ReflectNode.CUBE:
        var reflectVec = new ReflectNode(ReflectNode.VECTOR).build(builder, 'v3');
        var code = 'vec3( -' + reflectVec + '.x, ' + reflectVec + '.yz )';

        if (isUnique) {
          builder.addNodeCode("vec3 reflectCubeVec = ".concat(code, ";"));
          result = 'reflectCubeVec';
        } else {
          result = code;
        }

        break;

      case ReflectNode.SPHERE:
        var reflectVec = new ReflectNode(ReflectNode.VECTOR).build(builder, 'v3');
        var code = 'normalize( ( viewMatrix * vec4( ' + reflectVec + ', 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) ).xy * 0.5 + 0.5';

        if (isUnique) {
          builder.addNodeCode("vec2 reflectSphereVec = ".concat(code, ";"));
          result = 'reflectSphereVec';
        } else {
          result = code;
        }

        break;
    }

    return builder.format(result, this.getType(builder), output);
  } else {
    console.warn("THREE.ReflectNode is not compatible with " + builder.shader + " shader.");
    return builder.format('vec3( 0.0 )', this.type, output);
  }
};

ReflectNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.scope = this.scope;
  }

  return data;
};