import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { uniform } from '../core/UniformNode.js';
import { cameraProjectionMatrix } from '../accessors/CameraNode.js';
import { materialRotation } from '../accessors/MaterialNode.js';
import { modelViewMatrix, modelWorldMatrix } from '../accessors/ModelNode.js';
import { positionLocal } from '../accessors/PositionNode.js';
import { float, vec2, vec3, vec4 } from '../shadernode/ShaderNode.js';

import { SpriteMaterial } from 'three';

const defaultValues = new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.positionNode = null;
		this.rotationNode = null;
		this.scaleNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupPosition( { object, context } ) {

		// < VERTEX STAGE >

		const { positionNode, rotationNode, scaleNode } = this;

		const vertex = positionLocal;

		let mvPosition = modelViewMatrix.mul( vec3( positionNode || 0 ) );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}

		let alignedPosition = vertex.xy;

		if ( object.center && object.center.isVector2 === true ) {

			alignedPosition = alignedPosition.sub( uniform( object.center ).sub( 0.5 ) );

		}

		alignedPosition = alignedPosition.mul( scale );

		const rotation = float( rotationNode || materialRotation );

		const cosAngle = rotation.cos();
		const sinAngle = rotation.sin();

		const rotatedPosition = vec2( // @TODO: Maybe we can create mat2 and write something like rotationMatrix.mul( alignedPosition )?
			vec2( cosAngle, sinAngle.negate() ).dot( alignedPosition ),
			vec2( sinAngle, cosAngle ).dot( alignedPosition )
		);

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

}

export default SpriteNodeMaterial;

addNodeMaterial( 'SpriteNodeMaterial', SpriteNodeMaterial );
