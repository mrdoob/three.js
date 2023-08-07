import { TempNode } from '../core/TempNode';

export class ColorsNode extends TempNode {
    constructor(index?: number);

    index: number;
    nodeType: string;

    copy(source: ColorsNode): this;
}
