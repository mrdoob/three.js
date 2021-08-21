import { StandardNode } from './nodes/StandardNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

class StandardNodeMaterial extends NodeMaterial {

	constructor() {

		const node = new StandardNode();

		super( node, node );

		this.type = 'StandardNodeMaterial';

	}

}

NodeUtils.addShortcuts( StandardNodeMaterial.prototype, 'fragment', [
	'color',
	'alpha',
	'roughness',
	'metalness',
	'reflectivity',
	'clearcoat',
	'clearcoatRoughness',
	'clearcoatNormal',
	'normal',
	'emissive',
	'ambient',
	'light',
	'shadow',
	'ao',
	'environment',
	'mask',
	'position',
	'sheenTint'
] );

export { StandardNodeMaterial };
