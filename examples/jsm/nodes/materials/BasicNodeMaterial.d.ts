import { Node } from '../core/Node';
import { NodeMaterial } from './NodeMaterial';

export class BasicNodeMaterial extends NodeMaterial {

	constructor();

	color: Node;
	alpha: Node;
	mask: Node;
	position: Node;

}
