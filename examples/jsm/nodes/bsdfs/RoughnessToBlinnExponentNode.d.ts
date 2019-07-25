import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { MaxMIPLevelNode } from '../utils/MaxMIPLevelNode';
import { BlinnShininessExponentNode } from './BlinnShininessExponentNode';
import { FunctionNode } from '../core/FunctionNode';

export class RoughnessToBlinnExponentNode extends TempNode {
  constructor(texture: Node);

  texture: Node;
  maxMIPLevel: MaxMIPLevelNode;
  blinnShininessExponent: BlinnShininessExponentNode;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: RoughnessToBlinnExponentNode): this;

  static Nodes: {
    getSpecularMIPLevel: FunctionNode;
  };
}
