import { Node } from './Node';

export interface NodeUniformParams {
	name?: string;
	type?: string;
	node?: Node;
	needsUpdate?: boolean;
}

export class NodeUniform {

	constructor( params?: NodeUniformParams );
	name: string | undefined;
	type: string | undefined;
	node: Node | undefined;
	needsUpdate: boolean | undefined;
	value: any;

}
