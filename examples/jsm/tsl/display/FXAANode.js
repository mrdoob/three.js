import { Vector2, TempNode } from 'three/webgpu';
import { nodeObject, Fn, uniformArray, select, float, NodeUpdateType, uv, dot, clamp, uniform, convertToTexture, smoothstep, bool, vec2, vec3, If, Loop, max, min, Break, abs } from 'three/tsl';

class FXAANode extends TempNode {

	static get type() {

		return 'FXAANode';

	}

	constructor( textureNode ) {

		super( 'vec4' );

		this.textureNode = textureNode;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._invSize = uniform( new Vector2() );

	}

	updateBefore() {

		const map = this.textureNode.value;

		this._invSize.value.set( 1 / map.image.width, 1 / map.image.height );

	}

	setup() {

		const textureNode = this.textureNode.bias( - 100 );
		const uvNode = textureNode.uvNode || uv();

		const EDGE_STEP_COUNT = float( 6 );
		const EDGE_GUESS = float( 8.0 );
		const EDGE_STEPS = uniformArray( [ 1.0, 1.5, 2.0, 2.0, 2.0, 4.0 ] );

		const _ContrastThreshold = float( 0.0312 );
		const _RelativeThreshold = float( 0.063 );
		const _SubpixelBlending = float( 1.0 );

		const Sample = Fn( ( [ uv ] ) => {

			return textureNode.uv( uv );

		} );

		const SampleLuminance = Fn( ( [ uv ] ) => {

			return dot( Sample( uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		} );

		const SampleLuminanceOffset = Fn( ( [ texSize, uv, uOffset, vOffset ] ) => {

			const shiftedUv = uv.add( texSize.mul( vec2( uOffset, vOffset ) ) );
			return SampleLuminance( shiftedUv );

		} );

		const ShouldSkipPixel = ( l ) => {

			const threshold = max( _ContrastThreshold, _RelativeThreshold.mul( l.highest ) );
			return l.contrast.lessThan( threshold );

		};

		const SampleLuminanceNeighborhood = ( texSize, uv ) => {

			const m = SampleLuminance( uv );

			const n = SampleLuminanceOffset( texSize, uv, 0.0, - 1.0 );
			const e = SampleLuminanceOffset( texSize, uv, 1.0, 0.0 );
			const s = SampleLuminanceOffset( texSize, uv, 0.0, 1.0 );
			const w = SampleLuminanceOffset( texSize, uv, - 1.0, 0.0 );

			const ne = SampleLuminanceOffset( texSize, uv, 1.0, - 1.0 );
			const nw = SampleLuminanceOffset( texSize, uv, - 1.0, - 1.0 );
			const se = SampleLuminanceOffset( texSize, uv, 1.0, 1.0 );
			const sw = SampleLuminanceOffset( texSize, uv, - 1.0, 1.0 );

			const highest = max( max( max( max( s, e ), n ), w ), m );
			const lowest = min( min( min( min( s, e ), n ), w ), m );
			const contrast = highest.sub( lowest );

			return { m, n, e, s, w, ne, nw, se, sw, highest, lowest, contrast };

		};

		const DeterminePixelBlendFactor = ( l ) => {

			let f = float( 2.0 ).mul( l.s.add( l.e ).add( l.n ).add( l.w ) );
			f = f.add( l.se.add( l.sw ).add( l.ne ).add( l.nw ) );
			f = f.mul( 1.0 / 12.0 );
			f = abs( f.sub( l.m ) );
			f = clamp( f.div( max( l.contrast, 0 ) ), 0.0, 1.0 );

			const blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor.mul( blendFactor ).mul( _SubpixelBlending );

		};

		const DetermineEdge = ( texSize, l ) => {

			const horizontal =
				abs( l.s.add( l.n ).sub( l.m.mul( 2.0 ) ) ).mul( 2.0 ).add(
					abs( l.se.add( l.ne ).sub( l.e.mul( 2.0 ) ) ).add(
						abs( l.sw.add( l.nw ).sub( l.w.mul( 2.0 ) ) )
					)
				);

			const vertical =
				abs( l.e.add( l.w ).sub( l.m.mul( 2.0 ) ) ).mul( 2.0 ).add(
					abs( l.se.add( l.sw ).sub( l.s.mul( 2.0 ) ) ).add(
						abs( l.ne.add( l.nw ).sub( l.n.mul( 2.0 ) ) )
					)
				);

			const isHorizontal = horizontal.greaterThanEqual( vertical );

			const pLuminance = select( isHorizontal, l.s, l.e );
			const nLuminance = select( isHorizontal, l.n, l.w );
			const pGradient = abs( pLuminance.sub( l.m ) );
			const nGradient = abs( nLuminance.sub( l.m ) );

			const pixelStep = select( isHorizontal, texSize.y, texSize.x ).toVar();
			const oppositeLuminance = float().toVar();
			const gradient = float().toVar();

			If( pGradient.lessThan( nGradient ), () => {

				pixelStep.assign( pixelStep.negate() );
				oppositeLuminance.assign( nLuminance );
				gradient.assign( nGradient );

			} ).Else( () => {

				oppositeLuminance.assign( pLuminance );
				gradient.assign( pGradient );

			} );

			return { isHorizontal, pixelStep, oppositeLuminance, gradient };

		};

		const DetermineEdgeBlendFactor = ( texSize, l, e, uv ) => {

			const uvEdge = uv.toVar();
			const edgeStep = vec2().toVar();
			If( e.isHorizontal, () => {

				uvEdge.y.addAssign( e.pixelStep.mul( 0.5 ) );
				edgeStep.assign( vec2( texSize.x, 0.0 ) );

			} ).Else( () => {

				uvEdge.x.addAssign( e.pixelStep.mul( 0.5 ) );
				edgeStep.assign( vec2( 0.0, texSize.y ) );

			} );

			const edgeLuminance = l.m.add( e.oppositeLuminance ).mul( 0.5 );
			const gradientThreshold = e.gradient.mul( 0.25 );

			const puv = uvEdge.add( edgeStep.mul( EDGE_STEPS.element( 0 ) ) ).toVar();
			const pLuminanceDelta = SampleLuminance( puv ).sub( edgeLuminance ).toVar();
			const pAtEnd = abs( pLuminanceDelta ).greaterThanEqual( gradientThreshold ).toVar();

			Loop( { start: 1, end: EDGE_STEP_COUNT }, ( { i } ) => {

				If( pAtEnd, () => {

					Break();

				} );

				puv.addAssign( edgeStep.mul( EDGE_STEPS.element( i ) ) );
				pLuminanceDelta.assign( SampleLuminance( puv ).sub( edgeLuminance ) );
				pAtEnd.assign( abs( pLuminanceDelta ).greaterThanEqual( gradientThreshold ) );

			} );

			If( pAtEnd.not(), () => {

				puv.addAssign( edgeStep.mul( EDGE_GUESS ) );

			} );

			const nuv = uvEdge.sub( edgeStep.mul( EDGE_STEPS.element( 0 ) ) ).toVar();
			const nLuminanceDelta = SampleLuminance( nuv ).sub( edgeLuminance ).toVar();
			const nAtEnd = abs( nLuminanceDelta ).greaterThanEqual( gradientThreshold ).toVar();

			Loop( { start: 1, end: EDGE_STEP_COUNT }, ( { i } ) => {

				If( nAtEnd, () => {

					Break();

				} );

				nuv.subAssign( edgeStep.mul( EDGE_STEPS.element( i ) ) );
				nLuminanceDelta.assign( SampleLuminance( nuv ).sub( edgeLuminance ) );
				nAtEnd.assign( abs( nLuminanceDelta ).greaterThanEqual( gradientThreshold ) );

			} );

			If( nAtEnd.not(), () => {

				nuv.subAssign( edgeStep.mul( EDGE_GUESS ) );

			} );

			const pDistance = float().toVar();
			const nDistance = float().toVar();

			If( e.isHorizontal, () => {

				pDistance.assign( puv.x.sub( uv.x ) );
				nDistance.assign( uv.x.sub( nuv.x ) );

			} ).Else( () => {

				pDistance.assign( puv.y.sub( uv.y ) );
				nDistance.assign( uv.y.sub( nuv.y ) );

			} );

			const shortestDistance = float().toVar();
			const deltaSign = bool().toVar();

			If( pDistance.lessThanEqual( nDistance ), () => {

				shortestDistance.assign( pDistance );
				deltaSign.assign( pLuminanceDelta.greaterThanEqual( 0.0 ) );

			} ).Else( () => {

				shortestDistance.assign( nDistance );
				deltaSign.assign( nLuminanceDelta.greaterThanEqual( 0.0 ) );

			} );

			const blendFactor = float().toVar();

			If( deltaSign.equal( l.m.sub( edgeLuminance ).greaterThanEqual( 0.0 ) ), () => {

				blendFactor.assign( 0.0 );

			} ).Else( () => {

				blendFactor.assign( float( 0.5 ).sub( shortestDistance.div( pDistance.add( nDistance ) ) ) );

			} );

			return blendFactor;

		};

		const ApplyFXAA = Fn( ( [ uv, texSize ] ) => {

			const luminance = SampleLuminanceNeighborhood( texSize, uv );
			If( ShouldSkipPixel( luminance ), () => {

				return Sample( uv );

			} );

			const pixelBlend = DeterminePixelBlendFactor( luminance );
			const edge = DetermineEdge( texSize, luminance );
			const edgeBlend = DetermineEdgeBlendFactor( texSize, luminance, edge, uv );

			const finalBlend = max( pixelBlend, edgeBlend );
			const finalUv = uv.toVar();

			If( edge.isHorizontal, () => {

				finalUv.y.addAssign( edge.pixelStep.mul( finalBlend ) );

			} ).Else( () => {

				finalUv.x.addAssign( edge.pixelStep.mul( finalBlend ) );

			} );

			return Sample( finalUv );

		} ).setLayout( {
			name: 'FxaaPixelShader',
			type: 'vec4',
			inputs: [
				{ name: 'uv', type: 'vec2' },
				{ name: 'texSize', type: 'vec2' },
			]
		} );

		const fxaa = Fn( () => {

			return ApplyFXAA( uvNode, this._invSize );

		} );

		const outputNode = fxaa();

		return outputNode;

	}

}

export default FXAANode;

export const fxaa = ( node ) => nodeObject( new FXAANode( convertToTexture( node ) ) );
