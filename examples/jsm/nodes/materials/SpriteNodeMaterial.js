import NodeMaterial from './NodeMaterial.js';
import { SpriteMaterial } from 'three';
import {
	vec2, vec3, vec4,
	uniform, mul,
	positionLocal, cos, sin,
	modelViewMatrix, cameraProjectionMatrix, modelWorldMatrix, materialRotation
} from '../shadernode/ShaderNodeElements.js';

const defaultValues = new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.colorNode = null;
		this.opacityNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.positionNode = null;
		this.rotationNode = null;
		this.scaleNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructPosition( { object, context } ) {

		// < VERTEX STAGE >

		const { positionNode, rotationNode, scaleNode } = this;

		const vertex = positionLocal;

		let mvPosition = mul( modelViewMatrix, positionNode ? vec4( positionNode.xyz, 1 ) : vec4( 0, 0, 0, 1 ) );

		let scale = vec2(
			vec3( modelWorldMatrix[ 0 ].x, modelWorldMatrix[ 0 ].y, modelWorldMatrix[ 0 ].z ).length(),
			vec3( modelWorldMatrix[ 1 ].x, modelWorldMatrix[ 1 ].y, modelWorldMatrix[ 1 ].z ).length()
		);

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}

		let alignedPosition = vertex.xy;

		if ( object.center && object.center.isVector2 === true ) {

			alignedPosition = alignedPosition.sub( uniform( object.center ).sub( vec2( 0.5 ) ) );

		}

		alignedPosition = mul( alignedPosition, scale );

		const rotation = rotationNode || materialRotation;

		const rotatedPosition = vec2(
			cos( rotation ).mul( alignedPosition.x ).sub( sin( rotation ).mul( alignedPosition.y ) ),
			sin( rotation ).mul( alignedPosition.x ).add( cos( rotation ).mul( alignedPosition.y ) )
		);

		mvPosition = vec4( mvPosition.xy.add( rotatedPosition.xy ), mvPosition.z, mvPosition.w );

		const modelViewProjection = cameraProjectionMatrix.mul( mvPosition );

		context.vertex = vertex;

		return modelViewProjection;

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.lightNode = source.lightNode;

		this.positionNode = source.positionNode;
		this.rotationNode = source.rotationNode;
		this.scaleNode = source.scaleNode;

		return super.copy( source );

	}

}

export default SpriteNodeMaterial;
