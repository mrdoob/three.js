/**
 * @author sunag / http://www.sunag.com.br/
 */

import { PhongNode } from './nodes/PhongNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

export class PhongNodeMaterial extends NodeMaterial {

	constructor() {

		var node = new PhongNode();

		super( node, node );

		this.type = "PhongNodeMaterial";

	}

}

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
