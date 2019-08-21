/**
 * @author sunag / http://www.sunag.com.br/
 */

import { StandardNode } from './nodes/StandardNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function StandardNodeMaterial() {

	var node = new StandardNode();

	NodeMaterial.call( this, node, node );

	this.type = "StandardNodeMaterial";

}

StandardNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
StandardNodeMaterial.prototype.constructor = StandardNodeMaterial;

NodeUtils.addShortcuts( StandardNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'roughness',
	'metalness',
	'reflectivity',
	'clearCoat',
	'clearCoatRoughness',
	'clearCoatNormal',
	'normal',
	'emissive',
	'ambient',
	'light',
	'shadow',
	'ao',
	'environment',
	'mask',
	'position',
	'sheen'
] );

export { StandardNodeMaterial };
