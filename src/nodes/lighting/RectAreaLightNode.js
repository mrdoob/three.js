import { registerNode } from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';
import { texture } from '../accessors/TextureNode.js';
import { uniform } from '../core/UniformNode.js';
import { objectViewPosition } from '../accessors/Object3DNode.js';

import { Matrix4 } from '../../math/Matrix4.js';
import { Vector3 } from '../../math/Vector3.js';

const _matrix41 = /*@__PURE__*/ new Matrix4();
const _matrix42 = /*@__PURE__*/ new Matrix4();

let ltcLib = null;

class RectAreaLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.halfHeight = uniform( new Vector3() );
		this.halfWidth = uniform( new Vector3() );

	}

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

	setup( builder ) {

		super.setup( builder );

		let ltc_1, ltc_2;

		if ( builder.isAvailable( 'float32Filterable' ) ) {

			ltc_1 = texture( ltcLib.LTC_FLOAT_1 );
			ltc_2 = texture( ltcLib.LTC_FLOAT_2 );

		} else {

			ltc_1 = texture( ltcLib.LTC_HALF_1 );
			ltc_2 = texture( ltcLib.LTC_HALF_2 );

		}

		const { colorNode, light } = this;
		const lightingModel = builder.context.lightingModel;

		const lightPosition = objectViewPosition( light );
		const reflectedLight = builder.context.reflectedLight;

		lightingModel.directRectArea( {
			lightColor: colorNode,
			lightPosition,
			halfWidth: this.halfWidth,
			halfHeight: this.halfHeight,
			reflectedLight,
			ltc_1,
			ltc_2
		}, builder.stack, builder );

	}

	static setLTC( ltc ) {

		ltcLib = ltc;

	}

}

export default RectAreaLightNode;

RectAreaLightNode.type = /*@__PURE__*/ registerNode( 'RectAreaLight', RectAreaLightNode );
