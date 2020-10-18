"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MeshStandardNode = MeshStandardNode;

function MeshStandardNode() {
  StandardNode.call(this);
  this.properties = {
    color: new THREE.Color(0xffffff),
    roughness: 0.5,
    metalness: 0.5,
    normalScale: new THREE.Vector2(1, 1)
  };
  this.inputs = {
    color: new THREE.PropertyNode(this.properties, 'color', 'c'),
    roughness: new PropertyNode(this.properties, 'roughness', 'f'),
    metalness: new PropertyNode(this.properties, 'metalness', 'f'),
    normalScale: new PropertyNode(this.properties, 'normalScale', 'v2')
  };
}

MeshStandardNode.prototype = Object.create(THREE.StandardNode.prototype);
MeshStandardNode.prototype.constructor = MeshStandardNode;
MeshStandardNode.prototype.nodeType = "MeshStandard";

MeshStandardNode.prototype.build = function (builder) {
  var props = this.properties,
      inputs = this.inputs;

  if (builder.isShader('fragment')) {
    var color = builder.findNode(props.color, inputs.color),
        map = builder.resolve(props.map);
    this.color = map ? new THREE.OperatorNode(color, map, OperatorNode.MUL) : color;
    var roughness = builder.findNode(props.roughness, inputs.roughness),
        roughnessMap = builder.resolve(props.roughnessMap);
    this.roughness = roughnessMap ? new OperatorNode(roughness, new THREE.SwitchNode(roughnessMap, "g"), OperatorNode.MUL) : roughness;
    var metalness = builder.findNode(props.metalness, inputs.metalness),
        metalnessMap = builder.resolve(props.metalnessMap);
    this.metalness = metalnessMap ? new OperatorNode(metalness, new SwitchNode(metalnessMap, "b"), OperatorNode.MUL) : metalness;

    if (props.normalMap) {
      this.normal = new THREE.NormalMapNode(builder.resolve(props.normalMap));
      this.normal.scale = builder.findNode(props.normalScale, inputs.normalScale);
    } else {
      this.normal = undefined;
    }

    this.environment = builder.resolve(props.envMap);
  }

  return StandardNode.prototype.build.call(this, builder);
};

MeshStandardNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    console.warn(".toJSON not implemented in", this);
  }

  return data;
};