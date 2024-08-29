import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UV.js';
import { Fn, nodeObject, float, vec2, vec4, int, If } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { abs, max, min, mix, pow } from '../math/MathNode.js';
import { sub } from '../math/OperatorNode.js';
import { Loop, Break } from '../utils/LoopNode.js';
import { convertToTexture } from '../utils/RTTNode.js';

import { Vector2 } from '../../math/Vector2.js';

class FXAANode extends TempNode {

	constructor( textureNode ) {

		super();

		this.textureNode = textureNode;

		this.updateBeforeType = NodeUpdateType.RENDER;

		this._invSize = uniform( new Vector2() );

	}

	updateBefore() {

		const map = this.textureNode.value;

		this._invSize.value.set( 1 / map.image.width, 1 / map.image.height );

	}

	setup() {

		const textureNode = this.textureNode.bias( - 100 );
		const uvNode = textureNode.uvNode || uv();

		// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

		//----------------------------------------------------------------------------------
		// File:        es3-kepler\FXAA\assets\shaders/FXAA_DefaultES.frag
		// SDK Version: v3.00
		// Email:       gameworks@nvidia.com
		// Site:        http://developer.nvidia.com/
		//
		// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
		//
		// Redistribution and use in source and binary forms, with or without
		// modification, are permitted provided that the following conditions
		// are met:
		//  * Redistributions of source code must retain the above copyright
		//    notice, this list of conditions and the following disclaimer.
		//  * Redistributions in binary form must reproduce the above copyright
		//    notice, this list of conditions and the following disclaimer in the
		//    documentation and/or other materials provided with the distribution.
		//  * Neither the name of NVIDIA CORPORATION nor the names of its
		//    contributors may be used to endorse or promote products derived
		//    from this software without specific prior written permission.
		//
		// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
		// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
		// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
		// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
		// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
		// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
		// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
		// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
		// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		//
		//----------------------------------------------------------------------------------

		const FxaaTexTop = ( p ) => textureNode.uv( p );
		const FxaaTexOff = ( p, o, r ) => textureNode.uv( p.add( o.mul( r ) ) );

		const NUM_SAMPLES = int( 5 );

		const contrast = Fn( ( [ a_immutable, b_immutable ] ) => {

			// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha

			const b = vec4( b_immutable ).toVar();
			const a = vec4( a_immutable ).toVar();
			const diff = vec4( abs( a.sub( b ) ) ).toVar();

			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );

		} );

		// FXAA3 QUALITY - PC

		const FxaaPixelShader = Fn( ( [ uv, fxaaQualityRcpFrame, fxaaQualityEdgeThreshold, fxaaQualityinvEdgeThreshold ] ) => {

			const rgbaM = FxaaTexTop( uv ).toVar();
			const rgbaS = FxaaTexOff( uv, vec2( 0.0, - 1.0 ), fxaaQualityRcpFrame.xy ).toVar();
			const rgbaE = FxaaTexOff( uv, vec2( 1.0, 0.0 ), fxaaQualityRcpFrame.xy ).toVar();
			const rgbaN = FxaaTexOff( uv, vec2( 0.0, 1.0 ), fxaaQualityRcpFrame.xy ).toVar();
			const rgbaW = FxaaTexOff( uv, vec2( - 1.0, 0.0 ), fxaaQualityRcpFrame.xy ).toVar();
			// . S .
			// W M E
			// . N .

			const contrastN = contrast( rgbaM, rgbaN ).toVar();
			const contrastS = contrast( rgbaM, rgbaS ).toVar();
			const contrastE = contrast( rgbaM, rgbaE ).toVar();
			const contrastW = contrast( rgbaM, rgbaW ).toVar();

			const maxValue = max( contrastN, max( contrastS, max( contrastE, contrastW ) ) ).toVar();

			// . 0 .
			// 0 0 0
			// . 0 .

			If( maxValue.lessThan( fxaaQualityEdgeThreshold ), () => {

				return rgbaM; // assuming define FXAA_DISCARD is always 0

			} );

			//

			const relativeVContrast = sub( contrastN.add( contrastS ), ( contrastE.add( contrastW ) ) ).toVar();
			relativeVContrast.mulAssign( fxaaQualityinvEdgeThreshold );

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar

			If( abs( relativeVContrast ).lessThan( 0.3 ), () => {

				// locate the edge

				const x = contrastE.greaterThan( contrastW ).select( 1, - 1 ).toVar();
				const y = contrastS.greaterThan( contrastN ).select( 1, - 1 ).toVar();

				const dirToEdge = vec2( x, y ).toVar();
				// . 2 .      . 1 .
				// 1 0 2  ~=  0 0 1
				// . 1 .      . 0 .

				// tap 2 pixels and see which ones are "outside" the edge, to
				// determine if the edge is vertical or horizontal

				const rgbaAlongH = FxaaTexOff( uv, vec2( dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy );
				const matchAlongH = contrast( rgbaM, rgbaAlongH ).toVar();
				// . 1 .
				// 0 0 1
				// . 0 H

				const rgbaAlongV = FxaaTexOff( uv, vec2( dirToEdge.x.negate(), dirToEdge.y.negate() ), fxaaQualityRcpFrame.xy );
				const matchAlongV = contrast( rgbaM, rgbaAlongV ).toVar();
				// V 1 .
				// 0 0 1
				// . 0 .

				relativeVContrast.assign( matchAlongV.sub( matchAlongH ) );
				relativeVContrast.mulAssign( fxaaQualityinvEdgeThreshold );

				If( abs( relativeVContrast ).lessThan( 0.3 ), () => { // 45 deg edge

					// 1 1 .
					// 0 0 1
					// . 0 1

					// do a simple blur
					const sum = rgbaN.add( rgbaS ).add( rgbaE ).add( rgbaW );
					return mix( rgbaM, sum.mul( 0.25 ), 0.4 );

				} );

			} );

			const offNP = vec2().toVar();

			If( relativeVContrast.lessThanEqual( 0 ), () => {

				rgbaN.assign( rgbaW );
				rgbaS.assign( rgbaE );

				// . 0 .      1
				// 1 0 1  ->  0
				// . 0 .      1

				offNP.x.assign( 0 );
				offNP.y.assign( fxaaQualityRcpFrame.y );

			 } ).Else( () => {

				offNP.x.assign( fxaaQualityRcpFrame.x );
				offNP.y.assign( 0 );

			 } );

			const mn = contrast( rgbaM, rgbaN ).toVar();
			const ms = contrast( rgbaM, rgbaS ).toVar();

			If( mn.lessThanEqual( ms ), () => {

				rgbaN.assign( rgbaS );

			} );

			const doneN = int( 0 ).toVar();
			const doneP = int( 0 ).toVar();

			const nDist = float( 0 ).toVar();
			const pDist = float( 0 ).toVar();

			const posN = vec2( uv ).toVar();
			const posP = vec2( uv ).toVar();

			const iterationsUsedN = int( 0 ).toVar();
			const iterationsUsedP = int( 0 ).toVar();

			Loop( NUM_SAMPLES, ( { i } ) => {

				const increment = i.add( 1 ).toVar();

				If( doneN.equal( 0 ), () => {

					nDist.addAssign( increment );
					posN.assign( uv.add( offNP.mul( nDist ) ) );
					const rgbaEndN = FxaaTexTop( posN.xy );

					const nm = contrast( rgbaEndN, rgbaM ).toVar();
					const nn = contrast( rgbaEndN, rgbaN ).toVar();

					If( nm.greaterThan( nn ), () => {

						doneN.assign( 1 );

					} );

					iterationsUsedN.assign( i );

				} );

				If( doneP.equal( 0 ), () => {

					pDist.addAssign( increment );
					posP.assign( uv.sub( offNP.mul( pDist ) ) );
					const rgbaEndP = FxaaTexTop( posP.xy );

					const pm = contrast( rgbaEndP, rgbaM ).toVar();
					const pn = contrast( rgbaEndP, rgbaN ).toVar();

					If( pm.greaterThan( pn ), () => {

						doneP.assign( 1 );

					} );

					iterationsUsedP.assign( i );

				} );

				If( doneN.equal( 1 ).or( doneP.equal( 1 ) ), () => {

					Break();

				} );

			} );

			If( doneN.equal( 0 ).and( doneP.equal( 0 ) ), () => {

				return rgbaM; // failed to find end of edge

			} );

			const distN = float( 1 ).toVar();
			const distP = float( 1 ).toVar();

			If( doneN.equal( 1 ), () => {

				distN.assign( float( iterationsUsedN ).div( float( NUM_SAMPLES.sub( 1 ) ) ) );

			} );

			If( doneP.equal( 1 ), () => {

				distP.assign( float( iterationsUsedP ).div( float( NUM_SAMPLES.sub( 1 ) ) ) );

			} );

			const dist = min( distN, distP );

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist.assign( pow( dist, 0.5 ) );
			dist.assign( float( 1 ).sub( dist ) );

			return mix( rgbaM, rgbaN, dist.mul( 0.5 ) );

		} ).setLayout( {
			name: 'FxaaPixelShader',
			type: 'vec4',
			inputs: [
				{ name: 'uv', type: 'vec2' },
				{ name: 'fxaaQualityRcpFrame', type: 'vec2' },
				{ name: 'fxaaQualityEdgeThreshold', type: 'float' },
				{ name: 'fxaaQualityinvEdgeThreshold', type: 'float' },
			]
		} );

		const fxaa = Fn( () => {

			const edgeDetectionQuality = float( 0.2 );
			const invEdgeDetectionQuality = float( 1 ).div( edgeDetectionQuality );

			return FxaaPixelShader( uvNode, this._invSize, edgeDetectionQuality, invEdgeDetectionQuality );

		} );

		const outputNode = fxaa();

		return outputNode;

	}

}

export default FXAANode;

FXAANode.type = /*@__PURE__*/ registerNode( 'FXAA', FXAANode );

export const fxaa = ( node ) => nodeObject( new FXAANode( convertToTexture( node ) ) );
