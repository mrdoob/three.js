/**
 * @author sunag / http://www.sunag.com.br/
 */

import { SpriteNode } from './nodes/SpriteNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function SpriteNodeMaterial() {

	var node = new SpriteNode();

	NodeMaterial.call( this, node, node );

	this.type = "SpriteNodeMaterial";

}

SpriteNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
SpriteNodeMaterial.prototype.constructor = SpriteNodeMaterial;

NodeUtils.addShortcuts( SpriteNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'mask',
	'position',
	'spherical'
] );

export { SpriteNodeMaterial };
