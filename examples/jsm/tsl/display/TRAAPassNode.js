import { Color, Vector2, PostProcessingUtils, NearestFilter, Matrix4 } from 'three';
import { Fn, min, max, clamp, nodeObject, mix, PassNode, QuadMesh, texture, NodeMaterial, mrt, output, velocity, uniform, uv, vec2 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

class TRAAPassNode extends PassNode {

	static get type() {

		return 'TRAAPassNode';

	}

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isTRAAPassNode = true;

		this.clearColor = new Color( 0x000000 );
		this.clearAlpha = 0;

		this._currentJitterIndex = 0;
		this._originalProjectionMatrix = new Matrix4();

		this._invSize = uniform( new Vector2() );

		// render targets

		this._sampleRenderTarget = null;
		this._historyRenderTarget = null;

		// materials

		this._resolveMaterial = new NodeMaterial();
		this._resolveMaterial.name = 'TRAA.Resolve';

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		_rendererState = PostProcessingUtils.resetRendererAndSceneState( renderer, scene, _rendererState );

		//

		this._pixelRatio = renderer.getPixelRatio();
		const size = renderer.getSize( _size );

		this.setSize( size.width, size.height );
		this._sampleRenderTarget.setSize( this.renderTarget.width, this.renderTarget.height );
		this._historyRenderTarget.setSize( this.renderTarget.width, this.renderTarget.height );
		this._invSize.value.set( 1 / this.renderTarget.width, 1 / this.renderTarget.height );

		//

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

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

		const jitterOffset = _JitterVectors[ this._currentJitterIndex ];

		camera.updateProjectionMatrix();
		this._originalProjectionMatrix.copy( camera.projectionMatrix );

		camera.setViewOffset(

			viewOffset.fullWidth, viewOffset.fullHeight,

			viewOffset.offsetX + jitterOffset[ 0 ] * 0.0625, viewOffset.offsetY + jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1 / 16

			viewOffset.width, viewOffset.height

		);

		const velocityNode = velocity;
		velocityNode.setProjectionMatrix( this._originalProjectionMatrix );

		renderer.setMRT( mrt( {
			output,
			velocity
		} ) );

		renderer.setClearColor( this.clearColor, this.clearAlpha );
		renderer.setRenderTarget( this._sampleRenderTarget );
		renderer.render( scene, camera );

		renderer.setMRT( null );

		// resolve

		renderer.setRenderTarget( this.renderTarget );
		_quadMesh.material = this._resolveMaterial;
		_quadMesh.render( renderer );
		renderer.copyTextureToTexture( this._sampleRenderTarget.depthTexture, this.renderTarget.depthTexture );

		// update history

		renderer.copyTextureToTexture( this.renderTarget.texture, this._historyRenderTarget.texture );

		// update jitter index

		if ( this._currentJitterIndex === _JitterVectors.length - 1 ) {

			this._currentJitterIndex = 0;

		} else {

			this._currentJitterIndex ++;

		}

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

		velocityNode.setProjectionMatrix( null );

		PostProcessingUtils.restoreRendererAndSceneState( renderer, scene, _rendererState );

	}

	setup( builder ) {

		if ( this._sampleRenderTarget === null ) {

			this._sampleRenderTarget = this.renderTarget.clone();
			this._historyRenderTarget = this.renderTarget.clone();

			this._sampleRenderTarget.texture.minFiler = NearestFilter;
			this._sampleRenderTarget.texture.magFilter = NearestFilter;

			const velocityTarget = this._sampleRenderTarget.texture.clone();
			velocityTarget.isRenderTargetTexture = true;
			velocityTarget.name = 'velocity';

			this._sampleRenderTarget.textures.push( velocityTarget );

		}

		// resolve material

		const historyTexture = texture( this._historyRenderTarget.texture );
		const sampleTexture = texture( this._sampleRenderTarget.textures[ 0 ] );
		const velocityTexture = texture( this._sampleRenderTarget.textures[ 1 ] );

		const resolve = Fn( () => {

			const uvNode = uv();
			const offset = velocityTexture.xy;

			const currentColor = sampleTexture.uv( uvNode );
			const historyColor = historyTexture.uv( uvNode.sub( offset ) );

			// const nearColor0 = historyTexture.uv( uvNode.add( vec2( 1, 0 ).mul( this._invSize ) ) );
			// const nearColor1 = historyTexture.uv( uvNode.add( vec2( 0, 1 ).mul( this._invSize ) ) );
			// const nearColor2 = historyTexture.uv( uvNode.add( vec2( - 1, 0 ).mul( this._invSize ) ) );
			// const nearColor3 = historyTexture.uv( uvNode.add( vec2( 0, - 1 ).mul( this._invSize ) ) );

			// const boxMin = min( currentColor, min( nearColor0, min( nearColor1, min( nearColor2, nearColor3 ) ) ) );
			// const boxMax = max( currentColor, max( nearColor0, max( nearColor1, max( nearColor2, nearColor3 ) ) ) );

			return mix( currentColor, historyColor, 0.9 );

		} );

		this._resolveMaterial.fragmentNode = resolve();

		return super.setup( builder );

	}

	dispose() {

		super.dispose();

		if ( this._sampleRenderTarget !== null ) {

			this._sampleRenderTarget.dispose();
			this._historyRenderTarget.dispose();

		}

		this._resolveMaterial;

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
