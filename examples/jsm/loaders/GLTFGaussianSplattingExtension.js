import {
	BufferAttribute,
	BufferGeometry,
	Group
} from 'three';

import { GaussianSplatMesh } from '../objects/GaussianSplatMesh.js';
import { writeColorBytesFromSH0, writeCovariance } from '../utils/GaussianSplatUtils.js';

const EXTENSION_NAME = 'KHR_gaussian_splatting';
const POINTS = 0;
const ATTRIBUTES = {
	POSITION: 'position'
};

/**
 * A glTF loader plugin for `KHR_gaussian_splatting`.
 *
 * This plugin must be registered explicitly because {@link GaussianSplatMesh}
 * requires {@link WebGPURenderer}.
 *
 * ```js
 * const loader = new GLTFLoader();
 * loader.register( function ( parser ) {
 *
 * 	return new GLTFGaussianSplattingExtension( parser );
 *
 * } );
 * ```
 *
 * @three_import import { GLTFGaussianSplattingExtension } from 'three/addons/loaders/GLTFGaussianSplattingExtension.js';
 */
class GLTFGaussianSplattingExtension {

	/**
	 * Constructs a new glTF gaussian splatting extension plugin.
	 *
	 * @param {GLTFParser} parser - The glTF parser.
	 */
	constructor( parser ) {

		this.name = EXTENSION_NAME;
		this.parser = parser;

	}

	/**
	 * Loads a glTF mesh containing gaussian splat primitives.
	 *
	 * @param {number} meshIndex - The mesh index.
	 * @return {?Promise<Group|GaussianSplatMesh>} The loaded mesh or `null` when the mesh does not use this extension.
	 */
	loadMesh( meshIndex ) {

		const parser = this.parser;
		const meshDef = parser.json.meshes[ meshIndex ];
		const primitives = meshDef.primitives;

		if ( primitives.some( isGaussianSplatPrimitive ) === false ) return null;

		if ( primitives.every( isGaussianSplatPrimitive ) === false ) {

			throw new Error( 'THREE.GLTFGaussianSplattingExtension: Mixed gaussian and non-gaussian mesh primitives are not supported.' );

		}

		return parser.loadGeometries( primitives ).then( function ( geometries ) {

			const meshes = [];

			for ( let i = 0, il = geometries.length; i < il; i ++ ) {

				const geometry = geometries[ i ];
				const primitive = primitives[ i ];

				if ( primitive.mode !== POINTS ) {

					throw new Error( 'THREE.GLTFGaussianSplattingExtension: Gaussian splat primitives must use POINTS mode.' );

				}

				const mesh = createGaussianSplatMesh( geometry, primitive );
				mesh.name = parser.createUniqueName( meshDef.name || ( 'mesh_' + meshIndex ) );

				assignExtrasToUserData( mesh, meshDef );
				parser.associations.set( mesh, {
					meshes: meshIndex,
					primitives: i
				} );

				meshes.push( mesh );

			}

			if ( meshes.length === 1 ) return meshes[ 0 ];

			const group = new Group();
			assignExtrasToUserData( group, meshDef );
			parser.associations.set( group, { meshes: meshIndex } );

			for ( let i = 0, il = meshes.length; i < il; i ++ ) {

				group.add( meshes[ i ] );

			}

			return group;

		} );

	}

}

function isGaussianSplatPrimitive( primitiveDef ) {

	return primitiveDef.extensions !== undefined &&
		primitiveDef.extensions[ EXTENSION_NAME ] !== undefined;

}

function createGaussianSplatMesh( geometry, primitiveDef ) {

	const extensionDef = primitiveDef.extensions[ EXTENSION_NAME ];

	if ( extensionDef.kernel !== 'ellipse' ) {

		throw new Error( 'THREE.GLTFGaussianSplattingExtension: Unsupported KHR_gaussian_splatting kernel.' );

	}

	if ( extensionDef.colorSpace === undefined ) {

		throw new Error( 'THREE.GLTFGaussianSplattingExtension: KHR_gaussian_splatting colorSpace is required.' );

	}

	if ( extensionDef.projection !== undefined && extensionDef.projection !== 'perspective' ) {

		console.warn( 'THREE.GLTFGaussianSplattingExtension: Unsupported KHR_gaussian_splatting projection. Results may be incorrect.' );

	}

	if ( extensionDef.sortingMethod !== undefined && extensionDef.sortingMethod !== 'cameraDistance' ) {

		console.warn( 'THREE.GLTFGaussianSplattingExtension: Unsupported KHR_gaussian_splatting sortingMethod. Results may be incorrect.' );

	}

	const position = getGaussianSplatAttribute( geometry, primitiveDef, 'POSITION' );
	const scale = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:SCALE' );
	const rotation = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:ROTATION' );
	const opacity = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:OPACITY' );
	const sh0 = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:SH_DEGREE_0_COEF_0' );
	const count = position.count;

	if ( scale.count !== count || rotation.count !== count || opacity.count !== count || sh0.count !== count ) {

		throw new Error( 'THREE.GLTFGaussianSplattingExtension: KHR_gaussian_splatting attribute counts must match POSITION.' );

	}

	for ( const semantic in primitiveDef.attributes ) {

		if ( /^KHR_gaussian_splatting:SH_DEGREE_[1-3]_COEF_/.test( semantic ) ) {

			console.warn( 'THREE.GLTFGaussianSplattingExtension: KHR_gaussian_splatting spherical harmonics above degree 0 are ignored.' );
			break;

		}

	}

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8Array( count * 4 );

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;

		centers[ i3 ] = position.getX( i );
		centers[ i3 + 1 ] = position.getY( i );
		centers[ i3 + 2 ] = position.getZ( i );

		writeCovariance(
			covariances,
			i * 6,
			scale.getX( i ),
			scale.getY( i ),
			scale.getZ( i ),
			rotation.getX( i ),
			rotation.getY( i ),
			rotation.getZ( i ),
			rotation.getW( i )
		);

		writeColorBytesFromSH0(
			colors,
			i * 4,
			sh0.getX( i ),
			sh0.getY( i ),
			sh0.getZ( i ),
			opacity.getX( i )
		);

	}

	const splatGeometry = new BufferGeometry();
	splatGeometry.setAttribute( 'position', new BufferAttribute( centers, 3 ) );
	splatGeometry.setAttribute( 'covariance', new BufferAttribute( covariances, 6 ) );
	splatGeometry.setAttribute( 'color', new BufferAttribute( colors, 4, true ) );
	splatGeometry.computeBoundingBox();
	splatGeometry.computeBoundingSphere();

	const mesh = new GaussianSplatMesh( splatGeometry );

	mesh.userData.gltfExtensions = mesh.userData.gltfExtensions || {};
	mesh.userData.gltfExtensions[ EXTENSION_NAME ] = Object.assign( {}, extensionDef );

	return mesh;

}

function getGaussianSplatAttribute( geometry, primitiveDef, semantic ) {

	if ( primitiveDef.attributes[ semantic ] === undefined ) {

		throw new Error( `THREE.GLTFGaussianSplattingExtension: KHR_gaussian_splatting requires ${ semantic }.` );

	}

	const attributeName = ATTRIBUTES[ semantic ] || semantic.toLowerCase();
	const attribute = geometry.getAttribute( attributeName );

	if ( attribute === undefined ) {

		throw new Error( `THREE.GLTFGaussianSplattingExtension: KHR_gaussian_splatting attribute ${ semantic } was not loaded.` );

	}

	return attribute;

}

function assignExtrasToUserData( object, gltfDef ) {

	if ( gltfDef.extras !== undefined ) {

		if ( typeof gltfDef.extras === 'object' ) {

			Object.assign( object.userData, gltfDef.extras );

		} else {

			console.warn( 'THREE.GLTFGaussianSplattingExtension: Ignoring primitive type .extras, ' + gltfDef.extras );

		}

	}

}

export { GLTFGaussianSplattingExtension };
