import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();

/**
 * Represents the shadow configuration of rectangular area lights.
 *
 * @augments LightShadow
 */
class RectAreaLightShadow extends LightShadow {

	/**
	 * Constructs a new rectangular area light shadow.
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
		this.isRectAreaLightShadow = true;

	}

	updateMatrices( light ) {

		const camera = this.camera;
		const shadowMatrix = this.matrix;

		const width = light.width * 0.5;
		const height = light.height * 0.5;

		// Expand the orthographic camera frustum to cover the 180-degree hemisphere
		// that the RectAreaLight illuminates. We multiply by the far distance to create
		// a frustum that expands with distance, covering a much wider area.
		const farDistance = camera.far;
		const frustumScale = farDistance / 10.0; // Scale frustum based on distance

		if ( width !== Math.abs( camera.right ) || height !== Math.abs( camera.top ) ) {

			camera.left = - width - frustumScale;
			camera.right = width + frustumScale;
			camera.top = height + frustumScale;
			camera.bottom = - height - frustumScale;

			camera.updateProjectionMatrix();

		}

		// Position and orient the shadow camera based on the light's transform
		_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		camera.position.copy( _lightPositionWorld );

		// RectAreaLight uses its own rotation (via lookAt), not a target
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

export { RectAreaLightShadow };
