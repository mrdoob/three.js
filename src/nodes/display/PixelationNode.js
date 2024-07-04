import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, tslFn, nodeObject, vec2, vec3 } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { dot, clamp, smoothstep, sign, step, floor } from '../math/MathNode.js';
import { float, If } from '../shadernode/ShaderNode.js';
import { Vector4 } from '../../math/Vector4.js';
import { temp } from '../Nodes.js';
import { property } from '../core/PropertyNode.js';

class PixelationNode extends TempNode {

	constructor( textureNode, depthNode, normalNode, pixelSizeNode, normalEdgeStrength, depthEdgeStrength ) {

		super();

		this.textureNode = textureNode;
		this.depthNode = depthNode;
		this.normalNode = normalNode;

		this.pixelSizeNode = pixelSizeNode;
		this.normalEdgeStrength = normalEdgeStrength;
		this.depthEdgeStrength = depthEdgeStrength;

		this.updateBeforeType = NodeUpdateType.RENDER;

		this._resolution = uniform( new Vector4() );

	}

	updateBefore() {

		const map = this.textureNode.value;
		const width = map.image.width / this.pixelSizeNode.value;
		const height = map.image.height / this.pixelSizeNode.value;

		this._resolution.value.set( width, height, 1 / width, 1 / height );

	}

	setup() {

		const { textureNode, depthNode, normalNode } = this;

		const uvNodeTexture = textureNode.uvNode || uv();
		const uvNodeDepth = depthNode.uvNode || uv();
		const uvNodeNormal = normalNode.uvNode || uv();

		const sampleTexture = () => textureNode.uv( uvNodeTexture );

		const sampleDepth = ( x, y ) => depthNode.uv( uvNodeDepth.add( vec2( x, y ).mul( this._resolution.zw ) ) ).r;

		const sampleNormal = ( x, y ) => normalNode.uv( uvNodeNormal.add( vec2( x, y ).mul( this._resolution.zw ) ) ).rgb.mul( 2.0 ).oneMinus();

		const depthEdgeIndicator = ( depth ) => {

			const diff = property('float', 'diff');
			diff.addAssign( clamp( sampleDepth( 1, 0 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( - 1, 0 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( 0, 1 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( 0, - 1 ).sub( depth ) ) );

			return floor( smoothstep( 0.01, 0.02, diff ).mul( 2 ) ).div( 2 );

		}

		const neighborNormalEdgeIndicator = ( x, y, depth, normal ) => {

			const depthDiff = sampleDepth( x, y ).sub(depth);
			const neighborNormal = sampleNormal( x, y );

			// Edge pixels should yield to faces who's normals are closer to the bias normal.

			const normalEdgeBias = vec3( 1, 1, 1 ); // This should probably be a parameter.
			const normalDiff = dot( normal.sub( neighborNormal ), normalEdgeBias );
			const normalIndicator = clamp( smoothstep( - 0.01, 0.01, normalDiff ), 0.0, 1.0 );

			// Only the shallower pixel should detect the normal edge.
			const depthIndicator = clamp( sign( depthDiff.mul(0.25).add(.0025) ), 0.0, 1.0 );

			return float( 1.0 ).sub( dot( normal, neighborNormal ) ).mul( depthIndicator ).mul( normalIndicator );

		};

		const normalEdgeIndicator = ( depth, normal ) => {

			const indicator = property('float', 'indicator')

			indicator.addAssign( neighborNormalEdgeIndicator( 0, - 1, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 0, 1, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( - 1, 0, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 1, 0, depth, normal ) );

			return step( 0.1, indicator );

		}

		const pixelation = tslFn( () => {

			const texel = sampleTexture();

			const depth = property( 'float', 'depth' );
			const normal = property( 'vec3', 'normal' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ).or( this.normalEdgeStrength.greaterThan( 0.0 ) ), () => {

				depth.assign( sampleDepth( 0, 0 ) );
				normal.assign( sampleNormal( 0, 0 ) );

			})

			const dei = property( 'float', 'dei' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ), () => {
				
				dei.assign( depthEdgeIndicator( depth ) )

			});

			const nei = property( 'float', 'nei' );

			If( this.normalEdgeStrength.greaterThan( 0.0 ), () => {

				nei.assign( normalEdgeIndicator( depth, normal ) );

			});


			const strength = dei.greaterThan( 0 ).cond( float( 1.0 ).sub( dei.mul( this.depthEdgeStrength ) ), nei.mul( this.normalEdgeStrength ).add( 1 ) );

			return texel.mul( strength );

		} );

		const outputNode = pixelation();

		return outputNode;

	}

}

export const pixelation = ( node, depthNode, normalNode, pixelSize, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) => nodeObject( new PixelationNode( nodeObject( node ).toTexture(), nodeObject( depthNode ).toTexture(), nodeObject( normalNode ).toTexture(), nodeObject( pixelSize ), normalEdgeStrength, depthEdgeStrength ) );

addNodeElement( 'pixelation', pixelation );

export default PixelationNode;
