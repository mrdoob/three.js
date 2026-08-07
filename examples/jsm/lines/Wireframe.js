import {
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Mesh,
	vec2Set,
	vec3Create,
	vec3DistanceTo,
	vec3FromBufferAttribute,
	vec4Create
} from 'three';
import { LineSegmentsGeometry } from './LineSegmentsGeometry.js';
import { LineMaterial } from './LineMaterial.js';

const _start = /*@__PURE__*/ vec3Create();
const _end = /*@__PURE__*/ vec3Create();
const _viewport = /*@__PURE__*/ vec4Create();

/**
 * A class for creating wireframes based on wide lines.
 *
 * This module can only be used with {@link WebGLRenderer}. When using {@link WebGPURenderer},
 * import the class from `lines/webgpu/Wireframe.js`.
 *
 * ```js
 * const geometry = new THREE.IcosahedronGeometry();
 * const wireframeGeometry = new WireframeGeometry2( geo );
 *
 * const wireframe = new Wireframe( wireframeGeometry, material );
 * scene.add( wireframe );
 * ```
 *
 * @augments Mesh
 * @three_import import { Wireframe } from 'three/addons/lines/Wireframe.js';
 */
class Wireframe extends Mesh {

	/**
	 * Constructs a new wireframe.
	 *
	 * @param {LineSegmentsGeometry} [geometry] - The line geometry.
	 * @param {LineMaterial} [material] - The line material.
	 */
	constructor( geometry = new LineSegmentsGeometry(), material = new LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWireframe = true;

		this.type = 'Wireframe';

	}

	/**
	 * Computes an array of distance values which are necessary for rendering dashed lines.
	 * For each vertex in the geometry, the method calculates the cumulative length from the
	 * current point to the very beginning of the line.
	 *
	 * @return {Wireframe} A reference to this instance.
	 */
	computeLineDistances() {

		// for backwards-compatibility, but could be a method of LineSegmentsGeometry...

		const geometry = this.geometry;

		const instanceStart = geometry.attributes.instanceStart;
		const instanceEnd = geometry.attributes.instanceEnd;
		const lineDistances = new Float32Array( 2 * instanceStart.count );

		for ( let i = 0, j = 0, l = instanceStart.count; i < l; i ++, j += 2 ) {

			vec3FromBufferAttribute( instanceStart, i, _start );
			vec3FromBufferAttribute( instanceEnd, i, _end );

			lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
			lineDistances[ j + 1 ] = lineDistances[ j ] + vec3DistanceTo( _start, _end );

		}

		const instanceDistanceBuffer = new InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

		geometry.setAttribute( 'instanceDistanceStart', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
		geometry.setAttribute( 'instanceDistanceEnd', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

		return this;

	}

	onBeforeRender( renderer ) {

		const uniforms = this.material.uniforms;

		if ( uniforms && uniforms.resolution ) {

			renderer.getViewport( _viewport );
			vec2Set( _viewport.z, _viewport.w, this.material.uniforms.resolution.value );

		}

	}

}

export { Wireframe };
