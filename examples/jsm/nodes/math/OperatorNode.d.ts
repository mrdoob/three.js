import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { Node } from '../core/Node';

export class OperatorNode extends TempNode {
  constructor(a: Node, b: Node, op: string);

  a: Node;
  b: Node;
  op: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: OperatorNode): this;

  static ADD: string;
  static SUB: string;
  static MUL: string;
  static DIV: string;
}
