import { Color, DepthTexture, RenderTarget, Vector2 } from 'three';
import { orthographicDepthToViewZ, QuadMesh, screenUV, TempNode, nodeObject, NodeUpdateType, uniform, vec4, NodeMaterial, passTexture, texture, perspectiveDepthToViewZ, positionView } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _currentClearColor = /*@__PURE__*/ new Color();
const _size = /*@__PURE__*/ new Vector2();

class OutlineNode extends TempNode {

	static get type() {

		return 'OutlineNode';

	}

	constructor( scene, camera, selectedObjects = [] ) {

		super( 'vec4' );

		this.scene = scene;
		this.camera = camera;
		this.selectedObjects = selectedObjects;
		this.downSampleRatio = 2;

		this.updateBeforeType = NodeUpdateType.FRAME;

		// render targets

		this._renderTargetDepthBuffer = new RenderTarget();
		this._renderTargetDepthBuffer.depthTexture = new DepthTexture();

		this._renderTargetMaskBuffer = new RenderTarget();
		this._renderTargetMaskDownSampleBuffer = new RenderTarget();

		// uniforms

		this._cameraNear = uniform( camera.near );
		this._cameraFar = uniform( camera.far );
		this._resolution = uniform( new Vector2() );
		this._depthTextureUniform = texture( this._renderTargetDepthBuffer.depthTexture );
		this._maskTextureUniform = texture( this._renderTargetMaskBuffer.texture );

		// materials

		this._depthMaterial = new NodeMaterial();
		this._depthMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
		this._depthMaterial.name = 'OutlineNode.depth';

		this._prepareMaskMaterial = new NodeMaterial();
		this._prepareMaskMaterial.name = 'OutlineNode.prepareMask';

		this._materialCopy = new NodeMaterial();
		this._materialCopy.name = 'OutlineNode.copy';

		//

		this._selectionCache = new Set();

		//

		this._textureNode = passTexture( this, this._renderTargetMaskDownSampleBuffer.texture );

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._resolution.value.set( width, height );

		this._renderTargetDepthBuffer.setSize( width, height );
		this._renderTargetMaskBuffer.setSize( width, height );

		const resx = Math.round( width / this.downSampleRatio );
		const resy = Math.round( height / this.downSampleRatio );

		this._renderTargetMaskDownSampleBuffer.setSize( resx, resy );

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { camera, scene } = this;

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		renderer.getClearColor( _currentClearColor );
		const currentClearAlpha = renderer.getClearAlpha();
		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();
		const currentBackground = scene.background;
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		//

		renderer.setClearColor( 0xffffff, 1 );
		renderer.setMRT( null );

		this._updateSelectionCache();

		scene.background = null;

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

		scene.overrideMaterial = null;
		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		this._selectionCache.clear();

		// 3. Downsample to half resolution

		_quadMesh.material = this._materialCopy;
		renderer.setRenderTarget( this._renderTargetMaskDownSampleBuffer );
		_quadMesh.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );
		renderer.setClearColor( _currentClearColor, currentClearAlpha );

		scene.background = currentBackground;

	}

	setup() {

		// prepareMask material

		const depth = this._depthTextureUniform.uv( screenUV.flipX() );

		let viewZNode;

		if ( this.camera.isPerspectiveCamera ) {

			viewZNode = perspectiveDepthToViewZ( depth, this._cameraNear, this._cameraFar );

		} else {

			viewZNode = orthographicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

		}

		const depthTest = positionView.z.lessThanEqual( viewZNode ).select( 1, 0 );
		this._prepareMaskMaterial.fragmentNode = vec4( 0.0, depthTest, 1.0, 1.0 );
		this._prepareMaskMaterial.needsUpdate = true;

		this._materialCopy.fragmentNode = this._maskTextureUniform;
		this._materialCopy.needsUpdate = true;

		return this._textureNode;

	}

	dispose() {

		this.selectedObjects.length = 0;

		this._renderTargetDepthBuffer.dispose();
		this._renderTargetMaskBuffer.dispose();
		this._renderTargetMaskDownSampleBuffer.dispose();

		this._depthMaterial.dispose();
		this._prepareMaskMaterial.dispose();
		this._materialCopy.dispose();

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

export const outline = ( scene, camera, selectedObjects ) => nodeObject( new OutlineNode( scene, camera, selectedObjects ) );
