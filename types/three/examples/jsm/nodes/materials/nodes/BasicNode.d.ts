import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';

export class BasicNode extends Node {
    constructor();

    position: Node;
    color: Node;
    alpha: Node;
    mask: Node;
    nodeType: string;

    build(builder: NodeBuilder): string;
    copy(source: BasicNode): this;
}
