import { Fn, nodeObject, vec4 } from '../shadernode/ShaderNode.js';
import PassNode from './PassNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { StereoCamera } from '../../cameras/StereoCamera.js';
import { HalfFloatType, LinearFilter, NearestFilter } from '../../constants.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { uniform } from '../core/UniformNode.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { uv } from '../accessors/UVNode.js';
import { clamp, max } from '../math/MathNode.js';
import { texture } from '../accessors/TextureNode.js';

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

class AnaglyphPassNode extends PassNode {

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isAnaglyphPassNode = true;

		this.stereo = new StereoCamera();

		const _params = { minFilter: LinearFilter, magFilter: NearestFilter, type: HalfFloatType };

		this._renderTargetL = new RenderTarget( 1, 1, _params );
		this._renderTargetR = new RenderTarget( 1, 1, _params );

		// Dubois matrices from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.7.6968&rep=rep1&type=pdf#page=4

		this._colorMatrixLeft = uniform( new Matrix3().fromArray( [
			0.456100, - 0.0400822, - 0.0152161,
			0.500484, - 0.0378246, - 0.0205971,
			0.176381, - 0.0157589, - 0.00546856
		] ) );

		this._colorMatrixRight = uniform( new Matrix3().fromArray( [
			- 0.0434706, 0.378476, - 0.0721527,
			- 0.0879388, 0.73364, - 0.112961,
			- 0.00155529, - 0.0184503, 1.2264
		] ) );

		this._mapLeft = texture( this._renderTargetL.texture );
		this._mapRight = texture( this._renderTargetR.texture );

		//

		this._material = null;

	}

	setSize( width, height ) {

		super.setSize( width, height );

		this._renderTargetL.setSize( this.renderTarget.width, this.renderTarget.height );
		this._renderTargetR.setSize( this.renderTarget.width, this.renderTarget.height );

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

	setup( builder ) {

		const uvNode = uv();

		const anaglyph = Fn( () => {

			const colorL = this._mapLeft.uv( uvNode );
			const colorR = this._mapRight.uv( uvNode );

			const color = clamp( this._colorMatrixLeft.mul( colorL.rgb ).add( this._colorMatrixRight.mul( colorR.rgb ) ) );

			return vec4( color.rgb, max( colorL.a, colorR.a ) );

		} );

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = anaglyph().context( builder.getSharedContext() );
		material.needsUpdate = true;

		return super.setup( builder );

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

export const anaglyphPass = ( scene, camera ) => nodeObject( new AnaglyphPassNode( scene, camera ) );

export default AnaglyphPassNode;
