import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';

export class SimpleNode extends Node {

  constructor();

  position: Node;
  color: Node;
  alpha: Node;
  nodeType: string;

  build( builder: NodeBuilder ): string;
  copy( source: SimpleNode ): this;

}
