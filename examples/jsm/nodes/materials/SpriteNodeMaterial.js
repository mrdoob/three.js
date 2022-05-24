import NodeMaterial from './NodeMaterial.js';
import { SpriteMaterial } from 'three';
import {
	vec2, vec3, vec4,
	assign, add, mul, sub,
	positionLocal, bypass, length, cos, sin,
	modelViewMatrix, cameraProjectionMatrix, modelWorldMatrix, materialRotation
} from '../shadernode/ShaderNodeElements.js';

const defaultValues = new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = true;

		this.colorNode = null;
		this.opacityNode = null;

		this.rotationNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	generatePosition( builder ) {

		// < VERTEX STAGE >

		let vertex = positionLocal;

		if ( this.positionNode !== null ) {

			vertex = bypass( vertex, assign( positionLocal, this.positionNode ) );

		}

		let mvPosition = mul( modelViewMatrix, vec4( 0, 0, 0, 1 ) );

		const scale = vec2(
			length( vec3( modelWorldMatrix[ 0 ].x, modelWorldMatrix[ 0 ].y, modelWorldMatrix[ 0 ].z ) ),
			length( vec3( modelWorldMatrix[ 1 ].x, modelWorldMatrix[ 1 ].y, modelWorldMatrix[ 1 ].z ) )
		);

		const alignedPosition = mul( positionLocal.xy, scale );
		const rotation = this.rotationNode || materialRotation;

		let rotatedPosition = vec2(
			sub( mul( cos( rotation ), alignedPosition.x ), mul( sin( rotation ), alignedPosition.y ) ),
			add( mul( sin( rotation ), alignedPosition.x ), mul( cos( rotation ), alignedPosition.y ) )
		);

		mvPosition = vec4( add( mvPosition.xy, rotatedPosition.xy ), mvPosition.z, mvPosition.w );

		const modelViewProjection = mul( cameraProjectionMatrix, mvPosition );

		builder.context.vertex = vertex;

		builder.addFlow( 'vertex', modelViewProjection );

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.rotationNode = source.rotationNode;

		this.alphaTestNode = source.alphaTestNode;

		this.lightNode = source.lightNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

export default SpriteNodeMaterial;
