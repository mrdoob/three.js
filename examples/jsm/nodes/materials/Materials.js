import NodeMaterial from './NodeMaterial.js';
import LineBasicNodeMaterial from './LineBasicNodeMaterial.js';
import MeshBasicNodeMaterial from './MeshBasicNodeMaterial.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import MeshPhysicalNodeMaterial from './MeshPhysicalNodeMaterial.js';
import PointsNodeMaterial from './PointsNodeMaterial.js';
import SpriteNodeMaterial from './SpriteNodeMaterial.js';

export {
	NodeMaterial,
	LineBasicNodeMaterial,
	MeshBasicNodeMaterial,
	MeshStandardNodeMaterial,
	MeshPhysicalNodeMaterial,
	PointsNodeMaterial,
	SpriteNodeMaterial
};

NodeMaterial.fromMaterial = function ( material ) {

	const materialLib = {
		NodeMaterial,
		LineBasicNodeMaterial,
		MeshBasicNodeMaterial,
		MeshStandardNodeMaterial,
		MeshPhysicalNodeMaterial,
		PointsNodeMaterial,
		SpriteNodeMaterial
	};

	const type = material.type.replace( 'Material', 'NodeMaterial' );

	if ( materialLib[ type ] === undefined ) {

		if ( material.isNodeMaterial !== true ) {

			throw new Error( `NodeMaterial: Material "${ material.type }" is not compatible.` );

		}

		return material; // is already a node material

	}

	const nodeMaterial = new materialLib[ type ]();

	for ( const key in material ) {

		nodeMaterial[ key ] = material[ key ];

	}

	return nodeMaterial;

};
