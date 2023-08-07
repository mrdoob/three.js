import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';

export class StandardNode extends Node {
    constructor();

    color: Node;
    roughness: Node;
    metalness: Node;
    nodeType: string;

    build(builder: NodeBuilder): string;
    copy(source: StandardNode): this;
}
