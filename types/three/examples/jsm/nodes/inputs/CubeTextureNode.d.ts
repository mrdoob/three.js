import { CubeTexture } from '../../../../src/Three';

import { InputNode } from '../core/InputNode';
import { Node } from '../core/Node';
import { NodeBuilder } from '../core/NodeBuilder';

export class CubeTextureNode extends InputNode {
    constructor(value: CubeTexture, uv?: Node, bias?: Node);

    value: CubeTexture;
    uv: Node | undefined;
    bias: Node | undefined;
    nodeType: string;

    getTexture(builder: NodeBuilder, output: string): string;
    copy(source: CubeTextureNode): this;
}
