import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode';

export class UVNode extends TempNode {
  constructor(index?: number);

  index: number;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: UVNode): this;
}
