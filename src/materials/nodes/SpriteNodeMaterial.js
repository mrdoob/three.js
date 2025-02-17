import NodeMaterial from './NodeMaterial.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialRotation } from '../../nodes/accessors/MaterialNode.js';
import { modelViewMatrix, modelWorldMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry } from '../../nodes/accessors/Position.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

import { SpriteMaterial } from '../SpriteMaterial.js';
import { reference } from '../../nodes/accessors/ReferenceBaseNode.js';

const _defaultValues = /*@__PURE__*/ new SpriteMaterial();

/**
 * Node material version of `SpriteMaterial`.
 *
 * @augments NodeMaterial
 */
class SpriteNodeMaterial extends NodeMaterial {

	static get type() {

		return 'SpriteNodeMaterial';

	}

	/**
	 * Constructs a new sprite node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSpriteNodeMaterial = true;

		this._useSizeAttenuation = true;

		/**
		 * This property makes it possible to define the position of the sprite with a
		 * node. That can be useful when the material is used with instanced rendering
		 * and node data are defined with an instanced attribute node:
		 * ```js
		 * const positionAttribute = new InstancedBufferAttribute( new Float32Array( positions ), 3 );
		 * material.positionNode = instancedBufferAttribute( positionAttribute );
		 * ```
		 * Another possibility is to compute the instanced data with a compute shader:
		 * ```js
		 * const positionBuffer = instancedArray( particleCount, 'vec3' );
		 * particleMaterial.positionNode = positionBuffer.toAttribute();
		 * ```
		 *
		 * @type {?Node<vec2>}
		 * @default null
		 */
		this.positionNode = null;

		/**
		 * The rotation of sprite materials is by default inferred from the `rotation`,
		 * property. This node property allows to overwrite the default and define
		 * the rotation with a node instead.
		 *
		 * If you don't want to overwrite the rotation but modify the existing
		 * value instead, use {@link materialRotation}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.rotationNode = null;

		/**
		 * This node property provides an additional way to scale sprites next to
		 * `Object3D.scale`. The scale transformation based in `Object3D.scale`
		 * is multiplied with the scale value of this node in the vertex shader.
		 *
		 * @type {?Node<vec2>}
		 * @default null
		 */
		this.scaleNode = null;

		/**
		 * In Sprites, the transparent property is enabled by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.transparent = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Setups the position node in view space. This method implements
	 * the sprite specific vertex shader.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The position in view space.
	 */
	setupPositionView( builder ) {

		const { object, camera } = builder;

		const sizeAttenuation = this.sizeAttenuation;

		const { positionNode, rotationNode, scaleNode } = this;

		const mvPosition = modelViewMatrix.mul( vec3( positionNode || 0 ) );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( vec2( scaleNode ) );

		}

		if ( sizeAttenuation === false ) {

			if ( camera.isPerspectiveCamera ) {

				scale = scale.mul( mvPosition.z.negate() );

			} else {

				const orthoScale = float( 2.0 ).div( cameraProjectionMatrix.element( 1 ).element( 1 ) );
				scale = scale.mul( orthoScale.mul( 2 ) );

			}

		}

		let alignedPosition = positionGeometry.xy;

		if ( object.center && object.center.isVector2 === true ) {

			const center = reference( 'center', 'vec2', object );

			alignedPosition = alignedPosition.sub( center.sub( 0.5 ) );

		}

		alignedPosition = alignedPosition.mul( scale );

		const rotation = float( rotationNode || materialRotation );

		const rotatedPosition = rotate( alignedPosition, rotation );

		return vec4( mvPosition.xy.add( rotatedPosition ), mvPosition.zw );

	}

	copy( source ) {

		this.positionNode = source.positionNode;
		this.rotationNode = source.rotationNode;
		this.scaleNode = source.scaleNode;

		return super.copy( source );

	}

	/**
	 * Whether to use size attenuation or not.
	 *
	 * @type {boolean}
	 * @default true
	 */
	get sizeAttenuation() {

		return this._useSizeAttenuation;

	}

	set sizeAttenuation( value ) {

		if ( this._useSizeAttenuation !== value ) {

			this._useSizeAttenuation = value;
			this.needsUpdate = true;

		}

	}

}

export default SpriteNodeMaterial;
