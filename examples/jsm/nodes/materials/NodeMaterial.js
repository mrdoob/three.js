import { Material, ShaderMaterial } from 'three';
import { getNodesKeys } from '../core/NodeUtils.js';

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.type = this.constructor.name;

		this.lights = true;

	}

	setDefaultValues( values ) {

		// This approach is to reuse the native refreshUniforms*
		// and turn available the use of features like transmission and environment in core

		for ( const property in values ) {

			if ( this[ property ] === undefined ) {

				this[ property ] = values[ property ];

			}

		}

		Object.assign( this.defines, values.defines );

	}

	toJSON( meta ) {

		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		const data = Material.prototype.toJSON.call( this, meta );
		const nodeKeys = getNodesKeys( this );

		data.inputNodes = {};

		for ( const name of nodeKeys ) {

			data.inputNodes[ name ] = this[ name ].toJSON( meta ).uuid;

		}

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const nodes = extractFromCache( meta.nodes );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( nodes.length > 0 ) data.nodes = nodes;

		}

		return data;

	}

}

NodeMaterial.prototype.isNodeMaterial = true;

export default NodeMaterial;
