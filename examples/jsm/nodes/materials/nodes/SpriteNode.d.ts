import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';
import { ColorNode } from '../../inputs/ColorNode';

export class SpriteNode extends Node {
  constructor();

  color: ColorNode;
  spherical: true;
  nodeType: string;

  build(builder: NodeBuilder): string;
  copy(source: SpriteNode): this;
}
