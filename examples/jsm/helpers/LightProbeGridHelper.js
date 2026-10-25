import {
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	NodeMaterial,
	SphereGeometry,
	Vector3
} from 'three/webgpu';
import { attribute, Discard, Fn, getShIrradianceAt, int, ivec2, normalWorld, texture, texture3D, uniform, vec3, vec4 } from 'three/tsl';

import { DISTANCE_COLUMNS, sampleGridSH } from '../tsl/lighting/LightProbeGridNode.js';

/**
 * Visualizes a {@link LightProbeGrid} by rendering a sphere at each probe
 * position, shaded with the probe's L2 spherical harmonics. Uses a single
 * `InstancedMesh` draw call for all probes. With {@link LightProbeGrid#visibility},
 * probes hidden for being inside or too close to geometry are not drawn.
 *
 * This helper can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, import from `LightProbeGridHelperWebGL.js`.
 *
 * ```js
 * const helper = new LightProbeGridHelper( probes );
 * scene.add( helper );
 * ```
 *
 * @private
 * @augments InstancedMesh
 * @three_import import { LightProbeGridHelper } from 'three/addons/helpers/LightProbeGridHelper.js';
 */
class LightProbeGridHelper extends InstancedMesh {

	/**
	 * Constructs a new irradiance probe grid helper.
	 *
	 * @param {LightProbeGrid} probes - The probe grid to visualize.
	 * @param {number} [sphereSize=0.12] - The radius of each probe sphere.
	 */
	constructor( probes, sphereSize = 0.12 ) {

		const geometry = new SphereGeometry( sphereSize, 16, 16 );
		const material = new NodeMaterial();

		const res = probes.resolution;
		const count = res.x * res.y * res.z;

		super( geometry, material, count );

		/**
		 * The probe grid to visualize.
		 *
		 * @type {LightProbeGrid}
		 */
		this.probes = probes;

		this.type = 'LightProbeGridHelper';

		// Atlas and resolution are swappable uniforms, so the shading node builds once.

		this._atlas = texture3D( probes.texture );
		this._distance = probes.visibility ? texture( probes._distanceTarget.texture ) : null;
		this._resolution = uniform( new Vector3() );
		this._distanceResolution = uniform( 8, 'int' );

		material.fragmentNode = Fn( () => {

			const sh = sampleGridSH( this._atlas, attribute( 'instanceUVW', 'vec3' ), this._resolution.z );
			const irradiance = getShIrradianceAt( normalWorld, sh ).max( vec3( 0.0 ) );

			if ( probes.visibility ) {

				// Round the interpolated probe index before reading its distance tile.
				const probeIndex = int( attribute( 'instanceProbeIndex', 'float' ).add( 0.5 ) );
				const tile = ivec2( probeIndex.mod( DISTANCE_COLUMNS ), probeIndex.div( DISTANCE_COLUMNS ) );
				const distanceCoord = tile.mul( this._distanceResolution.add( 2 ) ).add( this._distanceResolution.div( 2 ).add( 1 ) );
				const meanDistance = this._distance.load( distanceCoord ).x;
				Discard( meanDistance.lessThan( 0.0 ) );

			}

			return vec4( irradiance, 1.0 );

		} )();

		this.update();

	}

	/**
	 * Rebuilds instance matrices and UVW attributes from the current probe grid,
	 * and rebinds the shading node to its atlas. Call this after changing
	 * `probes` or after re-baking. Recreate the helper to change visibility.
	 */
	update() {

		const probes = this.probes;
		const res = probes.resolution;
		const count = res.x * res.y * res.z;

		// Resize instance matrix buffer if needed.

		if ( this.instanceMatrix.count !== count ) {

			this.instanceMatrix = new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 );

		}

		this.count = count;

		const uvwArray = new Float32Array( count * 3 );
		const indexArray = new Float32Array( count );
		const matrix = new Matrix4();
		const probePos = new Vector3();

		let i = 0;

		for ( let iz = 0; iz < res.z; iz ++ ) {

			for ( let iy = 0; iy < res.y; iy ++ ) {

				for ( let ix = 0; ix < res.x; ix ++ ) {

					// Remap to texel centers (must match LightProbeGridNode).
					uvwArray[ i * 3 ] = ( ix + 0.5 ) / res.x;
					uvwArray[ i * 3 + 1 ] = ( iy + 0.5 ) / res.y;
					uvwArray[ i * 3 + 2 ] = ( iz + 0.5 ) / res.z;

					// Index in bake order (X, then Z, then Y), as used by the distance atlas.
					indexArray[ i ] = ix + iz * res.x + iy * res.x * res.z;

					probes.getProbePosition( ix, iy, iz, probePos );
					matrix.makeTranslation( probePos.x, probePos.y, probePos.z );
					this.setMatrixAt( i, matrix );

					i ++;

				}

			}

		}

		this.instanceMatrix.needsUpdate = true;

		this.geometry.setAttribute( 'instanceUVW', new InstancedBufferAttribute( uvwArray, 3 ) );
		this.geometry.setAttribute( 'instanceProbeIndex', new InstancedBufferAttribute( indexArray, 1 ) );

		this._atlas.value = probes.texture;

		if ( probes.visibility ) {

			this._distance.value = probes._distanceTarget.texture;
			this._distanceResolution.value = probes.visibilityGridSize;

		}

		this._resolution.value.copy( res );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { LightProbeGridHelper };
