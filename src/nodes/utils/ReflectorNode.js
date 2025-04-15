import Node from '../core/Node.js';
import TextureNode from '../accessors/TextureNode.js';
import { nodeObject } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { screenUV } from '../display/ScreenNode.js';

import { HalfFloatType, LinearMipMapLinearFilter, WebGPUCoordinateSystem } from '../../constants.js';
import { Plane } from '../../math/Plane.js';
import { Object3D } from '../../core/Object3D.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { DepthTexture } from '../../textures/DepthTexture.js';

const _reflectorPlane = new Plane();
const _normal = new Vector3();
const _reflectorWorldPosition = new Vector3();
const _cameraWorldPosition = new Vector3();
const _rotationMatrix = new Matrix4();
const _lookAtPosition = new Vector3( 0, 0, - 1 );
const clipPlane = new Vector4();

const _view = new Vector3();
const _target = new Vector3();
const _q = new Vector4();

const _size = new Vector2();

const _defaultRT = new RenderTarget();
const _defaultUV = screenUV.flipX();

_defaultRT.depthTexture = new DepthTexture( 1, 1 );

let _inReflector = false;

/**
 * This node can be used to implement mirror-like flat reflective surfaces.
 *
 * ```js
 * const groundReflector = reflector();
 * material.colorNode = groundReflector;
 *
 * const plane = new Mesh( geometry, material );
 * plane.add( groundReflector.target );
 * ```
 *
 * @augments TextureNode
 */
class ReflectorNode extends TextureNode {

	static get type() {

		return 'ReflectorNode';

	}

	/**
	 * Constructs a new reflector node.
	 *
	 * @param {Object} [parameters={}] - An object holding configuration parameters.
	 * @param {Object3D} [parameters.target=new Object3D()] - The 3D object the reflector is linked to.
	 * @param {number} [parameters.resolution=1] - The resolution scale.
	 * @param {boolean} [parameters.generateMipmaps=false] - Whether mipmaps should be generated or not.
	 * @param {boolean} [parameters.bounces=true] - Whether reflectors can render other reflector nodes or not.
	 * @param {boolean} [parameters.depth=false] - Whether depth data should be generated or not.
	 * @param {TextureNode} [parameters.defaultTexture] - The default texture node.
	 * @param {ReflectorBaseNode} [parameters.reflector] - The reflector base node.
	 */
	constructor( parameters = {} ) {

		super( parameters.defaultTexture || _defaultRT.texture, _defaultUV );

		/**
		 * A reference to the internal reflector base node which holds the actual implementation.
		 *
		 * @private
		 * @type {ReflectorBaseNode}
		 * @default ReflectorBaseNode
		 */
		this._reflectorBaseNode = parameters.reflector || new ReflectorBaseNode( this, parameters );

		/**
		 * A reference to the internal depth node.
		 *
		 * @private
		 * @type {?Node}
		 * @default null
		 */
		this._depthNode = null;

		this.setUpdateMatrix( false );

	}

	/**
	 * A reference to the internal reflector node.
	 *
	 * @type {ReflectorBaseNode}
	 */
	get reflector() {

		return this._reflectorBaseNode;

	}

	/**
	 * A reference to 3D object the reflector is linked to.
	 *
	 * @type {Object3D}
	 */
	get target() {

		return this._reflectorBaseNode.target;

	}

	/**
	 * Returns a node representing the mirror's depth. That can be used
	 * to implement more advanced reflection effects like distance attenuation.
	 *
	 * @return {Node} The depth node.
	 */
	getDepthNode() {

		if ( this._depthNode === null ) {

			if ( this._reflectorBaseNode.depth !== true ) {

				throw new Error( 'THREE.ReflectorNode: Depth node can only be requested when the reflector is created with { depth: true }. ' );

			}

			this._depthNode = nodeObject( new ReflectorNode( {
				defaultTexture: _defaultRT.depthTexture,
				reflector: this._reflectorBaseNode
			} ) );

		}

		return this._depthNode;

	}

	setup( builder ) {

		// ignore if used in post-processing
		if ( ! builder.object.isQuadMesh ) this._reflectorBaseNode.build( builder );

		return super.setup( builder );

	}

	clone() {

		const texture = new this.constructor( this.reflectorNode );
		texture._reflectorBaseNode = this._reflectorBaseNode;

		return texture;

	}

	/**
	 * Frees internal resources. Should be called when the node is no longer in use.
	 */
	dispose() {

		super.dispose();

		this._reflectorBaseNode.dispose();

	}

}

/**
 * Holds the actual implementation of the reflector.
 *
 * TODO: Explain why `ReflectorBaseNode`. Originally the entire logic was implemented
 * in `ReflectorNode`, see #29619.
 *
 * @private
 * @augments Node
 */
class ReflectorBaseNode extends Node {

	static get type() {

		return 'ReflectorBaseNode';

	}

	/**
	 * Constructs a new reflector base node.
	 *
	 * @param {TextureNode} textureNode - Represents the rendered reflections as a texture node.
	 * @param {Object} [parameters={}] - An object holding configuration parameters.
	 * @param {Object3D} [parameters.target=new Object3D()] - The 3D object the reflector is linked to.
	 * @param {number} [parameters.resolution=1] - The resolution scale.
	 * @param {boolean} [parameters.generateMipmaps=false] - Whether mipmaps should be generated or not.
	 * @param {boolean} [parameters.bounces=true] - Whether reflectors can render other reflector nodes or not.
	 * @param {boolean} [parameters.depth=false] - Whether depth data should be generated or not.
	 */
	constructor( textureNode, parameters = {} ) {

		super();

		const {
			target = new Object3D(),
			resolution = 1,
			generateMipmaps = false,
			bounces = true,
			depth = false
		} = parameters;

		/**
		 * Represents the rendered reflections as a texture node.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The 3D object the reflector is linked to.
		 *
		 * @type {Object3D}
		 * @default {new Object3D()}
		 */
		this.target = target;

		/**
		 * The resolution scale.
		 *
		 * @type {number}
		 * @default {1}
		 */
		this.resolution = resolution;

		/**
		 * Whether mipmaps should be generated or not.
		 *
		 * @type {boolean}
		 * @default {false}
		 */
		this.generateMipmaps = generateMipmaps;

		/**
		 * Whether reflectors can render other reflector nodes or not.
		 *
		 * @type {boolean}
		 * @default {true}
		 */
		this.bounces = bounces;

		/**
		 * Whether depth data should be generated or not.
		 *
		 * @type {boolean}
		 * @default {false}
		 */
		this.depth = depth;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.RENDER` when {@link ReflectorBaseNode#bounces}
		 * is `true`. Otherwise it's `NodeUpdateType.FRAME`.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateBeforeType = bounces ? NodeUpdateType.RENDER : NodeUpdateType.FRAME;

		/**
		 * Weak map for managing virtual cameras.
		 *
		 * @type {WeakMap<Camera, Camera>}
		 */
		this.virtualCameras = new WeakMap();

		/**
		 * Weak map for managing render targets.
		 *
		 * @type {Map<Camera, RenderTarget>}
		 */
		this.renderTargets = new Map();

		/**
		 * Force render even if reflector is facing away from camera.
		 *
		 * @type {boolean}
		 * @default {false}
		 */
		this.forceUpdate = false;

	}

	/**
	 * Updates the resolution of the internal render target.
	 *
	 * @private
	 * @param {RenderTarget} renderTarget - The render target to resize.
	 * @param {Renderer} renderer - The renderer that is used to determine the new size.
	 */
	_updateResolution( renderTarget, renderer ) {

		const resolution = this.resolution;

		renderer.getDrawingBufferSize( _size );

		renderTarget.setSize( Math.round( _size.width * resolution ), Math.round( _size.height * resolution ) );

	}

	setup( builder ) {

		this._updateResolution( _defaultRT, builder.renderer );

		return super.setup( builder );

	}

	/**
	 * Frees internal resources. Should be called when the node is no longer in use.
	 */
	dispose() {

		super.dispose();

		for ( const renderTarget of this.renderTargets.values() ) {

			renderTarget.dispose();

		}

	}

	/**
	 * Returns a virtual camera for the given camera. The virtual camera is used to
	 * render the scene from the reflector's view so correct reflections can be produced.
	 *
	 * @param {Camera} camera - The scene's camera.
	 * @return {Camera} The corresponding virtual camera.
	 */
	getVirtualCamera( camera ) {

		let virtualCamera = this.virtualCameras.get( camera );

		if ( virtualCamera === undefined ) {

			virtualCamera = camera.clone();

			this.virtualCameras.set( camera, virtualCamera );

		}

		return virtualCamera;

	}

	/**
	 * Returns a render target for the given camera. The reflections are rendered
	 * into this render target.
	 *
	 * @param {Camera} camera - The scene's camera.
	 * @return {RenderTarget} The render target.
	 */
	getRenderTarget( camera ) {

		let renderTarget = this.renderTargets.get( camera );

		if ( renderTarget === undefined ) {

			renderTarget = new RenderTarget( 0, 0, { type: HalfFloatType } );

			if ( this.generateMipmaps === true ) {

				renderTarget.texture.minFilter = LinearMipMapLinearFilter;
				renderTarget.texture.generateMipmaps = true;

			}

			if ( this.depth === true ) {

				renderTarget.depthTexture = new DepthTexture();

			}

			this.renderTargets.set( camera, renderTarget );

		}

		return renderTarget;

	}

	updateBefore( frame ) {

		if ( this.bounces === false && _inReflector ) return false;

		_inReflector = true;

		const { scene, camera, renderer, material } = frame;
		const { target } = this;

		const virtualCamera = this.getVirtualCamera( camera );
		const renderTarget = this.getRenderTarget( virtualCamera );

		renderer.getDrawingBufferSize( _size );

		this._updateResolution( renderTarget, renderer );

		//

		_reflectorWorldPosition.setFromMatrixPosition( target.matrixWorld );
		_cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

		_rotationMatrix.extractRotation( target.matrixWorld );

		_normal.set( 0, 0, 1 );
		_normal.applyMatrix4( _rotationMatrix );

		_view.subVectors( _reflectorWorldPosition, _cameraWorldPosition );

		// Avoid rendering when reflector is facing away unless forcing an update
		const isFacingAway = _view.dot( _normal ) > 0;

		if ( isFacingAway === true && this.forceUpdate === false ) return;

		_view.reflect( _normal ).negate();
		_view.add( _reflectorWorldPosition );

		_rotationMatrix.extractRotation( camera.matrixWorld );

		_lookAtPosition.set( 0, 0, - 1 );
		_lookAtPosition.applyMatrix4( _rotationMatrix );
		_lookAtPosition.add( _cameraWorldPosition );

		_target.subVectors( _reflectorWorldPosition, _lookAtPosition );
		_target.reflect( _normal ).negate();
		_target.add( _reflectorWorldPosition );

		//

		virtualCamera.coordinateSystem = camera.coordinateSystem;
		virtualCamera.position.copy( _view );
		virtualCamera.up.set( 0, 1, 0 );
		virtualCamera.up.applyMatrix4( _rotationMatrix );
		virtualCamera.up.reflect( _normal );
		virtualCamera.lookAt( _target );

		virtualCamera.near = camera.near;
		virtualCamera.far = camera.far;

		virtualCamera.updateMatrixWorld();
		virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		_reflectorPlane.setFromNormalAndCoplanarPoint( _normal, _reflectorWorldPosition );
		_reflectorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

		clipPlane.set( _reflectorPlane.normal.x, _reflectorPlane.normal.y, _reflectorPlane.normal.z, _reflectorPlane.constant );

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
		projectionMatrix.elements[ 10 ] = ( renderer.coordinateSystem === WebGPUCoordinateSystem ) ? ( clipPlane.z - clipBias ) : ( clipPlane.z + 1.0 - clipBias );
		projectionMatrix.elements[ 14 ] = clipPlane.w;

		//

		this.textureNode.value = renderTarget.texture;

		if ( this.depth === true ) {

			this.textureNode.getDepthNode().value = renderTarget.depthTexture;

		}

		material.visible = false;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();
		const currentAutoClear = renderer.autoClear;

		renderer.setMRT( null );
		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = true;

		renderer.render( scene, virtualCamera );

		renderer.setMRT( currentMRT );
		renderer.setRenderTarget( currentRenderTarget );
		renderer.autoClear = currentAutoClear;

		material.visible = true;

		_inReflector = false;

		this.forceUpdate = false;

	}

}

/**
 * TSL function for creating a reflector node.
 *
 * @tsl
 * @function
 * @param {Object} [parameters={}] - An object holding configuration parameters.
 * @param {Object3D} [parameters.target=new Object3D()] - The 3D object the reflector is linked to.
 * @param {number} [parameters.resolution=1] - The resolution scale.
 * @param {boolean} [parameters.generateMipmaps=false] - Whether mipmaps should be generated or not.
 * @param {boolean} [parameters.bounces=true] - Whether reflectors can render other reflector nodes or not.
 * @param {boolean} [parameters.depth=false] - Whether depth data should be generated or not.
 * @param {TextureNode} [parameters.defaultTexture] - The default texture node.
 * @param {ReflectorBaseNode} [parameters.reflector] - The reflector base node.
 * @returns {ReflectorNode}
 */
export const reflector = ( parameters ) => nodeObject( new ReflectorNode( parameters ) );

export default ReflectorNode;
