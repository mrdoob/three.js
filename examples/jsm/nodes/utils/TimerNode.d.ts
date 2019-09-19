import { NodeFrame } from '../core/NodeFrame';
import { FloatNode } from '../inputs/FloatNode';

export class TimerNode extends FloatNode {

	constructor( scale?: number, scope?: string, timeScale?: boolean );

	scale: number;
	scope: string;
	timeScale: boolean;
	nodeType: string;

	getUnique(): boolean;
	updateFrame( frame: NodeFrame ): void;
	copy( source: TimerNode ): this;

	static GLOBAL: string;
	static LOCAL: string;
	static DELTA: string;

}
