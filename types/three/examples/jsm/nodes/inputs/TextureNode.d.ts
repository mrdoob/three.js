import { Texture } from '../../../../src/Three';

import { InputNode } from '../core/InputNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { Node } from '../core/Node';
import { UVNode } from '../accessors/UVNode';

export class TextureNode extends InputNode {
    constructor(value: Texture, uv?: UVNode, bias?: Node, project?: boolean);

    value: Texture;
    uv: UVNode;
    bias: Node;
    project: boolean;
    nodeType: string;

    getTexture(builder: NodeBuilder, output: string): string;
    copy(source: TextureNode): this;
}
