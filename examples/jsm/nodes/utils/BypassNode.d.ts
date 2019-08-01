import { Node } from '../core/Node';
import { NodeBuilder } from '../core/NodeBuilder';

export class BypassNode extends Node {
  constructor(code: Node, value?: Node);

  code: Node;
  value: Node | undefined;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: BypassNode): this;
}
