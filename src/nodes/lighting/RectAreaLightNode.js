import AnalyticLightNode from './AnalyticLightNode.js';
import { texture } from '../accessors/TextureNode.js';
import { uniform } from '../core/UniformNode.js';
import { lightViewPosition } from '../accessors/Lights.js';
import { renderGroup } from '../core/UniformGroupNode.js';

import { Matrix4 } from '../../math/Matrix4.js';
import { Vector3 } from '../../math/Vector3.js';
import { NodeUpdateType } from '../core/constants.js';

const _matrix41 = /*@__PURE__*/ new Matrix4();
const _matrix42 = /*@__PURE__*/ new Matrix4();

let _ltcLib = null;

/**
 * Module for representing rect area lights as nodes.
 *
 * @augments AnalyticLightNode
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

	setupDirectRectArea( builder ) {

		let ltc_1, ltc_2;

		if ( builder.isAvailable( 'float32Filterable' ) ) {

			ltc_1 = texture( _ltcLib.LTC_FLOAT_1 );
			ltc_2 = texture( _ltcLib.LTC_FLOAT_2 );

		} else {

			ltc_1 = texture( _ltcLib.LTC_HALF_1 );
			ltc_2 = texture( _ltcLib.LTC_HALF_2 );

		}

		const { colorNode, light } = this;

		const lightPosition = lightViewPosition( light );

		return {
			lightColor: colorNode,
			lightPosition,
			halfWidth: this.halfWidth,
			halfHeight: this.halfHeight,
			ltc_1,
			ltc_2
		};

	}

	/**
	 * Used to configure the internal BRDF approximation texture data.
	 *
	 * @param {RectAreaLightTexturesLib} ltc - The BRDF approximation texture data.
	 */
	static setLTC( ltc ) {

		_ltcLib = ltc;

	}

}

export default RectAreaLightNode;
