import { Fn, If, nodeObject, vec4 } from '../shadernode/ShaderNode.js';
import PassNode from './PassNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { StereoCamera } from '../../cameras/StereoCamera.js';
import { HalfFloatType, LinearFilter, NearestFilter } from '../../constants.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { uv } from '../accessors/UVNode.js';
import { mod } from '../math/MathNode.js';
import { texture } from '../accessors/TextureNode.js';
import { viewportCoordinate } from './ViewportNode.js';

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

class ParallaxBarrierPassNode extends PassNode {

	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		this.isParallaxBarrierPassNode = true;

		this.stereo = new StereoCamera();

		const _params = { minFilter: LinearFilter, magFilter: NearestFilter, type: HalfFloatType };

		this._renderTargetL = new RenderTarget( 1, 1, _params );
		this._renderTargetR = new RenderTarget( 1, 1, _params );

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

		const parallaxBarrier = Fn( () => {

			const color = vec4().toVar();

			If( mod( viewportCoordinate.y, 2 ).greaterThan( 1 ), () => {

				color.assign( this._mapLeft.uv( uvNode ) );

			} ).Else( () => {

				color.assign( this._mapRight.uv( uvNode ) );

			} );

			return color;

		} );

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = parallaxBarrier().context( builder.getSharedContext() );
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

export const parallaxBarrierPass = ( scene, camera ) => nodeObject( new ParallaxBarrierPassNode( scene, camera ) );

export default ParallaxBarrierPassNode;
