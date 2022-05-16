import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { Node } from '../core/Node';

export class CondNode extends TempNode {
    constructor(a: Node, b: Node, op: string, ifNode?: Node, elseNode?: Node);

    a: Node;
    b: Node;
    op: string;
    ifNode: Node | undefined;
    elseNode: Node | undefined;
    nodeType: string;

    getCondType(builder: NodeBuilder): string;
    copy(source: CondNode): this;

    static EQUAL: string;
    static NOT_EQUAL: string;
    static GREATER: string;
    static GREATER_EQUAL: string;
    static LESS: string;
    static LESS_EQUAL: string;
    static AND: string;
    static OR: string;
}
