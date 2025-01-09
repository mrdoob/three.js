import SpriteNodeMaterial from './SpriteNodeMaterial.js';
import { viewport } from '../../nodes/display/ScreenNode.js';
import { positionGeometry, positionView } from '../../nodes/accessors/Position.js';
import { materialPointSize } from '../../nodes/accessors/MaterialNode.js';
import { float, vec2, vec4 } from '../../nodes/tsl/TSLBase.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

/**
 * Node material version of `PointsMaterial`.
 *
 * @augments NodeMaterial
 */
class PointsNodeMaterial extends SpriteNodeMaterial {

	static get type() {

		return 'PointsNodeMaterial';

	}

	/**
	 * Constructs a new points node material.
	 *
	 * @param {Object?} parameters - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This node property provides an additional way to set the point size.
		 *
		 * @type {Node<vec2>?}
		 * @default null
		 */
		this.sizeNode = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isPointsNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupPositionView( builder ) {

		const currentSizeAttenuation = this.sizeAttenuation;
		const currentScale = this.scaleNode;

		this.sizeAttenuation = false;
		this.scaleNode = float( 0 );

		const positionView = super.setupPositionView( builder );

		this.currentSizeAttenuation = currentSizeAttenuation;
		this.currentScale = currentScale;

		return positionView;

	}

	setupVertex( builder ) {

		const mvp = super.setupVertex( builder );

		// offset in ndc space
		const offset = positionGeometry.xy.toVar();

		let pointSize = this.sizeNode !== null ? vec2( this.sizeNode ) : materialPointSize;

		if ( this.sizeAttenuation === true ) {

			pointSize = pointSize.mul( pointSize.div( positionView.z.negate() ) );

			if ( this.scaleNode !== null ) {

				pointSize = pointSize.mul( vec2( this.scaleNode ) );

			}

		}

		offset.mulAssign( pointSize );

		const aspect = viewport.z.div( viewport.w );

		offset.assign( offset.div( viewport.z ) );
		offset.y.assign( offset.y.mul( aspect ) );

		// back to clip space
		offset.assign( offset.mul( mvp.w ) );

		//clipPos.xy += offset;
		mvp.addAssign( vec4( offset, 0, 0 ) );

		return mvp;

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

export default PointsNodeMaterial;
