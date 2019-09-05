/**
 * @author sunag / http://www.sunag.com.br/
 */

import { SpriteNode } from './nodes/SpriteNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

export class SpriteNodeMaterial extends NodeMaterial {

	constructor() {

		var node = new SpriteNode();

		super( node, node );

		this.type = "SpriteNodeMaterial";

	}

}

NodeUtils.addShortcuts( SpriteNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'mask',
	'position',
	'spherical'
] );
