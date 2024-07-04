import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, tslFn, nodeObject, vec2, vec3 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { dot, clamp, smoothstep, sign, step, floor } from '../math/MathNode.js';
import { float, If } from '../shadernode/ShaderNode.js';

import { Vector2 } from '../../math/Vector2.js';

class PixelationNode extends TempNode {

	constructor( textureNode, pixelSize, normalEdgeStrengthNode, depthEdgeStrengthNode ) {

		super();

		this.textureNode = textureNode;
		this.pixelSize = pixelSize;
		this.normalEdgeStrengthNode = normalEdgeStrengthNode;
		this.depthEdgeStrengthNode = depthEdgeStrengthNode;

		this.updateBeforeType = NodeUpdateType.RENDER;


		this._resolution = uniform( new Vector2() );
		this._renderResolution = uniform( new Vector2() );

	}

	updateBefore() {


	}

	setup() {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.uv( uv );
		const sampleDepthTexture = ( uv ) => textureNode.passNode._depthTextureNode.uv( uv );
		const sampleNormalTexture = ( uv ) => textureNode.passNode._normalTextureNode.uv(uv);

		const getDepth = ( uv, x, y ) => {

			const newUV = uv.add(vec2( x, y ) );
			newUV.mulAssign( this._resolution.zw );

			return sampleDepthTexture(newUV).r

		}

		const getNormal = ( uv, x, y ) => {

			const newUV = uv.add(vec2( x, y ) );
			newUV.mulAssign( this._resolution.zw );

			const temp = sampleNormalTexture(newUV).rgb.mul(2.0);
			return temp.sub(1.0);

		}

		const clampNormal = ( valueNode ) => {

			return clamp( valueNode, 0.0, 1.0)

		}

		const depthEdgeIndicator = ( uv, depth, normalNode ) => {

			const diff = float(0.0);
			diff.addAssign( clampNormal( getDepth(uv, 1, 0).sub(depth) ) );
			diff.addAssign( clampNormal( getDepth(uv, -1, 0).sub(depth) ) );
			diff.addAssign( clampNormal( getDepth(uv, 0, 1).sub(depth) ) );
			diff.addAssign( clampNormal( getDepth(uv, 0, -1).sub(depth) ) );

			return floor( smoothstep( 0.01, 0.02, diff ).mul(2.0) ).div(2.0);

		}

		const neighborNormalEdgeIndicator = ( xNode, yNode, depthNode, normalNode ) => {

			const depthDiff = getDepth( xNode, yNode ).sub( depthNode );
			const neighborNormal = getNormal( xNode, yNode );

			const normalEdgeBias = vec3(1.0, 1.0, 1.0);
			const normalDiff = dot( normalNode.sub( neighborNormal ), normalEdgeBias );
			const normalIndicator = clampNormal( smoothstep( -.01, .01, normalDiff ) );

			// Only the shallower pixel should detect the normal edge.
			const depthIndicator = clampNormal( sign( depthDiff.mul(0.25).add( .0025 ) ) );

			const dotThing = float( 1.0 ).sub( dot( normal, neighborNormal ) );
			return dotThing.mul( depthIndicator ).mul( normalIndicator );

		}

		const normalEdgeIndicator = ( xNode, yNode, depthNode, normalNode ) => {

			const indicator = float(0.0);
			indicator.addAssign( neighborNormalEdgeIndicator( 0, -1, depthNode, normalNode ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 0, 1, depthNode, normalNode ) );
			indicator.addAssign( neighborNormalEdgeIndicator( -1, 0, depthNode, normalNode ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 1, 0, depthNode, normalNode ) );

			return step( 0.1, indicator );

		}

		const pixelate = tslFn( () => {

			const textureColor = sampleTexture(uvNode);

			/*const depth = float( 0.0 );
			const normal = vec3( 0.0 );

			const dei = float( 0.0 );
			If( this.depthEdgeStrengthNode.greaterThan( 0.0 ), () => {
				
				dei.assign( depthEdgeIndicator( depth, normal ) );

			})

			const nei = float(0.0);

			If( this.normalEdgeStrengthNode.greaterThan(0.0), () => {

				nei.assign( normalEdgeIndicator( depth, normal ) );


			})

			const strength = dei.greaterThan( 0.0 ).cond(
				float( 1.0 ).sub( this.depthEdgeStrengthNode.mul( dei ) ),
				float( 1.0 ).add( this.normalEdgeStrengthNode.mul( nei ) )
			) */

			return textureColor;//.mul( strength );


		} );

		const outputNode = pixelate();

		return outputNode;

	}

}

export const pixelate = ( node, pixelSize, normalEdgeStrength, depthEdgeStrength ) => {
	return nodeObject( new PixelationNode( 
		nodeObject( node ).toTexture(), pixelSize, normalEdgeStrength, depthEdgeStrength
	));
};

addNodeElement( 'pixelate', pixelate );

export default PixelationNode;
