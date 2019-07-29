import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class JoinNode extends TempNode {
  constructor(x: Node, y: Node, z?: Node, w?: Node);

  x: Node;
  y: Node;
  z: Node | undefined;
  w: Node | undefined;
  nodeType: string;

  getNumElements(): number;
  generate(builder: NodeBuilder, output: string): string;
  copy(source: JoinNode): this;
}
