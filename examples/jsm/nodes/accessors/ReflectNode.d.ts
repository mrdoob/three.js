import { TempNode } from '../core/TempNode';

export class ReflectNode extends TempNode {

	constructor( scope?: string );

	scope: string;
	nodeType: string;

	static CUBE: string;
	static SPHERE: string;
	static VECTOR: string;

}
