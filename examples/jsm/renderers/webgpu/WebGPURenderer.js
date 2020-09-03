import { GPUIndexFormat, GPUTextureFormat, GPUStoreOp } from './constants.js';
import WebGPUObjects from './WebGPUObjects.js';
import WebGPUAttributes from './WebGPUAttributes.js';
import WebGPUGeometries from './WebGPUGeometries.js';
import WebGPUInfo from './WebGPUInfo.js';
import WebGPUProperties from './WebGPUProperties.js';
import WebGPURenderPipelines from './WebGPURenderPipelines.js';
import WebGPUBindings from './WebGPUBindings.js';
import WebGPURenderLists from './WebGPURenderLists.js';
import WebGPUTextures from './WebGPUTextures.js';
import WebGPUBackground from './WebGPUBackground.js';

import { Frustum, Matrix4, Vector3, Color } from '../../../../build/three.module.js';

const _frustum = new Frustum();
const _projScreenMatrix = new Matrix4();
const _vector3 = new Vector3();

class WebGPURenderer {

	constructor( parameters = {} ) {

		// public

		this.domElement = ( parameters.canvas !== undefined ) ? parameters.canvas : document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
		this.parameters = parameters;

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.sortObjects = true;

		// internals

		this._pixelRatio = 1;
		this._width = this.domElement.width;
		this._height = this.domElement.height;

		this._viewport = null;
		this._scissor = null;

		this._adapter = null;
		this._device = null;
		this._context = null;
		this._swapChain = null;
		this._depthBuffer = null;

		this._info = null;
		this._properties = null;
		this._attributes = null;
		this._geometries = null;
		this._bindings = null;
		this._objects = null;
		this._renderPipelines = null;
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

	}

	init() {

		return initWebGPU( this );

	}

	render( scene, camera ) {

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

		const colorAttachment = this._renderPassDescriptor.colorAttachments[ 0 ];
		colorAttachment.attachment = this._swapChain.getCurrentTexture().createView();

		const depthStencilAttachment = this._renderPassDescriptor.depthStencilAttachment;
		depthStencilAttachment.attachment = this._depthBuffer.createView();

		this._background.render( scene );

		const opaqueObjects = this._currentRenderList.opaque;
		const transparentObjects = this._currentRenderList.transparent;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera );

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

	getClearColor() {

		return this._clearColor;

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
		this._bindings.dispose();
		this._info.dispose();
		this._renderLists.dispose();

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

	_renderObjects( renderList, camera ) {

		const device = this._device;

		const cmdEncoder = device.createCommandEncoder( {} );
		const passEncoder = cmdEncoder.beginRenderPass( this._renderPassDescriptor );

		for ( let i = 0, l = renderList.length; i < l; i ++ ) {

			const renderItem = renderList[ i ];

			const object = renderItem.object;

			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
			object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

			this._objects.update( object );
			this._bindings.update( object, camera );

			this._renderObject( object, passEncoder );

		}

		passEncoder.endPass();
		device.defaultQueue.submit( [ cmdEncoder.finish() ] );

	}

	_renderObject( object, passEncoder ) {

		const info = this._info;

		// pipeline

		const pipeline = this._renderPipelines.get( object );
		passEncoder.setPipeline( pipeline );

		// rasterization

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

		// bind group

		const bindGroup = this._bindings.get( object ).group;
		passEncoder.setBindGroup( 0, bindGroup );

		// index

		const geometry = object.geometry;
		const index = geometry.index;

		const hasIndex = ( index !== null );

		if ( hasIndex === true ) {

			this._setupIndexBuffer( passEncoder, index );

		}

		// vertex buffers

		this._setupVertexBuffers( passEncoder, geometry.attributes );

		// draw

		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		if ( hasIndex === true ) {

			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			passEncoder.drawIndexed( indexCount, 1, firstVertex, 0, 0 );

			info.update( object, indexCount );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			passEncoder.draw( vertexCount, 1, firstVertex, 0 );

			info.update( object, vertexCount );

		}

	}

	_setupIndexBuffer( encoder, index ) {

		const buffer = this._attributes.get( index ).buffer;
		const indexFormat = ( index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

		encoder.setIndexBuffer( buffer, indexFormat );

	}

	_setupVertexBuffers( encoder, geometryAttributes ) {

		let slot = 0;

		for ( const name in geometryAttributes ) {

			const attribute = geometryAttributes[ name ];
			const buffer = this._attributes.get( attribute ).buffer;

			encoder.setVertexBuffer( slot, buffer );

			slot ++;

		}

	}

	_setupDepthBuffer() {

		const device = this._device;

		if ( device ) {

			if ( this._depthBuffer ) this._depthBuffer.destroy();

			this._depthBuffer = this._device.createTexture( {
				size: {
					width: this._width * this._pixelRatio,
					height: this._height * this._pixelRatio,
					depth: 1
				},
				format: GPUTextureFormat.Depth24PlusStencil8,
				usage: GPUTextureUsage.OUTPUT_ATTACHMENT
			} );

		}

	}

}

async function initWebGPU( scope ) {

	const parameters = scope.parameters;

	const adapterOptions = {
		powerPreference: ( parameters.powerPreference !== undefined ) ? parameters.powerPreference : undefined
	};

	const adapter = await navigator.gpu.requestAdapter( adapterOptions );

	const deviceDescriptor = {
		enabledExtensions: ( parameters.enabledExtensions !== undefined ) ? parameters.enabledExtensions : [],
		limits: ( parameters.limits !== undefined ) ? parameters.limits : {}
	};

	const device = await adapter.requestDevice( deviceDescriptor );

	const glslang = await import( 'https://cdn.jsdelivr.net/npm/@webgpu/glslang@0.0.15/dist/web-devel/glslang.js' );
	const compiler = await glslang.default();

	const context = ( parameters.context !== undefined ) ? parameters.context : scope.domElement.getContext( 'gpupresent' );

	const swapChain = context.configureSwapChain( {
		device: device,
		format: GPUTextureFormat.BRGA8Unorm
	} );

	scope._adapter = adapter;
	scope._device = device;
	scope._context = context;
	scope._swapChain = swapChain;

	scope._info = new WebGPUInfo();
	scope._properties = new WebGPUProperties();
	scope._attributes = new WebGPUAttributes( device );
	scope._geometries = new WebGPUGeometries( scope._attributes, scope._info );
	scope._textures = new WebGPUTextures( device, scope._properties );
	scope._bindings = new WebGPUBindings( device, scope._info, scope._properties, scope._textures );
	scope._objects = new WebGPUObjects( scope._geometries, scope._info );
	scope._renderPipelines = new WebGPURenderPipelines( device, compiler, scope._bindings );
	scope._renderLists = new WebGPURenderLists();
	scope._background = new WebGPUBackground( scope );

	//

	scope._renderPassDescriptor = {
		colorAttachments: [ {
			attachment: null
		} ],
		 depthStencilAttachment: {
			attachment: null,
			depthStoreOp: GPUStoreOp.Store,
			stencilStoreOp: GPUStoreOp.Store
		}
	};

	scope._setupDepthBuffer();

}

export default WebGPURenderer;
