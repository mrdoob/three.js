import { GPUIndexFormat, GPUTextureFormat, GPUFeatureName, GPULoadOp } from './constants.js';
import WebGPUAnimation from './WebGPUAnimation.js';
import WebGPURenderObjects from './WebGPURenderObjects.js';
import WebGPUAttributes from './WebGPUAttributes.js';
import WebGPUGeometries from './WebGPUGeometries.js';
import WebGPUInfo from './WebGPUInfo.js';
import WebGPUProperties from './WebGPUProperties.js';
import WebGPURenderPipelines from './WebGPURenderPipelines.js';
import WebGPUComputePipelines from './WebGPUComputePipelines.js';
import WebGPUBindings from './WebGPUBindings.js';
import WebGPURenderLists from './WebGPURenderLists.js';
import WebGPURenderStates from './WebGPURenderStates.js';
import WebGPUTextures from './WebGPUTextures.js';
import WebGPUBackground from './WebGPUBackground.js';
import WebGPUNodes from './nodes/WebGPUNodes.js';
import WebGPUUtils from './WebGPUUtils.js';
import { Frustum, Matrix4, Vector3, Color, SRGBColorSpace, NoToneMapping, DepthFormat } from 'three';

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

	te[ 0 ] = 2 * w;	te[ 4 ] = 0;		te[ 8 ] = 0;		te[ 12 ] = - x;
	te[ 1 ] = 0;		te[ 5 ] = 2 * h;	te[ 9 ] = 0;		te[ 13 ] = - y;
	te[ 2 ] = 0;		te[ 6 ] = 0;		te[ 10 ] = - 1 * p;	te[ 14 ] = - z;
	te[ 3 ] = 0;		te[ 7 ] = 0;		te[ 11 ] = 0;		te[ 15 ] = 1;

	return this;

};

Frustum.prototype.setFromProjectionMatrix = function ( m ) {

	const planes = this.planes;
	const me = m.elements;
	const me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
	const me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
	const me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
	const me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

	planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
	planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
	planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
	planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
	planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();
	planes[ 5 ].setComponents( me2, me6, me10, me14 ).normalize();

	return this;

};

const _frustum = new Frustum();
const _projScreenMatrix = new Matrix4();
const _vector3 = new Vector3();

class WebGPURenderer {

	constructor( parameters = {} ) {

		this.isWebGPURenderer = true;

		// public

		this.domElement = ( parameters.canvas !== undefined ) ? parameters.canvas : this._createCanvasElement();

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.outputColorSpace = SRGBColorSpace;

		this.toneMapping = NoToneMapping;
		this.toneMappingExposure = 1.0;

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
		this._renderStates = null;
		this._textures = null;
		this._background = null;

		this._animation = new WebGPUAnimation();

		this._currentRenderState = null;

		this._opaqueSort = null;
		this._transparentSort = null;

		this._clearAlpha = 1;
		this._clearColor = new Color( 0x000000 );
		this._clearDepth = 1;
		this._clearStencil = 0;

		this._renderTarget = null;

		this._initialized = false;

		// some parameters require default values other than "undefined"

		this._parameters.antialias = ( parameters.antialias === true );

		if ( this._parameters.antialias === true ) {

			this._parameters.sampleCount = ( parameters.sampleCount === undefined ) ? 4 : parameters.sampleCount;

		} else {

			this._parameters.sampleCount = 1;

		}

		this._parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

		// backwards compatibility

		this.shadow = {
			shadowMap: {}
		};

	}

	async init() {

		if ( this._initialized === true ) {

			throw new Error( 'WebGPURenderer: Device has already been initialized.' );

		}

		const parameters = this._parameters;

		const adapterOptions = {
			powerPreference: parameters.powerPreference
		};

		const adapter = await navigator.gpu.requestAdapter( adapterOptions );

		if ( adapter === null ) {

			throw new Error( 'WebGPURenderer: Unable to create WebGPU adapter.' );

		}

		// feature support

		const features = Object.values( GPUFeatureName );

		const supportedFeatures = [];

		for ( const name of features ) {

			if ( adapter.features.has( name ) ) {

				supportedFeatures.push( name );

			}

		}

		const deviceDescriptor = {
			requiredFeatures: supportedFeatures,
			requiredLimits: parameters.requiredLimits
		};

		const device = await adapter.requestDevice( deviceDescriptor );

		const context = ( parameters.context !== undefined ) ? parameters.context : this.domElement.getContext( 'webgpu' );

		this._adapter = adapter;
		this._device = device;
		this._context = context;

		this._configureContext();

		this._info = new WebGPUInfo();
		this._properties = new WebGPUProperties();
		this._attributes = new WebGPUAttributes( device );
		this._geometries = new WebGPUGeometries( this._attributes, this._properties, this._info );
		this._textures = new WebGPUTextures( device, this._properties, this._info );
		this._utils = new WebGPUUtils( this );
		this._nodes = new WebGPUNodes( this, this._properties );
		this._objects = new WebGPURenderObjects( this, this._nodes, this._geometries, this._info );
		this._computePipelines = new WebGPUComputePipelines( device, this._nodes );
		this._renderPipelines = new WebGPURenderPipelines( device, this._nodes, this._utils );
		this._bindings = this._renderPipelines.bindings = new WebGPUBindings( device, this._info, this._properties, this._textures, this._renderPipelines, this._computePipelines, this._attributes, this._nodes );
		this._renderLists = new WebGPURenderLists();
		this._renderStates = new WebGPURenderStates();
		this._background = new WebGPUBackground( this, this._properties );

		//

		this._setupColorBuffer();
		this._setupDepthBuffer();

		this._animation.setNodes( this._nodes );
		this._animation.start();

		this._initialized = true;

	}

	async render( scene, camera ) {

		if ( this._initialized === false ) await this.init();

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderState = this._currentRenderState;

		//

		const renderState = this._renderStates.get( scene, camera );
		const renderTarget = this._renderTarget;

		this._currentRenderState = renderState;

		nodeFrame.renderId ++;

		//

		if ( this._animation.isAnimating === false ) nodeFrame.update();

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

		if ( this._info.autoReset === true ) this._info.reset();

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix );

		const renderList = this._renderLists.get( scene, camera );
		renderList.init();

		this._projectObject( scene, camera, 0, renderList );

		renderList.finish();

		if ( this.sortObjects === true ) {

			renderList.sort( this._opaqueSort, this._transparentSort );

		}

		// prepare render pass descriptor

		renderState.descriptorGPU = {
			colorAttachments: [ {
				view: null
			} ],
			depthStencilAttachment: {
				view: null
			}
		};

		const colorAttachment = renderState.descriptorGPU.colorAttachments[ 0 ];
		const depthStencilAttachment = renderState.descriptorGPU.depthStencilAttachment;

		if ( renderTarget !== null ) {

			this._textures.initRenderTarget( renderTarget );

			// @TODO: Support RenderTarget with antialiasing.

			const renderTargetProperties = this._properties.get( renderTarget );

			colorAttachment.view = renderTargetProperties.colorTextureGPU.createView();
			depthStencilAttachment.view = renderTargetProperties.depthTextureGPU.createView();

			renderState.stencil = renderTarget.depthTexture ? renderTarget.depthTexture.format !== DepthFormat : true;

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

		this._nodes.updateEnvironment( scene );
		this._nodes.updateFog( scene );
		this._nodes.updateBackground( scene );
		this._nodes.updateToneMapping();

		//

		this._background.update( scene, renderList, renderState );

		// start render pass

		const device = this._device;

		renderState.encoderGPU = device.createCommandEncoder( {} );
		renderState.currentPassGPU = renderState.encoderGPU.beginRenderPass( renderState.descriptorGPU );

		// global rasterization settings for all renderable objects

		const vp = this._viewport;

		if ( vp !== null ) {

			const width = Math.floor( vp.width * this._pixelRatio );
			const height = Math.floor( vp.height * this._pixelRatio );

			renderState.currentPassGPU.setViewport( vp.x, vp.y, width, height, vp.minDepth, vp.maxDepth );

		}

		const sc = this._scissor;

		if ( sc !== null ) {

			const width = Math.floor( sc.width * this._pixelRatio );
			const height = Math.floor( sc.height * this._pixelRatio );

			renderState.currentPassGPU.setScissorRect( sc.x, sc.y, width, height );

		}

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const lightsNode = renderList.lightsNode;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, scene, lightsNode, renderState );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, scene, lightsNode, renderState );

		// finish render pass

		renderState.currentPassGPU.end();

		device.queue.submit( [ renderState.encoderGPU.finish() ] );

		// restore render tree

		nodeFrame.renderId = previousRenderId;
		this._currentRenderState = previousRenderState;

	}

	setAnimationLoop( callback ) {

		if ( this._initialized === false ) this.init();

		const animation = this._animation;

		animation.setAnimationLoop( callback );

		( callback === null ) ? animation.stop() : animation.start();

	}

	async getArrayBuffer( attribute ) {

		return await this._attributes.getArrayBuffer( attribute );

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

	copyFramebufferToRenderTarget( renderTarget ) {

		const renderState = this._currentRenderState;
		const { encoderGPU, descriptorGPU } = renderState;

		const texture = renderTarget.texture;
		texture.internalFormat = GPUTextureFormat.BGRA8Unorm;

		this._textures.initRenderTarget( renderTarget );

		const sourceGPU = this._context.getCurrentTexture();
		const destinationGPU = this._textures.getTextureGPU( texture );

		renderState.currentPassGPU.end();

		encoderGPU.copyTextureToTexture(
			{
			  texture: sourceGPU
			},
			{
			  texture: destinationGPU
			},
			[
				texture.image.width,
				texture.image.height
			]
		);

		descriptorGPU.colorAttachments[ 0 ].loadOp = GPULoadOp.Load;
		if ( renderState.depth ) descriptorGPU.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
		if ( renderState.stencil ) descriptorGPU.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

		renderState.currentPassGPU = encoderGPU.beginRenderPass( descriptorGPU );

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

		if ( this._background ) this._background.clear();

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
		this._renderStates.dispose();
		this._textures.dispose();

		this.setRenderTarget( null );
		this.setAnimationLoop( null );

	}

	setRenderTarget( renderTarget ) {

		this._renderTarget = renderTarget;

	}

	async compute( ...computeNodes ) {

		if ( this._initialized === false ) await this.init();

		const device = this._device;
		const computePipelines = this._computePipelines;

		const cmdEncoder = device.createCommandEncoder( {} );
		const passEncoder = cmdEncoder.beginComputePass();

		for ( const computeNode of computeNodes ) {

			// onInit

			if ( computePipelines.has( computeNode ) === false ) {

				computeNode.onInit( { renderer: this } );

			}

			// pipeline

			const pipeline = computePipelines.get( computeNode );
			passEncoder.setPipeline( pipeline );

			// node

			//this._nodes.update( computeNode );

			// bind group

			const bindGroup = this._bindings.getForCompute( computeNode ).group;
			this._bindings.update( computeNode );
			passEncoder.setBindGroup( 0, bindGroup );

			passEncoder.dispatchWorkgroups( computeNode.dispatchCount );

		}

		passEncoder.end();
		device.queue.submit( [ cmdEncoder.finish() ] );

	}

	getRenderTarget() {

		return this._renderTarget;

	}

	hasFeature( name ) {

		if ( this._initialized === false ) {

			throw new Error( 'THREE.WebGPURenderer: Renderer must be initialized before testing features.' );

		}

		//

		const features = Object.values( GPUFeatureName );

		if ( features.includes( name ) === false ) {

			throw new Error( 'THREE.WebGPURenderer: Unknown WebGPU GPU feature: ' + name );

		}

		//

		return this._adapter.features.has( name );

	}

	_projectObject( object, camera, groupOrder, renderList ) {

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				renderList.pushLight( object );

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || _frustum.intersectsSprite( object ) ) {

					if ( this.sortObjects === true ) {

						_vector3.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const geometry = object.geometry;
					const material = object.material;

					if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			} else if ( object.isLineLoop ) {

				console.error( 'THREE.WebGPURenderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

					const geometry = object.geometry;
					const material = object.material;

					if ( this.sortObjects === true ) {

						if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

						_vector3
							.copy( geometry.boundingSphere.center )
							.applyMatrix4( object.matrixWorld )
							.applyMatrix4( _projScreenMatrix );

					}

					if ( Array.isArray( material ) ) {

						const groups = geometry.groups;

						for ( let i = 0, l = groups.length; i < l; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								renderList.push( object, geometry, groupMaterial, groupOrder, _vector3.z, group );

							}

						}

					} else if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this._projectObject( children[ i ], camera, groupOrder, renderList );

		}

	}

	_renderObjects( renderList, camera, scene, lightsNode ) {

		// process renderable objects

		for ( let i = 0, il = renderList.length; i < il; i ++ ) {

			const renderItem = renderList[ i ];

			// @TODO: Add support for multiple materials per object. This will require to extract
			// the material from the renderItem object and pass it with its group data to _renderObject().

			const { object, geometry, material, group } = renderItem;

			if ( camera.isArrayCamera ) {

				const cameras = camera.cameras;

				for ( let j = 0, jl = cameras.length; j < jl; j ++ ) {

					const camera2 = cameras[ j ];

					if ( object.layers.test( camera2.layers ) ) {

						const vp = camera2.viewport;
						const minDepth = ( vp.minDepth === undefined ) ? 0 : vp.minDepth;
						const maxDepth = ( vp.maxDepth === undefined ) ? 1 : vp.maxDepth;

						this._currentRenderState.currentPassGPU.setViewport( vp.x, vp.y, vp.width, vp.height, minDepth, maxDepth );

						this._renderObject( object, scene, camera2, geometry, material, group, lightsNode );

					}

				}

			} else {

				this._renderObject( object, scene, camera, geometry, material, group, lightsNode );

			}

		}

	}

	_renderObject( object, scene, camera, geometry, material, group, lightsNode ) {

		material = scene.overrideMaterial !== null ? scene.overrideMaterial : material;

		//

		object.onBeforeRender( this, scene, camera, geometry, material, group );

		//

		const renderObject = this._getRenderObject( object, material, scene, camera, lightsNode );

		//

		this._nodes.updateBefore( renderObject );

		//

		const passEncoder = this._currentRenderState.currentPassGPU;
		const info = this._info;

		//

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		// updates

		this._nodes.update( renderObject );
		this._geometries.update( renderObject );
		this._bindings.update( renderObject );

		// pipeline

		const renderPipeline = this._renderPipelines.get( renderObject );
		passEncoder.setPipeline( renderPipeline.pipeline );

		// bind group

		const bindGroup = this._bindings.get( renderObject ).group;
		passEncoder.setBindGroup( 0, bindGroup );

		// index

		const index = this._geometries.getIndex( renderObject );

		const hasIndex = ( index !== null );

		if ( hasIndex === true ) {

			this._setupIndexBuffer( index, passEncoder );

		}

		// vertex buffers

		this._setupVertexBuffers( geometry.attributes, passEncoder, renderPipeline );

		// draw

		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		const instanceCount = geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.isInstancedMesh ? object.count : 1 );

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

	_getRenderObject( object, material, scene, camera, lightsNode ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode );
		const renderObjectProperties = this._properties.get( renderObject );

		if ( renderObjectProperties.initialized !== true ) {

			renderObjectProperties.initialized = true;

			const dispose = () => {

				this._renderPipelines.remove( renderObject );
				this._nodes.remove( renderObject );
				this._properties.remove( renderObject );

				this._objects.remove( object, material, scene, camera, lightsNode );

				renderObject.material.removeEventListener( 'dispose', dispose );

			};

			renderObject.material.addEventListener( 'dispose', dispose );

		}

		const cacheKey = renderObject.getCacheKey();

		if ( renderObjectProperties.cacheKey !== cacheKey ) {

			renderObjectProperties.cacheKey = cacheKey;

			this._renderPipelines.remove( renderObject );
			this._nodes.remove( renderObject );

		}

		return renderObject;

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
				label: 'colorBuffer',
				size: {
					width: Math.floor( this._width * this._pixelRatio ),
					height: Math.floor( this._height * this._pixelRatio ),
					depthOrArrayLayers: 1
				},
				sampleCount: this._parameters.sampleCount,
				format: GPUTextureFormat.BGRA8Unorm,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
			} );

		}

	}

	_setupDepthBuffer() {

		const device = this._device;

		if ( device ) {

			if ( this._depthBuffer ) this._depthBuffer.destroy();

			this._depthBuffer = this._device.createTexture( {
				label: 'depthBuffer',
				size: {
					width: Math.floor( this._width * this._pixelRatio ),
					height: Math.floor( this._height * this._pixelRatio ),
					depthOrArrayLayers: 1
				},
				sampleCount: this._parameters.sampleCount,
				format: GPUTextureFormat.Depth24PlusStencil8,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
			} );

		}

	}

	_configureContext() {

		const device = this._device;

		if ( device ) {

			this._context.configure( {
				device: device,
				format: GPUTextureFormat.BGRA8Unorm,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
				alphaMode: 'premultiplied'
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
