import { SpriteNode } from './nodes/SpriteNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

class SpriteNodeMaterial extends NodeMaterial {

	constructor() {

		const node = new SpriteNode();

		super( node, node );

		this.type = 'SpriteNodeMaterial';

	}

}

NodeUtils.addShortcuts( SpriteNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'mask',
	'position',
	'spherical'
] );

export { SpriteNodeMaterial };
