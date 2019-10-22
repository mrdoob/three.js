/**
 * @author sunag / http://www.sunag.com.br/
 */

import { PhongNode } from './nodes/PhongNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function PhongNodeMaterial() {

	var node = new PhongNode();

	NodeMaterial.call( this, node, node );

	this.type = "PhongNodeMaterial";

}

PhongNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
PhongNodeMaterial.prototype.constructor = PhongNodeMaterial;

NodeUtils.addShortcuts( PhongNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'specular',
	'shininess',
	'normal',
	'emissive',
	'ambient',
	'light',
	'shadow',
	'ao',
	'environment',
	'environmentAlpha',
	'mask',
	'position'
] );

export { PhongNodeMaterial };
