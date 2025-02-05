import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../core/BufferAttribute.js';
import { Mesh } from '../../objects/Mesh.js';
import { OrthographicCamera } from '../../cameras/OrthographicCamera.js';

const _camera = /*@__PURE__*/ new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

/**
 * The purpose of this special geometry is to fill the entire viewport with a single triangle.
 *
 * Reference: {@link https://github.com/mrdoob/three.js/pull/21358}
 *
 * @private
 * @augments BufferGeometry
 */
class QuadGeometry extends BufferGeometry {

	/**
	 * Constructs a new quad geometry.
	 *
	 * @param {boolean} [flipY=false] - Whether the uv coordinates should be flipped along the vertical axis or not.
	 */
	constructor( flipY = false ) {

		super();

		const uv = flipY === false ? [ 0, - 1, 0, 1, 2, 1 ] : [ 0, 2, 0, 0, 2, 0 ];

		this.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

	}

}

const _geometry = /*@__PURE__*/ new QuadGeometry();


/**
 * This module is a helper for passes which need to render a full
 * screen effect which is quite common in context of post processing.
 *
 * The intended usage is to reuse a single quad mesh for rendering
 * subsequent passes by just reassigning the `material` reference.
 *
 * @augments Mesh
 */
class QuadMesh extends Mesh {

	/**
	 * Constructs a new quad mesh.
	 *
	 * @param {?Material} [material=null] - The material to render the quad mesh with.
	 */
	constructor( material = null ) {

		super( _geometry, material );

		/**
		 * The camera to render the quad mesh with.
		 *
		 * @type {OrthographicCamera}
		 * @readonly
		 */
		this.camera = _camera;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isQuadMesh = true;

	}

	/**
	 * Async version of `render()`.
	 *
	 * @async
	 * @param {Renderer} renderer - The renderer.
	 * @return {Promise} A Promise that resolves when the render has been finished.
	 */
	async renderAsync( renderer ) {

		return renderer.renderAsync( this, _camera );

	}

	/**
	 * Renders the quad mesh
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	render( renderer ) {

		renderer.render( this, _camera );

	}

}

export default QuadMesh;
