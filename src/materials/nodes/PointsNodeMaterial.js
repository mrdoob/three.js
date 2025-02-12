import SpriteNodeMaterial from './SpriteNodeMaterial.js';
import { viewport } from '../../nodes/display/ScreenNode.js';
import { positionGeometry, positionLocal, positionView } from '../../nodes/accessors/Position.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { materialPointSize } from '../../nodes/accessors/MaterialNode.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

/**
 * Node material version of `PointsMaterial`.
 *
 * @augments SpriteNodeMaterial
 */
class PointsNodeMaterial extends SpriteNodeMaterial {

	static get type() {

		return 'PointsNodeMaterial';

	}

	/**
	 * Constructs a new points node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This node property provides an additional way to set the point size.
		 *
		 * @type {?Node<vec2>}
		 * @default null
		 */
		this.sizeNode = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPointsNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupPositionView() {

		const { positionNode } = this;

		return modelViewMatrix.mul( vec3( positionNode || positionLocal ) ).xyz;

	}

	setupVertex( builder ) {

		const mvp = super.setupVertex( builder );

		// skip further processing if the material is not a node material

		if ( builder.material.isNodeMaterial !== true ) {

			return mvp;

		}

		// ndc space

		const { rotationNode, scaleNode, sizeNode } = this;

		const alignedPosition = positionGeometry.xy.toVar();
		const aspect = viewport.z.div( viewport.w );

		// rotation

		if ( rotationNode && rotationNode.isNode ) {

			const rotation = float( rotationNode );

			alignedPosition.assign( rotate( alignedPosition, rotation ) );

		}

		// point size

		let pointSize = sizeNode !== null ? vec2( sizeNode ) : materialPointSize;

		if ( this.sizeAttenuation === true ) {

			pointSize = pointSize.mul( pointSize.div( positionView.z.negate() ) );

		}

		// scale

		if ( scaleNode && scaleNode.isNode ) {

			pointSize = pointSize.mul( vec2( scaleNode ) );

		}

		alignedPosition.mulAssign( pointSize.mul( 2 ) );

		alignedPosition.assign( alignedPosition.div( viewport.z ) );
		alignedPosition.y.assign( alignedPosition.y.mul( aspect ) );

		// back to clip space
		alignedPosition.assign( alignedPosition.mul( mvp.w ) );

		//clipPos.xy += offset;
		mvp.addAssign( vec4( alignedPosition, 0, 0 ) );

		return mvp;

	}

	/**
	 * Whether alpha to coverage should be used or not.
	 *
	 * @type {boolean}
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
