import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, tslFn, nodeObject, float } from '../shadernode/ShaderNode.js';
import { clamp, mix } from '../math/MathNode.js';

class TransitionNode extends TempNode {

	constructor( textureNodeA, textureNodeB, mixTextureNode, mixRatioNode, thresholdNode, useTextureNode ) {

		super();

		// Input textures

		this.textureNodeA = textureNodeA;
		this.textureNodeB = textureNodeB;
		this.mixTextureNode = mixTextureNode;

		// Uniforms

		this.mixRatioNode = mixRatioNode;
		this.thresholdNode = thresholdNode;
		this.useTextureNode = useTextureNode;

	}

	setup() {

		const { textureNodeA, textureNodeB, mixTextureNode, mixRatioNode, thresholdNode, useTextureNode } = this;

		const sampleTexture = ( textureNode ) => {

			const uvNodeTexture = textureNode.uvNode || uv();
			return textureNode.uv( uvNodeTexture );

		};

		const transition = tslFn( () => {

			const texelOne = sampleTexture( textureNodeA );
			const texelTwo = sampleTexture( textureNodeB );

			const transitionTexel = sampleTexture( mixTextureNode );
			const r = mixRatioNode.mul( thresholdNode.mul( 2.0 ).add( 1.0 ) ).sub( thresholdNode );
			const mixf = clamp( transitionTexel.r.sub( r ).mul( float( 1.0 ).div( thresholdNode ) ), 0.0, 1.0 );

			return mix( texelOne, texelTwo, useTextureNode.equal( 1 ).cond( mixf, mixRatioNode ) );

		} );

		const outputNode = transition();

		return outputNode;

	}

}

export const transition = ( nodeA, nodeB, mixTexture, mixRatio, threshold, useTexture ) => nodeObject( new TransitionNode( nodeObject( nodeA ).toTexture(), nodeObject( nodeB ).toTexture(), nodeObject( mixTexture ).toTexture(), nodeObject( mixRatio ), nodeObject( threshold ), nodeObject( useTexture ) ) );

addNodeElement( 'transition', transition );

export default TransitionNode;

