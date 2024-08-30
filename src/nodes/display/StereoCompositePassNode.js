
import { registerNode } from '../core/Node.js';
import PassNode from './PassNode.js';
import { StereoCamera } from '../../cameras/StereoCamera.js';
import { HalfFloatType, LinearFilter, NearestFilter } from '../../constants.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { texture } from '../accessors/TextureNode.js';
import { Vector2 } from '../../math/Vector2.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

class StereoCompositePassNode extends PassNode {

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

		this._pixelRatio = renderer.getPixelRatio();

		this.updateStereoCamera( renderer.coordinateSystem );

		const size = renderer.getSize( _size );
		this.setSize( size.width, size.height );

		const currentRenderTarget = renderer.getRenderTarget();

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

		renderer.setRenderTarget( currentRenderTarget );

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

StereoCompositePassNode.type = /*@__PURE__*/ registerNode( 'StereoCompositePass', StereoCompositePassNode );
