import NodeMaterial from './NodeMaterial.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialColor, materialOpacity, materialPointWidth } from '../../nodes/accessors/MaterialNode.js'; // or should this be a property, instead?
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { smoothstep, lengthSq } from '../../nodes/math/MathNode.js';
import { Fn, vec4, float } from '../../nodes/tsl/TSLBase.js';
import { uv } from '../../nodes/accessors/UV.js';
import { viewport } from '../../nodes/display/ScreenNode.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

/**
 * Unlike WebGL, WebGPU can render point primitives only with a size
 * of one pixel. This type node material can be used to mimic the WebGL
 * points rendering by rendering small planes via instancing.
 *
 * This material should be used with {@link InstancedPointsGeometry}.
 *
 * @augments NodeMaterial
 */
class InstancedPointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'InstancedPointsNodeMaterial';

	}

	/**
	 * Constructs a new instanced points node material.
	 *
	 * @param {Object?} parameters - The configuration parameter.
	 */
	constructor( parameters = {} ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedPointsNodeMaterial = true;

		/**
		 * Whether vertex colors should be used or not. If set to `true`,
		 * each point instance can receive a custom color value.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.useColor = parameters.vertexColors;

		/**
		 * The points width in pixels.
		 *
		 * @type {Number}
		 * @default 1
		 */
		this.pointWidth = 1;

		/**
		 * This node can be used to define the colors for each instance.
		 *
		 * @type {Node<vec3>?}
		 * @default null
		 */
		this.pointColorNode = null;

		/**
		 * This node can be used to define the width for each point instance.
		 *
		 * @type {Node<float>?}
		 * @default null
		 */
		this.pointWidthNode = null;

		this._useAlphaToCoverage = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Setups the vertex and fragment stage of this node material.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		const { renderer } = builder;

		const useAlphaToCoverage = this._useAlphaToCoverage;
		const useColor = this.useColor;

		this.vertexNode = Fn( () => {

			const instancePosition = attribute( 'instancePosition' ).xyz;

			// camera space
			const mvPos = vec4( modelViewMatrix.mul( vec4( instancePosition, 1.0 ) ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPos );

			// offset in ndc space
			const offset = positionGeometry.xy.toVar();

			offset.mulAssign( this.pointWidthNode ? this.pointWidthNode : materialPointWidth );

			offset.assign( offset.div( viewport.z ) );
			offset.y.assign( offset.y.mul( aspect ) );

			// back to clip space
			offset.assign( offset.mul( clipPos.w ) );

			//clipPos.xy += offset;
			clipPos.addAssign( vec4( offset, 0, 0 ) );

			return clipPos;

		} )();

		this.fragmentNode = Fn( () => {

			const alpha = float( 1 ).toVar();

			const len2 = lengthSq( uv().mul( 2 ).sub( 1 ) );

			if ( useAlphaToCoverage && renderer.samples > 1 ) {

				const dlen = float( len2.fwidth() ).toVar();

				alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

			} else {

				len2.greaterThan( 1.0 ).discard();

			}

			let pointColorNode;

			if ( this.pointColorNode ) {

				pointColorNode = this.pointColorNode;

			} else {

				if ( useColor ) {

					const instanceColor = attribute( 'instanceColor' );

					pointColorNode = instanceColor.mul( materialColor );

				} else {

					pointColorNode = materialColor;

				}

			}

			alpha.mulAssign( materialOpacity );

			return vec4( pointColorNode, alpha );

		} )();

		super.setup( builder );

	}

	/**
	 * Whether alpha to coverage should be used or not.
	 *
	 * @type {Boolean}
	 * @default true
	 */
	get alphaToCoverage() {

		return this._useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this._useAlphaToCoverage !== value ) {

			this._useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

}

export default InstancedPointsNodeMaterial;
