import { Plane, Matrix3, Vector4, DynamicDrawUsage, Uint32BufferAttribute, Uint16BufferAttribute, Color, Vector2, Vector3, Matrix4, EventDispatcher, MathUtils, LinearSRGBColorSpace, SRGBColorSpace, StaticDrawUsage, InterleavedBuffer, InterleavedBufferAttribute, InstancedInterleavedBuffer, DataArrayTexture, FloatType, WebGPUCoordinateSystem, DepthTexture, NearestFilter, LessCompare, FramebufferTexture, LinearMipmapLinearFilter, ShaderMaterial, NoColorSpace, Material, WebGLCubeRenderTarget, BoxGeometry, BackSide, NoBlending, Mesh, Scene, LinearFilter, CubeCamera, RenderTarget, Float16BufferAttribute, REVISION, TangentSpaceNormalMap, ObjectSpaceNormalMap, NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, HalfFloatType, OrthographicCamera, BufferGeometry, Float32BufferAttribute, PointLight, DirectionalLight, SpotLight, AmbientLight, HemisphereLight, PointsMaterial, LineBasicMaterial, LineDashedMaterial, MeshNormalMaterial, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial, SpriteMaterial, MaterialLoader, DepthStencilFormat, DepthFormat, UnsignedInt248Type, UnsignedIntType, UnsignedByteType, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeReflectionMapping, CubeRefractionMapping, SphereGeometry, Frustum, DoubleSide, FrontSide, DataTexture, IntType, RedFormat, RGFormat, RGBAFormat, createCanvasElement, AddEquation, SubtractEquation, ReverseSubtractEquation, ZeroFactor, OneFactor, SrcColorFactor, SrcAlphaFactor, SrcAlphaSaturateFactor, DstColorFactor, DstAlphaFactor, OneMinusSrcColorFactor, OneMinusSrcAlphaFactor, OneMinusDstColorFactor, OneMinusDstAlphaFactor, CullFaceNone, CullFaceBack, CullFaceFront, CustomBlending, MultiplyBlending, SubtractiveBlending, AdditiveBlending, NormalBlending, NotEqualDepth, GreaterDepth, GreaterEqualDepth, EqualDepth, LessEqualDepth, LessDepth, AlwaysDepth, NeverDepth, UnsignedShort4444Type, UnsignedShort5551Type, ByteType, ShortType, UnsignedShortType, AlphaFormat, LuminanceFormat, LuminanceAlphaFormat, RedIntegerFormat, RGIntegerFormat, RGBAIntegerFormat, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGB_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_PVRTC_2BPPV1_Format, RGB_ETC1_Format, RGB_ETC2_Format, RGBA_ETC2_EAC_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_BPTC_Format, RED_RGTC1_Format, SIGNED_RED_RGTC1_Format, RED_GREEN_RGTC2_Format, SIGNED_RED_GREEN_RGTC2_Format, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearMipmapNearestFilter, NeverCompare, AlwaysCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare, WebGLCoordinateSystem, Texture, CubeTexture, NotEqualStencilFunc, GreaterStencilFunc, GreaterEqualStencilFunc, EqualStencilFunc, LessEqualStencilFunc, LessStencilFunc, AlwaysStencilFunc, NeverStencilFunc, DecrementWrapStencilOp, IncrementWrapStencilOp, DecrementStencilOp, IncrementStencilOp, InvertStencilOp, ReplaceStencilOp, ZeroStencilOp, KeepStencilOp, MaxEquation, MinEquation } from 'three';

if ( self.GPUShaderStage === undefined ) {

	self.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };

}

// statics

let isAvailable = navigator.gpu !== undefined;


if ( typeof window !== 'undefined' && isAvailable ) {

	isAvailable = await navigator.gpu.requestAdapter();

}

class WebGPU {

	static isAvailable() {

		return Boolean( isAvailable );

	}

	static getStaticAdapter() {

		return isAvailable;

	}

	static getErrorMessage() {

		const message = 'Your browser does not support <a href="https://gpuweb.github.io/gpuweb/" style="color:blue">WebGPU</a> yet';

		const element = document.createElement( 'div' );
		element.id = 'webgpumessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.maxWidth = '400px';
		element.style.margin = '5em auto 0';

		element.innerHTML = message;

		return element;

	}

}

class Animation {

	constructor( nodes, info ) {

		this.nodes = nodes;
		this.info = info;

		this.animationLoop = null;
		this.requestId = null;

		this._init();

	}

	_init() {

		const update = ( time, frame ) => {

			this.requestId = self.requestAnimationFrame( update );

			this.nodes.nodeFrame.update();

			this.info.frame = this.nodes.nodeFrame.frameId;

			if ( this.animationLoop !== null ) this.animationLoop( time, frame );

		};

		update();

	}

	dispose() {

		self.cancelAnimationFrame( this.requestId );

	}

	setAnimationLoop( callback ) {

		this.animationLoop = callback;

	}

}

class ChainMap {

	constructor() {

		this.weakMap = new WeakMap();

	}

	get( keys ) {

		if ( Array.isArray( keys ) ) {

			let map = this.weakMap;

			for ( let i = 0; i < keys.length; i ++ ) {

				map = map.get( keys[ i ] );

				if ( map === undefined ) return undefined;

			}

			return map.get( keys[ keys.length - 1 ] );

		} else {

			return super.get( keys );

		}

	}

	set( keys, value ) {

		if ( Array.isArray( keys ) ) {

			let map = this.weakMap;

			for ( let i = 0; i < keys.length; i ++ ) {

				const key = keys[ i ];

				if ( map.has( key ) === false ) map.set( key, new WeakMap() );

				map = map.get( key );

			}

			return map.set( keys[ keys.length - 1 ], value );

		} else {

			return super.set( keys, value );

		}

	}

	delete( keys ) {

		if ( Array.isArray( keys ) ) {

			let map = this.weakMap;

			for ( let i = 0; i < keys.length; i ++ ) {

				map = map.get( keys[ i ] );

				if ( map === undefined ) return false;

			}

			return map.delete( keys[ keys.length - 1 ] );

		} else {

			return super.delete( keys );

		}

	}

	dispose() {

		this.weakMap.clear();

	}

}

const _plane = new Plane();
const _viewNormalMatrix = new Matrix3();

let _clippingContextVersion = 0;

class ClippingContext {

	constructor() {

		this.version = ++ _clippingContextVersion;

		this.globalClippingCount = 0;

		this.localClippingCount = 0;
		this.localClippingEnabled = false;
		this.localClipIntersection = false;

		this.planes = [];

		this.parentVersion = 0;

	}

	projectPlanes( source, offset ) {

		const l = source.length;
		const planes = this.planes;

		for ( let i = 0; i < l; i ++ ) {

			_plane.copy( source[ i ] ).applyMatrix4( this.viewMatrix, _viewNormalMatrix );

			const v = planes[ offset + i ];
			const normal = _plane.normal;

			v.x = - normal.x;
			v.y = - normal.y;
			v.z = - normal.z;
			v.w = _plane.constant;

		}

	}

	updateGlobal( renderer, camera ) {

		const rendererClippingPlanes = renderer.clippingPlanes;
		this.viewMatrix = camera.matrixWorldInverse;

		_viewNormalMatrix.getNormalMatrix( this.viewMatrix );

		let update = false;

		if ( Array.isArray( rendererClippingPlanes ) && rendererClippingPlanes.length !== 0 ) {

			const l = rendererClippingPlanes.length;

			if ( l !== this.globalClippingCount ) {

				const planes = [];

				for ( let i = 0; i < l; i ++ ) {

					planes.push( new Vector4() );

				}

				this.globalClippingCount = l;
				this.planes = planes;

				update = true;

			}

			this.projectPlanes( rendererClippingPlanes, 0 );

		} else if ( this.globalClippingCount !== 0 ) {

			this.globalClippingCount = 0;
			this.planes = [];
			update = true;

		}

		if ( renderer.localClippingEnabled !== this.localClippingEnabled ) {

			this.localClippingEnabled = renderer.localClippingEnabled;
			update = true;

		}

		if ( update ) this.version = _clippingContextVersion ++;

	}

	update( parent, material ) {

		let update = false;

		if ( this !== parent && parent.version !== this.parentVersion ) {

			this.globalClippingCount =  material.isShadowNodeMaterial ? 0 : parent.globalClippingCount;
			this.localClippingEnabled = parent.localClippingEnabled;
			this.planes = Array.from( parent.planes );
			this.parentVersion = parent.version;
			this.viewMatrix = parent.viewMatrix;


			update = true;

		}

		if ( this.localClippingEnabled ) {

			const localClippingPlanes = material.clippingPlanes;

			if ( ( Array.isArray( localClippingPlanes ) && localClippingPlanes.length !== 0 ) ) {

				const l = localClippingPlanes.length;
				const planes = this.planes;
				const offset = this.globalClippingCount;

				if ( update || l !== this.localClippingCount ) {

					planes.length = offset + l;

					for ( let i = 0; i < l; i ++ ) {

						planes[ offset + i ] = new Vector4();

					}

					this.localClippingCount = l;
					update = true;

				}

				this.projectPlanes( localClippingPlanes, offset );


			} else if ( this.localClippingCount !== 0 ) {

				this.localClippingCount = 0;
				update = true;

			}

			if ( this.localClipIntersection !== material.clipIntersection ) {

				this.localClipIntersection = material.clipIntersection;
				update = true;

			}

		}

		if ( update ) this.version = _clippingContextVersion ++;

	}

}

let id$4 = 0;

class RenderObject {

	constructor( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext ) {

		this._nodes = nodes;
		this._geometries = geometries;

		this.id = id$4 ++;

		this.renderer = renderer;
		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;
		this.context = renderContext;

		this.geometry = object.geometry;
		this.version = material.version;

		this.attributes = null;
		this.pipeline = null;
		this.vertexBuffers = null;

		this.updateClipping( renderContext.clippingContext );

		this.clippingContextVersion = this.clippingContext.version;

		this.initialNodesCacheKey = this.getNodesCacheKey();
		this.initialCacheKey = this.getCacheKey();

		this._nodeBuilderState = null;
		this._bindings = null;

		this.onDispose = null;

		this.isRenderObject = true;

		this.onMaterialDispose = () => {

			this.dispose();

		};

		this.material.addEventListener( 'dispose', this.onMaterialDispose );

	}

	updateClipping( parent ) {

		const material = this.material;

		let clippingContext = this.clippingContext;

		if ( Array.isArray( material.clippingPlanes ) ) {

			if ( clippingContext === parent || ! clippingContext ) {

				clippingContext = new ClippingContext();
				this.clippingContext = clippingContext;

			}

			clippingContext.update( parent, material );

		} else if ( this.clippingContext !== parent ) {

			this.clippingContext = parent;

		}

	}

	clippingNeedsUpdate () {

		if ( this.clippingContext.version === this.clippingContextVersion ) return false;

		this.clippingContextVersion = this.clippingContext.version;

		return true;

	}

	getNodeBuilderState() {

		return this._nodeBuilderState || ( this._nodeBuilderState = this._nodes.getForRender( this ) );

	}

	getBindings() {

		return this._bindings || ( this._bindings = this.getNodeBuilderState().createBindings() );

	}

	getIndex() {

		return this._geometries.getIndex( this );

	}

	getChainArray() {

		return [ this.object, this.material, this.context, this.lightsNode ];

	}

	getAttributes() {

		if ( this.attributes !== null ) return this.attributes;

		const nodeAttributes = this.getNodeBuilderState().nodeAttributes;
		const geometry = this.geometry;

		const attributes = [];
		const vertexBuffers = new Set();

		for ( const nodeAttribute of nodeAttributes ) {

			const attribute = nodeAttribute.node && nodeAttribute.node.attribute ? nodeAttribute.node.attribute : geometry.getAttribute( nodeAttribute.name );

			if ( attribute === undefined ) continue;

			attributes.push( attribute );

			const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
			vertexBuffers.add( bufferAttribute );

		}

		this.attributes = attributes;
		this.vertexBuffers = Array.from( vertexBuffers.values() );

		return attributes;

	}

	getVertexBuffers() {

		if ( this.vertexBuffers === null ) this.getAttributes();

		return this.vertexBuffers;

	}

	getMaterialCacheKey() {

		const { object, material } = this;

		let cacheKey = material.customProgramCacheKey();

		for ( const property in material ) {

			if ( /^(is[A-Z])|^(visible|version|uuid|name|opacity|userData)$/.test( property ) ) continue;

			let value = material[ property ];

			if ( value !== null ) {

				const type = typeof value;

				if ( type === 'number' ) value = value !== 0 ? '1' : '0'; // Convert to on/off, important for clearcoat, transmission, etc
				else if ( type === 'object' ) value = '{}';

			}

			cacheKey += /*property + ':' +*/ value + ',';

		}

		cacheKey += this.clippingContextVersion + ',';

		if ( object.skeleton ) {

			cacheKey += object.skeleton.bones.length + ',';

		}

		if ( object.morphTargetInfluences ) {

			cacheKey += object.morphTargetInfluences.length + ',';

		}

		return cacheKey;

	}

	get needsUpdate() {

		return this.initialNodesCacheKey !== this.getNodesCacheKey();

	}

	getNodesCacheKey() {

		// Environment Nodes Cache Key

		return this._nodes.getCacheKey( this.scene, this.lightsNode );

	}

	getCacheKey() {

		return this.getMaterialCacheKey() + ',' + this.getNodesCacheKey();

	}

	dispose() {

		this.material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.onDispose();

	}

}

class RenderObjects {

	constructor( renderer, nodes, geometries, pipelines, bindings, info ) {

		this.renderer = renderer;
		this.nodes = nodes;
		this.geometries = geometries;
		this.pipelines = pipelines;
		this.bindings = bindings;
		this.info = info;

		this.chainMaps = {};

	}

	get( object, material, scene, camera, lightsNode, renderContext, passId ) {

		const chainMap = this.getChainMap( passId );
		const chainArray = [ object, material, renderContext, lightsNode ];

		let renderObject = chainMap.get( chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, renderContext, passId );

			chainMap.set( chainArray, renderObject );

		} else {

			renderObject.updateClipping( renderContext.clippingContext );

			if ( renderObject.version !== material.version || renderObject.needsUpdate || renderObject.clippingNeedsUpdate() ) {

				if ( renderObject.initialCacheKey !== renderObject.getCacheKey() ) {

					renderObject.dispose();

					renderObject = this.get( object, material, scene, camera, lightsNode, renderContext, passId );

				} else {

					renderObject.version = material.version;

				}

			}

		}

		return renderObject;

	}

	getChainMap( passId = 'default' ) {

		return this.chainMaps[ passId ] || ( this.chainMaps[ passId ] = new ChainMap() );

	}

	dispose() {

		this.chainMaps = {};

	}

	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, passId ) {

		const chainMap = this.getChainMap( passId );

		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext );

		renderObject.onDispose = () => {

			this.pipelines.delete( renderObject );
			this.bindings.delete( renderObject );
			this.nodes.delete( renderObject );

			chainMap.delete( renderObject.getChainArray() );

		};

		return renderObject;

	}


}

class DataMap {

	constructor() {

		this.data = new WeakMap();

	}

	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	delete( object ) {

		let map;

		if ( this.data.has( object ) ) {

			map = this.data.get( object );

			this.data.delete( object );

		}

		return map;

	}

	has( object ) {

		return this.data.has( object );

	}

	dispose() {

		this.data = new WeakMap();

	}

}

const AttributeType = {
	VERTEX: 1,
	INDEX: 2,
	STORAGE: 4
};

// size of a chunk in bytes (STD140 layout)

const GPU_CHUNK_BYTES = 16;

// @TODO: Move to src/constants.js

const BlendColorFactor = 211;
const OneMinusBlendColorFactor = 212;

class Attributes extends DataMap {

	constructor( backend ) {

		super();

		this.backend = backend;

	}

	delete( attribute ) {

		const attributeData = super.delete( attribute );

		if ( attributeData !== undefined ) {

			this.backend.destroyAttribute( attribute );

		}

	}

	update( attribute, type ) {

		const data = this.get( attribute );

		if ( data.version === undefined ) {

			if ( type === AttributeType.VERTEX ) {

				this.backend.createAttribute( attribute );

			} else if ( type === AttributeType.INDEX ) {

				this.backend.createIndexAttribute( attribute );

			} else if ( type === AttributeType.STORAGE ) {

				this.backend.createStorageAttribute( attribute );

			}

			data.version = this._getBufferAttribute( attribute ).version;

		} else {

			const bufferAttribute = this._getBufferAttribute( attribute );

			if ( data.version < bufferAttribute.version || bufferAttribute.usage === DynamicDrawUsage ) {

				this.backend.updateAttribute( attribute );

				data.version = bufferAttribute.version;

			}

		}

	}

	_getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

}

function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

function getWireframeVersion( geometry ) {

	return ( geometry.index !== null ) ? geometry.index.version : geometry.attributes.position.version;

}

function getWireframeIndex( geometry ) {

	const indices = [];

	const geometryIndex = geometry.index;
	const geometryPosition = geometry.attributes.position;

	if ( geometryIndex !== null ) {

		const array = geometryIndex.array;

		for ( let i = 0, l = array.length; i < l; i += 3 ) {

			const a = array[ i + 0 ];
			const b = array[ i + 1 ];
			const c = array[ i + 2 ];

			indices.push( a, b, b, c, c, a );

		}

	} else {

		const array = geometryPosition.array;

		for ( let i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3 ) {

			const a = i + 0;
			const b = i + 1;
			const c = i + 2;

			indices.push( a, b, b, c, c, a );

		}

	}

	const attribute = new ( arrayNeedsUint32( indices ) ? Uint32BufferAttribute : Uint16BufferAttribute )( indices, 1 );
	attribute.version = getWireframeVersion( geometry );

	return attribute;

}

class Geometries extends DataMap {

	constructor( attributes, info ) {

		super();

		this.attributes = attributes;
		this.info = info;

		this.wireframes = new WeakMap();
		this.attributeCall = new WeakMap();

	}

	has( renderObject ) {

		const geometry = renderObject.geometry;

		return super.has( geometry ) && this.get( geometry ).initialized === true;

	}

	updateForRender( renderObject ) {

		if ( this.has( renderObject ) === false ) this.initGeometry( renderObject );

		this.updateAttributes( renderObject );

	}

	initGeometry( renderObject ) {

		const geometry = renderObject.geometry;
		const geometryData = this.get( geometry );

		geometryData.initialized = true;

		this.info.memory.geometries ++;

		const onDispose = () => {

			this.info.memory.geometries --;

			const index = geometry.index;
			const geometryAttributes = renderObject.getAttributes();

			if ( index !== null ) {

				this.attributes.delete( index );

			}

			for ( const geometryAttribute of geometryAttributes ) {

				this.attributes.delete( geometryAttribute );

			}

			const wireframeAttribute = this.wireframes.get( geometry );

			if ( wireframeAttribute !== undefined ) {

				this.attributes.delete( wireframeAttribute );

			}

			geometry.removeEventListener( 'dispose', onDispose );

		};

		geometry.addEventListener( 'dispose', onDispose );

	}

	updateAttributes( renderObject ) {

		const attributes = renderObject.getAttributes();

		for ( const attribute of attributes ) {

			this.updateAttribute( attribute, AttributeType.VERTEX );

		}

		const index = this.getIndex( renderObject );

		if ( index !== null ) {

			this.updateAttribute( index, AttributeType.INDEX );

		}

	}

	updateAttribute( attribute, type ) {

		const callId = this.info.render.calls;

		if ( this.attributeCall.get( attribute ) !== callId ) {

			this.attributes.update( attribute, type );

			this.attributeCall.set( attribute, callId );

		}

	}

	getIndex( renderObject ) {

		const { geometry, material } = renderObject;

		let index = geometry.index;

		if ( material.wireframe === true ) {

			const wireframes = this.wireframes;

			let wireframeAttribute = wireframes.get( geometry );

			if ( wireframeAttribute === undefined ) {

				wireframeAttribute = getWireframeIndex( geometry );

				wireframes.set( geometry, wireframeAttribute );

			} else if ( wireframeAttribute.version !== getWireframeVersion( geometry ) ) {

				this.attributes.delete( wireframeAttribute );

				wireframeAttribute = getWireframeIndex( geometry );

				wireframes.set( geometry, wireframeAttribute );

			}

			index = wireframeAttribute;

		}

		return index;

	}

}

class Info {

	constructor() {

		this.autoReset = true;

		this.frame = 0;
		this.calls = 0;

		this.render = {
			calls: 0,
			drawCalls: 0,
			triangles: 0,
			points: 0,
			lines: 0
		};

		this.compute = {
			calls: 0,
			computeCalls: 0
		};

		this.memory = {
			geometries: 0,
			textures: 0
		};

		this.timestamp = {
			compute: 0,
			render: 0
		};

	}

	update( object, count, instanceCount ) {

		this.render.drawCalls ++;

		if ( object.isMesh || object.isSprite ) {

			this.render.triangles += instanceCount * ( count / 3 );

		} else if ( object.isPoints ) {

			this.render.points += instanceCount * count;

		} else if ( object.isLineSegments ) {

			this.render.lines += instanceCount * ( count / 2 );

		} else if ( object.isLine ) {

			this.render.lines += instanceCount * ( count - 1 );

		} else {

			console.error( 'THREE.WebGPUInfo: Unknown object type.' );

		}

	}

	updateTimestamp( type, time ) {

		this.timestamp[ type ] += time;

	}

	resetCompute() {

		this.compute.computeCalls = 0;

		this.timestamp.compute = 0;

	}

	reset() {

		this.render.drawCalls = 0;
		this.render.triangles = 0;
		this.render.points = 0;
		this.render.lines = 0;

		this.timestamp.render = 0;

	}

	dispose() {

		this.reset();

		this.calls = 0;

		this.render.calls = 0;
		this.compute.calls = 0;

		this.timestamp.compute = 0;
		this.timestamp.render = 0;
		this.memory.geometries = 0;
		this.memory.textures = 0;

	}

}

class Pipeline {

	constructor( cacheKey ) {

		this.cacheKey = cacheKey;

		this.usedTimes = 0;

	}

}

class RenderPipeline extends Pipeline {

	constructor( cacheKey, vertexProgram, fragmentProgram ) {

		super( cacheKey );

		this.vertexProgram = vertexProgram;
		this.fragmentProgram = fragmentProgram;

	}

}

class ComputePipeline extends Pipeline {

	constructor( cacheKey, computeProgram ) {

		super( cacheKey );

		this.computeProgram = computeProgram;

		this.isComputePipeline = true;

	}

}

let _id$3 = 0;

class ProgrammableStage {

	constructor( code, type, transforms = null, attributes = null ) {

		this.id = _id$3 ++;

		this.code = code;
		this.stage = type;
		this.transforms = transforms;
		this.attributes = attributes;

		this.usedTimes = 0;

	}

}

class Pipelines extends DataMap {

	constructor( backend, nodes ) {

		super();

		this.backend = backend;
		this.nodes = nodes;

		this.bindings = null; // set by the bindings

		this.caches = new Map();
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	getForCompute( computeNode, bindings ) {

		const { backend } = this;

		const data = this.get( computeNode );

		if ( this._needsComputeUpdate( computeNode ) ) {

			const previousPipeline = data.pipeline;

			if ( previousPipeline ) {

				previousPipeline.usedTimes --;
				previousPipeline.computeProgram.usedTimes --;

			}

			// get shader

			const nodeBuilderState = this.nodes.getForCompute( computeNode );

			// programmable stage

			let stageCompute = this.programs.compute.get( nodeBuilderState.computeShader );

			if ( stageCompute === undefined ) {

				if ( previousPipeline && previousPipeline.computeProgram.usedTimes === 0 ) this._releaseProgram( previousPipeline.computeProgram );

				stageCompute = new ProgrammableStage( nodeBuilderState.computeShader, 'compute', nodeBuilderState.transforms, nodeBuilderState.nodeAttributes );
				this.programs.compute.set( nodeBuilderState.computeShader, stageCompute );

				backend.createProgram( stageCompute );

			}

			// determine compute pipeline

			const cacheKey = this._getComputeCacheKey( computeNode, stageCompute );

			let pipeline = this.caches.get( cacheKey );

			if ( pipeline === undefined ) {

				if ( previousPipeline && previousPipeline.usedTimes === 0 ) this._releasePipeline( computeNode );

				pipeline = this._getComputePipeline( computeNode, stageCompute, cacheKey, bindings );

			}

			// keep track of all used times

			pipeline.usedTimes ++;
			stageCompute.usedTimes ++;

			//

			data.version = computeNode.version;
			data.pipeline = pipeline;

		}

		return data.pipeline;

	}

	getForRender( renderObject, promises = null ) {

		const { backend } = this;

		const data = this.get( renderObject );

		if ( this._needsRenderUpdate( renderObject ) ) {

			const previousPipeline = data.pipeline;

			if ( previousPipeline ) {

				previousPipeline.usedTimes --;
				previousPipeline.vertexProgram.usedTimes --;
				previousPipeline.fragmentProgram.usedTimes --;

			}

			// get shader

			const nodeBuilderState = renderObject.getNodeBuilderState();

			// programmable stages

			let stageVertex = this.programs.vertex.get( nodeBuilderState.vertexShader );

			if ( stageVertex === undefined ) {

				if ( previousPipeline && previousPipeline.vertexProgram.usedTimes === 0 ) this._releaseProgram( previousPipeline.vertexProgram );

				stageVertex = new ProgrammableStage( nodeBuilderState.vertexShader, 'vertex' );
				this.programs.vertex.set( nodeBuilderState.vertexShader, stageVertex );

				backend.createProgram( stageVertex );

			}

			let stageFragment = this.programs.fragment.get( nodeBuilderState.fragmentShader );

			if ( stageFragment === undefined ) {

				if ( previousPipeline && previousPipeline.fragmentProgram.usedTimes === 0 ) this._releaseProgram( previousPipeline.fragmentProgram );

				stageFragment = new ProgrammableStage( nodeBuilderState.fragmentShader, 'fragment' );
				this.programs.fragment.set( nodeBuilderState.fragmentShader, stageFragment );

				backend.createProgram( stageFragment );

			}

			// determine render pipeline

			const cacheKey = this._getRenderCacheKey( renderObject, stageVertex, stageFragment );

			let pipeline = this.caches.get( cacheKey );

			if ( pipeline === undefined ) {

				if ( previousPipeline && previousPipeline.usedTimes === 0 ) this._releasePipeline( previousPipeline );

				pipeline = this._getRenderPipeline( renderObject, stageVertex, stageFragment, cacheKey, promises );

			} else {

				renderObject.pipeline = pipeline;

			}

			// keep track of all used times

			pipeline.usedTimes ++;
			stageVertex.usedTimes ++;
			stageFragment.usedTimes ++;

			//

			data.pipeline = pipeline;

		}

		return data.pipeline;

	}

	delete( object ) {

		const pipeline = this.get( object ).pipeline;

		if ( pipeline ) {

			// pipeline

			pipeline.usedTimes --;

			if ( pipeline.usedTimes === 0 ) this._releasePipeline( pipeline );

			// programs

			if ( pipeline.isComputePipeline ) {

				pipeline.computeProgram.usedTimes --;

				if ( pipeline.computeProgram.usedTimes === 0 ) this._releaseProgram( pipeline.computeProgram );

			} else {

				pipeline.fragmentProgram.usedTimes --;
				pipeline.vertexProgram.usedTimes --;

				if ( pipeline.vertexProgram.usedTimes === 0 ) this._releaseProgram( pipeline.vertexProgram );
				if ( pipeline.fragmentProgram.usedTimes === 0 ) this._releaseProgram( pipeline.fragmentProgram );

			}

		}

		super.delete( object );

	}

	dispose() {

		super.dispose();

		this.caches = new Map();
		this.programs = {
			vertex: new Map(),
			fragment: new Map(),
			compute: new Map()
		};

	}

	updateForRender( renderObject ) {

		this.getForRender( renderObject );

	}

	_getComputePipeline( computeNode, stageCompute, cacheKey, bindings ) {

		// check for existing pipeline

		cacheKey = cacheKey || this._getComputeCacheKey( computeNode, stageCompute );

		let pipeline = this.caches.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new ComputePipeline( cacheKey, stageCompute );

			this.caches.set( cacheKey, pipeline );

			this.backend.createComputePipeline( pipeline, bindings );

		}

		return pipeline;

	}

	_getRenderPipeline( renderObject, stageVertex, stageFragment, cacheKey, promises ) {

		// check for existing pipeline

		cacheKey = cacheKey || this._getRenderCacheKey( renderObject, stageVertex, stageFragment );

		let pipeline = this.caches.get( cacheKey );

		if ( pipeline === undefined ) {

			pipeline = new RenderPipeline( cacheKey, stageVertex, stageFragment );

			this.caches.set( cacheKey, pipeline );

			renderObject.pipeline = pipeline;

			this.backend.createRenderPipeline( renderObject, promises );

		}

		return pipeline;

	}

	_getComputeCacheKey( computeNode, stageCompute ) {

		return computeNode.id + ',' + stageCompute.id;

	}

	_getRenderCacheKey( renderObject, stageVertex, stageFragment ) {

		return stageVertex.id + ',' + stageFragment.id + ',' + this.backend.getRenderCacheKey( renderObject );

	}

	_releasePipeline( pipeline ) {

		this.caches.delete( pipeline.cacheKey );

	}

	_releaseProgram( program ) {

		const code = program.code;
		const stage = program.stage;

		this.programs[ stage ].delete( code );

	}

	_needsComputeUpdate( computeNode ) {

		const data = this.get( computeNode );

		return data.pipeline === undefined || data.version !== computeNode.version;

	}

	_needsRenderUpdate( renderObject ) {

		const data = this.get( renderObject );

		return data.pipeline === undefined || this.backend.needsRenderUpdate( renderObject );

	}

}

class Bindings extends DataMap {

	constructor( backend, nodes, textures, attributes, pipelines, info ) {

		super();

		this.backend = backend;
		this.textures = textures;
		this.pipelines = pipelines;
		this.attributes = attributes;
		this.nodes = nodes;
		this.info = info;

		this.pipelines.bindings = this; // assign bindings to pipelines

	}

	getForRender( renderObject ) {

		const bindings = renderObject.getBindings();

		const data = this.get( renderObject );

		if ( data.bindings !== bindings ) {

			// each object defines an array of bindings (ubos, textures, samplers etc.)

			data.bindings = bindings;

			this._init( bindings );

			this.backend.createBindings( bindings );

		}

		return data.bindings;

	}

	getForCompute( computeNode ) {

		const data = this.get( computeNode );

		if ( data.bindings === undefined ) {

			const nodeBuilderState = this.nodes.getForCompute( computeNode );

			const bindings = nodeBuilderState.bindings;

			data.bindings = bindings;

			this._init( bindings );

			this.backend.createBindings( bindings );

		}

		return data.bindings;

	}

	updateForCompute( computeNode ) {

		this._update( computeNode, this.getForCompute( computeNode ) );

	}

	updateForRender( renderObject ) {

		this._update( renderObject, this.getForRender( renderObject ) );

	}

	_init( bindings ) {

		for ( const binding of bindings ) {

			if ( binding.isSampledTexture ) {

				this.textures.updateTexture( binding.texture );

			} else if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;

				this.attributes.update( attribute, AttributeType.STORAGE );

			}

		}

	}

	_update( object, bindings ) {

		const { backend } = this;

		let needsBindingsUpdate = false;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindings ) {

			if ( binding.isNodeUniformsGroup ) {

				const updated = this.nodes.updateGroup( binding );

				if ( ! updated ) continue;

			}

			if ( binding.isUniformBuffer ) {

				const updated = binding.update();

				if ( updated ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampledTexture ) {

				const texture = binding.texture;

				if ( binding.needsBindingsUpdate ) needsBindingsUpdate = true;

				const updated = binding.update();

				if ( updated ) {

					this.textures.updateTexture( binding.texture );

				}

				if ( texture.isStorageTexture === true ) {

					const textureData = this.get( texture );

					if ( binding.store === true ) {

						textureData.needsMipmap = true;

					} else if ( texture.generateMipmaps === true && this.textures.needsMipmaps( texture ) && textureData.needsMipmap === true ) {

						this.backend.generateMipmaps( texture );

						textureData.needsMipmap = false;

					}

				}

			}

		}

		if ( needsBindingsUpdate === true ) {

			const pipeline = this.pipelines.getForRender( object );

			this.backend.updateBindings( bindings, pipeline );

		}

	}

}

const NodeShaderStage = {
	VERTEX: 'vertex',
	FRAGMENT: 'fragment'
};

const NodeUpdateType = {
	NONE: 'none',
	FRAME: 'frame',
	RENDER: 'render',
	OBJECT: 'object'
};

const defaultShaderStages = [ 'fragment', 'vertex' ];
const defaultBuildStages = [ 'setup', 'analyze', 'generate' ];
const shaderStages = [ ...defaultShaderStages, 'compute' ];
const vectorComponents = [ 'x', 'y', 'z', 'w' ];

function getCacheKey( object ) {

	let cacheKey = '{';

	if ( object.isNode === true ) {

		cacheKey += object.id;

	}

	for ( const { property, childNode } of getNodeChildren( object ) ) {

		cacheKey += ',' + property.slice( 0, - 4 ) + ':' + childNode.getCacheKey();

	}

	cacheKey += '}';

	return cacheKey;

}

function* getNodeChildren( node, toJSON = false ) {

	for ( const property in node ) {

		// Ignore private properties.
		if ( property.startsWith( '_' ) === true ) continue;

		const object = node[ property ];

		if ( Array.isArray( object ) === true ) {

			for ( let i = 0; i < object.length; i ++ ) {

				const child = object[ i ];

				if ( child && ( child.isNode === true || toJSON && typeof child.toJSON === 'function' ) ) {

					yield { property, index: i, childNode: child };

				}

			}

		} else if ( object && object.isNode === true ) {

			yield { property, childNode: object };

		} else if ( typeof object === 'object' ) {

			for ( const subProperty in object ) {

				const child = object[ subProperty ];

				if ( child && ( child.isNode === true || toJSON && typeof child.toJSON === 'function' ) ) {

					yield { property, index: subProperty, childNode: child };

				}

			}

		}

	}

}

function getValueType( value ) {

	if ( value === undefined || value === null ) return null;

	const typeOf = typeof value;

	if ( value.isNode === true ) {

		return 'node';

	} else if ( typeOf === 'number' ) {

		return 'float';

	} else if ( typeOf === 'boolean' ) {

		return 'bool';

	} else if ( typeOf === 'string' ) {

		return 'string';

	} else if ( typeOf === 'function' ) {

		return 'shader';

	} else if ( value.isVector2 === true ) {

		return 'vec2';

	} else if ( value.isVector3 === true ) {

		return 'vec3';

	} else if ( value.isVector4 === true ) {

		return 'vec4';

	} else if ( value.isMatrix3 === true ) {

		return 'mat3';

	} else if ( value.isMatrix4 === true ) {

		return 'mat4';

	} else if ( value.isColor === true ) {

		return 'color';

	} else if ( value instanceof ArrayBuffer ) {

		return 'ArrayBuffer';

	}

	return null;

}

function getValueFromType( type, ...params ) {

	const last4 = type ? type.slice( - 4 ) : undefined;

	if ( params.length === 1 ) { // ensure same behaviour as in NodeBuilder.format()

		if ( last4 === 'vec2' ) params = [ params[ 0 ], params[ 0 ] ];
		else if ( last4 === 'vec3' ) params = [ params[ 0 ], params[ 0 ], params[ 0 ] ];
		else if ( last4 === 'vec4' ) params = [ params[ 0 ], params[ 0 ], params[ 0 ], params[ 0 ] ];

	}

	if ( type === 'color' ) {

		return new Color( ...params );

	} else if ( last4 === 'vec2' ) {

		return new Vector2( ...params );

	} else if ( last4 === 'vec3' ) {

		return new Vector3( ...params );

	} else if ( last4 === 'vec4' ) {

		return new Vector4( ...params );

	} else if ( last4 === 'mat3' ) {

		return new Matrix3( ...params );

	} else if ( last4 === 'mat4' ) {

		return new Matrix4( ...params );

	} else if ( type === 'bool' ) {

		return params[ 0 ] || false;

	} else if ( ( type === 'float' ) || ( type === 'int' ) || ( type === 'uint' ) ) {

		return params[ 0 ] || 0;

	} else if ( type === 'string' ) {

		return params[ 0 ] || '';

	} else if ( type === 'ArrayBuffer' ) {

		return base64ToArrayBuffer( params[ 0 ] );

	}

	return null;

}

function arrayBufferToBase64( arrayBuffer ) {

	let chars = '';

	const array = new Uint8Array( arrayBuffer );

	for ( let i = 0; i < array.length; i ++ ) {

		chars += String.fromCharCode( array[ i ] );

	}

	return btoa( chars );

}

function base64ToArrayBuffer( base64 ) {

	return Uint8Array.from( atob( base64 ), c => c.charCodeAt( 0 ) ).buffer;

}

const NodeClasses = new Map();

let _nodeId = 0;

class Node extends EventDispatcher {

	constructor( nodeType = null ) {

		super();

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.NONE;
		this.updateBeforeType = NodeUpdateType.NONE;

		this.uuid = MathUtils.generateUUID();

		this.isNode = true;

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

	}

	get type() {

		return this.constructor.type;

	}

	getSelf() {

		// Returns non-node object.

		return this.self || this;

	}

	setReference( /*state*/ ) {

		return this;

	}

	isGlobal( /*builder*/ ) {

		return false;

	}

	* getChildren() {

		for ( const { childNode } of getNodeChildren( this ) ) {

			yield childNode;

		}

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	traverse( callback ) {

		callback( this );

		for ( const childNode of this.getChildren() ) {

			childNode.traverse( callback );

		}

	}

	getCacheKey() {

		return getCacheKey( this );

	}

	getHash( /*builder*/ ) {

		return this.uuid;

	}

	getUpdateType() {

		return this.updateType;

	}

	getUpdateBeforeType() {

		return this.updateBeforeType;

	}

	getNodeType( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		if ( nodeProperties.outputNode ) {

			return nodeProperties.outputNode.getNodeType( builder );

		}

		return this.nodeType;

	}

	getShared( builder ) {

		const hash = this.getHash( builder );
		const nodeFromHash = builder.getNodeFromHash( hash );

		return nodeFromHash || this;

	}

	setup( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		for ( const childNode of this.getChildren() ) {

			nodeProperties[ '_node' + childNode.id ] = childNode;

		}

		// return a outputNode if exists
		return null;

	}

	construct( builder ) { // @deprecated, r157

		console.warn( 'THREE.Node: construct() is deprecated. Use setup() instead.' );

		return this.setup( builder );

	}

	increaseUsage( builder ) {

		const nodeData = builder.getDataFromNode( this );
		nodeData.usageCount = nodeData.usageCount === undefined ? 1 : nodeData.usageCount + 1;

		return nodeData.usageCount;

	}

	analyze( builder ) {

		const usageCount = this.increaseUsage( builder );

		if ( usageCount === 1 ) {

			// node flow children

			const nodeProperties = builder.getNodeProperties( this );

			for ( const childNode of Object.values( nodeProperties ) ) {

				if ( childNode && childNode.isNode === true ) {

					childNode.build( builder );

				}

			}

		}

	}

	generate( builder, output ) {

		const { outputNode } = builder.getNodeProperties( this );

		if ( outputNode && outputNode.isNode === true ) {

			return outputNode.build( builder, output );

		}

	}

	updateBefore( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	build( builder, output = null ) {

		const refNode = this.getShared( builder );

		if ( this !== refNode ) {

			return refNode.build( builder, output );

		}

		builder.addNode( this );
		builder.addChain( this );

		/* Build stages expected results:
			- "setup"		-> Node
			- "analyze"		-> null
			- "generate"	-> String
		*/
		let result = null;

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'setup' ) {

			this.setReference( builder );

			const properties = builder.getNodeProperties( this );

			if ( properties.initialized !== true || builder.context.tempRead === false ) {

				const stackNodesBeforeSetup = builder.stack.nodes.length;

				properties.initialized = true;
				properties.outputNode = this.setup( builder );

				if ( properties.outputNode !== null && builder.stack.nodes.length !== stackNodesBeforeSetup ) {

					properties.outputNode = builder.stack;

				}

				for ( const childNode of Object.values( properties ) ) {

					if ( childNode && childNode.isNode === true ) {

						childNode.build( builder );

					}

				}

			}

		} else if ( buildStage === 'analyze' ) {

			this.analyze( builder );

		} else if ( buildStage === 'generate' ) {

			const isGenerateOnce = this.generate.length === 1;

			if ( isGenerateOnce ) {

				const type = this.getNodeType( builder );
				const nodeData = builder.getDataFromNode( this );

				result = nodeData.snippet;

				if ( result === undefined /*|| builder.context.tempRead === false*/ ) {

					result = this.generate( builder ) || '';

					nodeData.snippet = result;

				}

				result = builder.format( result, type, output );

			} else {

				result = this.generate( builder, output ) || '';

			}

		}

		builder.removeChain( this );

		return result;

	}

	getSerializeChildren() {

		return getNodeChildren( this );

	}

	serialize( json ) {

		const nodeChildren = this.getSerializeChildren();

		const inputNodes = {};

		for ( const { property, index, childNode } of nodeChildren ) {

			if ( index !== undefined ) {

				if ( inputNodes[ property ] === undefined ) {

					inputNodes[ property ] = Number.isInteger( index ) ? [] : {};

				}

				inputNodes[ property ][ index ] = childNode.toJSON( json.meta ).uuid;

			} else {

				inputNodes[ property ] = childNode.toJSON( json.meta ).uuid;

			}

		}

		if ( Object.keys( inputNodes ).length > 0 ) {

			json.inputNodes = inputNodes;

		}

	}

	deserialize( json ) {

		if ( json.inputNodes !== undefined ) {

			const nodes = json.meta.nodes;

			for ( const property in json.inputNodes ) {

				if ( Array.isArray( json.inputNodes[ property ] ) ) {

					const inputArray = [];

					for ( const uuid of json.inputNodes[ property ] ) {

						inputArray.push( nodes[ uuid ] );

					}

					this[ property ] = inputArray;

				} else if ( typeof json.inputNodes[ property ] === 'object' ) {

					const inputObject = {};

					for ( const subProperty in json.inputNodes[ property ] ) {

						const uuid = json.inputNodes[ property ][ subProperty ];

						inputObject[ subProperty ] = nodes[ uuid ];

					}

					this[ property ] = inputObject;

				} else {

					const uuid = json.inputNodes[ property ];

					this[ property ] = nodes[ uuid ];

				}

			}

		}

	}

	toJSON( meta ) {

		const { uuid, type } = this;
		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		// serialize

		let data = meta.nodes[ uuid ];

		if ( data === undefined ) {

			data = {
				uuid,
				type,
				meta,
				metadata: {
					version: 4.6,
					type: 'Node',
					generator: 'Node.toJSON'
				}
			};

			if ( isRoot !== true ) meta.nodes[ data.uuid ] = data;

			this.serialize( data );

			delete data.meta;

		}

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const nodes = extractFromCache( meta.nodes );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( nodes.length > 0 ) data.nodes = nodes;

		}

		return data;

	}

}

function addNodeClass( type, nodeClass ) {

	if ( typeof nodeClass !== 'function' || ! type ) throw new Error( `Node class ${ type } is not a class` );
	if ( NodeClasses.has( type ) ) {

		console.warn( `Redefinition of node class ${ type }` );
		return;

	}

	NodeClasses.set( type, nodeClass );
	nodeClass.type = type;

}

class TempNode extends Node {

	constructor( type ) {

		super( type );

		this.isTempNode = true;

	}

	hasDependencies( builder ) {

		return builder.getDataFromNode( this ).usageCount > 1;

	}

	build( builder, output ) {

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'generate' ) {

			const type = builder.getVectorType( this.getNodeType( builder, output ) );
			const nodeData = builder.getDataFromNode( this );

			if ( builder.context.tempRead !== false && nodeData.propertyName !== undefined ) {

				return builder.format( nodeData.propertyName, type, output );

			} else if ( builder.context.tempWrite !== false && type !== 'void' && output !== 'void' && this.hasDependencies( builder ) ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, null, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

				return builder.format( nodeData.propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

addNodeClass( 'TempNode', TempNode );

class ArrayElementNode extends Node { // @TODO: If extending from TempNode it breaks webgpu_compute

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

		this.isArrayElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

addNodeClass( 'ArrayElementNode', ArrayElementNode );

class ConvertNode extends Node {

	constructor( node, convertTo ) {

		super();

		this.node = node;
		this.convertTo = convertTo;

	}

	getNodeType( builder ) {

		const requestType = this.node.getNodeType( builder );

		let convertTo = null;

		for ( const overloadingType of this.convertTo.split( '|' ) ) {

			if ( convertTo === null || builder.getTypeLength( requestType ) === builder.getTypeLength( overloadingType ) ) {

				convertTo = overloadingType;

			}

		}

		return convertTo;

	}

	serialize( data ) {

		super.serialize( data );

		data.convertTo = this.convertTo;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.convertTo = data.convertTo;

	}

	generate( builder, output ) {

		const node = this.node;
		const type = this.getNodeType( builder );

		const snippet = node.build( builder, type );

		return builder.format( snippet, type, output );

	}

}

addNodeClass( 'ConvertNode', ConvertNode );

class JoinNode extends TempNode {

	constructor( nodes = [], nodeType = null ) {

		super( nodeType );

		this.nodes = nodes;

	}

	getNodeType( builder ) {

		if ( this.nodeType !== null ) {

			return builder.getVectorType( this.nodeType );

		}

		return builder.getTypeFromLength( this.nodes.reduce( ( count, cur ) => count + builder.getTypeLength( cur.getNodeType( builder ) ), 0 ) );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const nodes = this.nodes;

		const primitiveType = builder.getComponentType( type );

		const snippetValues = [];

		for ( const input of nodes ) {

			let inputSnippet = input.build( builder );

			const inputPrimitiveType = builder.getComponentType( input.getNodeType( builder ) );

			if ( inputPrimitiveType !== primitiveType ) {

				inputSnippet = builder.format( inputSnippet, inputPrimitiveType, primitiveType );

			}

			snippetValues.push( inputSnippet );

		}

		const snippet = `${ builder.getType( type ) }( ${ snippetValues.join( ', ' ) } )`;

		return builder.format( snippet, type, output );

	}

}

addNodeClass( 'JoinNode', JoinNode );

const stringVectorComponents = vectorComponents.join( '' );

class SplitNode extends Node {

	constructor( node, components = 'x' ) {

		super();

		this.node = node;
		this.components = components;

		this.isSplitNode = true;

	}

	getVectorLength() {

		let vectorLength = this.components.length;

		for ( const c of this.components ) {

			vectorLength = Math.max( vectorComponents.indexOf( c ) + 1, vectorLength );

		}

		return vectorLength;

	}

	getComponentType( builder ) {

		return builder.getComponentType( this.node.getNodeType( builder ) );

	}

	getNodeType( builder ) {

		return builder.getTypeFromLength( this.components.length, this.getComponentType( builder ) );

	}

	generate( builder, output ) {

		const node = this.node;
		const nodeTypeLength = builder.getTypeLength( node.getNodeType( builder ) );

		let snippet = null;

		if ( nodeTypeLength > 1 ) {

			let type = null;

			const componentsLength = this.getVectorLength();

			if ( componentsLength >= nodeTypeLength ) {

				// needed expand the input node

				type = builder.getTypeFromLength( this.getVectorLength(), this.getComponentType( builder ) );

			}

			const nodeSnippet = node.build( builder, type );

			if ( this.components.length === nodeTypeLength && this.components === stringVectorComponents.slice( 0, this.components.length ) ) {

				// unnecessary swizzle

				snippet = builder.format( nodeSnippet, type, output );

			} else {

				snippet = builder.format( `${nodeSnippet}.${this.components}`, this.getNodeType( builder ), output );

			}

		} else {

			// ignore .components if .node returns float/integer

			snippet = node.build( builder, output );

		}

		return snippet;

	}

	serialize( data ) {

		super.serialize( data );

		data.components = this.components;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.components = data.components;

	}

}

addNodeClass( 'SplitNode', SplitNode );

class SetNode extends TempNode {

	constructor( sourceNode, components, targetNode ) {

		super();

		this.sourceNode = sourceNode;
		this.components = components;
		this.targetNode = targetNode;

	}

	getNodeType( builder ) {

		return this.sourceNode.getNodeType( builder );

	}

	generate( builder ) {

		const { sourceNode, components, targetNode } = this;

		const sourceType = this.getNodeType( builder );
		const targetType = builder.getTypeFromLength( components.length );

		const targetSnippet = targetNode.build( builder, targetType );
		const sourceSnippet = sourceNode.build( builder, sourceType );

		const length = builder.getTypeLength( sourceType );
		const snippetValues = [];

		for ( let i = 0; i < length; i ++ ) {

			const component = vectorComponents[ i ];

			if ( component === components[ 0 ] ) {

				snippetValues.push( targetSnippet );

				i += components.length - 1;

			} else {

				snippetValues.push( sourceSnippet + '.' + component );

			}

		}

		return `${ builder.getType( sourceType ) }( ${ snippetValues.join( ', ' ) } )`;

	}

}

addNodeClass( 'SetNode', SetNode );

class InputNode extends Node {

	constructor( value, nodeType = null ) {

		super( nodeType );

		this.isInputNode = true;

		this.value = value;
		this.precision = null;

	}

	getNodeType( /*builder*/ ) {

		if ( this.nodeType === null ) {

			return getValueType( this.value );

		}

		return this.nodeType;

	}

	getInputType( builder ) {

		return this.getNodeType( builder );

	}

	setPrecision( precision ) {

		this.precision = precision;

		return this;

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value;

		if ( this.value && this.value.toArray ) data.value = this.value.toArray();

		data.valueType = getValueType( this.value );
		data.nodeType = this.nodeType;

		if ( data.valueType === 'ArrayBuffer' ) data.value = arrayBufferToBase64( data.value );

		data.precision = this.precision;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.nodeType = data.nodeType;
		this.value = Array.isArray( data.value ) ? getValueFromType( data.valueType, ...data.value ) : data.value;

		this.precision = data.precision || null;

		if ( this.value && this.value.fromArray ) this.value = this.value.fromArray( data.value );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

}

addNodeClass( 'InputNode', InputNode );

class ConstNode extends InputNode {

	constructor( value, nodeType = null ) {

		super( value, nodeType );

		this.isConstNode = true;

	}

	generateConst( builder ) {

		return builder.generateConst( this.getNodeType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		return builder.format( this.generateConst( builder ), type, output );

	}

}

addNodeClass( 'ConstNode', ConstNode );

//

let currentStack = null;

const NodeElements = new Map(); // @TODO: Currently only a few nodes are added, probably also add others

function addNodeElement( name, nodeElement ) {

	if ( NodeElements.has( name ) ) {

		console.warn( `Redefinition of node element ${ name }` );
		return;

	}

	if ( typeof nodeElement !== 'function' ) throw new Error( `Node element ${ name } is not a function` );

	NodeElements.set( name, nodeElement );

}

const parseSwizzle = ( props ) => props.replace( /r|s/g, 'x' ).replace( /g|t/g, 'y' ).replace( /b|p/g, 'z' ).replace( /a|q/g, 'w' );

const shaderNodeHandler = {

	setup( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( nodeObjects( inputs ), ...params );

	},

	get( node, prop, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			if ( node.isStackNode !== true && prop === 'assign' ) {

				return ( ...params ) => {

					currentStack.assign( nodeObj, ...params );

					return nodeObj;

				};

			} else if ( NodeElements.has( prop ) ) {

				const nodeElement = NodeElements.get( prop );

				return node.isStackNode ? ( ...params ) => nodeObj.add( nodeElement( ...params ) ) : ( ...params ) => nodeElement( nodeObj, ...params );

			} else if ( prop === 'self' ) {

				return node;

			} else if ( prop.endsWith( 'Assign' ) && NodeElements.has( prop.slice( 0, prop.length - 'Assign'.length ) ) ) {

				const nodeElement = NodeElements.get( prop.slice( 0, prop.length - 'Assign'.length ) );

				return node.isStackNode ? ( ...params ) => nodeObj.assign( params[ 0 ], nodeElement( ...params ) ) : ( ...params ) => nodeObj.assign( nodeElement( nodeObj, ...params ) );

			} else if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true ) {

				// accessing properties ( swizzle )

				prop = parseSwizzle( prop );

				return nodeObject( new SplitNode( nodeObj, prop ) );

			} else if ( /^set[XYZWRGBASTPQ]{1,4}$/.test( prop ) === true ) {

				// set properties ( swizzle )

				prop = parseSwizzle( prop.slice( 3 ).toLowerCase() );

				// sort to xyzw sequence

				prop = prop.split( '' ).sort().join( '' );

				return ( value ) => nodeObject( new SetNode( node, prop, value ) );

			} else if ( prop === 'width' || prop === 'height' || prop === 'depth' ) {

				// accessing property

				if ( prop === 'width' ) prop = 'x';
				else if ( prop === 'height' ) prop = 'y';
				else if ( prop === 'depth' ) prop = 'z';

				return nodeObject( new SplitNode( node, prop ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return nodeObject( new ArrayElementNode( nodeObj, new ConstNode( Number( prop ), 'uint' ) ) );

			}

		}

		return Reflect.get( node, prop, nodeObj );

	},

	set( node, prop, value, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			// setting properties

			if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true || prop === 'width' || prop === 'height' || prop === 'depth' || /^\d+$/.test( prop ) === true ) {

				nodeObj[ prop ].assign( value );

				return true;

			}

		}

		return Reflect.set( node, prop, value, nodeObj );

	}

};

const nodeObjectsCacheMap = new WeakMap();
const nodeBuilderFunctionsCacheMap = new WeakMap();

const ShaderNodeObject = function ( obj, altType = null ) {

	const type = getValueType( obj );

	if ( type === 'node' ) {

		let nodeObject = nodeObjectsCacheMap.get( obj );

		if ( nodeObject === undefined ) {

			nodeObject = new Proxy( obj, shaderNodeHandler );

			nodeObjectsCacheMap.set( obj, nodeObject );
			nodeObjectsCacheMap.set( nodeObject, nodeObject );

		}

		return nodeObject;

	} else if ( ( altType === null && ( type === 'float' || type === 'boolean' ) ) || ( type && type !== 'shader' && type !== 'string' ) ) {

		return nodeObject( getConstNode( obj, altType ) );

	} else if ( type === 'shader' ) {

		return tslFn( obj );

	}

	return obj;

};

const ShaderNodeObjects = function ( objects, altType = null ) {

	for ( const name in objects ) {

		objects[ name ] = nodeObject( objects[ name ], altType );

	}

	return objects;

};

const ShaderNodeArray = function ( array, altType = null ) {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = nodeObject( array[ i ], altType );

	}

	return array;

};

const ShaderNodeProxy = function ( NodeClass, scope = null, factor = null, settings = null ) {

	const assignNode = ( node ) => nodeObject( settings !== null ? Object.assign( node, settings ) : node );

	if ( scope === null ) {

		return ( ...params ) => {

			return assignNode( new NodeClass( ...nodeArray( params ) ) );

		};

	} else if ( factor !== null ) {

		factor = nodeObject( factor );

		return ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( params ), factor ) );

		};

	} else {

		return ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( params ) ) );

		};

	}

};

const ShaderNodeImmutable = function ( NodeClass, ...params ) {

	return nodeObject( new NodeClass( ...nodeArray( params ) ) );

};

class ShaderCallNodeInternal extends Node {

	constructor( shaderNode, inputNodes ) {

		super();

		this.shaderNode = shaderNode;
		this.inputNodes = inputNodes;

	}

	getNodeType( builder ) {

		const { outputNode } = builder.getNodeProperties( this );

		return outputNode ? outputNode.getNodeType( builder ) : super.getNodeType( builder );

	}

	call( builder ) {

		const { shaderNode, inputNodes } = this;

		if ( shaderNode.layout ) {

			let functionNodesCacheMap = nodeBuilderFunctionsCacheMap.get( builder.constructor );

			if ( functionNodesCacheMap === undefined ) {

				functionNodesCacheMap = new WeakMap();

				nodeBuilderFunctionsCacheMap.set( builder.constructor, functionNodesCacheMap );

			}

			let functionNode = functionNodesCacheMap.get( shaderNode );

			if ( functionNode === undefined ) {

				functionNode = nodeObject( builder.buildFunctionNode( shaderNode ) );

				functionNodesCacheMap.set( shaderNode, functionNode );

			}

			if ( builder.currentFunctionNode !== null ) {

				builder.currentFunctionNode.includes.push( functionNode );

			}

			return nodeObject( functionNode.call( inputNodes ) );

		}

		const jsFunc = shaderNode.jsFunc;
		const outputNode = inputNodes !== null ? jsFunc( inputNodes, builder.stack, builder ) : jsFunc( builder.stack, builder );

		return nodeObject( outputNode );

	}

	setup( builder ) {

		builder.addStack();

		builder.stack.outputNode = this.call( builder );

		return builder.removeStack();

	}

	generate( builder, output ) {

		const { outputNode } = builder.getNodeProperties( this );

		if ( outputNode === null ) {

			// TSL: It's recommended to use `tslFn` in setup() pass.

			return this.call( builder ).build( builder, output );

		}

		return super.generate( builder, output );

	}

}

class ShaderNodeInternal extends Node {

	constructor( jsFunc ) {

		super();

		this.jsFunc = jsFunc;
		this.layout = null;

	}

	get isArrayInput() {

		return /^\((\s+)?\[/.test( this.jsFunc.toString() );

	}

	setLayout( layout ) {

		this.layout = layout;

		return this;

	}

	call( inputs = null ) {

		nodeObjects( inputs );

		return nodeObject( new ShaderCallNodeInternal( this, inputs ) );

	}

	setup() {

		return this.call();

	}

}

const bools = [ false, true ];
const uints = [ 0, 1, 2, 3 ];
const ints = [ - 1, - 2 ];
const floats = [ 0.5, 1.5, 1 / 3, 1e-6, 1e6, Math.PI, Math.PI * 2, 1 / Math.PI, 2 / Math.PI, 1 / ( Math.PI * 2 ), Math.PI / 2 ];

const boolsCacheMap = new Map();
for ( const bool of bools ) boolsCacheMap.set( bool, new ConstNode( bool ) );

const uintsCacheMap = new Map();
for ( const uint of uints ) uintsCacheMap.set( uint, new ConstNode( uint, 'uint' ) );

const intsCacheMap = new Map( [ ...uintsCacheMap ].map( el => new ConstNode( el.value, 'int' ) ) );
for ( const int of ints ) intsCacheMap.set( int, new ConstNode( int, 'int' ) );

const floatsCacheMap = new Map( [ ...intsCacheMap ].map( el => new ConstNode( el.value ) ) );
for ( const float of floats ) floatsCacheMap.set( float, new ConstNode( float ) );
for ( const float of floats ) floatsCacheMap.set( - float, new ConstNode( - float ) );

const cacheMaps = { bool: boolsCacheMap, uint: uintsCacheMap, ints: intsCacheMap, float: floatsCacheMap };

const constNodesCacheMap = new Map( [ ...boolsCacheMap, ...floatsCacheMap ] );

const getConstNode = ( value, type ) => {

	if ( constNodesCacheMap.has( value ) ) {

		return constNodesCacheMap.get( value );

	} else if ( value.isNode === true ) {

		return value;

	} else {

		return new ConstNode( value, type );

	}

};

const safeGetNodeType = ( node ) => {

	try {

		return node.getNodeType();

	} catch ( _ ) {

		return undefined;

	}

};

const ConvertType = function ( type, cacheMap = null ) {

	return ( ...params ) => {

		if ( params.length === 0 || ( ! [ 'bool', 'float', 'int', 'uint' ].includes( type ) && params.every( param => typeof param !== 'object' ) ) ) {

			params = [ getValueFromType( type, ...params ) ];

		}

		if ( params.length === 1 && cacheMap !== null && cacheMap.has( params[ 0 ] ) ) {

			return nodeObject( cacheMap.get( params[ 0 ] ) );

		}

		if ( params.length === 1 ) {

			const node = getConstNode( params[ 0 ], type );
			if ( safeGetNodeType( node ) === type ) return nodeObject( node );
			return nodeObject( new ConvertNode( node, type ) );

		}

		const nodes = params.map( param => getConstNode( param ) );
		return nodeObject( new JoinNode( nodes, type ) );

	};

};

// exports

// utils

const getConstNodeType = ( value ) => ( value !== undefined && value !== null ) ? ( value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null ) ) : null;

// shader node base

function ShaderNode( jsFunc ) {

	return new Proxy( new ShaderNodeInternal( jsFunc ), shaderNodeHandler );

}

const nodeObject = ( val, altType = null ) => /* new */ ShaderNodeObject( val, altType );
const nodeObjects = ( val, altType = null ) => new ShaderNodeObjects( val, altType );
const nodeArray = ( val, altType = null ) => new ShaderNodeArray( val, altType );
const nodeProxy = ( ...params ) => new ShaderNodeProxy( ...params );
const nodeImmutable = ( ...params ) => new ShaderNodeImmutable( ...params );

const tslFn = ( jsFunc ) => {

	const shaderNode = new ShaderNode( jsFunc );

	const fn = ( ...params ) => {

		let inputs;

		nodeObjects( params );

		if ( params[ 0 ] && params[ 0 ].isNode ) {

			inputs = [ ...params ];

		} else {

			inputs = params[ 0 ];

		}

		return shaderNode.call( inputs );

	};

	fn.shaderNode = shaderNode;
	fn.setLayout = ( layout ) => {

		shaderNode.setLayout( layout );

		return fn;

	};

	return fn;

};

addNodeClass( 'ShaderNode', ShaderNode );

//

const setCurrentStack = ( stack ) => {

	currentStack = stack;

};

const getCurrentStack = () => currentStack;

const If = ( ...params ) => currentStack.if( ...params );

function append( node ) {

	if ( currentStack ) currentStack.add( node );

	return node;

}

addNodeElement( 'append', append );

// types
// @TODO: Maybe export from ConstNode.js?

const color = new ConvertType( 'color' );

const float = new ConvertType( 'float', cacheMaps.float );
const int = new ConvertType( 'int', cacheMaps.int );
const uint = new ConvertType( 'uint', cacheMaps.uint );
const bool = new ConvertType( 'bool', cacheMaps.bool );

const vec2 = new ConvertType( 'vec2' );
const ivec2 = new ConvertType( 'ivec2' );
const uvec2 = new ConvertType( 'uvec2' );
const bvec2 = new ConvertType( 'bvec2' );

const vec3 = new ConvertType( 'vec3' );
const ivec3 = new ConvertType( 'ivec3' );
const uvec3 = new ConvertType( 'uvec3' );
const bvec3 = new ConvertType( 'bvec3' );

const vec4 = new ConvertType( 'vec4' );
const ivec4 = new ConvertType( 'ivec4' );
const uvec4 = new ConvertType( 'uvec4' );
const bvec4 = new ConvertType( 'bvec4' );

const mat2 = new ConvertType( 'mat2' );
const imat2 = new ConvertType( 'imat2' );
const umat2 = new ConvertType( 'umat2' );
const bmat2 = new ConvertType( 'bmat2' );

const mat3 = new ConvertType( 'mat3' );
const imat3 = new ConvertType( 'imat3' );
const umat3 = new ConvertType( 'umat3' );
const bmat3 = new ConvertType( 'bmat3' );

const mat4 = new ConvertType( 'mat4' );
const imat4 = new ConvertType( 'imat4' );
const umat4 = new ConvertType( 'umat4' );
const bmat4 = new ConvertType( 'bmat4' );

const string = ( value = '' ) => nodeObject( new ConstNode( value, 'string' ) );
const arrayBuffer = ( value ) => nodeObject( new ConstNode( value, 'ArrayBuffer' ) );

addNodeElement( 'color', color );
addNodeElement( 'float', float );
addNodeElement( 'int', int );
addNodeElement( 'uint', uint );
addNodeElement( 'bool', bool );
addNodeElement( 'vec2', vec2 );
addNodeElement( 'ivec2', ivec2 );
addNodeElement( 'uvec2', uvec2 );
addNodeElement( 'bvec2', bvec2 );
addNodeElement( 'vec3', vec3 );
addNodeElement( 'ivec3', ivec3 );
addNodeElement( 'uvec3', uvec3 );
addNodeElement( 'bvec3', bvec3 );
addNodeElement( 'vec4', vec4 );
addNodeElement( 'ivec4', ivec4 );
addNodeElement( 'uvec4', uvec4 );
addNodeElement( 'bvec4', bvec4 );
addNodeElement( 'mat2', mat2 );
addNodeElement( 'imat2', imat2 );
addNodeElement( 'umat2', umat2 );
addNodeElement( 'bmat2', bmat2 );
addNodeElement( 'mat3', mat3 );
addNodeElement( 'imat3', imat3 );
addNodeElement( 'umat3', umat3 );
addNodeElement( 'bmat3', bmat3 );
addNodeElement( 'mat4', mat4 );
addNodeElement( 'imat4', imat4 );
addNodeElement( 'umat4', umat4 );
addNodeElement( 'bmat4', bmat4 );
addNodeElement( 'string', string );
addNodeElement( 'arrayBuffer', arrayBuffer );

// basic nodes
// HACK - we cannot export them from the corresponding files because of the cyclic dependency
const element = nodeProxy( ArrayElementNode );
const convert = ( node, types ) => nodeObject( new ConvertNode( nodeObject( node ), types ) );

addNodeElement( 'element', element );
addNodeElement( 'convert', convert );

class AssignNode extends TempNode {

	constructor( targetNode, sourceNode ) {

		super();

		this.targetNode = targetNode;
		this.sourceNode = sourceNode;

	}

	hasDependencies() {

		return false;

	}

	getNodeType( builder, output ) {

		return output !== 'void' ? this.targetNode.getNodeType( builder ) : 'void';

	}

	needsSplitAssign( builder ) {

		const { targetNode } = this;

		if ( builder.isAvailable( 'swizzleAssign' ) === false && targetNode.isSplitNode && targetNode.components.length > 1 ) {

			const targetLength = builder.getTypeLength( targetNode.node.getNodeType( builder ) );
			const assignDiferentVector = vectorComponents.join( '' ).slice( 0, targetLength ) !== targetNode.components;

			return assignDiferentVector;

		}

		return false;

	}

	generate( builder, output ) {

		const { targetNode, sourceNode } = this;

		const needsSplitAssign = this.needsSplitAssign( builder );

		const targetType = targetNode.getNodeType( builder );

		const target = targetNode.context( { assign: true } ).build( builder );
		const source = sourceNode.build( builder, targetType );

		const sourceType = sourceNode.getNodeType( builder );

		const nodeData = builder.getDataFromNode( this );

		//

		let snippet;

		if ( nodeData.initialized === true ) {

			if ( output !== 'void' ) {

				snippet = target;

			}

		} else if ( needsSplitAssign ) {

			const sourceVar = builder.getVarFromNode( this, null, targetType );
			const sourceProperty = builder.getPropertyName( sourceVar );

			builder.addLineFlowCode( `${ sourceProperty } = ${ source }` );

			const targetRoot = targetNode.node.context( { assign: true } ).build( builder );

			for ( let i = 0; i < targetNode.components.length; i ++ ) {

				const component = targetNode.components[ i ];

				builder.addLineFlowCode( `${ targetRoot }.${ component } = ${ sourceProperty }[ ${ i } ]` );

			}

			if ( output !== 'void' ) {

				snippet = target;

			}

		} else {

			snippet = `${ target } = ${ source }`;

			if ( output === 'void' || sourceType === 'void' ) {

				builder.addLineFlowCode( snippet );

				if ( output !== 'void' ) {

					snippet = target;

				}

			}

		}

		nodeData.initialized = true;

		return builder.format( snippet, targetType, output );

	}

}

const assign = nodeProxy( AssignNode );

addNodeClass( 'AssignNode', AssignNode );

addNodeElement( 'assign', assign );

class VaryingNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

		this.isVaryingNode = true;

	}

	isGlobal() {

		return true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		// VaryingNode is auto type

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const { name, node } = this;
		const type = this.getNodeType( builder );

		const nodeVarying = builder.getVaryingFromNode( this, name, type );

		// this property can be used to check if the varying can be optimized for a var
		nodeVarying.needsInterpolation || ( nodeVarying.needsInterpolation = ( builder.shaderStage === 'fragment' ) );

		const propertyName = builder.getPropertyName( nodeVarying, NodeShaderStage.VERTEX );

		// force node run in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.VERTEX, node, type, propertyName );

		return builder.getPropertyName( nodeVarying );

	}

}

const varying = nodeProxy( VaryingNode );

addNodeElement( 'varying', varying );

addNodeClass( 'VaryingNode', VaryingNode );

class AttributeNode extends Node {

	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		this._attributeName = attributeName;

	}

	isGlobal() {

		return true;

	}

	getHash( builder ) {

		return this.getAttributeName( builder );

	}

	getNodeType( builder ) {

		let nodeType = super.getNodeType( builder );

		if ( nodeType === null ) {

			const attributeName = this.getAttributeName( builder );

			if ( builder.hasGeometryAttribute( attributeName ) ) {

				const attribute = builder.geometry.getAttribute( attributeName );

				nodeType = builder.getTypeFromAttribute( attribute );

			} else {

				nodeType = 'float';

			}

		}

		return nodeType;

	}

	setAttributeName( attributeName ) {

		this._attributeName = attributeName;

		return this;

	}

	getAttributeName( /*builder*/ ) {

		return this._attributeName;

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const nodeType = this.getNodeType( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		if ( geometryAttribute === true ) {

			const attribute = builder.geometry.getAttribute( attributeName );
			const attributeType = builder.getTypeFromAttribute( attribute );

			const nodeAttribute = builder.getAttribute( attributeName, attributeType );

			if ( builder.shaderStage === 'vertex' ) {

				return builder.format( nodeAttribute.name, attributeType, nodeType );

			} else {

				const nodeVarying = varying( this );

				return nodeVarying.build( builder, nodeType );

			}

		} else {

			console.warn( `AttributeNode: Vertex attribute "${ attributeName }" not found on geometry.` );

			return builder.generateConst( nodeType );

		}

	}

}

const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );

addNodeClass( 'AttributeNode', AttributeNode );

class BypassNode extends Node {

	constructor( returnNode, callNode ) {

		super();

		this.isBypassNode = true;

		this.outputNode = returnNode;
		this.callNode = callNode;

	}

	getNodeType( builder ) {

		return this.outputNode.getNodeType( builder );

	}

	generate( builder ) {

		const snippet = this.callNode.build( builder, 'void' );

		if ( snippet !== '' ) {

			builder.addLineFlowCode( snippet );

		}

		return this.outputNode.build( builder );

	}

}

const bypass = nodeProxy( BypassNode );

addNodeElement( 'bypass', bypass );

addNodeClass( 'BypassNode', BypassNode );

let id$3 = 0;

class NodeCache {

	constructor() {

		this.id = id$3 ++;
		this.nodesData = new WeakMap();

	}

	getNodeData( node ) {

		return this.nodesData.get( node );

	}

	setNodeData( node, data ) {

		this.nodesData.set( node, data );

	}

}

class CacheNode extends Node {

	constructor( node, cache = new NodeCache() ) {

		super();

		this.isCacheNode = true;

		this.node = node;
		this.cache = cache;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();
		const cache = this.cache || builder.globalCache;

		builder.setCache( cache );

		const data = this.node.build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

const cache = nodeProxy( CacheNode );
const globalCache = ( node ) => cache( node, null );

addNodeElement( 'cache', cache );
addNodeElement( 'globalCache', globalCache );

addNodeClass( 'CacheNode', CacheNode );

class ContextNode extends Node {

	constructor( node, context = {} ) {

		super();

		this.isContextNode = true;

		this.node = node;
		this.context = context;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup( builder ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.context } );

		const node = this.node.build( builder );

		builder.setContext( previousContext );

		return node;

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.context } );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

const context = nodeProxy( ContextNode );
const label = ( node, name ) => context( node, { label: name } );

addNodeElement( 'context', context );
addNodeElement( 'label', label );

addNodeClass( 'ContextNode', ContextNode );

class IndexNode extends Node {

	constructor( scope ) {

		super( 'uint' );

		this.scope = scope;

		this.isInstanceIndexNode = true;

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );
		const scope = this.scope;

		let propertyName;

		if ( scope === IndexNode.VERTEX ) {

			propertyName = builder.getVertexIndex();

		} else if ( scope === IndexNode.INSTANCE ) {

			propertyName = builder.getInstanceIndex();

		} else {

			throw new Error( 'THREE.IndexNode: Unknown scope: ' + scope );

		}

		let output;

		if ( builder.shaderStage === 'vertex' || builder.shaderStage === 'compute' ) {

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

}

IndexNode.VERTEX = 'vertex';
IndexNode.INSTANCE = 'instance';

const vertexIndex = nodeImmutable( IndexNode, IndexNode.VERTEX );
const instanceIndex = nodeImmutable( IndexNode, IndexNode.INSTANCE );

addNodeClass( 'IndexNode', IndexNode );

class LightingModel {

	start( /*input, stack, builder*/ ) { }

	finish( /*input, stack, builder*/ ) { }

	direct( /*input, stack, builder*/ ) { }

	indirectDiffuse( /*input, stack, builder*/ ) { }

	indirectSpecular( /*input, stack, builder*/ ) { }

	ambientOcclusion( /*input, stack, builder*/ ) { }

}

class VarNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

		this.isVarNode = true;

	}

	isGlobal() {

		return true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const { node, name } = this;

		const nodeVar = builder.getVarFromNode( this, name, builder.getVectorType( this.getNodeType( builder ) ) );

		const propertyName = builder.getPropertyName( nodeVar );

		const snippet = node.build( builder, nodeVar.type );

		builder.addLineFlowCode( `${propertyName} = ${snippet}` );

		return propertyName;

	}

}

const temp = nodeProxy( VarNode );

addNodeElement( 'temp', temp ); // @TODO: Will be removed in the future
addNodeElement( 'toVar', ( ...params ) => temp( ...params ).append() );

addNodeClass( 'VarNode', VarNode );

class NodeAttribute {

	constructor( name, type, node = null ) {

		this.isNodeAttribute = true;

		this.name = name;
		this.type = type;
		this.node = node;

	}

}

class NodeUniform {

	constructor( name, type, node, needsUpdate = undefined ) {

		this.isNodeUniform = true;

		this.name = name;
		this.type = type;
		this.node = node.getSelf();
		this.needsUpdate = needsUpdate;

	}

	get value() {

		return this.node.value;

	}

	set value( val ) {

		this.node.value = val;

	}

	get id() {

		return this.node.id;

	}

	get groupNode() {

		return this.node.groupNode;

	}

}

class NodeVar {

	constructor( name, type ) {

		this.isNodeVar = true;

		this.name = name;
		this.type = type;

	}

}

class NodeVarying extends NodeVar {

	constructor( name, type ) {

		super( name, type );

		this.needsInterpolation = false;

		this.isNodeVarying = true;

	}

}

class NodeCode {

	constructor( name, type, code = '' ) {

		this.name = name;
		this.type = type;
		this.code = code;

		Object.defineProperty( this, 'isNodeCode', { value: true } );

	}

}

class NodeKeywords {

	constructor() {

		this.keywords = [];
		this.nodes = [];
		this.keywordsCallback = {};

	}

	getNode( name ) {

		let node = this.nodes[ name ];

		if ( node === undefined && this.keywordsCallback[ name ] !== undefined ) {

			node = this.keywordsCallback[ name ]( name );

			this.nodes[ name ] = node;

		}

		return node;

	}

	addKeyword( name, callback ) {

		this.keywords.push( name );
		this.keywordsCallback[ name ] = callback;

		return this;

	}

	parse( code ) {

		const keywordNames = this.keywords;

		const regExp = new RegExp( `\\b${keywordNames.join( '\\b|\\b' )}\\b`, 'g' );

		const codeKeywords = code.match( regExp );

		const keywordNodes = [];

		if ( codeKeywords !== null ) {

			for ( const keyword of codeKeywords ) {

				const node = this.getNode( keyword );

				if ( node !== undefined && keywordNodes.indexOf( node ) === - 1 ) {

					keywordNodes.push( node );

				}

			}

		}

		return keywordNodes;

	}

	include( builder, code ) {

		const keywordNodes = this.parse( code );

		for ( const keywordNode of keywordNodes ) {

			keywordNode.build( builder );

		}

	}

}

class PropertyNode extends Node {

	constructor( nodeType, name = null, varying = false ) {

		super( nodeType );

		this.name = name;
		this.varying = varying;

		this.isPropertyNode = true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	isGlobal( /*builder*/ ) {

		return true;

	}

	generate( builder ) {

		let nodeVar;

		if ( this.varying === true ) {

			nodeVar = builder.getVaryingFromNode( this, this.name );
			nodeVar.needsInterpolation = true;

		} else {

			nodeVar = builder.getVarFromNode( this, this.name );

		}

		return builder.getPropertyName( nodeVar );

	}

}

const property = ( type, name ) => nodeObject( new PropertyNode( type, name ) );
const varyingProperty = ( type, name ) => nodeObject( new PropertyNode( type, name, true ) );

const diffuseColor = nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
const roughness = nodeImmutable( PropertyNode, 'float', 'Roughness' );
const metalness = nodeImmutable( PropertyNode, 'float', 'Metalness' );
const clearcoat = nodeImmutable( PropertyNode, 'float', 'Clearcoat' );
const clearcoatRoughness = nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );
const sheen = nodeImmutable( PropertyNode, 'vec3', 'Sheen' );
const sheenRoughness = nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );
const iridescence = nodeImmutable( PropertyNode, 'float', 'Iridescence' );
const iridescenceIOR = nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );
const iridescenceThickness = nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );
const specularColor = nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
const shininess = nodeImmutable( PropertyNode, 'float', 'Shininess' );
const output = nodeImmutable( PropertyNode, 'vec4', 'Output' );
const dashSize = nodeImmutable( PropertyNode, 'float', 'dashSize' );
const gapSize = nodeImmutable( PropertyNode, 'float', 'gapSize' );
nodeImmutable( PropertyNode, 'float', 'pointWidth' );

addNodeClass( 'PropertyNode', PropertyNode );

class ParameterNode extends PropertyNode {

	constructor( nodeType, name = null ) {

		super( nodeType, name );

		this.isParameterNode = true;

	}

	getHash() {

		return this.uuid;

	}

	generate() {

		return this.name;

	}

}

addNodeClass( 'ParameterNode', ParameterNode );

class CodeNode extends Node {

	constructor( code = '', includes = [], language = '' ) {

		super( 'code' );

		this.isCodeNode = true;

		this.code = code;
		this.language = language;

		this.includes = includes;

	}

	isGlobal() {

		return true;

	}

	setIncludes( includes ) {

		this.includes = includes;

		return this;

	}

	getIncludes( /*builder*/ ) {

		return this.includes;

	}

	generate( builder ) {

		const includes = this.getIncludes( builder );

		for ( const include of includes ) {

			include.build( builder );

		}

		const nodeCode = builder.getCodeFromNode( this, this.getNodeType( builder ) );
		nodeCode.code = this.code;

		return nodeCode.code;

	}

	serialize( data ) {

		super.serialize( data );

		data.code = this.code;
		data.language = this.language;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.code = data.code;
		this.language = data.language;

	}

}

nodeProxy( CodeNode );

addNodeClass( 'CodeNode', CodeNode );

class FunctionNode extends CodeNode {

	constructor( code = '', includes = [], language = '' ) {

		super( code, includes, language );

		this.keywords = {};

	}

	getNodeType( builder ) {

		return this.getNodeFunction( builder ).type;

	}

	getInputs( builder ) {

		return this.getNodeFunction( builder ).inputs;

	}

	getNodeFunction( builder ) {

		const nodeData = builder.getDataFromNode( this );

		let nodeFunction = nodeData.nodeFunction;

		if ( nodeFunction === undefined ) {

			nodeFunction = builder.parser.parseFunction( this.code );

			nodeData.nodeFunction = nodeFunction;

		}

		return nodeFunction;

	}

	generate( builder, output ) {

		super.generate( builder );

		const nodeFunction = this.getNodeFunction( builder );

		const name = nodeFunction.name;
		const type = nodeFunction.type;

		const nodeCode = builder.getCodeFromNode( this, type );

		if ( name !== '' ) {

			// use a custom property name

			nodeCode.name = name;

		}

		const propertyName = builder.getPropertyName( nodeCode );

		let code = this.getNodeFunction( builder ).getCode( propertyName );

		const keywords = this.keywords;
		const keywordsProperties = Object.keys( keywords );

		if ( keywordsProperties.length > 0 ) {

			for ( const property of keywordsProperties ) {

				const propertyRegExp = new RegExp( `\\b${property}\\b`, 'g' );
				const nodeProperty = keywords[ property ].build( builder, 'property' );

				code = code.replace( propertyRegExp, nodeProperty );

			}

		}

		nodeCode.code = code + '\n';

		if ( output === 'property' ) {

			return propertyName;

		} else {

			return builder.format( `${ propertyName }()`, type, output );

		}

	}

}

addNodeClass( 'FunctionNode', FunctionNode );

class UniformGroupNode extends Node {

	constructor( name, shared = false ) {

		super( 'string' );

		this.name = name;
		this.version = 0;

		this.shared = shared;

		this.isUniformGroup = true;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

}

const uniformGroup = ( name ) => new UniformGroupNode( name );
const sharedUniformGroup = ( name ) => new UniformGroupNode( name, true );

const frameGroup = sharedUniformGroup( 'frame' );
const renderGroup = sharedUniformGroup( 'render' );
const objectGroup = uniformGroup( 'object' );

addNodeClass( 'UniformGroupNode', UniformGroupNode );

class UniformNode extends InputNode {

	constructor( value, nodeType = null ) {

		super( value, nodeType );

		this.isUniformNode = true;

		this.groupNode = objectGroup;

	}

	setGroup( group ) {

		this.groupNode = group;

		return this;

	}

	getGroup() {

		return this.groupNode;

	}

	getUniformHash( builder ) {

		return this.getHash( builder );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const hash = this.getUniformHash( builder );

		let sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode === undefined ) {

			builder.setHashNode( this, hash );

			sharedNode = this;

		}

		const sharedNodeType = sharedNode.getInputType( builder );

		const nodeUniform = builder.getUniformFromNode( sharedNode, sharedNodeType, builder.shaderStage, builder.context.label );
		const propertyName = builder.getPropertyName( nodeUniform );

		if ( builder.context.label !== undefined ) delete builder.context.label;

		return builder.format( propertyName, type, output );

	}

}

const uniform = ( arg1, arg2 ) => {

	const nodeType = getConstNodeType( arg2 || arg1 );

	// @TODO: get ConstNode from .traverse() in the future
	const value = ( arg1 && arg1.isNode === true ) ? ( arg1.node && arg1.node.value ) || arg1.value : arg1;

	return nodeObject( new UniformNode( value, nodeType ) );

};

addNodeClass( 'UniformNode', UniformNode );

class UVNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec2' );

		this.isUVNode = true;

		this.index = index;

	}

	getAttributeName( /*builder*/ ) {

		const index = this.index;

		return 'uv' + ( index > 0 ? index : '' );

	}

	serialize( data ) {

		super.serialize( data );

		data.index = this.index;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.index = data.index;

	}

}

const uv = ( ...params ) => nodeObject( new UVNode( ...params ) );

addNodeClass( 'UVNode', UVNode );

class TextureSizeNode extends Node {

	constructor( textureNode, levelNode = null ) {

		super( 'uvec2' );

		this.isTextureSizeNode = true;

		this.textureNode = textureNode;
		this.levelNode = levelNode;

	}

	generate( builder, output ) {

		const textureProperty = this.textureNode.build( builder, 'property' );
		const levelNode = this.levelNode.build( builder, 'int' );

		return builder.format( `${builder.getMethod( 'textureDimensions' )}( ${textureProperty}, ${levelNode} )`, this.getNodeType( builder ), output );

	}

}

const textureSize = nodeProxy( TextureSizeNode );

addNodeElement( 'textureSize', textureSize );

addNodeClass( 'TextureSizeNode', TextureSizeNode );

class OperatorNode extends TempNode {

	constructor( op, aNode, bNode, ...params ) {

		super();

		this.op = op;

		if ( params.length > 0 ) {

			let finalBNode = bNode;

			for ( let i = 0; i < params.length; i ++ ) {

				finalBNode = new OperatorNode( op, finalBNode, params[ i ] );

			}

			bNode = finalBNode;

		}

		this.aNode = aNode;
		this.bNode = bNode;

	}

	getNodeType( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const typeA = aNode.getNodeType( builder );
		const typeB = typeof bNode !== 'undefined' ? bNode.getNodeType( builder ) : null;

		if ( typeA === 'void' || typeB === 'void' ) {

			return 'void';

		} else if ( op === '%' ) {

			return typeA;

		} else if ( op === '~' || op === '&' || op === '|' || op === '^' || op === '>>' || op === '<<' ) {

			return builder.getIntegerType( typeA );

		} else if ( op === '!' || op === '==' || op === '&&' || op === '||' || op === '^^' ) {

			return 'bool';

		} else if ( op === '<' || op === '>' || op === '<=' || op === '>=' ) {

			const typeLength = output ? builder.getTypeLength( output ) : Math.max( builder.getTypeLength( typeA ), builder.getTypeLength( typeB ) );

			return typeLength > 1 ? `bvec${ typeLength }` : 'bool';

		} else {

			if ( typeA === 'float' && builder.isMatrix( typeB ) ) {

				return typeB;

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				return builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				return builder.getVectorFromMatrix( typeB );

			} else if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

				// anytype x anytype: use the greater length vector

				return typeB;

			}

			return typeA;

		}

	}

	generate( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const type = this.getNodeType( builder, output );

		let typeA = null;
		let typeB = null;

		if ( type !== 'void' ) {

			typeA = aNode.getNodeType( builder );
			typeB = typeof bNode !== 'undefined' ? bNode.getNodeType( builder ) : null;

			if ( op === '<' || op === '>' || op === '<=' || op === '>=' || op === '==' ) {

				if ( builder.isVector( typeA ) ) {

					typeB = typeA;

				} else {

					typeA = typeB = 'float';

				}

			} else if ( op === '>>' || op === '<<' ) {

				typeA = type;
				typeB = builder.changeComponentType( typeB, 'uint' );

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				typeB = builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				typeA = builder.getVectorFromMatrix( typeB );

			} else {

				// anytype x anytype

				typeA = typeB = type;

			}

		} else {

			typeA = typeB = type;

		}

		const a = aNode.build( builder, typeA );
		const b = typeof bNode !== 'undefined' ? bNode.build( builder, typeB ) : null;

		const outputLength = builder.getTypeLength( output );
		const fnOpSnippet = builder.getFunctionOperator( op );

		if ( output !== 'void' ) {

			if ( op === '<' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'lessThan' ) }( ${ a }, ${ b } )`, type, output );

			} else if ( op === '<=' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'lessThanEqual' ) }( ${ a }, ${ b } )`, type, output );

			} else if ( op === '>' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'greaterThan' ) }( ${ a }, ${ b } )`, type, output );

			} else if ( op === '>=' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'greaterThanEqual' ) }( ${ a }, ${ b } )`, type, output );

			} else if ( op === '!' || op === '~' ) {

				return builder.format( `(${op}${a})`, typeA, output );

			} else if ( fnOpSnippet ) {

				return builder.format( `${ fnOpSnippet }( ${ a }, ${ b } )`, type, output );

			} else {

				return builder.format( `( ${ a } ${ op } ${ b } )`, type, output );

			}

		} else if ( typeA !== 'void' ) {

			if ( fnOpSnippet ) {

				return builder.format( `${ fnOpSnippet }( ${ a }, ${ b } )`, type, output );

			} else {

				return builder.format( `${ a } ${ op } ${ b }`, type, output );

			}

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.op = this.op;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.op = data.op;

	}

}

const add = nodeProxy( OperatorNode, '+' );
const sub = nodeProxy( OperatorNode, '-' );
const mul = nodeProxy( OperatorNode, '*' );
const div = nodeProxy( OperatorNode, '/' );
const remainder = nodeProxy( OperatorNode, '%' );
const equal = nodeProxy( OperatorNode, '==' );
const notEqual = nodeProxy( OperatorNode, '!=' );
const lessThan = nodeProxy( OperatorNode, '<' );
const greaterThan = nodeProxy( OperatorNode, '>' );
const lessThanEqual = nodeProxy( OperatorNode, '<=' );
const greaterThanEqual = nodeProxy( OperatorNode, '>=' );
const and = nodeProxy( OperatorNode, '&&' );
const or = nodeProxy( OperatorNode, '||' );
const not = nodeProxy( OperatorNode, '!' );
const xor = nodeProxy( OperatorNode, '^^' );
const bitAnd = nodeProxy( OperatorNode, '&' );
const bitNot = nodeProxy( OperatorNode, '~' );
const bitOr = nodeProxy( OperatorNode, '|' );
const bitXor = nodeProxy( OperatorNode, '^' );
const shiftLeft = nodeProxy( OperatorNode, '<<' );
const shiftRight = nodeProxy( OperatorNode, '>>' );

addNodeElement( 'add', add );
addNodeElement( 'sub', sub );
addNodeElement( 'mul', mul );
addNodeElement( 'div', div );
addNodeElement( 'remainder', remainder );
addNodeElement( 'equal', equal );
addNodeElement( 'notEqual', notEqual );
addNodeElement( 'lessThan', lessThan );
addNodeElement( 'greaterThan', greaterThan );
addNodeElement( 'lessThanEqual', lessThanEqual );
addNodeElement( 'greaterThanEqual', greaterThanEqual );
addNodeElement( 'and', and );
addNodeElement( 'or', or );
addNodeElement( 'not', not );
addNodeElement( 'xor', xor );
addNodeElement( 'bitAnd', bitAnd );
addNodeElement( 'bitNot', bitNot );
addNodeElement( 'bitOr', bitOr );
addNodeElement( 'bitXor', bitXor );
addNodeElement( 'shiftLeft', shiftLeft );
addNodeElement( 'shiftRight', shiftRight );

addNodeClass( 'OperatorNode', OperatorNode );

class MathNode extends TempNode {

	constructor( method, aNode, bNode = null, cNode = null ) {

		super();

		this.method = method;

		this.aNode = aNode;
		this.bNode = bNode;
		this.cNode = cNode;

	}

	getInputType( builder ) {

		const aType = this.aNode.getNodeType( builder );
		const bType = this.bNode ? this.bNode.getNodeType( builder ) : null;
		const cType = this.cNode ? this.cNode.getNodeType( builder ) : null;

		const aLen = builder.isMatrix( aType ) ? 0 : builder.getTypeLength( aType );
		const bLen = builder.isMatrix( bType ) ? 0 : builder.getTypeLength( bType );
		const cLen = builder.isMatrix( cType ) ? 0 : builder.getTypeLength( cType );

		if ( aLen > bLen && aLen > cLen ) {

			return aType;

		} else if ( bLen > cLen ) {

			return bType;

		} else if ( cLen > aLen ) {

			return cType;

		}

		return aType;

	}

	getNodeType( builder ) {

		const method = this.method;

		if ( method === MathNode.LENGTH || method === MathNode.DISTANCE || method === MathNode.DOT ) {

			return 'float';

		} else if ( method === MathNode.CROSS ) {

			return 'vec3';

		} else if ( method === MathNode.ALL ) {

			return 'bool';

		} else if ( method === MathNode.EQUALS ) {

			return builder.changeComponentType( this.aNode.getNodeType( builder ), 'bool' );

		} else if ( method === MathNode.MOD ) {

			return this.aNode.getNodeType( builder );

		} else {

			return this.getInputType( builder );

		}

	}

	generate( builder, output ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.aNode;
		const b = this.bNode;
		const c = this.cNode;

		const isWebGL = builder.renderer.isWebGLRenderer === true;

		if ( method === MathNode.TRANSFORM_DIRECTION ) {

			// dir can be either a direction vector or a normal vector
			// upper-left 3x3 of matrix is assumed to be orthogonal

			let tA = a;
			let tB = b;

			if ( builder.isMatrix( tA.getNodeType( builder ) ) ) {

				tB = vec4( vec3( tB ), 0.0 );

			} else {

				tA = vec4( vec3( tA ), 0.0 );

			}

			const mulNode = mul( tA, tB ).xyz;

			return normalize( mulNode ).build( builder, output );

		} else if ( method === MathNode.NEGATE ) {

			return builder.format( '( - ' + a.build( builder, inputType ) + ' )', type, output );

		} else if ( method === MathNode.ONE_MINUS ) {

			return sub( 1.0, a ).build( builder, output );

		} else if ( method === MathNode.RECIPROCAL ) {

			return div( 1.0, a ).build( builder, output );

		} else if ( method === MathNode.DIFFERENCE ) {

			return abs( sub( a, b ) ).build( builder, output );

		} else {

			const params = [];

			if ( method === MathNode.CROSS || method === MathNode.MOD ) {

				params.push(
					a.build( builder, type ),
					b.build( builder, type )
				);

			} else if ( method === MathNode.STEP ) {

				params.push(
					a.build( builder, builder.getTypeLength( a.getNodeType( builder ) ) === 1 ? 'float' : inputType ),
					b.build( builder, inputType )
				);

			} else if ( ( isWebGL && ( method === MathNode.MIN || method === MathNode.MAX ) ) || method === MathNode.MOD ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, builder.getTypeLength( b.getNodeType( builder ) ) === 1 ? 'float' : inputType )
				);

			} else if ( method === MathNode.REFRACT ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, inputType ),
					c.build( builder, 'float' )
				);

			} else if ( method === MathNode.MIX ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, inputType ),
					c.build( builder, builder.getTypeLength( c.getNodeType( builder ) ) === 1 ? 'float' : inputType )
				);

			} else {

				params.push( a.build( builder, inputType ) );
				if ( b !== null ) params.push( b.build( builder, inputType ) );
				if ( c !== null ) params.push( c.build( builder, inputType ) );

			}

			return builder.format( `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`, type, output );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

}

// 1 input

MathNode.ALL = 'all';
MathNode.ANY = 'any';
MathNode.EQUALS = 'equals';

MathNode.RADIANS = 'radians';
MathNode.DEGREES = 'degrees';
MathNode.EXP = 'exp';
MathNode.EXP2 = 'exp2';
MathNode.LOG = 'log';
MathNode.LOG2 = 'log2';
MathNode.SQRT = 'sqrt';
MathNode.INVERSE_SQRT = 'inversesqrt';
MathNode.FLOOR = 'floor';
MathNode.CEIL = 'ceil';
MathNode.NORMALIZE = 'normalize';
MathNode.FRACT = 'fract';
MathNode.SIN = 'sin';
MathNode.COS = 'cos';
MathNode.TAN = 'tan';
MathNode.ASIN = 'asin';
MathNode.ACOS = 'acos';
MathNode.ATAN = 'atan';
MathNode.ABS = 'abs';
MathNode.SIGN = 'sign';
MathNode.LENGTH = 'length';
MathNode.NEGATE = 'negate';
MathNode.ONE_MINUS = 'oneMinus';
MathNode.DFDX = 'dFdx';
MathNode.DFDY = 'dFdy';
MathNode.ROUND = 'round';
MathNode.RECIPROCAL = 'reciprocal';
MathNode.TRUNC = 'trunc';
MathNode.FWIDTH = 'fwidth';
MathNode.BITCAST = 'bitcast';

// 2 inputs

MathNode.ATAN2 = 'atan2';
MathNode.MIN = 'min';
MathNode.MAX = 'max';
MathNode.MOD = 'mod';
MathNode.STEP = 'step';
MathNode.REFLECT = 'reflect';
MathNode.DISTANCE = 'distance';
MathNode.DIFFERENCE = 'difference';
MathNode.DOT = 'dot';
MathNode.CROSS = 'cross';
MathNode.POW = 'pow';
MathNode.TRANSFORM_DIRECTION = 'transformDirection';

// 3 inputs

MathNode.MIX = 'mix';
MathNode.CLAMP = 'clamp';
MathNode.REFRACT = 'refract';
MathNode.SMOOTHSTEP = 'smoothstep';
MathNode.FACEFORWARD = 'faceforward';

const EPSILON = float( 1e-6 );
float( 1e6 );
const PI = float( Math.PI );
float( Math.PI * 2 );

const all = nodeProxy( MathNode, MathNode.ALL );
const any = nodeProxy( MathNode, MathNode.ANY );
const equals = nodeProxy( MathNode, MathNode.EQUALS );

const radians = nodeProxy( MathNode, MathNode.RADIANS );
const degrees = nodeProxy( MathNode, MathNode.DEGREES );
const exp = nodeProxy( MathNode, MathNode.EXP );
const exp2 = nodeProxy( MathNode, MathNode.EXP2 );
const log = nodeProxy( MathNode, MathNode.LOG );
const log2 = nodeProxy( MathNode, MathNode.LOG2 );
const sqrt = nodeProxy( MathNode, MathNode.SQRT );
const inverseSqrt = nodeProxy( MathNode, MathNode.INVERSE_SQRT );
const floor = nodeProxy( MathNode, MathNode.FLOOR );
const ceil = nodeProxy( MathNode, MathNode.CEIL );
const normalize = nodeProxy( MathNode, MathNode.NORMALIZE );
const fract = nodeProxy( MathNode, MathNode.FRACT );
const sin = nodeProxy( MathNode, MathNode.SIN );
const cos = nodeProxy( MathNode, MathNode.COS );
const tan = nodeProxy( MathNode, MathNode.TAN );
const asin = nodeProxy( MathNode, MathNode.ASIN );
const acos = nodeProxy( MathNode, MathNode.ACOS );
const atan = nodeProxy( MathNode, MathNode.ATAN );
const abs = nodeProxy( MathNode, MathNode.ABS );
const sign = nodeProxy( MathNode, MathNode.SIGN );
const length = nodeProxy( MathNode, MathNode.LENGTH );
const negate = nodeProxy( MathNode, MathNode.NEGATE );
const oneMinus = nodeProxy( MathNode, MathNode.ONE_MINUS );
const dFdx = nodeProxy( MathNode, MathNode.DFDX );
const dFdy = nodeProxy( MathNode, MathNode.DFDY );
const round = nodeProxy( MathNode, MathNode.ROUND );
const reciprocal = nodeProxy( MathNode, MathNode.RECIPROCAL );
const trunc = nodeProxy( MathNode, MathNode.TRUNC );
const fwidth = nodeProxy( MathNode, MathNode.FWIDTH );
nodeProxy( MathNode, MathNode.BITCAST );

const atan2 = nodeProxy( MathNode, MathNode.ATAN2 );
const min$1 = nodeProxy( MathNode, MathNode.MIN );
const max$1 = nodeProxy( MathNode, MathNode.MAX );
const mod = nodeProxy( MathNode, MathNode.MOD );
const step = nodeProxy( MathNode, MathNode.STEP );
const reflect = nodeProxy( MathNode, MathNode.REFLECT );
const distance = nodeProxy( MathNode, MathNode.DISTANCE );
const difference = nodeProxy( MathNode, MathNode.DIFFERENCE );
const dot = nodeProxy( MathNode, MathNode.DOT );
const cross = nodeProxy( MathNode, MathNode.CROSS );
const pow = nodeProxy( MathNode, MathNode.POW );
const pow2 = nodeProxy( MathNode, MathNode.POW, 2 );
const pow3 = nodeProxy( MathNode, MathNode.POW, 3 );
const pow4 = nodeProxy( MathNode, MathNode.POW, 4 );
const transformDirection = nodeProxy( MathNode, MathNode.TRANSFORM_DIRECTION );

const cbrt = ( a ) => mul( sign( a ), pow( abs( a ), 1.0 / 3.0 ) );
const lengthSq = ( a ) => dot( a, a );
const mix = nodeProxy( MathNode, MathNode.MIX );
const clamp = ( value, low = 0, high = 1 ) => nodeObject( new MathNode( MathNode.CLAMP, nodeObject( value ), nodeObject( low ), nodeObject( high ) ) );
const saturate = ( value ) => clamp( value );
const refract = nodeProxy( MathNode, MathNode.REFRACT );
const smoothstep = nodeProxy( MathNode, MathNode.SMOOTHSTEP );
const faceForward = nodeProxy( MathNode, MathNode.FACEFORWARD );

const mixElement = ( t, e1, e2 ) => mix( e1, e2, t );
const smoothstepElement = ( x, low, high ) => smoothstep( low, high, x );

addNodeElement( 'all', all );
addNodeElement( 'any', any );
addNodeElement( 'equals', equals );

addNodeElement( 'radians', radians );
addNodeElement( 'degrees', degrees );
addNodeElement( 'exp', exp );
addNodeElement( 'exp2', exp2 );
addNodeElement( 'log', log );
addNodeElement( 'log2', log2 );
addNodeElement( 'sqrt', sqrt );
addNodeElement( 'inverseSqrt', inverseSqrt );
addNodeElement( 'floor', floor );
addNodeElement( 'ceil', ceil );
addNodeElement( 'normalize', normalize );
addNodeElement( 'fract', fract );
addNodeElement( 'sin', sin );
addNodeElement( 'cos', cos );
addNodeElement( 'tan', tan );
addNodeElement( 'asin', asin );
addNodeElement( 'acos', acos );
addNodeElement( 'atan', atan );
addNodeElement( 'abs', abs );
addNodeElement( 'sign', sign );
addNodeElement( 'length', length );
addNodeElement( 'lengthSq', lengthSq );
addNodeElement( 'negate', negate );
addNodeElement( 'oneMinus', oneMinus );
addNodeElement( 'dFdx', dFdx );
addNodeElement( 'dFdy', dFdy );
addNodeElement( 'round', round );
addNodeElement( 'reciprocal', reciprocal );
addNodeElement( 'trunc', trunc );
addNodeElement( 'fwidth', fwidth );
addNodeElement( 'atan2', atan2 );
addNodeElement( 'min', min$1 );
addNodeElement( 'max', max$1 );
addNodeElement( 'mod', mod );
addNodeElement( 'step', step );
addNodeElement( 'reflect', reflect );
addNodeElement( 'distance', distance );
addNodeElement( 'dot', dot );
addNodeElement( 'cross', cross );
addNodeElement( 'pow', pow );
addNodeElement( 'pow2', pow2 );
addNodeElement( 'pow3', pow3 );
addNodeElement( 'pow4', pow4 );
addNodeElement( 'transformDirection', transformDirection );
addNodeElement( 'mix', mixElement );
addNodeElement( 'clamp', clamp );
addNodeElement( 'refract', refract );
addNodeElement( 'smoothstep', smoothstepElement );
addNodeElement( 'faceForward', faceForward );
addNodeElement( 'difference', difference );
addNodeElement( 'saturate', saturate );
addNodeElement( 'cbrt', cbrt );

addNodeClass( 'MathNode', MathNode );

const sRGBToLinearShader = tslFn( ( inputs ) => {

	const { value } = inputs;
	const { rgb } = value;

	const a = rgb.mul( 0.9478672986 ).add( 0.0521327014 ).pow( 2.4 );
	const b = rgb.mul( 0.0773993808 );
	const factor = rgb.lessThanEqual( 0.04045 );

	const rgbResult = mix( a, b, factor );

	return vec4( rgbResult, value.a );

} );

const LinearTosRGBShader = tslFn( ( inputs ) => {

	const { value } = inputs;
	const { rgb } = value;

	const a = rgb.pow( 0.41666 ).mul( 1.055 ).sub( 0.055 );
	const b = rgb.mul( 12.92 );
	const factor = rgb.lessThanEqual( 0.0031308 );

	const rgbResult = mix( a, b, factor );

	return vec4( rgbResult, value.a );

} );

const getColorSpaceMethod = ( colorSpace ) => {

	let method = null;

	if ( colorSpace === LinearSRGBColorSpace ) {

		method = 'Linear';

	} else if ( colorSpace === SRGBColorSpace ) {

		method = 'sRGB';

	}

	return method;

};

const getMethod = ( source, target ) => {

	return getColorSpaceMethod( source ) + 'To' + getColorSpaceMethod( target );

};

class ColorSpaceNode extends TempNode {

	constructor( method, node ) {

		super( 'vec4' );

		this.method = method;
		this.node = node;

	}

	setup() {

		const { method, node } = this;

		if ( method === ColorSpaceNode.LINEAR_TO_LINEAR )
			return node;

		return Methods[ method ]( { value: node } );

	}

}

ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear';
ColorSpaceNode.LINEAR_TO_sRGB = 'LinearTosRGB';
ColorSpaceNode.sRGB_TO_LINEAR = 'sRGBToLinear';

const Methods = {
	[ ColorSpaceNode.LINEAR_TO_sRGB ]: LinearTosRGBShader,
	[ ColorSpaceNode.sRGB_TO_LINEAR ]: sRGBToLinearShader
};

const linearToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( getMethod( LinearSRGBColorSpace, colorSpace ), nodeObject( node ) ) );
const colorSpaceToLinear = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( getMethod( colorSpace, LinearSRGBColorSpace ), nodeObject( node ) ) );

const linearTosRGB = nodeProxy( ColorSpaceNode, ColorSpaceNode.LINEAR_TO_sRGB );
const sRGBToLinear = nodeProxy( ColorSpaceNode, ColorSpaceNode.sRGB_TO_LINEAR );

addNodeElement( 'linearTosRGB', linearTosRGB );
addNodeElement( 'sRGBToLinear', sRGBToLinear );
addNodeElement( 'linearToColorSpace', linearToColorSpace );
addNodeElement( 'colorSpaceToLinear', colorSpaceToLinear );

addNodeClass( 'ColorSpaceNode', ColorSpaceNode );

class ExpressionNode extends Node {

	constructor( snippet = '', nodeType = 'void' ) {

		super( nodeType );

		this.snippet = snippet;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snippet = this.snippet;

		if ( type === 'void' ) {

			builder.addLineFlowCode( snippet );

		} else {

			return builder.format( `( ${ snippet } )`, type, output );

		}

	}

}

const expression = nodeProxy( ExpressionNode );

addNodeClass( 'ExpressionNode', ExpressionNode );

class MaxMipLevelNode extends UniformNode {

	constructor( textureNode ) {

		super( 0 );

		this.textureNode = textureNode;

		this.updateType = NodeUpdateType.FRAME;

	}

	get texture() {

		return this.textureNode.value;

	}

	update() {

		const texture = this.texture;
		const images = texture.images;
		const image = ( images && images.length > 0 ) ? ( ( images[ 0 ] && images[ 0 ].image ) || images[ 0 ] ) : texture.image;

		if ( image && image.width !== undefined ) {

			const { width, height } = image;

			this.value = Math.log2( Math.max( width, height ) );

		}

	}

}

const maxMipLevel = nodeProxy( MaxMipLevelNode );

addNodeClass( 'MaxMipLevelNode', MaxMipLevelNode );

class TextureNode extends UniformNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;
		this.compareNode = null;
		this.depthNode = null;

		this.sampler = true;
		this.updateMatrix = false;
		this.updateType = NodeUpdateType.NONE;

		this.setUpdateMatrix( uvNode === null );

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getNodeType( /*builder*/ ) {

		if ( this.value.isDepthTexture === true ) return 'float';

		return 'vec4';

	}

	getInputType( /*builder*/ ) {

		return 'texture';

	}

	getDefaultUV() {

		return uv( this.value.channel );

	}

	setReference( /*state*/ ) {

		return this.value;

	}

	getTransformedUV( uvNode ) {

		const texture = this.value;

		return uniform( texture.matrix ).mul( vec3( uvNode, 1 ) ).xy;

	}

	setUpdateMatrix( value ) {

		this.updateMatrix = value;
		this.updateType = value ? NodeUpdateType.FRAME : NodeUpdateType.NONE;

		return this;

	}

	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.isFlipY() && ( texture.isRenderTargetTexture === true || texture.isFramebufferTexture === true || texture.isDepthTexture === true ) ) {

			uvNode = uvNode.setY( uvNode.y.oneMinus() );

		}

		return uvNode;

	}

	setup( builder ) {

		const properties = builder.getNodeProperties( this );

		//

		let uvNode = this.uvNode;

		if ( ( uvNode === null || builder.context.forceUVContext === true ) && builder.context.getUV ) {

			uvNode = builder.context.getUV( this );

		}

		if ( ! uvNode ) uvNode = this.getDefaultUV();

		if ( this.updateMatrix === true ) {

			uvNode = this.getTransformedUV( uvNode );

		}

		uvNode = this.setupUV( builder, uvNode );

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		if ( levelNode !== null && builder.context.getTextureLevelAlgorithm !== undefined ) {

			levelNode = builder.context.getTextureLevelAlgorithm( this, levelNode );

		}

		//

		properties.uvNode = uvNode;
		properties.levelNode = levelNode;
		properties.compareNode = this.compareNode;
		properties.depthNode = this.depthNode;

	}

	generateUV( builder, uvNode ) {

		return uvNode.build( builder, this.sampler === true ? 'vec2' : 'ivec2' );

	}

	generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, depthSnippet, compareSnippet ) {

		const texture = this.value;

		let snippet;

		if ( levelSnippet ) {

			snippet = builder.generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet );

		} else if ( compareSnippet ) {

			snippet = builder.generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet );

		} else if ( this.sampler === false ) {

			snippet = builder.generateTextureLoad( texture, textureProperty, uvSnippet, depthSnippet );

		} else {

			snippet = builder.generateTexture( texture, textureProperty, uvSnippet, depthSnippet );

		}

		return snippet;

	}

	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		const texture = this.value;

		if ( ! texture || texture.isTexture !== true ) {

			throw new Error( 'TextureNode: Need a three.js texture.' );

		}

		const textureProperty = super.generate( builder, 'property' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		} else {

			const nodeData = builder.getDataFromNode( this );

			let propertyName = nodeData.propertyName;

			if ( propertyName === undefined ) {

				const { uvNode, levelNode, compareNode, depthNode } = properties;

				const uvSnippet = this.generateUV( builder, uvNode );
				const levelSnippet = levelNode ? levelNode.build( builder, 'float' ) : null;
				const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;
				const compareSnippet = compareNode ? compareNode.build( builder, 'float' ) : null;

				const nodeVar = builder.getVarFromNode( this );

				propertyName = builder.getPropertyName( nodeVar );

				const snippet = this.generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, depthSnippet, compareSnippet );

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				if ( builder.context.tempWrite !== false ) {

					nodeData.snippet = snippet;
					nodeData.propertyName = propertyName;

				}

			}

			let snippet = propertyName;
			const nodeType = this.getNodeType( builder );

			if ( builder.needsColorSpaceToLinear( texture ) ) {

				snippet = colorSpaceToLinear( expression( snippet, nodeType ), texture.colorSpace ).setup( builder ).build( builder, nodeType );

			}

			return builder.format( snippet, nodeType, output );

		}

	}

	setSampler( value ) {

		this.sampler = value;

		return this;

	}

	getSampler() {

		return this.sampler;

	}

	// @TODO: Move to TSL

	uv( uvNode ) {

		const textureNode = this.clone();
		textureNode.uvNode = uvNode;

		return nodeObject( textureNode );

	}

	blur( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = levelNode.mul( maxMipLevel( textureNode ) );

		return nodeObject( textureNode );

	}

	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = levelNode;

		return textureNode;

	}

	size( levelNode ) {

		return textureSize( this, levelNode );

	}

	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );

		return nodeObject( textureNode );

	}

	depth( depthNode ) {

		const textureNode = this.clone();
		textureNode.depthNode = nodeObject( depthNode );

		return nodeObject( textureNode );

	}

	// --

	serialize( data ) {

		super.serialize( data );

		data.value = this.value.toJSON( data.meta ).uuid;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.value = data.meta.textures[ data.value ];

	}

	update() {

		const texture = this.value;

		if ( texture.matrixAutoUpdate === true ) {

			texture.updateMatrix();

		}

	}

	clone() {

		const newNode = new this.constructor( this.value, this.uvNode, this.levelNode );
		newNode.sampler = this.sampler;

		return newNode;

	}

}

const texture = nodeProxy( TextureNode );
const textureLoad = ( ...params ) => texture( ...params ).setSampler( false );

addNodeElement( 'texture', texture );
//addNodeElement( 'textureLevel', textureLevel );

addNodeClass( 'TextureNode', TextureNode );

class BufferNode extends UniformNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getInputType( /*builder*/ ) {

		return 'buffer';

	}

}

const buffer = ( value, type, count ) => nodeObject( new BufferNode( value, type, count ) );

addNodeClass( 'BufferNode', BufferNode );

class UniformsElementNode extends ArrayElementNode {

	constructor( arrayBuffer, indexNode ) {

		super( arrayBuffer, indexNode );

		this.isArrayBufferElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getElementType( builder );

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const type = this.getNodeType();

		return builder.format( snippet, 'vec4', type );

	}

}

class UniformsNode extends BufferNode {

	constructor( value, elementType = null ) {

		super( null, 'vec4' );

		this.array = value;
		this.elementType = elementType;

		this._elementType = null;
		this._elementLength = 0;

		this.updateType = NodeUpdateType.RENDER;

		this.isArrayBufferNode = true;

	}

	getElementType() {

		return this.elementType || this._elementType;

	}

	getElementLength() {

		return this._elementLength;

	}

	update( /*frame*/ ) {

		const { array, value } = this;

		const elementLength = this.getElementLength();
		const elementType = this.getElementType();

		if ( elementLength === 1 ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;

				value[ index ] = array[ i ];

			}

		} else if ( elementType === 'color' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const vector = array[ i ];

				value[ index ] = vector.r;
				value[ index + 1 ] = vector.g;
				value[ index + 2 ] = vector.b || 0;
				//value[ index + 3 ] = vector.a || 0;

			}

		} else {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const vector = array[ i ];

				value[ index ] = vector.x;
				value[ index + 1 ] = vector.y;
				value[ index + 2 ] = vector.z || 0;
				value[ index + 3 ] = vector.w || 0;

			}

		}

	}

	setup( builder ) {

		const length = this.array.length;

		this._elementType = this.elementType === null ? getValueType( this.array[ 0 ] ) : this.elementType;
		this._elementLength = builder.getTypeLength( this._elementType );

		this.value = new Float32Array( length * 4 );
		this.bufferCount = length;

		return super.setup( builder );

	}

	element( indexNode ) {

		return nodeObject( new UniformsElementNode( this, nodeObject( indexNode ) ) );

	}

}

const uniforms = ( values, nodeType ) => nodeObject( new UniformsNode( values, nodeType ) );

addNodeClass( 'UniformsNode', UniformsNode );

class ReferenceElementNode extends ArrayElementNode {

	constructor( referenceNode, indexNode ) {

		super( referenceNode, indexNode );

		this.referenceNode = referenceNode;

		this.isReferenceElementNode = true;

	}

	getNodeType() {

		return this.referenceNode.uniformType;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const arrayType = this.referenceNode.getNodeType();
		const elementType = this.getNodeType();

		return builder.format( snippet, arrayType, elementType );

	}

}

class ReferenceNode extends Node {

	constructor( property, uniformType, object = null, count = null ) {

		super();

		this.property = property;
		this.uniformType = uniformType;
		this.object = object;
		this.count = count;

		this.properties = property.split( '.' );
		this.reference = null;
		this.node = null;

		this.updateType = NodeUpdateType.OBJECT;

	}

	element( indexNode ) {

		return nodeObject( new ReferenceElementNode( this, nodeObject( indexNode ) ) );

	}

	setNodeType( uniformType ) {

		let node = null;

		if ( this.count !== null ) {

			node = buffer( null, uniformType, this.count );

		} else if ( Array.isArray( this.getValueFromReference() ) ) {

			node = uniforms( null, uniformType );

		} else if ( uniformType === 'texture' ) {

			node = texture( null );

		} else {

			node = uniform( null, uniformType );

		}

		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	getValueFromReference( object = this.reference ) {

		const { properties } = this;

		let value = object[ properties[ 0 ] ];

		for ( let i = 1; i < properties.length; i ++ ) {

			value = value[ properties[ i ] ];

		}

		return value;

	}

	setReference( state ) {

		this.reference = this.object !== null ? this.object : state.object;

		return this.reference;

	}

	setup() {

		this.updateValue();

		return this.node;

	}

	update( /*frame*/ ) {

		this.updateValue();

	}

	updateValue() {

		if ( this.node === null ) this.setNodeType( this.uniformType );

		const value = this.getValueFromReference();

		if ( Array.isArray( value ) ) {

			this.node.array = value;

		} else {

			this.node.value = value;

		}

	}

}

const reference = ( name, type, object ) => nodeObject( new ReferenceNode( name, type, object ) );
const referenceBuffer = ( name, type, count, object ) => nodeObject( new ReferenceNode( name, type, object, count ) );

addNodeClass( 'ReferenceNode', ReferenceNode );

class MaterialReferenceNode extends ReferenceNode {

	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		this.material = material;

		//this.updateType = NodeUpdateType.RENDER;

	}

	/*setNodeType( node ) {

		super.setNodeType( node );

		this.node.groupNode = renderGroup;

	}*/

	setReference( state ) {

		this.reference = this.material !== null ? this.material : state.material;

		return this.reference;

	}

}

const materialReference = ( name, type, material ) => nodeObject( new MaterialReferenceNode( name, type, material ) );

addNodeClass( 'MaterialReferenceNode', MaterialReferenceNode );

class Object3DNode extends Node {

	constructor( scope = Object3DNode.VIEW_MATRIX, object3d = null ) {

		super();

		this.scope = scope;
		this.object3d = object3d;

		this.updateType = NodeUpdateType.OBJECT;

		this._uniformNode = new UniformNode( null );

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX || scope === Object3DNode.VIEW_MATRIX ) {

			return 'mat4';

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			return 'mat3';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION || scope === Object3DNode.DIRECTION || scope === Object3DNode.SCALE ) {

			return 'vec3';

		}

	}

	update( frame ) {

		const object = this.object3d;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		if ( scope === Object3DNode.VIEW_MATRIX ) {

			uniformNode.value = object.modelViewMatrix;

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			uniformNode.value = object.normalMatrix;

		} else if ( scope === Object3DNode.WORLD_MATRIX ) {

			uniformNode.value = object.matrixWorld;

		} else if ( scope === Object3DNode.POSITION ) {

			uniformNode.value = uniformNode.value || new Vector3();

			uniformNode.value.setFromMatrixPosition( object.matrixWorld );

		} else if ( scope === Object3DNode.SCALE ) {

			uniformNode.value = uniformNode.value || new Vector3();

			uniformNode.value.setFromMatrixScale( object.matrixWorld );

		} else if ( scope === Object3DNode.DIRECTION ) {

			uniformNode.value = uniformNode.value || new Vector3();

			object.getWorldDirection( uniformNode.value );

		} else if ( scope === Object3DNode.VIEW_POSITION ) {

			const camera = frame.camera;

			uniformNode.value = uniformNode.value || new Vector3();
			uniformNode.value.setFromMatrixPosition( object.matrixWorld );

			uniformNode.value.applyMatrix4( camera.matrixWorldInverse );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX || scope === Object3DNode.VIEW_MATRIX ) {

			this._uniformNode.nodeType = 'mat4';

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			this._uniformNode.nodeType = 'mat3';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION || scope === Object3DNode.DIRECTION || scope === Object3DNode.SCALE ) {

			this._uniformNode.nodeType = 'vec3';

		}

		return this._uniformNode.build( builder );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

Object3DNode.VIEW_MATRIX = 'viewMatrix';
Object3DNode.NORMAL_MATRIX = 'normalMatrix';
Object3DNode.WORLD_MATRIX = 'worldMatrix';
Object3DNode.POSITION = 'position';
Object3DNode.SCALE = 'scale';
Object3DNode.VIEW_POSITION = 'viewPosition';
Object3DNode.DIRECTION = 'direction';

nodeProxy( Object3DNode, Object3DNode.DIRECTION );
nodeProxy( Object3DNode, Object3DNode.VIEW_MATRIX );
nodeProxy( Object3DNode, Object3DNode.NORMAL_MATRIX );
nodeProxy( Object3DNode, Object3DNode.WORLD_MATRIX );
const objectPosition = nodeProxy( Object3DNode, Object3DNode.POSITION );
nodeProxy( Object3DNode, Object3DNode.SCALE );
const objectViewPosition = nodeProxy( Object3DNode, Object3DNode.VIEW_POSITION );

addNodeClass( 'Object3DNode', Object3DNode );

//const cameraGroup = sharedUniformGroup( 'camera' );

class CameraNode extends Object3DNode {

	constructor( scope = CameraNode.POSITION ) {

		super( scope );

		this.updateType = NodeUpdateType.RENDER;

		//this._uniformNode.groupNode = cameraGroup;

	}

	getNodeType( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX || scope === CameraNode.PROJECTION_MATRIX_INVERSE ) {

			return 'mat4';

		} else if ( scope === CameraNode.NEAR || scope === CameraNode.FAR || scope === CameraNode.LOG_DEPTH ) {

			return 'float';

		}

		return super.getNodeType( builder );

	}

	update( frame ) {

		const camera = frame.camera;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		//cameraGroup.needsUpdate = true;

		if ( scope === CameraNode.VIEW_MATRIX ) {

			uniformNode.value = camera.matrixWorldInverse;

		} else if ( scope === CameraNode.PROJECTION_MATRIX ) {

			uniformNode.value = camera.projectionMatrix;

		} else if ( scope === CameraNode.PROJECTION_MATRIX_INVERSE ) {

			uniformNode.value = camera.projectionMatrixInverse;

		} else if ( scope === CameraNode.NEAR ) {

			uniformNode.value = camera.near;

		} else if ( scope === CameraNode.FAR ) {

			uniformNode.value = camera.far;

		} else if ( scope === CameraNode.LOG_DEPTH ) {

			uniformNode.value = 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 );

		} else {

			this.object3d = camera;

			super.update( frame );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX || scope === CameraNode.PROJECTION_MATRIX_INVERSE ) {

			this._uniformNode.nodeType = 'mat4';

		} else if ( scope === CameraNode.NEAR || scope === CameraNode.FAR || scope === CameraNode.LOG_DEPTH ) {

			this._uniformNode.nodeType = 'float';

		}

		return super.generate( builder );

	}

}

CameraNode.PROJECTION_MATRIX = 'projectionMatrix';
CameraNode.PROJECTION_MATRIX_INVERSE = 'projectionMatrixInverse';
CameraNode.NEAR = 'near';
CameraNode.FAR = 'far';
CameraNode.LOG_DEPTH = 'logDepth';

const cameraProjectionMatrix = nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX );
nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX_INVERSE );
const cameraNear = nodeImmutable( CameraNode, CameraNode.NEAR );
const cameraFar = nodeImmutable( CameraNode, CameraNode.FAR );
const cameraLogDepth = nodeImmutable( CameraNode, CameraNode.LOG_DEPTH );
const cameraViewMatrix = nodeImmutable( CameraNode, CameraNode.VIEW_MATRIX );
nodeImmutable( CameraNode, CameraNode.NORMAL_MATRIX );
nodeImmutable( CameraNode, CameraNode.WORLD_MATRIX );
nodeImmutable( CameraNode, CameraNode.POSITION );

addNodeClass( 'CameraNode', CameraNode );

class ModelNode extends Object3DNode {

	constructor( scope = ModelNode.VIEW_MATRIX ) {

		super( scope );

	}

	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

nodeImmutable( ModelNode, ModelNode.DIRECTION );
const modelViewMatrix = nodeImmutable( ModelNode, ModelNode.VIEW_MATRIX ).label( 'modelViewMatrix' ).temp( 'ModelViewMatrix' );
const modelNormalMatrix = nodeImmutable( ModelNode, ModelNode.NORMAL_MATRIX );
const modelWorldMatrix = nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );
nodeImmutable( ModelNode, ModelNode.POSITION );
nodeImmutable( ModelNode, ModelNode.SCALE );
nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );

addNodeClass( 'ModelNode', ModelNode );

class NormalNode extends Node {

	constructor( scope = NormalNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	isGlobal() {

		return true;

	}

	getHash( /*builder*/ ) {

		return `normal-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === NormalNode.GEOMETRY ) {

			outputNode = attribute( 'normal', 'vec3' );

		} else if ( scope === NormalNode.LOCAL ) {

			outputNode = varying( normalGeometry );

		} else if ( scope === NormalNode.VIEW ) {

			const vertexNode = modelNormalMatrix.mul( normalLocal );
			outputNode = normalize( varying( vertexNode ) );

		} else if ( scope === NormalNode.WORLD ) {

			// To use inverseTransformDirection only inverse the param order like this: cameraViewMatrix.transformDirection( normalView )
			const vertexNode = normalView.transformDirection( cameraViewMatrix );
			outputNode = normalize( varying( vertexNode ) );

		}

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

NormalNode.GEOMETRY = 'geometry';
NormalNode.LOCAL = 'local';
NormalNode.VIEW = 'view';
NormalNode.WORLD = 'world';

const normalGeometry = nodeImmutable( NormalNode, NormalNode.GEOMETRY );
const normalLocal = nodeImmutable( NormalNode, NormalNode.LOCAL ).temp( 'Normal' );
const normalView = nodeImmutable( NormalNode, NormalNode.VIEW );
const normalWorld = nodeImmutable( NormalNode, NormalNode.WORLD );
const transformedNormalView = property( 'vec3', 'TransformedNormalView' );
const transformedNormalWorld = transformedNormalView.transformDirection( cameraViewMatrix ).normalize();
const transformedClearcoatNormalView = property( 'vec3', 'TransformedClearcoatNormalView' );

addNodeClass( 'NormalNode', NormalNode );

const _propertyCache = new Map();

class MaterialNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

	}

	getCache( property, type ) {

		let node = _propertyCache.get( property );

		if ( node === undefined ) {

			node = materialReference( property, type );

			_propertyCache.set( property, node );

		}

		return node;

	}

	getFloat( property ) {

		return this.getCache( property, 'float' );

	}

	getColor( property ) {

		return this.getCache( property, 'color' );

	}

	getTexture( property ) {

		return this.getCache( property === 'map' ? 'map' : property + 'Map', 'texture' );

	}

	setup( builder ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.COLOR ) {

			const colorNode = this.getColor( scope );

			if ( material.map && material.map.isTexture === true ) {

				node = colorNode.mul( this.getTexture( 'map' ) );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = this.getFloat( scope );

			if ( material.alphaMap && material.alphaMap.isTexture === true ) {

				node = opacityNode.mul( this.getTexture( 'alpha' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.SPECULAR_STRENGTH ) {

			if ( material.specularMap && material.specularMap.isTexture === true ) {

				node = this.getTexture( scope ).r;

			} else {

				node = float( 1 );

			}

		} else if ( scope === MaterialNode.ROUGHNESS ) { // TODO: cleanup similar branches

			const roughnessNode = this.getFloat( scope );

			if ( material.roughnessMap && material.roughnessMap.isTexture === true ) {

				node = roughnessNode.mul( this.getTexture( scope ).g );

			} else {

				node = roughnessNode;

			}

		} else if ( scope === MaterialNode.METALNESS ) {

			const metalnessNode = this.getFloat( scope );

			if ( material.metalnessMap && material.metalnessMap.isTexture === true ) {

				node = metalnessNode.mul( this.getTexture( scope ).b );

			} else {

				node = metalnessNode;

			}

		} else if ( scope === MaterialNode.EMISSIVE ) {

			const emissiveNode = this.getColor( scope );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = emissiveNode.mul( this.getTexture( scope ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.NORMAL ) {

			if ( material.normalMap ) {

				node = this.getTexture( 'normal' ).normalMap( this.getCache( 'normalScale', 'vec2' ) );

			} else if ( material.bumpMap ) {

				node = this.getTexture( 'bump' ).r.bumpMap( this.getFloat( 'bumpScale' ) );

			} else {

				node = normalView;

			}

		} else if ( scope === MaterialNode.CLEARCOAT ) {

			const clearcoatNode = this.getFloat( scope );

			if ( material.clearcoatMap && material.clearcoatMap.isTexture === true ) {

				node = clearcoatNode.mul( this.getTexture( scope ).r );

			} else {

				node = clearcoatNode;

			}

		} else if ( scope === MaterialNode.CLEARCOAT_ROUGHNESS ) {

			const clearcoatRoughnessNode = this.getFloat( scope );

			if ( material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.isTexture === true ) {

				node = clearcoatRoughnessNode.mul( this.getTexture( scope ).r );

			} else {

				node = clearcoatRoughnessNode;

			}

		} else if ( scope === MaterialNode.CLEARCOAT_NORMAL ) {

			if ( material.clearcoatNormalMap ) {

				node = this.getTexture( scope ).normalMap( this.getCache( scope + 'Scale', 'vec2' ) );

			} else {

				node = normalView;

			}

		} else if ( scope === MaterialNode.SHEEN ) {

			const sheenNode = this.getColor( 'sheenColor' ).mul( this.getFloat( 'sheen' ) ); // Move this mul() to CPU

			if ( material.sheenColorMap && material.sheenColorMap.isTexture === true ) {

				node = sheenNode.mul( this.getTexture( 'sheenColor' ).rgb );

			} else {

				node = sheenNode;

			}

		} else if ( scope === MaterialNode.SHEEN_ROUGHNESS ) {

			const sheenRoughnessNode = this.getFloat( scope );

			if ( material.sheenRoughnessMap && material.sheenRoughnessMap.isTexture === true ) {

				node = sheenRoughnessNode.mul( this.getTexture( scope ).a );

			} else {

				node = sheenRoughnessNode;

			}

			node = node.clamp( 0.07, 1.0 );

		} else if ( scope === MaterialNode.IRIDESCENCE_THICKNESS ) {

			const iridescenceThicknessMaximum = reference( '1', 'float', material.iridescenceThicknessRange );

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMinimum = reference( '0', 'float', material.iridescenceThicknessRange );

				node = iridescenceThicknessMaximum.sub( iridescenceThicknessMinimum ).mul( this.getTexture( scope ).g ).add( iridescenceThicknessMinimum );

			} else {

				node = iridescenceThicknessMaximum;

			}

		} else {

			const outputType = this.getNodeType( builder );

			node = this.getCache( scope, outputType );

		}

		return node;

	}

}

MaterialNode.ALPHA_TEST = 'alphaTest';
MaterialNode.COLOR = 'color';
MaterialNode.OPACITY = 'opacity';
MaterialNode.SHININESS = 'shininess';
MaterialNode.SPECULAR_COLOR = 'specular';
MaterialNode.SPECULAR_STRENGTH = 'specularStrength';
MaterialNode.REFLECTIVITY = 'reflectivity';
MaterialNode.ROUGHNESS = 'roughness';
MaterialNode.METALNESS = 'metalness';
MaterialNode.NORMAL = 'normal';
MaterialNode.CLEARCOAT = 'clearcoat';
MaterialNode.CLEARCOAT_ROUGHNESS = 'clearcoatRoughness';
MaterialNode.CLEARCOAT_NORMAL = 'clearcoatNormal';
MaterialNode.EMISSIVE = 'emissive';
MaterialNode.ROTATION = 'rotation';
MaterialNode.SHEEN = 'sheen';
MaterialNode.SHEEN_ROUGHNESS = 'sheenRoughness';
MaterialNode.IRIDESCENCE = 'iridescence';
MaterialNode.IRIDESCENCE_IOR = 'iridescenceIOR';
MaterialNode.IRIDESCENCE_THICKNESS = 'iridescenceThickness';
MaterialNode.LINE_SCALE = 'scale';
MaterialNode.LINE_DASH_SIZE = 'dashSize';
MaterialNode.LINE_GAP_SIZE = 'gapSize';
MaterialNode.LINE_WIDTH = 'linewidth';
MaterialNode.LINE_DASH_OFFSET = 'dashOffset';
MaterialNode.POINT_WIDTH = 'pointWidth';

const materialAlphaTest = nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );
const materialColor = nodeImmutable( MaterialNode, MaterialNode.COLOR );
const materialShininess = nodeImmutable( MaterialNode, MaterialNode.SHININESS );
const materialEmissive = nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );
const materialOpacity = nodeImmutable( MaterialNode, MaterialNode.OPACITY );
const materialSpecularColor = nodeImmutable( MaterialNode, MaterialNode.SPECULAR_COLOR );
const materialSpecularStrength = nodeImmutable( MaterialNode, MaterialNode.SPECULAR_STRENGTH );
nodeImmutable( MaterialNode, MaterialNode.REFLECTIVITY );
const materialRoughness = nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );
const materialMetalness = nodeImmutable( MaterialNode, MaterialNode.METALNESS );
const materialNormal = nodeImmutable( MaterialNode, MaterialNode.NORMAL );
const materialClearcoat = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT );
const materialClearcoatRoughness = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_ROUGHNESS );
const materialClearcoatNormal = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_NORMAL );
const materialRotation = nodeImmutable( MaterialNode, MaterialNode.ROTATION );
const materialSheen = nodeImmutable( MaterialNode, MaterialNode.SHEEN );
const materialSheenRoughness = nodeImmutable( MaterialNode, MaterialNode.SHEEN_ROUGHNESS );
const materialIridescence = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE );
const materialIridescenceIOR = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_IOR );
const materialIridescenceThickness = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_THICKNESS );
const materialLineScale = nodeImmutable( MaterialNode, MaterialNode.LINE_SCALE );
const materialLineDashSize = nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_SIZE );
const materialLineGapSize = nodeImmutable( MaterialNode, MaterialNode.LINE_GAP_SIZE );
const materialLineWidth = nodeImmutable( MaterialNode, MaterialNode.LINE_WIDTH );
const materialLineDashOffset = nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_OFFSET );
const materialPointWidth = nodeImmutable( MaterialNode, MaterialNode.POINT_WIDTH );

addNodeClass( 'MaterialNode', MaterialNode );

class PositionNode extends Node {

	constructor( scope = PositionNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	isGlobal() {

		return true;

	}

	getHash( /*builder*/ ) {

		return `position-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === PositionNode.GEOMETRY ) {

			outputNode = attribute( 'position', 'vec3' );

		} else if ( scope === PositionNode.LOCAL ) {

			outputNode = varying( positionGeometry );

		} else if ( scope === PositionNode.WORLD ) {

			const vertexPositionNode = modelWorldMatrix.mul( positionLocal );
			outputNode = varying( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW ) {

			const vertexPositionNode = modelViewMatrix.mul( positionLocal );
			outputNode = varying( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW_DIRECTION ) {

			const vertexPositionNode = positionView.negate();
			outputNode = normalize( varying( vertexPositionNode ) );

		} else if ( scope === PositionNode.WORLD_DIRECTION ) {

			const vertexPositionNode = positionLocal.transformDirection( modelWorldMatrix );
			outputNode = normalize( varying( vertexPositionNode ) );

		}

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

PositionNode.GEOMETRY = 'geometry';
PositionNode.LOCAL = 'local';
PositionNode.WORLD = 'world';
PositionNode.WORLD_DIRECTION = 'worldDirection';
PositionNode.VIEW = 'view';
PositionNode.VIEW_DIRECTION = 'viewDirection';

const positionGeometry = nodeImmutable( PositionNode, PositionNode.GEOMETRY );
const positionLocal = nodeImmutable( PositionNode, PositionNode.LOCAL ).temp( 'Position' );
const positionWorld = nodeImmutable( PositionNode, PositionNode.WORLD );
const positionWorldDirection = nodeImmutable( PositionNode, PositionNode.WORLD_DIRECTION );
const positionView = nodeImmutable( PositionNode, PositionNode.VIEW );
const positionViewDirection = nodeImmutable( PositionNode, PositionNode.VIEW_DIRECTION );

addNodeClass( 'PositionNode', PositionNode );

class ModelViewProjectionNode extends TempNode {

	constructor( positionNode = null ) {

		super( 'vec4' );

		this.positionNode = positionNode;

	}

	setup( builder ) {

		if ( builder.shaderStage === 'fragment' ) {

			return varying( builder.context.mvp );

		}

		const position = this.positionNode || positionLocal;

		return cameraProjectionMatrix.mul( modelViewMatrix ).mul( position );

	}

}

const modelViewProjection = nodeProxy( ModelViewProjectionNode );

addNodeClass( 'ModelViewProjectionNode', ModelViewProjectionNode );

class BufferAttributeNode extends InputNode {

	constructor( value, bufferType = null, bufferStride = 0, bufferOffset = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferStride = bufferStride;
		this.bufferOffset = bufferOffset;

		this.usage = StaticDrawUsage;
		this.instanced = false;

		this.attribute = null;

		if ( value && value.isBufferAttribute === true ) {

			this.attribute = value;
			this.usage = value.usage;
			this.instanced = value.isInstancedBufferAttribute;

		}

	}

	getNodeType( builder ) {

		if ( this.bufferType === null ) {

			this.bufferType = builder.getTypeFromAttribute( this.attribute );

		}

		return this.bufferType;

	}

	setup( builder ) {

		if ( this.attribute !== null ) return;

		const type = this.getNodeType( builder );
		const array = this.value;
		const itemSize = builder.getTypeLength( type );
		const stride = this.bufferStride || itemSize;
		const offset = this.bufferOffset;

		const buffer = array.isInterleavedBuffer === true ? array : new InterleavedBuffer( array, stride );
		const bufferAttribute = new InterleavedBufferAttribute( buffer, itemSize, offset );

		buffer.setUsage( this.usage );

		this.attribute = bufferAttribute;
		this.attribute.isInstancedBufferAttribute = this.instanced; // @TODO: Add a possible: InstancedInterleavedBufferAttribute

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );

		const nodeAttribute = builder.getBufferAttributeFromNode( this, nodeType );
		const propertyName = builder.getPropertyName( nodeAttribute );

		let output = null;

		if ( builder.shaderStage === 'vertex' || builder.shaderStage === 'compute' ) {

			this.name = propertyName;

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

	getInputType( /*builder*/ ) {

		return 'bufferAttribute';

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	setInstanced( value ) {

		this.instanced = value;

		return this;

	}

}

const bufferAttribute = ( array, type, stride, offset ) => nodeObject( new BufferAttributeNode( array, type, stride, offset ) );
const dynamicBufferAttribute = ( array, type, stride, offset ) => bufferAttribute( array, type, stride, offset ).setUsage( DynamicDrawUsage );

const instancedBufferAttribute = ( array, type, stride, offset ) => bufferAttribute( array, type, stride, offset ).setInstanced( true );
const instancedDynamicBufferAttribute = ( array, type, stride, offset ) => dynamicBufferAttribute( array, type, stride, offset ).setInstanced( true );

addNodeElement( 'toAttribute', ( bufferNode ) => bufferAttribute( bufferNode.value ) );

addNodeClass( 'BufferAttributeNode', BufferAttributeNode );

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		this.instanceMatrixNode = null;

	}

	setup( /*builder*/ ) {

		let instanceMatrixNode = this.instanceMatrixNode;

		if ( instanceMatrixNode === null ) {

			const instanceMesh = this.instanceMesh;
			const instanceAttribute = instanceMesh.instanceMatrix;
			const buffer = new InstancedInterleavedBuffer( instanceAttribute.array, 16, 1 );

			const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			const instanceBuffers = [
				// F.Signature -> bufferAttribute( array, type, stride, offset )
				bufferFn( buffer, 'vec4', 16, 0 ),
				bufferFn( buffer, 'vec4', 16, 4 ),
				bufferFn( buffer, 'vec4', 16, 8 ),
				bufferFn( buffer, 'vec4', 16, 12 )
			];

			instanceMatrixNode = mat4( ...instanceBuffers );

			this.instanceMatrixNode = instanceMatrixNode;

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;

		// NORMAL

		const m = mat3( instanceMatrixNode[ 0 ].xyz, instanceMatrixNode[ 1 ].xyz, instanceMatrixNode[ 2 ].xyz );

		const transformedNormal = normalLocal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

		const instanceNormal = m.mul( transformedNormal ).xyz;

		// ASSIGNS

		positionLocal.assign( instancePosition );
		normalLocal.assign( instanceNormal );

	}

}

const instance = nodeProxy( InstanceNode );

addNodeClass( 'InstanceNode', InstanceNode );

class TangentNode extends Node {

	constructor( scope = TangentNode.LOCAL ) {

		super();

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `tangent-${this.scope}`;

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === TangentNode.GEOMETRY ) {

			return 'vec4';

		}

		return 'vec3';

	}


	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === TangentNode.GEOMETRY ) {

			outputNode = attribute( 'tangent', 'vec4' );

			if ( builder.geometry.hasAttribute( 'tangent' ) === false ) {

				builder.geometry.computeTangents();

			}

		} else if ( scope === TangentNode.LOCAL ) {

			outputNode = varying( tangentGeometry.xyz );

		} else if ( scope === TangentNode.VIEW ) {

			const vertexNode = modelViewMatrix.mul( vec4( tangentLocal, 0 ) ).xyz;
			outputNode = normalize( varying( vertexNode ) );

		} else if ( scope === TangentNode.WORLD ) {

			const vertexNode = tangentView.transformDirection( cameraViewMatrix );
			outputNode = normalize( varying( vertexNode ) );

		}

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

TangentNode.GEOMETRY = 'geometry';
TangentNode.LOCAL = 'local';
TangentNode.VIEW = 'view';
TangentNode.WORLD = 'world';

const tangentGeometry = nodeImmutable( TangentNode, TangentNode.GEOMETRY );
const tangentLocal = nodeImmutable( TangentNode, TangentNode.LOCAL );
const tangentView = nodeImmutable( TangentNode, TangentNode.VIEW );
const tangentWorld = nodeImmutable( TangentNode, TangentNode.WORLD );
const transformedTangentView = temp( tangentView, 'TransformedTangentView' );
normalize( transformedTangentView.transformDirection( cameraViewMatrix ) );

addNodeClass( 'TangentNode', TangentNode );

class SkinningNode extends Node {

	constructor( skinnedMesh, useReference = false ) {

		super( 'void' );

		this.skinnedMesh = skinnedMesh;
		this.useReference = useReference;

		this.updateType = NodeUpdateType.OBJECT;

		//

		this.skinIndexNode = attribute( 'skinIndex', 'uvec4' );
		this.skinWeightNode = attribute( 'skinWeight', 'vec4' );

		let bindMatrixNode, bindMatrixInverseNode, boneMatricesNode;

		if ( useReference ) {

			bindMatrixNode = reference( 'bindMatrix', 'mat4' );
			bindMatrixInverseNode = reference( 'bindMatrixInverse', 'mat4' );
			boneMatricesNode = referenceBuffer( 'skeleton.boneMatrices', 'mat4', skinnedMesh.skeleton.bones.length );

		} else {

			bindMatrixNode = uniform( skinnedMesh.bindMatrix, 'mat4' );
			bindMatrixInverseNode = uniform( skinnedMesh.bindMatrixInverse, 'mat4' );
			boneMatricesNode = buffer( skinnedMesh.skeleton.boneMatrices, 'mat4', skinnedMesh.skeleton.bones.length );

		}

		this.bindMatrixNode = bindMatrixNode;
		this.bindMatrixInverseNode = bindMatrixInverseNode;
		this.boneMatricesNode = boneMatricesNode;

	}

	setup( builder ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode, boneMatricesNode } = this;

		const boneMatX = boneMatricesNode.element( skinIndexNode.x );
		const boneMatY = boneMatricesNode.element( skinIndexNode.y );
		const boneMatZ = boneMatricesNode.element( skinIndexNode.z );
		const boneMatW = boneMatricesNode.element( skinIndexNode.w );

		// POSITION

		const skinVertex = bindMatrixNode.mul( positionLocal );

		const skinned = add(
			boneMatX.mul( skinWeightNode.x ).mul( skinVertex ),
			boneMatY.mul( skinWeightNode.y ).mul( skinVertex ),
			boneMatZ.mul( skinWeightNode.z ).mul( skinVertex ),
			boneMatW.mul( skinWeightNode.w ).mul( skinVertex )
		);

		const skinPosition = bindMatrixInverseNode.mul( skinned ).xyz;

		// NORMAL

		let skinMatrix = add(
			skinWeightNode.x.mul( boneMatX ),
			skinWeightNode.y.mul( boneMatY ),
			skinWeightNode.z.mul( boneMatZ ),
			skinWeightNode.w.mul( boneMatW )
		);

		skinMatrix = bindMatrixInverseNode.mul( skinMatrix ).mul( bindMatrixNode );

		const skinNormal = skinMatrix.transformDirection( normalLocal ).xyz;

		// ASSIGNS

		positionLocal.assign( skinPosition );
		normalLocal.assign( skinNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.assign( skinNormal );

		}

	}

	generate( builder, output ) {

		if ( output !== 'void' ) {

			return positionLocal.build( builder, output );

		}

	}

	update( frame ) {

		const object = this.useReference ? frame.object : this.skinnedMesh;

		object.skeleton.update();

	}

}
const skinningReference = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh, true ) );

addNodeClass( 'SkinningNode', SkinningNode );

class LoopNode extends Node {

	constructor( params = [] ) {

		super();

		this.params = params;

	}

	getVarName( index ) {

		return String.fromCharCode( 'i'.charCodeAt() + index );

	}

	getProperties( builder ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.stackNode !== undefined ) return properties;

		//

		const inputs = {};

		for ( let i = 0, l = this.params.length - 1; i < l; i ++ ) {

			const param = this.params[ i ];

			const name = ( param.isNode !== true && param.name ) || this.getVarName( i );
			const type = ( param.isNode !== true && param.type ) || 'int';

			inputs[ name ] = expression( name, type );

		}

		properties.returnsNode = this.params[ this.params.length - 1 ]( inputs, builder.addStack(), builder );
		properties.stackNode = builder.removeStack();

		return properties;

	}

	getNodeType( builder ) {

		const { returnsNode } = this.getProperties( builder );

		return returnsNode ? returnsNode.getNodeType( builder ) : 'void';

	}

	setup( builder ) {

		// setup properties

		this.getProperties( builder );

	}

	generate( builder ) {

		const properties = this.getProperties( builder );

		const contextData = { tempWrite: false };

		const params = this.params;
		const stackNode = properties.stackNode;

		for ( let i = 0, l = params.length - 1; i < l; i ++ ) {

			const param = params[ i ];

			let start = null, end = null, name = null, type = null, condition = null, update = null;

			if ( param.isNode ) {

				type = 'int';
				name = this.getVarName( i );
				start = '0';
				end = param.build( builder, type );
				condition = '<';

			} else {

				type = param.type || 'int';
				name = param.name || this.getVarName( i );
				start = param.start;
				end = param.end;
				condition = param.condition;
				update = param.update;

				if ( typeof start === 'number' ) start = start.toString();
				else if ( start && start.isNode ) start = start.build( builder, type );

				if ( typeof end === 'number' ) end = end.toString();
				else if ( end && end.isNode ) end = end.build( builder, type );

				if ( start !== undefined && end === undefined ) {

					start = start + ' - 1';
					end = '0';
					condition = '>=';

				} else if ( end !== undefined && start === undefined ) {

					start = '0';
					condition = '<';

				}

				if ( condition === undefined ) {

					if ( Number( start ) > Number( end ) ) {

						condition = '>=';

					} else {

						condition = '<';

					}

				}

			}

			const internalParam = { start, end, condition };

			//

			const startSnippet = internalParam.start;
			const endSnippet = internalParam.end;

			let declarationSnippet = '';
			let conditionalSnippet = '';
			let updateSnippet = '';

			if ( ! update ) {

				if ( type === 'int' || type === 'uint' ) {

					if ( condition.includes( '<' ) ) update = '++';
					else update = '--';

				} else {

					if ( condition.includes( '<' ) ) update = '+= 1.';
					else update = '-= 1.';

				}

			}

			declarationSnippet += builder.getVar( type, name ) + ' = ' + startSnippet;

			conditionalSnippet += name + ' ' + condition + ' ' + endSnippet;
			updateSnippet += name + ' ' + update;

			const forSnippet = `for ( ${ declarationSnippet }; ${ conditionalSnippet }; ${ updateSnippet } )`;

			builder.addFlowCode( ( i === 0 ? '\n' : '' ) + builder.tab + forSnippet + ' {\n\n' ).addFlowTab();

		}

		const stackSnippet = context( stackNode, contextData ).build( builder, 'void' );

		const returnsSnippet = properties.returnsNode ? properties.returnsNode.build( builder ) : '';

		builder.removeFlowTab().addFlowCode( '\n' + builder.tab + stackSnippet );

		for ( let i = 0, l = this.params.length - 1; i < l; i ++ ) {

			builder.addFlowCode( ( i === 0 ? '' : builder.tab ) + '}\n\n' ).removeFlowTab();

		}

		builder.addFlowTab();

		return returnsSnippet;

	}

}

const loop = ( ...params ) => nodeObject( new LoopNode( nodeArray( params, 'int' ) ) ).append();

addNodeElement( 'loop', ( returns, ...params ) => bypass( returns, loop( ...params ) ) );

addNodeClass( 'LoopNode', LoopNode );

const morphTextures = new WeakMap();
const morphVec4 = new Vector4();

const getMorph = tslFn( ( { bufferMap, influence, stride, width, depth, offset } ) => {

	const texelIndex = int( vertexIndex ).mul( stride ).add( offset );

	const y = texelIndex.div( width );
	const x = texelIndex.sub( y.mul( width ) );

	const bufferAttrib = textureLoad( bufferMap, ivec2( x, y ) ).depth( depth );

	return bufferAttrib.mul( influence );

} );

function getEntry( geometry ) {

	const hasMorphPosition = geometry.morphAttributes.position !== undefined;
	const hasMorphNormals = geometry.morphAttributes.normal !== undefined;
	const hasMorphColors = geometry.morphAttributes.color !== undefined;

	// instead of using attributes, the WebGL 2 code path encodes morph targets
	// into an array of data textures. Each layer represents a single morph target.

	const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
	const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

	let entry = morphTextures.get( geometry );

	if ( entry === undefined || entry.count !== morphTargetsCount ) {

		if ( entry !== undefined ) entry.texture.dispose();

		const morphTargets = geometry.morphAttributes.position || [];
		const morphNormals = geometry.morphAttributes.normal || [];
		const morphColors = geometry.morphAttributes.color || [];

		let vertexDataCount = 0;

		if ( hasMorphPosition === true ) vertexDataCount = 1;
		if ( hasMorphNormals === true ) vertexDataCount = 2;
		if ( hasMorphColors === true ) vertexDataCount = 3;

		let width = geometry.attributes.position.count * vertexDataCount;
		let height = 1;

		const maxTextureSize = 4096; // @TODO: Use 'capabilities.maxTextureSize'

		if ( width > maxTextureSize ) {

			height = Math.ceil( width / maxTextureSize );
			width = maxTextureSize;

		}

		const buffer = new Float32Array( width * height * 4 * morphTargetsCount );

		const bufferTexture = new DataArrayTexture( buffer, width, height, morphTargetsCount );
		bufferTexture.type = FloatType;
		bufferTexture.needsUpdate = true;

		// fill buffer

		const vertexDataStride = vertexDataCount * 4;

		for ( let i = 0; i < morphTargetsCount; i ++ ) {

			const morphTarget = morphTargets[ i ];
			const morphNormal = morphNormals[ i ];
			const morphColor = morphColors[ i ];

			const offset = width * height * 4 * i;

			for ( let j = 0; j < morphTarget.count; j ++ ) {

				const stride = j * vertexDataStride;

				if ( hasMorphPosition === true ) {

					morphVec4.fromBufferAttribute( morphTarget, j );

					buffer[ offset + stride + 0 ] = morphVec4.x;
					buffer[ offset + stride + 1 ] = morphVec4.y;
					buffer[ offset + stride + 2 ] = morphVec4.z;
					buffer[ offset + stride + 3 ] = 0;

				}

				if ( hasMorphNormals === true ) {

					morphVec4.fromBufferAttribute( morphNormal, j );

					buffer[ offset + stride + 4 ] = morphVec4.x;
					buffer[ offset + stride + 5 ] = morphVec4.y;
					buffer[ offset + stride + 6 ] = morphVec4.z;
					buffer[ offset + stride + 7 ] = 0;

				}

				if ( hasMorphColors === true ) {

					morphVec4.fromBufferAttribute( morphColor, j );

					buffer[ offset + stride + 8 ] = morphVec4.x;
					buffer[ offset + stride + 9 ] = morphVec4.y;
					buffer[ offset + stride + 10 ] = morphVec4.z;
					buffer[ offset + stride + 11 ] = ( morphColor.itemSize === 4 ) ? morphVec4.w : 1;

				}

			}

		}

		entry = {
			count: morphTargetsCount,
			texture: bufferTexture,
			stride: vertexDataCount,
			size: new Vector2( width, height )
		};

		morphTextures.set( geometry, entry );

		function disposeTexture() {

			bufferTexture.dispose();

			morphTextures.delete( geometry );

			geometry.removeEventListener( 'dispose', disposeTexture );

		}

		geometry.addEventListener( 'dispose', disposeTexture );

	}

	return entry;

}


class MorphNode extends Node {

	constructor( mesh ) {

		super( 'void' );

		this.mesh = mesh;
		this.morphBaseInfluence = uniform( 1 );

		this.updateType = NodeUpdateType.OBJECT;

	}

	setup( builder ) {

		const { geometry } = builder;

		const hasMorphPosition = geometry.morphAttributes.position !== undefined;
		const hasMorphNormals = geometry.morphAttributes.normal !== undefined;

		const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
		const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

		// nodes

		const { texture: bufferMap, stride, size } = getEntry( geometry );

		if ( hasMorphPosition === true ) positionLocal.mulAssign( this.morphBaseInfluence );
		if ( hasMorphNormals === true ) normalLocal.mulAssign( this.morphBaseInfluence );

		const width = int( size.width );

		loop( morphTargetsCount, ( { i } ) => {

			const influence = reference( 'morphTargetInfluences', 'float' ).element( i );

			if ( hasMorphPosition === true ) {

				positionLocal.addAssign( getMorph( {
					bufferMap,
					influence,
					stride,
					width,
					depth: i,
					offset: int( 0 )
				} ) );

			}

			if ( hasMorphNormals === true ) {

				normalLocal.addAssign( getMorph( {
					bufferMap,
					influence,
					stride,
					width,
					depth: i,
					offset: int( 1 )
				} ) );

			}

		} );

	}

	update() {

		const morphBaseInfluence = this.morphBaseInfluence;

		if ( this.mesh.geometry.morphTargetsRelative ) {

			morphBaseInfluence.value = 1;

		} else {

			morphBaseInfluence.value = 1 - this.mesh.morphTargetInfluences.reduce( ( a, b ) => a + b, 0 );

		}

	}

}

const morphReference = nodeProxy( MorphNode );

addNodeClass( 'MorphNode', MorphNode );

class ReflectVectorNode extends Node {

	constructor() {

		super( 'vec3' );

	}

	getHash( /*builder*/ ) {

		return 'reflectVector';

	}

	setup() {

		const reflectView = positionViewDirection.negate().reflect( transformedNormalView );

		return reflectView.transformDirection( cameraViewMatrix );

	}

}

const reflectVector = nodeImmutable( ReflectVectorNode );

addNodeClass( 'ReflectVectorNode', ReflectVectorNode );

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isCubeTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	getDefaultUV() {

		return reflectVector;

	}

	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for CubeTextureNode

	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem || ! texture.isRenderTargetTexture ) {

			return vec3( uvNode.x.negate(), uvNode.yz );

		} else {

			return uvNode;

		}

	}

	generateUV( builder, cubeUV ) {

		return cubeUV.build( builder, 'vec3' );

	}

}

const cubeTexture = nodeProxy( CubeTextureNode );

addNodeElement( 'cubeTexture', cubeTexture );

addNodeClass( 'CubeTextureNode', CubeTextureNode );

class LightingNode extends Node {

	constructor() {

		super( 'vec3' );

	}

	generate( /*builder*/ ) {

		console.warn( 'Abstract function.' );

	}

}

addNodeClass( 'LightingNode', LightingNode );

let overrideMaterial = null;

class AnalyticLightNode extends LightingNode {

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.rtt = null;
		this.shadowNode = null;

		this.color = new Color();
		this._defaultColorNode = uniform( this.color );

		this.colorNode = this._defaultColorNode;

		this.isAnalyticLightNode = true;

	}

	getCacheKey() {

		return super.getCacheKey() + '-' + ( this.light.id + '-' + ( this.light.castShadow ? '1' : '0' ) );

	}

	getHash() {

		return this.light.uuid;

	}

	setupShadow( builder ) {

		let shadowNode = this.shadowNode;

		if ( shadowNode === null ) {

			if ( overrideMaterial === null ) {

				overrideMaterial = builder.createNodeMaterial();
				overrideMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
				overrideMaterial.isShadowNodeMaterial = true; // Use to avoid other overrideMaterial override material.fragmentNode unintentionally when using material.shadowNode

			}

			const shadow = this.light.shadow;
			const rtt = builder.getRenderTarget( shadow.mapSize.width, shadow.mapSize.height );

			const depthTexture = new DepthTexture();
			depthTexture.minFilter = NearestFilter;
			depthTexture.magFilter = NearestFilter;
			depthTexture.image.width = shadow.mapSize.width;
			depthTexture.image.height = shadow.mapSize.height;
			depthTexture.compareFunction = LessCompare;

			rtt.depthTexture = depthTexture;

			shadow.camera.updateProjectionMatrix();

			//

			const bias = reference( 'bias', 'float', shadow );
			const normalBias = reference( 'normalBias', 'float', shadow );

			let shadowCoord = uniform( shadow.matrix ).mul( positionWorld.add( normalWorld.mul( normalBias ) ) );
			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
				.and( shadowCoord.x.lessThanEqual( 1 ) )
				.and( shadowCoord.y.greaterThanEqual( 0 ) )
				.and( shadowCoord.y.lessThanEqual( 1 ) )
				.and( shadowCoord.z.lessThanEqual( 1 ) );

			let coordZ = shadowCoord.z.add( bias );

			if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Convertion [ 0, 1 ] to [ - 1, 1 ]

			}

			shadowCoord = vec3(
				shadowCoord.x,
				shadowCoord.y.oneMinus(), // follow webgpu standards
				coordZ
			);

			const textureCompare = ( depthTexture, shadowCoord, compare ) => texture( depthTexture, shadowCoord ).compare( compare );
			//const textureCompare = ( depthTexture, shadowCoord, compare ) => compare.step( texture( depthTexture, shadowCoord ) );

			// BasicShadowMap

			shadowNode = textureCompare( depthTexture, shadowCoord.xy, shadowCoord.z );

			// PCFShadowMap
			/*
			const mapSize = reference( 'mapSize', 'vec2', shadow );
			const radius = reference( 'radius', 'float', shadow );

			const texelSize = vec2( 1 ).div( mapSize );
			const dx0 = texelSize.x.negate().mul( radius );
			const dy0 = texelSize.y.negate().mul( radius );
			const dx1 = texelSize.x.mul( radius );
			const dy1 = texelSize.y.mul( radius );
			const dx2 = dx0.mul( 2 );
			const dy2 = dy0.mul( 2 );
			const dx3 = dx1.mul( 2 );
			const dy3 = dy1.mul( 2 );

			shadowNode = add(
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, dy0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, dy0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, dy2 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy2 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, dy2 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, 0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, 0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy, shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, 0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, 0 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx2, dy3 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy3 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx3, dy3 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx0, dy1 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( 0, dy1 ) ), shadowCoord.z ),
				textureCompare( depthTexture, shadowCoord.xy.add( vec2( dx1, dy1 ) ), shadowCoord.z )
			).mul( 1 / 17 );
			*/
			//

			const shadowColor = texture( rtt.texture, shadowCoord );

			this.rtt = rtt;
			this.colorNode = this.colorNode.mul( frustumTest.mix( 1, shadowNode.mix( shadowColor.a.mix( 1, shadowColor ), 1 ) ) );

			this.shadowNode = shadowNode;

			//

			this.updateBeforeType = NodeUpdateType.RENDER;

		}

	}

	setup( builder ) {

		if ( this.light.castShadow ) this.setupShadow( builder );
		else if ( this.shadowNode !== null ) this.disposeShadow();

	}

	updateShadow( frame ) {

		const { rtt, light } = this;
		const { renderer, scene } = frame;

		const currentOverrideMaterial = scene.overrideMaterial;

		scene.overrideMaterial = overrideMaterial;

		rtt.setSize( light.shadow.mapSize.width, light.shadow.mapSize.height );

		light.shadow.updateMatrices( light );

		const currentRenderTarget = renderer.getRenderTarget();
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( object.castShadow === true ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.setRenderTarget( rtt );

		renderer.render( scene, light.shadow.camera );

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		scene.overrideMaterial = currentOverrideMaterial;

	}

	disposeShadow() {

		this.rtt.dispose();

		this.shadowNode = null;
		this.rtt = null;

		this.colorNode = this._defaultColorNode;

	}

	updateBefore( frame ) {

		const { light } = this;

		if ( light.castShadow ) this.updateShadow( frame );

	}

	update( /*frame*/ ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

addNodeClass( 'AnalyticLightNode', AnalyticLightNode );

const LightNodes = new WeakMap();

const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

class LightsNode extends Node {

	constructor( lightNodes = [] ) {

		super( 'vec3' );

		this.totalDiffuseNode = vec3().temp( 'totalDiffuse' );
		this.totalSpecularNode = vec3().temp( 'totalSpecular' );

		this.outgoingLightNode = vec3().temp( 'outgoingLight' );

		this.lightNodes = lightNodes;

		this._hash = null;

	}

	get hasLight() {

		return this.lightNodes.length > 0;

	}

	getHash() {

		if ( this._hash === null ) {

			const hash = [];

			for ( const lightNode of this.lightNodes ) {

				hash.push( lightNode.getHash() );

			}

			this._hash = 'lights-' + hash.join( ',' );

		}

		return this._hash;

	}

	setup( builder ) {

		const context = builder.context;
		const lightingModel = context.lightingModel;

		let outgoingLightNode = this.outgoingLightNode;

		if ( lightingModel ) {

			const { lightNodes, totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			const stack = builder.addStack();

			//

			lightingModel.start( context, stack, builder );

			// lights

			for ( const lightNode of lightNodes ) {

				lightNode.build( builder );

			}

			//

			lightingModel.indirectDiffuse( context, stack, builder );
			lightingModel.indirectSpecular( context, stack, builder );
			lightingModel.ambientOcclusion( context, stack, builder );

			//

			const { backdrop, backdropAlpha } = context;
			const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = context.reflectedLight;

			let totalDiffuse = directDiffuse.add( indirectDiffuse );

			if ( backdrop !== null ) {

				totalDiffuse = vec3( backdropAlpha !== null ? backdropAlpha.mix( totalDiffuse, backdrop ) : backdrop );

			}

			totalDiffuseNode.assign( totalDiffuse );
			totalSpecularNode.assign( directSpecular.add( indirectSpecular ) );

			outgoingLightNode.assign( totalDiffuseNode.add( totalSpecularNode ) );

			//

			lightingModel.finish( context, stack, builder );

			//

			outgoingLightNode = outgoingLightNode.bypass( builder.removeStack() );

		}

		return outgoingLightNode;

	}

	_getLightNodeById( id ) {

		for ( const lightNode of this.lightNodes ) {

			if ( lightNode.isAnalyticLightNode && lightNode.light.id === id ) {

				return lightNode;

			}

		}

		return null;

	}

	fromLights( lights = [] ) {

		const lightNodes = [];

		lights = sortLights( lights );

		for ( const light of lights ) {

			let lightNode = this._getLightNodeById( light.id );

			if ( lightNode === null ) {

				const lightClass = light.constructor;
				const lightNodeClass = LightNodes.has( lightClass ) ? LightNodes.get( lightClass ) : AnalyticLightNode;

				lightNode = nodeObject( new lightNodeClass( light ) );

			}

			lightNodes.push( lightNode );

		}

		this.lightNodes = lightNodes;
		this._hash = null;

		return this;

	}

}
const lightsNode = nodeProxy( LightsNode );

function addLightNode( lightClass, lightNodeClass ) {

	if ( LightNodes.has( lightClass ) ) {

		console.warn( `Redefinition of light node ${ lightNodeClass.type }` );
		return;

	}

	if ( typeof lightClass !== 'function' ) throw new Error( `Light ${ lightClass.name } is not a class` );
	if ( typeof lightNodeClass !== 'function' || ! lightNodeClass.type ) throw new Error( `Light node ${ lightNodeClass.type } is not a class` );

	LightNodes.set( lightClass, lightNodeClass );

}

class AONode extends LightingNode {

	constructor( aoNode = null ) {

		super();

		this.aoNode = aoNode;

	}

	setup( builder ) {

		const aoIntensity = 1;
		const aoNode = this.aoNode.x.sub( 1.0 ).mul( aoIntensity ).add( 1.0 );

		builder.context.ambientOcclusion.mulAssign( aoNode );

	}

}

addNodeClass( 'AONode', AONode );

class LightingContextNode extends ContextNode {

	constructor( node, lightingModel = null, backdropNode = null, backdropAlphaNode = null ) {

		super( node );

		this.lightingModel = lightingModel;
		this.backdropNode = backdropNode;
		this.backdropAlphaNode = backdropAlphaNode;

		this._context = null;

	}

	getContext() {

		const { backdropNode, backdropAlphaNode } = this;

		const directDiffuse = vec3().temp( 'directDiffuse' ),
			directSpecular = vec3().temp( 'directSpecular' ),
			indirectDiffuse = vec3().temp( 'indirectDiffuse' ),
			indirectSpecular = vec3().temp( 'indirectSpecular' );

		const reflectedLight = {
			directDiffuse,
			directSpecular,
			indirectDiffuse,
			indirectSpecular
		};

		const context = {
			radiance: vec3().temp( 'radiance' ),
			irradiance: vec3().temp( 'irradiance' ),
			iblIrradiance: vec3().temp( 'iblIrradiance' ),
			ambientOcclusion: float( 1 ).temp( 'ambientOcclusion' ),
			reflectedLight,
			backdrop: backdropNode,
			backdropAlpha: backdropAlphaNode
		};

		return context;

	}

	setup( builder ) {

		this.context = this._context || ( this._context = this.getContext() );
		this.context.lightingModel = this.lightingModel || builder.context.lightingModel;

		return super.setup( builder );

	}

}

const lightingContext = nodeProxy( LightingContextNode );

addNodeElement( 'lightingContext', lightingContext );

addNodeClass( 'LightingContextNode', LightingContextNode );

class EquirectUVNode extends TempNode {

	constructor( dirNode = positionWorldDirection ) {

		super( 'vec2' );

		this.dirNode = dirNode;

	}

	setup() {

		const dir = this.dirNode;

		const u = dir.z.atan2( dir.x ).mul( 1 / ( Math.PI * 2 ) ).add( 0.5 );
		const v = dir.y.negate().clamp( - 1.0, 1.0 ).asin().mul( 1 / Math.PI ).add( 0.5 ); // @TODO: The use of negate() here could be an NDC issue.

		return vec2( u, v );

	}

}

const equirectUV = nodeProxy( EquirectUVNode );

addNodeClass( 'EquirectUVNode', EquirectUVNode );

class SpecularMIPLevelNode extends Node {

	constructor( textureNode, roughnessNode = null ) {

		super( 'float' );

		this.textureNode = textureNode;
		this.roughnessNode = roughnessNode;

	}

	setup() {

		const { textureNode, roughnessNode } = this;

		// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html

		const maxMIPLevelScalar = maxMipLevel( textureNode );

		const sigma = roughnessNode.mul( roughnessNode ).mul( Math.PI ).div( roughnessNode.add( 1.0 ) );
		const desiredMIPLevel = maxMIPLevelScalar.add( sigma.log2() );

		return desiredMIPLevel.clamp( 0.0, maxMIPLevelScalar );

	}

}

const specularMIPLevel = nodeProxy( SpecularMIPLevelNode );

addNodeClass( 'SpecularMIPLevelNode', SpecularMIPLevelNode );

const envNodeCache = new WeakMap();

class EnvironmentNode extends LightingNode {

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	setup( builder ) {

		let envNode = this.envNode;

		if ( envNode.isTextureNode && envNode.value.isCubeTexture !== true ) {

			let cacheEnvNode = envNodeCache.get( envNode.value );

			if ( cacheEnvNode === undefined ) {

				const texture = envNode.value;
				const renderer = builder.renderer;

				// @TODO: Add dispose logic here
				const cubeRTT = builder.getCubeRenderTarget( 512 ).fromEquirectangularTexture( renderer, texture );

				cacheEnvNode = cubeTexture( cubeRTT.texture );

				envNodeCache.set( envNode.value, cacheEnvNode );

			}

			envNode	= cacheEnvNode;

		}

		//

		const intensity = reference( 'envMapIntensity', 'float', builder.material ); // @TODO: Add materialEnvIntensity in MaterialNode

		const radiance = context( envNode, createRadianceContext( roughness, transformedNormalView ) ).mul( intensity );
		const irradiance = context( envNode, createIrradianceContext( transformedNormalWorld ) ).mul( Math.PI ).mul( intensity );

		const isolateRadiance = cache( radiance );

		//

		builder.context.radiance.addAssign( isolateRadiance );

		builder.context.iblIrradiance.addAssign( irradiance );

		//

		const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			const clearcoatRadianceContext = context( envNode, createRadianceContext( clearcoatRoughness, transformedClearcoatNormalView ) ).mul( intensity );
			const isolateClearcoatRadiance = cache( clearcoatRadianceContext );

			clearcoatRadiance.addAssign( isolateClearcoatRadiance );

		}

	}

}

const createRadianceContext = ( roughnessNode, normalViewNode ) => {

	let reflectVec = null;
	let textureUVNode = null;

	return {
		getUV: ( textureNode ) => {

			let node = null;

			if ( reflectVec === null ) {

				reflectVec = positionViewDirection.negate().reflect( normalViewNode );
				reflectVec = roughnessNode.mul( roughnessNode ).mix( reflectVec, normalViewNode ).normalize();
				reflectVec = reflectVec.transformDirection( cameraViewMatrix );

			}

			if ( textureNode.isCubeTextureNode ) {

				node = reflectVec;

			} else if ( textureNode.isTextureNode ) {

				if ( textureUVNode === null ) {

					// @TODO: Needed PMREM

					textureUVNode = equirectUV( reflectVec );

				}

				node = textureUVNode;

			}

			return node;

		},
		getTextureLevel: () => {

			return roughnessNode;

		},
		getTextureLevelAlgorithm: ( textureNode, levelNode ) => {

			return specularMIPLevel( textureNode, levelNode );

		}
	};

};

const createIrradianceContext = ( normalWorldNode ) => {

	let textureUVNode = null;

	return {
		getUV: ( textureNode ) => {

			let node = null;

			if ( textureNode.isCubeTextureNode ) {

				node = normalWorldNode;

			} else if ( textureNode.isTextureNode ) {

				if ( textureUVNode === null ) {

					// @TODO: Needed PMREM

					textureUVNode = equirectUV( normalWorldNode );
					textureUVNode = vec2( textureUVNode.x, textureUVNode.y.oneMinus() );

				}

				node = textureUVNode;

			}

			return node;

		},
		getTextureLevel: ( textureNode ) => {

			return maxMipLevel( textureNode );

		}
	};

};

addNodeClass( 'EnvironmentNode', EnvironmentNode );

let resolution, viewportResult;

class ViewportNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		return this.scope === ViewportNode.VIEWPORT ? 'vec4' : 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ViewportNode.RESOLUTION || this.scope === ViewportNode.VIEWPORT ) {

			updateType = NodeUpdateType.FRAME;

		}

		this.updateType = updateType;

		return updateType;

	}

	update( { renderer } ) {

		if ( this.scope === ViewportNode.VIEWPORT ) {

			renderer.getViewport( viewportResult );

		} else {

			renderer.getDrawingBufferSize( resolution );

		}

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let output = null;

		if ( scope === ViewportNode.RESOLUTION ) {

			output = uniform( resolution || ( resolution = new Vector2() ) );

		} else if ( scope === ViewportNode.VIEWPORT ) {

			output = uniform( viewportResult || ( viewportResult = new Vector4() ) );

		} else {

			output = viewportCoordinate.div( viewportResolution );

			let outX = output.x;
			let outY = output.y;

			if ( /bottom/i.test( scope ) ) outY = outY.oneMinus();
			if ( /right/i.test( scope ) ) outX = outX.oneMinus();

			output = vec2( outX, outY );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ViewportNode.COORDINATE ) {

			let coord = builder.getFragCoord();

			if ( builder.isFlipY() ) {

				// follow webgpu standards

				const resolution = builder.getNodeProperties( viewportResolution ).outputNode.build( builder );

				coord = `${ builder.getType( 'vec2' ) }( ${ coord }.x, ${ resolution }.y - ${ coord }.y )`;

			}

			return coord;

		}

		return super.generate( builder );

	}

}

ViewportNode.COORDINATE = 'coordinate';
ViewportNode.RESOLUTION = 'resolution';
ViewportNode.VIEWPORT = 'viewport';
ViewportNode.TOP_LEFT = 'topLeft';
ViewportNode.BOTTOM_LEFT = 'bottomLeft';
ViewportNode.TOP_RIGHT = 'topRight';
ViewportNode.BOTTOM_RIGHT = 'bottomRight';

const viewportCoordinate = nodeImmutable( ViewportNode, ViewportNode.COORDINATE );
const viewportResolution = nodeImmutable( ViewportNode, ViewportNode.RESOLUTION );
const viewport = nodeImmutable( ViewportNode, ViewportNode.VIEWPORT );
const viewportTopLeft = nodeImmutable( ViewportNode, ViewportNode.TOP_LEFT );
const viewportBottomLeft = nodeImmutable( ViewportNode, ViewportNode.BOTTOM_LEFT );
nodeImmutable( ViewportNode, ViewportNode.TOP_RIGHT );
nodeImmutable( ViewportNode, ViewportNode.BOTTOM_RIGHT );

addNodeClass( 'ViewportNode', ViewportNode );

const _size$1 = new Vector2();

class ViewportTextureNode extends TextureNode {

	constructor( uvNode = viewportTopLeft, levelNode = null, framebufferTexture = null ) {

		if ( framebufferTexture === null ) {

			framebufferTexture = new FramebufferTexture();
			framebufferTexture.minFilter = LinearMipmapLinearFilter;

		}

		super( framebufferTexture, uvNode, levelNode );

		this.generateMipmaps = false;

		this.isOutputTextureNode = true;

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	updateBefore( frame ) {

		const renderer = frame.renderer;
		renderer.getDrawingBufferSize( _size$1 );

		//

		const framebufferTexture = this.value;

		if ( framebufferTexture.image.width !== _size$1.width || framebufferTexture.image.height !== _size$1.height ) {

			framebufferTexture.image.width = _size$1.width;
			framebufferTexture.image.height = _size$1.height;
			framebufferTexture.needsUpdate = true;

		}

		//

		const currentGenerateMipmaps = framebufferTexture.generateMipmaps;
		framebufferTexture.generateMipmaps = this.generateMipmaps;

		renderer.copyFramebufferToTexture( framebufferTexture );

		framebufferTexture.generateMipmaps = currentGenerateMipmaps;

	}

	clone() {

		return new this.constructor( this.uvNode, this.levelNode, this.value );

	}

}

const viewportTexture = nodeProxy( ViewportTextureNode );
const viewportMipTexture = nodeProxy( ViewportTextureNode, null, null, { generateMipmaps: true } );

addNodeElement( 'viewportTexture', viewportTexture );
addNodeElement( 'viewportMipTexture', viewportMipTexture );

addNodeClass( 'ViewportTextureNode', ViewportTextureNode );

let sharedDepthbuffer = null;

class ViewportDepthTextureNode extends ViewportTextureNode {

	constructor( uvNode = viewportTopLeft, levelNode = null ) {

		if ( sharedDepthbuffer === null ) {

			sharedDepthbuffer = new DepthTexture();

		}

		super( uvNode, levelNode, sharedDepthbuffer );

	}

}

const viewportDepthTexture = nodeProxy( ViewportDepthTextureNode );

addNodeElement( 'viewportDepthTexture', viewportDepthTexture );

addNodeClass( 'ViewportDepthTextureNode', ViewportDepthTextureNode );

class ViewportDepthNode extends Node {

	constructor( scope, valueNode = null ) {

		super( 'float' );

		this.scope = scope;
		this.valueNode = valueNode;

		this.isViewportDepthNode = true;

	}

	generate( builder ) {

		const { scope } = this;

		if ( scope === ViewportDepthNode.DEPTH_PIXEL ) {

			return builder.getFragDepth();

		}

		return super.generate( builder );

	}

	setup( /*builder*/ ) {

		const { scope } = this;

		let node = null;

		if ( scope === ViewportDepthNode.DEPTH ) {

			node = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

		} else if ( scope === ViewportDepthNode.DEPTH_TEXTURE ) {

			const texture = this.valueNode || viewportDepthTexture();

			const viewZ = perspectiveDepthToViewZ( texture, cameraNear, cameraFar );
			node = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

		} else if ( scope === ViewportDepthNode.DEPTH_PIXEL ) {

			if ( this.valueNode !== null ) {

 				node = depthPixelBase().assign( this.valueNode );

			}

		}

		return node;

	}

}

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

// -near maps to 0; -far maps to 1
const viewZToOrthographicDepth = ( viewZ, near, far ) => viewZ.add( near ).div( near.sub( far ) );

// maps perspective depth in [ 0, 1 ] to viewZ
const perspectiveDepthToViewZ = ( depth, near, far ) => near.mul( far ).div( far.sub( near ).mul( depth ).sub( far ) );

ViewportDepthNode.DEPTH = 'depth';
ViewportDepthNode.DEPTH_TEXTURE = 'depthTexture';
ViewportDepthNode.DEPTH_PIXEL = 'depthPixel';

const depthPixelBase = nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_PIXEL );

nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH );
nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_TEXTURE );
const depthPixel = nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH_PIXEL );

depthPixel.assign = ( value ) => depthPixelBase( value );

addNodeClass( 'ViewportDepthNode', ViewportDepthNode );

class ClippingNode extends Node {

	constructor( scope = ClippingNode.DEFAULT ) {

		super();

		this.scope = scope;

	}

	setup( builder ) {

		super.setup( builder );

		const clippingContext = builder.clippingContext;
		const { localClipIntersection, localClippingCount, globalClippingCount } = clippingContext;

		const numClippingPlanes = globalClippingCount + localClippingCount;
		const numUnionClippingPlanes = localClipIntersection ? numClippingPlanes - localClippingCount : numClippingPlanes;

		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( clippingContext.planes, numClippingPlanes, numUnionClippingPlanes );

		} else {

			return this.setupDefault( clippingContext.planes, numClippingPlanes, numUnionClippingPlanes );

		}

	}

	setupAlphaToCoverage( planes, numClippingPlanes, numUnionClippingPlanes ) {

		return tslFn( () => {

			const clippingPlanes = uniforms( planes );

			const distanceToPlane = property( 'float', 'distanceToPlane' );
			const distanceGradient = property( 'float', 'distanceToGradient' );

			const clipOpacity = property( 'float', 'clipOpacity' );

			clipOpacity.assign( 1 );

			let plane;

			loop( numUnionClippingPlanes, ( { i } ) => {

				plane = clippingPlanes.element( i );

				distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
				distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

				clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				clipOpacity.equal( 0.0 ).discard();

			} );

			if ( numUnionClippingPlanes < numClippingPlanes ) {

				const unionClipOpacity = property( 'float', 'unionclipOpacity' );

				unionClipOpacity.assign( 1 );

				loop( { start: numUnionClippingPlanes, end: numClippingPlanes }, ( { i } ) => {

					plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot(  plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					unionClipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ).oneMinus() );

				} );

				clipOpacity.mulAssign( unionClipOpacity.oneMinus() );

			}

			diffuseColor.a.mulAssign( clipOpacity );

			diffuseColor.a.equal( 0.0 ).discard();

		} )();

	}

	setupDefault( planes, numClippingPlanes, numUnionClippingPlanes ) {

		return tslFn( () => {

			const clippingPlanes = uniforms( planes );

			let plane;

			loop( numUnionClippingPlanes, ( { i } ) => {

				plane = clippingPlanes.element( i );
				positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

			} );

			if ( numUnionClippingPlanes < numClippingPlanes ) {

				const clipped = property( 'bool', 'clipped' );

				clipped.assign( true );

				loop( { start: numUnionClippingPlanes, end: numClippingPlanes }, ( { i } ) => {

					plane = clippingPlanes.element( i );
					clipped.assign( positionView.dot( plane.xyz ).greaterThan( plane.w ).and( clipped ) );

				} );

				clipped.discard();
			}

		} )();

	}

}

ClippingNode.ALPHA_TO_COVERAGE = 'alphaToCoverage';
ClippingNode.DEFAULT = 'default';

const clipping = () => nodeObject( new ClippingNode() );

const clippingAlpha = () => nodeObject( new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE ) );

class FrontFacingNode extends Node {

	constructor() {

		super( 'bool' );

		this.isFrontFacingNode = true;

	}

	generate( builder ) {

		return builder.getFrontFacing();

	}

}

const frontFacing = nodeImmutable( FrontFacingNode );
const faceDirection = float( frontFacing ).mul( 2.0 ).sub( 1.0 );

addNodeClass( 'FrontFacingNode', FrontFacingNode );

const NodeMaterials = new Map();

class NodeMaterial extends ShaderMaterial {

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.type = this.constructor.type;

		this.forceSinglePass = false;

		this.fog = true;
		this.lights = true;
		this.normals = true;

		this.colorSpaced = true;

		this.lightsNode = null;
		this.envNode = null;

		this.colorNode = null;
		this.normalNode = null;
		this.opacityNode = null;
		this.backdropNode = null;
		this.backdropAlphaNode = null;
		this.alphaTestNode = null;

		this.positionNode = null;

		this.depthNode = null;
		this.shadowNode = null;

		this.outputNode = null;

		this.fragmentNode = null;
		this.vertexNode = null;

	}

	customProgramCacheKey() {

		return this.type + getCacheKey( this );

	}

	build( builder ) {

		this.setup( builder );

	}

	setup( builder ) {

		// < VERTEX STAGE >

		builder.addStack();

		builder.stack.outputNode = this.vertexNode || this.setupPosition( builder );

		builder.addFlow( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		let resultNode;

		const clippingNode = this.setupClipping( builder );

		if ( this.fragmentNode === null ) {

			if ( this.depthWrite === true ) this.setupDepth( builder );

			if ( this.normals === true ) this.setupNormal( builder );

			this.setupDiffuseColor( builder );
			this.setupVariants( builder );

			const outgoingLightNode = this.setupLighting( builder );

			if ( clippingNode !== null ) builder.stack.add( clippingNode );

			resultNode = this.setupOutput( builder, vec4( outgoingLightNode, diffuseColor.a ) );

			// OUTPUT NODE

			output.assign( resultNode );

			//

			if ( this.outputNode !== null ) resultNode = this.outputNode;

		} else {

			resultNode = this.setupOutput( builder, this.fragmentNode );

		}

		builder.stack.outputNode = resultNode;

		builder.addFlow( 'fragment', builder.removeStack() );

	}

	setupClipping( builder ) {

		const { globalClippingCount, localClippingCount } = builder.clippingContext;

		let result = null;

		if ( globalClippingCount || localClippingCount ) {

			if ( this.alphaToCoverage ) {

				// to be added to flow when the color/alpha value has been determined
				result = clippingAlpha();

			} else {

				builder.stack.add( clipping() );

			}

		}

		return result;

	}

	setupDepth( builder ) {

		const { renderer } = builder;

		// Depth

		let depthNode = this.depthNode;

		if ( depthNode === null && renderer.logarithmicDepthBuffer === true ) {

			const fragDepth = modelViewProjection().w.add( 1 );

			depthNode = fragDepth.log2().mul( cameraLogDepth ).mul( 0.5 );

		}

		if ( depthNode !== null ) {

			depthPixel.assign( depthNode ).append();

		}

	}

	setupPosition( builder ) {

		const { object } = builder;
		const geometry = object.geometry;

		builder.addStack();

		// Vertex

		if ( geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color ) {

			morphReference( object ).append();

		}

		if ( object.isSkinnedMesh === true ) {

			skinningReference( object ).append();

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) && builder.isAvailable( 'instance' ) === true ) {

			instance( object ).append();

		}

		if ( this.positionNode !== null ) {

			positionLocal.assign( this.positionNode );

		}

		const mvp = modelViewProjection();

		builder.context.vertex = builder.removeStack();
		builder.context.mvp = mvp;

		return mvp;

	}

	setupDiffuseColor( { geometry } ) {

		let colorNode = this.colorNode ? vec4( this.colorNode ) : materialColor;

		// VERTEX COLORS

		if ( this.vertexColors === true && geometry.hasAttribute( 'color' ) ) {

			colorNode = vec4( colorNode.xyz.mul( attribute( 'color', 'vec3' ) ), colorNode.a );

		}

		// COLOR

		diffuseColor.assign( colorNode );

		// OPACITY

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;
		diffuseColor.a.assign( diffuseColor.a.mul( opacityNode ) );

		// ALPHA TEST

		if ( this.alphaTestNode !== null || this.alphaTest > 0 ) {

			const alphaTestNode = this.alphaTestNode !== null ? float( this.alphaTestNode ) : materialAlphaTest;

			diffuseColor.a.lessThanEqual( alphaTestNode ).discard();

		}

	}

	setupVariants( /*builder*/ ) {

		// Interface function.

	}

	setupNormal() {

		// NORMAL VIEW

		if ( this.flatShading === true ) {

			const normalNode = positionView.dFdx().cross( positionView.dFdy() ).normalize();

			transformedNormalView.assign( normalNode.mul( faceDirection ) );

		} else {

			const normalNode = this.normalNode ? vec3( this.normalNode ) : materialNormal;

			transformedNormalView.assign( normalNode.mul( faceDirection ) );

		}

	}

	getEnvNode( builder ) {

		let node = null;

		if ( this.envNode ) {

			node = this.envNode;

		} else if ( this.envMap ) {

			node = this.envMap.isCubeTexture ? cubeTexture( this.envMap ) : texture( this.envMap );

		} else if ( builder.environmentNode ) {

			node = builder.environmentNode;

		}

		return node;

	}

	setupLights( builder ) {

		const envNode = this.getEnvNode( builder );

		//

		const materialLightsNode = [];

		if ( envNode ) {

			materialLightsNode.push( new EnvironmentNode( envNode ) );

		}

		if ( builder.material.aoMap ) {

			materialLightsNode.push( new AONode( texture( builder.material.aoMap ) ) );

		}

		let lightsN = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsN = lightsNode( [ ...lightsN.lightNodes, ...materialLightsNode ] );

		}

		return lightsN;

	}

	setupLightingModel( /*builder*/ ) {

		// Interface function.

	}

	setupLighting( builder ) {

		const { material } = builder;
		const { backdropNode, backdropAlphaNode, emissiveNode } = this;

		// OUTGOING LIGHT

		const lights = this.lights === true || this.lightsNode !== null;

		const lightsNode = lights ? this.setupLights( builder ) : null;

		let outgoingLightNode = diffuseColor.rgb;

		if ( lightsNode && lightsNode.hasLight !== false ) {

			const lightingModel = this.setupLightingModel( builder );

			outgoingLightNode = lightingContext( lightsNode, lightingModel, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			outgoingLightNode = outgoingLightNode.add( vec3( emissiveNode ? emissiveNode : materialEmissive ) );

		}

		return outgoingLightNode;

	}

	setupOutput( builder, outputNode ) {

		const renderer = builder.renderer;

		// TONE MAPPING

		const toneMappingNode = builder.toneMappingNode;

		if ( this.toneMapped === true && toneMappingNode ) {

			outputNode = vec4( toneMappingNode.context( { color: outputNode.rgb } ), outputNode.a );

		}

		// FOG

		if ( this.fog === true ) {

			const fogNode = builder.fogNode;

			if ( fogNode ) outputNode = vec4( fogNode.mixAssign( outputNode.rgb ), outputNode.a );

		}

		// ENCODING

		if ( this.colorSpaced === true ) {

			const outputColorSpace = renderer.currentColorSpace;

			if ( outputColorSpace !== LinearSRGBColorSpace && outputColorSpace !== NoColorSpace ) {

				outputNode = outputNode.linearToColorSpace( outputColorSpace );

			}

		}

		return outputNode;

	}

	setDefaultValues( material ) {

		// This approach is to reuse the native refreshUniforms*
		// and turn available the use of features like transmission and environment in core

		for ( const property in material ) {

			const value = material[ property ];

			if ( this[ property ] === undefined ) {

				this[ property ] = value;

				if ( value && value.clone ) this[ property ] = value.clone();

			}

		}

		Object.assign( this.defines, material.defines );

		const descriptors = Object.getOwnPropertyDescriptors( material.constructor.prototype );

		for ( const key in descriptors ) {

			if ( Object.getOwnPropertyDescriptor( this.constructor.prototype, key ) === undefined &&
			     descriptors[ key ].get !== undefined ) {

				Object.defineProperty( this.constructor.prototype, key, descriptors[ key ] );

			}

		}

	}

	toJSON( meta ) {

		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		const data = Material.prototype.toJSON.call( this, meta );
		const nodeChildren = getNodeChildren( this );

		data.inputNodes = {};

		for ( const { property, childNode } of nodeChildren ) {

			data.inputNodes[ property ] = childNode.toJSON( meta ).uuid;

		}

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const nodes = extractFromCache( meta.nodes );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( nodes.length > 0 ) data.nodes = nodes;

		}

		return data;

	}

	copy( source ) {

		this.lightsNode = source.lightsNode;
		this.envNode = source.envNode;

		this.colorNode = source.colorNode;
		this.normalNode = source.normalNode;
		this.opacityNode = source.opacityNode;
		this.backdropNode = source.backdropNode;
		this.backdropAlphaNode = source.backdropAlphaNode;
		this.alphaTestNode = source.alphaTestNode;

		this.positionNode = source.positionNode;

		this.depthNode = source.depthNode;
		this.shadowNode = source.shadowNode;

		this.outputNode = source.outputNode;

		this.fragmentNode = source.fragmentNode;
		this.vertexNode = source.vertexNode;

		return super.copy( source );

	}

	static fromMaterial( material ) {

		if ( material.isNodeMaterial === true ) { // is already a node material

			return material;

		}

		const type = material.type.replace( 'Material', 'NodeMaterial' );

		const nodeMaterial = createNodeMaterialFromType( type );

		if ( nodeMaterial === undefined ) {

			throw new Error( `NodeMaterial: Material "${ material.type }" is not compatible.` );

		}

		for ( const key in material ) {

			nodeMaterial[ key ] = material[ key ];

		}

		return nodeMaterial;

	}

}

function addNodeMaterial( type, nodeMaterial ) {

	if ( typeof nodeMaterial !== 'function' || ! type ) throw new Error( `Node material ${ type } is not a class` );
	if ( NodeMaterials.has( type ) ) {

		console.warn( `Redefinition of node material ${ type }` );
		return;

	}

	NodeMaterials.set( type, nodeMaterial );
	nodeMaterial.type = type;

}

function createNodeMaterialFromType( type ) {

	const Material = NodeMaterials.get( type );

	if ( Material !== undefined ) {

		return new Material();

	}

}

addNodeMaterial( 'NodeMaterial', NodeMaterial );

class Uniform {

	constructor( name, value = null ) {

		this.name = name;
		this.value = value;

		this.boundary = 0; // used to build the uniform buffer according to the STD140 layout
		this.itemSize = 0;

		this.offset = 0; // this property is set by WebGPUUniformsGroup and marks the start position in the uniform buffer

	}

	setValue( value ) {

		this.value = value;

	}

	getValue() {

		return this.value;

	}

}

class FloatUniform extends Uniform {

	constructor( name, value = 0 ) {

		super( name, value );

		this.isFloatUniform = true;

		this.boundary = 4;
		this.itemSize = 1;

	}

}

class Vector2Uniform extends Uniform {

	constructor( name, value = new Vector2() ) {

		super( name, value );

		this.isVector2Uniform = true;

		this.boundary = 8;
		this.itemSize = 2;

	}

}

class Vector3Uniform extends Uniform {

	constructor( name, value = new Vector3() ) {

		super( name, value );

		this.isVector3Uniform = true;

		this.boundary = 16;
		this.itemSize = 3;

	}

}

class Vector4Uniform extends Uniform {

	constructor( name, value = new Vector4() ) {

		super( name, value );

		this.isVector4Uniform = true;

		this.boundary = 16;
		this.itemSize = 4;

	}

}

class ColorUniform extends Uniform {

	constructor( name, value = new Color() ) {

		super( name, value );

		this.isColorUniform = true;

		this.boundary = 16;
		this.itemSize = 3;

	}

}

class Matrix3Uniform extends Uniform {

	constructor( name, value = new Matrix3() ) {

		super( name, value );

		this.isMatrix3Uniform = true;

		this.boundary = 48;
		this.itemSize = 12;

	}

}

class Matrix4Uniform extends Uniform {

	constructor( name, value = new Matrix4() ) {

		super( name, value );

		this.isMatrix4Uniform = true;

		this.boundary = 64;
		this.itemSize = 16;

	}

}

class FloatNodeUniform extends FloatUniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class Vector2NodeUniform extends Vector2Uniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class Vector3NodeUniform extends Vector3Uniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class Vector4NodeUniform extends Vector4Uniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class ColorNodeUniform extends ColorUniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class Matrix3NodeUniform extends Matrix3Uniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class Matrix4NodeUniform extends Matrix4Uniform {

	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		this.nodeUniform = nodeUniform;

	}

	getValue() {

		return this.nodeUniform.value;

	}

}

class CondNode extends Node {

	constructor( condNode, ifNode, elseNode = null ) {

		super();

		this.condNode = condNode;

		this.ifNode = ifNode;
		this.elseNode = elseNode;

	}

	getNodeType( builder ) {

		const ifType = this.ifNode.getNodeType( builder );

		if ( this.elseNode !== null ) {

			const elseType = this.elseNode.getNodeType( builder );

			if ( builder.getTypeLength( elseType ) > builder.getTypeLength( ifType ) ) {

				return elseType;

			}

		}

		return ifType;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const context$1 = { tempWrite: false };

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.nodeProperty !== undefined ) {

			return nodeData.nodeProperty;

		}

		const { ifNode, elseNode } = this;

		const needsOutput = output !== 'void';
		const nodeProperty = needsOutput ? property( type ).build( builder ) : '';

		nodeData.nodeProperty = nodeProperty;

		const nodeSnippet = context( this.condNode/*, context*/ ).build( builder, 'bool' );

		builder.addFlowCode( `\n${ builder.tab }if ( ${ nodeSnippet } ) {\n\n` ).addFlowTab();

		let ifSnippet = context( ifNode, context$1 ).build( builder, type );

		if ( ifSnippet ) {

			if ( needsOutput ) {

				ifSnippet = nodeProperty + ' = ' + ifSnippet + ';';

			} else {

				ifSnippet = 'return ' + ifSnippet + ';';

			}

		}

		builder.removeFlowTab().addFlowCode( builder.tab + '\t' + ifSnippet + '\n\n' + builder.tab + '}' );

		if ( elseNode !== null ) {

			builder.addFlowCode( ' else {\n\n' ).addFlowTab();

			let elseSnippet = context( elseNode, context$1 ).build( builder, type );

			if ( elseSnippet ) {

				if ( needsOutput ) {

					elseSnippet = nodeProperty + ' = ' + elseSnippet + ';';

				} else {

					elseSnippet = 'return ' + elseSnippet + ';';

				}

			}

			builder.removeFlowTab().addFlowCode( builder.tab + '\t' + elseSnippet + '\n\n' + builder.tab + '}\n\n' );

		} else {

			builder.addFlowCode( '\n\n' );

		}

		return builder.format( nodeProperty, type, output );

	}

}

const cond = nodeProxy( CondNode );

addNodeElement( 'cond', cond );

addNodeClass( 'CondNode', CondNode );

class StackNode extends Node {

	constructor( parent = null ) {

		super();

		this.nodes = [];
		this.outputNode = null;

		this.parent = parent;

		this._currentCond = null;

		this.isStackNode = true;

	}

	getNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	add( node ) {

		this.nodes.push( node );

		return this;

	}

	if( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		this._currentCond = cond( boolNode, methodNode );

		return this.add( this._currentCond );

	}

	elseif( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		const ifNode = cond( boolNode, methodNode );

		this._currentCond.elseNode = ifNode;
		this._currentCond = ifNode;

		return this;

	}

	else( method ) {

		this._currentCond.elseNode = new ShaderNode( method );

		return this;

	}

	build( builder, ...params ) {

		const previousStack = getCurrentStack();

		setCurrentStack( this );

		for ( const node of this.nodes ) {

			node.build( builder, 'void' );

		}

		setCurrentStack( previousStack );

		return this.outputNode ? this.outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

}

const stack = nodeProxy( StackNode );

addNodeClass( 'StackNode', StackNode );

// @TODO: Consider rename WebGLCubeRenderTarget to just CubeRenderTarget

class CubeRenderTarget extends WebGLCubeRenderTarget {

	constructor( size = 1, options = {} ) {

		super( size, options );

		this.isCubeRenderTarget = true;

	}

	fromEquirectangularTexture( renderer, texture$1 ) {

		const currentMinFilter = texture$1.minFilter;
		const currentGenerateMipmaps = texture$1.generateMipmaps;

		texture$1.generateMipmaps = true;

		this.texture.type = texture$1.type;
		this.texture.colorSpace = texture$1.colorSpace;

		this.texture.generateMipmaps = texture$1.generateMipmaps;
		this.texture.minFilter = texture$1.minFilter;
		this.texture.magFilter = texture$1.magFilter;

		const geometry = new BoxGeometry( 5, 5, 5 );

		const uvNode = equirectUV( positionWorldDirection );

		const material = createNodeMaterialFromType( 'MeshBasicNodeMaterial' );
		material.colorNode = texture( texture$1, uvNode, 0 );
		material.side = BackSide;
		material.blending = NoBlending;

		const mesh = new Mesh( geometry, material );

		const scene = new Scene();
		scene.add( mesh );

		// Avoid blurred poles
		if ( texture$1.minFilter === LinearMipmapLinearFilter ) texture$1.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );
		camera.update( renderer, scene );

		texture$1.minFilter = currentMinFilter;
		texture$1.currentGenerateMipmaps = currentGenerateMipmaps;

		mesh.geometry.dispose();
		mesh.material.dispose();

		return this;

	}

}

const uniformsGroupCache = new ChainMap();

const typeFromLength = new Map( [
	[ 2, 'vec2' ],
	[ 3, 'vec3' ],
	[ 4, 'vec4' ],
	[ 9, 'mat3' ],
	[ 16, 'mat4' ]
] );

const typeFromArray = new Map( [
	[ Int8Array, 'int' ],
	[ Int16Array, 'int' ],
	[ Int32Array, 'int' ],
	[ Uint8Array, 'uint' ],
	[ Uint16Array, 'uint' ],
	[ Uint32Array, 'uint' ],
	[ Float32Array, 'float' ]
] );

const toFloat = ( value ) => {

	value = Number( value );

	return value + ( value % 1 ? '' : '.0' );

};

class NodeBuilder {

	constructor( object, renderer, parser, scene = null, material = null ) {

		this.object = object;
		this.material = material || ( object && object.material ) || null;
		this.geometry = ( object && object.geometry ) || null;
		this.renderer = renderer;
		this.parser = parser;
		this.scene = scene;

		this.nodes = [];
		this.updateNodes = [];
		this.updateBeforeNodes = [];
		this.hashNodes = {};

		this.lightsNode = null;
		this.environmentNode = null;
		this.fogNode = null;
		this.toneMappingNode = null;

		this.clippingContext = null;

		this.vertexShader = null;
		this.fragmentShader = null;
		this.computeShader = null;

		this.flowNodes = { vertex: [], fragment: [], compute: [] };
		this.flowCode = { vertex: '', fragment: '', compute: [] };
		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };
		this.structs = { vertex: [], fragment: [], compute: [], index: 0 };
		this.bindings = { vertex: [], fragment: [], compute: [] };
		this.bindingsOffset = { vertex: 0, fragment: 0, compute: 0 };
		this.bindingsArray = null;
		this.attributes = [];
		this.bufferAttributes = [];
		this.varyings = [];
		this.codes = {};
		this.vars = {};
		this.flow = { code: '' };
		this.chaining = [];
		this.stack = stack();
		this.stacks = [];
		this.tab = '\t';

		this.currentFunctionNode = null;

		this.context = {
			keywords: new NodeKeywords(),
			material: this.material
		};

		this.cache = new NodeCache();
		this.globalCache = this.cache;

		this.flowsData = new WeakMap();

		this.shaderStage = null;
		this.buildStage = null;

	}

	getRenderTarget( width, height, options ) {

		return new RenderTarget( width, height, options );

	}

	getCubeRenderTarget( size, options ) {

		return new CubeRenderTarget( size, options );

	}

	includes( node ) {

		return this.nodes.includes( node );

	}

	_getSharedBindings( bindings ) {

		const shared = [];

		for ( const binding of bindings ) {

			if ( binding.shared === true ) {

				// nodes is the chainmap key
				const nodes = binding.getNodes();

				let sharedBinding = uniformsGroupCache.get( nodes );

				if ( sharedBinding === undefined ) {

					uniformsGroupCache.set( nodes, binding );

					sharedBinding = binding;

				}

				shared.push( sharedBinding );

			} else {

				shared.push( binding );

			}

		}

		return shared;

	}

	getBindings() {

		let bindingsArray = this.bindingsArray;

		if ( bindingsArray === null ) {

			const bindings = this.bindings;

			this.bindingsArray = bindingsArray = this._getSharedBindings( ( this.material !== null ) ? [ ...bindings.vertex, ...bindings.fragment ] : bindings.compute );

		}

		return bindingsArray;

	}

	setHashNode( node, hash ) {

		this.hashNodes[ hash ] = node;

	}

	addNode( node ) {

		if ( this.nodes.includes( node ) === false ) {

			this.nodes.push( node );

			this.setHashNode( node, node.getHash( this ) );

		}

	}

	buildUpdateNodes() {

		for ( const node of this.nodes ) {

			const updateType = node.getUpdateType();
			const updateBeforeType = node.getUpdateBeforeType();

			if ( updateType !== NodeUpdateType.NONE ) {

				this.updateNodes.push( node.getSelf() );

			}

			if ( updateBeforeType !== NodeUpdateType.NONE ) {

				this.updateBeforeNodes.push( node );

			}

		}

	}

	get currentNode() {

		return this.chaining[ this.chaining.length - 1 ];

	}

	addChain( node ) {

		/*
		if ( this.chaining.indexOf( node ) !== - 1 ) {

			console.warn( 'Recursive node: ', node );

		}
		*/

		this.chaining.push( node );

	}

	removeChain( node ) {

		const lastChain = this.chaining.pop();

		if ( lastChain !== node ) {

			throw new Error( 'NodeBuilder: Invalid node chaining!' );

		}

	}

	getMethod( method ) {

		return method;

	}

	getNodeFromHash( hash ) {

		return this.hashNodes[ hash ];

	}

	addFlow( shaderStage, node ) {

		this.flowNodes[ shaderStage ].push( node );

		return node;

	}

	setContext( context ) {

		this.context = context;

	}

	getContext() {

		return this.context;

	}

	setCache( cache ) {

		this.cache = cache;

	}

	getCache() {

		return this.cache;

	}

	isAvailable( /*name*/ ) {

		return false;

	}

	getVertexIndex() {

		console.warn( 'Abstract function.' );

	}

	getInstanceIndex() {

		console.warn( 'Abstract function.' );

	}

	getFrontFacing() {

		console.warn( 'Abstract function.' );

	}

	getFragCoord() {

		console.warn( 'Abstract function.' );

	}

	isFlipY() {

		return false;

	}

	generateTexture( /* texture, textureProperty, uvSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	generateTextureLod( /* texture, textureProperty, uvSnippet, levelSnippet */ ) {

		console.warn( 'Abstract function.' );

	}

	generateConst( type, value = null ) {

		if ( value === null ) {

			if ( type === 'float' || type === 'int' || type === 'uint' ) value = 0;
			else if ( type === 'bool' ) value = false;
			else if ( type === 'color' ) value = new Color();
			else if ( type === 'vec2' ) value = new Vector2();
			else if ( type === 'vec3' ) value = new Vector3();
			else if ( type === 'vec4' ) value = new Vector4();

		}

		if ( type === 'float' ) return toFloat( value );
		if ( type === 'int' ) return `${ Math.round( value ) }`;
		if ( type === 'uint' ) return value >= 0 ? `${ Math.round( value ) }u` : '0u';
		if ( type === 'bool' ) return value ? 'true' : 'false';
		if ( type === 'color' ) return `${ this.getType( 'vec3' ) }( ${ toFloat( value.r ) }, ${ toFloat( value.g ) }, ${ toFloat( value.b ) } )`;

		const typeLength = this.getTypeLength( type );

		const componentType = this.getComponentType( type );

		const generateConst = value => this.generateConst( componentType, value );

		if ( typeLength === 2 ) {

			return `${ this.getType( type ) }( ${ generateConst( value.x ) }, ${ generateConst( value.y ) } )`;

		} else if ( typeLength === 3 ) {

			return `${ this.getType( type ) }( ${ generateConst( value.x ) }, ${ generateConst( value.y ) }, ${ generateConst( value.z ) } )`;

		} else if ( typeLength === 4 ) {

			return `${ this.getType( type ) }( ${ generateConst( value.x ) }, ${ generateConst( value.y ) }, ${ generateConst( value.z ) }, ${ generateConst( value.w ) } )`;

		} else if ( typeLength > 4 && value && ( value.isMatrix3 || value.isMatrix4 ) ) {

			return `${ this.getType( type ) }( ${ value.elements.map( generateConst ).join( ', ' ) } )`;

		} else if ( typeLength > 4 ) {

			return `${ this.getType( type ) }()`;

		}

		throw new Error( `NodeBuilder: Type '${type}' not found in generate constant attempt.` );

	}

	getType( type ) {

		if ( type === 'color' ) return 'vec3';

		return type;

	}

	generateMethod( method ) {

		return method;

	}

	hasGeometryAttribute( name ) {

		return this.geometry && this.geometry.getAttribute( name ) !== undefined;

	}

	getAttribute( name, type ) {

		const attributes = this.attributes;

		// find attribute

		for ( const attribute of attributes ) {

			if ( attribute.name === name ) {

				return attribute;

			}

		}

		// create a new if no exist

		const attribute = new NodeAttribute( name, type );

		attributes.push( attribute );

		return attribute;

	}

	getPropertyName( node/*, shaderStage*/ ) {

		return node.name;

	}

	isVector( type ) {

		return /vec\d/.test( type );

	}

	isMatrix( type ) {

		return /mat\d/.test( type );

	}

	isReference( type ) {

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture' || type === 'storageTexture';

	}

	needsColorSpaceToLinear( /*texture*/ ) {

		return false;

	}

	getTextureColorSpaceFromMap( map ) {

		let colorSpace;

		if ( map && map.isTexture ) {

			colorSpace = map.colorSpace;

		} else if ( map && map.isWebGLRenderTarget ) {

			colorSpace = map.texture.colorSpace;

		} else {

			colorSpace = NoColorSpace;

		}

		return colorSpace;

	}

	getComponentType( type ) {

		type = this.getVectorType( type );

		if ( type === 'float' || type === 'bool' || type === 'int' || type === 'uint' ) return type;

		const componentType = /(b|i|u|)(vec|mat)([2-4])/.exec( type );

		if ( componentType === null ) return null;

		if ( componentType[ 1 ] === 'b' ) return 'bool';
		if ( componentType[ 1 ] === 'i' ) return 'int';
		if ( componentType[ 1 ] === 'u' ) return 'uint';

		return 'float';

	}

	getVectorType( type ) {

		if ( type === 'color' ) return 'vec3';
		if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' ) return 'vec4';

		return type;

	}

	getTypeFromLength( length, componentType = 'float' ) {

		if ( length === 1 ) return componentType;

		const baseType = typeFromLength.get( length );
		const prefix = componentType === 'float' ? '' : componentType[ 0 ];

		return prefix + baseType;

	}

	getTypeFromArray( array ) {

		return typeFromArray.get( array.constructor );

	}

	getTypeFromAttribute( attribute ) {

		let dataAttribute = attribute;

		if ( attribute.isInterleavedBufferAttribute ) dataAttribute = attribute.data;

		const array = dataAttribute.array;
		const itemSize = attribute.itemSize;
		const normalized = attribute.normalized;

		let arrayType;

		if ( ! ( attribute instanceof Float16BufferAttribute ) && normalized !== true ) {

			arrayType = this.getTypeFromArray( array );

		}

		return this.getTypeFromLength( itemSize, arrayType );

	}

	getTypeLength( type ) {

		const vecType = this.getVectorType( type );
		const vecNum = /vec([2-4])/.exec( vecType );

		if ( vecNum !== null ) return Number( vecNum[ 1 ] );
		if ( vecType === 'float' || vecType === 'bool' || vecType === 'int' || vecType === 'uint' ) return 1;
		if ( /mat2/.test( type ) === true ) return 4;
		if ( /mat3/.test( type ) === true ) return 9;
		if ( /mat4/.test( type ) === true ) return 16;

		return 0;

	}

	getVectorFromMatrix( type ) {

		return type.replace( 'mat', 'vec' );

	}

	changeComponentType( type, newComponentType ) {

		return this.getTypeFromLength( this.getTypeLength( type ), newComponentType );

	}

	getIntegerType( type ) {

		const componentType = this.getComponentType( type );

		if ( componentType === 'int' || componentType === 'uint' ) return type;

		return this.changeComponentType( type, 'int' );

	}

	addStack() {

		this.stack = stack( this.stack );

		this.stacks.push( getCurrentStack() || this.stack );
		setCurrentStack( this.stack );

		return this.stack;

	}

	removeStack() {

		const lastStack = this.stack;
		this.stack = lastStack.parent;

		setCurrentStack( this.stacks.pop() );

		return lastStack;

	}

	getDataFromNode( node, shaderStage = this.shaderStage, cache = null ) {

		cache = cache === null ? ( node.isGlobal( this ) ? this.globalCache : this.cache ) : cache;

		let nodeData = cache.getNodeData( node );

		if ( nodeData === undefined ) {

			nodeData = {};

			cache.setNodeData( node, nodeData );

		}

		if ( nodeData[ shaderStage ] === undefined ) nodeData[ shaderStage ] = {};

		return nodeData[ shaderStage ];

	}

	getNodeProperties( node, shaderStage = 'any' ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		return nodeData.properties || ( nodeData.properties = { outputNode: null } );

	}

	getBufferAttributeFromNode( node, type ) {

		const nodeData = this.getDataFromNode( node );

		let bufferAttribute = nodeData.bufferAttribute;

		if ( bufferAttribute === undefined ) {

			const index = this.uniforms.index ++;

			bufferAttribute = new NodeAttribute( 'nodeAttribute' + index, type, node );

			this.bufferAttributes.push( bufferAttribute );

			nodeData.bufferAttribute = bufferAttribute;

		}

		return bufferAttribute;

	}

	getStructTypeFromNode( node, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		if ( nodeData.structType === undefined ) {

			const index = this.structs.index ++;

			node.name = `StructType${ index }`;
			this.structs[ shaderStage ].push( node );

			nodeData.structType = node;

		}

		return node;

	}

	getUniformFromNode( node, type, shaderStage = this.shaderStage, name = null ) {

		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		let nodeUniform = nodeData.uniform;

		if ( nodeUniform === undefined ) {

			const index = this.uniforms.index ++;

			nodeUniform = new NodeUniform( name || ( 'nodeUniform' + index ), type, node );

			this.uniforms[ shaderStage ].push( nodeUniform );

			nodeData.uniform = nodeUniform;

		}

		return nodeUniform;

	}

	getVarFromNode( node, name = null, type = node.getNodeType( this ), shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node, shaderStage );

		let nodeVar = nodeData.variable;

		if ( nodeVar === undefined ) {

			const vars = this.vars[ shaderStage ] || ( this.vars[ shaderStage ] = [] );

			if ( name === null ) name = 'nodeVar' + vars.length;

			nodeVar = new NodeVar( name, type );

			vars.push( nodeVar );

			nodeData.variable = nodeVar;

		}

		return nodeVar;

	}

	getVaryingFromNode( node, name = null, type = node.getNodeType( this ) ) {

		const nodeData = this.getDataFromNode( node, 'any' );

		let nodeVarying = nodeData.varying;

		if ( nodeVarying === undefined ) {

			const varyings = this.varyings;
			const index = varyings.length;

			if ( name === null ) name = 'nodeVarying' + index;

			nodeVarying = new NodeVarying( name, type );

			varyings.push( nodeVarying );

			nodeData.varying = nodeVarying;

		}

		return nodeVarying;

	}

	getCodeFromNode( node, type, shaderStage = this.shaderStage ) {

		const nodeData = this.getDataFromNode( node );

		let nodeCode = nodeData.code;

		if ( nodeCode === undefined ) {

			const codes = this.codes[ shaderStage ] || ( this.codes[ shaderStage ] = [] );
			const index = codes.length;

			nodeCode = new NodeCode( 'nodeCode' + index, type );

			codes.push( nodeCode );

			nodeData.code = nodeCode;

		}

		return nodeCode;

	}

	addLineFlowCode( code ) {

		if ( code === '' ) return this;

		code = this.tab + code;

		if ( ! /;\s*$/.test( code ) ) {

			code = code + ';\n';

		}

		this.flow.code += code;

		return this;

	}

	addFlowCode( code ) {

		this.flow.code += code;

		return this;

	}

	addFlowTab() {

		this.tab += '\t';

		return this;

	}

	removeFlowTab() {

		this.tab = this.tab.slice( 0, - 1 );

		return this;

	}

	getFlowData( node/*, shaderStage*/ ) {

		return this.flowsData.get( node );

	}

	flowNode( node ) {

		const output = node.getNodeType( this );

		const flowData = this.flowChildNode( node, output );

		this.flowsData.set( node, flowData );

		return flowData;

	}

	buildFunctionNode( shaderNode ) {

		const fn = new FunctionNode();

		const previous = this.currentFunctionNode;

		this.currentFunctionNode = fn;

		fn.code = this.buildFunctionCode( shaderNode );

		this.currentFunctionNode = previous;

		return fn;

	}

	flowShaderNode( shaderNode ) {

		const layout = shaderNode.layout;

		let inputs;

		if ( shaderNode.isArrayInput ) {

			inputs = [];

			for ( const input of layout.inputs ) {

				inputs.push( new ParameterNode( input.type, input.name ) );

			}

		} else {

			inputs = {};

			for ( const input of layout.inputs ) {

				inputs[ input.name ] = new ParameterNode( input.type, input.name );

			}

		}

		//

		shaderNode.layout = null;

		const callNode = shaderNode.call( inputs );
		const flowData = this.flowStagesNode( callNode, layout.type );

		shaderNode.layout = layout;

		return flowData;

	}

	flowStagesNode( node, output = null ) {

		const previousFlow = this.flow;
		const previousVars = this.vars;
		const previousBuildStage = this.buildStage;

		const flow = {
			code: ''
		};

		this.flow = flow;
		this.vars = {};

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			flow.result = node.build( this, output );

		}

		flow.vars = this.getVars( this.shaderStage );

		this.flow = previousFlow;
		this.vars = previousVars;
		this.setBuildStage( previousBuildStage );

		return flow;

	}

	getFunctionOperator() {

		return null;

	}

	flowChildNode( node, output = null ) {

		const previousFlow = this.flow;

		const flow = {
			code: ''
		};

		this.flow = flow;

		flow.result = node.build( this, output );

		this.flow = previousFlow;

		return flow;

	}

	flowNodeFromShaderStage( shaderStage, node, output = null, propertyName = null ) {

		const previousShaderStage = this.shaderStage;

		this.setShaderStage( shaderStage );

		const flowData = this.flowChildNode( node, output );

		if ( propertyName !== null ) {

			flowData.code += `${ this.tab + propertyName } = ${ flowData.result };\n`;

		}

		this.flowCode[ shaderStage ] = this.flowCode[ shaderStage ] + flowData.code;

		this.setShaderStage( previousShaderStage );

		return flowData;

	}

	getAttributesArray() {

		return this.attributes.concat( this.bufferAttributes );

	}

	getAttributes( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVaryings( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getVar( type, name ) {

		return `${ this.getType( type ) } ${ name }`;

	}

	getVars( shaderStage ) {

		let snippet = '';

		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				snippet += `${ this.getVar( variable.type, variable.name ) }; `;

			}

		}

		return snippet;

	}

	getUniforms( /*shaderStage*/ ) {

		console.warn( 'Abstract function.' );

	}

	getCodes( shaderStage ) {

		const codes = this.codes[ shaderStage ];

		let code = '';

		if ( codes !== undefined ) {

			for ( const nodeCode of codes ) {

				code += nodeCode.code + '\n';

			}

		}

		return code;

	}

	getHash() {

		return this.vertexShader + this.fragmentShader + this.computeShader;

	}

	setShaderStage( shaderStage ) {

		this.shaderStage = shaderStage;

	}

	getShaderStage() {

		return this.shaderStage;

	}

	setBuildStage( buildStage ) {

		this.buildStage = buildStage;

	}

	getBuildStage() {

		return this.buildStage;

	}

	buildCode() {

		console.warn( 'Abstract function.' );

	}

	build( convertMaterial = true ) {

		const { object, material } = this;

		if ( convertMaterial ) {

			if ( material !== null ) {

				NodeMaterial.fromMaterial( material ).build( this );

			} else {

				this.addFlow( 'compute', object );

			}

		}

		// setup() -> stage 1: create possible new nodes and returns an output reference node
		// analyze()   -> stage 2: analyze nodes to possible optimization and validation
		// generate()  -> stage 3: generate shader

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			if ( this.context.vertex && this.context.vertex.isNode ) {

				this.flowNodeFromShaderStage( 'vertex', this.context.vertex );

			}

			for ( const shaderStage of shaderStages ) {

				this.setShaderStage( shaderStage );

				const flowNodes = this.flowNodes[ shaderStage ];

				for ( const node of flowNodes ) {

					if ( buildStage === 'generate' ) {

						this.flowNode( node );

					} else {

						node.build( this );

					}

				}

			}

		}

		this.setBuildStage( null );
		this.setShaderStage( null );

		// stage 4: build code for a specific output

		this.buildCode();
		this.buildUpdateNodes();

		return this;

	}

	getNodeUniform( uniformNode, type ) {

		if ( type === 'float' ) return new FloatNodeUniform( uniformNode );
		if ( type === 'vec2' ) return new Vector2NodeUniform( uniformNode );
		if ( type === 'vec3' ) return new Vector3NodeUniform( uniformNode );
		if ( type === 'vec4' ) return new Vector4NodeUniform( uniformNode );
		if ( type === 'color' ) return new ColorNodeUniform( uniformNode );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( uniformNode );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( uniformNode );

		throw new Error( `Uniform "${type}" not declared.` );

	}

	createNodeMaterial( type = 'NodeMaterial' ) {

		return createNodeMaterialFromType( type );

	}

	format( snippet, fromType, toType ) {

		fromType = this.getVectorType( fromType );
		toType = this.getVectorType( toType );

		if ( fromType === toType || toType === null || this.isReference( toType ) ) {

			return snippet;

		}

		const fromTypeLength = this.getTypeLength( fromType );
		const toTypeLength = this.getTypeLength( toType );

		if ( fromTypeLength > 4 ) { // fromType is matrix-like

			// @TODO: ignore for now

			return snippet;

		}

		if ( toTypeLength > 4 || toTypeLength === 0 ) { // toType is matrix-like or unknown

			// @TODO: ignore for now

			return snippet;

		}

		if ( fromTypeLength === toTypeLength ) {

			return `${ this.getType( toType ) }( ${ snippet } )`;

		}

		if ( fromTypeLength > toTypeLength ) {

			return this.format( `${ snippet }.${ 'xyz'.slice( 0, toTypeLength ) }`, this.getTypeFromLength( toTypeLength, this.getComponentType( fromType ) ), toType );

		}

		if ( toTypeLength === 4 && fromTypeLength > 1 ) { // toType is vec4-like

			return `${ this.getType( toType ) }( ${ this.format( snippet, fromType, 'vec3' ) }, 1.0 )`;

		}

		if ( fromTypeLength === 2 ) { // fromType is vec2-like and toType is vec3-like

			return `${ this.getType( toType ) }( ${ this.format( snippet, fromType, 'vec2' ) }, 0.0 )`;

		}

		if ( fromTypeLength === 1 && toTypeLength > 1 && fromType[ 0 ] !== toType[ 0 ] ) { // fromType is float-like

			// convert a number value to vector type, e.g:
			// vec3( 1u ) -> vec3( float( 1u ) )

			snippet = `${ this.getType( this.getComponentType( toType ) ) }( ${ snippet } )`;

		}

		return `${ this.getType( toType ) }( ${ snippet } )`; // fromType is float-like

	}

	getSignature() {

		return `// Three.js r${ REVISION } - NodeMaterial System\n`;

	}

}

class NodeFrame {

	constructor() {

		this.time = 0;
		this.deltaTime = 0;

		this.frameId = 0;
		this.renderId = 0;

		this.startTime = null;

		this.updateMap = new WeakMap();
		this.updateBeforeMap = new WeakMap();

		this.renderer = null;
		this.material = null;
		this.camera = null;
		this.object = null;
		this.scene = null;

	}

	_getMaps( referenceMap, nodeRef ) {

		let maps = referenceMap.get( nodeRef );

		if ( maps === undefined ) {

			maps = {
				renderMap: new WeakMap(),
				frameMap: new WeakMap()
			};

			referenceMap.set( nodeRef, maps );

		}

		return maps;

	}

	updateBeforeNode( node ) {

		const updateType = node.getUpdateBeforeType();
		const reference = node.setReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateBeforeMap, reference );

			if ( frameMap.get( node ) !== this.frameId ) {

				if ( node.updateBefore( this ) !== false ) {

					frameMap.set( node, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateBeforeMap, reference );

			if ( renderMap.get( node ) !== this.renderId ) {

				if ( node.updateBefore( this ) !== false ) {

					renderMap.set( node, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.updateBefore( this );

		}

	}

	updateNode( node ) {

		const updateType = node.getUpdateType();
		const reference = node.setReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateMap, reference );

			if ( frameMap.get( node ) !== this.frameId ) {

				if ( node.update( this ) !== false ) {

					frameMap.set( node, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateMap, reference );

			if ( renderMap.get( node ) !== this.renderId ) {

				if ( node.update( this ) !== false ) {

					renderMap.set( node, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.update( this );

		}

	}

	update() {

		this.frameId ++;

		if ( this.lastTime === undefined ) this.lastTime = performance.now();

		this.deltaTime = ( performance.now() - this.lastTime ) / 1000;

		this.lastTime = performance.now();

		this.time += this.deltaTime;

	}

}

class NodeFunctionInput {

	constructor( type, name, count = null, qualifier = '', isConst = false ) {

		this.type = type;
		this.name = name;
		this.count = count;
		this.qualifier = qualifier;
		this.isConst = isConst;

	}

}

NodeFunctionInput.isNodeFunctionInput = true;

class StructTypeNode extends Node {

	constructor( types ) {

		super();

		this.types = types;
		this.isStructTypeNode = true;

	}

	getMemberTypes() {

		return this.types;

	}

}

addNodeClass( 'StructTypeNode', StructTypeNode );

class OutputStructNode extends Node {

	constructor( ...members ) {

		super();

		this.isOutputStructNode = true;
		this.members = members;

	}

	setup( builder ) {

		super.setup( builder );

		const members = this.members;
		const types = [];

		for ( let i = 0; i < members.length; i ++ ) {

			types.push( members[ i ].getNodeType( builder ) );

		}

		this.nodeType = builder.getStructTypeFromNode( new StructTypeNode( types ) ).name;

	}

	generate( builder, output ) {

		const nodeVar = builder.getVarFromNode( this );
		nodeVar.isOutputStructVar = true;

		const propertyName = builder.getPropertyName( nodeVar );

		const members = this.members;

		const structPrefix = propertyName !== '' ? propertyName + '.' : '';

		for ( let i = 0; i < members.length; i ++ ) {

			const snippet = members[ i ].build( builder, output );

			builder.addLineFlowCode( `${ structPrefix }m${ i } = ${ snippet }` );

		}

		return propertyName;

	}

}

nodeProxy( OutputStructNode );

addNodeClass( 'OutputStructNode', OutputStructNode );

class HashNode extends Node {

	constructor( seedNode ) {

		super();

		this.seedNode = seedNode;

	}

	setup( /*builder*/ ) {

		// Taken from https://www.shadertoy.com/view/XlGcRh, originally from pcg-random.org

		const state = this.seedNode.uint().mul( 747796405 ).add( 2891336453 );
		const word = state.shiftRight( state.shiftRight( 28 ).add( 4 ) ).bitXor( state ).mul( 277803737 );
		const result = word.shiftRight( 22 ).bitXor( word );

		return result.float().mul( 1 / 2 ** 32 ); // Convert to range [0, 1)

	}

}

const hash = nodeProxy( HashNode );

addNodeElement( 'hash', hash );

addNodeClass( 'HashNode', HashNode );

// remapping functions https://iquilezles.org/articles/functions/
const parabola = ( x, k ) => pow( mul( 4.0, x.mul( sub( 1.0, x ) ) ), k );
const gain = ( x, k ) => x.lessThan( 0.5 ) ? parabola( x.mul( 2.0 ), k ).div( 2.0 ) : sub( 1.0, parabola( mul( sub( 1.0, x ), 2.0 ), k ).div( 2.0 ) );
const pcurve = ( x, a, b ) => pow( div( pow( x, a ), add( pow( x, a ), pow( sub( 1.0, x ), b ) ) ), 1.0 / a );
const sinc = ( x, k ) => sin( PI.mul( k.mul( x ).sub( 1.0 ) ) ).div( PI.mul( k.mul( x ).sub( 1.0 ) ) );


addNodeElement( 'parabola', parabola );
addNodeElement( 'gain', gain );
addNodeElement( 'pcurve', pcurve );
addNodeElement( 'sinc', sinc );

// https://github.com/cabbibo/glsl-tri-noise-3d


const tri = tslFn( ( [ x ] ) => {

	return x.fract().sub( .5 ).abs();

} );

const tri3 = tslFn( ( [ p ] ) => {

	return vec3( tri( p.z.add( tri( p.y.mul( 1. ) ) ) ), tri( p.z.add( tri( p.x.mul( 1. ) ) ) ), tri( p.y.add( tri( p.x.mul( 1. ) ) ) ) );

} );

const triNoise3D = tslFn( ( [ p_immutable, spd, time ] ) => {

	const p = vec3( p_immutable ).toVar();
	const z = float( 1.4 ).toVar();
	const rz = float( 0.0 ).toVar();
	const bp = vec3( p ).toVar();

	loop( { start: float( 0.0 ), end: float( 3.0 ), type: 'float', condition: '<=' }, () => {

		const dg = vec3( tri3( bp.mul( 2.0 ) ) ).toVar();
		p.addAssign( dg.add( time.mul( float( 0.1 ).mul( spd ) ) ) );
		bp.mulAssign( 1.8 );
		z.mulAssign( 1.5 );
		p.mulAssign( 1.2 );

		const t = float( tri( p.z.add( tri( p.x.add( tri( p.y ) ) ) ) ) ).toVar();
		rz.addAssign( t.div( z ) );
		bp.addAssign( 0.14 );

	} );

	return rz;

} );

// layouts

tri.setLayout( {
	name: 'tri',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

tri3.setLayout( {
	name: 'tri3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

triNoise3D.setLayout( {
	name: 'triNoise3D',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'spd', type: 'float' },
		{ name: 'time', type: 'float' }
	]
} );

let discardExpression;

class DiscardNode extends CondNode {

	constructor( condNode ) {

		discardExpression = discardExpression || expression( 'discard' );

		super( condNode, discardExpression );

	}

}

const inlineDiscard = nodeProxy( DiscardNode );
const discard = ( condNode ) => inlineDiscard( condNode ).append();

addNodeElement( 'discard', discard ); // @TODO: Check... this cause a little confusing using in chaining

addNodeClass( 'DiscardNode', DiscardNode );

class FunctionOverloadingNode extends Node {

	constructor( functionNodes = [], ...parametersNodes ) {

		super();

		this.functionNodes = functionNodes;
		this.parametersNodes = parametersNodes;

		this._candidateFnCall = null;

	}

	getNodeType() {

		return this.functionNodes[ 0 ].shaderNode.layout.type;

	}

	setup( builder ) {

		const params = this.parametersNodes;

		let candidateFnCall = this._candidateFnCall;

		if ( candidateFnCall === null ) {

			let candidateFn = null;
			let candidateScore = - 1;

			for ( const functionNode of this.functionNodes ) {

				const shaderNode = functionNode.shaderNode;
				const layout = shaderNode.layout;

				if ( layout === null ) {

					throw new Error( 'FunctionOverloadingNode: FunctionNode must be a layout.' );

				}

				const inputs = layout.inputs;

				if ( params.length === inputs.length ) {

					let score = 0;

					for ( let i = 0; i < params.length; i ++ ) {

						const param = params[ i ];
						const input = inputs[ i ];

						if ( param.getNodeType( builder ) === input.type ) {

							score ++;

						} else {

							score = 0;

						}

					}

					if ( score > candidateScore ) {

						candidateFn = functionNode;
						candidateScore = score;

					}

				}

			}

			this._candidateFnCall = candidateFnCall = candidateFn( ...params );

		}

		return candidateFnCall;

	}

}

const overloadingBaseFn = nodeProxy( FunctionOverloadingNode );

const overloadingFn = ( functionNodes ) => ( ...params ) => overloadingBaseFn( functionNodes, ...params );

addNodeClass( 'FunctionOverloadingNode', FunctionOverloadingNode );

class MatcapUVNode extends TempNode {

	constructor() {

		super( 'vec2' );

	}

	setup() {

		const x = vec3( positionViewDirection.z, 0, positionViewDirection.x.negate() ).normalize();
		const y = positionViewDirection.cross( x );

		return vec2( x.dot( transformedNormalView ), y.dot( transformedNormalView ) ).mul( 0.495 ).add( 0.5 );

	}

}

nodeImmutable( MatcapUVNode );

addNodeClass( 'MatcapUVNode', MatcapUVNode );

class TimerNode extends UniformNode {

	constructor( scope = TimerNode.LOCAL, scale = 1, value = 0 ) {

		super( value );

		this.scope = scope;
		this.scale = scale;

		this.updateType = NodeUpdateType.FRAME;

	}
	/*
	@TODO:
	getNodeType( builder ) {

		const scope = this.scope;

		if ( scope === TimerNode.FRAME ) {

			return 'uint';

		}

		return 'float';

	}
*/
	update( frame ) {

		const scope = this.scope;
		const scale = this.scale;

		if ( scope === TimerNode.LOCAL ) {

			this.value += frame.deltaTime * scale;

		} else if ( scope === TimerNode.DELTA ) {

			this.value = frame.deltaTime * scale;

		} else if ( scope === TimerNode.FRAME ) {

			this.value = frame.frameId;

		} else {

			// global

			this.value = frame.time * scale;

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;
		data.scale = this.scale;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;
		this.scale = data.scale;

	}

}

TimerNode.LOCAL = 'local';
TimerNode.GLOBAL = 'global';
TimerNode.DELTA = 'delta';
TimerNode.FRAME = 'frame';

// @TODO: add support to use node in timeScale
const timerLocal = ( timeScale, value = 0 ) => nodeObject( new TimerNode( TimerNode.LOCAL, timeScale, value ) );
nodeImmutable( TimerNode, TimerNode.FRAME ).uint();

addNodeClass( 'TimerNode', TimerNode );

class OscNode extends Node {

	constructor( method = OscNode.SINE, timeNode = timerLocal() ) {

		super();

		this.method = method;
		this.timeNode = timeNode;

	}

	getNodeType( builder ) {

		return this.timeNode.getNodeType( builder );

	}

	setup() {

		const method = this.method;
		const timeNode = nodeObject( this.timeNode );

		let outputNode = null;

		if ( method === OscNode.SINE ) {

			outputNode = timeNode.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );

		} else if ( method === OscNode.SQUARE ) {

			outputNode = timeNode.fract().round();

		} else if ( method === OscNode.TRIANGLE ) {

			outputNode = timeNode.add( 0.5 ).fract().mul( 2 ).sub( 1 ).abs();

		} else if ( method === OscNode.SAWTOOTH ) {

			outputNode = timeNode.fract();

		}

		return outputNode;

	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

}

OscNode.SINE = 'sine';
OscNode.SQUARE = 'square';
OscNode.TRIANGLE = 'triangle';
OscNode.SAWTOOTH = 'sawtooth';

nodeProxy( OscNode, OscNode.SINE );
nodeProxy( OscNode, OscNode.SQUARE );
nodeProxy( OscNode, OscNode.TRIANGLE );
nodeProxy( OscNode, OscNode.SAWTOOTH );

addNodeClass( 'OscNode', OscNode );

class PackingNode extends TempNode {

	constructor( scope, node ) {

		super();

		this.scope = scope;
		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup() {

		const { scope, node } = this;

		let result = null;

		if ( scope === PackingNode.DIRECTION_TO_COLOR ) {

			result = node.mul( 0.5 ).add( 0.5 );

		} else if ( scope === PackingNode.COLOR_TO_DIRECTION ) {

			result = node.mul( 2.0 ).sub( 1 );

		}

		return result;

	}

}

PackingNode.DIRECTION_TO_COLOR = 'directionToColor';
PackingNode.COLOR_TO_DIRECTION = 'colorToDirection';

const directionToColor = nodeProxy( PackingNode, PackingNode.DIRECTION_TO_COLOR );
const colorToDirection = nodeProxy( PackingNode, PackingNode.COLOR_TO_DIRECTION );

addNodeElement( 'directionToColor', directionToColor );
addNodeElement( 'colorToDirection', colorToDirection );

addNodeClass( 'PackingNode', PackingNode );

class RemapNode extends Node {

	constructor( node, inLowNode, inHighNode, outLowNode = float( 0 ), outHighNode = float( 1 ) ) {

		super();

		this.node = node;
		this.inLowNode = inLowNode;
		this.inHighNode = inHighNode;
		this.outLowNode = outLowNode;
		this.outHighNode = outHighNode;

		this.doClamp = true;

	}

	setup() {

		const { node, inLowNode, inHighNode, outLowNode, outHighNode, doClamp } = this;

		let t = node.sub( inLowNode ).div( inHighNode.sub( inLowNode ) );

		if ( doClamp === true ) t = t.clamp();

		return t.mul( outHighNode.sub( outLowNode ) ).add( outLowNode );

	}

}

const remap = nodeProxy( RemapNode, null, null, { doClamp: false } );
const remapClamp = nodeProxy( RemapNode );

addNodeElement( 'remap', remap );
addNodeElement( 'remapClamp', remapClamp );

addNodeClass( 'RemapNode', RemapNode );

class RotateUVNode extends TempNode {

	constructor( uvNode, rotationNode, centerNode = vec2( 0.5 ) ) {

		super( 'vec2' );

		this.uvNode = uvNode;
		this.rotationNode = rotationNode;
		this.centerNode = centerNode;

	}

	setup() {

		const { uvNode, rotationNode, centerNode } = this;

		const vector = uvNode.sub( centerNode );

		return vector.rotate( rotationNode ).add( centerNode );

	}

}

const rotateUV = nodeProxy( RotateUVNode );

addNodeElement( 'rotateUV', rotateUV );

addNodeClass( 'RotateUVNode', RotateUVNode );

class RotateNode extends TempNode {

	constructor( positionNode, rotationNode ) {

		super();

		this.positionNode = positionNode;
		this.rotationNode = rotationNode;

	}

	getNodeType( builder ) {

		return this.positionNode.getNodeType( builder );

	}

	setup( builder ) {

		const { rotationNode, positionNode } = this;

		const nodeType = this.getNodeType( builder );

		if ( nodeType === 'vec2' ) {

			const cosAngle = rotationNode.cos();
			const sinAngle = rotationNode.sin();

			const rotationMatrix = mat2(
				cosAngle, sinAngle,
				sinAngle.negate(), cosAngle
			);

			return rotationMatrix.mul( positionNode );

		} else {

			const rotation = rotationNode;
			const rotationXMatrix = mat4( vec4( 1.0, 0.0, 0.0, 0.0 ), vec4( 0.0, cos( rotation.x ), sin( rotation.x ).negate(), 0.0 ), vec4( 0.0, sin( rotation.x ), cos( rotation.x ), 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
			const rotationYMatrix = mat4( vec4( cos( rotation.y ), 0.0, sin( rotation.y ), 0.0 ), vec4( 0.0, 1.0, 0.0, 0.0 ), vec4( sin( rotation.y ).negate(), 0.0, cos( rotation.y ), 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
			const rotationZMatrix = mat4( vec4( cos( rotation.z ), sin( rotation.z ).negate(), 0.0, 0.0 ), vec4( sin( rotation.z ), cos( rotation.z ), 0.0, 0.0 ), vec4( 0.0, 0.0, 1.0, 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );

			return rotationXMatrix.mul( rotationYMatrix ).mul( rotationZMatrix ).mul( vec4( positionNode, 1.0 ) ).xyz;

		}

	}

}

const rotate = nodeProxy( RotateNode );

addNodeElement( 'rotate', rotate );

addNodeClass( 'RotateNode', RotateNode );

class SpriteSheetUVNode extends Node {

	constructor( countNode, uvNode = uv(), frameNode = float( 0 ) ) {

		super( 'vec2' );

		this.countNode = countNode;
		this.uvNode = uvNode;
		this.frameNode = frameNode;

	}

	setup() {

		const { frameNode, uvNode, countNode } = this;

		const { width, height } = countNode;

		const frameNum = frameNode.mod( width.mul( height ) ).floor();

		const column = frameNum.mod( width );
		const row = height.sub( frameNum.add( 1 ).div( width ).ceil() );

		const scale = countNode.reciprocal();
		const uvFrameOffset = vec2( column, row );

		return uvNode.add( uvFrameOffset ).mul( scale );

	}

}

nodeProxy( SpriteSheetUVNode );

addNodeClass( 'SpriteSheetUVNode', SpriteSheetUVNode );

class StorageArrayElementNode extends ArrayElementNode {

	constructor( storageBufferNode, indexNode ) {

		super( storageBufferNode, indexNode );

		this.isStorageArrayElementNode = true;

	}

	set storageBufferNode( value ) {

		this.node = value;

	}

	get storageBufferNode() {

		return this.node;

	}

	setup( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			if ( ! this.node.instanceIndex && this.node.bufferObject === true ) {

				builder.setupPBO( this.node );

			}

		}

		return super.setup( builder );

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;

		//

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			const { node } = this;

			if ( ! node.instanceIndex && this.node.bufferObject === true && isAssignContext !== true ) {

				snippet = builder.generatePBO( this );

			} else {

				snippet = node.build( builder );

			}

		} else {

			snippet = super.generate( builder );

		}

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		return snippet;

	}

}

const storageElement = nodeProxy( StorageArrayElementNode );

addNodeElement( 'storageElement', storageElement );

addNodeClass( 'StorageArrayElementNode', StorageArrayElementNode );

class TriplanarTexturesNode extends Node {

	constructor( textureXNode, textureYNode = null, textureZNode = null, scaleNode = float( 1 ), positionNode = positionLocal, normalNode = normalLocal ) {

		super( 'vec4' );

		this.textureXNode = textureXNode;
		this.textureYNode = textureYNode;
		this.textureZNode = textureZNode;

		this.scaleNode = scaleNode;

		this.positionNode = positionNode;
		this.normalNode = normalNode;

	}

	setup() {

		const { textureXNode, textureYNode, textureZNode, scaleNode, positionNode, normalNode } = this;

		// Ref: https://github.com/keijiro/StandardTriplanar

		// Blending factor of triplanar mapping
		let bf = normalNode.abs().normalize();
		bf = bf.div( bf.dot( vec3( 1.0 ) ) );

		// Triplanar mapping
		const tx = positionNode.yz.mul( scaleNode );
		const ty = positionNode.zx.mul( scaleNode );
		const tz = positionNode.xy.mul( scaleNode );

		// Base color
		const textureX = textureXNode.value;
		const textureY = textureYNode !== null ? textureYNode.value : textureX;
		const textureZ = textureZNode !== null ? textureZNode.value : textureX;

		const cx = texture( textureX, tx ).mul( bf.x );
		const cy = texture( textureY, ty ).mul( bf.y );
		const cz = texture( textureZ, tz ).mul( bf.z );

		return add( cx, cy, cz );

	}

}

const triplanarTextures = nodeProxy( TriplanarTexturesNode );
const triplanarTexture = ( ...params ) => triplanarTextures( ...params );

addNodeElement( 'triplanarTexture', triplanarTexture );

addNodeClass( 'TriplanarTexturesNode', TriplanarTexturesNode );

new Plane();
new Vector3();
new Vector3();
new Vector3();
new Matrix4();
new Vector3( 0, 0, - 1 );
new Vector4();

new Vector3();
new Vector3();
new Vector4();

new Vector2();

new RenderTarget();
vec2( viewportTopLeft.x.oneMinus(), viewportTopLeft.y );

class BitangentNode extends Node {

	constructor( scope = BitangentNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `bitangent-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let crossNormalTangent;

		if ( scope === BitangentNode.GEOMETRY ) {

			crossNormalTangent = normalGeometry.cross( tangentGeometry );

		} else if ( scope === BitangentNode.LOCAL ) {

			crossNormalTangent = normalLocal.cross( tangentLocal );

		} else if ( scope === BitangentNode.VIEW ) {

			crossNormalTangent = normalView.cross( tangentView );

		} else if ( scope === BitangentNode.WORLD ) {

			crossNormalTangent = normalWorld.cross( tangentWorld );

		}

		const vertexNode = crossNormalTangent.mul( tangentGeometry.w ).xyz;

		const outputNode = normalize( varying( vertexNode ) );

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

BitangentNode.GEOMETRY = 'geometry';
BitangentNode.LOCAL = 'local';
BitangentNode.VIEW = 'view';
BitangentNode.WORLD = 'world';

nodeImmutable( BitangentNode, BitangentNode.GEOMETRY );
nodeImmutable( BitangentNode, BitangentNode.LOCAL );
const bitangentView = nodeImmutable( BitangentNode, BitangentNode.VIEW );
nodeImmutable( BitangentNode, BitangentNode.WORLD );
const transformedBitangentView = normalize( transformedNormalView.cross( transformedTangentView ).mul( tangentGeometry.w ) );
normalize( transformedBitangentView.transformDirection( cameraViewMatrix ) );

addNodeClass( 'BitangentNode', BitangentNode );

const TBNViewMatrix = mat3( tangentView, bitangentView, normalView );

positionViewDirection.mul( TBNViewMatrix )/*.normalize()*/;

class VertexColorNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec4' );

		this.isVertexColorNode = true;

		this.index = index;

	}

	getAttributeName( /*builder*/ ) {

		const index = this.index;

		return 'color' + ( index > 0 ? index : '' );

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		let result;

		if ( geometryAttribute === true ) {

			result = super.generate( builder );

		} else {

			// Vertex color fallback should be white
			result = builder.generateConst( this.nodeType, new Vector4( 1, 1, 1, 1 ) );

		}

		return result;

	}

	serialize( data ) {

		super.serialize( data );

		data.index = this.index;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.index = data.index;

	}

}

addNodeClass( 'VertexColorNode', VertexColorNode );

// Mipped Bicubic Texture Filtering by N8
// https://www.shadertoy.com/view/Dl2SDW

const bC = 1.0 / 6.0;

const w0 = ( a ) => mul( bC, mul( a, mul( a, a.negate().add( 3.0 ) ).sub( 3.0 ) ).add( 1.0 ) );

const w1 = ( a ) => mul( bC, mul( a, mul( a, mul( 3.0, a ).sub( 6.0 ) ) ).add( 4.0 ) );

const w2 = ( a ) => mul( bC, mul( a, mul( a, mul( - 3.0, a ).add( 3.0 ) ).add( 3.0 ) ).add( 1.0 ) );

const w3 = ( a ) => mul( bC, pow( a, 3 ) );

const g0 = ( a ) => w0( a ).add( w1( a ) );

const g1 = ( a ) => w2( a ).add( w3( a ) );

// h0 and h1 are the two offset functions
const h0 = ( a ) => add( - 1.0, w1( a ).div( w0( a ).add( w1( a ) ) ) );

const h1 = ( a ) => add( 1.0, w3( a ).div( w2( a ).add( w3( a ) ) ) );

const bicubic = ( textureNode, texelSize, lod ) => {

	const uv = textureNode.uvNode;
	const uvScaled = mul( uv, texelSize.zw ).add( 0.5 );

	const iuv = floor( uvScaled );
	const fuv = fract( uvScaled );

	const g0x = g0( fuv.x );
	const g1x = g1( fuv.x );
	const h0x = h0( fuv.x );
	const h1x = h1( fuv.x );
	const h0y = h0( fuv.y );
	const h1y = h1( fuv.y );

	const p0 = vec2( iuv.x.add( h0x ), iuv.y.add( h0y ) ).sub( 0.5 ).mul( texelSize.xy );
	const p1 = vec2( iuv.x.add( h1x ), iuv.y.add( h0y ) ).sub( 0.5 ).mul( texelSize.xy );
	const p2 = vec2( iuv.x.add( h0x ), iuv.y.add( h1y ) ).sub( 0.5 ).mul( texelSize.xy );
	const p3 = vec2( iuv.x.add( h1x ), iuv.y.add( h1y ) ).sub( 0.5 ).mul( texelSize.xy );

	const a = g0( fuv.y ).mul( add( g0x.mul( textureNode.uv( p0 ).level( lod ) ), g1x.mul( textureNode.uv( p1 ).level( lod ) ) ) );
	const b = g1( fuv.y ).mul( add( g0x.mul( textureNode.uv( p2 ).level( lod ) ), g1x.mul( textureNode.uv( p3 ).level( lod ) ) ) );

	return a.add( b );

};

const textureBicubicMethod = ( textureNode, lodNode ) => {

	const fLodSize = vec2( textureNode.size( int( lodNode ) ) );
	const cLodSize = vec2( textureNode.size( int( lodNode.add( 1.0 ) ) ) );
	const fLodSizeInv = div( 1.0, fLodSize );
	const cLodSizeInv = div( 1.0, cLodSize );
	const fSample = bicubic( textureNode, vec4( fLodSizeInv, fLodSize ), floor( lodNode ) );
	const cSample = bicubic( textureNode, vec4( cLodSizeInv, cLodSize ), ceil( lodNode ) );

	return fract( lodNode ).mix( fSample, cSample );

};

class TextureBicubicNode extends TempNode {

	constructor( textureNode, blurNode = float( 3 ) ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.blurNode = blurNode;

	}

	setup() {

		return textureBicubicMethod( this.textureNode, this.blurNode );

	}

}

const textureBicubic = nodeProxy( TextureBicubicNode );

addNodeElement( 'bicubic', textureBicubic );

addNodeClass( 'TextureBicubicNode', TextureBicubicNode );

class PointUVNode extends Node {

	constructor() {

		super( 'vec2' );

		this.isPointUVNode = true;

	}

	generate( /*builder*/ ) {

		return 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

	}

}

nodeImmutable( PointUVNode );

addNodeClass( 'PointUVNode', PointUVNode );

class SceneNode extends Node {

	constructor( scope = SceneNode.BACKGROUND_BLURRINESS, scene = null ) {

		super();

		this.scope = scope;
		this.scene = scene;

	}

	setup( builder ) {

		const scope = this.scope;
		const scene = this.scene !== null ? this.scene : builder.scene;

		let output;

		if ( scope === SceneNode.BACKGROUND_BLURRINESS ) {

			output = reference( 'backgroundBlurriness', 'float', scene );

		} else if ( scope === SceneNode.BACKGROUND_INTENSITY ) {

			output = reference( 'backgroundIntensity', 'float', scene );

		} else {

			console.error( 'THREE.SceneNode: Unknown scope:', scope );

		}

		return output;

	}

}

SceneNode.BACKGROUND_BLURRINESS = 'backgroundBlurriness';
SceneNode.BACKGROUND_INTENSITY = 'backgroundIntensity';

const backgroundBlurriness = nodeImmutable( SceneNode, SceneNode.BACKGROUND_BLURRINESS );
const backgroundIntensity = nodeImmutable( SceneNode, SceneNode.BACKGROUND_INTENSITY );

addNodeClass( 'SceneNode', SceneNode );

class StorageBufferNode extends BufferNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType, bufferCount );

		this.isStorageBufferNode = true;

		this.bufferObject = false;

		this._attribute = null;
		this._varying = null;

	}

	getInputType( /*builder*/ ) {

		return 'storageBuffer';

	}

	element( indexNode ) {

		return storageElement( this, indexNode );

	}

	setBufferObject( value ) {

		this.bufferObject = value;

		return this;

	}

	generate( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) ) return super.generate( builder );

		const nodeType = this.getNodeType( builder );

		if ( this._attribute === null ) {

			this._attribute = bufferAttribute( this.value );
			this._varying = varying( this._attribute );

		}


		const output = this._varying.build( builder, nodeType );

		builder.registerTransform( output, this._attribute );

		return output;

	}

}

addNodeClass( 'StorageBufferNode', StorageBufferNode );

class TextureStoreNode extends TextureNode {

	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode );

		this.storeNode = storeNode;

		this.isStoreTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'storageTexture';

	}

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.storeNode = this.storeNode;

	}

	generate( builder, output ) {

		let snippet;

		if ( this.storeNode !== null ) {

			snippet = this.generateStore( builder );

		} else {

			snippet = super.generate( builder, output );

		}

		return snippet;

	}

	generateStore( builder ) {

		const properties = builder.getNodeProperties( this );

		const { uvNode, storeNode } = properties;

		const textureProperty = super.generate( builder, 'property' );
		const uvSnippet = uvNode.build( builder, 'uvec2' );
		const storeSnippet = storeNode.build( builder, 'vec4' );

		const snippet = builder.generateTextureStore( builder, textureProperty, uvSnippet, storeSnippet );

		builder.addLineFlowCode( snippet );

	}

}

nodeProxy( TextureStoreNode );

addNodeClass( 'TextureStoreNode', TextureStoreNode );

class UserDataNode extends ReferenceNode {

	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		this.userData = userData;

	}

	update( frame ) {

		this.reference = this.userData !== null ? this.userData : frame.object.userData;

		super.update( frame );

	}

}

addNodeClass( 'UserDataNode', UserDataNode );

const BurnNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].lessThan( EPSILON ).cond( blend[ c ], base[ c ].oneMinus().div( blend[ c ] ).oneMinus().max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'burnColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const DodgeNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => blend[ c ].equal( 1.0 ).cond( blend[ c ], base[ c ].div( blend[ c ].oneMinus() ).max( 0 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'dodgeColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const ScreenNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus();

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'screenColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const OverlayNode = tslFn( ( { base, blend } ) => {

	const fn = ( c ) => base[ c ].lessThan( 0.5 ).cond( base[ c ].mul( blend[ c ], 2.0 ), base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus() );
	//const fn = ( c ) => mix( base[ c ].oneMinus().mul( blend[ c ].oneMinus() ).oneMinus(), base[ c ].mul( blend[ c ], 2.0 ), step( base[ c ], 0.5 ) );

	return vec3( fn( 'x' ), fn( 'y' ), fn( 'z' ) );

} ).setLayout( {
	name: 'overlayColor',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

class BlendModeNode extends TempNode {

	constructor( blendMode, baseNode, blendNode ) {

		super();

		this.blendMode = blendMode;

		this.baseNode = baseNode;
		this.blendNode = blendNode;

	}

	setup() {

		const { blendMode, baseNode, blendNode } = this;
		const params = { base: baseNode, blend: blendNode };

		let outputNode = null;

		if ( blendMode === BlendModeNode.BURN ) {

			outputNode = BurnNode( params );

		} else if ( blendMode === BlendModeNode.DODGE ) {

			outputNode = DodgeNode( params );

		} else if ( blendMode === BlendModeNode.SCREEN ) {

			outputNode = ScreenNode( params );

		} else if ( blendMode === BlendModeNode.OVERLAY ) {

			outputNode = OverlayNode( params );

		}

		return outputNode;

	}

}

BlendModeNode.BURN = 'burn';
BlendModeNode.DODGE = 'dodge';
BlendModeNode.SCREEN = 'screen';
BlendModeNode.OVERLAY = 'overlay';

const burn = nodeProxy( BlendModeNode, BlendModeNode.BURN );
const dodge = nodeProxy( BlendModeNode, BlendModeNode.DODGE );
const overlay = nodeProxy( BlendModeNode, BlendModeNode.OVERLAY );
const screen = nodeProxy( BlendModeNode, BlendModeNode.SCREEN );

addNodeElement( 'burn', burn );
addNodeElement( 'dodge', dodge );
addNodeElement( 'overlay', overlay );
addNodeElement( 'screen', screen );

addNodeClass( 'BlendModeNode', BlendModeNode );

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

const dHdxy_fwd = tslFn( ( { textureNode, bumpScale } ) => {

	let texNode = textureNode;

	if ( texNode.isTextureNode !== true ) {

		texNode.traverse( ( node ) => {

			if ( node.isTextureNode === true ) texNode = node;

		} );

	}

	if ( texNode.isTextureNode !== true ) {

		throw new Error( 'THREE.TSL: dHdxy_fwd() requires a TextureNode.' );

	}

	const Hll = float( textureNode );
	const uvNode = texNode.uvNode || uv();

	// It's used to preserve the same TextureNode instance
	const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

	return vec2(
		float( sampleTexture( uvNode.add( uvNode.dFdx() ) ) ).sub( Hll ),
		float( sampleTexture( uvNode.add( uvNode.dFdy() ) ) ).sub( Hll )
	).mul( bumpScale );

} );

const perturbNormalArb = tslFn( ( inputs ) => {

	const { surf_pos, surf_norm, dHdxy } = inputs;

	// normalize is done to ensure that the bump map looks the same regardless of the texture's scale
	const vSigmaX = surf_pos.dFdx().normalize();
	const vSigmaY = surf_pos.dFdy().normalize();
	const vN = surf_norm; // normalized

	const R1 = vSigmaY.cross( vN );
	const R2 = vN.cross( vSigmaX );

	const fDet = vSigmaX.dot( R1 ).mul( faceDirection );

	const vGrad = fDet.sign().mul( dHdxy.x.mul( R1 ).add( dHdxy.y.mul( R2 ) ) );

	return fDet.abs().mul( surf_norm ).sub( vGrad ).normalize();

} );

class BumpMapNode extends TempNode {

	constructor( textureNode, scaleNode = null ) {

		super( 'vec3' );

		this.textureNode = textureNode;
		this.scaleNode = scaleNode;

	}

	setup() {

		const bumpScale = this.scaleNode !== null ? this.scaleNode : 1;
		const dHdxy = dHdxy_fwd( { textureNode: this.textureNode, bumpScale } );

		return perturbNormalArb( {
			surf_pos: positionView,
			surf_norm: normalView,
			dHdxy
		} );

	}

}

const bumpMap = nodeProxy( BumpMapNode );

addNodeElement( 'bumpMap', bumpMap );

addNodeClass( 'BumpMapNode', BumpMapNode );

const saturationNode = tslFn( ( { color, adjustment } ) => {

	return adjustment.mix( luminance( color.rgb ), color.rgb );

} );

const vibranceNode = tslFn( ( { color, adjustment } ) => {

	const average = add( color.r, color.g, color.b ).div( 3.0 );

	const mx = color.r.max( color.g.max( color.b ) );
	const amt = mx.sub( average ).mul( adjustment ).mul( - 3.0 );

	return mix( color.rgb, mx, amt );

} );

const hueNode = tslFn( ( { color, adjustment } ) => {

	const k = vec3( 0.57735, 0.57735, 0.57735 );

	const cosAngle = adjustment.cos();

	return vec3( color.rgb.mul( cosAngle ).add( k.cross( color.rgb ).mul( adjustment.sin() ).add( k.mul( dot( k, color.rgb ).mul( cosAngle.oneMinus() ) ) ) ) );

} );

class ColorAdjustmentNode extends TempNode {

	constructor( method, colorNode, adjustmentNode = float( 1 ) ) {

		super( 'vec3' );

		this.method = method;

		this.colorNode = colorNode;
		this.adjustmentNode = adjustmentNode;

	}

	setup() {

		const { method, colorNode, adjustmentNode } = this;

		const callParams = { color: colorNode, adjustment: adjustmentNode };

		let outputNode = null;

		if ( method === ColorAdjustmentNode.SATURATION ) {

			outputNode = saturationNode( callParams );

		} else if ( method === ColorAdjustmentNode.VIBRANCE ) {

			outputNode = vibranceNode( callParams );

		} else if ( method === ColorAdjustmentNode.HUE ) {

			outputNode = hueNode( callParams );

		} else {

			console.error( `${ this.type }: Method "${ this.method }" not supported!` );

		}

		return outputNode;

	}

}

ColorAdjustmentNode.SATURATION = 'saturation';
ColorAdjustmentNode.VIBRANCE = 'vibrance';
ColorAdjustmentNode.HUE = 'hue';

const saturation = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.SATURATION );
const vibrance = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.VIBRANCE );
const hue = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.HUE );

const lumaCoeffs = vec3( 0.2125, 0.7154, 0.0721 );
const luminance = ( color, luma = lumaCoeffs ) => dot( color, luma );

const threshold = ( color, threshold ) => mix( vec3( 0.0 ), color, luminance( color ).sub( threshold ).max( 0 ) );

addNodeElement( 'saturation', saturation );
addNodeElement( 'vibrance', vibrance );
addNodeElement( 'hue', hue );
addNodeElement( 'threshold', threshold );

addNodeClass( 'ColorAdjustmentNode', ColorAdjustmentNode );

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2Arb = tslFn( ( inputs ) => {

	const { eye_pos, surf_norm, mapN, uv } = inputs;

	const q0 = eye_pos.dFdx();
	const q1 = eye_pos.dFdy();
	const st0 = uv.dFdx();
	const st1 = uv.dFdy();

	const N = surf_norm; // normalized

	const q1perp = q1.cross( N );
	const q0perp = N.cross( q0 );

	const T = q1perp.mul( st0.x ).add( q0perp.mul( st1.x ) );
	const B = q1perp.mul( st0.y ).add( q0perp.mul( st1.y ) );

	const det = T.dot( T ).max( B.dot( B ) );
	const scale = faceDirection.mul( det.inverseSqrt() );

	return add( T.mul( mapN.x, scale ), B.mul( mapN.y, scale ), N.mul( mapN.z ) ).normalize();

} );

class NormalMapNode extends TempNode {

	constructor( node, scaleNode = null ) {

		super( 'vec3' );

		this.node = node;
		this.scaleNode = scaleNode;

		this.normalMapType = TangentSpaceNormalMap;

	}

	setup( builder ) {

		const { normalMapType, scaleNode } = this;

		let normalMap = this.node.mul( 2.0 ).sub( 1.0 );

		if ( scaleNode !== null ) {

			normalMap = vec3( normalMap.xy.mul( scaleNode ), normalMap.z );

		}

		let outputNode = null;

		if ( normalMapType === ObjectSpaceNormalMap ) {

			outputNode = modelNormalMatrix.mul( normalMap ).normalize();

		} else if ( normalMapType === TangentSpaceNormalMap ) {

			const tangent = builder.hasGeometryAttribute( 'tangent' );

			if ( tangent === true ) {

				outputNode = TBNViewMatrix.mul( normalMap ).normalize();

			} else {

				outputNode = perturbNormal2Arb( {
					eye_pos: positionView,
					surf_norm: normalView,
					mapN: normalMap,
					uv: uv()
				} );

			}

		}

		return outputNode;

	}

}

const normalMap = nodeProxy( NormalMapNode );

addNodeElement( 'normalMap', normalMap );

addNodeClass( 'NormalMapNode', NormalMapNode );

class PosterizeNode extends TempNode {

	constructor( sourceNode, stepsNode ) {

		super();

		this.sourceNode = sourceNode;
		this.stepsNode = stepsNode;

	}

	setup() {

		const { sourceNode, stepsNode } = this;

		return sourceNode.mul( stepsNode ).floor().div( stepsNode );

	}

}

const posterize = nodeProxy( PosterizeNode );

addNodeElement( 'posterize', posterize );

addNodeClass( 'PosterizeNode', PosterizeNode );

// exposure only
const LinearToneMappingNode = tslFn( ( { color, exposure } ) => {

	return color.mul( exposure ).clamp();

} );

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
const ReinhardToneMappingNode = tslFn( ( { color, exposure } ) => {

	color = color.mul( exposure );

	return color.div( color.add( 1.0 ) ).clamp();

} );

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
const OptimizedCineonToneMappingNode = tslFn( ( { color, exposure } ) => {

	// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
	color = color.mul( exposure );
	color = color.sub( 0.004 ).max( 0.0 );

	const a = color.mul( color.mul( 6.2 ).add( 0.5 ) );
	const b = color.mul( color.mul( 6.2 ).add( 1.7 ) ).add( 0.06 );

	return a.div( b ).pow( 2.2 );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
const RRTAndODTFit = tslFn( ( { color } ) => {

	const a = color.mul( color.add( 0.0245786 ) ).sub( 0.000090537 );
	const b = color.mul( color.add( 0.4329510 ).mul( 0.983729 ) ).add( 0.238081 );

	return a.div( b );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
const ACESFilmicToneMappingNode = tslFn( ( { color, exposure } ) => {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const ACESInputMat = mat3(
		0.59719, 0.35458, 0.04823,
		0.07600, 0.90834, 0.01566,
		0.02840, 0.13383, 0.83777
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const ACESOutputMat = mat3(
		1.60475, - 0.53108, - 0.07367,
		- 0.10208, 1.10813, - 0.00605,
		- 0.00327, - 0.07276, 1.07602
	);

	color = color.mul( exposure ).div( 0.6 );

	color = ACESInputMat.mul( color );

	// Apply RRT and ODT
	color = RRTAndODTFit( { color } );

	color = ACESOutputMat.mul( color );

	// Clamp to [0, 1]
	return color.clamp();

} );



const LINEAR_REC2020_TO_LINEAR_SRGB = mat3( vec3( 1.6605, - 0.1246, - 0.0182 ), vec3( - 0.5876, 1.1329, - 0.1006 ), vec3( - 0.0728, - 0.0083, 1.1187 ) );
const LINEAR_SRGB_TO_LINEAR_REC2020 = mat3( vec3( 0.6274, 0.0691, 0.0164 ), vec3( 0.3293, 0.9195, 0.0880 ), vec3( 0.0433, 0.0113, 0.8956 ) );

const agxDefaultContrastApprox = tslFn( ( [ x_immutable ] ) => {

	const x = vec3( x_immutable ).toVar();
	const x2 = vec3( x.mul( x ) ).toVar();
	const x4 = vec3( x2.mul( x2 ) ).toVar();

	return float( 15.5 ).mul( x4.mul( x2 ) ).sub( mul( 40.14, x4.mul( x ) ) ).add( mul( 31.96, x4 ).sub( mul( 6.868, x2.mul( x ) ) ).add( mul( 0.4298, x2 ).add( mul( 0.1191, x ).sub( 0.00232 ) ) ) );

} );

const AGXToneMappingNode = tslFn( ( { color, exposure } ) => {

	const colortone = vec3( color ).toVar();
	const AgXInsetMatrix = mat3( vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ), vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ), vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 ) );
	const AgXOutsetMatrix = mat3( vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ), vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ), vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 ) );
	const AgxMinEv = float( - 12.47393 );
	const AgxMaxEv = float( 4.026069 );
	colortone.mulAssign( exposure );
	colortone.assign( LINEAR_SRGB_TO_LINEAR_REC2020.mul( colortone ) );
	colortone.assign( AgXInsetMatrix.mul( colortone ) );
	colortone.assign( max$1( colortone, 1e-10 ) );
	colortone.assign( log2( colortone ) );
	colortone.assign( colortone.sub( AgxMinEv ).div( AgxMaxEv.sub( AgxMinEv ) ) );
	colortone.assign( clamp( colortone, 0.0, 1.0 ) );
	colortone.assign( agxDefaultContrastApprox( colortone ) );
	colortone.assign( AgXOutsetMatrix.mul( colortone ) );
	colortone.assign( pow( max$1( vec3( 0.0 ), colortone ), vec3( 2.2 ) ) );
	colortone.assign( LINEAR_REC2020_TO_LINEAR_SRGB.mul( colortone ) );
	colortone.assign( clamp( colortone, 0.0, 1.0 ) );

	return colortone;

} );


const toneMappingLib = {
	[ LinearToneMapping ]: LinearToneMappingNode,
	[ ReinhardToneMapping ]: ReinhardToneMappingNode,
	[ CineonToneMapping ]: OptimizedCineonToneMappingNode,
	[ ACESFilmicToneMapping ]: ACESFilmicToneMappingNode,
	[ AgXToneMapping ]: AGXToneMappingNode
};

class ToneMappingNode extends TempNode {

	constructor( toneMapping = NoToneMapping, exposureNode = float( 1 ), colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	getCacheKey() {

		let cacheKey = super.getCacheKey();
		cacheKey = '{toneMapping:' + this.toneMapping + ',nodes:' + cacheKey + '}';

		return cacheKey;

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		const toneMappingParams = { exposure: this.exposureNode, color: colorNode };
		const toneMappingNode = toneMappingLib[ toneMapping ];

		let outputNode = null;

		if ( toneMappingNode ) {

			outputNode = toneMappingNode( toneMappingParams );

		} else {

			console.error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );

addNodeClass( 'ToneMappingNode', ToneMappingNode );

let _sharedFramebuffer = null;

class ViewportSharedTextureNode extends ViewportTextureNode {

	constructor( uvNode = viewportTopLeft, levelNode = null ) {

		if ( _sharedFramebuffer === null ) {

			_sharedFramebuffer = new FramebufferTexture();

		}

		super( uvNode, levelNode, _sharedFramebuffer );

	}

}

const viewportSharedTexture = nodeProxy( ViewportSharedTextureNode );

addNodeElement( 'viewportSharedTexture', viewportSharedTexture );

addNodeClass( 'ViewportSharedTextureNode', ViewportSharedTextureNode );

class PassTextureNode extends TextureNode {

	constructor( passNode, texture ) {

		super( texture );

		this.passNode = passNode;

		this.setUpdateMatrix( false );

	}

	setup( builder ) {

		this.passNode.build( builder );

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.value );

	}

}

class PassNode extends TempNode {

	constructor( scope, scene, camera ) {

		super( 'vec4' );

		this.scope = scope;
		this.scene = scene;
		this.camera = camera;

		this._pixelRatio = 1;
		this._width = 1;
		this._height = 1;

		const depthTexture = new DepthTexture();
		depthTexture.isRenderTargetTexture = true;
		//depthTexture.type = FloatType;
		depthTexture.name = 'PostProcessingDepth';

		const renderTarget = new RenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType } );
		renderTarget.texture.name = 'PostProcessing';
		renderTarget.depthTexture = depthTexture;

		this.renderTarget = renderTarget;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._textureNode = nodeObject( new PassTextureNode( this, renderTarget.texture ) );
		this._depthTextureNode = nodeObject( new PassTextureNode( this, depthTexture ) );

		this._depthNode = null;
		this._cameraNear = uniform( 0 );
		this._cameraFar = uniform( 0 );

		this.isPassNode = true;

	}

	isGlobal() {

		return true;

	}

	getTextureNode() {

		return this._textureNode;

	}

	getTextureDepthNode() {

		return this._depthTextureNode;

	}

	getDepthNode() {

		if ( this._depthNode === null ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			this._depthNode = viewZToOrthographicDepth( perspectiveDepthToViewZ( this._depthTextureNode, cameraNear, cameraFar ), cameraNear, cameraFar );

		}

		return this._depthNode;

	}

	setup() {

		return this.scope === PassNode.COLOR ? this.getTextureNode() : this.getDepthNode();

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		this._pixelRatio = renderer.getPixelRatio();

		const size = renderer.getSize( new Vector2() );

		this.setSize( size.width, size.height );

		const currentToneMapping = renderer.toneMapping;
		const currentToneMappingNode = renderer.toneMappingNode;
		const currentRenderTarget = renderer.getRenderTarget();

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		renderer.toneMapping = NoToneMapping;
		renderer.toneMappingNode = null;
		renderer.setRenderTarget( this.renderTarget );

		renderer.render( scene, camera );

		renderer.toneMapping = currentToneMapping;
		renderer.toneMappingNode = currentToneMappingNode;
		renderer.setRenderTarget( currentRenderTarget );

	}

	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget.setSize( effectiveWidth, effectiveHeight );

	}

	setPixelRatio( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

	dispose() {

		this.renderTarget.dispose();

	}


}

PassNode.COLOR = 'color';
PassNode.DEPTH = 'depth';
const texturePass = ( pass, texture ) => nodeObject( new PassTextureNode( pass, texture ) );

addNodeClass( 'PassNode', PassNode );

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

class QuadGeometry extends BufferGeometry {

	constructor( flipY = false ) {

		super();

		const uv = flipY === false ? [ 0, - 1, 0, 1, 2, 1 ] : [ 0, 2, 0, 0, 2, 0 ];

		this.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

	}

}

const _geometry = new QuadGeometry();

class QuadMesh {

	constructor( material = null ) {

		this._mesh = new Mesh( _geometry, material );

	}

	dispose() {

		this._mesh.geometry.dispose();

	}

	async renderAsync( renderer ) {

		await renderer.renderAsync( this._mesh, _camera );

	}

	get material() {

		return this._mesh.material;

	}

	set material( value ) {

		this._mesh.material = value;

	}

	get render() {

		return this.renderAsync;

	}

}

// WebGPU: The use of a single QuadMesh for both gaussian blur passes results in a single RenderObject with a SampledTexture binding that
// alternates between source textures and triggers creation of new BindGroups and BindGroupLayouts every frame.

const quadMesh1 = new QuadMesh();
const quadMesh2 = new QuadMesh();

class GaussianBlurNode extends TempNode {

	constructor( textureNode, sigma = 2 ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.sigma = sigma;

		this.directionNode = vec2( 1 );

		this._invSize = uniform( new Vector2() );
		this._passDirection = uniform( new Vector2() );

		this._horizontalRT = new RenderTarget();
		this._horizontalRT.texture.name = 'GaussianBlurNode.horizontal';
		this._verticalRT = new RenderTarget();
		this._verticalRT.texture.name = 'GaussianBlurNode.vertical';

		this._textureNode = texturePass( this, this._verticalRT.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

		this.resolution = new Vector2( 1, 1 );

	}

	setSize( width, height ) {

		width = Math.max( Math.round( width * this.resolution.x ), 1 );
		height = Math.max( Math.round( height * this.resolution.y ), 1 );

		this._invSize.value.set( 1 / width, 1 / height );
		this._horizontalRT.setSize( width, height );
		this._verticalRT.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = textureNode.value;

		quadMesh1.material = this._material;
		quadMesh2.material = this._material;

		this.setSize( map.image.width, map.image.height );

		const textureType = map.type;

		this._horizontalRT.texture.type = textureType;
		this._verticalRT.texture.type = textureType;

		// horizontal

		renderer.setRenderTarget( this._horizontalRT );

		this._passDirection.value.set( 1, 0 );

		quadMesh1.render( renderer );

		// vertical

		textureNode.value = this._horizontalRT.texture;
		renderer.setRenderTarget( this._verticalRT );

		this._passDirection.value.set( 0, 1 );

		quadMesh2.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		textureNode.value = currentTexture;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setup( builder ) {

		const textureNode = this.textureNode;

		if ( textureNode.isTextureNode !== true ) {

			console.error( 'GaussianBlurNode requires a TextureNode.' );

			return vec4();

		}

		//

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

		const blur = tslFn( () => {

			const kernelSize = 3 + ( 2 * this.sigma );
			const gaussianCoefficients = this._getCoefficients( kernelSize );

			const invSize = this._invSize;
			const direction = vec2( this.directionNode ).mul( this._passDirection );

			const weightSum = float( gaussianCoefficients[ 0 ] ).toVar();
			const diffuseSum = vec4( sampleTexture( uvNode ).mul( weightSum ) ).toVar();

			for ( let i = 1; i < kernelSize; i ++ ) {

				const x = float( i );
				const w = float( gaussianCoefficients[ i ] );

				const uvOffset = vec2( direction.mul( invSize.mul( x ) ) ).toVar();

				const sample1 = vec4( sampleTexture( uvNode.add( uvOffset ) ) );
				const sample2 = vec4( sampleTexture( uvNode.sub( uvOffset ) ) );

				diffuseSum.addAssign( sample1.add( sample2 ).mul( w ) );
				weightSum.addAssign( mul( 2.0, w ) );

			}

			return diffuseSum.div( weightSum );

		} );

		//

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = blur();

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

	_getCoefficients( kernelRadius ) {

		const coefficients = [];

		for ( let i = 0; i < kernelRadius; i ++ ) {

			coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( kernelRadius * kernelRadius ) ) / kernelRadius );

		}

		return coefficients;

	}

}

const gaussianBlur = ( node, sigma ) => nodeObject( new GaussianBlurNode( nodeObject( node ), sigma ) );

addNodeElement( 'gaussianBlur', gaussianBlur );

const quadMeshComp = new QuadMesh();

class AfterImageNode extends TempNode {

	constructor( textureNode, damp = 0.96 ) {

		super( textureNode );

		this.textureNode = textureNode;
		this.textureNodeOld = texture();
		this.damp = uniform( damp );

		this._compRT = new RenderTarget();
		this._compRT.texture.name = 'AfterImageNode.comp';

		this._oldRT = new RenderTarget();
		this._oldRT.texture.name = 'AfterImageNode.old';

		this._textureNode = texturePass( this, this._compRT.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._compRT.setSize( width, height );
		this._oldRT.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const textureType = map.type;

		this._compRT.texture.type = textureType;
		this._oldRT.texture.type = textureType;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = textureNode.value;

		this.textureNodeOld.value = this._oldRT.texture;

		// comp
		renderer.setRenderTarget( this._compRT );
		quadMeshComp.render( renderer );

		// Swap the textures
		const temp = this._oldRT;
		this._oldRT = this._compRT;
		this._compRT = temp;

		// set size before swapping fails
		this.setSize( map.image.width, map.image.height );

		renderer.setRenderTarget( currentRenderTarget );
		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const textureNode = this.textureNode;
		const textureNodeOld = this.textureNodeOld;

		if ( textureNode.isTextureNode !== true ) {

			console.error( 'AfterImageNode requires a TextureNode.' );

			return vec4();

		}

		//

		const uvNode = textureNode.uvNode || uv();

		textureNodeOld.uvNode = uvNode;

		const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

		const when_gt = tslFn( ( [ x_immutable, y_immutable ] ) => {

			const y = float( y_immutable ).toVar();
			const x = vec4( x_immutable ).toVar();

			return max$1( sign( x.sub( y ) ), 0.0 );

		} );

		const afterImg = tslFn( () => {

			const texelOld = vec4( textureNodeOld );
			const texelNew = vec4( sampleTexture( uvNode ) );

			texelOld.mulAssign( this.damp.mul( when_gt( texelOld, 0.1 ) ) );
			return max$1( texelNew, texelOld );

		} );

		//

		const materialComposed = this._materialComposed || ( this._materialComposed = builder.createNodeMaterial() );
		materialComposed.fragmentNode = afterImg();

		quadMeshComp.material = materialComposed;

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

}

const afterImage = ( node, damp ) => nodeObject( new AfterImageNode( nodeObject( node ), damp ) );

addNodeElement( 'afterImage', afterImage );

const quadMesh = new QuadMesh();

class AnamorphicNode extends TempNode {

	constructor( textureNode, tresholdNode, scaleNode, samples ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.tresholdNode = tresholdNode;
		this.scaleNode = scaleNode;
		this.colorNode = vec3( 0.1, 0.0, 1.0 );
		this.samples = samples;
		this.resolution = new Vector2( 1, 1 );

		this._renderTarget = new RenderTarget();
		this._renderTarget.texture.name = 'anamorphic';

		this._invSize = uniform( new Vector2() );

		this._textureNode = texturePass( this, this._renderTarget.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this._invSize.value.set( 1 / width, 1 / height );

		width = Math.max( Math.round( width * this.resolution.x ), 1 );
		height = Math.max( Math.round( height * this.resolution.y ), 1 );

		this._renderTarget.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const textureNode = this.textureNode;
		const map = textureNode.value;

		this._renderTarget.texture.type = map.type;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentTexture = textureNode.value;

		quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );

		// render

		renderer.setRenderTarget( this._renderTarget );

		quadMesh.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const textureNode = this.textureNode;

		if ( textureNode.isTextureNode !== true ) {

			console.error( 'AnamorphNode requires a TextureNode.' );

			return vec4();

		}

		//

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

		const anamorph = tslFn( () => {

			const samples = this.samples;
			const halfSamples = Math.floor( samples / 2 );

			const total = vec3( 0 ).toVar();

			loop( { start: - halfSamples, end: halfSamples }, ( { i } ) => {

				const softness = float( i ).abs().div( halfSamples ).oneMinus();

				const uv = vec2( uvNode.x.add( this._invSize.x.mul( i ).mul( this.scaleNode ) ), uvNode.y );
				const color = sampleTexture( uv );
				const pass = threshold( color, this.tresholdNode ).mul( softness );

				total.addAssign( pass );

			} );

			return total.mul( this.colorNode );

		} );

		//

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = anamorph();

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

	}

}

const anamorphic = ( node, threshold = .9, scale = 3, samples = 32 ) => nodeObject( new AnamorphicNode( nodeObject( node ), nodeObject( threshold ), nodeObject( scale ), samples ) );

addNodeElement( 'anamorphic', anamorphic );

class FunctionCallNode extends TempNode {

	constructor( functionNode = null, parameters = {} ) {

		super();

		this.functionNode = functionNode;
		this.parameters = parameters;

	}

	setParameters( parameters ) {

		this.parameters = parameters;

		return this;

	}

	getParameters() {

		return this.parameters;

	}

	getNodeType( builder ) {

		return this.functionNode.getNodeType( builder );

	}

	generate( builder ) {

		const params = [];

		const functionNode = this.functionNode;

		const inputs = functionNode.getInputs( builder );
		const parameters = this.parameters;

		if ( Array.isArray( parameters ) ) {

			for ( let i = 0; i < parameters.length; i ++ ) {

				const inputNode = inputs[ i ];
				const node = parameters[ i ];

				params.push( node.build( builder, inputNode.type ) );

			}

		} else {

			for ( const inputNode of inputs ) {

				const node = parameters[ inputNode.name ];

				if ( node !== undefined ) {

					params.push( node.build( builder, inputNode.type ) );

				} else {

					throw new Error( `FunctionCallNode: Input '${inputNode.name}' not found in FunctionNode.` );

				}

			}

		}

		const functionName = functionNode.build( builder, 'property' );

		return `${functionName}( ${params.join( ', ' )} )`;

	}

}

const call = ( func, ...params ) => {

	params = params.length > 1 || ( params[ 0 ] && params[ 0 ].isNode === true ) ? nodeArray( params ) : nodeObjects( params[ 0 ] );

	return nodeObject( new FunctionCallNode( nodeObject( func ), params ) );

};

addNodeElement( 'call', call );

addNodeClass( 'FunctionCallNode', FunctionCallNode );

class ScriptableValueNode extends Node {

	constructor( value = null ) {

		super();

		this._value = value;
		this._cache = null;

		this.inputType = null;
		this.outpuType = null;

		this.events = new EventDispatcher();

		this.isScriptableValueNode = true;

	}

	get isScriptableOutputNode() {

		return this.outputType !== null;

	}

	set value( val ) {

		if ( this._value === val ) return;

		if ( this._cache && this.inputType === 'URL' && this.value.value instanceof ArrayBuffer ) {

			URL.revokeObjectURL( this._cache );

			this._cache = null;

		}

		this._value = val;

		this.events.dispatchEvent( { type: 'change' } );

		this.refresh();

	}

	get value() {

		return this._value;

	}

	refresh() {

		this.events.dispatchEvent( { type: 'refresh' } );

	}

	getValue() {

		const value = this.value;

		if ( value && this._cache === null && this.inputType === 'URL' && value.value instanceof ArrayBuffer ) {

			this._cache = URL.createObjectURL( new Blob( [ value.value ] ) );

		} else if ( value && value.value !== null && value.value !== undefined && (
			( ( this.inputType === 'URL' || this.inputType === 'String' ) && typeof value.value === 'string' ) ||
			( this.inputType === 'Number' && typeof value.value === 'number' ) ||
			( this.inputType === 'Vector2' && value.value.isVector2 ) ||
			( this.inputType === 'Vector3' && value.value.isVector3 ) ||
			( this.inputType === 'Vector4' && value.value.isVector4 ) ||
			( this.inputType === 'Color' && value.value.isColor ) ||
			( this.inputType === 'Matrix3' && value.value.isMatrix3 ) ||
			( this.inputType === 'Matrix4' && value.value.isMatrix4 )
		) ) {

			return value.value;

		}

		return this._cache || value;

	}

	getNodeType( builder ) {

		return this.value && this.value.isNode ? this.value.getNodeType( builder ) : 'float';

	}

	setup() {

		return this.value && this.value.isNode ? this.value : float();

	}

	serialize( data ) {

		super.serialize( data );

		if ( this.value !== null ) {

			if ( this.inputType === 'ArrayBuffer' ) {

				data.value = arrayBufferToBase64( this.value );

			} else {

				data.value = this.value ? this.value.toJSON( data.meta ).uuid : null;

			}

		} else {

			data.value = null;

		}

		data.inputType = this.inputType;
		data.outputType = this.outputType;

	}

	deserialize( data ) {

		super.deserialize( data );

		let value = null;

		if ( data.value !== null ) {

			if ( data.inputType === 'ArrayBuffer' ) {

				value = base64ToArrayBuffer( data.value );

			} else if ( data.inputType === 'Texture' ) {

				value = data.meta.textures[ data.value ];

			} else {

				value = data.meta.nodes[ data.value ] || null;

			}

		}

		this.value = value;

		this.inputType = data.inputType;
		this.outputType = data.outputType;

	}

}

const scriptableValue = nodeProxy( ScriptableValueNode );

addNodeElement( 'scriptableValue', scriptableValue );

addNodeClass( 'ScriptableValueNode', ScriptableValueNode );

class Resources extends Map {

	get( key, callback = null, ...params ) {

		if ( this.has( key ) ) return super.get( key );

		if ( callback !== null ) {

			const value = callback( ...params );
			this.set( key, value );
			return value;

		}

	}

}

class Parameters {

	constructor( scriptableNode ) {

		this.scriptableNode = scriptableNode;

	}

	get parameters() {

		return this.scriptableNode.parameters;

	}

	get layout() {

		return this.scriptableNode.getLayout();

	}

	getInputLayout( id ) {

		return this.scriptableNode.getInputLayout( id );

	}

	get( name ) {

		const param = this.parameters[ name ];
		const value = param ? param.getValue() : null;

		return value;

	}

}

const global = new Resources();

class ScriptableNode extends Node {

	constructor( codeNode = null, parameters = {} ) {

		super();

		this.codeNode = codeNode;
		this.parameters = parameters;

		this._local = new Resources();
		this._output = scriptableValue();
		this._outputs = {};
		this._source = this.source;
		this._method = null;
		this._object = null;
		this._value = null;
		this._needsOutputUpdate = true;

		this.onRefresh = this.onRefresh.bind( this );

		this.isScriptableNode = true;

	}

	get source() {

		return this.codeNode ? this.codeNode.code : '';

	}

	setLocal( name, value ) {

		return this._local.set( name, value );

	}

	getLocal( name ) {

		return this._local.get( name );

	}

	onRefresh() {

		this._refresh();

	}

	getInputLayout( id ) {

		for ( const element of this.getLayout() ) {

			if ( element.inputType && ( element.id === id || element.name === id ) ) {

				return element;

			}

		}

	}

	getOutputLayout( id ) {

		for ( const element of this.getLayout() ) {

			if ( element.outputType && ( element.id === id || element.name === id ) ) {

				return element;

			}

		}

	}

	setOutput( name, value ) {

		const outputs = this._outputs;

		if ( outputs[ name ] === undefined ) {

			outputs[ name ] = scriptableValue( value );

		} else {

			outputs[ name ].value = value;

		}

		return this;

	}

	getOutput( name ) {

		return this._outputs[ name ];

	}

	getParameter( name ) {

		return this.parameters[ name ];

	}

	setParameter( name, value ) {

		const parameters = this.parameters;

		if ( value && value.isScriptableNode ) {

			this.deleteParameter( name );

			parameters[ name ] = value;
			parameters[ name ].getDefaultOutput().events.addEventListener( 'refresh', this.onRefresh );

		} else if ( value && value.isScriptableValueNode ) {

			this.deleteParameter( name );

			parameters[ name ] = value;
			parameters[ name ].events.addEventListener( 'refresh', this.onRefresh );

		} else if ( parameters[ name ] === undefined ) {

			parameters[ name ] = scriptableValue( value );
			parameters[ name ].events.addEventListener( 'refresh', this.onRefresh );

		} else {

			parameters[ name ].value = value;

		}

		return this;

	}

	getValue() {

		return this.getDefaultOutput().getValue();

	}

	deleteParameter( name ) {

		let valueNode = this.parameters[ name ];

		if ( valueNode ) {

			if ( valueNode.isScriptableNode ) valueNode = valueNode.getDefaultOutput();

			valueNode.events.removeEventListener( 'refresh', this.onRefresh );

		}

		return this;

	}

	clearParameters() {

		for ( const name of Object.keys( this.parameters ) ) {

			this.deleteParameter( name );

		}

		this.needsUpdate = true;

		return this;

	}

	call( name, ...params ) {

		const object = this.getObject();
		const method = object[ name ];

		if ( typeof method === 'function' ) {

			return method( ...params );

		}

	}

	async callAsync( name, ...params ) {

		const object = this.getObject();
		const method = object[ name ];

		if ( typeof method === 'function' ) {

			return method.constructor.name === 'AsyncFunction' ? await method( ...params ) : method( ...params );

		}

	}

	getNodeType( builder ) {

		return this.getDefaultOutputNode().getNodeType( builder );

	}

	refresh( output = null ) {

		if ( output !== null ) {

			this.getOutput( output ).refresh();

		} else {

			this._refresh();

		}

	}

	getObject() {

		if ( this.needsUpdate ) this.dispose();
		if ( this._object !== null ) return this._object;

		//

		const refresh = () => this.refresh();
		const setOutput = ( id, value ) => this.setOutput( id, value );

		const parameters = new Parameters( this );

		const THREE = global.get( 'THREE' );
		const TSL = global.get( 'TSL' );

		const method = this.getMethod( this.codeNode );
		const params = [ parameters, this._local, global, refresh, setOutput, THREE, TSL ];

		this._object = method( ...params );

		const layout = this._object.layout;

		if ( layout ) {

			if ( layout.cache === false ) {

				this._local.clear();

			}

			// default output
			this._output.outputType = layout.outputType || null;

			if ( Array.isArray( layout.elements ) ) {

				for ( const element of layout.elements ) {

					const id = element.id || element.name;

					if ( element.inputType ) {

						if ( this.getParameter( id ) === undefined ) this.setParameter( id, null );

						this.getParameter( id ).inputType = element.inputType;

					}

					if ( element.outputType ) {

						if ( this.getOutput( id ) === undefined ) this.setOutput( id, null );

						this.getOutput( id ).outputType = element.outputType;

					}

				}

			}

		}

		return this._object;

	}

	deserialize( data ) {

		super.deserialize( data );

		for ( const name in this.parameters ) {

			let valueNode = this.parameters[ name ];

			if ( valueNode.isScriptableNode ) valueNode = valueNode.getDefaultOutput();

			valueNode.events.addEventListener( 'refresh', this.onRefresh );

		}

	}

	getLayout() {

		return this.getObject().layout;

	}

	getDefaultOutputNode() {

		const output = this.getDefaultOutput().value;

		if ( output && output.isNode ) {

			return output;

		}

		return float();

	}

	getDefaultOutput()	{

		return this._exec()._output;

	}

	getMethod() {

		if ( this.needsUpdate ) this.dispose();
		if ( this._method !== null ) return this._method;

		//

		const parametersProps = [ 'parameters', 'local', 'global', 'refresh', 'setOutput', 'THREE', 'TSL' ];
		const interfaceProps = [ 'layout', 'init', 'main', 'dispose' ];

		const properties = interfaceProps.join( ', ' );
		const declarations = 'var ' + properties + '; var output = {};\n';
		const returns = '\nreturn { ...output, ' + properties + ' };';

		const code = declarations + this.codeNode.code + returns;

		//

		this._method = new Function( ...parametersProps, code );

		return this._method;

	}

	dispose() {

		if ( this._method === null ) return;

		if ( this._object && typeof this._object.dispose === 'function' ) {

			this._object.dispose();

		}

		this._method = null;
		this._object = null;
		this._source = null;
		this._value = null;
		this._needsOutputUpdate = true;
		this._output.value = null;
		this._outputs = {};

	}

	setup() {

		return this.getDefaultOutputNode();

	}

	set needsUpdate( value ) {

		if ( value === true ) this.dispose();

	}

	get needsUpdate() {

		return this.source !== this._source;

	}

	_exec()	{

		if ( this.codeNode === null ) return this;

		if ( this._needsOutputUpdate === true ) {

			this._value = this.call( 'main' );

			this._needsOutputUpdate = false;

		}

		this._output.value = this._value;

		return this;

	}

	_refresh() {

		this.needsUpdate = true;

		this._exec();

		this._output.refresh();

	}

}

const scriptable = nodeProxy( ScriptableNode );

addNodeElement( 'scriptable', scriptable );

addNodeClass( 'ScriptableNode', ScriptableNode );

class FogNode extends Node {

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.isFogNode = true;

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	mixAssign( outputNode ) {

		return mix( outputNode, this.colorNode, this );

	}

	setup() {

		return this.factorNode;

	}

}

const fog = nodeProxy( FogNode );

addNodeElement( 'fog', fog );

addNodeClass( 'FogNode', FogNode );

class FogRangeNode extends FogNode {

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.isFogRangeNode = true;

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	setup() {

		return smoothstep( this.nearNode, this.farNode, positionView.z.negate() );

	}

}

const rangeFog = nodeProxy( FogRangeNode );

addNodeElement( 'rangeFog', rangeFog );

addNodeClass( 'FogRangeNode', FogRangeNode );

class FogExp2Node extends FogNode {

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	setup() {

		const depthNode = positionView.z.negate();
		const densityNode = this.densityNode;

		return densityNode.mul( densityNode, depthNode, depthNode ).negate().exp().oneMinus();

	}

}

const densityFog = nodeProxy( FogExp2Node );

addNodeElement( 'densityFog', densityFog );

addNodeClass( 'FogExp2Node', FogExp2Node );

let min = null;
let max = null;

class RangeNode extends Node {

	constructor( minNode = float(), maxNode = float() ) {

		super();

		this.minNode = minNode;
		this.maxNode = maxNode;

	}

	getVectorLength( builder ) {

		const minLength = builder.getTypeLength( getValueType( this.minNode.value ) );
		const maxLength = builder.getTypeLength( getValueType( this.maxNode.value ) );

		return minLength > maxLength ? minLength : maxLength;

	}

	getNodeType( builder ) {

		return builder.object.isInstancedMesh === true ? builder.getTypeFromLength( this.getVectorLength( builder ) ) : 'float';

	}

	setup( builder ) {

		const object = builder.object;

		let output = null;

		if ( object.isInstancedMesh === true ) {

			const minValue = this.minNode.value;
			const maxValue = this.maxNode.value;

			const minLength = builder.getTypeLength( getValueType( minValue ) );
			const maxLength = builder.getTypeLength( getValueType( maxValue ) );

			min = min || new Vector4();
			max = max || new Vector4();

			min.setScalar( 0 );
			max.setScalar( 0 );

			if ( minLength === 1 ) min.setScalar( minValue );
			else if ( minValue.isColor ) min.set( minValue.r, minValue.g, minValue.b );
			else min.set( minValue.x, minValue.y, minValue.z || 0, minValue.w || 0 );

			if ( maxLength === 1 ) max.setScalar( maxValue );
			else if ( maxValue.isColor ) max.set( maxValue.r, maxValue.g, maxValue.b );
			else max.set( maxValue.x, maxValue.y, maxValue.z || 0, maxValue.w || 0 );

			const stride = 4;

			const length = stride * object.count;
			const array = new Float32Array( length );

			for ( let i = 0; i < length; i ++ ) {

				const index = i % stride;

				const minElementValue = min.getComponent( index );
				const maxElementValue = max.getComponent( index );

				array[ i ] = MathUtils.lerp( minElementValue, maxElementValue, Math.random() );

			}

			const nodeType = this.getNodeType( builder );

			output = buffer( array, 'vec4', object.count ).element( instanceIndex ).convert( nodeType );
			//output = bufferAttribute( array, 'vec4', 4, 0 ).convert( nodeType );

		} else {

			output = float( 0 );

		}

		return output;

	}

}

nodeProxy( RangeNode );

addNodeClass( 'RangeNode', RangeNode );

class ComputeNode extends Node {

	constructor( computeNode, count, workgroupSize = [ 64 ] ) {

		super( 'void' );

		this.isComputeNode = true;

		this.computeNode = computeNode;

		this.count = count;
		this.workgroupSize = workgroupSize;
		this.dispatchCount = 0;

		this.version = 1;
		this.updateBeforeType = NodeUpdateType.OBJECT;

		this.updateDispatchCount();

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	updateDispatchCount() {

		const { count, workgroupSize } = this;

		let size = workgroupSize[ 0 ];

		for ( let i = 1; i < workgroupSize.length; i ++ )
			size *= workgroupSize[ i ];

		this.dispatchCount = Math.ceil( count / size );

	}

	onInit() { }

	updateBefore( { renderer } ) {

		renderer.compute( this );

	}

	generate( builder ) {

		const { shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			const snippet = this.computeNode.build( builder, 'void' );

			if ( snippet !== '' ) {

				builder.addLineFlowCode( snippet );

			}

		}

	}

}

const compute = ( node, count, workgroupSize ) => nodeObject( new ComputeNode( nodeObject( node ), count, workgroupSize ) );

addNodeElement( 'compute', compute );

addNodeClass( 'ComputeNode', ComputeNode );

class LightNode extends Node {

	constructor( scope = LightNode.TARGET_DIRECTION, light = null ) {

		super();

		this.scope = scope;
		this.light = light;

	}

	setup() {

		const { scope, light } = this;

		let output = null;

		if ( scope === LightNode.TARGET_DIRECTION ) {

			output = cameraViewMatrix.transformDirection( objectPosition( light ).sub( objectPosition( light.target ) ) );

		}

		return output;

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

LightNode.TARGET_DIRECTION = 'targetDirection';

const lightTargetDirection = nodeProxy( LightNode, LightNode.TARGET_DIRECTION );

addNodeClass( 'LightNode', LightNode );

const getDistanceAttenuation = tslFn( ( inputs ) => {

	const { lightDistance, cutoffDistance, decayExponent } = inputs;

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	const distanceFalloff = lightDistance.pow( decayExponent ).max( 0.01 ).reciprocal();

	return cutoffDistance.greaterThan( 0 ).cond(
		distanceFalloff.mul( lightDistance.div( cutoffDistance ).pow4().oneMinus().clamp().pow2() ),
		distanceFalloff
	);

} ); // validated

class PointLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.cutoffDistanceNode = uniform( 0 );
		this.decayExponentNode = uniform( 0 );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	setup( builder ) {

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lightingModel = builder.context.lightingModel;

		const lVector = objectViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

		const lightDirection = lVector.normalize();
		const lightDistance = lVector.length();

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		const lightColor = colorNode.mul( lightAttenuation );

		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

addNodeClass( 'PointLightNode', PointLightNode );

addLightNode( PointLight, PointLightNode );

class DirectionalLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	setup( builder ) {

		super.setup( builder );

		const lightingModel = builder.context.lightingModel;

		const lightColor = this.colorNode;
		const lightDirection = lightTargetDirection( this.light );
		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

addNodeClass( 'DirectionalLightNode', DirectionalLightNode );

addLightNode( DirectionalLight, DirectionalLightNode );

class SpotLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.coneCosNode = uniform( 0 );
		this.penumbraCosNode = uniform( 0 );

		this.cutoffDistanceNode = uniform( 0 );
		this.decayExponentNode = uniform( 0 );

	}

	update( frame ) {

		super.update( frame );

		const { light } = this;

		this.coneCosNode.value = Math.cos( light.angle );
		this.penumbraCosNode.value = Math.cos( light.angle * ( 1 - light.penumbra ) );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	getSpotAttenuation( angleCosine ) {

		const { coneCosNode, penumbraCosNode } = this;

		return smoothstep( coneCosNode, penumbraCosNode, angleCosine );

	}

	setup( builder ) {

		super.setup( builder );

		const lightingModel = builder.context.lightingModel;

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lVector = objectViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

		const lightDirection = lVector.normalize();
		const angleCos = lightDirection.dot( lightTargetDirection( light ) );
		const spotAttenuation = this.getSpotAttenuation( angleCos );

		const lightDistance = lVector.length();

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		const lightColor = colorNode.mul( spotAttenuation ).mul( lightAttenuation );

		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

addNodeClass( 'SpotLightNode', SpotLightNode );

addLightNode( SpotLight, SpotLightNode );

class IESSpotLight extends SpotLight {

	constructor( color, intensity, distance, angle, penumbra, decay ) {

		super( color, intensity, distance, angle, penumbra, decay );

		this.iesMap = null;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.iesMap = source.iesMap;

		return this;

	}

}

class IESSpotLightNode extends SpotLightNode {

	getSpotAttenuation( angleCosine ) {

		const iesMap = this.light.iesMap;

		let spotAttenuation = null;

		if ( iesMap && iesMap.isTexture === true ) {

			const angle = angleCosine.acos().mul( 1.0 / Math.PI );

			spotAttenuation = texture( iesMap, vec2( angle, 0 ), 0 ).r;

		} else {

			spotAttenuation = super.getSpotAttenuation( angleCosine );

		}

		return spotAttenuation;

	}

}

addNodeClass( 'IESSpotLightNode', IESSpotLightNode );

addLightNode( IESSpotLight, IESSpotLightNode );

class AmbientLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	setup( { context } ) {

		context.irradiance.addAssign( this.colorNode );

	}

}

addNodeClass( 'AmbientLightNode', AmbientLightNode );

addLightNode( AmbientLight, AmbientLightNode );

class HemisphereLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.lightPositionNode = objectPosition( light );
		this.lightDirectionNode = this.lightPositionNode.normalize();

		this.groundColorNode = uniform( new Color() );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.lightPositionNode.object3d = light;

		this.groundColorNode.value.copy( light.groundColor ).multiplyScalar( light.intensity );

	}

	setup( builder ) {

		const { colorNode, groundColorNode, lightDirectionNode } = this;

		const dotNL = normalView.dot( lightDirectionNode );
		const hemiDiffuseWeight = dotNL.mul( 0.5 ).add( 0.5 );

		const irradiance = mix( groundColorNode, colorNode, hemiDiffuseWeight );

		builder.context.irradiance.addAssign( irradiance );

	}

}

addNodeClass( 'HemisphereLightNode', HemisphereLightNode );

addLightNode( HemisphereLight, HemisphereLightNode );

const checkerShaderNode = tslFn( ( inputs ) => {

	const uv = inputs.uv.mul( 2.0 );

	const cx = uv.x.floor();
	const cy = uv.y.floor();
	const result = cx.add( cy ).mod( 2.0 );

	return result.sign();

} );

class CheckerNode extends TempNode {

	constructor( uvNode = uv() ) {

		super( 'float' );

		this.uvNode = uvNode;

	}

	setup() {

		return checkerShaderNode( { uv: this.uvNode } );

	}

}

const checker = nodeProxy( CheckerNode );

addNodeElement( 'checker', checker );

addNodeClass( 'CheckerNode', CheckerNode );

const defaultValues$b = new PointsMaterial();

class InstancedPointsNodeMaterial extends NodeMaterial {

	constructor( params = {} ) {

		super();

		this.normals = false;

		this.lights = false;

		this.useAlphaToCoverage = true;

		this.useColor = params.vertexColors;

		this.pointWidth = 1;

		this.pointColorNode = null;

		this.setDefaultValues( defaultValues$b );

		this.setupShaders();

		this.setValues( params );

	}

	setupShaders() {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;

		this.vertexNode = tslFn( () => {

			//vUv = uv;
			varying( vec2(), 'vUv' ).assign( uv() ); // @TODO: Analyze other way to do this

			const instancePosition = attribute( 'instancePosition' );

			// camera space
			const mvPos = property( 'vec4', 'mvPos' );
			mvPos.assign( modelViewMatrix.mul( vec4( instancePosition, 1.0 ) ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPos );

			// offset in ndc space
			const offset = property( 'vec2', 'offset' );
			offset.assign( positionGeometry.xy );
			offset.assign( offset.mul( materialPointWidth ) );
			offset.assign( offset.div( viewport.z ) );
			offset.y.assign( offset.y.mul( aspect ) );

			// back to clip space
			offset.assign( offset.mul( clipPos.w ) );

			//clipPos.xy += offset;
			clipPos.assign( clipPos.add( vec4( offset, 0, 0 ) ) );

			return clipPos;

			//vec4 mvPosition = mvPos; // this was used for somethihng...

		} )();

		this.fragmentNode = tslFn( () => {

			const vUv = varying( vec2(), 'vUv' );

			// force assignment into correct place in flow
			const alpha = property( 'float', 'alpha' );
			alpha.assign( 1 );

			const a = vUv.x;
			const b = vUv.y;

			const len2 = a.mul( a ).add( b.mul( b ) );

			if ( useAlphaToCoverage ) {

				// force assignment out of following 'if' statement - to avoid uniform control flow errors
				const dlen = property( 'float', 'dlen' );
				dlen.assign( len2.fwidth() );

				alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

			} else {

				len2.greaterThan( 1.0 ).discard();

			}

			let pointColorNode;

			if ( this.pointColorNode ) {

				pointColorNode = this.pointColorNode;

			} else {

				if ( useColor ) {

					const instanceColor = attribute( 'instanceColor' );

					pointColorNode = instanceColor.mul( materialColor );

				} else {

					pointColorNode = materialColor;

				}

			}

			return vec4( pointColorNode, alpha );

		} )();

		this.needsUpdate = true;

	}

	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.setupShaders();

		}

	}

}

addNodeMaterial( 'InstancedPointsNodeMaterial', InstancedPointsNodeMaterial );

const defaultValues$a = new LineBasicMaterial();

class LineBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isLineBasicNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.setDefaultValues( defaultValues$a );

		this.setValues( parameters );

	}

}

addNodeMaterial( 'LineBasicNodeMaterial', LineBasicNodeMaterial );

const defaultValues$9 = new LineDashedMaterial();

class LineDashedNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isLineDashedNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.setDefaultValues( defaultValues$9 );

		this.offsetNode = null;
		this.dashScaleNode = null;
		this.dashSizeNode = null;
		this.gapSizeNode = null;

		this.setValues( parameters );

	}

	setupVariants() {

		const offsetNode = this.offsetNode;
		const dashScaleNode = this.dashScaleNode ? float( this.dashScaleNode ) : materialLineScale;
		const dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
		const gapSizeNode = this.dashSizeNode ? float( this.dashGapNode ) : materialLineGapSize;

		dashSize.assign( dashSizeNode );
		gapSize.assign( gapSizeNode );

		const vLineDistance = varying( attribute( 'lineDistance' ).mul( dashScaleNode ) );
		const vLineDistanceOffset = offsetNode ? vLineDistance.add( offsetNode ) : vLineDistance;

		vLineDistanceOffset.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard();

	}

}

addNodeMaterial( 'LineDashedNodeMaterial', LineDashedNodeMaterial );

const defaultValues$8 = new LineDashedMaterial();

class Line2NodeMaterial extends NodeMaterial {

	constructor( params = {} ) {

		super();

		this.normals = false;
		this.lights = false;

		this.setDefaultValues( defaultValues$8 );

		this.useAlphaToCoverage = true;
		this.useColor = params.vertexColors;
		this.useDash = params.dashed;
		this.useWorldUnits = false;

		this.dashOffset = 0;
		this.lineWidth = 1;

		this.lineColorNode = null;

		this.offsetNode = null;
		this.dashScaleNode = null;
		this.dashSizeNode = null;
		this.gapSizeNode = null;

		this.setupShaders();

		this.setValues( params );

	}

	setupShaders() {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;
		const useDash = this.dashed;
		const useWorldUnits = this.worldUnits;

		const trimSegment = tslFn( ( { start, end } ) => {

			const a = cameraProjectionMatrix.element( 2 ).element( 2 ); // 3nd entry in 3th column
			const b = cameraProjectionMatrix.element( 3 ).element( 2 ); // 3nd entry in 4th column
			const nearEstimate = b.mul( - 0.5 ).div( a );

			const alpha = nearEstimate.sub( start.z ).div( end.z.sub( start.z ) );

			return vec4( mix( start.xyz, end.xyz, alpha ), end.w );

		} );

		this.vertexNode = tslFn( () => {

			varyingProperty( 'vec2', 'vUv' ).assign( uv() );

			const instanceStart = attribute( 'instanceStart' );
			const instanceEnd = attribute( 'instanceEnd' );

			// camera space

			const start = property( 'vec4', 'start' );
			const end = property( 'vec4', 'end' );

			start.assign( modelViewMatrix.mul( vec4( instanceStart, 1.0 ) ) ); // force assignment into correct place in flow
			end.assign( modelViewMatrix.mul( vec4( instanceEnd, 1.0 ) ) );

			if ( useWorldUnits ) {

				varyingProperty( 'vec3', 'worldStart' ).assign( start.xyz );
				varyingProperty( 'vec3', 'worldEnd' ).assign( end.xyz );

			}

			const aspect = viewport.z.div( viewport.w );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			const perspective = cameraProjectionMatrix.element( 2 ).element( 3 ).equal( - 1.0 ); // 4th entry in the 3rd column

			If( perspective, () => {

				If( start.z.lessThan( 0.0 ).and( end.z.greaterThan( 0.0 ) ), () => {

					end.assign( trimSegment( { start: start, end: end } ) );

				} ).elseif( end.z.lessThan( 0.0 ).and( start.z.greaterThanEqual( 0.0 ) ), () => {

					start.assign( trimSegment( { start: end, end: start } ) );

			 	} );

			} );

			// clip space
			const clipStart = cameraProjectionMatrix.mul( start );
			const clipEnd = cameraProjectionMatrix.mul( end );

			// ndc space
			const ndcStart = clipStart.xyz.div( clipStart.w );
			const ndcEnd = clipEnd.xyz.div( clipEnd.w );

			// direction
			const dir = ndcEnd.xy.sub( ndcStart.xy ).temp();

			// account for clip-space aspect ratio
			dir.x.assign( dir.x.mul( aspect ) );
			dir.assign( dir.normalize() );

			const clip = temp( vec4() );

			if ( useWorldUnits ) {

				// get the offset direction as perpendicular to the view vector

				const worldDir = end.xyz.sub( start.xyz ).normalize();
				const tmpFwd = mix( start.xyz, end.xyz, 0.5 ).normalize();
				const worldUp = worldDir.cross( tmpFwd ).normalize();
				const worldFwd = worldDir.cross( worldUp );

				const worldPos = varyingProperty( 'vec4', 'worldPos' );

				worldPos.assign( positionGeometry.y.lessThan( 0.5 ).cond( start, end) );

				// height offset
				const hw = materialLineWidth.mul( 0.5 );
				worldPos.addAssign( vec4( positionGeometry.x.lessThan( 0.0 ).cond( worldUp.mul( hw ), worldUp.mul( hw ).negate() ), 0 ) );

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				if ( ! useDash ) {

					// cap extension
					worldPos.addAssign( vec4( positionGeometry.y.lessThan( 0.5 ).cond( worldDir.mul( hw ).negate(), worldDir.mul( hw ) ), 0 ) );

					// add width to the box
					worldPos.addAssign( vec4( worldFwd.mul( hw ), 0 ) );

					// endcaps
					If( positionGeometry.y.greaterThan( 1.0 ).or( positionGeometry.y.lessThan( 0.0 ) ), () => {

						worldPos.subAssign( vec4( worldFwd.mul( 2.0 ).mul( hw ), 0 ) );

					} );

				}

				// project the worldpos
				clip.assign( cameraProjectionMatrix.mul( worldPos ) );

				// shift the depth of the projected points so the line
				// segments overlap neatly
				const clipPose = temp( vec3() );

				clipPose.assign( positionGeometry.y.lessThan( 0.5 ).cond( ndcStart, ndcEnd ) );
				clip.z.assign( clipPose.z.mul( clip.w ) );

			} else {

				const offset = property( 'vec2', 'offset' );

				offset.assign( vec2( dir.y, dir.x.negate() ) );

				// undo aspect ratio adjustment
				dir.x.assign( dir.x.div( aspect ) );
				offset.x.assign( offset.x.div( aspect ) );

				// sign flip
				offset.assign( positionGeometry.x.lessThan( 0.0 ).cond( offset.negate(), offset ) );

				// endcaps
				If( positionGeometry.y.lessThan( 0.0 ), () => {

					offset.assign( offset.sub( dir ) );

				} ).elseif( positionGeometry.y.greaterThan( 1.0 ), () => {

					offset.assign( offset.add( dir ) );

				} );

				// adjust for linewidth
				offset.assign( offset.mul( materialLineWidth ) );

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset.assign( offset.div( viewport.w ) );

				// select end
				clip.assign( positionGeometry.y.lessThan( 0.5 ).cond( clipStart, clipEnd ) );

				// back to clip space
				offset.assign( offset.mul( clip.w ) );

				clip.assign( clip.add( vec4( offset, 0, 0 ) ) );

			}

			return clip;

		} )();

		const closestLineToLine = tslFn( ( { p1, p2, p3, p4 } ) => {

			const p13 = p1.sub( p3 );
			const p43 = p4.sub( p3 );

			const p21 = p2.sub( p1 );

			const d1343 = p13.dot( p43 );
			const d4321 = p43.dot( p21 );
			const d1321 = p13.dot( p21 );
			const d4343 = p43.dot( p43 );
			const d2121 = p21.dot( p21 );

			const denom = d2121.mul( d4343 ).sub( d4321.mul( d4321 ) );
			const numer = d1343.mul( d4321 ).sub( d1321.mul( d4343 ) );

			const mua = numer.div( denom ).clamp();
			const mub = d1343.add( d4321.mul( mua ) ).div( d4343 ).clamp();

			return vec2( mua, mub );

		} );

		this.fragmentNode = tslFn( () => {

			const vUv = varyingProperty( 'vec2', 'vUv' );

			if ( useDash ) {

				const offsetNode = this.offsetNode ? float( this.offsetNodeNode ) : materialLineDashOffset;
				const dashScaleNode = this.dashScaleNode ? float( this.dashScaleNode ) : materialLineScale;
				const dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
				const gapSizeNode = this.dashSizeNode ? float( this.dashGapNode ) : materialLineGapSize;

				dashSize.assign( dashSizeNode );
				gapSize.assign( gapSizeNode );

				const instanceDistanceStart = attribute( 'instanceDistanceStart' );
				const instanceDistanceEnd = attribute( 'instanceDistanceEnd' );

				const lineDistance = positionGeometry.y.lessThan( 0.5 ).cond( dashScaleNode.mul( instanceDistanceStart ), materialLineScale.mul( instanceDistanceEnd ) );

				const vLineDistance = varying( lineDistance.add( materialLineDashOffset ) );
				const vLineDistanceOffset = offsetNode ? vLineDistance.add( offsetNode ) : vLineDistance;

				vUv.y.lessThan( - 1.0 ).or( vUv.y.greaterThan( 1.0 ) ).discard(); // discard endcaps
				vLineDistanceOffset.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard(); // todo - FIX

			}

			 // force assignment into correct place in flow
			const alpha = property( 'float', 'alpha' );
			alpha.assign( 1 );

			if ( useWorldUnits ) {

				const worldStart = varyingProperty( 'vec3', 'worldStart' );
				const worldEnd = varyingProperty( 'vec3', 'worldEnd' );

				// Find the closest points on the view ray and the line segment
				const rayEnd = varyingProperty( 'vec4', 'worldPos' ).xyz.normalize().mul( 1e5 );
				const lineDir = worldEnd.sub( worldStart );
				const params = closestLineToLine( { p1: worldStart, p2: worldEnd, p3: vec3( 0.0, 0.0, 0.0 ), p4: rayEnd } );

				const p1 = worldStart.add( lineDir.mul( params.x ) );
				const p2 = rayEnd.mul( params.y );
				const delta = p1.sub( p2 );
				const len = delta.length();
				const norm = len.div( materialLineWidth );

				if ( ! useDash ) {

					if ( useAlphaToCoverage ) {

						const dnorm = norm.fwidth();
						alpha.assign( smoothstep( dnorm.negate().add( 0.5 ), dnorm.add( 0.5 ), norm ).oneMinus() );

					} else {

						norm.greaterThan( 0.5 ).discard();

					}

				}

			} else {

				// round endcaps

				if ( useAlphaToCoverage ) {

					const a = vUv.x;
					const b = vUv.y.greaterThan( 0.0 ).cond( vUv.y.sub( 1.0 ), vUv.y.add( 1.0 ) );

					const len2 = a.mul( a ).add( b.mul( b ) );

					// force assignment out of following 'if' statement - to avoid uniform control flow errors
					const dlen = property( 'float', 'dlen' );
					dlen.assign( len2.fwidth() );

					If( vUv.y.abs().greaterThan( 1.0 ), () => {

						alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

					} );

				} else {

					If( vUv.y.abs().greaterThan( 1.0 ), () => {

						const a = vUv.x;
						const b = vUv.y.greaterThan( 0.0 ).cond( vUv.y.sub( 1.0 ), vUv.y.add( 1.0 ) );
						const len2 = a.mul( a ).add( b.mul( b ) );

						len2.greaterThan( 1.0 ).discard();

					} );

				}

			}

			let lineColorNode;

			if ( this.lineColorNode ) {

				lineColorNode = this.lineColorNode;

			} else {

				if ( useColor ) {

					const instanceColorStart = attribute( 'instanceColorStart' );
					const instanceColorEnd = attribute( 'instanceColorEnd' );

					const instanceColor = positionGeometry.y.lessThan( 0.5 ).cond( instanceColorStart, instanceColorEnd );

					lineColorNode = instanceColor.mul( materialColor );

				} else {

					lineColorNode = materialColor;

				}

			}

			return vec4( lineColorNode, alpha );

		} )();

		this.needsUpdate = true;

	}


	get worldUnits() {

		return this.useWorldUnits;

	}

	set worldUnits( value ) {

		if ( this.useWorldUnits !== value ) {

			this.useWorldUnits = value;
			this.setupShaders();

		}

	}


	get dashed() {

		return this.useDash;

	}

	set dashed( value ) {

		if ( this.useDash !== value ) {

			this.useDash = value;
			this.setupShaders();

		}

	}


	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.setupShaders();

		}

	}

}

addNodeMaterial( 'Line2NodeMaterial', Line2NodeMaterial );

const defaultValues$7 = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshNormalNodeMaterial = true;

		this.colorSpaced = false;

		this.setDefaultValues( defaultValues$7 );

		this.setValues( parameters );

	}

	setupDiffuseColor() {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		diffuseColor.assign( vec4( directionToColor( transformedNormalView ), opacityNode ) );

	}

}

addNodeMaterial( 'MeshNormalNodeMaterial', MeshNormalNodeMaterial );

const defaultValues$6 = new MeshBasicMaterial();

class MeshBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshBasicNodeMaterial = true;

		this.lights = false;
		//this.normals = false; @TODO: normals usage by context

		this.setDefaultValues( defaultValues$6 );

		this.setValues( parameters );

	}

}

addNodeMaterial( 'MeshBasicNodeMaterial', MeshBasicNodeMaterial );

const F_Schlick = tslFn( ( { f0, f90, dotVH } ) => {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	const fresnel = dotVH.mul( - 5.55473 ).sub( 6.98316 ).mul( dotVH ).exp2();

	return f0.mul( fresnel.oneMinus() ).add( f90.mul( fresnel ) );

} ); // validated

const BRDF_Lambert = tslFn( ( inputs ) => {

	return inputs.diffuseColor.mul( 1 / Math.PI ); // punctual light

} ); // validated

const G_BlinnPhong_Implicit = () => float( 0.25 );

const D_BlinnPhong = tslFn( ( { dotNH } ) => {

	return shininess.mul( 0.5 / Math.PI ).add( 1.0 ).mul( dotNH.pow( shininess ) );

} );

const BRDF_BlinnPhong = tslFn( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNH = transformedNormalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	const F = F_Schlick( { f0: specularColor, f90: 1.0, dotVH } );
	const G = G_BlinnPhong_Implicit();
	const D = D_BlinnPhong( { dotNH } );

	return F.mul( G ).mul( D );

} );

class PhongLightingModel extends LightingModel {

	constructor( specular = true ) {

		super();

		this.specular = specular;

	}

	direct( { lightDirection, lightColor, reflectedLight } ) {

		const dotNL = transformedNormalView.dot( lightDirection ).clamp();
		const irradiance = dotNL.mul( lightColor );

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

		if ( this.specular === true ) {

			reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_BlinnPhong( { lightDirection } ) ).mul( materialSpecularStrength ) );

		}

	}

	indirectDiffuse( { irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

	}

}

const defaultValues$5 = new MeshLambertMaterial();

class MeshLambertNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshLambertNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( defaultValues$5 );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel( false ); // ( specular ) -> force lambert

	}

}

addNodeMaterial( 'MeshLambertNodeMaterial', MeshLambertNodeMaterial );

const defaultValues$4 = new MeshPhongMaterial();

class MeshPhongNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhongNodeMaterial = true;

		this.lights = true;

		this.shininessNode = null;
		this.specularNode = null;

		this.setDefaultValues( defaultValues$4 );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel();

	}

	setupVariants() {

		// SHININESS

		const shininessNode = ( this.shininessNode ? float( this.shininessNode ) : materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		shininess.assign( shininessNode );

		// SPECULAR COLOR

		const specularNode = this.specularNode || materialSpecularColor;

		specularColor.assign( specularNode );

	}

	copy( source ) {

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		return super.copy( source );

	}

}

addNodeMaterial( 'MeshPhongNodeMaterial', MeshPhongNodeMaterial );

const getGeometryRoughness = tslFn( () => {

	const dxy = normalGeometry.dFdx().abs().max( normalGeometry.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y ).max( dxy.z );

	return geometryRoughness;

} );

const getRoughness = tslFn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	let roughnessFactor = roughness.max( 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
	roughnessFactor = roughnessFactor.add( geometryRoughness );
	roughnessFactor = roughnessFactor.min( 1.0 );

	return roughnessFactor;

} );

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
const V_GGX_SmithCorrelated = tslFn( ( inputs ) => {

	const { alpha, dotNL, dotNV } = inputs;

	const a2 = alpha.pow2();

	const gv = dotNL.mul( a2.add( a2.oneMinus().mul( dotNV.pow2() ) ).sqrt() );
	const gl = dotNV.mul( a2.add( a2.oneMinus().mul( dotNL.pow2() ) ).sqrt() );

	return div( 0.5, gv.add( gl ).max( EPSILON ) );

} ).setLayout( {
	name: 'V_GGX_SmithCorrelated',
	type: 'float',
	inputs: [
		{ name: 'alpha', type: 'float' },
		{ name: 'dotNL', type: 'float' },
		{ name: 'dotNV', type: 'float' }
	]
} ); // validated

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
const D_GGX = tslFn( ( { alpha, dotNH } ) => {

	const a2 = alpha.pow2();

	const denom = dotNH.pow2().mul( a2.oneMinus() ).oneMinus(); // avoid alpha = 0 with dotNH = 1

	return a2.div( denom.pow2() ).mul( 1 / Math.PI );

} ).setLayout( {
	name: 'D_GGX',
	type: 'float',
	inputs: [
		{ name: 'alpha', type: 'float' },
		{ name: 'dotNH', type: 'float' }
	]
} ); // validated

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
const BRDF_GGX = tslFn( ( inputs ) => {

	const { lightDirection, f0, f90, roughness, iridescenceFresnel } = inputs;

	const normalView = inputs.normalView || transformedNormalView;

	const alpha = roughness.pow2(); // UE4's roughness

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNL = normalView.dot( lightDirection ).clamp();
	const dotNV = normalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV
	const dotNH = normalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	let F = F_Schlick( { f0, f90, dotVH } );

	if ( iridescenceFresnel ) {

		F = iridescence.mix( F, iridescenceFresnel );

	}

	const V = V_GGX_SmithCorrelated( { alpha, dotNL, dotNV } );
	const D = D_GGX( { alpha, dotNH } );

	return F.mul( V ).mul( D );

} ); // validated

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
const DFGApprox = tslFn( ( { roughness, dotNV } ) => {

	const c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	const r = roughness.mul( c0 ).add( c1 );

	const a004 = r.x.mul( r.x ).min( dotNV.mul( - 9.28 ).exp2() ).mul( r.x ).add( r.y );

	const fab = vec2( - 1.04, 1.04 ).mul( a004 ).add( r.zw );

	return fab;

} ).setLayout( {
	name: 'DFGApprox',
	type: 'vec2',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'dotNV', type: 'vec3' }
	]
} );

const EnvironmentBRDF = tslFn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGApprox( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

const Schlick_to_F0 = tslFn( ( { f, f90, dotVH } ) => {

	const x = dotVH.oneMinus().saturate();
	const x2 = x.mul( x );
	const x5 = x.mul( x2, x2 ).clamp( 0, .9999 );

	return f.sub( vec3( f90 ).mul( x5 ) ).div( x5.oneMinus() );

} ).setLayout( {
	name: 'Schlick_to_F0',
	type: 'vec3',
	inputs: [
		{ name: 'f', type: 'vec3' },
		{ name: 'f90', type: 'float' },
		{ name: 'dotVH', type: 'float' }
	]
} );

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
const D_Charlie = tslFn( ( { roughness, dotNH } ) => {

	const alpha = roughness.pow2();

	// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF"
	const invAlpha = float( 1.0 ).div( alpha );
	const cos2h = dotNH.pow2();
	const sin2h = cos2h.oneMinus().max( 0.0078125 ); // 2^(-14/2), so sin2h^2 > 0 in fp16

	return float( 2.0 ).add( invAlpha ).mul( sin2h.pow( invAlpha.mul( 0.5 ) ) ).div( 2.0 * Math.PI );

} ).setLayout( {
	name: 'D_Charlie',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'dotNH', type: 'float' }
	]
} );

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
const V_Neubelt = tslFn( ( { dotNV, dotNL } ) => {

	// Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
	return float( 1.0 ).div( float( 4.0 ).mul( dotNL.add( dotNV ).sub( dotNL.mul( dotNV ) ) ) );

} ).setLayout( {
	name: 'V_Neubelt',
	type: 'float',
	inputs: [
		{ name: 'dotNV', type: 'float' },
		{ name: 'dotNL', type: 'float' }
	]
} );

const BRDF_Sheen = tslFn( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const dotNV = transformedNormalView.dot( positionViewDirection ).clamp();
	const dotNH = transformedNormalView.dot( halfDir ).clamp();

	const D = D_Charlie( { roughness: sheenRoughness, dotNH } );
	const V = V_Neubelt( { dotNV, dotNL } );

	return sheen.mul( D ).mul( V );

} );

//
// Iridescence
//

// XYZ to linear-sRGB color space
const XYZ_TO_REC709 = mat3(
	3.2404542, - 0.9692660, 0.0556434,
	- 1.5371385, 1.8760108, - 0.2040259,
	- 0.4985314, 0.0415560, 1.0572252
);

// Assume air interface for top
// Note: We don't handle the case fresnel0 == 1
const Fresnel0ToIor = ( fresnel0 ) => {

	const sqrtF0 = fresnel0.sqrt();
	return vec3( 1.0 ).add( sqrtF0 ).div( vec3( 1.0 ).sub( sqrtF0 ) );

};

// ior is a value between 1.0 and 3.0. 1.0 is air interface
const IorToFresnel0 = ( transmittedIor, incidentIor ) => {

	return transmittedIor.sub( incidentIor ).div( transmittedIor.add( incidentIor ) ).pow2();

};

// Fresnel equations for dielectric/dielectric interfaces.
// Ref: https://belcour.github.io/blog/research/2017/05/01/brdf-thin-film.html
// Evaluation XYZ sensitivity curves in Fourier space
const evalSensitivity = ( OPD, shift ) => {

	const phase = OPD.mul( 2.0 * Math.PI * 1.0e-9 );
	const val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
	const pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
	const VAR = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );

	const x = float( 9.7470e-14 * Math.sqrt( 2.0 * Math.PI * 4.5282e+09 ) ).mul( phase.mul( 2.2399e+06 ).add( shift.x ).cos() ).mul( phase.pow2().mul( - 4.5282e+09 ).exp() );

	let xyz = val.mul( VAR.mul( 2.0 * Math.PI ).sqrt() ).mul( pos.mul( phase ).add( shift ).cos() ).mul( phase.pow2().negate().mul( VAR ).exp() );
	xyz = vec3( xyz.x.add( x ), xyz.y, xyz.z ).div( 1.0685e-7 );

	const rgb = XYZ_TO_REC709.mul( xyz );

	return rgb;

};

const evalIridescence = tslFn( ( { outsideIOR, eta2, cosTheta1, thinFilmThickness, baseF0 } ) => {

	// Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0
	const iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
	// Evaluate the cosTheta on the base layer (Snell law)
	const sinTheta2Sq = outsideIOR.div( iridescenceIOR ).pow2().mul( float( 1 ).sub( cosTheta1.pow2() ) );

	// Handle TIR:
	const cosTheta2Sq = float( 1 ).sub( sinTheta2Sq );
	/*if ( cosTheta2Sq < 0.0 ) {

			return vec3( 1.0 );

	}*/

	const cosTheta2 = cosTheta2Sq.sqrt();

	// First interface
	const R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
	const R12 = F_Schlick( { f0: R0, f90: 1.0, dotVH: cosTheta1 } );
	//const R21 = R12;
	const T121 = R12.oneMinus();
	const phi12 = iridescenceIOR.lessThan( outsideIOR ).cond( Math.PI, 0.0 );
	const phi21 = float( Math.PI ).sub( phi12 );

	// Second interface
	const baseIOR = Fresnel0ToIor( baseF0.clamp( 0.0, 0.9999 ) ); // guard against 1.0
	const R1 = IorToFresnel0( baseIOR, iridescenceIOR.vec3() );
	const R23 = F_Schlick( { f0: R1, f90: 1.0, dotVH: cosTheta2 } );
	const phi23 = vec3(
		baseIOR.x.lessThan( iridescenceIOR ).cond( Math.PI, 0.0 ),
		baseIOR.y.lessThan( iridescenceIOR ).cond( Math.PI, 0.0 ),
		baseIOR.z.lessThan( iridescenceIOR ).cond( Math.PI, 0.0 )
	);

	// Phase shift
	const OPD = iridescenceIOR.mul( thinFilmThickness, cosTheta2, 2.0 );
	const phi = vec3( phi21 ).add( phi23 );

	// Compound terms
	const R123 = R12.mul( R23 ).clamp( 1e-5, 0.9999 );
	const r123 = R123.sqrt();
	const Rs = T121.pow2().mul( R23 ).div( vec3( 1.0 ).sub( R123 ) );

	// Reflectance term for m = 0 (DC term amplitude)
	const C0 = R12.add( Rs );
	let I = C0;

	// Reflectance term for m > 0 (pairs of diracs)
	let Cm = Rs.sub( T121 );
	for ( let m = 1; m <= 2; ++ m ) {

		Cm = Cm.mul( r123 );
		const Sm = evalSensitivity( float( m ).mul( OPD ), float( m ).mul( phi ) ).mul( 2.0 );
		I = I.add( Cm.mul( Sm ) );

	}

	// Since out of gamut colors might be produced, negative color values are clamped to 0.
	return I.max( vec3( 0.0 ) );

} ).setLayout( {
	name: 'evalIridescence',
	type: 'vec3',
	inputs: [
		{ name: 'outsideIOR', type: 'float' },
		{ name: 'eta2', type: 'float' },
		{ name: 'cosTheta1', type: 'float' },
		{ name: 'thinFilmThickness', type: 'float' },
		{ name: 'baseF0', type: 'vec3' }
	]
} );

//
//	Sheen
//

// This is a curve-fit approxmation to the "Charlie sheen" BRDF integrated over the hemisphere from
// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF". The analysis can be found
// in the Sheen section of https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
const IBLSheenBRDF = tslFn( ( { normal, viewDir, roughness } ) => {

	const dotNV = normal.dot( viewDir ).saturate();

	const r2 = roughness.pow2();

	const a = cond(
		roughness.lessThan( 0.25 ),
		float( - 339.2 ).mul( r2 ).add( float( 161.4 ).mul( roughness ) ).sub( 25.9 ),
		float( - 8.48 ).mul( r2 ).add( float( 14.3 ).mul( roughness ) ).sub( 9.95 )
	);

	const b = cond(
		roughness.lessThan( 0.25 ),
		float( 44.0 ).mul( r2 ).sub( float( 23.7 ).mul( roughness ) ).add( 3.26 ),
		float( 1.97 ).mul( r2 ).sub( float( 3.27 ).mul( roughness ) ).add( 0.72 )
	);

	const DG = cond( roughness.lessThan( 0.25 ), 0.0, float( 0.1 ).mul( roughness ).sub( 0.025 ) ).add( a.mul( dotNV ).add( b ).exp() );

	return DG.mul( 1.0 / Math.PI ).saturate();

} );

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = vec3( 1 );

//

class PhysicalLightingModel extends LightingModel {

	constructor( clearcoat = false, sheen = false, iridescence = false ) {

		super();

		this.clearcoat = clearcoat;
		this.sheen = sheen;
		this.iridescence = iridescence;

		this.clearcoatRadiance = null;
		this.clearcoatSpecularDirect = null;
		this.clearcoatSpecularIndirect = null;
		this.sheenSpecularDirect = null;
		this.sheenSpecularIndirect = null;
		this.iridescenceFresnel = null;
		this.iridescenceF0 = null;

	}

	start( /*context*/ ) {

		if ( this.clearcoat === true ) {

			this.clearcoatRadiance = vec3().temp( 'clearcoatRadiance' );
			this.clearcoatSpecularDirect = vec3().temp( 'clearcoatSpecularDirect' );
			this.clearcoatSpecularIndirect = vec3().temp( 'clearcoatSpecularIndirect' );

		}

		if ( this.sheen === true ) {

			this.sheenSpecularDirect = vec3().temp( 'sheenSpecularDirect' );
			this.sheenSpecularIndirect = vec3().temp( 'sheenSpecularIndirect' );

		}

		if ( this.iridescence === true ) {

			const dotNVi = transformedNormalView.dot( positionViewDirection ).clamp();

			this.iridescenceFresnel = evalIridescence( {
				outsideIOR: float( 1.0 ),
				eta2: iridescenceIOR,
				cosTheta1: dotNVi,
				thinFilmThickness: iridescenceThickness,
				baseF0: specularColor
			} );

			this.iridescenceF0 = Schlick_to_F0( { f: this.iridescenceFresnel, f90: 1.0, dotVH: dotNVi } );

		}

	}

	// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
	// Approximates multiscattering in order to preserve energy.
	// http://www.jcgt.org/published/0008/01/03/

	computeMultiscattering( singleScatter, multiScatter, specularF90 = float( 1 ) ) {

		const dotNV = transformedNormalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

		const fab = DFGApprox( { roughness, dotNV } );

		const Fr = this.iridescenceF0 ? iridescence.mix( specularColor, this.iridescenceF0 ) : specularColor;

		const FssEss = Fr.mul( fab.x ).add( specularF90.mul( fab.y ) );

		const Ess = fab.x.add( fab.y );
		const Ems = Ess.oneMinus();

		const Favg = specularColor.add( specularColor.oneMinus().mul( 0.047619 ) ); // 1/21
		const Fms = FssEss.mul( Favg ).div( Ems.mul( Favg ).oneMinus() );

		singleScatter.addAssign( FssEss );
		multiScatter.addAssign( Fms.mul( Ems ) );

	}

	direct( { lightDirection, lightColor, reflectedLight } ) {

		const dotNL = transformedNormalView.dot( lightDirection ).clamp();
		const irradiance = dotNL.mul( lightColor );

		if ( this.sheen === true ) {

			this.sheenSpecularDirect.addAssign( irradiance.mul( BRDF_Sheen( { lightDirection } ) ) );

		}

		if ( this.clearcoat === true ) {

			const dotNLcc = transformedClearcoatNormalView.dot( lightDirection ).clamp();
			const ccIrradiance = dotNLcc.mul( lightColor );

			this.clearcoatSpecularDirect.addAssign( ccIrradiance.mul( BRDF_GGX( { lightDirection, f0: clearcoatF0, f90: clearcoatF90, roughness: clearcoatRoughness, normalView: transformedClearcoatNormalView } ) ) );

		}

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

		reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX( { lightDirection, f0: specularColor, f90: 1, roughness, iridescence: this.iridescence, iridescenceFresnel: this.iridescenceFresnel } ) ) );

	}

	indirectDiffuse( { irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

	}

	indirectSpecular( { radiance, iblIrradiance, reflectedLight } ) {

		if ( this.sheen === true ) {

			this.sheenSpecularIndirect.addAssign( iblIrradiance.mul(
				sheen,
				IBLSheenBRDF( {
					normal: transformedNormalView,
					viewDir: positionViewDirection,
					roughness: sheenRoughness
				} )
			) );

		}

		if ( this.clearcoat === true ) {

			const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

			const clearcoatEnv = EnvironmentBRDF( {
				dotNV: dotNVcc,
				specularColor: clearcoatF0,
				specularF90: clearcoatF90,
				roughness: clearcoatRoughness
			} );

			this.clearcoatSpecularIndirect.addAssign( this.clearcoatRadiance.mul( clearcoatEnv ) );

		}

		// Both indirect specular and indirect diffuse light accumulate here

		const singleScattering = vec3().temp( 'singleScattering' );
		const multiScattering = vec3().temp( 'multiScattering' );
		const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

		this.computeMultiscattering( singleScattering, multiScattering );

		const totalScattering = singleScattering.add( multiScattering );

		const diffuse = diffuseColor.mul( totalScattering.r.max( totalScattering.g ).max( totalScattering.b ).oneMinus() );

		reflectedLight.indirectSpecular.addAssign( radiance.mul( singleScattering ) );
		reflectedLight.indirectSpecular.addAssign( multiScattering.mul( cosineWeightedIrradiance ) );

		reflectedLight.indirectDiffuse.addAssign( diffuse.mul( cosineWeightedIrradiance ) );

	}

	ambientOcclusion( { ambientOcclusion, reflectedLight } ) {

		const dotNV = transformedNormalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV

		const aoNV = dotNV.add( ambientOcclusion );
		const aoExp = roughness.mul( - 16.0 ).oneMinus().negate().exp2();

		const aoNode = ambientOcclusion.sub( aoNV.pow( aoExp ).oneMinus() ).clamp();

		if ( this.clearcoat === true ) {

			this.clearcoatSpecularIndirect.mulAssign( ambientOcclusion );

		}

		if ( this.sheen === true ) {

			this.sheenSpecularIndirect.mulAssign( ambientOcclusion );

		}

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );
		reflectedLight.indirectSpecular.mulAssign( aoNode );

	}

	finish( context ) {

		const { outgoingLight } = context;

		if ( this.clearcoat === true ) {

			const dotNVcc = transformedClearcoatNormalView.dot( positionViewDirection ).clamp();

			const Fcc = F_Schlick( {
				dotVH: dotNVcc,
				f0: clearcoatF0,
				f90: clearcoatF90
			} );

			const clearcoatLight = outgoingLight.mul( clearcoat.mul( Fcc ).oneMinus() ).add( this.clearcoatSpecularDirect.add( this.clearcoatSpecularIndirect ).mul( clearcoat ) );

			outgoingLight.assign( clearcoatLight );

		}

		if ( this.sheen === true ) {

			const sheenEnergyComp = sheen.r.max( sheen.g ).max( sheen.b ).mul( 0.157 ).oneMinus();
			const sheenLight = outgoingLight.mul( sheenEnergyComp ).add( this.sheenSpecularDirect, this.sheenSpecularIndirect );

			outgoingLight.assign( sheenLight );

		}

	}

}

const defaultValues$3 = new MeshStandardMaterial();

class MeshStandardNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshStandardNodeMaterial = true;

		this.emissiveNode = null;

		this.metalnessNode = null;
		this.roughnessNode = null;

		this.setDefaultValues( defaultValues$3 );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel();

	}

	setupVariants() {

		// METALNESS

		const metalnessNode = this.metalnessNode ? float( this.metalnessNode ) : materialMetalness;

		metalness.assign( metalnessNode );

		// ROUGHNESS

		let roughnessNode = this.roughnessNode ? float( this.roughnessNode ) : materialRoughness;
		roughnessNode = getRoughness( { roughness: roughnessNode } );

		roughness.assign( roughnessNode );

		// SPECULAR COLOR

		const specularColorNode = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessNode );

		specularColor.assign( specularColorNode );

		// DIFFUSE COLOR

		diffuseColor.assign( vec4( diffuseColor.rgb.mul( metalnessNode.oneMinus() ), diffuseColor.a ) );

	}

	copy( source ) {

		this.emissiveNode = source.emissiveNode;

		this.metalnessNode = source.metalnessNode;
		this.roughnessNode = source.roughnessNode;

		return super.copy( source );

	}

}

addNodeMaterial( 'MeshStandardNodeMaterial', MeshStandardNodeMaterial );

const defaultValues$2 = new MeshPhysicalMaterial();

class MeshPhysicalNodeMaterial extends MeshStandardNodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhysicalNodeMaterial = true;

		this.clearcoatNode = null;
		this.clearcoatRoughnessNode = null;
		this.clearcoatNormalNode = null;

		this.sheenNode = null;
		this.sheenRoughnessNode = null;

		this.iridescenceNode = null;
		this.iridescenceIORNode = null;
		this.iridescenceThicknessNode = null;

		this.specularIntensityNode = null;
		this.specularColorNode = null;

		this.transmissionNode = null;
		this.thicknessNode = null;
		this.attenuationDistanceNode = null;
		this.attenuationColorNode = null;

		this.setDefaultValues( defaultValues$2 );

		this.setValues( parameters );

	}

	get useClearcoat() {

		return this.clearcoat > 0 || this.clearcoatNode !== null;

	}

	get useIridescence() {

		return this.iridescence > 0 || this.iridescenceNode !== null;

	}

	get useSheen() {

		return this.sheen > 0 || this.sheenNode !== null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel( this.useClearcoat, this.useSheen, this.useIridescence );

	}

	setupVariants( builder ) {

		super.setupVariants( builder );

		// CLEARCOAT

		if ( this.useClearcoat ) {

			const clearcoatNode = this.clearcoatNode ? float( this.clearcoatNode ) : materialClearcoat;
			const clearcoatRoughnessNode = this.clearcoatRoughnessNode ? float( this.clearcoatRoughnessNode ) : materialClearcoatRoughness;

			clearcoat.assign( clearcoatNode );
			clearcoatRoughness.assign( clearcoatRoughnessNode );

		}

		// SHEEN

		if ( this.useSheen ) {

			const sheenNode = this.sheenNode ? vec3( this.sheenNode ) : materialSheen;
			const sheenRoughnessNode = this.sheenRoughnessNode ? float( this.sheenRoughnessNode ) : materialSheenRoughness;

			sheen.assign( sheenNode );
			sheenRoughness.assign( sheenRoughnessNode );

		}

		// IRIDESCENCE

		if ( this.useIridescence ) {

			const iridescenceNode = this.iridescenceNode ? float( this.iridescenceNode ) : materialIridescence;
			const iridescenceIORNode = this.iridescenceIORNode ? float( this.iridescenceIORNode ) : materialIridescenceIOR;
			const iridescenceThicknessNode = this.iridescenceThicknessNode ? float( this.iridescenceThicknessNode ) : materialIridescenceThickness;

			iridescence.assign( iridescenceNode );
			iridescenceIOR.assign( iridescenceIORNode );
			iridescenceThickness.assign( iridescenceThicknessNode );

		}

	}

	setupNormal( builder ) {

		super.setupNormal( builder );

		// CLEARCOAT NORMAL

		const clearcoatNormalNode = this.clearcoatNormalNode ? vec3( this.clearcoatNormalNode ) : materialClearcoatNormal;

		transformedClearcoatNormalView.assign( clearcoatNormalNode );

	}

	copy( source ) {

		this.clearcoatNode = source.clearcoatNode;
		this.clearcoatRoughnessNode = source.clearcoatRoughnessNode;
		this.clearcoatNormalNode = source.clearcoatNormalNode;

		this.sheenNode = source.sheenNode;
		this.sheenRoughnessNode = source.sheenRoughnessNode;

		this.iridescenceNode = source.iridescenceNode;
		this.iridescenceIORNode = source.iridescenceIORNode;
		this.iridescenceThicknessNode = source.iridescenceThicknessNode;

		this.specularIntensityNode = source.specularIntensityNode;
		this.specularColorNode = source.specularColorNode;

		this.transmissionNode = source.transmissionNode;
		this.thicknessNode = source.thicknessNode;
		this.attenuationDistanceNode = source.attenuationDistanceNode;
		this.attenuationColorNode = source.attenuationColorNode;

		return super.copy( source );

	}

}

addNodeMaterial( 'MeshPhysicalNodeMaterial', MeshPhysicalNodeMaterial );

class SSSLightingModel extends PhysicalLightingModel {

	constructor( useClearcoat, useSheen, useIridescence, useSSS ) {

		super( useClearcoat, useSheen, useIridescence );

		this.useSSS = useSSS;

	}

	direct( { lightDirection, lightColor, reflectedLight }, stack, builder ) {

		if ( this.useSSS === true ) {

			const material = builder.material;

			const { thicknessColorNode, thicknessDistortionNode, thicknessAmbientNode, thicknessAttenuationNode, thicknessPowerNode, thicknessScaleNode } = material;

			const scatteringHalf = lightDirection.add( transformedNormalView.mul( thicknessDistortionNode ) ).normalize();
			const scatteringDot = float( positionViewDirection.dot( scatteringHalf.negate() ).saturate().pow( thicknessPowerNode ).mul( thicknessScaleNode ) );
			const scatteringIllu = vec3( scatteringDot.add( thicknessAmbientNode ).mul( thicknessColorNode ) );

			reflectedLight.directDiffuse.addAssign( scatteringIllu.mul( thicknessAttenuationNode.mul( lightColor ) ) );

		}

		super.direct( { lightDirection, lightColor, reflectedLight }, stack, builder );

	}

}

class MeshSSSNodeMaterial extends MeshPhysicalNodeMaterial {

	constructor( parameters ) {

		super( parameters );

		this.thicknessColorNode = null;
		this.thicknessDistortionNode = float( 0.1 );
		this.thicknessAmbientNode = float( 0.0 );
		this.thicknessAttenuationNode = float( .1 );
		this.thicknessPowerNode = float( 2.0 );
		this.thicknessScaleNode = float( 10.0 );

	}

	get useSSS() {

		return this.thicknessColorNode !== null;

	}

	setupLightingModel( /*builder*/ ) {

		return new SSSLightingModel( this.useClearcoat, this.useSheen, this.useIridescence, this.useSSS );

	}

	copy( source ) {

		this.thicknessColorNode = source.thicknessColorNode;
		this.thicknessDistortionNode = source.thicknessDistortionNode;
		this.thicknessAmbientNode = source.thicknessAmbientNode;
		this.thicknessAttenuationNode = source.thicknessAttenuationNode;
		this.thicknessPowerNode = source.thicknessPowerNode;
		this.thicknessScaleNode = source.thicknessScaleNode;

		return super.copy( source );

	}

}

addNodeMaterial( 'MeshSSSNodeMaterial', MeshSSSNodeMaterial );

const defaultValues$1 = new PointsMaterial();

class PointsNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isPointsNodeMaterial = true;

		this.lights = false;
		this.normals = false;
		this.transparent = true;

		this.sizeNode = null;

		this.setDefaultValues( defaultValues$1 );

		this.setValues( parameters );

	}

	copy( source ) {

		this.sizeNode = source.sizeNode;

		return super.copy( source );

	}

}

addNodeMaterial( 'PointsNodeMaterial', PointsNodeMaterial );

const defaultValues = new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.positionNode = null;
		this.rotationNode = null;
		this.scaleNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupPosition( { object, context } ) {

		// < VERTEX STAGE >

		const { positionNode, rotationNode, scaleNode } = this;

		const vertex = positionLocal;

		let mvPosition = modelViewMatrix.mul( vec3( positionNode || 0 ) );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}

		let alignedPosition = vertex.xy;

		if ( object.center && object.center.isVector2 === true ) {

			alignedPosition = alignedPosition.sub( uniform( object.center ).sub( 0.5 ) );

		}

		alignedPosition = alignedPosition.mul( scale );

		const rotation = float( rotationNode || materialRotation );

		const rotatedPosition = alignedPosition.rotate( rotation );

		mvPosition = vec4( mvPosition.xy.add( rotatedPosition ), mvPosition.zw );

		const modelViewProjection = cameraProjectionMatrix.mul( mvPosition );

		context.vertex = vertex;

		return modelViewProjection;

	}

	copy( source ) {

		this.positionNode = source.positionNode;
		this.rotationNode = source.rotationNode;
		this.scaleNode = source.scaleNode;

		return super.copy( source );

	}

}

addNodeMaterial( 'SpriteNodeMaterial', SpriteNodeMaterial );

const superFromTypeFunction = MaterialLoader.createMaterialFromType;

MaterialLoader.createMaterialFromType = function ( type ) {

	const material = createNodeMaterialFromType( type );

	if ( material !== undefined ) {

		return material;

	}

	return superFromTypeFunction.call( this, type );

};

class NodeParser {

	parseFunction( /*source*/ ) {

		console.warn( 'Abstract function.' );

	}

}

class NodeFunction {

	constructor( type, inputs, name = '', presicion = '' ) {

		this.type = type;
		this.inputs = inputs;
		this.name = name;
		this.presicion = presicion;

	}

	getCode( /*name = this.name*/ ) {

		console.warn( 'Abstract function.' );

	}

}

NodeFunction.isNodeFunction = true;

const declarationRegexp$1 = /^\s*(highp|mediump|lowp)?\s*([a-z_0-9]+)\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)/i;
const propertiesRegexp$1 = /[a-z_0-9]+/ig;

const pragmaMain = '#pragma main';

const parse$1 = ( source ) => {

	source = source.trim();

	const pragmaMainIndex = source.indexOf( pragmaMain );

	const mainCode = pragmaMainIndex !== - 1 ? source.slice( pragmaMainIndex + pragmaMain.length ) : source;

	const declaration = mainCode.match( declarationRegexp$1 );

	if ( declaration !== null && declaration.length === 5 ) {

		// tokenizer

		const inputsCode = declaration[ 4 ];
		const propsMatches = [];

		let nameMatch = null;

		while ( ( nameMatch = propertiesRegexp$1.exec( inputsCode ) ) !== null ) {

			propsMatches.push( nameMatch );

		}

		// parser

		const inputs = [];

		let i = 0;

		while ( i < propsMatches.length ) {

			const isConst = propsMatches[ i ][ 0 ] === 'const';

			if ( isConst === true ) {

				i ++;

			}

			let qualifier = propsMatches[ i ][ 0 ];

			if ( qualifier === 'in' || qualifier === 'out' || qualifier === 'inout' ) {

				i ++;

			} else {

				qualifier = '';

			}

			const type = propsMatches[ i ++ ][ 0 ];

			let count = Number.parseInt( propsMatches[ i ][ 0 ] );

			if ( Number.isNaN( count ) === false ) i ++;
			else count = null;

			const name = propsMatches[ i ++ ][ 0 ];

			inputs.push( new NodeFunctionInput( type, name, count, qualifier, isConst ) );

		}

		//

		const blockCode = mainCode.substring( declaration[ 0 ].length );

		const name = declaration[ 3 ] !== undefined ? declaration[ 3 ] : '';
		const type = declaration[ 2 ];

		const presicion = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';

		const headerCode = pragmaMainIndex !== - 1 ? source.slice( 0, pragmaMainIndex ) : '';

		return {
			type,
			inputs,
			name,
			presicion,
			inputsCode,
			blockCode,
			headerCode
		};

	} else {

		throw new Error( 'FunctionNode: Function is not a GLSL code.' );

	}

};

class GLSLNodeFunction extends NodeFunction {

	constructor( source ) {

		const { type, inputs, name, presicion, inputsCode, blockCode, headerCode } = parse$1( source );

		super( type, inputs, name, presicion );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;
		this.headerCode = headerCode;

	}

	getCode( name = this.name ) {

		let code;

		const blockCode = this.blockCode;

		if ( blockCode !== '' ) {

			const { type, inputsCode, headerCode, presicion } = this;

			let declarationCode = `${ type } ${ name } ( ${ inputsCode.trim() } )`;

			if ( presicion !== '' ) {

				declarationCode = `${ presicion } ${ declarationCode }`;

			}

			code = headerCode + declarationCode + blockCode;

		} else {

			// interface function

			code = '';

		}

		return code;

	}

}

class GLSLNodeParser extends NodeParser {

	parseFunction( source ) {

		return new GLSLNodeFunction( source );

	}

}

// Three.js Transpiler
// https://raw.githubusercontent.com/AcademySoftwareFoundation/MaterialX/main/libraries/stdlib/genglsl/lib/mx_noise.glsl


const mx_select = tslFn( ( [ b_immutable, t_immutable, f_immutable ] ) => {

	const f = float( f_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const b = bool( b_immutable ).toVar();

	return cond( b, t, f );

} );

const mx_negate_if = tslFn( ( [ val_immutable, b_immutable ] ) => {

	const b = bool( b_immutable ).toVar();
	const val = float( val_immutable ).toVar();

	return cond( b, val.negate(), val );

} );

const mx_floor = tslFn( ( [ x_immutable ] ) => {

	const x = float( x_immutable ).toVar();

	return int( floor( x ) );

} );

const mx_floorfrac = tslFn( ( [ x_immutable, i ] ) => {

	const x = float( x_immutable ).toVar();
	i.assign( mx_floor( x ) );

	return x.sub( float( i ) );

} );

const mx_bilerp_0 = tslFn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, s_immutable, t_immutable ] ) => {

	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v3 = float( v3_immutable ).toVar();
	const v2 = float( v2_immutable ).toVar();
	const v1 = float( v1_immutable ).toVar();
	const v0 = float( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();

	return sub( 1.0, t ).mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) );

} );

const mx_bilerp_1 = tslFn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, s_immutable, t_immutable ] ) => {

	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v3 = vec3( v3_immutable ).toVar();
	const v2 = vec3( v2_immutable ).toVar();
	const v1 = vec3( v1_immutable ).toVar();
	const v0 = vec3( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();

	return sub( 1.0, t ).mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) );

} );

const mx_bilerp = overloadingFn( [ mx_bilerp_0, mx_bilerp_1 ] );

const mx_trilerp_0 = tslFn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, v4_immutable, v5_immutable, v6_immutable, v7_immutable, s_immutable, t_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v7 = float( v7_immutable ).toVar();
	const v6 = float( v6_immutable ).toVar();
	const v5 = float( v5_immutable ).toVar();
	const v4 = float( v4_immutable ).toVar();
	const v3 = float( v3_immutable ).toVar();
	const v2 = float( v2_immutable ).toVar();
	const v1 = float( v1_immutable ).toVar();
	const v0 = float( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();
	const t1 = float( sub( 1.0, t ) ).toVar();
	const r1 = float( sub( 1.0, r ) ).toVar();

	return r1.mul( t1.mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) ) ).add( r.mul( t1.mul( v4.mul( s1 ).add( v5.mul( s ) ) ).add( t.mul( v6.mul( s1 ).add( v7.mul( s ) ) ) ) ) );

} );

const mx_trilerp_1 = tslFn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, v4_immutable, v5_immutable, v6_immutable, v7_immutable, s_immutable, t_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v7 = vec3( v7_immutable ).toVar();
	const v6 = vec3( v6_immutable ).toVar();
	const v5 = vec3( v5_immutable ).toVar();
	const v4 = vec3( v4_immutable ).toVar();
	const v3 = vec3( v3_immutable ).toVar();
	const v2 = vec3( v2_immutable ).toVar();
	const v1 = vec3( v1_immutable ).toVar();
	const v0 = vec3( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();
	const t1 = float( sub( 1.0, t ) ).toVar();
	const r1 = float( sub( 1.0, r ) ).toVar();

	return r1.mul( t1.mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) ) ).add( r.mul( t1.mul( v4.mul( s1 ).add( v5.mul( s ) ) ).add( t.mul( v6.mul( s1 ).add( v7.mul( s ) ) ) ) ) );

} );

const mx_trilerp = overloadingFn( [ mx_trilerp_0, mx_trilerp_1 ] );

const mx_gradient_float_0 = tslFn( ( [ hash_immutable, x_immutable, y_immutable ] ) => {

	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uint( hash_immutable ).toVar();
	const h = uint( hash.bitAnd( uint( 7 ) ) ).toVar();
	const u = float( mx_select( h.lessThan( uint( 4 ) ), x, y ) ).toVar();
	const v = float( mul( 2.0, mx_select( h.lessThan( uint( 4 ) ), y, x ) ) ).toVar();

	return mx_negate_if( u, bool( h.bitAnd( uint( 1 ) ) ) ).add( mx_negate_if( v, bool( h.bitAnd( uint( 2 ) ) ) ) );

} );

const mx_gradient_float_1 = tslFn( ( [ hash_immutable, x_immutable, y_immutable, z_immutable ] ) => {

	const z = float( z_immutable ).toVar();
	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uint( hash_immutable ).toVar();
	const h = uint( hash.bitAnd( uint( 15 ) ) ).toVar();
	const u = float( mx_select( h.lessThan( uint( 8 ) ), x, y ) ).toVar();
	const v = float( mx_select( h.lessThan( uint( 4 ) ), y, mx_select( h.equal( uint( 12 ) ).or( h.equal( uint( 14 ) ) ), x, z ) ) ).toVar();

	return mx_negate_if( u, bool( h.bitAnd( uint( 1 ) ) ) ).add( mx_negate_if( v, bool( h.bitAnd( uint( 2 ) ) ) ) );

} );

const mx_gradient_float = overloadingFn( [ mx_gradient_float_0, mx_gradient_float_1 ] );

const mx_gradient_vec3_0 = tslFn( ( [ hash_immutable, x_immutable, y_immutable ] ) => {

	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uvec3( hash_immutable ).toVar();

	return vec3( mx_gradient_float( hash.x, x, y ), mx_gradient_float( hash.y, x, y ), mx_gradient_float( hash.z, x, y ) );

} );

const mx_gradient_vec3_1 = tslFn( ( [ hash_immutable, x_immutable, y_immutable, z_immutable ] ) => {

	const z = float( z_immutable ).toVar();
	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uvec3( hash_immutable ).toVar();

	return vec3( mx_gradient_float( hash.x, x, y, z ), mx_gradient_float( hash.y, x, y, z ), mx_gradient_float( hash.z, x, y, z ) );

} );

const mx_gradient_vec3 = overloadingFn( [ mx_gradient_vec3_0, mx_gradient_vec3_1 ] );

const mx_gradient_scale2d_0 = tslFn( ( [ v_immutable ] ) => {

	const v = float( v_immutable ).toVar();

	return mul( 0.6616, v );

} );

const mx_gradient_scale3d_0 = tslFn( ( [ v_immutable ] ) => {

	const v = float( v_immutable ).toVar();

	return mul( 0.9820, v );

} );

const mx_gradient_scale2d_1 = tslFn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();

	return mul( 0.6616, v );

} );

const mx_gradient_scale2d = overloadingFn( [ mx_gradient_scale2d_0, mx_gradient_scale2d_1 ] );

const mx_gradient_scale3d_1 = tslFn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();

	return mul( 0.9820, v );

} );

const mx_gradient_scale3d = overloadingFn( [ mx_gradient_scale3d_0, mx_gradient_scale3d_1 ] );

const mx_rotl32 = tslFn( ( [ x_immutable, k_immutable ] ) => {

	const k = int( k_immutable ).toVar();
	const x = uint( x_immutable ).toVar();

	return x.shiftLeft( k ).bitOr( x.shiftRight( int( 32 ).sub( k ) ) );

} );

const mx_bjmix = tslFn( ( [ a, b, c ] ) => {

	a.subAssign( c );
	a.bitXorAssign( mx_rotl32( c, int( 4 ) ) );
	c.addAssign( b );
	b.subAssign( a );
	b.bitXorAssign( mx_rotl32( a, int( 6 ) ) );
	a.addAssign( c );
	c.subAssign( b );
	c.bitXorAssign( mx_rotl32( b, int( 8 ) ) );
	b.addAssign( a );
	a.subAssign( c );
	a.bitXorAssign( mx_rotl32( c, int( 16 ) ) );
	c.addAssign( b );
	b.subAssign( a );
	b.bitXorAssign( mx_rotl32( a, int( 19 ) ) );
	a.addAssign( c );
	c.subAssign( b );
	c.bitXorAssign( mx_rotl32( b, int( 4 ) ) );
	b.addAssign( a );

} );

const mx_bjfinal = tslFn( ( [ a_immutable, b_immutable, c_immutable ] ) => {

	const c = uint( c_immutable ).toVar();
	const b = uint( b_immutable ).toVar();
	const a = uint( a_immutable ).toVar();
	c.bitXorAssign( b );
	c.subAssign( mx_rotl32( b, int( 14 ) ) );
	a.bitXorAssign( c );
	a.subAssign( mx_rotl32( c, int( 11 ) ) );
	b.bitXorAssign( a );
	b.subAssign( mx_rotl32( a, int( 25 ) ) );
	c.bitXorAssign( b );
	c.subAssign( mx_rotl32( b, int( 16 ) ) );
	a.bitXorAssign( c );
	a.subAssign( mx_rotl32( c, int( 4 ) ) );
	b.bitXorAssign( a );
	b.subAssign( mx_rotl32( a, int( 14 ) ) );
	c.bitXorAssign( b );
	c.subAssign( mx_rotl32( b, int( 24 ) ) );

	return c;

} );

const mx_bits_to_01 = tslFn( ( [ bits_immutable ] ) => {

	const bits = uint( bits_immutable ).toVar();

	return float( bits ).div( float( uint( int( 0xffffffff ) ) ) );

} );

const mx_fade = tslFn( ( [ t_immutable ] ) => {

	const t = float( t_immutable ).toVar();

	return t.mul( t.mul( t.mul( t.mul( t.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) ) ) );

} );

const mx_hash_int_0 = tslFn( ( [ x_immutable ] ) => {

	const x = int( x_immutable ).toVar();
	const len = uint( uint( 1 ) ).toVar();
	const seed = uint( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ).add( uint( 13 ) ) ) ).toVar();

	return mx_bjfinal( seed.add( uint( x ) ), seed, seed );

} );

const mx_hash_int_1 = tslFn( ( [ x_immutable, y_immutable ] ) => {

	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 2 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ).add( uint( 13 ) ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );

	return mx_bjfinal( a, b, c );

} );

const mx_hash_int_2 = tslFn( ( [ x_immutable, y_immutable, z_immutable ] ) => {

	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 3 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ).add( uint( 13 ) ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );

	return mx_bjfinal( a, b, c );

} );

const mx_hash_int_3 = tslFn( ( [ x_immutable, y_immutable, z_immutable, xx_immutable ] ) => {

	const xx = int( xx_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 4 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ).add( uint( 13 ) ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );
	mx_bjmix( a, b, c );
	a.addAssign( uint( xx ) );

	return mx_bjfinal( a, b, c );

} );

const mx_hash_int_4 = tslFn( ( [ x_immutable, y_immutable, z_immutable, xx_immutable, yy_immutable ] ) => {

	const yy = int( yy_immutable ).toVar();
	const xx = int( xx_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 5 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ).add( uint( 13 ) ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );
	mx_bjmix( a, b, c );
	a.addAssign( uint( xx ) );
	b.addAssign( uint( yy ) );

	return mx_bjfinal( a, b, c );

} );

const mx_hash_int = overloadingFn( [ mx_hash_int_0, mx_hash_int_1, mx_hash_int_2, mx_hash_int_3, mx_hash_int_4 ] );

const mx_hash_vec3_0 = tslFn( ( [ x_immutable, y_immutable ] ) => {

	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const h = uint( mx_hash_int( x, y ) ).toVar();
	const result = uvec3().toVar();
	result.x.assign( h.bitAnd( int( 0xFF ) ) );
	result.y.assign( h.shiftRight( int( 8 ) ).bitAnd( int( 0xFF ) ) );
	result.z.assign( h.shiftRight( int( 16 ) ).bitAnd( int( 0xFF ) ) );

	return result;

} );

const mx_hash_vec3_1 = tslFn( ( [ x_immutable, y_immutable, z_immutable ] ) => {

	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const h = uint( mx_hash_int( x, y, z ) ).toVar();
	const result = uvec3().toVar();
	result.x.assign( h.bitAnd( int( 0xFF ) ) );
	result.y.assign( h.shiftRight( int( 8 ) ).bitAnd( int( 0xFF ) ) );
	result.z.assign( h.shiftRight( int( 16 ) ).bitAnd( int( 0xFF ) ) );

	return result;

} );

const mx_hash_vec3 = overloadingFn( [ mx_hash_vec3_0, mx_hash_vec3_1 ] );

const mx_perlin_noise_float_0 = tslFn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const result = float( mx_bilerp( mx_gradient_float( mx_hash_int( X, Y ), fx, fy ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y ), fx.sub( 1.0 ), fy ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ) ), fx, fy.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ) ), u, v ) ).toVar();

	return mx_gradient_scale2d( result );

} );

const mx_perlin_noise_float_1 = tslFn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const fz = float( mx_floorfrac( p.z, Z ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const w = float( mx_fade( fz ) ).toVar();
	const result = float( mx_trilerp( mx_gradient_float( mx_hash_int( X, Y, Z ), fx, fy, fz ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y, Z ), fx.sub( 1.0 ), fy, fz ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ), Z ), fx, fy.sub( 1.0 ), fz ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz ), mx_gradient_float( mx_hash_int( X, Y, Z.add( int( 1 ) ) ), fx, fy, fz.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y, Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy, fz.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx, fy.sub( 1.0 ), fz.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz.sub( 1.0 ) ), u, v, w ) ).toVar();

	return mx_gradient_scale3d( result );

} );

const mx_perlin_noise_float = overloadingFn( [ mx_perlin_noise_float_0, mx_perlin_noise_float_1 ] );

const mx_perlin_noise_vec3_0 = tslFn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const result = vec3( mx_bilerp( mx_gradient_vec3( mx_hash_vec3( X, Y ), fx, fy ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y ), fx.sub( 1.0 ), fy ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ) ), fx, fy.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ) ), u, v ) ).toVar();

	return mx_gradient_scale2d( result );

} );

const mx_perlin_noise_vec3_1 = tslFn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const fz = float( mx_floorfrac( p.z, Z ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const w = float( mx_fade( fz ) ).toVar();
	const result = vec3( mx_trilerp( mx_gradient_vec3( mx_hash_vec3( X, Y, Z ), fx, fy, fz ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y, Z ), fx.sub( 1.0 ), fy, fz ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ), Z ), fx, fy.sub( 1.0 ), fz ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz ), mx_gradient_vec3( mx_hash_vec3( X, Y, Z.add( int( 1 ) ) ), fx, fy, fz.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y, Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy, fz.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx, fy.sub( 1.0 ), fz.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz.sub( 1.0 ) ), u, v, w ) ).toVar();

	return mx_gradient_scale3d( result );

} );

const mx_perlin_noise_vec3 = overloadingFn( [ mx_perlin_noise_vec3_0, mx_perlin_noise_vec3_1 ] );

const mx_cell_noise_float_0 = tslFn( ( [ p_immutable ] ) => {

	const p = float( p_immutable ).toVar();
	const ix = int( mx_floor( p ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix ) );

} );

const mx_cell_noise_float_1 = tslFn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy ) );

} );

const mx_cell_noise_float_2 = tslFn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy, iz ) );

} );

const mx_cell_noise_float_3 = tslFn( ( [ p_immutable ] ) => {

	const p = vec4( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();
	const iw = int( mx_floor( p.w ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy, iz, iw ) );

} );

const mx_cell_noise_vec3_0 = tslFn( ( [ p_immutable ] ) => {

	const p = float( p_immutable ).toVar();
	const ix = int( mx_floor( p ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, int( 2 ) ) ) );

} );

const mx_cell_noise_vec3_1 = tslFn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, int( 2 ) ) ) );

} );

const mx_cell_noise_vec3_2 = tslFn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 2 ) ) ) );

} );

const mx_cell_noise_vec3_3 = tslFn( ( [ p_immutable ] ) => {

	const p = vec4( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();
	const iw = int( mx_floor( p.w ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 2 ) ) ) );

} );

const mx_cell_noise_vec3 = overloadingFn( [ mx_cell_noise_vec3_0, mx_cell_noise_vec3_1, mx_cell_noise_vec3_2, mx_cell_noise_vec3_3 ] );

const mx_fractal_noise_float = tslFn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const result = float( 0.0 ).toVar();
	const amplitude = float( 1.0 ).toVar();

	loop( { start: int( 0 ), end: octaves }, ( { i } ) => {

		result.addAssign( amplitude.mul( mx_perlin_noise_float( p ) ) );
		amplitude.mulAssign( diminish );
		p.mulAssign( lacunarity );

	} );

	return result;

} );

const mx_fractal_noise_vec3 = tslFn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const result = vec3( 0.0 ).toVar();
	const amplitude = float( 1.0 ).toVar();

	loop( { start: int( 0 ), end: octaves }, ( { i } ) => {

		result.addAssign( amplitude.mul( mx_perlin_noise_vec3( p ) ) );
		amplitude.mulAssign( diminish );
		p.mulAssign( lacunarity );

	} );

	return result;

} );

const mx_fractal_noise_vec2 = tslFn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();

	return vec2( mx_fractal_noise_float( p, octaves, lacunarity, diminish ), mx_fractal_noise_float( p.add( vec3( int( 19 ), int( 193 ), int( 17 ) ) ), octaves, lacunarity, diminish ) );

} );

const mx_fractal_noise_vec4 = tslFn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const c = vec3( mx_fractal_noise_vec3( p, octaves, lacunarity, diminish ) ).toVar();
	const f = float( mx_fractal_noise_float( p.add( vec3( int( 19 ), int( 193 ), int( 17 ) ) ), octaves, lacunarity, diminish ) ).toVar();

	return vec4( c, f );

} );

const mx_worley_distance_0 = tslFn( ( [ p_immutable, x_immutable, y_immutable, xoff_immutable, yoff_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const yoff = int( yoff_immutable ).toVar();
	const xoff = int( xoff_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const tmp = vec3( mx_cell_noise_vec3( vec2( x.add( xoff ), y.add( yoff ) ) ) ).toVar();
	const off = vec2( tmp.x, tmp.y ).toVar();
	off.subAssign( 0.5 );
	off.mulAssign( jitter );
	off.addAssign( 0.5 );
	const cellpos = vec2( vec2( float( x ), float( y ) ).add( off ) ).toVar();
	const diff = vec2( cellpos.sub( p ) ).toVar();

	If( metric.equal( int( 2 ) ), () => {

		return abs( diff.x ).add( abs( diff.y ) );

	} );

	If( metric.equal( int( 3 ) ), () => {

		return max$1( abs( diff.x ), abs( diff.y ) );

	} );

	return dot( diff, diff );

} );

const mx_worley_distance_1 = tslFn( ( [ p_immutable, x_immutable, y_immutable, z_immutable, xoff_immutable, yoff_immutable, zoff_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const zoff = int( zoff_immutable ).toVar();
	const yoff = int( yoff_immutable ).toVar();
	const xoff = int( xoff_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const off = vec3( mx_cell_noise_vec3( vec3( x.add( xoff ), y.add( yoff ), z.add( zoff ) ) ) ).toVar();
	off.subAssign( 0.5 );
	off.mulAssign( jitter );
	off.addAssign( 0.5 );
	const cellpos = vec3( vec3( float( x ), float( y ), float( z ) ).add( off ) ).toVar();
	const diff = vec3( cellpos.sub( p ) ).toVar();

	If( metric.equal( int( 2 ) ), () => {

		return abs( diff.x ).add( abs( diff.y ).add( abs( diff.z ) ) );

	} );

	If( metric.equal( int( 3 ) ), () => {

		return max$1( max$1( abs( diff.x ), abs( diff.y ) ), abs( diff.z ) );

	} );

	return dot( diff, diff );

} );

const mx_worley_distance = overloadingFn( [ mx_worley_distance_0, mx_worley_distance_1 ] );

const mx_worley_noise_float_0 = tslFn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = float( 1e6 ).toVar();

	loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();
			sqdist.assign( min$1( sqdist, dist ) );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

const mx_worley_noise_vec2_0 = tslFn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = vec2( 1e6, 1e6 ).toVar();

	loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();

			If( dist.lessThan( sqdist.x ), () => {

				sqdist.y.assign( sqdist.x );
				sqdist.x.assign( dist );

			} ).elseif( dist.lessThan( sqdist.y ), () => {

				sqdist.y.assign( dist );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

const mx_worley_noise_vec3_0 = tslFn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = vec3( 1e6, 1e6, 1e6 ).toVar();

	loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();

			If( dist.lessThan( sqdist.x ), () => {

				sqdist.z.assign( sqdist.y );
				sqdist.y.assign( sqdist.x );
				sqdist.x.assign( dist );

			} ).elseif( dist.lessThan( sqdist.y ), () => {

				sqdist.z.assign( sqdist.y );
				sqdist.y.assign( dist );

			} ).elseif( dist.lessThan( sqdist.z ), () => {

				sqdist.z.assign( dist );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

const mx_worley_noise_float_1 = tslFn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = float( 1e6 ).toVar();

	loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();
				sqdist.assign( min$1( sqdist, dist ) );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

const mx_worley_noise_vec2_1 = tslFn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = vec2( 1e6, 1e6 ).toVar();

	loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();

				If( dist.lessThan( sqdist.x ), () => {

					sqdist.y.assign( sqdist.x );
					sqdist.x.assign( dist );

				} ).elseif( dist.lessThan( sqdist.y ), () => {

					sqdist.y.assign( dist );

				} );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

const mx_worley_noise_vec3_1 = tslFn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = vec3( 1e6, 1e6, 1e6 ).toVar();

	loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();

				If( dist.lessThan( sqdist.x ), () => {

					sqdist.z.assign( sqdist.y );
					sqdist.y.assign( sqdist.x );
					sqdist.x.assign( dist );

				} ).elseif( dist.lessThan( sqdist.y ), () => {

					sqdist.z.assign( sqdist.y );
					sqdist.y.assign( dist );

				} ).elseif( dist.lessThan( sqdist.z ), () => {

					sqdist.z.assign( dist );

				} );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

// layouts

mx_select.setLayout( {
	name: 'mx_select',
	type: 'float',
	inputs: [
		{ name: 'b', type: 'bool' },
		{ name: 't', type: 'float' },
		{ name: 'f', type: 'float' }
	]
} );

mx_negate_if.setLayout( {
	name: 'mx_negate_if',
	type: 'float',
	inputs: [
		{ name: 'val', type: 'float' },
		{ name: 'b', type: 'bool' }
	]
} );

mx_floor.setLayout( {
	name: 'mx_floor',
	type: 'int',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

mx_bilerp_0.setLayout( {
	name: 'mx_bilerp_0',
	type: 'float',
	inputs: [
		{ name: 'v0', type: 'float' },
		{ name: 'v1', type: 'float' },
		{ name: 'v2', type: 'float' },
		{ name: 'v3', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' }
	]
} );

mx_bilerp_1.setLayout( {
	name: 'mx_bilerp_1',
	type: 'vec3',
	inputs: [
		{ name: 'v0', type: 'vec3' },
		{ name: 'v1', type: 'vec3' },
		{ name: 'v2', type: 'vec3' },
		{ name: 'v3', type: 'vec3' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' }
	]
} );

mx_trilerp_0.setLayout( {
	name: 'mx_trilerp_0',
	type: 'float',
	inputs: [
		{ name: 'v0', type: 'float' },
		{ name: 'v1', type: 'float' },
		{ name: 'v2', type: 'float' },
		{ name: 'v3', type: 'float' },
		{ name: 'v4', type: 'float' },
		{ name: 'v5', type: 'float' },
		{ name: 'v6', type: 'float' },
		{ name: 'v7', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' },
		{ name: 'r', type: 'float' }
	]
} );

mx_trilerp_1.setLayout( {
	name: 'mx_trilerp_1',
	type: 'vec3',
	inputs: [
		{ name: 'v0', type: 'vec3' },
		{ name: 'v1', type: 'vec3' },
		{ name: 'v2', type: 'vec3' },
		{ name: 'v3', type: 'vec3' },
		{ name: 'v4', type: 'vec3' },
		{ name: 'v5', type: 'vec3' },
		{ name: 'v6', type: 'vec3' },
		{ name: 'v7', type: 'vec3' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' },
		{ name: 'r', type: 'float' }
	]
} );

mx_gradient_float_0.setLayout( {
	name: 'mx_gradient_float_0',
	type: 'float',
	inputs: [
		{ name: 'hash', type: 'uint' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
} );

mx_gradient_float_1.setLayout( {
	name: 'mx_gradient_float_1',
	type: 'float',
	inputs: [
		{ name: 'hash', type: 'uint' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' },
		{ name: 'z', type: 'float' }
	]
} );

mx_gradient_vec3_0.setLayout( {
	name: 'mx_gradient_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'hash', type: 'uvec3' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
} );

mx_gradient_vec3_1.setLayout( {
	name: 'mx_gradient_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'hash', type: 'uvec3' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' },
		{ name: 'z', type: 'float' }
	]
} );

mx_gradient_scale2d_0.setLayout( {
	name: 'mx_gradient_scale2d_0',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' }
	]
} );

mx_gradient_scale3d_0.setLayout( {
	name: 'mx_gradient_scale3d_0',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' }
	]
} );

mx_gradient_scale2d_1.setLayout( {
	name: 'mx_gradient_scale2d_1',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' }
	]
} );

mx_gradient_scale3d_1.setLayout( {
	name: 'mx_gradient_scale3d_1',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' }
	]
} );

mx_rotl32.setLayout( {
	name: 'mx_rotl32',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'uint' },
		{ name: 'k', type: 'int' }
	]
} );

mx_bjfinal.setLayout( {
	name: 'mx_bjfinal',
	type: 'uint',
	inputs: [
		{ name: 'a', type: 'uint' },
		{ name: 'b', type: 'uint' },
		{ name: 'c', type: 'uint' }
	]
} );

mx_bits_to_01.setLayout( {
	name: 'mx_bits_to_01',
	type: 'float',
	inputs: [
		{ name: 'bits', type: 'uint' }
	]
} );

mx_fade.setLayout( {
	name: 'mx_fade',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' }
	]
} );

mx_hash_int_0.setLayout( {
	name: 'mx_hash_int_0',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' }
	]
} );

mx_hash_int_1.setLayout( {
	name: 'mx_hash_int_1',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' }
	]
} );

mx_hash_int_2.setLayout( {
	name: 'mx_hash_int_2',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' }
	]
} );

mx_hash_int_3.setLayout( {
	name: 'mx_hash_int_3',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xx', type: 'int' }
	]
} );

mx_hash_int_4.setLayout( {
	name: 'mx_hash_int_4',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xx', type: 'int' },
		{ name: 'yy', type: 'int' }
	]
} );

mx_hash_vec3_0.setLayout( {
	name: 'mx_hash_vec3_0',
	type: 'uvec3',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' }
	]
} );

mx_hash_vec3_1.setLayout( {
	name: 'mx_hash_vec3_1',
	type: 'uvec3',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' }
	]
} );

mx_perlin_noise_float_0.setLayout( {
	name: 'mx_perlin_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

mx_perlin_noise_float_1.setLayout( {
	name: 'mx_perlin_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

mx_perlin_noise_vec3_0.setLayout( {
	name: 'mx_perlin_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

mx_perlin_noise_vec3_1.setLayout( {
	name: 'mx_perlin_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

mx_cell_noise_float_0.setLayout( {
	name: 'mx_cell_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'float' }
	]
} );

mx_cell_noise_float_1.setLayout( {
	name: 'mx_cell_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

mx_cell_noise_float_2.setLayout( {
	name: 'mx_cell_noise_float_2',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

mx_cell_noise_float_3.setLayout( {
	name: 'mx_cell_noise_float_3',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec4' }
	]
} );

mx_cell_noise_vec3_0.setLayout( {
	name: 'mx_cell_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'float' }
	]
} );

mx_cell_noise_vec3_1.setLayout( {
	name: 'mx_cell_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

mx_cell_noise_vec3_2.setLayout( {
	name: 'mx_cell_noise_vec3_2',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

mx_cell_noise_vec3_3.setLayout( {
	name: 'mx_cell_noise_vec3_3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec4' }
	]
} );

mx_fractal_noise_float.setLayout( {
	name: 'mx_fractal_noise_float',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

mx_fractal_noise_vec3.setLayout( {
	name: 'mx_fractal_noise_vec3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

mx_fractal_noise_vec2.setLayout( {
	name: 'mx_fractal_noise_vec2',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

mx_fractal_noise_vec4.setLayout( {
	name: 'mx_fractal_noise_vec4',
	type: 'vec4',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

mx_worley_distance_0.setLayout( {
	name: 'mx_worley_distance_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'xoff', type: 'int' },
		{ name: 'yoff', type: 'int' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_distance_1.setLayout( {
	name: 'mx_worley_distance_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xoff', type: 'int' },
		{ name: 'yoff', type: 'int' },
		{ name: 'zoff', type: 'int' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_noise_float_0.setLayout( {
	name: 'mx_worley_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_noise_vec2_0.setLayout( {
	name: 'mx_worley_noise_vec2_0',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_noise_vec3_0.setLayout( {
	name: 'mx_worley_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_noise_float_1.setLayout( {
	name: 'mx_worley_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_noise_vec2_1.setLayout( {
	name: 'mx_worley_noise_vec2_1',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

mx_worley_noise_vec3_1.setLayout( {
	name: 'mx_worley_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

// Three.js Transpiler
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_hsv.glsl


const mx_hsvtorgb = tslFn( ( [ hsv_immutable ] ) => {

	const hsv = vec3( hsv_immutable ).toVar();
	const h = float( hsv.x ).toVar();
	const s = float( hsv.y ).toVar();
	const v = float( hsv.z ).toVar();

	If( s.lessThan( 0.0001 ), () => {

		return vec3( v, v, v );

	} ).else( () => {

		h.assign( mul( 6.0, h.sub( floor( h ) ) ) );
		const hi = int( trunc( h ) ).toVar();
		const f = float( h.sub( float( hi ) ) ).toVar();
		const p = float( v.mul( sub( 1.0, s ) ) ).toVar();
		const q = float( v.mul( sub( 1.0, s.mul( f ) ) ) ).toVar();
		const t = float( v.mul( sub( 1.0, s.mul( sub( 1.0, f ) ) ) ) ).toVar();

		If( hi.equal( int( 0 ) ), () => {

			return vec3( v, t, p );

		} ).elseif( hi.equal( int( 1 ) ), () => {

			return vec3( q, v, p );

		} ).elseif( hi.equal( int( 2 ) ), () => {

			return vec3( p, v, t );

		} ).elseif( hi.equal( int( 3 ) ), () => {

			return vec3( p, q, v );

		} ).elseif( hi.equal( int( 4 ) ), () => {

			return vec3( t, p, v );

		} );

		return vec3( v, p, q );

	} );

} );

const mx_rgbtohsv = tslFn( ( [ c_immutable ] ) => {

	const c = vec3( c_immutable ).toVar();
	const r = float( c.x ).toVar();
	const g = float( c.y ).toVar();
	const b = float( c.z ).toVar();
	const mincomp = float( min$1( r, min$1( g, b ) ) ).toVar();
	const maxcomp = float( max$1( r, max$1( g, b ) ) ).toVar();
	const delta = float( maxcomp.sub( mincomp ) ).toVar();
	const h = float().toVar(), s = float().toVar(), v = float().toVar();
	v.assign( maxcomp );

	If( maxcomp.greaterThan( 0.0 ), () => {

		s.assign( delta.div( maxcomp ) );

	} ).else( () => {

		s.assign( 0.0 );

	} );

	If( s.lessThanEqual( 0.0 ), () => {

		h.assign( 0.0 );

	} ).else( () => {

		If( r.greaterThanEqual( maxcomp ), () => {

			h.assign( g.sub( b ).div( delta ) );

		} ).elseif( g.greaterThanEqual( maxcomp ), () => {

			h.assign( add( 2.0, b.sub( r ).div( delta ) ) );

		} ).else( () => {

			h.assign( add( 4.0, r.sub( g ).div( delta ) ) );

		} );

		h.mulAssign( 1.0 / 6.0 );

		If( h.lessThan( 0.0 ), () => {

			h.addAssign( 1.0 );

		} );

	} );

	return vec3( h, s, v );

} );

// layouts

mx_hsvtorgb.setLayout( {
	name: 'mx_hsvtorgb',
	type: 'vec3',
	inputs: [
		{ name: 'hsv', type: 'vec3' }
	]
} );

mx_rgbtohsv.setLayout( {
	name: 'mx_rgbtohsv',
	type: 'vec3',
	inputs: [
		{ name: 'c', type: 'vec3' }
	]
} );

// Three.js Transpiler
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_transform_color.glsl


const mx_srgb_texture_to_lin_rec709 = tslFn( ( [ color_immutable ] ) => {

	const color = vec3( color_immutable ).toVar();
	const isAbove = bvec3( greaterThan( color, vec3( 0.04045 ) ) ).toVar();
	const linSeg = vec3( color.div( 12.92 ) ).toVar();
	const powSeg = vec3( pow( max$1( color.add( vec3( 0.055 ) ), vec3( 0.0 ) ).div( 1.055 ), vec3( 2.4 ) ) ).toVar();

	return mix( linSeg, powSeg, isAbove );

} );

// layouts

mx_srgb_texture_to_lin_rec709.setLayout( {
	name: 'mx_srgb_texture_to_lin_rec709',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.material.id !== b.material.id ) {

		return a.material.id - b.material.id;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

function reversePainterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.z !== b.z ) {

		return b.z - a.z;

	} else {

		return a.id - b.id;

	}

}

class RenderList {

	constructor() {

		this.renderItems = [];
		this.renderItemsIndex = 0;

		this.opaque = [];
		this.transparent = [];

		this.lightsNode = new LightsNode( [] );
		this.lightsArray = [];

		this.occlusionQueryCount = 0;

	}

	begin() {

		this.renderItemsIndex = 0;

		this.opaque.length = 0;
		this.transparent.length = 0;
		this.lightsArray.length = 0;

		this.occlusionQueryCount = 0;

		return this;

	}

	getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		let renderItem = this.renderItems[ this.renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group
			};

			this.renderItems[ this.renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		this.renderItemsIndex ++;

		return renderItem;

	}

	push( object, geometry, material, groupOrder, z, group ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group );

		if ( object.occlusionTest === true ) this.occlusionQueryCount ++;

		( material.transparent === true ? this.transparent : this.opaque ).push( renderItem );

	}

	unshift( object, geometry, material, groupOrder, z, group ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? this.transparent : this.opaque ).unshift( renderItem );

	}

	pushLight( light ) {

		this.lightsArray.push( light );

	}

	getLightsNode() {

		return this.lightsNode.fromLights( this.lightsArray );

	}

	sort( customOpaqueSort, customTransparentSort ) {

		if ( this.opaque.length > 1 ) this.opaque.sort( customOpaqueSort || painterSortStable );
		if ( this.transparent.length > 1 ) this.transparent.sort( customTransparentSort || reversePainterSortStable );

	}

	finish() {

		// update lights

		this.lightsNode.fromLights( this.lightsArray );

		// Clear references from inactive renderItems in the list

		for ( let i = this.renderItemsIndex, il = this.renderItems.length; i < il; i ++ ) {

			const renderItem = this.renderItems[ i ];

			if ( renderItem.id === null ) break;

			renderItem.id = null;
			renderItem.object = null;
			renderItem.geometry = null;
			renderItem.material = null;
			renderItem.groupOrder = null;
			renderItem.renderOrder = null;
			renderItem.z = null;
			renderItem.group = null;

		}

	}

}

class RenderLists {

	constructor() {

		this.lists = new ChainMap();

	}

	get( scene, camera ) {

		const lists = this.lists;
		const keys = [ scene, camera ];

		let list = lists.get( keys );

		if ( list === undefined ) {

			list = new RenderList();
			lists.set( keys, list );

		}

		return list;

	}

	dispose() {

		this.lists = new ChainMap();

	}

}

let id$2 = 0;

class RenderContext {

	constructor() {

		this.id = id$2 ++;

		this.color = true;
		this.clearColor = true;
		this.clearColorValue = { r: 0, g: 0, b: 0, a: 1 };

		this.depth = true;
		this.clearDepth = true;
		this.clearDepthValue = 1;

		this.stencil = true;
		this.clearStencil = true;
		this.clearStencilValue = 1;

		this.viewport = false;
		this.viewportValue = new Vector4();

		this.scissor = false;
		this.scissorValue = new Vector4();

		this.textures = null;
		this.depthTexture = null;
		this.activeCubeFace = 0;
		this.sampleCount = 1;

		this.width = 0;
		this.height = 0;

		this.isRenderContext = true;

	}

}

class RenderContexts {

	constructor() {

		this.chainMaps = {};

	}

	get( scene, camera, renderTarget = null ) {

		const chainKey = [ scene, camera ];

		let attachmentState;

		if ( renderTarget === null ) {

			attachmentState = 'default';

		} else {

			const format = renderTarget.texture.format;
			const count = renderTarget.count;

			attachmentState = `${ count }:${ format }:${ renderTarget.samples }:${ renderTarget.depthBuffer }:${ renderTarget.stencilBuffer }`;

		}

		const chainMap = this.getChainMap( attachmentState );

		let renderState = chainMap.get( chainKey );

		if ( renderState === undefined ) {

			renderState = new RenderContext();

			chainMap.set( chainKey, renderState );

		}

		if ( renderTarget !== null ) renderState.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

		return renderState;

	}

	getChainMap( attachmentState ) {

		return this.chainMaps[ attachmentState ] || ( this.chainMaps[ attachmentState ] = new ChainMap() );

	}

	dispose() {

		this.chainMaps = {};

	}

}

const _size = new Vector3();

class Textures extends DataMap {

	constructor( renderer, backend, info ) {

		super();

		this.renderer = renderer;
		this.backend = backend;
		this.info = info;

	}

	updateRenderTarget( renderTarget, activeMipmapLevel = 0 ) {

		const renderTargetData = this.get( renderTarget );

		const sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;
		const depthTextureMips = renderTargetData.depthTextureMips || ( renderTargetData.depthTextureMips = {} );

		const texture = renderTarget.texture;
		const textures = renderTarget.textures;

		const size = this.getSize( texture );

		const mipWidth = size.width >> activeMipmapLevel;
		const mipHeight = size.height >> activeMipmapLevel;

		let depthTexture = renderTarget.depthTexture || depthTextureMips[ activeMipmapLevel ];
		let textureNeedsUpdate = false;

		if ( depthTexture === undefined ) {

			depthTexture = new DepthTexture();
			depthTexture.format = renderTarget.stencilBuffer ? DepthStencilFormat : DepthFormat;
			depthTexture.type = renderTarget.stencilBuffer ? UnsignedInt248Type : UnsignedIntType;
			depthTexture.image.width = mipWidth;
			depthTexture.image.height = mipHeight;

			depthTextureMips[ activeMipmapLevel ] = depthTexture;

		}

		if ( renderTargetData.width !== size.width || size.height !== renderTargetData.height ) {

			textureNeedsUpdate = true;
			depthTexture.needsUpdate = true;

			depthTexture.image.width = mipWidth;
			depthTexture.image.height = mipHeight;

		}

		renderTargetData.width = size.width;
		renderTargetData.height = size.height;
		renderTargetData.textures = textures;
		renderTargetData.depthTexture = depthTexture;
		renderTargetData.depth = renderTarget.depthBuffer;
		renderTargetData.stencil = renderTarget.stencilBuffer;
		renderTargetData.renderTarget = renderTarget;

		if ( renderTargetData.sampleCount !== sampleCount ) {

			textureNeedsUpdate = true;
			depthTexture.needsUpdate = true;

			renderTargetData.sampleCount = sampleCount;

		}

		//

		const options = { sampleCount };

		for ( let i = 0; i < textures.length; i ++ ) {

			const texture = textures[ i ];

			if ( textureNeedsUpdate ) texture.needsUpdate = true;

			this.updateTexture( texture, options );

		}

		this.updateTexture( depthTexture, options );

		// dispose handler

		if ( renderTargetData.initialized !== true ) {

			renderTargetData.initialized = true;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				if ( textures !== undefined ) {

					for ( let i = 0; i < textures.length; i ++ ) {

						this._destroyTexture( textures[ i ] );

					}

				} else {

					this._destroyTexture( texture );

				}

				this._destroyTexture( depthTexture );

			};

			renderTarget.addEventListener( 'dispose', onDispose );

		}

	}

	updateTexture( texture, options = {} ) {

		const textureData = this.get( texture );
		if ( textureData.initialized === true && textureData.version === texture.version ) return;

		const isRenderTarget = texture.isRenderTargetTexture || texture.isDepthTexture || texture.isFramebufferTexture;
		const backend = this.backend;

		if ( isRenderTarget && textureData.initialized === true ) {

			// it's an update

			backend.destroySampler( texture );
			backend.destroyTexture( texture );

		}

		//

		if ( texture.isFramebufferTexture ) {

			const renderer = this.renderer;
			const renderTarget = renderer.getRenderTarget();

			if ( renderTarget ) {

				texture.type = renderTarget.texture.type;

			} else {

				texture.type = UnsignedByteType;

			}

		}

		//

		const { width, height, depth } = this.getSize( texture );

		options.width = width;
		options.height = height;
		options.depth = depth;
		options.needsMipmaps = this.needsMipmaps( texture );
		options.levels = options.needsMipmaps ? this.getMipLevels( texture, width, height ) : 1;

		//

		if ( isRenderTarget || texture.isStorageTexture === true ) {

			backend.createSampler( texture );
			backend.createTexture( texture, options );

		} else {

			const needsCreate = textureData.initialized !== true;

			if ( needsCreate ) backend.createSampler( texture );

			if ( texture.version > 0 ) {

				const image = texture.image;

				if ( image === undefined ) {

					console.warn( 'THREE.Renderer: Texture marked for update but image is undefined.' );

				} else if ( image.complete === false ) {

					console.warn( 'THREE.Renderer: Texture marked for update but image is incomplete.' );

				} else {

					if ( texture.images ) {

						const images = [];

						for ( const image of texture.images ) {

							images.push( image );

						}

						options.images = images;

					} else {

						options.image = image;

					}

					if ( textureData.isDefaultTexture === undefined || textureData.isDefaultTexture === true ) {

						backend.createTexture( texture, options );

						textureData.isDefaultTexture = false;

					}

					if ( texture.source.dataReady === true ) backend.updateTexture( texture, options );

					if ( options.needsMipmaps && texture.mipmaps.length === 0 ) backend.generateMipmaps( texture );

				}

			} else {

				// async update

				backend.createDefaultTexture( texture );

				textureData.isDefaultTexture = true;

			}

		}

		// dispose handler

		if ( textureData.initialized !== true ) {

			textureData.initialized = true;

			//

			this.info.memory.textures ++;

			// dispose

			const onDispose = () => {

				texture.removeEventListener( 'dispose', onDispose );

				this._destroyTexture( texture );

				this.info.memory.textures --;

			};

			texture.addEventListener( 'dispose', onDispose );

		}

		//

		textureData.version = texture.version;

	}

	getSize( texture, target = _size ) {

		let image = texture.images ? texture.images[ 0 ] : texture.image;

		if ( image ) {

			if ( image.image !== undefined ) image = image.image;

			target.width = image.width;
			target.height = image.height;
			target.depth = texture.isCubeTexture ? 6 : ( image.depth || 1 );

		} else {

			target.width = target.height = target.depth = 1;

		}

		return target;

	}

	getMipLevels( texture, width, height ) {

		let mipLevelCount;

		if ( texture.isCompressedTexture ) {

			mipLevelCount = texture.mipmaps.length;

		} else {

			mipLevelCount = Math.floor( Math.log2( Math.max( width, height ) ) ) + 1;

		}

		return mipLevelCount;

	}

	needsMipmaps( texture ) {

		if ( this.isEnvironmentTexture( texture ) ) return true;

		return ( texture.isCompressedTexture === true ) || ( ( texture.minFilter !== NearestFilter ) && ( texture.minFilter !== LinearFilter ) );

	}

	isEnvironmentTexture( texture ) {

		const mapping = texture.mapping;

		return ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) || ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

	}

	_destroyTexture( texture ) {

		this.backend.destroySampler( texture );
		this.backend.destroyTexture( texture );

		this.delete( texture );

	}

}

class Color4 extends Color {

	constructor( r, g, b, a = 1 ) {

		super( r, g, b );

		this.a = a;

	}

	set( r, g, b, a = 1 ) {

		this.a = a;

		return super.set( r, g, b );

	}

	copy( color ) {

		if ( color.a !== undefined ) this.a = color.a;

		return super.copy( color );

	}

	clone() {

		return new this.constructor( this.r, this.g, this.b, this.a );

	}

}

const _clearColor = new Color4();

class Background extends DataMap {

	constructor( renderer, nodes ) {

		super();

		this.renderer = renderer;
		this.nodes = nodes;

	}

	update( scene, renderList, renderContext ) {

		const renderer = this.renderer;
		const background = this.nodes.getBackgroundNode( scene ) || scene.background;

		let forceClear = false;

		if ( background === null ) {

			// no background settings, use clear color configuration from the renderer

			renderer._clearColor.getRGB( _clearColor, this.renderer.currentColorSpace );
			_clearColor.a = renderer._clearColor.a;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			background.getRGB( _clearColor, this.renderer.currentColorSpace );
			_clearColor.a = 1;

			forceClear = true;

		} else if ( background.isNode === true ) {

			const sceneData = this.get( scene );
			const backgroundNode = background;

			_clearColor.copy( renderer._clearColor );

			let backgroundMesh = sceneData.backgroundMesh;

			if ( backgroundMesh === undefined ) {

				const backgroundMeshNode = context( vec4( backgroundNode ), {
					// @TODO: Add Texture2D support using node context
					getUV: () => normalWorld,
					getTextureLevel: ( textureNode ) => backgroundBlurriness.mul( maxMipLevel( textureNode ) )
				} ).mul( backgroundIntensity );

				let viewProj = modelViewProjection();
				viewProj = viewProj.setZ( viewProj.w );

				const nodeMaterial = new NodeMaterial();
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.fog = false;
				nodeMaterial.vertexNode = viewProj;
				nodeMaterial.fragmentNode = backgroundMeshNode;

				sceneData.backgroundMeshNode = backgroundMeshNode;
				sceneData.backgroundMesh = backgroundMesh = new Mesh( new SphereGeometry( 1, 32, 32 ), nodeMaterial );
				backgroundMesh.frustumCulled = false;

				backgroundMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

			}

			const backgroundCacheKey = backgroundNode.getCacheKey();

			if ( sceneData.backgroundCacheKey !== backgroundCacheKey ) {

				sceneData.backgroundMeshNode.node = vec4( backgroundNode );

				backgroundMesh.material.needsUpdate = true;

				sceneData.backgroundCacheKey = backgroundCacheKey;

			}

			renderList.unshift( backgroundMesh, backgroundMesh.geometry, backgroundMesh.material, 0, 0, null );

		} else {

			console.error( 'THREE.Renderer: Unsupported background configuration.', background );

		}

		//

		if ( renderer.autoClear === true || forceClear === true ) {

			_clearColor.multiplyScalar( _clearColor.a );

			const clearColorValue = renderContext.clearColorValue;

			clearColorValue.r = _clearColor.r;
			clearColorValue.g = _clearColor.g;
			clearColorValue.b = _clearColor.b;
			clearColorValue.a = _clearColor.a;

			renderContext.depthClearValue = renderer._clearDepth;
			renderContext.stencilClearValue = renderer._clearStencil;

			renderContext.clearColor = renderer.autoClearColor === true;
			renderContext.clearDepth = renderer.autoClearDepth === true;
			renderContext.clearStencil = renderer.autoClearStencil === true;

		} else {

			renderContext.clearColor = false;
			renderContext.clearDepth = false;
			renderContext.clearStencil = false;

		}

	}

}

class NodeBuilderState {

	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, transforms = [] ) {

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.computeShader = computeShader;
		this.transforms = transforms;

		this.nodeAttributes = nodeAttributes;
		this.bindings = bindings;

		this.updateNodes = updateNodes;
		this.updateBeforeNodes = updateBeforeNodes;

		this.usedTimes = 0;

	}

	createBindings() {

		const bindingsArray = [];

		for ( const instanceBinding of this.bindings ) {

			let binding = instanceBinding;

			if ( instanceBinding.shared !== true ) {

				binding = instanceBinding.clone();

			}

			bindingsArray.push( binding );

		}

		return bindingsArray;

	}

}

class Nodes extends DataMap {

	constructor( renderer, backend ) {

		super();

		this.renderer = renderer;
		this.backend = backend;
		this.nodeFrame = new NodeFrame();
		this.nodeBuilderCache = new Map();
		this.callHashCache = new ChainMap();
		this.groupsData = new ChainMap();

	}

	updateGroup( nodeUniformsGroup ) {

		const groupNode = nodeUniformsGroup.groupNode;
		const name = groupNode.name;

		// objectGroup is every updated

		if ( name === objectGroup.name ) return true;

		// renderGroup is updated once per render/compute call

		if ( name === renderGroup.name ) {

			const uniformsGroupData = this.get( nodeUniformsGroup );
			const renderId = this.nodeFrame.renderId;

			if ( uniformsGroupData.renderId !== renderId ) {

				uniformsGroupData.renderId = renderId;

				return true;

			}

			return false;

		}

		// frameGroup is updated once per frame

		if ( name === frameGroup.name ) {

			const uniformsGroupData = this.get( nodeUniformsGroup );
			const frameId = this.nodeFrame.frameId;

			if ( uniformsGroupData.frameId !== frameId ) {

				uniformsGroupData.frameId = frameId;

				return true;

			}

			return false;

		}

		// other groups are updated just when groupNode.needsUpdate is true

		const groupChain = [ groupNode, nodeUniformsGroup ];

		let groupData = this.groupsData.get( groupChain );
		if ( groupData === undefined ) this.groupsData.set( groupChain, groupData = {} );

		if ( groupData.version !== groupNode.version ) {

			groupData.version = groupNode.version;

			return true;

		}

		return false;

	}

	getForRenderCacheKey( renderObject ) {

		return renderObject.initialCacheKey;

	}

	getForRender( renderObject ) {

		const renderObjectData = this.get( renderObject );

		let nodeBuilderState = renderObjectData.nodeBuilderState;

		if ( nodeBuilderState === undefined ) {

			const { nodeBuilderCache } = this;

			const cacheKey = this.getForRenderCacheKey( renderObject );

			nodeBuilderState = nodeBuilderCache.get( cacheKey );

			if ( nodeBuilderState === undefined ) {

				const nodeBuilder = this.backend.createNodeBuilder( renderObject.object, this.renderer, renderObject.scene );
				nodeBuilder.material = renderObject.material;
				nodeBuilder.context.material = renderObject.material;
				nodeBuilder.lightsNode = renderObject.lightsNode;
				nodeBuilder.environmentNode = this.getEnvironmentNode( renderObject.scene );
				nodeBuilder.fogNode = this.getFogNode( renderObject.scene );
				nodeBuilder.toneMappingNode = this.getToneMappingNode();
				nodeBuilder.clippingContext = renderObject.clippingContext;
				nodeBuilder.build();

				nodeBuilderState = this._createNodeBuilderState( nodeBuilder );

				nodeBuilderCache.set( cacheKey, nodeBuilderState );

			}

			nodeBuilderState.usedTimes ++;

			renderObjectData.nodeBuilderState = nodeBuilderState;

		}

		return nodeBuilderState;

	}

	delete( object ) {

		if ( object.isRenderObject ) {

			const nodeBuilderState = this.get( object ).nodeBuilderState;
			nodeBuilderState.usedTimes --;

			if ( nodeBuilderState.usedTimes === 0 ) {

				this.nodeBuilderCache.delete( this.getForRenderCacheKey( object ) );

			}

		}

		return super.delete( object );

	}

	getForCompute( computeNode ) {

		const computeData = this.get( computeNode );

		let nodeBuilderState = computeData.nodeBuilderState;

		if ( nodeBuilderState === undefined ) {

			const nodeBuilder = this.backend.createNodeBuilder( computeNode, this.renderer );
			nodeBuilder.build();

			nodeBuilderState = this._createNodeBuilderState( nodeBuilder );

			computeData.nodeBuilderState = nodeBuilderState;

		}

		return nodeBuilderState;

	}

	_createNodeBuilderState( nodeBuilder ) {

		return new NodeBuilderState(
			nodeBuilder.vertexShader,
			nodeBuilder.fragmentShader,
			nodeBuilder.computeShader,
			nodeBuilder.getAttributesArray(),
			nodeBuilder.getBindings(),
			nodeBuilder.updateNodes,
			nodeBuilder.updateBeforeNodes,
			nodeBuilder.transforms
		);

	}

	getEnvironmentNode( scene ) {

		return scene.environmentNode || this.get( scene ).environmentNode || null;

	}

	getBackgroundNode( scene ) {

		return scene.backgroundNode || this.get( scene ).backgroundNode || null;

	}

	getFogNode( scene ) {

		return scene.fogNode || this.get( scene ).fogNode || null;

	}

	getToneMappingNode() {

		if ( this.isToneMappingState === false ) return null;

		return this.renderer.toneMappingNode || this.get( this.renderer ).toneMappingNode || null;

	}

	getCacheKey( scene, lightsNode ) {

		const chain = [ scene, lightsNode ];
		const callId = this.renderer.info.calls;

		let cacheKeyData = this.callHashCache.get( chain );

		if ( cacheKeyData === undefined || cacheKeyData.callId !== callId ) {

			const environmentNode = this.getEnvironmentNode( scene );
			const fogNode = this.getFogNode( scene );
			const toneMappingNode = this.getToneMappingNode();

			const cacheKey = [];

			if ( lightsNode ) cacheKey.push( lightsNode.getCacheKey() );
			if ( environmentNode ) cacheKey.push( environmentNode.getCacheKey() );
			if ( fogNode ) cacheKey.push( fogNode.getCacheKey() );
			if ( toneMappingNode ) cacheKey.push( toneMappingNode.getCacheKey() );

			cacheKeyData = {
				callId,
				cacheKey: cacheKey.join( ',' )
			};

			this.callHashCache.set( chain, cacheKeyData );

		}

		return cacheKeyData.cacheKey;

	}

	updateScene( scene ) {

		this.updateEnvironment( scene );
		this.updateFog( scene );
		this.updateBackground( scene );
		this.updateToneMapping();

	}

	get isToneMappingState() {

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		return renderTarget && renderTarget.isCubeRenderTarget ? false : true;

	}

	updateToneMapping() {

		const renderer = this.renderer;
		const rendererData = this.get( renderer );
		const rendererToneMapping = renderer.toneMapping;

		if ( this.isToneMappingState && rendererToneMapping !== NoToneMapping ) {

			if ( rendererData.toneMapping !== rendererToneMapping ) {

				const rendererToneMappingNode = rendererData.rendererToneMappingNode || toneMapping( rendererToneMapping, reference( 'toneMappingExposure', 'float', renderer ) );
				rendererToneMappingNode.toneMapping = rendererToneMapping;

				rendererData.rendererToneMappingNode = rendererToneMappingNode;
				rendererData.toneMappingNode = rendererToneMappingNode;
				rendererData.toneMapping = rendererToneMapping;

			}

		} else {

			// Don't delete rendererData.rendererToneMappingNode
			delete rendererData.toneMappingNode;
			delete rendererData.toneMapping;

		}

	}

	updateBackground( scene ) {

		const sceneData = this.get( scene );
		const background = scene.background;

		if ( background ) {

			if ( sceneData.background !== background ) {

				let backgroundNode = null;

				if ( background.isCubeTexture === true ) {

					backgroundNode = cubeTexture( background, normalWorld );

				} else if ( background.isTexture === true ) {

					let nodeUV = null;

					if ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping ) {

						nodeUV = equirectUV();
						background.flipY = false;

					} else {

						nodeUV = viewportBottomLeft;

					}

					backgroundNode = texture( background, nodeUV ).setUpdateMatrix( true );

				} else if ( background.isColor !== true ) {

					console.error( 'WebGPUNodes: Unsupported background configuration.', background );

				}

				sceneData.backgroundNode = backgroundNode;
				sceneData.background = background;

			}

		} else if ( sceneData.backgroundNode ) {

			delete sceneData.backgroundNode;
			delete sceneData.background;

		}

	}

	updateFog( scene ) {

		const sceneData = this.get( scene );
		const fog = scene.fog;

		if ( fog ) {

			if ( sceneData.fog !== fog ) {

				let fogNode = null;

				if ( fog.isFogExp2 ) {

					fogNode = densityFog( reference( 'color', 'color', fog ), reference( 'density', 'float', fog ) );

				} else if ( fog.isFog ) {

					fogNode = rangeFog( reference( 'color', 'color', fog ), reference( 'near', 'float', fog ), reference( 'far', 'float', fog ) );

				} else {

					console.error( 'WebGPUNodes: Unsupported fog configuration.', fog );

				}

				sceneData.fogNode = fogNode;
				sceneData.fog = fog;

			}

		} else {

			delete sceneData.fogNode;
			delete sceneData.fog;

		}

	}

	updateEnvironment( scene ) {

		const sceneData = this.get( scene );
		const environment = scene.environment;

		if ( environment ) {

			if ( sceneData.environment !== environment ) {

				let environmentNode = null;

				if ( environment.isCubeTexture === true ) {

					environmentNode = cubeTexture( environment );

				} else if ( environment.isTexture === true ) {

					environmentNode = texture( environment );

				} else {

					console.error( 'Nodes: Unsupported environment configuration.', environment );

				}

				sceneData.environmentNode = environmentNode;
				sceneData.environment = environment;

			}

		} else if ( sceneData.environmentNode ) {

			delete sceneData.environmentNode;
			delete sceneData.environment;

		}

	}

	getNodeFrame( renderer = this.renderer, scene = null, object = null, camera = null, material = null ) {

		const nodeFrame = this.nodeFrame;
		nodeFrame.renderer = renderer;
		nodeFrame.scene = scene;
		nodeFrame.object = object;
		nodeFrame.camera = camera;
		nodeFrame.material = material;

		return nodeFrame;

	}

	getNodeFrameForRender( renderObject ) {

		return this.getNodeFrame( renderObject.renderer, renderObject.scene, renderObject.object, renderObject.camera, renderObject.material );

	}

	updateBefore( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateBeforeNodes ) {

			nodeFrame.updateBeforeNode( node );

		}

	}

	updateForCompute( computeNode ) {

		const nodeFrame = this.getNodeFrame();
		const nodeBuilder = this.getForCompute( computeNode );

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	updateForRender( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateNodes ) {

			nodeFrame.updateNode( node );

		}

	}

	dispose() {

		super.dispose();

		this.nodeFrame = new NodeFrame();
		this.nodeBuilderCache = new Map();

	}

}

const _scene = new Scene();
const _drawingBufferSize = new Vector2();
const _screen = new Vector4();
const _frustum = new Frustum();
const _projScreenMatrix = new Matrix4();
const _vector3 = new Vector3();

class Renderer {

	constructor( backend, parameters = {} ) {

		this.isRenderer = true;

		//

		const {
			logarithmicDepthBuffer = false,
			alpha = true
		} = parameters;

		// public

		this.domElement = backend.getDomElement();

		this.backend = backend;

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.alpha = alpha;

		this.logarithmicDepthBuffer = logarithmicDepthBuffer;

		this.outputColorSpace = SRGBColorSpace;

		this.toneMapping = NoToneMapping;
		this.toneMappingExposure = 1.0;

		this.sortObjects = true;

		this.depth = true;
		this.stencil = true;

		this.clippingPlanes = [];

		this.info = new Info();

		// internals

		this._pixelRatio = 1;
		this._width = this.domElement.width;
		this._height = this.domElement.height;

		this._viewport = new Vector4( 0, 0, this._width, this._height );
		this._scissor = new Vector4( 0, 0, this._width, this._height );
		this._scissorTest = false;

		this._attributes = null;
		this._geometries = null;
		this._nodes = null;
		this._animation = null;
		this._bindings = null;
		this._objects = null;
		this._pipelines = null;
		this._renderLists = null;
		this._renderContexts = null;
		this._textures = null;
		this._background = null;

		this._currentRenderContext = null;

		this._opaqueSort = null;
		this._transparentSort = null;


		const alphaClear = this.alpha === true ? 0 : 1;

		this._clearColor = new Color4( 0, 0, 0, alphaClear );
		this._clearDepth = 1;
		this._clearStencil = 0;

		this._renderTarget = null;
		this._activeCubeFace = 0;
		this._activeMipmapLevel = 0;

		this._renderObjectFunction = null;
		this._currentRenderObjectFunction = null;

		this._handleObjectFunction = this._renderObjectDirect;

		this._initialized = false;
		this._initPromise = null;

		this._compilationPromises = null;

		// backwards compatibility

		this.shadowMap = {
			enabled: false,
			type: null
		};

		this.xr = {
			enabled: false
		};

	}

	async init() {

		if ( this._initialized ) {

			throw new Error( 'Renderer: Backend has already been initialized.' );

		}

		if ( this._initPromise !== null ) {

			return this._initPromise;

		}

		this._initPromise = new Promise( async ( resolve, reject ) => {

			const backend = this.backend;

			try {

				await backend.init( this );

			} catch ( error ) {

				reject( error );
				return;

			}

			this._nodes = new Nodes( this, backend );
			this._animation = new Animation( this._nodes, this.info );
			this._attributes = new Attributes( backend );
			this._background = new Background( this, this._nodes );
			this._geometries = new Geometries( this._attributes, this.info );
			this._textures = new Textures( this, backend, this.info );
			this._pipelines = new Pipelines( backend, this._nodes );
			this._bindings = new Bindings( backend, this._nodes, this._textures, this._attributes, this._pipelines, this.info );
			this._objects = new RenderObjects( this, this._nodes, this._geometries, this._pipelines, this._bindings, this.info );
			this._renderLists = new RenderLists();
			this._renderContexts = new RenderContexts();

			//

			this._initialized = true;

			resolve();

		} );

		return this._initPromise;

	}

	get coordinateSystem() {

		return this.backend.coordinateSystem;

	}

	async compileAsync( scene, camera, targetScene = null ) {

		if ( this._initialized === false ) await this.init();

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderContext = this._currentRenderContext;
		const previousRenderObjectFunction = this._currentRenderObjectFunction;
		const previousCompilationPromises = this._compilationPromises;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		if ( targetScene === null ) targetScene = scene;

		const renderTarget = this._renderTarget;
		const renderContext = this._renderContexts.get( targetScene, camera, renderTarget );
		const activeMipmapLevel = this._activeMipmapLevel;

		const compilationPromises = [];

		this._currentRenderContext = renderContext;
		this._currentRenderObjectFunction = this.renderObject;

		this._handleObjectFunction = this._createObjectPipeline;

		this._compilationPromises = compilationPromises;

		nodeFrame.renderId ++;

		//

		nodeFrame.update();

		//

		renderContext.depth = this.depth;
		renderContext.stencil = this.stencil;

		if ( ! renderContext.clippingContext ) renderContext.clippingContext = new ClippingContext();
		renderContext.clippingContext.updateGlobal( this, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList );

		// include lights from target scene
		if ( targetScene !== scene ) {

			targetScene.traverseVisible( function ( object ) {

				if ( object.isLight && object.layers.test( camera.layers ) ) {

					renderList.pushLight( object );

				}

			} );

		}

		renderList.finish();

		//

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget, activeMipmapLevel );

			const renderTargetData = this._textures.get( renderTarget );

			renderContext.textures = renderTargetData.textures;
			renderContext.depthTexture = renderTargetData.depthTexture;

		} else {

			renderContext.textures = null;
			renderContext.depthTexture = null;

		}

		//

		this._nodes.updateScene( sceneRef );

		//

		this._background.update( sceneRef, renderList, renderContext );

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const lightsNode = renderList.lightsNode;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, sceneRef, lightsNode );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;
		this._compilationPromises = previousCompilationPromises;

		this._handleObjectFunction = this._renderObjectDirect;

		// wait for all promises setup by backends awaiting compilation/linking/pipeline creation to complete

		await Promise.all( compilationPromises );

	}

	async renderAsync( scene, camera ) {

		if ( this._initialized === false ) await this.init();

		const renderContext = this._renderContext( scene, camera );

		await this.backend.resolveTimestampAsync( renderContext, 'render' );

	}

	render( scene, camera ) {

		if ( this._initialized === false ) {

			console.error( 'THREE.Renderer: .render() called before the backend is initialized. Try using .renderAsync() instead.' );
			return;

		}

		this._renderContext( scene, camera );

	}

	_renderContext( scene, camera ) {

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderContext = this._currentRenderContext;
		const previousRenderObjectFunction = this._currentRenderObjectFunction;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		const renderTarget = this._renderTarget;
		const renderContext = this._renderContexts.get( scene, camera, renderTarget );
		const activeCubeFace = this._activeCubeFace;
		const activeMipmapLevel = this._activeMipmapLevel;

		this._currentRenderContext = renderContext;
		this._currentRenderObjectFunction = this._renderObjectFunction || this.renderObject;

		//

		this.info.calls ++;
		this.info.render.calls ++;

		nodeFrame.renderId = this.info.calls;

		//

		const coordinateSystem = this.coordinateSystem;

		if ( camera.coordinateSystem !== coordinateSystem ) {

			camera.coordinateSystem = coordinateSystem;

			camera.updateProjectionMatrix();

		}

		//

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

		if ( this.info.autoReset === true ) this.info.reset();

		//

		let viewport = this._viewport;
		let scissor = this._scissor;
		let pixelRatio = this._pixelRatio;

		if ( renderTarget !== null ) {

			viewport = renderTarget.viewport;
			scissor = renderTarget.scissor;
			pixelRatio = 1;

		}

		this.getDrawingBufferSize( _drawingBufferSize );

		_screen.set( 0, 0, _drawingBufferSize.width, _drawingBufferSize.height );

		const minDepth = ( viewport.minDepth === undefined ) ? 0 : viewport.minDepth;
		const maxDepth = ( viewport.maxDepth === undefined ) ? 1 : viewport.maxDepth;

		renderContext.viewportValue.copy( viewport ).multiplyScalar( pixelRatio ).floor();
		renderContext.viewportValue.width >>= activeMipmapLevel;
		renderContext.viewportValue.height >>= activeMipmapLevel;
		renderContext.viewportValue.minDepth = minDepth;
		renderContext.viewportValue.maxDepth = maxDepth;
		renderContext.viewport = renderContext.viewportValue.equals( _screen ) === false;

		renderContext.scissorValue.copy( scissor ).multiplyScalar( pixelRatio ).floor();
		renderContext.scissor = this._scissorTest && renderContext.scissorValue.equals( _screen ) === false;
		renderContext.scissorValue.width >>= activeMipmapLevel;
		renderContext.scissorValue.height >>= activeMipmapLevel;

		if ( ! renderContext.clippingContext ) renderContext.clippingContext = new ClippingContext();
		renderContext.clippingContext.updateGlobal( this, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix, coordinateSystem );

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList );

		renderList.finish();

		if ( this.sortObjects === true ) {

			renderList.sort( this._opaqueSort, this._transparentSort );

		}

		//

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget, activeMipmapLevel );

			const renderTargetData = this._textures.get( renderTarget );

			renderContext.textures = renderTargetData.textures;
			renderContext.depthTexture = renderTargetData.depthTexture;
			renderContext.width = renderTargetData.width;
			renderContext.height = renderTargetData.height;
			renderContext.renderTarget = renderTarget;
			renderContext.depth = renderTarget.depthBuffer;
			renderContext.stencil = renderTarget.stencilBuffer;

		} else {

			renderContext.textures = null;
			renderContext.depthTexture = null;
			renderContext.width = this.domElement.width;
			renderContext.height = this.domElement.height;
			renderContext.depth = this.depth;
			renderContext.stencil = this.stencil;

		}

		renderContext.width >>= activeMipmapLevel;
		renderContext.height >>= activeMipmapLevel;
		renderContext.activeCubeFace = activeCubeFace;
		renderContext.activeMipmapLevel = activeMipmapLevel;
		renderContext.occlusionQueryCount = renderList.occlusionQueryCount;

		//

		this._nodes.updateScene( sceneRef );

		//

		this._background.update( sceneRef, renderList, renderContext );

		//

		this.backend.beginRender( renderContext );

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const lightsNode = renderList.lightsNode;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, sceneRef, lightsNode );

		// finish render pass

		this.backend.finishRender( renderContext );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;

		//

		sceneRef.onAfterRender( this, scene, camera, renderTarget );

		//

		return renderContext;

	}

	getMaxAnisotropy() {

		return this.backend.getMaxAnisotropy();

	}

	getActiveCubeFace() {

		return this._activeCubeFace;

	}

	getActiveMipmapLevel() {

		return this._activeMipmapLevel;

	}

	async setAnimationLoop( callback ) {

		if ( this._initialized === false ) await this.init();

		this._animation.setAnimationLoop( callback );

	}

	getArrayBuffer( attribute ) { // @deprecated, r155

		console.warn( 'THREE.Renderer: getArrayBuffer() is deprecated. Use getArrayBufferAsync() instead.' );

		return this.getArrayBufferAsync( attribute );

	}

	async getArrayBufferAsync( attribute ) {

		return await this.backend.getArrayBufferAsync( attribute );

	}

	getContext() {

		return this.backend.getContext();

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

		this.setViewport( 0, 0, width, height );

		if ( this._initialized ) this.backend.updateSize();

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

		this.setViewport( 0, 0, width, height );

		if ( this._initialized ) this.backend.updateSize();

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

		const scissor = this._scissor;

		if ( x.isVector4 ) {

			scissor.copy( x );

		} else {

			scissor.set( x, y, width, height );

		}

	}

	getScissorTest() {

		return this._scissorTest;

	}

	setScissorTest( boolean ) {

		this._scissorTest = boolean;

		this.backend.setScissorTest( boolean );

	}

	getViewport( target ) {

		return target.copy( this._viewport );

	}

	setViewport( x, y, width, height, minDepth = 0, maxDepth = 1 ) {

		const viewport = this._viewport;

		if ( x.isVector4 ) {

			viewport.copy( x );

		} else {

			viewport.set( x, y, width, height );

		}

		viewport.minDepth = minDepth;
		viewport.maxDepth = maxDepth;

	}

	getClearColor( target ) {

		return target.copy( this._clearColor );

	}

	setClearColor( color, alpha = 1 ) {

		this._clearColor.set( color );
		this._clearColor.a = alpha;

	}

	getClearAlpha() {

		return this._clearColor.a;

	}

	setClearAlpha( alpha ) {

		this._clearColor.a = alpha;

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

	isOccluded( object ) {

		const renderContext = this._currentRenderContext;

		return renderContext && this.backend.isOccluded( renderContext, object );

	}

	clear( color = true, depth = true, stencil = true ) {

		let renderTargetData = null;
		const renderTarget = this._renderTarget;

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget );

			renderTargetData = this._textures.get( renderTarget );

		}

		this.backend.clear( color, depth, stencil, renderTargetData );

	}

	clearColor() {

		return this.clear( true, false, false );

	}

	clearDepth() {

		return this.clear( false, true, false );

	}

	clearStencil() {

		return this.clear( false, false, true );

	}

	async clearAsync( color = true, depth = true, stencil = true ) {

		if ( this._initialized === false ) await this.init();

		this.clear( color, depth, stencil );

	}

	clearColorAsync() {

		return this.clearAsync( true, false, false );

	}

	clearDepthAsync() {

		return this.clearAsync( false, true, false );

	}

	clearStencilAsync() {

		return this.clearAsync( false, false, true );

	}

	get currentColorSpace() {

		const renderTarget = this._renderTarget;

		if ( renderTarget !== null ) {

			const texture = renderTarget.texture;

			return ( Array.isArray( texture ) ? texture[ 0 ] : texture ).colorSpace;

		}

		return this.outputColorSpace;

	}

	dispose() {

		this.info.dispose();

		this._animation.dispose();
		this._objects.dispose();
		this._pipelines.dispose();
		this._nodes.dispose();
		this._bindings.dispose();
		this._renderLists.dispose();
		this._renderContexts.dispose();
		this._textures.dispose();

		this.setRenderTarget( null );
		this.setAnimationLoop( null );

	}

	setRenderTarget( renderTarget, activeCubeFace = 0, activeMipmapLevel = 0 ) {

		this._renderTarget = renderTarget;
		this._activeCubeFace = activeCubeFace;
		this._activeMipmapLevel = activeMipmapLevel;

	}

	getRenderTarget() {

		return this._renderTarget;

	}

	setRenderObjectFunction( renderObjectFunction ) {

		this._renderObjectFunction = renderObjectFunction;

	}

	getRenderObjectFunction() {

		return this._renderObjectFunction;

	}

	async computeAsync( computeNodes ) {

		if ( this._initialized === false ) await this.init();

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;

		//

		this.info.calls ++;
		this.info.compute.calls ++;
		this.info.compute.computeCalls ++;

		nodeFrame.renderId = this.info.calls;

		//
		if ( this.info.autoReset === true ) this.info.resetCompute();

		const backend = this.backend;
		const pipelines = this._pipelines;
		const bindings = this._bindings;
		const nodes = this._nodes;
		const computeList = Array.isArray( computeNodes ) ? computeNodes : [ computeNodes ];

		if ( computeList[ 0 ] === undefined || computeList[ 0 ].isComputeNode !== true ) {

			throw new Error( 'THREE.Renderer: .compute() expects a ComputeNode.' );

		}

		backend.beginCompute( computeNodes );

		for ( const computeNode of computeList ) {

			// onInit

			if ( pipelines.has( computeNode ) === false ) {

				const dispose = () => {

					computeNode.removeEventListener( 'dispose', dispose );

					pipelines.delete( computeNode );
					bindings.delete( computeNode );
					nodes.delete( computeNode );

				};

				computeNode.addEventListener( 'dispose', dispose );

				//

				computeNode.onInit( { renderer: this } );

			}

			nodes.updateForCompute( computeNode );
			bindings.updateForCompute( computeNode );

			const computeBindings = bindings.getForCompute( computeNode );
			const computePipeline = pipelines.getForCompute( computeNode, computeBindings );

			backend.compute( computeNodes, computeNode, computeBindings, computePipeline );

		}

		backend.finishCompute( computeNodes );

		await this.backend.resolveTimestampAsync( computeNodes, 'compute' );

		//

		nodeFrame.renderId = previousRenderId;

	}

	hasFeatureAsync( name ) {

		return this.backend.hasFeatureAsync( name );

	}

	hasFeature( name ) {

		return this.backend.hasFeature( name );

	}

	copyFramebufferToTexture( framebufferTexture ) {

		const renderContext = this._currentRenderContext;

		this._textures.updateTexture( framebufferTexture );

		this.backend.copyFramebufferToTexture( framebufferTexture, renderContext );

	}

	readRenderTargetPixelsAsync( renderTarget, x, y, width, height ) {

		return this.backend.copyTextureToBuffer( renderTarget.texture, x, y, width, height );

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

				console.error( 'THREE.Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

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
			// the material from the renderItem object and pass it with its group data to renderObject().

			const { object, geometry, material, group } = renderItem;

			if ( camera.isArrayCamera ) {

				const cameras = camera.cameras;

				for ( let j = 0, jl = cameras.length; j < jl; j ++ ) {

					const camera2 = cameras[ j ];

					if ( object.layers.test( camera2.layers ) ) {

						const vp = camera2.viewport;
						const minDepth = ( vp.minDepth === undefined ) ? 0 : vp.minDepth;
						const maxDepth = ( vp.maxDepth === undefined ) ? 1 : vp.maxDepth;

						const viewportValue = this._currentRenderContext.viewportValue;
						viewportValue.copy( vp ).multiplyScalar( this._pixelRatio ).floor();
						viewportValue.minDepth = minDepth;
						viewportValue.maxDepth = maxDepth;

						this.backend.updateViewport( this._currentRenderContext );

						this._currentRenderObjectFunction( object, scene, camera2, geometry, material, group, lightsNode );

					}

				}

			} else {

				this._currentRenderObjectFunction( object, scene, camera, geometry, material, group, lightsNode );

			}

		}

	}

	renderObject( object, scene, camera, geometry, material, group, lightsNode ) {

		let overridePositionNode;
		let overrideFragmentNode;

		//

		object.onBeforeRender( this, scene, camera, geometry, material, group );

		material.onBeforeRender( this, scene, camera, geometry, material, group );

		//

		if ( scene.overrideMaterial !== null ) {

			const overrideMaterial = scene.overrideMaterial;

			if ( material.positionNode && material.positionNode.isNode ) {

				overridePositionNode = overrideMaterial.positionNode;

				overrideMaterial.positionNode = material.positionNode;

			}

			if ( overrideMaterial.isShadowNodeMaterial ) {

				overrideMaterial.side = material.shadowSide === null ? material.side : material.shadowSide;

				if ( material.shadowNode && material.shadowNode.isNode ) {

					overrideFragmentNode = overrideMaterial.fragmentNode;
					overrideMaterial.fragmentNode = material.shadowNode;

				}

				if ( this.localClippingEnabled ) {

					if ( material.clipShadows ) {

						if ( overrideMaterial.clippingPlanes !== material.clippingPlanes ) {

							overrideMaterial.clippingPlanes = material.clippingPlanes;
							overrideMaterial.needsUpdate = true;

						}

						if ( overrideMaterial.clipIntersection !== material.clipIntersection ) {

							overrideMaterial.clipIntersection = material.clipIntersection;

						}

					} else if ( Array.isArray( overrideMaterial.clippingPlanes ) ) {

						overrideMaterial.clippingPlanes = null;
						overrideMaterial.needsUpdate = true;

					}

				}

			}

			material = overrideMaterial;

		}

		//

		if ( material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false ) {

			material.side = BackSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, 'backSide' ); // create backSide pass id

			material.side = FrontSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode ); // use default pass id

			material.side = DoubleSide;

		} else {

			this._handleObjectFunction( object, material, scene, camera, lightsNode );

		}

		//

		if ( overridePositionNode !== undefined ) {

			scene.overrideMaterial.positionNode = overridePositionNode;

		}

		if ( overrideFragmentNode !== undefined ) {

			scene.overrideMaterial.fragmentNode = overrideFragmentNode;

		}

		//

		object.onAfterRender( this, scene, camera, geometry, material, group );

	}

	_renderObjectDirect( object, material, scene, camera, lightsNode, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, passId );

		//

		this._nodes.updateBefore( renderObject );

		//

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		//

		this._nodes.updateForRender( renderObject );
		this._geometries.updateForRender( renderObject );
		this._bindings.updateForRender( renderObject );
		this._pipelines.updateForRender( renderObject );

		//

		this.backend.draw( renderObject, this.info );

	}

	_createObjectPipeline( object, material, scene, camera, lightsNode, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, passId );

		//

		this._nodes.updateBefore( renderObject );

		//

		this._nodes.updateForRender( renderObject );
		this._geometries.updateForRender( renderObject );
		this._bindings.updateForRender( renderObject );

		this._pipelines.getForRender( renderObject, this._compilationPromises );

	}

	get compute() {

		return this.computeAsync;

	}

	get compile() {

		return this.compileAsync;

	}

}

class Binding {

	constructor( name = '' ) {

		this.name = name;

		this.visibility = 0;

	}

	setVisibility( visibility ) {

		this.visibility |= visibility;

	}

	clone() {

		return Object.assign( new this.constructor(), this );

	}

}

function getFloatLength( floatLength ) {

	// ensure chunk size alignment (STD140 layout)

	return floatLength + ( ( GPU_CHUNK_BYTES - ( floatLength % GPU_CHUNK_BYTES ) ) % GPU_CHUNK_BYTES );

}

class Buffer extends Binding {

	constructor( name, buffer = null ) {

		super( name );

		this.isBuffer = true;

		this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

		this._buffer = buffer;

	}

	get byteLength() {

		return getFloatLength( this._buffer.byteLength );

	}

	get buffer() {

		return this._buffer;

	}

	update() {

		return true;

	}

}

class UniformBuffer extends Buffer {

	constructor( name, buffer = null ) {

		super( name, buffer );

		this.isUniformBuffer = true;

	}

}

let _id$2 = 0;

class NodeUniformBuffer extends UniformBuffer {

	constructor( nodeUniform ) {

		super( 'UniformBuffer_' + _id$2 ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

class UniformsGroup extends UniformBuffer {

	constructor( name ) {

		super( name );

		this.isUniformsGroup = true;

		// the order of uniforms in this array must match the order of uniforms in the shader

		this.uniforms = [];

	}

	addUniform( uniform ) {

		this.uniforms.push( uniform );

		return this;

	}

	removeUniform( uniform ) {

		const index = this.uniforms.indexOf( uniform );

		if ( index !== - 1 ) {

			this.uniforms.splice( index, 1 );

		}

		return this;

	}

	get buffer() {

		let buffer = this._buffer;

		if ( buffer === null ) {

			const byteLength = this.byteLength;

			buffer = new Float32Array( new ArrayBuffer( byteLength ) );

			this._buffer = buffer;

		}

		return buffer;

	}

	get byteLength() {

		let offset = 0; // global buffer offset in bytes

		for ( let i = 0, l = this.uniforms.length; i < l; i ++ ) {

			const uniform = this.uniforms[ i ];

			const { boundary, itemSize } = uniform;

			// offset within a single chunk in bytes

			const chunkOffset = offset % GPU_CHUNK_BYTES;
			const remainingSizeInChunk = GPU_CHUNK_BYTES - chunkOffset;

			// conformance tests

			if ( chunkOffset !== 0 && ( remainingSizeInChunk - boundary ) < 0 ) {

				// check for chunk overflow

				offset += ( GPU_CHUNK_BYTES - chunkOffset );

			} else if ( chunkOffset % boundary !== 0 ) {

				// check for correct alignment

				offset += ( chunkOffset % boundary );

			}

			uniform.offset = ( offset / this.bytesPerElement );

			offset += ( itemSize * this.bytesPerElement );

		}

		return Math.ceil( offset / GPU_CHUNK_BYTES ) * GPU_CHUNK_BYTES;

	}

	update() {

		let updated = false;

		for ( const uniform of this.uniforms ) {

			if ( this.updateByType( uniform ) === true ) {

				updated = true;

			}

		}

		return updated;

	}

	updateByType( uniform ) {

		if ( uniform.isFloatUniform ) return this.updateNumber( uniform );
		if ( uniform.isVector2Uniform ) return this.updateVector2( uniform );
		if ( uniform.isVector3Uniform ) return this.updateVector3( uniform );
		if ( uniform.isVector4Uniform ) return this.updateVector4( uniform );
		if ( uniform.isColorUniform ) return this.updateColor( uniform );
		if ( uniform.isMatrix3Uniform ) return this.updateMatrix3( uniform );
		if ( uniform.isMatrix4Uniform ) return this.updateMatrix4( uniform );

		console.error( 'THREE.WebGPUUniformsGroup: Unsupported uniform type.', uniform );

	}

	updateNumber( uniform ) {

		let updated = false;

		const a = this.buffer;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset ] !== v ) {

			a[ offset ] = v;
			updated = true;

		}

		return updated;

	}

	updateVector2( uniform ) {

		let updated = false;

		const a = this.buffer;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;

			updated = true;

		}

		return updated;

	}

	updateVector3( uniform ) {

		let updated = false;

		const a = this.buffer;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;
			a[ offset + 2 ] = v.z;

			updated = true;

		}

		return updated;

	}

	updateVector4( uniform ) {

		let updated = false;

		const a = this.buffer;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z || a[ offset + 4 ] !== v.w ) {

			a[ offset + 0 ] = v.x;
			a[ offset + 1 ] = v.y;
			a[ offset + 2 ] = v.z;
			a[ offset + 3 ] = v.w;

			updated = true;

		}

		return updated;

	}

	updateColor( uniform ) {

		let updated = false;

		const a = this.buffer;
		const c = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== c.r || a[ offset + 1 ] !== c.g || a[ offset + 2 ] !== c.b ) {

			a[ offset + 0 ] = c.r;
			a[ offset + 1 ] = c.g;
			a[ offset + 2 ] = c.b;

			updated = true;

		}

		return updated;

	}

	updateMatrix3( uniform ) {

		let updated = false;

		const a = this.buffer;
		const e = uniform.getValue().elements;
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== e[ 0 ] || a[ offset + 1 ] !== e[ 1 ] || a[ offset + 2 ] !== e[ 2 ] ||
			a[ offset + 4 ] !== e[ 3 ] || a[ offset + 5 ] !== e[ 4 ] || a[ offset + 6 ] !== e[ 5 ] ||
			a[ offset + 8 ] !== e[ 6 ] || a[ offset + 9 ] !== e[ 7 ] || a[ offset + 10 ] !== e[ 8 ] ) {

			a[ offset + 0 ] = e[ 0 ];
			a[ offset + 1 ] = e[ 1 ];
			a[ offset + 2 ] = e[ 2 ];
			a[ offset + 4 ] = e[ 3 ];
			a[ offset + 5 ] = e[ 4 ];
			a[ offset + 6 ] = e[ 5 ];
			a[ offset + 8 ] = e[ 6 ];
			a[ offset + 9 ] = e[ 7 ];
			a[ offset + 10 ] = e[ 8 ];

			updated = true;

		}

		return updated;

	}

	updateMatrix4( uniform ) {

		let updated = false;

		const a = this.buffer;
		const e = uniform.getValue().elements;
		const offset = uniform.offset;

		if ( arraysEqual( a, e, offset ) === false ) {

			a.set( e, offset );
			updated = true;

		}

		return updated;

	}

}

function arraysEqual( a, b, offset ) {

	for ( let i = 0, l = b.length; i < l; i ++ ) {

		if ( a[ offset + i ] !== b[ i ] ) return false;

	}

	return true;

}

let id$1 = 0;

class NodeUniformsGroup extends UniformsGroup {

	constructor( name, groupNode ) {

		super( name );

		this.id = id$1 ++;
		this.groupNode = groupNode;

		this.isNodeUniformsGroup = true;

	}

	get shared() {

		return this.groupNode.shared;

	}

	getNodes() {

		const nodes = [];

		for ( const uniform of this.uniforms ) {

			const node = uniform.nodeUniform.node;

			if ( ! node ) throw new Error( 'NodeUniformsGroup: Uniform has no node.' );

			nodes.push( node );

		}

		return nodes;

	}

}

let id = 0;

class SampledTexture extends Binding {

	constructor( name, texture ) {

		super( name );

		this.id = id ++;

		this.texture = texture;
		this.version = texture ? texture.version : 0;
		this.store = false;

		this.isSampledTexture = true;

	}

	get needsBindingsUpdate() {

		const { texture, version } = this;

		return texture.isVideoTexture ? true : version !== texture.version; // @TODO: version === 0 && texture.version > 0 ( add it just to External Textures like PNG,JPG )

	}

	update() {

		const { texture, version } = this;

		if ( version !== texture.version ) {

			this.version = texture.version;

			return true;

		}

		return false;

	}

}

class NodeSampledTexture extends SampledTexture {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

	get needsBindingsUpdate() {

		return this.textureNode.value !== this.texture || super.needsBindingsUpdate;

	}

	update() {

		const { textureNode } = this;

		if ( this.texture !== textureNode.value ) {

			this.texture = textureNode.value;

			return true;

		}

		return super.update();

	}

}

class NodeSampledCubeTexture extends NodeSampledTexture {

	constructor( name, textureNode ) {

		super( name, textureNode );

		this.isSampledCubeTexture = true;

	}

}

const glslMethods = {
	[ MathNode.ATAN2 ]: 'atan',
	textureDimensions: 'textureSize',
	equals: 'equal'
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

const supports$1 = {
	instance: true,
	swizzleAssign: true
};

const defaultPrecisions = `
precision highp float;
precision highp int;
precision mediump sampler2DArray;
precision lowp sampler2DShadow;
`;

class GLSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new GLSLNodeParser(), scene );

		this.uniformGroups = {};
		this.transforms = [];

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	getPropertyName( node, shaderStage ) {

		if ( node.isOutputStructVar ) return '';

		return super.getPropertyName( node, shaderStage );

	}

	buildFunctionCode( shaderNode ) {

		const layout = shaderNode.layout;
		const flowData = this.flowShaderNode( shaderNode );

		const parameters = [];

		for ( const input of layout.inputs ) {

			parameters.push( this.getType( input.type ) + ' ' + input.name );

		}

		//

		const code = `${ this.getType( layout.type ) } ${ layout.name }( ${ parameters.join( ', ' ) } ) {

	${ flowData.vars }

${ flowData.code }
	return ${ flowData.result };

}`;

		//

		return code;

	}

	setupPBO( storageBufferNode ) {

		const attribute = storageBufferNode.value;

		if ( attribute.pbo === undefined ) {

			const originalArray = attribute.array;
			const numElements = attribute.count * attribute.itemSize;

			const { itemSize } = attribute;
			let format = RedFormat;

			if ( itemSize === 2 ) {

				format = RGFormat;

			} else if ( itemSize === 3 ) {

				format = 6407; // patch since legacy doesn't use RGBFormat for rendering but here it's needed for packing optimization

			} else if ( itemSize === 4 ) {

				format = RGBAFormat;

			}

			const width = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( numElements / itemSize ) ) ) );
			let height = Math.ceil( ( numElements / itemSize ) / width );
			if ( width * height * itemSize < numElements ) height ++; // Ensure enough space

			const newSize = width * height * itemSize;

			const newArray = new Float32Array( newSize );

			newArray.set( originalArray, 0 );

			attribute.array = newArray;

			const pboTexture = new DataTexture( attribute.array, width, height, format, FloatType );
			pboTexture.needsUpdate = true;
			pboTexture.isPBOTexture = true;

			const pbo = new UniformNode( pboTexture );
			pbo.setPrecision( 'high' );

			attribute.pboNode = pbo;
			attribute.pbo = pbo.value;

			this.getUniformFromNode( attribute.pboNode, 'texture', this.shaderStage, this.context.label );

		}

	}

	generatePBO( storageArrayElementNode ) {

		const { node, indexNode } = storageArrayElementNode;
		const attribute = node.value;

		if ( this.renderer.backend.has( attribute ) ) {

			const attributeData = this.renderer.backend.get( attribute );
			attributeData.pbo = attribute.pbo;

		}


		const nodeUniform = this.getUniformFromNode( attribute.pboNode, 'texture', this.shaderStage, this.context.label );
		const textureName = this.getPropertyName( nodeUniform );

		indexNode.increaseUsage( this ); // force cache generate to be used as index in x,y
		const indexSnippet = indexNode.build( this, 'uint' );

		const elementNodeData = this.getDataFromNode( storageArrayElementNode );

		let propertyName = elementNodeData.propertyName;

		if ( propertyName === undefined ) {

			// property element

			const nodeVar = this.getVarFromNode( storageArrayElementNode );

			propertyName = this.getPropertyName( nodeVar );

			// property size

			const bufferNodeData = this.getDataFromNode( node );

			let propertySizeName = bufferNodeData.propertySizeName;

			if ( propertySizeName === undefined ) {

				propertySizeName = propertyName + 'Size';

				this.getVarFromNode( node, propertySizeName, 'uint' );

				this.addLineFlowCode( `${ propertySizeName } = uint( textureSize( ${ textureName }, 0 ).x )` );

				bufferNodeData.propertySizeName = propertySizeName;

			}

			//

			const { itemSize } = attribute;

			const channel = '.' + vectorComponents.join( '' ).slice( 0, itemSize );
			const uvSnippet = `ivec2(${indexSnippet} % ${ propertySizeName }, ${indexSnippet} / ${ propertySizeName })`;

			const snippet = this.generateTextureLoad( null, textureName, uvSnippet, null, '0' );

			//

			this.addLineFlowCode( `${ propertyName } = ${ snippet + channel }` );

			elementNodeData.propertyName = propertyName;

		}

		return propertyName;

	}

	generateTextureLoad( texture, textureProperty, uvIndexSnippet, depthSnippet, levelSnippet = '0' ) {

		if ( depthSnippet ) {

			return `texelFetch( ${ textureProperty }, ivec3( ${ uvIndexSnippet }, ${ depthSnippet } ), ${ levelSnippet } )`;

		} else {

			return `texelFetch( ${ textureProperty }, ${ uvIndexSnippet }, ${ levelSnippet } )`;

		}

	}

	generateTexture( texture, textureProperty, uvSnippet, depthSnippet ) {

		if ( texture.isDepthTexture ) {

			return `texture( ${ textureProperty }, ${ uvSnippet } ).x`;

		} else {

			if ( depthSnippet ) uvSnippet = `vec3( ${ uvSnippet }, ${ depthSnippet } )`;

			return `texture( ${ textureProperty }, ${ uvSnippet } )`;

		}

	}

	generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet ) {

		return `textureLod( ${ textureProperty }, ${ uvSnippet }, ${ levelSnippet } )`;

	}

	generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `texture( ${ textureProperty }, vec3( ${ uvSnippet }, ${ compareSnippet } ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	getVars( shaderStage ) {

		const snippets = [];

		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				if ( variable.isOutputStructVar ) continue;

				snippets.push( `${ this.getVar( variable.type, variable.name ) };` );

			}

		}

		return snippets.join( '\n\t' );

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const uniformGroups = {};

		for ( const uniform of uniforms ) {

			let snippet = null;
			let group = false;

			if ( uniform.type === 'texture' ) {

				const texture = uniform.node.value;

				if ( texture.compareFunction ) {

					snippet = `sampler2DShadow ${ uniform.name };`;

				} else if ( texture.isDataArrayTexture === true ) {

					snippet = `sampler2DArray ${ uniform.name };`;

				} else {

					snippet = `sampler2D ${ uniform.name };`;

				}

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${ uniform.name };`;

			} else if ( uniform.type === 'buffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 ? bufferCount : '';
				snippet = `${bufferNode.name} {\n\t${ bufferType } ${ uniform.name }[${ bufferCountSnippet }];\n};\n`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet = `${vectorType} ${uniform.name};`;

				group = true;

			}

			const precision = uniform.node.precision;

			if ( precision !== null ) {

				snippet = precisionLib[ precision ] + ' ' + snippet;

			}

			if ( group ) {

				snippet = '\t' + snippet;

				const groupName = uniform.groupNode.name;
				const groupSnippets = uniformGroups[ groupName ] || ( uniformGroups[ groupName ] = [] );

				groupSnippets.push( snippet );

			} else {

				snippet = 'uniform ' + snippet;

				bindingSnippets.push( snippet );

			}

		}

		let output = '';

		for ( const name in uniformGroups ) {

			const groupSnippets = uniformGroups[ name ];

			output += this._getGLSLUniformStruct( shaderStage + '_' + name, groupSnippets.join( '\n' ) ) + '\n';

		}

		output += bindingSnippets.join( '\n' );

		return output;

	}

	getTypeFromAttribute( attribute ) {

		let nodeType = super.getTypeFromAttribute( attribute );

		if ( /^[iu]/.test( nodeType ) && attribute.gpuType !== IntType ) {

			let dataAttribute = attribute;

			if ( attribute.isInterleavedBufferAttribute ) dataAttribute = attribute.data;

			const array = dataAttribute.array;

			if ( ( array instanceof Uint32Array || array instanceof Int32Array ) === false ) {

				nodeType = nodeType.slice( 1 );

			}

		}

		return nodeType;

	}

	getAttributes( shaderStage ) {

		let snippet = '';

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			const attributes = this.getAttributesArray();

			let location = 0;

			for ( const attribute of attributes ) {

				snippet += `layout( location = ${ location ++ } ) in ${ attribute.type } ${ attribute.name };\n`;

			}

		}

		return snippet;

	}

	getStructMembers( struct ) {

		const snippets = [];
		const members = struct.getMemberTypes();

		for ( let i = 0; i < members.length; i ++ ) {

			const member = members[ i ];
			snippets.push( `layout( location = ${i} ) out ${ member} m${i};` );

		}

		return snippets.join( '\n' );

	}

	getStructs( shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		if ( structs.length === 0 ) {

			return 'layout( location = 0 ) out vec4 fragColor;\n';

		}

		for ( let index = 0, length = structs.length; index < length; index ++ ) {

			const struct = structs[ index ];

			let snippet = '\n';
			snippet += this.getStructMembers( struct );
			snippet += '\n';

			snippets.push( snippet );

		}

		return snippets.join( '\n\n' );

	}

	getVaryings( shaderStage ) {

		let snippet = '';

		const varyings = this.varyings;

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			for ( const varying of varyings ) {

				if ( shaderStage === 'compute' ) varying.needsInterpolation = true;
				const type = varying.type;
				const flat = type === 'int' || type === 'uint' ? 'flat ' : '';

				snippet += `${flat}${varying.needsInterpolation ? 'out' : '/*out*/'} ${type} ${varying.name};\n`;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					const type = varying.type;
					const flat = type === 'int' || type === 'uint' ? 'flat ' : '';

					snippet += `${flat}in ${type} ${varying.name};\n`;

				}

			}

		}

		return snippet;

	}

	getVertexIndex() {

		return 'uint( gl_VertexID )';

	}

	getInstanceIndex() {

		return 'uint( gl_InstanceID )';

	}

	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	getFragCoord() {

		return 'gl_FragCoord';

	}

	getFragDepth() {

		return 'gl_FragDepth';

	}

	isAvailable( name ) {

		return supports$1[ name ] === true;

	}

	isFlipY() {

		return true;

	}

	registerTransform( varyingName, attributeNode ) {

		this.transforms.push( { varyingName, attributeNode } );

	}

	getTransforms( /* shaderStage  */ ) {

		const transforms = this.transforms;

		let snippet = '';

		for ( let i = 0; i < transforms.length; i ++ ) {

			const transform = transforms[ i ];

			const attributeName = this.getPropertyName( transform.attributeNode );

			snippet += `${ transform.varyingName } = ${ attributeName };\n\t`;

		}

		return snippet;

	}

	_getGLSLUniformStruct( name, vars ) {

		return `
layout( std140 ) uniform ${name} {
${vars}
};`;

	}

	_getGLSLVertexCode( shaderData ) {

		return `#version 300 es

${ this.getSignature() }

// precision
${ defaultPrecisions }

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// attributes
${shaderData.attributes}

// codes
${shaderData.codes}

void main() {

	// vars
	${shaderData.vars}

	// transforms
	${shaderData.transforms}

	// flow
	${shaderData.flow}

	gl_PointSize = 1.0;

}
`;

	}

	_getGLSLFragmentCode( shaderData ) {

		return `#version 300 es

${ this.getSignature() }

// precision
${ defaultPrecisions }

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}

// codes
${shaderData.codes}

${shaderData.structs}

void main() {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

	}

	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		for ( const shaderStage in shadersData ) {

			let flow = '// code\n\n';
			flow += this.flowCode[ shaderStage ];

			const flowNodes = this.flowNodes[ shaderStage ];
			const mainNode = flowNodes[ flowNodes.length - 1 ];

			for ( const node of flowNodes ) {

				const flowSlotData = this.getFlowData( node/*, shaderStage*/ );
				const slotName = node.name;

				if ( slotName ) {

					if ( flow.length > 0 ) flow += '\n';

					flow += `\t// flow -> ${ slotName }\n\t`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode && shaderStage !== 'compute' ) {

					flow += '// result\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += 'gl_Position = ';
						flow += `${ flowSlotData.result };`;

					} else if ( shaderStage === 'fragment' ) {

						if ( ! node.outputNode.isOutputStructNode ) {

							flow += 'fragColor = ';
							flow += `${ flowSlotData.result };`;

						}

					}

				}

			}

			const stageData = shadersData[ shaderStage ];

			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.transforms = this.getTransforms( shaderStage );
			stageData.flow = flow;

		}

		if ( this.material !== null ) {

			this.vertexShader = this._getGLSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getGLSLFragmentCode( shadersData.fragment );

		} else {

			this.computeShader = this._getGLSLVertexCode( shadersData.compute );

		}

	}

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		let uniformGPU = nodeData.uniformGPU;

		if ( uniformGPU === undefined ) {

			if ( type === 'texture' ) {

				uniformGPU = new NodeSampledTexture( uniformNode.name, uniformNode.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else if ( type === 'cubeTexture' ) {

				uniformGPU = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node );

				this.bindings[ shaderStage ].push( uniformGPU );

			} else if ( type === 'buffer' ) {

				node.name = `NodeBuffer_${ node.id }`;
				uniformNode.name = `buffer${ node.id }`;

				const buffer = new NodeUniformBuffer( node );
				buffer.name = node.name;

				this.bindings[ shaderStage ].push( buffer );

				uniformGPU = buffer;

			} else {

				const group = node.groupNode;
				const groupName = group.name;

				const uniformsStage = this.uniformGroups[ shaderStage ] || ( this.uniformGroups[ shaderStage ] = {} );

				let uniformsGroup = uniformsStage[ groupName ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new NodeUniformsGroup( shaderStage + '_' + groupName, group );
					//uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					uniformsStage[ groupName ] = uniformsGroup;

					this.bindings[ shaderStage ].push( uniformsGroup );

				}

				uniformGPU = this.getNodeUniform( uniformNode, type );

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

		}

		return uniformNode;

	}

}

let vector2 = null;
let vector4 = null;
let color4 = null;

class Backend {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, parameters );
		this.data = new WeakMap();
		this.renderer = null;
		this.domElement = null;

	}

	async init( renderer ) {

		this.renderer = renderer;

	}

	// render context

	begin( renderContext ) { }

	finish( renderContext ) { }

	// render object

	draw( renderObject, info ) { }

	// program

	createProgram( program ) { }

	destroyProgram( program ) { }

	// bindings

	createBindings( renderObject ) { }

	updateBindings( renderObject ) { }

	// pipeline

	createRenderPipeline( renderObject ) { }

	createComputePipeline( computeNode, pipeline ) { }

	destroyPipeline( pipeline ) { }

	// cache key

	needsRenderUpdate( renderObject ) { } // return Boolean ( fast test )

	getRenderCacheKey( renderObject ) { } // return String

	// node builder

	createNodeBuilder( renderObject ) { } // return NodeBuilder (ADD IT)

	// textures

	createSampler( texture ) { }

	createDefaultTexture( texture ) { }

	createTexture( texture ) { }

	copyTextureToBuffer( texture, x, y, width, height ) {}

	// attributes

	createAttribute( attribute ) { }

	createIndexAttribute( attribute ) { }

	updateAttribute( attribute ) { }

	destroyAttribute( attribute ) { }

	// canvas

	getContext() { }

	updateSize() { }

	// utils

	resolveTimestampAsync( renderContext, type ) { }

	hasFeatureAsync( name ) { } // return Boolean

	hasFeature( name ) { } // return Boolean

	getInstanceCount( renderObject ) {

		const { object, geometry } = renderObject;

		return geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.isInstancedMesh ? object.count : 1 );

	}

	getDrawingBufferSize() {

		vector2 = vector2 || new Vector2();

		return this.renderer.getDrawingBufferSize( vector2 );

	}

	getScissor() {

		vector4 = vector4 || new Vector4();

		return this.renderer.getScissor( vector4 );

	}

	setScissorTest( boolean ) { }

	getClearColor() {

		const renderer = this.renderer;

		color4 = color4 || new Color4();

		renderer.getClearColor( color4 );

		color4.getRGB( color4, this.renderer.currentColorSpace );

		return color4;

	}

	getDomElement() {

		let domElement = this.domElement;

		if ( domElement === null ) {

			domElement = ( this.parameters.canvas !== undefined ) ? this.parameters.canvas : createCanvasElement();

			// OffscreenCanvas does not have setAttribute, see #22811
			if ( 'setAttribute' in domElement ) domElement.setAttribute( 'data-engine', `three.js r${REVISION} webgpu` );

			this.domElement = domElement;

		}

		return domElement;

	}

	// resource properties

	set( object, value ) {

		this.data.set( object, value );

	}

	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	has( object ) {

		return this.data.has( object );

	}

	delete( object ) {

		this.data.delete( object );

	}

}

let _id$1 = 0;

class DualAttributeData {

	constructor( attributeData, dualBuffer ) {

		this.buffers = [ attributeData.bufferGPU, dualBuffer ];
		this.type = attributeData.type;
		this.bufferType = attributeData.bufferType;
		this.pbo = attributeData.pbo;
		this.byteLength = attributeData.byteLength;
		this.bytesPerElement = attributeData.BYTES_PER_ELEMENT;
		this.version = attributeData.version;
		this.isInteger = attributeData.isInteger;
		this.activeBufferIndex = 0;
		this.baseId = attributeData.id;

	}


	get id() {

		return `${ this.baseId }|${ this.activeBufferIndex }`;

	}

	get bufferGPU() {

		return this.buffers[ this.activeBufferIndex ];

	}

	get transformBuffer() {

		return this.buffers[ this.activeBufferIndex ^ 1 ];

	}

	switchBuffers() {

		this.activeBufferIndex ^= 1;

	}

}

class WebGLAttributeUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createAttribute( attribute, bufferType ) {

		const backend = this.backend;
		const { gl } = backend;

		const array = attribute.array;
		const usage = attribute.usage || gl.STATIC_DRAW;

		const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
		const bufferData = backend.get( bufferAttribute );

		let bufferGPU = bufferData.bufferGPU;

		if ( bufferGPU === undefined ) {

			bufferGPU = this._createBuffer( gl, bufferType, array, usage );

			bufferData.bufferGPU = bufferGPU;
			bufferData.bufferType = bufferType;
			bufferData.version = bufferAttribute.version;

		}

		//attribute.onUploadCallback();

		let type;

		if ( array instanceof Float32Array ) {

			type = gl.FLOAT;

		} else if ( array instanceof Uint16Array ) {

			if ( attribute.isFloat16BufferAttribute ) {

				type = gl.HALF_FLOAT;

			} else {

				type = gl.UNSIGNED_SHORT;

			}

		} else if ( array instanceof Int16Array ) {

			type = gl.SHORT;

		} else if ( array instanceof Uint32Array ) {

			type = gl.UNSIGNED_INT;

		} else if ( array instanceof Int32Array ) {

			type = gl.INT;

		} else if ( array instanceof Int8Array ) {

			type = gl.BYTE;

		} else if ( array instanceof Uint8Array ) {

			type = gl.UNSIGNED_BYTE;

		} else if ( array instanceof Uint8ClampedArray ) {

			type = gl.UNSIGNED_BYTE;

		} else {

			throw new Error( 'THREE.WebGLBackend: Unsupported buffer data format: ' + array );

		}

		let attributeData = {
			bufferGPU,
			bufferType,
			type,
			byteLength: array.byteLength,
			bytesPerElement: array.BYTES_PER_ELEMENT,
			version: attribute.version,
			pbo: attribute.pbo,
			isInteger: type === gl.INT || type === gl.UNSIGNED_INT || attribute.gpuType === IntType,
			id: _id$1 ++
		};

		if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) {

			// create buffer for tranform feedback use
			const bufferGPUDual = this._createBuffer( gl, bufferType, array, usage );
			attributeData = new DualAttributeData( attributeData, bufferGPUDual );

		}

		backend.set( attribute, attributeData );

	}

	updateAttribute( attribute ) {

		const backend = this.backend;
		const { gl } = backend;

		const array = attribute.array;
		const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
		const bufferData = backend.get( bufferAttribute );
		const bufferType = bufferData.bufferType;
		const updateRanges = attribute.isInterleavedBufferAttribute ? attribute.data.updateRanges : attribute.updateRanges;

		gl.bindBuffer( bufferType, bufferData.bufferGPU );

		if ( updateRanges.length === 0 ) {

			// Not using update ranges

			gl.bufferSubData( bufferType, 0, array );

		} else {

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];
				gl.bufferSubData( bufferType, range.start * array.BYTES_PER_ELEMENT,
					array, range.start, range.count );

			}

			bufferAttribute.clearUpdateRanges();

		}

		gl.bindBuffer( bufferType, null );

		bufferData.version = bufferAttribute.version;

	}

	destroyAttribute( attribute ) {

		const backend = this.backend;
		const { gl } = backend;

		if ( attribute.isInterleavedBufferAttribute ) {

			backend.delete( attribute.data );

		}

		const attributeData = backend.get( attribute );

		gl.deleteBuffer( attributeData.bufferGPU );

		backend.delete( attribute );

	}

	async getArrayBufferAsync( attribute ) {

		const backend = this.backend;
		const { gl } = backend;

		const bufferAttribute = attribute.isInterleavedBufferAttribute ? attribute.data : attribute;
		const { bufferGPU } = backend.get( bufferAttribute );

		const array = attribute.array;
		const byteLength = array.byteLength;

		gl.bindBuffer( gl.COPY_READ_BUFFER, bufferGPU );

		const writeBuffer = gl.createBuffer();

		gl.bindBuffer( gl.COPY_WRITE_BUFFER, writeBuffer );
		gl.bufferData( gl.COPY_WRITE_BUFFER, byteLength, gl.STREAM_READ );

		gl.copyBufferSubData( gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, byteLength );

		await backend.utils._clientWaitAsync();

		const dstBuffer = new attribute.array.constructor( array.length );

		gl.getBufferSubData( gl.COPY_WRITE_BUFFER, 0, dstBuffer );

		gl.deleteBuffer( writeBuffer );

		return dstBuffer.buffer;

	}

	_createBuffer( gl, bufferType, array, usage ) {

		const bufferGPU = gl.createBuffer();

		gl.bindBuffer( bufferType, bufferGPU );
		gl.bufferData( bufferType, array, usage );
		gl.bindBuffer( bufferType, null );

		return bufferGPU;

	}

}

let initialized$1 = false, equationToGL, factorToGL;

class WebGLState {

	constructor( backend ) {

		this.backend = backend;

		this.gl = this.backend.gl;

		this.enabled = {};
		this.currentFlipSided = null;
		this.currentCullFace = null;
		this.currentProgram = null;
		this.currentBlendingEnabled = false;
		this.currentBlending = null;
		this.currentBlendSrc = null;
		this.currentBlendDst = null;
		this.currentBlendSrcAlpha = null;
		this.currentBlendDstAlpha = null;
		this.currentPremultipledAlpha = null;
		this.currentPolygonOffsetFactor = null;
		this.currentPolygonOffsetUnits = null;
		this.currentColorMask = null;
		this.currentDepthFunc = null;
		this.currentDepthMask = null;
		this.currentStencilFunc = null;
		this.currentStencilRef = null;
		this.currentStencilFuncMask = null;
		this.currentStencilFail = null;
		this.currentStencilZFail = null;
		this.currentStencilZPass = null;
		this.currentStencilMask = null;
		this.currentLineWidth = null;

		this.currentBoundFramebuffers = {};
		this.currentDrawbuffers = new WeakMap();

		this.maxTextures = this.gl.getParameter( this.gl.MAX_TEXTURE_IMAGE_UNITS );
		this.currentTextureSlot = null;
		this.currentBoundTextures = {};

		if ( initialized$1 === false ) {

			this._init( this.gl );

			initialized$1 = true;

		}

	}

	_init( gl ) {

		// Store only WebGL constants here.

		equationToGL = {
			[ AddEquation ]: gl.FUNC_ADD,
			[ SubtractEquation ]: gl.FUNC_SUBTRACT,
			[ ReverseSubtractEquation ]: gl.FUNC_REVERSE_SUBTRACT
		};

		factorToGL = {
			[ ZeroFactor ]: gl.ZERO,
			[ OneFactor ]: gl.ONE,
			[ SrcColorFactor ]: gl.SRC_COLOR,
			[ SrcAlphaFactor ]: gl.SRC_ALPHA,
			[ SrcAlphaSaturateFactor ]: gl.SRC_ALPHA_SATURATE,
			[ DstColorFactor ]: gl.DST_COLOR,
			[ DstAlphaFactor ]: gl.DST_ALPHA,
			[ OneMinusSrcColorFactor ]: gl.ONE_MINUS_SRC_COLOR,
			[ OneMinusSrcAlphaFactor ]: gl.ONE_MINUS_SRC_ALPHA,
			[ OneMinusDstColorFactor ]: gl.ONE_MINUS_DST_COLOR,
			[ OneMinusDstAlphaFactor ]: gl.ONE_MINUS_DST_ALPHA
		};

	}

	enable( id ) {

		const { enabled } = this;

		if ( enabled[ id ] !== true ) {

			this.gl.enable( id );
			enabled[ id ] = true;

		}

	}

	disable( id ) {

		const { enabled } = this;

		if ( enabled[ id ] !== false ) {

			this.gl.disable( id );
			enabled[ id ] = false;

		}

	}

	setFlipSided( flipSided ) {

		if ( this.currentFlipSided !== flipSided ) {

			const { gl } = this;

			if ( flipSided ) {

				gl.frontFace( gl.CW );

			} else {

				gl.frontFace( gl.CCW );

			}

			this.currentFlipSided = flipSided;

		}

	}

	setCullFace( cullFace ) {

		const { gl } = this;

		if ( cullFace !== CullFaceNone ) {

			this.enable( gl.CULL_FACE );

			if ( cullFace !== this.currentCullFace ) {

				if ( cullFace === CullFaceBack ) {

					gl.cullFace( gl.BACK );

				} else if ( cullFace === CullFaceFront ) {

					gl.cullFace( gl.FRONT );

				} else {

					gl.cullFace( gl.FRONT_AND_BACK );

				}

			}

		} else {

			this.disable( gl.CULL_FACE );

		}

		this.currentCullFace = cullFace;

	}

	setLineWidth( width ) {

		const { currentLineWidth, gl } = this;

		if ( width !== currentLineWidth ) {

			gl.lineWidth( width );

			this.currentLineWidth = width;

		}

	}


	setBlending( blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha ) {

		const { gl } = this;

		if ( blending === NoBlending ) {

			if ( this.currentBlendingEnabled === true ) {

				this.disable( gl.BLEND );
				this.currentBlendingEnabled = false;

			}

			return;

		}

		if ( this.currentBlendingEnabled === false ) {

			this.enable( gl.BLEND );
			this.currentBlendingEnabled = true;

		}

		if ( blending !== CustomBlending ) {

			if ( blending !== this.currentBlending || premultipliedAlpha !== this.currentPremultipledAlpha ) {

				if ( this.currentBlendEquation !== AddEquation || this.currentBlendEquationAlpha !== AddEquation ) {

					gl.blendEquation( gl.FUNC_ADD );

					this.currentBlendEquation = AddEquation;
					this.currentBlendEquationAlpha = AddEquation;

				}

				if ( premultipliedAlpha ) {

					switch ( blending ) {

						case NormalBlending:
							gl.blendFuncSeparate( gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
							break;

						case AdditiveBlending:
							gl.blendFunc( gl.ONE, gl.ONE );
							break;

						case SubtractiveBlending:
							gl.blendFuncSeparate( gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE );
							break;

						case MultiplyBlending:
							gl.blendFuncSeparate( gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA );
							break;

						default:
							console.error( 'THREE.WebGLState: Invalid blending: ', blending );
							break;

					}

				} else {

					switch ( blending ) {

						case NormalBlending:
							gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
							break;

						case AdditiveBlending:
							gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
							break;

						case SubtractiveBlending:
							gl.blendFuncSeparate( gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE );
							break;

						case MultiplyBlending:
							gl.blendFunc( gl.ZERO, gl.SRC_COLOR );
							break;

						default:
							console.error( 'THREE.WebGLState: Invalid blending: ', blending );
							break;

					}

				}

				this.currentBlendSrc = null;
				this.currentBlendDst = null;
				this.currentBlendSrcAlpha = null;
				this.currentBlendDstAlpha = null;

				this.currentBlending = blending;
				this.currentPremultipledAlpha = premultipliedAlpha;

			}

			return;

		}

		// custom blending

		blendEquationAlpha = blendEquationAlpha || blendEquation;
		blendSrcAlpha = blendSrcAlpha || blendSrc;
		blendDstAlpha = blendDstAlpha || blendDst;

		if ( blendEquation !== this.currentBlendEquation || blendEquationAlpha !== this.currentBlendEquationAlpha ) {

			gl.blendEquationSeparate( equationToGL[ blendEquation ], equationToGL[ blendEquationAlpha ] );

			this.currentBlendEquation = blendEquation;
			this.currentBlendEquationAlpha = blendEquationAlpha;

		}

		if ( blendSrc !== this.currentBlendSrc || blendDst !== this.currentBlendDst || blendSrcAlpha !== this.currentBlendSrcAlpha || blendDstAlpha !== this.currentBlendDstAlpha ) {

			gl.blendFuncSeparate( factorToGL[ blendSrc ], factorToGL[ blendDst ], factorToGL[ blendSrcAlpha ], factorToGL[ blendDstAlpha ] );

			this.currentBlendSrc = blendSrc;
			this.currentBlendDst = blendDst;
			this.currentBlendSrcAlpha = blendSrcAlpha;
			this.currentBlendDstAlpha = blendDstAlpha;

		}

		this.currentBlending = blending;
		this.currentPremultipledAlpha = false;

	}

	setColorMask( colorMask ) {

		if ( this.currentColorMask !== colorMask ) {

			this.gl.colorMask( colorMask, colorMask, colorMask, colorMask );
			this.currentColorMask = colorMask;

		}

	}

	setDepthTest( depthTest ) {

		const { gl } = this;

		if ( depthTest ) {

			this.enable( gl.DEPTH_TEST );

		} else {

			this.disable( gl.DEPTH_TEST );

		}

	}

	setDepthMask( depthMask ) {

		if ( this.currentDepthMask !== depthMask ) {

			this.gl.depthMask( depthMask );
			this.currentDepthMask = depthMask;

		}

	}

	setDepthFunc( depthFunc ) {

		if ( this.currentDepthFunc !== depthFunc ) {

			const { gl } = this;

			switch ( depthFunc ) {

				case NeverDepth:

					gl.depthFunc( gl.NEVER );
					break;

				case AlwaysDepth:

					gl.depthFunc( gl.ALWAYS );
					break;

				case LessDepth:

					gl.depthFunc( gl.LESS );
					break;

				case LessEqualDepth:

					gl.depthFunc( gl.LEQUAL );
					break;

				case EqualDepth:

					gl.depthFunc( gl.EQUAL );
					break;

				case GreaterEqualDepth:

					gl.depthFunc( gl.GEQUAL );
					break;

				case GreaterDepth:

					gl.depthFunc( gl.GREATER );
					break;

				case NotEqualDepth:

					gl.depthFunc( gl.NOTEQUAL );
					break;

				default:

					gl.depthFunc( gl.LEQUAL );

			}

			this.currentDepthFunc = depthFunc;

		}

	}

	setStencilTest( stencilTest ) {

		const { gl } = this;

		if ( stencilTest ) {

			this.enable( gl.STENCIL_TEST );

		} else {

			this.disable( gl.STENCIL_TEST );

		}

	}

	setStencilMask( stencilMask ) {

		if ( this.currentStencilMask !== stencilMask ) {

			this.gl.stencilMask( stencilMask );
			this.currentStencilMask = stencilMask;

		}

	}

	setStencilFunc( stencilFunc, stencilRef, stencilMask ) {

		if ( this.currentStencilFunc !== stencilFunc ||
			 this.currentStencilRef !== stencilRef ||
			 this.currentStencilFuncMask !== stencilMask ) {

			this.gl.stencilFunc( stencilFunc, stencilRef, stencilMask );

			this.currentStencilFunc = stencilFunc;
			this.currentStencilRef = stencilRef;
			this.currentStencilFuncMask = stencilMask;

		}

	}

	setStencilOp( stencilFail, stencilZFail, stencilZPass ) {

		if ( this.currentStencilFail !== stencilFail ||
			 this.currentStencilZFail !== stencilZFail ||
			 this.currentStencilZPass !== stencilZPass ) {

			this.gl.stencilOp( stencilFail, stencilZFail, stencilZPass );

			this.currentStencilFail = stencilFail;
			this.currentStencilZFail = stencilZFail;
			this.currentStencilZPass = stencilZPass;

		}

	}

	setMaterial( material, frontFaceCW ) {

		const { gl } = this;

		material.side === DoubleSide
			? this.disable( gl.CULL_FACE )
			: this.enable( gl.CULL_FACE );

		let flipSided = ( material.side === BackSide );
		if ( frontFaceCW ) flipSided = ! flipSided;

		this.setFlipSided( flipSided );

		( material.blending === NormalBlending && material.transparent === false )
			? this.setBlending( NoBlending )
			: this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha );

		this.setDepthFunc( material.depthFunc );
		this.setDepthTest( material.depthTest );
		this.setDepthMask( material.depthWrite );
		this.setColorMask( material.colorWrite );

		const stencilWrite = material.stencilWrite;
		this.setStencilTest( stencilWrite );
		if ( stencilWrite ) {

			this.setStencilMask( material.stencilWriteMask );
			this.setStencilFunc( material.stencilFunc, material.stencilRef, material.stencilFuncMask );
			this.setStencilOp( material.stencilFail, material.stencilZFail, material.stencilZPass );

		}

		this.setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

		material.alphaToCoverage === true
			? this.enable( gl.SAMPLE_ALPHA_TO_COVERAGE )
			: this.disable( gl.SAMPLE_ALPHA_TO_COVERAGE );

	}

	setPolygonOffset( polygonOffset, factor, units ) {

		const { gl } = this;

		if ( polygonOffset ) {

			this.enable( gl.POLYGON_OFFSET_FILL );

			if ( this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units ) {

				gl.polygonOffset( factor, units );

				this.currentPolygonOffsetFactor = factor;
				this.currentPolygonOffsetUnits = units;

			}

		} else {

			this.disable( gl.POLYGON_OFFSET_FILL );

		}

	}

	useProgram( program ) {

		if ( this.currentProgram !== program ) {

			this.gl.useProgram( program );

			this.currentProgram = program;

			return true;

		}

		return false;

	}

	// framebuffer


	bindFramebuffer( target, framebuffer ) {

		const { gl, currentBoundFramebuffers } = this;

		if ( currentBoundFramebuffers[ target ] !== framebuffer ) {

			gl.bindFramebuffer( target, framebuffer );

			currentBoundFramebuffers[ target ] = framebuffer;

			// gl.DRAW_FRAMEBUFFER is equivalent to gl.FRAMEBUFFER

			if ( target === gl.DRAW_FRAMEBUFFER ) {

				currentBoundFramebuffers[ gl.FRAMEBUFFER ] = framebuffer;

			}

			if ( target === gl.FRAMEBUFFER ) {

				currentBoundFramebuffers[ gl.DRAW_FRAMEBUFFER ] = framebuffer;

			}

			return true;

		}

		return false;

	}

	drawBuffers( renderContext, framebuffer ) {

		const { gl } = this;

		let drawBuffers = [];

		let needsUpdate = false;

		if ( renderContext.textures !== null ) {

			drawBuffers = this.currentDrawbuffers.get( framebuffer );

			if ( drawBuffers === undefined ) {

				drawBuffers = [];
				this.currentDrawbuffers.set( framebuffer, drawBuffers );

			}


			const textures = renderContext.textures;

			if ( drawBuffers.length !== textures.length || drawBuffers[ 0 ] !== gl.COLOR_ATTACHMENT0 ) {

				for ( let i = 0, il = textures.length; i < il; i ++ ) {

					drawBuffers[ i ] = gl.COLOR_ATTACHMENT0 + i;

				}

				drawBuffers.length = textures.length;

				needsUpdate = true;

			}


		} else {

			if ( drawBuffers[ 0 ] !== gl.BACK ) {

				drawBuffers[ 0 ] = gl.BACK;

				needsUpdate = true;

			}

		}

		if ( needsUpdate ) {

			gl.drawBuffers( drawBuffers );

		}


	}


	// texture

	activeTexture( webglSlot ) {

		const { gl, currentTextureSlot, maxTextures } = this;

		if ( webglSlot === undefined ) webglSlot = gl.TEXTURE0 + maxTextures - 1;

		if ( currentTextureSlot !== webglSlot ) {

			gl.activeTexture( webglSlot );
			this.currentTextureSlot = webglSlot;

		}

	}

	bindTexture( webglType, webglTexture, webglSlot ) {

		const { gl, currentTextureSlot, currentBoundTextures, maxTextures } = this;

		if ( webglSlot === undefined ) {

			if ( currentTextureSlot === null ) {

				webglSlot = gl.TEXTURE0 + maxTextures - 1;

			} else {

				webglSlot = currentTextureSlot;

			}

		}

		let boundTexture = currentBoundTextures[ webglSlot ];

		if ( boundTexture === undefined ) {

			boundTexture = { type: undefined, texture: undefined };
			currentBoundTextures[ webglSlot ] = boundTexture;

		}

		if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {

			if ( currentTextureSlot !== webglSlot ) {

				gl.activeTexture( webglSlot );
				this.currentTextureSlot = webglSlot;

			}

			gl.bindTexture( webglType, webglTexture );

			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;


		}


	}

	unbindTexture() {

		const { gl, currentTextureSlot, currentBoundTextures } = this;

		const boundTexture = currentBoundTextures[ currentTextureSlot ];

		if ( boundTexture !== undefined && boundTexture.type !== undefined ) {

			gl.bindTexture( boundTexture.type, null );

			boundTexture.type = undefined;
			boundTexture.texture = undefined;

		}

	}

}

class WebGLUtils {

	constructor( backend ) {

		this.backend = backend;

		this.gl = this.backend.gl;
		this.extensions = backend.extensions;

	}

	convert( p, colorSpace = NoColorSpace ) {

		const { gl, extensions } = this;

		let extension;

		if ( p === UnsignedByteType ) return gl.UNSIGNED_BYTE;
		if ( p === UnsignedShort4444Type ) return gl.UNSIGNED_SHORT_4_4_4_4;
		if ( p === UnsignedShort5551Type ) return gl.UNSIGNED_SHORT_5_5_5_1;

		if ( p === ByteType ) return gl.BYTE;
		if ( p === ShortType ) return gl.SHORT;
		if ( p === UnsignedShortType ) return gl.UNSIGNED_SHORT;
		if ( p === IntType ) return gl.INT;
		if ( p === UnsignedIntType ) return gl.UNSIGNED_INT;
		if ( p === FloatType ) return gl.FLOAT;

		if ( p === HalfFloatType ) {

			return gl.HALF_FLOAT;

		}

		if ( p === AlphaFormat ) return gl.ALPHA;
		if ( p === gl.RGB ) return gl.RGB; // patch since legacy doesn't use RGBFormat for rendering but here it's needed for packing optimization
		if ( p === RGBAFormat ) return gl.RGBA;
		if ( p === LuminanceFormat ) return gl.LUMINANCE;
		if ( p === LuminanceAlphaFormat ) return gl.LUMINANCE_ALPHA;
		if ( p === DepthFormat ) return gl.DEPTH_COMPONENT;
		if ( p === DepthStencilFormat ) return gl.DEPTH_STENCIL;

		// WebGL2 formats.

		if ( p === RedFormat ) return gl.RED;
		if ( p === RedIntegerFormat ) return gl.RED_INTEGER;
		if ( p === RGFormat ) return gl.RG;
		if ( p === RGIntegerFormat ) return gl.RG_INTEGER;
		if ( p === RGBAIntegerFormat ) return gl.RGBA_INTEGER;

		// S3TC

		if ( p === RGB_S3TC_DXT1_Format || p === RGBA_S3TC_DXT1_Format || p === RGBA_S3TC_DXT3_Format || p === RGBA_S3TC_DXT5_Format ) {

			if ( colorSpace === SRGBColorSpace ) {

				extension = extensions.get( 'WEBGL_compressed_texture_s3tc_srgb' );

				if ( extension !== null ) {

					if ( p === RGB_S3TC_DXT1_Format ) return extension.COMPRESSED_SRGB_S3TC_DXT1_EXT;
					if ( p === RGBA_S3TC_DXT1_Format ) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
					if ( p === RGBA_S3TC_DXT3_Format ) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
					if ( p === RGBA_S3TC_DXT5_Format ) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;

				} else {

					return null;

				}

			} else {

				extension = extensions.get( 'WEBGL_compressed_texture_s3tc' );

				if ( extension !== null ) {

					if ( p === RGB_S3TC_DXT1_Format ) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
					if ( p === RGBA_S3TC_DXT1_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
					if ( p === RGBA_S3TC_DXT3_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
					if ( p === RGBA_S3TC_DXT5_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;

				} else {

					return null;

				}

			}

		}

		// PVRTC

		if ( p === RGB_PVRTC_4BPPV1_Format || p === RGB_PVRTC_2BPPV1_Format || p === RGBA_PVRTC_4BPPV1_Format || p === RGBA_PVRTC_2BPPV1_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_pvrtc' );

			if ( extension !== null ) {

				if ( p === RGB_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				if ( p === RGB_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				if ( p === RGBA_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				if ( p === RGBA_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

			} else {

				return null;

			}

		}

		// ETC1

		if ( p === RGB_ETC1_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_etc1' );

			if ( extension !== null ) {

				return extension.COMPRESSED_RGB_ETC1_WEBGL;

			} else {

				return null;

			}

		}

		// ETC2

		if ( p === RGB_ETC2_Format || p === RGBA_ETC2_EAC_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_etc' );

			if ( extension !== null ) {

				if ( p === RGB_ETC2_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ETC2 : extension.COMPRESSED_RGB8_ETC2;
				if ( p === RGBA_ETC2_EAC_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : extension.COMPRESSED_RGBA8_ETC2_EAC;

			} else {

				return null;

			}

		}

		// ASTC

		if ( p === RGBA_ASTC_4x4_Format || p === RGBA_ASTC_5x4_Format || p === RGBA_ASTC_5x5_Format ||
			p === RGBA_ASTC_6x5_Format || p === RGBA_ASTC_6x6_Format || p === RGBA_ASTC_8x5_Format ||
			p === RGBA_ASTC_8x6_Format || p === RGBA_ASTC_8x8_Format || p === RGBA_ASTC_10x5_Format ||
			p === RGBA_ASTC_10x6_Format || p === RGBA_ASTC_10x8_Format || p === RGBA_ASTC_10x10_Format ||
			p === RGBA_ASTC_12x10_Format || p === RGBA_ASTC_12x12_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_astc' );

			if ( extension !== null ) {

				if ( p === RGBA_ASTC_4x4_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
				if ( p === RGBA_ASTC_5x4_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : extension.COMPRESSED_RGBA_ASTC_5x4_KHR;
				if ( p === RGBA_ASTC_5x5_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : extension.COMPRESSED_RGBA_ASTC_5x5_KHR;
				if ( p === RGBA_ASTC_6x5_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : extension.COMPRESSED_RGBA_ASTC_6x5_KHR;
				if ( p === RGBA_ASTC_6x6_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : extension.COMPRESSED_RGBA_ASTC_6x6_KHR;
				if ( p === RGBA_ASTC_8x5_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : extension.COMPRESSED_RGBA_ASTC_8x5_KHR;
				if ( p === RGBA_ASTC_8x6_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : extension.COMPRESSED_RGBA_ASTC_8x6_KHR;
				if ( p === RGBA_ASTC_8x8_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : extension.COMPRESSED_RGBA_ASTC_8x8_KHR;
				if ( p === RGBA_ASTC_10x5_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : extension.COMPRESSED_RGBA_ASTC_10x5_KHR;
				if ( p === RGBA_ASTC_10x6_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : extension.COMPRESSED_RGBA_ASTC_10x6_KHR;
				if ( p === RGBA_ASTC_10x8_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : extension.COMPRESSED_RGBA_ASTC_10x8_KHR;
				if ( p === RGBA_ASTC_10x10_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : extension.COMPRESSED_RGBA_ASTC_10x10_KHR;
				if ( p === RGBA_ASTC_12x10_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : extension.COMPRESSED_RGBA_ASTC_12x10_KHR;
				if ( p === RGBA_ASTC_12x12_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : extension.COMPRESSED_RGBA_ASTC_12x12_KHR;

			} else {

				return null;

			}

		}

		// BPTC

		if ( p === RGBA_BPTC_Format ) {

			extension = extensions.get( 'EXT_texture_compression_bptc' );

			if ( extension !== null ) {

				if ( p === RGBA_BPTC_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;

			} else {

				return null;

			}

		}

		// RGTC

		if ( p === RED_RGTC1_Format || p === SIGNED_RED_RGTC1_Format || p === RED_GREEN_RGTC2_Format || p === SIGNED_RED_GREEN_RGTC2_Format ) {

			extension = extensions.get( 'EXT_texture_compression_rgtc' );

			if ( extension !== null ) {

				if ( p === RGBA_BPTC_Format ) return extension.COMPRESSED_RED_RGTC1_EXT;
				if ( p === SIGNED_RED_RGTC1_Format ) return extension.COMPRESSED_SIGNED_RED_RGTC1_EXT;
				if ( p === RED_GREEN_RGTC2_Format ) return extension.COMPRESSED_RED_GREEN_RGTC2_EXT;
				if ( p === SIGNED_RED_GREEN_RGTC2_Format ) return extension.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;

			} else {

				return null;

			}

		}

		//

		if ( p === UnsignedInt248Type ) {

			return gl.UNSIGNED_INT_24_8;

		}

		// if "p" can't be resolved, assume the user defines a WebGL constant as a string (fallback/workaround for packed RGB formats)

		return ( gl[ p ] !== undefined ) ? gl[ p ] : null;

	}

	_clientWaitAsync() {

		const { gl } = this;

		const sync = gl.fenceSync( gl.SYNC_GPU_COMMANDS_COMPLETE, 0 );

		gl.flush();

		return new Promise( ( resolve, reject ) => {

			function test() {

				const res = gl.clientWaitSync( sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0 );

				if ( res === gl.WAIT_FAILED ) {

					gl.deleteSync( sync );

					reject();
					return;

				}

				if ( res === gl.TIMEOUT_EXPIRED ) {

					requestAnimationFrame( test );
					return;

				}

				gl.deleteSync( sync );

				resolve();

			}

			test();

		} );

	}

}

let initialized = false, wrappingToGL, filterToGL, compareToGL;

class WebGLTextureUtils {

	constructor( backend ) {

		this.backend = backend;

		this.gl = backend.gl;
		this.extensions = backend.extensions;
		this.defaultTextures = {};

		if ( initialized === false ) {

			this._init( this.gl );

			initialized = true;

		}

	}

	_init( gl ) {

		// Store only WebGL constants here.

		wrappingToGL = {
			[ RepeatWrapping ]: gl.REPEAT,
			[ ClampToEdgeWrapping ]: gl.CLAMP_TO_EDGE,
			[ MirroredRepeatWrapping ]: gl.MIRRORED_REPEAT
		};

		filterToGL = {
			[ NearestFilter ]: gl.NEAREST,
			[ NearestMipmapNearestFilter ]: gl.NEAREST_MIPMAP_NEAREST,
			[ NearestMipmapLinearFilter ]: gl.NEAREST_MIPMAP_LINEAR,

			[ LinearFilter ]: gl.LINEAR,
			[ LinearMipmapNearestFilter ]: gl.LINEAR_MIPMAP_NEAREST,
			[ LinearMipmapLinearFilter ]: gl.LINEAR_MIPMAP_LINEAR
		};

		compareToGL = {
			[ NeverCompare ]: gl.NEVER,
			[ AlwaysCompare ]: gl.ALWAYS,
			[ LessCompare ]: gl.LESS,
			[ LessEqualCompare ]: gl.LEQUAL,
			[ EqualCompare ]: gl.EQUAL,
			[ GreaterEqualCompare ]: gl.GEQUAL,
			[ GreaterCompare ]: gl.GREATER,
			[ NotEqualCompare ]: gl.NOTEQUAL
		};

	}

	filterFallback( f ) {

		const { gl } = this;

		if ( f === NearestFilter || f === NearestMipmapNearestFilter || f === NearestMipmapLinearFilter ) {

			return gl.NEAREST;

		}

		return gl.LINEAR;

	}

	getGLTextureType( texture ) {

		const { gl } = this;

		let glTextureType;

		if ( texture.isCubeTexture === true ) {

			glTextureType = gl.TEXTURE_CUBE_MAP;

		} else if ( texture.isDataArrayTexture === true ) {

			glTextureType = gl.TEXTURE_2D_ARRAY;

		} else {

			glTextureType = gl.TEXTURE_2D;


		}

		return glTextureType;

	}

	getInternalFormat( internalFormatName, glFormat, glType, colorSpace, forceLinearTransfer = false ) {

		const { gl, extensions } = this;

		if ( internalFormatName !== null ) {

			if ( gl[ internalFormatName ] !== undefined ) return gl[ internalFormatName ];

			console.warn( 'THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format \'' + internalFormatName + '\'' );

		}

		let internalFormat = glFormat;

		if ( glFormat === gl.RED ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.R32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.R16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.R8;

		}

		if ( glFormat === gl.RED_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.R8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.R16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.R32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.R8I;
			if ( glType === gl.SHORT ) internalFormat = gl.R16I;
			if ( glType === gl.INT ) internalFormat = gl.R32I;

		}

		if ( glFormat === gl.RG ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RG32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RG16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RG8;

		}

		if ( glFormat === gl.RGB ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RGB32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RGB16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGB8;
			if ( glType === gl.UNSIGNED_SHORT_5_6_5 ) internalFormat = gl.RGB565;
			if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) internalFormat = gl.RGB5_A1;
			if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) internalFormat = gl.RGB4;

		}

		if ( glFormat === gl.RGBA ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RGBA32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RGBA16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = ( colorSpace === SRGBColorSpace && forceLinearTransfer === false ) ? gl.SRGB8_ALPHA8 : gl.RGBA8;
			if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) internalFormat = gl.RGBA4;
			if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) internalFormat = gl.RGB5_A1;

		}

		if ( glFormat === gl.DEPTH_COMPONENT ) {

			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.DEPTH24_STENCIL8;
			if ( glType === gl.FLOAT ) internalFormat = gl.DEPTH_COMPONENT32F;

		}

		if ( glFormat === gl.DEPTH_STENCIL ) {

			if ( glType === gl.UNSIGNED_INT_24_8 ) internalFormat = gl.DEPTH24_STENCIL8;

		}

		if ( internalFormat === gl.R16F || internalFormat === gl.R32F ||
			internalFormat === gl.RG16F || internalFormat === gl.RG32F ||
			internalFormat === gl.RGBA16F || internalFormat === gl.RGBA32F ) {

			extensions.get( 'EXT_color_buffer_float' );

		}

		return internalFormat;

	}

	setTextureParameters( textureType, texture ) {

		const { gl, extensions, backend } = this;

		const { currentAnisotropy } = backend.get( texture );

		gl.texParameteri( textureType, gl.TEXTURE_WRAP_S, wrappingToGL[ texture.wrapS ] );
		gl.texParameteri( textureType, gl.TEXTURE_WRAP_T, wrappingToGL[ texture.wrapT ] );

		if ( textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY ) {

			gl.texParameteri( textureType, gl.TEXTURE_WRAP_R, wrappingToGL[ texture.wrapR ] );

		}

		gl.texParameteri( textureType, gl.TEXTURE_MAG_FILTER, filterToGL[ texture.magFilter ] );


		// follow WebGPU backend mapping for texture filtering
		const minFilter = ! texture.isVideoTexture && texture.minFilter === LinearFilter ? LinearMipmapLinearFilter : texture.minFilter;

		gl.texParameteri( textureType, gl.TEXTURE_MIN_FILTER, filterToGL[ minFilter ] );

		if ( texture.compareFunction ) {

			gl.texParameteri( textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE );
			gl.texParameteri( textureType, gl.TEXTURE_COMPARE_FUNC, compareToGL[ texture.compareFunction ] );

		}

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			if ( texture.magFilter === NearestFilter ) return;
			if ( texture.minFilter !== NearestMipmapLinearFilter && texture.minFilter !== LinearMipmapLinearFilter ) return;
			if ( texture.type === FloatType && extensions.has( 'OES_texture_float_linear' ) === false ) return; // verify extension for WebGL 1 and WebGL 2

			if ( texture.anisotropy > 1 || currentAnisotropy !== texture.anisotropy ) {

				const extension = extensions.get( 'EXT_texture_filter_anisotropic' );
				gl.texParameterf( textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, backend.getMaxAnisotropy() ) );
				backend.get( texture ).currentAnisotropy = texture.anisotropy;

			}

		}

	}

	createDefaultTexture( texture ) {

		const { gl, backend, defaultTextures } = this;


		const glTextureType = this.getGLTextureType( texture );

		let textureGPU = defaultTextures[ glTextureType ];

		if ( textureGPU === undefined ) {

			textureGPU = gl.createTexture();

			backend.state.bindTexture( glTextureType, textureGPU );
			gl.texParameteri( glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
			gl.texParameteri( glTextureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

			// gl.texImage2D( glTextureType, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data );

			defaultTextures[ glTextureType ] = textureGPU;

		}

		backend.set( texture, {
			textureGPU,
			glTextureType,
			isDefault: true
		} );

	}

	createTexture( texture, options ) {

		const { gl, backend } = this;
		const { levels, width, height, depth } = options;

		const glFormat = backend.utils.convert( texture.format, texture.colorSpace );
		const glType = backend.utils.convert( texture.type );
		const glInternalFormat = this.getInternalFormat( texture.internalFormat, glFormat, glType, texture.colorSpace, texture.isVideoTexture );

		const textureGPU = gl.createTexture();
		const glTextureType = this.getGLTextureType( texture );

		backend.state.bindTexture( glTextureType, textureGPU );

		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, texture.unpackAlignment );
		gl.pixelStorei( gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE );

		this.setTextureParameters( glTextureType, texture );

		if ( texture.isDataArrayTexture ) {

			gl.texStorage3D( gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, width, height, depth );

		} else if ( ! texture.isVideoTexture ) {

			gl.texStorage2D( glTextureType, levels, glInternalFormat, width, height );

		}

		backend.set( texture, {
			textureGPU,
			glTextureType,
			glFormat,
			glType,
			glInternalFormat
		} );

	}

	copyBufferToTexture( buffer, texture ) {

		const { gl, backend } = this;

		const { textureGPU, glTextureType, glFormat, glType } = backend.get( texture );

		const { width, height } = texture.source.data;

		gl.bindBuffer( gl.PIXEL_UNPACK_BUFFER, buffer );

		backend.state.bindTexture( glTextureType, textureGPU );

		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false );
		gl.texSubImage2D( glTextureType, 0, 0, 0, width, height, glFormat, glType, 0 );

		gl.bindBuffer( gl.PIXEL_UNPACK_BUFFER, null );

		backend.state.unbindTexture();
		// debug
		// const framebuffer = gl.createFramebuffer();
		// gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
		// gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glTextureType, textureGPU, 0 );

		// const readout = new Float32Array( width * height * 4 );

		// const altFormat = gl.getParameter( gl.IMPLEMENTATION_COLOR_READ_FORMAT );
		// const altType = gl.getParameter( gl.IMPLEMENTATION_COLOR_READ_TYPE );

		// gl.readPixels( 0, 0, width, height, altFormat, altType, readout );
		// gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		// console.log( readout );

	}

	updateTexture( texture, options ) {

		const { gl } = this;
		const { width, height } = options;
		const { textureGPU, glTextureType, glFormat, glType, glInternalFormat } = this.backend.get( texture );

		if ( texture.isRenderTargetTexture || ( textureGPU === undefined /* unsupported texture format */ ) )
			return;

		const getImage = ( source ) => {

			if ( source.isDataTexture ) {

				return source.image.data;

			} else if ( source instanceof ImageBitmap || source instanceof OffscreenCanvas || source instanceof HTMLImageElement || source instanceof HTMLCanvasElement ) {

				return source;

			}

			return source.data;

		};

		this.backend.state.bindTexture( glTextureType, textureGPU );

		if ( texture.isCompressedTexture ) {

			const mipmaps = texture.mipmaps;

			for ( let i = 0; i < mipmaps.length; i ++ ) {

				const mipmap = mipmaps[ i ];

				if ( texture.isCompressedArrayTexture ) {

					const image = options.image;

					if ( texture.format !== gl.RGBA ) {

						if ( glFormat !== null ) {

							gl.compressedTexSubImage3D( gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, mipmap.data, 0, 0 );


						} else {

							console.warn( 'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()' );

						}

					} else {

						gl.texSubImage3D( gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, glType, mipmap.data );

					}

				} else {

					if ( glFormat !== null ) {

						gl.compressedTexSubImage2D( gl.TEXTURE_2D, i, 0, 0, mipmap.width, mipmap.height, glFormat, mipmap.data );

					} else {

						console.warn( 'Unsupported compressed texture format' );

					}

				}

			}

		} else if ( texture.isCubeTexture ) {

			const images = options.images;

			for ( let i = 0; i < 6; i ++ ) {

				const image = getImage( images[ i ] );

				gl.texSubImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, width, height, glFormat, glType, image );

			}

		} else if ( texture.isDataArrayTexture ) {

			const image = options.image;

			gl.texSubImage3D( gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data );

		} else if ( texture.isVideoTexture ) {

			texture.update();

			gl.texImage2D( glTextureType, 0, glInternalFormat, glFormat, glType, options.image );


		} else {

			const image = getImage( options.image );

			gl.texSubImage2D( glTextureType, 0, 0, 0, width, height, glFormat, glType, image );

		}

	}

	generateMipmaps( texture ) {

		const { gl, backend } = this;
		const { textureGPU, glTextureType } = backend.get( texture );

		backend.state.bindTexture( glTextureType, textureGPU );
		gl.generateMipmap( glTextureType );

	}

	deallocateRenderBuffers( renderTarget ) {


		const { gl, backend } = this;

		// remove framebuffer reference
		if ( renderTarget ) {

			const renderContextData = backend.get( renderTarget );

			renderContextData.renderBufferStorageSetup = undefined;

			if ( renderContextData.framebuffer ) {

				gl.deleteFramebuffer( renderContextData.framebuffer );
				renderContextData.framebuffer = undefined;

			}

			if ( renderContextData.depthRenderbuffer ) {

				gl.deleteRenderbuffer( renderContextData.depthRenderbuffer );
				renderContextData.depthRenderbuffer = undefined;

			}

			if ( renderContextData.stencilRenderbuffer ) {

				gl.deleteRenderbuffer( renderContextData.stencilRenderbuffer );
				renderContextData.stencilRenderbuffer = undefined;

			}

			if ( renderContextData.msaaFrameBuffer ) {

				gl.deleteFramebuffer( renderContextData.msaaFrameBuffer );
				renderContextData.msaaFrameBuffer = undefined;

			}

			if ( renderContextData.msaaRenderbuffers ) {

				for ( let i = 0; i < renderContextData.msaaRenderbuffers.length; i ++ ) {

					gl.deleteRenderbuffer( renderContextData.msaaRenderbuffers[ i ] );

				}

				renderContextData.msaaRenderbuffers = undefined;

			}

		}

	}

	destroyTexture( texture ) {

		const { gl, backend } = this;
		const { textureGPU, renderTarget } = backend.get( texture );

		this.deallocateRenderBuffers( renderTarget );
		gl.deleteTexture( textureGPU );

		backend.delete( texture );

	}

	copyFramebufferToTexture( texture, renderContext ) {

		const { gl } = this;
		const { state } = this.backend;

		const { textureGPU } = this.backend.get( texture );

		const width = texture.image.width;
		const height = texture.image.height;

		if ( texture.isDepthTexture ) {

			let mask = gl.DEPTH_BUFFER_BIT;

			if ( renderContext.stencil ) {

				mask |= gl.STENCIL_BUFFER_BIT;

			}

			const fb = gl.createFramebuffer();
			state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

			gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, textureGPU, 0 );

			gl.blitFramebuffer( 0, 0, width, height, 0, 0, width, height, mask, gl.NEAREST );

			gl.deleteFramebuffer( fb );

		} else {

			state.bindTexture( gl.TEXTURE_2D, textureGPU );
			gl.copyTexSubImage2D( gl.TEXTURE_2D, 0, 0, 0, 0, 0, width, height );

			state.unbindTexture();

		}

		if ( texture.generateMipmaps ) this.generateMipmaps( texture );

		this.backend._setFramebuffer( renderContext );

	}

	// Setup storage for internal depth/stencil buffers and bind to correct framebuffer
	setupRenderBufferStorage( renderbuffer, renderContext ) {

		const { gl } = this;
		const renderTarget = renderContext.renderTarget;

		const { samples, depthTexture, depthBuffer, stencilBuffer, width, height } = renderTarget;

		gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );

		if ( depthBuffer && ! stencilBuffer ) {

			let glInternalFormat = gl.DEPTH_COMPONENT24;

			if ( samples > 0 ) {


				if ( depthTexture && depthTexture.isDepthTexture ) {

					if ( depthTexture.type === gl.FLOAT ) {

						glInternalFormat = gl.DEPTH_COMPONENT32F;

					}

				}

				gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, glInternalFormat, width, height );

			} else {

				gl.renderbufferStorage( gl.RENDERBUFFER, glInternalFormat, width, height );

			}

			gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer );

		} else if ( depthBuffer && stencilBuffer ) {

			if ( samples > 0 ) {

				gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, gl.DEPTH24_STENCIL8, width, height );

			} else {

				gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height );

			}


			gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderbuffer );

		}

	}

	async copyTextureToBuffer( texture, x, y, width, height ) {

		const { backend, gl } = this;

		const { textureGPU, glFormat, glType } = this.backend.get( texture );

		const fb = gl.createFramebuffer();

		gl.bindFramebuffer( gl.READ_FRAMEBUFFER, fb );
		gl.framebufferTexture2D( gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureGPU, 0 );

		const typedArrayType = this._getTypedArrayType( glType );
		const bytesPerTexel = this._getBytesPerTexel( glFormat );

		const elementCount = width * height;
		const byteLength = elementCount * bytesPerTexel;

		const buffer = gl.createBuffer();

		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, buffer );
		gl.bufferData( gl.PIXEL_PACK_BUFFER, byteLength, gl.STREAM_READ );
		gl.readPixels( x, y, width, height, glFormat, glType, 0 );
		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, null );

		await backend.utils._clientWaitAsync();

		const dstBuffer = new typedArrayType( elementCount );

		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, buffer );
		gl.getBufferSubData( gl.PIXEL_PACK_BUFFER, 0, dstBuffer );
		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, null );

		gl.deleteFramebuffer( fb );

		return dstBuffer;

	}

	_getTypedArrayType( glType ) {

		const { gl } = this;

		if ( glType === gl.UNSIGNED_BYTE ) return Uint8Array;

		if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) return Uint16Array;
		if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) return Uint16Array;
		if ( glType === gl.UNSIGNED_SHORT_5_6_5 ) return Uint16Array;
		if ( glType === gl.UNSIGNED_SHORT ) return Uint16Array;
		if ( glType === gl.UNSIGNED_INT ) return Uint32Array;

		if ( glType === gl.FLOAT ) return Float32Array;

		throw new Error( `Unsupported WebGL type: ${glType}` );

	}

	_getBytesPerTexel( glFormat ) {

		const { gl } = this;

		if ( glFormat === gl.RGBA ) return 4;
		if ( glFormat === gl.RGB ) return 3;
		if ( glFormat === gl.ALPHA ) return 1;

	}

}

class WebGLExtensions {

	constructor( backend ) {

		this.backend = backend;

		this.gl = this.backend.gl;
		this.availableExtensions = this.gl.getSupportedExtensions();

		this.extensions = {};

	}

	get( name ) {

		let extension = this.extensions[ name ];

		if ( extension === undefined ) {

			extension = this.gl.getExtension( name );

		}

		return extension;

	}

	has( name ) {

		return this.availableExtensions.includes( name );

	}

}

class WebGLCapabilities {

	constructor( backend ) {

		this.backend = backend;

		this.maxAnisotropy = null;

	}

	getMaxAnisotropy() {

		if ( this.maxAnisotropy !== null ) return this.maxAnisotropy;

		const gl = this.backend.gl;
		const extensions = this.backend.extensions;

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			const extension = extensions.get( 'EXT_texture_filter_anisotropic' );

			this.maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			this.maxAnisotropy = 0;

		}

		return this.maxAnisotropy;

	}

}

const GLFeatureName = {

	'WEBGL_compressed_texture_astc': 'texture-compression-astc',
	'WEBGL_compressed_texture_etc': 'texture-compression-etc2',
	'WEBGL_compressed_texture_etc1': 'texture-compression-etc1',
	'WEBGL_compressed_texture_pvrtc': 'texture-compression-pvrtc',
	'WEBKIT_WEBGL_compressed_texture_pvrtc': 'texture-compression-pvrtc',
	'WEBGL_compressed_texture_s3tc': 'texture-compression-bc',
	'EXT_texture_compression_bptc': 'texture-compression-bptc',

};

//

class WebGLBackend extends Backend {

	constructor( parameters = {} ) {

		super( parameters );

		this.isWebGLBackend = true;

	}

	init( renderer ) {

		super.init( renderer );

		//

		const parameters = this.parameters;

		const glContext = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgl2' );

		this.gl = glContext;

		this.extensions = new WebGLExtensions( this );
		this.capabilities = new WebGLCapabilities( this );
		this.attributeUtils = new WebGLAttributeUtils( this );
		this.textureUtils = new WebGLTextureUtils( this );
		this.state = new WebGLState( this );
		this.utils = new WebGLUtils( this );

		this.vaoCache = {};
		this.transformFeedbackCache = {};
		this.discard = false;

		this.extensions.get( 'EXT_color_buffer_float' );
		this.parallel = this.extensions.get( 'KHR_parallel_shader_compile' );
		this._currentContext = null;

	}

	get coordinateSystem() {

		return WebGLCoordinateSystem;

	}

	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}

	getContext() {

		return this.gl;

	}

	beginRender( renderContext ) {

		const { gl } = this;
		const renderContextData = this.get( renderContext );

		//

		//

		renderContextData.previousContext = this._currentContext;
		this._currentContext = renderContext;

		this._setFramebuffer( renderContext );

		this.clear( renderContext.clearColor, renderContext.clearDepth, renderContext.clearStencil, renderContext, false );

		//
		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		} else {

			gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			gl.scissor( x, y, width, height );

		}

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			// Get a reference to the array of objects with queries. The renderContextData property
			// can be changed by another render pass before the async reading of all previous queries complete
			renderContextData.currentOcclusionQueries = renderContextData.occlusionQueries;
			renderContextData.currentOcclusionQueryObjects = renderContextData.occlusionQueryObjects;

			renderContextData.lastOcclusionObject = null;
			renderContextData.occlusionQueries = new Array( occlusionQueryCount );
			renderContextData.occlusionQueryObjects = new Array( occlusionQueryCount );
			renderContextData.occlusionQueryIndex = 0;

		}

	}

	finishRender( renderContext ) {

		const { gl, state } = this;
		const renderContextData = this.get( renderContext );
		const previousContext = renderContextData.previousContext;

		const textures = renderContext.textures;

		if ( textures !== null ) {

			for ( let i = 0; i < textures.length; i ++ ) {

				const texture = textures[ i ];

				if ( texture.generateMipmaps ) {

					this.generateMipmaps( texture );

				}

			}

		}

		this._currentContext = previousContext;


		if ( renderContext.textures !== null && renderContext.renderTarget ) {

			const renderTargetContextData = this.get( renderContext.renderTarget );

			const { samples } = renderContext.renderTarget;
			const fb = renderTargetContextData.framebuffer;

			const mask = gl.COLOR_BUFFER_BIT;

			if ( samples > 0 ) {

				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;

				const textures = renderContext.textures;

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );
				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				for ( let i = 0; i < textures.length; i ++ ) {

					// TODO Add support for MRT

					gl.blitFramebuffer( 0, 0, renderContext.width, renderContext.height, 0, 0, renderContext.width, renderContext.height, mask, gl.NEAREST );

					gl.invalidateFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray );

				}

			}


		}

		if ( previousContext !== null ) {

			this._setFramebuffer( previousContext );

			if ( previousContext.viewport ) {

				this.updateViewport( previousContext );

			} else {

				const gl = this.gl;

				gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

			}

		}

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			const renderContextData = this.get( renderContext );

			if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

				const { gl } = this;

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

			}

			this.resolveOccludedAsync( renderContext );

		}


	}

	resolveOccludedAsync( renderContext ) {

		const renderContextData = this.get( renderContext );

		// handle occlusion query results

		const { currentOcclusionQueries, currentOcclusionQueryObjects } = renderContextData;

		if ( currentOcclusionQueries && currentOcclusionQueryObjects ) {

			const occluded = new WeakSet();
			const { gl } = this;

			renderContextData.currentOcclusionQueryObjects = null;
			renderContextData.currentOcclusionQueries = null;

			const check = () => {

				let completed = 0;

				// check all queries and requeue as appropriate
				for ( let i = 0; i < currentOcclusionQueries.length; i ++ ) {

					const query = currentOcclusionQueries[ i ];

					if ( query === null ) continue;

					if ( gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE ) ) {

						if ( gl.getQueryParameter( query, gl.QUERY_RESULT ) > 0 ) occluded.add( currentOcclusionQueryObjects[ i ] );

						currentOcclusionQueries[ i ] = null;
						gl.deleteQuery( query );

						completed ++;

					}

				}

				if ( completed < currentOcclusionQueries.length ) {

					requestAnimationFrame( check );

				} else {

					renderContextData.occluded = occluded;

				}

			};

			check();

		}

	}

	isOccluded( renderContext, object ) {

		const renderContextData = this.get( renderContext );

		return renderContextData.occluded && renderContextData.occluded.has( object );

	}

	updateViewport( renderContext ) {

		const gl = this.gl;
		const { x, y, width, height } = renderContext.viewportValue;

		gl.viewport( x, y, width, height );

	}

	setScissorTest( boolean ) {

		const gl = this.gl;

		if ( boolean ) {

			gl.enable( gl.SCISSOR_TEST );

		} else {

			gl.disable( gl.SCISSOR_TEST );

		}

	}

	clear( color, depth, stencil, descriptor = null, setFrameBuffer = true ) {

		const { gl } = this;

		if ( descriptor === null ) {

			descriptor = {
				textures: null,
				clearColorValue: this.getClearColor()
			};

		}

		//

		let clear = 0;

		if ( color ) clear |= gl.COLOR_BUFFER_BIT;
		if ( depth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( stencil ) clear |= gl.STENCIL_BUFFER_BIT;

		if ( clear !== 0 ) {

			const clearColor = descriptor.clearColorValue || this.getClearColor();

			if ( depth ) this.state.setDepthMask( true );

			if ( descriptor.textures === null ) {

				gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearColor.a );
				gl.clear( clear );

			} else {

				if ( setFrameBuffer ) this._setFramebuffer( descriptor );

				if ( color ) {

					for ( let i = 0; i < descriptor.textures.length; i ++ ) {

						gl.clearBufferfv( gl.COLOR, i, [ clearColor.r, clearColor.g, clearColor.b, clearColor.a ] );

					}

				}

				if ( depth && stencil ) {

					gl.clearBufferfi( gl.DEPTH_STENCIL, 0, 1, 0 );

				} else if ( depth ) {

					gl.clearBufferfv( gl.DEPTH, 0, [ 1.0 ] );

				} else if ( stencil ) {

					gl.clearBufferiv( gl.STENCIL, 0, [ 0 ] );

				}

			}

		}

	}

	beginCompute( /*computeGroup*/ ) {

		const gl = this.gl;

		gl.bindFramebuffer( gl.FRAMEBUFFER, null );

	}

	compute( computeGroup, computeNode, bindings, pipeline ) {

		const gl = this.gl;

		if ( ! this.discard ) {

			// required here to handle async behaviour of render.compute()
			gl.enable( gl.RASTERIZER_DISCARD );
			this.discard = true;

		}

		const { programGPU, transformBuffers, attributes } = this.get( pipeline );

		const vaoKey = this._getVaoKey( null, attributes );

		const vaoGPU = this.vaoCache[ vaoKey ];

		if ( vaoGPU === undefined ) {

			this._createVao( null, attributes );

		} else {

			gl.bindVertexArray( vaoGPU );

		}

		gl.useProgram( programGPU );

		this._bindUniforms( bindings );

		const transformFeedbackGPU = this._getTransformFeedback( transformBuffers );

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, transformFeedbackGPU );
		gl.beginTransformFeedback( gl.POINTS );

		if ( attributes[ 0 ].isStorageInstancedBufferAttribute ) {

			gl.drawArraysInstanced( gl.POINTS, 0, 1, computeNode.count );

		} else {

			gl.drawArrays( gl.POINTS, 0, computeNode.count );

		}

		gl.endTransformFeedback();
		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, null );

		// switch active buffers

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			const dualAttributeData = transformBuffers[ i ];

			if ( dualAttributeData.pbo ) {

				this.textureUtils.copyBufferToTexture( dualAttributeData.transformBuffer, dualAttributeData.pbo );

			}

			dualAttributeData.switchBuffers();


		}

	}

	finishCompute( /*computeGroup*/ ) {

		const gl = this.gl;

		this.discard = false;

		gl.disable( gl.RASTERIZER_DISCARD );

	}

	draw( renderObject, info ) {

		const { pipeline, material, context } = renderObject;
		const { programGPU } = this.get( pipeline );

		const { gl, state } = this;

		const contextData = this.get( context );

		//

		this._bindUniforms( renderObject.getBindings() );

		state.setMaterial( material );

		gl.useProgram( programGPU );

		//

		let vaoGPU = renderObject.staticVao;

		if ( vaoGPU === undefined ) {

			const vaoKey = this._getVaoKey( renderObject.getIndex(), renderObject.getAttributes() );

			vaoGPU = this.vaoCache[ vaoKey ];

			if ( vaoGPU === undefined ) {

				let staticVao;

				( { vaoGPU, staticVao } = this._createVao( renderObject.getIndex(), renderObject.getAttributes() ) );

				if ( staticVao ) renderObject.staticVao = vaoGPU;

			}

		}

		gl.bindVertexArray( vaoGPU );

		//

		const index = renderObject.getIndex();

		const object = renderObject.object;
		const geometry = renderObject.geometry;
		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		//

		const lastObject = contextData.lastOcclusionObject;

		if ( lastObject !== object && lastObject !== undefined ) {

			if ( lastObject !== null && lastObject.occlusionTest === true ) {

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

				contextData.occlusionQueryIndex ++;

			}

			if ( object.occlusionTest === true ) {

				const query = gl.createQuery();

				gl.beginQuery( gl.ANY_SAMPLES_PASSED, query );

				contextData.occlusionQueries[ contextData.occlusionQueryIndex ] = query;
				contextData.occlusionQueryObjects[ contextData.occlusionQueryIndex ] = object;

			}

			contextData.lastOcclusionObject = object;

		}

		//

		let mode;
		if ( object.isPoints ) mode = gl.POINTS;
		else if ( object.isLineSegments ) mode = gl.LINES;
		else if ( object.isLine ) mode = gl.LINE_STRIP;
		else if ( object.isLineLoop ) mode = gl.LINE_LOOP;
		else {

			if ( material.wireframe === true ) {

				state.setLineWidth( material.wireframeLinewidth * this.renderer.getPixelRatio() );
				mode = gl.LINES;

			} else {

				mode = gl.TRIANGLES;

			}

		}

		//

		const instanceCount = this.getInstanceCount( renderObject );

		if ( index !== null ) {

			const indexData = this.get( index );
			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			if ( instanceCount > 1 ) {

				gl.drawElementsInstanced( mode, index.count, indexData.type, firstVertex, instanceCount );

			} else {

				gl.drawElements( mode, index.count, indexData.type, firstVertex );

			}

			info.update( object, indexCount, 1 );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			if ( instanceCount > 1 ) {

				gl.drawArraysInstanced( mode, 0, vertexCount, instanceCount );

			} else {

				gl.drawArrays( mode, 0, vertexCount );

			}

			//gl.drawArrays( mode, vertexCount, gl.UNSIGNED_SHORT, firstVertex );

			info.update( object, vertexCount, 1 );

		}

		//

		gl.bindVertexArray( null );

	}

	needsRenderUpdate( /*renderObject*/ ) {

		return false;

	}

	getRenderCacheKey( renderObject ) {

		return renderObject.id;

	}

	// textures

	createDefaultTexture( texture ) {

		this.textureUtils.createDefaultTexture( texture );

	}

	createTexture( texture, options ) {

		this.textureUtils.createTexture( texture, options );

	}

	updateTexture( texture, options ) {

		this.textureUtils.updateTexture( texture, options );

	}

	generateMipmaps( texture ) {

		this.textureUtils.generateMipmaps( texture );

	}


	destroyTexture( texture ) {

		this.textureUtils.destroyTexture( texture );

	}

	copyTextureToBuffer( texture, x, y, width, height ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height );

	}

	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	destroySampler() {}

	// node builder

	createNodeBuilder( object, renderer, scene = null ) {

		return new GLSLNodeBuilder( object, renderer, scene );

	}

	// program

	createProgram( program ) {

		const gl = this.gl;
		const { stage, code } = program;

		const shader = stage === 'fragment' ? gl.createShader( gl.FRAGMENT_SHADER ) : gl.createShader( gl.VERTEX_SHADER );

		gl.shaderSource( shader, code );
		gl.compileShader( shader );

		this.set( program, {
			shaderGPU: shader
		} );

	}

	destroyProgram( /*program*/ ) {

		console.warn( 'Abstract class.' );

	}

	createRenderPipeline( renderObject, promises ) {

		const gl = this.gl;
		const pipeline = renderObject.pipeline;

		// Program

		const { fragmentProgram, vertexProgram } = pipeline;

		const programGPU = gl.createProgram();

		const fragmentShader = this.get( fragmentProgram ).shaderGPU;
		const vertexShader = this.get( vertexProgram ).shaderGPU;

		gl.attachShader( programGPU, fragmentShader );
		gl.attachShader( programGPU, vertexShader );
		gl.linkProgram( programGPU );

		this.set( pipeline, {
			programGPU,
			fragmentShader,
			vertexShader
		} );

		if ( promises !== null && this.parallel ) {

			const p = new Promise( ( resolve /*, reject*/ ) => {

				const parallel = this.parallel;
				const checkStatus = () => {

					if ( gl.getProgramParameter( programGPU, parallel.COMPLETION_STATUS_KHR ) ) {

						this._completeCompile( renderObject, pipeline );
						resolve();

					} else {

						requestAnimationFrame( checkStatus );

					}

				};

				checkStatus();

			} );

			promises.push( p );

			return;

		}

		this._completeCompile( renderObject, pipeline );

	}

	_completeCompile( renderObject, pipeline ) {

		const gl = this.gl;
		const pipelineData = this.get( pipeline );
		const { programGPU, fragmentShader, vertexShader } = pipelineData;

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			console.error( 'THREE.WebGLBackend:', gl.getProgramInfoLog( programGPU ) );

			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( fragmentShader ) );
			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( vertexShader ) );

		}

		gl.useProgram( programGPU );

		// Bindings

		this._setupBindings( renderObject.getBindings(), programGPU );

		//

		this.set( pipeline, {
			programGPU
		} );

	}

	createComputePipeline( computePipeline, bindings ) {

		const gl = this.gl;

		// Program

		const fragmentProgram = {
			stage: 'fragment',
			code: '#version 300 es\nprecision highp float;\nvoid main() {}'
		};

		this.createProgram( fragmentProgram );

		const { computeProgram } = computePipeline;

		const programGPU = gl.createProgram();

		const fragmentShader = this.get( fragmentProgram ).shaderGPU;
		const vertexShader = this.get( computeProgram ).shaderGPU;

		const transforms = computeProgram.transforms;

		const transformVaryingNames = [];
		const transformAttributeNodes = [];

		for ( let i = 0; i < transforms.length; i ++ ) {

			const transform = transforms[ i ];

			transformVaryingNames.push( transform.varyingName );
			transformAttributeNodes.push( transform.attributeNode );

		}

		gl.attachShader( programGPU, fragmentShader );
		gl.attachShader( programGPU, vertexShader );

		gl.transformFeedbackVaryings(
			programGPU,
			transformVaryingNames,
			gl.SEPARATE_ATTRIBS,
		);

		gl.linkProgram( programGPU );

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			console.error( 'THREE.WebGLBackend:', gl.getProgramInfoLog( programGPU ) );

			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( fragmentShader ) );
			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( vertexShader ) );

		}

		gl.useProgram( programGPU );

		// Bindings

		this.createBindings( bindings );

		this._setupBindings( bindings, programGPU );

		const attributeNodes = computeProgram.attributes;
		const attributes = [];
		const transformBuffers = [];

		for ( let i = 0; i < attributeNodes.length; i ++ ) {

			const attribute = attributeNodes[ i ].node.attribute;

			attributes.push( attribute );

			if ( ! this.has( attribute ) ) this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

		}

		for ( let i = 0; i < transformAttributeNodes.length; i ++ ) {

			const attribute = transformAttributeNodes[ i ].attribute;

			if ( ! this.has( attribute ) ) this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

			const attributeData = this.get( attribute );

			transformBuffers.push( attributeData );

		}

		//

		this.set( computePipeline, {
			programGPU,
			transformBuffers,
			attributes
		} );

	}

	createBindings( bindings ) {

		this.updateBindings( bindings );

	}

	updateBindings( bindings ) {

		const { gl } = this;

		let groupIndex = 0;
		let textureIndex = 0;

		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const bufferGPU = gl.createBuffer();
				const data = binding.buffer;

				gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
				gl.bufferData( gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW );
				gl.bindBufferBase( gl.UNIFORM_BUFFER, groupIndex, bufferGPU );

				this.set( binding, {
					index: groupIndex ++,
					bufferGPU
				} );

			} else if ( binding.isSampledTexture ) {

				const { textureGPU, glTextureType } = this.get( binding.texture );

				this.set( binding, {
					index: textureIndex ++,
					textureGPU,
					glTextureType
				} );

			}

		}

	}

	updateBinding( binding ) {

		const gl = this.gl;

		if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

			const bindingData = this.get( binding );
			const bufferGPU = bindingData.bufferGPU;
			const data = binding.buffer;

			gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
			gl.bufferData( gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW );

		}

	}

	// attributes

	createIndexAttribute( attribute ) {

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ELEMENT_ARRAY_BUFFER );

	}

	createAttribute( attribute ) {

		if ( this.has( attribute ) ) return;

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

	}

	createStorageAttribute( attribute ) {

		//console.warn( 'Abstract class.' );

	}

	updateAttribute( attribute ) {

		this.attributeUtils.updateAttribute( attribute );

	}

	destroyAttribute( attribute ) {

		this.attributeUtils.destroyAttribute( attribute );

	}

	updateSize() {

		//console.warn( 'Abstract class.' );

	}

	async hasFeatureAsync( name ) {

		return this.hasFeature( name );

	}

	hasFeature( name ) {

		const keysMatching = Object.keys( GLFeatureName ).filter( key => GLFeatureName[ key ] === name );

		const extensions = this.extensions;

		for ( let i = 0; i < keysMatching.length; i ++ ) {


			if ( extensions.has( keysMatching[ i ] ) ) return true;

		}

		return false;

	}


	getMaxAnisotropy() {

		return this.capabilities.getMaxAnisotropy();

	}

	copyFramebufferToTexture( texture, renderContext ) {

		this.textureUtils.copyFramebufferToTexture( texture, renderContext );

	}

	_setFramebuffer( renderContext ) {

		const { gl, state } = this;

		let currentFrameBuffer = null;

		if ( renderContext.textures !== null ) {

			const renderTarget = renderContext.renderTarget;
			const renderTargetContextData = this.get( renderTarget );
			const { samples, depthBuffer, stencilBuffer } = renderTarget;
			const cubeFace = this.renderer._activeCubeFace;
			const isCube = renderTarget.isWebGLCubeRenderTarget === true;

			let msaaFb = renderTargetContextData.msaaFrameBuffer;
			let depthRenderbuffer = renderTargetContextData.depthRenderbuffer;

			let fb;

			if ( isCube ) {

				if ( renderTargetContextData.cubeFramebuffers === undefined ) {

					renderTargetContextData.cubeFramebuffers = [];

				}

				fb = renderTargetContextData.cubeFramebuffers[ cubeFace ];

			} else {

				fb = renderTargetContextData.framebuffer;

			}

			if ( fb === undefined ) {

				fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.FRAMEBUFFER, fb );

				const textures = renderContext.textures;

				if ( isCube ) {

					renderTargetContextData.cubeFramebuffers[ cubeFace ] = fb;
					const { textureGPU } = this.get( textures[ 0 ] );

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, textureGPU, 0 );

				} else {

					for ( let i = 0; i < textures.length; i ++ ) {

						const texture = textures[ i ];
						const textureData = this.get( texture );
						textureData.renderTarget = renderContext.renderTarget;

						const attachment = gl.COLOR_ATTACHMENT0 + i;

						gl.framebufferTexture2D( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0 );

					}

					renderTargetContextData.framebuffer = fb;

					state.drawBuffers( renderContext, fb );

				}

				if ( renderContext.depthTexture !== null ) {

					const textureData = this.get( renderContext.depthTexture );
					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

					gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

				}

			}

			if ( samples > 0 ) {

				if ( msaaFb === undefined ) {

					const invalidationArray = [];

					msaaFb = gl.createFramebuffer();

					state.bindFramebuffer( gl.FRAMEBUFFER, msaaFb );

					const msaaRenderbuffers = [];

					const textures = renderContext.textures;

					for ( let i = 0; i < textures.length; i ++ ) {


						msaaRenderbuffers[ i ] = gl.createRenderbuffer();

						gl.bindRenderbuffer( gl.RENDERBUFFER, msaaRenderbuffers[ i ] );

						invalidationArray.push( gl.COLOR_ATTACHMENT0 + i );

						if ( depthBuffer ) {

							const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
							invalidationArray.push( depthStyle );

						}

						const texture = renderContext.textures[ i ];
						const textureData = this.get( texture );

						gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, textureData.glInternalFormat, renderContext.width, renderContext.height );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );


					}

					renderTargetContextData.msaaFrameBuffer = msaaFb;
					renderTargetContextData.msaaRenderbuffers = msaaRenderbuffers;

					if ( depthRenderbuffer === undefined ) {

						depthRenderbuffer = gl.createRenderbuffer();
						this.textureUtils.setupRenderBufferStorage( depthRenderbuffer, renderContext );

						renderTargetContextData.depthRenderbuffer = depthRenderbuffer;

						const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
						invalidationArray.push( depthStyle );

					}

					renderTargetContextData.invalidationArray = invalidationArray;

				}

				currentFrameBuffer = renderTargetContextData.msaaFrameBuffer;

			} else {

				currentFrameBuffer = fb;

			}

		}

		state.bindFramebuffer( gl.FRAMEBUFFER, currentFrameBuffer );

	}


	_getVaoKey( index, attributes ) {

		let key = [];

		if ( index !== null ) {

			const indexData = this.get( index );

			key += ':' + indexData.id;

		}

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attributeData = this.get( attributes[ i ] );

			key += ':' + attributeData.id;

		}

		return key;

	}

	_createVao( index, attributes ) {

		const { gl } = this;

		const vaoGPU = gl.createVertexArray();
		let key = '';

		let staticVao = true;

		gl.bindVertexArray( vaoGPU );

		if ( index !== null ) {

			const indexData = this.get( index );

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexData.bufferGPU );

			key += ':' + indexData.id;

		}

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];
			const attributeData = this.get( attribute );

			key += ':' + attributeData.id;

			gl.bindBuffer( gl.ARRAY_BUFFER, attributeData.bufferGPU );
			gl.enableVertexAttribArray( i );

			if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) staticVao = false;

			let stride, offset;

			if ( attribute.isInterleavedBufferAttribute === true ) {

				stride = attribute.data.stride * attributeData.bytesPerElement;
				offset = attribute.offset * attributeData.bytesPerElement;

			} else {

				stride = 0;
				offset = 0;

			}

			if ( attributeData.isInteger ) {

				gl.vertexAttribIPointer( i, attribute.itemSize, attributeData.type, stride, offset );

			} else {

				gl.vertexAttribPointer( i, attribute.itemSize, attributeData.type, attribute.normalized, stride, offset );

			}

			if ( attribute.isInstancedBufferAttribute && ! attribute.isInterleavedBufferAttribute ) {

				gl.vertexAttribDivisor( i, attribute.meshPerAttribute );

			} else if ( attribute.isInterleavedBufferAttribute && attribute.data.isInstancedInterleavedBuffer ) {

				gl.vertexAttribDivisor( i, attribute.data.meshPerAttribute );

			}

		}

		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		this.vaoCache[ key ] = vaoGPU;

		return { vaoGPU, staticVao };

	}

	_getTransformFeedback( transformBuffers ) {

		let key = '';

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			key += ':' + transformBuffers[ i ].id;

		}

		let transformFeedbackGPU = this.transformFeedbackCache[ key ];

		if ( transformFeedbackGPU !== undefined ) {

			return transformFeedbackGPU;

		}

		const gl = this.gl;

		transformFeedbackGPU = gl.createTransformFeedback();

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, transformFeedbackGPU );

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			const attributeData = transformBuffers[ i ];

			gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, i, attributeData.transformBuffer );

		}

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, null );

		this.transformFeedbackCache[ key ] = transformFeedbackGPU;

		return transformFeedbackGPU;

	}


	_setupBindings( bindings, programGPU ) {

		const gl = this.gl;

		for ( const binding of bindings ) {

			const bindingData = this.get( binding );
			const index = bindingData.index;

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const location = gl.getUniformBlockIndex( programGPU, binding.name );
				gl.uniformBlockBinding( programGPU, location, index );

			} else if ( binding.isSampledTexture ) {

				const location = gl.getUniformLocation( programGPU, binding.name );
				gl.uniform1i( location, index );

			}

		}

	}

	_bindUniforms( bindings ) {

		const { gl, state } = this;

		for ( const binding of bindings ) {

			const bindingData = this.get( binding );
			const index = bindingData.index;

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				gl.bindBufferBase( gl.UNIFORM_BUFFER, index, bindingData.bufferGPU );

			} else if ( binding.isSampledTexture ) {

				state.bindTexture( bindingData.glTextureType, bindingData.textureGPU, gl.TEXTURE0 + index );

			}

		}

	}

}

const GPUPrimitiveTopology = {
	PointList: 'point-list',
	LineList: 'line-list',
	LineStrip: 'line-strip',
	TriangleList: 'triangle-list',
	TriangleStrip: 'triangle-strip',
};

const GPUCompareFunction = {
	Never: 'never',
	Less: 'less',
	Equal: 'equal',
	LessEqual: 'less-equal',
	Greater: 'greater',
	NotEqual: 'not-equal',
	GreaterEqual: 'greater-equal',
	Always: 'always'
};

const GPUStoreOp = {
	Store: 'store',
	Discard: 'discard'
};

const GPULoadOp = {
	Load: 'load',
	Clear: 'clear'
};

const GPUFrontFace = {
	CCW: 'ccw',
	CW: 'cw'
};

const GPUCullMode = {
	None: 'none',
	Front: 'front',
	Back: 'back'
};

const GPUIndexFormat = {
	Uint16: 'uint16',
	Uint32: 'uint32'
};

const GPUTextureFormat = {

	// 8-bit formats

	R8Unorm: 'r8unorm',
	R8Snorm: 'r8snorm',
	R8Uint: 'r8uint',
	R8Sint: 'r8sint',

	// 16-bit formats

	R16Uint: 'r16uint',
	R16Sint: 'r16sint',
	R16Float: 'r16float',
	RG8Unorm: 'rg8unorm',
	RG8Snorm: 'rg8snorm',
	RG8Uint: 'rg8uint',
	RG8Sint: 'rg8sint',

	// 32-bit formats

	R32Uint: 'r32uint',
	R32Sint: 'r32sint',
	R32Float: 'r32float',
	RG16Uint: 'rg16uint',
	RG16Sint: 'rg16sint',
	RG16Float: 'rg16float',
	RGBA8Unorm: 'rgba8unorm',
	RGBA8UnormSRGB: 'rgba8unorm-srgb',
	RGBA8Snorm: 'rgba8snorm',
	RGBA8Uint: 'rgba8uint',
	RGBA8Sint: 'rgba8sint',
	BGRA8Unorm: 'bgra8unorm',
	BGRA8UnormSRGB: 'bgra8unorm-srgb',
	// Packed 32-bit formats
	RGB9E5UFloat: 'rgb9e5ufloat',
	RGB10A2Unorm: 'rgb10a2unorm',
	RG11B10uFloat: 'rgb10a2unorm',

	// 64-bit formats

	RG32Uint: 'rg32uint',
	RG32Sint: 'rg32sint',
	RG32Float: 'rg32float',
	RGBA16Uint: 'rgba16uint',
	RGBA16Sint: 'rgba16sint',
	RGBA16Float: 'rgba16float',

	// 128-bit formats

	RGBA32Uint: 'rgba32uint',
	RGBA32Sint: 'rgba32sint',
	RGBA32Float: 'rgba32float',

	// Depth and stencil formats

	Stencil8: 'stencil8',
	Depth16Unorm: 'depth16unorm',
	Depth24Plus: 'depth24plus',
	Depth24PlusStencil8: 'depth24plus-stencil8',
	Depth32Float: 'depth32float',

	// 'depth32float-stencil8' extension

	Depth32FloatStencil8: 'depth32float-stencil8',

	// BC compressed formats usable if 'texture-compression-bc' is both
	// supported by the device/user agent and enabled in requestDevice.

	BC1RGBAUnorm: 'bc1-rgba-unorm',
	BC1RGBAUnormSRGB: 'bc1-rgba-unorm-srgb',
	BC2RGBAUnorm: 'bc2-rgba-unorm',
	BC2RGBAUnormSRGB: 'bc2-rgba-unorm-srgb',
	BC3RGBAUnorm: 'bc3-rgba-unorm',
	BC3RGBAUnormSRGB: 'bc3-rgba-unorm-srgb',
	BC4RUnorm: 'bc4-r-unorm',
	BC4RSnorm: 'bc4-r-snorm',
	BC5RGUnorm: 'bc5-rg-unorm',
	BC5RGSnorm: 'bc5-rg-snorm',
	BC6HRGBUFloat: 'bc6h-rgb-ufloat',
	BC6HRGBFloat: 'bc6h-rgb-float',
	BC7RGBAUnorm: 'bc7-rgba-unorm',
	BC7RGBAUnormSRGB: 'bc7-rgba-srgb',

	// ETC2 compressed formats usable if 'texture-compression-etc2' is both
	// supported by the device/user agent and enabled in requestDevice.

	ETC2RGB8Unorm: 'etc2-rgb8unorm',
	ETC2RGB8UnormSRGB: 'etc2-rgb8unorm-srgb',
	ETC2RGB8A1Unorm: 'etc2-rgb8a1unorm',
	ETC2RGB8A1UnormSRGB: 'etc2-rgb8a1unorm-srgb',
	ETC2RGBA8Unorm: 'etc2-rgba8unorm',
	ETC2RGBA8UnormSRGB: 'etc2-rgba8unorm-srgb',
	EACR11Unorm: 'eac-r11unorm',
	EACR11Snorm: 'eac-r11snorm',
	EACRG11Unorm: 'eac-rg11unorm',
	EACRG11Snorm: 'eac-rg11snorm',

	// ASTC compressed formats usable if 'texture-compression-astc' is both
	// supported by the device/user agent and enabled in requestDevice.

	ASTC4x4Unorm: 'astc-4x4-unorm',
	ASTC4x4UnormSRGB: 'astc-4x4-unorm-srgb',
	ASTC5x4Unorm: 'astc-5x4-unorm',
	ASTC5x4UnormSRGB: 'astc-5x4-unorm-srgb',
	ASTC5x5Unorm: 'astc-5x5-unorm',
	ASTC5x5UnormSRGB: 'astc-5x5-unorm-srgb',
	ASTC6x5Unorm: 'astc-6x5-unorm',
	ASTC6x5UnormSRGB: 'astc-6x5-unorm-srgb',
	ASTC6x6Unorm: 'astc-6x6-unorm',
	ASTC6x6UnormSRGB: 'astc-6x6-unorm-srgb',
	ASTC8x5Unorm: 'astc-8x5-unorm',
	ASTC8x5UnormSRGB: 'astc-8x5-unorm-srgb',
	ASTC8x6Unorm: 'astc-8x6-unorm',
	ASTC8x6UnormSRGB: 'astc-8x6-unorm-srgb',
	ASTC8x8Unorm: 'astc-8x8-unorm',
	ASTC8x8UnormSRGB: 'astc-8x8-unorm-srgb',
	ASTC10x5Unorm: 'astc-10x5-unorm',
	ASTC10x5UnormSRGB: 'astc-10x5-unorm-srgb',
	ASTC10x6Unorm: 'astc-10x6-unorm',
	ASTC10x6UnormSRGB: 'astc-10x6-unorm-srgb',
	ASTC10x8Unorm: 'astc-10x8-unorm',
	ASTC10x8UnormSRGB: 'astc-10x8-unorm-srgb',
	ASTC10x10Unorm: 'astc-10x10-unorm',
	ASTC10x10UnormSRGB: 'astc-10x10-unorm-srgb',
	ASTC12x10Unorm: 'astc-12x10-unorm',
	ASTC12x10UnormSRGB: 'astc-12x10-unorm-srgb',
	ASTC12x12Unorm: 'astc-12x12-unorm',
	ASTC12x12UnormSRGB: 'astc-12x12-unorm-srgb',

};

const GPUAddressMode = {
	ClampToEdge: 'clamp-to-edge',
	Repeat: 'repeat',
	MirrorRepeat: 'mirror-repeat'
};

const GPUFilterMode = {
	Linear: 'linear',
	Nearest: 'nearest'
};

const GPUBlendFactor = {
	Zero: 'zero',
	One: 'one',
	Src: 'src',
	OneMinusSrc: 'one-minus-src',
	SrcAlpha: 'src-alpha',
	OneMinusSrcAlpha: 'one-minus-src-alpha',
	Dst: 'dst',
	OneMinusDstColor: 'one-minus-dst',
	DstAlpha: 'dst-alpha',
	OneMinusDstAlpha: 'one-minus-dst-alpha',
	SrcAlphaSaturated: 'src-alpha-saturated',
	Constant: 'constant',
	OneMinusConstant: 'one-minus-constant'
};

const GPUBlendOperation = {
	Add: 'add',
	Subtract: 'subtract',
	ReverseSubtract: 'reverse-subtract',
	Min: 'min',
	Max: 'max'
};

const GPUColorWriteFlags = {
	None: 0,
	Red: 0x1,
	Green: 0x2,
	Blue: 0x4,
	Alpha: 0x8,
	All: 0xF
};

const GPUStencilOperation = {
	Keep: 'keep',
	Zero: 'zero',
	Replace: 'replace',
	Invert: 'invert',
	IncrementClamp: 'increment-clamp',
	DecrementClamp: 'decrement-clamp',
	IncrementWrap: 'increment-wrap',
	DecrementWrap: 'decrement-wrap'
};

const GPUBufferBindingType = {
	Uniform: 'uniform',
	Storage: 'storage',
	ReadOnlyStorage: 'read-only-storage'
};

const GPUTextureSampleType = {
	Float: 'float',
	UnfilterableFloat: 'unfilterable-float',
	Depth: 'depth',
	SInt: 'sint',
	UInt: 'uint'
};

const GPUTextureDimension = {
	OneD: '1d',
	TwoD: '2d',
	ThreeD: '3d'
};

const GPUTextureViewDimension = {
	OneD: '1d',
	TwoD: '2d',
	TwoDArray: '2d-array',
	Cube: 'cube',
	CubeArray: 'cube-array',
	ThreeD: '3d'
};

const GPUTextureAspect = {
	All: 'all',
	StencilOnly: 'stencil-only',
	DepthOnly: 'depth-only'
};

const GPUInputStepMode = {
	Vertex: 'vertex',
	Instance: 'instance'
};

const GPUFeatureName = {
	DepthClipControl: 'depth-clip-control',
	Depth32FloatStencil8: 'depth32float-stencil8',
	TextureCompressionBC: 'texture-compression-bc',
	TextureCompressionETC2: 'texture-compression-etc2',
	TextureCompressionASTC: 'texture-compression-astc',
	TimestampQuery: 'timestamp-query',
	IndirectFirstInstance: 'indirect-first-instance',
	ShaderF16: 'shader-f16',
	RG11B10UFloat: 'rg11b10ufloat-renderable',
	BGRA8UNormStorage: 'bgra8unorm-storage',
	Float32Filterable: 'float32-filterable'
};

class Sampler extends Binding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;
		this.version = texture ? texture.version : 0;

		this.isSampler = true;

	}

}

class NodeSampler extends Sampler {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

}

class StorageBuffer extends Buffer {

	constructor( name, attribute ) {

		super( name, attribute ? attribute.array : null );

		this.attribute = attribute;

		this.isStorageBuffer = true;

	}

}

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

class WebGPUTexturePassUtils {

	constructor( device ) {

		this.device = device;

		const mipmapVertexSource = `
struct VarysStruct {
	@builtin( position ) Position: vec4<f32>,
	@location( 0 ) vTex : vec2<f32>
};

@vertex
fn main( @builtin( vertex_index ) vertexIndex : u32 ) -> VarysStruct {

	var Varys : VarysStruct;

	var pos = array< vec2<f32>, 4 >(
		vec2<f32>( -1.0,  1.0 ),
		vec2<f32>(  1.0,  1.0 ),
		vec2<f32>( -1.0, -1.0 ),
		vec2<f32>(  1.0, -1.0 )
	);

	var tex = array< vec2<f32>, 4 >(
		vec2<f32>( 0.0, 0.0 ),
		vec2<f32>( 1.0, 0.0 ),
		vec2<f32>( 0.0, 1.0 ),
		vec2<f32>( 1.0, 1.0 )
	);

	Varys.vTex = tex[ vertexIndex ];
	Varys.Position = vec4<f32>( pos[ vertexIndex ], 0.0, 1.0 );

	return Varys;

}
`;

		const mipmapFragmentSource = `
@group( 0 ) @binding( 0 )
var imgSampler : sampler;

@group( 0 ) @binding( 1 )
var img : texture_2d<f32>;

@fragment
fn main( @location( 0 ) vTex : vec2<f32> ) -> @location( 0 ) vec4<f32> {

	return textureSample( img, imgSampler, vTex );

}
`;

		const flipYFragmentSource = `
@group( 0 ) @binding( 0 )
var imgSampler : sampler;

@group( 0 ) @binding( 1 )
var img : texture_2d<f32>;

@fragment
fn main( @location( 0 ) vTex : vec2<f32> ) -> @location( 0 ) vec4<f32> {

	return textureSample( img, imgSampler, vec2( vTex.x, 1.0 - vTex.y ) );

}
`;
		this.mipmapSampler = device.createSampler( { minFilter: GPUFilterMode.Linear } );
		this.flipYSampler = device.createSampler( { minFilter: GPUFilterMode.Nearest } ); //@TODO?: Consider using textureLoad()

		// We'll need a new pipeline for every texture format used.
		this.transferPipelines = {};
		this.flipYPipelines = {};

		this.mipmapVertexShaderModule = device.createShaderModule( {
			label: 'mipmapVertex',
			code: mipmapVertexSource
		} );

		this.mipmapFragmentShaderModule = device.createShaderModule( {
			label: 'mipmapFragment',
			code: mipmapFragmentSource
		} );

		this.flipYFragmentShaderModule = device.createShaderModule( {
			label: 'flipYFragment',
			code: flipYFragmentSource
		} );

	}

	getTransferPipeline( format ) {

		let pipeline = this.transferPipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
				vertex: {
					module: this.mipmapVertexShaderModule,
					entryPoint: 'main'
				},
				fragment: {
					module: this.mipmapFragmentShaderModule,
					entryPoint: 'main',
					targets: [ { format } ]
				},
				primitive: {
					topology: GPUPrimitiveTopology.TriangleStrip,
					stripIndexFormat: GPUIndexFormat.Uint32
				},
				layout: 'auto'
			} );

			this.transferPipelines[ format ] = pipeline;

		}

		return pipeline;

	}

	getFlipYPipeline( format ) {

		let pipeline = this.flipYPipelines[ format ];

		if ( pipeline === undefined ) {

			pipeline = this.device.createRenderPipeline( {
				vertex: {
					module: this.mipmapVertexShaderModule,
					entryPoint: 'main'
				},
				fragment: {
					module: this.flipYFragmentShaderModule,
					entryPoint: 'main',
					targets: [ { format } ]
				},
				primitive: {
					topology: GPUPrimitiveTopology.TriangleStrip,
					stripIndexFormat: GPUIndexFormat.Uint32
				},
				layout: 'auto'
			} );

			this.flipYPipelines[ format ] = pipeline;

		}

		return pipeline;

	}

	flipY( textureGPU, textureGPUDescriptor, baseArrayLayer = 0 ) {

		const format = textureGPUDescriptor.format;
		const { width, height } = textureGPUDescriptor.size;

		const transferPipeline = this.getTransferPipeline( format );
		const flipYPipeline = this.getFlipYPipeline( format );

		const tempTexture = this.device.createTexture( {
			size: { width, height, depthOrArrayLayers: 1 },
			format,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
		} );

		const srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

		const dstView = tempTexture.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer: 0
		} );

		const commandEncoder = this.device.createCommandEncoder( {} );

		const pass = ( pipeline, sourceView, destinationView ) => {

			const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.flipYSampler
				}, {
					binding: 1,
					resource: sourceView
				} ]
			} );

			const passEncoder = commandEncoder.beginRenderPass( {
				colorAttachments: [ {
					view: destinationView,
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
					clearValue: [ 0, 0, 0, 0 ]
				} ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );
			passEncoder.end();

		};

		pass( transferPipeline, srcView, dstView );
		pass( flipYPipeline, dstView, srcView );

		this.device.queue.submit( [ commandEncoder.finish() ] );

		tempTexture.destroy();

	}

	generateMipmaps( textureGPU, textureGPUDescriptor, baseArrayLayer = 0 ) {

		const pipeline = this.getTransferPipeline( textureGPUDescriptor.format );

		const commandEncoder = this.device.createCommandEncoder( {} );
		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		let srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

		for ( let i = 1; i < textureGPUDescriptor.mipLevelCount; i ++ ) {

			const bindGroup = this.device.createBindGroup( {
				layout: bindGroupLayout,
				entries: [ {
					binding: 0,
					resource: this.mipmapSampler
				}, {
					binding: 1,
					resource: srcView
				} ]
			} );

			const dstView = textureGPU.createView( {
				baseMipLevel: i,
				mipLevelCount: 1,
				dimension: GPUTextureViewDimension.TwoD,
				baseArrayLayer
			} );

			const passEncoder = commandEncoder.beginRenderPass( {
				colorAttachments: [ {
					view: dstView,
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
					clearValue: [ 0, 0, 0, 0 ]
				} ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );
			passEncoder.end();

			srcView = dstView;

		}

		this.device.queue.submit( [ commandEncoder.finish() ] );

	}

}

const _compareToWebGPU = {
	[ NeverCompare ]: 'never',
	[ LessCompare ]: 'less',
	[ EqualCompare ]: 'equal',
	[ LessEqualCompare ]: 'less-equal',
	[ GreaterCompare ]: 'greater',
	[ GreaterEqualCompare ]: 'greater-equal',
	[ AlwaysCompare ]: 'always',
	[ NotEqualCompare ]: 'not-equal'
};

const _flipMap = [ 0, 1, 3, 2, 4, 5 ];

class WebGPUTextureUtils {

	constructor( backend ) {

		this.backend = backend;

		this._passUtils = null;

		this.defaultTexture = null;
		this.defaultCubeTexture = null;

		this.colorBuffer = null;

		this.depthTexture = new DepthTexture();
		this.depthTexture.name = 'depthBuffer';

	}

	createSampler( texture ) {

		const backend = this.backend;
		const device = backend.device;

		const textureGPU = backend.get( texture );

		const samplerDescriptorGPU = {
			addressModeU: this._convertAddressMode( texture.wrapS ),
			addressModeV: this._convertAddressMode( texture.wrapT ),
			addressModeW: this._convertAddressMode( texture.wrapR ),
			magFilter: this._convertFilterMode( texture.magFilter ),
			minFilter: this._convertFilterMode( texture.minFilter ),
			mipmapFilter: this._convertFilterMode( texture.minFilter ),
			maxAnisotropy: texture.anisotropy
		};

		if ( texture.isDepthTexture && texture.compareFunction !== null ) {

			samplerDescriptorGPU.compare = _compareToWebGPU[ texture.compareFunction ];

		}

		textureGPU.sampler = device.createSampler( samplerDescriptorGPU );

	}

	createDefaultTexture( texture ) {

		let textureGPU;

		if ( texture.isCubeTexture ) {

			textureGPU = this._getDefaultCubeTextureGPU();

		} else {

			textureGPU = this._getDefaultTextureGPU();

		}

		this.backend.get( texture ).texture = textureGPU;

	}

	createTexture( texture, options = {} ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		if ( textureData.initialized ) {

			throw new Error( 'WebGPUTextureUtils: Texture already initialized.' );

		}

		if ( options.needsMipmaps === undefined ) options.needsMipmaps = false;
		if ( options.levels === undefined ) options.levels = 1;
		if ( options.depth === undefined ) options.depth = 1;

		const { width, height, depth, levels } = options;

		const dimension = this._getDimension( texture );
		const format = texture.internalFormat || getFormat( texture, backend.device );

		let sampleCount = options.sampleCount !== undefined ? options.sampleCount : 1;

		if ( sampleCount > 1 ) {

			// WebGPU only supports power-of-two sample counts and 2 is not a valid value
			sampleCount = Math.pow( 2, Math.floor( Math.log2( sampleCount ) ) );

			if ( sampleCount === 2 ) {

				sampleCount = 4;

			}

		}

		const primarySampleCount = texture.isRenderTargetTexture ? 1 : sampleCount;

		let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

		if ( texture.isStorageTexture === true ) {

			usage |= GPUTextureUsage.STORAGE_BINDING;

		}

		if ( texture.isCompressedTexture !== true ) {

			usage |= GPUTextureUsage.RENDER_ATTACHMENT;

		}

		const textureDescriptorGPU = {
			label: texture.name,
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: depth,
			},
			mipLevelCount: levels,
			sampleCount: primarySampleCount,
			dimension: dimension,
			format: format,
			usage: usage
		};

		// texture creation

		if ( texture.isVideoTexture ) {

			const video = texture.source.data;
			const videoFrame = new VideoFrame( video );

			textureDescriptorGPU.size.width = videoFrame.displayWidth;
			textureDescriptorGPU.size.height = videoFrame.displayHeight;

			videoFrame.close();

			textureData.externalTexture = video;

		} else {

			if ( format === undefined ) {

				console.warn( 'WebGPURenderer: Texture format not supported.' );

				return this.createDefaultTexture( texture );

			}

			textureData.texture = backend.device.createTexture( textureDescriptorGPU );

		}

		if ( texture.isRenderTargetTexture && sampleCount > 1 ) {

			const msaaTextureDescriptorGPU = Object.assign( {}, textureDescriptorGPU );

			msaaTextureDescriptorGPU.label = msaaTextureDescriptorGPU.label + '-msaa';
			msaaTextureDescriptorGPU.sampleCount = sampleCount;

			textureData.msaaTexture = backend.device.createTexture( msaaTextureDescriptorGPU );

		}

		textureData.initialized = true;

		textureData.textureDescriptorGPU = textureDescriptorGPU;

	}

	destroyTexture( texture ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		textureData.texture.destroy();

		if ( textureData.msaaTexture !== undefined ) textureData.msaaTexture.destroy();

		backend.delete( texture );

	}

	destroySampler( texture ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		delete textureData.sampler;

	}

	generateMipmaps( texture ) {

		const textureData = this.backend.get( texture );

		if ( texture.isCubeTexture ) {

			for ( let i = 0; i < 6; i ++ ) {

				this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU, i );

			}

		} else {

			this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU );

		}

	}

	getColorBuffer() {

		if ( this.colorBuffer ) this.colorBuffer.destroy();

		const backend = this.backend;
		const { width, height } = backend.getDrawingBufferSize();

		this.colorBuffer = backend.device.createTexture( {
			label: 'colorBuffer',
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: 1
			},
			sampleCount: backend.parameters.sampleCount,
			format: GPUTextureFormat.BGRA8Unorm,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
		} );

		return this.colorBuffer;

	}

	getDepthBuffer( depth = true, stencil = true ) {

		const backend = this.backend;
		const { width, height } = backend.getDrawingBufferSize();

		const depthTexture = this.depthTexture;
		const depthTextureGPU = backend.get( depthTexture ).texture;

		let format, type;

		if ( stencil ) {

			format = DepthStencilFormat;
			type = UnsignedInt248Type;

		} else if ( depth ) {

			format = DepthFormat;
			type = UnsignedIntType;

		}

		if ( depthTextureGPU !== undefined ) {

			if ( depthTexture.image.width === width && depthTexture.image.height === height && depthTexture.format === format && depthTexture.type === type ) {

				return depthTextureGPU;

			}

			this.destroyTexture( depthTexture );

		}

		depthTexture.name = 'depthBuffer';
		depthTexture.format = format;
		depthTexture.type = type;
		depthTexture.image.width = width;
		depthTexture.image.height = height;

		this.createTexture( depthTexture, { sampleCount: backend.parameters.sampleCount, width, height } );

		return backend.get( depthTexture ).texture;

	}

	updateTexture( texture, options ) {

		const textureData = this.backend.get( texture );

		const { textureDescriptorGPU } = textureData;

		if ( texture.isRenderTargetTexture || ( textureDescriptorGPU === undefined /* unsupported texture format */ ) )
			return;

		// transfer texture data

		if ( texture.isDataTexture || texture.isData3DTexture ) {

			this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY );

		} else if ( texture.isDataArrayTexture ) {

			for ( let i = 0; i < options.image.depth; i ++ ) {

				this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, i, texture.flipY, i );

			}

		} else if ( texture.isCompressedTexture ) {

			this._copyCompressedBufferToTexture( texture.mipmaps, textureData.texture, textureDescriptorGPU );

		} else if ( texture.isCubeTexture ) {

			this._copyCubeMapToTexture( options.images, textureData.texture, textureDescriptorGPU, texture.flipY );

		} else if ( texture.isVideoTexture ) {

			const video = texture.source.data;

			textureData.externalTexture = video;

		} else {

			this._copyImageToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY );

		}

		//

		textureData.version = texture.version;

		if ( texture.onUpdate ) texture.onUpdate( texture );

	}

	async copyTextureToBuffer( texture, x, y, width, height ) {

		const device = this.backend.device;

		const textureData = this.backend.get( texture );
		const textureGPU = textureData.texture;
		const format = textureData.textureDescriptorGPU.format;
		const bytesPerTexel = this._getBytesPerTexel( format );

		let bytesPerRow = width * bytesPerTexel;
		bytesPerRow = Math.ceil( bytesPerRow / 256 ) * 256; // Align to 256 bytes

		const readBuffer = device.createBuffer(
			{
				size: width * height * bytesPerTexel,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			}
		);

		const encoder = device.createCommandEncoder();

		encoder.copyTextureToBuffer(
			{
				texture: textureGPU,
				origin: { x, y },
			},
			{
				buffer: readBuffer,
				bytesPerRow: bytesPerRow
			},
			{
				width: width,
				height: height
			}

		);

		const typedArrayType = this._getTypedArrayType( format );

		device.queue.submit( [ encoder.finish() ] );

		await readBuffer.mapAsync( GPUMapMode.READ );

		const buffer = readBuffer.getMappedRange();

		return new typedArrayType( buffer );

	}

	_isEnvironmentTexture( texture ) {

		const mapping = texture.mapping;

		return ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) || ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

	}

	_getDefaultTextureGPU() {

		let defaultTexture = this.defaultTexture;

		if ( defaultTexture === null ) {

			const texture = new Texture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1 } );

			this.defaultTexture = defaultTexture = texture;

		}

		return this.backend.get( defaultTexture ).texture;

	}

	_getDefaultCubeTextureGPU() {

		let defaultCubeTexture = this.defaultTexture;

		if ( defaultCubeTexture === null ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1, depth: 6 } );

			this.defaultCubeTexture = defaultCubeTexture = texture;

		}

		return this.backend.get( defaultCubeTexture ).texture;

	}

	_copyCubeMapToTexture( images, textureGPU, textureDescriptorGPU, flipY ) {

		for ( let i = 0; i < 6; i ++ ) {

			const image = images[ i ];

			const flipIndex = flipY === true ? _flipMap[ i ] : i;

			if ( image.isDataTexture ) {

				this._copyBufferToTexture( image.image, textureGPU, textureDescriptorGPU, flipIndex, flipY );

			} else {

				this._copyImageToTexture( image, textureGPU, textureDescriptorGPU, flipIndex, flipY );

			}

		}

	}

	_copyImageToTexture( image, textureGPU, textureDescriptorGPU, originDepth, flipY ) {

		const device = this.backend.device;

		device.queue.copyExternalImageToTexture(
			{
				source: image
			}, {
				texture: textureGPU,
				mipLevel: 0,
				origin: { x: 0, y: 0, z: originDepth }
			}, {
				width: image.width,
				height: image.height,
				depthOrArrayLayers: 1
			}
		);

		if ( flipY === true ) {

			this._flipY( textureGPU, textureDescriptorGPU, originDepth );

		}

	}

	_getPassUtils() {

		let passUtils = this._passUtils;

		if ( passUtils === null ) {

			this._passUtils = passUtils = new WebGPUTexturePassUtils( this.backend.device );

		}

		return passUtils;

	}

	_generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer = 0 ) {

		this._getPassUtils().generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer );

	}

	_flipY( textureGPU, textureDescriptorGPU, originDepth = 0 ) {

		this._getPassUtils().flipY( textureGPU, textureDescriptorGPU, originDepth );

	}

	_copyBufferToTexture( image, textureGPU, textureDescriptorGPU, originDepth, flipY, depth = 0 ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()
		// @TODO: Consider to support valid buffer layouts with other formats like RGB

		const device = this.backend.device;

		const data = image.data;

		const bytesPerTexel = this._getBytesPerTexel( textureDescriptorGPU.format );
		const bytesPerRow = image.width * bytesPerTexel;

		device.queue.writeTexture(
			{
				texture: textureGPU,
				mipLevel: 0,
				origin: { x: 0, y: 0, z: originDepth }
			},
			data,
			{
				offset: image.width * image.height * bytesPerTexel * depth,
				bytesPerRow
			},
			{
				width: image.width,
				height: image.height,
				depthOrArrayLayers: 1
			} );

		if ( flipY === true ) {

			this._flipY( textureGPU, textureDescriptorGPU, originDepth );

		}

	}

	_copyCompressedBufferToTexture( mipmaps, textureGPU, textureDescriptorGPU ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()

		const device = this.backend.device;

		const blockData = this._getBlockData( textureDescriptorGPU.format );

		for ( let i = 0; i < mipmaps.length; i ++ ) {

			const mipmap = mipmaps[ i ];

			const width = mipmap.width;
			const height = mipmap.height;

			const bytesPerRow = Math.ceil( width / blockData.width ) * blockData.byteLength;

			device.queue.writeTexture(
				{
					texture: textureGPU,
					mipLevel: i
				},
				mipmap.data,
				{
					offset: 0,
					bytesPerRow
				},
				{
					width: Math.ceil( width / blockData.width ) * blockData.width,
					height: Math.ceil( height / blockData.width ) * blockData.width,
					depthOrArrayLayers: 1
				}
			);

		}

	}

	_getBlockData( format ) {

		// this method is only relevant for compressed texture formats

		if ( format === GPUTextureFormat.BC1RGBAUnorm || format === GPUTextureFormat.BC1RGBAUnormSRGB ) return { byteLength: 8, width: 4, height: 4 }; // DXT1
		if ( format === GPUTextureFormat.BC2RGBAUnorm || format === GPUTextureFormat.BC2RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // DXT3
		if ( format === GPUTextureFormat.BC3RGBAUnorm || format === GPUTextureFormat.BC3RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // DXT5
		if ( format === GPUTextureFormat.BC4RUnorm || format === GPUTextureFormat.BC4RSNorm ) return { byteLength: 8, width: 4, height: 4 }; // RGTC1
		if ( format === GPUTextureFormat.BC5RGUnorm || format === GPUTextureFormat.BC5RGSnorm ) return { byteLength: 16, width: 4, height: 4 }; // RGTC2
		if ( format === GPUTextureFormat.BC6HRGBUFloat || format === GPUTextureFormat.BC6HRGBFloat ) return { byteLength: 16, width: 4, height: 4 }; // BPTC (float)
		if ( format === GPUTextureFormat.BC7RGBAUnorm || format === GPUTextureFormat.BC7RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // BPTC (unorm)

		if ( format === GPUTextureFormat.ETC2RGB8Unorm || format === GPUTextureFormat.ETC2RGB8UnormSRGB ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.ETC2RGB8A1Unorm || format === GPUTextureFormat.ETC2RGB8A1UnormSRGB ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.ETC2RGBA8Unorm || format === GPUTextureFormat.ETC2RGBA8UnormSRGB ) return { byteLength: 16, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACR11Unorm ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACR11Snorm ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACRG11Unorm ) return { byteLength: 16, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACRG11Snorm ) return { byteLength: 16, width: 4, height: 4 };

		if ( format === GPUTextureFormat.ASTC4x4Unorm || format === GPUTextureFormat.ASTC4x4UnormSRGB ) return { byteLength: 16, width: 4, height: 4 };
		if ( format === GPUTextureFormat.ASTC5x4Unorm || format === GPUTextureFormat.ASTC5x4UnormSRGB ) return { byteLength: 16, width: 5, height: 4 };
		if ( format === GPUTextureFormat.ASTC5x5Unorm || format === GPUTextureFormat.ASTC5x5UnormSRGB ) return { byteLength: 16, width: 5, height: 5 };
		if ( format === GPUTextureFormat.ASTC6x5Unorm || format === GPUTextureFormat.ASTC6x5UnormSRGB ) return { byteLength: 16, width: 6, height: 5 };
		if ( format === GPUTextureFormat.ASTC6x6Unorm || format === GPUTextureFormat.ASTC6x6UnormSRGB ) return { byteLength: 16, width: 6, height: 6 };
		if ( format === GPUTextureFormat.ASTC8x5Unorm || format === GPUTextureFormat.ASTC8x5UnormSRGB ) return { byteLength: 16, width: 8, height: 5 };
		if ( format === GPUTextureFormat.ASTC8x6Unorm || format === GPUTextureFormat.ASTC8x6UnormSRGB ) return { byteLength: 16, width: 8, height: 6 };
		if ( format === GPUTextureFormat.ASTC8x8Unorm || format === GPUTextureFormat.ASTC8x8UnormSRGB ) return { byteLength: 16, width: 8, height: 8 };
		if ( format === GPUTextureFormat.ASTC10x5Unorm || format === GPUTextureFormat.ASTC10x5UnormSRGB ) return { byteLength: 16, width: 10, height: 5 };
		if ( format === GPUTextureFormat.ASTC10x6Unorm || format === GPUTextureFormat.ASTC10x6UnormSRGB ) return { byteLength: 16, width: 10, height: 6 };
		if ( format === GPUTextureFormat.ASTC10x8Unorm || format === GPUTextureFormat.ASTC10x8UnormSRGB ) return { byteLength: 16, width: 10, height: 8 };
		if ( format === GPUTextureFormat.ASTC10x10Unorm || format === GPUTextureFormat.ASTC10x10UnormSRGB ) return { byteLength: 16, width: 10, height: 10 };
		if ( format === GPUTextureFormat.ASTC12x10Unorm || format === GPUTextureFormat.ASTC12x10UnormSRGB ) return { byteLength: 16, width: 12, height: 10 };
		if ( format === GPUTextureFormat.ASTC12x12Unorm || format === GPUTextureFormat.ASTC12x12UnormSRGB ) return { byteLength: 16, width: 12, height: 12 };

	}

	_convertAddressMode( value ) {

		let addressMode = GPUAddressMode.ClampToEdge;

		if ( value === RepeatWrapping ) {

			addressMode = GPUAddressMode.Repeat;

		} else if ( value === MirroredRepeatWrapping ) {

			addressMode = GPUAddressMode.MirrorRepeat;

		}

		return addressMode;

	}

	_convertFilterMode( value ) {

		let filterMode = GPUFilterMode.Linear;

		if ( value === NearestFilter || value === NearestMipmapNearestFilter || value === NearestMipmapLinearFilter ) {

			filterMode = GPUFilterMode.Nearest;

		}

		return filterMode;

	}

	_getBytesPerTexel( format ) {

		// 8-bit formats
		if ( format === GPUTextureFormat.R8Unorm ||
			format === GPUTextureFormat.R8Snorm ||
			format === GPUTextureFormat.R8Uint ||
			format === GPUTextureFormat.R8Sint ) return 1;

		// 16-bit formats
		if ( format === GPUTextureFormat.R16Uint ||
			format === GPUTextureFormat.R16Sint ||
			format === GPUTextureFormat.R16Float ||
			format === GPUTextureFormat.RG8Unorm ||
			format === GPUTextureFormat.RG8Snorm ||
			format === GPUTextureFormat.RG8Uint ||
			format === GPUTextureFormat.RG8Sint ) return 2;

		// 32-bit formats
		if ( format === GPUTextureFormat.R32Uint ||
			format === GPUTextureFormat.R32Sint ||
			format === GPUTextureFormat.R32Float ||
			format === GPUTextureFormat.RG16Uint ||
			format === GPUTextureFormat.RG16Sint ||
			format === GPUTextureFormat.RG16Float ||
			format === GPUTextureFormat.RGBA8Unorm ||
			format === GPUTextureFormat.RGBA8UnormSRGB ||
			format === GPUTextureFormat.RGBA8Snorm ||
			format === GPUTextureFormat.RGBA8Uint ||
			format === GPUTextureFormat.RGBA8Sint ||
			format === GPUTextureFormat.BGRA8Unorm ||
			format === GPUTextureFormat.BGRA8UnormSRGB ||
			// Packed 32-bit formats
			format === GPUTextureFormat.RGB9E5UFloat ||
			format === GPUTextureFormat.RGB10A2Unorm ||
			format === GPUTextureFormat.RG11B10UFloat ||
			format === GPUTextureFormat.Depth32Float ||
			format === GPUTextureFormat.Depth24Plus ||
			format === GPUTextureFormat.Depth24PlusStencil8 ||
			format === GPUTextureFormat.Depth32FloatStencil8 ) return 4;

		// 64-bit formats
		if ( format === GPUTextureFormat.RG32Uint ||
			format === GPUTextureFormat.RG32Sint ||
			format === GPUTextureFormat.RG32Float ||
			format === GPUTextureFormat.RGBA16Uint ||
			format === GPUTextureFormat.RGBA16Sint ||
			format === GPUTextureFormat.RGBA16Float ) return 8;

		// 128-bit formats
		if ( format === GPUTextureFormat.RGBA32Uint ||
			format === GPUTextureFormat.RGBA32Sint ||
			format === GPUTextureFormat.RGBA32Float ) return 16;


	}

	_getTypedArrayType( format ) {

		if ( format === GPUTextureFormat.R8Uint ) return Uint8Array;
		if ( format === GPUTextureFormat.R8Sint ) return Int8Array;
		if ( format === GPUTextureFormat.R8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.R8Snorm ) return Int8Array;
		if ( format === GPUTextureFormat.RG8Uint ) return Uint8Array;
		if ( format === GPUTextureFormat.RG8Sint ) return Int8Array;
		if ( format === GPUTextureFormat.RG8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.RG8Snorm ) return Int8Array;
		if ( format === GPUTextureFormat.RGBA8Uint ) return Uint8Array;
		if ( format === GPUTextureFormat.RGBA8Sint ) return Int8Array;
		if ( format === GPUTextureFormat.RGBA8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.RGBA8Snorm ) return Int8Array;


		if ( format === GPUTextureFormat.R16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.R16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.RG16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.RG16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.RGBA16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.RGBA16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.R16Float ) return Float32Array;
		if ( format === GPUTextureFormat.RG16Float ) return Float32Array;
		if ( format === GPUTextureFormat.RGBA16Float ) return Float32Array;


		if ( format === GPUTextureFormat.R32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.R32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.R32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RG32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RG32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RG32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RGBA32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RGBA32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RGBA32Float ) return Float32Array;

		if ( format === GPUTextureFormat.BGRA8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.BGRA8UnormSRGB ) return Uint8Array;
		if ( format === GPUTextureFormat.RGB10A2Unorm ) return Uint32Array;
		if ( format === GPUTextureFormat.RGB9E5UFloat ) return Uint32Array;
		if ( format === GPUTextureFormat.RG11B10UFloat ) return Uint32Array;

		if ( format === GPUTextureFormat.Depth32Float ) return Float32Array;
		if ( format === GPUTextureFormat.Depth24Plus ) return Uint32Array;
		if ( format === GPUTextureFormat.Depth24PlusStencil8 ) return Uint32Array;
		if ( format === GPUTextureFormat.Depth32FloatStencil8 ) return Float32Array;

	}

	_getDimension( texture ) {

		let dimension;

		if ( texture.isData3DTexture ) {

			dimension = GPUTextureDimension.ThreeD;

		} else {

			dimension = GPUTextureDimension.TwoD;

		}

		return dimension;

	}

}

function getFormat( texture, device = null ) {

	const format = texture.format;
	const type = texture.type;
	const colorSpace = texture.colorSpace;

	let formatGPU;

	if ( texture.isFramebufferTexture === true && texture.type === UnsignedByteType ) {

		formatGPU = GPUTextureFormat.BGRA8Unorm;

	} else if ( texture.isCompressedTexture === true ) {

		switch ( format ) {

			case RGBA_S3TC_DXT1_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.BC1RGBAUnormSRGB : GPUTextureFormat.BC1RGBAUnorm;
				break;

			case RGBA_S3TC_DXT3_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.BC2RGBAUnormSRGB : GPUTextureFormat.BC2RGBAUnorm;
				break;

			case RGBA_S3TC_DXT5_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.BC3RGBAUnormSRGB : GPUTextureFormat.BC3RGBAUnorm;
				break;

			case RGB_ETC2_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ETC2RGB8UnormSRGB : GPUTextureFormat.ETC2RGB8Unorm;
				break;

			case RGBA_ETC2_EAC_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ETC2RGBA8UnormSRGB : GPUTextureFormat.ETC2RGBA8Unorm;
				break;

			case RGBA_ASTC_4x4_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC4x4UnormSRGB : GPUTextureFormat.ASTC4x4Unorm;
				break;

			case RGBA_ASTC_5x4_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC5x4UnormSRGB : GPUTextureFormat.ASTC5x4Unorm;
				break;

			case RGBA_ASTC_5x5_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC5x5UnormSRGB : GPUTextureFormat.ASTC5x5Unorm;
				break;

			case RGBA_ASTC_6x5_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC6x5UnormSRGB : GPUTextureFormat.ASTC6x5Unorm;
				break;

			case RGBA_ASTC_6x6_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC6x6UnormSRGB : GPUTextureFormat.ASTC6x6Unorm;
				break;

			case RGBA_ASTC_8x5_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC8x5UnormSRGB : GPUTextureFormat.ASTC8x5Unorm;
				break;

			case RGBA_ASTC_8x6_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC8x6UnormSRGB : GPUTextureFormat.ASTC8x6Unorm;
				break;

			case RGBA_ASTC_8x8_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC8x8UnormSRGB : GPUTextureFormat.ASTC8x8Unorm;
				break;

			case RGBA_ASTC_10x5_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x5UnormSRGB : GPUTextureFormat.ASTC10x5Unorm;
				break;

			case RGBA_ASTC_10x6_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x6UnormSRGB : GPUTextureFormat.ASTC10x6Unorm;
				break;

			case RGBA_ASTC_10x8_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x8UnormSRGB : GPUTextureFormat.ASTC10x8Unorm;
				break;

			case RGBA_ASTC_10x10_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x10UnormSRGB : GPUTextureFormat.ASTC10x10Unorm;
				break;

			case RGBA_ASTC_12x10_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC12x10UnormSRGB : GPUTextureFormat.ASTC12x10Unorm;
				break;

			case RGBA_ASTC_12x12_Format:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC12x12UnormSRGB : GPUTextureFormat.ASTC12x12Unorm;
				break;

			default:
				console.error( 'WebGPURenderer: Unsupported texture format.', format );

		}

	} else {

		switch ( format ) {

			case RGBAFormat:

				switch ( type ) {

					case UnsignedByteType:
						formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
						break;

					case HalfFloatType:
						formatGPU = GPUTextureFormat.RGBA16Float;
						break;

					case FloatType:
						formatGPU = GPUTextureFormat.RGBA32Float;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGBAFormat.', type );

				}

				break;

			case RedFormat:

				switch ( type ) {

					case UnsignedByteType:
						formatGPU = GPUTextureFormat.R8Unorm;
						break;

					case HalfFloatType:
						formatGPU = GPUTextureFormat.R16Float;
						break;

					case FloatType:
						formatGPU = GPUTextureFormat.R32Float;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RedFormat.', type );

				}

				break;

			case RGFormat:

				switch ( type ) {

					case UnsignedByteType:
						formatGPU = GPUTextureFormat.RG8Unorm;
						break;

					case HalfFloatType:
						formatGPU = GPUTextureFormat.RG16Float;
						break;

					case FloatType:
						formatGPU = GPUTextureFormat.RG32Float;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGFormat.', type );

				}

				break;

			case DepthFormat:

				switch ( type ) {

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.Depth16Unorm;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.Depth24Plus;
						break;

					case FloatType:
						formatGPU = GPUTextureFormat.Depth32Float;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with DepthFormat.', type );

				}

				break;

			case DepthStencilFormat:

				switch ( type ) {

					case UnsignedInt248Type:
						formatGPU = GPUTextureFormat.Depth24PlusStencil8;
						break;

					case FloatType:

						if ( device && device.features.has( GPUFeatureName.Depth32FloatStencil8 ) === false ) {

							console.error( 'WebGPURenderer: Depth textures with DepthStencilFormat + FloatType can only be used with the "depth32float-stencil8" GPU feature.' );

						}

						formatGPU = GPUTextureFormat.Depth32FloatStencil8;

						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with DepthStencilFormat.', type );

				}

				break;

			default:
				console.error( 'WebGPURenderer: Unsupported texture format.', format );

		}

	}

	return formatGPU;

}

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+)?/i;
const propertiesRegexp = /[a-z_0-9]+|<(.*?)>+/ig;

const wgslTypeLib$1 = {
	f32: 'float'
};

const parse = ( source ) => {

	source = source.trim();

	const declaration = source.match( declarationRegexp );

	if ( declaration !== null && declaration.length === 4 ) {

		// tokenizer

		const inputsCode = declaration[ 2 ];
		const propsMatches = [];

		let nameMatch = null;

		while ( ( nameMatch = propertiesRegexp.exec( inputsCode ) ) !== null ) {

			propsMatches.push( nameMatch );

		}

		// parser

		const inputs = [];

		let i = 0;

		while ( i < propsMatches.length ) {

			// default

			const name = propsMatches[ i ++ ][ 0 ];
			let type = propsMatches[ i ++ ][ 0 ];

			type = wgslTypeLib$1[ type ] || type;

			// precision

			if ( i < propsMatches.length && propsMatches[ i ][ 0 ].startsWith( '<' ) === true )
				i ++;

			// add input

			inputs.push( new NodeFunctionInput( type, name ) );

		}

		//

		const blockCode = source.substring( declaration[ 0 ].length );

		const name = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';
		const type = declaration[ 3 ] || 'void';

		return {
			type,
			inputs,
			name,
			inputsCode,
			blockCode
		};

	} else {

		throw new Error( 'FunctionNode: Function is not a WGSL code.' );

	}

};

class WGSLNodeFunction extends NodeFunction {

	constructor( source ) {

		const { type, inputs, name, inputsCode, blockCode } = parse( source );

		super( type, inputs, name );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;

	}

	getCode( name = this.name ) {

		const type = this.type !== 'void' ? '-> ' + this.type : '';

		return `fn ${ name } ( ${ this.inputsCode.trim() } ) ${ type }` + this.blockCode;

	}

}

class WGSLNodeParser extends NodeParser {

	parseFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

// GPUShaderStage is not defined in browsers not supporting WebGPU
const GPUShaderStage = self.GPUShaderStage;

const gpuShaderStageLib = {
	'vertex': GPUShaderStage ? GPUShaderStage.VERTEX : 1,
	'fragment': GPUShaderStage ? GPUShaderStage.FRAGMENT : 2,
	'compute': GPUShaderStage ? GPUShaderStage.COMPUTE : 4
};

const supports = {
	instance: true,
	storageBuffer: true
};

const wgslFnOpLib = {
	'^^': 'threejs_xor'
};

const wgslTypeLib = {
	float: 'f32',
	int: 'i32',
	uint: 'u32',
	bool: 'bool',
	color: 'vec3<f32>',

	vec2: 'vec2<f32>',
	ivec2: 'vec2<i32>',
	uvec2: 'vec2<u32>',
	bvec2: 'vec2<bool>',

	vec3: 'vec3<f32>',
	ivec3: 'vec3<i32>',
	uvec3: 'vec3<u32>',
	bvec3: 'vec3<bool>',

	vec4: 'vec4<f32>',
	ivec4: 'vec4<i32>',
	uvec4: 'vec4<u32>',
	bvec4: 'vec4<bool>',

	mat2: 'mat2x2<f32>',
	imat2: 'mat2x2<i32>',
	umat2: 'mat2x2<u32>',
	bmat2: 'mat2x2<bool>',

	mat3: 'mat3x3<f32>',
	imat3: 'mat3x3<i32>',
	umat3: 'mat3x3<u32>',
	bmat3: 'mat3x3<bool>',

	mat4: 'mat4x4<f32>',
	imat4: 'mat4x4<i32>',
	umat4: 'mat4x4<u32>',
	bmat4: 'mat4x4<bool>'
};

const wgslMethods = {
	dFdx: 'dpdx',
	dFdy: '- dpdy',
	mod_float: 'threejs_mod_float',
	mod_vec2: 'threejs_mod_vec2',
	mod_vec3: 'threejs_mod_vec3',
	mod_vec4: 'threejs_mod_vec4',
	equals_bool: 'threejs_equals_bool',
	equals_bvec2: 'threejs_equals_bvec2',
	equals_bvec3: 'threejs_equals_bvec3',
	equals_bvec4: 'threejs_equals_bvec4',
	lessThanEqual: 'threejs_lessThanEqual',
	greaterThan: 'threejs_greaterThan',
	inversesqrt: 'inverseSqrt',
	bitcast: 'bitcast<f32>'
};

const wgslPolyfill = {
	threejs_xor: new CodeNode( `
fn threejs_xor( a : bool, b : bool ) -> bool {

	return ( a || b ) && !( a && b );

}
` ),
	lessThanEqual: new CodeNode( `
fn threejs_lessThanEqual( a : vec3<f32>, b : vec3<f32> ) -> vec3<bool> {

	return vec3<bool>( a.x <= b.x, a.y <= b.y, a.z <= b.z );

}
` ),
	greaterThan: new CodeNode( `
fn threejs_greaterThan( a : vec3<f32>, b : vec3<f32> ) -> vec3<bool> {

	return vec3<bool>( a.x > b.x, a.y > b.y, a.z > b.z );

}
` ),
	mod_float: new CodeNode( 'fn threejs_mod_float( x : f32, y : f32 ) -> f32 { return x - y * floor( x / y ); }' ),
	mod_vec2: new CodeNode( 'fn threejs_mod_vec2( x : vec2f, y : vec2f ) -> vec2f { return x - y * floor( x / y ); }' ),
	mod_vec3: new CodeNode( 'fn threejs_mod_vec3( x : vec3f, y : vec3f ) -> vec3f { return x - y * floor( x / y ); }' ),
	mod_vec4: new CodeNode( 'fn threejs_mod_vec4( x : vec4f, y : vec4f ) -> vec4f { return x - y * floor( x / y ); }' ),
	equals_bool: new CodeNode( 'fn threejs_equals_bool( a : bool, b : bool ) -> bool { return a == b; }' ),
	equals_bvec2: new CodeNode( 'fn threejs_equals_bvec2( a : vec2f, b : vec2f ) -> vec2<bool> { return vec2<bool>( a.x == b.x, a.y == b.y ); }' ),
	equals_bvec3: new CodeNode( 'fn threejs_equals_bvec3( a : vec3f, b : vec3f ) -> vec3<bool> { return vec3<bool>( a.x == b.x, a.y == b.y, a.z == b.z ); }' ),
	equals_bvec4: new CodeNode( 'fn threejs_equals_bvec4( a : vec4f, b : vec4f ) -> vec4<bool> { return vec4<bool>( a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w ); }' ),
	repeatWrapping: new CodeNode( `
fn threejs_repeatWrapping( uv : vec2<f32>, dimension : vec2<u32> ) -> vec2<u32> {

	let uvScaled = vec2<u32>( uv * vec2<f32>( dimension ) );

	return ( ( uvScaled % dimension ) + dimension ) % dimension;

}
` )
};

class WGSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer, scene = null ) {

		super( object, renderer, new WGSLNodeParser(), scene );

		this.uniformGroups = {};

		this.builtins = {};

	}

	needsColorSpaceToLinear( texture ) {

		return texture.isVideoTexture === true && texture.colorSpace !== NoColorSpace;

	}

	_generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( depthSnippet ) {

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet } )`;

			} else {

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet } )`;

			}

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet );

		}

	}

	_generateVideoSample( textureProperty, uvSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleBaseClampToEdge( ${ textureProperty }, ${ textureProperty }_sampler, vec2<f32>( ${ uvSnippet }.x, 1.0 - ${ uvSnippet }.y ) )`;

		} else {

			console.error( `WebGPURenderer: THREE.VideoTexture does not support ${ shaderStage } shader.` );

		}

	}

	_generateTextureSampleLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false ) {

			return `textureSampleLevel( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ levelSnippet } )`;

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, levelSnippet );

		}

	}

	generateTextureLod( texture, textureProperty, uvSnippet, levelSnippet = '0' ) {

		this._include( 'repeatWrapping' );

		const dimension = `textureDimensions( ${ textureProperty }, 0 )`;

		return `textureLoad( ${ textureProperty }, threejs_repeatWrapping( ${ uvSnippet }, ${ dimension } ), i32( ${ levelSnippet } ) )`;

	}

	generateTextureLoad( texture, textureProperty, uvIndexSnippet, depthSnippet, levelSnippet = '0u' ) {

		if ( depthSnippet ) {

			return `textureLoad( ${ textureProperty }, ${ uvIndexSnippet }, ${ depthSnippet }, ${ levelSnippet } )`;

		} else {

			return `textureLoad( ${ textureProperty }, ${ uvIndexSnippet }, ${ levelSnippet } )`;

		}

	}

	generateTextureStore( texture, textureProperty, uvIndexSnippet, valueSnippet ) {

		return `textureStore( ${ textureProperty }, ${ uvIndexSnippet }, ${ valueSnippet } )`;

	}

	isUnfilterable( texture ) {

		return texture.isDataTexture === true && texture.type === FloatType;

	}

	generateTexture( texture, textureProperty, uvSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( texture.isVideoTexture === true ) {

			snippet = this._generateVideoSample( textureProperty, uvSnippet, shaderStage );

		} else if ( this.isUnfilterable( texture ) ) {

			snippet = this.generateTextureLod( texture, textureProperty, uvSnippet, '0', depthSnippet, shaderStage );

		} else {

			snippet = this._generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, shaderStage );

		}

		return snippet;

	}

	generateTextureCompare( texture, textureProperty, uvSnippet, compareSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleCompare( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ compareSnippet } )`;

		} else {

			console.error( `WebGPURenderer: THREE.DepthTexture.compareFunction() does not support ${ shaderStage } shader.` );

		}

	}

	generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		let snippet = null;

		if ( texture.isVideoTexture === true ) {

			snippet = this._generateVideoSample( textureProperty, uvSnippet, shaderStage );

		} else {

			snippet = this._generateTextureSampleLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet, shaderStage );

		}

		return snippet;

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVarying === true && node.needsInterpolation === true ) {

			if ( shaderStage === 'vertex' ) {

				return `varyings.${ node.name }`;

			}

		} else if ( node.isNodeUniform === true ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' ) {

				return name;

			} else if ( type === 'buffer' || type === 'storageBuffer' ) {

				return `NodeBuffer_${ node.id }.${name}`;

			} else {

				return node.groupNode.name + '.' + name;

			}

		}

		return super.getPropertyName( node );

	}

	_getUniformGroupCount( shaderStage ) {

		return Object.keys( this.uniforms[ shaderStage ] ).length;

	}

	getFunctionOperator( op ) {

		const fnOp = wgslFnOpLib[ op ];

		if ( fnOp !== undefined ) {

			this._include( fnOp );

			return fnOp;

		}

		return null;

	}

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const bindings = this.bindings[ shaderStage ];

			if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' ) {

				let texture = null;

				if ( type === 'texture' || type === 'storageTexture' ) {

					texture = new NodeSampledTexture( uniformNode.name, uniformNode.node );

				} else if ( type === 'cubeTexture' ) {

					texture = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node );

				}

				texture.store = node.isStoreTextureNode === true;
				texture.setVisibility( gpuShaderStageLib[ shaderStage ] );

				if ( shaderStage === 'fragment' && this.isUnfilterable( node.value ) === false && texture.store === false ) {

					const sampler = new NodeSampler( `${uniformNode.name}_sampler`, uniformNode.node );
					sampler.setVisibility( gpuShaderStageLib[ shaderStage ] );

					bindings.push( sampler, texture );

					uniformGPU = [ sampler, texture ];

				} else {

					bindings.push( texture );

					uniformGPU = [ texture ];

				}

			} else if ( type === 'buffer' || type === 'storageBuffer' ) {

				const bufferClass = type === 'storageBuffer' ? NodeStorageBuffer : NodeUniformBuffer;
				const buffer = new bufferClass( node );
				buffer.setVisibility( gpuShaderStageLib[ shaderStage ] );

				bindings.push( buffer );

				uniformGPU = buffer;

			} else {

				const group = node.groupNode;
				const groupName = group.name;

				const uniformsStage = this.uniformGroups[ shaderStage ] || ( this.uniformGroups[ shaderStage ] = {} );

				let uniformsGroup = uniformsStage[ groupName ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new NodeUniformsGroup( groupName, group );
					uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					uniformsStage[ groupName ] = uniformsGroup;

					bindings.push( uniformsGroup );

				}

				uniformGPU = this.getNodeUniform( uniformNode, type );

				uniformsGroup.addUniform( uniformGPU );

			}

			nodeData.uniformGPU = uniformGPU;

			if ( shaderStage === 'vertex' ) {

				this.bindingsOffset[ 'fragment' ] = bindings.length;

			}

		}

		return uniformNode;

	}

	isReference( type ) {

		return super.isReference( type ) || type === 'texture_2d' || type === 'texture_cube' || type === 'texture_depth_2d' || type === 'texture_storage_2d';

	}

	getBuiltin( name, property, type, shaderStage = this.shaderStage ) {

		const map = this.builtins[ shaderStage ] || ( this.builtins[ shaderStage ] = new Map() );

		if ( map.has( name ) === false ) {

			map.set( name, {
				name,
				property,
				type
			} );

		}

		return property;

	}

	getVertexIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'vertex_index', 'vertexIndex', 'u32', 'attribute' );

		}

		return 'vertexIndex';

	}

	buildFunctionCode( shaderNode ) {

		const layout = shaderNode.layout;
		const flowData = this.flowShaderNode( shaderNode );

		const parameters = [];

		for ( const input of layout.inputs ) {

			parameters.push( input.name + ' : ' + this.getType( input.type ) );

		}

		//

		const code = `fn ${ layout.name }( ${ parameters.join( ', ' ) } ) -> ${ this.getType( layout.type ) } {
${ flowData.vars }
${ flowData.code }
	return ${ flowData.result };

}`;

		//

		return code;

	}

	getInstanceIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'instance_index', 'instanceIndex', 'u32', 'attribute' );

		}

		return 'instanceIndex';

	}

	getFrontFacing() {

		return this.getBuiltin( 'front_facing', 'isFront', 'bool' );

	}

	getFragCoord() {

		return this.getBuiltin( 'position', 'fragCoord', 'vec4<f32>' ) + '.xy';

	}

	getFragDepth() {

		return 'output.' + this.getBuiltin( 'frag_depth', 'depth', 'f32', 'output' );

	}

	isFlipY() {

		return false;

	}

	getBuiltins( shaderStage ) {

		const snippets = [];
		const builtins = this.builtins[ shaderStage ];

		if ( builtins !== undefined ) {

			for ( const { name, property, type } of builtins.values() ) {

				snippets.push( `@builtin( ${name} ) ${property} : ${type}` );

			}

		}

		return snippets.join( ',\n\t' );

	}

	getAttributes( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'compute' ) {

			this.getBuiltin( 'global_invocation_id', 'id', 'vec3<u32>', 'attribute' );

		}

		if ( shaderStage === 'vertex' || shaderStage === 'compute' ) {

			const builtins = this.getBuiltins( 'attribute' );

			if ( builtins ) snippets.push( builtins );

			const attributes = this.getAttributesArray();

			for ( let index = 0, length = attributes.length; index < length; index ++ ) {

				const attribute = attributes[ index ];
				const name = attribute.name;
				const type = this.getType( attribute.type );

				snippets.push( `@location( ${index} ) ${ name } : ${ type }` );

			}

		}

		return snippets.join( ',\n\t' );

	}

	getStructMembers( struct ) {

		const snippets = [];
		const members = struct.getMemberTypes();

		for ( let i = 0; i < members.length; i ++ ) {

			const member = members[ i ];
			snippets.push( `\t@location( ${i} ) m${i} : ${ member }<f32>` );

		}

		return snippets.join( ',\n' );

	}

	getStructs( shaderStage ) {

		const snippets = [];
		const structs = this.structs[ shaderStage ];

		for ( let index = 0, length = structs.length; index < length; index ++ ) {

			const struct = structs[ index ];
			const name = struct.name;

			let snippet = `\struct ${ name } {\n`;
			snippet += this.getStructMembers( struct );
			snippet += '\n}';

			snippets.push( snippet );

		}

		return snippets.join( '\n\n' );

	}

	getVar( type, name ) {

		return `var ${ name } : ${ this.getType( type ) }`;

	}

	getVars( shaderStage ) {

		const snippets = [];
		const vars = this.vars[ shaderStage ];

		if ( vars !== undefined ) {

			for ( const variable of vars ) {

				snippets.push( `\t${ this.getVar( variable.type, variable.name ) };` );

			}

		}

		return `\n${ snippets.join( '\n' ) }\n`;

	}

	getVaryings( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' ) {

			this.getBuiltin( 'position', 'Vertex', 'vec4<f32>', 'vertex' );

		}

		if ( shaderStage === 'vertex' || shaderStage === 'fragment' ) {

			const varyings = this.varyings;
			const vars = this.vars[ shaderStage ];

			for ( let index = 0; index < varyings.length; index ++ ) {

				const varying = varyings[ index ];

				if ( varying.needsInterpolation ) {

					let attributesSnippet = `@location( ${index} )`;

					if ( /^(int|uint|ivec|uvec)/.test( varying.type ) ) {

						attributesSnippet += ' @interpolate( flat )';


					}

					snippets.push( `${ attributesSnippet } ${ varying.name } : ${ this.getType( varying.type ) }` );

				} else if ( shaderStage === 'vertex' && vars.includes( varying ) === false ) {

					vars.push( varying );

				}

			}

		}

		const builtins = this.getBuiltins( shaderStage );

		if ( builtins ) snippets.push( builtins );

		const code = snippets.join( ',\n\t' );

		return shaderStage === 'vertex' ? this._getWGSLStruct( 'VaryingsStruct', '\t' + code ) : code;

	}

	getUniforms( shaderStage ) {

		const uniforms = this.uniforms[ shaderStage ];

		const bindingSnippets = [];
		const bufferSnippets = [];
		const structSnippets = [];
		const uniformGroups = {};

		let index = this.bindingsOffset[ shaderStage ];

		for ( const uniform of uniforms ) {

			if ( uniform.type === 'texture' || uniform.type === 'cubeTexture' || uniform.type === 'storageTexture' ) {

				const texture = uniform.node.value;

				if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false && uniform.node.isStoreTextureNode !== true ) {

					if ( texture.isDepthTexture === true && texture.compareFunction !== null ) {

						bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name}_sampler : sampler_comparison;` );

					} else {

						bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name}_sampler : sampler;` );

					}

				}

				let textureType;

				if ( texture.isCubeTexture === true ) {

					textureType = 'texture_cube<f32>';

				} else if ( texture.isDataArrayTexture === true ) {

					textureType = 'texture_2d_array<f32>';

				} else if ( texture.isDepthTexture === true ) {

					textureType = 'texture_depth_2d';

				} else if ( texture.isVideoTexture === true ) {

					textureType = 'texture_external';

				} else if ( uniform.node.isStoreTextureNode === true ) {

					const format = getFormat( texture );

					textureType = 'texture_storage_2d<' + format + ', write>';

				} else {

					textureType = 'texture_2d<f32>';

				}

				bindingSnippets.push( `@binding( ${index ++} ) @group( 0 ) var ${uniform.name} : ${textureType};` );

			} else if ( uniform.type === 'buffer' || uniform.type === 'storageBuffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 ? ', ' + bufferCount : '';
				const bufferSnippet = `\t${uniform.name} : array< ${bufferType}${bufferCountSnippet} >\n`;
				const bufferAccessMode = bufferNode.isStorageBufferNode ? 'storage,read_write' : 'uniform';

				bufferSnippets.push( this._getWGSLStructBinding( 'NodeBuffer_' + bufferNode.id, bufferSnippet, bufferAccessMode, index ++ ) );

			} else {

				const vectorType = this.getType( this.getVectorType( uniform.type ) );
				const groupName = uniform.groupNode.name;

				const group = uniformGroups[ groupName ] || ( uniformGroups[ groupName ] = {
					index: index ++,
					snippets: []
				} );

				group.snippets.push( `\t${ uniform.name } : ${ vectorType }` );

			}

		}

		for ( const name in uniformGroups ) {

			const group = uniformGroups[ name ];

			structSnippets.push( this._getWGSLStructBinding( name, group.snippets.join( ',\n' ), 'uniform', group.index ) );

		}

		let code = bindingSnippets.join( '\n' );
		code += bufferSnippets.join( '\n' );
		code += structSnippets.join( '\n' );

		return code;

	}

	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		for ( const shaderStage in shadersData ) {

			const stageData = shadersData[ shaderStage ];
			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.codes = this.getCodes( shaderStage );

			//

			let flow = '// code\n\n';
			flow += this.flowCode[ shaderStage ];

			const flowNodes = this.flowNodes[ shaderStage ];
			const mainNode = flowNodes[ flowNodes.length - 1 ];

			const outputNode = mainNode.outputNode;
			const isOutputStruct = ( outputNode !== undefined && outputNode.isOutputStructNode === true );

			for ( const node of flowNodes ) {

				const flowSlotData = this.getFlowData( node/*, shaderStage*/ );
				const slotName = node.name;

				if ( slotName ) {

					if ( flow.length > 0 ) flow += '\n';

					flow += `\t// flow -> ${ slotName }\n\t`;

				}

				flow += `${ flowSlotData.code }\n\t`;

				if ( node === mainNode && shaderStage !== 'compute' ) {

					flow += '// result\n\n\t';

					if ( shaderStage === 'vertex' ) {

						flow += `varyings.Vertex = ${ flowSlotData.result };`;

					} else if ( shaderStage === 'fragment' ) {

						if ( isOutputStruct ) {

							stageData.returnType = outputNode.nodeType;

							flow += `return ${ flowSlotData.result };`;

						} else {

							let structSnippet = '\t@location(0) color: vec4<f32>';

							const builtins = this.getBuiltins( 'output' );

							if ( builtins ) structSnippet += ',\n\t' + builtins;

							stageData.returnType = 'OutputStruct';
							stageData.structs += this._getWGSLStruct( 'OutputStruct', structSnippet );
							stageData.structs += '\nvar<private> output : OutputStruct;\n\n';

							flow += `output.color = ${ flowSlotData.result };\n\n\treturn output;`;

						}

					}

				}

			}

			stageData.flow = flow;

		}

		if ( this.material !== null ) {

			this.vertexShader = this._getWGSLVertexCode( shadersData.vertex );
			this.fragmentShader = this._getWGSLFragmentCode( shadersData.fragment );

		} else {

			this.computeShader = this._getWGSLComputeCode( shadersData.compute, ( this.object.workgroupSize || [ 64 ] ).join( ', ' ) );

		}

	}

	getMethod( method, output = null ) {

		let wgslMethod;

		if ( output !== null ) {

			wgslMethod = this._getWGSLMethod( method + '_' + output );

		}

		if ( wgslMethod === undefined ) {

			wgslMethod = this._getWGSLMethod( method );

		}

		return wgslMethod || method;

	}

	getType( type ) {

		return wgslTypeLib[ type ] || type;

	}

	isAvailable( name ) {

		return supports[ name ] === true;

	}

	_getWGSLMethod( method ) {

		if ( wgslPolyfill[ method ] !== undefined ) {

			this._include( method );

		}

		return wgslMethods[ method ];

	}

	_include( name ) {

		const codeNode = wgslPolyfill[ name ];
		codeNode.build( this );

		if ( this.currentFunctionNode !== null ) {

			this.currentFunctionNode.includes.push( codeNode );

		}

		return codeNode;

	}

	_getWGSLVertexCode( shaderData ) {

		return `${ this.getSignature() }

// uniforms
${shaderData.uniforms}

// varyings
${shaderData.varyings}
var<private> varyings : VaryingsStruct;

// codes
${shaderData.codes}

@vertex
fn main( ${shaderData.attributes} ) -> VaryingsStruct {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

	return varyings;

}
`;

	}

	_getWGSLFragmentCode( shaderData ) {

		return `${ this.getSignature() }

// uniforms
${shaderData.uniforms}

// structs
${shaderData.structs}

// codes
${shaderData.codes}

@fragment
fn main( ${shaderData.varyings} ) -> ${shaderData.returnType} {

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

	}

	_getWGSLComputeCode( shaderData, workgroupSize ) {

		return `${ this.getSignature() }
// system
var<private> instanceIndex : u32;

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

@compute @workgroup_size( ${workgroupSize} )
fn main( ${shaderData.attributes} ) {

	// system
	instanceIndex = id.x;

	// vars
	${shaderData.vars}

	// flow
	${shaderData.flow}

}
`;

	}

	_getWGSLStruct( name, vars ) {

		return `
struct ${name} {
${vars}
};`;

	}

	_getWGSLStructBinding( name, vars, access, binding = 0, group = 0 ) {

		const structName = name + 'Struct';
		const structSnippet = this._getWGSLStruct( structName, vars );

		return `${structSnippet}
@binding( ${binding} ) @group( ${group} )
var<${access}> ${name} : ${structName};`;

	}

}

class WebGPUUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	getCurrentDepthStencilFormat( renderContext ) {

		let format;

		if ( renderContext.depthTexture !== null ) {

			format = this.getTextureFormatGPU( renderContext.depthTexture );

		} else if ( renderContext.depth && renderContext.stencil ) {

			format = GPUTextureFormat.Depth24PlusStencil8;

		} else if ( renderContext.depth ) {

			format = GPUTextureFormat.Depth24Plus;

		}

		return format;

	}

	getTextureFormatGPU( texture ) {

		return this.backend.get( texture ).texture.format;

	}

	getCurrentColorFormat( renderContext ) {

		let format;

		if ( renderContext.textures !== null ) {

			format = this.getTextureFormatGPU( renderContext.textures[ 0 ] );


		} else {

			format = GPUTextureFormat.BGRA8Unorm; // default context format

		}

		return format;

	}

	getCurrentColorSpace( renderContext ) {

		if ( renderContext.textures !== null ) {

			return renderContext.textures[ 0 ].colorSpace;

		}

		return this.backend.renderer.outputColorSpace;

	}

	getPrimitiveTopology( object, material ) {

		if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments || ( object.isMesh && material.wireframe === true ) ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;

	}

	getSampleCount( renderContext ) {

		if ( renderContext.textures !== null ) {

			return renderContext.sampleCount;

		}

		return this.backend.parameters.sampleCount;

	}

}

const typedArraysToVertexFormatPrefix = new Map( [
	[ Int8Array, [ 'sint8', 'snorm8' ]],
	[ Uint8Array, [ 'uint8', 'unorm8' ]],
	[ Int16Array, [ 'sint16', 'snorm16' ]],
	[ Uint16Array, [ 'uint16', 'unorm16' ]],
	[ Int32Array, [ 'sint32', 'snorm32' ]],
	[ Uint32Array, [ 'uint32', 'unorm32' ]],
	[ Float32Array, [ 'float32', ]],
] );

const typedAttributeToVertexFormatPrefix = new Map( [
	[ Float16BufferAttribute, [ 'float16', ]],
] );

const typeArraysToVertexFormatPrefixForItemSize1 = new Map( [
	[ Int32Array, 'sint32' ],
	[ Uint32Array, 'uint32' ],
	[ Float32Array, 'float32' ]
] );

class WebGPUAttributeUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createAttribute( attribute, usage ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const backend = this.backend;
		const bufferData = backend.get( bufferAttribute );

		let buffer = bufferData.buffer;

		if ( buffer === undefined ) {

			const device = backend.device;

			let array = bufferAttribute.array;

			if ( ( bufferAttribute.isStorageBufferAttribute || bufferAttribute.isStorageInstancedBufferAttribute ) && bufferAttribute.itemSize === 3 ) {

				bufferAttribute.itemSize = 4;
				array = new array.constructor( bufferAttribute.count * 4 );

				for ( let i = 0; i < bufferAttribute.count; i ++ ) {

					array.set( bufferAttribute.array.subarray( i * 3, i * 3 + 3 ), i * 4 );

				}

			}

			const size = array.byteLength + ( ( 4 - ( array.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

			buffer = device.createBuffer( {
				label: bufferAttribute.name,
				size: size,
				usage: usage,
				mappedAtCreation: true
			} );

			new array.constructor( buffer.getMappedRange() ).set( array );

			buffer.unmap();

			bufferData.buffer = buffer;

		}

	}

	updateAttribute( attribute ) {

		const bufferAttribute = this._getBufferAttribute( attribute );

		const backend = this.backend;
		const device = backend.device;

		const buffer = backend.get( bufferAttribute ).buffer;

		const array = bufferAttribute.array;
		const updateRanges = bufferAttribute.updateRanges;

		if ( updateRanges.length === 0 ) {

			// Not using update ranges

			device.queue.writeBuffer(
				buffer,
				0,
				array,
				0
			);

		} else {

			for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

				const range = updateRanges[ i ];
				device.queue.writeBuffer(
					buffer,
					0,
					array,
					range.start * array.BYTES_PER_ELEMENT,
					range.count * array.BYTES_PER_ELEMENT
				);

			}

			bufferAttribute.clearUpdateRanges();

		}

	}

	createShaderVertexBuffers( renderObject ) {

		const attributes = renderObject.getAttributes();
		const vertexBuffers = new Map();

		for ( let slot = 0; slot < attributes.length; slot ++ ) {

			const geometryAttribute = attributes[ slot ];
			const bytesPerElement = geometryAttribute.array.BYTES_PER_ELEMENT;
			const bufferAttribute = this._getBufferAttribute( geometryAttribute );

			let vertexBufferLayout = vertexBuffers.get( bufferAttribute );

			if ( vertexBufferLayout === undefined ) {

				let arrayStride, stepMode;

				if ( geometryAttribute.isInterleavedBufferAttribute === true ) {

					arrayStride = geometryAttribute.data.stride * bytesPerElement;
					stepMode = geometryAttribute.data.isInstancedInterleavedBuffer ? GPUInputStepMode.Instance : GPUInputStepMode.Vertex;

				} else {

					arrayStride = geometryAttribute.itemSize * bytesPerElement;
					stepMode = geometryAttribute.isInstancedBufferAttribute ? GPUInputStepMode.Instance : GPUInputStepMode.Vertex;

				}

				vertexBufferLayout = {
					arrayStride,
					attributes: [],
					stepMode
				};

				vertexBuffers.set( bufferAttribute, vertexBufferLayout );

			}

			const format = this._getVertexFormat( geometryAttribute );
			const offset = ( geometryAttribute.isInterleavedBufferAttribute === true ) ? geometryAttribute.offset * bytesPerElement : 0;

			vertexBufferLayout.attributes.push( {
				shaderLocation: slot,
				offset,
				format
			} );

		}

		return Array.from( vertexBuffers.values() );

	}

	destroyAttribute( attribute ) {

		const backend = this.backend;
		const data = backend.get( this._getBufferAttribute( attribute ) );

		data.buffer.destroy();

		backend.delete( attribute );

	}

	async getArrayBufferAsync( attribute ) {

		const backend = this.backend;
		const device = backend.device;

		const data = backend.get( this._getBufferAttribute( attribute ) );

		const bufferGPU = data.buffer;
		const size = bufferGPU.size;

		let readBufferGPU = data.readBuffer;
		let needsUnmap = true;

		if ( readBufferGPU === undefined ) {

			readBufferGPU = device.createBuffer( {
				label: attribute.name,
				size,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			} );

			needsUnmap = false;

			data.readBuffer = readBufferGPU;

		}

		const cmdEncoder = device.createCommandEncoder( {} );

		cmdEncoder.copyBufferToBuffer(
			bufferGPU,
			0,
			readBufferGPU,
			0,
			size
		);

		if ( needsUnmap ) readBufferGPU.unmap();

		const gpuCommands = cmdEncoder.finish();
		device.queue.submit( [ gpuCommands ] );

		await readBufferGPU.mapAsync( GPUMapMode.READ );

		const arrayBuffer = readBufferGPU.getMappedRange();

		return arrayBuffer;

	}

	_getVertexFormat( geometryAttribute ) {

		const { itemSize, normalized } = geometryAttribute;
		const ArrayType = geometryAttribute.array.constructor;
		const AttributeType = geometryAttribute.constructor;

		let format;

		if ( itemSize == 1 ) {

			format = typeArraysToVertexFormatPrefixForItemSize1.get( ArrayType );

		} else {

			const prefixOptions = typedAttributeToVertexFormatPrefix.get( AttributeType ) || typedArraysToVertexFormatPrefix.get( ArrayType );
			const prefix = prefixOptions[ normalized ? 1 : 0 ];

			if ( prefix ) {

				const bytesPerUnit = ArrayType.BYTES_PER_ELEMENT * itemSize;
				const paddedBytesPerUnit = Math.floor( ( bytesPerUnit + 3 ) / 4 ) * 4;
				const paddedItemSize = paddedBytesPerUnit / ArrayType.BYTES_PER_ELEMENT;

				if ( paddedItemSize % 1 ) {

					throw new Error( 'THREE.WebGPUAttributeUtils: Bad vertex format item size.' );

				}

				format = `${prefix}x${paddedItemSize}`;

			}

		}

		if ( ! format ) {

			console.error( 'THREE.WebGPUAttributeUtils: Vertex format not supported yet.' );

		}

		return format;

	}

	_getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

}

class WebGPUBindingUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createBindingsLayout( bindings ) {

		const backend = this.backend;
		const device = backend.device;

		const entries = [];

		let index = 0;

		for ( const binding of bindings ) {

			const bindingGPU = {
				binding: index ++,
				visibility: binding.visibility
			};

			if ( binding.isUniformBuffer || binding.isStorageBuffer ) {

				const buffer = {}; // GPUBufferBindingLayout

				if ( binding.isStorageBuffer ) {

					buffer.type = GPUBufferBindingType.Storage;

				}

				bindingGPU.buffer = buffer;

			} else if ( binding.isSampler ) {

				const sampler = {}; // GPUSamplerBindingLayout

				if ( binding.texture.isDepthTexture ) {

					if ( binding.texture.compareFunction !== null ) {

						sampler.type = 'comparison';

					}

				}

				bindingGPU.sampler = sampler;

			} else if ( binding.isSampledTexture && binding.texture.isVideoTexture ) {

				bindingGPU.externalTexture = {}; // GPUExternalTextureBindingLayout

			} else if ( binding.isSampledTexture && binding.store ) {

				const format = this.backend.get( binding.texture ).texture.format;

				bindingGPU.storageTexture = { format }; // GPUStorageTextureBindingLayout

			} else if ( binding.isSampledTexture ) {

				const texture = {}; // GPUTextureBindingLayout

				if ( binding.texture.isDepthTexture ) {

					texture.sampleType = GPUTextureSampleType.Depth;

				} else if ( binding.texture.isDataTexture && binding.texture.type === FloatType ) {

					// @TODO: Add support for this soon: backend.hasFeature( 'float32-filterable' )

					texture.sampleType = GPUTextureSampleType.UnfilterableFloat;

				}

				if ( binding.isSampledCubeTexture ) {

					texture.viewDimension = GPUTextureViewDimension.Cube;

				} else if ( binding.texture.isDataArrayTexture ) {

					texture.viewDimension = GPUTextureViewDimension.TwoDArray;

				}

				bindingGPU.texture = texture;

			} else {

				console.error( `WebGPUBindingUtils: Unsupported binding "${ binding }".` );

			}

			entries.push( bindingGPU );

		}

		return device.createBindGroupLayout( { entries } );

	}

	createBindings( bindings ) {

		const backend = this.backend;
		const bindingsData = backend.get( bindings );

		// setup (static) binding layout and (dynamic) binding group

		const bindLayoutGPU = this.createBindingsLayout( bindings );
		const bindGroupGPU = this.createBindGroup( bindings, bindLayoutGPU );

		bindingsData.layout = bindLayoutGPU;
		bindingsData.group = bindGroupGPU;
		bindingsData.bindings = bindings;

	}

	updateBinding( binding ) {

		const backend = this.backend;
		const device = backend.device;

		const buffer = binding.buffer;
		const bufferGPU = backend.get( binding ).buffer;

		device.queue.writeBuffer( bufferGPU, 0, buffer, 0 );

	}

	createBindGroup( bindings, layoutGPU ) {

		const backend = this.backend;
		const device = backend.device;

		let bindingPoint = 0;
		const entriesGPU = [];

		for ( const binding of bindings ) {

			if ( binding.isUniformBuffer ) {

				const bindingData = backend.get( binding );

				if ( bindingData.buffer === undefined ) {

					const byteLength = binding.byteLength;

					const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

					const bufferGPU = device.createBuffer( {
						label: 'bindingBuffer_' + binding.name,
						size: byteLength,
						usage: usage
					} );

					bindingData.buffer = bufferGPU;

				}

				entriesGPU.push( { binding: bindingPoint, resource: { buffer: bindingData.buffer } } );

			} else if ( binding.isStorageBuffer ) {

				const bindingData = backend.get( binding );

				if ( bindingData.buffer === undefined ) {

					const attribute = binding.attribute;
					//const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | /*GPUBufferUsage.COPY_SRC |*/ GPUBufferUsage.COPY_DST;

					//backend.attributeUtils.createAttribute( attribute, usage ); // @TODO: Move it to universal renderer

					bindingData.buffer = backend.get( attribute ).buffer;

				}

				entriesGPU.push( { binding: bindingPoint, resource: { buffer: bindingData.buffer } } );

			} else if ( binding.isSampler ) {

				const textureGPU = backend.get( binding.texture );

				entriesGPU.push( { binding: bindingPoint, resource: textureGPU.sampler } );

			} else if ( binding.isSampledTexture ) {

				const textureData = backend.get( binding.texture );

				let dimensionViewGPU;

				if ( binding.isSampledCubeTexture ) {

					dimensionViewGPU = GPUTextureViewDimension.Cube;

				} else if ( binding.texture.isDataArrayTexture ) {

					dimensionViewGPU = GPUTextureViewDimension.TwoDArray;

				} else {

					dimensionViewGPU = GPUTextureViewDimension.TwoD;

				}

				let resourceGPU;

				if ( textureData.externalTexture !== undefined ) {

					resourceGPU = device.importExternalTexture( { source: textureData.externalTexture } );

				} else {

					const aspectGPU = GPUTextureAspect.All;

					resourceGPU = textureData.texture.createView( { aspect: aspectGPU, dimension: dimensionViewGPU, mipLevelCount: binding.store ? 1 : textureData.mipLevelCount } );

				}

				entriesGPU.push( { binding: bindingPoint, resource: resourceGPU } );

			}

			bindingPoint ++;

		}

		return device.createBindGroup( {
			layout: layoutGPU,
			entries: entriesGPU
		} );

	}

}

class WebGPUPipelineUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	createRenderPipeline( renderObject, promises ) {

		const { object, material, geometry, pipeline } = renderObject;
		const { vertexProgram, fragmentProgram } = pipeline;

		const backend = this.backend;
		const device = backend.device;
		const utils = backend.utils;

		const pipelineData = backend.get( pipeline );
		const bindingsData = backend.get( renderObject.getBindings() );

		// vertex buffers

		const vertexBuffers = backend.attributeUtils.createShaderVertexBuffers( renderObject );

		// blending

		let blending;

		if ( material.transparent === true && material.blending !== NoBlending ) {

			blending = this._getBlending( material );

		}

		// stencil

		let stencilFront = {};

		if ( material.stencilWrite === true ) {

			stencilFront = {
				compare: this._getStencilCompare( material ),
				failOp: this._getStencilOperation( material.stencilFail ),
				depthFailOp: this._getStencilOperation( material.stencilZFail ),
				passOp: this._getStencilOperation( material.stencilZPass )
			};

		}

		const colorWriteMask = this._getColorWriteMask( material );

		const targets = [];

		if ( renderObject.context.textures !== null ) {

			const textures = renderObject.context.textures;

			for ( let i = 0; i < textures.length; i ++ ) {

				const colorFormat = utils.getTextureFormatGPU( textures[ i ] );

				targets.push( {
					format: colorFormat,
					blend: blending,
					writeMask: colorWriteMask
				} );

			}

		} else {

			const colorFormat = utils.getCurrentColorFormat( renderObject.context );

			targets.push( {
				format: colorFormat,
				blend: blending,
				writeMask: colorWriteMask
			} );

		}

		const vertexModule = backend.get( vertexProgram ).module;
		const fragmentModule = backend.get( fragmentProgram ).module;

		const primitiveState = this._getPrimitiveState( object, geometry, material );
		const depthCompare = this._getDepthCompare( material );
		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderObject.context );
		let sampleCount = utils.getSampleCount( renderObject.context );

		if ( sampleCount > 1 ) {

			// WebGPU only supports power-of-two sample counts and 2 is not a valid value
			sampleCount = Math.pow( 2, Math.floor( Math.log2( sampleCount ) ) );

			if ( sampleCount === 2 ) {

				sampleCount = 4;

			}

		}

		const pipelineDescriptor = {
			vertex: Object.assign( {}, vertexModule, { buffers: vertexBuffers } ),
			fragment: Object.assign( {}, fragmentModule, { targets } ),
			primitive: primitiveState,
			depthStencil: {
				format: depthStencilFormat,
				depthWriteEnabled: material.depthWrite,
				depthCompare: depthCompare,
				stencilFront: stencilFront,
				stencilBack: {}, // three.js does not provide an API to configure the back function (gl.stencilFuncSeparate() was never used)
				stencilReadMask: material.stencilFuncMask,
				stencilWriteMask: material.stencilWriteMask
			},
			multisample: {
				count: sampleCount,
				alphaToCoverageEnabled: material.alphaToCoverage
			},
			layout: device.createPipelineLayout( {
				bindGroupLayouts: [ bindingsData.layout ]
			} )
		};

		if ( promises === null ) {

			pipelineData.pipeline = device.createRenderPipeline( pipelineDescriptor );

		} else {

			const p = new Promise( ( resolve /*, reject*/ ) => {

				device.createRenderPipelineAsync( pipelineDescriptor ).then( pipeline => {

					pipelineData.pipeline = pipeline;
					resolve();

				} );

			} );

			promises.push( p );

		}

	}

	createComputePipeline( pipeline, bindings ) {

		const backend = this.backend;
		const device = backend.device;

		const computeProgram = backend.get( pipeline.computeProgram ).module;

		const pipelineGPU = backend.get( pipeline );
		const bindingsData = backend.get( bindings );

		pipelineGPU.pipeline = device.createComputePipeline( {
			compute: computeProgram,
			layout: device.createPipelineLayout( {
				bindGroupLayouts: [ bindingsData.layout ]
			} )
		} );

	}

	_getBlending( material ) {

		let color, alpha;

		const blending = material.blending;

		if ( blending === CustomBlending ) {

			const blendSrcAlpha = material.blendSrcAlpha !== null ? material.blendSrcAlpha : GPUBlendFactor.One;
			const blendDstAlpha = material.blendDstAlpha !== null ? material.blendDstAlpha : GPUBlendFactor.Zero;
			const blendEquationAlpha = material.blendEquationAlpha !== null ? material.blendEquationAlpha : GPUBlendFactor.Add;

			color = {
				srcFactor: this._getBlendFactor( material.blendSrc ),
				dstFactor: this._getBlendFactor( material.blendDst ),
				operation: this._getBlendOperation( material.blendEquation )
			};

			alpha = {
				srcFactor: this._getBlendFactor( blendSrcAlpha ),
				dstFactor: this._getBlendFactor( blendDstAlpha ),
				operation: this._getBlendOperation( blendEquationAlpha )
			};

		} else {

			const premultipliedAlpha = material.premultipliedAlpha;

			const setBlend = ( srcRGB, dstRGB, srcAlpha, dstAlpha ) => {

				color = {
					srcFactor: srcRGB,
					dstFactor: dstRGB,
					operation: GPUBlendOperation.Add
				};

				alpha = {
					srcFactor: srcAlpha,
					dstFactor: dstAlpha,
					operation: GPUBlendOperation.Add
				};

			};

			if ( premultipliedAlpha ) {

				switch ( blending ) {

					case NormalBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha );
						break;

					case AdditiveBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.One, GPUBlendFactor.One, GPUBlendFactor.One );
						break;

					case SubtractiveBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.OneMinusSrc, GPUBlendFactor.Zero, GPUBlendFactor.One );
						break;

					case MultiplyBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.Src, GPUBlendFactor.Zero, GPUBlendFactor.SrcAlpha );
						break;

				}

			} else {

				switch ( blending ) {

					case NormalBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha );
						break;

					case AdditiveBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.One, GPUBlendFactor.SrcAlpha, GPUBlendFactor.One );
						break;

					case SubtractiveBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.OneMinusSrc, GPUBlendFactor.Zero, GPUBlendFactor.One );
						break;

					case MultiplyBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.Src, GPUBlendFactor.Zero, GPUBlendFactor.Src );
						break;

				}

			}

		}

		if ( color !== undefined && alpha !== undefined ) {

			return { color, alpha };

		} else {

			console.error( 'THREE.WebGPURenderer: Invalid blending: ', blending );

		}

	}

	_getBlendFactor( blend ) {

		let blendFactor;

		switch ( blend ) {

			case ZeroFactor:
				blendFactor = GPUBlendFactor.Zero;
				break;

			case OneFactor:
				blendFactor = GPUBlendFactor.One;
				break;

			case SrcColorFactor:
				blendFactor = GPUBlendFactor.Src;
				break;

			case OneMinusSrcColorFactor:
				blendFactor = GPUBlendFactor.OneMinusSrc;
				break;

			case SrcAlphaFactor:
				blendFactor = GPUBlendFactor.SrcAlpha;
				break;

			case OneMinusSrcAlphaFactor:
				blendFactor = GPUBlendFactor.OneMinusSrcAlpha;
				break;

			case DstColorFactor:
				blendFactor = GPUBlendFactor.Dst;
				break;

			case OneMinusDstColorFactor:
				blendFactor = GPUBlendFactor.OneMinusDstColor;
				break;

			case DstAlphaFactor:
				blendFactor = GPUBlendFactor.DstAlpha;
				break;

			case OneMinusDstAlphaFactor:
				blendFactor = GPUBlendFactor.OneMinusDstAlpha;
				break;

			case SrcAlphaSaturateFactor:
				blendFactor = GPUBlendFactor.SrcAlphaSaturated;
				break;

			case BlendColorFactor:
				blendFactor = GPUBlendFactor.Constant;
				break;

			case OneMinusBlendColorFactor:
				blendFactor = GPUBlendFactor.OneMinusConstant;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Blend factor not supported.', blend );

		}

		return blendFactor;

	}

	_getStencilCompare( material ) {

		let stencilCompare;

		const stencilFunc = material.stencilFunc;

		switch ( stencilFunc ) {

			case NeverStencilFunc:
				stencilCompare = GPUCompareFunction.Never;
				break;

			case AlwaysStencilFunc:
				stencilCompare = GPUCompareFunction.Always;
				break;

			case LessStencilFunc:
				stencilCompare = GPUCompareFunction.Less;
				break;

			case LessEqualStencilFunc:
				stencilCompare = GPUCompareFunction.LessEqual;
				break;

			case EqualStencilFunc:
				stencilCompare = GPUCompareFunction.Equal;
				break;

			case GreaterEqualStencilFunc:
				stencilCompare = GPUCompareFunction.GreaterEqual;
				break;

			case GreaterStencilFunc:
				stencilCompare = GPUCompareFunction.Greater;
				break;

			case NotEqualStencilFunc:
				stencilCompare = GPUCompareFunction.NotEqual;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid stencil function.', stencilFunc );

		}

		return stencilCompare;

	}

	_getStencilOperation( op ) {

		let stencilOperation;

		switch ( op ) {

			case KeepStencilOp:
				stencilOperation = GPUStencilOperation.Keep;
				break;

			case ZeroStencilOp:
				stencilOperation = GPUStencilOperation.Zero;
				break;

			case ReplaceStencilOp:
				stencilOperation = GPUStencilOperation.Replace;
				break;

			case InvertStencilOp:
				stencilOperation = GPUStencilOperation.Invert;
				break;

			case IncrementStencilOp:
				stencilOperation = GPUStencilOperation.IncrementClamp;
				break;

			case DecrementStencilOp:
				stencilOperation = GPUStencilOperation.DecrementClamp;
				break;

			case IncrementWrapStencilOp:
				stencilOperation = GPUStencilOperation.IncrementWrap;
				break;

			case DecrementWrapStencilOp:
				stencilOperation = GPUStencilOperation.DecrementWrap;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid stencil operation.', stencilOperation );

		}

		return stencilOperation;

	}

	_getBlendOperation( blendEquation ) {

		let blendOperation;

		switch ( blendEquation ) {

			case AddEquation:
				blendOperation = GPUBlendOperation.Add;
				break;

			case SubtractEquation:
				blendOperation = GPUBlendOperation.Subtract;
				break;

			case ReverseSubtractEquation:
				blendOperation = GPUBlendOperation.ReverseSubtract;
				break;

			case MinEquation:
				blendOperation = GPUBlendOperation.Min;
				break;

			case MaxEquation:
				blendOperation = GPUBlendOperation.Max;
				break;

			default:
				console.error( 'THREE.WebGPUPipelineUtils: Blend equation not supported.', blendEquation );

		}

		return blendOperation;

	}

	_getPrimitiveState( object, geometry, material ) {

		const descriptor = {};
		const utils = this.backend.utils;

		descriptor.topology = utils.getPrimitiveTopology( object, material );

		if ( geometry.index !== null && object.isLine === true && object.isLineSegments !== true ) {

			descriptor.stripIndexFormat = ( geometry.index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

		}

		switch ( material.side ) {

			case FrontSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.Back;
				break;

			case BackSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.Front;
				break;

			case DoubleSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.None;
				break;

			default:
				console.error( 'THREE.WebGPUPipelineUtils: Unknown material.side value.', material.side );
				break;

		}

		return descriptor;

	}

	_getColorWriteMask( material ) {

		return ( material.colorWrite === true ) ? GPUColorWriteFlags.All : GPUColorWriteFlags.None;

	}

	_getDepthCompare( material ) {

		let depthCompare;

		if ( material.depthTest === false ) {

			depthCompare = GPUCompareFunction.Always;

		} else {

			const depthFunc = material.depthFunc;

			switch ( depthFunc ) {

				case NeverDepth:
					depthCompare = GPUCompareFunction.Never;
					break;

				case AlwaysDepth:
					depthCompare = GPUCompareFunction.Always;
					break;

				case LessDepth:
					depthCompare = GPUCompareFunction.Less;
					break;

				case LessEqualDepth:
					depthCompare = GPUCompareFunction.LessEqual;
					break;

				case EqualDepth:
					depthCompare = GPUCompareFunction.Equal;
					break;

				case GreaterEqualDepth:
					depthCompare = GPUCompareFunction.GreaterEqual;
					break;

				case GreaterDepth:
					depthCompare = GPUCompareFunction.Greater;
					break;

				case NotEqualDepth:
					depthCompare = GPUCompareFunction.NotEqual;
					break;

				default:
					console.error( 'THREE.WebGPUPipelineUtils: Invalid depth function.', depthFunc );

			}

		}

		return depthCompare;

	}

}

/*// debugger tools
import 'https://greggman.github.io/webgpu-avoid-redundant-state-setting/webgpu-check-redundant-state-setting.js';
//*/


//

class WebGPUBackend extends Backend {

	constructor( parameters = {} ) {

		super( parameters );

		this.isWebGPUBackend = true;

		// some parameters require default values other than "undefined"
		this.parameters.alpha = ( parameters.alpha === undefined ) ? true : parameters.alpha;

		this.parameters.antialias = ( parameters.antialias === true );

		if ( this.parameters.antialias === true ) {

			this.parameters.sampleCount = ( parameters.sampleCount === undefined ) ? 4 : parameters.sampleCount;

		} else {

			this.parameters.sampleCount = 1;

		}

		this.parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

		this.trackTimestamp = ( parameters.trackTimestamp === true );

		this.adapter = null;
		this.device = null;
		this.context = null;
		this.colorBuffer = null;
		this.defaultRenderPassdescriptor = null;

		this.utils = new WebGPUUtils( this );
		this.attributeUtils = new WebGPUAttributeUtils( this );
		this.bindingUtils = new WebGPUBindingUtils( this );
		this.pipelineUtils = new WebGPUPipelineUtils( this );
		this.textureUtils = new WebGPUTextureUtils( this );
		this.occludedResolveCache = new Map();

	}

	async init( renderer ) {

		await super.init( renderer );

		//

		const parameters = this.parameters;

		const adapterOptions = {
			powerPreference: parameters.powerPreference
		};

		const adapter = await navigator.gpu.requestAdapter( adapterOptions );

		if ( adapter === null ) {

			throw new Error( 'WebGPUBackend: Unable to create WebGPU adapter.' );

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

		const context = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgpu' );

		this.adapter = adapter;
		this.device = device;
		this.context = context;

		const alphaMode = parameters.alpha ? 'premultiplied' : 'opaque';

		this.context.configure( {
			device: this.device,
			format: GPUTextureFormat.BGRA8Unorm,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
			alphaMode: alphaMode
		} );

		this.updateSize();

	}

	get coordinateSystem() {

		return WebGPUCoordinateSystem;

	}

	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}

	getContext() {

		return this.context;

	}

	_getDefaultRenderPassDescriptor() {

		let descriptor = this.defaultRenderPassdescriptor;

		const antialias = this.parameters.antialias;

		if ( descriptor === null ) {

			const renderer = this.renderer;

			descriptor = {
				colorAttachments: [ {
					view: null
				} ],
				depthStencilAttachment: {
					view: this.textureUtils.getDepthBuffer( renderer.depth, renderer.stencil ).createView()
				}
			};

			const colorAttachment = descriptor.colorAttachments[ 0 ];

			if ( antialias === true ) {

				colorAttachment.view = this.colorBuffer.createView();

			} else {

				colorAttachment.resolveTarget = undefined;

			}

			this.defaultRenderPassdescriptor = descriptor;

		}

		const colorAttachment = descriptor.colorAttachments[ 0 ];

		if ( antialias === true ) {

			colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();

		} else {

			colorAttachment.view = this.context.getCurrentTexture().createView();

		}

		return descriptor;

	}

	_getRenderPassDescriptor( renderContext ) {

		const renderTarget = renderContext.renderTarget;
		const renderTargetData = this.get( renderTarget );

		let descriptors = renderTargetData.descriptors;

		if ( descriptors === undefined ) {

			descriptors = [];

			renderTargetData.descriptors = descriptors;

		}

		if ( renderTargetData.width !== renderTarget.width ||
			renderTargetData.height !== renderTarget.height ||
			renderTargetData.activeMipmapLevel !== renderTarget.activeMipmapLevel ||
			renderTargetData.samples !== renderTarget.samples
		) {

			descriptors.length = 0;

		}

		let descriptor = descriptors[ renderContext.activeCubeFace ];

		if ( descriptor === undefined ) {

			const textures = renderContext.textures;
			const colorAttachments = [];

			for ( let i = 0; i < textures.length; i ++ ) {

				const textureData = this.get( textures[ i ] );

				const textureView = textureData.texture.createView( {
					baseMipLevel: renderContext.activeMipmapLevel,
					mipLevelCount: 1,
					baseArrayLayer: renderContext.activeCubeFace,
					dimension: GPUTextureViewDimension.TwoD
				} );

				let view, resolveTarget;

				if ( textureData.msaaTexture !== undefined ) {

					view = textureData.msaaTexture.createView();
					resolveTarget = textureView;

				} else {

					view = textureView;
					resolveTarget = undefined;

				}

				colorAttachments.push( {
					view,
					resolveTarget,
					loadOp: GPULoadOp.Load,
					storeOp: GPUStoreOp.Store
				} );

			}

			const depthTextureData = this.get( renderContext.depthTexture );

			const depthStencilAttachment = {
				view: depthTextureData.texture.createView(),
			};

			descriptor = {
				colorAttachments,
				depthStencilAttachment
			};

			descriptors[ renderContext.activeCubeFace ] = descriptor;

			renderTargetData.width = renderTarget.width;
			renderTargetData.height = renderTarget.height;
			renderTargetData.samples = renderTarget.samples;
			renderTargetData.activeMipmapLevel = renderTarget.activeMipmapLevel;

		}

		return descriptor;

	}

	beginRender( renderContext ) {

		const renderContextData = this.get( renderContext );

		const device = this.device;
		const occlusionQueryCount = renderContext.occlusionQueryCount;

		let occlusionQuerySet;

		if ( occlusionQueryCount > 0 ) {

			if ( renderContextData.currentOcclusionQuerySet ) renderContextData.currentOcclusionQuerySet.destroy();
			if ( renderContextData.currentOcclusionQueryBuffer ) renderContextData.currentOcclusionQueryBuffer.destroy();

			// Get a reference to the array of objects with queries. The renderContextData property
			// can be changed by another render pass before the buffer.mapAsyc() completes.
			renderContextData.currentOcclusionQuerySet = renderContextData.occlusionQuerySet;
			renderContextData.currentOcclusionQueryBuffer = renderContextData.occlusionQueryBuffer;
			renderContextData.currentOcclusionQueryObjects = renderContextData.occlusionQueryObjects;

			//

			occlusionQuerySet = device.createQuerySet( { type: 'occlusion', count: occlusionQueryCount } );

			renderContextData.occlusionQuerySet = occlusionQuerySet;
			renderContextData.occlusionQueryIndex = 0;
			renderContextData.occlusionQueryObjects = new Array( occlusionQueryCount );

			renderContextData.lastOcclusionObject = null;

		}

		let descriptor;

		if ( renderContext.textures === null ) {

			descriptor = this._getDefaultRenderPassDescriptor();

		} else {

			descriptor = this._getRenderPassDescriptor( renderContext );

		}

		this.initTimestampQuery( renderContext, descriptor );

		descriptor.occlusionQuerySet = occlusionQuerySet;

		const depthStencilAttachment = descriptor.depthStencilAttachment;

		if ( renderContext.textures !== null ) {

			const colorAttachments = descriptor.colorAttachments;

			for ( let i = 0; i < colorAttachments.length; i ++ ) {

				const colorAttachment = colorAttachments[ i ];

				if ( renderContext.clearColor ) {

					colorAttachment.clearValue = renderContext.clearColorValue;
					colorAttachment.loadOp = GPULoadOp.Clear;
					colorAttachment.storeOp = GPUStoreOp.Store;

				} else {

					colorAttachment.loadOp = GPULoadOp.Load;
					colorAttachment.storeOp = GPUStoreOp.Store;

				}

			}

		} else {

			const colorAttachment = descriptor.colorAttachments[ 0 ];

			if ( renderContext.clearColor ) {

				colorAttachment.clearValue = renderContext.clearColorValue;
				colorAttachment.loadOp = GPULoadOp.Clear;
				colorAttachment.storeOp = GPUStoreOp.Store;

			} else {

				colorAttachment.loadOp = GPULoadOp.Load;
				colorAttachment.storeOp = GPUStoreOp.Store;

			}

		}

		//

		if ( renderContext.depth ) {

			if ( renderContext.clearDepth ) {

				depthStencilAttachment.depthClearValue = renderContext.clearDepthValue;
				depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			}

		}

		if ( renderContext.stencil ) {

			if ( renderContext.clearStencil ) {

				depthStencilAttachment.stencilClearValue = renderContext.clearStencilValue;
				depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			}

		}

		//

		const encoder = device.createCommandEncoder( { label: 'renderContext_' + renderContext.id } );
		const currentPass = encoder.beginRenderPass( descriptor );

		//

		renderContextData.descriptor = descriptor;
		renderContextData.encoder = encoder;
		renderContextData.currentPass = currentPass;
		renderContextData.currentSets = { attributes: {} };

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			currentPass.setScissorRect( x, renderContext.height - height - y, width, height );

		}

	}

	finishRender( renderContext ) {

		const renderContextData = this.get( renderContext );
		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

			renderContextData.currentPass.endOcclusionQuery();

		}

		renderContextData.currentPass.end();

		if ( occlusionQueryCount > 0 ) {

			const bufferSize = occlusionQueryCount * 8; // 8 byte entries for query results

			//

			let queryResolveBuffer = this.occludedResolveCache.get( bufferSize );

			if ( queryResolveBuffer === undefined ) {

				queryResolveBuffer = this.device.createBuffer(
					{
						size: bufferSize,
						usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
					}
				);

				this.occludedResolveCache.set( bufferSize, queryResolveBuffer );

			}

			//

			const readBuffer = this.device.createBuffer(
				{
					size: bufferSize,
					usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
				}
			);

			// two buffers required here - WebGPU doesn't allow usage of QUERY_RESOLVE & MAP_READ to be combined
			renderContextData.encoder.resolveQuerySet( renderContextData.occlusionQuerySet, 0, occlusionQueryCount, queryResolveBuffer, 0 );
			renderContextData.encoder.copyBufferToBuffer( queryResolveBuffer, 0, readBuffer, 0, bufferSize );

			renderContextData.occlusionQueryBuffer = readBuffer;

			//

			this.resolveOccludedAsync( renderContext );

		}

		this.prepareTimestampBuffer( renderContext, renderContextData.encoder );

		this.device.queue.submit( [ renderContextData.encoder.finish() ] );


		//

		if ( renderContext.textures !== null ) {

			const textures = renderContext.textures;

			for ( let i = 0; i < textures.length; i ++ ) {

				const texture = textures[ i ];

				if ( texture.generateMipmaps === true ) {

					this.textureUtils.generateMipmaps( texture );

				}

			}

		}

	}

	isOccluded( renderContext, object ) {

		const renderContextData = this.get( renderContext );

		return renderContextData.occluded && renderContextData.occluded.has( object );

	}

	async resolveOccludedAsync( renderContext ) {

		const renderContextData = this.get( renderContext );

		// handle occlusion query results

		const { currentOcclusionQueryBuffer, currentOcclusionQueryObjects } = renderContextData;

		if ( currentOcclusionQueryBuffer && currentOcclusionQueryObjects ) {

			const occluded = new WeakSet();

			renderContextData.currentOcclusionQueryObjects = null;
			renderContextData.currentOcclusionQueryBuffer = null;

			await currentOcclusionQueryBuffer.mapAsync( GPUMapMode.READ );

			const buffer = currentOcclusionQueryBuffer.getMappedRange();
			const results = new BigUint64Array( buffer );

			for ( let i = 0; i < currentOcclusionQueryObjects.length; i ++ ) {

				if ( results[ i ] !== 0n ) {

					occluded.add( currentOcclusionQueryObjects[ i ] );

				}

			}

			currentOcclusionQueryBuffer.destroy();

			renderContextData.occluded = occluded;

		}

	}

	updateViewport( renderContext ) {

		const { currentPass } = this.get( renderContext );
		const { x, y, width, height, minDepth, maxDepth } = renderContext.viewportValue;

		currentPass.setViewport( x, renderContext.height - height - y, width, height, minDepth, maxDepth );

	}

	clear( color, depth, stencil, renderTargetData = null ) {

		const device = this.device;
		const renderer = this.renderer;

		let colorAttachments = [];

		let depthStencilAttachment;
		let clearValue;

		let supportsDepth;
		let supportsStencil;

		if ( color ) {

			const clearColor = this.getClearColor();

			clearValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearColor.a };

		}

		if ( renderTargetData === null ) {

			supportsDepth = renderer.depth;
			supportsStencil = renderer.stencil;

			const descriptor = this._getDefaultRenderPassDescriptor();

			if ( color ) {

				colorAttachments = descriptor.colorAttachments;

				const colorAttachment = colorAttachments[ 0 ];

				colorAttachment.clearValue = clearValue;
				colorAttachment.loadOp = GPULoadOp.Clear;
				colorAttachment.storeOp = GPUStoreOp.Store;

			}

			if ( supportsDepth || supportsStencil ) {

				depthStencilAttachment = descriptor.depthStencilAttachment;

			}

		} else {

			supportsDepth = renderTargetData.depth;
			supportsStencil = renderTargetData.stencil;

			if ( color ) {

				for ( const texture of renderTargetData.textures ) {

					const textureData = this.get( texture );
					const textureView = textureData.texture.createView();

					let view, resolveTarget;

					if ( textureData.msaaTexture !== undefined ) {

						view = textureData.msaaTexture.createView();
						resolveTarget = textureView;

					} else {

						view = textureView;
						resolveTarget = undefined;

					}

					colorAttachments.push( {
						view,
						resolveTarget,
						clearValue,
						loadOp: GPULoadOp.Clear,
						storeOp: GPUStoreOp.Store
					} );

				}

			}

			if ( supportsDepth || supportsStencil ) {

				const depthTextureData = this.get( renderTargetData.depthTexture );

				depthStencilAttachment = {
					view: depthTextureData.texture.createView()
				};

			}

		}

		//

		if ( supportsDepth ) {

			if ( depth ) {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.depthClearValue = renderer.getClearDepth();
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			}

		}

		//

		if ( supportsStencil ) {

			if ( stencil ) {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.stencilClearValue = renderer.getClearStencil();
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			}

		}

		//

		const encoder = device.createCommandEncoder( {} );
		const currentPass = encoder.beginRenderPass( {
			colorAttachments,
			depthStencilAttachment
		} );

		currentPass.end();

		device.queue.submit( [ encoder.finish() ] );

	}

	// compute

	beginCompute( computeGroup ) {

		const groupGPU = this.get( computeGroup );


		const descriptor = {};

		this.initTimestampQuery( computeGroup, descriptor );

		groupGPU.cmdEncoderGPU = this.device.createCommandEncoder();

		groupGPU.passEncoderGPU = groupGPU.cmdEncoderGPU.beginComputePass( descriptor );

	}

	compute( computeGroup, computeNode, bindings, pipeline ) {

		const { passEncoderGPU } = this.get( computeGroup );

		// pipeline

		const pipelineGPU = this.get( pipeline ).pipeline;
		passEncoderGPU.setPipeline( pipelineGPU );

		// bind group

		const bindGroupGPU = this.get( bindings ).group;
		passEncoderGPU.setBindGroup( 0, bindGroupGPU );

		passEncoderGPU.dispatchWorkgroups( computeNode.dispatchCount );

	}

	finishCompute( computeGroup ) {

		const groupData = this.get( computeGroup );

		groupData.passEncoderGPU.end();

		this.prepareTimestampBuffer( computeGroup, groupData.cmdEncoderGPU );

		this.device.queue.submit( [ groupData.cmdEncoderGPU.finish() ] );

	}

	// render object

	draw( renderObject, info ) {

		const { object, geometry, context, pipeline } = renderObject;

		const bindingsData = this.get( renderObject.getBindings() );
		const contextData = this.get( context );
		const pipelineGPU = this.get( pipeline ).pipeline;
		const currentSets = contextData.currentSets;

		// pipeline

		const passEncoderGPU = contextData.currentPass;

		if ( currentSets.pipeline !== pipelineGPU ) {

			passEncoderGPU.setPipeline( pipelineGPU );

			currentSets.pipeline = pipelineGPU;

		}

		// bind group

		const bindGroupGPU = bindingsData.group;
		passEncoderGPU.setBindGroup( 0, bindGroupGPU );

		// attributes

		const index = renderObject.getIndex();

		const hasIndex = ( index !== null );

		// index

		if ( hasIndex === true ) {

			if ( currentSets.index !== index ) {

				const buffer = this.get( index ).buffer;
				const indexFormat = ( index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

				passEncoderGPU.setIndexBuffer( buffer, indexFormat );

				currentSets.index = index;

			}

		}

		// vertex buffers

		const vertexBuffers = renderObject.getVertexBuffers();

		for ( let i = 0, l = vertexBuffers.length; i < l; i ++ ) {

			const vertexBuffer = vertexBuffers[ i ];

			if ( currentSets.attributes[ i ] !== vertexBuffer ) {

				const buffer = this.get( vertexBuffer ).buffer;
				passEncoderGPU.setVertexBuffer( i, buffer );

				currentSets.attributes[ i ] = vertexBuffer;

			}

		}

		// occlusion queries - handle multiple consecutive draw calls for an object

		if ( contextData.occlusionQuerySet !== undefined ) {

			const lastObject = contextData.lastOcclusionObject;

			if ( lastObject !== object ) {

				if ( lastObject !== null && lastObject.occlusionTest === true ) {

					passEncoderGPU.endOcclusionQuery();
					contextData.occlusionQueryIndex ++;

				}

				if ( object.occlusionTest === true ) {

					passEncoderGPU.beginOcclusionQuery( contextData.occlusionQueryIndex );
					contextData.occlusionQueryObjects[ contextData.occlusionQueryIndex ] = object;

				}

				contextData.lastOcclusionObject = object;

			}

		}

		// draw

		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		const instanceCount = this.getInstanceCount( renderObject );
		if ( instanceCount === 0 ) return;

		if ( hasIndex === true ) {

			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			passEncoderGPU.drawIndexed( indexCount, instanceCount, firstVertex, 0, 0 );

			info.update( object, indexCount, instanceCount );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			passEncoderGPU.draw( vertexCount, instanceCount, firstVertex, 0 );

			info.update( object, vertexCount, instanceCount );

		}

	}

	// cache key

	needsRenderUpdate( renderObject ) {

		const data = this.get( renderObject );

		const { object, material } = renderObject;

		const utils = this.utils;

		const sampleCount = utils.getSampleCount( renderObject.context );
		const colorSpace = utils.getCurrentColorSpace( renderObject.context );
		const colorFormat = utils.getCurrentColorFormat( renderObject.context );
		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderObject.context );
		const primitiveTopology = utils.getPrimitiveTopology( object, material );

		let needsUpdate = false;

		if ( data.material !== material || data.materialVersion !== material.version ||
			data.transparent !== material.transparent || data.blending !== material.blending || data.premultipliedAlpha !== material.premultipliedAlpha ||
			data.blendSrc !== material.blendSrc || data.blendDst !== material.blendDst || data.blendEquation !== material.blendEquation ||
			data.blendSrcAlpha !== material.blendSrcAlpha || data.blendDstAlpha !== material.blendDstAlpha || data.blendEquationAlpha !== material.blendEquationAlpha ||
			data.colorWrite !== material.colorWrite || data.depthWrite !== material.depthWrite || data.depthTest !== material.depthTest || data.depthFunc !== material.depthFunc ||
			data.stencilWrite !== material.stencilWrite || data.stencilFunc !== material.stencilFunc ||
			data.stencilFail !== material.stencilFail || data.stencilZFail !== material.stencilZFail || data.stencilZPass !== material.stencilZPass ||
			data.stencilFuncMask !== material.stencilFuncMask || data.stencilWriteMask !== material.stencilWriteMask ||
			data.side !== material.side || data.alphaToCoverage !== material.alphaToCoverage ||
			data.sampleCount !== sampleCount || data.colorSpace !== colorSpace ||
			data.colorFormat !== colorFormat || data.depthStencilFormat !== depthStencilFormat ||
			data.primitiveTopology !== primitiveTopology ||
			data.clippingContextVersion !== renderObject.clippingContextVersion
		) {

			data.material = material; data.materialVersion = material.version;
			data.transparent = material.transparent; data.blending = material.blending; data.premultipliedAlpha = material.premultipliedAlpha;
			data.blendSrc = material.blendSrc; data.blendDst = material.blendDst; data.blendEquation = material.blendEquation;
			data.blendSrcAlpha = material.blendSrcAlpha; data.blendDstAlpha = material.blendDstAlpha; data.blendEquationAlpha = material.blendEquationAlpha;
			data.colorWrite = material.colorWrite;
			data.depthWrite = material.depthWrite; data.depthTest = material.depthTest; data.depthFunc = material.depthFunc;
			data.stencilWrite = material.stencilWrite; data.stencilFunc = material.stencilFunc;
			data.stencilFail = material.stencilFail; data.stencilZFail = material.stencilZFail; data.stencilZPass = material.stencilZPass;
			data.stencilFuncMask = material.stencilFuncMask; data.stencilWriteMask = material.stencilWriteMask;
			data.side = material.side; data.alphaToCoverage = material.alphaToCoverage;
			data.sampleCount = sampleCount;
			data.colorSpace = colorSpace;
			data.colorFormat = colorFormat;
			data.depthStencilFormat = depthStencilFormat;
			data.primitiveTopology = primitiveTopology;
			data.clippingContextVersion = renderObject.clippingContextVersion;

			needsUpdate = true;

		}

		return needsUpdate;

	}

	getRenderCacheKey( renderObject ) {

		const { object, material } = renderObject;

		const utils = this.utils;
		const renderContext = renderObject.context;

		return [
			material.transparent, material.blending, material.premultipliedAlpha,
			material.blendSrc, material.blendDst, material.blendEquation,
			material.blendSrcAlpha, material.blendDstAlpha, material.blendEquationAlpha,
			material.colorWrite,
			material.depthWrite, material.depthTest, material.depthFunc,
			material.stencilWrite, material.stencilFunc,
			material.stencilFail, material.stencilZFail, material.stencilZPass,
			material.stencilFuncMask, material.stencilWriteMask,
			material.side,
			utils.getSampleCount( renderContext ),
			utils.getCurrentColorSpace( renderContext ), utils.getCurrentColorFormat( renderContext ), utils.getCurrentDepthStencilFormat( renderContext ),
			utils.getPrimitiveTopology( object, material ),
			renderObject.clippingContextVersion
		].join();

	}

	// textures

	createSampler( texture ) {

		this.textureUtils.createSampler( texture );

	}

	destroySampler( texture ) {

		this.textureUtils.destroySampler( texture );

	}

	createDefaultTexture( texture ) {

		this.textureUtils.createDefaultTexture( texture );

	}

	createTexture( texture, options ) {

		this.textureUtils.createTexture( texture, options );

	}

	updateTexture( texture, options ) {

		this.textureUtils.updateTexture( texture, options );

	}

	generateMipmaps( texture ) {

		this.textureUtils.generateMipmaps( texture );

	}

	destroyTexture( texture ) {

		this.textureUtils.destroyTexture( texture );

	}

	copyTextureToBuffer( texture, x, y, width, height ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height );

	}


	initTimestampQuery( renderContext, descriptor ) {

		if ( ! this.hasFeature( GPUFeatureName.TimestampQuery ) || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( ! renderContextData.timeStampQuerySet ) {

			// Create a GPUQuerySet which holds 2 timestamp query results: one for the
			// beginning and one for the end of compute pass execution.
			const timeStampQuerySet = this.device.createQuerySet( { type: 'timestamp', count: 2 } );

			const timestampWrites = {
				querySet: timeStampQuerySet,
				beginningOfPassWriteIndex: 0, // Write timestamp in index 0 when pass begins.
				endOfPassWriteIndex: 1, // Write timestamp in index 1 when pass ends.
			};
			Object.assign( descriptor, {
				timestampWrites,
			} );
			renderContextData.timeStampQuerySet = timeStampQuerySet;

		}

	}

	// timestamp utils

	prepareTimestampBuffer( renderContext, encoder ) {

		if ( ! this.hasFeature( GPUFeatureName.TimestampQuery ) || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		const size = 2 * BigInt64Array.BYTES_PER_ELEMENT;
		const resolveBuffer = this.device.createBuffer( {
			size,
			usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
		} );

		const resultBuffer = this.device.createBuffer( {
			size,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		} );

		encoder.resolveQuerySet( renderContextData.timeStampQuerySet, 0, 2, resolveBuffer, 0 );
		encoder.copyBufferToBuffer( resolveBuffer, 0, resultBuffer, 0, size );

		renderContextData.currentTimestampQueryBuffer = resultBuffer;

	}

	async resolveTimestampAsync( renderContext, type = 'render' ) {

		if ( ! this.hasFeature( GPUFeatureName.TimestampQuery ) || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		// handle timestamp query results

		const { currentTimestampQueryBuffer } = renderContextData;

		if ( currentTimestampQueryBuffer ) {

			renderContextData.currentTimestampQueryBuffer = null;

			await currentTimestampQueryBuffer.mapAsync( GPUMapMode.READ );

			const times = new BigUint64Array( currentTimestampQueryBuffer.getMappedRange() );

			const duration = Number( times[ 1 ] - times[ 0 ] ) / 1000000;
			// console.log( `Compute ${type} duration: ${Number( times[ 1 ] - times[ 0 ] ) / 1000000}ms` );
			this.renderer.info.updateTimestamp( type, duration );

			currentTimestampQueryBuffer.unmap();

		}

	}

	// node builder

	createNodeBuilder( object, renderer, scene = null ) {

		return new WGSLNodeBuilder( object, renderer, scene );

	}

	// program

	createProgram( program ) {

		const programGPU = this.get( program );

		programGPU.module = {
			module: this.device.createShaderModule( { code: program.code, label: program.stage } ),
			entryPoint: 'main'
		};

	}

	destroyProgram( program ) {

		this.delete( program );

	}

	// pipelines

	createRenderPipeline( renderObject, promises ) {

		this.pipelineUtils.createRenderPipeline( renderObject, promises );

	}

	createComputePipeline( computePipeline, bindings ) {

		this.pipelineUtils.createComputePipeline( computePipeline, bindings );

	}

	// bindings

	createBindings( bindings ) {

		this.bindingUtils.createBindings( bindings );

	}

	updateBindings( bindings ) {

		this.bindingUtils.createBindings( bindings );

	}

	updateBinding( binding ) {

		this.bindingUtils.updateBinding( binding );

	}

	// attributes

	createIndexAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	createAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	createStorageAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	updateAttribute( attribute ) {

		this.attributeUtils.updateAttribute( attribute );

	}

	destroyAttribute( attribute ) {

		this.attributeUtils.destroyAttribute( attribute );

	}

	// canvas

	updateSize() {

		this.colorBuffer = this.textureUtils.getColorBuffer();
		this.defaultRenderPassdescriptor = null;

	}

	// utils public

	getMaxAnisotropy() {

		return 16;

	}

	async hasFeatureAsync( name ) {

		const adapter = this.adapter || await WebGPU.getStaticAdapter();

		//

		return adapter.features.has( name );

	}

	hasFeature( name ) {

		if ( ! this.adapter ) {

			console.warn( 'WebGPUBackend: WebGPU adapter has not been initialized yet. Please use detectSupportAsync instead' );

			return false;

		}

		return this.adapter.features.has( name );

	}

	copyFramebufferToTexture( texture, renderContext ) {

		const renderContextData = this.get( renderContext );

		const { encoder, descriptor } = renderContextData;

		let sourceGPU = null;

		if ( renderContext.renderTarget ) {

			if ( texture.isDepthTexture ) {

				sourceGPU = this.get( renderContext.depthTexture ).texture;

			} else {

				sourceGPU = this.get( renderContext.textures[ 0 ] ).texture;

			}

		} else {

			if ( texture.isDepthTexture ) {

				sourceGPU = this.textureUtils.getDepthBuffer( renderContext.depth, renderContext.stencil );

			} else {

				sourceGPU = this.context.getCurrentTexture();

			}

		}

		const destinationGPU = this.get( texture ).texture;

		if ( sourceGPU.format !== destinationGPU.format ) {

			console.error( 'WebGPUBackend: copyFramebufferToTexture: Source and destination formats do not match.', sourceGPU.format, destinationGPU.format );

			return;

		}

		renderContextData.currentPass.end();

		encoder.copyTextureToTexture(
			{
				texture: sourceGPU,
				origin: { x: 0, y: 0, z: 0 }
			},
			{
				texture: destinationGPU
			},
			[
				texture.image.width,
				texture.image.height
			]
		);

		if ( texture.generateMipmaps ) this.textureUtils.generateMipmaps( texture );

		descriptor.colorAttachments[ 0 ].loadOp = GPULoadOp.Load;
		if ( renderContext.depth ) descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
		if ( renderContext.stencil ) descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

		renderContextData.currentPass = encoder.beginRenderPass( descriptor );
		renderContextData.currentSets = { attributes: {} };

	}

}

/*
const debugHandler = {

	get: function ( target, name ) {

		// Add |update
		if ( /^(create|destroy)/.test( name ) ) console.log( 'WebGPUBackend.' + name );

		return target[ name ];

	}

};
*/
class WebGPURenderer extends Renderer {

	constructor( parameters = {} ) {

		let BackendClass;

		if ( parameters.forceWebGL ) {

			BackendClass = WebGLBackend;

		} else if ( WebGPU.isAvailable() ) {

			BackendClass = WebGPUBackend;

		} else {

			BackendClass = WebGLBackend;

			console.warn( 'THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

		}

		const backend = new BackendClass( parameters );

		//super( new Proxy( backend, debugHandler ) );
		super( backend, parameters );

		this.isWebGPURenderer = true;

	}

}

export { WebGPURenderer as default };
