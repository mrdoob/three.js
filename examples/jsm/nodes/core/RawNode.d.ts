import { NodeBuilder } from './NodeBuilder';
import { Node } from './Node';

export class RawNode extends Node {
  constructor(value: Node);

  value: Node;
  nodeType: string;

  generate(builder: NodeBuilder): string;
  copy(source: RawNode): this;
}