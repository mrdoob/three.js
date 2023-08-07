import { Node } from './Node';
import { NodeBuilder } from './NodeBuilder';

export class VarNode extends Node {
    constructor(type: string, value?: any);

    value: any;
    nodeType: string;

    getType(builder: NodeBuilder): string;
    copy(source: VarNode): this;
}
