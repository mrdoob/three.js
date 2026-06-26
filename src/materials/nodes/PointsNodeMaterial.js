import SpriteNodeMaterial from './SpriteNodeMaterial.js';
import { viewportSize, screenDPR } from '../../nodes/display/ScreenNode.js';
import { positionGeometry, positionLocal, positionView } from '../../nodes/accessors/Position.js';
import { modelViewMatrix } from '../../nodes/accessors/ModelNode.js';
import { materialPointSize } from '../../nodes/accessors/MaterialNode.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, uniform, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

import { PointsMaterial } from '../PointsMaterial.js';
import { Vector2 } from '../../math/Vector2.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();
const _size = /*@__PURE__*/ new Vector2();

/**
 * Node material version of {@link PointsMaterial}.
 *
 * This material can be used in two ways:
 *
 * - By rendering point primitives with {@link Points}. Since WebGPU only supports point primitives
 * with a pixel size of `1`, it's not possible to define a size.
 *
 * ```js
 * const pointCloud = new THREE.Points( geometry, new THREE.PointsNodeMaterial() );
 * ```
 *
 * - By rendering point primitives with {@link Sprites}. In this case, size is honored,
 * see {@link PointsNodeMaterial#sizeNode}.
 *
 * ```js
 * const instancedPoints = new THREE.Sprite( new THREE.PointsNodeMaterial( { positionNode: instancedBufferAttribute( positionAttribute ) } ) );
 * ```
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

	setupVertexSprite( builder ) {

		const { material, camera } = builder;

		const { rotationNode, scaleNode, sizeNode, sizeAttenuation } = this;

		let mvp = super.setupVertex( builder );

		// skip further processing if the material is not a node material

		if ( material.isNodeMaterial !== true ) {

			return mvp;

		}

		// point size

		let pointSize = sizeNode !== null ? vec2( sizeNode ) : materialPointSize;

		pointSize = pointSize.mul( screenDPR );

		// size attenuation

		if ( camera.isPerspectiveCamera && sizeAttenuation === true ) {

			// follow WebGLRenderer's implementation, and scale by half the canvas height in logical units

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

	setupVertex( builder ) {

		if ( builder.object.isPoints ) {

			return super.setupVertex( builder );


		} else {

			return this.setupVertexSprite( builder );

		}

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

const scale = /*@__PURE__*/ uniform( 1 ).onFrameUpdate( function ( { renderer } ) {

	const size = renderer.getSize( _size ); // logical units

	this.value = 0.5 * size.y;

} );

export default PointsNodeMaterial;
