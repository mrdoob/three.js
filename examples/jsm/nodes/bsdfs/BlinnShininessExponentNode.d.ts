import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class BlinnShininessExponentNode extends TempNode {
  constructor();

  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
}
