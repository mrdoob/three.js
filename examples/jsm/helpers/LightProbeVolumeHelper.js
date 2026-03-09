import {
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	ShaderMaterial,
	SphereGeometry,
	Vector3
} from 'three';

/**
 * Visualizes an {@link LightProbeVolume} by rendering a sphere at each
 * probe position, shaded with the probe's L1 spherical harmonics.
 *
 * Uses a single `InstancedMesh` draw call for all probes.
 *
 * ```js
 * const helper = new LightProbeVolumeHelper( probeGrid );
 * scene.add( helper );
 * ```
 *
 * @augments InstancedMesh
 * @three_import import { LightProbeVolumeHelper } from 'three/addons/helpers/LightProbeVolumeHelper.js';
 */
class LightProbeVolumeHelper extends InstancedMesh {

	/**
	 * Constructs a new irradiance probe grid helper.
	 *
	 * @param {LightProbeVolume} probeGrid - The probe grid to visualize.
	 * @param {number} [sphereSize=0.12] - The radius of each probe sphere.
	 */
	constructor( probeGrid, sphereSize = 0.12 ) {

		const geometry = new SphereGeometry( sphereSize, 16, 16 );

		const material = new ShaderMaterial( {

			uniforms: {

				probeGridSH0: { value: null },
				probeGridSH1: { value: null },
				probeGridSH2: { value: null },
				probeGridSH3: { value: null },
				probeGridSH4: { value: null }

			},

			vertexShader: /* glsl */`

				attribute vec3 instanceUVW;

				varying vec3 vWorldNormal;
				varying vec3 vUVW;

				void main() {

					vUVW = instanceUVW;
					vWorldNormal = normalize( mat3( modelMatrix ) * normal );
					gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4( position, 1.0 );

				}

			`,

			fragmentShader: /* glsl */`

				precision highp sampler3D;

				uniform sampler3D probeGridSH0;
				uniform sampler3D probeGridSH1;
				uniform sampler3D probeGridSH2;
				uniform sampler3D probeGridSH3;
				uniform sampler3D probeGridSH4;

				varying vec3 vWorldNormal;
				varying vec3 vUVW;

				void main() {

					vec4 s0 = texture( probeGridSH0, vUVW );
					vec4 s1 = texture( probeGridSH1, vUVW );
					vec4 s2 = texture( probeGridSH2, vUVW );
					vec4 s3 = texture( probeGridSH3, vUVW );
					vec4 s4 = texture( probeGridSH4, vUVW );

					vec3 c0 = s0.rgb;
					vec3 c1 = s1.rgb;
					vec3 c2 = s2.rgb;
					vec3 c3 = s3.rgb;

					float c4 = s0.a;
					float c5 = s1.a;
					float c6 = s2.a;
					float c7 = s3.a;
					float c8 = s4.r;

					vec3 n = normalize( vWorldNormal );
					float x = n.x, y = n.y, z = n.z;

					vec3 result = c0 * 0.886227;
					result += c1 * 2.0 * 0.511664 * y;
					result += c2 * 2.0 * 0.511664 * z;
					result += c3 * 2.0 * 0.511664 * x;

					float l2 = c4 * 2.0 * 0.429043 * x * y;
					l2 += c5 * 2.0 * 0.429043 * y * z;
					l2 += c6 * ( 0.743125 * z * z - 0.247708 );
					l2 += c7 * 2.0 * 0.429043 * x * z;
					l2 += c8 * 0.429043 * ( x * x - y * y );

					result += vec3( l2 );

					gl_FragColor = vec4( max( result, vec3( 0.0 ) ), 1.0 );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>

				}

			`

		} );

		const res = probeGrid.resolution;
		const count = res.x * res.y * res.z;

		super( geometry, material, count );

		/**
		 * The probe grid to visualize.
		 *
		 * @type {LightProbeVolume}
		 */
		this.probeGrid = probeGrid;

		this.type = 'LightProbeVolumeHelper';

		this.update();

	}

	/**
	 * Rebuilds instance matrices and UVW attributes from the current probe grid.
	 * Call this after changing `probeGrid` or after re-baking.
	 */
	update() {

		const probeGrid = this.probeGrid;
		const res = probeGrid.resolution;
		const count = res.x * res.y * res.z;

		// Resize instance matrix buffer if needed

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

					// Remap to texel centers (must match light_probe_volume_pars_fragment.glsl.js)
					uvwArray[ i * 3 ] = ( ix + 0.5 ) / res.x;
					uvwArray[ i * 3 + 1 ] = ( iy + 0.5 ) / res.y;
					uvwArray[ i * 3 + 2 ] = ( iz + 0.5 ) / res.z;

					probeGrid.getProbePosition( ix, iy, iz, probePos );
					matrix.makeTranslation( probePos.x, probePos.y, probePos.z );
					this.setMatrixAt( i, matrix );

					i ++;

				}

			}

		}

		this.instanceMatrix.needsUpdate = true;

		this.geometry.setAttribute( 'instanceUVW', new InstancedBufferAttribute( uvwArray, 3 ) );

		// Update texture uniforms

		this.material.uniforms.probeGridSH0.value = probeGrid.textures[ 0 ];
		this.material.uniforms.probeGridSH1.value = probeGrid.textures[ 1 ];
		this.material.uniforms.probeGridSH2.value = probeGrid.textures[ 2 ];
		this.material.uniforms.probeGridSH3.value = probeGrid.textures[ 3 ];
		this.material.uniforms.probeGridSH4.value = probeGrid.textures[ 4 ];

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

export { LightProbeVolumeHelper };
