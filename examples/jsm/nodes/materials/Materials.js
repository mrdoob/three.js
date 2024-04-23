// @TODO: We can simplify "export { default as SomeNode, other, exports } from '...'" to just "export * from '...'" if we will use only named exports

export { default as NodeMaterial, addNodeMaterial, createNodeMaterialFromType } from './NodeMaterial.js';
export { default as InstancedPointsNodeMaterial } from './InstancedPointsNodeMaterial.js';
export { default as LineBasicNodeMaterial } from './LineBasicNodeMaterial.js';
export { default as LineDashedNodeMaterial } from './LineDashedNodeMaterial.js';
export { default as Line2NodeMaterial } from './Line2NodeMaterial.js';
export { default as MeshNormalNodeMaterial } from './MeshNormalNodeMaterial.js';
export { default as MeshBasicNodeMaterial } from './MeshBasicNodeMaterial.js';
export { default as MeshLambertNodeMaterial } from './MeshLambertNodeMaterial.js';
export { default as MeshPhongNodeMaterial } from './MeshPhongNodeMaterial.js';
export { default as MeshStandardNodeMaterial } from './MeshStandardNodeMaterial.js';
export { default as MeshPhysicalNodeMaterial } from './MeshPhysicalNodeMaterial.js';
export { default as MeshSSSNodeMaterial } from './MeshSSSNodeMaterial.js';
export { default as PointsNodeMaterial } from './PointsNodeMaterial.js';
export { default as SpriteNodeMaterial } from './SpriteNodeMaterial.js';
