import { TempNode } from '../core/TempNode';
import { FloatNode } from '../inputs/FloatNode';
import { FunctionNode } from '../core/FunctionNode';
import { Node } from '../core/Node';

export class ColorAdjustmentNode extends TempNode {
    constructor(rgb: Node, adjustment?: FloatNode, method?: string);

    rgb: Node;
    adjustment: FloatNode | undefined;
    method: string;
    nodeType: string;

    copy(source: ColorAdjustmentNode): this;

    static Nodes: {
        hue: FunctionNode;
        saturation: FunctionNode;
        vibrance: FunctionNode;
    };

    static SATURATION: string;
    static HUE: string;
    static VIBRANCE: string;
    static BRIGHTNESS: string;
    static CONTRAST: string;
}
