/**
 * @author sunag / http://www.sunag.com.br/
 */

import { SimpleNode } from './nodes/SimpleNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function BasicNodeMaterial() {

	var node = new SimpleNode();

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
