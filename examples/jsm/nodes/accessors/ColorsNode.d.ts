import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode';

export class ColorsNode extends TempNode {
  constructor(index?: number);

  index: number;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: ColorsNode): this;
}
