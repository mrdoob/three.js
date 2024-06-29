import TextureNode from '../accessors/TextureNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { viewportTopLeft } from '../display/ViewportNode.js';
import { Matrix4, Vector2, Vector3, Vector4, Object3D, Plane, RenderTarget, HalfFloatType, LinearMipMapLinearFilter } from 'three';

const _refractorPlane = new Plane();
const _normal = new Vector3();
const _refractorWorldPosition = new Vector3();
const _cameraWorldPosition = new Vector3();
const _rotationMatrix = new Matrix4();
const clipPlane = new Vector4();

const _view = new Vector3();
const _q = new Vector4();

const _size = new Vector2();

const _defaultRT = new RenderTarget();
const _defaultUV = viewportTopLeft;

let _inRefractor = false;

class RefractorNode extends TextureNode {

	constructor( parameters = {} ) {

		super( _defaultRT.texture, _defaultUV );

		const {
			target = new Object3D(),
			resolution = 1,
			generateMipmaps = false,
			bounces = true
		} = parameters;

		//

		this.target = target;
		this.resolution = resolution;
		this.generateMipmaps = generateMipmaps;
		this.bounces = bounces;

		this.updateBeforeType = bounces ? NodeUpdateType.RENDER : NodeUpdateType.FRAME;

		this.virtualCameras = new WeakMap();
		this.renderTargets = new WeakMap();


	}

	_updateResolution( renderTarget, renderer ) {

		const resolution = this.resolution;

		renderer.getDrawingBufferSize( _size );

		renderTarget.setSize( Math.round( _size.width * resolution ), Math.round( _size.height * resolution ) );

	}

	setup( builder ) {

		this._updateResolution( _defaultRT, builder.renderer );

		return super.setup( builder );

	}

	getTextureNode() {

		return this.textureNode;

	}

	getVirtualCamera( camera ) {

		let virtualCamera = this.virtualCameras.get( camera );

		if ( virtualCamera === undefined ) {

			virtualCamera = camera.clone();

			virtualCamera.matrixAutoUpdate = false;
			virtualCamera.matrixWorldAutoUpdate = false;

			this.virtualCameras.set( camera, virtualCamera );

		}

		return virtualCamera;

	}

	getRenderTarget( camera ) {

		let renderTarget = this.renderTargets.get( camera );

		if ( renderTarget === undefined ) {

			renderTarget = new RenderTarget( 0, 0, { type: HalfFloatType } );

			if ( this.generateMipmaps === true ) {

				renderTarget.texture.minFilter = LinearMipMapLinearFilter;
				renderTarget.texture.generateMipmaps = true;

			}

			this.renderTargets.set( camera, renderTarget );

		}

		return renderTarget;

	}

	updateBefore( frame ) {

		if ( this.bounces === false && _inRefractor ) return false;

		_inRefractor = true;

		const { scene, camera, renderer, material } = frame;
		const { target } = this;

		const virtualCamera = this.getVirtualCamera( camera );
		const renderTarget = this.getRenderTarget( virtualCamera );

		renderer.getDrawingBufferSize( _size );

		this._updateResolution( renderTarget, renderer );

		//

		_refractorWorldPosition.setFromMatrixPosition( target.matrixWorld );
		_cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

		_rotationMatrix.extractRotation( target.matrixWorld );

		_normal.set( 0, 0, 1 );
		_normal.applyMatrix4( _rotationMatrix );
		_normal.negate();

		_view.subVectors( _refractorWorldPosition, _cameraWorldPosition );

		// Avoid rendering when refractor is facing away

		if ( _view.dot( _normal ) < 0 ) return;

		//

		virtualCamera.coordinateSystem = camera.coordinateSystem;
		virtualCamera.matrixWorld.copy( camera.matrixWorld );
		virtualCamera.matrixWorldInverse.copy( virtualCamera.matrixWorld ).invert();
		virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

		//virtualCamera.near = camera.near;
		virtualCamera.far = camera.far;

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		_refractorPlane.setFromNormalAndCoplanarPoint( _normal, _refractorWorldPosition );
		_refractorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

		clipPlane.set( _refractorPlane.normal.x, _refractorPlane.normal.y, _refractorPlane.normal.z, _refractorPlane.constant );

		const projectionMatrix = virtualCamera.projectionMatrix;

		_q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
		_q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
		_q.z = - 1.0;
		_q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		clipPlane.multiplyScalar( 1.0 / clipPlane.dot( _q ) );

		const clipBias = 0;

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = clipPlane.x;
		projectionMatrix.elements[ 6 ] = clipPlane.y;
		projectionMatrix.elements[ 10 ] = clipPlane.z - clipBias;
		projectionMatrix.elements[ 14 ] = clipPlane.w;

		//

		this.value = renderTarget.texture;

		material.visible = false;

		const currentRenderTarget = renderer.getRenderTarget();

		renderer.setRenderTarget( renderTarget );

		renderer.render( scene, virtualCamera );

		renderer.setRenderTarget( currentRenderTarget );

		material.visible = true;

		_inRefractor = false;

	}

}

export const refractor = ( parameters ) => nodeObject( new RefractorNode( parameters ) );

export default RefractorNode;

