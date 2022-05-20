import NodeMaterial from './NodeMaterial.js';
import LineBasicNodeMaterial from './LineBasicNodeMaterial.js';
import MeshBasicNodeMaterial from './MeshBasicNodeMaterial.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import PointsNodeMaterial from './PointsNodeMaterial.js';

export {
	NodeMaterial,
	LineBasicNodeMaterial,
	MeshBasicNodeMaterial,
	MeshStandardNodeMaterial,
	PointsNodeMaterial
};

NodeMaterial.fromMaterial = function ( material ) {

	const type = material.type.replace( 'Material', 'NodeMaterial' );

	if ( materialLib[ type ] === undefined ) {

		return material; // is already a node material or cannot be converted

	}

	const nodeMaterial = new materialLib[ type ]( material );

	for ( let key in material ) {

		if ( nodeMaterial[ key ] === undefined ) {

			nodeMaterial[ key ] = material[ key ]; // currently this is needed only for material.alphaTest

		}

	}

	return nodeMaterial;

};
