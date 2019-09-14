import { NodeMaterial } from './NodeMaterial';
import { Node } from '../core/Node';
import { ColorNode } from '../inputs/ColorNode';
import { FloatNode } from '../inputs/FloatNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class PhongNode extends Node {
  constructor();

  color: ColorNode;
  specular: ColorNode;
  shininess: FloatNode;
  nodeType: string;

  build(builder: NodeBuilder): string;
  copy(source: PhongNode): this;
}

export class PhongNodeMaterial extends NodeMaterial {
  constructor();

  color: ColorNode;
  specular: ColorNode;
  shininess: FloatNode;
  nodeType: string;
}
