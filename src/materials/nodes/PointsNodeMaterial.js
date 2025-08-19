import SpriteNodeMaterial from './SpriteNodeMaterial.js';
import { viewportSize, screenSize } from '../../nodes/display/ScreenNode.js';
import { positionGeometry, positionLocal, positionView } from '../../nodes/accessors/Position.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { materialPointSize } from '../../nodes/accessors/MaterialNode.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

/**
 * Node material version of {@link PointsMaterial}.
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
		 * Note that WebGPU only supports point primitives with 1 pixel size. Consequently,
		 * this node has no effect when the material is used with {@link Points} and a WebGPU
		 * backend. If an application wants to render points with a size larger than 1 pixel,
		 * the material should be used with {@link Sprite} and instancing.
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

		const { material, camera } = builder;

		const { rotationNode, scaleNode, sizeNode, sizeAttenuation } = this;

		let mvp = super.setupVertex( builder );

		// skip further processing if the material is not a node material

		if ( material.isNodeMaterial !== true ) {

			return mvp;

		}

		// point size

		let pointSize = sizeNode !== null ? vec2( sizeNode ) : materialPointSize;

		const dpr = builder.renderer.getPixelRatio();

		pointSize = pointSize.mul( dpr );

		// size attenuation

		if ( camera.isPerspectiveCamera && sizeAttenuation === true ) {

			// follow WebGLRenderer's implementation, and scale by half the canvas height in logical units
			const scale = float( 0.5 ).mul( screenSize.y ).div( dpr );

			pointSize = pointSize.mul( scale.div( positionView.z.negate() ) );

		}

		// scale

		if ( scaleNode && scaleNode.isNode ) {

			pointSize = pointSize.mul( vec2( scaleNode ) );

		}

		// compute offset

		let offset = positionGeometry.xy;

		// apply rotation

		if ( rotationNode && rotationNode.isNode ) {

			const rotation = float( rotationNode );

			offset = rotate( offset, rotation );

		}

		// account for point size

		offset = offset.mul( pointSize );

		// scale by viewport size

		offset = offset.div( viewportSize.div( 2 ) );

		// compensate for the perspective divide

		offset = offset.mul( mvp.w );

		// add offset

		mvp = mvp.add( vec4( offset, 0, 0 ) );

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
