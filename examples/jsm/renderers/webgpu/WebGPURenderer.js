import { GPUIndexFormat, GPUTextureFormat, GPUStoreOp } from './constants.js';
import WebGPUObjects from './WebGPUObjects.js';
import WebGPUAttributes from './WebGPUAttributes.js';
import WebGPUGeometries from './WebGPUGeometries.js';
import WebGPUInfo from './WebGPUInfo.js';
import WebGPUProperties from './WebGPUProperties.js';
import WebGPURenderPipelines from './WebGPURenderPipelines.js';
import WebGPUComputePipelines from './WebGPUComputePipelines.js';
import WebGPUBindings from './WebGPUBindings.js';
import WebGPURenderLists from './WebGPURenderLists.js';
import WebGPUTextures from './WebGPUTextures.js';
import WebGPUBackground from './WebGPUBackground.js';
import WebGPUNodes from './nodes/WebGPUNodes.js';

import glslang from '../../libs/glslang.js';

import { Frustum, Matrix4, Vector3, Color, LinearEncoding } from 'three';

console.info( 'THREE.WebGPURenderer: Modified Matrix4.makePerspective() and Matrix4.makeOrtographic() to work with WebGPU, see https://github.com/mrdoob/three.js/issues/20276.' );

Matrix4.prototype.makePerspective = function ( left, right, top, bottom, near, far ) {

	const te = this.elements;
	const x = 2 * near / ( right - left );
	const y = 2 * near / ( top - bottom );

	const a = ( right + left ) / ( right - left );
	const b = ( top + bottom ) / ( top - bottom );
	const c = - far / ( far - near );
	const d = - far * near / ( far - near );

	te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a;	te[ 12 ] = 0;
	te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b;	te[ 13 ] = 0;
	te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c;	te[ 14 ] = d;
	te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

	return this;

};

Matrix4.prototype.makeOrthographic = function ( left, right, top, bottom, near, far ) {

	const te = this.elements;
	const w = 1.0 / ( right - left );
	const h = 1.0 / ( top - bottom );
	const p = 1.0 / ( far - near );

	const x = ( right + left ) * w;
	const y = ( top + bottom ) * h;
	const z = near * p;

	te[ 0 ] = 2 * w;	te[ 4 ] = 0;	te[ 8 ] = 0;	te[ 12 ] = - x;
	te[ 1 ] = 0;	te[ 5 ] = 2 * h;	te[ 9 ] = 0;	te[ 13 ] = - y;
	te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = - 1 * p;	te[ 14 ] = - z;
	te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = 0;	te[ 15 ] = 1;

	return this;

};


const _frustum = new Frustum();
const _projScreenMatrix = new Matrix4();
const _vector3 = new Vector3();

class WebGPURenderer {

	constructor( parameters = {} ) {

		// public

		this.domElement = ( parameters.canvas !== undefined ) ? parameters.canvas : this._createCanvasElement();

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.outputEncoding = LinearEncoding;

		this.sortObjects = true;

		// internals

		this._parameters = Object.assign( {}, parameters );

		this._pixelRatio = 1;
		this._width = this.domElement.width;
		this._height = this.domElement.height;

		this._viewport = null;
		this._scissor = null;

		this._adapter = null;
		this._device = null;
		this._context = null;
		this._swapChain = null;
		this._colorBuffer = null;
		this._depthBuffer = null;

		this._info = null;
		this._properties = null;
		this._attributes = null;
		this._geometries = null;
		this._nodes = null;
		this._bindings = null;
		this._objects = null;
		this._renderPipelines = null;
		this._computePipelines = null;
		this._renderLists = null;
		this._textures = null;
		this._background = null;

		this._renderPassDescriptor = null;

		this._currentRenderList = null;
		this._opaqueSort = null;
		this._transparentSort = null;

		this._clearAlpha = 1;
		this._clearColor = new Color( 0x000000 );
		this._clearDepth = 1;
		this._clearStencil = 0;

		this._renderTarget = null;

		// some parameters require default values other than "undefined"

		this._parameters.antialias = ( parameters.antialias === true );

		if ( this._parameters.antialias === true ) {

			this._parameters.sampleCount = ( parameters.sampleCount === undefined ) ? 4 : parameters.sampleCount;

		} else {

			this._parameters.sampleCount = 1;

		}

		this._parameters.requiredFeatures = ( parameters.requiredFeatures === undefined ) ? [] : parameters.requiredFeatures;
		this._parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

	}

	async init() {

		const parameters = this._parameters;

		const adapterOptions = {
			powerPreference: parameters.powerPreference
		};

		const adapter = await navigator.gpu.requestAdapter( adapterOptions );

		if ( adapter === null ) {

			throw new Error( 'WebGPURenderer: Unable to create WebGPU adapter.' );

		}

		const deviceDescriptor = {
			requiredFeatures: parameters.requiredFeatures,
			requiredLimits: parameters.requiredLimits
		};

		const device = await adapter.requestDevice( deviceDescriptor );

		const compiler = await glslang();

		const context = ( parameters.context !== undefined ) ? parameters.context : this.domElement.getContext( 'webgpu' );

		const swapChain = context.configure( {
			device: device,
			format: GPUTextureFormat.BRGA8Unorm // this is the only valid swap chain format right now (r121)
		} );

		this._adapter = adapter;
		this._device = device;
		this._context = context;
		this._swapChain = swapChain;

		this._info = new WebGPUInfo();
		this._properties = new WebGPUProperties();
		this._attributes = new WebGPUAttributes( device );
		this._geometries = new WebGPUGeometries( this._attributes, this._info );
		this._textures = new WebGPUTextures( device, this._properties, this._info, compiler );
		this._objects = new WebGPUObjects( this._geometries, this._info );
		this._nodes = new WebGPUNodes( this );
		this._renderPipelines = new WebGPURenderPipelines( this, this._properties, device, compiler, parameters.sampleCount, this._nodes );
		this._computePipelines = new WebGPUComputePipelines( device, compiler );
		this._bindings = new WebGPUBindings( device, this._info, this._properties, this._textures, this._renderPipelines, this._computePipelines, this._attributes, this._nodes );
		this._renderLists = new WebGPURenderLists();
		this._background = new WebGPUBackground( this );

		//

		this._renderPassDescriptor = {
			colorAttachments: [ {
				view: null
			} ],
			 depthStencilAttachment: {
				view: null,
				depthStoreOp: GPUStoreOp.Store,
				stencilStoreOp: GPUStoreOp.Store
			}
		};

		this._setupColorBuffer();
		this._setupDepthBuffer();

	}

	render( scene, camera ) {

		// @TODO: move this to animation loop

		this._nodes.updateFrame();

		//

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		if ( this._info.autoReset === true ) this._info.reset();

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix );

		this._currentRenderList = this._renderLists.get( scene, camera );
		this._currentRenderList.init();

		this._projectObject( scene, camera, 0 );

		this._currentRenderList.finish();

		if ( this.sortObjects === true ) {

			this._currentRenderList.sort( this._opaqueSort, this._transparentSort );

		}

		// prepare render pass descriptor

		const colorAttachment = this._renderPassDescriptor.colorAttachments[ 0 ];
		const depthStencilAttachment = this._renderPassDescriptor.depthStencilAttachment;

		const renderTarget = this._renderTarget;

		if ( renderTarget !== null ) {

			// @TODO: Support RenderTarget with antialiasing.

			const renderTargetProperties = this._properties.get( renderTarget );

			colorAttachment.view = renderTargetProperties.colorTextureGPU.createView();
			depthStencilAttachment.view = renderTargetProperties.depthTextureGPU.createView();

		} else {

			if ( this._parameters.antialias === true ) {

				colorAttachment.view = this._colorBuffer.createView();
				colorAttachment.resolveTarget = this._context.getCurrentTexture().createView();

			} else {

				colorAttachment.view = this._context.getCurrentTexture().createView();
				colorAttachment.resolveTarget = undefined;

			}

			depthStencilAttachment.view = this._depthBuffer.createView();

		}

		//

		this._background.update( scene );

		// start render pass

		const device = this._device;
		const cmdEncoder = device.createCommandEncoder( {} );
		const passEncoder = cmdEncoder.beginRenderPass( this._renderPassDescriptor );

		// global rasterization settings for all renderable objects

		const vp = this._viewport;

		if ( vp !== null ) {

			const width = Math.floor( vp.width * this._pixelRatio );
			const height = Math.floor( vp.height * this._pixelRatio );

			passEncoder.setViewport( vp.x, vp.y, width, height, vp.minDepth, vp.maxDepth );

		}

		const sc = this._scissor;

		if ( sc !== null ) {

			const width = Math.floor( sc.width * this._pixelRatio );
			const height = Math.floor( sc.height * this._pixelRatio );

			passEncoder.setScissorRect( sc.x, sc.y, width, height );

		}

		// process render lists

		const opaqueObjects = this._currentRenderList.opaque;
		const transparentObjects = this._currentRenderList.transparent;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, passEncoder );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, passEncoder );

		// finish render pass

		passEncoder.endPass();
		device.queue.submit( [ cmdEncoder.finish() ] );

	}

	getContext() {

		return this._context;

	}

	getPixelRatio() {

		return this._pixelRatio;

	}

	getDrawingBufferSize( target ) {

		return target.set( this._width * this._pixelRatio, this._height * this._pixelRatio ).floor();

	}

	getSize( target ) {

		return target.set( this._width, this._height );

	}

	setPixelRatio( value = 1 ) {

		this._pixelRatio = value;

		this.setSize( this._width, this._height, false );

	}

	setDrawingBufferSize( width, height, pixelRatio ) {

		this._width = width;
		this._height = height;

		this._pixelRatio = pixelRatio;

		this.domElement.width = Math.floor( width * pixelRatio );
		this.domElement.height = Math.floor( height * pixelRatio );

		this._configureContext();
		this._setupColorBuffer();
		this._setupDepthBuffer();

	}

	setSize( width, height, updateStyle = true ) {

		this._width = width;
		this._height = height;

		this.domElement.width = Math.floor( width * this._pixelRatio );
		this.domElement.height = Math.floor( height * this._pixelRatio );

		if ( updateStyle === true ) {

			this.domElement.style.width = width + 'px';
			this.domElement.style.height = height + 'px';

		}

		this._configureContext();
		this._setupColorBuffer();
		this._setupDepthBuffer();

	}

	setOpaqueSort( method ) {

		this._opaqueSort = method;

	}

	setTransparentSort( method ) {

		this._transparentSort = method;

	}

	getScissor( target ) {

		const scissor = this._scissor;

		target.x = scissor.x;
		target.y = scissor.y;
		target.width = scissor.width;
		target.height = scissor.height;

		return target;

	}

	setScissor( x, y, width, height ) {

		if ( x === null ) {

			this._scissor = null;

		} else {

			this._scissor = {
				x: x,
				y: y,
				width: width,
				height: height
			};

		}

	}

	getViewport( target ) {

		const viewport = this._viewport;

		target.x = viewport.x;
		target.y = viewport.y;
		target.width = viewport.width;
		target.height = viewport.height;
		target.minDepth = viewport.minDepth;
		target.maxDepth = viewport.maxDepth;

		return target;

	}

	setViewport( x, y, width, height, minDepth = 0, maxDepth = 1 ) {

		if ( x === null ) {

			this._viewport = null;

		} else {

			this._viewport = {
				x: x,
				y: y,
				width: width,
				height: height,
				minDepth: minDepth,
				maxDepth: maxDepth
			};

		}

	}

	getCurrentEncoding() {

		const renderTarget = this.getRenderTarget();
		return ( renderTarget !== null ) ? renderTarget.texture.encoding : this.outputEncoding;

	}

	getCurrentColorFormat() {

		let format;

		const renderTarget = this.getRenderTarget();

		if ( renderTarget !== null ) {

			const renderTargetProperties = this._properties.get( renderTarget );
			format = renderTargetProperties.colorTextureFormat;

		} else {

			format = GPUTextureFormat.BRGA8Unorm; // default swap chain format

		}

		return format;

	}

	getCurrentDepthStencilFormat() {

		let format;

		const renderTarget = this.getRenderTarget();

		if ( renderTarget !== null ) {

			const renderTargetProperties = this._properties.get( renderTarget );
			format = renderTargetProperties.depthTextureFormat;

		} else {

			format = GPUTextureFormat.Depth24PlusStencil8;

		}

		return format;

	}

	getClearColor( target ) {

		return target.copy( this._clearColor );

	}

	setClearColor( color, alpha = 1 ) {

		this._clearColor.set( color );
		this._clearAlpha = alpha;

	}

	getClearAlpha() {

		return this._clearAlpha;

	}

	setClearAlpha( alpha ) {

		this._clearAlpha = alpha;

	}

	getClearDepth() {

		return this._clearDepth;

	}

	setClearDepth( depth ) {

		this._clearDepth = depth;

	}

	getClearStencil() {

		return this._clearStencil;

	}

	setClearStencil( stencil ) {

		this._clearStencil = stencil;

	}

	clear() {

		this._background.clear();

	}

	dispose() {

		this._objects.dispose();
		this._properties.dispose();
		this._renderPipelines.dispose();
		this._computePipelines.dispose();
		this._nodes.dispose();
		this._bindings.dispose();
		this._info.dispose();
		this._renderLists.dispose();
		this._textures.dispose();

	}

	setRenderTarget( renderTarget ) {

		this._renderTarget = renderTarget;

		if ( renderTarget !== null ) {

			this._textures.initRenderTarget( renderTarget );

		}

	}

	compute( computeParams ) {

		const device = this._device;
		const cmdEncoder = device.createCommandEncoder( {} );
		const passEncoder = cmdEncoder.beginComputePass();

		for ( const param of computeParams ) {

			// pipeline

			const pipeline = this._computePipelines.get( param );
			passEncoder.setPipeline( pipeline );

			// bind group

			const bindGroup = this._bindings.getForCompute( param ).group;
			this._bindings.update( param );
			passEncoder.setBindGroup( 0, bindGroup );

			passEncoder.dispatch( param.num );

		}

		passEncoder.endPass();
		device.queue.submit( [ cmdEncoder.finish() ] );

	}

	getRenderTarget() {

		return this._renderTarget;

	}

	_projectObject( object, camera, groupOrder ) {

		const info = this._info;
		const currentRenderList = this._currentRenderList;

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				//currentRenderState.pushLight( object );

				if ( object.castShadow ) {

					//currentRenderState.pushShadow( object );

				}

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || _frustum.intersectsSprite( object ) ) {

					if ( this.sortObjects === true ) {

						_vector3.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const geometry = object.geometry;
					const material = object.material;

					if ( material.visible ) {

						currentRenderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			} else if ( object.isLineLoop ) {

				console.error( 'THREE.WebGPURenderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( object.isSkinnedMesh ) {

					// update skeleton only once in a frame

					if ( object.skeleton.frame !== info.render.frame ) {

						object.skeleton.update();
						object.skeleton.frame = info.render.frame;

					}

				}

				if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

					if ( this.sortObjects === true ) {

						_vector3.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const geometry = object.geometry;
					const material = object.material;

					if ( Array.isArray( material ) ) {

						const groups = geometry.groups;

						for ( let i = 0, l = groups.length; i < l; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								currentRenderList.push( object, geometry, groupMaterial, groupOrder, _vector3.z, group );

							}

						}

					} else if ( material.visible ) {

						currentRenderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this._projectObject( children[ i ], camera, groupOrder );

		}

	}

	_renderObjects( renderList, camera, passEncoder ) {

		// process renderable objects

		for ( let i = 0, il = renderList.length; i < il; i ++ ) {

			const renderItem = renderList[ i ];

			// @TODO: Add support for multiple materials per object. This will require to extract
			// the material from the renderItem object and pass it with its group data to _renderObject().

			const object = renderItem.object;

			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
			object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

			this._objects.update( object );

			if ( camera.isArrayCamera ) {

				const cameras = camera.cameras;

				for ( let j = 0, jl = cameras.length; j < jl; j ++ ) {

					const camera2 = cameras[ j ];

					if ( object.layers.test( camera2.layers ) ) {

						const vp = camera2.viewport;
						const minDepth = ( vp.minDepth === undefined ) ? 0 : vp.minDepth;
						const maxDepth = ( vp.maxDepth === undefined ) ? 1 : vp.maxDepth;

						passEncoder.setViewport( vp.x, vp.y, vp.width, vp.height, minDepth, maxDepth );

						this._nodes.update( object, camera2 );
						this._bindings.update( object, camera2 );
						this._renderObject( object, passEncoder );

					}

				}

			} else {

				this._nodes.update( object, camera );
				this._bindings.update( object, camera );
				this._renderObject( object, passEncoder );

			}

		}

	}

	_renderObject( object, passEncoder ) {

		const info = this._info;

		// pipeline

		const renderPipeline = this._renderPipelines.get( object );
		passEncoder.setPipeline( renderPipeline.pipeline );

		// bind group

		const bindGroup = this._bindings.get( object ).group;
		passEncoder.setBindGroup( 0, bindGroup );

		// index

		const geometry = object.geometry;
		const index = geometry.index;

		const hasIndex = ( index !== null );

		if ( hasIndex === true ) {

			this._setupIndexBuffer( index, passEncoder );

		}

		// vertex buffers

		this._setupVertexBuffers( geometry.attributes, passEncoder, renderPipeline );

		// draw

		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;
		const instanceCount = ( geometry.isInstancedBufferGeometry ) ? geometry.instanceCount : 1;

		if ( hasIndex === true ) {

			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			passEncoder.drawIndexed( indexCount, instanceCount, firstVertex, 0, 0 );

			info.update( object, indexCount, instanceCount );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			passEncoder.draw( vertexCount, instanceCount, firstVertex, 0 );

			info.update( object, vertexCount, instanceCount );

		}

	}

	_setupIndexBuffer( index, encoder ) {

		const buffer = this._attributes.get( index ).buffer;
		const indexFormat = ( index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

		encoder.setIndexBuffer( buffer, indexFormat );

	}

	_setupVertexBuffers( geometryAttributes, encoder, renderPipeline ) {

		const shaderAttributes = renderPipeline.shaderAttributes;

		for ( const shaderAttribute of shaderAttributes ) {

			const name = shaderAttribute.name;
			const slot = shaderAttribute.slot;

			const attribute = geometryAttributes[ name ];

			if ( attribute !== undefined ) {

				const buffer = this._attributes.get( attribute ).buffer;
				encoder.setVertexBuffer( slot, buffer );

			}

		}

	}

	_setupColorBuffer() {

		const device = this._device;

		if ( device ) {

			if ( this._colorBuffer ) this._colorBuffer.destroy();

			this._colorBuffer = this._device.createTexture( {
				size: {
					width: Math.floor( this._width * this._pixelRatio ),
					height: Math.floor( this._height * this._pixelRatio ),
					depthOrArrayLayers: 1
				},
				sampleCount: this._parameters.sampleCount,
				format: GPUTextureFormat.BRGA8Unorm,
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			} );

		}

	}

	_setupDepthBuffer() {

		const device = this._device;

		if ( device ) {

			if ( this._depthBuffer ) this._depthBuffer.destroy();

			this._depthBuffer = this._device.createTexture( {
				size: {
					width: Math.floor( this._width * this._pixelRatio ),
					height: Math.floor( this._height * this._pixelRatio ),
					depthOrArrayLayers: 1
				},
				sampleCount: this._parameters.sampleCount,
				format: GPUTextureFormat.Depth24PlusStencil8,
				usage: GPUTextureUsage.RENDER_ATTACHMENT
			} );

		}

	}

	_configureContext() {

		const device = this._device;

		if ( device ) {

			this._context.configure( {
				device: device,
				format: GPUTextureFormat.BRGA8Unorm,
				usage: GPUTextureUsage.RENDER_ATTACHMENT,
				size: {
					width: Math.floor( this._width * this._pixelRatio ),
					height: Math.floor( this._height * this._pixelRatio ),
					depthOrArrayLayers: 1
				},
			} );

		}

	}

	_createCanvasElement() {

		const canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
		canvas.style.display = 'block';
		return canvas;

	}

}

export default WebGPURenderer;
