import NodeMaterial from './NodeMaterial.js';
import LineBasicNodeMaterial from './LineBasicNodeMaterial.js';
import MeshBasicNodeMaterial from './MeshBasicNodeMaterial.js';
import MeshStandardNodeMaterial from './MeshStandardNodeMaterial.js';
import PointsNodeMaterial from './PointsNodeMaterial.js';
import SpriteNodeMaterial from './SpriteNodeMaterial.js';
import { Material } from 'three';

export {
	NodeMaterial,
	LineBasicNodeMaterial,
	MeshBasicNodeMaterial,
	MeshStandardNodeMaterial,
	PointsNodeMaterial,
	SpriteNodeMaterial
};

const materialLib = {
	NodeMaterial,
	LineBasicNodeMaterial,
	MeshBasicNodeMaterial,
	MeshStandardNodeMaterial,
	PointsNodeMaterial,
	SpriteNodeMaterial
};

const fromTypeFunction = Material.fromType;

Material.fromType = function ( type ) {

	if ( materialLib[ type ] !== undefined ) {

		return new materialLib[ type ]();

	}

	return fromTypeFunction.call( this, type );

};

NodeMaterial.fromMaterial = function ( material ) {

	const type = material.type.replace( 'Material', 'NodeMaterial' );

	if ( materialLib[ type ] === undefined ) {

		return material; // is already a node material or cannot be converted

	}

	const nodeMaterial = new materialLib[ type ]( material );

	for ( const key in material ) {

		if ( nodeMaterial[ key ] === undefined ) {

			nodeMaterial[ key ] = material[ key ]; // currently this is needed only for material.alphaTest

		}

	}

	return nodeMaterial;

};
