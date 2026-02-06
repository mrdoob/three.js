import { Matrix4 } from '../math/Matrix4.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { Frustum } from '../math/Frustum.js';
import { UnsignedByteType, WebGPUCoordinateSystem } from '../constants.js';

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();

/**
 * Abstract base class for light shadow classes. These classes
 * represent the shadow configuration for different light types.
 *
 * @abstract
 */
class LightShadow {

	/**
	 * Constructs a new light shadow.
	 *
	 * @param {Camera} camera - The light's view of the world.
	 */
	constructor( camera ) {

		/**
		 * The light's view of the world.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The intensity of the shadow. The default is `1`.
		 * Valid values are in the range `[0, 1]`.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.intensity = 1;

		/**
		 * Shadow map bias, how much to add or subtract from the normalized depth
		 * when deciding whether a surface is in shadow.
		 *
		 * The default is `0`. Very tiny adjustments here (in the order of `0.0001`)
		 * may help reduce artifacts in shadows.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.bias = 0;

		/**
		 * A node version of `bias`. Only supported with `WebGPURenderer`.
		 *
		 * If a bias node is defined, `bias` has no effect.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.biasNode = null;

		/**
		 * Defines how much the position used to query the shadow map is offset along
		 * the object normal. The default is `0`. Increasing this value can be used to
		 * reduce shadow acne especially in large scenes where light shines onto
		 * geometry at a shallow angle. The cost is that shadows may appear distorted.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.normalBias = 0;

		/**
		 * Setting this to values greater than 1 will blur the edges of the shadow.
		 * High values will cause unwanted banding effects in the shadows - a greater
		 * map size will allow for a higher value to be used here before these effects
		 * become visible.
		 *
		 * The property has no effect when the shadow map type is `BasicShadowMap`.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.radius = 1;

		/**
		 * The amount of samples to use when blurring a VSM shadow map.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.blurSamples = 8;

		/**
		 * Defines the width and height of the shadow map. Higher values give better quality
		 * shadows at the cost of computation time. Values must be powers of two.
		 *
		 * @type {Vector2}
		 * @default (512,512)
		 */
		this.mapSize = new Vector2( 512, 512 );

		/**
		 * The type of shadow texture. The default is `UnsignedByteType`.
		 *
		 * @type {number}
		 * @default UnsignedByteType
		 */
		this.mapType = UnsignedByteType;

		/**
		 * The depth map generated using the internal camera; a location beyond a
		 * pixel's depth is in shadow. Computed internally during rendering.
		 *
		 * @type {?RenderTarget}
		 * @default null
		 */
		this.map = null;

		/**
		 * The distribution map generated using the internal camera; an occlusion is
		 * calculated based on the distribution of depths. Computed internally during
		 * rendering.
		 *
		 * @type {?RenderTarget}
		 * @default null
		 */
		this.mapPass = null;

		/**
		 * Model to shadow camera space, to compute location and depth in shadow map.
		 * This is computed internally during rendering.
		 *
		 * @type {Matrix4}
		 */
		this.matrix = new Matrix4();

		/**
		 * Enables automatic updates of the light's shadow. If you do not require dynamic
		 * lighting / shadows, you may set this to `false`.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoUpdate = true;

		/**
		 * When set to `true`, shadow maps will be updated in the next `render` call.
		 * If you have set {@link LightShadow#autoUpdate} to `false`, you will need to
		 * set this property to `true` and then make a render call to update the light's shadow.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsUpdate = false;

		this._frustum = new Frustum();
		this._frameExtents = new Vector2( 1, 1 );

		this._viewportCount = 1;

		this._viewports = [

			new Vector4( 0, 0, 1, 1 )

		];

	}

	/**
	 * Used internally by the renderer to get the number of viewports that need
	 * to be rendered for this shadow.
	 *
	 * @return {number} The viewport count.
	 */
	getViewportCount() {

		return this._viewportCount;

	}

	/**
	 * Gets the shadow cameras frustum. Used internally by the renderer to cull objects.
	 *
	 * @return {Frustum} The shadow camera frustum.
	 */
	getFrustum() {

		return this._frustum;

	}

	/**
	 * Update the matrices for the camera and shadow, used internally by the renderer.
	 *
	 * @param {Light} light - The light for which the shadow is being rendered.
	 */
	updateMatrices( light ) {

		const shadowCamera = this.camera;
		const shadowMatrix = this.matrix;

		_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		shadowCamera.position.copy( _lightPositionWorld );

		_lookTarget.setFromMatrixPosition( light.target.matrixWorld );
		shadowCamera.lookAt( _lookTarget );
		shadowCamera.updateMatrixWorld();

		_projScreenMatrix.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
		this._frustum.setFromProjectionMatrix( _projScreenMatrix, shadowCamera.coordinateSystem, shadowCamera.reversedDepth );

		if ( shadowCamera.coordinateSystem === WebGPUCoordinateSystem || shadowCamera.reversedDepth ) {

			shadowMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 1.0, 0.0, // Identity Z (preserving the correct [0, 1] range from the projection matrix)
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

	/**
	 * Returns a viewport definition for the given viewport index.
	 *
	 * @param {number} viewportIndex - The viewport index.
	 * @return {Vector4} The viewport.
	 */
	getViewport( viewportIndex ) {

		return this._viewports[ viewportIndex ];

	}

	/**
	 * Returns the frame extends.
	 *
	 * @return {Vector2} The frame extends.
	 */
	getFrameExtents() {

		return this._frameExtents;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		if ( this.map ) {

			this.map.dispose();

		}

		if ( this.mapPass ) {

			this.mapPass.dispose();

		}

	}

	/**
	 * Copies the values of the given light shadow instance to this instance.
	 *
	 * @param {LightShadow} source - The light shadow to copy.
	 * @return {LightShadow} A reference to this light shadow instance.
	 */
	copy( source ) {

		this.camera = source.camera.clone();

		this.intensity = source.intensity;

		this.bias = source.bias;
		this.radius = source.radius;

		this.autoUpdate = source.autoUpdate;
		this.needsUpdate = source.needsUpdate;
		this.normalBias = source.normalBias;
		this.blurSamples = source.blurSamples;

		this.mapSize.copy( source.mapSize );

		this.biasNode = source.biasNode;

		return this;

	}

	/**
	 * Returns a new light shadow instance with copied values from this instance.
	 *
	 * @return {LightShadow} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Serializes the light shadow into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized light shadow.
	 * @see {@link ObjectLoader#parse}
	 */
	toJSON() {

		const object = {};

		if ( this.intensity !== 1 ) object.intensity = this.intensity;
		if ( this.bias !== 0 ) object.bias = this.bias;
		if ( this.normalBias !== 0 ) object.normalBias = this.normalBias;
		if ( this.radius !== 1 ) object.radius = this.radius;
		if ( this.mapSize.x !== 512 || this.mapSize.y !== 512 ) object.mapSize = this.mapSize.toArray();

		object.camera = this.camera.toJSON( false ).object;
		delete object.camera.matrix;

		return object;

	}

}

export { LightShadow };
