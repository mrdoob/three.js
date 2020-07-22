/**
 * @author sunag / http://www.sunag.com.br/
 */

import { SimpleNode } from './nodes/SimpleNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function RawNodeMaterial() {

	var node = new SimpleNode();

	NodeMaterial.call( this, node, node );

	this.type = "RawNodeMaterial";

}

RawNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
RawNodeMaterial.prototype.constructor = RawNodeMaterial;

NodeUtils.addShortcuts( RawNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'position'
] );

export { RawNodeMaterial };
