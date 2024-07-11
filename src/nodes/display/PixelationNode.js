import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, tslFn, nodeObject, vec2, vec3, float, If } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { dot, clamp, smoothstep, sign, step, floor } from '../math/MathNode.js';
import { Vector4 } from '../../math/Vector4.js';
import { property } from '../core/PropertyNode.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { passTexture } from './PassNode.js';

const createEdgesQuad = new QuadMesh();
const lowerResolutionQuad = new QuadMesh();

class PixelationNode extends TempNode {

	constructor( textureNode, depthNode, normalNode, pixelSizeNode, normalEdgeStrength, depthEdgeStrength ) {

		super();

		// Input textures

		this.textureNode = textureNode;
		this.depthNode = depthNode;
		this.normalNode = normalNode;

		// Input uniforms

		this.pixelSizeNode = pixelSizeNode;
		this.normalEdgeStrength = normalEdgeStrength;
		this.depthEdgeStrength = depthEdgeStrength;

		// Private uniforms

		this._resolution = uniform( new Vector4() );

		// Intermediary render targets

		this._createEdgesRT = new RenderTarget();
		this._createEdgesRT.texture.name = 'PixelationNode.renderEdges';
		this._lowerResolutionRT = new RenderTarget();
		this._lowerResolutionRT.texture.name = 'PixelationNode.lowerResolution';

		// Output textures

		this._outputTextureNode = passTexture( this, this._lowerResolutionRT.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	setSize( width, height ) {

		this._createEdgesRT.setSize( width, height );
		this._lowerResolutionRT.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const textureNode = this.textureNode;
		const map = textureNode.value;

		// Set resolution uniform

		const adjustedWidth = map.image.width / this.pixelSizeNode.value;
		const adjustedHeight = map.image.height / this.pixelSizeNode.value;
		this._resolution.value.set( adjustedWidth, adjustedHeight, 1 / adjustedWidth, 1 / adjustedHeight );

		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();
		const currentTexture = textureNode.value;

		createEdgesQuad.material = this._createEdgesMaterial;
		lowerResolutionQuad.material = this._lowerResolutionMaterial;

		// Set size of render edges to match size of initial render target.

		this.setSize( map.image.width, map.image.height );

		const textureType = map.type;
		this._createEdgesRT.texture.type = textureType;
		this._lowerResolutionRT.texture.type = textureType;

		// Apply create edges post-process step to createEdgesQuad.

		renderer.setMRT( null );
		renderer.setRenderTarget( this._createEdgesRT );
		createEdgesQuad.render( renderer );

		// Set input of next pass to output of last step.
		textureNode.value = this._createEdgesRT.texture;

		// Apply lower resolution post-process step to lowerResolutionQuad.

		renderer.setRenderTarget( this._lowerResolutionRT );
		lowerResolutionQuad.render( renderer );

		// Reset render target and MRT back to initial values.

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );

		// Set textureNode back to intial input texture for next pass.

		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const { textureNode, depthNode, normalNode } = this;

		const uvNodeTexture = textureNode.uvNode || uv();
		const uvNodeDepth = depthNode.uvNode || uv();
		const uvNodeNormal = normalNode.uvNode || uv();

		const pixelizeUV = ( coord ) => floor( coord.mul( this._resolution.xy ) ).div( this._resolution.xy );

		const sampleTexture = () => textureNode.uv( uvNodeTexture );

		const samplePixel = () => textureNode.uv( pixelizeUV( uvNodeTexture ) );

		const sampleDepth = ( x, y ) => depthNode.uv( uvNodeDepth.add( vec2( x, y ).mul( this._resolution.zw ) ) ).r;

		const sampleNormal = ( x, y ) => normalNode.uv( uvNodeNormal.add( vec2( x, y ).mul( this._resolution.zw ) ) ).rgb.mul( 2.0 ).oneMinus();

		const depthEdgeIndicator = ( depth ) => {

			const diff = property( 'float', 'diff' );
			diff.addAssign( clamp( sampleDepth( 1, 0 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( - 1, 0 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( 0, 1 ).sub( depth ) ) );
			diff.addAssign( clamp( sampleDepth( 0, - 1 ).sub( depth ) ) );

			return floor( smoothstep( 0.01, 0.02, diff ).mul( 2 ) ).div( 2 );

		};

		const neighborNormalEdgeIndicator = ( x, y, depth, normal ) => {

			const depthDiff = sampleDepth( x, y ).sub( depth );
			const neighborNormal = sampleNormal( x, y );

			// Edge pixels should yield to faces who's normals are closer to the bias normal.

			const normalEdgeBias = vec3( 1, 1, 1 ); // This should probably be a parameter.
			const normalDiff = dot( normal.sub( neighborNormal ), normalEdgeBias );
			const normalIndicator = clamp( smoothstep( - 0.01, 0.01, normalDiff ), 0.0, 1.0 );

			// Only the shallower pixel should detect the normal edge.

			const depthIndicator = clamp( sign( depthDiff.mul( .25 ).add( .0025 ) ), 0.0, 1.0 );

			return float( 1.0 ).sub( dot( normal, neighborNormal ) ).mul( depthIndicator ).mul( normalIndicator );

		};

		const normalEdgeIndicator = ( depth, normal ) => {

			const indicator = property( 'float', 'indicator' );

			indicator.addAssign( neighborNormalEdgeIndicator( 0, - 1, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 0, 1, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( - 1, 0, depth, normal ) );
			indicator.addAssign( neighborNormalEdgeIndicator( 1, 0, depth, normal ) );

			return step( 0.1, indicator );

		};

		const createEdges = tslFn( () => {

			const texel = sampleTexture();

			const depth = property( 'float', 'depth' );
			const normal = property( 'vec3', 'normal' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ).or( this.normalEdgeStrength.greaterThan( 0.0 ) ), () => {

				depth.assign( sampleDepth( 0, 0 ) );
				normal.assign( sampleNormal( 0, 0 ) );

			} );

			const dei = property( 'float', 'dei' );

			If( this.depthEdgeStrength.greaterThan( 0.0 ), () => {

				dei.assign( depthEdgeIndicator( depth ) );

			} );

			const nei = property( 'float', 'nei' );

			If( this.normalEdgeStrength.greaterThan( 0.0 ), () => {

				nei.assign( normalEdgeIndicator( depth, normal ) );

			} );

			const strength = dei.greaterThan( 0 ).cond( float( 1.0 ).sub( dei.mul( this.depthEdgeStrength ) ), nei.mul( this.normalEdgeStrength ).add( 1 ) );

			const color = texel.mul( strength );

			return color;

		} );

		const lowerResolution = tslFn( () => {

			return samplePixel();

		} );

		const createEdgesMaterial = this._createEdgesMaterial || ( this._createEdgesMaterial = builder.createNodeMaterial() );
		createEdgesMaterial.fragmentNode = createEdges().context( builder.getSharedContext() );
		createEdgesMaterial.needsUpdate = true;

		const lowerResolutionMaterial = this._lowerResolutionMaterial || ( this._lowerResolutionMaterial = builder.createNodeMaterial() );
		lowerResolutionMaterial.fragmentNode = lowerResolution().context( builder.getSharedContext() );

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		return this._outputTextureNode;

	}

}

export const pixelation = ( node, depthNode, normalNode, pixelSize = 14, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) => nodeObject( new PixelationNode( nodeObject( node ).toTexture(), nodeObject( depthNode ).toTexture(), nodeObject( normalNode ).toTexture(), nodeObject( pixelSize ), nodeObject( normalEdgeStrength ), nodeObject( depthEdgeStrength ) ) );

addNodeElement( 'pixelation', pixelation );

export default PixelationNode;
