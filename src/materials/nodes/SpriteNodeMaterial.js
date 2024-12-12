import NodeMaterial from './NodeMaterial.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialRotation } from '../../nodes/accessors/MaterialNode.js';
import { modelViewMatrix, modelWorldMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionGeometry, positionLocal } from '../../nodes/accessors/Position.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, vec2, vec4 } from '../../nodes/tsl/TSLBase.js';

import { SpriteMaterial } from '../SpriteMaterial.js';
import { reference } from '../../nodes/accessors/ReferenceBaseNode.js';

const _defaultValues = /*@__PURE__*/ new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	static get type() {

		return 'SpriteNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = false;
		this._useSizeAttenuation = true;

		this.positionNode = null;
		this.rotationNode = null;
		this.scaleNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupPositionView( builder ) {

		const { object, camera } = builder;

		const sizeAttenuation = this.sizeAttenuation;

		// < VERTEX STAGE >

		const { rotationNode, scaleNode } = this;

		const mvPosition = modelViewMatrix.mul( positionLocal );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}


		if ( ! sizeAttenuation ) {

			if ( camera.isPerspectiveCamera ) {

				scale = scale.mul( mvPosition.z.negate() );

			} else {

				const orthoScale = float( 2.0 ).div( cameraProjectionMatrix.element( 1 ).element( 1 ) );
				scale = scale.mul( orthoScale.mul( 2 ) );

			}

		}

		let alignedPosition = positionGeometry.xy;

		if ( object.center && object.center.isVector2 === true ) {

			const center = reference( 'center', 'vec2' );

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
