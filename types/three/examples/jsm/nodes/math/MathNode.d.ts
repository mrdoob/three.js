import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { Node } from '../core/Node';

export class MathNode extends TempNode {
    constructor(a: Node, bOrMethod: Node | string, cOrMethod?: Node | string, method?: string);

    a: Node;
    b: Node | string | undefined;
    c: Node | string | undefined;
    method: string;
    nodeType: string;

    getNumInputs(builder: NodeBuilder): number;
    getInputType(builder: NodeBuilder): string;
    copy(source: MathNode): this;

    static RAD: string;
    static DEG: string;
    static EXP: string;
    static EXP2: string;
    static LOG: string;
    static LOG2: string;
    static SQRT: string;
    static INV_SQRT: string;
    static FLOOR: string;
    static CEIL: string;
    static NORMALIZE: string;
    static SATURATE: string;
    static SIN: string;
    static COS: string;
    static TAN: string;
    static ASIN: string;
    static ACOS: string;
    static ARCTAN: string;
    static ABS: string;
    static SIGN: string;
    static LENGTH: string;
    static NEGATE: string;
    static INVERT: string;

    static MIN: string;
    static MAX: string;
    static MOD: string;
    static STEP: string;
    static REFLECT: string;
    static DISTANCE: string;
    static DOT: string;
    static CROSS: string;
    static POW: string;

    static MIX: string;
    static CLAMP: string;
    static REFRACT: string;
    static SMOOTHSTEP: string;
    static FACEFORWARD: string;
}
