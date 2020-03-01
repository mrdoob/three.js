import { Node } from '../core/Node';
import { NodeMaterial } from './NodeMaterial';

export class SpriteNodeMaterial extends NodeMaterial {

	constructor();

	color: Node;
	alpha: Node;
	mask: Node;
	position: Node;
	spherical: Node;

}
