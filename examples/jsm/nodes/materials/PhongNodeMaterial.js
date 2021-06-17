import { PhongNode } from './nodes/PhongNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

class PhongNodeMaterial extends NodeMaterial {

	constructor() {

		const node = new PhongNode();

		super( node, node );

		this.type = 'PhongNodeMaterial';

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

export { PhongNodeMaterial };
