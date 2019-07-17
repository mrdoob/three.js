import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode.js';

export class ColorsNode extends TempNode {
  constructor(index?: number);

  index: number;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: ColorsNode): this;
}
