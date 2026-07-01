import {
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	NodeMaterial,
	SphereGeometry,
	Vector3
} from 'three/webgpu';
import { array, attribute, Fn, getShIrradianceAt, normalWorld, texture3D, uniform, vec3, vec4 } from 'three/tsl';

/**
 * Visualizes a {@link LightProbeGrid} by rendering a sphere at each probe
 * position, shaded with the probe's L2 spherical harmonics. Uses a single
 * `InstancedMesh` draw call for all probes.
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
		this._resolution = uniform( new Vector3() );

		const nz = this._resolution.z;
		const paddedSlices = nz.add( 2.0 );
		const atlasDepth = paddedSlices.mul( 7.0 );

		material.fragmentNode = Fn( () => {

			const uvw = attribute( 'instanceUVW', 'vec3' );
			const uvZBase = uvw.z.mul( nz ).add( 1.0 );

			const slice = ( t ) => this._atlas.sample( vec3( uvw.xy, uvZBase.add( paddedSlices.mul( t ) ).div( atlasDepth ) ) );

			const s0 = slice( 0 ), s1 = slice( 1 ), s2 = slice( 2 ), s3 = slice( 3 );
			const s4 = slice( 4 ), s5 = slice( 5 ), s6 = slice( 6 );

			const sh = array( [
				s0.xyz,
				vec3( s0.w, s1.xy ),
				vec3( s1.zw, s2.x ),
				s2.yzw,
				s3.xyz,
				vec3( s3.w, s4.xy ),
				vec3( s4.zw, s5.x ),
				s5.yzw,
				s6.xyz
			] );

			return vec4( getShIrradianceAt( normalWorld, sh ).max( vec3( 0.0 ) ), 1.0 );

		} )();

		this.update();

	}

	/**
	 * Rebuilds instance matrices and UVW attributes from the current probe grid,
	 * and rebinds the shading node to its atlas. Call this after changing
	 * `probes` or after re-baking.
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

					probes.getProbePosition( ix, iy, iz, probePos );
					matrix.makeTranslation( probePos.x, probePos.y, probePos.z );
					this.setMatrixAt( i, matrix );

					i ++;

				}

			}

		}

		this.instanceMatrix.needsUpdate = true;

		this.geometry.setAttribute( 'instanceUVW', new InstancedBufferAttribute( uvwArray, 3 ) );

		this._atlas.value = probes.texture;
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
