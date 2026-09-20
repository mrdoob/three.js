import { Matrix4, Vector3 } from 'three';
import { AnalyticLightNode, NodeUpdateType } from 'three/webgpu';
import { lightViewPosition, renderGroup, texture, uniform } from 'three/tsl';
import { LTC_Sample, LTC_EvaluateSpecular } from '../tsl/lighting/RectAreaLightLTC.js';

const _matrix41 = /*@__PURE__*/ new Matrix4();
const _matrix42 = /*@__PURE__*/ new Matrix4();

/**
 * Module for representing rect area lights as nodes. Register it with the
 * renderer's node library to use {@link RectAreaLight} with `WebGPURenderer`:
 * ```js
 * renderer.library.addLight( RectAreaLightNode, RectAreaLight );
 * ```
 *
 * @augments AnalyticLightNode
 * @three_import import { RectAreaLightNode } from 'three/addons/lights/RectAreaLightNode.js';
 */
class RectAreaLightNode extends AnalyticLightNode {

	static get type() {

		return 'RectAreaLightNode';

	}

	/**
	 * Constructs a new rect area light node.
	 *
	 * @param {?RectAreaLight} [light=null] - The rect area light source.
	 */
	constructor( light = null ) {

		super( light );

		/**
		 * Uniform node representing the half height of the are light.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.halfHeight = uniform( new Vector3() ).setGroup( renderGroup );

		/**
		 * Uniform node representing the half width of the are light.
		 *
		 * @type {UniformNode<vec3>}
		 */
		this.halfWidth = uniform( new Vector3() ).setGroup( renderGroup );

		/**
		 * The `updateType` is set to `NodeUpdateType.RENDER` since the light
		 * relies on `viewMatrix` which might vary per render call.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateType = NodeUpdateType.RENDER;

	}

	/**
	 * Overwritten to updated rect area light specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		super.update( frame );

		const { light } = this;

		const viewMatrix = frame.camera.matrixWorldInverse;

		_matrix42.identity();
		_matrix41.copy( light.matrixWorld );
		_matrix41.premultiply( viewMatrix );
		_matrix42.extractRotation( _matrix41 );

		this.halfWidth.value.set( light.width * 0.5, 0.0, 0.0 );
		this.halfHeight.value.set( 0.0, light.height * 0.5, 0.0 );

		this.halfWidth.value.applyMatrix4( _matrix42 );
		this.halfHeight.value.applyMatrix4( _matrix42 );

	}

	setupDirectRectArea( /*builder*/ ) {

		const { colorNode, light } = this;
		const { ltc1, ltc2 } = light.getLTCTextures();
		const matrixTexture = texture( ltc1 );
		const amplitudeTexture = texture( ltc2 );

		const lightPosition = lightViewPosition( light );

		return {
			lightColor: colorNode,
			lightPosition,
			halfWidth: this.halfWidth,
			halfHeight: this.halfHeight,
			ltc: {
				sample: ( N, V, roughness ) => LTC_Sample( matrixTexture, amplitudeTexture, N, V, roughness ),
				evaluate: LTC_EvaluateSpecular
			}
		};

	}

}

export { RectAreaLightNode };
