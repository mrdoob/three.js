import { Node } from '../core/Node';

export class BypassNode extends Node {
    constructor(code: Node, value?: Node);

    code: Node;
    value: Node | undefined;
    nodeType: string;

    copy(source: BypassNode): this;
}
