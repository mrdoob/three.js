import { BasicNode } from './nodes/BasicNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

class BasicNodeMaterial extends NodeMaterial {

	constructor() {

		const node = new BasicNode();

		super( node, node );

		this.type = 'BasicNodeMaterial';

	}

}

NodeUtils.addShortcuts( BasicNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'mask',
	'position'
] );

export { BasicNodeMaterial };
