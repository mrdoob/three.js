import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();

/**
 * Represents the shadow configuration of circular area lights.
 *
 * @augments LightShadow
 */
class CircleAreaLightShadow extends LightShadow {

	/**
	 * Constructs a new circular area light shadow.
	 */
	constructor() {

		super( new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCircleAreaLightShadow = true;

	}

	updateMatrices( light ) {

		const camera = this.camera;
		const shadowMatrix = this.matrix;

		const radius = light.radius;

		// Expand the orthographic camera frustum to cover the 180-degree hemisphere
		// that the CircleAreaLight illuminates. We multiply by the far distance to create
		// a frustum that expands with distance, covering a much wider area.
		const farDistance = camera.far;
		const frustumScale = farDistance / 10.0; // Scale frustum based on distance

		// Size the orthographic camera to match the circular light dimensions
		// Use radius for all sides to create a square frustum that contains the circle
		if ( radius !== Math.abs( camera.right ) ) {

			camera.left = - radius - frustumScale;
			camera.right = radius + frustumScale;
			camera.top = radius + frustumScale;
			camera.bottom = - radius - frustumScale;

			camera.updateProjectionMatrix();

		}

		// Position and orient the shadow camera based on the light's transform
		_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		camera.position.copy( _lightPositionWorld );

		// CircleAreaLight uses its own rotation (via lookAt), not a target
		camera.quaternion.copy( light.quaternion );
		camera.updateMatrixWorld();

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		this._frustum.setFromProjectionMatrix( _projScreenMatrix, camera.coordinateSystem, camera.reversedDepth );

		if ( camera.reversedDepth ) {

			shadowMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 1.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			);

		} else {

			shadowMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);

		}

		shadowMatrix.multiply( _projScreenMatrix );

	}

}

export { CircleAreaLightShadow };
