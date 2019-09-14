import { NodeMaterial } from './NodeMaterial';
import { Node } from '../core/Node';
import { ColorNode } from '../inputs/ColorNode';
import { FloatNode } from '../inputs/FloatNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class StandardNode extends Node {
  constructor();

  color: ColorNode;
  roughness: FloatNode;
  metalness: FloatNode;
  nodeType: string;

  build(builder: NodeBuilder): string;
  copy(source: StandardNode): this;
}

export class StandardNodeMaterial extends NodeMaterial {
  constructor();

  color: ColorNode;
  roughness: FloatNode;
  metalness: FloatNode;
  nodeType: string;
}
