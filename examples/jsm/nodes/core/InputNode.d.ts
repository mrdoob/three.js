import { TempNode, TempNodeParams } from './TempNode';
import { NodeBuilder } from './NodeBuilder';

export class InputNode extends TempNode {
    constructor(type: string, params?: TempNodeParams);

    readonly: boolean;

    setReadonly(value: boolean): this;
    getReadonly(builder: NodeBuilder): boolean;
    copy(source: InputNode): this;
}
