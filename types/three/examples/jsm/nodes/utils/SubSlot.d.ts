import { TempNode } from '../core/TempNode';

export class SubSlots extends TempNode {
    constructor(slots?: object);

    slots: Node[];

    copy(source: SubSlots): this;
}
