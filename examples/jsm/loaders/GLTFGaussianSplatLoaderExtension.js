import {
	Group
} from 'three';

import { GaussianSplatMesh } from '../objects/GaussianSplatMesh.js';
import { SH_BAND_WORDS, createGaussianSplatGeometry, createPackedSphericalHarmonicsBand, writeColorBytesFromSH0, writeCovariance } from '../utils/GaussianSplatUtils.js';

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
 * 	return new GLTFGaussianSplatLoaderExtension( parser );
 *
 * } );
 * ```
 *
 * @three_import import { GLTFGaussianSplatLoaderExtension } from 'three/addons/loaders/GLTFGaussianSplatLoaderExtension.js';
 */
class GLTFGaussianSplatLoaderExtension {

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

			throw new Error( 'THREE.GLTFGaussianSplatLoaderExtension: Mixed gaussian and non-gaussian mesh primitives are not supported.' );

		}

		return parser.loadGeometries( primitives ).then( function ( geometries ) {

			const meshes = [];

			for ( let i = 0, il = geometries.length; i < il; i ++ ) {

				const geometry = geometries[ i ];
				const primitive = primitives[ i ];

				if ( primitive.mode !== POINTS ) {

					throw new Error( 'THREE.GLTFGaussianSplatLoaderExtension: Gaussian splat primitives must use POINTS mode.' );

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

		throw new Error( 'THREE.GLTFGaussianSplatLoaderExtension: Unsupported KHR_gaussian_splatting kernel.' );

	}

	if ( extensionDef.colorSpace === undefined ) {

		throw new Error( 'THREE.GLTFGaussianSplatLoaderExtension: KHR_gaussian_splatting colorSpace is required.' );

	}

	if ( extensionDef.projection !== undefined && extensionDef.projection !== 'perspective' ) {

		console.warn( 'THREE.GLTFGaussianSplatLoaderExtension: Unsupported KHR_gaussian_splatting projection. Results may be incorrect.' );

	}

	if ( extensionDef.sortingMethod !== undefined && extensionDef.sortingMethod !== 'cameraDistance' ) {

		console.warn( 'THREE.GLTFGaussianSplatLoaderExtension: Unsupported KHR_gaussian_splatting sortingMethod. Results may be incorrect.' );

	}

	const position = getGaussianSplatAttribute( geometry, primitiveDef, 'POSITION' );
	const scale = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:SCALE' );
	const rotation = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:ROTATION' );
	const opacity = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:OPACITY' );
	const sh0 = getGaussianSplatAttribute( geometry, primitiveDef, 'KHR_gaussian_splatting:SH_DEGREE_0_COEF_0' );
	const count = position.count;

	if ( scale.count !== count || rotation.count !== count || opacity.count !== count || sh0.count !== count ) {

		throw new Error( 'THREE.GLTFGaussianSplatLoaderExtension: KHR_gaussian_splatting attribute counts must match POSITION.' );

	}

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8ClampedArray( count * 4 );
	const sphericalHarmonics = createGLTFSphericalHarmonicsAttributes( geometry, primitiveDef, count );

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

	const mesh = new GaussianSplatMesh( createGaussianSplatGeometry( centers, covariances, colors, sphericalHarmonics ) );

	mesh.userData.gltfExtensions = mesh.userData.gltfExtensions || {};
	mesh.userData.gltfExtensions[ EXTENSION_NAME ] = Object.assign( {}, extensionDef );

	return mesh;

}

function createGLTFSphericalHarmonicsAttributes( geometry, primitiveDef, count ) {

	const sphericalHarmonics = {};

	for ( let degree = 1; degree <= 3; degree ++ ) {

		const coefficientCount = degree * 2 + 1;
		const attributes = [];

		for ( let coefficient = 0; coefficient < coefficientCount; coefficient ++ ) {

			const semantic = `KHR_gaussian_splatting:SH_DEGREE_${ degree }_COEF_${ coefficient }`;
			const attribute = getOptionalGaussianSplatAttribute( geometry, primitiveDef, semantic );

			if ( attribute !== undefined ) {

				if ( attribute.count !== count || attribute.itemSize !== 3 ) {

					throw new Error( `THREE.GLTFGaussianSplatLoaderExtension: Invalid ${ semantic } attribute.` );

				}

			}

			attributes.push( attribute );

		}

		if ( attributes.every( attribute => attribute === undefined ) ) break;

		if ( attributes.some( attribute => attribute === undefined ) ) {

			throw new Error( `THREE.GLTFGaussianSplatLoaderExtension: Incomplete KHR_gaussian_splatting SH degree ${ degree } coefficients.` );

		}

		const band = createPackedSphericalHarmonicsBand( count, degree );
		const target = band.bytes;
		const byteStride = SH_BAND_WORDS[ degree ] * 4;

		for ( let i = 0; i < count; i ++ ) {

			for ( let coefficient = 0; coefficient < coefficientCount; coefficient ++ ) {

				const attribute = attributes[ coefficient ];
				const targetOffset = i * byteStride + coefficient * 3;

				target[ targetOffset ] = attribute.getX( i ) * 128 + 128;
				target[ targetOffset + 1 ] = attribute.getY( i ) * 128 + 128;
				target[ targetOffset + 2 ] = attribute.getZ( i ) * 128 + 128;

			}

		}

		sphericalHarmonics[ `sh${ degree }` ] = band.packed;

	}

	for ( const semantic in primitiveDef.attributes ) {

		const match = semantic.match( /^KHR_gaussian_splatting:SH_DEGREE_([1-3])_COEF_/ );

		if ( match !== null && sphericalHarmonics[ `sh${ match[ 1 ] }` ] === undefined ) {

			throw new Error( 'THREE.GLTFGaussianSplatLoaderExtension: KHR_gaussian_splatting spherical harmonics attributes must be contiguous.' );

		}

	}

	return sphericalHarmonics;

}

function getGaussianSplatAttribute( geometry, primitiveDef, semantic ) {

	if ( primitiveDef.attributes[ semantic ] === undefined ) {

		throw new Error( `THREE.GLTFGaussianSplatLoaderExtension: KHR_gaussian_splatting requires ${ semantic }.` );

	}

	const attributeName = ATTRIBUTES[ semantic ] || semantic.toLowerCase();
	const attribute = geometry.getAttribute( attributeName );

	if ( attribute === undefined ) {

		throw new Error( `THREE.GLTFGaussianSplatLoaderExtension: KHR_gaussian_splatting attribute ${ semantic } was not loaded.` );

	}

	return attribute;

}

function getOptionalGaussianSplatAttribute( geometry, primitiveDef, semantic ) {

	if ( primitiveDef.attributes[ semantic ] === undefined ) return undefined;

	const attributeName = ATTRIBUTES[ semantic ] || semantic.toLowerCase();

	return geometry.getAttribute( attributeName );

}

function assignExtrasToUserData( object, gltfDef ) {

	if ( gltfDef.extras !== undefined ) {

		if ( typeof gltfDef.extras === 'object' ) {

			Object.assign( object.userData, gltfDef.extras );

		} else {

			console.warn( 'THREE.GLTFGaussianSplatLoaderExtension: Ignoring primitive type .extras, ' + gltfDef.extras );

		}

	}

}

export { GLTFGaussianSplatLoaderExtension };
