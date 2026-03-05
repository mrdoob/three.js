import {
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	ShaderMaterial,
	SphereGeometry,
	Vector3
} from 'three';

/**
 * Visualizes an {@link IrradianceProbeGrid} by rendering a sphere at each
 * probe position, shaded with the probe's L1 spherical harmonics.
 *
 * Uses a single `InstancedMesh` draw call for all probes.
 *
 * ```js
 * const helper = new IrradianceProbeGridHelper( probeGrid );
 * scene.add( helper );
 * ```
 *
 * @augments InstancedMesh
 * @three_import import { IrradianceProbeGridHelper } from 'three/addons/helpers/IrradianceProbeGridHelper.js';
 */
class IrradianceProbeGridHelper extends InstancedMesh {

	/**
	 * Constructs a new irradiance probe grid helper.
	 *
	 * @param {IrradianceProbeGrid} probeGrid - The probe grid to visualize.
	 * @param {number} [sphereSize=0.12] - The radius of each probe sphere.
	 */
	constructor( probeGrid, sphereSize = 0.12 ) {

		const geometry = new SphereGeometry( sphereSize, 16, 16 );

		const material = new ShaderMaterial( {

			uniforms: {

				probeGridSH0: { value: null },
				probeGridSH1: { value: null },
				probeGridSH2: { value: null }

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

				varying vec3 vWorldNormal;
				varying vec3 vUVW;

				void main() {

					vec4 s0 = texture( probeGridSH0, vUVW );
					vec4 s1 = texture( probeGridSH1, vUVW );
					vec4 s2 = texture( probeGridSH2, vUVW );

					vec3 c0 = s0.rgb;
					vec3 c1 = vec3( s0.a, s1.rg );
					vec3 c2 = vec3( s1.ba, s2.r );
					vec3 c3 = s2.gba;

					vec3 n = normalize( vWorldNormal );

					vec3 result = c0 * 0.886227;
					result += c1 * 2.0 * 0.511664 * n.y;
					result += c2 * 2.0 * 0.511664 * n.z;
					result += c3 * 2.0 * 0.511664 * n.x;

					gl_FragColor = vec4( max( result, vec3( 0.0 ) ), 1.0 );

				}

			`

		} );

		const res = probeGrid.resolution;
		const count = res.x * res.y * res.z;

		super( geometry, material, count );

		/**
		 * The probe grid to visualize.
		 *
		 * @type {IrradianceProbeGrid}
		 */
		this.probeGrid = probeGrid;

		this.type = 'IrradianceProbeGridHelper';

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

					// Remap to texel centers (must match irradiance_probe_grid_pars_fragment.glsl.js)
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

export { IrradianceProbeGridHelper };
