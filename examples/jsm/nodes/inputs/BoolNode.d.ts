import { InputNode } from '../core/InputNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class BoolNode extends InputNode {
  constructor(value?: boolean);

  value: boolean;
  nodeType: string;

  generateConst(builder: NodeBuilder, output: string, uuid?: string, type?: string, ns?: string, needsUpdate?: boolean): string;
  copy(source: BoolNode): this;
}
