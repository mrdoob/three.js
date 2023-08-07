import { Node } from '../core/Node';

export class SwitchNode extends Node {
    constructor(node: Node, components?: string);

    node: Node;
    components: string;
    nodeType: string;

    copy(source: SwitchNode): this;
}
