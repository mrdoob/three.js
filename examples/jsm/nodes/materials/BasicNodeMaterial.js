/**
 * @author sunag / http://www.sunag.com.br/
 * @author martinRenou / https://github.com/martinRenou
 */

import { BasicNode } from './nodes/BasicNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function BasicNodeMaterial() {

	var node = new BasicNode();

	NodeMaterial.call( this, node, node );

	this.type = "BasicNodeMaterial";

}

BasicNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
BasicNodeMaterial.prototype.constructor = BasicNodeMaterial;

NodeUtils.addShortcuts( BasicNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'position'
] );

export { BasicNodeMaterial };
