import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { BlinnShininessExponentNode } from './BlinnShininessExponentNode';

export class BlinnExponentToRoughnessNode extends TempNode {
  constructor(blinnExponent?: BlinnShininessExponentNode);

  blinnExponent: BlinnShininessExponentNode;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: BlinnExponentToRoughnessNode): this;
}
