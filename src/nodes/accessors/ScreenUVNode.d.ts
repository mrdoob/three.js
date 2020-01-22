import { TempNode } from '../core/TempNode';
import { ResolutionNode } from './ResolutionNode';

export class ScreenUVNode extends TempNode {

	constructor( resolution?: ResolutionNode );

	resolution: ResolutionNode;
	nodeType: string;

	copy( source: ScreenUVNode ): this;

}
