import { Node } from '../core/Node';
import { NodeMaterial } from './NodeMaterial';

export class RawNodeMaterial extends NodeMaterial {

	constructor();

	color: Node;
	alpha: Node;
	position: Node;

}
