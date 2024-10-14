import { Color, Vector2, PostProcessingUtils, NearestFilter, Matrix4, DepthTexture, RenderTarget, HalfFloatType } from 'three';
import { add, float, If, Loop, int, Fn, min, max, clamp, nodeObject, PassNode, QuadMesh, texture, NodeMaterial, uniform, uv, vec2, vec4, luminance } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

/**
* Temporal Reprojection Anti-Aliasing (TRAA).
*
* References:
* https://alextardif.com/TAA.html
* https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/
*
*/
class TRAAPassNode extends PassNode {

	static get type() {

		return 'TRAAPassNode';

	}

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isTRAAPassNode = true;

		this.clearColor = new Color( 0x000000 );
		this.clearAlpha = 0;

		this._jitterIndex = 0;
		this._originalProjectionMatrix = new Matrix4();

		// render targets

		this._sampleRenderTarget = new RenderTarget( 1, 1, { type: HalfFloatType } );
		this._historyRenderTarget = new RenderTarget( 1, 1, { type: HalfFloatType } );
		this._resolveRenderTarget = new RenderTarget( 1, 1, { type: HalfFloatType } );

		this._sampleRenderTarget.depthTexture = new DepthTexture();
		this._sampleRenderTarget.texture.minFiler = NearestFilter;
		this._sampleRenderTarget.texture.magFilter = NearestFilter;

		// uniforms

		this._invSize = uniform( new Vector2() );

		this._sampleTexture = texture( this._sampleRenderTarget.texture );
		this._depthTexture = texture( this._sampleRenderTarget.depthTexture );
		this._historyTexture = texture( this._historyRenderTarget.texture );
		this._velocityTexture = this.getTextureNode( 'velocity' );

		// materials

		this._resolveMaterial = new NodeMaterial();
		this._resolveMaterial.name = 'TRAA.Resolve';

		this._prepassMaterial = new NodeMaterial();
		this._prepassMaterial.name = 'TRAA.Override';
		this._prepassMaterial.colorNode = vec4( 0, 0, 0, 1 );

	}

	setSize( width, height ) {

		super.setSize( width, height );

		let needsRestart = false;

		if ( this.renderTarget.width !== this._sampleRenderTarget.width || this.renderTarget.height !== this._sampleRenderTarget.height ) {

			this._sampleRenderTarget.setSize( this.renderTarget.width, this.renderTarget.height );
			this._historyRenderTarget.setSize( this.renderTarget.width, this.renderTarget.height );
			this._resolveRenderTarget.setSize( this.renderTarget.width, this.renderTarget.height );

			this._invSize.value.set( 1 / this.renderTarget.width, 1 / this.renderTarget.height );

			needsRestart = true;

		}

		return needsRestart;

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		_rendererState = PostProcessingUtils.resetRendererAndSceneState( renderer, scene, _rendererState );

		//

		this._pixelRatio = renderer.getPixelRatio();
		const size = renderer.getSize( _size );

		const needsRestart = this.setSize( size.width, size.height, renderer );

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		// prepass

		const mrt = this.getMRT();
		const velocityOutput = mrt.get( 'velocity' );

		if ( velocityOutput === undefined ) {

			throw new Error( 'THREE:TRAAPassNode: Missing velocity output in MRT configuration.' );

		}

		renderer.setMRT( mrt );
		scene.overrideMaterial = this._prepassMaterial;

		renderer.setClearColor( this.clearColor, this.clearAlpha );
		renderer.setRenderTarget( this.renderTarget );
		renderer.clear();
		renderer.render( scene, camera );

		scene.overrideMaterial = null;
		renderer.setMRT( null );

		// configure jitter

		const viewOffset = {

			fullWidth: this.renderTarget.width,
			fullHeight: this.renderTarget.height,
			offsetX: 0,
			offsetY: 0,
			width: this.renderTarget.width,
			height: this.renderTarget.height

		};

		const originalViewOffset = Object.assign( {}, camera.view );

		if ( originalViewOffset.enabled ) Object.assign( viewOffset, originalViewOffset );

		const jitterOffset = _JitterVectors[ this._jitterIndex ];

		camera.setViewOffset(

			viewOffset.fullWidth, viewOffset.fullHeight,

			viewOffset.offsetX + jitterOffset[ 0 ] * 0.0625, viewOffset.offsetY + jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1 / 16

			viewOffset.width, viewOffset.height

		);

		// render beauty with jitter

		renderer.setClearColor( this.clearColor, this.clearAlpha );
		renderer.setRenderTarget( this._sampleRenderTarget );
		renderer.clear();
		renderer.render( scene, camera );

		// every time when the dimensions change we need fresh history data. Copy the sample
		// into the history and final render target (no AA happens at that point).

		if ( needsRestart === true ) {

			// force a clear to fix the reset after a rezise with WebGPU.
			// there are currently warnings in the browser console indicating the texture dimensions do not match during the copy.
			// seems like some sort of timing issue

			renderer.setRenderTarget( this._historyRenderTarget ); // no resolve
			renderer.clear();

			// update history and output

			renderer.copyTextureToTexture( this._sampleRenderTarget.texture, this._historyRenderTarget.texture );
			renderer.copyTextureToTexture( this._sampleRenderTarget.texture, this.renderTarget.texture );

		} else {

			// resolve

			renderer.setRenderTarget( this._resolveRenderTarget );
			_quadMesh.material = this._resolveMaterial;
			_quadMesh.render( renderer );

			// update history and output

			renderer.copyTextureToTexture( this._resolveRenderTarget.texture, this._historyRenderTarget.texture );
			renderer.copyTextureToTexture( this._resolveRenderTarget.texture, this.renderTarget.texture );

		}

		// update jitter index

		this._jitterIndex ++;
		this._jitterIndex = this._jitterIndex % ( _JitterVectors.length - 1 );

		// restore

		if ( originalViewOffset.enabled ) {

			camera.setViewOffset(

				originalViewOffset.fullWidth, originalViewOffset.fullHeight,

				originalViewOffset.offsetX, originalViewOffset.offsetY,

				originalViewOffset.width, originalViewOffset.height

			);

		} else {

			camera.clearViewOffset();

		}

		PostProcessingUtils.restoreRendererAndSceneState( renderer, scene, _rendererState );

	}

	setup( builder ) {

		const resolve = Fn( () => {

			const uvNode = uv();

			const minColor = vec4( 10000 ).toVar();
			const maxColor = vec4( - 10000 ).toVar();
			const closestDepth = float( 1 ).toVar();
			const closestDepthPixelPosition = vec2( 0 ).toVar();

			// sample a 3x3 neighborhood to create a box in color space
			// clamping the history color with the resulting min/max colors mitigates ghosting

			Loop( { start: int( - 1 ), end: int( 1 ), type: 'int', condition: '<=', name: 'x' }, ( { x } ) => {

				Loop( { start: int( - 1 ), end: int( 1 ), type: 'int', condition: '<=', name: 'y' }, ( { y } ) => {

					const uvNeighbor = uvNode.add( vec2( float( x ), float( y ) ).mul( this._invSize ) ).toVar();
					const colorNeighbor = max( vec4( 0 ), this._sampleTexture.uv( uvNeighbor ) ).toVar(); // use max() to avoid propagate garbage values

					minColor.assign( min( minColor, colorNeighbor ) );
					maxColor.assign( max( maxColor, colorNeighbor ) );

					const currentDepth = this._depthTexture.uv( uvNeighbor ).r.toVar();

					// find the sample position of the closest depth in the neighborhood (used for velocity)

					If( currentDepth.lessThan( closestDepth ), () => {

						closestDepth.assign( currentDepth );
						closestDepthPixelPosition.assign( uvNeighbor );

					} );

				} );

			} );

			// sampling/reprojection

			const offset = this._velocityTexture.uv( closestDepthPixelPosition ).xy.mul( vec2( 0.5, - 0.5 ) ); // NDC to uv offset

			const currentColor = this._sampleTexture.uv( uvNode );
			const historyColor = this._historyTexture.uv( uvNode.sub( offset ) );

			// clamping

			const clampedHistoryColor = clamp( historyColor, minColor, maxColor );

			// flicker reduction based on luminance weighing

			const currentWeight = float( 0.05 ).toVar();
			const historyWeight = currentWeight.oneMinus().toVar();

			const compressedCurrent = currentColor.mul( float( 1 ).div( ( max( max( currentColor.r, currentColor.g ), currentColor.b ).add( 1.0 ) ) ) );
			const compressedHistory = clampedHistoryColor.mul( float( 1 ).div( ( max( max( clampedHistoryColor.r, clampedHistoryColor.g ), clampedHistoryColor.b ).add( 1.0 ) ) ) );

			const luminanceCurrent = luminance( compressedCurrent.rgb );
			const luminanceHistory = luminance( compressedHistory.rgb );

			currentWeight.mulAssign( float( 1.0 ).div( luminanceCurrent.add( 1 ) ) );
			historyWeight.mulAssign( float( 1.0 ).div( luminanceHistory.add( 1 ) ) );

			return add( currentColor.mul( currentWeight ), clampedHistoryColor.mul( historyWeight ) ).div( max( currentWeight.add( historyWeight ), 0.00001 ) );

		} );

		// materials

		this._resolveMaterial.fragmentNode = resolve();

		return super.setup( builder );

	}

	dispose() {

		super.dispose();

		this._sampleRenderTarget.dispose();
		this._historyRenderTarget.dispose();
		this._resolveRenderTarget.dispose();

		this._resolveMaterial.dispose();
		this._prepassMaterial.dispose();

	}

}

export default TRAAPassNode;

// These jitter vectors are specified in integers because it is easier.
// I am assuming a [-8,8) integer grid, but it needs to be mapped onto [-0.5,0.5)
// before being used, thus these integers need to be scaled by 1/16.
//
// Sample patterns reference: https://msdn.microsoft.com/en-us/library/windows/desktop/ff476218%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396
const _JitterVectors = [
	[ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
	[ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
	[ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
	[ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
	[ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
	[ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
	[ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
	[ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
];

export const traaPass = ( scene, camera ) => nodeObject( new TRAAPassNode( scene, camera ) );
