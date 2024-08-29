import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UV.js';
import { Fn, nodeObject, float, int, vec4, If } from '../tsl/TSLBase.js';
import { clamp, mix } from '../math/MathNode.js';
import { sub } from '../math/OperatorNode.js';
import { convertToTexture } from '../utils/RTTNode.js';

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

		const transition = Fn( () => {

			const texelOne = sampleTexture( textureNodeA );
			const texelTwo = sampleTexture( textureNodeB );

			const color = vec4().toVar();

			If( useTextureNode.equal( int( 1 ) ), () => {

				const transitionTexel = sampleTexture( mixTextureNode );
				const r = mixRatioNode.mul( thresholdNode.mul( 2.0 ).add( 1.0 ) ).sub( thresholdNode );
				const mixf = clamp( sub( transitionTexel.r, r ).mul( float( 1.0 ).div( thresholdNode ) ), 0.0, 1.0 );

				color.assign( mix( texelOne, texelTwo, mixf ) );

			} ).Else( () => {

				color.assign( mix( texelTwo, texelOne, mixRatioNode ) );

			} );

			return color;

		} );

		const outputNode = transition();

		return outputNode;

	}

}

export default TransitionNode;

TransitionNode.type = /*@__PURE__*/ registerNode( 'Transition', TransitionNode );

export const transition = ( nodeA, nodeB, mixTexture, mixRatio = 0.0, threshold = 0.1, useTexture = 0 ) => nodeObject( new TransitionNode( convertToTexture( nodeA ), convertToTexture( nodeB ), convertToTexture( mixTexture ), nodeObject( mixRatio ), nodeObject( threshold ), nodeObject( useTexture ) ) );
