import { TempNode } from '../core/TempNode';

export class PositionNode extends TempNode {
    constructor(scope?: string);

    scope: string;
    nodeType: string;

    copy(source: PositionNode): this;

    static LOCAL: string;
    static WORLD: string;
    static VIEW: string;
    static PROJECTION: string;
}
