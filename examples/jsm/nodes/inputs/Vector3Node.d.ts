import { Vector3 } from '../../../../src/Three';

import { InputNode } from '../core/InputNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class Vector3Node extends InputNode {
    constructor(x: Vector3 | number, y?: number, z?: number);

    value: Vector3;
    nodeType: string;

    generateReadonly(
        builder: NodeBuilder,
        output: string,
        uuid?: string,
        type?: string,
        ns?: string,
        needsUpdate?: boolean,
    ): string;
    copy(source: Vector3Node): this;
}
