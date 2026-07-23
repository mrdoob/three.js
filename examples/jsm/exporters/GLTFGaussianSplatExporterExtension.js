import {
	BufferAttribute
} from 'three';

import { decomposeCovariance, linearToSH0 } from '../utils/GaussianSplatUtils.js';

const EXTENSION_NAME = 'KHR_gaussian_splatting';
const POINTS = 0;

/**
 * A glTF exporter plugin for `KHR_gaussian_splatting`.
 *
 * ```js
 * const exporter = new GLTFExporter();
 * exporter.register( function ( writer ) {
 *
 * 	return new GLTFGaussianSplatExporterExtension( writer );
 *
 * } );
 * ```
 *
 * @three_import import { GLTFGaussianSplatExporterExtension } from 'three/addons/exporters/GLTFGaussianSplatExporterExtension.js';
 */
class GLTFGaussianSplatExporterExtension {

	/**
	 * Constructs a new glTF gaussian splat exporter extension plugin.
	 *
	 * @param {GLTFWriter} writer - The glTF writer.
	 */
	constructor( writer ) {

		this.name = EXTENSION_NAME;
		this.writer = writer;

	}

	/**
	 * Processes a gaussian splat mesh.
	 *
	 * @param {GaussianSplatMesh} mesh - The mesh to process.
	 * @return {?number} Index of the processed mesh in the "meshes" array, or `null` when the mesh is unsupported.
	 */
	processMeshAsync( mesh ) {

		if ( mesh.isGaussianSplatMesh !== true ) return null;

		const writer = this.writer;
		const cache = writer.cache;
		const meshCacheKey = mesh.splatGeometry.uuid;

		if ( cache.meshes.has( meshCacheKey ) ) return cache.meshes.get( meshCacheKey );

		const index = this.processGaussianSplatMesh( mesh );
		cache.meshes.set( meshCacheKey, index );

		return index;

	}

	/**
	 * Process Gaussian splat mesh.
	 *
	 * @param {GaussianSplatMesh} mesh - Gaussian splat mesh to process.
	 * @return {number} Index of the processed mesh in the "meshes" array.
	 */
	processGaussianSplatMesh( mesh ) {

		const writer = this.writer;
		const json = writer.json;
		const positionAttribute = mesh.splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = mesh.splatGeometry.getAttribute( 'covariance' );
		const colorAttribute = mesh.splatGeometry.getAttribute( 'color' );
		const count = positionAttribute.count;
		const positions = new Float32Array( positionAttribute.array );
		const scales = new Float32Array( count * 3 );
		const rotations = new Float32Array( count * 4 );
		const opacities = new Uint8Array( count );
		const sh0 = new Float32Array( count * 3 );
		const fallbackColors = new Float32Array( count * 4 );
		const colors = colorAttribute.array;
		const covariances = covarianceAttribute.array;
		const extensionDef = mesh.userData.gltfExtensions &&
			mesh.userData.gltfExtensions[ EXTENSION_NAME ] || {};
		const colorSpace = extensionDef.colorSpace || 'srgb_rec709_display';

		for ( let i = 0; i < count; i ++ ) {

			const i3 = i * 3;
			const i4 = i * 4;
			const r = colors[ i4 ] / 255;
			const g = colors[ i4 + 1 ] / 255;
			const b = colors[ i4 + 2 ] / 255;
			const a = colors[ i4 + 3 ] / 255;

			decomposeCovariance( covariances, i * 6, scales, rotations, i3 );

			opacities[ i ] = colors[ i4 + 3 ];
			sh0[ i3 ] = linearToSH0( r );
			sh0[ i3 + 1 ] = linearToSH0( g );
			sh0[ i3 + 2 ] = linearToSH0( b );

			fallbackColors[ i4 ] = colorSpace === 'srgb_rec709_display' ? srgbToLinear( r ) : r;
			fallbackColors[ i4 + 1 ] = colorSpace === 'srgb_rec709_display' ? srgbToLinear( g ) : g;
			fallbackColors[ i4 + 2 ] = colorSpace === 'srgb_rec709_display' ? srgbToLinear( b ) : b;
			fallbackColors[ i4 + 3 ] = a;

		}

		const primitive = {
			mode: POINTS,
			attributes: {
				POSITION: writer.processAccessor( new BufferAttribute( positions, 3 ) ),
				'KHR_gaussian_splatting:SCALE': writer.processAccessor( new BufferAttribute( scales, 3 ) ),
				'KHR_gaussian_splatting:ROTATION': writer.processAccessor( new BufferAttribute( rotations, 4 ) ),
				'KHR_gaussian_splatting:OPACITY': writer.processAccessor( new BufferAttribute( opacities, 1, true ) ),
				'KHR_gaussian_splatting:SH_DEGREE_0_COEF_0': writer.processAccessor( new BufferAttribute( sh0, 3 ) ),
				COLOR_0: writer.processAccessor( new BufferAttribute( fallbackColors, 4 ) )
			},
			extensions: {
				[ EXTENSION_NAME ]: {
					kernel: 'ellipse',
					colorSpace: colorSpace,
					projection: extensionDef.projection || 'perspective',
					sortingMethod: extensionDef.sortingMethod || 'cameraDistance'
				}
			}
		};
		const meshDef = {
			primitives: [ primitive ]
		};

		if ( ! json.meshes ) json.meshes = [];

		writer.extensionsUsed[ EXTENSION_NAME ] = true;

		return json.meshes.push( meshDef ) - 1;

	}

}

function srgbToLinear( value ) {

	return value <= 0.04045 ? value * 0.0773993808 : Math.pow( value * 0.9478672986 + 0.0521327014, 2.4 );

}

export { GLTFGaussianSplatExporterExtension };
