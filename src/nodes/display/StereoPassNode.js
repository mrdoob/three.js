import { registerNode } from '../core/Node.js';
import { nodeObject } from '../tsl/TSLBase.js';
import PassNode from './PassNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { StereoCamera } from '../../cameras/StereoCamera.js';

const _size = /*@__PURE__*/ new Vector2();

class StereoPassNode extends PassNode {

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isStereoPassNode = true;

		this.stereo = new StereoCamera();
		this.stereo.aspect = 0.5;

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera, stereo, renderTarget } = this;

		this._pixelRatio = renderer.getPixelRatio();

		stereo.cameraL.coordinateSystem = renderer.coordinateSystem;
		stereo.cameraR.coordinateSystem = renderer.coordinateSystem;
		stereo.update( camera );

		const size = renderer.getSize( _size );
		this.setSize( size.width, size.height );

		const currentAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();

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

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );

		renderer.autoClear = currentAutoClear;

	}

}

export default StereoPassNode;

StereoPassNode.type = /*@__PURE__*/ registerNode( 'StereoPass', StereoPassNode );

export const stereoPass = ( scene, camera ) => nodeObject( new StereoPassNode( scene, camera ) );
