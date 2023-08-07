import { FloatNode } from '../inputs/FloatNode';
import { Node } from '../core/Node';

export class MaxMIPLevelNode extends FloatNode {
    constructor(texture: Node);

    texture: Node;
    maxMIPLevel: number;
    nodeType: string;
    value: number;
}
