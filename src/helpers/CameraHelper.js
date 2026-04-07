import { Camera } from '../cameras/Camera.js';
import { Vector3 } from '../math/Vector3.js';
import { LineSegments } from '../objects/LineSegments.js';
import { Color } from '../math/Color.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../constants.js';

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new Camera();

/**
 * This helps with visualizing what a camera contains in its frustum. It
 * visualizes the frustum of a camera using a line segments.
 *
 * Based on frustum visualization in [lightgl.js shadowmap example](https://github.com/evanw/lightgl.js/blob/master/tests/shadowmap.html).
 *
 * `CameraHelper` must be a child of the scene.
 *
 * When the camera is transformed or its projection matrix is changed, it's necessary
 * to call the `update()` method of the respective helper.
 *
 * ```js
 * const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
 * const helper = new THREE.CameraHelper( camera );
 * scene.add( helper );
 * ```
 *
 * @augments LineSegments
 */
class CameraHelper extends LineSegments {

	/**
	 * Constructs a new arrow helper.
	 *
	 * @param {Camera} camera - The camera to visualize.
	 */
	constructor( camera ) {

		const geometry = new BufferGeometry();
		const material = new LineBasicMaterial( { color: 0xffffff, vertexColors: true, toneMapped: false } );

		const vertices = [];
		const colors = [];

		const pointMap = {};

		// near

		addLine( 'n1', 'n2' );
		addLine( 'n2', 'n4' );
		addLine( 'n4', 'n3' );
		addLine( 'n3', 'n1' );

		// far

		addLine( 'f1', 'f2' );
		addLine( 'f2', 'f4' );
		addLine( 'f4', 'f3' );
		addLine( 'f3', 'f1' );

		// sides

		addLine( 'n1', 'f1' );
		addLine( 'n2', 'f2' );
		addLine( 'n3', 'f3' );
		addLine( 'n4', 'f4' );

		// cone

		addLine( 'p', 'n1' );
		addLine( 'p', 'n2' );
		addLine( 'p', 'n3' );
		addLine( 'p', 'n4' );

		// up

		addLine( 'u1', 'u2' );
		addLine( 'u2', 'u3' );
		addLine( 'u3', 'u1' );

		// target

		addLine( 'c', 't' );
		addLine( 'p', 'c' );

		// cross

		addLine( 'cn1', 'cn2' );
		addLine( 'cn3', 'cn4' );

		addLine( 'cf1', 'cf2' );
		addLine( 'cf3', 'cf4' );

		function addLine( a, b ) {

			addPoint( a );
			addPoint( b );

		}

		function addPoint( id ) {

			vertices.push( 0, 0, 0 );
			colors.push( 0, 0, 0 );

			if ( pointMap[ id ] === undefined ) {

				pointMap[ id ] = [];

			}

			pointMap[ id ].push( ( vertices.length / 3 ) - 1 );

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		super( geometry, material );

		this.type = 'CameraHelper';

		/**
		 * The camera being visualized.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;
		if ( this.camera.updateProjectionMatrix ) this.camera.updateProjectionMatrix();

		this.matrix = camera.matrixWorld;
		this.matrixAutoUpdate = false;

		/**
		 * This contains the points used to visualize the camera.
		 *
		 * @type {Object<string,Array<number>>}
		 */
		this.pointMap = pointMap;

		this.update();

		// colors

		const colorFrustum = new Color( 0xffaa00 );
		const colorCone = new Color( 0xff0000 );
		const colorUp = new Color( 0x00aaff );
		const colorTarget = new Color( 0xffffff );
		const colorCross = new Color( 0x333333 );

		this.setColors( colorFrustum, colorCone, colorUp, colorTarget, colorCross );

	}

	/**
	 * Defines the colors of the helper.
	 *
	 * @param {Color} frustum - The frustum line color.
	 * @param {Color} cone - The cone line color.
	 * @param {Color} up - The up line color.
	 * @param {Color} target - The target line color.
	 * @param {Color} cross - The cross line color.
	 * @return {CameraHelper} A reference to this helper.
	 */
	setColors( frustum, cone, up, target, cross ) {

		const geometry = this.geometry;

		const colorAttribute = geometry.getAttribute( 'color' );

		// near

		colorAttribute.setFromColor( 0, frustum ); colorAttribute.setFromColor( 1, frustum ); // n1, n2
		colorAttribute.setFromColor( 2, frustum ); colorAttribute.setFromColor( 3, frustum ); // n2, n4
		colorAttribute.setFromColor( 4, frustum ); colorAttribute.setFromColor( 5, frustum ); // n4, n3
		colorAttribute.setFromColor( 6, frustum ); colorAttribute.setFromColor( 7, frustum ); // n3, n1

		// far

		colorAttribute.setFromColor( 8, frustum ); colorAttribute.setFromColor( 9, frustum ); // f1, f2
		colorAttribute.setFromColor( 10, frustum ); colorAttribute.setFromColor( 11, frustum ); // f2, f4
		colorAttribute.setFromColor( 12, frustum ); colorAttribute.setFromColor( 13, frustum ); // f4, f3
		colorAttribute.setFromColor( 14, frustum ); colorAttribute.setFromColor( 15, frustum ); // f3, f1

		// sides

		colorAttribute.setFromColor( 16, frustum ); colorAttribute.setFromColor( 17, frustum ); // n1, f1
		colorAttribute.setFromColor( 18, frustum ); colorAttribute.setFromColor( 19, frustum ); // n2, f2
		colorAttribute.setFromColor( 20, frustum ); colorAttribute.setFromColor( 21, frustum ); // n3, f3
		colorAttribute.setFromColor( 22, frustum ); colorAttribute.setFromColor( 23, frustum ); // n4, f4

		// cone

		colorAttribute.setFromColor( 24, cone ); colorAttribute.setFromColor( 25, cone ); // p, n1
		colorAttribute.setFromColor( 26, cone ); colorAttribute.setFromColor( 27, cone ); // p, n2
		colorAttribute.setFromColor( 28, cone ); colorAttribute.setFromColor( 29, cone ); // p, n3
		colorAttribute.setFromColor( 30, cone ); colorAttribute.setFromColor( 31, cone ); // p, n4

		// up

		colorAttribute.setFromColor( 32, up ); colorAttribute.setFromColor( 33, up ); // u1, u2
		colorAttribute.setFromColor( 34, up ); colorAttribute.setFromColor( 35, up ); // u2, u3
		colorAttribute.setFromColor( 36, up ); colorAttribute.setFromColor( 37, up ); // u3, u1

		// target

		colorAttribute.setFromColor( 38, target ); colorAttribute.setFromColor( 39, target ); // c, t
		colorAttribute.setFromColor( 40, cross ); colorAttribute.setFromColor( 41, cross ); // p, c

		// cross

		colorAttribute.setFromColor( 42, cross ); colorAttribute.setFromColor( 43, cross ); // cn1, cn2
		colorAttribute.setFromColor( 44, cross ); colorAttribute.setFromColor( 45, cross ); // cn3, cn4

		colorAttribute.setFromColor( 46, cross ); colorAttribute.setFromColor( 47, cross ); // cf1, cf2
		colorAttribute.setFromColor( 48, cross ); colorAttribute.setFromColor( 49, cross ); // cf3, cf4

		colorAttribute.needsUpdate = true;

		return this;

	}

	/**
	 * Updates the helper based on the projection matrix of the camera.
	 */
	update() {

		const geometry = this.geometry;
		const pointMap = this.pointMap;

		const w = 1, h = 1;

		let nearZ, farZ;

		// we need just camera projection matrix inverse
		// world matrix must be identity

		_camera.projectionMatrixInverse.copy( this.camera.projectionMatrixInverse );

		// Adjust z values based on coordinate system

		if ( this.camera.reversedDepth === true ) {

			nearZ = 1;
			farZ = 0;

		} else {

			if ( this.camera.coordinateSystem === WebGLCoordinateSystem ) {

				nearZ = - 1;
				farZ = 1;

			} else if ( this.camera.coordinateSystem === WebGPUCoordinateSystem ) {

				nearZ = 0;
				farZ = 1;

			} else {

				throw new Error( 'THREE.CameraHelper.update(): Invalid coordinate system: ' + this.camera.coordinateSystem );

			}

		}


		// center / target
		setPoint( 'c', pointMap, geometry, _camera, 0, 0, nearZ );
		setPoint( 't', pointMap, geometry, _camera, 0, 0, farZ );

		// near

		setPoint( 'n1', pointMap, geometry, _camera, - w, - h, nearZ );
		setPoint( 'n2', pointMap, geometry, _camera, w, - h, nearZ );
		setPoint( 'n3', pointMap, geometry, _camera, - w, h, nearZ );
		setPoint( 'n4', pointMap, geometry, _camera, w, h, nearZ );

		// far

		setPoint( 'f1', pointMap, geometry, _camera, - w, - h, farZ );
		setPoint( 'f2', pointMap, geometry, _camera, w, - h, farZ );
		setPoint( 'f3', pointMap, geometry, _camera, - w, h, farZ );
		setPoint( 'f4', pointMap, geometry, _camera, w, h, farZ );

		// up

		setPoint( 'u1', pointMap, geometry, _camera, w * 0.7, h * 1.1, nearZ );
		setPoint( 'u2', pointMap, geometry, _camera, - w * 0.7, h * 1.1, nearZ );
		setPoint( 'u3', pointMap, geometry, _camera, 0, h * 2, nearZ );

		// cross

		setPoint( 'cf1', pointMap, geometry, _camera, - w, 0, farZ );
		setPoint( 'cf2', pointMap, geometry, _camera, w, 0, farZ );
		setPoint( 'cf3', pointMap, geometry, _camera, 0, - h, farZ );
		setPoint( 'cf4', pointMap, geometry, _camera, 0, h, farZ );

		setPoint( 'cn1', pointMap, geometry, _camera, - w, 0, nearZ );
		setPoint( 'cn2', pointMap, geometry, _camera, w, 0, nearZ );
		setPoint( 'cn3', pointMap, geometry, _camera, 0, - h, nearZ );
		setPoint( 'cn4', pointMap, geometry, _camera, 0, h, nearZ );

		geometry.getAttribute( 'position' ).needsUpdate = true;

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


function setPoint( point, pointMap, geometry, camera, x, y, z ) {

	_vector.set( x, y, z ).unproject( camera );

	const points = pointMap[ point ];

	if ( points !== undefined ) {

		const position = geometry.getAttribute( 'position' );

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			position.setFromVector3( points[ i ], _vector );

		}

	}

}

export { CameraHelper };
