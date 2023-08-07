import { TempNode } from '../core/TempNode';

export class NormalNode extends TempNode {
    constructor(scope?: string);

    scope: string;
    nodeType: string;

    copy(source: NormalNode): this;

    static LOCAL: string;
    static WORLD: string;
}
