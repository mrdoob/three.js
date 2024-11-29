import { Color, DepthTexture, FloatType, RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, PostProcessingUtils, NodeUpdateType } from 'three/webgpu';
import { Loop, int, exp, min, float, mul, uv, vec2, vec3, Fn, textureSize, orthographicDepthToViewZ, screenUV, nodeObject, uniform, vec4, passTexture, texture, perspectiveDepthToViewZ, positionView } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();
const _BLUR_DIRECTION_X = /*@__PURE__*/ new Vector2( 1.0, 0.0 );
const _BLUR_DIRECTION_Y = /*@__PURE__*/ new Vector2( 0.0, 1.0 );

let _rendererState;

class OutlineNode extends TempNode {

	static get type() {

		return 'OutlineNode';

	}

	constructor( scene, camera, params = {} ) {

		super( 'vec4' );

		const {
			selectedObjects = [],
			edgeThickness = float( 1 ),
			edgeGlow = float( 0 ),
			downSampleRatio = 2
		} = params;

		this.scene = scene;
		this.camera = camera;
		this.selectedObjects = selectedObjects;
		this.edgeThicknessNode = nodeObject( edgeThickness );
		this.edgeGlowNode = nodeObject( edgeGlow );
		this.downSampleRatio = downSampleRatio;

		this.updateBeforeType = NodeUpdateType.FRAME;

		// render targets

		this._renderTargetDepthBuffer = new RenderTarget();
		this._renderTargetDepthBuffer.depthTexture = new DepthTexture();
		this._renderTargetDepthBuffer.depthTexture.type = FloatType;

		this._renderTargetMaskBuffer = new RenderTarget();
		this._renderTargetMaskDownSampleBuffer = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTargetEdgeBuffer1 = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTargetEdgeBuffer2 = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTargetBlurBuffer1 = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTargetBlurBuffer2 = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._renderTargetComposite = new RenderTarget( 1, 1, { depthBuffer: false } );

		// uniforms

		this._cameraNear = uniform( camera.near );
		this._cameraFar = uniform( camera.far );
		this._blurDirection = uniform( new Vector2() );

		this._depthTextureUniform = texture( this._renderTargetDepthBuffer.depthTexture );
		this._maskTextureUniform = texture( this._renderTargetMaskBuffer.texture );
		this._maskTextureDownsSampleUniform = texture( this._renderTargetMaskDownSampleBuffer.texture );
		this._edge1TextureUniform = texture( this._renderTargetEdgeBuffer1.texture );
		this._edge2TextureUniform = texture( this._renderTargetEdgeBuffer2.texture );
		this._blurColorTextureUniform = texture( this._renderTargetEdgeBuffer1.texture );

		// constants

		this._visibleEdgeColor = vec3( 1, 0, 0 );
		this._hiddenEdgeColor = vec3( 0, 1, 0 );

		// materials

		this._depthMaterial = new NodeMaterial();
		this._depthMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
		this._depthMaterial.name = 'OutlineNode.depth';

		this._prepareMaskMaterial = new NodeMaterial();
		this._prepareMaskMaterial.name = 'OutlineNode.prepareMask';

		this._materialCopy = new NodeMaterial();
		this._materialCopy.name = 'OutlineNode.copy';

		this._edgeDetectionMaterial = new NodeMaterial();
		this._edgeDetectionMaterial.name = 'OutlineNode.edgeDetection';

		this._separableBlurMaterial = new NodeMaterial();
		this._separableBlurMaterial.name = 'OutlineNode.separableBlur';

		this._separableBlurMaterial2 = new NodeMaterial();
		this._separableBlurMaterial2.name = 'OutlineNode.separableBlur2';

		this._compositeMaterial = new NodeMaterial();
		this._compositeMaterial.name = 'OutlineNode.composite';

		//

		this._selectionCache = new Set();
		this._tempPulseColor1 = new Color();
		this._tempPulseColor2 = new Color();

		//

		this._textureNode = passTexture( this, this._renderTargetComposite.texture );

	}

	get visibleEdge() {

		return this.r;

	}

	get hiddenEdge() {

		return this.g;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._renderTargetDepthBuffer.setSize( width, height );
		this._renderTargetMaskBuffer.setSize( width, height );
		this._renderTargetComposite.setSize( width, height );

		// downsample 1

		let resx = Math.round( width / this.downSampleRatio );
		let resy = Math.round( height / this.downSampleRatio );

		this._renderTargetMaskDownSampleBuffer.setSize( resx, resy );
		this._renderTargetEdgeBuffer1.setSize( resx, resy );
		this._renderTargetBlurBuffer1.setSize( resx, resy );

		// downsample 2

		resx = Math.round( resx / 2 );
		resy = Math.round( resy / 2 );

		this._renderTargetEdgeBuffer2.setSize( resx, resy );
		this._renderTargetBlurBuffer2.setSize( resx, resy );

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { camera, scene } = this;

		_rendererState = PostProcessingUtils.resetRendererAndSceneState( renderer, scene, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		//

		renderer.setClearColor( 0xffffff, 1 );

		this._updateSelectionCache();

		// 1. Draw non-selected objects in the depth buffer

		scene.overrideMaterial = this._depthMaterial;

		renderer.setRenderTarget( this._renderTargetDepthBuffer );
		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( this._selectionCache.has( object ) === false ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.render( scene, camera );

		// 2. Draw only the selected objects by comparing the depth buffer of non-selected objects

		scene.overrideMaterial = this._prepareMaskMaterial;

		renderer.setRenderTarget( this._renderTargetMaskBuffer );
		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( this._selectionCache.has( object ) === true ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.render( scene, camera );

		//

		renderer.setRenderObjectFunction( _rendererState.renderObjectFunction );

		this._selectionCache.clear();

		// 3. Downsample to (at least) half resolution

		_quadMesh.material = this._materialCopy;
		renderer.setRenderTarget( this._renderTargetMaskDownSampleBuffer );
		_quadMesh.render( renderer );

		// 4. Perform edge detection (half resolution)

		_quadMesh.material = this._edgeDetectionMaterial;
		renderer.setRenderTarget( this._renderTargetEdgeBuffer1 );
		_quadMesh.render( renderer );

		// 5. Apply blur (half resolution)

		this._blurColorTextureUniform.value = this._renderTargetEdgeBuffer1.texture;
		this._blurDirection.value.copy( _BLUR_DIRECTION_X );

		_quadMesh.material = this._separableBlurMaterial;
		renderer.setRenderTarget( this._renderTargetBlurBuffer1 );
		_quadMesh.render( renderer );

		this._blurColorTextureUniform.value = this._renderTargetBlurBuffer1.texture;
		this._blurDirection.value.copy( _BLUR_DIRECTION_Y );

		renderer.setRenderTarget( this._renderTargetEdgeBuffer1 );
		_quadMesh.render( renderer );

		// 6. Apply blur (quarter resolution)

		this._blurColorTextureUniform.value = this._renderTargetEdgeBuffer1.texture;
		this._blurDirection.value.copy( _BLUR_DIRECTION_X );

		_quadMesh.material = this._separableBlurMaterial2;
		renderer.setRenderTarget( this._renderTargetBlurBuffer2 );
		_quadMesh.render( renderer );

		this._blurColorTextureUniform.value = this._renderTargetBlurBuffer2.texture;
		this._blurDirection.value.copy( _BLUR_DIRECTION_Y );

		renderer.setRenderTarget( this._renderTargetEdgeBuffer2 );
		_quadMesh.render( renderer );

		// 7. Composite

		_quadMesh.material = this._compositeMaterial;
		renderer.setRenderTarget( this._renderTargetComposite );
		_quadMesh.render( renderer );

		// restore

		PostProcessingUtils.restoreRendererAndSceneState( renderer, scene, _rendererState );

	}

	setup() {

		// prepare mask material

		const prepareMask = () => {

			const depth = this._depthTextureUniform.uv( screenUV );

			let viewZNode;

			if ( this.camera.isPerspectiveCamera ) {

				viewZNode = perspectiveDepthToViewZ( depth, this._cameraNear, this._cameraFar );

			} else {

				viewZNode = orthographicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

			}

			const depthTest = positionView.z.lessThanEqual( viewZNode ).select( 1, 0 );
			return vec4( 0.0, depthTest, 1.0, 1.0 );

		};

		this._prepareMaskMaterial.fragmentNode = prepareMask();
		this._prepareMaskMaterial.needsUpdate = true;

		// copy material

		this._materialCopy.fragmentNode = this._maskTextureUniform;
		this._materialCopy.needsUpdate = true;

		// edge detection material

		const edgeDetection = Fn( () => {

			const resolution = textureSize( this._maskTextureDownsSampleUniform );
			const invSize = vec2( 1 ).div( resolution ).toVar();
			const uvOffset = vec4( 1.0, 0.0, 0.0, 1.0 ).mul( vec4( invSize, invSize ) );

			const uvNode = uv();
			const c1 = this._maskTextureDownsSampleUniform.uv( uvNode.add( uvOffset.xy ) ).toVar();
			const c2 = this._maskTextureDownsSampleUniform.uv( uvNode.sub( uvOffset.xy ) ).toVar();
			const c3 = this._maskTextureDownsSampleUniform.uv( uvNode.add( uvOffset.yw ) ).toVar();
			const c4 = this._maskTextureDownsSampleUniform.uv( uvNode.sub( uvOffset.yw ) ).toVar();

			const diff1 = mul( c1.r.sub( c2.r ), 0.5 );
			const diff2 = mul( c3.r.sub( c4.r ), 0.5 );
			const d = vec2( diff1, diff2 ).length();
			const a1 = min( c1.g, c2.g );
			const a2 = min( c3.g, c4.g );
			const visibilityFactor = min( a1, a2 );
			const edgeColor = visibilityFactor.oneMinus().greaterThan( 0.001 ).select( this._visibleEdgeColor, this._hiddenEdgeColor );
			return vec4( edgeColor, 1 ).mul( d );

		} );

		this._edgeDetectionMaterial.fragmentNode = edgeDetection();
		this._edgeDetectionMaterial.needsUpdate = true;

		// seperable blur material

		const MAX_RADIUS = 4;

		const gaussianPdf = Fn( ( [ x, sigma ] ) => {

			return float( 0.39894 ).mul( exp( float( - 0.5 ).mul( x ).mul( x ).div( sigma.mul( sigma ) ) ).div( sigma ) );

		} );

		const seperableBlur = Fn( ( [ kernelRadius ] ) => {

			const resolution = textureSize( this._maskTextureDownsSampleUniform );
			const invSize = vec2( 1 ).div( resolution ).toVar();
			const uvNode = uv();

			const sigma = kernelRadius.div( 2 ).toVar();
			const weightSum = gaussianPdf( 0, sigma ).toVar();
			const diffuseSum = this._blurColorTextureUniform.uv( uvNode ).mul( weightSum ).toVar();
			const delta = this._blurDirection.mul( invSize ).mul( kernelRadius ).div( MAX_RADIUS ).toVar();

			const uvOffset = delta.toVar();

			Loop( { start: int( 1 ), end: int( MAX_RADIUS ), type: 'int', condition: '<=' }, ( { i } ) => {

				const x = kernelRadius.mul( float( i ) ).div( MAX_RADIUS );
				const w = gaussianPdf( x, sigma );
				const sample1 = this._blurColorTextureUniform.uv( uvNode.add( uvOffset ) );
				const sample2 = this._blurColorTextureUniform.uv( uvNode.sub( uvOffset ) );

				diffuseSum.addAssign( sample1.add( sample2 ).mul( w ) );
				weightSum.addAssign( w.mul( 2 ) );
				uvOffset.addAssign( delta );

			} );

			return diffuseSum.div( weightSum );

		} );

		this._separableBlurMaterial.fragmentNode = seperableBlur( this.edgeThicknessNode );
		this._separableBlurMaterial.needsUpdate = true;

		this._separableBlurMaterial2.fragmentNode = seperableBlur( MAX_RADIUS );
		this._separableBlurMaterial2.needsUpdate = true;

		// composite material

		const composite = Fn( () => {

			const edgeValue1 = this._edge1TextureUniform;
			const edgeValue2 = this._edge2TextureUniform;
			const maskColor = this._maskTextureUniform;

			const edgeValue = edgeValue1.add( edgeValue2.mul( this.edgeGlowNode ) );

			return maskColor.r.mul( edgeValue );

		} );

		this._compositeMaterial.fragmentNode = composite();
		this._compositeMaterial.needsUpdate = true;

		return this._textureNode;

	}

	dispose() {

		this.selectedObjects.length = 0;

		this._renderTargetDepthBuffer.dispose();
		this._renderTargetMaskBuffer.dispose();
		this._renderTargetMaskDownSampleBuffer.dispose();
		this._renderTargetEdgeBuffer1.dispose();
		this._renderTargetEdgeBuffer2.dispose();
		this._renderTargetBlurBuffer1.dispose();
		this._renderTargetBlurBuffer2.dispose();
		this._renderTargetComposite.dispose();

		this._depthMaterial.dispose();
		this._prepareMaskMaterial.dispose();
		this._materialCopy.dispose();
		this._edgeDetectionMaterial.dispose();
		this._separableBlurMaterial.dispose();
		this._separableBlurMaterial2.dispose();
		this._compositeMaterial.dispose();

	}

	//

	_updateSelectionCache() {

		for ( let i = 0; i < this.selectedObjects.length; i ++ ) {

			const selectedObject = this.selectedObjects[ i ];
			selectedObject.traverse( ( object ) => {

				if ( object.isMesh ) this._selectionCache.add( object );

			} );

		}

	}

}

export default OutlineNode;

export const outline = ( scene, camera, params ) => nodeObject( new OutlineNode( scene, camera, params ) );
