import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';
import { Matrix4 } from '../math/Matrix4.js';

/**
 * Represents the shadow configuration of directional lights.
 *
 * @augments LightShadow
 */
class DirectionalLightShadow extends LightShadow {

	/**
	 * Constructs a new directional light shadow.
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
		this.isDirectionalLightShadow = true;

		this.autoFit = true;

	}

	updateMatrices( light ) {

		if ( this.autoFit === true ) {

			const shadowCamera = this.camera;
			const shadowMatrix = this.matrix;

			_projScreenMatrix.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
			this._frustum.setFromProjectionMatrix( _projScreenMatrix, shadowCamera.coordinateSystem, shadowCamera.reversedDepth );

			if ( shadowCamera.reversedDepth ) {

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

		} else {

			super.updateMatrices( light );

		}

	}

}

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();

export { DirectionalLightShadow };
