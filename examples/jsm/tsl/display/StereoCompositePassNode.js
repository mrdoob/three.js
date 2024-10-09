import { RenderTarget, StereoCamera, HalfFloatType, LinearFilter, NearestFilter, Vector2, PostProcessingUtils } from 'three';
import { PassNode, QuadMesh, texture } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

class StereoCompositePassNode extends PassNode {

	static get type() {

		return 'StereoCompositePassNode';

	}

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isStereoCompositePassNode = true;

		this.stereo = new StereoCamera();
		const _params = { minFilter: LinearFilter, magFilter: NearestFilter, type: HalfFloatType };

		this._renderTargetL = new RenderTarget( 1, 1, _params );
		this._renderTargetR = new RenderTarget( 1, 1, _params );

		this._mapLeft = texture( this._renderTargetL.texture );
		this._mapRight = texture( this._renderTargetR.texture );

		this._material = null;

	}

	updateStereoCamera( coordinateSystem ) {

		this.stereo.cameraL.coordinateSystem = coordinateSystem;
		this.stereo.cameraR.coordinateSystem = coordinateSystem;
		this.stereo.update( this.camera );

	}

	setSize( width, height ) {

		super.setSize( width, height );

		this._renderTargetL.setSize( this.renderTarget.width, this.renderTarget.height );
		this._renderTargetR.setSize( this.renderTarget.width, this.renderTarget.height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, stereo, renderTarget } = this;

		_rendererState = PostProcessingUtils.resetRendererAndSceneState( renderer, scene, _rendererState );

		//

		this._pixelRatio = renderer.getPixelRatio();

		this.updateStereoCamera( renderer.coordinateSystem );

		const size = renderer.getSize( _size );
		this.setSize( size.width, size.height );

		// left

		renderer.setRenderTarget( this._renderTargetL );
		renderer.render( scene, stereo.cameraL );

		// right

		renderer.setRenderTarget( this._renderTargetR );
		renderer.render( scene, stereo.cameraR );

		// composite

		renderer.setRenderTarget( renderTarget );
		_quadMesh.material = this._material;
		_quadMesh.render( renderer );

		// restore

		PostProcessingUtils.restoreRendererState( renderer, scene, _rendererState );

	}

	dispose() {

		super.dispose();

		this._renderTargetL.dispose();
		this._renderTargetR.dispose();

		if ( this._material !== null ) {

			this._material.dispose();

		}

	}

}

export default StereoCompositePassNode;
