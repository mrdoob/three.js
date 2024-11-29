import { StereoCamera, Vector2, PassNode, PostProcessingUtils } from 'three/webgpu';
import { nodeObject } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

class StereoPassNode extends PassNode {

	static get type() {

		return 'StereoPassNode';

	}

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isStereoPassNode = true;

		this.stereo = new StereoCamera();
		this.stereo.aspect = 0.5;

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera, stereo, renderTarget } = this;

		_rendererState = PostProcessingUtils.resetRendererState( renderer, _rendererState );

		//

		this._pixelRatio = renderer.getPixelRatio();

		stereo.cameraL.coordinateSystem = renderer.coordinateSystem;
		stereo.cameraR.coordinateSystem = renderer.coordinateSystem;
		stereo.update( camera );

		const size = renderer.getSize( _size );
		this.setSize( size.width, size.height );

		renderer.autoClear = false;

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		for ( const name in this._previousTextures ) {

			this.toggleTexture( name );

		}

		renderer.setRenderTarget( renderTarget );
		renderer.setMRT( this._mrt );
		renderer.clear();

		renderTarget.scissorTest = true;

		renderTarget.scissor.set( 0, 0, renderTarget.width / 2, renderTarget.height );
		renderTarget.viewport.set( 0, 0, renderTarget.width / 2, renderTarget.height );
		renderer.render( scene, stereo.cameraL );

		renderTarget.scissor.set( renderTarget.width / 2, 0, renderTarget.width / 2, renderTarget.height );
		renderTarget.viewport.set( renderTarget.width / 2, 0, renderTarget.width / 2, renderTarget.height );
		renderer.render( scene, stereo.cameraR );

		renderTarget.scissorTest = false;

		// restore

		PostProcessingUtils.restoreRendererState( renderer, _rendererState );

	}

}

export default StereoPassNode;

export const stereoPass = ( scene, camera ) => nodeObject( new StereoPassNode( scene, camera ) );
