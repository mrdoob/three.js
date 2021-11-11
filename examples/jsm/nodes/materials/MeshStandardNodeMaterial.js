import { MeshStandardNode } from './nodes/MeshStandardNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

class MeshStandardNodeMaterial extends NodeMaterial {

	constructor() {

		const node = new MeshStandardNode();

		super( node, node );

		this.type = 'MeshStandardNodeMaterial';

	}

}

NodeUtils.addShortcuts( MeshStandardNodeMaterial.prototype, 'properties', [
	'color',
	'roughness',
	'metalness',
	'map',
	'normalMap',
	'normalScale',
	'metalnessMap',
	'roughnessMap',
	'envMap'
] );

export { MeshStandardNodeMaterial };
