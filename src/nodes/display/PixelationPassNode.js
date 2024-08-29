import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UV.js';
import { Fn, nodeObject, vec2, vec3, float, If } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { dot, clamp, smoothstep, sign, step, floor } from '../math/MathNode.js';
import { Vector4 } from '../../math/Vector4.js';
import { output, property } from '../core/PropertyNode.js';
import PassNode from './PassNode.js';
import { mrt } from '../core/MRTNode.js';
import { normalView } from '../accessors/Normal.js';
import { convertToTexture } from '../utils/RTTNode.js';

import { NearestFilter } from '../../constants.js';

class PixelationNode extends TempNode {

	constructor( textureNode, depthNode, normalNode, pixelSize, normalEdgeStrength, depthEdgeStrength ) {

		super();

		// Input textures

		this.textureNode = textureNode;
		this.depthNode = depthNode;
		this.normalNode = normalNode;

		// Input uniforms

		this.pixelSize = pixelSize;
		this.normalEdgeStrength = normalEdgeStrength;
		this.depthEdgeStrength = depthEdgeStrength;

		// Private uniforms

		this._resolution = uniform( new Vector4() );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore() {

		const map = this.textureNode.value;

		const width = map.image.width;
		const height = map.image.height;

		this._resolution.value.set( width, height, 1 / width, 1 / height );

	}

	setup() {

		const { textureNode, depthNode, normalNode } = this;

		const uvNodeTexture = textureNode.uvNode || uv();
		const uvNodeDepth = depthNode.uvNode || uv();
		const uvNodeNormal = normalNode.uvNode || uv();

		const sampleTexture = () => textureNode.uv( uvNodeTexture );

		const sampleDepth = ( x, y ) => depthNode.uv( uvNodeDepth.add( vec2( x, y ).mul( this._resolution.zw ) ) ).r;

		const sampleNormal = ( x, y ) => normalNode.uv( uvNodeNormal.add( vec2( x, y ).mul( this._resolution.zw ) ) ).rgb.normalize();

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

		const pixelation = Fn( () => {

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

			const strength = dei.greaterThan( 0 ).select( float( 1.0 ).sub( dei.mul( this.depthEdgeStrength ) ), nei.mul( this.normalEdgeStrength ).add( 1 ) );

			return texel.mul( strength );

		} );

		const outputNode = pixelation();

		return outputNode;

	}

}

PixelationNode.type = /*@__PURE__*/ registerNode( 'Pixelation', PixelationNode );

const pixelation = ( node, depthNode, normalNode, pixelSize = 6, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) => nodeObject( new PixelationNode( convertToTexture( node ), convertToTexture( depthNode ), convertToTexture( normalNode ), nodeObject( pixelSize ), nodeObject( normalEdgeStrength ), nodeObject( depthEdgeStrength ) ) );

class PixelationPassNode extends PassNode {

	constructor( scene, camera, pixelSize = 6, normalEdgeStrength = 0.3, depthEdgeStrength = 0.4 ) {

		super( 'color', scene, camera, { minFilter: NearestFilter, magFilter: NearestFilter } );

		this.pixelSize = pixelSize;
		this.normalEdgeStrength = normalEdgeStrength;
		this.depthEdgeStrength = depthEdgeStrength;

		this.isPixelationPassNode = true;

		this._mrt = mrt( {
			output: output,
			normal: normalView
		} );

	}

	setSize( width, height ) {

		const pixelSize = this.pixelSize.value ? this.pixelSize.value : this.pixelSize;

		const adjustedWidth = Math.floor( width / pixelSize );
		const adjustedHeight = Math.floor( height / pixelSize );

		super.setSize( adjustedWidth, adjustedHeight );

	}

	setup() {

		const color = super.getTextureNode( 'output' );
		const depth = super.getTextureNode( 'depth' );
		const normal = super.getTextureNode( 'normal' );

		return pixelation( color, depth, normal, this.pixelSize, this.normalEdgeStrength, this.depthEdgeStrength );

	}

}

export const pixelationPass = ( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) => nodeObject( new PixelationPassNode( scene, camera, pixelSize, normalEdgeStrength, depthEdgeStrength ) );

export default PixelationPassNode;

PixelationPassNode.type = /*@__PURE__*/ registerNode( 'PixelationPass', PixelationPassNode );
