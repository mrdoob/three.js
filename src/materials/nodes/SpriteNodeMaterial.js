import NodeMaterial from './NodeMaterial.js';
import { uniform } from '../../nodes/core/UniformNode.js';
import { cameraProjectionMatrix } from '../../nodes/accessors/Camera.js';
import { materialRotation } from '../../nodes/accessors/MaterialNode.js';
import { modelViewMatrix, modelWorldMatrix } from '../../nodes/accessors/ModelNode.js';
import { positionLocal } from '../../nodes/accessors/Position.js';
import { rotate } from '../../nodes/utils/RotateNode.js';
import { float, vec2, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

import { SpriteMaterial } from '../SpriteMaterial.js';

const _defaultValues = /*@__PURE__*/ new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	static get type() {

		return 'SpriteNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = false;

		this.sizeAttenuation = true;
		this.useSizeAttenuation = true;

		this.positionNode = null;
		this.rotationNode = null;
		this.scaleNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupPosition( { object, context } ) {

		// const useSizeAttenuation = this.sizeAttenuation;

		// < VERTEX STAGE >

		const { positionNode, rotationNode, scaleNode } = this;

		const vertex = positionLocal;

		let mvPosition = modelViewMatrix.mul( vec3( positionNode || 0 ) );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}


		// if ( ! useSizeAttenuation ) {

		// 	const perspective = cameraProjectionMatrix.element( 2 ).element( 3 ).equal( - 1.0 );

		// 	If( perspective, () => {

		// 		scale.assign( scale.mul( mvPosition.z.negate() ) );

		// 	} );

		// }

		const alignedPosition = vertex.xy.toVar();

		if ( object.center && object.center.isVector2 === true ) {

			alignedPosition.assign( alignedPosition.sub( uniform( object.center ).sub( 0.5 ) ) );

		}

		alignedPosition.assign( alignedPosition.mul( scale ) );

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

	// get sizeAttenuation() {

	// 	return this.useSizeAttenuation;

	// }

	// set sizeAttenuation( value ) {

	// 	if ( this.useSizeAttenuation !== value ) {

	// 		this.useSizeAttenuation = value;
	// 		this.needsUpdate = true;

	// 	}

	// }

}

export default SpriteNodeMaterial;
