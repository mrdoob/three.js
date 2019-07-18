import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';
import { ColorNode } from '../../inputs/ColorNode';
import { FloatNode } from '../../inputs/FloatNode';

export class PhongNode extends Node {
  constructor(value: Node);

  color: ColorNode;
  specular: ColorNode;
  shininess: FloatNode;
  nodeType: string;

  build(builder: NodeBuilder): string;
  copy(source: PhongNode): this;
}
