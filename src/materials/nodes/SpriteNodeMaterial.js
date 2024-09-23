import NodeMaterial from './NodeMaterial.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialRotation } from '../../nodes/accessors/MaterialNode.js';
import { modelViewMatrix, modelWorldMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionLocal } from '../../nodes/accessors/Position.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

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

	setupPosition( { object, camera, context } ) {

		const sizeAttenuation = this.sizeAttenuation;

		// < VERTEX STAGE >

		const { positionNode, rotationNode, scaleNode } = this;

		const vertex = positionLocal;

		let mvPosition = modelViewMatrix.mul( vec3( positionNode || 0 ) );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}


		if ( ! sizeAttenuation && camera.isPerspectiveCamera ) {

			scale = scale.mul( mvPosition.z.negate() );

		}

		let alignedPosition = vertex.xy;

		if ( object.center && object.center.isVector2 === true ) {

			const center = reference( 'center', 'vec2' );

			alignedPosition = alignedPosition.sub( center.sub( 0.5 ) );

		}

		alignedPosition = alignedPosition.mul( scale );

		const rotation = float( rotationNode || materialRotation );

		const rotatedPosition = rotate( alignedPosition, rotation );

		mvPosition = vec4( mvPosition.xy.add( rotatedPosition ), mvPosition.zw );

		const modelViewProjection = cameraProjectionMatrix.mul( mvPosition );

		context.vertex = vertex;

		return modelViewProjection;

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
