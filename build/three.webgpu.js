/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
import { Color, Vector2, Vector3, Vector4, Matrix3, Matrix4, EventDispatcher, MathUtils, ColorManagement, SRGBTransfer, NoToneMapping, StaticDrawUsage, InterleavedBuffer, DynamicDrawUsage, InterleavedBufferAttribute, NoColorSpace, UnsignedIntType, IntType, WebGLCoordinateSystem, BackSide, CubeReflectionMapping, CubeRefractionMapping, WebGPUCoordinateSystem, TangentSpaceNormalMap, ObjectSpaceNormalMap, InstancedInterleavedBuffer, InstancedBufferAttribute, DataArrayTexture, FloatType, FramebufferTexture, LinearMipmapLinearFilter, DepthTexture, Material, NormalBlending, PointsMaterial, LineBasicMaterial, LineDashedMaterial, MeshNormalMaterial, WebGLCubeRenderTarget, BoxGeometry, NoBlending, Mesh, Scene, LinearFilter, CubeCamera, CubeTexture, EquirectangularReflectionMapping, EquirectangularRefractionMapping, AddOperation, MixOperation, MultiplyOperation, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, Texture, MeshStandardMaterial, MeshPhysicalMaterial, MeshToonMaterial, MeshMatcapMaterial, SpriteMaterial, ShadowMaterial, Uint32BufferAttribute, Uint16BufferAttribute, DoubleSide, DepthStencilFormat, DepthFormat, UnsignedInt248Type, UnsignedByteType, RenderTarget, Plane, Object3D, HalfFloatType, LinearMipMapLinearFilter, OrthographicCamera, BufferGeometry, Float32BufferAttribute, UVMapping, Euler, LinearSRGBColorSpace, LessCompare, VSMShadowMap, RGFormat, SphereGeometry, BufferAttribute, CubeUVReflectionMapping, PerspectiveCamera, RGBAFormat, LinearMipmapNearestFilter, NearestMipmapLinearFilter, Float16BufferAttribute, REVISION, SRGBColorSpace, PCFShadowMap as PCFShadowMap$1, FrontSide, Frustum, DataTexture, RedIntegerFormat, RedFormat, RGIntegerFormat, RGBIntegerFormat, RGBFormat, RGBAIntegerFormat, UnsignedShortType, ByteType, ShortType, createCanvasElement, AddEquation, SubtractEquation, ReverseSubtractEquation, ZeroFactor, OneFactor, SrcColorFactor, SrcAlphaFactor, SrcAlphaSaturateFactor, DstColorFactor, DstAlphaFactor, OneMinusSrcColorFactor, OneMinusSrcAlphaFactor, OneMinusDstColorFactor, OneMinusDstAlphaFactor, CullFaceNone, CullFaceBack, CullFaceFront, CustomBlending, MultiplyBlending, SubtractiveBlending, AdditiveBlending, NotEqualDepth, GreaterDepth, GreaterEqualDepth, EqualDepth, LessEqualDepth, LessDepth, AlwaysDepth, NeverDepth, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedInt5999Type, AlphaFormat, LuminanceFormat, LuminanceAlphaFormat, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGB_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_PVRTC_2BPPV1_Format, RGB_ETC1_Format, RGB_ETC2_Format, RGBA_ETC2_EAC_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_BPTC_Format, RED_RGTC1_Format, SIGNED_RED_RGTC1_Format, RED_GREEN_RGTC2_Format, SIGNED_RED_GREEN_RGTC2_Format, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipmapNearestFilter, NeverCompare, AlwaysCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare, warnOnce, NotEqualStencilFunc, GreaterStencilFunc, GreaterEqualStencilFunc, EqualStencilFunc, LessEqualStencilFunc, LessStencilFunc, AlwaysStencilFunc, NeverStencilFunc, DecrementWrapStencilOp, IncrementWrapStencilOp, DecrementStencilOp, IncrementStencilOp, InvertStencilOp, ReplaceStencilOp, ZeroStencilOp, KeepStencilOp, MaxEquation, MinEquation, SpotLight, PointLight, DirectionalLight, RectAreaLight, AmbientLight, HemisphereLight, LightProbe, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping, Group, Loader, FileLoader, MaterialLoader, ObjectLoader } from './three.core.js';
export { AdditiveAnimationBlendMode, AnimationAction, AnimationClip, AnimationLoader, AnimationMixer, AnimationObjectGroup, AnimationUtils, ArcCurve, ArrayCamera, ArrowHelper, AttachedBindMode, Audio, AudioAnalyser, AudioContext, AudioListener, AudioLoader, AxesHelper, BasicDepthPacking, BasicShadowMap, BatchedMesh, Bone, BooleanKeyframeTrack, Box2, Box3, Box3Helper, BoxHelper, BufferGeometryLoader, Cache, Camera, CameraHelper, CanvasTexture, CapsuleGeometry, CatmullRomCurve3, CircleGeometry, Clock, ColorKeyframeTrack, CompressedArrayTexture, CompressedCubeTexture, CompressedTexture, CompressedTextureLoader, ConeGeometry, ConstantAlphaFactor, ConstantColorFactor, Controls, CubeTextureLoader, CubicBezierCurve, CubicBezierCurve3, CubicInterpolant, CullFaceFrontBack, Curve, CurvePath, CustomToneMapping, CylinderGeometry, Cylindrical, Data3DTexture, DataTextureLoader, DataUtils, DefaultLoadingManager, DetachedBindMode, DirectionalLightHelper, DiscreteInterpolant, DodecahedronGeometry, DynamicCopyUsage, DynamicReadUsage, EdgesGeometry, EllipseCurve, ExtrudeGeometry, Fog, FogExp2, GLBufferAttribute, GLSL1, GLSL3, GridHelper, HemisphereLightHelper, IcosahedronGeometry, ImageBitmapLoader, ImageLoader, ImageUtils, InstancedBufferGeometry, InstancedMesh, Int16BufferAttribute, Int32BufferAttribute, Int8BufferAttribute, Interpolant, InterpolateDiscrete, InterpolateLinear, InterpolateSmooth, KeyframeTrack, LOD, LatheGeometry, Layers, Light, Line, Line3, LineCurve, LineCurve3, LineLoop, LineSegments, LinearInterpolant, LinearMipMapNearestFilter, LinearTransfer, LoaderUtils, LoadingManager, LoopOnce, LoopPingPong, LoopRepeat, MOUSE, Matrix2, MeshDepthMaterial, MeshDistanceMaterial, NearestMipMapLinearFilter, NearestMipMapNearestFilter, NormalAnimationBlendMode, NumberKeyframeTrack, OctahedronGeometry, OneMinusConstantAlphaFactor, OneMinusConstantColorFactor, PCFSoftShadowMap, Path, PlaneGeometry, PlaneHelper, PointLightHelper, Points, PolarGridHelper, PolyhedronGeometry, PositionalAudio, PropertyBinding, PropertyMixer, QuadraticBezierCurve, QuadraticBezierCurve3, Quaternion, QuaternionKeyframeTrack, QuaternionLinearInterpolant, RGBADepthPacking, RGBDepthPacking, RGB_BPTC_SIGNED_Format, RGB_BPTC_UNSIGNED_Format, RGDepthPacking, RawShaderMaterial, Ray, Raycaster, RingGeometry, ShaderMaterial, Shape, ShapeGeometry, ShapePath, ShapeUtils, Skeleton, SkeletonHelper, SkinnedMesh, Source, Sphere, Spherical, SphericalHarmonics3, SplineCurve, SpotLightHelper, Sprite, StaticCopyUsage, StaticReadUsage, StereoCamera, StreamCopyUsage, StreamDrawUsage, StreamReadUsage, StringKeyframeTrack, TOUCH, TetrahedronGeometry, TextureLoader, TextureUtils, TorusGeometry, TorusKnotGeometry, Triangle, TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode, TubeGeometry, Uint8BufferAttribute, Uint8ClampedBufferAttribute, Uniform, UniformsGroup, VectorKeyframeTrack, VideoTexture, WebGL3DRenderTarget, WebGLArrayRenderTarget, WebGLMultipleRenderTargets, WebGLRenderTarget, WireframeGeometry, WrapAroundEnding, ZeroCurvatureEnding, ZeroSlopeEnding } from './three.core.js';

const refreshUniforms = [
	'alphaMap',
	'alphaTest',
	'anisotropy',
	'anisotropyMap',
	'anisotropyRotation',
	'aoMap',
	'attenuationColor',
	'attenuationDistance',
	'bumpMap',
	'clearcoat',
	'clearcoatMap',
	'clearcoatNormalMap',
	'clearcoatNormalScale',
	'clearcoatRoughness',
	'color',
	'dispersion',
	'displacementMap',
	'emissive',
	'emissiveMap',
	'envMap',
	'gradientMap',
	'ior',
	'iridescence',
	'iridescenceIOR',
	'iridescenceMap',
	'iridescenceThicknessMap',
	'lightMap',
	'map',
	'matcap',
	'metalness',
	'metalnessMap',
	'normalMap',
	'normalScale',
	'opacity',
	'roughness',
	'roughnessMap',
	'sheen',
	'sheenColor',
	'sheenColorMap',
	'sheenRoughnessMap',
	'shininess',
	'specular',
	'specularColor',
	'specularColorMap',
	'specularIntensity',
	'specularIntensityMap',
	'specularMap',
	'thickness',
	'transmission',
	'transmissionMap'
];

class NodeMaterialObserver {

	constructor( builder ) {

		this.renderObjects = new WeakMap();
		this.hasNode = this.containsNode( builder );
		this.hasAnimation = builder.object.isSkinnedMesh === true;
		this.refreshUniforms = refreshUniforms;
		this.renderId = 0;

	}

	firstInitialization( renderObject ) {

		const hasInitialized = this.renderObjects.has( renderObject );

		if ( hasInitialized === false ) {

			this.getRenderObjectData( renderObject );

			return true;

		}

		return false;

	}

	getRenderObjectData( renderObject ) {

		let data = this.renderObjects.get( renderObject );

		if ( data === undefined ) {

			const { geometry, material } = renderObject;

			data = {
				material: this.getMaterialData( material ),
				geometry: {
					attributes: this.getAttributesData( geometry.attributes ),
					indexVersion: geometry.index ? geometry.index.version : null,
					drawRange: { start: geometry.drawRange.start, count: geometry.drawRange.count }
				},
				worldMatrix: renderObject.object.matrixWorld.clone()
			};

			if ( renderObject.object.center ) {

				data.center = renderObject.object.center.clone();

			}

			if ( renderObject.object.morphTargetInfluences ) {

				data.morphTargetInfluences = renderObject.object.morphTargetInfluences.slice();

			}

			if ( renderObject.bundle !== null ) {

				data.version = renderObject.bundle.version;

			}

			if ( data.material.transmission > 0 ) {

				const { width, height } = renderObject.context;

				data.bufferWidth = width;
				data.bufferHeight = height;

			}

			this.renderObjects.set( renderObject, data );

		}

		return data;

	}

	getAttributesData( attributes ) {

		const attributesData = {};

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			attributesData[ name ] = {
				version: attribute.version
			};

		}

		return attributesData;

	}

	containsNode( builder ) {

		const material = builder.material;

		for ( const property in material ) {

			if ( material[ property ] && material[ property ].isNode )
				return true;

		}

		if ( builder.renderer.nodes.modelViewMatrix !== null || builder.renderer.nodes.modelNormalViewMatrix !== null )
			return true;

		return false;

	}

	getMaterialData( material ) {

		const data = {};

		for ( const property of this.refreshUniforms ) {

			const value = material[ property ];

			if ( value === null || value === undefined ) continue;

			if ( typeof value === 'object' && value.clone !== undefined ) {

				if ( value.isTexture === true ) {

					data[ property ] = { id: value.id, version: value.version };

				} else {

					data[ property ] = value.clone();

				}

			} else {

				data[ property ] = value;

			}

		}

		return data;

	}

	equals( renderObject ) {

		const { object, material, geometry } = renderObject;

		const renderObjectData = this.getRenderObjectData( renderObject );

		// world matrix

		if ( renderObjectData.worldMatrix.equals( object.matrixWorld ) !== true ) {

			renderObjectData.worldMatrix.copy( object.matrixWorld );

			return false;

		}

		// material

		const materialData = renderObjectData.material;

		for ( const property in materialData ) {

			const value = materialData[ property ];
			const mtlValue = material[ property ];

			if ( value.equals !== undefined ) {

				if ( value.equals( mtlValue ) === false ) {

					value.copy( mtlValue );

					return false;

				}

			} else if ( mtlValue.isTexture === true ) {

				if ( value.id !== mtlValue.id || value.version !== mtlValue.version ) {

					value.id = mtlValue.id;
					value.version = mtlValue.version;

					return false;

				}

			} else if ( value !== mtlValue ) {

				materialData[ property ] = mtlValue;

				return false;

			}

		}

		if ( materialData.transmission > 0 ) {

			const { width, height } = renderObject.context;

			if ( renderObjectData.bufferWidth !== width || renderObjectData.bufferHeight !== height ) {

				renderObjectData.bufferWidth = width;
				renderObjectData.bufferHeight = height;

				return false;

			}

		}

		// geometry

		const storedGeometryData = renderObjectData.geometry;
		const attributes = geometry.attributes;
		const storedAttributes = storedGeometryData.attributes;

		const storedAttributeNames = Object.keys( storedAttributes );
		const currentAttributeNames = Object.keys( attributes );

		if ( storedAttributeNames.length !== currentAttributeNames.length ) {

			renderObjectData.geometry.attributes = this.getAttributesData( attributes );
			return false;

		}

		// Compare each attribute
		for ( const name of storedAttributeNames ) {

			const storedAttributeData = storedAttributes[ name ];
			const attribute = attributes[ name ];

			if ( attribute === undefined ) {

				// Attribute was removed
				delete storedAttributes[ name ];
				return false;

			}

			if ( storedAttributeData.version !== attribute.version ) {

				storedAttributeData.version = attribute.version;
				return false;

			}

		}

		// Check index
		const index = geometry.index;
		const storedIndexVersion = storedGeometryData.indexVersion;
		const currentIndexVersion = index ? index.version : null;

		if ( storedIndexVersion !== currentIndexVersion ) {

			storedGeometryData.indexVersion = currentIndexVersion;
			return false;

		}

		// Check drawRange
		if ( storedGeometryData.drawRange.start !== geometry.drawRange.start || storedGeometryData.drawRange.count !== geometry.drawRange.count ) {

			storedGeometryData.drawRange.start = geometry.drawRange.start;
			storedGeometryData.drawRange.count = geometry.drawRange.count;
			return false;

		}

		// morph targets

		if ( renderObjectData.morphTargetInfluences ) {

			let morphChanged = false;

			for ( let i = 0; i < renderObjectData.morphTargetInfluences.length; i ++ ) {

				if ( renderObjectData.morphTargetInfluences[ i ] !== object.morphTargetInfluences[ i ] ) {

					morphChanged = true;

				}

			}

			if ( morphChanged ) return true;

		}

		// center

		if ( renderObjectData.center ) {

			if ( renderObjectData.center.equals( object.center ) === false ) {

				renderObjectData.center.copy( object.center );

				return true;

			}

		}

		// bundle

		if ( renderObject.bundle !== null ) {

			renderObjectData.version = renderObject.bundle.version;

		}

		return true;

	}

	needsRefresh( renderObject, nodeFrame ) {

		if ( this.hasNode || this.hasAnimation || this.firstInitialization( renderObject ) )
			return true;

		const { renderId } = nodeFrame;

		if ( this.renderId !== renderId ) {

			this.renderId = renderId;

			return true;

		}

		const isStatic = renderObject.object.static === true;
		const isBundle = renderObject.bundle !== null && renderObject.bundle.static === true && this.getRenderObjectData( renderObject ).version === renderObject.bundle.version;

		if ( isStatic || isBundle )
			return false;

		const notEqual = this.equals( renderObject ) !== true;

		return notEqual;

	}

}

// cyrb53 (c) 2018 bryc (github.com/bryc). License: Public domain. Attribution appreciated.
// A fast and simple 64-bit (or 53-bit) string hash function with decent collision resistance.
// Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
// See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
function cyrb53( value, seed = 0 ) {

	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;

	if ( value instanceof Array ) {

		for ( let i = 0, val; i < value.length; i ++ ) {

			val = value[ i ];
			h1 = Math.imul( h1 ^ val, 2654435761 );
			h2 = Math.imul( h2 ^ val, 1597334677 );

		}

	} else {

		for ( let i = 0, ch; i < value.length; i ++ ) {

			ch = value.charCodeAt( i );
			h1 = Math.imul( h1 ^ ch, 2654435761 );
			h2 = Math.imul( h2 ^ ch, 1597334677 );

		}

	}

	h1 = Math.imul( h1 ^ ( h1 >>> 16 ), 2246822507 );
	h1 ^= Math.imul( h2 ^ ( h2 >>> 13 ), 3266489909 );
	h2 = Math.imul( h2 ^ ( h2 >>> 16 ), 2246822507 );
	h2 ^= Math.imul( h1 ^ ( h1 >>> 13 ), 3266489909 );

	return 4294967296 * ( 2097151 & h2 ) + ( h1 >>> 0 );

}

const hashString = ( str ) => cyrb53( str );
const hashArray = ( array ) => cyrb53( array );
const hash$1 = ( ...params ) => cyrb53( params );

function getCacheKey$1( object, force = false ) {

	const values = [];

	if ( object.isNode === true ) {

		values.push( object.id );
		object = object.getSelf();

	}

	for ( const { property, childNode } of getNodeChildren( object ) ) {

		values.push( values, cyrb53( property.slice( 0, - 4 ) ), childNode.getCacheKey( force ) );

	}

	return cyrb53( values );

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

var NodeUtils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	arrayBufferToBase64: arrayBufferToBase64,
	base64ToArrayBuffer: base64ToArrayBuffer,
	getCacheKey: getCacheKey$1,
	getNodeChildren: getNodeChildren,
	getValueFromType: getValueFromType,
	getValueType: getValueType,
	hash: hash$1,
	hashArray: hashArray,
	hashString: hashString
});

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

const NodeType = {
	BOOLEAN: 'bool',
	INTEGER: 'int',
	FLOAT: 'float',
	VECTOR2: 'vec2',
	VECTOR3: 'vec3',
	VECTOR4: 'vec4',
	MATRIX2: 'mat2',
	MATRIX3: 'mat3',
	MATRIX4: 'mat4'
};

const defaultShaderStages = [ 'fragment', 'vertex' ];
const defaultBuildStages = [ 'setup', 'analyze', 'generate' ];
const shaderStages = [ ...defaultShaderStages, 'compute' ];
const vectorComponents = [ 'x', 'y', 'z', 'w' ];

let _nodeId = 0;

class Node extends EventDispatcher {

	static get type() {

		return 'Node';

	}

	constructor( nodeType = null ) {

		super();

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.NONE;
		this.updateBeforeType = NodeUpdateType.NONE;
		this.updateAfterType = NodeUpdateType.NONE;

		this.uuid = MathUtils.generateUUID();

		this.version = 0;

		this._cacheKey = null;
		this._cacheKeyVersion = 0;

		this.global = false;

		this.isNode = true;

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

	}

	set needsUpdate( value ) {

		if ( value === true ) {

			this.version ++;

		}

	}

	get type() {

		return this.constructor.type;

	}

	onUpdate( callback, updateType ) {

		this.updateType = updateType;
		this.update = callback.bind( this.getSelf() );

		return this;

	}

	onFrameUpdate( callback ) {

		return this.onUpdate( callback, NodeUpdateType.FRAME );

	}

	onRenderUpdate( callback ) {

		return this.onUpdate( callback, NodeUpdateType.RENDER );

	}

	onObjectUpdate( callback ) {

		return this.onUpdate( callback, NodeUpdateType.OBJECT );

	}

	onReference( callback ) {

		this.updateReference = callback.bind( this.getSelf() );

		return this;

	}

	getSelf() {

		// Returns non-node object.

		return this.self || this;

	}

	updateReference( /*state*/ ) {

		return this;

	}

	isGlobal( /*builder*/ ) {

		return this.global;

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

	getCacheKey( force = false ) {

		force = force || this.version !== this._cacheKeyVersion;

		if ( force === true || this._cacheKey === null ) {

			this._cacheKey = getCacheKey$1( this, force );
			this._cacheKeyVersion = this.version;

		}

		return this._cacheKey;

	}

	getScope() {

		return this;

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

	getUpdateAfterType() {

		return this.updateAfterType;

	}

	getElementType( builder ) {

		const type = this.getNodeType( builder );
		const elementType = builder.getElementType( type );

		return elementType;

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

		let index = 0;

		for ( const childNode of this.getChildren() ) {

			nodeProperties[ 'node' + index ++ ] = childNode;

		}

		// return a outputNode if exists
		return null;

	}

	analyze( builder ) {

		const usageCount = builder.increaseUsage( this );

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

	updateAfter( /*frame*/ ) {

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

			this.updateReference( builder );

			const properties = builder.getNodeProperties( this );

			if ( properties.initialized !== true ) {

				const stackNodesBeforeSetup = builder.stack.nodes.length;

				properties.initialized = true;
				properties.outputNode = this.setup( builder );

				if ( properties.outputNode !== null && builder.stack.nodes.length !== stackNodesBeforeSetup ) ;

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

				if ( result === undefined ) {

					result = this.generate( builder ) || '';

					nodeData.snippet = result;

				} else if ( nodeData.flowCodes !== undefined && builder.context.nodeBlock !== undefined ) {

					builder.addFlowCodeHierarchy( this, builder.context.nodeBlock );

				}

				result = builder.format( result, type, output );

			} else {

				result = this.generate( builder, output ) || '';

			}

		}

		builder.removeChain( this );
		builder.addSequentialNode( this );

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

class ArrayElementNode extends Node {

	static get type() {

		return 'ArrayElementNode';

	} // @TODO: If extending from TempNode it breaks webgpu_compute

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

		this.isArrayElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getElementType( builder );

	}

	generate( builder ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

class ConvertNode extends Node {

	static get type() {

		return 'ConvertNode';

	}

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

class TempNode extends Node {

	static get type() {

		return 'TempNode';

	}

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

			if ( nodeData.propertyName !== undefined ) {

				return builder.format( nodeData.propertyName, type, output );

			} else if ( type !== 'void' && output !== 'void' && this.hasDependencies( builder ) ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, null, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

				return builder.format( nodeData.propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

class JoinNode extends TempNode {

	static get type() {

		return 'JoinNode';

	}

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

const stringVectorComponents = vectorComponents.join( '' );

class SplitNode extends Node {

	static get type() {

		return 'SplitNode';

	}

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

class SetNode extends TempNode {

	static get type() {

		return 'SetNode';

	}

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
		const targetType = builder.getTypeFromLength( components.length, targetNode.getNodeType( builder ) );

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

class FlipNode extends TempNode {

	static get type() {

		return 'FlipNode';

	}

	constructor( sourceNode, components ) {

		super();

		this.sourceNode = sourceNode;
		this.components = components;

	}

	getNodeType( builder ) {

		return this.sourceNode.getNodeType( builder );

	}

	generate( builder ) {

		const { components, sourceNode } = this;

		const sourceType = this.getNodeType( builder );
		const sourceSnippet = sourceNode.build( builder );

		const sourceCache = builder.getVarFromNode( this );
		const sourceProperty = builder.getPropertyName( sourceCache );

		builder.addLineFlowCode( sourceProperty + ' = ' + sourceSnippet, this );

		const length = builder.getTypeLength( sourceType );
		const snippetValues = [];

		let componentIndex = 0;

		for ( let i = 0; i < length; i ++ ) {

			const component = vectorComponents[ i ];

			if ( component === components[ componentIndex ] ) {

				snippetValues.push( '1.0 - ' + ( sourceProperty + '.' + component ) );

				componentIndex ++;

			} else {

				snippetValues.push( sourceProperty + '.' + component );

			}

		}

		return `${ builder.getType( sourceType ) }( ${ snippetValues.join( ', ' ) } )`;

	}

}

class InputNode extends Node {

	static get type() {

		return 'InputNode';

	}

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

class ConstNode extends InputNode {

	static get type() {

		return 'ConstNode';

	}

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

//

let currentStack = null;

const NodeElements = new Map();

function addMethodChaining( name, nodeElement ) {

	if ( NodeElements.has( name ) ) {

		console.warn( `Redefinition of method chaining ${ name }` );
		return;

	}

	if ( typeof nodeElement !== 'function' ) throw new Error( `Node element ${ name } is not a function` );

	NodeElements.set( name, nodeElement );

}

const parseSwizzle = ( props ) => props.replace( /r|s/g, 'x' ).replace( /g|t/g, 'y' ).replace( /b|p/g, 'z' ).replace( /a|q/g, 'w' );
const parseSwizzleAndSort = ( props ) => parseSwizzle( props ).split( '' ).sort().join( '' );

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

				// set properties ( swizzle ) and sort to xyzw sequence

				prop = parseSwizzleAndSort( prop.slice( 3 ).toLowerCase() );

				return ( value ) => nodeObject( new SetNode( node, prop, value ) );

			} else if ( /^flip[XYZWRGBASTPQ]{1,4}$/.test( prop ) === true ) {

				// set properties ( swizzle ) and sort to xyzw sequence

				prop = parseSwizzleAndSort( prop.slice( 4 ).toLowerCase() );

				return () => nodeObject( new FlipNode( nodeObject( node ), prop ) );

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

		return Fn( obj );

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

		return this.shaderNode.nodeType || this.getOutputNode( builder ).getNodeType( builder );

	}

	call( builder ) {

		const { shaderNode, inputNodes } = this;

		const properties = builder.getNodeProperties( shaderNode );
		if ( properties.onceOutput ) return properties.onceOutput;

		//

		let result = null;

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

			result = nodeObject( functionNode.call( inputNodes ) );

		} else {

			const jsFunc = shaderNode.jsFunc;
			const outputNode = inputNodes !== null ? jsFunc( inputNodes, builder ) : jsFunc( builder );

			result = nodeObject( outputNode );

		}

		if ( shaderNode.once ) {

			properties.onceOutput = result;

		}

		return result;

	}

	getOutputNode( builder ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode === null ) {

			properties.outputNode = this.setupOutput( builder );

		}

		return properties.outputNode;

	}

	setup( builder ) {

		return this.getOutputNode( builder );

	}

	setupOutput( builder ) {

		builder.addStack();

		builder.stack.outputNode = this.call( builder );

		return builder.removeStack();

	}

	generate( builder, output ) {

		const outputNode = this.getOutputNode( builder );

		return outputNode.build( builder, output );

	}

}

class ShaderNodeInternal extends Node {

	constructor( jsFunc, nodeType ) {

		super( nodeType );

		this.jsFunc = jsFunc;
		this.layout = null;

		this.global = true;

		this.once = false;

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

const defined = ( v ) => typeof v === 'object' && v !== null ? v.value : v; // TODO: remove boolean conversion and defined function

// utils

const getConstNodeType = ( value ) => ( value !== undefined && value !== null ) ? ( value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null ) ) : null;

// shader node base

function ShaderNode( jsFunc, nodeType ) {

	return new Proxy( new ShaderNodeInternal( jsFunc, nodeType ), shaderNodeHandler );

}

const nodeObject = ( val, altType = null ) => /* new */ ShaderNodeObject( val, altType );
const nodeObjects = ( val, altType = null ) => new ShaderNodeObjects( val, altType );
const nodeArray = ( val, altType = null ) => new ShaderNodeArray( val, altType );
const nodeProxy = ( ...params ) => new ShaderNodeProxy( ...params );
const nodeImmutable = ( ...params ) => new ShaderNodeImmutable( ...params );

const Fn = ( jsFunc, nodeType ) => {

	const shaderNode = new ShaderNode( jsFunc, nodeType );

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

	fn.once = () => {

		shaderNode.once = true;

		return fn;

	};

	return fn;

};

const tslFn = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.ShaderNode: tslFn() has been renamed to Fn().' );
	return Fn( ...params );

};

//

addMethodChaining( 'toGlobal', ( node ) => {

	node.global = true;

	return node;

} );

//

const setCurrentStack = ( stack ) => {

	currentStack = stack;

};

const getCurrentStack = () => currentStack;

const If = ( ...params ) => currentStack.If( ...params );

function append( node ) {

	if ( currentStack ) currentStack.add( node );

	return node;

}

addMethodChaining( 'append', append );

// types

const color = new ConvertType( 'color' );

const float = new ConvertType( 'float', cacheMaps.float );
const int = new ConvertType( 'int', cacheMaps.ints );
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
const mat3 = new ConvertType( 'mat3' );
const mat4 = new ConvertType( 'mat4' );

const string = ( value = '' ) => nodeObject( new ConstNode( value, 'string' ) );
const arrayBuffer = ( value ) => nodeObject( new ConstNode( value, 'ArrayBuffer' ) );

addMethodChaining( 'toColor', color );
addMethodChaining( 'toFloat', float );
addMethodChaining( 'toInt', int );
addMethodChaining( 'toUint', uint );
addMethodChaining( 'toBool', bool );
addMethodChaining( 'toVec2', vec2 );
addMethodChaining( 'toIVec2', ivec2 );
addMethodChaining( 'toUVec2', uvec2 );
addMethodChaining( 'toBVec2', bvec2 );
addMethodChaining( 'toVec3', vec3 );
addMethodChaining( 'toIVec3', ivec3 );
addMethodChaining( 'toUVec3', uvec3 );
addMethodChaining( 'toBVec3', bvec3 );
addMethodChaining( 'toVec4', vec4 );
addMethodChaining( 'toIVec4', ivec4 );
addMethodChaining( 'toUVec4', uvec4 );
addMethodChaining( 'toBVec4', bvec4 );
addMethodChaining( 'toMat2', mat2 );
addMethodChaining( 'toMat3', mat3 );
addMethodChaining( 'toMat4', mat4 );

// basic nodes

const element = /*@__PURE__*/ nodeProxy( ArrayElementNode );
const convert = ( node, types ) => nodeObject( new ConvertNode( nodeObject( node ), types ) );
const split = ( node, channels ) => nodeObject( new SplitNode( nodeObject( node ), channels ) );

addMethodChaining( 'element', element );
addMethodChaining( 'convert', convert );

class UniformGroupNode extends Node {

	static get type() {

		return 'UniformGroupNode';

	}

	constructor( name, shared = false, order = 1 ) {

		super( 'string' );

		this.name = name;
		this.version = 0;

		this.shared = shared;
		this.order = order;
		this.isUniformGroup = true;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	serialize( data ) {

		super.serialize( data );

		data.name = this.name;
		data.version = this.version;
		data.shared = this.shared;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.name = data.name;
		this.version = data.version;
		this.shared = data.shared;

	}

}

const uniformGroup = ( name ) => new UniformGroupNode( name );
const sharedUniformGroup = ( name, order = 0 ) => new UniformGroupNode( name, true, order );

const frameGroup = /*@__PURE__*/ sharedUniformGroup( 'frame' );
const renderGroup = /*@__PURE__*/ sharedUniformGroup( 'render' );
const objectGroup = /*@__PURE__*/ uniformGroup( 'object' );

class UniformNode extends InputNode {

	static get type() {

		return 'UniformNode';

	}

	constructor( value, nodeType = null ) {

		super( value, nodeType );

		this.isUniformNode = true;

		this.name = '';
		this.groupNode = objectGroup;

	}

	label( name ) {

		this.name = name;

		return this;

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

	onUpdate( callback, updateType ) {

		const self = this.getSelf();

		callback = callback.bind( self );

		return super.onUpdate( ( frame ) => {

			const value = callback( frame, self );

			if ( value !== undefined ) {

				this.value = value;

			}

	 	}, updateType );

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

		const nodeUniform = builder.getUniformFromNode( sharedNode, sharedNodeType, builder.shaderStage, this.name || builder.context.label );
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

class PropertyNode extends Node {

	static get type() {

		return 'PropertyNode';

	}

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

const diffuseColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
const emissive = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'EmissiveColor' );
const roughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Roughness' );
const metalness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Metalness' );
const clearcoat = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Clearcoat' );
const clearcoatRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );
const sheen = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'Sheen' );
const sheenRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );
const iridescence = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Iridescence' );
const iridescenceIOR = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );
const iridescenceThickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );
const alphaT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AlphaT' );
const anisotropy = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Anisotropy' );
const anisotropyT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyT' );
const anisotropyB = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyB' );
const specularColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
const specularF90 = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SpecularF90' );
const shininess = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Shininess' );
const output = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'Output' );
const dashSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'dashSize' );
const gapSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'gapSize' );
const pointWidth = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'pointWidth' );
const ior = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IOR' );
const transmission = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Transmission' );
const thickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Thickness' );
const attenuationDistance = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AttenuationDistance' );
const attenuationColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'AttenuationColor' );
const dispersion = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Dispersion' );

class AssignNode extends TempNode {

	static get type() {

		return 'AssignNode';

	}

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

			builder.addLineFlowCode( `${ sourceProperty } = ${ source }`, this );

			const targetRoot = targetNode.node.context( { assign: true } ).build( builder );

			for ( let i = 0; i < targetNode.components.length; i ++ ) {

				const component = targetNode.components[ i ];

				builder.addLineFlowCode( `${ targetRoot }.${ component } = ${ sourceProperty }[ ${ i } ]`, this );

			}

			if ( output !== 'void' ) {

				snippet = target;

			}

		} else {

			snippet = `${ target } = ${ source }`;

			if ( output === 'void' || sourceType === 'void' ) {

				builder.addLineFlowCode( snippet, this );

				if ( output !== 'void' ) {

					snippet = target;

				}

			}

		}

		nodeData.initialized = true;

		return builder.format( snippet, targetType, output );

	}

}

const assign = /*@__PURE__*/ nodeProxy( AssignNode );

addMethodChaining( 'assign', assign );

class FunctionCallNode extends TempNode {

	static get type() {

		return 'FunctionCallNode';

	}

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

		const generateInput = ( node, inputNode ) => {

			const type = inputNode.type;
			const pointer = type === 'pointer';

			let output;

			if ( pointer ) output = '&' + node.build( builder );
			else output = node.build( builder, type );

			return output;

		};

		if ( Array.isArray( parameters ) ) {

			for ( let i = 0; i < parameters.length; i ++ ) {

				params.push( generateInput( parameters[ i ], inputs[ i ] ) );

			}

		} else {

			for ( const inputNode of inputs ) {

				const node = parameters[ inputNode.name ];

				if ( node !== undefined ) {

					params.push( generateInput( node, inputNode ) );

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

addMethodChaining( 'call', call );

class OperatorNode extends TempNode {

	static get type() {

		return 'OperatorNode';

	}

	constructor( op, aNode, bNode, ...params ) {

		super();

		if ( params.length > 0 ) {

			let finalOp = new OperatorNode( op, aNode, bNode );

			for ( let i = 0; i < params.length - 1; i ++ ) {

				finalOp = new OperatorNode( op, finalOp, params[ i ] );

			}

			aNode = finalOp;
			bNode = params[ params.length - 1 ];

		}

		this.op = op;
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

				} else if ( typeA !== typeB ) {

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

				if ( builder.useComparisonMethod ) {

					return builder.format( `${ builder.getMethod( 'lessThan', output ) }( ${ a }, ${ b } )`, type, output );

				} else {

					return builder.format( `( ${ a } < ${ b } )`, type, output );

				}

			} else if ( op === '<=' && outputLength > 1 ) {

				if ( builder.useComparisonMethod ) {

					return builder.format( `${ builder.getMethod( 'lessThanEqual', output ) }( ${ a }, ${ b } )`, type, output );

				} else {

					return builder.format( `( ${ a } <= ${ b } )`, type, output );

				}

			} else if ( op === '>' && outputLength > 1 ) {

				if ( builder.useComparisonMethod ) {

					return builder.format( `${ builder.getMethod( 'greaterThan', output ) }( ${ a }, ${ b } )`, type, output );

				} else {

					return builder.format( `( ${ a } > ${ b } )`, type, output );

				}

			} else if ( op === '>=' && outputLength > 1 ) {

				if ( builder.useComparisonMethod ) {

					return builder.format( `${ builder.getMethod( 'greaterThanEqual', output ) }( ${ a }, ${ b } )`, type, output );

				} else {

					return builder.format( `( ${ a } >= ${ b } )`, type, output );

				}

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

const add = /*@__PURE__*/ nodeProxy( OperatorNode, '+' );
const sub = /*@__PURE__*/ nodeProxy( OperatorNode, '-' );
const mul = /*@__PURE__*/ nodeProxy( OperatorNode, '*' );
const div = /*@__PURE__*/ nodeProxy( OperatorNode, '/' );
const modInt = /*@__PURE__*/ nodeProxy( OperatorNode, '%' );
const equal = /*@__PURE__*/ nodeProxy( OperatorNode, '==' );
const notEqual = /*@__PURE__*/ nodeProxy( OperatorNode, '!=' );
const lessThan = /*@__PURE__*/ nodeProxy( OperatorNode, '<' );
const greaterThan = /*@__PURE__*/ nodeProxy( OperatorNode, '>' );
const lessThanEqual = /*@__PURE__*/ nodeProxy( OperatorNode, '<=' );
const greaterThanEqual = /*@__PURE__*/ nodeProxy( OperatorNode, '>=' );
const and = /*@__PURE__*/ nodeProxy( OperatorNode, '&&' );
const or = /*@__PURE__*/ nodeProxy( OperatorNode, '||' );
const not = /*@__PURE__*/ nodeProxy( OperatorNode, '!' );
const xor = /*@__PURE__*/ nodeProxy( OperatorNode, '^^' );
const bitAnd = /*@__PURE__*/ nodeProxy( OperatorNode, '&' );
const bitNot = /*@__PURE__*/ nodeProxy( OperatorNode, '~' );
const bitOr = /*@__PURE__*/ nodeProxy( OperatorNode, '|' );
const bitXor = /*@__PURE__*/ nodeProxy( OperatorNode, '^' );
const shiftLeft = /*@__PURE__*/ nodeProxy( OperatorNode, '<<' );
const shiftRight = /*@__PURE__*/ nodeProxy( OperatorNode, '>>' );

addMethodChaining( 'add', add );
addMethodChaining( 'sub', sub );
addMethodChaining( 'mul', mul );
addMethodChaining( 'div', div );
addMethodChaining( 'modInt', modInt );
addMethodChaining( 'equal', equal );
addMethodChaining( 'notEqual', notEqual );
addMethodChaining( 'lessThan', lessThan );
addMethodChaining( 'greaterThan', greaterThan );
addMethodChaining( 'lessThanEqual', lessThanEqual );
addMethodChaining( 'greaterThanEqual', greaterThanEqual );
addMethodChaining( 'and', and );
addMethodChaining( 'or', or );
addMethodChaining( 'not', not );
addMethodChaining( 'xor', xor );
addMethodChaining( 'bitAnd', bitAnd );
addMethodChaining( 'bitNot', bitNot );
addMethodChaining( 'bitOr', bitOr );
addMethodChaining( 'bitXor', bitXor );
addMethodChaining( 'shiftLeft', shiftLeft );
addMethodChaining( 'shiftRight', shiftRight );


const remainder = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.OperatorNode: .remainder() has been renamed to .modInt().' );
	return modInt( ...params );

};

addMethodChaining( 'remainder', remainder );

class MathNode extends TempNode {

	static get type() {

		return 'MathNode';

	}

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

			} else if ( isWebGL && method === MathNode.STEP ) {

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
MathNode.TRANSPOSE = 'transpose';

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

const EPSILON = /*@__PURE__*/ float( 1e-6 );
const INFINITY = /*@__PURE__*/ float( 1e6 );
const PI = /*@__PURE__*/ float( Math.PI );
const PI2 = /*@__PURE__*/ float( Math.PI * 2 );

const all = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ALL );
const any = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ANY );
const equals = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EQUALS );

const radians = /*@__PURE__*/ nodeProxy( MathNode, MathNode.RADIANS );
const degrees = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DEGREES );
const exp = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EXP );
const exp2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EXP2 );
const log = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LOG );
const log2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LOG2 );
const sqrt = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SQRT );
const inverseSqrt = /*@__PURE__*/ nodeProxy( MathNode, MathNode.INVERSE_SQRT );
const floor = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FLOOR );
const ceil = /*@__PURE__*/ nodeProxy( MathNode, MathNode.CEIL );
const normalize = /*@__PURE__*/ nodeProxy( MathNode, MathNode.NORMALIZE );
const fract = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FRACT );
const sin = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SIN );
const cos = /*@__PURE__*/ nodeProxy( MathNode, MathNode.COS );
const tan = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TAN );
const asin = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ASIN );
const acos = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ACOS );
const atan = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ATAN );
const abs = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ABS );
const sign = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SIGN );
const length = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LENGTH );
const negate = /*@__PURE__*/ nodeProxy( MathNode, MathNode.NEGATE );
const oneMinus = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ONE_MINUS );
const dFdx = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DFDX );
const dFdy = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DFDY );
const round = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ROUND );
const reciprocal = /*@__PURE__*/ nodeProxy( MathNode, MathNode.RECIPROCAL );
const trunc = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRUNC );
const fwidth = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FWIDTH );
const bitcast = /*@__PURE__*/ nodeProxy( MathNode, MathNode.BITCAST );
const transpose = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRANSPOSE );

const atan2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ATAN2 );
const min$1 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MIN );
const max$1 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MAX );
const mod = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MOD );
const step = /*@__PURE__*/ nodeProxy( MathNode, MathNode.STEP );
const reflect = /*@__PURE__*/ nodeProxy( MathNode, MathNode.REFLECT );
const distance = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DISTANCE );
const difference = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DIFFERENCE );
const dot = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DOT );
const cross = /*@__PURE__*/ nodeProxy( MathNode, MathNode.CROSS );
const pow = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW );
const pow2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 2 );
const pow3 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 3 );
const pow4 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 4 );
const transformDirection = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRANSFORM_DIRECTION );

const cbrt = ( a ) => mul( sign( a ), pow( abs( a ), 1.0 / 3.0 ) );
const lengthSq = ( a ) => dot( a, a );
const mix = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MIX );
const clamp = ( value, low = 0, high = 1 ) => nodeObject( new MathNode( MathNode.CLAMP, nodeObject( value ), nodeObject( low ), nodeObject( high ) ) );
const saturate = ( value ) => clamp( value );
const refract = /*@__PURE__*/ nodeProxy( MathNode, MathNode.REFRACT );
const smoothstep = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SMOOTHSTEP );
const faceForward = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FACEFORWARD );

const rand = /*@__PURE__*/ Fn( ( [ uv ] ) => {

	const a = 12.9898, b = 78.233, c = 43758.5453;
	const dt = dot( uv.xy, vec2( a, b ) ), sn = mod( dt, PI );

	return fract( sin( sn ).mul( c ) );

} );

const mixElement = ( t, e1, e2 ) => mix( e1, e2, t );
const smoothstepElement = ( x, low, high ) => smoothstep( low, high, x );

addMethodChaining( 'all', all );
addMethodChaining( 'any', any );
addMethodChaining( 'equals', equals );

addMethodChaining( 'radians', radians );
addMethodChaining( 'degrees', degrees );
addMethodChaining( 'exp', exp );
addMethodChaining( 'exp2', exp2 );
addMethodChaining( 'log', log );
addMethodChaining( 'log2', log2 );
addMethodChaining( 'sqrt', sqrt );
addMethodChaining( 'inverseSqrt', inverseSqrt );
addMethodChaining( 'floor', floor );
addMethodChaining( 'ceil', ceil );
addMethodChaining( 'normalize', normalize );
addMethodChaining( 'fract', fract );
addMethodChaining( 'sin', sin );
addMethodChaining( 'cos', cos );
addMethodChaining( 'tan', tan );
addMethodChaining( 'asin', asin );
addMethodChaining( 'acos', acos );
addMethodChaining( 'atan', atan );
addMethodChaining( 'abs', abs );
addMethodChaining( 'sign', sign );
addMethodChaining( 'length', length );
addMethodChaining( 'lengthSq', lengthSq );
addMethodChaining( 'negate', negate );
addMethodChaining( 'oneMinus', oneMinus );
addMethodChaining( 'dFdx', dFdx );
addMethodChaining( 'dFdy', dFdy );
addMethodChaining( 'round', round );
addMethodChaining( 'reciprocal', reciprocal );
addMethodChaining( 'trunc', trunc );
addMethodChaining( 'fwidth', fwidth );
addMethodChaining( 'atan2', atan2 );
addMethodChaining( 'min', min$1 );
addMethodChaining( 'max', max$1 );
addMethodChaining( 'mod', mod );
addMethodChaining( 'step', step );
addMethodChaining( 'reflect', reflect );
addMethodChaining( 'distance', distance );
addMethodChaining( 'dot', dot );
addMethodChaining( 'cross', cross );
addMethodChaining( 'pow', pow );
addMethodChaining( 'pow2', pow2 );
addMethodChaining( 'pow3', pow3 );
addMethodChaining( 'pow4', pow4 );
addMethodChaining( 'transformDirection', transformDirection );
addMethodChaining( 'mix', mixElement );
addMethodChaining( 'clamp', clamp );
addMethodChaining( 'refract', refract );
addMethodChaining( 'smoothstep', smoothstepElement );
addMethodChaining( 'faceForward', faceForward );
addMethodChaining( 'difference', difference );
addMethodChaining( 'saturate', saturate );
addMethodChaining( 'cbrt', cbrt );
addMethodChaining( 'transpose', transpose );
addMethodChaining( 'rand', rand );

class ConditionalNode extends Node {

	static get type() {

		return 'ConditionalNode';

	}

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

	setup( builder ) {

		const condNode = this.condNode.cache();
		const ifNode = this.ifNode.cache();
		const elseNode = this.elseNode ? this.elseNode.cache() : null;

		//

		const currentNodeBlock = builder.context.nodeBlock;

		builder.getDataFromNode( ifNode ).parentNodeBlock = currentNodeBlock;
		if ( elseNode !== null ) builder.getDataFromNode( elseNode ).parentNodeBlock = currentNodeBlock;

		//

		const properties = builder.getNodeProperties( this );
		properties.condNode = condNode;
		properties.ifNode = ifNode.context( { nodeBlock: ifNode } );
		properties.elseNode = elseNode ? elseNode.context( { nodeBlock: elseNode } ) : null;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.nodeProperty !== undefined ) {

			return nodeData.nodeProperty;

		}

		const { condNode, ifNode, elseNode } = builder.getNodeProperties( this );

		const needsOutput = output !== 'void';
		const nodeProperty = needsOutput ? property( type ).build( builder ) : '';

		nodeData.nodeProperty = nodeProperty;

		const nodeSnippet = condNode.build( builder, 'bool' );

		builder.addFlowCode( `\n${ builder.tab }if ( ${ nodeSnippet } ) {\n\n` ).addFlowTab();

		let ifSnippet = ifNode.build( builder, type );

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

			let elseSnippet = elseNode.build( builder, type );

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

const select = /*@__PURE__*/ nodeProxy( ConditionalNode );

addMethodChaining( 'select', select );

//

const cond = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.ConditionalNode: cond() has been renamed to select().' );
	return select( ...params );

};

addMethodChaining( 'cond', cond );

class ContextNode extends Node {

	static get type() {

		return 'ContextNode';

	}

	constructor( node, value = {} ) {

		super();

		this.isContextNode = true;

		this.node = node;
		this.value = value;

	}

	getScope() {

		return this.node.getScope();

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	analyze( builder ) {

		this.node.build( builder );

	}

	setup( builder ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.value } );

		const node = this.node.build( builder );

		builder.setContext( previousContext );

		return node;

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.value } );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

const context = /*@__PURE__*/ nodeProxy( ContextNode );
const label = ( node, name ) => context( node, { label: name } );

addMethodChaining( 'context', context );
addMethodChaining( 'label', label );

class VarNode extends Node {

	static get type() {

		return 'VarNode';

	}

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

		this.global = true;

		this.isVarNode = true;

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

		builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

		return propertyName;

	}

}

const createVar = /*@__PURE__*/ nodeProxy( VarNode );

addMethodChaining( 'toVar', ( ...params ) => createVar( ...params ).append() );

// Deprecated

const temp = ( node ) => { // @deprecated, r170

	console.warn( 'TSL: "temp" is deprecated. Use ".toVar()" instead.' );

	return createVar( node );

};

addMethodChaining( 'temp', temp );

class VaryingNode extends Node {

	static get type() {

		return 'VaryingNode';

	}

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

	setupVarying( builder ) {

		const properties = builder.getNodeProperties( this );

		let varying = properties.varying;

		if ( varying === undefined ) {

			const name = this.name;
			const type = this.getNodeType( builder );

			properties.varying = varying = builder.getVaryingFromNode( this, name, type );
			properties.node = this.node;

		}

		// this property can be used to check if the varying can be optimized for a variable
		varying.needsInterpolation || ( varying.needsInterpolation = ( builder.shaderStage === 'fragment' ) );

		return varying;

	}

	setup( builder ) {

		this.setupVarying( builder );

	}

	analyze( builder ) {

		this.setupVarying( builder );

		return this.node.analyze( builder );

	}

	generate( builder ) {

		const properties = builder.getNodeProperties( this );
		const varying = this.setupVarying( builder );

		if ( properties.propertyName === undefined ) {

			const type = this.getNodeType( builder );
			const propertyName = builder.getPropertyName( varying, NodeShaderStage.VERTEX );

			// force node run in vertex stage
			builder.flowNodeFromShaderStage( NodeShaderStage.VERTEX, this.node, type, propertyName );

			properties.propertyName = propertyName;

		}

		return builder.getPropertyName( varying );

	}

}

const varying = /*@__PURE__*/ nodeProxy( VaryingNode );

addMethodChaining( 'varying', varying );

const sRGBTransferEOTF = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.mul( 0.9478672986 ).add( 0.0521327014 ).pow( 2.4 );
	const b = color.mul( 0.0773993808 );
	const factor = color.lessThanEqual( 0.04045 );

	const rgbResult = mix( a, b, factor );

	return rgbResult;

} ).setLayout( {
	name: 'sRGBTransferEOTF',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

const sRGBTransferOETF = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.pow( 0.41666 ).mul( 1.055 ).sub( 0.055 );
	const b = color.mul( 12.92 );
	const factor = color.lessThanEqual( 0.0031308 );

	const rgbResult = mix( a, b, factor );

	return rgbResult;

} ).setLayout( {
	name: 'sRGBTransferOETF',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

const WORKING_COLOR_SPACE = 'WorkingColorSpace';
const OUTPUT_COLOR_SPACE = 'OutputColorSpace';

class ColorSpaceNode extends TempNode {

	static get type() {

		return 'ColorSpaceNode';

	}

	constructor( colorNode, source, target ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.source = source;
		this.target = target;

	}

	resolveColorSpace( builder, colorSpace ) {

		if ( colorSpace === WORKING_COLOR_SPACE ) {

			return ColorManagement.workingColorSpace;

		} else if ( colorSpace === OUTPUT_COLOR_SPACE ) {

			return builder.context.outputColorSpace || builder.renderer.outputColorSpace;

		}

		return colorSpace;

	}

	setup( builder ) {

		const { colorNode } = this;

		const source = this.resolveColorSpace( builder, this.source );
		const target = this.resolveColorSpace( builder, this.target );

		let outputNode = colorNode;

		if ( ColorManagement.enabled === false || source === target || ! source || ! target ) {

			return outputNode;

		}

		if ( ColorManagement.getTransfer( source ) === SRGBTransfer ) {

			outputNode = vec4( sRGBTransferEOTF( outputNode.rgb ), outputNode.a );

		}

		if ( ColorManagement.getPrimaries( source ) !== ColorManagement.getPrimaries( target ) ) {

			outputNode = vec4(
				mat3( ColorManagement._getMatrix( new Matrix3(), source, target ) ).mul( outputNode.rgb ),
				outputNode.a
			);

		}

		if ( ColorManagement.getTransfer( target ) === SRGBTransfer ) {

			outputNode = vec4( sRGBTransferOETF( outputNode.rgb ), outputNode.a );

		}

		return outputNode;

	}

}

const toOutputColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, OUTPUT_COLOR_SPACE ) );
const toWorkingColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), OUTPUT_COLOR_SPACE, WORKING_COLOR_SPACE ) );

const workingToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, colorSpace ) );
const colorSpaceToWorking = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), colorSpace, WORKING_COLOR_SPACE ) );

const convertColorSpace = ( node, sourceColorSpace, targetColorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), sourceColorSpace, targetColorSpace ) );

addMethodChaining( 'toOutputColorSpace', toOutputColorSpace );
addMethodChaining( 'toWorkingColorSpace', toWorkingColorSpace );

addMethodChaining( 'workingToColorSpace', workingToColorSpace );
addMethodChaining( 'colorSpaceToWorking', colorSpaceToWorking );

let ReferenceElementNode$1 = class ReferenceElementNode extends ArrayElementNode {

	static get type() {

		return 'ReferenceElementNode';

	}

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

};

class ReferenceBaseNode extends Node {

	static get type() {

		return 'ReferenceBaseNode';

	}

	constructor( property, uniformType, object = null, count = null ) {

		super();

		this.property = property;
		this.uniformType = uniformType;
		this.object = object;
		this.count = count;

		this.properties = property.split( '.' );
		this.reference = object;
		this.node = null;
		this.group = null;

		this.updateType = NodeUpdateType.OBJECT;

	}

	setGroup( group ) {

		this.group = group;

		return this;

	}

	element( indexNode ) {

		return nodeObject( new ReferenceElementNode$1( this, nodeObject( indexNode ) ) );

	}

	setNodeType( uniformType ) {

		const node = uniform( null, uniformType ).getSelf();

		if ( this.group !== null ) {

			node.setGroup( this.group );

		}

		this.node = node;

	}

	getNodeType( builder ) {

		if ( this.node === null ) {

			this.updateReference( builder );
			this.updateValue();

		}

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

	updateReference( state ) {

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

const reference$1 = ( name, type, object ) => nodeObject( new ReferenceBaseNode( name, type, object ) );

class RendererReferenceNode extends ReferenceBaseNode {

	static get type() {

		return 'RendererReferenceNode';

	}

	constructor( property, inputType, renderer = null ) {

		super( property, inputType, renderer );

		this.renderer = renderer;

		this.setGroup( renderGroup );

	}

	updateReference( state ) {

		this.reference = this.renderer !== null ? this.renderer : state.renderer;

		return this.reference;

	}

}

const rendererReference = ( name, type, renderer ) => nodeObject( new RendererReferenceNode( name, type, renderer ) );

class ToneMappingNode extends TempNode {

	static get type() {

		return 'ToneMappingNode';

	}

	constructor( toneMapping, exposureNode = toneMappingExposure, colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	getCacheKey() {

		return hash$1( super.getCacheKey(), this.toneMapping );

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		let outputNode = null;

		const toneMappingFn = builder.renderer.library.getToneMappingFunction( toneMapping );

		if ( toneMappingFn !== null ) {

			outputNode = vec4( toneMappingFn( colorNode.rgb, this.exposureNode ), colorNode.a );

		} else {

			console.error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );
const toneMappingExposure = /*@__PURE__*/ rendererReference( 'toneMappingExposure', 'float' );

addMethodChaining( 'toneMapping', ( color, mapping, exposure ) => toneMapping( mapping, exposure, color ) );

class BufferAttributeNode extends InputNode {

	static get type() {

		return 'BufferAttributeNode';

	}

	constructor( value, bufferType = null, bufferStride = 0, bufferOffset = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferStride = bufferStride;
		this.bufferOffset = bufferOffset;

		this.usage = StaticDrawUsage;
		this.instanced = false;

		this.attribute = null;

		this.global = true;

		if ( value && value.isBufferAttribute === true ) {

			this.attribute = value;
			this.usage = value.usage;
			this.instanced = value.isInstancedBufferAttribute;

		}

	}

	getHash( builder ) {

		if ( this.bufferStride === 0 && this.bufferOffset === 0 ) {

			let bufferData = builder.globalCache.getData( this.value );

			if ( bufferData === undefined ) {

				bufferData = {
					node: this
				};

				builder.globalCache.setData( this.value, bufferData );

			}

			return bufferData.node.uuid;

		}

		return this.uuid;

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

		if ( this.attribute && this.attribute.isBufferAttribute === true ) {

			this.attribute.usage = value;

		}

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

addMethodChaining( 'toAttribute', ( bufferNode ) => bufferAttribute( bufferNode.value ) );

class ComputeNode extends Node {

	static get type() {

		return 'ComputeNode';

	}

	constructor( computeNode, count, workgroupSize = [ 64 ] ) {

		super( 'void' );

		this.isComputeNode = true;

		this.computeNode = computeNode;

		this.count = count;
		this.workgroupSize = workgroupSize;
		this.dispatchCount = 0;

		this.version = 1;
		this.updateBeforeType = NodeUpdateType.OBJECT;

		this.onInitFunction = null;

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

	onInit( callback ) {

		this.onInitFunction = callback;

		return this;

	}

	updateBefore( { renderer } ) {

		renderer.compute( this );

	}

	generate( builder ) {

		const { shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			const snippet = this.computeNode.build( builder, 'void' );

			if ( snippet !== '' ) {

				builder.addLineFlowCode( snippet, this );

			}

		}

	}

}

const compute = ( node, count, workgroupSize ) => nodeObject( new ComputeNode( nodeObject( node ), count, workgroupSize ) );

addMethodChaining( 'compute', compute );

class CacheNode extends Node {

	static get type() {

		return 'CacheNode';

	}

	constructor( node, parent = true ) {

		super();

		this.node = node;
		this.parent = parent;

		this.isCacheNode = true;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();
		const cache = builder.getCacheFromNode( this, this.parent );

		builder.setCache( cache );

		const data = this.node.build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

const cache = ( node, ...params ) => nodeObject( new CacheNode( nodeObject( node ), ...params ) );

addMethodChaining( 'cache', cache );

class BypassNode extends Node {

	static get type() {

		return 'BypassNode';

	}

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

			builder.addLineFlowCode( snippet, this );

		}

		return this.outputNode.build( builder );

	}

}

const bypass = /*@__PURE__*/ nodeProxy( BypassNode );

addMethodChaining( 'bypass', bypass );

class RemapNode extends Node {

	static get type() {

		return 'RemapNode';

	}

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

const remap = /*@__PURE__*/ nodeProxy( RemapNode, null, null, { doClamp: false } );
const remapClamp = /*@__PURE__*/ nodeProxy( RemapNode );

addMethodChaining( 'remap', remap );
addMethodChaining( 'remapClamp', remapClamp );

class ExpressionNode extends Node {

	static get type() {

		return 'ExpressionNode';

	}

	constructor( snippet = '', nodeType = 'void' ) {

		super( nodeType );

		this.snippet = snippet;

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );
		const snippet = this.snippet;

		if ( type === 'void' ) {

			builder.addLineFlowCode( snippet, this );

		} else {

			return builder.format( `( ${ snippet } )`, type, output );

		}

	}

}

const expression = /*@__PURE__*/ nodeProxy( ExpressionNode );

const Discard = ( conditional ) => ( conditional ? select( conditional, expression( 'discard' ) ) : expression( 'discard' ) ).append();
const Return = () => expression( 'return' ).append();

addMethodChaining( 'discard', Discard );

class RenderOutputNode extends TempNode {

	static get type() {

		return 'RenderOutputNode';

	}

	constructor( colorNode, toneMapping, outputColorSpace ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.toneMapping = toneMapping;
		this.outputColorSpace = outputColorSpace;

		this.isRenderOutput = true;

	}

	setup( { context } ) {

		let outputNode = this.colorNode || context.color;

		// tone mapping

		const toneMapping = ( this.toneMapping !== null ? this.toneMapping : context.toneMapping ) || NoToneMapping;
		const outputColorSpace = ( this.outputColorSpace !== null ? this.outputColorSpace : context.outputColorSpace ) || NoColorSpace;

		if ( toneMapping !== NoToneMapping ) {

			outputNode = outputNode.toneMapping( toneMapping );

		}

		// working to output color space

		if ( outputColorSpace !== NoColorSpace && outputColorSpace !== ColorManagement.workingColorSpace ) {

			outputNode = outputNode.workingToColorSpace( outputColorSpace );

		}

		return outputNode;

	}

}

const renderOutput = ( color, toneMapping = null, outputColorSpace = null ) => nodeObject( new RenderOutputNode( nodeObject( color ), toneMapping, outputColorSpace ) );

addMethodChaining( 'renderOutput', renderOutput );

// Non-PURE exports list, side-effects are required here.
// TSL Base Syntax


function addNodeElement( name/*, nodeElement*/ ) {

	console.warn( 'THREE.TSLBase: AddNodeElement has been removed in favor of tree-shaking. Trying add', name );

}

class AttributeNode extends Node {

	static get type() {

		return 'AttributeNode';

	}

	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		this.global = true;

		this._attributeName = attributeName;

	}

	getHash( builder ) {

		return this.getAttributeName( builder );

	}

	getNodeType( builder ) {

		let nodeType = this.nodeType;

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

	serialize( data ) {

		super.serialize( data );

		data.global = this.global;
		data._attributeName = this._attributeName;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.global = data.global;
		this._attributeName = data._attributeName;

	}

}

const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );

const uv = ( index ) => attribute( 'uv' + ( index > 0 ? index : '' ), 'vec2' );

class TextureSizeNode extends Node {

	static get type() {

		return 'TextureSizeNode';

	}

	constructor( textureNode, levelNode = null ) {

		super( 'uvec2' );

		this.isTextureSizeNode = true;

		this.textureNode = textureNode;
		this.levelNode = levelNode;

	}

	generate( builder, output ) {

		const textureProperty = this.textureNode.build( builder, 'property' );
		const level = this.levelNode === null ? '0' : this.levelNode.build( builder, 'int' );

		return builder.format( `${ builder.getMethod( 'textureDimensions' ) }( ${ textureProperty }, ${ level } )`, this.getNodeType( builder ), output );

	}

}

const textureSize = /*@__PURE__*/ nodeProxy( TextureSizeNode );

class MaxMipLevelNode extends UniformNode {

	static get type() {

		return 'MaxMipLevelNode';

	}

	constructor( textureNode ) {

		super( 0 );

		this._textureNode = textureNode;

		this.updateType = NodeUpdateType.FRAME;

	}

	get textureNode() {

		return this._textureNode;

	}

	get texture() {

		return this._textureNode.value;

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

const maxMipLevel = /*@__PURE__*/ nodeProxy( MaxMipLevelNode );

class TextureNode extends UniformNode {

	static get type() {

		return 'TextureNode';

	}

	constructor( value, uvNode = null, levelNode = null, biasNode = null ) {

		super( value );

		this.isTextureNode = true;

		this.uvNode = uvNode;
		this.levelNode = levelNode;
		this.biasNode = biasNode;
		this.compareNode = null;
		this.depthNode = null;
		this.gradNode = null;

		this.sampler = true;
		this.updateMatrix = false;
		this.updateType = NodeUpdateType.NONE;

		this.referenceNode = null;

		this._value = value;
		this._matrixUniform = null;

		this.setUpdateMatrix( uvNode === null );

	}

	set value( value ) {

		if ( this.referenceNode ) {

			this.referenceNode.value = value;

		} else {

			this._value = value;

		}

	}

	get value() {

		return this.referenceNode ? this.referenceNode.value : this._value;

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getNodeType( /*builder*/ ) {

		if ( this.value.isDepthTexture === true ) return 'float';

		if ( this.value.type === UnsignedIntType ) {

			return 'uvec4';

		} else if ( this.value.type === IntType ) {

			return 'ivec4';

		}

		return 'vec4';

	}

	getInputType( /*builder*/ ) {

		return 'texture';

	}

	getDefaultUV() {

		return uv( this.value.channel );

	}

	updateReference( /*state*/ ) {

		return this.value;

	}

	getTransformedUV( uvNode ) {

		if ( this._matrixUniform === null ) this._matrixUniform = uniform( this.value.matrix );

		return this._matrixUniform.mul( vec3( uvNode, 1 ) ).xy;

	}

	setUpdateMatrix( value ) {

		this.updateMatrix = value;
		this.updateType = value ? NodeUpdateType.FRAME : NodeUpdateType.NONE;

		return this;

	}

	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.isFlipY() && ( texture.isRenderTargetTexture === true || texture.isFramebufferTexture === true || texture.isDepthTexture === true ) ) {

			if ( this.sampler ) {

				uvNode = uvNode.flipY();

			} else {

				uvNode = uvNode.setY( int( textureSize( this, this.levelNode ).y ).sub( uvNode.y ).sub( 1 ) );

			}

		}

		return uvNode;

	}

	setup( builder ) {

		const properties = builder.getNodeProperties( this );
		properties.referenceNode = this.referenceNode;

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

		//

		properties.uvNode = uvNode;
		properties.levelNode = levelNode;
		properties.biasNode = this.biasNode;
		properties.compareNode = this.compareNode;
		properties.gradNode = this.gradNode;
		properties.depthNode = this.depthNode;

	}

	generateUV( builder, uvNode ) {

		return uvNode.build( builder, this.sampler === true ? 'vec2' : 'ivec2' );

	}

	generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, biasSnippet, depthSnippet, compareSnippet, gradSnippet ) {

		const texture = this.value;

		let snippet;

		if ( levelSnippet ) {

			snippet = builder.generateTextureLevel( texture, textureProperty, uvSnippet, levelSnippet, depthSnippet );

		} else if ( biasSnippet ) {

			snippet = builder.generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet, depthSnippet );

		} else if ( gradSnippet ) {

			snippet = builder.generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet, depthSnippet );

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

				const { uvNode, levelNode, biasNode, compareNode, depthNode, gradNode } = properties;

				const uvSnippet = this.generateUV( builder, uvNode );
				const levelSnippet = levelNode ? levelNode.build( builder, 'float' ) : null;
				const biasSnippet = biasNode ? biasNode.build( builder, 'float' ) : null;
				const depthSnippet = depthNode ? depthNode.build( builder, 'int' ) : null;
				const compareSnippet = compareNode ? compareNode.build( builder, 'float' ) : null;
				const gradSnippet = gradNode ? [ gradNode[ 0 ].build( builder, 'vec2' ), gradNode[ 1 ].build( builder, 'vec2' ) ] : null;

				const nodeVar = builder.getVarFromNode( this );

				propertyName = builder.getPropertyName( nodeVar );

				const snippet = this.generateSnippet( builder, textureProperty, uvSnippet, levelSnippet, biasSnippet, depthSnippet, compareSnippet, gradSnippet );

				builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			let snippet = propertyName;
			const nodeType = this.getNodeType( builder );

			if ( builder.needsToWorkingColorSpace( texture ) ) {

				snippet = colorSpaceToWorking( expression( snippet, nodeType ), texture.colorSpace ).setup( builder ).build( builder, nodeType );

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
		textureNode.uvNode = nodeObject( uvNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	blur( amountNode ) {

		const textureNode = this.clone();
		textureNode.biasNode = nodeObject( amountNode ).mul( maxMipLevel( textureNode ) );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	level( levelNode ) {

		const textureNode = this.clone();
		textureNode.levelNode = nodeObject( levelNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	size( levelNode ) {

		return textureSize( this, levelNode );

	}

	bias( biasNode ) {

		const textureNode = this.clone();
		textureNode.biasNode = nodeObject( biasNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	compare( compareNode ) {

		const textureNode = this.clone();
		textureNode.compareNode = nodeObject( compareNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	grad( gradNodeX, gradNodeY ) {

		const textureNode = this.clone();
		textureNode.gradNode = [ nodeObject( gradNodeX ), nodeObject( gradNodeY ) ];
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	depth( depthNode ) {

		const textureNode = this.clone();
		textureNode.depthNode = nodeObject( depthNode );
		textureNode.referenceNode = this.getSelf();

		return nodeObject( textureNode );

	}

	// --

	serialize( data ) {

		super.serialize( data );

		data.value = this.value.toJSON( data.meta ).uuid;
		data.sampler = this.sampler;
		data.updateMatrix = this.updateMatrix;
		data.updateType = this.updateType;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.value = data.meta.textures[ data.value ];
		this.sampler = data.sampler;
		this.updateMatrix = data.updateMatrix;
		this.updateType = data.updateType;

	}

	update() {

		const texture = this.value;
		const matrixUniform = this._matrixUniform;

		if ( matrixUniform !== null ) matrixUniform.value = texture.matrix;

		if ( texture.matrixAutoUpdate === true ) {

			texture.updateMatrix();

		}

	}

	clone() {

		const newNode = new this.constructor( this.value, this.uvNode, this.levelNode, this.biasNode );
		newNode.sampler = this.sampler;

		return newNode;

	}

}

const texture = /*@__PURE__*/ nodeProxy( TextureNode );
const textureLoad = ( ...params ) => texture( ...params ).setSampler( false );

//export const textureLevel = ( value, uv, level ) => texture( value, uv ).level( level );

const sampler = ( aTexture ) => ( aTexture.isNode === true ? aTexture : texture( aTexture ) ).convert( 'sampler' );

const cameraNear = /*@__PURE__*/ uniform( 'float' ).label( 'cameraNear' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.near );
const cameraFar = /*@__PURE__*/ uniform( 'float' ).label( 'cameraFar' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.far );
const cameraProjectionMatrix = /*@__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrix );
const cameraProjectionMatrixInverse = /*@__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrixInverse' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrixInverse );
const cameraViewMatrix = /*@__PURE__*/ uniform( 'mat4' ).label( 'cameraViewMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorldInverse );
const cameraWorldMatrix = /*@__PURE__*/ uniform( 'mat4' ).label( 'cameraWorldMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorld );
const cameraNormalMatrix = /*@__PURE__*/ uniform( 'mat3' ).label( 'cameraNormalMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.normalMatrix );
const cameraPosition = /*@__PURE__*/ uniform( new Vector3() ).label( 'cameraPosition' ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );

class Object3DNode extends Node {

	static get type() {

		return 'Object3DNode';

	}

	constructor( scope, object3d = null ) {

		super();

		this.scope = scope;
		this.object3d = object3d;

		this.updateType = NodeUpdateType.OBJECT;

		this._uniformNode = new UniformNode( null );

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX ) {

			return 'mat4';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION || scope === Object3DNode.DIRECTION || scope === Object3DNode.SCALE ) {

			return 'vec3';

		}

	}

	update( frame ) {

		const object = this.object3d;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX ) {

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

		if ( scope === Object3DNode.WORLD_MATRIX ) {

			this._uniformNode.nodeType = 'mat4';

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

Object3DNode.WORLD_MATRIX = 'worldMatrix';
Object3DNode.POSITION = 'position';
Object3DNode.SCALE = 'scale';
Object3DNode.VIEW_POSITION = 'viewPosition';
Object3DNode.DIRECTION = 'direction';

const objectDirection = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.DIRECTION );
const objectWorldMatrix = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.WORLD_MATRIX );
const objectPosition = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.POSITION );
const objectScale = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.SCALE );
const objectViewPosition = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.VIEW_POSITION );

class ModelNode extends Object3DNode {

	static get type() {

		return 'ModelNode';

	}

	constructor( scope ) {

		super( scope );

	}

	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

const modelDirection = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.DIRECTION );
const modelWorldMatrix = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );
const modelPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.POSITION );
const modelScale = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.SCALE );
const modelViewPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );
const modelNormalMatrix = /*@__PURE__*/ uniform( new Matrix3() ).onObjectUpdate( ( { object }, self ) => self.value.getNormalMatrix( object.matrixWorld ) );
const modelWorldMatrixInverse = /*@__PURE__*/ uniform( new Matrix4() ).onObjectUpdate( ( { object }, self ) => self.value.copy( object.matrixWorld ).invert() );
const modelViewMatrix = /*@__PURE__*/ cameraViewMatrix.mul( modelWorldMatrix ).toVar( 'modelViewMatrix' );

const highPrecisionModelViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	builder.context.isHighPrecisionModelViewMatrix = true;

	return uniform( 'mat4' ).onObjectUpdate( ( { object, camera } ) => {

		return object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

	} );

} ).once() )().toVar( 'highPrecisionModelViewMatrix' );

const highPrecisionModelNormalViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	const isHighPrecisionModelViewMatrix = builder.context.isHighPrecisionModelViewMatrix;

	return uniform( 'mat3' ).onObjectUpdate( ( { object, camera } ) => {

		if ( isHighPrecisionModelViewMatrix !== true ) {

			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

		}

		return object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

	} );

} ).once() )().toVar( 'highPrecisionModelNormalMatrix' );

const positionGeometry = /*@__PURE__*/ attribute( 'position', 'vec3' );
const positionLocal = /*@__PURE__*/ positionGeometry.varying( 'positionLocal' );
const positionPrevious = /*@__PURE__*/ positionGeometry.varying( 'positionPrevious' );
const positionWorld = /*@__PURE__*/ modelWorldMatrix.mul( positionLocal ).xyz.varying( 'v_positionWorld' );
const positionWorldDirection = /*@__PURE__*/ positionLocal.transformDirection( modelWorldMatrix ).varying( 'v_positionWorldDirection' ).normalize().toVar( 'positionWorldDirection' );
const positionView = /*@__PURE__*/ modelViewMatrix.mul( positionLocal ).xyz.varying( 'v_positionView' );
const positionViewDirection = /*@__PURE__*/ positionView.negate().varying( 'v_positionViewDirection' ).normalize().toVar( 'positionViewDirection' );

class FrontFacingNode extends Node {

	static get type() {

		return 'FrontFacingNode';

	}

	constructor() {

		super( 'bool' );

		this.isFrontFacingNode = true;

	}

	generate( builder ) {

		const { renderer, material } = builder;

		if ( renderer.coordinateSystem === WebGLCoordinateSystem ) {

			if ( material.side === BackSide ) {

				return 'false';

			}

		}

		return builder.getFrontFacing();

	}

}

const frontFacing = /*@__PURE__*/ nodeImmutable( FrontFacingNode );
const faceDirection = /*@__PURE__*/ float( frontFacing ).mul( 2.0 ).sub( 1.0 );

const normalGeometry = /*@__PURE__*/ attribute( 'normal', 'vec3' );

const normalLocal = /*@__PURE__*/ ( Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'normal' ) === false ) {

		console.warn( 'TSL.NormalNode: Vertex attribute "normal" not found on geometry.' );

		return vec3( 0, 1, 0 );

	}

	return normalGeometry;

}, 'vec3' ).once() )().toVar( 'normalLocal' );

const normalFlat = /*@__PURE__*/ positionView.dFdx().cross( positionView.dFdy() ).normalize().toVar( 'normalFlat' );

const normalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.material.flatShading === true ) {

		node = normalFlat;

	} else {

		node = varying( transformNormalToView( normalLocal ), 'v_normalView' ).normalize();

	}

	return node;

}, 'vec3' ).once() )().toVar( 'normalView' );

const normalWorld = /*@__PURE__*/ varying( normalView.transformDirection( cameraViewMatrix ), 'v_normalWorld' ).normalize().toVar( 'normalWorld' );

const transformedNormalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.setupNormal();

}, 'vec3' ).once() )().mul( faceDirection ).toVar( 'transformedNormalView' );


const transformedNormalWorld = /*@__PURE__*/ transformedNormalView.transformDirection( cameraViewMatrix ).toVar( 'transformedNormalWorld' );

const transformedClearcoatNormalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.setupClearcoatNormal();

}, 'vec3' ).once() )().mul( faceDirection ).toVar( 'transformedClearcoatNormalView' );

const transformNormal = /*@__PURE__*/ Fn( ( [ normal, matrix = modelWorldMatrix ] ) => {

	const m = mat3( matrix );

	const transformedNormal = normal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

	return m.mul( transformedNormal ).xyz;

} );

const transformNormalToView = /*@__PURE__*/ Fn( ( [ normal ], builder ) => {

	const modelNormalViewMatrix = builder.renderer.nodes.modelNormalViewMatrix;

	if ( modelNormalViewMatrix !== null ) {

		return modelNormalViewMatrix.transformDirection( normal );

	}

	//

	const transformedNormal = modelNormalMatrix.mul( normal );

	return cameraViewMatrix.transformDirection( transformedNormal );

} );

const materialRefractionRatio = /*@__PURE__*/ uniform( 0 ).onReference( ( { material } ) => material ).onRenderUpdate( ( { material } ) => material.refractionRatio );

const reflectView = /*@__PURE__*/ positionViewDirection.negate().reflect( transformedNormalView );
const refractView = /*@__PURE__*/ positionViewDirection.negate().refract( transformedNormalView, materialRefractionRatio );

const reflectVector = /*@__PURE__*/ reflectView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
const refractVector = /*@__PURE__*/ refractView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );

class CubeTextureNode extends TextureNode {

	static get type() {

		return 'CubeTextureNode';

	}

	constructor( value, uvNode = null, levelNode = null, biasNode = null ) {

		super( value, uvNode, levelNode, biasNode );

		this.isCubeTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	getDefaultUV() {

		const texture = this.value;

		if ( texture.mapping === CubeReflectionMapping ) {

			return reflectVector;

		} else if ( texture.mapping === CubeRefractionMapping ) {

			return refractVector;

		} else {

			console.error( 'THREE.CubeTextureNode: Mapping "%s" not supported.', texture.mapping );

			return vec3( 0, 0, 0 );

		}

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

const cubeTexture = /*@__PURE__*/ nodeProxy( CubeTextureNode );

class BufferNode extends UniformNode {

	static get type() {

		return 'BufferNode';

	}

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

	}

	getElementType( builder ) {

		return this.getNodeType( builder );

	}

	getInputType( /*builder*/ ) {

		return 'buffer';

	}

}

const buffer = ( value, type, count ) => nodeObject( new BufferNode( value, type, count ) );

class UniformArrayElementNode extends ArrayElementNode {

	static get type() {

		return 'UniformArrayElementNode';

	}

	constructor( arrayBuffer, indexNode ) {

		super( arrayBuffer, indexNode );

		this.isArrayBufferElementNode = true;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const type = this.getNodeType();

		return builder.format( snippet, 'vec4', type );

	}

}

class UniformArrayNode extends BufferNode {

	static get type() {

		return 'UniformArrayNode';

	}

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

		let arrayType = Float32Array;

		if ( this._elementType.charAt( 0 ) === 'i' ) arrayType = Int32Array;
		else if ( this._elementType.charAt( 0 ) === 'u' ) arrayType = Uint32Array;

		this.value = new arrayType( length * 4 );
		this.bufferCount = length;
		this.bufferType = builder.changeComponentType( 'vec4', builder.getComponentType( this._elementType ) );

		return super.setup( builder );

	}

	element( indexNode ) {

		return nodeObject( new UniformArrayElementNode( this, nodeObject( indexNode ) ) );

	}

}

const uniformArray = ( values, nodeType ) => nodeObject( new UniformArrayNode( values, nodeType ) );

//

const uniforms = ( values, nodeType ) => { // @deprecated, r168

	console.warn( 'TSL.UniformArrayNode: uniforms() has been renamed to uniformArray().' );
	return nodeObject( new UniformArrayNode( values, nodeType ) );

};

class ReferenceElementNode extends ArrayElementNode {

	static get type() {

		return 'ReferenceElementNode';

	}

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

// TODO: Extends this from ReferenceBaseNode
class ReferenceNode extends Node {

	static get type() {

		return 'ReferenceNode';

	}

	constructor( property, uniformType, object = null, count = null ) {

		super();

		this.property = property;
		this.uniformType = uniformType;
		this.object = object;
		this.count = count;

		this.properties = property.split( '.' );
		this.reference = object;
		this.node = null;
		this.group = null;
		this.name = null;

		this.updateType = NodeUpdateType.OBJECT;

	}

	element( indexNode ) {

		return nodeObject( new ReferenceElementNode( this, nodeObject( indexNode ) ) );

	}

	setGroup( group ) {

		this.group = group;

		return this;

	}

	label( name ) {

		this.name = name;

		return this;

	}

	setNodeType( uniformType ) {

		let node = null;

		if ( this.count !== null ) {

			node = buffer( null, uniformType, this.count );

		} else if ( Array.isArray( this.getValueFromReference() ) ) {

			node = uniformArray( null, uniformType );

		} else if ( uniformType === 'texture' ) {

			node = texture( null );

		} else if ( uniformType === 'cubeTexture' ) {

			node = cubeTexture( null );

		} else {

			node = uniform( null, uniformType );

		}

		if ( this.group !== null ) {

			node.setGroup( this.group );

		}

		if ( this.name !== null ) node.label( this.name );

		this.node = node.getSelf();

	}

	getNodeType( builder ) {

		if ( this.node === null ) {

			this.updateReference( builder );
			this.updateValue();

		}

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

	updateReference( state ) {

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

class MaterialReferenceNode extends ReferenceNode {

	static get type() {

		return 'MaterialReferenceNode';

	}

	constructor( property, inputType, material = null ) {

		super( property, inputType, material );

		this.material = material;

		//this.updateType = NodeUpdateType.RENDER;

		this.isMaterialReferenceNode = true;

	}

	/*setNodeType( node ) {

		super.setNodeType( node );

		this.node.groupNode = renderGroup;

	}*/

	updateReference( state ) {

		this.reference = this.material !== null ? this.material : state.material;

		return this.reference;

	}

}

const materialReference = ( name, type, material ) => nodeObject( new MaterialReferenceNode( name, type, material ) );

const tangentGeometry = /*@__PURE__*/ Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'tangent' ) === false ) {

		builder.geometry.computeTangents();

	}

	return attribute( 'tangent', 'vec4' );

} )();

const tangentLocal = /*@__PURE__*/ tangentGeometry.xyz.toVar( 'tangentLocal' );
const tangentView = /*@__PURE__*/ modelViewMatrix.mul( vec4( tangentLocal, 0 ) ).xyz.varying( 'v_tangentView' ).normalize().toVar( 'tangentView' );
const tangentWorld = /*@__PURE__*/ tangentView.transformDirection( cameraViewMatrix ).varying( 'v_tangentWorld' ).normalize().toVar( 'tangentWorld' );
const transformedTangentView = /*@__PURE__*/ tangentView.toVar( 'transformedTangentView' );
const transformedTangentWorld = /*@__PURE__*/ transformedTangentView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedTangentWorld' );

const getBitangent = ( crossNormalTangent ) => crossNormalTangent.mul( tangentGeometry.w ).xyz;

const bitangentGeometry = /*@__PURE__*/ varying( getBitangent( normalGeometry.cross( tangentGeometry ) ), 'v_bitangentGeometry' ).normalize().toVar( 'bitangentGeometry' );
const bitangentLocal = /*@__PURE__*/ varying( getBitangent( normalLocal.cross( tangentLocal ) ), 'v_bitangentLocal' ).normalize().toVar( 'bitangentLocal' );
const bitangentView = /*@__PURE__*/ varying( getBitangent( normalView.cross( tangentView ) ), 'v_bitangentView' ).normalize().toVar( 'bitangentView' );
const bitangentWorld = /*@__PURE__*/ varying( getBitangent( normalWorld.cross( tangentWorld ) ), 'v_bitangentWorld' ).normalize().toVar( 'bitangentWorld' );
const transformedBitangentView = /*@__PURE__*/ getBitangent( transformedNormalView.cross( transformedTangentView ) ).normalize().toVar( 'transformedBitangentView' );
const transformedBitangentWorld = /*@__PURE__*/ transformedBitangentView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedBitangentWorld' );

const TBNViewMatrix = /*@__PURE__*/ mat3( tangentView, bitangentView, normalView );

const parallaxDirection = /*@__PURE__*/ positionViewDirection.mul( TBNViewMatrix )/*.normalize()*/;
const parallaxUV = ( uv, scale ) => uv.sub( parallaxDirection.mul( scale ) );

const transformedBentNormalView = /*@__PURE__*/ ( () => {

	// https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/anisotropy

	let bentNormal = anisotropyB.cross( positionViewDirection );
	bentNormal = bentNormal.cross( anisotropyB ).normalize();
	bentNormal = mix( bentNormal, transformedNormalView, anisotropy.mul( roughness.oneMinus() ).oneMinus().pow2().pow2() ).normalize();

	return bentNormal;


} )();

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2Arb = /*@__PURE__*/ Fn( ( inputs ) => {

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

	static get type() {

		return 'NormalMapNode';

	}

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

			outputNode = transformNormalToView( normalMap );

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

const normalMap = /*@__PURE__*/ nodeProxy( NormalMapNode );

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

const dHdxy_fwd = Fn( ( { textureNode, bumpScale } ) => {

	// It's used to preserve the same TextureNode instance
	const sampleTexture = ( callback ) => textureNode.cache().context( { getUV: ( texNode ) => callback( texNode.uvNode || uv() ), forceUVContext: true } );

	const Hll = float( sampleTexture( ( uvNode ) => uvNode ) );

	return vec2(
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdx() ) ) ).sub( Hll ),
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdy() ) ) ).sub( Hll )
	).mul( bumpScale );

} );

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

const perturbNormalArb = Fn( ( inputs ) => {

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

	static get type() {

		return 'BumpMapNode';

	}

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

const bumpMap = /*@__PURE__*/ nodeProxy( BumpMapNode );

const _propertyCache = new Map();

class MaterialNode extends Node {

	static get type() {

		return 'MaterialNode';

	}

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

			const colorNode = material.color !== undefined ? this.getColor( scope ) : vec3();

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

				node = this.getTexture( 'specular' ).r;

			} else {

				node = float( 1 );

			}

		} else if ( scope === MaterialNode.SPECULAR_INTENSITY ) {

			const specularIntensity = this.getFloat( scope );

			if ( material.specularMap ) {

				node = specularIntensity.mul( this.getTexture( scope ).a );

			} else {

				node = specularIntensity;

			}

		} else if ( scope === MaterialNode.SPECULAR_COLOR ) {

			const specularColorNode = this.getColor( scope );

			if ( material.specularColorMap && material.specularColorMap.isTexture === true ) {

				node = specularColorNode.mul( this.getTexture( scope ).rgb );

			} else {

				node = specularColorNode;

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

			const emissiveIntensityNode = this.getFloat( 'emissiveIntensity' );
			const emissiveNode = this.getColor( scope ).mul( emissiveIntensityNode );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = emissiveNode.mul( this.getTexture( scope ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.NORMAL ) {

			if ( material.normalMap ) {

				node = normalMap( this.getTexture( 'normal' ), this.getCache( 'normalScale', 'vec2' ) );
				node.normalMapType = material.normalMapType;

			} else if ( material.bumpMap ) {

				node = bumpMap( this.getTexture( 'bump' ).r, this.getFloat( 'bumpScale' ) );

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

				node = normalMap( this.getTexture( scope ), this.getCache( scope + 'Scale', 'vec2' ) );

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

		} else if ( scope === MaterialNode.ANISOTROPY ) {

			if ( material.anisotropyMap && material.anisotropyMap.isTexture === true ) {

				const anisotropyPolar = this.getTexture( scope );
				const anisotropyMat = mat2( materialAnisotropyVector.x, materialAnisotropyVector.y, materialAnisotropyVector.y.negate(), materialAnisotropyVector.x );

				node = anisotropyMat.mul( anisotropyPolar.rg.mul( 2.0 ).sub( vec2( 1.0 ) ).normalize().mul( anisotropyPolar.b ) );

			} else {

				node = materialAnisotropyVector;

			}

		} else if ( scope === MaterialNode.IRIDESCENCE_THICKNESS ) {

			const iridescenceThicknessMaximum = reference( '1', 'float', material.iridescenceThicknessRange );

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMinimum = reference( '0', 'float', material.iridescenceThicknessRange );

				node = iridescenceThicknessMaximum.sub( iridescenceThicknessMinimum ).mul( this.getTexture( scope ).g ).add( iridescenceThicknessMinimum );

			} else {

				node = iridescenceThicknessMaximum;

			}

		} else if ( scope === MaterialNode.TRANSMISSION ) {

			const transmissionNode = this.getFloat( scope );

			if ( material.transmissionMap ) {

				node = transmissionNode.mul( this.getTexture( scope ).r );

			} else {

				node = transmissionNode;

			}

		} else if ( scope === MaterialNode.THICKNESS ) {

			const thicknessNode = this.getFloat( scope );

			if ( material.thicknessMap ) {

				node = thicknessNode.mul( this.getTexture( scope ).g );

			} else {

				node = thicknessNode;

			}

		} else if ( scope === MaterialNode.IOR ) {

			node = this.getFloat( scope );

		} else if ( scope === MaterialNode.LIGHT_MAP ) {

			node = this.getTexture( scope ).rgb.mul( this.getFloat( 'lightMapIntensity' ) );

		} else if ( scope === MaterialNode.AO_MAP ) {

			node = this.getTexture( scope ).r.sub( 1.0 ).mul( this.getFloat( 'aoMapIntensity' ) ).add( 1.0 );

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
MaterialNode.SPECULAR = 'specular';
MaterialNode.SPECULAR_STRENGTH = 'specularStrength';
MaterialNode.SPECULAR_INTENSITY = 'specularIntensity';
MaterialNode.SPECULAR_COLOR = 'specularColor';
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
MaterialNode.ANISOTROPY = 'anisotropy';
MaterialNode.IRIDESCENCE = 'iridescence';
MaterialNode.IRIDESCENCE_IOR = 'iridescenceIOR';
MaterialNode.IRIDESCENCE_THICKNESS = 'iridescenceThickness';
MaterialNode.IOR = 'ior';
MaterialNode.TRANSMISSION = 'transmission';
MaterialNode.THICKNESS = 'thickness';
MaterialNode.ATTENUATION_DISTANCE = 'attenuationDistance';
MaterialNode.ATTENUATION_COLOR = 'attenuationColor';
MaterialNode.LINE_SCALE = 'scale';
MaterialNode.LINE_DASH_SIZE = 'dashSize';
MaterialNode.LINE_GAP_SIZE = 'gapSize';
MaterialNode.LINE_WIDTH = 'linewidth';
MaterialNode.LINE_DASH_OFFSET = 'dashOffset';
MaterialNode.POINT_WIDTH = 'pointWidth';
MaterialNode.DISPERSION = 'dispersion';
MaterialNode.LIGHT_MAP = 'light';
MaterialNode.AO_MAP = 'ao';

const materialAlphaTest = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );
const materialColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.COLOR );
const materialShininess = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHININESS );
const materialEmissive = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );
const materialOpacity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.OPACITY );
const materialSpecular = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR );

const materialSpecularIntensity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_INTENSITY );
const materialSpecularColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_COLOR );

const materialSpecularStrength = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_STRENGTH );
const materialReflectivity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.REFLECTIVITY );
const materialRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );
const materialMetalness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.METALNESS );
const materialNormal = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.NORMAL ).context( { getUV: null } );
const materialClearcoat = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT );
const materialClearcoatRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_ROUGHNESS );
const materialClearcoatNormal = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_NORMAL ).context( { getUV: null } );
const materialRotation = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ROTATION );
const materialSheen = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHEEN );
const materialSheenRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHEEN_ROUGHNESS );
const materialAnisotropy = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ANISOTROPY );
const materialIridescence = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE );
const materialIridescenceIOR = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_IOR );
const materialIridescenceThickness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_THICKNESS );
const materialTransmission = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.TRANSMISSION );
const materialThickness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.THICKNESS );
const materialIOR = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IOR );
const materialAttenuationDistance = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ATTENUATION_DISTANCE );
const materialAttenuationColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ATTENUATION_COLOR );
const materialLineScale = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_SCALE );
const materialLineDashSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_SIZE );
const materialLineGapSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_GAP_SIZE );
const materialLineWidth = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_WIDTH );
const materialLineDashOffset = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_OFFSET );
const materialPointWidth = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.POINT_WIDTH );
const materialDispersion = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.DISPERSION );
const materialLightMap = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LIGHT_MAP );
const materialAOMap = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.AO_MAP );
const materialAnisotropyVector = /*@__PURE__*/ uniform( new Vector2() ).onReference( function ( frame ) {

	return frame.material;

} ).onRenderUpdate( function ( { material } ) {

	this.value.set( material.anisotropy * Math.cos( material.anisotropyRotation ), material.anisotropy * Math.sin( material.anisotropyRotation ) );

} );

class ModelViewProjectionNode extends TempNode {

	static get type() {

		return 'ModelViewProjectionNode';

	}

	constructor( positionNode = null ) {

		super( 'vec4' );

		this.positionNode = positionNode;

	}

	setup( builder ) {

		if ( builder.shaderStage === 'fragment' ) {

			return varying( builder.context.mvp );

		}

		const position = this.positionNode || positionLocal;
		const viewMatrix = builder.renderer.nodes.modelViewMatrix || modelViewMatrix;

		return cameraProjectionMatrix.mul( viewMatrix ).mul( position );

	}

}

const modelViewProjection = /*@__PURE__*/ nodeProxy( ModelViewProjectionNode );

class IndexNode extends Node {

	static get type() {

		return 'IndexNode';

	}

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

			// The index of a vertex within a mesh.
			propertyName = builder.getVertexIndex();

		} else if ( scope === IndexNode.INSTANCE ) {

			// The index of either a mesh instance or an invocation of a compute shader.
			propertyName = builder.getInstanceIndex();

		} else if ( scope === IndexNode.DRAW ) {

			// The index of a draw call.
			propertyName = builder.getDrawIndex();

		} else if ( scope === IndexNode.INVOCATION_LOCAL ) {

			// The index of a compute invocation within the scope of a workgroup load.
			propertyName = builder.getInvocationLocalIndex();

		} else if ( scope === IndexNode.INVOCATION_SUBGROUP ) {

			// The index of a compute invocation within the scope of a subgroup.
			propertyName = builder.getInvocationSubgroupIndex();

		} else if ( scope === IndexNode.SUBGROUP ) {

			// The index of the subgroup the current compute invocation belongs to.
			propertyName = builder.getSubgroupIndex();

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
IndexNode.SUBGROUP = 'subgroup';
IndexNode.INVOCATION_LOCAL = 'invocationLocal';
IndexNode.INVOCATION_SUBGROUP = 'invocationSubgroup';
IndexNode.DRAW = 'draw';

const vertexIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.VERTEX );
const instanceIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INSTANCE );
const subgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.SUBGROUP );
const invocationSubgroupIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_SUBGROUP );
const invocationLocalIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.INVOCATION_LOCAL );
const drawIndex = /*@__PURE__*/ nodeImmutable( IndexNode, IndexNode.DRAW );

class InstanceNode extends Node {

	static get type() {

		return 'InstanceNode';

	}

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		this.instanceMatrixNode = null;

		this.instanceColorNode = null;

		this.updateType = NodeUpdateType.FRAME;

		this.buffer = null;
		this.bufferColor = null;

	}

	setup( builder ) {

		let instanceMatrixNode = this.instanceMatrixNode;
		let instanceColorNode = this.instanceColorNode;

		const instanceMesh = this.instanceMesh;

		if ( instanceMatrixNode === null ) {

			const instanceAttribute = instanceMesh.instanceMatrix;

			// Both WebGPU and WebGL backends have UBO max limited to 64kb. Matrix count number bigger than 1000 ( 16 * 4 * 1000 = 64kb ) will fallback to attribute.

			if ( instanceMesh.count <= 1000 ) {

				instanceMatrixNode = buffer( instanceAttribute.array, 'mat4', Math.max( instanceMesh.count, 1 ) ).element( instanceIndex );

			} else {

				const buffer = new InstancedInterleavedBuffer( instanceAttribute.array, 16, 1 );

				this.buffer = buffer;

				const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

				const instanceBuffers = [
					// F.Signature -> bufferAttribute( array, type, stride, offset )
					bufferFn( buffer, 'vec4', 16, 0 ),
					bufferFn( buffer, 'vec4', 16, 4 ),
					bufferFn( buffer, 'vec4', 16, 8 ),
					bufferFn( buffer, 'vec4', 16, 12 )
				];

				instanceMatrixNode = mat4( ...instanceBuffers );

			}

			this.instanceMatrixNode = instanceMatrixNode;

		}

		const instanceColorAttribute = instanceMesh.instanceColor;

		if ( instanceColorAttribute && instanceColorNode === null ) {

			const buffer = new InstancedBufferAttribute( instanceColorAttribute.array, 3 );

			const bufferFn = instanceColorAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			this.bufferColor = buffer;

			instanceColorNode = vec3( bufferFn( buffer, 'vec3', 3, 0 ) );

			this.instanceColorNode = instanceColorNode;

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
		positionLocal.assign( instancePosition );

		// NORMAL

		if ( builder.hasGeometryAttribute( 'normal' ) ) {

			const instanceNormal = transformNormal( normalLocal, instanceMatrixNode );

			// ASSIGNS

			normalLocal.assign( instanceNormal );

		}

		// COLOR

		if ( this.instanceColorNode !== null ) {

			varyingProperty( 'vec3', 'vInstanceColor' ).assign( this.instanceColorNode );

		}

	}

	update( /*frame*/ ) {

		if ( this.instanceMesh.instanceMatrix.usage !== DynamicDrawUsage && this.buffer != null && this.instanceMesh.instanceMatrix.version !== this.buffer.version ) {

			this.buffer.version = this.instanceMesh.instanceMatrix.version;

		}

		if ( this.instanceMesh.instanceColor && this.instanceMesh.instanceColor.usage !== DynamicDrawUsage && this.bufferColor != null && this.instanceMesh.instanceColor.version !== this.bufferColor.version ) {

			this.bufferColor.version = this.instanceMesh.instanceColor.version;

		}

	}

}

const instance = /*@__PURE__*/ nodeProxy( InstanceNode );

class BatchNode extends Node {

	static get type() {

		return 'BatchNode';

	}

	constructor( batchMesh ) {

		super( 'void' );

		this.batchMesh = batchMesh;


		this.batchingIdNode = null;

	}

	setup( builder ) {

		// POSITION

		if ( this.batchingIdNode === null ) {

			if ( builder.getDrawIndex() === null ) {

				this.batchingIdNode = instanceIndex;

			} else {

				this.batchingIdNode = drawIndex;

			}

		}

		const getIndirectIndex = Fn( ( [ id ] ) => {

			const size = textureSize( textureLoad( this.batchMesh._indirectTexture ), 0 );
			const x = int( id ).modInt( int( size ) );
			const y = int( id ).div( int( size ) );
			return textureLoad( this.batchMesh._indirectTexture, ivec2( x, y ) ).x;

		} ).setLayout( {
			name: 'getIndirectIndex',
			type: 'uint',
			inputs: [
				{ name: 'id', type: 'int' }
			]
		} );

		const indirectId = getIndirectIndex( int( this.batchingIdNode ) );

		const matricesTexture = this.batchMesh._matricesTexture;

		const size = textureSize( textureLoad( matricesTexture ), 0 );
		const j = float( indirectId ).mul( 4 ).toInt().toVar();

		const x = j.modInt( size );
		const y = j.div( int( size ) );
		const batchingMatrix = mat4(
			textureLoad( matricesTexture, ivec2( x, y ) ),
			textureLoad( matricesTexture, ivec2( x.add( 1 ), y ) ),
			textureLoad( matricesTexture, ivec2( x.add( 2 ), y ) ),
			textureLoad( matricesTexture, ivec2( x.add( 3 ), y ) )
		);


		const colorsTexture = this.batchMesh._colorsTexture;

		if ( colorsTexture !== null ) {

			const getBatchingColor = Fn( ( [ id ] ) => {

				const size = textureSize( textureLoad( colorsTexture ), 0 ).x;
				const j = id;
				const x = j.modInt( size );
				const y = j.div( size );
				return textureLoad( colorsTexture, ivec2( x, y ) ).rgb;

			} ).setLayout( {
				name: 'getBatchingColor',
				type: 'vec3',
				inputs: [
					{ name: 'id', type: 'int' }
				]
			} );

			const color = getBatchingColor( indirectId );

			varyingProperty( 'vec3', 'vBatchColor' ).assign( color );

		}

		const bm = mat3( batchingMatrix );

		positionLocal.assign( batchingMatrix.mul( positionLocal ) );

		const transformedNormal = normalLocal.div( vec3( bm[ 0 ].dot( bm[ 0 ] ), bm[ 1 ].dot( bm[ 1 ] ), bm[ 2 ].dot( bm[ 2 ] ) ) );

		const batchingNormal = bm.mul( transformedNormal ).xyz;

		normalLocal.assign( batchingNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.mulAssign( bm );

		}

	}

}

const batch = /*@__PURE__*/ nodeProxy( BatchNode );

const _frameId = new WeakMap();

class SkinningNode extends Node {

	static get type() {

		return 'SkinningNode';

	}

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
		this.previousBoneMatricesNode = null;

	}

	getSkinnedPosition( boneMatrices = this.boneMatricesNode, position = positionLocal ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode } = this;

		const boneMatX = boneMatrices.element( skinIndexNode.x );
		const boneMatY = boneMatrices.element( skinIndexNode.y );
		const boneMatZ = boneMatrices.element( skinIndexNode.z );
		const boneMatW = boneMatrices.element( skinIndexNode.w );

		// POSITION

		const skinVertex = bindMatrixNode.mul( position );

		const skinned = add(
			boneMatX.mul( skinWeightNode.x ).mul( skinVertex ),
			boneMatY.mul( skinWeightNode.y ).mul( skinVertex ),
			boneMatZ.mul( skinWeightNode.z ).mul( skinVertex ),
			boneMatW.mul( skinWeightNode.w ).mul( skinVertex )
		);

		return bindMatrixInverseNode.mul( skinned ).xyz;

	}

	getSkinnedNormal( boneMatrices = this.boneMatricesNode, normal = normalLocal ) {

		const { skinIndexNode, skinWeightNode, bindMatrixNode, bindMatrixInverseNode } = this;

		const boneMatX = boneMatrices.element( skinIndexNode.x );
		const boneMatY = boneMatrices.element( skinIndexNode.y );
		const boneMatZ = boneMatrices.element( skinIndexNode.z );
		const boneMatW = boneMatrices.element( skinIndexNode.w );

		// NORMAL

		let skinMatrix = add(
			skinWeightNode.x.mul( boneMatX ),
			skinWeightNode.y.mul( boneMatY ),
			skinWeightNode.z.mul( boneMatZ ),
			skinWeightNode.w.mul( boneMatW )
		);

		skinMatrix = bindMatrixInverseNode.mul( skinMatrix ).mul( bindMatrixNode );

		return skinMatrix.transformDirection( normal ).xyz;

	}

	getPreviousSkinnedPosition( builder ) {

		const skinnedMesh = builder.object;

		if ( this.previousBoneMatricesNode === null ) {

			skinnedMesh.skeleton.previousBoneMatrices = new Float32Array( skinnedMesh.skeleton.boneMatrices );

			this.previousBoneMatricesNode = referenceBuffer( 'skeleton.previousBoneMatrices', 'mat4', skinnedMesh.skeleton.bones.length );

		}

		return this.getSkinnedPosition( this.previousBoneMatricesNode, positionPrevious );

	}

	needsPreviousBoneMatrices( builder ) {

		const mrt = builder.renderer.getMRT();

		return mrt && mrt.has( 'velocity' );

	}

	setup( builder ) {

		if ( this.needsPreviousBoneMatrices( builder ) ) {

			positionPrevious.assign( this.getPreviousSkinnedPosition( builder ) );

		}

		const skinPosition = this.getSkinnedPosition();


		positionLocal.assign( skinPosition );

		if ( builder.hasGeometryAttribute( 'normal' ) ) {

			const skinNormal = this.getSkinnedNormal();

			normalLocal.assign( skinNormal );

			if ( builder.hasGeometryAttribute( 'tangent' ) ) {

				tangentLocal.assign( skinNormal );

			}

		}

	}

	generate( builder, output ) {

		if ( output !== 'void' ) {

			return positionLocal.build( builder, output );

		}

	}

	update( frame ) {

		const object = this.useReference ? frame.object : this.skinnedMesh;
		const skeleton = object.skeleton;

		if ( _frameId.get( skeleton ) === frame.frameId ) return;

		_frameId.set( skeleton, frame.frameId );

		if ( this.previousBoneMatricesNode !== null ) skeleton.previousBoneMatrices.set( skeleton.boneMatrices );

		skeleton.update();

	}

}

const skinning = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh ) );
const skinningReference = ( skinnedMesh ) => nodeObject( new SkinningNode( skinnedMesh, true ) );

class LoopNode extends Node {

	static get type() {

		return 'LoopNode';

	}

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

		const stack = builder.addStack(); // TODO: cache() it

		properties.returnsNode = this.params[ this.params.length - 1 ]( inputs, stack, builder );
		properties.stackNode = stack;

		builder.removeStack();

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

				if ( typeof start === 'number' ) start = builder.generateConst( type, start );
				else if ( start && start.isNode ) start = start.build( builder, type );

				if ( typeof end === 'number' ) end = builder.generateConst( type, end );
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

		const stackSnippet = stackNode.build( builder, 'void' );

		const returnsSnippet = properties.returnsNode ? properties.returnsNode.build( builder ) : '';

		builder.removeFlowTab().addFlowCode( '\n' + builder.tab + stackSnippet );

		for ( let i = 0, l = this.params.length - 1; i < l; i ++ ) {

			builder.addFlowCode( ( i === 0 ? '' : builder.tab ) + '}\n\n' ).removeFlowTab();

		}

		builder.addFlowTab();

		return returnsSnippet;

	}

}

const Loop = ( ...params ) => nodeObject( new LoopNode( nodeArray( params, 'int' ) ) ).append();
const Continue = () => expression( 'continue' ).append();
const Break = () => expression( 'break' ).append();

//

const loop = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.LoopNode: loop() has been renamed to Loop().' );
	return Loop( ...params );

};

const _morphTextures = /*@__PURE__*/ new WeakMap();
const _morphVec4 = /*@__PURE__*/ new Vector4();

const getMorph = /*@__PURE__*/ Fn( ( { bufferMap, influence, stride, width, depth, offset } ) => {

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

	let entry = _morphTextures.get( geometry );

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

					_morphVec4.fromBufferAttribute( morphTarget, j );

					buffer[ offset + stride + 0 ] = _morphVec4.x;
					buffer[ offset + stride + 1 ] = _morphVec4.y;
					buffer[ offset + stride + 2 ] = _morphVec4.z;
					buffer[ offset + stride + 3 ] = 0;

				}

				if ( hasMorphNormals === true ) {

					_morphVec4.fromBufferAttribute( morphNormal, j );

					buffer[ offset + stride + 4 ] = _morphVec4.x;
					buffer[ offset + stride + 5 ] = _morphVec4.y;
					buffer[ offset + stride + 6 ] = _morphVec4.z;
					buffer[ offset + stride + 7 ] = 0;

				}

				if ( hasMorphColors === true ) {

					_morphVec4.fromBufferAttribute( morphColor, j );

					buffer[ offset + stride + 8 ] = _morphVec4.x;
					buffer[ offset + stride + 9 ] = _morphVec4.y;
					buffer[ offset + stride + 10 ] = _morphVec4.z;
					buffer[ offset + stride + 11 ] = ( morphColor.itemSize === 4 ) ? _morphVec4.w : 1;

				}

			}

		}

		entry = {
			count: morphTargetsCount,
			texture: bufferTexture,
			stride: vertexDataCount,
			size: new Vector2( width, height )
		};

		_morphTextures.set( geometry, entry );

		function disposeTexture() {

			bufferTexture.dispose();

			_morphTextures.delete( geometry );

			geometry.removeEventListener( 'dispose', disposeTexture );

		}

		geometry.addEventListener( 'dispose', disposeTexture );

	}

	return entry;

}


class MorphNode extends Node {

	static get type() {

		return 'MorphNode';

	}

	constructor( mesh ) {

		super( 'void' );

		this.mesh = mesh;
		this.morphBaseInfluence = uniform( 1 );

		this.updateType = NodeUpdateType.OBJECT;

	}

	setup( builder ) {

		const { geometry } = builder;

		const hasMorphPosition = geometry.morphAttributes.position !== undefined;
		const hasMorphNormals = geometry.hasAttribute( 'normal' ) && geometry.morphAttributes.normal !== undefined;

		const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
		const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

		// nodes

		const { texture: bufferMap, stride, size } = getEntry( geometry );

		if ( hasMorphPosition === true ) positionLocal.mulAssign( this.morphBaseInfluence );
		if ( hasMorphNormals === true ) normalLocal.mulAssign( this.morphBaseInfluence );

		const width = int( size.width );

		Loop( morphTargetsCount, ( { i } ) => {

			const influence = float( 0 ).toVar();

			if ( this.mesh.count > 1 && ( this.mesh.morphTexture !== null && this.mesh.morphTexture !== undefined ) ) {

				influence.assign( textureLoad( this.mesh.morphTexture, ivec2( int( i ).add( 1 ), int( instanceIndex ) ) ).r );

			} else {

				influence.assign( reference( 'morphTargetInfluences', 'float' ).element( i ).toVar() );

			}

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

const morphReference = /*@__PURE__*/ nodeProxy( MorphNode );

class LightingNode extends Node {

	static get type() {

		return 'LightingNode';

	}

	constructor() {

		super( 'vec3' );

		this.isLightingNode = true;

	}

	generate( /*builder*/ ) {

		console.warn( 'Abstract function.' );

	}

}

class AONode extends LightingNode {

	static get type() {

		return 'AONode';

	}

	constructor( aoNode = null ) {

		super();

		this.aoNode = aoNode;

	}

	setup( builder ) {

		builder.context.ambientOcclusion.mulAssign( this.aoNode );

	}

}

class LightingContextNode extends ContextNode {

	static get type() {

		return 'LightingContextNode';

	}

	constructor( node, lightingModel = null, backdropNode = null, backdropAlphaNode = null ) {

		super( node );

		this.lightingModel = lightingModel;
		this.backdropNode = backdropNode;
		this.backdropAlphaNode = backdropAlphaNode;

		this._value = null;

	}

	getContext() {

		const { backdropNode, backdropAlphaNode } = this;

		const directDiffuse = vec3().toVar( 'directDiffuse' ),
			directSpecular = vec3().toVar( 'directSpecular' ),
			indirectDiffuse = vec3().toVar( 'indirectDiffuse' ),
			indirectSpecular = vec3().toVar( 'indirectSpecular' );

		const reflectedLight = {
			directDiffuse,
			directSpecular,
			indirectDiffuse,
			indirectSpecular
		};

		const context = {
			radiance: vec3().toVar( 'radiance' ),
			irradiance: vec3().toVar( 'irradiance' ),
			iblIrradiance: vec3().toVar( 'iblIrradiance' ),
			ambientOcclusion: float( 1 ).toVar( 'ambientOcclusion' ),
			reflectedLight,
			backdrop: backdropNode,
			backdropAlpha: backdropAlphaNode
		};

		return context;

	}

	setup( builder ) {

		this.value = this._value || ( this._value = this.getContext() );
		this.value.lightingModel = this.lightingModel || builder.context.lightingModel;

		return super.setup( builder );

	}

}

const lightingContext = /*@__PURE__*/ nodeProxy( LightingContextNode );

class IrradianceNode extends LightingNode {

	static get type() {

		return 'IrradianceNode';

	}

	constructor( node ) {

		super();

		this.node = node;

	}

	setup( builder ) {

		builder.context.irradiance.addAssign( this.node );

	}

}

let screenSizeVec, viewportVec;

class ScreenNode extends Node {

	static get type() {

		return 'ScreenNode';

	}

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		if ( this.scope === ScreenNode.VIEWPORT ) return 'vec4';
		else return 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ScreenNode.SIZE || this.scope === ScreenNode.VIEWPORT ) {

			updateType = NodeUpdateType.RENDER;

		}

		this.updateType = updateType;

		return updateType;

	}

	update( { renderer } ) {

		const renderTarget = renderer.getRenderTarget();

		if ( this.scope === ScreenNode.VIEWPORT ) {

			if ( renderTarget !== null ) {

				viewportVec.copy( renderTarget.viewport );

			} else {

				renderer.getViewport( viewportVec );

				viewportVec.multiplyScalar( renderer.getPixelRatio() );

			}

		} else {

			if ( renderTarget !== null ) {

				screenSizeVec.width = renderTarget.width;
				screenSizeVec.height = renderTarget.height;

			} else {

				renderer.getDrawingBufferSize( screenSizeVec );

			}

		}

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let output = null;

		if ( scope === ScreenNode.SIZE ) {

			output = uniform( screenSizeVec || ( screenSizeVec = new Vector2() ) );

		} else if ( scope === ScreenNode.VIEWPORT ) {

			output = uniform( viewportVec || ( viewportVec = new Vector4() ) );

		} else {

			output = vec2( screenCoordinate.div( screenSize ) );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ScreenNode.COORDINATE ) {

			let coord = builder.getFragCoord();

			if ( builder.isFlipY() ) {

				// follow webgpu standards

				const size = builder.getNodeProperties( screenSize ).outputNode.build( builder );

				coord = `${ builder.getType( 'vec2' ) }( ${ coord }.x, ${ size }.y - ${ coord }.y )`;

			}

			return coord;

		}

		return super.generate( builder );

	}

}

ScreenNode.COORDINATE = 'coordinate';
ScreenNode.VIEWPORT = 'viewport';
ScreenNode.SIZE = 'size';
ScreenNode.UV = 'uv';

// Screen

const screenUV = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.UV );
const screenSize = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.SIZE );
const screenCoordinate = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.COORDINATE );

// Viewport

const viewport = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.VIEWPORT );
const viewportSize = viewport.zw;
const viewportCoordinate = /*@__PURE__*/ screenCoordinate.sub( viewport.xy );
const viewportUV = /*@__PURE__*/ viewportCoordinate.div( viewportSize );

// Deprecated

const viewportResolution = /*@__PURE__*/ ( Fn( () => { // @deprecated, r169

	console.warn( 'TSL.ViewportNode: "viewportResolution" is deprecated. Use "screenSize" instead.' );

	return screenSize;

}, 'vec2' ).once() )();

const viewportTopLeft = /*@__PURE__*/ ( Fn( () => { // @deprecated, r168

	console.warn( 'TSL.ViewportNode: "viewportTopLeft" is deprecated. Use "screenUV" instead.' );

	return screenUV;

}, 'vec2' ).once() )();

const viewportBottomLeft = /*@__PURE__*/ ( Fn( () => { // @deprecated, r168

	console.warn( 'TSL.ViewportNode: "viewportBottomLeft" is deprecated. Use "screenUV.flipY()" instead.' );

	return screenUV.flipY();

}, 'vec2' ).once() )();

const _size$4 = /*@__PURE__*/ new Vector2();

class ViewportTextureNode extends TextureNode {

	static get type() {

		return 'ViewportTextureNode';

	}

	constructor( uvNode = screenUV, levelNode = null, framebufferTexture = null ) {

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
		renderer.getDrawingBufferSize( _size$4 );

		//

		const framebufferTexture = this.value;

		if ( framebufferTexture.image.width !== _size$4.width || framebufferTexture.image.height !== _size$4.height ) {

			framebufferTexture.image.width = _size$4.width;
			framebufferTexture.image.height = _size$4.height;
			framebufferTexture.needsUpdate = true;

		}

		//

		const currentGenerateMipmaps = framebufferTexture.generateMipmaps;
		framebufferTexture.generateMipmaps = this.generateMipmaps;

		renderer.copyFramebufferToTexture( framebufferTexture );

		framebufferTexture.generateMipmaps = currentGenerateMipmaps;

	}

	clone() {

		const viewportTextureNode = new this.constructor( this.uvNode, this.levelNode, this.value );
		viewportTextureNode.generateMipmaps = this.generateMipmaps;

		return viewportTextureNode;

	}

}

const viewportTexture = /*@__PURE__*/ nodeProxy( ViewportTextureNode );
const viewportMipTexture = /*@__PURE__*/ nodeProxy( ViewportTextureNode, null, null, { generateMipmaps: true } );

let sharedDepthbuffer = null;

class ViewportDepthTextureNode extends ViewportTextureNode {

	static get type() {

		return 'ViewportDepthTextureNode';

	}

	constructor( uvNode = screenUV, levelNode = null ) {

		if ( sharedDepthbuffer === null ) {

			sharedDepthbuffer = new DepthTexture();

		}

		super( uvNode, levelNode, sharedDepthbuffer );

	}

}

const viewportDepthTexture = /*@__PURE__*/ nodeProxy( ViewportDepthTextureNode );

class ViewportDepthNode extends Node {

	static get type() {

		return 'ViewportDepthNode';

	}

	constructor( scope, valueNode = null ) {

		super( 'float' );

		this.scope = scope;
		this.valueNode = valueNode;

		this.isViewportDepthNode = true;

	}

	generate( builder ) {

		const { scope } = this;

		if ( scope === ViewportDepthNode.DEPTH_BASE ) {

			return builder.getFragDepth();

		}

		return super.generate( builder );

	}

	setup( { camera } ) {

		const { scope } = this;
		const value = this.valueNode;

		let node = null;

		if ( scope === ViewportDepthNode.DEPTH_BASE ) {

			if ( value !== null ) {

 				node = depthBase().assign( value );

			}

		} else if ( scope === ViewportDepthNode.DEPTH ) {

			if ( camera.isPerspectiveCamera ) {

				node = viewZToPerspectiveDepth( positionView.z, cameraNear, cameraFar );

			} else {

				node = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

			}

		} else if ( scope === ViewportDepthNode.LINEAR_DEPTH ) {

			if ( value !== null ) {

				if ( camera.isPerspectiveCamera ) {

					const viewZ = perspectiveDepthToViewZ( value, cameraNear, cameraFar );

					node = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

				} else {

					node = value;

				}

			} else {

				node = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

			}

		}

		return node;

	}

}

ViewportDepthNode.DEPTH_BASE = 'depthBase';
ViewportDepthNode.DEPTH = 'depth';
ViewportDepthNode.LINEAR_DEPTH = 'linearDepth';

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

// -near maps to 0; -far maps to 1
const viewZToOrthographicDepth = ( viewZ, near, far ) => viewZ.add( near ).div( near.sub( far ) );

// maps orthographic depth in [ 0, 1 ] to viewZ
const orthographicDepthToViewZ = ( depth, near, far ) => near.sub( far ).mul( depth ).sub( near );

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

// -near maps to 0; -far maps to 1
const viewZToPerspectiveDepth = ( viewZ, near, far ) => near.add( viewZ ).mul( far ).div( far.sub( near ).mul( viewZ ) );

// maps perspective depth in [ 0, 1 ] to viewZ
const perspectiveDepthToViewZ = ( depth, near, far ) => near.mul( far ).div( far.sub( near ).mul( depth ).sub( far ) );

const perspectiveDepthToLogarithmicDepth = ( perspectiveW, near, far ) => {

	// The final logarithmic depth formula used here is adapted from one described in an
	// article by Thatcher Ulrich (see http://tulrich.com/geekstuff/log_depth_buffer.txt),
	// which was an improvement upon an earlier formula one described in an
	// Outerra article (https://outerra.blogspot.com/2009/08/logarithmic-z-buffer.html).
	// Ulrich's formula is the following:
	//     z = K * log( w / cameraNear ) / log( cameraFar / cameraNear )
	//     where K = 2^k - 1, and k is the number of bits in the depth buffer.
	// The Outerra variant ignored the camera near plane (it assumed it was 0) and instead
	// opted for a "C-constant" for resolution adjustment of objects near the camera.
	// Outerra states: "Notice that the 'C' variant doesn’t use a near plane distance, it has it
	// set at 0" (quote from https://outerra.blogspot.com/2012/11/maximizing-depth-buffer-range-and.html).
	// Ulrich's variant has the benefit of constant relative precision over the whole near-far range.
	// It was debated here whether Outerra's "C-constant" or Ulrich's "near plane" variant should
	// be used, and ultimately Ulrich's "near plane" version was chosen.
	// Outerra eventually made another improvement to their original "C-constant" variant,
	// but it still does not incorporate the camera near plane (for this version,
	// see https://outerra.blogspot.com/2013/07/logarithmic-depth-buffer-optimizations.html).
	// Here we make 4 changes to Ulrich's formula:
	// 1. Clamp the camera near plane so we don't divide by 0.
	// 2. Use log2 instead of log to avoid an extra multiply (shaders implement log using log2).
	// 3. Assume K is 1 (K = maximum value in depth buffer; see Ulrich's formula above).
	// 4. Add 1 to each division by cameraNear to ensure the depth curve is shifted to the left as cameraNear increases.
	// For visual representation of this depth curve, see https://www.desmos.com/calculator/lz5rqfysih
	near = near.max( 1e-6 ).toVar();
	const numerator = log2( perspectiveW.div( near ).add( 1 ) );
	const denominator = log2( far.div( near ).add( 1 ) );
	return numerator.div( denominator );

};

const depthBase = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_BASE );

const depth = /*@__PURE__*/ nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH );
const linearDepth = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.LINEAR_DEPTH );
const viewportLinearDepth = /*@__PURE__*/ linearDepth( viewportDepthTexture() );

depth.assign = ( value ) => depthBase( value );

class BuiltinNode extends Node {

	constructor( name ) {

		super( 'float' );

		this.name = name;

		this.isBuiltinNode = true;

	}

	generate( /* builder */ ) {

		return this.name;

	}

}

const builtin = nodeProxy( BuiltinNode );

class ClippingNode extends Node {

	static get type() {

		return 'ClippingNode';

	}

	constructor( scope = ClippingNode.DEFAULT ) {

		super();

		this.scope = scope;

	}

	setup( builder ) {

		super.setup( builder );

		const clippingContext = builder.clippingContext;
		const { intersectionPlanes, unionPlanes } = clippingContext;

		this.hardwareClipping = builder.material.hardwareClipping;

		if ( this.scope === ClippingNode.ALPHA_TO_COVERAGE ) {

			return this.setupAlphaToCoverage( intersectionPlanes, unionPlanes );

		} else if ( this.scope === ClippingNode.HARDWARE ) {

			return this.setupHardwareClipping( unionPlanes, builder );

		} else {

			return this.setupDefault( intersectionPlanes, unionPlanes );

		}

	}

	setupAlphaToCoverage( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const distanceToPlane = float().toVar( 'distanceToPlane' );
			const distanceGradient = float().toVar( 'distanceToGradient' );

			const clipOpacity = float( 1 ).toVar( 'clipOpacity' );

			const numUnionPlanes = unionPlanes.length;

			if ( ! this.hardwareClipping && numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				Loop( numUnionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					clipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ) );

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
				const intersectionClipOpacity = float( 1 ).toVar( 'intersectionClipOpacity' );

				Loop( numIntersectionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );

					distanceToPlane.assign( positionView.dot( plane.xyz ).negate().add( plane.w ) );
					distanceGradient.assign( distanceToPlane.fwidth().div( 2.0 ) );

					intersectionClipOpacity.mulAssign( smoothstep( distanceGradient.negate(), distanceGradient, distanceToPlane ).oneMinus() );

				} );

				clipOpacity.mulAssign( intersectionClipOpacity.oneMinus() );

			}

			diffuseColor.a.mulAssign( clipOpacity );

			diffuseColor.a.equal( 0.0 ).discard();

		} )();

	}

	setupDefault( intersectionPlanes, unionPlanes ) {

		return Fn( () => {

			const numUnionPlanes = unionPlanes.length;

			if ( ! this.hardwareClipping && numUnionPlanes > 0 ) {

				const clippingPlanes = uniformArray( unionPlanes );

				Loop( numUnionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );
					positionView.dot( plane.xyz ).greaterThan( plane.w ).discard();

				} );

			}

			const numIntersectionPlanes = intersectionPlanes.length;

			if ( numIntersectionPlanes > 0 ) {

				const clippingPlanes = uniformArray( intersectionPlanes );
				const clipped = bool( true ).toVar( 'clipped' );

				Loop( numIntersectionPlanes, ( { i } ) => {

					const plane = clippingPlanes.element( i );
					clipped.assign( positionView.dot( plane.xyz ).greaterThan( plane.w ).and( clipped ) );

				} );

				clipped.discard();

			}

		} )();

	}

	setupHardwareClipping( unionPlanes, builder ) {

		const numUnionPlanes = unionPlanes.length;

		builder.enableHardwareClipping( numUnionPlanes );

		return Fn( () => {

			const clippingPlanes = uniformArray( unionPlanes );
			const hw_clip_distances = builtin( builder.getClipDistance() );

			Loop( numUnionPlanes, ( { i } ) => {

				const plane = clippingPlanes.element( i );

				const distance = positionView.dot( plane.xyz ).sub( plane.w ).negate();
				hw_clip_distances.element( i ).assign( distance );

			} );

		} )();

	}

}

ClippingNode.ALPHA_TO_COVERAGE = 'alphaToCoverage';
ClippingNode.DEFAULT = 'default';
ClippingNode.HARDWARE = 'hardware';

const clipping = () => nodeObject( new ClippingNode() );
const clippingAlpha = () => nodeObject( new ClippingNode( ClippingNode.ALPHA_TO_COVERAGE ) );
const hardwareClipping = () => nodeObject( new ClippingNode( ClippingNode.HARDWARE ) );

/**
 * See: https://casual-effects.com/research/Wyman2017Hashed/index.html
 */

const ALPHA_HASH_SCALE = 0.05; // Derived from trials only, and may be changed.

const hash2D = /*@__PURE__*/ Fn( ( [ value ] ) => {

	return fract( mul( 1.0e4, sin( mul( 17.0, value.x ).add( mul( 0.1, value.y ) ) ) ).mul( add( 0.1, abs( sin( mul( 13.0, value.y ).add( value.x ) ) ) ) ) );

} );

const hash3D = /*@__PURE__*/ Fn( ( [ value ] ) => {

	return hash2D( vec2( hash2D( value.xy ), value.z ) );

} );

const getAlphaHashThreshold = /*@__PURE__*/ Fn( ( [ position ] ) => {

	// Find the discretized derivatives of our coordinates
	const maxDeriv = max$1(
		length( dFdx( position.xyz ) ),
		length( dFdy( position.xyz ) )
	).toVar( 'maxDeriv' );

	const pixScale = float( 1 ).div( float( ALPHA_HASH_SCALE ).mul( maxDeriv ) ).toVar( 'pixScale' );

	// Find two nearest log-discretized noise scales
	const pixScales = vec2(
		exp2( floor( log2( pixScale ) ) ),
		exp2( ceil( log2( pixScale ) ) )
	).toVar( 'pixScales' );

	// Compute alpha thresholds at our two noise scales
	const alpha = vec2(
		hash3D( floor( pixScales.x.mul( position.xyz ) ) ),
		hash3D( floor( pixScales.y.mul( position.xyz ) ) ),
	).toVar( 'alpha' );

	// Factor to interpolate lerp with
	const lerpFactor = fract( log2( pixScale ) ).toVar( 'lerpFactor' );

	// Interpolate alpha threshold from noise at two scales
	const x = add( mul( lerpFactor.oneMinus(), alpha.x ), mul( lerpFactor, alpha.y ) ).toVar( 'x' );

	// Pass into CDF to compute uniformly distrib threshold
	const a = min$1( lerpFactor, lerpFactor.oneMinus() ).toVar( 'a' );
	const cases = vec3(
		x.mul( x ).div( mul( 2.0, a ).mul( sub( 1.0, a ) ) ),
		x.sub( mul( 0.5, a ) ).div( sub( 1.0, a ) ),
		sub( 1.0, sub( 1.0, x ).mul( sub( 1.0, x ) ).div( mul( 2.0, a ).mul( sub( 1.0, a ) ) ) ) ).toVar( 'cases' );

	// Find our final, uniformly distributed alpha threshold (ατ)
	const threshold = x.lessThan( a.oneMinus() ).select( x.lessThan( a ).select( cases.x, cases.y ), cases.z );

	// Avoids ατ == 0. Could also do ατ =1-ατ
	return clamp( threshold, 1.0e-6, 1.0 );

} );

class NodeMaterial extends Material {

	static get type() {

		return 'NodeMaterial';

	}

	get type() {

		return this.constructor.type;

	}

	set type( _value ) { /* */ }

	constructor() {

		super();

		this.isNodeMaterial = true;

		this.forceSinglePass = false;

		this.fog = true;
		this.lights = false;
		this.hardwareClipping = false;

		this.lightsNode = null;
		this.envNode = null;
		this.aoNode = null;

		this.colorNode = null;
		this.normalNode = null;
		this.opacityNode = null;
		this.backdropNode = null;
		this.backdropAlphaNode = null;
		this.alphaTestNode = null;

		this.positionNode = null;
		this.geometryNode = null;

		this.depthNode = null;
		this.shadowNode = null;
		this.shadowPositionNode = null;

		this.outputNode = null;
		this.mrtNode = null;

		this.fragmentNode = null;
		this.vertexNode = null;

	}

	customProgramCacheKey() {

		return this.type + getCacheKey$1( this );

	}

	build( builder ) {

		this.setup( builder );

	}

	setupObserver( builder ) {

		return new NodeMaterialObserver( builder );

	}

	setup( builder ) {

		builder.context.setupNormal = () => this.setupNormal( builder );

		const renderer = builder.renderer;
		const renderTarget = renderer.getRenderTarget();

		// < VERTEX STAGE >

		builder.addStack();

		builder.stack.outputNode = this.vertexNode || this.setupPosition( builder );

		if ( this.geometryNode !== null ) {

			builder.stack.outputNode = builder.stack.outputNode.bypass( this.geometryNode );

		}

		builder.addFlow( 'vertex', builder.removeStack() );

		// < FRAGMENT STAGE >

		builder.addStack();

		let resultNode;

		const clippingNode = this.setupClipping( builder );

		if ( this.depthWrite === true ) {

			// only write depth if depth buffer is configured

			if ( renderTarget !== null ) {

				if ( renderTarget.depthBuffer === true ) this.setupDepth( builder );

			} else {

				if ( renderer.depth === true ) this.setupDepth( builder );

			}

		}

		if ( this.fragmentNode === null ) {

			this.setupDiffuseColor( builder );
			this.setupVariants( builder );

			const outgoingLightNode = this.setupLighting( builder );

			if ( clippingNode !== null ) builder.stack.add( clippingNode );

			// force unsigned floats - useful for RenderTargets

			const basicOutput = vec4( outgoingLightNode, diffuseColor.a ).max( 0 );

			resultNode = this.setupOutput( builder, basicOutput );

			// OUTPUT NODE

			output.assign( resultNode );

			//

			if ( this.outputNode !== null ) resultNode = this.outputNode;

			// MRT

			if ( renderTarget !== null ) {

				const mrt = renderer.getMRT();
				const materialMRT = this.mrtNode;

				if ( mrt !== null ) {

					resultNode = mrt;

					if ( materialMRT !== null ) {

						resultNode = mrt.merge( materialMRT );

					}

				} else if ( materialMRT !== null ) {

					resultNode = materialMRT;

				}

			}

		} else {

			let fragmentNode = this.fragmentNode;

			if ( fragmentNode.isOutputStructNode !== true ) {

				fragmentNode = vec4( fragmentNode );

			}

			resultNode = this.setupOutput( builder, fragmentNode );

		}

		builder.stack.outputNode = resultNode;

		builder.addFlow( 'fragment', builder.removeStack() );

		// < MONITOR >

		builder.monitor = this.setupObserver( builder );

	}

	setupClipping( builder ) {

		if ( builder.clippingContext === null ) return null;

		const { unionPlanes, intersectionPlanes } = builder.clippingContext;

		let result = null;

		if ( unionPlanes.length > 0 || intersectionPlanes.length > 0 ) {

			const samples = builder.renderer.samples;

			if ( this.alphaToCoverage && samples > 1 ) {

				// to be added to flow when the color/alpha value has been determined
				result = clippingAlpha();

			} else {

				builder.stack.add( clipping() );

			}

		}

		return result;

	}

	setupHardwareClipping( builder ) {

		this.hardwareClipping = false;

		if ( builder.clippingContext === null ) return;

		const candidateCount = builder.clippingContext.unionPlanes.length;

		// 8 planes supported by WebGL ANGLE_clip_cull_distance and WebGPU clip-distances

		if ( candidateCount > 0 && candidateCount <= 8 && builder.isAvailable( 'clipDistance' ) ) {

			builder.stack.add( hardwareClipping() );

			this.hardwareClipping = true;

		}

		return;

	}

	setupDepth( builder ) {

		const { renderer, camera } = builder;

		// Depth

		let depthNode = this.depthNode;

		if ( depthNode === null ) {

			const mrt = renderer.getMRT();

			if ( mrt && mrt.has( 'depth' ) ) {

				depthNode = mrt.get( 'depth' );

			} else if ( renderer.logarithmicDepthBuffer === true ) {

				if ( camera.isPerspectiveCamera ) {

					depthNode = perspectiveDepthToLogarithmicDepth( modelViewProjection().w, cameraNear, cameraFar );

				} else {

					depthNode = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

				}

			}

		}

		if ( depthNode !== null ) {

			depth.assign( depthNode ).append();

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

		if ( this.displacementMap ) {

			const displacementMap = materialReference( 'displacementMap', 'texture' );
			const displacementScale = materialReference( 'displacementScale', 'float' );
			const displacementBias = materialReference( 'displacementBias', 'float' );

			positionLocal.addAssign( normalLocal.normalize().mul( ( displacementMap.x.mul( displacementScale ).add( displacementBias ) ) ) );

		}

		if ( object.isBatchedMesh ) {

			batch( object ).append();

		}

		if ( ( object.instanceMatrix && object.instanceMatrix.isInstancedBufferAttribute === true ) ) {

			instance( object ).append();

		}

		if ( this.positionNode !== null ) {

			positionLocal.assign( this.positionNode );

		}

		this.setupHardwareClipping( builder );

		const mvp = modelViewProjection();

		builder.context.vertex = builder.removeStack();
		builder.context.mvp = mvp;

		return mvp;

	}

	setupDiffuseColor( { object, geometry } ) {

		let colorNode = this.colorNode ? vec4( this.colorNode ) : materialColor;

		// VERTEX COLORS

		if ( this.vertexColors === true && geometry.hasAttribute( 'color' ) ) {

			colorNode = vec4( colorNode.xyz.mul( attribute( 'color', 'vec3' ) ), colorNode.a );

		}

		// Instanced colors

		if ( object.instanceColor ) {

			const instanceColor = varyingProperty( 'vec3', 'vInstanceColor' );

			colorNode = instanceColor.mul( colorNode );

		}

		if ( object.isBatchedMesh && object._colorsTexture ) {

			const batchColor = varyingProperty( 'vec3', 'vBatchColor' );

			colorNode = batchColor.mul( colorNode );

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

		// ALPHA HASH

		if ( this.alphaHash === true ) {

			diffuseColor.a.lessThan( getAlphaHashThreshold( positionLocal ) ).discard();

		}

		if ( this.transparent === false && this.blending === NormalBlending && this.alphaToCoverage === false ) {

			diffuseColor.a.assign( 1.0 );

		}

	}

	setupVariants( /*builder*/ ) {

		// Interface function.

	}

	setupOutgoingLight() {

		return ( this.lights === true ) ? vec3( 0 ) : diffuseColor.rgb;

	}

	setupNormal() {

		return this.normalNode ? vec3( this.normalNode ) : materialNormal;

	}

	setupEnvironment( /*builder*/ ) {

		let node = null;

		if ( this.envNode ) {

			node = this.envNode;

		} else if ( this.envMap ) {

			node = this.envMap.isCubeTexture ? materialReference( 'envMap', 'cubeTexture' ) : materialReference( 'envMap', 'texture' );

		}

		return node;

	}

	setupLightMap( builder ) {

		let node = null;

		if ( builder.material.lightMap ) {

			node = new IrradianceNode( materialLightMap );

		}

		return node;

	}

	setupLights( builder ) {

		const materialLightsNode = [];

		//

		const envNode = this.setupEnvironment( builder );

		if ( envNode && envNode.isLightingNode ) {

			materialLightsNode.push( envNode );

		}

		const lightMapNode = this.setupLightMap( builder );

		if ( lightMapNode && lightMapNode.isLightingNode ) {

			materialLightsNode.push( lightMapNode );

		}

		if ( this.aoNode !== null || builder.material.aoMap ) {

			const aoNode = this.aoNode !== null ? this.aoNode : materialAOMap;

			materialLightsNode.push( new AONode( aoNode ) );

		}

		let lightsN = this.lightsNode || builder.lightsNode;

		if ( materialLightsNode.length > 0 ) {

			lightsN = builder.renderer.lighting.createNode( [ ...lightsN.getLights(), ...materialLightsNode ] );

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

		let outgoingLightNode = this.setupOutgoingLight( builder );

		if ( lightsNode && lightsNode.getScope().hasLights ) {

			const lightingModel = this.setupLightingModel( builder );

			outgoingLightNode = lightingContext( lightsNode, lightingModel, backdropNode, backdropAlphaNode );

		} else if ( backdropNode !== null ) {

			outgoingLightNode = vec3( backdropAlphaNode !== null ? mix( outgoingLightNode, backdropNode, backdropAlphaNode ) : backdropNode );

		}

		// EMISSIVE

		if ( ( emissiveNode && emissiveNode.isNode === true ) || ( material.emissive && material.emissive.isColor === true ) ) {

			emissive.assign( vec3( emissiveNode ? emissiveNode : materialEmissive ) );

			outgoingLightNode = outgoingLightNode.add( emissive );

		}

		return outgoingLightNode;

	}

	setupOutput( builder, outputNode ) {

		// FOG

		if ( this.fog === true ) {

			const fogNode = builder.fogNode;

			if ( fogNode ) outputNode = vec4( fogNode.mix( outputNode.rgb, fogNode.colorNode ), outputNode.a );

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
		this.geometryNode = source.geometryNode;

		this.depthNode = source.depthNode;
		this.shadowNode = source.shadowNode;
		this.shadowPositionNode = source.shadowPositionNode;

		this.outputNode = source.outputNode;
		this.mrtNode = source.mrtNode;

		this.fragmentNode = source.fragmentNode;
		this.vertexNode = source.vertexNode;

		return super.copy( source );

	}

}

const _defaultValues$e = /*@__PURE__*/ new PointsMaterial();

class InstancedPointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'InstancedPointsNodeMaterial';

	}

	constructor( params = {} ) {

		super();

		this.lights = false;

		this.useAlphaToCoverage = true;

		this.useColor = params.vertexColors;

		this.pointWidth = 1;

		this.pointColorNode = null;

		this.pointWidthNode = null;

		this.setDefaultValues( _defaultValues$e );

		this.setValues( params );

	}

	setup( builder ) {

		this.setupShaders( builder );

		super.setup( builder );

	}

	setupShaders( { renderer } ) {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;

		this.vertexNode = Fn( () => {

			const instancePosition = attribute( 'instancePosition' ).xyz;

			// camera space
			const mvPos = vec4( modelViewMatrix.mul( vec4( instancePosition, 1.0 ) ) );

			const aspect = viewport.z.div( viewport.w );

			// clip space
			const clipPos = cameraProjectionMatrix.mul( mvPos );

			// offset in ndc space
			const offset = positionGeometry.xy.toVar();

			offset.mulAssign( this.pointWidthNode ? this.pointWidthNode : materialPointWidth );

			offset.assign( offset.div( viewport.z ) );
			offset.y.assign( offset.y.mul( aspect ) );

			// back to clip space
			offset.assign( offset.mul( clipPos.w ) );

			//clipPos.xy += offset;
			clipPos.addAssign( vec4( offset, 0, 0 ) );

			return clipPos;

		} )();

		this.fragmentNode = Fn( () => {

			const alpha = float( 1 ).toVar();

			const len2 = lengthSq( uv().mul( 2 ).sub( 1 ) );

			if ( useAlphaToCoverage && renderer.samples > 1 ) {

				const dlen = float( len2.fwidth() ).toVar();

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

			alpha.mulAssign( materialOpacity );

			return vec4( pointColorNode, alpha );

		} )();

	}

	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

}

const _defaultValues$d = /*@__PURE__*/ new LineBasicMaterial();

class LineBasicNodeMaterial extends NodeMaterial {

	static get type() {

		return 'LineBasicNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isLineBasicNodeMaterial = true;

		this.lights = false;

		this.setDefaultValues( _defaultValues$d );

		this.setValues( parameters );

	}

}

const _defaultValues$c = /*@__PURE__*/ new LineDashedMaterial();

class LineDashedNodeMaterial extends NodeMaterial {

	static get type() {

		return 'LineDashedNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isLineDashedNodeMaterial = true;

		this.lights = false;

		this.setDefaultValues( _defaultValues$c );

		this.dashOffset = 0;

		this.offsetNode = null;
		this.dashScaleNode = null;
		this.dashSizeNode = null;
		this.gapSizeNode = null;

		this.setValues( parameters );

	}

	setupVariants() {

		const offsetNode = this.offsetNode ? float( this.offsetNodeNode ) : materialLineDashOffset;
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

const _defaultValues$b = /*@__PURE__*/ new LineDashedMaterial();

class Line2NodeMaterial extends NodeMaterial {

	static get type() {

		return 'Line2NodeMaterial';

	}

	constructor( params = {} ) {

		super();

		this.lights = false;

		this.setDefaultValues( _defaultValues$b );

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

		this.setValues( params );

	}

	setup( builder ) {

		this.setupShaders( builder );

		super.setup( builder );

	}

	setupShaders( { renderer } ) {

		const useAlphaToCoverage = this.alphaToCoverage;
		const useColor = this.useColor;
		const useDash = this.dashed;
		const useWorldUnits = this.worldUnits;

		const trimSegment = Fn( ( { start, end } ) => {

			const a = cameraProjectionMatrix.element( 2 ).element( 2 ); // 3nd entry in 3th column
			const b = cameraProjectionMatrix.element( 3 ).element( 2 ); // 3nd entry in 4th column
			const nearEstimate = b.mul( - 0.5 ).div( a );

			const alpha = nearEstimate.sub( start.z ).div( end.z.sub( start.z ) );

			return vec4( mix( start.xyz, end.xyz, alpha ), end.w );

		} ).setLayout( {
			name: 'trimSegment',
			type: 'vec4',
			inputs: [
				{ name: 'start', type: 'vec4' },
				{ name: 'end', type: 'vec4' }
			]
		} );

		this.vertexNode = Fn( () => {

			const instanceStart = attribute( 'instanceStart' );
			const instanceEnd = attribute( 'instanceEnd' );

			// camera space

			const start = vec4( modelViewMatrix.mul( vec4( instanceStart, 1.0 ) ) ).toVar( 'start' );
			const end = vec4( modelViewMatrix.mul( vec4( instanceEnd, 1.0 ) ) ).toVar( 'end' );

			if ( useDash ) {

				const dashScaleNode = this.dashScaleNode ? float( this.dashScaleNode ) : materialLineScale;
				const offsetNode = this.offsetNode ? float( this.offsetNodeNode ) : materialLineDashOffset;

				const instanceDistanceStart = attribute( 'instanceDistanceStart' );
				const instanceDistanceEnd = attribute( 'instanceDistanceEnd' );

				let lineDistance = positionGeometry.y.lessThan( 0.5 ).select( dashScaleNode.mul( instanceDistanceStart ), dashScaleNode.mul( instanceDistanceEnd ) );
				lineDistance = lineDistance.add( offsetNode );

				varyingProperty( 'float', 'lineDistance' ).assign( lineDistance );

			}

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

				} ).ElseIf( end.z.lessThan( 0.0 ).and( start.z.greaterThanEqual( 0.0 ) ), () => {

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
			const dir = ndcEnd.xy.sub( ndcStart.xy ).toVar();

			// account for clip-space aspect ratio
			dir.x.assign( dir.x.mul( aspect ) );
			dir.assign( dir.normalize() );

			const clip = vec4().toVar();

			if ( useWorldUnits ) {

				// get the offset direction as perpendicular to the view vector

				const worldDir = end.xyz.sub( start.xyz ).normalize();
				const tmpFwd = mix( start.xyz, end.xyz, 0.5 ).normalize();
				const worldUp = worldDir.cross( tmpFwd ).normalize();
				const worldFwd = worldDir.cross( worldUp );

				const worldPos = varyingProperty( 'vec4', 'worldPos' );

				worldPos.assign( positionGeometry.y.lessThan( 0.5 ).select( start, end ) );

				// height offset
				const hw = materialLineWidth.mul( 0.5 );
				worldPos.addAssign( vec4( positionGeometry.x.lessThan( 0.0 ).select( worldUp.mul( hw ), worldUp.mul( hw ).negate() ), 0 ) );

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				if ( ! useDash ) {

					// cap extension
					worldPos.addAssign( vec4( positionGeometry.y.lessThan( 0.5 ).select( worldDir.mul( hw ).negate(), worldDir.mul( hw ) ), 0 ) );

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
				const clipPose = vec3().toVar();

				clipPose.assign( positionGeometry.y.lessThan( 0.5 ).select( ndcStart, ndcEnd ) );
				clip.z.assign( clipPose.z.mul( clip.w ) );

			} else {

				const offset = vec2( dir.y, dir.x.negate() ).toVar( 'offset' );

				// undo aspect ratio adjustment
				dir.x.assign( dir.x.div( aspect ) );
				offset.x.assign( offset.x.div( aspect ) );

				// sign flip
				offset.assign( positionGeometry.x.lessThan( 0.0 ).select( offset.negate(), offset ) );

				// endcaps
				If( positionGeometry.y.lessThan( 0.0 ), () => {

					offset.assign( offset.sub( dir ) );

				} ).ElseIf( positionGeometry.y.greaterThan( 1.0 ), () => {

					offset.assign( offset.add( dir ) );

				} );

				// adjust for linewidth
				offset.assign( offset.mul( materialLineWidth ) );

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset.assign( offset.div( viewport.w ) );

				// select end
				clip.assign( positionGeometry.y.lessThan( 0.5 ).select( clipStart, clipEnd ) );

				// back to clip space
				offset.assign( offset.mul( clip.w ) );

				clip.assign( clip.add( vec4( offset, 0, 0 ) ) );

			}

			return clip;

		} )();

		const closestLineToLine = Fn( ( { p1, p2, p3, p4 } ) => {

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

		this.fragmentNode = Fn( () => {

			const vUv = uv();

			if ( useDash ) {

				const dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
				const gapSizeNode = this.dashSizeNode ? float( this.dashGapNode ) : materialLineGapSize;

				dashSize.assign( dashSizeNode );
				gapSize.assign( gapSizeNode );

				const vLineDistance = varyingProperty( 'float', 'lineDistance' );

				vUv.y.lessThan( - 1.0 ).or( vUv.y.greaterThan( 1.0 ) ).discard(); // discard endcaps
				vLineDistance.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard(); // todo - FIX

			}

			const alpha = float( 1 ).toVar( 'alpha' );

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

					if ( useAlphaToCoverage && renderer.samples > 1 ) {

						const dnorm = norm.fwidth();
						alpha.assign( smoothstep( dnorm.negate().add( 0.5 ), dnorm.add( 0.5 ), norm ).oneMinus() );

					} else {

						norm.greaterThan( 0.5 ).discard();

					}

				}

			} else {

				// round endcaps

				if ( useAlphaToCoverage && renderer.samples > 1 ) {

					const a = vUv.x;
					const b = vUv.y.greaterThan( 0.0 ).select( vUv.y.sub( 1.0 ), vUv.y.add( 1.0 ) );

					const len2 = a.mul( a ).add( b.mul( b ) );

					const dlen = float( len2.fwidth() ).toVar( 'dlen' );

					If( vUv.y.abs().greaterThan( 1.0 ), () => {

						alpha.assign( smoothstep( dlen.oneMinus(), dlen.add( 1 ), len2 ).oneMinus() );

					} );

				} else {

					If( vUv.y.abs().greaterThan( 1.0 ), () => {

						const a = vUv.x;
						const b = vUv.y.greaterThan( 0.0 ).select( vUv.y.sub( 1.0 ), vUv.y.add( 1.0 ) );
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

					const instanceColor = positionGeometry.y.lessThan( 0.5 ).select( instanceColorStart, instanceColorEnd );

					lineColorNode = instanceColor.mul( materialColor );

				} else {

					lineColorNode = materialColor;

				}

			}

			return vec4( lineColorNode, alpha );

		} )();

	}


	get worldUnits() {

		return this.useWorldUnits;

	}

	set worldUnits( value ) {

		if ( this.useWorldUnits !== value ) {

			this.useWorldUnits = value;
			this.needsUpdate = true;

		}

	}


	get dashed() {

		return this.useDash;

	}

	set dashed( value ) {

		if ( this.useDash !== value ) {

			this.useDash = value;
			this.needsUpdate = true;

		}

	}


	get alphaToCoverage() {

		return this.useAlphaToCoverage;

	}

	set alphaToCoverage( value ) {

		if ( this.useAlphaToCoverage !== value ) {

			this.useAlphaToCoverage = value;
			this.needsUpdate = true;

		}

	}

}

const directionToColor = ( node ) => nodeObject( node ).mul( 0.5 ).add( 0.5 );
const colorToDirection = ( node ) => nodeObject( node ).mul( 2.0 ).sub( 1 );

const _defaultValues$a = /*@__PURE__*/ new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshNormalNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.lights = false;

		this.isMeshNormalNodeMaterial = true;

		this.setDefaultValues( _defaultValues$a );

		this.setValues( parameters );

	}

	setupDiffuseColor() {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		diffuseColor.assign( vec4( directionToColor( transformedNormalView ), opacityNode ) );

	}

}

class EquirectUVNode extends TempNode {

	static get type() {

		return 'EquirectUVNode';

	}

	constructor( dirNode = positionWorldDirection ) {

		super( 'vec2' );

		this.dirNode = dirNode;

	}

	setup() {

		const dir = this.dirNode;

		const u = dir.z.atan2( dir.x ).mul( 1 / ( Math.PI * 2 ) ).add( 0.5 );
		const v = dir.y.clamp( - 1.0, 1.0 ).asin().mul( 1 / Math.PI ).add( 0.5 );

		return vec2( u, v );

	}

}

const equirectUV = /*@__PURE__*/ nodeProxy( EquirectUVNode );

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

		const material = new NodeMaterial();
		material.colorNode = texture( texture$1, uvNode, 0 );
		material.side = BackSide;
		material.blending = NoBlending;

		const mesh = new Mesh( geometry, material );

		const scene = new Scene();
		scene.add( mesh );

		// Avoid blurred poles
		if ( texture$1.minFilter === LinearMipmapLinearFilter ) texture$1.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );

		const currentMRT = renderer.getMRT();
		renderer.setMRT( null );

		camera.update( renderer, scene );

		renderer.setMRT( currentMRT );

		texture$1.minFilter = currentMinFilter;
		texture$1.currentGenerateMipmaps = currentGenerateMipmaps;

		mesh.geometry.dispose();
		mesh.material.dispose();

		return this;

	}

}

const _cache$1 = new WeakMap();

class CubeMapNode extends TempNode {

	static get type() {

		return 'CubeMapNode';

	}

	constructor( envNode ) {

		super( 'vec3' );

		this.envNode = envNode;

		this._cubeTexture = null;
		this._cubeTextureNode = cubeTexture();

		const defaultTexture = new CubeTexture();
		defaultTexture.isRenderTargetTexture = true;

		this._defaultTexture = defaultTexture;

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore( frame ) {

		const { renderer, material } = frame;

		const envNode = this.envNode;

		if ( envNode.isTextureNode || envNode.isMaterialReferenceNode ) {

			const texture = ( envNode.isTextureNode ) ? envNode.value : material[ envNode.property ];

			if ( texture && texture.isTexture ) {

				const mapping = texture.mapping;

				if ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) {

					// check for converted cubemap map

					if ( _cache$1.has( texture ) ) {

						const cubeMap = _cache$1.get( texture );

						mapTextureMapping( cubeMap, texture.mapping );
						this._cubeTexture = cubeMap;

					} else {

						// create cube map from equirectangular map

						const image = texture.image;

						if ( isEquirectangularMapReady$1( image ) ) {

							const renderTarget = new CubeRenderTarget( image.height );
							renderTarget.fromEquirectangularTexture( renderer, texture );

							mapTextureMapping( renderTarget.texture, texture.mapping );
							this._cubeTexture = renderTarget.texture;

							_cache$1.set( texture, renderTarget.texture );

							texture.addEventListener( 'dispose', onTextureDispose );

						} else {

							// default cube texture as fallback when equirectangular texture is not yet loaded

							this._cubeTexture = this._defaultTexture;

						}

					}

					//

					this._cubeTextureNode.value = this._cubeTexture;

				} else {

					// envNode already refers to a cube map

					this._cubeTextureNode = this.envNode;

				}

			}

		}

	}

	setup( builder ) {

		this.updateBefore( builder );

		return this._cubeTextureNode;

	}

}

function isEquirectangularMapReady$1( image ) {

	if ( image === null || image === undefined ) return false;

	return image.height > 0;

}

function onTextureDispose( event ) {

	const texture = event.target;

	texture.removeEventListener( 'dispose', onTextureDispose );

	const renderTarget = _cache$1.get( texture );

	if ( renderTarget !== undefined ) {

		_cache$1.delete( texture );

		renderTarget.dispose();

	}

}

function mapTextureMapping( texture, mapping ) {

	if ( mapping === EquirectangularReflectionMapping ) {

		texture.mapping = CubeReflectionMapping;

	} else if ( mapping === EquirectangularRefractionMapping ) {

		texture.mapping = CubeRefractionMapping;

	}

}

const cubeMapNode = /*@__PURE__*/ nodeProxy( CubeMapNode );

class BasicEnvironmentNode extends LightingNode {

	static get type() {

		return 'BasicEnvironmentNode';

	}

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	setup( builder ) {

		// environment property is used in the finish() method of BasicLightingModel

		builder.context.environment = cubeMapNode( this.envNode );

	}

}

class BasicLightMapNode extends LightingNode {

	static get type() {

		return 'BasicLightMapNode';

	}

	constructor( lightMapNode = null ) {

		super();

		this.lightMapNode = lightMapNode;

	}

	setup( builder ) {

		// irradianceLightMap property is used in the indirectDiffuse() method of BasicLightingModel

		const RECIPROCAL_PI = float( 1 / Math.PI );

		builder.context.irradianceLightMap = this.lightMapNode.mul( RECIPROCAL_PI );

	}

}

class LightingModel {

	start( /*input, stack, builder*/ ) { }

	finish( /*input, stack, builder*/ ) { }

	direct( /*input, stack, builder*/ ) { }

	directRectArea( /*input, stack, builder*/ ) {}

	indirect( /*input, stack, builder*/ ) { }

	ambientOcclusion( /*input, stack, builder*/ ) { }

}

class BasicLightingModel extends LightingModel {

	constructor() {

		super();

	}

	indirect( context, stack, builder ) {

		const ambientOcclusion = context.ambientOcclusion;
		const reflectedLight = context.reflectedLight;
		const irradianceLightMap = builder.context.irradianceLightMap;

		reflectedLight.indirectDiffuse.assign( vec4( 0.0 ) );

		// accumulation (baked indirect lighting only)

		if ( irradianceLightMap ) {

			reflectedLight.indirectDiffuse.addAssign( irradianceLightMap );

		} else {

			reflectedLight.indirectDiffuse.addAssign( vec4( 1.0, 1.0, 1.0, 0.0 ) );

		}

		// modulation

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

		reflectedLight.indirectDiffuse.mulAssign( diffuseColor.rgb );

	}

	finish( context, stack, builder ) {

		const material = builder.material;
		const outgoingLight = context.outgoingLight;
		const envNode = builder.context.environment;

		if ( envNode ) {

			switch ( material.combine ) {

				case MultiplyOperation:
					outgoingLight.rgb.assign( mix( outgoingLight.rgb, outgoingLight.rgb.mul( envNode.rgb ), materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				case MixOperation:
					outgoingLight.rgb.assign( mix( outgoingLight.rgb, envNode.rgb, materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				case AddOperation:
					outgoingLight.rgb.addAssign( envNode.rgb.mul( materialSpecularStrength.mul( materialReflectivity ) ) );
					break;

				default:
					console.warn( 'THREE.BasicLightingModel: Unsupported .combine value:', material.combine );
					break;

			}

		}

	}

}

const _defaultValues$9 = /*@__PURE__*/ new MeshBasicMaterial();

class MeshBasicNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshBasicNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isMeshBasicNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues$9 );

		this.setValues( parameters );

	}

	setupNormal() {

		return normalView; // see #28839

	}

	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	setupLightMap( builder ) {

		let node = null;

		if ( builder.material.lightMap ) {

			node = new BasicLightMapNode( materialLightMap );

		}

		return node;

	}

	setupOutgoingLight() {

		return diffuseColor.rgb;

	}

	setupLightingModel() {

		return new BasicLightingModel();

	}

}

const F_Schlick = /*@__PURE__*/ Fn( ( { f0, f90, dotVH } ) => {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	const fresnel = dotVH.mul( - 5.55473 ).sub( 6.98316 ).mul( dotVH ).exp2();

	return f0.mul( fresnel.oneMinus() ).add( f90.mul( fresnel ) );

} ); // validated

const BRDF_Lambert = /*@__PURE__*/ Fn( ( inputs ) => {

	return inputs.diffuseColor.mul( 1 / Math.PI ); // punctual light

} ); // validated

const G_BlinnPhong_Implicit = () => float( 0.25 );

const D_BlinnPhong = /*@__PURE__*/ Fn( ( { dotNH } ) => {

	return shininess.mul( float( 0.5 ) ).add( 1.0 ).mul( float( 1 / Math.PI ) ).mul( dotNH.pow( shininess ) );

} );

const BRDF_BlinnPhong = /*@__PURE__*/ Fn( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNH = transformedNormalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	const F = F_Schlick( { f0: specularColor, f90: 1.0, dotVH } );
	const G = G_BlinnPhong_Implicit();
	const D = D_BlinnPhong( { dotNH } );

	return F.mul( G ).mul( D );

} );

class PhongLightingModel extends BasicLightingModel {

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

	indirect( { ambientOcclusion, irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	}

}

const _defaultValues$8 = /*@__PURE__*/ new MeshLambertMaterial();

class MeshLambertNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshLambertNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isMeshLambertNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues$8 );

		this.setValues( parameters );

	}

	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel( false ); // ( specular ) -> force lambert

	}

}

const _defaultValues$7 = /*@__PURE__*/ new MeshPhongMaterial();

class MeshPhongNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshPhongNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isMeshPhongNodeMaterial = true;

		this.lights = true;

		this.shininessNode = null;
		this.specularNode = null;

		this.setDefaultValues( _defaultValues$7 );

		this.setValues( parameters );

	}

	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel();

	}

	setupVariants() {

		// SHININESS

		const shininessNode = ( this.shininessNode ? float( this.shininessNode ) : materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		shininess.assign( shininessNode );

		// SPECULAR COLOR

		const specularNode = this.specularNode || materialSpecular;

		specularColor.assign( specularNode );

	}

	copy( source ) {

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		return super.copy( source );

	}

}

const getGeometryRoughness = /*@__PURE__*/ Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'normal' ) === false ) {

		return float( 0 );

	}

	const dxy = normalView.dFdx().abs().max( normalView.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y ).max( dxy.z );

	return geometryRoughness;

} );

const getRoughness = /*@__PURE__*/ Fn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	let roughnessFactor = roughness.max( 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
	roughnessFactor = roughnessFactor.add( geometryRoughness );
	roughnessFactor = roughnessFactor.min( 1.0 );

	return roughnessFactor;

} );

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
const V_GGX_SmithCorrelated = /*@__PURE__*/ Fn( ( { alpha, dotNL, dotNV } ) => {

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

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf

const V_GGX_SmithCorrelated_Anisotropic = /*@__PURE__*/ Fn( ( { alphaT, alphaB, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL } ) => {

	const gv = dotNL.mul( vec3( alphaT.mul( dotTV ), alphaB.mul( dotBV ), dotNV ).length() );
	const gl = dotNV.mul( vec3( alphaT.mul( dotTL ), alphaB.mul( dotBL ), dotNL ).length() );
	const v = div( 0.5, gv.add( gl ) );

	return v.saturate();

} ).setLayout( {
	name: 'V_GGX_SmithCorrelated_Anisotropic',
	type: 'float',
	inputs: [
		{ name: 'alphaT', type: 'float', qualifier: 'in' },
		{ name: 'alphaB', type: 'float', qualifier: 'in' },
		{ name: 'dotTV', type: 'float', qualifier: 'in' },
		{ name: 'dotBV', type: 'float', qualifier: 'in' },
		{ name: 'dotTL', type: 'float', qualifier: 'in' },
		{ name: 'dotBL', type: 'float', qualifier: 'in' },
		{ name: 'dotNV', type: 'float', qualifier: 'in' },
		{ name: 'dotNL', type: 'float', qualifier: 'in' }
	]
} );

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
const D_GGX = /*@__PURE__*/ Fn( ( { alpha, dotNH } ) => {

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

const RECIPROCAL_PI = /*@__PURE__*/ float( 1 / Math.PI );

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf

const D_GGX_Anisotropic = /*@__PURE__*/ Fn( ( { alphaT, alphaB, dotNH, dotTH, dotBH } ) => {

	const a2 = alphaT.mul( alphaB );
	const v = vec3( alphaB.mul( dotTH ), alphaT.mul( dotBH ), a2.mul( dotNH ) );
	const v2 = v.dot( v );
	const w2 = a2.div( v2 );

	return RECIPROCAL_PI.mul( a2.mul( w2.pow2() ) );

} ).setLayout( {
	name: 'D_GGX_Anisotropic',
	type: 'float',
	inputs: [
		{ name: 'alphaT', type: 'float', qualifier: 'in' },
		{ name: 'alphaB', type: 'float', qualifier: 'in' },
		{ name: 'dotNH', type: 'float', qualifier: 'in' },
		{ name: 'dotTH', type: 'float', qualifier: 'in' },
		{ name: 'dotBH', type: 'float', qualifier: 'in' }
	]
} );

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
const BRDF_GGX = /*@__PURE__*/ Fn( ( inputs ) => {

	const { lightDirection, f0, f90, roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } = inputs;

	const normalView = inputs.normalView || transformedNormalView;

	const alpha = roughness.pow2(); // UE4's roughness

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNL = normalView.dot( lightDirection ).clamp();
	const dotNV = normalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV
	const dotNH = normalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	let F = F_Schlick( { f0, f90, dotVH } );
	let V, D;

	if ( defined( USE_IRIDESCENCE ) ) {

		F = iridescence.mix( F, f );

	}

	if ( defined( USE_ANISOTROPY ) ) {

		const dotTL = anisotropyT.dot( lightDirection );
		const dotTV = anisotropyT.dot( positionViewDirection );
		const dotTH = anisotropyT.dot( halfDir );
		const dotBL = anisotropyB.dot( lightDirection );
		const dotBV = anisotropyB.dot( positionViewDirection );
		const dotBH = anisotropyB.dot( halfDir );

		V = V_GGX_SmithCorrelated_Anisotropic( { alphaT, alphaB: alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL } );
		D = D_GGX_Anisotropic( { alphaT, alphaB: alpha, dotNH, dotTH, dotBH } );

	} else {

		V = V_GGX_SmithCorrelated( { alpha, dotNL, dotNV } );
		D = D_GGX( { alpha, dotNH } );

	}

	return F.mul( V ).mul( D );

} ); // validated

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
const DFGApprox = /*@__PURE__*/ Fn( ( { roughness, dotNV } ) => {

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

const EnvironmentBRDF = /*@__PURE__*/ Fn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGApprox( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

const Schlick_to_F0 = /*@__PURE__*/ Fn( ( { f, f90, dotVH } ) => {

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
const D_Charlie = /*@__PURE__*/ Fn( ( { roughness, dotNH } ) => {

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
const V_Neubelt = /*@__PURE__*/ Fn( ( { dotNV, dotNL } ) => {

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

const BRDF_Sheen = /*@__PURE__*/ Fn( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const dotNV = transformedNormalView.dot( positionViewDirection ).clamp();
	const dotNH = transformedNormalView.dot( halfDir ).clamp();

	const D = D_Charlie( { roughness: sheenRoughness, dotNH } );
	const V = V_Neubelt( { dotNV, dotNL } );

	return sheen.mul( D ).mul( V );

} );

// Rect Area Light

// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// code: https://github.com/selfshadow/ltc_code/

const LTC_Uv = /*@__PURE__*/ Fn( ( { N, V, roughness } ) => {

	const LUT_SIZE = 64.0;
	const LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const LUT_BIAS = 0.5 / LUT_SIZE;

	const dotNV = N.dot( V ).saturate();

	// texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
	const uv = vec2( roughness, dotNV.oneMinus().sqrt() );

	uv.assign( uv.mul( LUT_SCALE ).add( LUT_BIAS ) );

	return uv;

} ).setLayout( {
	name: 'LTC_Uv',
	type: 'vec2',
	inputs: [
		{ name: 'N', type: 'vec3' },
		{ name: 'V', type: 'vec3' },
		{ name: 'roughness', type: 'float' }
	]
} );

const LTC_ClippedSphereFormFactor = /*@__PURE__*/ Fn( ( { f } ) => {

	// Real-Time Area Lighting: a Journey from Research to Production (p.102)
	// An approximation of the form factor of a horizon-clipped rectangle.

	const l = f.length();

	return max$1( l.mul( l ).add( f.z ).div( l.add( 1.0 ) ), 0 );

} ).setLayout( {
	name: 'LTC_ClippedSphereFormFactor',
	type: 'float',
	inputs: [
		{ name: 'f', type: 'vec3' }
	]
} );

const LTC_EdgeVectorFormFactor = /*@__PURE__*/ Fn( ( { v1, v2 } ) => {

	const x = v1.dot( v2 );
	const y = x.abs().toVar();

	// rational polynomial approximation to theta / sin( theta ) / 2PI
	const a = y.mul( 0.0145206 ).add( 0.4965155 ).mul( y ).add( 0.8543985 ).toVar();
	const b = y.add( 4.1616724 ).mul( y ).add( 3.4175940 ).toVar();
	const v = a.div( b );

	const theta_sintheta = x.greaterThan( 0.0 ).select( v, max$1( x.mul( x ).oneMinus(), 1e-7 ).inverseSqrt().mul( 0.5 ).sub( v ) );

	return v1.cross( v2 ).mul( theta_sintheta );

} ).setLayout( {
	name: 'LTC_EdgeVectorFormFactor',
	type: 'vec3',
	inputs: [
		{ name: 'v1', type: 'vec3' },
		{ name: 'v2', type: 'vec3' }
	]
} );

const LTC_Evaluate = /*@__PURE__*/ Fn( ( { N, V, P, mInv, p0, p1, p2, p3 } ) => {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	const v1 = p1.sub( p0 ).toVar();
	const v2 = p3.sub( p0 ).toVar();

	const lightNormal = v1.cross( v2 );
	const result = vec3().toVar();

	If( lightNormal.dot( P.sub( p0 ) ).greaterThanEqual( 0.0 ), () => {

		// construct orthonormal basis around N
		const T1 = V.sub( N.mul( V.dot( N ) ) ).normalize();
		const T2 = N.cross( T1 ).negate(); // negated from paper; possibly due to a different handedness of world coordinate system

		// compute transform
		const mat = mInv.mul( mat3( T1, T2, N ).transpose() ).toVar();

		// transform rect
		// & project rect onto sphere
		const coords0 = mat.mul( p0.sub( P ) ).normalize().toVar();
		const coords1 = mat.mul( p1.sub( P ) ).normalize().toVar();
		const coords2 = mat.mul( p2.sub( P ) ).normalize().toVar();
		const coords3 = mat.mul( p3.sub( P ) ).normalize().toVar();

		// calculate vector form factor
		const vectorFormFactor = vec3( 0 ).toVar();
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords0, v2: coords1 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords1, v2: coords2 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords2, v2: coords3 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords3, v2: coords0 } ) );

		// adjust for horizon clipping
		result.assign( vec3( LTC_ClippedSphereFormFactor( { f: vectorFormFactor } ) ) );

	} );

	return result;

} ).setLayout( {
	name: 'LTC_Evaluate',
	type: 'vec3',
	inputs: [
		{ name: 'N', type: 'vec3' },
		{ name: 'V', type: 'vec3' },
		{ name: 'P', type: 'vec3' },
		{ name: 'mInv', type: 'mat3' },
		{ name: 'p0', type: 'vec3' },
		{ name: 'p1', type: 'vec3' },
		{ name: 'p2', type: 'vec3' },
		{ name: 'p3', type: 'vec3' }
	]
} );

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

const textureBicubic = /*@__PURE__*/ Fn( ( [ textureNode, lodNode = float( 3 ) ] ) => {

	const fLodSize = vec2( textureNode.size( int( lodNode ) ) );
	const cLodSize = vec2( textureNode.size( int( lodNode.add( 1.0 ) ) ) );
	const fLodSizeInv = div( 1.0, fLodSize );
	const cLodSizeInv = div( 1.0, cLodSize );
	const fSample = bicubic( textureNode, vec4( fLodSizeInv, fLodSize ), floor( lodNode ) );
	const cSample = bicubic( textureNode, vec4( cLodSizeInv, cLodSize ), ceil( lodNode ) );

	return fract( lodNode ).mix( fSample, cSample );

} );

//
// Transmission
//

const getVolumeTransmissionRay = /*@__PURE__*/ Fn( ( [ n, v, thickness, ior, modelMatrix ] ) => {

	// Direction of refracted light.
	const refractionVector = vec3( refract( v.negate(), normalize( n ), div( 1.0, ior ) ) );

	// Compute rotation-independant scaling of the model matrix.
	const modelScale = vec3(
		length( modelMatrix[ 0 ].xyz ),
		length( modelMatrix[ 1 ].xyz ),
		length( modelMatrix[ 2 ].xyz )
	);

	// The thickness is specified in local space.
	return normalize( refractionVector ).mul( thickness.mul( modelScale ) );

} ).setLayout( {
	name: 'getVolumeTransmissionRay',
	type: 'vec3',
	inputs: [
		{ name: 'n', type: 'vec3' },
		{ name: 'v', type: 'vec3' },
		{ name: 'thickness', type: 'float' },
		{ name: 'ior', type: 'float' },
		{ name: 'modelMatrix', type: 'mat4' }
	]
} );

const applyIorToRoughness = /*@__PURE__*/ Fn( ( [ roughness, ior ] ) => {

	// Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
	// an IOR of 1.5 results in the default amount of microfacet refraction.
	return roughness.mul( clamp( ior.mul( 2.0 ).sub( 2.0 ), 0.0, 1.0 ) );

} ).setLayout( {
	name: 'applyIorToRoughness',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'ior', type: 'float' }
	]
} );

const viewportBackSideTexture = /*@__PURE__*/ viewportMipTexture();
const viewportFrontSideTexture = /*@__PURE__*/ viewportMipTexture();

const getTransmissionSample = /*@__PURE__*/ Fn( ( [ fragCoord, roughness, ior ], { material } ) => {

	const vTexture = material.side == BackSide ? viewportBackSideTexture : viewportFrontSideTexture;

	const transmissionSample = vTexture.uv( fragCoord );
	//const transmissionSample = viewportMipTexture( fragCoord );

	const lod = log2( screenSize.x ).mul( applyIorToRoughness( roughness, ior ) );

	return textureBicubic( transmissionSample, lod );

} );

const volumeAttenuation = /*@__PURE__*/ Fn( ( [ transmissionDistance, attenuationColor, attenuationDistance ] ) => {

	If( attenuationDistance.notEqual( 0 ), () => {

		// Compute light attenuation using Beer's law.
		const attenuationCoefficient = log( attenuationColor ).negate().div( attenuationDistance );
		const transmittance = exp( attenuationCoefficient.negate().mul( transmissionDistance ) );

		return transmittance;

	} );

	// Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
	return vec3( 1.0 );

} ).setLayout( {
	name: 'volumeAttenuation',
	type: 'vec3',
	inputs: [
		{ name: 'transmissionDistance', type: 'float' },
		{ name: 'attenuationColor', type: 'vec3' },
		{ name: 'attenuationDistance', type: 'float' }
	]
} );

const getIBLVolumeRefraction = /*@__PURE__*/ Fn( ( [ n, v, roughness, diffuseColor, specularColor, specularF90, position, modelMatrix, viewMatrix, projMatrix, ior, thickness, attenuationColor, attenuationDistance, dispersion ] ) => {

	let transmittedLight, transmittance;

	if ( dispersion ) {

		transmittedLight = vec4().toVar();
		transmittance = vec3().toVar();

		const halfSpread = ior.sub( 1.0 ).mul( dispersion.mul( 0.025 ) );
		const iors = vec3( ior.sub( halfSpread ), ior, ior.add( halfSpread ) );

		Loop( { start: 0, end: 3 }, ( { i } ) => {

			const ior = iors.element( i );

			const transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			const refractedRayExit = position.add( transmissionRay );

			// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
			const ndcPos = projMatrix.mul( viewMatrix.mul( vec4( refractedRayExit, 1.0 ) ) );
			const refractionCoords = vec2( ndcPos.xy.div( ndcPos.w ) ).toVar();
			refractionCoords.addAssign( 1.0 );
			refractionCoords.divAssign( 2.0 );
			refractionCoords.assign( vec2( refractionCoords.x, refractionCoords.y.oneMinus() ) ); // webgpu

			// Sample framebuffer to get pixel the refracted ray hits.
			const transmissionSample = getTransmissionSample( refractionCoords, roughness, ior );

			transmittedLight.element( i ).assign( transmissionSample.element( i ) );
			transmittedLight.a.addAssign( transmissionSample.a );

			transmittance.element( i ).assign( diffuseColor.element( i ).mul( volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance ).element( i ) ) );

		} );

		transmittedLight.a.divAssign( 3.0 );

	} else {

		const transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		const refractedRayExit = position.add( transmissionRay );

		// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
		const ndcPos = projMatrix.mul( viewMatrix.mul( vec4( refractedRayExit, 1.0 ) ) );
		const refractionCoords = vec2( ndcPos.xy.div( ndcPos.w ) ).toVar();
		refractionCoords.addAssign( 1.0 );
		refractionCoords.divAssign( 2.0 );
		refractionCoords.assign( vec2( refractionCoords.x, refractionCoords.y.oneMinus() ) ); // webgpu

		// Sample framebuffer to get pixel the refracted ray hits.
		transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		transmittance = diffuseColor.mul( volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance ) );

	}

	const attenuatedColor = transmittance.rgb.mul( transmittedLight.rgb );
	const dotNV = n.dot( v ).clamp();

	// Get the specular component.
	const F = vec3( EnvironmentBRDF( { // n, v, specularColor, specularF90, roughness
		dotNV,
		specularColor,
		specularF90,
		roughness
	} ) );

	// As less light is transmitted, the opacity should be increased. This simple approximation does a decent job
	// of modulating a CSS background, and has no effect when the buffer is opaque, due to a solid object or clear color.
	const transmittanceFactor = transmittance.r.add( transmittance.g, transmittance.b ).div( 3.0 );

	return vec4( F.oneMinus().mul( attenuatedColor ), transmittedLight.a.oneMinus().mul( transmittanceFactor ).oneMinus() );

} );

//
// Iridescence
//

// XYZ to linear-sRGB color space
const XYZ_TO_REC709 = /*@__PURE__*/ mat3(
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

const evalIridescence = /*@__PURE__*/ Fn( ( { outsideIOR, eta2, cosTheta1, thinFilmThickness, baseF0 } ) => {

	// Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0
	const iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
	// Evaluate the cosTheta on the base layer (Snell law)
	const sinTheta2Sq = outsideIOR.div( iridescenceIOR ).pow2().mul( cosTheta1.pow2().oneMinus() );

	// Handle TIR:
	const cosTheta2Sq = sinTheta2Sq.oneMinus();

	If( cosTheta2Sq.lessThan( 0 ), () => {

		return vec3( 1.0 );

	} );

	const cosTheta2 = cosTheta2Sq.sqrt();

	// First interface
	const R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
	const R12 = F_Schlick( { f0: R0, f90: 1.0, dotVH: cosTheta1 } );
	//const R21 = R12;
	const T121 = R12.oneMinus();
	const phi12 = iridescenceIOR.lessThan( outsideIOR ).select( Math.PI, 0.0 );
	const phi21 = float( Math.PI ).sub( phi12 );

	// Second interface
	const baseIOR = Fresnel0ToIor( baseF0.clamp( 0.0, 0.9999 ) ); // guard against 1.0
	const R1 = IorToFresnel0( baseIOR, iridescenceIOR.toVec3() );
	const R23 = F_Schlick( { f0: R1, f90: 1.0, dotVH: cosTheta2 } );
	const phi23 = vec3(
		baseIOR.x.lessThan( iridescenceIOR ).select( Math.PI, 0.0 ),
		baseIOR.y.lessThan( iridescenceIOR ).select( Math.PI, 0.0 ),
		baseIOR.z.lessThan( iridescenceIOR ).select( Math.PI, 0.0 )
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
	const I = C0.toVar();

	// Reflectance term for m > 0 (pairs of diracs)
	const Cm = Rs.sub( T121 ).toVar();

	Loop( { start: 1, end: 2, condition: '<=', name: 'm' }, ( { m } ) => {

		Cm.mulAssign( r123 );
		const Sm = evalSensitivity( float( m ).mul( OPD ), float( m ).mul( phi ) ).mul( 2.0 );
		I.addAssign( Cm.mul( Sm ) );

	} );

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
const IBLSheenBRDF = /*@__PURE__*/ Fn( ( { normal, viewDir, roughness } ) => {

	const dotNV = normal.dot( viewDir ).saturate();

	const r2 = roughness.pow2();

	const a = select(
		roughness.lessThan( 0.25 ),
		float( - 339.2 ).mul( r2 ).add( float( 161.4 ).mul( roughness ) ).sub( 25.9 ),
		float( - 8.48 ).mul( r2 ).add( float( 14.3 ).mul( roughness ) ).sub( 9.95 )
	);

	const b = select(
		roughness.lessThan( 0.25 ),
		float( 44.0 ).mul( r2 ).sub( float( 23.7 ).mul( roughness ) ).add( 3.26 ),
		float( 1.97 ).mul( r2 ).sub( float( 3.27 ).mul( roughness ) ).add( 0.72 )
	);

	const DG = select( roughness.lessThan( 0.25 ), 0.0, float( 0.1 ).mul( roughness ).sub( 0.025 ) ).add( a.mul( dotNV ).add( b ).exp() );

	return DG.mul( 1.0 / Math.PI ).saturate();

} );

const clearcoatF0 = vec3( 0.04 );
const clearcoatF90 = float( 1 );

//

class PhysicalLightingModel extends LightingModel {

	constructor( clearcoat = false, sheen = false, iridescence = false, anisotropy = false, transmission = false, dispersion = false ) {

		super();

		this.clearcoat = clearcoat;
		this.sheen = sheen;
		this.iridescence = iridescence;
		this.anisotropy = anisotropy;
		this.transmission = transmission;
		this.dispersion = dispersion;

		this.clearcoatRadiance = null;
		this.clearcoatSpecularDirect = null;
		this.clearcoatSpecularIndirect = null;
		this.sheenSpecularDirect = null;
		this.sheenSpecularIndirect = null;
		this.iridescenceFresnel = null;
		this.iridescenceF0 = null;

	}

	start( context ) {

		if ( this.clearcoat === true ) {

			this.clearcoatRadiance = vec3().toVar( 'clearcoatRadiance' );
			this.clearcoatSpecularDirect = vec3().toVar( 'clearcoatSpecularDirect' );
			this.clearcoatSpecularIndirect = vec3().toVar( 'clearcoatSpecularIndirect' );

		}

		if ( this.sheen === true ) {

			this.sheenSpecularDirect = vec3().toVar( 'sheenSpecularDirect' );
			this.sheenSpecularIndirect = vec3().toVar( 'sheenSpecularIndirect' );

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

		if ( this.transmission === true ) {

			const position = positionWorld;
			const v = cameraPosition.sub( positionWorld ).normalize(); // TODO: Create Node for this, same issue in MaterialX
			const n = transformedNormalWorld;

			context.backdrop = getIBLVolumeRefraction(
				n,
				v,
				roughness,
				diffuseColor,
				specularColor,
				specularF90, // specularF90
				position, // positionWorld
				modelWorldMatrix, // modelMatrix
				cameraViewMatrix, // viewMatrix
				cameraProjectionMatrix, // projMatrix
				ior,
				thickness,
				attenuationColor,
				attenuationDistance,
				this.dispersion ? dispersion : null
			);

			context.backdropAlpha = transmission;

			diffuseColor.a.mulAssign( mix( 1, context.backdrop.a, transmission ) );

		}

	}

	// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
	// Approximates multiscattering in order to preserve energy.
	// http://www.jcgt.org/published/0008/01/03/

	computeMultiscattering( singleScatter, multiScatter, specularF90 ) {

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

		reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_GGX( { lightDirection, f0: specularColor, f90: 1, roughness, iridescence: this.iridescence, f: this.iridescenceFresnel, USE_IRIDESCENCE: this.iridescence, USE_ANISOTROPY: this.anisotropy } ) ) );

	}

	directRectArea( { lightColor, lightPosition, halfWidth, halfHeight, reflectedLight, ltc_1, ltc_2 } ) {

		const p0 = lightPosition.add( halfWidth ).sub( halfHeight ); // counterclockwise; light shines in local neg z direction
		const p1 = lightPosition.sub( halfWidth ).sub( halfHeight );
		const p2 = lightPosition.sub( halfWidth ).add( halfHeight );
		const p3 = lightPosition.add( halfWidth ).add( halfHeight );

		const N = transformedNormalView;
		const V = positionViewDirection;
		const P = positionView.toVar();

		const uv = LTC_Uv( { N, V, roughness } );

		const t1 = ltc_1.uv( uv ).toVar();
		const t2 = ltc_2.uv( uv ).toVar();

		const mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3( 0, 1, 0 ),
			vec3( t1.z, 0, t1.w )
		).toVar();

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		const fresnel = specularColor.mul( t2.x ).add( specularColor.oneMinus().mul( t2.y ) ).toVar();

		reflectedLight.directSpecular.addAssign( lightColor.mul( fresnel ).mul( LTC_Evaluate( { N, V, P, mInv, p0, p1, p2, p3 } ) ) );

		reflectedLight.directDiffuse.addAssign( lightColor.mul( diffuseColor ).mul( LTC_Evaluate( { N, V, P, mInv: mat3( 1, 0, 0, 0, 1, 0, 0, 0, 1 ), p0, p1, p2, p3 } ) ) );

	}

	indirect( context, stack, builder ) {

		this.indirectDiffuse( context, stack, builder );
		this.indirectSpecular( context, stack, builder );
		this.ambientOcclusion( context, stack, builder );

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

		const singleScattering = vec3().toVar( 'singleScattering' );
		const multiScattering = vec3().toVar( 'multiScattering' );
		const cosineWeightedIrradiance = iblIrradiance.mul( 1 / Math.PI );

		this.computeMultiscattering( singleScattering, multiScattering, specularF90 );

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

// These defines must match with PMREMGenerator

const cubeUV_r0 = /*@__PURE__*/ float( 1.0 );
const cubeUV_m0 = /*@__PURE__*/ float( - 2.0 );
const cubeUV_r1 = /*@__PURE__*/ float( 0.8 );
const cubeUV_m1 = /*@__PURE__*/ float( - 1.0 );
const cubeUV_r4 = /*@__PURE__*/ float( 0.4 );
const cubeUV_m4 = /*@__PURE__*/ float( 2.0 );
const cubeUV_r5 = /*@__PURE__*/ float( 0.305 );
const cubeUV_m5 = /*@__PURE__*/ float( 3.0 );
const cubeUV_r6 = /*@__PURE__*/ float( 0.21 );
const cubeUV_m6 = /*@__PURE__*/ float( 4.0 );

const cubeUV_minMipLevel = /*@__PURE__*/ float( 4.0 );
const cubeUV_minTileSize = /*@__PURE__*/ float( 16.0 );

// These shader functions convert between the UV coordinates of a single face of
// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
// sampling a textureCube (not generally normalized ).

const getFace = /*@__PURE__*/ Fn( ( [ direction ] ) => {

	const absDirection = vec3( abs( direction ) ).toVar();
	const face = float( - 1.0 ).toVar();

	If( absDirection.x.greaterThan( absDirection.z ), () => {

		If( absDirection.x.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.x.greaterThan( 0.0 ), 0.0, 3.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} ).Else( () => {

		If( absDirection.z.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.z.greaterThan( 0.0 ), 2.0, 5.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} );

	return face;

} ).setLayout( {
	name: 'getFace',
	type: 'float',
	inputs: [
		{ name: 'direction', type: 'vec3' }
	]
} );

// RH coordinate system; PMREM face-indexing convention
const getUV = /*@__PURE__*/ Fn( ( [ direction, face ] ) => {

	const uv = vec2().toVar();

	If( face.equal( 0.0 ), () => {

		uv.assign( vec2( direction.z, direction.y ).div( abs( direction.x ) ) ); // pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z.negate() ).div( abs( direction.y ) ) ); // pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.y ).div( abs( direction.z ) ) ); // pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		uv.assign( vec2( direction.z.negate(), direction.y ).div( abs( direction.x ) ) ); // neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z ).div( abs( direction.y ) ) ); // neg y

	} ).Else( () => {

		uv.assign( vec2( direction.x, direction.y ).div( abs( direction.z ) ) ); // neg z

	} );

	return mul( 0.5, uv.add( 1.0 ) );

} ).setLayout( {
	name: 'getUV',
	type: 'vec2',
	inputs: [
		{ name: 'direction', type: 'vec3' },
		{ name: 'face', type: 'float' }
	]
} );

const roughnessToMip = /*@__PURE__*/ Fn( ( [ roughness ] ) => {

	const mip = float( 0.0 ).toVar();

	If( roughness.greaterThanEqual( cubeUV_r1 ), () => {

		mip.assign( cubeUV_r0.sub( roughness ).mul( cubeUV_m1.sub( cubeUV_m0 ) ).div( cubeUV_r0.sub( cubeUV_r1 ) ).add( cubeUV_m0 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r4 ), () => {

		mip.assign( cubeUV_r1.sub( roughness ).mul( cubeUV_m4.sub( cubeUV_m1 ) ).div( cubeUV_r1.sub( cubeUV_r4 ) ).add( cubeUV_m1 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r5 ), () => {

		mip.assign( cubeUV_r4.sub( roughness ).mul( cubeUV_m5.sub( cubeUV_m4 ) ).div( cubeUV_r4.sub( cubeUV_r5 ) ).add( cubeUV_m4 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r6 ), () => {

		mip.assign( cubeUV_r5.sub( roughness ).mul( cubeUV_m6.sub( cubeUV_m5 ) ).div( cubeUV_r5.sub( cubeUV_r6 ) ).add( cubeUV_m5 ) );

	} ).Else( () => {

		mip.assign( float( - 2.0 ).mul( log2( mul( 1.16, roughness ) ) ) ); // 1.16 = 1.79^0.25

	} );

	return mip;

} ).setLayout( {
	name: 'roughnessToMip',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' }
	]
} );

// RH coordinate system; PMREM face-indexing convention
const getDirection = /*@__PURE__*/ Fn( ( [ uv_immutable, face ] ) => {

	const uv = uv_immutable.toVar();
	uv.assign( mul( 2.0, uv ).sub( 1.0 ) );
	const direction = vec3( uv, 1.0 ).toVar();

	If( face.equal( 0.0 ), () => {

		direction.assign( direction.zyx ); // ( 1, v, u ) pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		direction.assign( direction.xzy );
		direction.xz.mulAssign( - 1.0 ); // ( -u, 1, -v ) pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		direction.x.mulAssign( - 1.0 ); // ( -u, v, 1 ) pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		direction.assign( direction.zyx );
		direction.xz.mulAssign( - 1.0 ); // ( -1, v, -u ) neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		direction.assign( direction.xzy );
		direction.xy.mulAssign( - 1.0 ); // ( -u, -1, v ) neg y

	} ).ElseIf( face.equal( 5.0 ), () => {

		direction.z.mulAssign( - 1.0 ); // ( u, v, -1 ) neg zS

	} );

	return direction;

} ).setLayout( {
	name: 'getDirection',
	type: 'vec3',
	inputs: [
		{ name: 'uv', type: 'vec2' },
		{ name: 'face', type: 'float' }
	]
} );

//

const textureCubeUV = /*@__PURE__*/ Fn( ( [ envMap, sampleDir_immutable, roughness_immutable, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ] ) => {

	const roughness = float( roughness_immutable );
	const sampleDir = vec3( sampleDir_immutable );

	const mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
	const mipF = fract( mip );
	const mipInt = floor( mip );
	const color0 = vec3( bilinearCubeUV( envMap, sampleDir, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) ).toVar();

	If( mipF.notEqual( 0.0 ), () => {

		const color1 = vec3( bilinearCubeUV( envMap, sampleDir, mipInt.add( 1.0 ), CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) ).toVar();

		color0.assign( mix( color0, color1, mipF ) );

	} );

	return color0;

} );

const bilinearCubeUV = /*@__PURE__*/ Fn( ( [ envMap, direction_immutable, mipInt_immutable, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ] ) => {

	const mipInt = float( mipInt_immutable ).toVar();
	const direction = vec3( direction_immutable );
	const face = float( getFace( direction ) ).toVar();
	const filterInt = float( max$1( cubeUV_minMipLevel.sub( mipInt ), 0.0 ) ).toVar();
	mipInt.assign( max$1( mipInt, cubeUV_minMipLevel ) );
	const faceSize = float( exp2( mipInt ) ).toVar();
	const uv = vec2( getUV( direction, face ).mul( faceSize.sub( 2.0 ) ).add( 1.0 ) ).toVar();

	If( face.greaterThan( 2.0 ), () => {

		uv.y.addAssign( faceSize );
		face.subAssign( 3.0 );

	} );

	uv.x.addAssign( face.mul( faceSize ) );
	uv.x.addAssign( filterInt.mul( mul( 3.0, cubeUV_minTileSize ) ) );
	uv.y.addAssign( mul( 4.0, exp2( CUBEUV_MAX_MIP ).sub( faceSize ) ) );
	uv.x.mulAssign( CUBEUV_TEXEL_WIDTH );
	uv.y.mulAssign( CUBEUV_TEXEL_HEIGHT );

	return envMap.uv( uv ).grad( vec2(), vec2() ); // disable anisotropic filtering

} );

const getSample = /*@__PURE__*/ Fn( ( { envMap, mipInt, outputDirection, theta, axis, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const cosTheta = cos( theta );

	// Rodrigues' axis-angle rotation
	const sampleDirection = outputDirection.mul( cosTheta )
		.add( axis.cross( outputDirection ).mul( sin( theta ) ) )
		.add( axis.mul( axis.dot( outputDirection ).mul( cosTheta.oneMinus() ) ) );

	return bilinearCubeUV( envMap, sampleDirection, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP );

} );

const blur = /*@__PURE__*/ Fn( ( { n, latitudinal, poleAxis, outputDirection, weights, samples, dTheta, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const axis = vec3( select( latitudinal, poleAxis, cross( poleAxis, outputDirection ) ) ).toVar();

	If( all( axis.equals( vec3( 0.0 ) ) ), () => {

		axis.assign( vec3( outputDirection.z, 0.0, outputDirection.x.negate() ) );

	} );

	axis.assign( normalize( axis ) );

	const gl_FragColor = vec3().toVar();
	gl_FragColor.addAssign( weights.element( int( 0 ) ).mul( getSample( { theta: 0.0, axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );

	Loop( { start: int( 1 ), end: n }, ( { i } ) => {

		If( i.greaterThanEqual( samples ), () => {

			Break();

		} );

		const theta = float( dTheta.mul( float( i ) ) ).toVar();
		gl_FragColor.addAssign( weights.element( i ).mul( getSample( { theta: theta.mul( - 1.0 ), axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );
		gl_FragColor.addAssign( weights.element( i ).mul( getSample( { theta, axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );

	} );

	return vec4( gl_FragColor, 1 );

} );

let _generator = null;

const _cache = new WeakMap();

function _generateCubeUVSize( imageHeight ) {

	const maxMip = Math.log2( imageHeight ) - 2;

	const texelHeight = 1.0 / imageHeight;

	const texelWidth = 1.0 / ( 3 * Math.max( Math.pow( 2, maxMip ), 7 * 16 ) );

	return { texelWidth, texelHeight, maxMip };

}

function _getPMREMFromTexture( texture ) {

	let cacheTexture = _cache.get( texture );

	const pmremVersion = cacheTexture !== undefined ? cacheTexture.pmremVersion : - 1;

	if ( pmremVersion !== texture.pmremVersion ) {

		const image = texture.image;

		if ( texture.isCubeTexture ) {

			if ( isCubeMapReady( image ) ) {

				cacheTexture = _generator.fromCubemap( texture, cacheTexture );

			} else {

				return null;

			}


		} else {

			if ( isEquirectangularMapReady( image ) ) {

				cacheTexture = _generator.fromEquirectangular( texture, cacheTexture );

			} else {

				return null;

			}

		}

		cacheTexture.pmremVersion = texture.pmremVersion;

		_cache.set( texture, cacheTexture );

	}

	return cacheTexture.texture;

}

class PMREMNode extends TempNode {

	static get type() {

		return 'PMREMNode';

	}

	constructor( value, uvNode = null, levelNode = null ) {

		super( 'vec3' );

		this._value = value;
		this._pmrem = null;

		this.uvNode = uvNode;
		this.levelNode = levelNode;

		this._generator = null;

		const defaultTexture = new Texture();
		defaultTexture.isRenderTargetTexture = true;

		this._texture = texture( defaultTexture );

		this._width = uniform( 0 );
		this._height = uniform( 0 );
		this._maxMip = uniform( 0 );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	set value( value ) {

		this._value = value;
		this._pmrem = null;

	}

	get value() {

		return this._value;

	}

	updateFromTexture( texture ) {

		const cubeUVSize = _generateCubeUVSize( texture.image.height );

		this._texture.value = texture;
		this._width.value = cubeUVSize.texelWidth;
		this._height.value = cubeUVSize.texelHeight;
		this._maxMip.value = cubeUVSize.maxMip;

	}

	updateBefore() {

		let pmrem = this._pmrem;

		const pmremVersion = pmrem ? pmrem.pmremVersion : - 1;
		const texture = this._value;

		if ( pmremVersion !== texture.pmremVersion ) {

			if ( texture.isPMREMTexture === true ) {

				pmrem = texture;

			} else {

				pmrem = _getPMREMFromTexture( texture );

			}

			if ( pmrem !== null ) {

				this._pmrem = pmrem;

				this.updateFromTexture( pmrem );

			}

		}

	}

	setup( builder ) {

		if ( _generator === null ) {

			_generator = builder.createPMREMGenerator();

		}

		//

		this.updateBefore( builder );

		//

		let uvNode = this.uvNode;

		if ( uvNode === null && builder.context.getUV ) {

			uvNode = builder.context.getUV( this );

		}

		//

		const texture = this.value;

		if ( builder.renderer.coordinateSystem === WebGLCoordinateSystem && texture.isPMREMTexture !== true && texture.isRenderTargetTexture === true ) {

			uvNode = vec3( uvNode.x.negate(), uvNode.yz );

		}

		//

		let levelNode = this.levelNode;

		if ( levelNode === null && builder.context.getTextureLevel ) {

			levelNode = builder.context.getTextureLevel( this );

		}

		//

		return textureCubeUV( this._texture, uvNode, levelNode, this._width, this._height, this._maxMip );

	}

}

function isCubeMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	let count = 0;
	const length = 6;

	for ( let i = 0; i < length; i ++ ) {

		if ( image[ i ] !== undefined ) count ++;

	}

	return count === length;


}

function isEquirectangularMapReady( image ) {

	if ( image === null || image === undefined ) return false;

	return image.height > 0;

}

const pmremTexture = /*@__PURE__*/ nodeProxy( PMREMNode );

const _envNodeCache = new WeakMap();

class EnvironmentNode extends LightingNode {

	static get type() {

		return 'EnvironmentNode';

	}

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	setup( builder ) {

		const { material } = builder;

		let envNode = this.envNode;

		if ( envNode.isTextureNode || envNode.isMaterialReferenceNode ) {

			const value = ( envNode.isTextureNode ) ? envNode.value : material[ envNode.property ];

			let cacheEnvNode = _envNodeCache.get( value );

			if ( cacheEnvNode === undefined ) {

				cacheEnvNode = pmremTexture( value );

				_envNodeCache.set( value, cacheEnvNode );

			}

			envNode	= cacheEnvNode;

		}

		//

		const envMap = material.envMap;
		const intensity = envMap ? reference( 'envMapIntensity', 'float', builder.material ) : reference( 'environmentIntensity', 'float', builder.scene ); // @TODO: Add materialEnvIntensity in MaterialNode

		const useAnisotropy = material.useAnisotropy === true || material.anisotropy > 0;
		const radianceNormalView = useAnisotropy ? transformedBentNormalView : transformedNormalView;

		const radiance = envNode.context( createRadianceContext( roughness, radianceNormalView ) ).mul( intensity );
		const irradiance = envNode.context( createIrradianceContext( transformedNormalWorld ) ).mul( Math.PI ).mul( intensity );

		const isolateRadiance = cache( radiance );
		const isolateIrradiance = cache( irradiance );

		//

		builder.context.radiance.addAssign( isolateRadiance );

		builder.context.iblIrradiance.addAssign( isolateIrradiance );

		//

		const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			const clearcoatRadianceContext = envNode.context( createRadianceContext( clearcoatRoughness, transformedClearcoatNormalView ) ).mul( intensity );
			const isolateClearcoatRadiance = cache( clearcoatRadianceContext );

			clearcoatRadiance.addAssign( isolateClearcoatRadiance );

		}

	}

}

const createRadianceContext = ( roughnessNode, normalViewNode ) => {

	let reflectVec = null;

	return {
		getUV: () => {

			if ( reflectVec === null ) {

				reflectVec = positionViewDirection.negate().reflect( normalViewNode );

				// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
				reflectVec = roughnessNode.mul( roughnessNode ).mix( reflectVec, normalViewNode ).normalize();

				reflectVec = reflectVec.transformDirection( cameraViewMatrix );

			}

			return reflectVec;

		},
		getTextureLevel: () => {

			return roughnessNode;

		}
	};

};

const createIrradianceContext = ( normalWorldNode ) => {

	return {
		getUV: () => {

			return normalWorldNode;

		},
		getTextureLevel: () => {

			return float( 1.0 );

		}
	};

};

const _defaultValues$6 = /*@__PURE__*/ new MeshStandardMaterial();

class MeshStandardNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshStandardNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isMeshStandardNodeMaterial = true;

		this.lights = true;

		this.emissiveNode = null;

		this.metalnessNode = null;
		this.roughnessNode = null;

		this.setDefaultValues( _defaultValues$6 );

		this.setValues( parameters );

	}

	setupEnvironment( builder ) {

		let envNode = super.setupEnvironment( builder );

		if ( envNode === null && builder.environmentNode ) {

			envNode = builder.environmentNode;

		}

		return envNode ? new EnvironmentNode( envNode ) : null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel();

	}

	setupSpecular() {

		const specularColorNode = mix( vec3( 0.04 ), diffuseColor.rgb, metalness );

		specularColor.assign( specularColorNode );
		specularF90.assign( 1.0 );

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

		this.setupSpecular();

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

const _defaultValues$5 = /*@__PURE__*/ new MeshPhysicalMaterial();

class MeshPhysicalNodeMaterial extends MeshStandardNodeMaterial {

	static get type() {

		return 'MeshPhysicalNodeMaterial';

	}

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

		this.iorNode = null;
		this.transmissionNode = null;
		this.thicknessNode = null;
		this.attenuationDistanceNode = null;
		this.attenuationColorNode = null;
		this.dispersionNode = null;

		this.anisotropyNode = null;

		this.setDefaultValues( _defaultValues$5 );

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

	get useAnisotropy() {

		return this.anisotropy > 0 || this.anisotropyNode !== null;

	}

	get useTransmission() {

		return this.transmission > 0 || this.transmissionNode !== null;

	}

	get useDispersion() {

		return this.dispersion > 0 || this.dispersionNode !== null;

	}

	setupSpecular() {

		const iorNode = this.iorNode ? float( this.iorNode ) : materialIOR;

		ior.assign( iorNode );
		specularColor.assign( mix( min$1( pow2( ior.sub( 1.0 ).div( ior.add( 1.0 ) ) ).mul( materialSpecularColor ), vec3( 1.0 ) ).mul( materialSpecularIntensity ), diffuseColor.rgb, metalness ) );
		specularF90.assign( mix( materialSpecularIntensity, 1.0, metalness ) );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel( this.useClearcoat, this.useSheen, this.useIridescence, this.useAnisotropy, this.useTransmission, this.useDispersion );

	}

	setupVariants( builder ) {

		super.setupVariants( builder );

		// CLEARCOAT

		if ( this.useClearcoat ) {

			const clearcoatNode = this.clearcoatNode ? float( this.clearcoatNode ) : materialClearcoat;
			const clearcoatRoughnessNode = this.clearcoatRoughnessNode ? float( this.clearcoatRoughnessNode ) : materialClearcoatRoughness;

			clearcoat.assign( clearcoatNode );
			clearcoatRoughness.assign( getRoughness( { roughness: clearcoatRoughnessNode } ) );

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

		// ANISOTROPY

		if ( this.useAnisotropy ) {

			const anisotropyV = ( this.anisotropyNode ? vec2( this.anisotropyNode ) : materialAnisotropy ).toVar();

			anisotropy.assign( anisotropyV.length() );

			If( anisotropy.equal( 0.0 ), () => {

				anisotropyV.assign( vec2( 1.0, 0.0 ) );

			} ).Else( () => {

				anisotropyV.divAssign( vec2( anisotropy ) );
				anisotropy.assign( anisotropy.saturate() );

			} );

			// Roughness along the anisotropy bitangent is the material roughness, while the tangent roughness increases with anisotropy.
			alphaT.assign( anisotropy.pow2().mix( roughness.pow2(), 1.0 ) );

			anisotropyT.assign( TBNViewMatrix[ 0 ].mul( anisotropyV.x ).add( TBNViewMatrix[ 1 ].mul( anisotropyV.y ) ) );
			anisotropyB.assign( TBNViewMatrix[ 1 ].mul( anisotropyV.x ).sub( TBNViewMatrix[ 0 ].mul( anisotropyV.y ) ) );

		}

		// TRANSMISSION

		if ( this.useTransmission ) {

			const transmissionNode = this.transmissionNode ? float( this.transmissionNode ) : materialTransmission;
			const thicknessNode = this.thicknessNode ? float( this.thicknessNode ) : materialThickness;
			const attenuationDistanceNode = this.attenuationDistanceNode ? float( this.attenuationDistanceNode ) : materialAttenuationDistance;
			const attenuationColorNode = this.attenuationColorNode ? vec3( this.attenuationColorNode ) : materialAttenuationColor;

			transmission.assign( transmissionNode );
			thickness.assign( thicknessNode );
			attenuationDistance.assign( attenuationDistanceNode );
			attenuationColor.assign( attenuationColorNode );

			if ( this.useDispersion ) {

				const dispersionNode = this.dispersionNode ? float( this.dispersionNode ) : materialDispersion;

				dispersion.assign( dispersionNode );

			}

		}

	}

	setupClearcoatNormal() {

		return this.clearcoatNormalNode ? vec3( this.clearcoatNormalNode ) : materialClearcoatNormal;

	}

	setup( builder ) {

		builder.context.setupClearcoatNormal = () => this.setupClearcoatNormal( builder );

		super.setup( builder );

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
		this.dispersionNode = source.dispersionNode;

		this.anisotropyNode = source.anisotropyNode;

		return super.copy( source );

	}

}

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

	static get type() {

		return 'MeshSSSNodeMaterial';

	}

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

const getGradientIrradiance = /*@__PURE__*/ Fn( ( { normal, lightDirection, builder } ) => {

	// dotNL will be from -1.0 to 1.0
	const dotNL = normal.dot( lightDirection );
	const coord = vec2( dotNL.mul( 0.5 ).add( 0.5 ), 0.0 );

	if ( builder.material.gradientMap ) {

		const gradientMap = materialReference( 'gradientMap', 'texture' ).context( { getUV: () => coord } );

		return vec3( gradientMap.r );

	} else {

		const fw = coord.fwidth().mul( 0.5 );

		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( float( 0.7 ).sub( fw.x ), float( 0.7 ).add( fw.x ), coord.x ) );

	}

} );

class ToonLightingModel extends LightingModel {

	direct( { lightDirection, lightColor, reflectedLight }, stack, builder ) {

		const irradiance = getGradientIrradiance( { normal: normalGeometry, lightDirection, builder } ).mul( lightColor );

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

	}

	indirect( { ambientOcclusion, irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	}

}

const _defaultValues$4 = /*@__PURE__*/ new MeshToonMaterial();

class MeshToonNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshToonNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isMeshToonNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues$4 );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new ToonLightingModel();

	}

}

class MatcapUVNode extends TempNode {

	static get type() {

		return 'MatcapUVNode';

	}

	constructor() {

		super( 'vec2' );

	}

	setup() {

		const x = vec3( positionViewDirection.z, 0, positionViewDirection.x.negate() ).normalize();
		const y = positionViewDirection.cross( x );

		return vec2( x.dot( transformedNormalView ), y.dot( transformedNormalView ) ).mul( 0.495 ).add( 0.5 ); // 0.495 to remove artifacts caused by undersized matcap disks

	}

}

const matcapUV = /*@__PURE__*/ nodeImmutable( MatcapUVNode );

const _defaultValues$3 = /*@__PURE__*/ new MeshMatcapMaterial();

class MeshMatcapNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshMatcapNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.lights = false;

		this.isMeshMatcapNodeMaterial = true;

		this.setDefaultValues( _defaultValues$3 );

		this.setValues( parameters );

	}

	setupVariants( builder ) {

		const uv = matcapUV;

		let matcapColor;

		if ( builder.material.matcap ) {

			matcapColor = materialReference( 'matcap', 'texture' ).context( { getUV: () => uv } );

		} else {

			matcapColor = vec3( mix( 0.2, 0.8, uv.y ) ); // default if matcap is missing

		}

		diffuseColor.rgb.mulAssign( matcapColor.rgb );

	}

}

const _defaultValues$2 = /*@__PURE__*/ new PointsMaterial();

class PointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'PointsNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isPointsNodeMaterial = true;

		this.lights = false;
		this.transparent = true;

		this.sizeNode = null;

		this.setDefaultValues( _defaultValues$2 );

		this.setValues( parameters );

	}

	copy( source ) {

		this.sizeNode = source.sizeNode;

		return super.copy( source );

	}

}

class RotateNode extends TempNode {

	static get type() {

		return 'RotateNode';

	}

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

const rotate = /*@__PURE__*/ nodeProxy( RotateNode );

const _defaultValues$1 = /*@__PURE__*/ new SpriteMaterial();

class SpriteNodeMaterial extends NodeMaterial {

	static get type() {

		return 'SpriteNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isSpriteNodeMaterial = true;

		this.lights = false;
		this._useSizeAttenuation = true;

		this.positionNode = null;
		this.rotationNode = null;
		this.scaleNode = null;

		this.setDefaultValues( _defaultValues$1 );

		this.setValues( parameters );

	}

	setupPosition( { object, camera, context } ) {

		const sizeAttenuation = this.sizeAttenuation;

		// < VERTEX STAGE >

		const { positionNode, rotationNode, scaleNode } = this;

		const vertex = positionLocal;

		let mvPosition = modelViewMatrix.mul( vec3( positionNode || 0 ) );

		let scale = vec2( modelWorldMatrix[ 0 ].xyz.length(), modelWorldMatrix[ 1 ].xyz.length() );

		if ( scaleNode !== null ) {

			scale = scale.mul( scaleNode );

		}


		if ( ! sizeAttenuation ) {

			if ( camera.isPerspectiveCamera ) {

				scale = scale.mul( mvPosition.z.negate() );

			} else {

				const orthoScale = float( 2.0 ).div( cameraProjectionMatrix.element( 1 ).element( 1 ) );
				scale = scale.mul( orthoScale.mul( 2 ) );

			}

		}

		let alignedPosition = vertex.xy;

		if ( object.center && object.center.isVector2 === true ) {

			const center = reference$1( 'center', 'vec2' );

			alignedPosition = alignedPosition.sub( center.sub( 0.5 ) );

		}

		alignedPosition = alignedPosition.mul( scale );

		const rotation = float( rotationNode || materialRotation );

		const rotatedPosition = rotate( alignedPosition, rotation );

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

	get sizeAttenuation() {

		return this._useSizeAttenuation;

	}

	set sizeAttenuation( value ) {

		if ( this._useSizeAttenuation !== value ) {

			this._useSizeAttenuation = value;
			this.needsUpdate = true;

		}

	}

}

class ShadowMaskModel extends LightingModel {

	constructor() {

		super();

		this.shadowNode = float( 1 ).toVar( 'shadowMask' );

	}

	direct( { shadowMask } ) {

		this.shadowNode.mulAssign( shadowMask );

	}

	finish( context ) {

		diffuseColor.a.mulAssign( this.shadowNode.oneMinus() );

		context.outgoingLight.rgb.assign( diffuseColor.rgb ); // TODO: Optimize LightsNode to avoid this assignment

	}

}

const _defaultValues = /*@__PURE__*/ new ShadowMaterial();

class ShadowNodeMaterial extends NodeMaterial {

	static get type() {

		return 'ShadowNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isShadowNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new ShadowMaskModel();

	}

}

const normal = Fn( ( { texture, uv } ) => {

	const epsilon = 0.0001;

	const ret = vec3().toVar();

	If( uv.x.lessThan( epsilon ), () => {

		ret.assign( vec3( 1, 0, 0 ) );

	} ).ElseIf( uv.y.lessThan( epsilon ), () => {

		ret.assign( vec3( 0, 1, 0 ) );

	} ).ElseIf( uv.z.lessThan( epsilon ), () => {

		ret.assign( vec3( 0, 0, 1 ) );

	} ).ElseIf( uv.x.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( - 1, 0, 0 ) );

	} ).ElseIf( uv.y.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( 0, - 1, 0 ) );

	} ).ElseIf( uv.z.greaterThan( 1 - epsilon ), () => {

		ret.assign( vec3( 0, 0, - 1 ) );

	} ).Else( () => {

		const step = 0.01;

		const x = texture.uv( uv.add( vec3( - step, 0.0, 0.0 ) ) ).r.sub( texture.uv( uv.add( vec3( step, 0.0, 0.0 ) ) ).r );
		const y = texture.uv( uv.add( vec3( 0.0, - step, 0.0 ) ) ).r.sub( texture.uv( uv.add( vec3( 0.0, step, 0.0 ) ) ).r );
		const z = texture.uv( uv.add( vec3( 0.0, 0.0, - step ) ) ).r.sub( texture.uv( uv.add( vec3( 0.0, 0.0, step ) ) ).r );

		ret.assign( vec3( x, y, z ) );

	} );

	return ret.normalize();

} );


class Texture3DNode extends TextureNode {

	static get type() {

		return 'Texture3DNode';

	}

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isTexture3DNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'texture3D';

	}

	getDefaultUV() {

		return vec3( 0.5, 0.5, 0.5 );

	}

	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for 3d TextureNode

	setupUV( builder, uvNode ) {

		return uvNode;

	}

	generateUV( builder, uvNode ) {

		return uvNode.build( builder, 'vec3' );

	}

	normal( uvNode ) {

		return normal( { texture: this, uv: uvNode } );

	}

}

const texture3D = /*@__PURE__*/ nodeProxy( Texture3DNode );

class VolumeNodeMaterial extends NodeMaterial {

	static get type() {

		return 'VolumeNodeMaterial';

	}

	constructor( params = {} ) {

		super();

		this.lights = false;
		this.isVolumeNodeMaterial = true;
		this.testNode = null;

		this.setValues( params );

	}

	setup( builder ) {

		const map = texture3D( this.map, null, 0 );

		const hitBox = Fn( ( { orig, dir } ) => {

			const box_min = vec3( - 0.5 );
			const box_max = vec3( 0.5 );

			const inv_dir = dir.reciprocal();

			const tmin_tmp = box_min.sub( orig ).mul( inv_dir );
			const tmax_tmp = box_max.sub( orig ).mul( inv_dir );

			const tmin = min$1( tmin_tmp, tmax_tmp );
			const tmax = max$1( tmin_tmp, tmax_tmp );

			const t0 = max$1( tmin.x, max$1( tmin.y, tmin.z ) );
			const t1 = min$1( tmax.x, min$1( tmax.y, tmax.z ) );

			return vec2( t0, t1 );

		} );

		this.fragmentNode = Fn( () => {

			const vOrigin = varying( vec3( modelWorldMatrixInverse.mul( vec4( cameraPosition, 1.0 ) ) ) );
			const vDirection = varying( positionGeometry.sub( vOrigin ) );

			const rayDir = vDirection.normalize();
			const bounds = vec2( hitBox( { orig: vOrigin, dir: rayDir } ) ).toVar();

			bounds.x.greaterThan( bounds.y ).discard();

			bounds.assign( vec2( max$1( bounds.x, 0.0 ), bounds.y ) );

			const p = vec3( vOrigin.add( bounds.x.mul( rayDir ) ) ).toVar();
			const inc = vec3( rayDir.abs().reciprocal() ).toVar();
			const delta = float( min$1( inc.x, min$1( inc.y, inc.z ) ) ).toVar( 'delta' ); // used 'delta' name in loop

			delta.divAssign( materialReference( 'steps', 'float' ) );

			const ac = vec4( materialReference( 'base', 'color' ), 0.0 ).toVar();

			Loop( { type: 'float', start: bounds.x, end: bounds.y, update: '+= delta' }, () => {

				const d = property( 'float', 'd' ).assign( map.uv( p.add( 0.5 ) ).r );

				if ( this.testNode !== null ) {

					this.testNode( { map: map, mapValue: d, probe: p, finalColor: ac } ).append();

				} else {

					// default to show surface of mesh
					ac.a.assign( 1 );
					Break();

				}

				p.addAssign( rayDir.mul( delta ) );

			} );

			ac.a.equal( 0 ).discard();

			return vec4( ac );

		} )();

		super.setup( builder );

	}

}

class Animation {

	constructor( nodes, info ) {

		this.nodes = nodes;
		this.info = info;

		this._context = self;
		this._animationLoop = null;
		this._requestId = null;

	}

	start() {

		const update = ( time, frame ) => {

			this._requestId = this._context.requestAnimationFrame( update );

			if ( this.info.autoReset === true ) this.info.reset();

			this.nodes.nodeFrame.update();

			this.info.frame = this.nodes.nodeFrame.frameId;

			if ( this._animationLoop !== null ) this._animationLoop( time, frame );

		};

		update();

	}

	stop() {

		this._context.cancelAnimationFrame( this._requestId );

		this._requestId = null;

	}

	setAnimationLoop( callback ) {

		this._animationLoop = callback;

	}

	setContext( context ) {

		this._context = context;

	}

	dispose() {

		this.stop();

	}

}

class ChainMap {

	constructor() {

		this.weakMap = new WeakMap();

	}

	get( keys ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length; i ++ ) {

			map = map.get( keys[ i ] );

			if ( map === undefined ) return undefined;

		}

		return map.get( keys[ keys.length - 1 ] );

	}

	set( keys, value ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length; i ++ ) {

			const key = keys[ i ];

			if ( map.has( key ) === false ) map.set( key, new WeakMap() );

			map = map.get( key );

		}

		return map.set( keys[ keys.length - 1 ], value );

	}

	delete( keys ) {

		let map = this.weakMap;

		for ( let i = 0; i < keys.length; i ++ ) {

			map = map.get( keys[ i ] );

			if ( map === undefined ) return false;

		}

		return map.delete( keys[ keys.length - 1 ] );

	}

}

let _id$7 = 0;

function getKeys( obj ) {

	const keys = Object.keys( obj );

	let proto = Object.getPrototypeOf( obj );

	while ( proto ) {

		const descriptors = Object.getOwnPropertyDescriptors( proto );

		for ( const key in descriptors ) {

			if ( descriptors[ key ] !== undefined ) {

				const descriptor = descriptors[ key ];

				if ( descriptor && typeof descriptor.get === 'function' ) {

					keys.push( key );

				}

			}

		}

		proto = Object.getPrototypeOf( proto );

	}

	return keys;

}

class RenderObject {

	constructor( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext ) {

		this._nodes = nodes;
		this._geometries = geometries;

		this.id = _id$7 ++;

		this.renderer = renderer;
		this.object = object;
		this.material = material;
		this.scene = scene;
		this.camera = camera;
		this.lightsNode = lightsNode;
		this.context = renderContext;

		this.geometry = object.geometry;
		this.version = material.version;

		this.drawRange = null;

		this.attributes = null;
		this.pipeline = null;
		this.vertexBuffers = null;
		this.drawParams = null;

		this.bundle = null;

		this.clippingContext = clippingContext;
		this.clippingContextCacheKey = clippingContext !== null ? clippingContext.cacheKey : '';

		this.initialNodesCacheKey = this.getDynamicCacheKey();
		this.initialCacheKey = this.getCacheKey();

		this._nodeBuilderState = null;
		this._bindings = null;
		this._monitor = null;

		this.onDispose = null;

		this.isRenderObject = true;

		this.onMaterialDispose = () => {

			this.dispose();

		};

		this.material.addEventListener( 'dispose', this.onMaterialDispose );

	}

	updateClipping( parent ) {

		this.clippingContext = parent;

	}

	get clippingNeedsUpdate() {

		if ( this.clippingContext === null || this.clippingContext.cacheKey === this.clippingContextCacheKey ) return false;

		this.clippingContextCacheKey = this.clippingContext.cacheKey;

		return true;

	}

	get hardwareClippingPlanes() {

		return this.material.hardwareClipping === true ? this.clippingContext.unionClippingCount : 0;

	}

	getNodeBuilderState() {

		return this._nodeBuilderState || ( this._nodeBuilderState = this._nodes.getForRender( this ) );

	}

	getMonitor() {

		return this._monitor || ( this._monitor = this.getNodeBuilderState().monitor );

	}

	getBindings() {

		return this._bindings || ( this._bindings = this.getNodeBuilderState().createBindings() );

	}

	getIndex() {

		return this._geometries.getIndex( this );

	}

	getIndirect() {

		return this._geometries.getIndirect( this );

	}

	getChainArray() {

		return [ this.object, this.material, this.context, this.lightsNode ];

	}

	setGeometry( geometry ) {

		this.geometry = geometry;
		this.attributes = null;

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

	getDrawParameters() {

		const { object, material, geometry, group, drawRange } = this;

		const drawParams = this.drawParams || ( this.drawParams = {
			vertexCount: 0,
			firstVertex: 0,
			instanceCount: 0,
			firstInstance: 0
		} );

		const index = this.getIndex();
		const hasIndex = ( index !== null );
		const instanceCount = geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.count > 1 ? object.count : 1 );

		if ( instanceCount === 0 ) return null;

		drawParams.instanceCount = instanceCount;

		if ( object.isBatchedMesh === true ) return drawParams;

		let rangeFactor = 1;

		if ( material.wireframe === true && ! object.isPoints && ! object.isLineSegments && ! object.isLine && ! object.isLineLoop ) {

			rangeFactor = 2;

		}

		let firstVertex = drawRange.start * rangeFactor;
		let lastVertex = ( drawRange.start + drawRange.count ) * rangeFactor;

		if ( group !== null ) {

			firstVertex = Math.max( firstVertex, group.start * rangeFactor );
			lastVertex = Math.min( lastVertex, ( group.start + group.count ) * rangeFactor );

		}

		const position = geometry.attributes.position;
		let itemCount = Infinity;

		if ( hasIndex ) {

			itemCount = index.count;

		} else if ( position !== undefined && position !== null ) {

			itemCount = position.count;

		}

		firstVertex = Math.max( firstVertex, 0 );
		lastVertex = Math.min( lastVertex, itemCount );

		const count = lastVertex - firstVertex;

		if ( count < 0 || count === Infinity ) return null;

		drawParams.vertexCount = count;
		drawParams.firstVertex = firstVertex;

		return drawParams;

	}

	getGeometryCacheKey() {

		const { geometry } = this;

		let cacheKey = '';

		for ( const name of Object.keys( geometry.attributes ).sort() ) {

			const attribute = geometry.attributes[ name ];

			cacheKey += name + ',';

			if ( attribute.data ) cacheKey += attribute.data.stride + ',';
			if ( attribute.offset ) cacheKey += attribute.offset + ',';
			if ( attribute.itemSize ) cacheKey += attribute.itemSize + ',';
			if ( attribute.normalized ) cacheKey += 'n,';

		}

		if ( geometry.index ) {

			cacheKey += 'index,';

		}

		return cacheKey;

	}

	getMaterialCacheKey() {

		const { object, material } = this;

		let cacheKey = material.customProgramCacheKey();

		for ( const property of getKeys( material ) ) {

			if ( /^(is[A-Z]|_)|^(visible|version|uuid|name|opacity|userData)$/.test( property ) ) continue;

			const value = material[ property ];

			let valueKey;

			if ( value !== null ) {

				// some material values require a formatting

				const type = typeof value;

				if ( type === 'number' ) {

					valueKey = value !== 0 ? '1' : '0'; // Convert to on/off, important for clearcoat, transmission, etc

				} else if ( type === 'object' ) {

					valueKey = '{';

					if ( value.isTexture ) {

						valueKey += value.mapping;

					}

					valueKey += '}';

				} else {

					valueKey = String( value );

				}

			} else {

				valueKey = String( value );

			}

			cacheKey += /*property + ':' +*/ valueKey + ',';

		}

		cacheKey += this.clippingContextCacheKey + ',';

		if ( object.geometry ) {

			cacheKey += this.getGeometryCacheKey();

		}

		if ( object.skeleton ) {

			cacheKey += object.skeleton.bones.length + ',';

		}

		if ( object.morphTargetInfluences ) {

			cacheKey += object.morphTargetInfluences.length + ',';

		}

		if ( object.isBatchedMesh ) {

			cacheKey += object._matricesTexture.uuid + ',';

			if ( object._colorsTexture !== null ) {

				cacheKey += object._colorsTexture.uuid + ',';

			}

		}

		if ( object.count > 1 ) {

			// TODO: https://github.com/mrdoob/three.js/pull/29066#issuecomment-2269400850

			cacheKey += object.uuid + ',';

		}

		return hashString( cacheKey );

	}

	get needsGeometryUpdate() {

		return this.geometry.id !== this.object.geometry.id;

	}

	get needsUpdate() {

		return /*this.object.static !== true &&*/ ( this.initialNodesCacheKey !== this.getDynamicCacheKey() || this.clippingNeedsUpdate );

	}

	getDynamicCacheKey() {

		// Environment Nodes Cache Key

		let cacheKey = this._nodes.getCacheKey( this.scene, this.lightsNode );

		if ( this.object.receiveShadow ) {

			cacheKey += 1;

		}

		return cacheKey;

	}

	getCacheKey() {

		return this.getMaterialCacheKey() + this.getDynamicCacheKey();

	}

	dispose() {

		this.material.removeEventListener( 'dispose', this.onMaterialDispose );

		this.onDispose();

	}

}

const chainArray = [];

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

	get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		// reuse chainArray
		chainArray[ 0 ] = object;
		chainArray[ 1 ] = material;
		chainArray[ 2 ] = renderContext;
		chainArray[ 3 ] = lightsNode;

		let renderObject = chainMap.get( chainArray );

		if ( renderObject === undefined ) {

			renderObject = this.createRenderObject( this.nodes, this.geometries, this.renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

			chainMap.set( chainArray, renderObject );

		} else {

			renderObject.updateClipping( clippingContext );

			const needsGeometryUpdate = renderObject.needsGeometryUpdate;

			if ( renderObject.version !== material.version || renderObject.needsUpdate || needsGeometryUpdate ) {

				if ( renderObject.initialCacheKey !== renderObject.getCacheKey() ) {

					renderObject.dispose();

					renderObject = this.get( object, material, scene, camera, lightsNode, renderContext, clippingContext, passId );

				} else {

					renderObject.version = material.version;

					if ( needsGeometryUpdate ) {

						renderObject.setGeometry( object.geometry );

					}

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

	createRenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext, passId ) {

		const chainMap = this.getChainMap( passId );

		const renderObject = new RenderObject( nodes, geometries, renderer, object, material, scene, camera, lightsNode, renderContext, clippingContext );

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
	STORAGE: 3,
	INDIRECT: 4
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

		return attributeData;

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

			} else if ( type === AttributeType.INDIRECT ) {

				this.backend.createIndirectStorageAttribute( attribute );

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

		// attributes

		const attributes = renderObject.getAttributes();

		for ( const attribute of attributes ) {

			if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) {

				this.updateAttribute( attribute, AttributeType.STORAGE );

			} else {

				this.updateAttribute( attribute, AttributeType.VERTEX );

			}

		}

		// indexes

		const index = this.getIndex( renderObject );

		if ( index !== null ) {

			this.updateAttribute( index, AttributeType.INDEX );

		}

		// indirect

		const indirect = renderObject.geometry.indirect;

		if ( indirect !== null ) {

			this.updateAttribute( indirect, AttributeType.INDIRECT );

		}

	}

	updateAttribute( attribute, type ) {

		const callId = this.info.render.calls;

		if ( ! attribute.isInterleavedBufferAttribute ) {

			if ( this.attributeCall.get( attribute ) !== callId ) {

				this.attributes.update( attribute, type );

				this.attributeCall.set( attribute, callId );

			}

		} else {

			if ( this.attributeCall.get( attribute ) === undefined ) {

				this.attributes.update( attribute, type );

				this.attributeCall.set( attribute, callId );

			} else if ( this.attributeCall.get( attribute.data ) !== callId ) {

				this.attributes.update( attribute, type );

				this.attributeCall.set( attribute.data, callId );

				this.attributeCall.set( attribute, callId );

			}

		}

	}

	getIndirect( renderObject ) {

		return renderObject.geometry.indirect;

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
			frameCalls: 0,
			drawCalls: 0,
			triangles: 0,
			points: 0,
			lines: 0,
			timestamp: 0,
			previousFrameCalls: 0,
			timestampCalls: 0
		};

		this.compute = {
			calls: 0,
			frameCalls: 0,
			timestamp: 0,
			previousFrameCalls: 0,
			timestampCalls: 0
		};

		this.memory = {
			geometries: 0,
			textures: 0
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

		if ( this[ type ].timestampCalls === 0 ) {

			this[ type ].timestamp = 0;

		}


		this[ type ].timestamp += time;

		this[ type ].timestampCalls ++;


		if ( this[ type ].timestampCalls >= this[ type ].previousFrameCalls ) {

			this[ type ].timestampCalls = 0;

		}


	}

	reset() {

		const previousRenderFrameCalls = this.render.frameCalls;
		this.render.previousFrameCalls = previousRenderFrameCalls;

		const previousComputeFrameCalls = this.compute.frameCalls;
		this.compute.previousFrameCalls = previousComputeFrameCalls;


		this.render.drawCalls = 0;
		this.render.frameCalls = 0;
		this.compute.frameCalls = 0;

		this.render.triangles = 0;
		this.render.points = 0;
		this.render.lines = 0;


	}

	dispose() {

		this.reset();

		this.calls = 0;

		this.render.calls = 0;
		this.compute.calls = 0;

		this.render.timestamp = 0;
		this.compute.timestamp = 0;
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

let _id$6 = 0;

class ProgrammableStage {

	constructor( code, type, transforms = null, attributes = null ) {

		this.id = _id$6 ++;

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

				if ( previousPipeline && previousPipeline.usedTimes === 0 ) this._releasePipeline( previousPipeline );

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

		return super.delete( object );

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

		for ( const bindGroup of bindings ) {

			const groupData = this.get( bindGroup );

			if ( groupData.bindGroup === undefined ) {

				// each object defines an array of bindings (ubos, textures, samplers etc.)

				this._init( bindGroup );

				this.backend.createBindings( bindGroup, bindings );

				groupData.bindGroup = bindGroup;

			}

		}

		return bindings;

	}

	getForCompute( computeNode ) {

		const bindings = this.nodes.getForCompute( computeNode ).bindings;

		for ( const bindGroup of bindings ) {

			const groupData = this.get( bindGroup );

			if ( groupData.bindGroup === undefined ) {

				this._init( bindGroup );

				this.backend.createBindings( bindGroup, bindings );

				groupData.bindGroup = bindGroup;

			}

		}

		return bindings;

	}

	updateForCompute( computeNode ) {

		this._updateBindings( this.getForCompute( computeNode ) );

	}

	updateForRender( renderObject ) {

		this._updateBindings( this.getForRender( renderObject ) );

	}

	_updateBindings( bindings ) {

		for ( const bindGroup of bindings ) {

			this._update( bindGroup, bindings );

		}

	}

	_init( bindGroup ) {

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isSampledTexture ) {

				this.textures.updateTexture( binding.texture );

			} else if ( binding.isStorageBuffer ) {

				const attribute = binding.attribute;
				const attributeType = attribute.isIndirectStorageBufferAttribute ? AttributeType.INDIRECT : AttributeType.STORAGE;

				this.attributes.update( attribute, attributeType );

			}

		}

	}

	_update( bindGroup, bindings ) {

		const { backend } = this;

		let needsBindingsUpdate = false;

		// iterate over all bindings and check if buffer updates or a new binding group is required

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isNodeUniformsGroup ) {

				const updated = this.nodes.updateGroup( binding );

				if ( ! updated ) continue;

			}

			if ( binding.isUniformBuffer ) {

				const updated = binding.update();

				if ( updated ) {

					backend.updateBinding( binding );

				}

			} else if ( binding.isSampler ) {

				binding.update();

			} else if ( binding.isSampledTexture ) {

				if ( binding.needsBindingsUpdate( this.textures.get( binding.texture ).generation ) ) needsBindingsUpdate = true;

				const updated = binding.update();

				const texture = binding.texture;

				if ( updated ) {

					this.textures.updateTexture( texture );

				}

				const textureData = backend.get( texture );

				if ( backend.isWebGPUBackend === true && textureData.texture === undefined && textureData.externalTexture === undefined ) {

					// TODO: Remove this once we found why updated === false isn't bound to a texture in the WebGPU backend
					console.error( 'Bindings._update: binding should be available:', binding, updated, texture, binding.textureNode.value, needsBindingsUpdate );

					this.textures.updateTexture( texture );
					needsBindingsUpdate = true;

				}

				if ( texture.isStorageTexture === true ) {

					const textureData = this.get( texture );

					if ( binding.store === true ) {

						textureData.needsMipmap = true;

					} else if ( this.textures.needsMipmaps( texture ) && textureData.needsMipmap === true ) {

						this.backend.generateMipmaps( texture );

						textureData.needsMipmap = false;

					}

				}

			}

		}

		if ( needsBindingsUpdate === true ) {

			this.backend.updateBindings( bindGroup, bindings );

		}

	}

}

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

function needsDoublePass( material ) {

	const hasTransmission = material.transmission > 0 || material.transmissionNode;

	return hasTransmission && material.side === DoubleSide && material.forceSinglePass === false;

}

class RenderList {

	constructor( lighting, scene, camera ) {

		this.renderItems = [];
		this.renderItemsIndex = 0;

		this.opaque = [];
		this.transparentDoublePass = [];
		this.transparent = [];
		this.bundles = [];

		this.lightsNode = lighting.getNode( scene, camera );
		this.lightsArray = [];

		this.scene = scene;
		this.camera = camera;

		this.occlusionQueryCount = 0;

	}

	begin() {

		this.renderItemsIndex = 0;

		this.opaque.length = 0;
		this.transparentDoublePass.length = 0;
		this.transparent.length = 0;
		this.bundles.length = 0;

		this.lightsArray.length = 0;

		this.occlusionQueryCount = 0;

		return this;

	}

	getNextRenderItem( object, geometry, material, groupOrder, z, group, clippingContext ) {

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
				group: group,
				clippingContext: clippingContext
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
			renderItem.clippingContext = clippingContext;

		}

		this.renderItemsIndex ++;

		return renderItem;

	}

	push( object, geometry, material, groupOrder, z, group, clippingContext ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group, clippingContext );

		if ( object.occlusionTest === true ) this.occlusionQueryCount ++;

		if ( material.transparent === true || material.transmission > 0 ) {

			if ( needsDoublePass( material ) ) this.transparentDoublePass.push( renderItem );

			this.transparent.push( renderItem );

		} else {

			this.opaque.push( renderItem );

		}

	}

	unshift( object, geometry, material, groupOrder, z, group, clippingContext ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group, clippingContext );

		if ( material.transparent === true || material.transmission > 0 ) {

			if ( needsDoublePass( material ) ) this.transparentDoublePass.unshift( renderItem );

			this.transparent.unshift( renderItem );

		} else {

			this.opaque.unshift( renderItem );

		}

	}

	pushBundle( group ) {

		this.bundles.push( group );

	}

	pushLight( light ) {

		this.lightsArray.push( light );

	}

	sort( customOpaqueSort, customTransparentSort ) {

		if ( this.opaque.length > 1 ) this.opaque.sort( customOpaqueSort || painterSortStable );
		if ( this.transparentDoublePass.length > 1 ) this.transparentDoublePass.sort( customTransparentSort || reversePainterSortStable );
		if ( this.transparent.length > 1 ) this.transparent.sort( customTransparentSort || reversePainterSortStable );

	}

	finish() {

		// update lights

		this.lightsNode.setLights( this.lightsArray );

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
			renderItem.clippingContext = null;

		}

	}

}

class RenderLists {

	constructor( lighting ) {

		this.lighting = lighting;

		this.lists = new ChainMap();

	}

	get( scene, camera ) {

		const lists = this.lists;
		const keys = [ scene, camera ];

		let list = lists.get( keys );

		if ( list === undefined ) {

			list = new RenderList( this.lighting, scene, camera );
			lists.set( keys, list );

		}

		return list;

	}

	dispose() {

		this.lists = new ChainMap();

	}

}

let id$1 = 0;

class RenderContext {

	constructor() {

		this.id = id$1 ++;

		this.color = true;
		this.clearColor = true;
		this.clearColorValue = { r: 0, g: 0, b: 0, a: 1 };

		this.depth = true;
		this.clearDepth = true;
		this.clearDepthValue = 1;

		this.stencil = false;
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

	getCacheKey() {

		return getCacheKey( this );

	}

}

function getCacheKey( renderContext ) {

	const { textures, activeCubeFace } = renderContext;

	const values = [ activeCubeFace ];

	for ( const texture of textures ) {

		values.push( texture.id );

	}

	return hashArray( values );

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
			const count = renderTarget.textures.length;

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

const _size$3 = /*@__PURE__*/ new Vector3();

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

		const textures = renderTarget.textures;

		const size = this.getSize( textures[ 0 ] );

		const mipWidth = size.width >> activeMipmapLevel;
		const mipHeight = size.height >> activeMipmapLevel;

		let depthTexture = renderTarget.depthTexture || depthTextureMips[ activeMipmapLevel ];
		const useDepthTexture = renderTarget.depthBuffer === true || renderTarget.stencilBuffer === true;

		let textureNeedsUpdate = false;

		if ( depthTexture === undefined && useDepthTexture ) {

			depthTexture = new DepthTexture();
			depthTexture.format = renderTarget.stencilBuffer ? DepthStencilFormat : DepthFormat;
			depthTexture.type = renderTarget.stencilBuffer ? UnsignedInt248Type : UnsignedIntType; // FloatType
			depthTexture.image.width = mipWidth;
			depthTexture.image.height = mipHeight;

			depthTextureMips[ activeMipmapLevel ] = depthTexture;

		}

		if ( renderTargetData.width !== size.width || size.height !== renderTargetData.height ) {

			textureNeedsUpdate = true;

			if ( depthTexture ) {

				depthTexture.needsUpdate = true;
				depthTexture.image.width = mipWidth;
				depthTexture.image.height = mipHeight;

			}

		}

		renderTargetData.width = size.width;
		renderTargetData.height = size.height;
		renderTargetData.textures = textures;
		renderTargetData.depthTexture = depthTexture || null;
		renderTargetData.depth = renderTarget.depthBuffer;
		renderTargetData.stencil = renderTarget.stencilBuffer;
		renderTargetData.renderTarget = renderTarget;

		if ( renderTargetData.sampleCount !== sampleCount ) {

			textureNeedsUpdate = true;

			if ( depthTexture ) {

				depthTexture.needsUpdate = true;

			}

			renderTargetData.sampleCount = sampleCount;

		}

		//

		const options = { sampleCount };

		for ( let i = 0; i < textures.length; i ++ ) {

			const texture = textures[ i ];

			if ( textureNeedsUpdate ) texture.needsUpdate = true;

			this.updateTexture( texture, options );

		}

		if ( depthTexture ) {

			this.updateTexture( depthTexture, options );

		}

		// dispose handler

		if ( renderTargetData.initialized !== true ) {

			renderTargetData.initialized = true;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				for ( let i = 0; i < textures.length; i ++ ) {

					this._destroyTexture( textures[ i ] );

				}

				if ( depthTexture ) {

					this._destroyTexture( depthTexture );

				}

				this.delete( renderTarget );

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

			const renderTarget = this.renderer.getRenderTarget();

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

			textureData.generation = texture.version;

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
						textureData.generation = texture.version;

					}

					if ( texture.source.dataReady === true ) backend.updateTexture( texture, options );

					if ( options.needsMipmaps && texture.mipmaps.length === 0 ) backend.generateMipmaps( texture );

				}

			} else {

				// async update

				backend.createDefaultTexture( texture );

				textureData.isDefaultTexture = true;
				textureData.generation = texture.version;

			}

		}

		// dispose handler

		if ( textureData.initialized !== true ) {

			textureData.initialized = true;
			textureData.generation = texture.version;

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

	getSize( texture, target = _size$3 ) {

		let image = texture.images ? texture.images[ 0 ] : texture.image;

		if ( image ) {

			if ( image.image !== undefined ) image = image.image;

			target.width = image.width || 1;
			target.height = image.height || 1;
			target.depth = texture.isCubeTexture ? 6 : ( image.depth || 1 );

		} else {

			target.width = target.height = target.depth = 1;

		}

		return target;

	}

	getMipLevels( texture, width, height ) {

		let mipLevelCount;

		if ( texture.isCompressedTexture ) {

			if ( texture.mipmaps ) {

				mipLevelCount = texture.mipmaps.length;

			} else {

				mipLevelCount = 1;

			}

		} else {

			mipLevelCount = Math.floor( Math.log2( Math.max( width, height ) ) ) + 1;

		}

		return mipLevelCount;

	}

	needsMipmaps( texture ) {

		return this.isEnvironmentTexture( texture ) || texture.isCompressedTexture === true || texture.generateMipmaps;

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

class ParameterNode extends PropertyNode {

	static get type() {

		return 'ParameterNode';

	}

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

const parameter = ( type, name ) => nodeObject( new ParameterNode( type, name ) );

class StackNode extends Node {

	static get type() {

		return 'StackNode';

	}

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

	If( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		this._currentCond = select( boolNode, methodNode );

		return this.add( this._currentCond );

	}

	ElseIf( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		const ifNode = select( boolNode, methodNode );

		this._currentCond.elseNode = ifNode;
		this._currentCond = ifNode;

		return this;

	}

	Else( method ) {

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

	//

	else( ...params ) { // @deprecated, r168

		console.warn( 'TSL.StackNode: .else() has been renamed to .Else().' );
		return this.Else( ...params );

	}

	elseif( ...params ) { // @deprecated, r168

		console.warn( 'TSL.StackNode: .elseif() has been renamed to .ElseIf().' );
		return this.ElseIf( ...params );

	}

}

const stack = /*@__PURE__*/ nodeProxy( StackNode );

class StructTypeNode extends Node {

	static get type() {

		return 'StructTypeNode';

	}

	constructor( types ) {

		super();

		this.types = types;
		this.isStructTypeNode = true;

	}

	getMemberTypes() {

		return this.types;

	}

}

class OutputStructNode extends Node {

	static get type() {

		return 'OutputStructNode';

	}

	constructor( ...members ) {

		super();

		this.members = members;

		this.isOutputStructNode = true;

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

		const propertyName = builder.getOutputStructName();
		const members = this.members;

		const structPrefix = propertyName !== '' ? propertyName + '.' : '';

		for ( let i = 0; i < members.length; i ++ ) {

			const snippet = members[ i ].build( builder, output );

			builder.addLineFlowCode( `${ structPrefix }m${ i } = ${ snippet }`, this );

		}

		return propertyName;

	}

}

const outputStruct = /*@__PURE__*/ nodeProxy( OutputStructNode );

function getTextureIndex( textures, name ) {

	for ( let i = 0; i < textures.length; i ++ ) {

		if ( textures[ i ].name === name ) {

			return i;

		}

	}

	return - 1;

}

class MRTNode extends OutputStructNode {

	static get type() {

		return 'MRTNode';

	}

	constructor( outputNodes ) {

		super();

		this.outputNodes = outputNodes;

		this.isMRTNode = true;

	}

	has( name ) {

		return this.outputNodes[ name ] !== undefined;

	}

	get( name ) {

		return this.outputNodes[ name ];

	}

	merge( mrtNode ) {

		const outputs = { ...this.outputNodes, ...mrtNode.outputNodes };

		return mrt( outputs );

	}

	setup( builder ) {

		const outputNodes = this.outputNodes;
		const mrt = builder.renderer.getRenderTarget();

		const members = [];

		const textures = mrt.textures;

		for ( const name in outputNodes ) {

			const index = getTextureIndex( textures, name );

			members[ index ] = vec4( outputNodes[ name ] );

		}

		this.members = members;

		return super.setup( builder );

	}

}

const mrt = /*@__PURE__*/ nodeProxy( MRTNode );

const hash = /*@__PURE__*/ Fn( ( [ seed ] ) => {

	// Taken from https://www.shadertoy.com/view/XlGcRh, originally from pcg-random.org

	const state = seed.toUint().mul( 747796405 ).add( 2891336453 );
	const word = state.shiftRight( state.shiftRight( 28 ).add( 4 ) ).bitXor( state ).mul( 277803737 );
	const result = word.shiftRight( 22 ).bitXor( word );

	return result.toFloat().mul( 1 / 2 ** 32 ); // Convert to range [0, 1)

} );

// remapping functions https://iquilezles.org/articles/functions/
const parabola = ( x, k ) => pow( mul( 4.0, x.mul( sub( 1.0, x ) ) ), k );
const gain = ( x, k ) => x.lessThan( 0.5 ) ? parabola( x.mul( 2.0 ), k ).div( 2.0 ) : sub( 1.0, parabola( mul( sub( 1.0, x ), 2.0 ), k ).div( 2.0 ) );
const pcurve = ( x, a, b ) => pow( div( pow( x, a ), add( pow( x, a ), pow( sub( 1.0, x ), b ) ) ), 1.0 / a );
const sinc = ( x, k ) => sin( PI.mul( k.mul( x ).sub( 1.0 ) ) ).div( PI.mul( k.mul( x ).sub( 1.0 ) ) );

// https://github.com/cabbibo/glsl-tri-noise-3d


const tri = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return x.fract().sub( .5 ).abs();

} ).setLayout( {
	name: 'tri',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

const tri3 = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return vec3( tri( p.z.add( tri( p.y.mul( 1. ) ) ) ), tri( p.z.add( tri( p.x.mul( 1. ) ) ) ), tri( p.y.add( tri( p.x.mul( 1. ) ) ) ) );

} ).setLayout( {
	name: 'tri3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

const triNoise3D = /*@__PURE__*/ Fn( ( [ p_immutable, spd, time ] ) => {

	const p = vec3( p_immutable ).toVar();
	const z = float( 1.4 ).toVar();
	const rz = float( 0.0 ).toVar();
	const bp = vec3( p ).toVar();

	Loop( { start: float( 0.0 ), end: float( 3.0 ), type: 'float', condition: '<=' }, () => {

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

} ).setLayout( {
	name: 'triNoise3D',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'spd', type: 'float' },
		{ name: 'time', type: 'float' }
	]
} );

class FunctionOverloadingNode extends Node {

	static get type() {

		return 'FunctionOverloadingNode';

	}

	constructor( functionNodes = [], ...parametersNodes ) {

		super();

		this.functionNodes = functionNodes;
		this.parametersNodes = parametersNodes;

		this._candidateFnCall = null;

		this.global = true;

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

const overloadingBaseFn = /*@__PURE__*/ nodeProxy( FunctionOverloadingNode );

const overloadingFn = ( functionNodes ) => ( ...params ) => overloadingBaseFn( functionNodes, ...params );

const time = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.time );
const deltaTime = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.deltaTime );
const frameId = /*@__PURE__*/ uniform( 0, 'uint' ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.frameId );

// Deprecated

const timerLocal = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerLocal() is deprecated. Use "time" instead.' );
	return time.mul( timeScale );

};

const timerGlobal = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerGlobal() is deprecated. Use "time" instead.' );
	return time.mul( timeScale );

};

const timerDelta = ( timeScale = 1 ) => { // @deprecated, r170

	console.warn( 'TSL: timerDelta() is deprecated. Use "deltaTime" instead.' );
	return deltaTime.mul( timeScale );

};

const oscSine = ( t = time ) => t.add( 0.75 ).mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 );
const oscSquare = ( t = time ) => t.fract().round();
const oscTriangle = ( t = time ) => t.add( 0.5 ).fract().mul( 2 ).sub( 1 ).abs();
const oscSawtooth = ( t = time ) => t.fract();

const rotateUV = /*@__PURE__*/ Fn( ( [ uv, rotation, center = vec2( 0.5 ) ] ) => {

	return rotate( uv.sub( center ), rotation ).add( center );

} );

const spherizeUV = /*@__PURE__*/ Fn( ( [ uv, strength, center = vec2( 0.5 ) ] ) => {

	const delta = uv.sub( center );
	const delta2 = delta.dot( delta );
	const delta4 = delta2.mul( delta2 );
	const deltaOffset = delta4.mul( strength );

	return uv.add( delta.mul( deltaOffset ) );

} );

const billboarding = /*@__PURE__*/ Fn( ( { position = null, horizontal = true, vertical = false } ) => {

	let worldMatrix;

	if ( position !== null ) {

		worldMatrix = modelWorldMatrix.toVar();
		worldMatrix[ 3 ][ 0 ] = position.x;
		worldMatrix[ 3 ][ 1 ] = position.y;
		worldMatrix[ 3 ][ 2 ] = position.z;

	} else {

		worldMatrix = modelWorldMatrix;

	}

	const modelViewMatrix = cameraViewMatrix.mul( worldMatrix );

	if ( defined( horizontal ) ) {

		modelViewMatrix[ 0 ][ 0 ] = modelWorldMatrix[ 0 ].length();
		modelViewMatrix[ 0 ][ 1 ] = 0;
		modelViewMatrix[ 0 ][ 2 ] = 0;

	}

	if ( defined( vertical ) ) {

		modelViewMatrix[ 1 ][ 0 ] = 0;
		modelViewMatrix[ 1 ][ 1 ] = modelWorldMatrix[ 1 ].length();
		modelViewMatrix[ 1 ][ 2 ] = 0;

	}

	modelViewMatrix[ 2 ][ 0 ] = 0;
	modelViewMatrix[ 2 ][ 1 ] = 0;
	modelViewMatrix[ 2 ][ 2 ] = 1;

	return cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionLocal );

} );

const viewportSafeUV = /*@__PURE__*/ Fn( ( [ uv = null ] ) => {

	const depth = linearDepth();
	const depthDiff = linearDepth( viewportDepthTexture( uv ) ).sub( depth );
	const finalUV = depthDiff.lessThan( 0 ).select( screenUV, uv );

	return finalUV;

} );

class SpriteSheetUVNode extends Node {

	static get type() {

		return 'SpriteSheetUVNode';

	}

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

const spritesheetUV = /*@__PURE__*/ nodeProxy( SpriteSheetUVNode );

class TriplanarTexturesNode extends Node {

	static get type() {

		return 'TriplanarTexturesNode';

	}

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

const triplanarTextures = /*@__PURE__*/ nodeProxy( TriplanarTexturesNode );
const triplanarTexture = ( ...params ) => triplanarTextures( ...params );

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

const _size$2 = new Vector2();

const _defaultRT = new RenderTarget();
const _defaultUV = screenUV.flipX();

_defaultRT.depthTexture = new DepthTexture( 1, 1 );

let _inReflector = false;

class ReflectorNode extends TextureNode {

	static get type() {

		return 'ReflectorNode';

	}

	constructor( parameters = {} ) {

		super( parameters.defaultTexture || _defaultRT.texture, _defaultUV );

		this._reflectorBaseNode = parameters.reflector || new ReflectorBaseNode( this, parameters );
		this._depthNode = null;

		this.setUpdateMatrix( false );

	}

	get reflector() {

		return this._reflectorBaseNode;

	}

	get target() {

		return this._reflectorBaseNode.target;

	}

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

}


class ReflectorBaseNode extends Node {

	static get type() {

		return 'ReflectorBaseNode';

	}

	constructor( textureNode, parameters = {} ) {

		super();

		const {
			target = new Object3D(),
			resolution = 1,
			generateMipmaps = false,
			bounces = true,
			depth = false
		} = parameters;

		//

		this.textureNode = textureNode;

		this.target = target;
		this.resolution = resolution;
		this.generateMipmaps = generateMipmaps;
		this.bounces = bounces;
		this.depth = depth;

		this.updateBeforeType = bounces ? NodeUpdateType.RENDER : NodeUpdateType.FRAME;

		this.virtualCameras = new WeakMap();
		this.renderTargets = new WeakMap();

	}

	_updateResolution( renderTarget, renderer ) {

		const resolution = this.resolution;

		renderer.getDrawingBufferSize( _size$2 );

		renderTarget.setSize( Math.round( _size$2.width * resolution ), Math.round( _size$2.height * resolution ) );

	}

	setup( builder ) {

		this._updateResolution( _defaultRT, builder.renderer );

		return super.setup( builder );

	}

	getVirtualCamera( camera ) {

		let virtualCamera = this.virtualCameras.get( camera );

		if ( virtualCamera === undefined ) {

			virtualCamera = camera.clone();

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

			if ( this.depth === true ) {

				renderTarget.depthTexture = new DepthTexture();

			}

			this.renderTargets.set( camera, renderTarget );

		}

		return renderTarget;

	}

	updateBefore( frame ) {

		if ( this.bounces === false && _inReflector ) return;

		_inReflector = true;

		const { scene, camera, renderer, material } = frame;
		const { target } = this;

		const virtualCamera = this.getVirtualCamera( camera );
		const renderTarget = this.getRenderTarget( virtualCamera );

		renderer.getDrawingBufferSize( _size$2 );

		this._updateResolution( renderTarget, renderer );

		//

		_reflectorWorldPosition.setFromMatrixPosition( target.matrixWorld );
		_cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

		_rotationMatrix.extractRotation( target.matrixWorld );

		_normal.set( 0, 0, 1 );
		_normal.applyMatrix4( _rotationMatrix );

		_view.subVectors( _reflectorWorldPosition, _cameraWorldPosition );

		// Avoid rendering when reflector is facing away

		if ( _view.dot( _normal ) > 0 ) return;

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

		renderer.setMRT( null );
		renderer.setRenderTarget( renderTarget );

		renderer.render( scene, virtualCamera );

		renderer.setMRT( currentMRT );
		renderer.setRenderTarget( currentRenderTarget );

		material.visible = true;

		_inReflector = false;

	}

}

const reflector = ( parameters ) => nodeObject( new ReflectorNode( parameters ) );

// Helper for passes that need to fill the viewport with a single quad.

const _camera = /*@__PURE__*/ new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

class QuadGeometry extends BufferGeometry {

	constructor( flipY = false ) {

		super();

		const uv = flipY === false ? [ 0, - 1, 0, 1, 2, 1 ] : [ 0, 2, 0, 0, 2, 0 ];

		this.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

	}

}

const _geometry = /*@__PURE__*/ new QuadGeometry();

class QuadMesh extends Mesh {

	constructor( material = null ) {

		super( _geometry, material );

		this.camera = _camera;

		this.isQuadMesh = true;

	}

	renderAsync( renderer ) {

		return renderer.renderAsync( this, _camera );

	}

	render( renderer ) {

		renderer.render( this, _camera );

	}

}

const _size$1 = /*@__PURE__*/ new Vector2();

class RTTNode extends TextureNode {

	static get type() {

		return 'RTTNode';

	}

	constructor( node, width = null, height = null, options = { type: HalfFloatType } ) {

		const renderTarget = new RenderTarget( width, height, options );

		super( renderTarget.texture, uv() );

		this.node = node;
		this.width = width;
		this.height = height;

		this.renderTarget = renderTarget;

		this.textureNeedsUpdate = true;
		this.autoUpdate = true;

		this.updateMap = new WeakMap();

		this._rttNode = null;
		this._quadMesh = new QuadMesh( new NodeMaterial() );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	get autoSize() {

		return this.width === null;

	}

	setup( builder ) {

		this._rttNode = this.node.context( builder.getSharedContext() );
		this._quadMesh.material.name = 'RTT';
		this._quadMesh.material.needsUpdate = true;

		return super.setup( builder );

	}

	setSize( width, height ) {

		this.width = width;
		this.height = height;

		const effectiveWidth = width * this.pixelRatio;
		const effectiveHeight = height * this.pixelRatio;

		this.renderTarget.setSize( effectiveWidth, effectiveHeight );

		this.textureNeedsUpdate = true;

	}

	setPixelRatio( pixelRatio ) {

		this.pixelRatio = pixelRatio;

		this.setSize( this.width, this.height );

	}

	updateBefore( { renderer } ) {

		if ( this.textureNeedsUpdate === false && this.autoUpdate === false ) return;

		this.textureNeedsUpdate = false;

		//

		if ( this.autoSize === true ) {

			this.pixelRatio = renderer.getPixelRatio();

			const size = renderer.getSize( _size$1 );

			this.setSize( size.width, size.height );

		}

		//

		this._quadMesh.material.fragmentNode = this._rttNode;

		//

		const currentRenderTarget = renderer.getRenderTarget();

		renderer.setRenderTarget( this.renderTarget );

		this._quadMesh.render( renderer );

		renderer.setRenderTarget( currentRenderTarget );

	}

	clone() {

		const newNode = new TextureNode( this.value, this.uvNode, this.levelNode );
		newNode.sampler = this.sampler;
		newNode.referenceNode = this;

		return newNode;

	}

}

const rtt = ( node, ...params ) => nodeObject( new RTTNode( nodeObject( node ), ...params ) );
const convertToTexture = ( node, ...params ) => node.isTextureNode ? node : rtt( node, ...params );

/**
* Computes a position in view space based on a fragment's screen position expressed as uv coordinates, the fragments
* depth value and the camera's inverse projection matrix.
*
* @param {vec2} screenPosition - The fragment's screen position expressed as uv coordinates.
* @param {float} depth - The fragment's depth value.
* @param {mat4} projectionMatrixInverse - The camera's inverse projection matrix.
* @return {vec3} The fragments position in view space.
*/
const getViewPosition = /*@__PURE__*/ Fn( ( [ screenPosition, depth, projectionMatrixInverse ], builder ) => {

	let clipSpacePosition;

	if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem ) {

		screenPosition = vec2( screenPosition.x, screenPosition.y.oneMinus() ).mul( 2.0 ).sub( 1.0 );
		clipSpacePosition = vec4( vec3( screenPosition, depth ), 1.0 );

	} else {

		clipSpacePosition = vec4( vec3( screenPosition.x, screenPosition.y.oneMinus(), depth ).mul( 2.0 ).sub( 1.0 ), 1.0 );

	}

	const viewSpacePosition = vec4( projectionMatrixInverse.mul( clipSpacePosition ) );

	return viewSpacePosition.xyz.div( viewSpacePosition.w );

} );

/**
* Computes a screen position expressed as uv coordinates based on a fragment's position in view space
* and the camera's projection matrix
*
* @param {vec3} viewPosition - The fragments position in view space.
* @param {mat4} projectionMatrix - The camera's projection matrix.
* @return {vec2} The fragment's screen position expressed as uv coordinates.
*/
const getScreenPosition = /*@__PURE__*/ Fn( ( [ viewPosition, projectionMatrix ] ) => {

	const sampleClipPos = projectionMatrix.mul( vec4( viewPosition, 1.0 ) );
	const sampleUv = sampleClipPos.xy.div( sampleClipPos.w ).mul( 0.5 ).add( 0.5 ).toVar();
	return vec2( sampleUv.x, sampleUv.y.oneMinus() );

} );

/**
* Computes a normal vector based on depth data. Can be used as a fallback when no normal render
* target is available or if flat surface normals are required.
*
* @param {vec2} uv - The texture coordinate.
* @param {DepthTexture} depthTexture - The depth texture.
* @param {mat4} projectionMatrixInverse - The camera's inverse projection matrix.
* @return {vec3} The computed normal vector.
*/
const getNormalFromDepth = /*@__PURE__*/ Fn( ( [ uv, depthTexture, projectionMatrixInverse ] ) => {

	const size = textureSize( textureLoad( depthTexture ) );
	const p = ivec2( uv.mul( size ) ).toVar();

	const c0 = textureLoad( depthTexture, p ).toVar();

	const l2 = textureLoad( depthTexture, p.sub( ivec2( 2, 0 ) ) ).toVar();
	const l1 = textureLoad( depthTexture, p.sub( ivec2( 1, 0 ) ) ).toVar();
	const r1 = textureLoad( depthTexture, p.add( ivec2( 1, 0 ) ) ).toVar();
	const r2 = textureLoad( depthTexture, p.add( ivec2( 2, 0 ) ) ).toVar();
	const b2 = textureLoad( depthTexture, p.add( ivec2( 0, 2 ) ) ).toVar();
	const b1 = textureLoad( depthTexture, p.add( ivec2( 0, 1 ) ) ).toVar();
	const t1 = textureLoad( depthTexture, p.sub( ivec2( 0, 1 ) ) ).toVar();
	const t2 = textureLoad( depthTexture, p.sub( ivec2( 0, 2 ) ) ).toVar();

	const dl = abs( sub( float( 2 ).mul( l1 ).sub( l2 ), c0 ) ).toVar();
	const dr = abs( sub( float( 2 ).mul( r1 ).sub( r2 ), c0 ) ).toVar();
	const db = abs( sub( float( 2 ).mul( b1 ).sub( b2 ), c0 ) ).toVar();
	const dt = abs( sub( float( 2 ).mul( t1 ).sub( t2 ), c0 ) ).toVar();

	const ce = getViewPosition( uv, c0, projectionMatrixInverse ).toVar();

	const dpdx = dl.lessThan( dr ).select( ce.sub( getViewPosition( uv.sub( vec2( float( 1 ).div( size.x ), 0 ) ), l1, projectionMatrixInverse ) ), ce.negate().add( getViewPosition( uv.add( vec2( float( 1 ).div( size.x ), 0 ) ), r1, projectionMatrixInverse ) ) );
	const dpdy = db.lessThan( dt ).select( ce.sub( getViewPosition( uv.add( vec2( 0, float( 1 ).div( size.y ) ) ), b1, projectionMatrixInverse ) ), ce.negate().add( getViewPosition( uv.sub( vec2( 0, float( 1 ).div( size.y ) ) ), t1, projectionMatrixInverse ) ) );

	return normalize( cross( dpdx, dpdy ) );

} );

class VertexColorNode extends AttributeNode {

	static get type() {

		return 'VertexColorNode';

	}

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

const vertexColor = ( ...params ) => nodeObject( new VertexColorNode( ...params ) );

class PointUVNode extends Node {

	static get type() {

		return 'PointUVNode';

	}

	constructor() {

		super( 'vec2' );

		this.isPointUVNode = true;

	}

	generate( /*builder*/ ) {

		return 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

	}

}

const pointUV = /*@__PURE__*/ nodeImmutable( PointUVNode );

const _e1 = /*@__PURE__*/ new Euler();
const _m1 = /*@__PURE__*/ new Matrix4();

class SceneNode extends Node {

	static get type() {

		return 'SceneNode';

	}

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

		} else if ( scope === SceneNode.BACKGROUND_ROTATION ) {

			output = uniform( 'mat4' ).label( 'backgroundRotation' ).setGroup( renderGroup ).onRenderUpdate( () => {

				const background = scene.background;

				if ( background !== null && background.isTexture && background.mapping !== UVMapping ) {

					_e1.copy( scene.backgroundRotation );

					// accommodate left-handed frame
					_e1.x *= - 1; _e1.y *= - 1; _e1.z *= - 1;

					_m1.makeRotationFromEuler( _e1 );

				} else {

					_m1.identity();

				}

				return _m1;

			} );

		} else {

			console.error( 'THREE.SceneNode: Unknown scope:', scope );

		}

		return output;

	}

}

SceneNode.BACKGROUND_BLURRINESS = 'backgroundBlurriness';
SceneNode.BACKGROUND_INTENSITY = 'backgroundIntensity';
SceneNode.BACKGROUND_ROTATION = 'backgroundRotation';

const backgroundBlurriness = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_BLURRINESS );
const backgroundIntensity = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_INTENSITY );
const backgroundRotation = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_ROTATION );

class StorageArrayElementNode extends ArrayElementNode {

	static get type() {

		return 'StorageArrayElementNode';

	}

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

			if ( this.node.bufferObject === true ) {

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

			if ( this.node.bufferObject === true && isAssignContext !== true ) {

				snippet = builder.generatePBO( this );

			} else {

				snippet = this.node.build( builder );

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

const storageElement = /*@__PURE__*/ nodeProxy( StorageArrayElementNode );

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

const GPUStorageTextureAccess = {
	WriteOnly: 'write-only',
	ReadOnly: 'read-only',
	ReadWrite: 'read-write',
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
	Float32Filterable: 'float32-filterable',
	ClipDistances: 'clip-distances',
	DualSourceBlending: 'dual-source-blending',
	Subgroups: 'subgroups'
};

class StorageBufferNode extends BufferNode {

	static get type() {

		return 'StorageBufferNode';

	}

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType, bufferCount );

		this.isStorageBufferNode = true;

		this.access = GPUBufferBindingType.Storage;
		this.isAtomic = false;

		this.bufferObject = false;
		this.bufferCount = bufferCount;

		this._attribute = null;
		this._varying = null;

		this.global = true;

		if ( value.isStorageBufferAttribute !== true && value.isStorageInstancedBufferAttribute !== true ) {

			// TOOD: Improve it, possibly adding a new property to the BufferAttribute to identify it as a storage buffer read-only attribute in Renderer

			if ( value.isInstancedBufferAttribute ) value.isStorageInstancedBufferAttribute = true;
			else value.isStorageBufferAttribute = true;

		}

	}

	getHash( builder ) {

		if ( this.bufferCount === 0 ) {

			let bufferData = builder.globalCache.getData( this.value );

			if ( bufferData === undefined ) {

				bufferData = {
					node: this
				};

				builder.globalCache.setData( this.value, bufferData );

			}

			return bufferData.node.uuid;

		}

		return this.uuid;

	}

	getInputType( /*builder*/ ) {

		return this.value.isIndirectStorageBufferAttribute ? 'indirectStorageBuffer' : 'storageBuffer';

	}

	element( indexNode ) {

		return storageElement( this, indexNode );

	}

	setBufferObject( value ) {

		this.bufferObject = value;

		return this;

	}

	setAccess( value ) {

		this.access = value;

		return this;

	}

	toReadOnly() {

		return this.setAccess( GPUBufferBindingType.ReadOnlyStorage );

	}

	setAtomic( value ) {

		this.isAtomic = value;

		return this;

	}

	toAtomic() {

		return this.setAtomic( true );

	}

	getAttributeData() {

		if ( this._attribute === null ) {

			this._attribute = bufferAttribute( this.value );
			this._varying = varying( this._attribute );

		}

		return {
			attribute: this._attribute,
			varying: this._varying
		};

	}

	getNodeType( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) || builder.isAvailable( 'indirectStorageBuffer' ) ) {

			return super.getNodeType( builder );

		}

		const { attribute } = this.getAttributeData();

		return attribute.getNodeType( builder );

	}

	generate( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) || builder.isAvailable( 'indirectStorageBuffer' ) ) {

			return super.generate( builder );

		}

		const { attribute, varying } = this.getAttributeData();

		const output = varying.build( builder );

		builder.registerTransform( output, attribute );

		return output;

	}

}

// Read-Write Storage
const storage = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ) );
const storageObject = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ).setBufferObject( true ) );

class StorageTextureNode extends TextureNode {

	static get type() {

		return 'StorageTextureNode';

	}

	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode );

		this.storeNode = storeNode;

		this.isStorageTextureNode = true;

		this.access = GPUStorageTextureAccess.WriteOnly;

	}

	getInputType( /*builder*/ ) {

		return 'storageTexture';

	}

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.storeNode = this.storeNode;

	}

	setAccess( value ) {

		this.access = value;
		return this;

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

	toReadOnly() {

		return this.setAccess( GPUStorageTextureAccess.ReadOnly );

	}

	toWriteOnly() {

		return this.setAccess( GPUStorageTextureAccess.WriteOnly );

	}

	generateStore( builder ) {

		const properties = builder.getNodeProperties( this );

		const { uvNode, storeNode } = properties;

		const textureProperty = super.generate( builder, 'property' );
		const uvSnippet = uvNode.build( builder, 'uvec2' );
		const storeSnippet = storeNode.build( builder, 'vec4' );

		const snippet = builder.generateTextureStore( builder, textureProperty, uvSnippet, storeSnippet );

		builder.addLineFlowCode( snippet, this );

	}

}

const storageTexture = /*@__PURE__*/ nodeProxy( StorageTextureNode );

const textureStore = ( value, uvNode, storeNode ) => {

	const node = storageTexture( value, uvNode, storeNode );

	if ( storeNode !== null ) node.append();

	return node;

};

class UserDataNode extends ReferenceNode {

	static get type() {

		return 'UserDataNode';

	}

	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		this.userData = userData;

	}

	updateReference( state ) {

		this.reference = this.userData !== null ? this.userData : state.object.userData;

		return this.reference;

	}

}

const userData = ( name, inputType, userData ) => nodeObject( new UserDataNode( name, inputType, userData ) );

const _objectData = new WeakMap();

class VelocityNode extends TempNode {

	static get type() {

		return 'VelocityNode';

	}

	constructor() {

		super( 'vec2' );

		this.projectionMatrix = null;

		this.updateType = NodeUpdateType.OBJECT;
		this.updateAfterType = NodeUpdateType.OBJECT;

		this.previousModelWorldMatrix = uniform( new Matrix4() );
		this.previousProjectionMatrix = uniform( new Matrix4() ).setGroup( renderGroup );
		this.previousCameraViewMatrix = uniform( new Matrix4() );

	}

	setProjectionMatrix( projectionMatrix ) {

		this.projectionMatrix = projectionMatrix;

	}

	update( { frameId, camera, object } ) {

		const previousModelMatrix = getPreviousMatrix( object );

		this.previousModelWorldMatrix.value.copy( previousModelMatrix );

		//

		const cameraData = getData( camera );

		if ( cameraData.frameId !== frameId ) {

			cameraData.frameId = frameId;

			if ( cameraData.previousProjectionMatrix === undefined ) {

				cameraData.previousProjectionMatrix = new Matrix4();
				cameraData.previousCameraViewMatrix = new Matrix4();

				cameraData.currentProjectionMatrix = new Matrix4();
				cameraData.currentCameraViewMatrix = new Matrix4();

				cameraData.previousProjectionMatrix.copy( this.projectionMatrix || camera.projectionMatrix );
				cameraData.previousCameraViewMatrix.copy( camera.matrixWorldInverse );

			} else {

				cameraData.previousProjectionMatrix.copy( cameraData.currentProjectionMatrix );
				cameraData.previousCameraViewMatrix.copy( cameraData.currentCameraViewMatrix );

			}

			cameraData.currentProjectionMatrix.copy( this.projectionMatrix || camera.projectionMatrix );
			cameraData.currentCameraViewMatrix.copy( camera.matrixWorldInverse );

			this.previousProjectionMatrix.value.copy( cameraData.previousProjectionMatrix );
			this.previousCameraViewMatrix.value.copy( cameraData.previousCameraViewMatrix );

		}

	}

	updateAfter( { object } ) {

		getPreviousMatrix( object ).copy( object.matrixWorld );

	}

	setup( /*builder*/ ) {

		const projectionMatrix = ( this.projectionMatrix === null ) ? cameraProjectionMatrix : uniform( this.projectionMatrix );

		const previousModelViewMatrix = this.previousCameraViewMatrix.mul( this.previousModelWorldMatrix );

		const clipPositionCurrent = projectionMatrix.mul( modelViewMatrix ).mul( positionLocal );
		const clipPositionPrevious = this.previousProjectionMatrix.mul( previousModelViewMatrix ).mul( positionPrevious );

		const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
		const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );

		const velocity = sub( ndcPositionCurrent, ndcPositionPrevious );

		return velocity;

	}

}

function getData( object ) {

	let objectData = _objectData.get( object );

	if ( objectData === undefined ) {

		objectData = {};
		_objectData.set( object, objectData );

	}

	return objectData;

}

function getPreviousMatrix( object, index = 0 ) {

	const objectData = getData( object );

	let matrix = objectData[ index ];

	if ( matrix === undefined ) {

		objectData[ index ] = matrix = new Matrix4();

	}

	return matrix;

}

const velocity = /*@__PURE__*/ nodeImmutable( VelocityNode );

const burn = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return min$1( 1.0, base.oneMinus().div( blend ) ).oneMinus();

} ).setLayout( {
	name: 'burnBlend',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const dodge = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return min$1( base.div( blend.oneMinus() ), 1.0 );

} ).setLayout( {
	name: 'dodgeBlend',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const screen = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return base.oneMinus().mul( blend.oneMinus() ).oneMinus();

} ).setLayout( {
	name: 'screenBlend',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const overlay = /*@__PURE__*/ Fn( ( [ base, blend ] ) => {

	return mix( base.mul( 2.0 ).mul( blend ), base.oneMinus().mul( 2.0 ).mul( blend.oneMinus() ).oneMinus(), step( 0.5, base ) );

} ).setLayout( {
	name: 'overlayBlend',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

const grayscale = /*@__PURE__*/ Fn( ( [ color ] ) => {

	return luminance( color.rgb );

} );

const saturation = /*@__PURE__*/ Fn( ( [ color, adjustment = float( 1 ) ] ) => {

	return adjustment.mix( luminance( color.rgb ), color.rgb );

} );

const vibrance = /*@__PURE__*/ Fn( ( [ color, adjustment = float( 1 ) ] ) => {

	const average = add( color.r, color.g, color.b ).div( 3.0 );

	const mx = color.r.max( color.g.max( color.b ) );
	const amt = mx.sub( average ).mul( adjustment ).mul( - 3.0 );

	return mix( color.rgb, mx, amt );

} );

const hue = /*@__PURE__*/ Fn( ( [ color, adjustment = float( 1 ) ] ) => {

	const k = vec3( 0.57735, 0.57735, 0.57735 );

	const cosAngle = adjustment.cos();

	return vec3( color.rgb.mul( cosAngle ).add( k.cross( color.rgb ).mul( adjustment.sin() ).add( k.mul( dot( k, color.rgb ).mul( cosAngle.oneMinus() ) ) ) ) );

} );

const luminance = (
	color,
	luminanceCoefficients = vec3( ColorManagement.getLuminanceCoefficients( new Vector3() ) )
) => dot( color, luminanceCoefficients );

const threshold = ( color, threshold ) => mix( vec3( 0.0 ), color, luminance( color ).sub( threshold ).max( 0 ) );

/**
 * Color Decision List (CDL) v1.2
 *
 * Compact representation of color grading information, defined by slope, offset, power, and
 * saturation. The CDL should be typically be given input in a log space (such as LogC, ACEScc,
 * or AgX Log), and will return output in the same space. Output may require clamping >=0.
 *
 * @param {vec4} color Input (-Infinity < input < +Infinity)
 * @param {number | vec3} slope Slope (0 ≤ slope < +Infinity)
 * @param {number | vec3} offset Offset (-Infinity < offset < +Infinity; typically -1 < offset < 1)
 * @param {number | vec3} power Power (0 < power < +Infinity)
 * @param {number} saturation Saturation (0 ≤ saturation < +Infinity; typically 0 ≤ saturation < 4)
 * @param {vec3} luminanceCoefficients Luminance coefficients for saturation term, typically Rec. 709
 * @return Output, -Infinity < output < +Infinity
 *
 * References:
 * - ASC CDL v1.2
 * - https://blender.stackexchange.com/a/55239/43930
 * - https://docs.acescentral.com/specifications/acescc/
 */
const cdl = /*@__PURE__*/ Fn( ( [
	color,
	slope = vec3( 1 ),
	offset = vec3( 0 ),
	power = vec3( 1 ),
	saturation = float( 1 ),
	// ASC CDL v1.2 explicitly requires Rec. 709 luminance coefficients.
	luminanceCoefficients = vec3( ColorManagement.getLuminanceCoefficients( new Vector3(), LinearSRGBColorSpace ) )
] ) => {

	// NOTE: The ASC CDL v1.2 defines a [0, 1] clamp on the slope+offset term, and another on the
	// saturation term. Per the ACEScc specification and Filament, limits may be omitted to support
	// values outside [0, 1], requiring a workaround for negative values in the power expression.

	const luma = color.rgb.dot( vec3( luminanceCoefficients ) );

	const v = max$1( color.rgb.mul( slope ).add( offset ), 0.0 ).toVar();
	const pv = v.pow( power ).toVar();

	If( v.r.greaterThan( 0.0 ), () => { v.r.assign( pv.r ); } ); // eslint-disable-line
	If( v.g.greaterThan( 0.0 ), () => { v.g.assign( pv.g ); } ); // eslint-disable-line
	If( v.b.greaterThan( 0.0 ), () => { v.b.assign( pv.b ); } ); // eslint-disable-line

	v.assign( luma.add( v.sub( luma ).mul( saturation ) ) );

	return vec4( v.rgb, color.a );

} );

class PosterizeNode extends TempNode {

	static get type() {

		return 'PosterizeNode';

	}

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

const posterize = /*@__PURE__*/ nodeProxy( PosterizeNode );

let _sharedFramebuffer = null;

class ViewportSharedTextureNode extends ViewportTextureNode {

	static get type() {

		return 'ViewportSharedTextureNode';

	}

	constructor( uvNode = screenUV, levelNode = null ) {

		if ( _sharedFramebuffer === null ) {

			_sharedFramebuffer = new FramebufferTexture();

		}

		super( uvNode, levelNode, _sharedFramebuffer );

	}

	updateReference() {

		return this;

	}

}

const viewportSharedTexture = /*@__PURE__*/ nodeProxy( ViewportSharedTextureNode );

const _size = /*@__PURE__*/ new Vector2();

class PassTextureNode extends TextureNode {

	static get type() {

		return 'PassTextureNode';

	}

	constructor( passNode, texture ) {

		super( texture );

		this.passNode = passNode;

		this.setUpdateMatrix( false );

	}

	setup( builder ) {

		if ( builder.object.isQuadMesh ) this.passNode.build( builder );

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.value );

	}

}

class PassMultipleTextureNode extends PassTextureNode {

	static get type() {

		return 'PassMultipleTextureNode';

	}

	constructor( passNode, textureName, previousTexture = false ) {

		super( passNode, null );

		this.textureName = textureName;
		this.previousTexture = previousTexture;

	}

	updateTexture() {

		this.value = this.previousTexture ? this.passNode.getPreviousTexture( this.textureName ) : this.passNode.getTexture( this.textureName );

	}

	setup( builder ) {

		this.updateTexture();

		return super.setup( builder );

	}

	clone() {

		return new this.constructor( this.passNode, this.textureName, this.previousTexture );

	}

}

class PassNode extends TempNode {

	static get type() {

		return 'PassNode';

	}

	constructor( scope, scene, camera, options = {} ) {

		super( 'vec4' );

		this.scope = scope;
		this.scene = scene;
		this.camera = camera;
		this.options = options;

		this._pixelRatio = 1;
		this._width = 1;
		this._height = 1;

		const depthTexture = new DepthTexture();
		depthTexture.isRenderTargetTexture = true;
		//depthTexture.type = FloatType;
		depthTexture.name = 'depth';

		const renderTarget = new RenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType, ...options, } );
		renderTarget.texture.name = 'output';
		renderTarget.depthTexture = depthTexture;

		this.renderTarget = renderTarget;

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._textures = {
			output: renderTarget.texture,
			depth: depthTexture
		};

		this._textureNodes = {};
		this._linearDepthNodes = {};
		this._viewZNodes = {};

		this._previousTextures = {};
		this._previousTextureNodes = {};

		this._cameraNear = uniform( 0 );
		this._cameraFar = uniform( 0 );

		this._mrt = null;

		this.isPassNode = true;

	}

	setMRT( mrt ) {

		this._mrt = mrt;

		return this;

	}

	getMRT() {

		return this._mrt;

	}

	isGlobal() {

		return true;

	}

	getTexture( name ) {

		let texture = this._textures[ name ];

		if ( texture === undefined ) {

			const refTexture = this.renderTarget.texture;

			texture = refTexture.clone();
			texture.isRenderTargetTexture = true;
			texture.name = name;

			this._textures[ name ] = texture;

			this.renderTarget.textures.push( texture );

		}

		return texture;

	}

	getPreviousTexture( name ) {

		let texture = this._previousTextures[ name ];

		if ( texture === undefined ) {

			texture = this.getTexture( name ).clone();
			texture.isRenderTargetTexture = true;

			this._previousTextures[ name ] = texture;

		}

		return texture;

	}

	toggleTexture( name ) {

		const prevTexture = this._previousTextures[ name ];

		if ( prevTexture !== undefined ) {

			const texture = this._textures[ name ];

			const index = this.renderTarget.textures.indexOf( texture );
			this.renderTarget.textures[ index ] = prevTexture;

			this._textures[ name ] = prevTexture;
			this._previousTextures[ name ] = texture;

			this._textureNodes[ name ].updateTexture();
			this._previousTextureNodes[ name ].updateTexture();

		}

	}

	getTextureNode( name = 'output' ) {

		let textureNode = this._textureNodes[ name ];

		if ( textureNode === undefined ) {

			textureNode = nodeObject( new PassMultipleTextureNode( this, name ) );
			textureNode.updateTexture();
			this._textureNodes[ name ] = textureNode;

		}

		return textureNode;

	}

	getPreviousTextureNode( name = 'output' ) {

		let textureNode = this._previousTextureNodes[ name ];

		if ( textureNode === undefined ) {

			if ( this._textureNodes[ name ] === undefined ) this.getTextureNode( name );

			textureNode = nodeObject( new PassMultipleTextureNode( this, name, true ) );
			textureNode.updateTexture();
			this._previousTextureNodes[ name ] = textureNode;

		}

		return textureNode;

	}

	getViewZNode( name = 'depth' ) {

		let viewZNode = this._viewZNodes[ name ];

		if ( viewZNode === undefined ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;

			this._viewZNodes[ name ] = viewZNode = perspectiveDepthToViewZ( this.getTextureNode( name ), cameraNear, cameraFar );

		}

		return viewZNode;

	}

	getLinearDepthNode( name = 'depth' ) {

		let linearDepthNode = this._linearDepthNodes[ name ];

		if ( linearDepthNode === undefined ) {

			const cameraNear = this._cameraNear;
			const cameraFar = this._cameraFar;
			const viewZNode = this.getViewZNode( name );

			// TODO: just if ( builder.camera.isPerspectiveCamera )

			this._linearDepthNodes[ name ] = linearDepthNode = viewZToOrthographicDepth( viewZNode, cameraNear, cameraFar );

		}

		return linearDepthNode;

	}

	setup( { renderer } ) {

		this.renderTarget.samples = this.options.samples === undefined ? renderer.samples : this.options.samples;

		// Disable MSAA for WebGL backend for now
		if ( renderer.backend.isWebGLBackend === true ) {

			this.renderTarget.samples = 0;

		}

		this.renderTarget.depthTexture.isMultisampleRenderTargetTexture = this.renderTarget.samples > 1;

		return this.scope === PassNode.COLOR ? this.getTextureNode() : this.getLinearDepthNode();

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		this._pixelRatio = renderer.getPixelRatio();

		const size = renderer.getSize( _size );

		this.setSize( size.width, size.height );

		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		for ( const name in this._previousTextures ) {

			this.toggleTexture( name );

		}

		renderer.setRenderTarget( this.renderTarget );
		renderer.setMRT( this._mrt );

		renderer.render( scene, camera );

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );

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

const pass = ( scene, camera, options ) => nodeObject( new PassNode( PassNode.COLOR, scene, camera, options ) );
const passTexture = ( pass, texture ) => nodeObject( new PassTextureNode( pass, texture ) );
const depthPass = ( scene, camera ) => nodeObject( new PassNode( PassNode.DEPTH, scene, camera ) );

class ToonOutlinePassNode extends PassNode {

	static get type() {

		return 'ToonOutlinePassNode';

	}

	constructor( scene, camera, colorNode, thicknessNode, alphaNode ) {

		super( PassNode.COLOR, scene, camera );

		this.colorNode = colorNode;
		this.thicknessNode = thicknessNode;
		this.alphaNode = alphaNode;

		this._materialCache = new WeakMap();

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, scene, camera, geometry, material, group, lightsNode, clippingContext ) => {

			// only render outline for supported materials

			if ( material.isMeshToonMaterial || material.isMeshToonNodeMaterial ) {

				if ( material.wireframe === false ) {

					const outlineMaterial = this._getOutlineMaterial( material );
					renderer.renderObject( object, scene, camera, geometry, outlineMaterial, group, lightsNode, clippingContext );

				}

			}

			// default

			renderer.renderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext );

		} );

		super.updateBefore( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

	}

	_createMaterial() {

		const material = new NodeMaterial();
		material.isMeshToonOutlineMaterial = true;
		material.name = 'Toon_Outline';
		material.side = BackSide;

		// vertex node

		const outlineNormal = normalLocal.negate();
		const mvp = cameraProjectionMatrix.mul( modelViewMatrix );

		const ratio = float( 1.0 ); // TODO: support outline thickness ratio for each vertex
		const pos = mvp.mul( vec4( positionLocal, 1.0 ) );
		const pos2 = mvp.mul( vec4( positionLocal.add( outlineNormal ), 1.0 ) );
		const norm = normalize( pos.sub( pos2 ) ); // NOTE: subtract pos2 from pos because BackSide objectNormal is negative

		material.vertexNode = pos.add( norm.mul( this.thicknessNode ).mul( pos.w ).mul( ratio ) );

		// color node

		material.colorNode = vec4( this.colorNode, this.alphaNode );

		return material;

	}

	_getOutlineMaterial( originalMaterial ) {

		let outlineMaterial = this._materialCache.get( originalMaterial );

		if ( outlineMaterial === undefined ) {

			outlineMaterial = this._createMaterial();

			this._materialCache.set( originalMaterial, outlineMaterial );

		}

		return outlineMaterial;

	}

}

const toonOutlinePass = ( scene, camera, color = new Color( 0, 0, 0 ), thickness = 0.003, alpha = 1 ) => nodeObject( new ToonOutlinePassNode( scene, camera, nodeObject( color ), nodeObject( thickness ), nodeObject( alpha ) ) );

// exposure only

const linearToneMapping = /*@__PURE__*/ Fn( ( [ color, exposure ] ) => {

	return color.mul( exposure ).clamp();

} ).setLayout( {
	name: 'linearToneMapping',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' },
		{ name: 'exposure', type: 'float' }
	]
} );

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf

const reinhardToneMapping = /*@__PURE__*/ Fn( ( [ color, exposure ] ) => {

	color = color.mul( exposure );

	return color.div( color.add( 1.0 ) ).clamp();

} ).setLayout( {
	name: 'reinhardToneMapping',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' },
		{ name: 'exposure', type: 'float' }
	]
} );

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/

const cineonToneMapping = /*@__PURE__*/ Fn( ( [ color, exposure ] ) => {

	// filmic operator by Jim Hejl and Richard Burgess-Dawson
	color = color.mul( exposure );
	color = color.sub( 0.004 ).max( 0.0 );

	const a = color.mul( color.mul( 6.2 ).add( 0.5 ) );
	const b = color.mul( color.mul( 6.2 ).add( 1.7 ) ).add( 0.06 );

	return a.div( b ).pow( 2.2 );

} ).setLayout( {
	name: 'cineonToneMapping',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' },
		{ name: 'exposure', type: 'float' }
	]
} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs

const RRTAndODTFit = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const a = color.mul( color.add( 0.0245786 ) ).sub( 0.000090537 );
	const b = color.mul( color.add( 0.4329510 ).mul( 0.983729 ) ).add( 0.238081 );

	return a.div( b );

} );

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs

const acesFilmicToneMapping = /*@__PURE__*/ Fn( ( [ color, exposure ] ) => {

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
	color = RRTAndODTFit( color );

	color = ACESOutputMat.mul( color );

	// Clamp to [0, 1]
	return color.clamp();

} ).setLayout( {
	name: 'acesFilmicToneMapping',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' },
		{ name: 'exposure', type: 'float' }
	]
} );

const LINEAR_REC2020_TO_LINEAR_SRGB = /*@__PURE__*/ mat3( vec3( 1.6605, - 0.1246, - 0.0182 ), vec3( - 0.5876, 1.1329, - 0.1006 ), vec3( - 0.0728, - 0.0083, 1.1187 ) );
const LINEAR_SRGB_TO_LINEAR_REC2020 = /*@__PURE__*/ mat3( vec3( 0.6274, 0.0691, 0.0164 ), vec3( 0.3293, 0.9195, 0.0880 ), vec3( 0.0433, 0.0113, 0.8956 ) );

const agxDefaultContrastApprox = /*@__PURE__*/ Fn( ( [ x_immutable ] ) => {

	const x = vec3( x_immutable ).toVar();
	const x2 = vec3( x.mul( x ) ).toVar();
	const x4 = vec3( x2.mul( x2 ) ).toVar();

	return float( 15.5 ).mul( x4.mul( x2 ) ).sub( mul( 40.14, x4.mul( x ) ) ).add( mul( 31.96, x4 ).sub( mul( 6.868, x2.mul( x ) ) ).add( mul( 0.4298, x2 ).add( mul( 0.1191, x ).sub( 0.00232 ) ) ) );

} );

const agxToneMapping = /*@__PURE__*/ Fn( ( [ color, exposure ] ) => {

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

} ).setLayout( {
	name: 'agxToneMapping',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' },
		{ name: 'exposure', type: 'float' }
	]
} );

// https://modelviewer.dev/examples/tone-mapping

const neutralToneMapping = /*@__PURE__*/ Fn( ( [ color, exposure ] ) => {

	const StartCompression = float( 0.8 - 0.04 );
	const Desaturation = float( 0.15 );

	color = color.mul( exposure );

	const x = min$1( color.r, min$1( color.g, color.b ) );
	const offset = select( x.lessThan( 0.08 ), x.sub( mul( 6.25, x.mul( x ) ) ), 0.04 );

	color.subAssign( offset );

	const peak = max$1( color.r, max$1( color.g, color.b ) );

	If( peak.lessThan( StartCompression ), () => {

		return color;

	} );

	const d = sub( 1, StartCompression );
	const newPeak = sub( 1, d.mul( d ).div( peak.add( d.sub( StartCompression ) ) ) );
	color.mulAssign( newPeak.div( peak ) );
	const g = sub( 1, div( 1, Desaturation.mul( peak.sub( newPeak ) ).add( 1 ) ) );

	return mix( color, vec3( newPeak ), g );

} ).setLayout( {
	name: 'neutralToneMapping',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' },
		{ name: 'exposure', type: 'float' }
	]
} );

class CodeNode extends Node {

	static get type() {

		return 'CodeNode';

	}

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

const code = /*@__PURE__*/ nodeProxy( CodeNode );

const js = ( src, includes ) => code( src, includes, 'js' );
const wgsl = ( src, includes ) => code( src, includes, 'wgsl' );
const glsl = ( src, includes ) => code( src, includes, 'glsl' );

class FunctionNode extends CodeNode {

	static get type() {

		return 'FunctionNode';

	}

	constructor( code = '', includes = [], language = '' ) {

		super( code, includes, language );

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

		const code = this.getNodeFunction( builder ).getCode( propertyName );

		nodeCode.code = code + '\n';

		if ( output === 'property' ) {

			return propertyName;

		} else {

			return builder.format( `${ propertyName }()`, type, output );

		}

	}

}

const nativeFn = ( code, includes = [], language = '' ) => {

	for ( let i = 0; i < includes.length; i ++ ) {

		const include = includes[ i ];

		// TSL Function: glslFn, wgslFn

		if ( typeof include === 'function' ) {

			includes[ i ] = include.functionNode;

		}

	}

	const functionNode = nodeObject( new FunctionNode( code, includes, language ) );

	const fn = ( ...params ) => functionNode.call( ...params );
	fn.functionNode = functionNode;

	return fn;

};

const glslFn = ( code, includes ) => nativeFn( code, includes, 'glsl' );
const wgslFn = ( code, includes ) => nativeFn( code, includes, 'wgsl' );

class ScriptableValueNode extends Node {

	static get type() {

		return 'ScriptableValueNode';

	}

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

const scriptableValue = /*@__PURE__*/ nodeProxy( ScriptableValueNode );

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

const ScriptableNodeResources = new Resources();

class ScriptableNode extends Node {

	static get type() {

		return 'ScriptableNode';

	}

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

		const THREE = ScriptableNodeResources.get( 'THREE' );
		const TSL = ScriptableNodeResources.get( 'TSL' );

		const method = this.getMethod( this.codeNode );
		const params = [ parameters, this._local, ScriptableNodeResources, refresh, setOutput, THREE, TSL ];

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

	getCacheKey( force ) {

		const values = [ hashString( this.source ), this.getDefaultOutputNode().getCacheKey( force ) ];

		for ( const param in this.parameters ) {

			values.push( this.parameters[ param ].getCacheKey( force ) );

		}

		return hashArray( values );

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

const scriptable = /*@__PURE__*/ nodeProxy( ScriptableNode );

class FogNode extends Node {

	static get type() {

		return 'FogNode';

	}

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.isFogNode = true;

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	getViewZNode( builder ) {

		let viewZ;

		const getViewZ = builder.context.getViewZ;

		if ( getViewZ !== undefined ) {

			viewZ = getViewZ( this );

		}

		return ( viewZ || positionView.z ).negate();

	}

	setup() {

		return this.factorNode;

	}

}

const fog = /*@__PURE__*/ nodeProxy( FogNode );

class FogRangeNode extends FogNode {

	static get type() {

		return 'FogRangeNode';

	}

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.isFogRangeNode = true;

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );

		return smoothstep( this.nearNode, this.farNode, viewZ );

	}

}

const rangeFog = /*@__PURE__*/ nodeProxy( FogRangeNode );

class FogExp2Node extends FogNode {

	static get type() {

		return 'FogExp2Node';

	}

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );
		const density = this.densityNode;

		return density.mul( density, viewZ, viewZ ).negate().exp().oneMinus();

	}

}

const densityFog = /*@__PURE__*/ nodeProxy( FogExp2Node );

let min = null;
let max = null;

class RangeNode extends Node {

	static get type() {

		return 'RangeNode';

	}

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

		return builder.object.count > 1 ? builder.getTypeFromLength( this.getVectorLength( builder ) ) : 'float';

	}

	setup( builder ) {

		const object = builder.object;

		let output = null;

		if ( object.count > 1 ) {

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

			if ( object.count <= 4096 ) {

				output = buffer( array, 'vec4', object.count ).element( instanceIndex ).convert( nodeType );

			} else {

				// TODO: Improve anonymous buffer attribute creation removing this part
				const bufferAttribute = new InstancedBufferAttribute( array, 4 );
				builder.geometry.setAttribute( '__range' + this.id, bufferAttribute );

				output = instancedBufferAttribute( bufferAttribute ).convert( nodeType );

			}

		} else {

			output = float( 0 );

		}

		return output;

	}

}

const range = /*@__PURE__*/ nodeProxy( RangeNode );

class ComputeBuiltinNode extends Node {

	static get type() {

		return 'ComputeBuiltinNode';

	}

	constructor( builtinName, nodeType ) {

		super( nodeType );

		this._builtinName = builtinName;

	}

	getHash( builder ) {

		return this.getBuiltinName( builder );

	}

	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	setBuiltinName( builtinName ) {

		this._builtinName = builtinName;

		return this;

	}

	getBuiltinName( /*builder*/ ) {

		return this._builtinName;

	}

	hasBuiltin( builder ) {

		builder.hasBuiltin( this._builtinName );

	}

	generate( builder, output ) {

		const builtinName = this.getBuiltinName( builder );
		const nodeType = this.getNodeType( builder );

		if ( builder.shaderStage === 'compute' ) {

			return builder.format( builtinName, nodeType, output );

		} else {

			console.warn( `ComputeBuiltinNode: Compute built-in value ${builtinName} can not be accessed in the ${builder.shaderStage} stage` );
			return builder.generateConst( nodeType );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.global = this.global;
		data._builtinName = this._builtinName;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.global = data.global;
		this._builtinName = data._builtinName;

	}

}

const computeBuiltin = ( name, nodeType ) => nodeObject( new ComputeBuiltinNode( name, nodeType ) );

const numWorkgroups = /*@__PURE__*/ computeBuiltin( 'numWorkgroups', 'uvec3' );
const workgroupId = /*@__PURE__*/ computeBuiltin( 'workgroupId', 'uvec3' );
const localId = /*@__PURE__*/ computeBuiltin( 'localId', 'uvec3' );
const subgroupSize = /*@__PURE__*/ computeBuiltin( 'subgroupSize', 'uint' );

class BarrierNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

	}

	generate( builder ) {

		const { scope } = this;
		const { renderer } = builder;

		if ( renderer.backend.isWebGLBackend === true ) {

			builder.addFlowCode( `\t// ${scope}Barrier \n` );

		} else {

			builder.addLineFlowCode( `${scope}Barrier()`, this );

		}

	}

}

const barrier = nodeProxy( BarrierNode );

const workgroupBarrier = () => barrier( 'workgroup' ).append();
const storageBarrier = () => barrier( 'storage' ).append();
const textureBarrier = () => barrier( 'texture' ).append();

class WorkgroupInfoElementNode extends ArrayElementNode {

	constructor( workgroupInfoNode, indexNode ) {

		super( workgroupInfoNode, indexNode );

		this.isWorkgroupInfoElementNode = true;

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;
		snippet = super.generate( builder );

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		// TODO: Possibly activate clip distance index on index access rather than from clipping context

		return snippet;

	}

}


class WorkgroupInfoNode extends Node {

	constructor( scope, bufferType, bufferCount = 0 ) {

		super( bufferType );

		this.bufferType = bufferType;
		this.bufferCount = bufferCount;

		this.isWorkgroupInfoNode = true;

		this.scope = scope;

	}

	label( name ) {

		this.name = name;

		return this;

	}

	getHash() {

		return this.uuid;

	}

	setScope( scope ) {

		this.scope = scope;

		return this;

	}

	getInputType( /*builder*/ ) {

		return `${this.scope}Array`;

	}

	element( indexNode ) {

		return nodeObject( new WorkgroupInfoElementNode( this, indexNode ) );

	}

	generate( builder ) {

		return builder.getScopedArray( this.name || `${this.scope}Array_${this.id}`, this.scope.toLowerCase(), this.bufferType, this.bufferCount );

	}

}

const workgroupArray = ( type, count ) => nodeObject( new WorkgroupInfoNode( 'Workgroup', type, count ) );

class AtomicFunctionNode extends TempNode {

	static get type() {

		return 'AtomicFunctionNode';

	}

	constructor( method, pointerNode, valueNode, storeNode = null ) {

		super( 'uint' );

		this.method = method;

		this.pointerNode = pointerNode;
		this.valueNode = valueNode;
		this.storeNode = storeNode;

	}

	getInputType( builder ) {

		return this.pointerNode.getNodeType( builder );

	}

	getNodeType( builder ) {

		return this.getInputType( builder );

	}

	generate( builder ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.pointerNode;
		const b = this.valueNode;

		const params = [];

		params.push( `&${ a.build( builder, inputType ) }` );
		params.push( b.build( builder, inputType ) );

		const methodSnippet = `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`;

		if ( this.storeNode !== null ) {

			const varSnippet = this.storeNode.build( builder, inputType );

			builder.addLineFlowCode( `${varSnippet} = ${methodSnippet}`, this );

		} else {

			builder.addLineFlowCode( methodSnippet, this );

		}

	}

}

AtomicFunctionNode.ATOMIC_LOAD = 'atomicLoad';
AtomicFunctionNode.ATOMIC_STORE = 'atomicStore';
AtomicFunctionNode.ATOMIC_ADD = 'atomicAdd';
AtomicFunctionNode.ATOMIC_SUB = 'atomicSub';
AtomicFunctionNode.ATOMIC_MAX = 'atomicMax';
AtomicFunctionNode.ATOMIC_MIN = 'atomicMin';
AtomicFunctionNode.ATOMIC_AND = 'atomicAnd';
AtomicFunctionNode.ATOMIC_OR = 'atomicOr';
AtomicFunctionNode.ATOMIC_XOR = 'atomicXor';

const atomicNode = nodeProxy( AtomicFunctionNode );

const atomicFunc = ( method, pointerNode, valueNode, storeNode ) => {

	const node = atomicNode( method, pointerNode, valueNode, storeNode );
	node.append();

	return node;

};

const atomicStore = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_STORE, pointerNode, valueNode, storeNode );
const atomicAdd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_ADD, pointerNode, valueNode, storeNode );
const atomicSub = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_SUB, pointerNode, valueNode, storeNode );
const atomicMax = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MAX, pointerNode, valueNode, storeNode );
const atomicMin = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MIN, pointerNode, valueNode, storeNode );
const atomicAnd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_AND, pointerNode, valueNode, storeNode );
const atomicOr = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_OR, pointerNode, valueNode, storeNode );
const atomicXor = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_XOR, pointerNode, valueNode, storeNode );

let uniformsLib;

function getLightData( light ) {

	uniformsLib = uniformsLib || new WeakMap();

	let uniforms = uniformsLib.get( light );

	if ( uniforms === undefined ) uniformsLib.set( light, uniforms = {} );

	return uniforms;

}

function lightPosition( light ) {

	const data = getLightData( light );

	return data.position || ( data.position = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( light.matrixWorld ) ) );

}

function lightTargetPosition( light ) {

	const data = getLightData( light );

	return data.targetPosition || ( data.targetPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( _, self ) => self.value.setFromMatrixPosition( light.target.matrixWorld ) ) );

}

function lightViewPosition( light ) {

	const data = getLightData( light );

	return data.viewPosition || ( data.viewPosition = uniform( new Vector3() ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => {

		self.value = self.value || new Vector3();
		self.value.setFromMatrixPosition( light.matrixWorld );

		self.value.applyMatrix4( camera.matrixWorldInverse );

	} ) );

}

const lightTargetDirection = ( light ) => cameraViewMatrix.transformDirection( lightPosition( light ).sub( lightTargetPosition( light ) ) );

const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

const getLightNodeById = ( id, lightNodes ) => {

	for ( const lightNode of lightNodes ) {

		if ( lightNode.isAnalyticLightNode && lightNode.light.id === id ) {

			return lightNode;

		}

	}

	return null;

};

const _lightsNodeRef = /*@__PURE__*/ new WeakMap();

class LightsNode extends Node {

	static get type() {

		return 'LightsNode';

	}

	constructor() {

		super( 'vec3' );

		this.totalDiffuseNode = vec3().toVar( 'totalDiffuse' );
		this.totalSpecularNode = vec3().toVar( 'totalSpecular' );

		this.outgoingLightNode = vec3().toVar( 'outgoingLight' );

		this._lights = [];

		this._lightNodes = null;
		this._lightNodesHash = null;

		this.global = true;

	}

	getHash( builder ) {

		if ( this._lightNodesHash === null ) {

			if ( this._lightNodes === null ) this.setupLightsNode( builder );

			const hash = [];

			for ( const lightNode of this._lightNodes ) {

				hash.push( lightNode.getSelf().getHash() );

			}

			this._lightNodesHash = 'lights-' + hash.join( ',' );

		}

		return this._lightNodesHash;

	}

	analyze( builder ) {

		const properties = builder.getDataFromNode( this );

		for ( const node of properties.nodes ) {

			node.build( builder );

		}

	}

	setupLightsNode( builder ) {

		const lightNodes = [];

		const previousLightNodes = this._lightNodes;

		const lights = sortLights( this._lights );
		const nodeLibrary = builder.renderer.library;

		for ( const light of lights ) {

			if ( light.isNode ) {

				lightNodes.push( nodeObject( light ) );

			} else {

				let lightNode = null;

				if ( previousLightNodes !== null ) {

					lightNode = getLightNodeById( light.id, previousLightNodes ); // resuse existing light node

				}

				if ( lightNode === null ) {

					const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

					if ( lightNodeClass === null ) {

						console.warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
						continue;

					}

					let lightNode = null;

					if ( ! _lightsNodeRef.has( light ) ) {

						lightNode = nodeObject( new lightNodeClass( light ) );
						_lightsNodeRef.set( light, lightNode );

					} else {

						lightNode = _lightsNodeRef.get( light );

					}

					lightNodes.push( lightNode );

				}

			}

		}

		this._lightNodes = lightNodes;

	}

	setupLights( builder, lightNodes ) {

		for ( const lightNode of lightNodes ) {

			lightNode.build( builder );

		}

	}

	setup( builder ) {

		if ( this._lightNodes === null ) this.setupLightsNode( builder );

		const context = builder.context;
		const lightingModel = context.lightingModel;

		let outgoingLightNode = this.outgoingLightNode;

		if ( lightingModel ) {

			const { _lightNodes, totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			const stack = builder.addStack();

			//

			const properties = builder.getDataFromNode( this );
			properties.nodes = stack.nodes;

			//

			lightingModel.start( context, stack, builder );

			// lights

			this.setupLights( builder, _lightNodes );

			//

			lightingModel.indirect( context, stack, builder );

			//

			const { backdrop, backdropAlpha } = context;
			const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = context.reflectedLight;

			let totalDiffuse = directDiffuse.add( indirectDiffuse );

			if ( backdrop !== null ) {

				if ( backdropAlpha !== null ) {

					totalDiffuse = vec3( backdropAlpha.mix( totalDiffuse, backdrop ) );

				} else {

					totalDiffuse = vec3( backdrop );

				}

				context.material.transparent = true;

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

	setLights( lights ) {

		this._lights = lights;

		this._lightNodes = null;
		this._lightNodesHash = null;

		return this;

	}

	getLights() {

		return this._lights;

	}

	get hasLights() {

		return this._lights.length > 0;

	}

}

const lights = ( lights = [] ) => nodeObject( new LightsNode() ).setLights( lights );

const BasicShadowMap = Fn( ( { depthTexture, shadowCoord } ) => {

	return texture( depthTexture, shadowCoord.xy ).compare( shadowCoord.z );

} );

const PCFShadowMap = Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const depthCompare = ( uv, compare ) => texture( depthTexture, uv ).compare( compare );

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );
	const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const dx0 = texelSize.x.negate().mul( radius );
	const dy0 = texelSize.y.negate().mul( radius );
	const dx1 = texelSize.x.mul( radius );
	const dy1 = texelSize.y.mul( radius );
	const dx2 = dx0.div( 2 );
	const dy2 = dy0.div( 2 );
	const dx3 = dx1.div( 2 );
	const dy3 = dy1.div( 2 );

	return add(
		depthCompare( shadowCoord.xy.add( vec2( dx0, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, dy0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, dy2 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx0, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy, shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, 0 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx2, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx3, dy3 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx0, dy1 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( 0, dy1 ) ), shadowCoord.z ),
		depthCompare( shadowCoord.xy.add( vec2( dx1, dy1 ) ), shadowCoord.z )
	).mul( 1 / 17 );

} );

const PCFSoftShadowMap = Fn( ( { depthTexture, shadowCoord, shadow } ) => {

	const depthCompare = ( uv, compare ) => texture( depthTexture, uv ).compare( compare );

	const mapSize = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

	const texelSize = vec2( 1 ).div( mapSize );
	const dx = texelSize.x;
	const dy = texelSize.y;

	const uv = shadowCoord.xy;
	const f = fract( uv.mul( mapSize ).add( 0.5 ) );
	uv.subAssign( f.mul( texelSize ) );

	return add(
		depthCompare( uv, shadowCoord.z ),
		depthCompare( uv.add( vec2( dx, 0 ) ), shadowCoord.z ),
		depthCompare( uv.add( vec2( 0, dy ) ), shadowCoord.z ),
		depthCompare( uv.add( texelSize ), shadowCoord.z ),
		mix(
			depthCompare( uv.add( vec2( dx.negate(), 0 ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx.mul( 2 ), 0 ) ), shadowCoord.z ),
			f.x
		),
		mix(
			depthCompare( uv.add( vec2( dx.negate(), dy ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx.mul( 2 ), dy ) ), shadowCoord.z ),
			f.x
		),
		mix(
			depthCompare( uv.add( vec2( 0, dy.negate() ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( 0, dy.mul( 2 ) ) ), shadowCoord.z ),
			f.y
		),
		mix(
			depthCompare( uv.add( vec2( dx, dy.negate() ) ), shadowCoord.z ),
			depthCompare( uv.add( vec2( dx, dy.mul( 2 ) ) ), shadowCoord.z ),
			f.y
		),
		mix(
			mix(
				depthCompare( uv.add( vec2( dx.negate(), dy.negate() ) ), shadowCoord.z ),
				depthCompare( uv.add( vec2( dx.mul( 2 ), dy.negate() ) ), shadowCoord.z ),
				f.x
			),
			mix(
				depthCompare( uv.add( vec2( dx.negate(), dy.mul( 2 ) ) ), shadowCoord.z ),
				depthCompare( uv.add( vec2( dx.mul( 2 ), dy.mul( 2 ) ) ), shadowCoord.z ),
				f.x
			),
			f.y
		)
	).mul( 1 / 9 );

} );

// VSM

const VSMShadowMapNode = Fn( ( { depthTexture, shadowCoord } ) => {

	const occlusion = float( 1 ).toVar();

	const distribution = texture( depthTexture ).uv( shadowCoord.xy ).rg;

	const hardShadow = step( shadowCoord.z, distribution.x );

	If( hardShadow.notEqual( float( 1.0 ) ), () => {

		const distance = shadowCoord.z.sub( distribution.x );
		const variance = max$1( 0, distribution.y.mul( distribution.y ) );
		let softnessProbability = variance.div( variance.add( distance.mul( distance ) ) ); // Chebeyshevs inequality
		softnessProbability = clamp( sub( softnessProbability, 0.3 ).div( 0.95 - 0.3 ) );
		occlusion.assign( clamp( max$1( hardShadow, softnessProbability ) ) );

	} );

	return occlusion;

} );

const VSMPassVertical = Fn( ( { samples, radius, size, shadowPass } ) => {

	const mean = float( 0 ).toVar();
	const squaredMean = float( 0 ).toVar();

	const uvStride = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( 2 ).div( samples.sub( 1 ) ) );
	const uvStart = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( - 1 ) );

	Loop( { start: int( 0 ), end: int( samples ), type: 'int', condition: '<' }, ( { i } ) => {

		const uvOffset = uvStart.add( float( i ).mul( uvStride ) );

		const depth = shadowPass.uv( add( screenCoordinate.xy, vec2( 0, uvOffset ).mul( radius ) ).div( size ) ).x;
		mean.addAssign( depth );
		squaredMean.addAssign( depth.mul( depth ) );

	} );

	mean.divAssign( samples );
	squaredMean.divAssign( samples );

	const std_dev = sqrt( squaredMean.sub( mean.mul( mean ) ) );
	return vec2( mean, std_dev );

} );

const VSMPassHorizontal = Fn( ( { samples, radius, size, shadowPass } ) => {

	const mean = float( 0 ).toVar();
	const squaredMean = float( 0 ).toVar();

	const uvStride = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( 2 ).div( samples.sub( 1 ) ) );
	const uvStart = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( - 1 ) );

	Loop( { start: int( 0 ), end: int( samples ), type: 'int', condition: '<' }, ( { i } ) => {

		const uvOffset = uvStart.add( float( i ).mul( uvStride ) );

		const distribution = shadowPass.uv( add( screenCoordinate.xy, vec2( uvOffset, 0 ).mul( radius ) ).div( size ) );
		mean.addAssign( distribution.x );
		squaredMean.addAssign( add( distribution.y.mul( distribution.y ), distribution.x.mul( distribution.x ) ) );

	} );

	mean.divAssign( samples );
	squaredMean.divAssign( samples );

	const std_dev = sqrt( squaredMean.sub( mean.mul( mean ) ) );
	return vec2( mean, std_dev );

} );

const _shadowFilterLib = [ BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMapNode ];

//

let _overrideMaterial = null;
const _quadMesh$1 = /*@__PURE__*/ new QuadMesh();

class ShadowNode extends Node {

	static get type() {

		return 'ShadowNode';

	}

	constructor( light, shadow = null ) {

		super();

		this.light = light;
		this.shadow = shadow || light.shadow;

		this.shadowMap = null;

		this.vsmShadowMapVertical = null;
		this.vsmShadowMapHorizontal = null;

		this.vsmMaterialVertical = null;
		this.vsmMaterialHorizontal = null;

		this.updateBeforeType = NodeUpdateType.RENDER;
		this._node = null;

		this.isShadowNode = true;

	}

	setupShadow( builder ) {

		const { object, renderer } = builder;

		if ( _overrideMaterial === null ) {

			_overrideMaterial = new NodeMaterial();
			_overrideMaterial.fragmentNode = vec4( 0, 0, 0, 1 );
			_overrideMaterial.isShadowNodeMaterial = true; // Use to avoid other overrideMaterial override material.fragmentNode unintentionally when using material.shadowNode
			_overrideMaterial.name = 'ShadowMaterial';

		}

		const shadow = this.shadow;
		const shadowMapType = renderer.shadowMap.type;

		const depthTexture = new DepthTexture( shadow.mapSize.width, shadow.mapSize.height );
		depthTexture.compareFunction = LessCompare;

		const shadowMap = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height );
		shadowMap.depthTexture = depthTexture;

		shadow.camera.updateProjectionMatrix();

		// VSM

		if ( shadowMapType === VSMShadowMap ) {

			depthTexture.compareFunction = null; // VSM does not use textureSampleCompare()/texture2DCompare()

			this.vsmShadowMapVertical = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType } );
			this.vsmShadowMapHorizontal = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType } );

			const shadowPassVertical = texture( depthTexture );
			const shadowPassHorizontal = texture( this.vsmShadowMapVertical.texture );

			const samples = reference( 'blurSamples', 'float', shadow ).setGroup( renderGroup );
			const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );
			const size = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

			let material = this.vsmMaterialVertical || ( this.vsmMaterialVertical = new NodeMaterial() );
			material.fragmentNode = VSMPassVertical( { samples, radius, size, shadowPass: shadowPassVertical } ).context( builder.getSharedContext() );
			material.name = 'VSMVertical';

			material = this.vsmMaterialHorizontal || ( this.vsmMaterialHorizontal = new NodeMaterial() );
			material.fragmentNode = VSMPassHorizontal( { samples, radius, size, shadowPass: shadowPassHorizontal } ).context( builder.getSharedContext() );
			material.name = 'VSMHorizontal';

		}

		//

		const shadowIntensity = reference( 'intensity', 'float', shadow ).setGroup( renderGroup );
		const bias = reference( 'bias', 'float', shadow ).setGroup( renderGroup );
		const normalBias = reference( 'normalBias', 'float', shadow ).setGroup( renderGroup );

		const position = object.material.shadowPositionNode || positionWorld;

		let shadowCoord = uniform( shadow.matrix ).setGroup( renderGroup ).mul( position.add( transformedNormalWorld.mul( normalBias ) ) );

		let coordZ;

		if ( shadow.camera.isOrthographicCamera || renderer.logarithmicDepthBuffer !== true ) {

			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			coordZ = shadowCoord.z;

			if ( renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Conversion [ 0, 1 ] to [ - 1, 1 ]

			}

		} else {

			const w = shadowCoord.w;
			shadowCoord = shadowCoord.xy.div( w ); // <-- Only divide X/Y coords since we don't need Z

			// The normally available "cameraNear" and "cameraFar" nodes cannot be used here because they do not get
			// updated to use the shadow camera. So, we have to declare our own "local" ones here.
			// TODO: How do we get the cameraNear/cameraFar nodes to use the shadow camera so we don't have to declare local ones here?
			const cameraNearLocal = uniform( 'float' ).onRenderUpdate( () => shadow.camera.near );
			const cameraFarLocal = uniform( 'float' ).onRenderUpdate( () => shadow.camera.far );

			coordZ = perspectiveDepthToLogarithmicDepth( w, cameraNearLocal, cameraFarLocal );

		}

		shadowCoord = vec3(
			shadowCoord.x,
			shadowCoord.y.oneMinus(), // follow webgpu standards
			coordZ.add( bias )
		);

		const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
			.and( shadowCoord.x.lessThanEqual( 1 ) )
			.and( shadowCoord.y.greaterThanEqual( 0 ) )
			.and( shadowCoord.y.lessThanEqual( 1 ) )
			.and( shadowCoord.z.lessThanEqual( 1 ) );

		//

		const filterFn = shadow.filterNode || _shadowFilterLib[ renderer.shadowMap.type ] || null;

		if ( filterFn === null ) {

			throw new Error( 'THREE.WebGPURenderer: Shadow map type not supported yet.' );

		}

		const shadowColor = texture( shadowMap.texture, shadowCoord );
		const shadowNode = frustumTest.select( filterFn( { depthTexture: ( shadowMapType === VSMShadowMap ) ? this.vsmShadowMapHorizontal.texture : depthTexture, shadowCoord, shadow } ), float( 1 ) );
		const shadowOutput = mix( 1, shadowNode.rgb.mix( shadowColor, 1 ), shadowIntensity.mul( shadowColor.a ) ).toVar();

		this.shadowMap = shadowMap;
		this.shadow.map = shadowMap;

		return shadowOutput;

	}

	setup( builder ) {

		if ( builder.renderer.shadowMap.enabled === false ) return;

		let node = this._node;

		if ( node === null ) {

			this._node = node = this.setupShadow( builder );

		}

		shadowsTotal.mulAssign( node );

		return node;

	}

	updateShadow( frame ) {

		const { shadowMap, light, shadow } = this;
		const { renderer, scene, camera } = frame;

		const shadowType = renderer.shadowMap.type;

		const depthVersion = shadowMap.depthTexture.version;
		this._depthVersionCached = depthVersion;

		const currentOverrideMaterial = scene.overrideMaterial;

		scene.overrideMaterial = _overrideMaterial;

		shadowMap.setSize( shadow.mapSize.width, shadow.mapSize.height );

		shadow.updateMatrices( light );
		shadow.camera.layers.mask = camera.layers.mask;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		renderer.setRenderObjectFunction( ( object, ...params ) => {

			if ( object.castShadow === true || ( object.receiveShadow && shadowType === VSMShadowMap ) ) {

				renderer.renderObject( object, ...params );

			}

		} );

		renderer.setRenderTarget( shadowMap );
		renderer.render( scene, shadow.camera );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		// vsm blur pass

		if ( light.isPointLight !== true && shadowType === VSMShadowMap ) {

			this.vsmPass( renderer );

		}

		renderer.setRenderTarget( currentRenderTarget );

		scene.overrideMaterial = currentOverrideMaterial;

	}

	vsmPass( renderer ) {

		const { shadow } = this;

		this.vsmShadowMapVertical.setSize( shadow.mapSize.width, shadow.mapSize.height );
		this.vsmShadowMapHorizontal.setSize( shadow.mapSize.width, shadow.mapSize.height );

		renderer.setRenderTarget( this.vsmShadowMapVertical );
		_quadMesh$1.material = this.vsmMaterialVertical;
		_quadMesh$1.render( renderer );

		renderer.setRenderTarget( this.vsmShadowMapHorizontal );
		_quadMesh$1.material = this.vsmMaterialHorizontal;
		_quadMesh$1.render( renderer );

	}

	dispose() {

		this.shadowMap.dispose();
		this.shadowMap = null;

		if ( this.vsmShadowMapVertical !== null ) {

			this.vsmShadowMapVertical.dispose();
			this.vsmShadowMapVertical = null;

			this.vsmMaterialVertical.dispose();
			this.vsmMaterialVertical = null;

		}

		if ( this.vsmShadowMapHorizontal !== null ) {

			this.vsmShadowMapHorizontal.dispose();
			this.vsmShadowMapHorizontal = null;

			this.vsmMaterialHorizontal.dispose();
			this.vsmMaterialHorizontal = null;

		}

		this.updateBeforeType = NodeUpdateType.NONE;

	}

	updateBefore( frame ) {

		const { shadow } = this;

		const needsUpdate = shadow.needsUpdate || shadow.autoUpdate;

		if ( needsUpdate ) {

			this.updateShadow( frame );

			if ( this.shadowMap.depthTexture.version === this._depthVersionCached ) {

				shadow.needsUpdate = false;

			}

		}

	}

}

const shadowsTotal = /*@__PURE__*/ float( 1 ).toVar();

const shadow = ( light, shadow ) => nodeObject( new ShadowNode( light, shadow ) );
const shadows = /*@__PURE__*/ shadowsTotal.oneMinus().toVar( 'shadows' );

class AnalyticLightNode extends LightingNode {

	static get type() {

		return 'AnalyticLightNode';

	}

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.FRAME;

		this.light = light;

		this.color = new Color();
		this.colorNode = uniform( this.color ).setGroup( renderGroup );

		this.baseColorNode = null;

		this.shadowNode = null;
		this.shadowColorNode = null;

		this.isAnalyticLightNode = true;

	}

	getCacheKey() {

		return hash$1( super.getCacheKey(), this.light.id, this.light.castShadow ? 1 : 0 );

	}

	getHash() {

		return this.light.uuid;

	}

	setupShadow( builder ) {

		const { renderer } = builder;

		if ( renderer.shadowMap.enabled === false ) return;

		let shadowColorNode = this.shadowColorNode;

		if ( shadowColorNode === null ) {

			const customShadowNode = this.light.shadow.shadowNode;

			let shadowNode;

			if ( customShadowNode !== undefined ) {

				shadowNode = nodeObject( customShadowNode );

			} else {

				shadowNode = shadow( this.light );

			}

			this.shadowNode = shadowNode;

			this.shadowColorNode = shadowColorNode = this.colorNode.mul( shadowNode );

			this.baseColorNode = this.colorNode;

		}

		//

		this.colorNode = shadowColorNode;

	}

	setup( builder ) {

		this.colorNode = this.baseColorNode || this.colorNode;

		if ( this.light.castShadow ) {

			if ( builder.object.receiveShadow ) {

				this.setupShadow( builder );

			}

		} else if ( this.shadowNode !== null ) {

			this.shadowNode.dispose();

		}

	}

	update( /*frame*/ ) {

		const { light } = this;

		this.color.copy( light.color ).multiplyScalar( light.intensity );

	}

}

const getDistanceAttenuation = /*@__PURE__*/ Fn( ( inputs ) => {

	const { lightDistance, cutoffDistance, decayExponent } = inputs;

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	const distanceFalloff = lightDistance.pow( decayExponent ).max( 0.01 ).reciprocal();

	return cutoffDistance.greaterThan( 0 ).select(
		distanceFalloff.mul( lightDistance.div( cutoffDistance ).pow4().oneMinus().clamp().pow2() ),
		distanceFalloff
	);

} ); // validated

const directPointLight = Fn( ( { color, lightViewPosition, cutoffDistance, decayExponent }, builder ) => {

	const lightingModel = builder.context.lightingModel;

	const lVector = lightViewPosition.sub( positionView ); // @TODO: Add it into LightNode

	const lightDirection = lVector.normalize();
	const lightDistance = lVector.length();

	const lightAttenuation = getDistanceAttenuation( {
		lightDistance,
		cutoffDistance,
		decayExponent
	} );

	const lightColor = color.mul( lightAttenuation );

	const reflectedLight = builder.context.reflectedLight;

	lightingModel.direct( {
		lightDirection,
		lightColor,
		reflectedLight
	}, builder.stack, builder );

} );

class PointLightNode extends AnalyticLightNode {

	static get type() {

		return 'PointLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.cutoffDistanceNode = uniform( 0 ).setGroup( renderGroup );
		this.decayExponentNode = uniform( 0 ).setGroup( renderGroup );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	setup() {

		directPointLight( {
			color: this.colorNode,
			lightViewPosition: lightViewPosition( this.light ),
			cutoffDistance: this.cutoffDistanceNode,
			decayExponent: this.decayExponentNode
		} ).append();

	}

}

const checker = /*@__PURE__*/ Fn( ( [ coord = uv() ] ) => {

	const uv = coord.mul( 2.0 );

	const cx = uv.x.floor();
	const cy = uv.y.floor();
	const result = cx.add( cy ).mod( 2.0 );

	return result.sign();

} );

// Three.js Transpiler
// https://raw.githubusercontent.com/AcademySoftwareFoundation/MaterialX/main/libraries/stdlib/genglsl/lib/mx_noise.glsl



const mx_select = /*@__PURE__*/ Fn( ( [ b_immutable, t_immutable, f_immutable ] ) => {

	const f = float( f_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const b = bool( b_immutable ).toVar();

	return select( b, t, f );

} ).setLayout( {
	name: 'mx_select',
	type: 'float',
	inputs: [
		{ name: 'b', type: 'bool' },
		{ name: 't', type: 'float' },
		{ name: 'f', type: 'float' }
	]
} );

const mx_negate_if = /*@__PURE__*/ Fn( ( [ val_immutable, b_immutable ] ) => {

	const b = bool( b_immutable ).toVar();
	const val = float( val_immutable ).toVar();

	return select( b, val.negate(), val );

} ).setLayout( {
	name: 'mx_negate_if',
	type: 'float',
	inputs: [
		{ name: 'val', type: 'float' },
		{ name: 'b', type: 'bool' }
	]
} );

const mx_floor = /*@__PURE__*/ Fn( ( [ x_immutable ] ) => {

	const x = float( x_immutable ).toVar();

	return int( floor( x ) );

} ).setLayout( {
	name: 'mx_floor',
	type: 'int',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

const mx_floorfrac = /*@__PURE__*/ Fn( ( [ x_immutable, i ] ) => {

	const x = float( x_immutable ).toVar();
	i.assign( mx_floor( x ) );

	return x.sub( float( i ) );

} );

const mx_bilerp_0 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, s_immutable, t_immutable ] ) => {

	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v3 = float( v3_immutable ).toVar();
	const v2 = float( v2_immutable ).toVar();
	const v1 = float( v1_immutable ).toVar();
	const v0 = float( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();

	return sub( 1.0, t ).mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) );

} ).setLayout( {
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

const mx_bilerp_1 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, s_immutable, t_immutable ] ) => {

	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v3 = vec3( v3_immutable ).toVar();
	const v2 = vec3( v2_immutable ).toVar();
	const v1 = vec3( v1_immutable ).toVar();
	const v0 = vec3( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();

	return sub( 1.0, t ).mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) );

} ).setLayout( {
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

const mx_bilerp = /*@__PURE__*/ overloadingFn( [ mx_bilerp_0, mx_bilerp_1 ] );

const mx_trilerp_0 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, v4_immutable, v5_immutable, v6_immutable, v7_immutable, s_immutable, t_immutable, r_immutable ] ) => {

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

} ).setLayout( {
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

const mx_trilerp_1 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, v4_immutable, v5_immutable, v6_immutable, v7_immutable, s_immutable, t_immutable, r_immutable ] ) => {

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

} ).setLayout( {
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

const mx_trilerp = /*@__PURE__*/ overloadingFn( [ mx_trilerp_0, mx_trilerp_1 ] );

const mx_gradient_float_0 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable ] ) => {

	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uint( hash_immutable ).toVar();
	const h = uint( hash.bitAnd( uint( 7 ) ) ).toVar();
	const u = float( mx_select( h.lessThan( uint( 4 ) ), x, y ) ).toVar();
	const v = float( mul( 2.0, mx_select( h.lessThan( uint( 4 ) ), y, x ) ) ).toVar();

	return mx_negate_if( u, bool( h.bitAnd( uint( 1 ) ) ) ).add( mx_negate_if( v, bool( h.bitAnd( uint( 2 ) ) ) ) );

} ).setLayout( {
	name: 'mx_gradient_float_0',
	type: 'float',
	inputs: [
		{ name: 'hash', type: 'uint' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
} );

const mx_gradient_float_1 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable, z_immutable ] ) => {

	const z = float( z_immutable ).toVar();
	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uint( hash_immutable ).toVar();
	const h = uint( hash.bitAnd( uint( 15 ) ) ).toVar();
	const u = float( mx_select( h.lessThan( uint( 8 ) ), x, y ) ).toVar();
	const v = float( mx_select( h.lessThan( uint( 4 ) ), y, mx_select( h.equal( uint( 12 ) ).or( h.equal( uint( 14 ) ) ), x, z ) ) ).toVar();

	return mx_negate_if( u, bool( h.bitAnd( uint( 1 ) ) ) ).add( mx_negate_if( v, bool( h.bitAnd( uint( 2 ) ) ) ) );

} ).setLayout( {
	name: 'mx_gradient_float_1',
	type: 'float',
	inputs: [
		{ name: 'hash', type: 'uint' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' },
		{ name: 'z', type: 'float' }
	]
} );

const mx_gradient_float = /*@__PURE__*/ overloadingFn( [ mx_gradient_float_0, mx_gradient_float_1 ] );

const mx_gradient_vec3_0 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable ] ) => {

	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uvec3( hash_immutable ).toVar();

	return vec3( mx_gradient_float( hash.x, x, y ), mx_gradient_float( hash.y, x, y ), mx_gradient_float( hash.z, x, y ) );

} ).setLayout( {
	name: 'mx_gradient_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'hash', type: 'uvec3' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
} );

const mx_gradient_vec3_1 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable, z_immutable ] ) => {

	const z = float( z_immutable ).toVar();
	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uvec3( hash_immutable ).toVar();

	return vec3( mx_gradient_float( hash.x, x, y, z ), mx_gradient_float( hash.y, x, y, z ), mx_gradient_float( hash.z, x, y, z ) );

} ).setLayout( {
	name: 'mx_gradient_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'hash', type: 'uvec3' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' },
		{ name: 'z', type: 'float' }
	]
} );

const mx_gradient_vec3 = /*@__PURE__*/ overloadingFn( [ mx_gradient_vec3_0, mx_gradient_vec3_1 ] );

const mx_gradient_scale2d_0 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = float( v_immutable ).toVar();

	return mul( 0.6616, v );

} ).setLayout( {
	name: 'mx_gradient_scale2d_0',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' }
	]
} );

const mx_gradient_scale3d_0 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = float( v_immutable ).toVar();

	return mul( 0.9820, v );

} ).setLayout( {
	name: 'mx_gradient_scale3d_0',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' }
	]
} );

const mx_gradient_scale2d_1 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();

	return mul( 0.6616, v );

} ).setLayout( {
	name: 'mx_gradient_scale2d_1',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' }
	]
} );

const mx_gradient_scale2d = /*@__PURE__*/ overloadingFn( [ mx_gradient_scale2d_0, mx_gradient_scale2d_1 ] );

const mx_gradient_scale3d_1 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();

	return mul( 0.9820, v );

} ).setLayout( {
	name: 'mx_gradient_scale3d_1',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' }
	]
} );

const mx_gradient_scale3d = /*@__PURE__*/ overloadingFn( [ mx_gradient_scale3d_0, mx_gradient_scale3d_1 ] );

const mx_rotl32 = /*@__PURE__*/ Fn( ( [ x_immutable, k_immutable ] ) => {

	const k = int( k_immutable ).toVar();
	const x = uint( x_immutable ).toVar();

	return x.shiftLeft( k ).bitOr( x.shiftRight( int( 32 ).sub( k ) ) );

} ).setLayout( {
	name: 'mx_rotl32',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'uint' },
		{ name: 'k', type: 'int' }
	]
} );

const mx_bjmix = /*@__PURE__*/ Fn( ( [ a, b, c ] ) => {

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

const mx_bjfinal = /*@__PURE__*/ Fn( ( [ a_immutable, b_immutable, c_immutable ] ) => {

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

} ).setLayout( {
	name: 'mx_bjfinal',
	type: 'uint',
	inputs: [
		{ name: 'a', type: 'uint' },
		{ name: 'b', type: 'uint' },
		{ name: 'c', type: 'uint' }
	]
} );

const mx_bits_to_01 = /*@__PURE__*/ Fn( ( [ bits_immutable ] ) => {

	const bits = uint( bits_immutable ).toVar();

	return float( bits ).div( float( uint( int( 0xffffffff ) ) ) );

} ).setLayout( {
	name: 'mx_bits_to_01',
	type: 'float',
	inputs: [
		{ name: 'bits', type: 'uint' }
	]
} );

const mx_fade = /*@__PURE__*/ Fn( ( [ t_immutable ] ) => {

	const t = float( t_immutable ).toVar();

	return t.mul( t ).mul( t ).mul( t.mul( t.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) );

} ).setLayout( {
	name: 'mx_fade',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' }
	]
} );

const mx_hash_int_0 = /*@__PURE__*/ Fn( ( [ x_immutable ] ) => {

	const x = int( x_immutable ).toVar();
	const len = uint( uint( 1 ) ).toVar();
	const seed = uint( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ).toVar();

	return mx_bjfinal( seed.add( uint( x ) ), seed, seed );

} ).setLayout( {
	name: 'mx_hash_int_0',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' }
	]
} );

const mx_hash_int_1 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable ] ) => {

	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 2 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_1',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' }
	]
} );

const mx_hash_int_2 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable ] ) => {

	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 3 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_2',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' }
	]
} );

const mx_hash_int_3 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable, xx_immutable ] ) => {

	const xx = int( xx_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 4 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );
	mx_bjmix( a, b, c );
	a.addAssign( uint( xx ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_3',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xx', type: 'int' }
	]
} );

const mx_hash_int_4 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable, xx_immutable, yy_immutable ] ) => {

	const yy = int( yy_immutable ).toVar();
	const xx = int( xx_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 5 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );
	mx_bjmix( a, b, c );
	a.addAssign( uint( xx ) );
	b.addAssign( uint( yy ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
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

const mx_hash_int = /*@__PURE__*/ overloadingFn( [ mx_hash_int_0, mx_hash_int_1, mx_hash_int_2, mx_hash_int_3, mx_hash_int_4 ] );

const mx_hash_vec3_0 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable ] ) => {

	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const h = uint( mx_hash_int( x, y ) ).toVar();
	const result = uvec3().toVar();
	result.x.assign( h.bitAnd( int( 0xFF ) ) );
	result.y.assign( h.shiftRight( int( 8 ) ).bitAnd( int( 0xFF ) ) );
	result.z.assign( h.shiftRight( int( 16 ) ).bitAnd( int( 0xFF ) ) );

	return result;

} ).setLayout( {
	name: 'mx_hash_vec3_0',
	type: 'uvec3',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' }
	]
} );

const mx_hash_vec3_1 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable ] ) => {

	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const h = uint( mx_hash_int( x, y, z ) ).toVar();
	const result = uvec3().toVar();
	result.x.assign( h.bitAnd( int( 0xFF ) ) );
	result.y.assign( h.shiftRight( int( 8 ) ).bitAnd( int( 0xFF ) ) );
	result.z.assign( h.shiftRight( int( 16 ) ).bitAnd( int( 0xFF ) ) );

	return result;

} ).setLayout( {
	name: 'mx_hash_vec3_1',
	type: 'uvec3',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' }
	]
} );

const mx_hash_vec3 = /*@__PURE__*/ overloadingFn( [ mx_hash_vec3_0, mx_hash_vec3_1 ] );

const mx_perlin_noise_float_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const result = float( mx_bilerp( mx_gradient_float( mx_hash_int( X, Y ), fx, fy ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y ), fx.sub( 1.0 ), fy ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ) ), fx, fy.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ) ), u, v ) ).toVar();

	return mx_gradient_scale2d( result );

} ).setLayout( {
	name: 'mx_perlin_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

const mx_perlin_noise_float_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

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

} ).setLayout( {
	name: 'mx_perlin_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

const mx_perlin_noise_float = /*@__PURE__*/ overloadingFn( [ mx_perlin_noise_float_0, mx_perlin_noise_float_1 ] );

const mx_perlin_noise_vec3_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const result = vec3( mx_bilerp( mx_gradient_vec3( mx_hash_vec3( X, Y ), fx, fy ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y ), fx.sub( 1.0 ), fy ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ) ), fx, fy.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ) ), u, v ) ).toVar();

	return mx_gradient_scale2d( result );

} ).setLayout( {
	name: 'mx_perlin_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

const mx_perlin_noise_vec3_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

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

} ).setLayout( {
	name: 'mx_perlin_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

const mx_perlin_noise_vec3 = /*@__PURE__*/ overloadingFn( [ mx_perlin_noise_vec3_0, mx_perlin_noise_vec3_1 ] );

const mx_cell_noise_float_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = float( p_immutable ).toVar();
	const ix = int( mx_floor( p ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'float' }
	]
} );

const mx_cell_noise_float_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

const mx_cell_noise_float_2 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy, iz ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_2',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

const mx_cell_noise_float_3 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec4( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();
	const iw = int( mx_floor( p.w ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy, iz, iw ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_3',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec4' }
	]
} );

const mx_cell_noise_float$1 = /*@__PURE__*/ overloadingFn( [ mx_cell_noise_float_0, mx_cell_noise_float_1, mx_cell_noise_float_2, mx_cell_noise_float_3 ] );

const mx_cell_noise_vec3_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = float( p_immutable ).toVar();
	const ix = int( mx_floor( p ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'float' }
	]
} );

const mx_cell_noise_vec3_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

const mx_cell_noise_vec3_2 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_2',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

const mx_cell_noise_vec3_3 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec4( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();
	const iw = int( mx_floor( p.w ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec4' }
	]
} );

const mx_cell_noise_vec3 = /*@__PURE__*/ overloadingFn( [ mx_cell_noise_vec3_0, mx_cell_noise_vec3_1, mx_cell_noise_vec3_2, mx_cell_noise_vec3_3 ] );

const mx_fractal_noise_float$1 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const result = float( 0.0 ).toVar();
	const amplitude = float( 1.0 ).toVar();

	Loop( octaves, () => {

		result.addAssign( amplitude.mul( mx_perlin_noise_float( p ) ) );
		amplitude.mulAssign( diminish );
		p.mulAssign( lacunarity );

	} );

	return result;

} ).setLayout( {
	name: 'mx_fractal_noise_float',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

const mx_fractal_noise_vec3$1 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const result = vec3( 0.0 ).toVar();
	const amplitude = float( 1.0 ).toVar();

	Loop( octaves, () => {

		result.addAssign( amplitude.mul( mx_perlin_noise_vec3( p ) ) );
		amplitude.mulAssign( diminish );
		p.mulAssign( lacunarity );

	} );

	return result;

} ).setLayout( {
	name: 'mx_fractal_noise_vec3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

const mx_fractal_noise_vec2$1 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();

	return vec2( mx_fractal_noise_float$1( p, octaves, lacunarity, diminish ), mx_fractal_noise_float$1( p.add( vec3( int( 19 ), int( 193 ), int( 17 ) ) ), octaves, lacunarity, diminish ) );

} ).setLayout( {
	name: 'mx_fractal_noise_vec2',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

const mx_fractal_noise_vec4$1 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const c = vec3( mx_fractal_noise_vec3$1( p, octaves, lacunarity, diminish ) ).toVar();
	const f = float( mx_fractal_noise_float$1( p.add( vec3( int( 19 ), int( 193 ), int( 17 ) ) ), octaves, lacunarity, diminish ) ).toVar();

	return vec4( c, f );

} ).setLayout( {
	name: 'mx_fractal_noise_vec4',
	type: 'vec4',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

const mx_worley_distance_0 = /*@__PURE__*/ Fn( ( [ p_immutable, x_immutable, y_immutable, xoff_immutable, yoff_immutable, jitter_immutable, metric_immutable ] ) => {

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

} ).setLayout( {
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

const mx_worley_distance_1 = /*@__PURE__*/ Fn( ( [ p_immutable, x_immutable, y_immutable, z_immutable, xoff_immutable, yoff_immutable, zoff_immutable, jitter_immutable, metric_immutable ] ) => {

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

		return abs( diff.x ).add( abs( diff.y ) ).add( abs( diff.z ) );

	} );

	If( metric.equal( int( 3 ) ), () => {

		return max$1( max$1( abs( diff.x ), abs( diff.y ) ), abs( diff.z ) );

	} );

	return dot( diff, diff );

} ).setLayout( {
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

const mx_worley_distance = /*@__PURE__*/ overloadingFn( [ mx_worley_distance_0, mx_worley_distance_1 ] );

const mx_worley_noise_float_0 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = float( 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();
			sqdist.assign( min$1( sqdist, dist ) );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

const mx_worley_noise_vec2_0 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = vec2( 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();

			If( dist.lessThan( sqdist.x ), () => {

				sqdist.y.assign( sqdist.x );
				sqdist.x.assign( dist );

			} ).ElseIf( dist.lessThan( sqdist.y ), () => {

				sqdist.y.assign( dist );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec2_0',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

const mx_worley_noise_vec3_0 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = vec3( 1e6, 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();

			If( dist.lessThan( sqdist.x ), () => {

				sqdist.z.assign( sqdist.y );
				sqdist.y.assign( sqdist.x );
				sqdist.x.assign( dist );

			} ).ElseIf( dist.lessThan( sqdist.y ), () => {

				sqdist.z.assign( sqdist.y );
				sqdist.y.assign( dist );

			} ).ElseIf( dist.lessThan( sqdist.z ), () => {

				sqdist.z.assign( dist );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

const mx_worley_noise_float_1 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = float( 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();
				sqdist.assign( min$1( sqdist, dist ) );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

const mx_worley_noise_float$1 = /*@__PURE__*/ overloadingFn( [ mx_worley_noise_float_0, mx_worley_noise_float_1 ] );

const mx_worley_noise_vec2_1 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = vec2( 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();

				If( dist.lessThan( sqdist.x ), () => {

					sqdist.y.assign( sqdist.x );
					sqdist.x.assign( dist );

				} ).ElseIf( dist.lessThan( sqdist.y ), () => {

					sqdist.y.assign( dist );

				} );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec2_1',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

const mx_worley_noise_vec2$1 = /*@__PURE__*/ overloadingFn( [ mx_worley_noise_vec2_0, mx_worley_noise_vec2_1 ] );

const mx_worley_noise_vec3_1 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = vec3( 1e6, 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();

				If( dist.lessThan( sqdist.x ), () => {

					sqdist.z.assign( sqdist.y );
					sqdist.y.assign( sqdist.x );
					sqdist.x.assign( dist );

				} ).ElseIf( dist.lessThan( sqdist.y ), () => {

					sqdist.z.assign( sqdist.y );
					sqdist.y.assign( dist );

				} ).ElseIf( dist.lessThan( sqdist.z ), () => {

					sqdist.z.assign( dist );

				} );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

const mx_worley_noise_vec3$1 = /*@__PURE__*/ overloadingFn( [ mx_worley_noise_vec3_0, mx_worley_noise_vec3_1 ] );

// Three.js Transpiler
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_hsv.glsl


const mx_hsvtorgb = /*@__PURE__*/ Fn( ( [ hsv ] ) => {

	const s = hsv.y;
	const v = hsv.z;

	const result = vec3().toVar();

	If( s.lessThan( 0.0001 ), () => {

		result.assign( vec3( v, v, v ) );

	} ).Else( () => {

		let h = hsv.x;
		h = h.sub( floor( h ) ).mul( 6.0 ).toVar(); // TODO: check what .toVar() is needed in node system cache
		const hi = int( trunc( h ) );
		const f = h.sub( float( hi ) );
		const p = v.mul( s.oneMinus() );
		const q = v.mul( s.mul( f ).oneMinus() );
		const t = v.mul( s.mul( f.oneMinus() ).oneMinus() );

		If( hi.equal( int( 0 ) ), () => {

			result.assign( vec3( v, t, p ) );

		} ).ElseIf( hi.equal( int( 1 ) ), () => {

			result.assign( vec3( q, v, p ) );

		} ).ElseIf( hi.equal( int( 2 ) ), () => {

			result.assign( vec3( p, v, t ) );

		} ).ElseIf( hi.equal( int( 3 ) ), () => {

			result.assign( vec3( p, q, v ) );

		} ).ElseIf( hi.equal( int( 4 ) ), () => {

			result.assign( vec3( t, p, v ) );

		} ).Else( () => {

			result.assign( vec3( v, p, q ) );

		} );

	} );

	return result;

} ).setLayout( {
	name: 'mx_hsvtorgb',
	type: 'vec3',
	inputs: [
		{ name: 'hsv', type: 'vec3' }
	]
} );

const mx_rgbtohsv = /*@__PURE__*/ Fn( ( [ c_immutable ] ) => {

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

	} ).Else( () => {

		s.assign( 0.0 );

	} );

	If( s.lessThanEqual( 0.0 ), () => {

		h.assign( 0.0 );

	} ).Else( () => {

		If( r.greaterThanEqual( maxcomp ), () => {

			h.assign( g.sub( b ).div( delta ) );

		} ).ElseIf( g.greaterThanEqual( maxcomp ), () => {

			h.assign( add( 2.0, b.sub( r ).div( delta ) ) );

		} ).Else( () => {

			h.assign( add( 4.0, r.sub( g ).div( delta ) ) );

		} );

		h.mulAssign( 1.0 / 6.0 );

		If( h.lessThan( 0.0 ), () => {

			h.addAssign( 1.0 );

		} );

	} );

	return vec3( h, s, v );

} ).setLayout( {
	name: 'mx_rgbtohsv',
	type: 'vec3',
	inputs: [
		{ name: 'c', type: 'vec3' }
	]
} );

// Three.js Transpiler
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_transform_color.glsl


const mx_srgb_texture_to_lin_rec709 = /*@__PURE__*/ Fn( ( [ color_immutable ] ) => {

	const color = vec3( color_immutable ).toVar();
	const isAbove = bvec3( greaterThan( color, vec3( 0.04045 ) ) ).toVar();
	const linSeg = vec3( color.div( 12.92 ) ).toVar();
	const powSeg = vec3( pow( max$1( color.add( vec3( 0.055 ) ), vec3( 0.0 ) ).div( 1.055 ), vec3( 2.4 ) ) ).toVar();

	return mix( linSeg, powSeg, isAbove );

} ).setLayout( {
	name: 'mx_srgb_texture_to_lin_rec709',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

const mx_aastep = ( threshold, value ) => {

	threshold = float( threshold );
	value = float( value );

	const afwidth = vec2( value.dFdx(), value.dFdy() ).length().mul( 0.70710678118654757 );

	return smoothstep( threshold.sub( afwidth ), threshold.add( afwidth ), value );

};

const _ramp = ( a, b, uv, p ) => mix( a, b, uv[ p ].clamp() );
const mx_ramplr = ( valuel, valuer, texcoord = uv() ) => _ramp( valuel, valuer, texcoord, 'x' );
const mx_ramptb = ( valuet, valueb, texcoord = uv() ) => _ramp( valuet, valueb, texcoord, 'y' );

const _split = ( a, b, center, uv, p ) => mix( a, b, mx_aastep( center, uv[ p ] ) );
const mx_splitlr = ( valuel, valuer, center, texcoord = uv() ) => _split( valuel, valuer, center, texcoord, 'x' );
const mx_splittb = ( valuet, valueb, center, texcoord = uv() ) => _split( valuet, valueb, center, texcoord, 'y' );

const mx_transform_uv = ( uv_scale = 1, uv_offset = 0, uv_geo = uv() ) => uv_geo.mul( uv_scale ).add( uv_offset );

const mx_safepower = ( in1, in2 = 1 ) => {

	in1 = float( in1 );

	return in1.abs().pow( in2 ).mul( in1.sign() );

};

const mx_contrast = ( input, amount = 1, pivot = .5 ) => float( input ).sub( pivot ).mul( amount ).add( pivot );

const mx_noise_float = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => mx_perlin_noise_float( texcoord.convert( 'vec2|vec3' ) ).mul( amplitude ).add( pivot );
//export const mx_noise_vec2 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => mx_perlin_noise_vec3( texcoord.convert( 'vec2|vec3' ) ).mul( amplitude ).add( pivot );
const mx_noise_vec3 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => mx_perlin_noise_vec3( texcoord.convert( 'vec2|vec3' ) ).mul( amplitude ).add( pivot );
const mx_noise_vec4 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => {

	texcoord = texcoord.convert( 'vec2|vec3' ); // overloading type

	const noise_vec4 = vec4( mx_perlin_noise_vec3( texcoord ), mx_perlin_noise_float( texcoord.add( vec2( 19, 73 ) ) ) );

	return noise_vec4.mul( amplitude ).add( pivot );

};

const mx_worley_noise_float = ( texcoord = uv(), jitter = 1 ) => mx_worley_noise_float$1( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );
const mx_worley_noise_vec2 = ( texcoord = uv(), jitter = 1 ) => mx_worley_noise_vec2$1( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );
const mx_worley_noise_vec3 = ( texcoord = uv(), jitter = 1 ) => mx_worley_noise_vec3$1( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );

const mx_cell_noise_float = ( texcoord = uv() ) => mx_cell_noise_float$1( texcoord.convert( 'vec2|vec3' ) );

const mx_fractal_noise_float = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mx_fractal_noise_float$1( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
const mx_fractal_noise_vec2 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mx_fractal_noise_vec2$1( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
const mx_fractal_noise_vec3 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mx_fractal_noise_vec3$1( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
const mx_fractal_noise_vec4 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mx_fractal_noise_vec4$1( position, int( octaves ), lacunarity, diminish ).mul( amplitude );

// https://devlog-martinsh.blogspot.com/2011/09/box-projected-cube-environment-mapping.html

const getParallaxCorrectNormal = /*@__PURE__*/ Fn( ( [ normal, cubeSize, cubePos ] ) => {

	const nDir = normalize( normal ).toVar( 'nDir' );
	const rbmax = sub( float( 0.5 ).mul( cubeSize.sub( cubePos ) ), positionWorld ).div( nDir ).toVar( 'rbmax' );
	const rbmin = sub( float( - 0.5 ).mul( cubeSize.sub( cubePos ) ), positionWorld ).div( nDir ).toVar( 'rbmin' );
	const rbminmax = vec3().toVar( 'rbminmax' );
	rbminmax.x = nDir.x.greaterThan( float( 0 ) ).select( rbmax.x, rbmin.x );
	rbminmax.y = nDir.y.greaterThan( float( 0 ) ).select( rbmax.y, rbmin.y );
	rbminmax.z = nDir.z.greaterThan( float( 0 ) ).select( rbmax.z, rbmin.z );

	const correction = min$1( min$1( rbminmax.x, rbminmax.y ), rbminmax.z ).toVar( 'correction' );
	const boxIntersection = positionWorld.add( nDir.mul( correction ) ).toVar( 'boxIntersection' );
	return boxIntersection.sub( cubePos );

} );

const getShIrradianceAt = /*@__PURE__*/ Fn( ( [ normal, shCoefficients ] ) => {

	// normal is assumed to have unit length

	const x = normal.x, y = normal.y, z = normal.z;

	// band 0
	let result = shCoefficients.element( 0 ).mul( 0.886227 );

	// band 1
	result = result.add( shCoefficients.element( 1 ).mul( 2.0 * 0.511664 ).mul( y ) );
	result = result.add( shCoefficients.element( 2 ).mul( 2.0 * 0.511664 ).mul( z ) );
	result = result.add( shCoefficients.element( 3 ).mul( 2.0 * 0.511664 ).mul( x ) );

	// band 2
	result = result.add( shCoefficients.element( 4 ).mul( 2.0 * 0.429043 ).mul( x ).mul( y ) );
	result = result.add( shCoefficients.element( 5 ).mul( 2.0 * 0.429043 ).mul( y ).mul( z ) );
	result = result.add( shCoefficients.element( 6 ).mul( z.mul( z ).mul( 0.743125 ).sub( 0.247708 ) ) );
	result = result.add( shCoefficients.element( 7 ).mul( 2.0 * 0.429043 ).mul( x ).mul( z ) );
	result = result.add( shCoefficients.element( 8 ).mul( 0.429043 ).mul( mul( x, x ).sub( mul( y, y ) ) ) );

	return result;

} );

const _clearColor$1 = /*@__PURE__*/ new Color4();

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

			renderer._clearColor.getRGB( _clearColor$1, LinearSRGBColorSpace );
			_clearColor$1.a = renderer._clearColor.a;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			background.getRGB( _clearColor$1, LinearSRGBColorSpace );
			_clearColor$1.a = 1;

			forceClear = true;

		} else if ( background.isNode === true ) {

			const sceneData = this.get( scene );
			const backgroundNode = background;

			_clearColor$1.copy( renderer._clearColor );

			let backgroundMesh = sceneData.backgroundMesh;

			if ( backgroundMesh === undefined ) {

				const backgroundMeshNode = context( vec4( backgroundNode ).mul( backgroundIntensity ), {
					// @TODO: Add Texture2D support using node context
					getUV: () => backgroundRotation.mul( normalWorld ),
					getTextureLevel: () => backgroundBlurriness
				} );

				let viewProj = modelViewProjection();
				viewProj = viewProj.setZ( viewProj.w );

				const nodeMaterial = new NodeMaterial();
				nodeMaterial.name = 'Background.material';
				nodeMaterial.side = BackSide;
				nodeMaterial.depthTest = false;
				nodeMaterial.depthWrite = false;
				nodeMaterial.fog = false;
				nodeMaterial.lights = false;
				nodeMaterial.vertexNode = viewProj;
				nodeMaterial.colorNode = backgroundMeshNode;

				sceneData.backgroundMeshNode = backgroundMeshNode;
				sceneData.backgroundMesh = backgroundMesh = new Mesh( new SphereGeometry( 1, 32, 32 ), nodeMaterial );
				backgroundMesh.frustumCulled = false;
				backgroundMesh.name = 'Background.mesh';

				backgroundMesh.onBeforeRender = function ( renderer, scene, camera ) {

					this.matrixWorld.copyPosition( camera.matrixWorld );

				};

			}

			const backgroundCacheKey = backgroundNode.getCacheKey();

			if ( sceneData.backgroundCacheKey !== backgroundCacheKey ) {

				sceneData.backgroundMeshNode.node = vec4( backgroundNode ).mul( backgroundIntensity );
				sceneData.backgroundMeshNode.needsUpdate = true;

				backgroundMesh.material.needsUpdate = true;

				sceneData.backgroundCacheKey = backgroundCacheKey;

			}

			renderList.unshift( backgroundMesh, backgroundMesh.geometry, backgroundMesh.material, 0, 0, null, null );

		} else {

			console.error( 'THREE.Renderer: Unsupported background configuration.', background );

		}

		//

		if ( renderer.autoClear === true || forceClear === true ) {

			const clearColorValue = renderContext.clearColorValue;

			clearColorValue.r = _clearColor$1.r;
			clearColorValue.g = _clearColor$1.g;
			clearColorValue.b = _clearColor$1.b;
			clearColorValue.a = _clearColor$1.a;

			// premultiply alpha

			if ( renderer.backend.isWebGLBackend === true || renderer.alpha === true ) {

				clearColorValue.r *= clearColorValue.a;
				clearColorValue.g *= clearColorValue.a;
				clearColorValue.b *= clearColorValue.a;

			}

			//

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

let _id$5 = 0;

class BindGroup {

	constructor( name = '', bindings = [], index = 0, bindingsReference = [] ) {

		this.name = name;
		this.bindings = bindings;
		this.index = index;
		this.bindingsReference = bindingsReference;

		this.id = _id$5 ++;

	}

}

class NodeBuilderState {

	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, updateAfterNodes, monitor, transforms = [] ) {

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.computeShader = computeShader;
		this.transforms = transforms;

		this.nodeAttributes = nodeAttributes;
		this.bindings = bindings;

		this.updateNodes = updateNodes;
		this.updateBeforeNodes = updateBeforeNodes;
		this.updateAfterNodes = updateAfterNodes;

		this.monitor = monitor;

		this.usedTimes = 0;

	}

	createBindings() {

		const bindings = [];

		for ( const instanceGroup of this.bindings ) {

			const shared = instanceGroup.bindings[ 0 ].groupNode.shared;

			if ( shared !== true ) {

				const bindingsGroup = new BindGroup( instanceGroup.name, [], instanceGroup.index, instanceGroup );
				bindings.push( bindingsGroup );

				for ( const instanceBinding of instanceGroup.bindings ) {

					bindingsGroup.bindings.push( instanceBinding.clone() );

				}

			} else {

				bindings.push( instanceGroup );

			}

		}

		return bindings;

	}

}

class NodeAttribute {

	constructor( name, type, node = null ) {

		this.isNodeAttribute = true;

		this.name = name;
		this.type = type;
		this.node = node;

	}

}

class NodeUniform {

	constructor( name, type, node ) {

		this.isNodeUniform = true;

		this.name = name;
		this.type = type;
		this.node = node.getSelf();

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

let id = 0;

class NodeCache {

	constructor( parent = null ) {

		this.id = id ++;
		this.nodesData = new WeakMap();

		this.parent = parent;

	}

	getData( node ) {

		let data = this.nodesData.get( node );

		if ( data === undefined && this.parent !== null ) {

			data = this.parent.getData( node );

		}

		return data;

	}

	setData( node, data ) {

		this.nodesData.set( node, data );

	}

}

class Uniform {

	constructor( name, value ) {

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

class NumberUniform extends Uniform {

	constructor( name, value = 0 ) {

		super( name, value );

		this.isNumberUniform = true;

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

class NumberNodeUniform extends NumberUniform {

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

const LOD_MIN = 4;

// The standard deviations (radians) associated with the extra mips. These are
// chosen to approximate a Trowbridge-Reitz distribution function times the
// geometric shadowing function. These sigma values squared must match the
// variance #defines in cube_uv_reflection_fragment.glsl.js.
const EXTRA_LOD_SIGMA = [ 0.125, 0.215, 0.35, 0.446, 0.526, 0.582 ];

// The maximum length of the blur for loop. Smaller sigmas will use fewer
// samples and exit early, but not recompile the shader.
const MAX_SAMPLES = 20;

const _flatCamera = /*@__PURE__*/ new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
const _cubeCamera = /*@__PURE__*/ new PerspectiveCamera( 90, 1 );
const _clearColor = /*@__PURE__*/ new Color();
let _oldTarget = null;
let _oldActiveCubeFace = 0;
let _oldActiveMipmapLevel = 0;

// Golden Ratio
const PHI = ( 1 + Math.sqrt( 5 ) ) / 2;
const INV_PHI = 1 / PHI;

// Vertices of a dodecahedron (except the opposites, which represent the
// same axis), used as axis directions evenly spread on a sphere.
const _axisDirections = [
	/*@__PURE__*/ new Vector3( - PHI, INV_PHI, 0 ),
	/*@__PURE__*/ new Vector3( PHI, INV_PHI, 0 ),
	/*@__PURE__*/ new Vector3( - INV_PHI, 0, PHI ),
	/*@__PURE__*/ new Vector3( INV_PHI, 0, PHI ),
	/*@__PURE__*/ new Vector3( 0, PHI, - INV_PHI ),
	/*@__PURE__*/ new Vector3( 0, PHI, INV_PHI ),
	/*@__PURE__*/ new Vector3( - 1, 1, - 1 ),
	/*@__PURE__*/ new Vector3( 1, 1, - 1 ),
	/*@__PURE__*/ new Vector3( - 1, 1, 1 ),
	/*@__PURE__*/ new Vector3( 1, 1, 1 )
];

//

// WebGPU Face indices
const _faceLib = [
	3, 1, 5,
	0, 4, 2
];

const direction = getDirection( uv(), attribute( 'faceIndex' ) ).normalize();
const outputDirection = vec3( direction.x, direction.y.negate(), direction.z );

/**
 * This class generates a Prefiltered, Mipmapped Radiance Environment Map
 * (PMREM) from a cubeMap environment texture. This allows different levels of
 * blur to be quickly accessed based on material roughness. It is packed into a
 * special CubeUV format that allows us to perform custom interpolation so that
 * we can support nonlinear formats such as RGBE. Unlike a traditional mipmap
 * chain, it only goes down to the LOD_MIN level (above), and then creates extra
 * even more filtered 'mips' at the same LOD_MIN resolution, associated with
 * higher roughness levels. In this way we maintain resolution to smoothly
 * interpolate diffuse lighting while limiting sampling computation.
 *
 * Paper: Fast, Accurate Image-Based Lighting
 * https://drive.google.com/file/d/15y8r_UpKlU9SvV4ILb0C3qCPecS8pvLz/view
*/

class PMREMGenerator {

	constructor( renderer ) {

		this._renderer = renderer;
		this._pingPongRenderTarget = null;

		this._lodMax = 0;
		this._cubeSize = 0;
		this._lodPlanes = [];
		this._sizeLods = [];
		this._sigmas = [];
		this._lodMeshes = [];

		this._blurMaterial = null;
		this._cubemapMaterial = null;
		this._equirectMaterial = null;
		this._backgroundBox = null;

	}

	/**
	 * Generates a PMREM from a supplied Scene, which can be faster than using an
	 * image if networking bandwidth is low. Optional sigma specifies a blur radius
	 * in radians to be applied to the scene before PMREM generation. Optional near
	 * and far planes ensure the scene is rendered in its entirety (the cubeCamera
	 * is placed at the origin).
	 */
	fromScene( scene, sigma = 0, near = 0.1, far = 100 ) {

		_oldTarget = this._renderer.getRenderTarget();
		_oldActiveCubeFace = this._renderer.getActiveCubeFace();
		_oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel();

		this._setSize( 256 );

		const cubeUVRenderTarget = this._allocateTargets();
		cubeUVRenderTarget.depthBuffer = true;

		this._sceneToCubeUV( scene, near, far, cubeUVRenderTarget );

		if ( sigma > 0 ) {

			this._blur( cubeUVRenderTarget, 0, 0, sigma );

		}

		this._applyPMREM( cubeUVRenderTarget );

		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	/**
	 * Generates a PMREM from an equirectangular texture, which can be either LDR
	 * or HDR. The ideal input image size is 1k (1024 x 512),
	 * as this matches best with the 256 x 256 cubemap output.
	 */
	fromEquirectangular( equirectangular, renderTarget = null ) {

		return this._fromTexture( equirectangular, renderTarget );

	}

	/**
	 * Generates a PMREM from an cubemap texture, which can be either LDR
	 * or HDR. The ideal input cube size is 256 x 256,
	 * as this matches best with the 256 x 256 cubemap output.
	 */
	fromCubemap( cubemap, renderTarget = null ) {

		return this._fromTexture( cubemap, renderTarget );

	}

	/**
	 * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	async compileCubemapShader() {

		if ( this._cubemapMaterial === null ) {

			this._cubemapMaterial = _getCubemapMaterial();
			await this._compileMaterial( this._cubemapMaterial );

		}

	}

	/**
	 * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
	 * your texture's network fetch for increased concurrency.
	 */
	async compileEquirectangularShader() {

		if ( this._equirectMaterial === null ) {

			this._equirectMaterial = _getEquirectMaterial();
			await this._compileMaterial( this._equirectMaterial );

		}

	}

	/**
	 * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
	 * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
	 * one of them will cause any others to also become unusable.
	 */
	dispose() {

		this._dispose();

		if ( this._cubemapMaterial !== null ) this._cubemapMaterial.dispose();
		if ( this._equirectMaterial !== null ) this._equirectMaterial.dispose();
		if ( this._backgroundBox !== null ) {

			this._backgroundBox.geometry.dispose();
			this._backgroundBox.material.dispose();

		}

	}

	// private interface

	_setSize( cubeSize ) {

		this._lodMax = Math.floor( Math.log2( cubeSize ) );
		this._cubeSize = Math.pow( 2, this._lodMax );

	}

	_dispose() {

		if ( this._blurMaterial !== null ) this._blurMaterial.dispose();

		if ( this._pingPongRenderTarget !== null ) this._pingPongRenderTarget.dispose();

		for ( let i = 0; i < this._lodPlanes.length; i ++ ) {

			this._lodPlanes[ i ].dispose();

		}

	}

	_cleanup( outputTarget ) {

		this._renderer.setRenderTarget( _oldTarget, _oldActiveCubeFace, _oldActiveMipmapLevel );
		outputTarget.scissorTest = false;
		_setViewport( outputTarget, 0, 0, outputTarget.width, outputTarget.height );

	}

	_fromTexture( texture, renderTarget ) {

		if ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping ) {

			this._setSize( texture.image.length === 0 ? 16 : ( texture.image[ 0 ].width || texture.image[ 0 ].image.width ) );

		} else { // Equirectangular

			this._setSize( texture.image.width / 4 );

		}

		_oldTarget = this._renderer.getRenderTarget();
		_oldActiveCubeFace = this._renderer.getActiveCubeFace();
		_oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel();

		const cubeUVRenderTarget = renderTarget || this._allocateTargets();
		this._textureToCubeUV( texture, cubeUVRenderTarget );
		this._applyPMREM( cubeUVRenderTarget );
		this._cleanup( cubeUVRenderTarget );

		return cubeUVRenderTarget;

	}

	_allocateTargets() {

		const width = 3 * Math.max( this._cubeSize, 16 * 7 );
		const height = 4 * this._cubeSize;

		const params = {
			magFilter: LinearFilter,
			minFilter: LinearFilter,
			generateMipmaps: false,
			type: HalfFloatType,
			format: RGBAFormat,
			colorSpace: LinearSRGBColorSpace,
			//depthBuffer: false
		};

		const cubeUVRenderTarget = _createRenderTarget( width, height, params );

		if ( this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== width || this._pingPongRenderTarget.height !== height ) {

			if ( this._pingPongRenderTarget !== null ) {

				this._dispose();

			}

			this._pingPongRenderTarget = _createRenderTarget( width, height, params );

			const { _lodMax } = this;
			( { sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas, lodMeshes: this._lodMeshes } = _createPlanes( _lodMax ) );

			this._blurMaterial = _getBlurShader( _lodMax, width, height );

		}

		return cubeUVRenderTarget;

	}

	async _compileMaterial( material ) {

		const tmpMesh = new Mesh( this._lodPlanes[ 0 ], material );
		await this._renderer.compile( tmpMesh, _flatCamera );

	}

	_sceneToCubeUV( scene, near, far, cubeUVRenderTarget ) {

		const cubeCamera = _cubeCamera;
		cubeCamera.near = near;
		cubeCamera.far = far;

		// px, py, pz, nx, ny, nz
		const upSign = [ - 1, 1, - 1, - 1, - 1, - 1 ];
		const forwardSign = [ 1, 1, 1, - 1, - 1, - 1 ];

		const renderer = this._renderer;

		const originalAutoClear = renderer.autoClear;

		renderer.getClearColor( _clearColor );

		renderer.autoClear = false;

		let backgroundBox = this._backgroundBox;

		if ( backgroundBox === null ) {

			const backgroundMaterial = new MeshBasicMaterial( {
				name: 'PMREM.Background',
				side: BackSide,
				depthWrite: false,
				depthTest: false
			} );

			backgroundBox = new Mesh( new BoxGeometry(), backgroundMaterial );

		}

		let useSolidColor = false;
		const background = scene.background;

		if ( background ) {

			if ( background.isColor ) {

				backgroundBox.material.color.copy( background );
				scene.background = null;
				useSolidColor = true;

			}

		} else {

			backgroundBox.material.color.copy( _clearColor );
			useSolidColor = true;

		}

		renderer.setRenderTarget( cubeUVRenderTarget );

		renderer.clear();

		if ( useSolidColor ) {

			renderer.render( backgroundBox, cubeCamera );

		}

		for ( let i = 0; i < 6; i ++ ) {

			const col = i % 3;

			if ( col === 0 ) {

				cubeCamera.up.set( 0, upSign[ i ], 0 );
				cubeCamera.lookAt( forwardSign[ i ], 0, 0 );

			} else if ( col === 1 ) {

				cubeCamera.up.set( 0, 0, upSign[ i ] );
				cubeCamera.lookAt( 0, forwardSign[ i ], 0 );

			} else {

				cubeCamera.up.set( 0, upSign[ i ], 0 );
				cubeCamera.lookAt( 0, 0, forwardSign[ i ] );

			}

			const size = this._cubeSize;

			_setViewport( cubeUVRenderTarget, col * size, i > 2 ? size : 0, size, size );

			renderer.render( scene, cubeCamera );

		}

		renderer.autoClear = originalAutoClear;
		scene.background = background;

	}

	_textureToCubeUV( texture, cubeUVRenderTarget ) {

		const renderer = this._renderer;

		const isCubeTexture = ( texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping );

		if ( isCubeTexture ) {

			if ( this._cubemapMaterial === null ) {

				this._cubemapMaterial = _getCubemapMaterial( texture );

			}

		} else {

			if ( this._equirectMaterial === null ) {

				this._equirectMaterial = _getEquirectMaterial( texture );

			}

		}

		const material = isCubeTexture ? this._cubemapMaterial : this._equirectMaterial;
		material.fragmentNode.value = texture;

		const mesh = this._lodMeshes[ 0 ];
		mesh.material = material;

		const size = this._cubeSize;

		_setViewport( cubeUVRenderTarget, 0, 0, 3 * size, 2 * size );

		renderer.setRenderTarget( cubeUVRenderTarget );
		renderer.render( mesh, _flatCamera );

	}

	_applyPMREM( cubeUVRenderTarget ) {

		const renderer = this._renderer;
		const autoClear = renderer.autoClear;
		renderer.autoClear = false;
		const n = this._lodPlanes.length;

		for ( let i = 1; i < n; i ++ ) {

			const sigma = Math.sqrt( this._sigmas[ i ] * this._sigmas[ i ] - this._sigmas[ i - 1 ] * this._sigmas[ i - 1 ] );

			const poleAxis = _axisDirections[ ( n - i - 1 ) % _axisDirections.length ];

			this._blur( cubeUVRenderTarget, i - 1, i, sigma, poleAxis );

		}

		renderer.autoClear = autoClear;

	}

	/**
	 * This is a two-pass Gaussian blur for a cubemap. Normally this is done
	 * vertically and horizontally, but this breaks down on a cube. Here we apply
	 * the blur latitudinally (around the poles), and then longitudinally (towards
	 * the poles) to approximate the orthogonally-separable blur. It is least
	 * accurate at the poles, but still does a decent job.
	 */
	_blur( cubeUVRenderTarget, lodIn, lodOut, sigma, poleAxis ) {

		const pingPongRenderTarget = this._pingPongRenderTarget;

		this._halfBlur(
			cubeUVRenderTarget,
			pingPongRenderTarget,
			lodIn,
			lodOut,
			sigma,
			'latitudinal',
			poleAxis );

		this._halfBlur(
			pingPongRenderTarget,
			cubeUVRenderTarget,
			lodOut,
			lodOut,
			sigma,
			'longitudinal',
			poleAxis );

	}

	_halfBlur( targetIn, targetOut, lodIn, lodOut, sigmaRadians, direction, poleAxis ) {

		const renderer = this._renderer;
		const blurMaterial = this._blurMaterial;

		if ( direction !== 'latitudinal' && direction !== 'longitudinal' ) {

			console.error( 'blur direction must be either latitudinal or longitudinal!' );

		}

		// Number of standard deviations at which to cut off the discrete approximation.
		const STANDARD_DEVIATIONS = 3;

		const blurMesh = this._lodMeshes[ lodOut ];
		blurMesh.material = blurMaterial;

		const blurUniforms = blurMaterial.uniforms;

		const pixels = this._sizeLods[ lodIn ] - 1;
		const radiansPerPixel = isFinite( sigmaRadians ) ? Math.PI / ( 2 * pixels ) : 2 * Math.PI / ( 2 * MAX_SAMPLES - 1 );
		const sigmaPixels = sigmaRadians / radiansPerPixel;
		const samples = isFinite( sigmaRadians ) ? 1 + Math.floor( STANDARD_DEVIATIONS * sigmaPixels ) : MAX_SAMPLES;

		if ( samples > MAX_SAMPLES ) {

			console.warn( `sigmaRadians, ${
				sigmaRadians}, is too large and will clip, as it requested ${
				samples} samples when the maximum is set to ${MAX_SAMPLES}` );

		}

		const weights = [];
		let sum = 0;

		for ( let i = 0; i < MAX_SAMPLES; ++ i ) {

			const x = i / sigmaPixels;
			const weight = Math.exp( - x * x / 2 );
			weights.push( weight );

			if ( i === 0 ) {

				sum += weight;

			} else if ( i < samples ) {

				sum += 2 * weight;

			}

		}

		for ( let i = 0; i < weights.length; i ++ ) {

			weights[ i ] = weights[ i ] / sum;

		}

		targetIn.texture.frame = ( targetIn.texture.frame || 0 ) + 1;

		blurUniforms.envMap.value = targetIn.texture;
		blurUniforms.samples.value = samples;
		blurUniforms.weights.array = weights;
		blurUniforms.latitudinal.value = direction === 'latitudinal' ? 1 : 0;

		if ( poleAxis ) {

			blurUniforms.poleAxis.value = poleAxis;

		}

		const { _lodMax } = this;
		blurUniforms.dTheta.value = radiansPerPixel;
		blurUniforms.mipInt.value = _lodMax - lodIn;

		const outputSize = this._sizeLods[ lodOut ];
		const x = 3 * outputSize * ( lodOut > _lodMax - LOD_MIN ? lodOut - _lodMax + LOD_MIN : 0 );
		const y = 4 * ( this._cubeSize - outputSize );

		_setViewport( targetOut, x, y, 3 * outputSize, 2 * outputSize );
		renderer.setRenderTarget( targetOut );
		renderer.render( blurMesh, _flatCamera );

	}

}

function _createPlanes( lodMax ) {

	const lodPlanes = [];
	const sizeLods = [];
	const sigmas = [];
	const lodMeshes = [];

	let lod = lodMax;

	const totalLods = lodMax - LOD_MIN + 1 + EXTRA_LOD_SIGMA.length;

	for ( let i = 0; i < totalLods; i ++ ) {

		const sizeLod = Math.pow( 2, lod );
		sizeLods.push( sizeLod );
		let sigma = 1.0 / sizeLod;

		if ( i > lodMax - LOD_MIN ) {

			sigma = EXTRA_LOD_SIGMA[ i - lodMax + LOD_MIN - 1 ];

		} else if ( i === 0 ) {

			sigma = 0;

		}

		sigmas.push( sigma );

		const texelSize = 1.0 / ( sizeLod - 2 );
		const min = - texelSize;
		const max = 1 + texelSize;
		const uv1 = [ min, min, max, min, max, max, min, min, max, max, min, max ];

		const cubeFaces = 6;
		const vertices = 6;
		const positionSize = 3;
		const uvSize = 2;
		const faceIndexSize = 1;

		const position = new Float32Array( positionSize * vertices * cubeFaces );
		const uv = new Float32Array( uvSize * vertices * cubeFaces );
		const faceIndex = new Float32Array( faceIndexSize * vertices * cubeFaces );

		for ( let face = 0; face < cubeFaces; face ++ ) {

			const x = ( face % 3 ) * 2 / 3 - 1;
			const y = face > 2 ? 0 : - 1;
			const coordinates = [
				x, y, 0,
				x + 2 / 3, y, 0,
				x + 2 / 3, y + 1, 0,
				x, y, 0,
				x + 2 / 3, y + 1, 0,
				x, y + 1, 0
			];

			const faceIdx = _faceLib[ face ];
			position.set( coordinates, positionSize * vertices * faceIdx );
			uv.set( uv1, uvSize * vertices * faceIdx );
			const fill = [ faceIdx, faceIdx, faceIdx, faceIdx, faceIdx, faceIdx ];
			faceIndex.set( fill, faceIndexSize * vertices * faceIdx );

		}

		const planes = new BufferGeometry();
		planes.setAttribute( 'position', new BufferAttribute( position, positionSize ) );
		planes.setAttribute( 'uv', new BufferAttribute( uv, uvSize ) );
		planes.setAttribute( 'faceIndex', new BufferAttribute( faceIndex, faceIndexSize ) );
		lodPlanes.push( planes );
		lodMeshes.push( new Mesh( planes, null ) );

		if ( lod > LOD_MIN ) {

			lod --;

		}

	}

	return { lodPlanes, sizeLods, sigmas, lodMeshes };

}

function _createRenderTarget( width, height, params ) {

	const cubeUVRenderTarget = new RenderTarget( width, height, params );
	cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;
	cubeUVRenderTarget.texture.name = 'PMREM.cubeUv';
	cubeUVRenderTarget.texture.isPMREMTexture = true;
	cubeUVRenderTarget.scissorTest = true;
	return cubeUVRenderTarget;

}

function _setViewport( target, x, y, width, height ) {

	target.viewport.set( x, y, width, height );
	target.scissor.set( x, y, width, height );

}

function _getMaterial( type ) {

	const material = new NodeMaterial();
	material.depthTest = false;
	material.depthWrite = false;
	material.blending = NoBlending;
	material.name = `PMREM_${ type }`;

	return material;

}

function _getBlurShader( lodMax, width, height ) {

	const weights = uniformArray( new Array( MAX_SAMPLES ).fill( 0 ) );
	const poleAxis = uniform( new Vector3( 0, 1, 0 ) );
	const dTheta = uniform( 0 );
	const n = float( MAX_SAMPLES );
	const latitudinal = uniform( 0 ); // false, bool
	const samples = uniform( 1 ); // int
	const envMap = texture( null );
	const mipInt = uniform( 0 ); // int
	const CUBEUV_TEXEL_WIDTH = float( 1 / width );
	const CUBEUV_TEXEL_HEIGHT = float( 1 / height );
	const CUBEUV_MAX_MIP = float( lodMax );

	const materialUniforms = {
		n,
		latitudinal,
		weights,
		poleAxis,
		outputDirection,
		dTheta,
		samples,
		envMap,
		mipInt,
		CUBEUV_TEXEL_WIDTH,
		CUBEUV_TEXEL_HEIGHT,
		CUBEUV_MAX_MIP
	};

	const material = _getMaterial( 'blur' );
	material.uniforms = materialUniforms; // TODO: Move to outside of the material
	material.fragmentNode = blur( { ...materialUniforms, latitudinal: latitudinal.equal( 1 ) } );

	return material;

}

function _getCubemapMaterial( envTexture ) {

	const material = _getMaterial( 'cubemap' );
	material.fragmentNode = cubeTexture( envTexture, outputDirection );

	return material;

}

function _getEquirectMaterial( envTexture ) {

	const material = _getMaterial( 'equirect' );
	material.fragmentNode = texture( envTexture, equirectUV( outputDirection ), 0 );

	return material;

}

const rendererCache = new WeakMap();

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

	if ( /e/g.test( value ) ) {

		return String( value ).replace( /\+/g, '' );

	} else {

		value = Number( value );

		return value + ( value % 1 ? '' : '.0' );

	}

};

class NodeBuilder {

	constructor( object, renderer, parser ) {

		this.object = object;
		this.material = ( object && object.material ) || null;
		this.geometry = ( object && object.geometry ) || null;
		this.renderer = renderer;
		this.parser = parser;
		this.scene = null;
		this.camera = null;

		this.nodes = [];
		this.sequentialNodes = [];
		this.updateNodes = [];
		this.updateBeforeNodes = [];
		this.updateAfterNodes = [];
		this.hashNodes = {};

		this.monitor = null;

		this.lightsNode = null;
		this.environmentNode = null;
		this.fogNode = null;

		this.clippingContext = null;

		this.vertexShader = null;
		this.fragmentShader = null;
		this.computeShader = null;

		this.flowNodes = { vertex: [], fragment: [], compute: [] };
		this.flowCode = { vertex: '', fragment: '', compute: '' };
		this.uniforms = { vertex: [], fragment: [], compute: [], index: 0 };
		this.structs = { vertex: [], fragment: [], compute: [], index: 0 };
		this.bindings = { vertex: {}, fragment: {}, compute: {} };
		this.bindingsIndexes = {};
		this.bindGroups = null;
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
			material: this.material
		};

		this.cache = new NodeCache();
		this.globalCache = this.cache;

		this.flowsData = new WeakMap();

		this.shaderStage = null;
		this.buildStage = null;

		this.useComparisonMethod = false;

	}

	getBindGroupsCache() {

		let bindGroupsCache = rendererCache.get( this.renderer );

		if ( bindGroupsCache === undefined ) {

			bindGroupsCache = new ChainMap();

			rendererCache.set( this.renderer, bindGroupsCache );

		}

		return bindGroupsCache;

	}

	createRenderTarget( width, height, options ) {

		return new RenderTarget( width, height, options );

	}

	createCubeRenderTarget( size, options ) {

		return new CubeRenderTarget( size, options );

	}

	createPMREMGenerator() {

		// TODO: Move Materials.js to outside of the Nodes.js in order to remove this function and improve tree-shaking support

		return new PMREMGenerator( this.renderer );

	}

	includes( node ) {

		return this.nodes.includes( node );

	}

	_getBindGroup( groupName, bindings ) {

		const bindGroupsCache = this.getBindGroupsCache();

		//

		const bindingsArray = [];

		let sharedGroup = true;

		for ( const binding of bindings ) {

			bindingsArray.push( binding );

			sharedGroup = sharedGroup && binding.groupNode.shared !== true;

		}

		//

		let bindGroup;

		if ( sharedGroup ) {

			bindGroup = bindGroupsCache.get( bindingsArray );

			if ( bindGroup === undefined ) {

				bindGroup = new BindGroup( groupName, bindingsArray, this.bindingsIndexes[ groupName ].group, bindingsArray );

				bindGroupsCache.set( bindingsArray, bindGroup );

			}

		} else {

			bindGroup = new BindGroup( groupName, bindingsArray, this.bindingsIndexes[ groupName ].group, bindingsArray );

		}

		return bindGroup;

	}

	getBindGroupArray( groupName, shaderStage ) {

		const bindings = this.bindings[ shaderStage ];

		let bindGroup = bindings[ groupName ];

		if ( bindGroup === undefined ) {

			if ( this.bindingsIndexes[ groupName ] === undefined ) {

				this.bindingsIndexes[ groupName ] = { binding: 0, group: Object.keys( this.bindingsIndexes ).length };

			}

			bindings[ groupName ] = bindGroup = [];

		}

		return bindGroup;

	}

	getBindings() {

		let bindingsGroups = this.bindGroups;

		if ( bindingsGroups === null ) {

			const groups = {};
			const bindings = this.bindings;

			for ( const shaderStage of shaderStages ) {

				for ( const groupName in bindings[ shaderStage ] ) {

					const uniforms = bindings[ shaderStage ][ groupName ];

					const groupUniforms = groups[ groupName ] || ( groups[ groupName ] = [] );
					groupUniforms.push( ...uniforms );

				}

			}

			bindingsGroups = [];

			for ( const groupName in groups ) {

				const group = groups[ groupName ];

				const bindingsGroup = this._getBindGroup( groupName, group );

				bindingsGroups.push( bindingsGroup );

			}

			this.bindGroups = bindingsGroups;

		}

		return bindingsGroups;

	}

	sortBindingGroups() {

		const bindingsGroups = this.getBindings();

		bindingsGroups.sort( ( a, b ) => ( a.bindings[ 0 ].groupNode.order - b.bindings[ 0 ].groupNode.order ) );

		for ( let i = 0; i < bindingsGroups.length; i ++ ) {

			const bindingGroup = bindingsGroups[ i ];
			this.bindingsIndexes[ bindingGroup.name ].group = i;

			bindingGroup.index = i;

		}

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

	addSequentialNode( node ) {

		if ( this.sequentialNodes.includes( node ) === false ) {

			this.sequentialNodes.push( node );

		}

	}

	buildUpdateNodes() {

		for ( const node of this.nodes ) {

			const updateType = node.getUpdateType();

			if ( updateType !== NodeUpdateType.NONE ) {

				this.updateNodes.push( node.getSelf() );

			}

		}

		for ( const node of this.sequentialNodes ) {

			const updateBeforeType = node.getUpdateBeforeType();
			const updateAfterType = node.getUpdateAfterType();

			if ( updateBeforeType !== NodeUpdateType.NONE ) {

				this.updateBeforeNodes.push( node.getSelf() );

			}

			if ( updateAfterType !== NodeUpdateType.NONE ) {

				this.updateAfterNodes.push( node.getSelf() );

			}

		}

	}

	get currentNode() {

		return this.chaining[ this.chaining.length - 1 ];

	}

	isFilteredTexture( texture ) {

		return ( texture.magFilter === LinearFilter || texture.magFilter === LinearMipmapNearestFilter || texture.magFilter === NearestMipmapLinearFilter || texture.magFilter === LinearMipmapLinearFilter ||
			texture.minFilter === LinearFilter || texture.minFilter === LinearMipmapNearestFilter || texture.minFilter === NearestMipmapLinearFilter || texture.minFilter === LinearMipmapLinearFilter );

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

	getSharedContext() {

		({ ...this.context });

		return this.context;

	}

	setCache( cache ) {

		this.cache = cache;

	}

	getCache() {

		return this.cache;

	}

	getCacheFromNode( node, parent = true ) {

		const data = this.getDataFromNode( node );
		if ( data.cache === undefined ) data.cache = new NodeCache( parent ? this.getCache() : null );

		return data.cache;

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

	getDrawIndex() {

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

	increaseUsage( node ) {

		const nodeData = this.getDataFromNode( node );
		nodeData.usageCount = nodeData.usageCount === undefined ? 1 : nodeData.usageCount + 1;

		return nodeData.usageCount;

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

		return type === 'void' || type === 'property' || type === 'sampler' || type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'depthTexture' || type === 'texture3D';

	}

	needsToWorkingColorSpace( /*texture*/ ) {

		return false;

	}

	getComponentTypeFromTexture( texture ) {

		const type = texture.type;

		if ( texture.isDataTexture ) {

			if ( type === IntType ) return 'int';
			if ( type === UnsignedIntType ) return 'uint';

		}

		return 'float';

	}

	getElementType( type ) {

		if ( type === 'mat2' ) return 'vec2';
		if ( type === 'mat3' ) return 'vec3';
		if ( type === 'mat4' ) return 'vec4';

		return this.getComponentType( type );

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
		if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) return 'vec4';

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

		let nodeData = cache.getData( node );

		if ( nodeData === undefined ) {

			nodeData = {};

			cache.setData( node, nodeData );

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

	addFlowCodeHierarchy( node, nodeBlock ) {

		const { flowCodes, flowCodeBlock } = this.getDataFromNode( node );

		let needsFlowCode = true;
		let nodeBlockHierarchy = nodeBlock;

		while ( nodeBlockHierarchy ) {

			if ( flowCodeBlock.get( nodeBlockHierarchy ) === true ) {

				needsFlowCode = false;
				break;

			}

			nodeBlockHierarchy = this.getDataFromNode( nodeBlockHierarchy ).parentNodeBlock;

		}

		if ( needsFlowCode ) {

			for ( const flowCode of flowCodes ) {

				this.addLineFlowCode( flowCode );

			}

		}

	}

	addLineFlowCodeBlock( node, code, nodeBlock ) {

		const nodeData = this.getDataFromNode( node );
		const flowCodes = nodeData.flowCodes || ( nodeData.flowCodes = [] );
		const codeBlock = nodeData.flowCodeBlock || ( nodeData.flowCodeBlock = new WeakMap() );

		flowCodes.push( code );
		codeBlock.set( nodeBlock, true );

	}

	addLineFlowCode( code, node = null ) {

		if ( code === '' ) return this;

		if ( node !== null && this.context.nodeBlock ) {

			this.addLineFlowCodeBlock( node, code, this.context.nodeBlock );

		}

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

		const inputs = {
			[ Symbol.iterator ]() {

				let index = 0;
				const values = Object.values( this );
				return {
					next: () => ( {
						value: values[ index ],
						done: index ++ >= values.length
					} )
				};

			}
		};

		for ( const input of layout.inputs ) {

			inputs[ input.name ] = new ParameterNode( input.type, input.name );

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
		const previousCache = this.cache;
		const previousBuildStage = this.buildStage;
		const previousStack = this.stack;

		const flow = {
			code: ''
		};

		this.flow = flow;
		this.vars = {};
		this.cache = new NodeCache();
		this.stack = stack();

		for ( const buildStage of defaultBuildStages ) {

			this.setBuildStage( buildStage );

			flow.result = node.build( this, output );

		}

		flow.vars = this.getVars( this.shaderStage );

		this.flow = previousFlow;
		this.vars = previousVars;
		this.cache = previousCache;
		this.stack = previousStack;

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

	build() {

		const { object, material, renderer } = this;

		if ( material !== null ) {

			let nodeMaterial = renderer.library.fromMaterial( material );

			if ( nodeMaterial === null ) {

				console.error( `NodeMaterial: Material "${ material.type }" is not compatible.` );

				nodeMaterial = new NodeMaterial();

			}

			nodeMaterial.build( this );

		} else {

			this.addFlow( 'compute', object );

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

		if ( type === 'float' || type === 'int' || type === 'uint' ) return new NumberNodeUniform( uniformNode );
		if ( type === 'vec2' || type === 'ivec2' || type === 'uvec2' ) return new Vector2NodeUniform( uniformNode );
		if ( type === 'vec3' || type === 'ivec3' || type === 'uvec3' ) return new Vector3NodeUniform( uniformNode );
		if ( type === 'vec4' || type === 'ivec4' || type === 'uvec4' ) return new Vector4NodeUniform( uniformNode );
		if ( type === 'color' ) return new ColorNodeUniform( uniformNode );
		if ( type === 'mat3' ) return new Matrix3NodeUniform( uniformNode );
		if ( type === 'mat4' ) return new Matrix4NodeUniform( uniformNode );

		throw new Error( `Uniform "${type}" not declared.` );

	}

	createNodeMaterial( type = 'NodeMaterial' ) { // @deprecated, r168

		throw new Error( `THREE.NodeBuilder: createNodeMaterial() was deprecated. Use new ${ type }() instead.` );

	}

	format( snippet, fromType, toType ) {

		fromType = this.getVectorType( fromType );
		toType = this.getVectorType( toType );

		if ( fromType === toType || toType === null || this.isReference( toType ) ) {

			return snippet;

		}

		const fromTypeLength = this.getTypeLength( fromType );
		const toTypeLength = this.getTypeLength( toType );

		if ( fromTypeLength === 16 && toTypeLength === 9 ) {

			return `${ this.getType( toType ) }(${ snippet }[0].xyz, ${ snippet }[1].xyz, ${ snippet }[2].xyz)`;

		}

		if ( fromTypeLength === 9 && toTypeLength === 4 ) {

			return `${ this.getType( toType ) }(${ snippet }[0].xy, ${ snippet }[1].xy)`;

		}


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

		if ( fromTypeLength === 1 && toTypeLength > 1 && fromType !== this.getComponentType( toType ) ) { // fromType is float-like

			// convert a number value to vector type, e.g:
			// vec3( 1u ) -> vec3( float( 1u ) )

			snippet = `${ this.getType( this.getComponentType( toType ) ) }( ${ snippet } )`;

		}

		return `${ this.getType( toType ) }( ${ snippet } )`; // fromType is float-like

	}

	getSignature() {

		return `// Three.js r${ REVISION } - Node System\n`;

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
		this.updateAfterMap = new WeakMap();

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
		const reference = node.updateReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateBeforeMap, reference );

			if ( frameMap.get( reference ) !== this.frameId ) {

				if ( node.updateBefore( this ) !== false ) {

					frameMap.set( reference, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateBeforeMap, reference );

			if ( renderMap.get( reference ) !== this.renderId ) {

				if ( node.updateBefore( this ) !== false ) {

					renderMap.set( reference, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.updateBefore( this );

		}

	}

	updateAfterNode( node ) {

		const updateType = node.getUpdateAfterType();
		const reference = node.updateReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateAfterMap, reference );

			if ( frameMap.get( reference ) !== this.frameId ) {

				if ( node.updateAfter( this ) !== false ) {

					frameMap.set( reference, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateAfterMap, reference );

			if ( renderMap.get( reference ) !== this.renderId ) {

				if ( node.updateAfter( this ) !== false ) {

					renderMap.set( reference, this.renderId );

				}

			}

		} else if ( updateType === NodeUpdateType.OBJECT ) {

			node.updateAfter( this );

		}

	}

	updateNode( node ) {

		const updateType = node.getUpdateType();
		const reference = node.updateReference( this );

		if ( updateType === NodeUpdateType.FRAME ) {

			const { frameMap } = this._getMaps( this.updateMap, reference );

			if ( frameMap.get( reference ) !== this.frameId ) {

				if ( node.update( this ) !== false ) {

					frameMap.set( reference, this.frameId );

				}

			}

		} else if ( updateType === NodeUpdateType.RENDER ) {

			const { renderMap } = this._getMaps( this.updateMap, reference );

			if ( renderMap.get( reference ) !== this.renderId ) {

				if ( node.update( this ) !== false ) {

					renderMap.set( reference, this.renderId );

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

class DirectionalLightNode extends AnalyticLightNode {

	static get type() {

		return 'DirectionalLightNode';

	}

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

const _matrix41 = /*@__PURE__*/ new Matrix4();
const _matrix42 = /*@__PURE__*/ new Matrix4();

let ltcLib = null;

class RectAreaLightNode extends AnalyticLightNode {

	static get type() {

		return 'RectAreaLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.halfHeight = uniform( new Vector3() ).setGroup( renderGroup );
		this.halfWidth = uniform( new Vector3() ).setGroup( renderGroup );

		this.updateType = NodeUpdateType.RENDER;

	}

	update( frame ) {

		super.update( frame );

		const { light } = this;

		const viewMatrix = frame.camera.matrixWorldInverse;

		_matrix42.identity();
		_matrix41.copy( light.matrixWorld );
		_matrix41.premultiply( viewMatrix );
		_matrix42.extractRotation( _matrix41 );

		this.halfWidth.value.set( light.width * 0.5, 0.0, 0.0 );
		this.halfHeight.value.set( 0.0, light.height * 0.5, 0.0 );

		this.halfWidth.value.applyMatrix4( _matrix42 );
		this.halfHeight.value.applyMatrix4( _matrix42 );

	}

	setup( builder ) {

		super.setup( builder );

		let ltc_1, ltc_2;

		if ( builder.isAvailable( 'float32Filterable' ) ) {

			ltc_1 = texture( ltcLib.LTC_FLOAT_1 );
			ltc_2 = texture( ltcLib.LTC_FLOAT_2 );

		} else {

			ltc_1 = texture( ltcLib.LTC_HALF_1 );
			ltc_2 = texture( ltcLib.LTC_HALF_2 );

		}

		const { colorNode, light } = this;
		const lightingModel = builder.context.lightingModel;

		const lightPosition = lightViewPosition( light );
		const reflectedLight = builder.context.reflectedLight;

		lightingModel.directRectArea( {
			lightColor: colorNode,
			lightPosition,
			halfWidth: this.halfWidth,
			halfHeight: this.halfHeight,
			reflectedLight,
			ltc_1,
			ltc_2
		}, builder.stack, builder );

	}

	static setLTC( ltc ) {

		ltcLib = ltc;

	}

}

class SpotLightNode extends AnalyticLightNode {

	static get type() {

		return 'SpotLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.coneCosNode = uniform( 0 ).setGroup( renderGroup );
		this.penumbraCosNode = uniform( 0 ).setGroup( renderGroup );

		this.cutoffDistanceNode = uniform( 0 ).setGroup( renderGroup );
		this.decayExponentNode = uniform( 0 ).setGroup( renderGroup );

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

		const lVector = lightViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

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

class IESSpotLightNode extends SpotLightNode {

	static get type() {

		return 'IESSpotLightNode';

	}

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

class AmbientLightNode extends AnalyticLightNode {

	static get type() {

		return 'AmbientLightNode';

	}

	constructor( light = null ) {

		super( light );

	}

	setup( { context } ) {

		context.irradiance.addAssign( this.colorNode );

	}

}

class HemisphereLightNode extends AnalyticLightNode {

	static get type() {

		return 'HemisphereLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.lightPositionNode = lightPosition( light );
		this.lightDirectionNode = this.lightPositionNode.normalize();

		this.groundColorNode = uniform( new Color() ).setGroup( renderGroup );

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

class LightProbeNode extends AnalyticLightNode {

	static get type() {

		return 'LightProbeNode';

	}

	constructor( light = null ) {

		super( light );

		const array = [];

		for ( let i = 0; i < 9; i ++ ) array.push( new Vector3() );

		this.lightProbe = uniformArray( array );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		//

		for ( let i = 0; i < 9; i ++ ) {

			this.lightProbe.array[ i ].copy( light.sh.coefficients[ i ] ).multiplyScalar( light.intensity );

		}

	}

	setup( builder ) {

		const irradiance = getShIrradianceAt( normalWorld, this.lightProbe );

		builder.context.irradiance.addAssign( irradiance );

	}

}

class NodeParser {

	parseFunction( /*source*/ ) {

		console.warn( 'Abstract function.' );

	}

}

class NodeFunction {

	constructor( type, inputs, name = '', precision = '' ) {

		this.type = type;
		this.inputs = inputs;
		this.name = name;
		this.precision = precision;

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

		const precision = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';

		const headerCode = pragmaMainIndex !== - 1 ? source.slice( 0, pragmaMainIndex ) : '';

		return {
			type,
			inputs,
			name,
			precision,
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

		const { type, inputs, name, precision, inputsCode, blockCode, headerCode } = parse$1( source );

		super( type, inputs, name, precision );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;
		this.headerCode = headerCode;

	}

	getCode( name = this.name ) {

		let code;

		const blockCode = this.blockCode;

		if ( blockCode !== '' ) {

			const { type, inputsCode, headerCode, precision } = this;

			let declarationCode = `${ type } ${ name } ( ${ inputsCode.trim() } )`;

			if ( precision !== '' ) {

				declarationCode = `${ precision } ${ declarationCode }`;

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

const outputNodeMap = new WeakMap();

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

				const nodeBuilder = this.backend.createNodeBuilder( renderObject.object, this.renderer );
				nodeBuilder.scene = renderObject.scene;
				nodeBuilder.material = renderObject.material;
				nodeBuilder.camera = renderObject.camera;
				nodeBuilder.context.material = renderObject.material;
				nodeBuilder.lightsNode = renderObject.lightsNode;
				nodeBuilder.environmentNode = this.getEnvironmentNode( renderObject.scene );
				nodeBuilder.fogNode = this.getFogNode( renderObject.scene );
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
			nodeBuilder.updateAfterNodes,
			nodeBuilder.monitor,
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

	getCacheKey( scene, lightsNode ) {

		const chain = [ scene, lightsNode ];
		const callId = this.renderer.info.calls;

		let cacheKeyData = this.callHashCache.get( chain );

		if ( cacheKeyData === undefined || cacheKeyData.callId !== callId ) {

			const environmentNode = this.getEnvironmentNode( scene );
			const fogNode = this.getFogNode( scene );

			const values = [];

			if ( lightsNode ) values.push( lightsNode.getCacheKey( true ) );
			if ( environmentNode ) values.push( environmentNode.getCacheKey() );
			if ( fogNode ) values.push( fogNode.getCacheKey() );

			values.push( this.renderer.shadowMap.enabled ? 1 : 0 );

			cacheKeyData = {
				callId,
				cacheKey: hashArray( values )
			};

			this.callHashCache.set( chain, cacheKeyData );

		}

		return cacheKeyData.cacheKey;

	}

	updateScene( scene ) {

		this.updateEnvironment( scene );
		this.updateFog( scene );
		this.updateBackground( scene );

	}

	get isToneMappingState() {

		return this.renderer.getRenderTarget() ? false : true;

	}

	updateBackground( scene ) {

		const sceneData = this.get( scene );
		const background = scene.background;

		if ( background ) {

			const forceUpdate = ( scene.backgroundBlurriness === 0 && sceneData.backgroundBlurriness > 0 ) || ( scene.backgroundBlurriness > 0 && sceneData.backgroundBlurriness === 0 );

			if ( sceneData.background !== background || forceUpdate ) {

				let backgroundNode = null;

				if ( background.isCubeTexture === true || ( background.mapping === EquirectangularReflectionMapping || background.mapping === EquirectangularRefractionMapping || background.mapping === CubeUVReflectionMapping ) ) {

					if ( scene.backgroundBlurriness > 0 || background.mapping === CubeUVReflectionMapping ) {

						backgroundNode = pmremTexture( background );

					} else {

						let envMap;

						if ( background.isCubeTexture === true ) {

							envMap = cubeTexture( background );

						} else {

							envMap = texture( background );

						}

						backgroundNode = cubeMapNode( envMap );

					}

				} else if ( background.isTexture === true ) {

					backgroundNode = texture( background, screenUV.flipY() ).setUpdateMatrix( true );

				} else if ( background.isColor !== true ) {

					console.error( 'WebGPUNodes: Unsupported background configuration.', background );

				}

				sceneData.backgroundNode = backgroundNode;
				sceneData.background = background;
				sceneData.backgroundBlurriness = scene.backgroundBlurriness;

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

					const color = reference( 'color', 'color', fog ).setGroup( renderGroup );
					const density = reference( 'density', 'float', fog ).setGroup( renderGroup );

					fogNode = densityFog( color, density );

				} else if ( fog.isFog ) {

					const color = reference( 'color', 'color', fog ).setGroup( renderGroup );
					const near = reference( 'near', 'float', fog ).setGroup( renderGroup );
					const far = reference( 'far', 'float', fog ).setGroup( renderGroup );

					fogNode = rangeFog( color, near, far );

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

	getOutputCacheKey() {

		const renderer = this.renderer;

		return renderer.toneMapping + ',' + renderer.currentColorSpace;

	}

	hasOutputChange( outputTarget ) {

		const cacheKey = outputNodeMap.get( outputTarget );

		return cacheKey !== this.getOutputCacheKey();

	}

	getOutputNode( outputTexture ) {

		const renderer = this.renderer;
		const cacheKey = this.getOutputCacheKey();

		const output = texture( outputTexture, screenUV ).renderOutput( renderer.toneMapping, renderer.currentColorSpace );

		outputNodeMap.set( outputTexture, cacheKey );

		return output;

	}

	updateBefore( renderObject ) {

		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateBeforeNodes ) {

			// update frame state for each node

			this.getNodeFrameForRender( renderObject ).updateBeforeNode( node );

		}

	}

	updateAfter( renderObject ) {

		const nodeBuilder = renderObject.getNodeBuilderState();

		for ( const node of nodeBuilder.updateAfterNodes ) {

			// update frame state for each node

			this.getNodeFrameForRender( renderObject ).updateAfterNode( node );

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

	needsRefresh( renderObject ) {

		const nodeFrame = this.getNodeFrameForRender( renderObject );
		const monitor = renderObject.getMonitor();

		return monitor.needsRefresh( renderObject, nodeFrame );

	}

	dispose() {

		super.dispose();

		this.nodeFrame = new NodeFrame();
		this.nodeBuilderCache = new Map();

	}

}

const _plane = /*@__PURE__*/ new Plane();

class ClippingContext {

	constructor( parentContext = null ) {

		this.version = 0;

		this.clipIntersection = null;
		this.cacheKey = '';


		if ( parentContext === null ) {

			this.intersectionPlanes = [];
			this.unionPlanes = [];

			this.viewNormalMatrix = new Matrix3();
			this.clippingGroupContexts = new WeakMap();

			this.shadowPass = false;

		} else {

			this.viewNormalMatrix = parentContext.viewNormalMatrix;
			this.clippingGroupContexts = parentContext.clippingGroupContexts;

			this.shadowPass = parentContext.shadowPass;

			this.viewMatrix = parentContext.viewMatrix;

		}

		this.parentVersion = null;

	}

	projectPlanes( source, destination, offset ) {

		const l = source.length;

		for ( let i = 0; i < l; i ++ ) {

			_plane.copy( source[ i ] ).applyMatrix4( this.viewMatrix, this.viewNormalMatrix );

			const v = destination[ offset + i ];
			const normal = _plane.normal;

			v.x = - normal.x;
			v.y = - normal.y;
			v.z = - normal.z;
			v.w = _plane.constant;

		}

	}

	updateGlobal( scene, camera ) {

		this.shadowPass = ( scene.overrideMaterial !== null && scene.overrideMaterial.isShadowNodeMaterial );
		this.viewMatrix = camera.matrixWorldInverse;

		this.viewNormalMatrix.getNormalMatrix( this.viewMatrix );

	}

	update( parentContext, clippingGroup ) {

		let update = false;

		if ( parentContext.version !== this.parentVersion ) {

			this.intersectionPlanes = Array.from( parentContext.intersectionPlanes );
			this.unionPlanes = Array.from( parentContext.unionPlanes );
			this.parentVersion = parentContext.version;

		}

		if ( this.clipIntersection !== clippingGroup.clipIntersection ) {

			this.clipIntersection = clippingGroup.clipIntersection;

			if ( this.clipIntersection ) {

				this.unionPlanes.length = parentContext.unionPlanes.length;

			} else {

				this.intersectionPlanes.length = parentContext.intersectionPlanes.length;

			}

		}

		const srcClippingPlanes = clippingGroup.clippingPlanes;
		const l = srcClippingPlanes.length;

		let dstClippingPlanes;
		let offset;

		if ( this.clipIntersection ) {

			dstClippingPlanes = this.intersectionPlanes;
			offset = parentContext.intersectionPlanes.length;

		} else {

			dstClippingPlanes = this.unionPlanes;
			offset = parentContext.unionPlanes.length;

		}

		if ( dstClippingPlanes.length !== offset + l ) {

			dstClippingPlanes.length = offset + l;

			for ( let i = 0; i < l; i ++ ) {

				dstClippingPlanes[ offset + i ] = new Vector4();

			}

			update = true;

		}

		this.projectPlanes( srcClippingPlanes, dstClippingPlanes, offset );

		if ( update ) {

			this.version ++;
			this.cacheKey = `${ this.intersectionPlanes.length }:${ this.unionPlanes.length }`;

		}

	}

	getGroupContext( clippingGroup ) {

		if ( this.shadowPass && ! clippingGroup.clipShadows ) return this;

		let context = this.clippingGroupContexts.get( clippingGroup );

		if ( context === undefined ) {

			context = new ClippingContext( this );
			this.clippingGroupContexts.set( clippingGroup, context );

		}

		context.update( this, clippingGroup );

		return context;

	}

	get unionClippingCount() {

		return this.unionPlanes.length;

	}

}

class RenderBundle {

	constructor( scene, camera ) {

		this.scene = scene;
		this.camera = camera;

	}

	clone() {

		return Object.assign( new this.constructor(), this );

	}

}

class RenderBundles {

	constructor() {

		this.lists = new ChainMap();

	}

	get( scene, camera ) {

		const lists = this.lists;
		const keys = [ scene, camera ];

		let list = lists.get( keys );

		if ( list === undefined ) {

			list = new RenderBundle( scene, camera );
			lists.set( keys, list );

		}

		return list;

	}

	dispose() {

		this.lists = new ChainMap();

	}

}

class NodeLibrary {

	constructor() {

		this.lightNodes = new WeakMap();
		this.materialNodes = new Map();
		this.toneMappingNodes = new Map();

	}

	fromMaterial( material ) {

		if ( material.isNodeMaterial ) return material;

		let nodeMaterial = null;

		const nodeMaterialClass = this.getMaterialNodeClass( material.type );

		if ( nodeMaterialClass !== null ) {

			nodeMaterial = new nodeMaterialClass();

			for ( const key in material ) {

				nodeMaterial[ key ] = material[ key ];

			}

		}

		return nodeMaterial;

	}

	addToneMapping( toneMappingNode, toneMapping ) {

		this.addType( toneMappingNode, toneMapping, this.toneMappingNodes );

	}

	getToneMappingFunction( toneMapping ) {

		return this.toneMappingNodes.get( toneMapping ) || null;

	}

	getMaterialNodeClass( materialType ) {

		return this.materialNodes.get( materialType ) || null;

	}

	addMaterial( materialNodeClass, materialClassType ) {

		this.addType( materialNodeClass, materialClassType, this.materialNodes );

	}

	getLightNodeClass( light ) {

		return this.lightNodes.get( light ) || null;

	}

	addLight( lightNodeClass, lightClass ) {

		this.addClass( lightNodeClass, lightClass, this.lightNodes );

	}

	addType( nodeClass, type, library ) {

		if ( library.has( type ) ) {

			console.warn( `Redefinition of node ${ type }` );
			return;

		}

		if ( typeof nodeClass !== 'function' ) throw new Error( `Node class ${ nodeClass.name } is not a class.` );
		if ( typeof type === 'function' || typeof type === 'object' ) throw new Error( `Base class ${ type } is not a class.` );

		library.set( type, nodeClass );

	}

	addClass( nodeClass, baseClass, library ) {

		if ( library.has( baseClass ) ) {

			console.warn( `Redefinition of node ${ baseClass.name }` );
			return;

		}

		if ( typeof nodeClass !== 'function' ) throw new Error( `Node class ${ nodeClass.name } is not a class.` );
		if ( typeof baseClass !== 'function' ) throw new Error( `Base class ${ baseClass.name } is not a class.` );

		library.set( baseClass, nodeClass );

	}

}

const _defaultLights = /*@__PURE__*/ new LightsNode();

class Lighting extends ChainMap {

	constructor() {

		super();

	}

	createNode( lights = [] ) {

		return new LightsNode().setLights( lights );

	}

	getNode( scene, camera ) {

		// ignore post-processing

		if ( scene.isQuadMesh ) return _defaultLights;

		// tiled lighting

		const keys = [ scene, camera ];

		let node = this.get( keys );

		if ( node === undefined ) {

			node = this.createNode();
			this.set( keys, node );

		}

		return node;

	}

}

const _scene = /*@__PURE__*/ new Scene();
const _drawingBufferSize = /*@__PURE__*/ new Vector2();
const _screen = /*@__PURE__*/ new Vector4();
const _frustum = /*@__PURE__*/ new Frustum();
const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _vector4 = /*@__PURE__*/ new Vector4();

class Renderer {

	constructor( backend, parameters = {} ) {

		this.isRenderer = true;

		//

		const {
			logarithmicDepthBuffer = false,
			alpha = true,
			depth = true,
			stencil = false,
			antialias = false,
			samples = 0,
			getFallback = null
		} = parameters;

		// public
		this.domElement = backend.getDomElement();

		this.backend = backend;

		this.samples = samples || ( antialias === true ) ? 4 : 0;

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

		this.depth = depth;
		this.stencil = stencil;

		this.info = new Info();

		this.nodes = {
			modelViewMatrix: null,
			modelNormalViewMatrix: null
		};

		this.library = new NodeLibrary();
		this.lighting = new Lighting();

		// internals

		this._getFallback = getFallback;

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
		this._bundles = null;
		this._renderLists = null;
		this._renderContexts = null;
		this._textures = null;
		this._background = null;

		this._quad = new QuadMesh( new NodeMaterial() );
		this._quad.material.type = 'Renderer_output';

		this._currentRenderContext = null;

		this._opaqueSort = null;
		this._transparentSort = null;

		this._frameBufferTarget = null;

		const alphaClear = this.alpha === true ? 0 : 1;

		this._clearColor = new Color4( 0, 0, 0, alphaClear );
		this._clearDepth = 1;
		this._clearStencil = 0;

		this._renderTarget = null;
		this._activeCubeFace = 0;
		this._activeMipmapLevel = 0;

		this._mrt = null;

		this._renderObjectFunction = null;
		this._currentRenderObjectFunction = null;
		this._currentRenderBundle = null;

		this._handleObjectFunction = this._renderObjectDirect;

		this._isDeviceLost = false;
		this.onDeviceLost = this._onDeviceLost;

		this._initialized = false;
		this._initPromise = null;

		this._compilationPromises = null;

		this.transparent = true;
		this.opaque = true;

		this.shadowMap = {
			enabled: false,
			type: PCFShadowMap$1
		};

		this.xr = {
			enabled: false
		};

		this.debug = {
			checkShaderErrors: true,
			onShaderError: null,
			getShaderAsync: async ( scene, camera, object ) => {

				await this.compileAsync( scene, camera );

				const renderList = this._renderLists.get( scene, camera );
				const renderContext = this._renderContexts.get( scene, camera, this._renderTarget );

				const material = scene.overrideMaterial || object.material;

				const renderObject = this._objects.get( object, material, scene, camera, renderList.lightsNode, renderContext, renderContext.clippingContext );

				const { fragmentShader, vertexShader } = renderObject.getNodeBuilderState();

				return { fragmentShader, vertexShader };

			}
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

			let backend = this.backend;

			try {

				await backend.init( this );

			} catch ( error ) {

				if ( this._getFallback !== null ) {

					// try the fallback

					try {

						this.backend = backend = this._getFallback( error );
						await backend.init( this );

					} catch ( error ) {

						reject( error );
						return;

					}

				} else {

					reject( error );
					return;

				}

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
			this._renderLists = new RenderLists( this.lighting );
			this._bundles = new RenderBundles();
			this._renderContexts = new RenderContexts();

			//

			this._animation.start();
			this._initialized = true;

			resolve();

		} );

		return this._initPromise;

	}

	get coordinateSystem() {

		return this.backend.coordinateSystem;

	}

	async compileAsync( scene, camera, targetScene = null ) {

		if ( this._isDeviceLost === true ) return;

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
		renderContext.clippingContext.updateGlobal( sceneRef, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList, renderContext.clippingContext );

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
		const transparentDoublePassObjects = renderList.transparentDoublePass;
		const lightsNode = renderList.lightsNode;

		if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( this.transparent === true && transparentObjects.length > 0 ) this._renderTransparents( transparentObjects, transparentDoublePassObjects, camera, sceneRef, lightsNode );

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

		const renderContext = this._renderScene( scene, camera );

		await this.backend.resolveTimestampAsync( renderContext, 'render' );

	}

	async waitForGPU() {

		await this.backend.waitForGPU();

	}

	setMRT( mrt ) {

		this._mrt = mrt;

		return this;

	}

	getMRT() {

		return this._mrt;

	}

	_onDeviceLost( info ) {

		let errorMessage = `THREE.WebGPURenderer: ${info.api} Device Lost:\n\nMessage: ${info.message}`;

		if ( info.reason ) {

			errorMessage += `\nReason: ${info.reason}`;

		}

		console.error( errorMessage );

		this._isDeviceLost = true;

	}


	_renderBundle( bundle, sceneRef, lightsNode ) {

		const { bundleGroup, camera, renderList } = bundle;

		const renderContext = this._currentRenderContext;

		//

		const renderBundle = this._bundles.get( bundleGroup, camera );
		const renderBundleData = this.backend.get( renderBundle );

		if ( renderBundleData.renderContexts === undefined ) renderBundleData.renderContexts = new Set();

		//

		const needsUpdate = bundleGroup.version !== renderBundleData.version;
		const renderBundleNeedsUpdate = renderBundleData.renderContexts.has( renderContext ) === false || needsUpdate;

		renderBundleData.renderContexts.add( renderContext );

		if ( renderBundleNeedsUpdate ) {

			this.backend.beginBundle( renderContext );

			if ( renderBundleData.renderObjects === undefined || needsUpdate ) {

				renderBundleData.renderObjects = [];

			}

			this._currentRenderBundle = renderBundle;

			const opaqueObjects = renderList.opaque;

			if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );

			this._currentRenderBundle = null;

			//

			this.backend.finishBundle( renderContext, renderBundle );

			renderBundleData.version = bundleGroup.version;

		} else {

			const { renderObjects } = renderBundleData;

			for ( let i = 0, l = renderObjects.length; i < l; i ++ ) {

				const renderObject = renderObjects[ i ];

				if ( this._nodes.needsRefresh( renderObject ) ) {

					this._nodes.updateBefore( renderObject );

					this._nodes.updateForRender( renderObject );
					this._bindings.updateForRender( renderObject );

					this._nodes.updateAfter( renderObject );

				}

			}

		}

		this.backend.addBundle( renderContext, renderBundle );

	}

	render( scene, camera ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .render() called before the backend is initialized. Try using .renderAsync() instead.' );

			return this.renderAsync( scene, camera );

		}

		this._renderScene( scene, camera );

	}

	_getFrameBufferTarget() {

		const { currentToneMapping, currentColorSpace } = this;

		const useToneMapping = currentToneMapping !== NoToneMapping;
		const useColorSpace = currentColorSpace !== LinearSRGBColorSpace;

		if ( useToneMapping === false && useColorSpace === false ) return null;

		const { width, height } = this.getDrawingBufferSize( _drawingBufferSize );
		const { depth, stencil } = this;

		let frameBufferTarget = this._frameBufferTarget;

		if ( frameBufferTarget === null ) {

			frameBufferTarget = new RenderTarget( width, height, {
				depthBuffer: depth,
				stencilBuffer: stencil,
				type: HalfFloatType, // FloatType
				format: RGBAFormat,
				colorSpace: LinearSRGBColorSpace,
				generateMipmaps: false,
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				samples: this.samples
			} );

			frameBufferTarget.isPostProcessingRenderTarget = true;

			this._frameBufferTarget = frameBufferTarget;

		}

		frameBufferTarget.depthBuffer = depth;
		frameBufferTarget.stencilBuffer = stencil;
		frameBufferTarget.setSize( width, height );
		frameBufferTarget.viewport.copy( this._viewport );
		frameBufferTarget.scissor.copy( this._scissor );
		frameBufferTarget.viewport.multiplyScalar( this._pixelRatio );
		frameBufferTarget.scissor.multiplyScalar( this._pixelRatio );
		frameBufferTarget.scissorTest = this._scissorTest;

		return frameBufferTarget;

	}

	_renderScene( scene, camera, useFrameBufferTarget = true ) {

		if ( this._isDeviceLost === true ) return;

		const frameBufferTarget = useFrameBufferTarget ? this._getFrameBufferTarget() : null;

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderContext = this._currentRenderContext;
		const previousRenderObjectFunction = this._currentRenderObjectFunction;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		const outputRenderTarget = this._renderTarget;

		const activeCubeFace = this._activeCubeFace;
		const activeMipmapLevel = this._activeMipmapLevel;

		//

		let renderTarget;

		if ( frameBufferTarget !== null ) {

			renderTarget = frameBufferTarget;

			this.setRenderTarget( renderTarget );

		} else {

			renderTarget = outputRenderTarget;

		}

		//

		const renderContext = this._renderContexts.get( scene, camera, renderTarget );

		this._currentRenderContext = renderContext;
		this._currentRenderObjectFunction = this._renderObjectFunction || this.renderObject;

		//

		this.info.calls ++;
		this.info.render.calls ++;
		this.info.render.frameCalls ++;

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
		renderContext.clippingContext.updateGlobal( sceneRef, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix, coordinateSystem );

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList, renderContext.clippingContext );

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

		const {
			bundles,
			lightsNode,
			transparentDoublePass: transparentDoublePassObjects,
			transparent: transparentObjects,
			opaque: opaqueObjects
		} = renderList;

		if ( bundles.length > 0 ) this._renderBundles( bundles, sceneRef, lightsNode );
		if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( this.transparent === true && transparentObjects.length > 0 ) this._renderTransparents( transparentObjects, transparentDoublePassObjects, camera, sceneRef, lightsNode );

		// finish render pass

		this.backend.finishRender( renderContext );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;

		//

		if ( frameBufferTarget !== null ) {

			this.setRenderTarget( outputRenderTarget, activeCubeFace, activeMipmapLevel );

			const quad = this._quad;

			if ( this._nodes.hasOutputChange( renderTarget.texture ) ) {

				quad.material.fragmentNode = this._nodes.getOutputNode( renderTarget.texture );
				quad.material.needsUpdate = true;

			}

			this._renderScene( quad, quad.camera, false );

		}

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

		if ( this._pixelRatio === value ) return;

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

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .clear() called before the backend is initialized. Try using .clearAsync() instead.' );

			return this.clearAsync( color, depth, stencil );

		}

		const renderTarget = this._renderTarget || this._getFrameBufferTarget();

		let renderTargetData = null;

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget );

			renderTargetData = this._textures.get( renderTarget );

		}

		this.backend.clear( color, depth, stencil, renderTargetData );

		if ( renderTarget !== null && this._renderTarget === null ) {

			// If a color space transform or tone mapping is required,
			// the clear operation clears the intermediate renderTarget texture, but does not update the screen canvas.

			const quad = this._quad;

			if ( this._nodes.hasOutputChange( renderTarget.texture ) ) {

				quad.material.fragmentNode = this._nodes.getOutputNode( renderTarget.texture );
				quad.material.needsUpdate = true;

			}

			this._renderScene( quad, quad.camera, false );

		}

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

	get currentToneMapping() {

		return this._renderTarget !== null ? NoToneMapping : this.toneMapping;

	}

	get currentColorSpace() {

		return this._renderTarget !== null ? LinearSRGBColorSpace : this.outputColorSpace;

	}

	dispose() {

		this.info.dispose();
		this.backend.dispose();

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

	compute( computeNodes ) {

		if ( this.isDeviceLost === true ) return;

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .compute() called before the backend is initialized. Try using .computeAsync() instead.' );

			return this.computeAsync( computeNodes );

		}

		//

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;

		//

		this.info.calls ++;
		this.info.compute.calls ++;
		this.info.compute.frameCalls ++;

		nodeFrame.renderId = this.info.calls;

		//

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

				const onInitFn = computeNode.onInitFunction;

				if ( onInitFn !== null ) {

					onInitFn.call( computeNode, { renderer: this } );

				}

			}

			nodes.updateForCompute( computeNode );
			bindings.updateForCompute( computeNode );

			const computeBindings = bindings.getForCompute( computeNode );
			const computePipeline = pipelines.getForCompute( computeNode, computeBindings );

			backend.compute( computeNodes, computeNode, computeBindings, computePipeline );

		}

		backend.finishCompute( computeNodes );

		//

		nodeFrame.renderId = previousRenderId;

	}

	async computeAsync( computeNodes ) {

		if ( this._initialized === false ) await this.init();

		this.compute( computeNodes );

		await this.backend.resolveTimestampAsync( computeNodes, 'compute' );

	}

	async hasFeatureAsync( name ) {

		if ( this._initialized === false ) await this.init();

		return this.backend.hasFeature( name );

	}

	hasFeature( name ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .hasFeature() called before the backend is initialized. Try using .hasFeatureAsync() instead.' );

			return false;

		}

		return this.backend.hasFeature( name );

	}

	copyFramebufferToTexture( framebufferTexture, rectangle = null ) {

		if ( rectangle !== null ) {

			if ( rectangle.isVector2 ) {

				rectangle = _vector4.set( rectangle.x, rectangle.y, framebufferTexture.image.width, framebufferTexture.image.height ).floor();

			} else if ( rectangle.isVector4 ) {

				rectangle = _vector4.copy( rectangle ).floor();

			} else {

				console.error( 'THREE.Renderer.copyFramebufferToTexture: Invalid rectangle.' );

				return;

			}

		} else {

			rectangle = _vector4.set( 0, 0, framebufferTexture.image.width, framebufferTexture.image.height );

		}

		//

		let renderContext = this._currentRenderContext;
		let renderTarget;

		if ( renderContext !== null ) {

			renderTarget = renderContext.renderTarget;

		} else {

			renderTarget = this._renderTarget || this._getFrameBufferTarget();

			if ( renderTarget !== null ) {

				this._textures.updateRenderTarget( renderTarget );

				renderContext = this._textures.get( renderTarget );

			}

		}

		//

		this._textures.updateTexture( framebufferTexture, { renderTarget } );

		this.backend.copyFramebufferToTexture( framebufferTexture, renderContext, rectangle );

	}

	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0 ) {

		this._textures.updateTexture( srcTexture );
		this._textures.updateTexture( dstTexture );

		this.backend.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level );

	}

	readRenderTargetPixelsAsync( renderTarget, x, y, width, height, index = 0, faceIndex = 0 ) {

		return this.backend.copyTextureToBuffer( renderTarget.textures[ index ], x, y, width, height, faceIndex );

	}

	_projectObject( object, camera, groupOrder, renderList, clippingContext ) {

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

				if ( object.isClippingGroup && object.enabled ) clippingContext = clippingContext.getGroupContext( object );

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				renderList.pushLight( object );

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || _frustum.intersectsSprite( object ) ) {

					if ( this.sortObjects === true ) {

						_vector4.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const { geometry, material } = object;

					if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector4.z, null, clippingContext );

					}

				}

			} else if ( object.isLineLoop ) {

				console.error( 'THREE.Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

					const { geometry, material } = object;

					if ( this.sortObjects === true ) {

						if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

						_vector4
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

								renderList.push( object, geometry, groupMaterial, groupOrder, _vector4.z, group, clippingContext );

							}

						}

					} else if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector4.z, null, clippingContext );

					}

				}

			}

		}

		if ( object.isBundleGroup === true && this.backend.beginBundle !== undefined ) {

			const baseRenderList = renderList;

			// replace render list
			renderList = this._renderLists.get( object, camera );

			renderList.begin();

			baseRenderList.pushBundle( {
				bundleGroup: object,
				camera,
				renderList,
			} );

			renderList.finish();

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this._projectObject( children[ i ], camera, groupOrder, renderList, clippingContext );

		}

	}

	_renderBundles( bundles, sceneRef, lightsNode ) {

		for ( const bundle of bundles ) {

			this._renderBundle( bundle, sceneRef, lightsNode );

		}

	}

	_renderTransparents( renderList, doublePassList, camera, scene, lightsNode ) {

		if ( doublePassList.length > 0 ) {

			// render back side

			for ( const { material } of doublePassList ) {

				material.side = BackSide;

			}

			this._renderObjects( doublePassList, camera, scene, lightsNode, 'backSide' );

			// render front side

			for ( const { material } of doublePassList ) {

				material.side = FrontSide;

			}

			this._renderObjects( renderList, camera, scene, lightsNode );

			// restore

			for ( const { material } of doublePassList ) {

				material.side = DoubleSide;

			}

		} else {

			this._renderObjects( renderList, camera, scene, lightsNode );

		}

	}

	_renderObjects( renderList, camera, scene, lightsNode, passId = null ) {

		// process renderable objects

		for ( let i = 0, il = renderList.length; i < il; i ++ ) {

			const renderItem = renderList[ i ];

			// @TODO: Add support for multiple materials per object. This will require to extract
			// the material from the renderItem object and pass it with its group data to renderObject().

			const { object, geometry, material, group, clippingContext } = renderItem;

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

						this._currentRenderObjectFunction( object, scene, camera2, geometry, material, group, lightsNode, clippingContext, passId );

					}

				}

			} else {

				this._currentRenderObjectFunction( object, scene, camera, geometry, material, group, lightsNode, clippingContext, passId );

			}

		}

	}

	renderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext = null, passId = null ) {

		let overridePositionNode;
		let overrideFragmentNode;
		let overrideDepthNode;

		//

		object.onBeforeRender( this, scene, camera, geometry, material, group );

		//

		if ( scene.overrideMaterial !== null ) {

			const overrideMaterial = scene.overrideMaterial;

			if ( material.positionNode && material.positionNode.isNode ) {

				overridePositionNode = overrideMaterial.positionNode;
				overrideMaterial.positionNode = material.positionNode;

			}

			if ( overrideMaterial.isShadowNodeMaterial ) {

				overrideMaterial.side = material.shadowSide === null ? material.side : material.shadowSide;

				if ( material.depthNode && material.depthNode.isNode ) {

					overrideDepthNode = overrideMaterial.depthNode;
					overrideMaterial.depthNode = material.depthNode;

				}


				if ( material.shadowNode && material.shadowNode.isNode ) {

					overrideFragmentNode = overrideMaterial.fragmentNode;
					overrideMaterial.fragmentNode = material.shadowNode;

				}

			}

			material = overrideMaterial;

		}

		//

		if ( material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false ) {

			material.side = BackSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, clippingContext, 'backSide' ); // create backSide pass id

			material.side = FrontSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, clippingContext, passId ); // use default pass id

			material.side = DoubleSide;

		} else {

			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, clippingContext, passId );

		}

		//

		if ( overridePositionNode !== undefined ) {

			scene.overrideMaterial.positionNode = overridePositionNode;

		}

		if ( overrideDepthNode !== undefined ) {

			scene.overrideMaterial.depthNode = overrideDepthNode;

		}

		if ( overrideFragmentNode !== undefined ) {

			scene.overrideMaterial.fragmentNode = overrideFragmentNode;

		}

		//

		object.onAfterRender( this, scene, camera, geometry, material, group );

	}

	_renderObjectDirect( object, material, scene, camera, lightsNode, group, clippingContext, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, clippingContext, passId );
		renderObject.drawRange = object.geometry.drawRange;
		renderObject.group = group;

		//

		const needsRefresh = this._nodes.needsRefresh( renderObject );

		if ( needsRefresh ) {

			this._nodes.updateBefore( renderObject );

			this._geometries.updateForRender( renderObject );

			this._nodes.updateForRender( renderObject );
			this._bindings.updateForRender( renderObject );

		}

		this._pipelines.updateForRender( renderObject );

		//

		if ( this._currentRenderBundle !== null ) {

			const renderBundleData = this.backend.get( this._currentRenderBundle );

			renderBundleData.renderObjects.push( renderObject );

			renderObject.bundle = this._currentRenderBundle.scene;

		}

		this.backend.draw( renderObject, this.info );

		if ( needsRefresh ) this._nodes.updateAfter( renderObject );

	}

	_createObjectPipeline( object, material, scene, camera, lightsNode, clippingContext, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, clippingContext, passId );

		//

		this._nodes.updateBefore( renderObject );

		this._geometries.updateForRender( renderObject );

		this._nodes.updateForRender( renderObject );
		this._bindings.updateForRender( renderObject );

		this._pipelines.getForRender( renderObject, this._compilationPromises );

		this._nodes.updateAfter( renderObject );

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

let _id$4 = 0;

class NodeUniformBuffer extends UniformBuffer {

	constructor( nodeUniform, groupNode ) {

		super( 'UniformBuffer_' + _id$4 ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.groupNode = groupNode;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

class UniformsGroup extends UniformBuffer {

	constructor( name ) {

		super( name );

		this.isUniformsGroup = true;

		this._values = null;

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

	get values() {

		if ( this._values === null ) {

			this._values = Array.from( this.buffer );

		}

		return this._values;

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

		if ( uniform.isNumberUniform ) return this.updateNumber( uniform );
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

		const a = this.values;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset ] !== v ) {

			const b = this.buffer;

			b[ offset ] = a[ offset ] = v;
			updated = true;

		}

		return updated;

	}

	updateVector2( uniform ) {

		let updated = false;

		const a = this.values;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y ) {

			const b = this.buffer;

			b[ offset + 0 ] = a[ offset + 0 ] = v.x;
			b[ offset + 1 ] = a[ offset + 1 ] = v.y;

			updated = true;

		}

		return updated;

	}

	updateVector3( uniform ) {

		let updated = false;

		const a = this.values;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z ) {

			const b = this.buffer;

			b[ offset + 0 ] = a[ offset + 0 ] = v.x;
			b[ offset + 1 ] = a[ offset + 1 ] = v.y;
			b[ offset + 2 ] = a[ offset + 2 ] = v.z;

			updated = true;

		}

		return updated;

	}

	updateVector4( uniform ) {

		let updated = false;

		const a = this.values;
		const v = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== v.x || a[ offset + 1 ] !== v.y || a[ offset + 2 ] !== v.z || a[ offset + 4 ] !== v.w ) {

			const b = this.buffer;

			b[ offset + 0 ] = a[ offset + 0 ] = v.x;
			b[ offset + 1 ] = a[ offset + 1 ] = v.y;
			b[ offset + 2 ] = a[ offset + 2 ] = v.z;
			b[ offset + 3 ] = a[ offset + 3 ] = v.w;

			updated = true;

		}

		return updated;

	}

	updateColor( uniform ) {

		let updated = false;

		const a = this.values;
		const c = uniform.getValue();
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== c.r || a[ offset + 1 ] !== c.g || a[ offset + 2 ] !== c.b ) {

			const b = this.buffer;

			b[ offset + 0 ] = a[ offset + 0 ] = c.r;
			b[ offset + 1 ] = a[ offset + 1 ] = c.g;
			b[ offset + 2 ] = a[ offset + 2 ] = c.b;

			updated = true;

		}

		return updated;

	}

	updateMatrix3( uniform ) {

		let updated = false;

		const a = this.values;
		const e = uniform.getValue().elements;
		const offset = uniform.offset;

		if ( a[ offset + 0 ] !== e[ 0 ] || a[ offset + 1 ] !== e[ 1 ] || a[ offset + 2 ] !== e[ 2 ] ||
			a[ offset + 4 ] !== e[ 3 ] || a[ offset + 5 ] !== e[ 4 ] || a[ offset + 6 ] !== e[ 5 ] ||
			a[ offset + 8 ] !== e[ 6 ] || a[ offset + 9 ] !== e[ 7 ] || a[ offset + 10 ] !== e[ 8 ] ) {

			const b = this.buffer;

			b[ offset + 0 ] = a[ offset + 0 ] = e[ 0 ];
			b[ offset + 1 ] = a[ offset + 1 ] = e[ 1 ];
			b[ offset + 2 ] = a[ offset + 2 ] = e[ 2 ];
			b[ offset + 4 ] = a[ offset + 4 ] = e[ 3 ];
			b[ offset + 5 ] = a[ offset + 5 ] = e[ 4 ];
			b[ offset + 6 ] = a[ offset + 6 ] = e[ 5 ];
			b[ offset + 8 ] = a[ offset + 8 ] = e[ 6 ];
			b[ offset + 9 ] = a[ offset + 9 ] = e[ 7 ];
			b[ offset + 10 ] = a[ offset + 10 ] = e[ 8 ];

			updated = true;

		}

		return updated;

	}

	updateMatrix4( uniform ) {

		let updated = false;

		const a = this.values;
		const e = uniform.getValue().elements;
		const offset = uniform.offset;

		if ( arraysEqual( a, e, offset ) === false ) {

			const b = this.buffer;
			b.set( e, offset );
			setArray( a, e, offset );
			updated = true;

		}

		return updated;

	}

}

function setArray( a, b, offset ) {

	for ( let i = 0, l = b.length; i < l; i ++ ) {

		a[ offset + i ] = b[ i ];

	}

}

function arraysEqual( a, b, offset ) {

	for ( let i = 0, l = b.length; i < l; i ++ ) {

		if ( a[ offset + i ] !== b[ i ] ) return false;

	}

	return true;

}

let _id$3 = 0;

class NodeUniformsGroup extends UniformsGroup {

	constructor( name, groupNode ) {

		super( name );

		this.id = _id$3 ++;
		this.groupNode = groupNode;

		this.isNodeUniformsGroup = true;

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

let _id$2 = 0;

class SampledTexture extends Binding {

	constructor( name, texture ) {

		super( name );

		this.id = _id$2 ++;

		this.texture = texture;
		this.version = texture ? texture.version : 0;
		this.store = false;
		this.generation = null;

		this.isSampledTexture = true;

	}

	needsBindingsUpdate( generation ) {

		const { texture } = this;

		if ( generation !== this.generation ) {

			this.generation = generation;

			return true;

		}

		return texture.isVideoTexture;

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

	constructor( name, textureNode, groupNode, access = null ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;
		this.groupNode = groupNode;

		this.access = access;

	}

	needsBindingsUpdate( generation ) {

		return this.textureNode.value !== this.texture || super.needsBindingsUpdate( generation );

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

	constructor( name, textureNode, groupNode, access ) {

		super( name, textureNode, groupNode, access );

		this.isSampledCubeTexture = true;

	}

}

class NodeSampledTexture3D extends NodeSampledTexture {

	constructor( name, textureNode, groupNode, access ) {

		super( name, textureNode, groupNode, access );

		this.isSampledTexture3D = true;

	}

}

const glslMethods = {
	atan2: 'atan',
	textureDimensions: 'textureSize',
	equals: 'equal'
};

const precisionLib = {
	low: 'lowp',
	medium: 'mediump',
	high: 'highp'
};

const supports$1 = {
	swizzleAssign: true,
	storageBuffer: false
};

const defaultPrecisions = `
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;
precision highp samplerCube;
precision highp sampler2DArray;

precision highp usampler2D;
precision highp usampler3D;
precision highp usamplerCube;
precision highp usampler2DArray;

precision highp isampler2D;
precision highp isampler3D;
precision highp isamplerCube;
precision highp isampler2DArray;

precision lowp sampler2DShadow;
`;

class GLSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer ) {

		super( object, renderer, new GLSLNodeParser() );

		this.uniformGroups = {};
		this.transforms = [];
		this.extensions = {};
		this.builtins = { vertex: [], fragment: [], compute: [] };

		this.useComparisonMethod = true;

	}

	needsColorSpaceToLinearSRGB( texture ) {

		return texture.isVideoTexture === true && texture.colorSpace !== NoColorSpace;

	}

	getMethod( method ) {

		return glslMethods[ method ] || method;

	}

	getOutputStructName() {

		return '';

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

			const isInteger = attribute.array.constructor.name.toLowerCase().includes( 'int' );

			let format = isInteger ? RedIntegerFormat : RedFormat;


			if ( itemSize === 2 ) {

				format = isInteger ? RGIntegerFormat : RGFormat;

			} else if ( itemSize === 3 ) {

				format = isInteger ? RGBIntegerFormat : RGBFormat;

			} else if ( itemSize === 4 ) {

				format = isInteger ? RGBAIntegerFormat : RGBAFormat;

			}

			const typeMap = {
				Float32Array: FloatType,
				Uint8Array: UnsignedByteType,
				Uint16Array: UnsignedShortType,
				Uint32Array: UnsignedIntType,
				Int8Array: ByteType,
				Int16Array: ShortType,
				Int32Array: IntType,
				Uint8ClampedArray: UnsignedByteType,
			};

			const width = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( numElements / itemSize ) ) ) );
			let height = Math.ceil( ( numElements / itemSize ) / width );
			if ( width * height * itemSize < numElements ) height ++; // Ensure enough space

			const newSize = width * height * itemSize;

			const newArray = new originalArray.constructor( newSize );

			newArray.set( originalArray, 0 );

			attribute.array = newArray;

			const pboTexture = new DataTexture( attribute.array, width, height, format, typeMap[ attribute.array.constructor.name ] || FloatType );
			pboTexture.needsUpdate = true;
			pboTexture.isPBOTexture = true;

			const pbo = new TextureNode( pboTexture, null, null );
			pbo.setPrecision( 'high' );

			attribute.pboNode = pbo;
			attribute.pbo = pbo.value;

			this.getUniformFromNode( attribute.pboNode, 'texture', this.shaderStage, this.context.label );

		}

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeUniform && node.node.isTextureNode !== true && node.node.isBufferNode !== true ) {

			return shaderStage.charAt( 0 ) + '_' + node.name;

		}

		return super.getPropertyName( node, shaderStage );

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

		this.increaseUsage( indexNode ); // force cache generate to be used as index in x,y
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

				this.addLineFlowCode( `${ propertySizeName } = uint( textureSize( ${ textureName }, 0 ).x )`, storageArrayElementNode );

				bufferNodeData.propertySizeName = propertySizeName;

			}

			//

			const { itemSize } = attribute;

			const channel = '.' + vectorComponents.join( '' ).slice( 0, itemSize );
			const uvSnippet = `ivec2(${indexSnippet} % ${ propertySizeName }, ${indexSnippet} / ${ propertySizeName })`;

			const snippet = this.generateTextureLoad( null, textureName, uvSnippet, null, '0' );

			//


			let prefix = 'vec4';

			if ( attribute.pbo.type === UnsignedIntType ) {

				prefix = 'uvec4';

			} else if ( attribute.pbo.type === IntType ) {

				prefix = 'ivec4';

			}

			this.addLineFlowCode( `${ propertyName } = ${prefix}(${ snippet })${channel}`, storageArrayElementNode );

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

	generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet ) {

		return `texture( ${ textureProperty }, ${ uvSnippet }, ${ biasSnippet } )`;

	}

	generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet ) {

		return `textureGrad( ${ textureProperty }, ${ uvSnippet }, ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] } )`;

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

				let typePrefix = '';

				if ( texture.isDataTexture === true ) {


					if ( texture.type === UnsignedIntType ) {

						typePrefix = 'u';

					} else if ( texture.type === IntType ) {

						typePrefix = 'i';

					}

				}

				if ( texture.compareFunction ) {

					snippet = `sampler2DShadow ${ uniform.name };`;

				} else if ( texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

					snippet = `${typePrefix}sampler2DArray ${ uniform.name };`;

				} else {

					snippet = `${typePrefix}sampler2D ${ uniform.name };`;

				}

			} else if ( uniform.type === 'cubeTexture' ) {

				snippet = `samplerCube ${ uniform.name };`;

			} else if ( uniform.type === 'texture3D' ) {

				snippet = `sampler3D ${ uniform.name };`;

			} else if ( uniform.type === 'buffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 ? bufferCount : '';
				snippet = `${bufferNode.name} {\n\t${ bufferType } ${ uniform.name }[${ bufferCountSnippet }];\n};\n`;

			} else {

				const vectorType = this.getVectorType( uniform.type );

				snippet = `${ vectorType } ${ this.getPropertyName( uniform, shaderStage ) };`;

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
				const flat = type.includes( 'int' ) || type.includes( 'uv' ) || type.includes( 'iv' ) ? 'flat ' : '';

				snippet += `${flat}${varying.needsInterpolation ? 'out' : '/*out*/'} ${type} ${varying.name};\n`;

			}

		} else if ( shaderStage === 'fragment' ) {

			for ( const varying of varyings ) {

				if ( varying.needsInterpolation ) {

					const type = varying.type;
					const flat = type.includes( 'int' ) || type.includes( 'uv' ) || type.includes( 'iv' ) ? 'flat ' : '';

					snippet += `${flat}in ${type} ${varying.name};\n`;

				}

			}

		}

		for ( const builtin of this.builtins[ shaderStage ] ) {

			snippet += `${builtin};\n`;

		}

		return snippet;

	}

	getVertexIndex() {

		return 'uint( gl_VertexID )';

	}

	getInstanceIndex() {

		return 'uint( gl_InstanceID )';

	}

	getInvocationLocalIndex() {

		const workgroupSize = this.object.workgroupSize;

		const size = workgroupSize.reduce( ( acc, curr ) => acc * curr, 1 );

		return `uint( gl_InstanceID ) % ${size}u`;

	}

	getDrawIndex() {

		const extensions = this.renderer.backend.extensions;

		if ( extensions.has( 'WEBGL_multi_draw' ) ) {

			return 'uint( gl_DrawID )';

		}

		return null;

	}

	getFrontFacing() {

		return 'gl_FrontFacing';

	}

	getFragCoord() {

		return 'gl_FragCoord.xy';

	}

	getFragDepth() {

		return 'gl_FragDepth';

	}

	enableExtension( name, behavior, shaderStage = this.shaderStage ) {

		const map = this.extensions[ shaderStage ] || ( this.extensions[ shaderStage ] = new Map() );

		if ( map.has( name ) === false ) {

			map.set( name, {
				name,
				behavior
			} );

		}

	}

	getExtensions( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'vertex' ) {

			const ext = this.renderer.backend.extensions;
			const isBatchedMesh = this.object.isBatchedMesh;

			if ( isBatchedMesh && ext.has( 'WEBGL_multi_draw' ) ) {

				this.enableExtension( 'GL_ANGLE_multi_draw', 'require', shaderStage );

			}

		}

		const extensions = this.extensions[ shaderStage ];

		if ( extensions !== undefined ) {

			for ( const { name, behavior } of extensions.values() ) {

				snippets.push( `#extension ${name} : ${behavior}` );

			}

		}

		return snippets.join( '\n' );

	}

	getClipDistance() {

		return 'gl_ClipDistance';

	}

	isAvailable( name ) {

		let result = supports$1[ name ];

		if ( result === undefined ) {

			let extensionName;

			result = false;

			switch ( name ) {

				case 'float32Filterable':
					extensionName = 'OES_texture_float_linear';
					break;

				case 'clipDistance':
					extensionName = 'WEBGL_clip_cull_distance';
					break;

			}

			if ( extensionName !== undefined ) {

				const extensions = this.renderer.backend.extensions;

				if ( extensions.has( extensionName ) ) {

					extensions.get( extensionName );
					result = true;

				}

			}

			supports$1[ name ] = result;

		}

		return result;

	}

	isFlipY() {

		return true;

	}

	enableHardwareClipping( planeCount ) {

		this.enableExtension( 'GL_ANGLE_clip_cull_distance', 'require' );

		this.builtins[ 'vertex' ].push( `out float gl_ClipDistance[ ${ planeCount } ]` );

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

// extensions 
${shaderData.extensions}

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

		this.sortBindingGroups();

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

			stageData.extensions = this.getExtensions( shaderStage );
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

			const group = node.groupNode;
			const groupName = group.name;

			const bindings = this.getBindGroupArray( groupName, shaderStage );

			if ( type === 'texture' ) {

				uniformGPU = new NodeSampledTexture( uniformNode.name, uniformNode.node, group );
				bindings.push( uniformGPU );

			} else if ( type === 'cubeTexture' ) {

				uniformGPU = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node, group );
				bindings.push( uniformGPU );

			} else if ( type === 'texture3D' ) {

				uniformGPU = new NodeSampledTexture3D( uniformNode.name, uniformNode.node, group );
				bindings.push( uniformGPU );

			} else if ( type === 'buffer' ) {

				node.name = `NodeBuffer_${ node.id }`;
				uniformNode.name = `buffer${ node.id }`;

				const buffer = new NodeUniformBuffer( node, group );
				buffer.name = node.name;

				bindings.push( buffer );

				uniformGPU = buffer;

			} else {

				const uniformsStage = this.uniformGroups[ shaderStage ] || ( this.uniformGroups[ shaderStage ] = {} );

				let uniformsGroup = uniformsStage[ groupName ];

				if ( uniformsGroup === undefined ) {

					uniformsGroup = new NodeUniformsGroup( shaderStage + '_' + groupName, group );
					//uniformsGroup.setVisibility( gpuShaderStageLib[ shaderStage ] );

					uniformsStage[ groupName ] = uniformsGroup;

					bindings.push( uniformsGroup );

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

	begin( /*renderContext*/ ) { }

	finish( /*renderContext*/ ) { }

	// render object

	draw( /*renderObject, info*/ ) { }

	// program

	createProgram( /*program*/ ) { }

	destroyProgram( /*program*/ ) { }

	// bindings

	createBindings( /*bingGroup, bindings*/ ) { }

	updateBindings( /*bingGroup, bindings*/ ) { }

	// pipeline

	createRenderPipeline( /*renderObject*/ ) { }

	createComputePipeline( /*computeNode, pipeline*/ ) { }

	destroyPipeline( /*pipeline*/ ) { }

	// cache key

	needsRenderUpdate( /*renderObject*/ ) { } // return Boolean ( fast test )

	getRenderCacheKey( /*renderObject*/ ) { } // return String

	// node builder

	createNodeBuilder( /*renderObject*/ ) { } // return NodeBuilder (ADD IT)

	// textures

	createSampler( /*texture*/ ) { }

	createDefaultTexture( /*texture*/ ) { }

	createTexture( /*texture*/ ) { }

	copyTextureToBuffer( /*texture, x, y, width, height*/ ) {}

	// attributes

	createAttribute( /*attribute*/ ) { }

	createIndexAttribute( /*attribute*/ ) { }

	updateAttribute( /*attribute*/ ) { }

	destroyAttribute( /*attribute*/ ) { }

	// canvas

	getContext() { }

	updateSize() { }

	// utils

	resolveTimestampAsync( /*renderContext, type*/ ) { }

	hasFeatureAsync( /*name*/ ) { } // return Boolean

	hasFeature( /*name*/ ) { } // return Boolean

	getInstanceCount( renderObject ) {

		const { object, geometry } = renderObject;

		return geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.count > 1 ? object.count : 1 );

	}

	getDrawingBufferSize() {

		vector2 = vector2 || new Vector2();

		return this.renderer.getDrawingBufferSize( vector2 );

	}

	getScissor() {

		vector4 = vector4 || new Vector4();

		return this.renderer.getScissor( vector4 );

	}

	setScissorTest( /*boolean*/ ) { }

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

	dispose() { }

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

		// Ensure the buffer is bound before reading
		gl.bindBuffer( gl.COPY_WRITE_BUFFER, writeBuffer );

		gl.getBufferSubData( gl.COPY_WRITE_BUFFER, 0, dstBuffer );

		gl.deleteBuffer( writeBuffer );

		gl.bindBuffer( gl.COPY_READ_BUFFER, null );
		gl.bindBuffer( gl.COPY_WRITE_BUFFER, null );

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
		this.currentClippingPlanes = 0;

		this.currentBoundFramebuffers = {};
		this.currentDrawbuffers = new WeakMap();

		this.maxTextures = this.gl.getParameter( this.gl.MAX_TEXTURE_IMAGE_UNITS );
		this.currentTextureSlot = null;
		this.currentBoundTextures = {};
		this.currentBoundBufferBases = {};

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

	setMaterial( material, frontFaceCW, hardwareClippingPlanes ) {

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

		material.alphaToCoverage === true && this.backend.renderer.samples > 1
			? this.enable( gl.SAMPLE_ALPHA_TO_COVERAGE )
			: this.disable( gl.SAMPLE_ALPHA_TO_COVERAGE );

		if ( hardwareClippingPlanes > 0 ) {

			if ( this.currentClippingPlanes !== hardwareClippingPlanes ) {

				const CLIP_DISTANCE0_WEBGL = 0x3000;

				for ( let i = 0; i < 8; i ++ ) {

					if ( i < hardwareClippingPlanes ) {

						this.enable( CLIP_DISTANCE0_WEBGL + i );

					} else {

						this.disable( CLIP_DISTANCE0_WEBGL + i );

					}

				}

			}

		}

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

	bindBufferBase( target, index, buffer ) {

		const { gl } = this;

		const key = `${target}-${index}`;

		if ( this.currentBoundBufferBases[ key ] !== buffer ) {

			gl.bindBufferBase( target, index, buffer );
			this.currentBoundBufferBases[ key ] = buffer;

			return true;

		}

		return false;

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
		if ( p === UnsignedInt5999Type ) return gl.UNSIGNED_INT_5_9_9_9_REV;

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
		if ( p === RGBFormat ) return gl.RGB;
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

		// ETC

		if ( p === RGB_ETC1_Format || p === RGB_ETC2_Format || p === RGBA_ETC2_EAC_Format ) {

			extension = extensions.get( 'WEBGL_compressed_texture_etc' );

			if ( extension !== null ) {

				if ( p === RGB_ETC1_Format || p === RGB_ETC2_Format ) return ( colorSpace === SRGBColorSpace ) ? extension.COMPRESSED_SRGB8_ETC2 : extension.COMPRESSED_RGB8_ETC2;
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

		} else if ( texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

			glTextureType = gl.TEXTURE_2D_ARRAY;

		} else if ( texture.isData3DTexture === true ) { // TODO: isCompressed3DTexture, wait for #26642

			glTextureType = gl.TEXTURE_3D;

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
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.R16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.R32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.R8I;
			if ( glType === gl.SHORT ) internalFormat = gl.R16I;
			if ( glType === gl.INT ) internalFormat = gl.R32I;

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
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RG16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RG32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RG8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RG16I;
			if ( glType === gl.INT ) internalFormat = gl.RG32I;

		}

		if ( glFormat === gl.RG_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RG8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RG16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RG32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RG8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RG16I;
			if ( glType === gl.INT ) internalFormat = gl.RG32I;

		}

		if ( glFormat === gl.RGB ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RGB32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RGB16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGB8;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGB16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGB32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGB8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGB16I;
			if ( glType === gl.INT ) internalFormat = gl.RGB32I;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = ( colorSpace === SRGBColorSpace && forceLinearTransfer === false ) ? gl.SRGB8 : gl.RGB8;
			if ( glType === gl.UNSIGNED_SHORT_5_6_5 ) internalFormat = gl.RGB565;
			if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) internalFormat = gl.RGB5_A1;
			if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) internalFormat = gl.RGB4;
			if ( glType === gl.UNSIGNED_INT_5_9_9_9_REV ) internalFormat = gl.RGB9_E5;

		}

		if ( glFormat === gl.RGB_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGB8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGB16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGB32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGB8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGB16I;
			if ( glType === gl.INT ) internalFormat = gl.RGB32I;

		}

		if ( glFormat === gl.RGBA ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RGBA32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RGBA16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGBA8;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGBA16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGBA32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGBA8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGBA16I;
			if ( glType === gl.INT ) internalFormat = gl.RGBA32I;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = ( colorSpace === SRGBColorSpace && forceLinearTransfer === false ) ? gl.SRGB8_ALPHA8 : gl.RGBA8;
			if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) internalFormat = gl.RGBA4;
			if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) internalFormat = gl.RGB5_A1;

		}

		if ( glFormat === gl.RGBA_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGBA8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGBA16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGBA32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGBA8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGBA16I;
			if ( glType === gl.INT ) internalFormat = gl.RGBA32I;

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


		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, texture.unpackAlignment );
		gl.pixelStorei( gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE );

		gl.texParameteri( textureType, gl.TEXTURE_WRAP_S, wrappingToGL[ texture.wrapS ] );
		gl.texParameteri( textureType, gl.TEXTURE_WRAP_T, wrappingToGL[ texture.wrapT ] );

		if ( textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY ) {

			gl.texParameteri( textureType, gl.TEXTURE_WRAP_R, wrappingToGL[ texture.wrapR ] );

		}

		gl.texParameteri( textureType, gl.TEXTURE_MAG_FILTER, filterToGL[ texture.magFilter ] );


		const hasMipmaps = texture.mipmaps !== undefined && texture.mipmaps.length > 0;

		// follow WebGPU backend mapping for texture filtering
		const minFilter = texture.minFilter === LinearFilter && hasMipmaps ? LinearMipmapLinearFilter : texture.minFilter;

		gl.texParameteri( textureType, gl.TEXTURE_MIN_FILTER, filterToGL[ minFilter ] );

		if ( texture.compareFunction ) {

			gl.texParameteri( textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE );
			gl.texParameteri( textureType, gl.TEXTURE_COMPARE_FUNC, compareToGL[ texture.compareFunction ] );

		}

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			if ( texture.magFilter === NearestFilter ) return;
			if ( texture.minFilter !== NearestMipmapLinearFilter && texture.minFilter !== LinearMipmapLinearFilter ) return;
			if ( texture.type === FloatType && extensions.has( 'OES_texture_float_linear' ) === false ) return; // verify extension for WebGL 1 and WebGL 2

			if ( texture.anisotropy > 1 ) {

				const extension = extensions.get( 'EXT_texture_filter_anisotropic' );
				gl.texParameterf( textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, backend.getMaxAnisotropy() ) );

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

		this.setTextureParameters( glTextureType, texture );

		if ( texture.isDataArrayTexture || texture.isCompressedArrayTexture ) {

			gl.texStorage3D( gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, width, height, depth );

		} else if ( texture.isData3DTexture ) {

			gl.texStorage3D( gl.TEXTURE_3D, levels, glInternalFormat, width, height, depth );

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

		this.setTextureParameters( glTextureType, texture );

		if ( texture.isCompressedTexture ) {

			const mipmaps = texture.mipmaps;
			const image = options.image;

			for ( let i = 0; i < mipmaps.length; i ++ ) {

				const mipmap = mipmaps[ i ];

				if ( texture.isCompressedArrayTexture ) {


					if ( texture.format !== gl.RGBA ) {

						if ( glFormat !== null ) {

							gl.compressedTexSubImage3D( gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, mipmap.data );

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

		} else if ( texture.isData3DTexture ) {

			const image = options.image;

			gl.texSubImage3D( gl.TEXTURE_3D, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data );

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

			if ( renderContextData.framebuffers ) {

				for ( const cacheKey in renderContextData.framebuffers ) {

					gl.deleteFramebuffer( renderContextData.framebuffers[ cacheKey ] );

				}

				delete renderContextData.framebuffers;

			}

			if ( renderContextData.depthRenderbuffer ) {

				gl.deleteRenderbuffer( renderContextData.depthRenderbuffer );
				delete renderContextData.depthRenderbuffer;

			}

			if ( renderContextData.stencilRenderbuffer ) {

				gl.deleteRenderbuffer( renderContextData.stencilRenderbuffer );
				delete renderContextData.stencilRenderbuffer;

			}

			if ( renderContextData.msaaFrameBuffer ) {

				gl.deleteFramebuffer( renderContextData.msaaFrameBuffer );
				delete renderContextData.msaaFrameBuffer;

			}

			if ( renderContextData.msaaRenderbuffers ) {

				for ( let i = 0; i < renderContextData.msaaRenderbuffers.length; i ++ ) {

					gl.deleteRenderbuffer( renderContextData.msaaRenderbuffers[ i ] );

				}

				delete renderContextData.msaaRenderbuffers;

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

	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0 ) {

		const { gl, backend } = this;
		const { state } = this.backend;

		const { textureGPU: dstTextureGPU, glTextureType, glType, glFormat } = backend.get( dstTexture );

		let width, height, minX, minY;
		let dstX, dstY;

		if ( srcRegion !== null ) {

			width = srcRegion.max.x - srcRegion.min.x;
			height = srcRegion.max.y - srcRegion.min.y;
			minX = srcRegion.min.x;
			minY = srcRegion.min.y;

		} else {

			width = srcTexture.image.width;
			height = srcTexture.image.height;
			minX = 0;
			minY = 0;

		}

		if ( dstPosition !== null ) {

			dstX = dstPosition.x;
			dstY = dstPosition.y;

		} else {

			dstX = 0;
			dstY = 0;

		}

		state.bindTexture( glTextureType, dstTextureGPU );

		// As another texture upload may have changed pixelStorei
		// parameters, make sure they are correct for the dstTexture
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment );
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment );

		const currentUnpackRowLen = gl.getParameter( gl.UNPACK_ROW_LENGTH );
		const currentUnpackImageHeight = gl.getParameter( gl.UNPACK_IMAGE_HEIGHT );
		const currentUnpackSkipPixels = gl.getParameter( gl.UNPACK_SKIP_PIXELS );
		const currentUnpackSkipRows = gl.getParameter( gl.UNPACK_SKIP_ROWS );
		const currentUnpackSkipImages = gl.getParameter( gl.UNPACK_SKIP_IMAGES );

		const image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[ level ] : srcTexture.image;

		gl.pixelStorei( gl.UNPACK_ROW_LENGTH, image.width );
		gl.pixelStorei( gl.UNPACK_IMAGE_HEIGHT, image.height );
		gl.pixelStorei( gl.UNPACK_SKIP_PIXELS, minX );
		gl.pixelStorei( gl.UNPACK_SKIP_ROWS, minY );

		if ( srcTexture.isRenderTargetTexture || srcTexture.isDepthTexture ) {

			const srcTextureData = backend.get( srcTexture );
			const dstTextureData = backend.get( dstTexture );

			const srcRenderContextData = backend.get( srcTextureData.renderTarget );
			const dstRenderContextData = backend.get( dstTextureData.renderTarget );

			const srcFramebuffer = srcRenderContextData.framebuffers[ srcTextureData.cacheKey ];
			const dstFramebuffer = dstRenderContextData.framebuffers[ dstTextureData.cacheKey ];

			state.bindFramebuffer( gl.READ_FRAMEBUFFER, srcFramebuffer );
			state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, dstFramebuffer );

			let mask = gl.COLOR_BUFFER_BIT;

			if ( srcTexture.isDepthTexture ) mask = gl.DEPTH_BUFFER_BIT;

			gl.blitFramebuffer( minX, minY, width, height, dstX, dstY, width, height, mask, gl.NEAREST );

			state.bindFramebuffer( gl.READ_FRAMEBUFFER, null );
			state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, null );

		} else {

			if ( srcTexture.isDataTexture ) {

				gl.texSubImage2D( gl.TEXTURE_2D, level, dstX, dstY, width, height, glFormat, glType, image.data );

			} else {

				if ( srcTexture.isCompressedTexture ) {

					gl.compressedTexSubImage2D( gl.TEXTURE_2D, level, dstX, dstY, image.width, image.height, glFormat, image.data );

				} else {

					gl.texSubImage2D( gl.TEXTURE_2D, level, dstX, dstY, width, height, glFormat, glType, image );

				}

			}

		}

		gl.pixelStorei( gl.UNPACK_ROW_LENGTH, currentUnpackRowLen );
		gl.pixelStorei( gl.UNPACK_IMAGE_HEIGHT, currentUnpackImageHeight );
		gl.pixelStorei( gl.UNPACK_SKIP_PIXELS, currentUnpackSkipPixels );
		gl.pixelStorei( gl.UNPACK_SKIP_ROWS, currentUnpackSkipRows );
		gl.pixelStorei( gl.UNPACK_SKIP_IMAGES, currentUnpackSkipImages );

		// Generate mipmaps only when copying level 0
		if ( level === 0 && dstTexture.generateMipmaps ) gl.generateMipmap( gl.TEXTURE_2D );

		state.unbindTexture();

	}

	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		const { gl } = this;
		const { state } = this.backend;

		const { textureGPU } = this.backend.get( texture );

		const { x, y, z: width, w: height } = rectangle;

		const requireDrawFrameBuffer = texture.isDepthTexture === true || ( renderContext.renderTarget && renderContext.renderTarget.samples > 0 );

		const srcHeight = renderContext.renderTarget ? renderContext.renderTarget.height : this.backend.gerDrawingBufferSize().y;

		if ( requireDrawFrameBuffer ) {

			const partial = ( x !== 0 || y !== 0 );
			let mask;
			let attachment;

			if ( texture.isDepthTexture === true ) {

				mask = gl.DEPTH_BUFFER_BIT;
				attachment = gl.DEPTH_ATTACHMENT;

				if ( renderContext.stencil ) {

					mask |= gl.STENCIL_BUFFER_BIT;

				}

			} else {

				mask = gl.COLOR_BUFFER_BIT;
				attachment = gl.COLOR_ATTACHMENT0;

			}

			if ( partial ) {

				const renderTargetContextData = this.backend.get( renderContext.renderTarget );

				const fb = renderTargetContextData.framebuffers[ renderContext.getCacheKey() ];
				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;

				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );
				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );

				const flippedY = srcHeight - y - height;

				gl.blitFramebuffer( x, flippedY, x + width, flippedY + height, x, flippedY, x + width, flippedY + height, mask, gl.NEAREST );

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, fb );

				state.bindTexture( gl.TEXTURE_2D, textureGPU );

				gl.copyTexSubImage2D( gl.TEXTURE_2D, 0, 0, 0, x, flippedY, width, height );

				state.unbindTexture();

			} else {

				const fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureGPU, 0 );
				gl.blitFramebuffer( 0, 0, width, height, 0, 0, width, height, mask, gl.NEAREST );

				gl.deleteFramebuffer( fb );

			}

		} else {

			state.bindTexture( gl.TEXTURE_2D, textureGPU );
			gl.copyTexSubImage2D( gl.TEXTURE_2D, 0, 0, 0, x, srcHeight - height - y, width, height );

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

	async copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		const { backend, gl } = this;

		const { textureGPU, glFormat, glType } = this.backend.get( texture );

		const fb = gl.createFramebuffer();

		gl.bindFramebuffer( gl.READ_FRAMEBUFFER, fb );

		const target = texture.isCubeTexture ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex : gl.TEXTURE_2D;

		gl.framebufferTexture2D( gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, target, textureGPU, 0 );

		const typedArrayType = this._getTypedArrayType( glType );
		const bytesPerTexel = this._getBytesPerTexel( glType, glFormat );

		const elementCount = width * height;
		const byteLength = elementCount * bytesPerTexel;

		const buffer = gl.createBuffer();

		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, buffer );
		gl.bufferData( gl.PIXEL_PACK_BUFFER, byteLength, gl.STREAM_READ );
		gl.readPixels( x, y, width, height, glFormat, glType, 0 );
		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, null );

		await backend.utils._clientWaitAsync();

		const dstBuffer = new typedArrayType( byteLength / typedArrayType.BYTES_PER_ELEMENT );

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

		if ( glType === gl.HALF_FLOAT ) return Uint16Array;
		if ( glType === gl.FLOAT ) return Float32Array;

		throw new Error( `Unsupported WebGL type: ${glType}` );

	}

	_getBytesPerTexel( glType, glFormat ) {

		const { gl } = this;

		let bytesPerComponent = 0;

		if ( glType === gl.UNSIGNED_BYTE ) bytesPerComponent = 1;

		if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ||
			glType === gl.UNSIGNED_SHORT_5_5_5_1 ||
			glType === gl.UNSIGNED_SHORT_5_6_5 ||
			glType === gl.UNSIGNED_SHORT ||
			glType === gl.HALF_FLOAT ) bytesPerComponent = 2;

		if ( glType === gl.UNSIGNED_INT ||
			glType === gl.FLOAT ) bytesPerComponent = 4;

		if ( glFormat === gl.RGBA ) return bytesPerComponent * 4;
		if ( glFormat === gl.RGB ) return bytesPerComponent * 3;
		if ( glFormat === gl.ALPHA ) return bytesPerComponent;

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

			this.extensions[ name ] = extension;

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

	'WEBGL_multi_draw': 'WEBGL_multi_draw',
	'WEBGL_compressed_texture_astc': 'texture-compression-astc',
	'WEBGL_compressed_texture_etc': 'texture-compression-etc2',
	'WEBGL_compressed_texture_etc1': 'texture-compression-etc1',
	'WEBGL_compressed_texture_pvrtc': 'texture-compression-pvrtc',
	'WEBKIT_WEBGL_compressed_texture_pvrtc': 'texture-compression-pvrtc',
	'WEBGL_compressed_texture_s3tc': 'texture-compression-bc',
	'EXT_texture_compression_bptc': 'texture-compression-bptc',
	'EXT_disjoint_timer_query_webgl2': 'timestamp-query',

};

class WebGLBufferRenderer {

	constructor( backend ) {

		this.gl = backend.gl;
		this.extensions = backend.extensions;
		this.info = backend.renderer.info;
		this.mode = null;
		this.index = 0;
		this.type = null;
		this.object = null;

	}

	render( start, count ) {

		const { gl, mode, object, type, info, index } = this;

		if ( index !== 0 ) {

			gl.drawElements( mode, count, type, start );

		} else {

			gl.drawArrays( mode, start, count );

		}

		info.update( object, count, mode, 1 );

	}

	renderInstances( start, count, primcount ) {

		const { gl, mode, type, index, object, info } = this;

		if ( primcount === 0 ) return;

		if ( index !== 0 ) {

			gl.drawElementsInstanced( mode, count, type, start, primcount );

		} else {

			gl.drawArraysInstanced( mode, start, count, primcount );

		}

		info.update( object, count, mode, primcount );

	}

	renderMultiDraw( starts, counts, drawCount ) {

		const { extensions, mode, object, info } = this;

		if ( drawCount === 0 ) return;

		const extension = extensions.get( 'WEBGL_multi_draw' );

		if ( extension === null ) {

			for ( let i = 0; i < drawCount; i ++ ) {

				this.render( starts[ i ], counts[ i ] );

			}

		} else {

			if ( this.index !== 0 ) {

				extension.multiDrawElementsWEBGL( mode, counts, 0, this.type, starts, 0, drawCount );

			} else {

				extension.multiDrawArraysWEBGL( mode, starts, 0, counts, 0, drawCount );

			}

			let elementCount = 0;
			for ( let i = 0; i < drawCount; i ++ ) {

				elementCount += counts[ i ];

			}

			info.update( object, elementCount, mode, 1 );

		}

	}

	renderMultiDrawInstances( starts, counts, drawCount, primcount ) {

		const { extensions, mode, object, info } = this;

		if ( drawCount === 0 ) return;

		const extension = extensions.get( 'WEBGL_multi_draw' );

		if ( extension === null ) {

			for ( let i = 0; i < drawCount; i ++ ) {

				this.renderInstances( starts[ i ], counts[ i ], primcount[ i ] );

			}

		} else {

			if ( this.index !== 0 ) {

				extension.multiDrawElementsInstancedWEBGL( mode, counts, 0, this.type, starts, 0, primcount, 0, drawCount );

			} else {

				extension.multiDrawArraysInstancedWEBGL( mode, starts, 0, counts, 0, primcount, 0, drawCount );

			}

			let elementCount = 0;
			for ( let i = 0; i < drawCount; i ++ ) {

				elementCount += counts[ i ] * primcount[ i ];

			}

			info.update( object, elementCount, mode, 1 );

		}

	}

	//

}

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

	 	function onContextLost( event ) {

			event.preventDefault();

			const contextLossInfo = {
				api: 'WebGL',
				message: event.statusMessage || 'Unknown reason',
				reason: null,
				originalEvent: event
			};

			renderer.onDeviceLost( contextLossInfo );

		}

		this._onContextLost = onContextLost;

		renderer.domElement.addEventListener( 'webglcontextlost', onContextLost, false );

		this.gl = glContext;

		this.extensions = new WebGLExtensions( this );
		this.capabilities = new WebGLCapabilities( this );
		this.attributeUtils = new WebGLAttributeUtils( this );
		this.textureUtils = new WebGLTextureUtils( this );
		this.bufferRenderer = new WebGLBufferRenderer( this );

		this.state = new WebGLState( this );
		this.utils = new WebGLUtils( this );

		this.vaoCache = {};
		this.transformFeedbackCache = {};
		this.discard = false;
		this.trackTimestamp = ( parameters.trackTimestamp === true );

		this.extensions.get( 'EXT_color_buffer_float' );
		this.extensions.get( 'WEBGL_clip_cull_distance' );
		this.extensions.get( 'OES_texture_float_linear' );
		this.extensions.get( 'EXT_color_buffer_half_float' );
		this.extensions.get( 'WEBGL_multisampled_render_to_texture' );
		this.extensions.get( 'WEBGL_render_shared_exponent' );
		this.extensions.get( 'WEBGL_multi_draw' );

		this.disjoint = this.extensions.get( 'EXT_disjoint_timer_query_webgl2' );
		this.parallel = this.extensions.get( 'KHR_parallel_shader_compile' );

		this._knownBindings = new WeakSet();

		this._currentContext = null;

	}

	get coordinateSystem() {

		return WebGLCoordinateSystem;

	}

	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}

	async waitForGPU() {

		await this.utils._clientWaitAsync();

	}

	initTimestampQuery( renderContext ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( this.queryRunning ) {

		  if ( ! renderContextData.queryQueue ) renderContextData.queryQueue = [];
		  renderContextData.queryQueue.push( renderContext );
		  return;

		}

		if ( renderContextData.activeQuery ) {

		  this.gl.endQuery( this.disjoint.TIME_ELAPSED_EXT );
		  renderContextData.activeQuery = null;

		}

		renderContextData.activeQuery = this.gl.createQuery();

		if ( renderContextData.activeQuery !== null ) {

		  this.gl.beginQuery( this.disjoint.TIME_ELAPSED_EXT, renderContextData.activeQuery );
		  this.queryRunning = true;

		}

	}

	// timestamp utils

	prepareTimestampBuffer( renderContext ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( renderContextData.activeQuery ) {

		  this.gl.endQuery( this.disjoint.TIME_ELAPSED_EXT );

		  if ( ! renderContextData.gpuQueries ) renderContextData.gpuQueries = [];
		  renderContextData.gpuQueries.push( { query: renderContextData.activeQuery } );
		  renderContextData.activeQuery = null;
		  this.queryRunning = false;

		  if ( renderContextData.queryQueue && renderContextData.queryQueue.length > 0 ) {

				const nextRenderContext = renderContextData.queryQueue.shift();
				this.initTimestampQuery( nextRenderContext );

			}

		}

	}

	  async resolveTimestampAsync( renderContext, type = 'render' ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( ! renderContextData.gpuQueries ) renderContextData.gpuQueries = [];

		for ( let i = 0; i < renderContextData.gpuQueries.length; i ++ ) {

		  const queryInfo = renderContextData.gpuQueries[ i ];
		  const available = this.gl.getQueryParameter( queryInfo.query, this.gl.QUERY_RESULT_AVAILABLE );
		  const disjoint = this.gl.getParameter( this.disjoint.GPU_DISJOINT_EXT );

		  if ( available && ! disjoint ) {

				const elapsed = this.gl.getQueryParameter( queryInfo.query, this.gl.QUERY_RESULT );
				const duration = Number( elapsed ) / 1000000; // Convert nanoseconds to milliseconds
				this.gl.deleteQuery( queryInfo.query );
				renderContextData.gpuQueries.splice( i, 1 ); // Remove the processed query
				i --;
				this.renderer.info.updateTimestamp( type, duration );

			}

		}

	}

	getContext() {

		return this.gl;

	}

	beginRender( renderContext ) {

		const { gl } = this;
		const renderContextData = this.get( renderContext );

		//

		//

		this.initTimestampQuery( renderContext );

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

			gl.scissor( x, renderContext.height - height - y, width, height );

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

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

			}

			this.resolveOccludedAsync( renderContext );

		}

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

			if ( samples > 0 ) {

				const fb = renderTargetContextData.framebuffers[ renderContext.getCacheKey() ];

				const mask = gl.COLOR_BUFFER_BIT;

				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;

				const textures = renderContext.textures;

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );
				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				for ( let i = 0; i < textures.length; i ++ ) {

					// TODO Add support for MRT

					if ( renderContext.scissor ) {

						const { x, y, width, height } = renderContext.scissorValue;

						const viewY = renderContext.height - height - y;

						gl.blitFramebuffer( x, viewY, x + width, viewY + height, x, viewY, x + width, viewY + height, mask, gl.NEAREST );
						gl.invalidateSubFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray, x, viewY, width, height );

					} else {

						gl.blitFramebuffer( 0, 0, renderContext.width, renderContext.height, 0, 0, renderContext.width, renderContext.height, mask, gl.NEAREST );
						gl.invalidateFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray );

					}

				}

			}


		}

		if ( previousContext !== null ) {

			this._setFramebuffer( previousContext );

			if ( previousContext.viewport ) {

				this.updateViewport( previousContext );

			} else {

				gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

			}

		}

		this.prepareTimestampBuffer( renderContext );

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

		gl.viewport( x, renderContext.height - height - y, width, height );

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

			const clearColor = this.getClearColor();

			// premultiply alpha

			clearColor.r *= clearColor.a;
			clearColor.g *= clearColor.a;
			clearColor.b *= clearColor.a;

			descriptor = {
				textures: null,
				clearColorValue: clearColor
			};

		}

		//

		let clear = 0;

		if ( color ) clear |= gl.COLOR_BUFFER_BIT;
		if ( depth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( stencil ) clear |= gl.STENCIL_BUFFER_BIT;

		if ( clear !== 0 ) {

			let clearColor;

			if ( descriptor.clearColorValue ) {

				clearColor = descriptor.clearColorValue;

			} else {

				clearColor = this.getClearColor();

				// premultiply alpha

				clearColor.r *= clearColor.a;
				clearColor.g *= clearColor.a;
				clearColor.b *= clearColor.a;

			}

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

	beginCompute( computeGroup ) {

		const { state, gl } = this;

		state.bindFramebuffer( gl.FRAMEBUFFER, null );
		this.initTimestampQuery( computeGroup );

	}

	compute( computeGroup, computeNode, bindings, pipeline ) {

		const { state, gl } = this;

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

		state.useProgram( programGPU );

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

	finishCompute( computeGroup ) {

		const gl = this.gl;

		this.discard = false;

		gl.disable( gl.RASTERIZER_DISCARD );

		this.prepareTimestampBuffer( computeGroup );

		if ( this._currentContext ) {

			this._setFramebuffer( this._currentContext );

		}

	}

	draw( renderObject/*, info*/ ) {

		const { object, pipeline, material, context, hardwareClippingPlanes } = renderObject;
		const { programGPU } = this.get( pipeline );

		const { gl, state } = this;

		const contextData = this.get( context );

		const drawParams = renderObject.getDrawParameters();

		if ( drawParams === null ) return;

		//

		this._bindUniforms( renderObject.getBindings() );

		const frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

		state.setMaterial( material, frontFaceCW, hardwareClippingPlanes );

		state.useProgram( programGPU );

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
		const renderer = this.bufferRenderer;

		if ( object.isPoints ) renderer.mode = gl.POINTS;
		else if ( object.isLineSegments ) renderer.mode = gl.LINES;
		else if ( object.isLine ) renderer.mode = gl.LINE_STRIP;
		else if ( object.isLineLoop ) renderer.mode = gl.LINE_LOOP;
		else {

			if ( material.wireframe === true ) {

				state.setLineWidth( material.wireframeLinewidth * this.renderer.getPixelRatio() );
				renderer.mode = gl.LINES;

			} else {

				renderer.mode = gl.TRIANGLES;

			}

		}

		//

		const { vertexCount, instanceCount } = drawParams;
		let { firstVertex } = drawParams;

		renderer.object = object;

		if ( index !== null ) {

			firstVertex *= index.array.BYTES_PER_ELEMENT;

			const indexData = this.get( index );

			renderer.index = index.count;
			renderer.type = indexData.type;

		} else {

			renderer.index = 0;

		}

		if ( object.isBatchedMesh ) {

			if ( object._multiDrawInstances !== null ) {

				renderer.renderMultiDrawInstances( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount, object._multiDrawInstances );

			} else if ( ! this.hasFeature( 'WEBGL_multi_draw' ) ) {

				warnOnce( 'THREE.WebGLRenderer: WEBGL_multi_draw not supported.' );

			} else {

				renderer.renderMultiDraw( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount );

			}

		} else if ( instanceCount > 1 ) {

			renderer.renderInstances( firstVertex, vertexCount, instanceCount );

		} else {

			renderer.render( firstVertex, vertexCount );

		}
		//

		gl.bindVertexArray( null );

	}

	needsRenderUpdate( /*renderObject*/ ) {

		return false;

	}

	getRenderCacheKey( /*renderObject*/ ) {

		return '';

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

	copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height, faceIndex );

	}

	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	destroySampler() {}

	// node builder

	createNodeBuilder( object, renderer ) {

		return new GLSLNodeBuilder( object, renderer );

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

	_handleSource( string, errorLine ) {

		const lines = string.split( '\n' );
		const lines2 = [];

		const from = Math.max( errorLine - 6, 0 );
		const to = Math.min( errorLine + 6, lines.length );

		for ( let i = from; i < to; i ++ ) {

			const line = i + 1;
			lines2.push( `${line === errorLine ? '>' : ' '} ${line}: ${lines[ i ]}` );

		}

		return lines2.join( '\n' );

	}

	_getShaderErrors( gl, shader, type ) {

		const status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
		const errors = gl.getShaderInfoLog( shader ).trim();

		if ( status && errors === '' ) return '';

		const errorMatches = /ERROR: 0:(\d+)/.exec( errors );
		if ( errorMatches ) {

			const errorLine = parseInt( errorMatches[ 1 ] );
			return type.toUpperCase() + '\n\n' + errors + '\n\n' + this._handleSource( gl.getShaderSource( shader ), errorLine );

		} else {

			return errors;

		}

	}

	_logProgramError( programGPU, glFragmentShader, glVertexShader ) {

		if ( this.renderer.debug.checkShaderErrors ) {

			const gl = this.gl;

			const programLog = gl.getProgramInfoLog( programGPU ).trim();

			if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {


				if ( typeof this.renderer.debug.onShaderError === 'function' ) {

					this.renderer.debug.onShaderError( gl, programGPU, glVertexShader, glFragmentShader );

				} else {

					// default error reporting

					const vertexErrors = this._getShaderErrors( gl, glVertexShader, 'vertex' );
					const fragmentErrors = this._getShaderErrors( gl, glFragmentShader, 'fragment' );

					console.error(
						'THREE.WebGLProgram: Shader Error ' + gl.getError() + ' - ' +
						'VALIDATE_STATUS ' + gl.getProgramParameter( programGPU, gl.VALIDATE_STATUS ) + '\n\n' +
						'Program Info Log: ' + programLog + '\n' +
						vertexErrors + '\n' +
						fragmentErrors
					);

				}

			} else if ( programLog !== '' ) {

				console.warn( 'THREE.WebGLProgram: Program Info Log:', programLog );

			}

		}

	}

	_completeCompile( renderObject, pipeline ) {

		const { state, gl } = this;
		const pipelineData = this.get( pipeline );
		const { programGPU, fragmentShader, vertexShader } = pipelineData;

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			this._logProgramError( programGPU, fragmentShader, vertexShader );

		}

		state.useProgram( programGPU );

		// Bindings

		const bindings = renderObject.getBindings();

		this._setupBindings( bindings, programGPU );

		//

		this.set( pipeline, {
			programGPU
		} );

	}

	createComputePipeline( computePipeline, bindings ) {

		const { state, gl } = this;

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
			gl.SEPARATE_ATTRIBS
		);

		gl.linkProgram( programGPU );

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			this._logProgramError( programGPU, fragmentShader, vertexShader );


		}

		state.useProgram( programGPU );

		// Bindings

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

	createBindings( bindGroup, bindings ) {

		if ( this._knownBindings.has( bindings ) === false ) {

			this._knownBindings.add( bindings );

			let uniformBuffers = 0;
			let textures = 0;

			for ( const bindGroup of bindings ) {

				this.set( bindGroup, {
					textures: textures,
					uniformBuffers: uniformBuffers
				} );

				for ( const binding of bindGroup.bindings ) {

					if ( binding.isUniformBuffer ) uniformBuffers ++;
					if ( binding.isSampledTexture ) textures ++;

				}

			}

		}

		this.updateBindings( bindGroup, bindings );

	}

	updateBindings( bindGroup /*, bindings*/ ) {

		const { gl } = this;

		const bindGroupData = this.get( bindGroup );

		let i = bindGroupData.uniformBuffers;
		let t = bindGroupData.textures;

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const data = binding.buffer;
				const bufferGPU = gl.createBuffer();

				gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
				gl.bufferData( gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW );

				this.set( binding, {
					index: i ++,
					bufferGPU
				} );

			} else if ( binding.isSampledTexture ) {

				const { textureGPU, glTextureType } = this.get( binding.texture );

				this.set( binding, {
					index: t ++,
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

		if ( this.has( attribute ) ) return;

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

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

	copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level ) {

		this.textureUtils.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level );

	}

	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		this.textureUtils.copyFramebufferToTexture( texture, renderContext, rectangle );

	}

	_setFramebuffer( descriptor ) {

		const { gl, state } = this;

		let currentFrameBuffer = null;

		if ( descriptor.textures !== null ) {

			const renderTarget = descriptor.renderTarget;
			const renderTargetContextData = this.get( renderTarget );
			const { samples, depthBuffer, stencilBuffer } = renderTarget;

			const isCube = renderTarget.isWebGLCubeRenderTarget === true;

			let msaaFb = renderTargetContextData.msaaFrameBuffer;
			let depthRenderbuffer = renderTargetContextData.depthRenderbuffer;

			const cacheKey = getCacheKey( descriptor );

			let fb;

			if ( isCube ) {

				renderTargetContextData.cubeFramebuffers || ( renderTargetContextData.cubeFramebuffers = {} );

				fb = renderTargetContextData.cubeFramebuffers[ cacheKey ];

			} else {

				renderTargetContextData.framebuffers || ( renderTargetContextData.framebuffers = {} );

				fb = renderTargetContextData.framebuffers[ cacheKey ];

			}

			if ( fb === undefined ) {

				fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.FRAMEBUFFER, fb );

				const textures = descriptor.textures;

				if ( isCube ) {

					renderTargetContextData.cubeFramebuffers[ cacheKey ] = fb;

					const { textureGPU } = this.get( textures[ 0 ] );

					const cubeFace = this.renderer._activeCubeFace;

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, textureGPU, 0 );

				} else {

					renderTargetContextData.framebuffers[ cacheKey ] = fb;

					for ( let i = 0; i < textures.length; i ++ ) {

						const texture = textures[ i ];
						const textureData = this.get( texture );
						textureData.renderTarget = descriptor.renderTarget;
						textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

						const attachment = gl.COLOR_ATTACHMENT0 + i;

						gl.framebufferTexture2D( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0 );

					}

					state.drawBuffers( descriptor, fb );

				}

				if ( descriptor.depthTexture !== null ) {

					const textureData = this.get( descriptor.depthTexture );
					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
					textureData.renderTarget = descriptor.renderTarget;
					textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

					gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

				}

			}

			if ( samples > 0 ) {

				if ( msaaFb === undefined ) {

					const invalidationArray = [];

					msaaFb = gl.createFramebuffer();

					state.bindFramebuffer( gl.FRAMEBUFFER, msaaFb );

					const msaaRenderbuffers = [];

					const textures = descriptor.textures;

					for ( let i = 0; i < textures.length; i ++ ) {

						msaaRenderbuffers[ i ] = gl.createRenderbuffer();

						gl.bindRenderbuffer( gl.RENDERBUFFER, msaaRenderbuffers[ i ] );

						invalidationArray.push( gl.COLOR_ATTACHMENT0 + i );

						if ( depthBuffer ) {

							const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
							invalidationArray.push( depthStyle );

						}

						const texture = descriptor.textures[ i ];
						const textureData = this.get( texture );

						gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, textureData.glInternalFormat, descriptor.width, descriptor.height );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );


					}

					renderTargetContextData.msaaFrameBuffer = msaaFb;
					renderTargetContextData.msaaRenderbuffers = msaaRenderbuffers;

					if ( depthRenderbuffer === undefined ) {

						depthRenderbuffer = gl.createRenderbuffer();
						this.textureUtils.setupRenderBufferStorage( depthRenderbuffer, descriptor );

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

		const { gl } = this;

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

		for ( const bindGroup of bindings ) {

			for ( const binding of bindGroup.bindings ) {

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

	}

	_bindUniforms( bindings ) {

		const { gl, state } = this;

		for ( const bindGroup of bindings ) {

			for ( const binding of bindGroup.bindings ) {

				const bindingData = this.get( binding );
				const index = bindingData.index;

				if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

					// TODO USE bindBufferRange to group multiple uniform buffers
					state.bindBufferBase( gl.UNIFORM_BUFFER, index, bindingData.bufferGPU );

				} else if ( binding.isSampledTexture ) {

					state.bindTexture( bindingData.glTextureType, bindingData.textureGPU, gl.TEXTURE0 + index );

				}

			}

		}

	}

	dispose() {

		this.renderer.domElement.removeEventListener( 'webglcontextlost', this._onContextLost );

	}

}

class Sampler extends Binding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;
		this.version = texture ? texture.version : 0;

		this.isSampler = true;

	}

}

class NodeSampler extends Sampler {

	constructor( name, textureNode, groupNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;
		this.groupNode = groupNode;

	}

	update() {

		this.texture = this.textureNode.value;

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

	constructor( nodeUniform, groupNode ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.access = nodeUniform ? nodeUniform.access : GPUBufferBindingType.Storage;
		this.groupNode = groupNode;


	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

class WebGPUTexturePassUtils extends DataMap {

	constructor( device ) {

		super();

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
				label: `mipmap-${ format }`,
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
				label: `flipY-${ format }`,
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

		const textureData = this.get( textureGPU );

		if ( textureData.useCount === undefined ) {

			textureData.useCount = 0;
			textureData.layers = [];

		}

		const passes = textureData.layers[ baseArrayLayer ] || this._mipmapCreateBundles( textureGPU, textureGPUDescriptor, baseArrayLayer );

		const commandEncoder = this.device.createCommandEncoder( {} );

		this._mipmapRunBundles( commandEncoder, passes );

		this.device.queue.submit( [ commandEncoder.finish() ] );

		if ( textureData.useCount !== 0 ) textureData.layers[ baseArrayLayer ] = passes;

		textureData.useCount ++;

	}

	_mipmapCreateBundles( textureGPU, textureGPUDescriptor, baseArrayLayer ) {

		const pipeline = this.getTransferPipeline( textureGPUDescriptor.format );

		const bindGroupLayout = pipeline.getBindGroupLayout( 0 ); // @TODO: Consider making this static.

		let srcView = textureGPU.createView( {
			baseMipLevel: 0,
			mipLevelCount: 1,
			dimension: GPUTextureViewDimension.TwoD,
			baseArrayLayer
		} );

		const passes = [];

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

			const passDescriptor = {
				colorAttachments: [ {
					view: dstView,
					loadOp: GPULoadOp.Clear,
					storeOp: GPUStoreOp.Store,
					clearValue: [ 0, 0, 0, 0 ]
				} ]
			};

			const passEncoder = this.device.createRenderBundleEncoder( {
				colorFormats: [ textureGPUDescriptor.format ]
			} );

			passEncoder.setPipeline( pipeline );
			passEncoder.setBindGroup( 0, bindGroup );
			passEncoder.draw( 4, 1, 0, 0 );

			passes.push( {
				renderBundles: [ passEncoder.finish() ],
				passDescriptor
			} );

			srcView = dstView;

		}

		return passes;

	}

	_mipmapRunBundles( commandEncoder, passes ) {

		const levels = passes.length;

		for ( let i = 0; i < levels; i ++ ) {

			const pass = passes[ i ];

			const passEncoder = commandEncoder.beginRenderPass( pass.passDescriptor );

			passEncoder.executeBundles( pass.renderBundles );

			passEncoder.end();

		}

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

		this.defaultTexture = {};
		this.defaultCubeTexture = {};
		this.defaultVideoFrame = null;

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
			maxAnisotropy: 1
		};

		// anisotropy can only be used when all filter modes are set to linear.

		if ( samplerDescriptorGPU.magFilter === GPUFilterMode.Linear && samplerDescriptorGPU.minFilter === GPUFilterMode.Linear && samplerDescriptorGPU.mipmapFilter === GPUFilterMode.Linear ) {

			samplerDescriptorGPU.maxAnisotropy = texture.anisotropy;

		}

		if ( texture.isDepthTexture && texture.compareFunction !== null ) {

			samplerDescriptorGPU.compare = _compareToWebGPU[ texture.compareFunction ];

		}

		textureGPU.sampler = device.createSampler( samplerDescriptorGPU );

	}

	createDefaultTexture( texture ) {

		let textureGPU;

		const format = getFormat( texture );

		if ( texture.isCubeTexture ) {

			textureGPU = this._getDefaultCubeTextureGPU( format );

		} else if ( texture.isVideoTexture ) {

			this.backend.get( texture ).externalTexture = this._getDefaultVideoFrame();

		} else {

			textureGPU = this._getDefaultTextureGPU( format );

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

		if ( texture.isFramebufferTexture ) {

			if ( options.renderTarget ) {

				options.format = this.backend.utils.getCurrentColorFormat( options.renderTarget );

			} else {

				options.format = this.backend.utils.getPreferredCanvasFormat();

			}

		}

		const dimension = this._getDimension( texture );
		const format = texture.internalFormat || options.format || getFormat( texture, backend.device );

		textureData.format = format;

		let sampleCount = options.sampleCount !== undefined ? options.sampleCount : 1;

		sampleCount = backend.utils.getSampleCount( sampleCount );

		const primarySampleCount = texture.isRenderTargetTexture && ! texture.isMultisampleRenderTargetTexture ? 1 : sampleCount;

		let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

		if ( texture.isStorageTexture === true ) {

			usage |= GPUTextureUsage.STORAGE_BINDING;

		}

		if ( texture.isCompressedTexture !== true && texture.isCompressedArrayTexture !== true ) {

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

		if ( texture.isRenderTargetTexture && sampleCount > 1 && ! texture.isMultisampleRenderTargetTexture ) {

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

			const depth = texture.image.depth || 1;

			for ( let i = 0; i < depth; i ++ ) {

				this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU, i );

			}

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
			sampleCount: backend.utils.getSampleCount( backend.renderer.samples ),
			format: backend.utils.getPreferredCanvasFormat(),
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
		} );

		return this.colorBuffer;

	}

	getDepthBuffer( depth = true, stencil = false ) {

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

		this.createTexture( depthTexture, { sampleCount: backend.utils.getSampleCount( backend.renderer.samples ), width, height } );

		return backend.get( depthTexture ).texture;

	}

	updateTexture( texture, options ) {

		const textureData = this.backend.get( texture );

		const { textureDescriptorGPU } = textureData;

		if ( texture.isRenderTargetTexture || ( textureDescriptorGPU === undefined /* unsupported texture format */ ) )
			return;

		// transfer texture data

		if ( texture.isDataTexture ) {

			this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY );

		} else if ( texture.isDataArrayTexture || texture.isData3DTexture ) {

			for ( let i = 0; i < options.image.depth; i ++ ) {

				this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, i, texture.flipY, i );

			}

		} else if ( texture.isCompressedTexture || texture.isCompressedArrayTexture ) {

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

	async copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

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
				origin: { x, y, z: faceIndex },
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

	_getDefaultTextureGPU( format ) {

		let defaultTexture = this.defaultTexture[ format ];

		if ( defaultTexture === undefined ) {

			const texture = new Texture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1, format } );

			this.defaultTexture[ format ] = defaultTexture = texture;

		}

		return this.backend.get( defaultTexture ).texture;

	}

	_getDefaultCubeTextureGPU( format ) {

		let defaultCubeTexture = this.defaultTexture[ format ];

		if ( defaultCubeTexture === undefined ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1, depth: 6 } );

			this.defaultCubeTexture[ format ] = defaultCubeTexture = texture;

		}

		return this.backend.get( defaultCubeTexture ).texture;

	}

	_getDefaultVideoFrame() {

		let defaultVideoFrame = this.defaultVideoFrame;

		if ( defaultVideoFrame === null ) {

			const init = {
				timestamp: 0,
				codedWidth: 1,
				codedHeight: 1,
				format: 'RGBA',
			};

			this.defaultVideoFrame = defaultVideoFrame = new VideoFrame( new Uint8Array( [ 0, 0, 0, 0xff ] ), init );

		}

		return defaultVideoFrame;

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
		const isTextureArray = textureDescriptorGPU.size.depthOrArrayLayers > 1;

		for ( let i = 0; i < mipmaps.length; i ++ ) {

			const mipmap = mipmaps[ i ];

			const width = mipmap.width;
			const height = mipmap.height;
			const depth = isTextureArray ? textureDescriptorGPU.size.depthOrArrayLayers : 1;

			const bytesPerRow = Math.ceil( width / blockData.width ) * blockData.byteLength;
			const bytesPerImage = bytesPerRow * Math.ceil( height / blockData.height );

			for ( let j = 0; j < depth; j ++ ) {

				device.queue.writeTexture(
					{
						texture: textureGPU,
						mipLevel: i,
						origin: { x: 0, y: 0, z: j }
					},
					mipmap.data,
					{
						offset: j * bytesPerImage,
						bytesPerRow,
						rowsPerImage: Math.ceil( height / blockData.height )
					},
					{
						width: Math.ceil( width / blockData.width ) * blockData.width,
						height: Math.ceil( height / blockData.height ) * blockData.height,
						depthOrArrayLayers: 1
					}
				);

			}

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
		if ( format === GPUTextureFormat.R16Float ) return Uint16Array;
		if ( format === GPUTextureFormat.RG16Float ) return Uint16Array;
		if ( format === GPUTextureFormat.RGBA16Float ) return Uint16Array;


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

	if ( texture.isCompressedTexture === true || texture.isCompressedArrayTexture === true ) {

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

			case RGBAFormat:
				formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
				break;

			default:
				console.error( 'WebGPURenderer: Unsupported texture format.', format );

		}

	} else {

		switch ( format ) {

			case RGBAFormat:

				switch ( type ) {

					case ByteType:
						formatGPU = GPUTextureFormat.RGBA8Snorm;
						break;

					case ShortType:
						formatGPU = GPUTextureFormat.RGBA16Sint;
						break;

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.RGBA16Uint;
						break;
					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RGBA32Uint;
						break;

					case IntType:
						formatGPU = GPUTextureFormat.RGBA32Sint;
						break;

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

			case RGBFormat:

				switch ( type ) {

					case UnsignedInt5999Type:
						formatGPU = GPUTextureFormat.RGB9E5UFloat;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGBFormat.', type );

				}

				break;

			case RedFormat:

				switch ( type ) {

					case ByteType:
						formatGPU = GPUTextureFormat.R8Snorm;
						break;

					case ShortType:
						formatGPU = GPUTextureFormat.R16Sint;
						break;

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.R16Uint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.R32Uint;
						break;

					case IntType:
						formatGPU = GPUTextureFormat.R32Sint;
						break;

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

					case ByteType:
						formatGPU = GPUTextureFormat.RG8Snorm;
						break;

					case ShortType:
						formatGPU = GPUTextureFormat.RG16Sint;
						break;

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.RG16Uint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RG32Uint;
						break;

					case IntType:
						formatGPU = GPUTextureFormat.RG32Sint;
						break;

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

			case RedIntegerFormat:

				switch ( type ) {

					case IntType:
						formatGPU = GPUTextureFormat.R32Sint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.R32Uint;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RedIntegerFormat.', type );

				}

				break;

			case RGIntegerFormat:

				switch ( type ) {

					case IntType:
						formatGPU = GPUTextureFormat.RG32Sint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RG32Uint;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGIntegerFormat.', type );

				}

				break;

			case RGBAIntegerFormat:

				switch ( type ) {

					case IntType:
						formatGPU = GPUTextureFormat.RGBA32Sint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RGBA32Uint;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGBAIntegerFormat.', type );

				}

				break;

			default:
				console.error( 'WebGPURenderer: Unsupported texture format.', format );

		}

	}

	return formatGPU;

}

const declarationRegexp = /^[fn]*\s*([a-z_0-9]+)?\s*\(([\s\S]*?)\)\s*[\-\>]*\s*([a-z_0-9]+(?:<[\s\S]+?>)?)/i;
const propertiesRegexp = /([a-z_0-9]+)\s*:\s*([a-z_0-9]+(?:<[\s\S]+?>)?)/ig;

const wgslTypeLib$1 = {
	'f32': 'float',
	'i32': 'int',
	'u32': 'uint',
	'bool': 'bool',

	'vec2<f32>': 'vec2',
 	'vec2<i32>': 'ivec2',
 	'vec2<u32>': 'uvec2',
 	'vec2<bool>': 'bvec2',

	'vec2f': 'vec2',
	'vec2i': 'ivec2',
	'vec2u': 'uvec2',
	'vec2b': 'bvec2',

	'vec3<f32>': 'vec3',
	'vec3<i32>': 'ivec3',
	'vec3<u32>': 'uvec3',
	'vec3<bool>': 'bvec3',

	'vec3f': 'vec3',
	'vec3i': 'ivec3',
	'vec3u': 'uvec3',
	'vec3b': 'bvec3',

	'vec4<f32>': 'vec4',
	'vec4<i32>': 'ivec4',
	'vec4<u32>': 'uvec4',
	'vec4<bool>': 'bvec4',

	'vec4f': 'vec4',
	'vec4i': 'ivec4',
	'vec4u': 'uvec4',
	'vec4b': 'bvec4',

	'mat2x2<f32>': 'mat2',
	'mat2x2f': 'mat2',

	'mat3x3<f32>': 'mat3',
	'mat3x3f': 'mat3',

	'mat4x4<f32>': 'mat4',
	'mat4x4f': 'mat4',

	'sampler': 'sampler',

	'texture_1d': 'texture',

	'texture_2d': 'texture',
	'texture_2d_array': 'texture',
	'texture_multisampled_2d': 'cubeTexture',

	'texture_depth_2d': 'depthTexture',

	'texture_3d': 'texture3D',

	'texture_cube': 'cubeTexture',
	'texture_cube_array': 'cubeTexture',

	'texture_storage_1d': 'storageTexture',
	'texture_storage_2d': 'storageTexture',
	'texture_storage_2d_array': 'storageTexture',
	'texture_storage_3d': 'storageTexture'

};

const parse = ( source ) => {

	source = source.trim();

	const declaration = source.match( declarationRegexp );

	if ( declaration !== null && declaration.length === 4 ) {

		const inputsCode = declaration[ 2 ];
		const propsMatches = [];
		let match = null;

		while ( ( match = propertiesRegexp.exec( inputsCode ) ) !== null ) {

			propsMatches.push( { name: match[ 1 ], type: match[ 2 ] } );

		}

		// Process matches to correctly pair names and types
		const inputs = [];
		for ( let i = 0; i < propsMatches.length; i ++ ) {

			const { name, type } = propsMatches[ i ];

			let resolvedType = type;

			if ( resolvedType.startsWith( 'ptr' ) ) {

				resolvedType = 'pointer';

			} else {

				if ( resolvedType.startsWith( 'texture' ) ) {

					resolvedType = type.split( '<' )[ 0 ];

				}

				resolvedType = wgslTypeLib$1[ resolvedType ];

			}

			inputs.push( new NodeFunctionInput( resolvedType, name ) );

		}

		const blockCode = source.substring( declaration[ 0 ].length );
		const outputType = declaration[ 3 ] || 'void';

		const name = declaration[ 1 ] !== undefined ? declaration[ 1 ] : '';
		const type = wgslTypeLib$1[ outputType ] || outputType;

		return {
			type,
			inputs,
			name,
			inputsCode,
			blockCode,
			outputType
		};

	} else {

		throw new Error( 'FunctionNode: Function is not a WGSL code.' );

	}

};

class WGSLNodeFunction extends NodeFunction {

	constructor( source ) {

		const { type, inputs, name, inputsCode, blockCode, outputType } = parse( source );

		super( type, inputs, name );

		this.inputsCode = inputsCode;
		this.blockCode = blockCode;
		this.outputType = outputType;

	}

	getCode( name = this.name ) {

		const outputType = this.outputType !== 'void' ? '-> ' + this.outputType : '';

		return `fn ${ name } ( ${ this.inputsCode.trim() } ) ${ outputType }` + this.blockCode;

	}

}

class WGSLNodeParser extends NodeParser {

	parseFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

// GPUShaderStage is not defined in browsers not supporting WebGPU
const GPUShaderStage = self.GPUShaderStage;

const wrapNames = {
	[ RepeatWrapping ]: 'repeat',
	[ ClampToEdgeWrapping ]: 'clamp',
	[ MirroredRepeatWrapping ]: 'mirror'
};

const gpuShaderStageLib = {
	'vertex': GPUShaderStage ? GPUShaderStage.VERTEX : 1,
	'fragment': GPUShaderStage ? GPUShaderStage.FRAGMENT : 2,
	'compute': GPUShaderStage ? GPUShaderStage.COMPUTE : 4
};

const supports = {
	instance: true,
	swizzleAssign: false,
	storageBuffer: true
};

const wgslFnOpLib = {
	'^^': 'tsl_xor'
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
	mat3: 'mat3x3<f32>',
	mat4: 'mat4x4<f32>'
};

const wgslCodeCache = {};

const wgslPolyfill = {
	tsl_xor: new CodeNode( 'fn tsl_xor( a : bool, b : bool ) -> bool { return ( a || b ) && !( a && b ); }' ),
	mod_float: new CodeNode( 'fn tsl_mod_float( x : f32, y : f32 ) -> f32 { return x - y * floor( x / y ); }' ),
	mod_vec2: new CodeNode( 'fn tsl_mod_vec2( x : vec2f, y : vec2f ) -> vec2f { return x - y * floor( x / y ); }' ),
	mod_vec3: new CodeNode( 'fn tsl_mod_vec3( x : vec3f, y : vec3f ) -> vec3f { return x - y * floor( x / y ); }' ),
	mod_vec4: new CodeNode( 'fn tsl_mod_vec4( x : vec4f, y : vec4f ) -> vec4f { return x - y * floor( x / y ); }' ),
	equals_bool: new CodeNode( 'fn tsl_equals_bool( a : bool, b : bool ) -> bool { return a == b; }' ),
	equals_bvec2: new CodeNode( 'fn tsl_equals_bvec2( a : vec2f, b : vec2f ) -> vec2<bool> { return vec2<bool>( a.x == b.x, a.y == b.y ); }' ),
	equals_bvec3: new CodeNode( 'fn tsl_equals_bvec3( a : vec3f, b : vec3f ) -> vec3<bool> { return vec3<bool>( a.x == b.x, a.y == b.y, a.z == b.z ); }' ),
	equals_bvec4: new CodeNode( 'fn tsl_equals_bvec4( a : vec4f, b : vec4f ) -> vec4<bool> { return vec4<bool>( a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w ); }' ),
	repeatWrapping_float: new CodeNode( 'fn tsl_repeatWrapping_float( coord: f32 ) -> f32 { return fract( coord ); }' ),
	mirrorWrapping_float: new CodeNode( 'fn tsl_mirrorWrapping_float( coord: f32 ) -> f32 { let mirrored = fract( coord * 0.5 ) * 2.0; return 1.0 - abs( 1.0 - mirrored ); }' ),
	clampWrapping_float: new CodeNode( 'fn tsl_clampWrapping_float( coord: f32 ) -> f32 { return clamp( coord, 0.0, 1.0 ); }' ),
	repeatWrapping: new CodeNode( /* wgsl */`
fn tsl_repeatWrapping( uv : vec2<f32>, dimension : vec2<u32> ) -> vec2<u32> {

	let uvScaled = vec2<u32>( uv * vec2<f32>( dimension ) );

	return ( ( uvScaled % dimension ) + dimension ) % dimension;

}
` ),
	biquadraticTexture: new CodeNode( /* wgsl */`
fn tsl_biquadraticTexture( map : texture_2d<f32>, coord : vec2f, iRes : vec2u, level : i32 ) -> vec4f {

	let res = vec2f( iRes );

	let uvScaled = coord * res;
	let uvWrapping = ( ( uvScaled % res ) + res ) % res;

	// https://www.shadertoy.com/view/WtyXRy

	let uv = uvWrapping - 0.5;
	let iuv = floor( uv );
	let f = fract( uv );

	let rg1 = textureLoad( map, vec2u( iuv + vec2( 0.5, 0.5 ) ) % iRes, level );
	let rg2 = textureLoad( map, vec2u( iuv + vec2( 1.5, 0.5 ) ) % iRes, level );
	let rg3 = textureLoad( map, vec2u( iuv + vec2( 0.5, 1.5 ) ) % iRes, level );
	let rg4 = textureLoad( map, vec2u( iuv + vec2( 1.5, 1.5 ) ) % iRes, level );

	return mix( mix( rg1, rg2, f.x ), mix( rg3, rg4, f.x ), f.y );

}
` )
};

const wgslMethods = {
	dFdx: 'dpdx',
	dFdy: '- dpdy',
	mod_float: 'tsl_mod_float',
	mod_vec2: 'tsl_mod_vec2',
	mod_vec3: 'tsl_mod_vec3',
	mod_vec4: 'tsl_mod_vec4',
	equals_bool: 'tsl_equals_bool',
	equals_bvec2: 'tsl_equals_bvec2',
	equals_bvec3: 'tsl_equals_bvec3',
	equals_bvec4: 'tsl_equals_bvec4',
	inversesqrt: 'inverseSqrt',
	bitcast: 'bitcast<f32>'
};

// WebGPU issue: does not support pow() with negative base on Windows

if ( /Windows/g.test( navigator.userAgent ) ) {

	wgslPolyfill.pow_float = new CodeNode( 'fn tsl_pow_float( a : f32, b : f32 ) -> f32 { return select( -pow( -a, b ), pow( a, b ), a > 0.0 ); }' );
	wgslPolyfill.pow_vec2 = new CodeNode( 'fn tsl_pow_vec2( a : vec2f, b : vec2f ) -> vec2f { return vec2f( tsl_pow_float( a.x, b.x ), tsl_pow_float( a.y, b.y ) ); }', [ wgslPolyfill.pow_float ] );
	wgslPolyfill.pow_vec3 = new CodeNode( 'fn tsl_pow_vec3( a : vec3f, b : vec3f ) -> vec3f { return vec3f( tsl_pow_float( a.x, b.x ), tsl_pow_float( a.y, b.y ), tsl_pow_float( a.z, b.z ) ); }', [ wgslPolyfill.pow_float ] );
	wgslPolyfill.pow_vec4 = new CodeNode( 'fn tsl_pow_vec4( a : vec4f, b : vec4f ) -> vec4f { return vec4f( tsl_pow_float( a.x, b.x ), tsl_pow_float( a.y, b.y ), tsl_pow_float( a.z, b.z ), tsl_pow_float( a.w, b.w ) ); }', [ wgslPolyfill.pow_float ] );

	wgslMethods.pow_float = 'tsl_pow_float';
	wgslMethods.pow_vec2 = 'tsl_pow_vec2';
	wgslMethods.pow_vec3 = 'tsl_pow_vec3';
	wgslMethods.pow_vec4 = 'tsl_pow_vec4';

}

//

let diagnostics = '';

if ( /Firefox|Deno/g.test( navigator.userAgent ) !== true ) {

	diagnostics += 'diagnostic( off, derivative_uniformity );\n';

}

//

class WGSLNodeBuilder extends NodeBuilder {

	constructor( object, renderer ) {

		super( object, renderer, new WGSLNodeParser() );

		this.uniformGroups = {};

		this.builtins = {};

		this.directives = {};

		this.scopedArrays = new Map();

	}

	needsToWorkingColorSpace( texture ) {

		return texture.isVideoTexture === true && texture.colorSpace !== NoColorSpace;

	}

	_generateTextureSample( texture, textureProperty, uvSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			if ( depthSnippet ) {

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ depthSnippet } )`;

			} else {

				return `textureSample( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet } )`;

			}

		} else if ( this.isFilteredTexture( texture ) ) {

			return this.generateFilteredTexture( texture, textureProperty, uvSnippet );

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, '0' );

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

		} else if ( this.isFilteredTexture( texture ) ) {

			return this.generateFilteredTexture( texture, textureProperty, uvSnippet, levelSnippet );

		} else {

			return this.generateTextureLod( texture, textureProperty, uvSnippet, levelSnippet );

		}

	}

	generateWrapFunction( texture ) {

		const functionName = `tsl_coord_${ wrapNames[ texture.wrapS ] }S_${ wrapNames[ texture.wrapT ] }T`;

		let nodeCode = wgslCodeCache[ functionName ];

		if ( nodeCode === undefined ) {

			let code = `fn ${ functionName }( coord : vec2f ) -> vec2f {\n\n\treturn vec2f(\n`;

			const addWrapSnippet = ( wrap, axis ) => {

				if ( wrap === RepeatWrapping ) {

					this._include( 'repeatWrapping_float' );

					code += `\t\ttsl_repeatWrapping_float( coord.${ axis } )`;

				} else if ( wrap === ClampToEdgeWrapping ) {

					this._include( 'clampWrapping_float' );

					code += `\t\ttsl_clampWrapping_float( coord.${ axis } )`;

				} else if ( wrap === MirroredRepeatWrapping ) {

					this._include( 'mirrorWrapping_float' );

					code += `\t\ttsl_mirrorWrapping_float( coord.${ axis } )`;

				} else {

					code += `\t\tcoord.${ axis }`;

					console.warn( `WebGPURenderer: Unsupported texture wrap type "${ wrap }" for vertex shader.` );

				}

			};

			addWrapSnippet( texture.wrapS, 'x' );

			code += ',\n';

			addWrapSnippet( texture.wrapT, 'y' );

			code += '\n\t);\n\n}\n';

			wgslCodeCache[ functionName ] = nodeCode = new CodeNode( code );

		}

		nodeCode.build( this );

		return functionName;

	}

	generateTextureDimension( texture, textureProperty, levelSnippet ) {

		const textureData = this.getDataFromNode( texture, this.shaderStage, this.globalCache );

		if ( textureData.dimensionsSnippet === undefined ) textureData.dimensionsSnippet = {};

		let propertyName = textureData.dimensionsSnippet[ levelSnippet ];

		if ( textureData.dimensionsSnippet[ levelSnippet ] === undefined ) {

			propertyName = `textureDimension_${ texture.id }_${ levelSnippet }`;

			this.addLineFlowCode( `let ${ propertyName } = textureDimensions( ${ textureProperty }, i32( ${ levelSnippet } ) );` );

			textureData.dimensionsSnippet[ levelSnippet ] = propertyName;

		}

		return propertyName;

	}

	generateFilteredTexture( texture, textureProperty, uvSnippet, levelSnippet = '0' ) {

		this._include( 'biquadraticTexture' );

		const wrapFunction = this.generateWrapFunction( texture );
		const textureDimension = this.generateTextureDimension( texture, textureProperty, levelSnippet );

		return `tsl_biquadraticTexture( ${ textureProperty }, ${ wrapFunction }( ${ uvSnippet } ), ${ textureDimension }, i32( ${ levelSnippet } ) )`;

	}

	generateTextureLod( texture, textureProperty, uvSnippet, levelSnippet = '0' ) {

		this._include( 'repeatWrapping' );

		const dimension = texture.isMultisampleRenderTargetTexture === true ? `textureDimensions( ${ textureProperty } )` : `textureDimensions( ${ textureProperty }, 0 )`;

		return `textureLoad( ${ textureProperty }, tsl_repeatWrapping( ${ uvSnippet }, ${ dimension } ), i32( ${ levelSnippet } ) )`;

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

		return this.getComponentTypeFromTexture( texture ) !== 'float' || ( ! this.isAvailable( 'float32Filterable' ) && texture.isDataTexture === true && texture.type === FloatType ) || texture.isMultisampleRenderTargetTexture === true;

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

	generateTextureGrad( texture, textureProperty, uvSnippet, gradSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			// TODO handle i32 or u32 --> uvSnippet, array_index: A, ddx, ddy
			return `textureSampleGrad( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet },  ${ gradSnippet[ 0 ] }, ${ gradSnippet[ 1 ] } )`;

		} else {

			console.error( `WebGPURenderer: THREE.TextureNode.gradient() does not support ${ shaderStage } shader.` );

		}

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

	generateTextureBias( texture, textureProperty, uvSnippet, biasSnippet, depthSnippet, shaderStage = this.shaderStage ) {

		if ( shaderStage === 'fragment' ) {

			return `textureSampleBias( ${ textureProperty }, ${ textureProperty }_sampler, ${ uvSnippet }, ${ biasSnippet } )`;

		} else {

			console.error( `WebGPURenderer: THREE.TextureNode.biasNode does not support ${ shaderStage } shader.` );

		}

	}

	getPropertyName( node, shaderStage = this.shaderStage ) {

		if ( node.isNodeVarying === true && node.needsInterpolation === true ) {

			if ( shaderStage === 'vertex' ) {

				return `varyings.${ node.name }`;

			}

		} else if ( node.isNodeUniform === true ) {

			const name = node.name;
			const type = node.type;

			if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) {

				return name;

			} else if ( type === 'buffer' || type === 'storageBuffer' || type === 'indirectStorageBuffer' ) {

				return `NodeBuffer_${ node.id }.${name}`;

			} else {

				return node.groupNode.name + '.' + name;

			}

		}

		return super.getPropertyName( node );

	}

	getOutputStructName() {

		return 'output';

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

	getStorageAccess( node ) {

		if ( node.isStorageTextureNode ) {

			switch ( node.access ) {

				case GPUStorageTextureAccess.ReadOnly:

					return 'read';

				case GPUStorageTextureAccess.WriteOnly:

					return 'write';

				default:

					return 'read_write';

			}

		} else {

			switch ( node.access ) {

				case GPUBufferBindingType.Storage:

					return 'read_write';


				case GPUBufferBindingType.ReadOnlyStorage:

					return 'read';

				default:

					return 'write';

			}

		}

	}

	getUniformFromNode( node, type, shaderStage, name = null ) {

		const uniformNode = super.getUniformFromNode( node, type, shaderStage, name );
		const nodeData = this.getDataFromNode( node, shaderStage, this.globalCache );

		if ( nodeData.uniformGPU === undefined ) {

			let uniformGPU;

			const group = node.groupNode;
			const groupName = group.name;

			const bindings = this.getBindGroupArray( groupName, shaderStage );

			if ( type === 'texture' || type === 'cubeTexture' || type === 'storageTexture' || type === 'texture3D' ) {

				let texture = null;

				if ( type === 'texture' || type === 'storageTexture' ) {

					texture = new NodeSampledTexture( uniformNode.name, uniformNode.node, group, node.access ? node.access : null );

				} else if ( type === 'cubeTexture' ) {

					texture = new NodeSampledCubeTexture( uniformNode.name, uniformNode.node, group, node.access ? node.access : null );

				} else if ( type === 'texture3D' ) {

					texture = new NodeSampledTexture3D( uniformNode.name, uniformNode.node, group, node.access ? node.access : null );

				}

				texture.store = node.isStorageTextureNode === true;
				texture.setVisibility( gpuShaderStageLib[ shaderStage ] );

				if ( shaderStage === 'fragment' && this.isUnfilterable( node.value ) === false && texture.store === false ) {

					const sampler = new NodeSampler( `${uniformNode.name}_sampler`, uniformNode.node, group );
					sampler.setVisibility( gpuShaderStageLib[ shaderStage ] );

					bindings.push( sampler, texture );

					uniformGPU = [ sampler, texture ];

				} else {

					bindings.push( texture );

					uniformGPU = [ texture ];

				}

			} else if ( type === 'buffer' || type === 'storageBuffer' || type === 'indirectStorageBuffer' ) {

				const bufferClass = type === 'buffer' ? NodeUniformBuffer : NodeStorageBuffer;

				const buffer = new bufferClass( node, group );
				buffer.setVisibility( gpuShaderStageLib[ shaderStage ] );

				bindings.push( buffer );

				uniformGPU = buffer;

			} else {

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

		}

		return uniformNode;

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

	hasBuiltin( name, shaderStage = this.shaderStage ) {

		return ( this.builtins[ shaderStage ] !== undefined && this.builtins[ shaderStage ].has( name ) );

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

		let code = `fn ${ layout.name }( ${ parameters.join( ', ' ) } ) -> ${ this.getType( layout.type ) } {
${ flowData.vars }
${ flowData.code }
`;

		if ( flowData.result ) {

			code += `\treturn ${ flowData.result };\n`;

		}

		code += '\n}\n';

		//

		return code;

	}

	getInstanceIndex() {

		if ( this.shaderStage === 'vertex' ) {

			return this.getBuiltin( 'instance_index', 'instanceIndex', 'u32', 'attribute' );

		}

		return 'instanceIndex';

	}

	getInvocationLocalIndex() {

		return this.getBuiltin( 'local_invocation_index', 'invocationLocalIndex', 'u32', 'attribute' );

	}

	getSubgroupSize() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_size', 'subgroupSize', 'u32', 'attribute' );

	}

	getInvocationSubgroupIndex() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_invocation_id', 'invocationSubgroupIndex', 'u32', 'attribute' );

	}

	getSubgroupIndex() {

		this.enableSubGroups();

		return this.getBuiltin( 'subgroup_id', 'subgroupIndex', 'u32', 'attribute' );

	}

	getDrawIndex() {

		return null;

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

	getClipDistance() {

		return 'varyings.hw_clip_distances';

	}

	isFlipY() {

		return false;

	}

	enableDirective( name, shaderStage = this.shaderStage ) {

		const stage = this.directives[ shaderStage ] || ( this.directives[ shaderStage ] = new Set() );
		stage.add( name );

	}

	getDirectives( shaderStage ) {

		const snippets = [];
		const directives = this.directives[ shaderStage ];

		if ( directives !== undefined ) {

			for ( const directive of directives ) {

				snippets.push( `enable ${directive};` );

			}

		}

		return snippets.join( '\n' );

	}

	enableSubGroups() {

		this.enableDirective( 'subgroups' );

	}

	enableSubgroupsF16() {

		this.enableDirective( 'subgroups-f16' );

	}

	enableClipDistances() {

		this.enableDirective( 'clip_distances' );

	}

	enableShaderF16() {

		this.enableDirective( 'f16' );

	}

	enableDualSourceBlending() {

		this.enableDirective( 'dual_source_blending' );

	}

	enableHardwareClipping( planeCount ) {

		this.enableClipDistances();
		this.getBuiltin( 'clip_distances', 'hw_clip_distances', `array<f32, ${ planeCount } >`, 'vertex' );

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

	getScopedArray( name, scope, bufferType, bufferCount ) {

		if ( this.scopedArrays.has( name ) === false ) {

			this.scopedArrays.set( name, {
				name,
				scope,
				bufferType,
				bufferCount
			} );

		}

		return name;

	}

	getScopedArrays( shaderStage ) {

		if ( shaderStage !== 'compute' ) {

			return;

		}

		const snippets = [];

		for ( const { name, scope, bufferType, bufferCount } of this.scopedArrays.values() ) {

			const type = this.getType( bufferType );

			snippets.push( `var<${scope}> ${name}: array< ${type}, ${bufferCount} >;` );

		}

		return snippets.join( '\n' );

	}

	getAttributes( shaderStage ) {

		const snippets = [];

		if ( shaderStage === 'compute' ) {

			this.getBuiltin( 'global_invocation_id', 'id', 'vec3<u32>', 'attribute' );
			this.getBuiltin( 'workgroup_id', 'workgroupId', 'vec3<u32>', 'attribute' );
			this.getBuiltin( 'local_invocation_id', 'localId', 'vec3<u32>', 'attribute' );
			this.getBuiltin( 'num_workgroups', 'numWorkgroups', 'vec3<u32>', 'attribute' );

			if ( this.renderer.hasFeature( 'subgroups' ) ) {

				this.enableDirective( 'subgroups', shaderStage );
				this.getBuiltin( 'subgroup_size', 'subgroupSize', 'u32', 'attribute' );

			}

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

		const builtins = this.getBuiltins( 'output' );

		if ( builtins ) snippets.push( '\t' + builtins );

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

			snippets.push( `\nvar<private> output : ${ name };\n\n` );

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

		for ( const uniform of uniforms ) {

			const groupName = uniform.groupNode.name;
			const uniformIndexes = this.bindingsIndexes[ groupName ];

			if ( uniform.type === 'texture' || uniform.type === 'cubeTexture' || uniform.type === 'storageTexture' || uniform.type === 'texture3D' ) {

				const texture = uniform.node.value;

				if ( shaderStage === 'fragment' && this.isUnfilterable( texture ) === false && uniform.node.isStorageTextureNode !== true ) {

					if ( texture.isDepthTexture === true && texture.compareFunction !== null ) {

						bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name }_sampler : sampler_comparison;` );

					} else {

						bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name }_sampler : sampler;` );

					}

				}

				let textureType;

				let multisampled = '';

				if ( texture.isMultisampleRenderTargetTexture === true ) {

					multisampled = '_multisampled';

				}

				if ( texture.isCubeTexture === true ) {

					textureType = 'texture_cube<f32>';

				} else if ( texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

					textureType = 'texture_2d_array<f32>';

				} else if ( texture.isDepthTexture === true ) {

					textureType = `texture_depth${multisampled}_2d`;

				} else if ( texture.isVideoTexture === true ) {

					textureType = 'texture_external';

				} else if ( texture.isData3DTexture === true ) {

					textureType = 'texture_3d<f32>';

				} else if ( uniform.node.isStorageTextureNode === true ) {

					const format = getFormat( texture );
					const access = this.getStorageAccess( uniform.node );

					textureType = `texture_storage_2d<${ format }, ${ access }>`;

				} else {

					const componentPrefix = this.getComponentTypeFromTexture( texture ).charAt( 0 );

					textureType = `texture${multisampled}_2d<${ componentPrefix }32>`;

				}

				bindingSnippets.push( `@binding( ${ uniformIndexes.binding ++ } ) @group( ${ uniformIndexes.group } ) var ${ uniform.name } : ${ textureType };` );

			} else if ( uniform.type === 'buffer' || uniform.type === 'storageBuffer' || uniform.type === 'indirectStorageBuffer' ) {

				const bufferNode = uniform.node;
				const bufferType = this.getType( bufferNode.bufferType );
				const bufferCount = bufferNode.bufferCount;

				const bufferCountSnippet = bufferCount > 0 && uniform.type === 'buffer' ? ', ' + bufferCount : '';
				const bufferTypeSnippet = bufferNode.isAtomic ? `atomic<${bufferType}>` : `${bufferType}`;
				const bufferSnippet = `\t${ uniform.name } : array< ${ bufferTypeSnippet }${ bufferCountSnippet } >\n`;
				const bufferAccessMode = bufferNode.isStorageBufferNode ? `storage, ${ this.getStorageAccess( bufferNode ) }` : 'uniform';

				bufferSnippets.push( this._getWGSLStructBinding( 'NodeBuffer_' + bufferNode.id, bufferSnippet, bufferAccessMode, uniformIndexes.binding ++, uniformIndexes.group ) );

			} else {

				const vectorType = this.getType( this.getVectorType( uniform.type ) );
				const groupName = uniform.groupNode.name;

				const group = uniformGroups[ groupName ] || ( uniformGroups[ groupName ] = {
					index: uniformIndexes.binding ++,
					id: uniformIndexes.group,
					snippets: []
				} );

				group.snippets.push( `\t${ uniform.name } : ${ vectorType }` );

			}

		}

		for ( const name in uniformGroups ) {

			const group = uniformGroups[ name ];

			structSnippets.push( this._getWGSLStructBinding( name, group.snippets.join( ',\n' ), 'uniform', group.index, group.id ) );

		}

		let code = bindingSnippets.join( '\n' );
		code += bufferSnippets.join( '\n' );
		code += structSnippets.join( '\n' );

		return code;

	}

	buildCode() {

		const shadersData = this.material !== null ? { fragment: {}, vertex: {} } : { compute: {} };

		this.sortBindingGroups();

		for ( const shaderStage in shadersData ) {

			const stageData = shadersData[ shaderStage ];
			stageData.uniforms = this.getUniforms( shaderStage );
			stageData.attributes = this.getAttributes( shaderStage );
			stageData.varyings = this.getVaryings( shaderStage );
			stageData.structs = this.getStructs( shaderStage );
			stageData.vars = this.getVars( shaderStage );
			stageData.codes = this.getCodes( shaderStage );
			stageData.directives = this.getDirectives( shaderStage );
			stageData.scopedArrays = this.getScopedArrays( shaderStage );

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

		let result = supports[ name ];

		if ( result === undefined ) {

			if ( name === 'float32Filterable' ) {

				result = this.renderer.hasFeature( 'float32-filterable' );

			} else if ( name === 'clipDistance' ) {

				result = this.renderer.hasFeature( 'clip-distances' );

			}

			supports[ name ] = result;

		}

		return result;

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
// directives
${shaderData.directives}

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
// global
${ diagnostics }

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
// directives
${shaderData.directives}

// system
var<private> instanceIndex : u32;

// locals
${shaderData.scopedArrays}

// uniforms
${shaderData.uniforms}

// codes
${shaderData.codes}

@compute @workgroup_size( ${workgroupSize} )
fn main( ${shaderData.attributes} ) {

	// system
	instanceIndex = id.x + id.y * numWorkgroups.x * u32(${workgroupSize}) + id.z * numWorkgroups.x * numWorkgroups.y * u32(${workgroupSize});

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

		return this.backend.get( texture ).format;

	}

	getCurrentColorFormat( renderContext ) {

		let format;

		if ( renderContext.textures !== null ) {

			format = this.getTextureFormatGPU( renderContext.textures[ 0 ] );

		} else {

			format = this.getPreferredCanvasFormat(); // default context format

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

	getSampleCount( sampleCount ) {

		let count = 1;

		if ( sampleCount > 1 ) {

			// WebGPU only supports power-of-two sample counts and 2 is not a valid value
			count = Math.pow( 2, Math.floor( Math.log2( sampleCount ) ) );

			if ( count === 2 ) {

				count = 4;

			}

		}

		return count;

	}

	getSampleCountRenderContext( renderContext ) {

		if ( renderContext.textures !== null ) {

			return this.getSampleCount( renderContext.sampleCount );

		}

		return this.getSampleCount( this.backend.renderer.samples );

	}

	getPreferredCanvasFormat() {

		// TODO: Remove this check when Quest 34.5 is out
		// https://github.com/mrdoob/three.js/pull/29221/files#r1731833949

		if ( navigator.userAgent.includes( 'Quest' ) ) {

			return GPUTextureFormat.BGRA8Unorm;

		} else {

			return navigator.gpu.getPreferredCanvasFormat();

		}

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
	[ Int16Array, 'sint32' ], // patch for INT16
	[ Uint32Array, 'uint32' ],
	[ Uint16Array, 'uint32' ], // patch for UINT16
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

			// patch for INT16 and UINT16
			if ( attribute.normalized === false && ( array.constructor === Int16Array || array.constructor === Uint16Array ) ) {

				const tempArray = new Uint32Array( array.length );
				for ( let i = 0; i < array.length; i ++ ) {

					tempArray[ i ] = array[ i ];

				}

				array = tempArray;

			}

			bufferAttribute.array = array;

			if ( ( bufferAttribute.isStorageBufferAttribute || bufferAttribute.isStorageInstancedBufferAttribute ) && bufferAttribute.itemSize === 3 ) {

				array = new array.constructor( bufferAttribute.count * 4 );

				for ( let i = 0; i < bufferAttribute.count; i ++ ) {

					array.set( bufferAttribute.array.subarray( i * 3, i * 3 + 3 ), i * 4 );

				}

				// Update BufferAttribute
				bufferAttribute.itemSize = 4;
				bufferAttribute.array = array;

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

				// patch for INT16 and UINT16
				if ( geometryAttribute.normalized === false && ( geometryAttribute.array.constructor === Int16Array || geometryAttribute.array.constructor === Uint16Array ) ) {

					arrayStride = 4;

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

		const readBufferGPU = device.createBuffer( {
			label: attribute.name,
			size,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
		} );


		const cmdEncoder = device.createCommandEncoder( {} );

		cmdEncoder.copyBufferToBuffer(
			bufferGPU,
			0,
			readBufferGPU,
			0,
			size
		);

		readBufferGPU.unmap();

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
		this.bindGroupLayoutCache = new WeakMap();

	}

	createBindingsLayout( bindGroup ) {

		const backend = this.backend;
		const device = backend.device;

		const entries = [];

		let index = 0;

		for ( const binding of bindGroup.bindings ) {

			const bindingGPU = {
				binding: index ++,
				visibility: binding.visibility
			};

			if ( binding.isUniformBuffer || binding.isStorageBuffer ) {

				const buffer = {}; // GPUBufferBindingLayout

				if ( binding.isStorageBuffer ) {

					buffer.type = binding.access;

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
				const access = binding.access;

				bindingGPU.storageTexture = { format, access }; // GPUStorageTextureBindingLayout

			} else if ( binding.isSampledTexture ) {

				const texture = {}; // GPUTextureBindingLayout

				if ( binding.texture.isMultisampleRenderTargetTexture === true ) {

					texture.multisampled = true;

				}

				if ( binding.texture.isDepthTexture ) {

					texture.sampleType = GPUTextureSampleType.Depth;

				} else if ( binding.texture.isDataTexture || binding.texture.isDataArrayTexture || binding.texture.isData3DTexture ) {

					const type = binding.texture.type;

					if ( type === IntType ) {

						texture.sampleType = GPUTextureSampleType.SInt;

					} else if ( type === UnsignedIntType ) {

						texture.sampleType = GPUTextureSampleType.UInt;

					} else if ( type === FloatType ) {

						if ( this.backend.hasFeature( 'float32-filterable' ) ) {

							texture.sampleType = GPUTextureSampleType.Float;

						} else {

							texture.sampleType = GPUTextureSampleType.UnfilterableFloat;

						}

					}

				}

				if ( binding.isSampledCubeTexture ) {

					texture.viewDimension = GPUTextureViewDimension.Cube;

				} else if ( binding.texture.isDataArrayTexture || binding.texture.isCompressedArrayTexture ) {

					texture.viewDimension = GPUTextureViewDimension.TwoDArray;

				} else if ( binding.isSampledTexture3D ) {

					texture.viewDimension = GPUTextureViewDimension.ThreeD;

				}

				bindingGPU.texture = texture;

			} else {

				console.error( `WebGPUBindingUtils: Unsupported binding "${ binding }".` );

			}

			entries.push( bindingGPU );

		}

		return device.createBindGroupLayout( { entries } );

	}

	createBindings( bindGroup ) {

		const { backend, bindGroupLayoutCache } = this;
		const bindingsData = backend.get( bindGroup );

		// setup (static) binding layout and (dynamic) binding group

		let bindLayoutGPU = bindGroupLayoutCache.get( bindGroup.bindingsReference );

		if ( bindLayoutGPU === undefined ) {

			bindLayoutGPU = this.createBindingsLayout( bindGroup );
			bindGroupLayoutCache.set( bindGroup.bindingsReference, bindLayoutGPU );

		}

		const bindGroupGPU = this.createBindGroup( bindGroup, bindLayoutGPU );

		bindingsData.layout = bindLayoutGPU;
		bindingsData.group = bindGroupGPU;

	}

	updateBinding( binding ) {

		const backend = this.backend;
		const device = backend.device;

		const buffer = binding.buffer;
		const bufferGPU = backend.get( binding ).buffer;

		device.queue.writeBuffer( bufferGPU, 0, buffer, 0 );

	}

	createBindGroup( bindGroup, layoutGPU ) {

		const backend = this.backend;
		const device = backend.device;

		let bindingPoint = 0;
		const entriesGPU = [];

		for ( const binding of bindGroup.bindings ) {

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

				let resourceGPU;

				if ( textureData.externalTexture !== undefined ) {

					resourceGPU = device.importExternalTexture( { source: textureData.externalTexture } );

				} else {

					const mipLevelCount = binding.store ? 1 : textureData.texture.mipLevelCount;
					const propertyName = `view-${ textureData.texture.width }-${ textureData.texture.height }-${ mipLevelCount }`;

					resourceGPU = textureData[ propertyName ];

					if ( resourceGPU === undefined ) {

						const aspectGPU = GPUTextureAspect.All;

						let dimensionViewGPU;

						if ( binding.isSampledCubeTexture ) {

							dimensionViewGPU = GPUTextureViewDimension.Cube;

						} else if ( binding.isSampledTexture3D ) {

							dimensionViewGPU = GPUTextureViewDimension.ThreeD;

						} else if ( binding.texture.isDataArrayTexture || binding.texture.isCompressedArrayTexture ) {

							dimensionViewGPU = GPUTextureViewDimension.TwoDArray;

						} else {

							dimensionViewGPU = GPUTextureViewDimension.TwoD;

						}

						resourceGPU = textureData[ propertyName ] = textureData.texture.createView( { aspect: aspectGPU, dimension: dimensionViewGPU, mipLevelCount } );

					}

				}

				entriesGPU.push( { binding: bindingPoint, resource: resourceGPU } );

			}

			bindingPoint ++;

		}

		return device.createBindGroup( {
			label: 'bindGroup_' + bindGroup.name,
			layout: layoutGPU,
			entries: entriesGPU
		} );

	}

}

class WebGPUPipelineUtils {

	constructor( backend ) {

		this.backend = backend;

	}

	_getSampleCount( renderObjectContext ) {

		return this.backend.utils.getSampleCountRenderContext( renderObjectContext );

	}

	createRenderPipeline( renderObject, promises ) {

		const { object, material, geometry, pipeline } = renderObject;
		const { vertexProgram, fragmentProgram } = pipeline;

		const backend = this.backend;
		const device = backend.device;
		const utils = backend.utils;

		const pipelineData = backend.get( pipeline );

		// bind group layouts

		const bindGroupLayouts = [];

		for ( const bindGroup of renderObject.getBindings() ) {

			const bindingsData = backend.get( bindGroup );

			bindGroupLayouts.push( bindingsData.layout );

		}

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

		const sampleCount = this._getSampleCount( renderObject.context );

		const pipelineDescriptor = {
			label: `renderPipeline_${ material.name || material.type }_${ material.id }`,
			vertex: Object.assign( {}, vertexModule, { buffers: vertexBuffers } ),
			fragment: Object.assign( {}, fragmentModule, { targets } ),
			primitive: primitiveState,
			multisample: {
				count: sampleCount,
				alphaToCoverageEnabled: material.alphaToCoverage && sampleCount > 1
			},
			layout: device.createPipelineLayout( {
				bindGroupLayouts
			} )
		};


		const depthStencil = {};
		const renderDepth = renderObject.context.depth;
		const renderStencil = renderObject.context.stencil;

		if ( renderDepth === true || renderStencil === true ) {

			if ( renderDepth === true ) {

				depthStencil.format = depthStencilFormat;
				depthStencil.depthWriteEnabled = material.depthWrite;
				depthStencil.depthCompare = depthCompare;

			}

			if ( renderStencil === true ) {

				depthStencil.stencilFront = stencilFront;
				depthStencil.stencilBack = {}; // three.js does not provide an API to configure the back function (gl.stencilFuncSeparate() was never used)
				depthStencil.stencilReadMask = material.stencilFuncMask;
				depthStencil.stencilWriteMask = material.stencilWriteMask;

			}

			pipelineDescriptor.depthStencil = depthStencil;

		}


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

	createBundleEncoder( renderContext ) {

		const backend = this.backend;
		const { utils, device } = backend;

		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderContext );
		const colorFormat = utils.getCurrentColorFormat( renderContext );
		const sampleCount = this._getSampleCount( renderContext );

		const descriptor = {
			label: 'renderBundleEncoder',
			colorFormats: [ colorFormat ],
			depthStencilFormat,
			sampleCount
		};

		return device.createRenderBundleEncoder( descriptor );

	}

	createComputePipeline( pipeline, bindings ) {

		const backend = this.backend;
		const device = backend.device;

		const computeProgram = backend.get( pipeline.computeProgram ).module;

		const pipelineGPU = backend.get( pipeline );

		// bind group layouts

		const bindGroupLayouts = [];

		for ( const bindingsGroup of bindings ) {

			const bindingsData = backend.get( bindingsGroup );

			bindGroupLayouts.push( bindingsData.layout );

		}

		pipelineGPU.pipeline = device.createComputePipeline( {
			compute: computeProgram,
			layout: device.createPipelineLayout( {
				bindGroupLayouts
			} )
		} );

	}

	_getBlending( material ) {

		let color, alpha;

		const blending = material.blending;
		const blendSrc = material.blendSrc;
		const blendDst = material.blendDst;
		const blendEquation = material.blendEquation;


		if ( blending === CustomBlending ) {

			const blendSrcAlpha = material.blendSrcAlpha !== null ? material.blendSrcAlpha : blendSrc;
			const blendDstAlpha = material.blendDstAlpha !== null ? material.blendDstAlpha : blendDst;
			const blendEquationAlpha = material.blendEquationAlpha !== null ? material.blendEquationAlpha : blendEquation;

			color = {
				srcFactor: this._getBlendFactor( blendSrc ),
				dstFactor: this._getBlendFactor( blendDst ),
				operation: this._getBlendOperation( blendEquation )
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
						setBlend( GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha );
						break;

					case AdditiveBlending:
						setBlend( GPUBlendFactor.One, GPUBlendFactor.One, GPUBlendFactor.One, GPUBlendFactor.One );
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

		this.parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

		this.trackTimestamp = ( parameters.trackTimestamp === true );

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

		// create the device if it is not passed with parameters

		let device;

		if ( parameters.device === undefined ) {

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

			device = await adapter.requestDevice( deviceDescriptor );

		} else {

			device = parameters.device;

		}

		device.lost.then( ( info ) => {

			const deviceLossInfo = {
				api: 'WebGPU',
				message: info.message || 'Unknown reason',
				reason: info.reason || null,
				originalEvent: info
			};

			renderer.onDeviceLost( deviceLossInfo );

		} );

		const context = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgpu' );

		this.device = device;
		this.context = context;

		const alphaMode = parameters.alpha ? 'premultiplied' : 'opaque';

		this.trackTimestamp = this.trackTimestamp && this.hasFeature( GPUFeatureName.TimestampQuery );

		this.context.configure( {
			device: this.device,
			format: this.utils.getPreferredCanvasFormat(),
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

		if ( descriptor === null ) {

			const renderer = this.renderer;

			descriptor = {
				colorAttachments: [ {
					view: null
				} ],
			};

			if ( this.renderer.depth === true || this.renderer.stencil === true ) {

				descriptor.depthStencilAttachment = {
					view: this.textureUtils.getDepthBuffer( renderer.depth, renderer.stencil ).createView()
				};

			}

			const colorAttachment = descriptor.colorAttachments[ 0 ];

			if ( this.renderer.samples > 0 ) {

				colorAttachment.view = this.colorBuffer.createView();

			} else {

				colorAttachment.resolveTarget = undefined;

			}

			this.defaultRenderPassdescriptor = descriptor;

		}

		const colorAttachment = descriptor.colorAttachments[ 0 ];

		if ( this.renderer.samples > 0 ) {

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

		if ( descriptors === undefined ||
			renderTargetData.width !== renderTarget.width ||
			renderTargetData.height !== renderTarget.height ||
			renderTargetData.activeMipmapLevel !== renderTarget.activeMipmapLevel ||
			renderTargetData.samples !== renderTarget.samples
		) {

			descriptors = {};

			renderTargetData.descriptors = descriptors;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				this.delete( renderTarget );

			};

			renderTarget.addEventListener( 'dispose', onDispose );

		}

		const cacheKey = renderContext.getCacheKey();

		let descriptor = descriptors[ cacheKey ];

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


			descriptor = {
				colorAttachments,
			};

			if ( renderContext.depth ) {

				const depthTextureData = this.get( renderContext.depthTexture );

				const depthStencilAttachment = {
					view: depthTextureData.texture.createView()
				};
				descriptor.depthStencilAttachment = depthStencilAttachment;

			}

			descriptors[ cacheKey ] = descriptor;

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

					colorAttachment.clearValue = i === 0 ? renderContext.clearColorValue : { r: 0, g: 0, b: 0, a: 1 };
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
		renderContextData.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };
		renderContextData.renderBundles = [];

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			currentPass.setScissorRect( x, y, width, height );

		}

	}

	finishRender( renderContext ) {

		const renderContextData = this.get( renderContext );
		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( renderContextData.renderBundles.length > 0 ) {

			renderContextData.currentPass.executeBundles( renderContextData.renderBundles );

		}

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

				if ( results[ i ] !== BigInt( 0 ) ) {

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

		currentPass.setViewport( x, y, width, height, minDepth, maxDepth );

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

			if ( this.renderer.alpha === true ) {

				// premultiply alpha

				const a = clearColor.a;

				clearValue = { r: clearColor.r * a, g: clearColor.g * a, b: clearColor.b * a, a: a };

			} else {

				clearValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearColor.a };

			}

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

		// bind groups

		for ( let i = 0, l = bindings.length; i < l; i ++ ) {

			const bindGroup = bindings[ i ];
			const bindingsData = this.get( bindGroup );

			passEncoderGPU.setBindGroup( i, bindingsData.group );

		}

		const maxComputeWorkgroupsPerDimension = this.device.limits.maxComputeWorkgroupsPerDimension;

		const computeNodeData = this.get( computeNode );

		if ( computeNodeData.dispatchSize === undefined ) computeNodeData.dispatchSize = { x: 0, y: 1, z: 1 };

		const { dispatchSize } = computeNodeData;

		if ( computeNode.dispatchCount > maxComputeWorkgroupsPerDimension ) {

			dispatchSize.x = Math.min( computeNode.dispatchCount, maxComputeWorkgroupsPerDimension );
			dispatchSize.y = Math.ceil( computeNode.dispatchCount / maxComputeWorkgroupsPerDimension );

		} else {

			dispatchSize.x = computeNode.dispatchCount;

		}

		passEncoderGPU.dispatchWorkgroups(
			dispatchSize.x,
			dispatchSize.y,
			dispatchSize.z
		);

	}

	finishCompute( computeGroup ) {

		const groupData = this.get( computeGroup );

		groupData.passEncoderGPU.end();

		this.prepareTimestampBuffer( computeGroup, groupData.cmdEncoderGPU );

		this.device.queue.submit( [ groupData.cmdEncoderGPU.finish() ] );

	}

	async waitForGPU() {

		await this.device.queue.onSubmittedWorkDone();

	}

	// render object

	draw( renderObject, info ) {

		const { object, context, pipeline } = renderObject;
		const bindings = renderObject.getBindings();
		const renderContextData = this.get( context );
		const pipelineGPU = this.get( pipeline ).pipeline;
		const currentSets = renderContextData.currentSets;
		const passEncoderGPU = renderContextData.currentPass;

		const drawParams = renderObject.getDrawParameters();

		if ( drawParams === null ) return;

		// pipeline

		if ( currentSets.pipeline !== pipelineGPU ) {

			passEncoderGPU.setPipeline( pipelineGPU );

			currentSets.pipeline = pipelineGPU;

		}

		// bind groups

		const currentBindingGroups = currentSets.bindingGroups;

		for ( let i = 0, l = bindings.length; i < l; i ++ ) {

			const bindGroup = bindings[ i ];
			const bindingsData = this.get( bindGroup );

			if ( currentBindingGroups[ bindGroup.index ] !== bindGroup.id ) {

				passEncoderGPU.setBindGroup( bindGroup.index, bindingsData.group );
				currentBindingGroups[ bindGroup.index ] = bindGroup.id;

			}

		}

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

		if ( renderContextData.occlusionQuerySet !== undefined ) {

			const lastObject = renderContextData.lastOcclusionObject;

			if ( lastObject !== object ) {

				if ( lastObject !== null && lastObject.occlusionTest === true ) {

					passEncoderGPU.endOcclusionQuery();
					renderContextData.occlusionQueryIndex ++;

				}

				if ( object.occlusionTest === true ) {

					passEncoderGPU.beginOcclusionQuery( renderContextData.occlusionQueryIndex );
					renderContextData.occlusionQueryObjects[ renderContextData.occlusionQueryIndex ] = object;

				}

				renderContextData.lastOcclusionObject = object;

			}

		}

		// draw

		if ( object.isBatchedMesh === true ) {

			const starts = object._multiDrawStarts;
			const counts = object._multiDrawCounts;
			const drawCount = object._multiDrawCount;
			const drawInstances = object._multiDrawInstances;

			const bytesPerElement = hasIndex ? index.array.BYTES_PER_ELEMENT : 1;

			for ( let i = 0; i < drawCount; i ++ ) {

				const count = drawInstances ? drawInstances[ i ] : 1;
				const firstInstance = count > 1 ? 0 : i;

				passEncoderGPU.drawIndexed( counts[ i ], count, starts[ i ] / bytesPerElement, 0, firstInstance );

			}

		} else if ( hasIndex === true ) {

			const { vertexCount: indexCount, instanceCount, firstVertex: firstIndex } = drawParams;

			const indirect = renderObject.getIndirect();

			if ( indirect !== null ) {

				const buffer = this.get( indirect ).buffer;

				passEncoderGPU.drawIndexedIndirect( buffer, 0 );

			} else {

				passEncoderGPU.drawIndexed( indexCount, instanceCount, firstIndex, 0, 0 );

			}

			info.update( object, indexCount, instanceCount );

		} else {

			const { vertexCount, instanceCount, firstVertex } = drawParams;

			const indirect = renderObject.getIndirect();

			if ( indirect !== null ) {

				const buffer = this.get( indirect ).buffer;

				passEncoderGPU.drawIndirect( buffer, 0 );

			} else {

				passEncoderGPU.draw( vertexCount, instanceCount, firstVertex, 0 );

			}

			info.update( object, vertexCount, instanceCount );

		}

	}

	// cache key

	needsRenderUpdate( renderObject ) {

		const data = this.get( renderObject );

		const { object, material } = renderObject;

		const utils = this.utils;

		const sampleCount = utils.getSampleCountRenderContext( renderObject.context );
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
			data.clippingContextCacheKey !== renderObject.clippingContextCacheKey
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
			data.clippingContextCacheKey = renderObject.clippingContextCacheKey;

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
			utils.getSampleCountRenderContext( renderContext ),
			utils.getCurrentColorSpace( renderContext ), utils.getCurrentColorFormat( renderContext ), utils.getCurrentDepthStencilFormat( renderContext ),
			utils.getPrimitiveTopology( object, material ),
			renderObject.getGeometryCacheKey(),
			renderObject.clippingContextCacheKey
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

	copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height, faceIndex );

	}


	initTimestampQuery( renderContext, descriptor ) {

		if ( ! this.trackTimestamp ) return;

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

		if ( ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );


		const size = 2 * BigInt64Array.BYTES_PER_ELEMENT;

		if ( renderContextData.currentTimestampQueryBuffers === undefined ) {

			renderContextData.currentTimestampQueryBuffers = {
				resolveBuffer: this.device.createBuffer( {
					label: 'timestamp resolve buffer',
					size: size,
					usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
				} ),
				resultBuffer: this.device.createBuffer( {
					label: 'timestamp result buffer',
					size: size,
					usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
				} ),
				isMappingPending: false,
			};

		}

		const { resolveBuffer, resultBuffer, isMappingPending } = renderContextData.currentTimestampQueryBuffers;

		if ( isMappingPending === true ) return;

		encoder.resolveQuerySet( renderContextData.timeStampQuerySet, 0, 2, resolveBuffer, 0 );
		encoder.copyBufferToBuffer( resolveBuffer, 0, resultBuffer, 0, size );

	}

	async resolveTimestampAsync( renderContext, type = 'render' ) {

		if ( ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( renderContextData.currentTimestampQueryBuffers === undefined ) return;

		const { resultBuffer, isMappingPending } = renderContextData.currentTimestampQueryBuffers;

		if ( isMappingPending === true ) return;

		renderContextData.currentTimestampQueryBuffers.isMappingPending = true;

		resultBuffer.mapAsync( GPUMapMode.READ ).then( () => {

			const times = new BigUint64Array( resultBuffer.getMappedRange() );
			const duration = Number( times[ 1 ] - times[ 0 ] ) / 1000000;


			this.renderer.info.updateTimestamp( type, duration );

			resultBuffer.unmap();

			renderContextData.currentTimestampQueryBuffers.isMappingPending = false;

		} );

	}

	// node builder

	createNodeBuilder( object, renderer ) {

		return new WGSLNodeBuilder( object, renderer );

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

	beginBundle( renderContext ) {

		const renderContextData = this.get( renderContext );

		renderContextData._currentPass = renderContextData.currentPass;
		renderContextData._currentSets = renderContextData.currentSets;

		renderContextData.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };
		renderContextData.currentPass = this.pipelineUtils.createBundleEncoder( renderContext );

	}

	finishBundle( renderContext, bundle ) {

		const renderContextData = this.get( renderContext );

		const bundleEncoder = renderContextData.currentPass;
		const bundleGPU = bundleEncoder.finish();

		this.get( bundle ).bundleGPU = bundleGPU;

		// restore render pass state

		renderContextData.currentSets = renderContextData._currentSets;
		renderContextData.currentPass = renderContextData._currentPass;

	}

	addBundle( renderContext, bundle ) {

		const renderContextData = this.get( renderContext );

		renderContextData.renderBundles.push( this.get( bundle ).bundleGPU );

	}

	// bindings

	createBindings( bindGroup ) {

		this.bindingUtils.createBindings( bindGroup );

	}

	updateBindings( bindGroup ) {

		this.bindingUtils.createBindings( bindGroup );

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

	createIndirectStorageAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

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

	hasFeature( name ) {

		return this.device.features.has( name );

	}

	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0 ) {

		let dstX = 0;
		let dstY = 0;
		let dstLayer = 0;

		let srcX = 0;
		let srcY = 0;
		let srcLayer = 0;

		let srcWidth = srcTexture.image.width;
		let srcHeight = srcTexture.image.height;

		if ( srcRegion !== null ) {

			srcX = srcRegion.x;
			srcY = srcRegion.y;
			srcLayer = srcRegion.z || 0;
			srcWidth = srcRegion.width;
			srcHeight = srcRegion.height;

		}

		if ( dstPosition !== null ) {

			dstX = dstPosition.x;
			dstY = dstPosition.y;
			dstLayer = dstPosition.z || 0;

		}

		const encoder = this.device.createCommandEncoder( { label: 'copyTextureToTexture_' + srcTexture.id + '_' + dstTexture.id } );

		const sourceGPU = this.get( srcTexture ).texture;
		const destinationGPU = this.get( dstTexture ).texture;

		encoder.copyTextureToTexture(
			{
				texture: sourceGPU,
				mipLevel: level,
				origin: { x: srcX, y: srcY, z: srcLayer }
			},
			{
				texture: destinationGPU,
				mipLevel: level,
				origin: { x: dstX, y: dstY, z: dstLayer }
			},
			[
				srcWidth,
				srcHeight,
				1
			]
		);

		this.device.queue.submit( [ encoder.finish() ] );

	}

	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		const renderContextData = this.get( renderContext );

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

		let encoder;

		if ( renderContextData.currentPass ) {

			renderContextData.currentPass.end();

			encoder = renderContextData.encoder;

		} else {

			encoder = this.device.createCommandEncoder( { label: 'copyFramebufferToTexture_' + texture.id } );

		}

		encoder.copyTextureToTexture(
			{
				texture: sourceGPU,
				origin: { x: rectangle.x, y: rectangle.y, z: 0 }
			},
			{
				texture: destinationGPU
			},
			[
				rectangle.z,
				rectangle.w
			]
		);

		if ( texture.generateMipmaps ) this.textureUtils.generateMipmaps( texture );

		if ( renderContextData.currentPass ) {

			const { descriptor } = renderContextData;

			for ( let i = 0; i < descriptor.colorAttachments.length; i ++ ) {

				descriptor.colorAttachments[ i ].loadOp = GPULoadOp.Load;

			}

			if ( renderContext.depth ) descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
			if ( renderContext.stencil ) descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

			renderContextData.currentPass = encoder.beginRenderPass( descriptor );
			renderContextData.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };

		} else {

			this.device.queue.submit( [ encoder.finish() ] );

		}

	}

}

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

class StandardNodeLibrary extends NodeLibrary {

	constructor() {

		super();

		this.addMaterial( MeshPhongNodeMaterial, 'MeshPhongMaterial' );
		this.addMaterial( MeshStandardNodeMaterial, 'MeshStandardMaterial' );
		this.addMaterial( MeshPhysicalNodeMaterial, 'MeshPhysicalMaterial' );
		this.addMaterial( MeshToonNodeMaterial, 'MeshToonMaterial' );
		this.addMaterial( MeshBasicNodeMaterial, 'MeshBasicMaterial' );
		this.addMaterial( MeshLambertNodeMaterial, 'MeshLambertMaterial' );
		this.addMaterial( MeshNormalNodeMaterial, 'MeshNormalMaterial' );
		this.addMaterial( MeshMatcapNodeMaterial, 'MeshMatcapMaterial' );
		this.addMaterial( LineBasicNodeMaterial, 'LineBasicMaterial' );
		this.addMaterial( LineDashedNodeMaterial, 'LineDashedMaterial' );
		this.addMaterial( PointsNodeMaterial, 'PointsMaterial' );
		this.addMaterial( SpriteNodeMaterial, 'SpriteMaterial' );
		this.addMaterial( ShadowNodeMaterial, 'ShadowMaterial' );

		this.addLight( PointLightNode, PointLight );
		this.addLight( DirectionalLightNode, DirectionalLight );
		this.addLight( RectAreaLightNode, RectAreaLight );
		this.addLight( SpotLightNode, SpotLight );
		this.addLight( AmbientLightNode, AmbientLight );
		this.addLight( HemisphereLightNode, HemisphereLight );
		this.addLight( LightProbeNode, LightProbe );
		this.addLight( IESSpotLightNode, IESSpotLight );

		this.addToneMapping( linearToneMapping, LinearToneMapping );
		this.addToneMapping( reinhardToneMapping, ReinhardToneMapping );
		this.addToneMapping( cineonToneMapping, CineonToneMapping );
		this.addToneMapping( acesFilmicToneMapping, ACESFilmicToneMapping );
		this.addToneMapping( agxToneMapping, AgXToneMapping );
		this.addToneMapping( neutralToneMapping, NeutralToneMapping );

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

		} else {

			BackendClass = WebGPUBackend;

			parameters.getFallback = () => {

				console.warn( 'THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

				return new WebGLBackend( parameters );

			};

		}

		const backend = new BackendClass( parameters );

		//super( new Proxy( backend, debugHandler ) );
		super( backend, parameters );

		this.library = new StandardNodeLibrary();

		this.isWebGPURenderer = true;

	}

}

class ClippingGroup extends Group {

	constructor() {

		super();

		this.isClippingGroup = true;
		this.clippingPlanes = [];
		this.enabled = true;
		this.clipIntersection = false;
		this.clipShadows = false;

	}

}

class BundleGroup extends Group {

	constructor() {

		super();

		this.isBundleGroup = true;

		this.type = 'BundleGroup';

		this.static = true;
		this.version = 0;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

}

const _material = /*@__PURE__*/ new NodeMaterial();
const _quadMesh = /*@__PURE__*/ new QuadMesh( _material );

class PostProcessing {

	constructor( renderer, outputNode = vec4( 0, 0, 1, 1 ) ) {

		this.renderer = renderer;
		this.outputNode = outputNode;

		this.outputColorTransform = true;

		this.needsUpdate = true;

		_material.name = 'PostProcessing';

	}

	render() {

		this.update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		_quadMesh.render( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

	update() {

		if ( this.needsUpdate === true ) {

			const renderer = this.renderer;

			const toneMapping = renderer.toneMapping;
			const outputColorSpace = renderer.outputColorSpace;

			_quadMesh.material.fragmentNode = this.outputColorTransform === true ? renderOutput( this.outputNode, toneMapping, outputColorSpace ) : this.outputNode.context( { toneMapping, outputColorSpace } );
			_quadMesh.material.needsUpdate = true;

			this.needsUpdate = false;

		}

	}

	async renderAsync() {

		this.update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		await _quadMesh.renderAsync( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

}

// renderer state

function saveRendererState( renderer, state = {} ) {

	state.toneMapping = renderer.toneMapping;
	state.toneMappingExposure = renderer.toneMappingExposure;
	state.outputColorSpace = renderer.outputColorSpace;
	state.renderTarget = renderer.getRenderTarget();
	state.activeCubeFace = renderer.getActiveCubeFace();
	state.activeMipmapLevel = renderer.getActiveMipmapLevel();
	state.renderObjectFunction = renderer.getRenderObjectFunction();
	state.pixelRatio = renderer.getPixelRatio();
	state.mrt = renderer.getMRT();
	state.clearColor = renderer.getClearColor( state.clearColor || new Color() );
	state.clearAlpha = renderer.getClearAlpha();
	state.autoClear = renderer.autoClear;
	state.scissorTest = renderer.getScissorTest();

	return state;

}

function resetRendererState( renderer, state ) {

	state = saveRendererState( renderer, state );

	renderer.setMRT( null );
	renderer.setRenderObjectFunction( null );
	renderer.setClearColor( 0x000000, 1 );
	renderer.autoClear = true;

	return state;

}

function restoreRendererState( renderer, state ) {

	renderer.toneMapping = state.toneMapping;
	renderer.toneMappingExposure = state.toneMappingExposure;
	renderer.outputColorSpace = state.outputColorSpace;
	renderer.setRenderTarget( state.renderTarget, state.activeCubeFace, state.activeMipmapLevel );
	renderer.setRenderObjectFunction( state.renderObjectFunction );
	renderer.setPixelRatio( state.pixelRatio );
	renderer.setMRT( state.mrt );
	renderer.setClearColor( state.clearColor, state.clearAlpha );
	renderer.autoClear = state.autoClear;
	renderer.setScissorTest( state.scissorTest );

}

// renderer and scene state

function saveRendererAndSceneState( renderer, scene, state = {} ) {

	state = saveRendererState( renderer, state );
	state.background = scene.background;
	state.backgroundNode = scene.backgroundNode;
	state.overrideMaterial = scene.overrideMaterial;

	return state;

}

function resetRendererAndSceneState( renderer, scene, state ) {

	state = saveRendererAndSceneState( renderer, scene, state );

	scene.background = null;
	scene.backgroundNode = null;
	scene.overrideMaterial = null;

	return state;

}

function restoreRendererAndSceneState( renderer, scene, state ) {

	restoreRendererState( renderer, state );

	scene.background = state.background;
	scene.backgroundNode = state.backgroundNode;
	scene.overrideMaterial = state.overrideMaterial;

}

var PostProcessingUtils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	resetRendererAndSceneState: resetRendererAndSceneState,
	resetRendererState: resetRendererState,
	restoreRendererAndSceneState: restoreRendererAndSceneState,
	restoreRendererState: restoreRendererState,
	saveRendererAndSceneState: saveRendererAndSceneState,
	saveRendererState: saveRendererState
});

class StorageTexture extends Texture {

	constructor( width = 1, height = 1 ) {

		super();

		this.image = { width, height };

		this.magFilter = LinearFilter;
		this.minFilter = LinearFilter;

		this.isStorageTexture = true;

	}

}

class StorageBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, typeClass = Float32Array ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClass( array * itemSize );

		super( array, itemSize );

		this.isStorageBufferAttribute = true;

	}

}

class StorageInstancedBufferAttribute extends InstancedBufferAttribute {

	constructor( array, itemSize, typeClass = Float32Array ) {

		if ( ArrayBuffer.isView( array ) === false ) array = new typeClass( array * itemSize );

		super( array, itemSize );

		this.isStorageInstancedBufferAttribute = true;

	}

}

class IndirectStorageBufferAttribute extends StorageBufferAttribute {

	constructor( array, itemSize ) {

		super( array, itemSize, Uint32Array );

		this.isIndirectStorageBufferAttribute = true;

	}

}

class NodeLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.textures = {};
		this.nodes = {};

	}

	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, ( text ) => {

			try {

				onLoad( this.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				this.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parseNodes( json ) {

		const nodes = {};

		if ( json !== undefined ) {

			for ( const nodeJSON of json ) {

				const { uuid, type } = nodeJSON;

				nodes[ uuid ] = this.createNodeFromType( type );
				nodes[ uuid ].uuid = uuid;

			}

			const meta = { nodes, textures: this.textures };

			for ( const nodeJSON of json ) {

				nodeJSON.meta = meta;

				const node = nodes[ nodeJSON.uuid ];
				node.deserialize( nodeJSON );

				delete nodeJSON.meta;

			}

		}

		return nodes;

	}

	parse( json ) {

		const node = this.createNodeFromType( json.type );
		node.uuid = json.uuid;

		const nodes = this.parseNodes( json.nodes );
		const meta = { nodes, textures: this.textures };

		json.meta = meta;

		node.deserialize( json );

		delete json.meta;

		return node;

	}

	setTextures( value ) {

		this.textures = value;
		return this;

	}

	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	createNodeFromType( type ) {

		if ( this.nodes[ type ] === undefined ) {

			console.error( 'THREE.NodeLoader: Node type not found:', type );
			return float();

		}

		return nodeObject( new this.nodes[ type ]() );

	}

}

class NodeMaterialLoader extends MaterialLoader {

	constructor( manager ) {

		super( manager );

		this.nodes = {};
		this.nodeMaterials = {};

	}

	parse( json ) {

		const material = super.parse( json );

		const nodes = this.nodes;
		const inputNodes = json.inputNodes;

		for ( const property in inputNodes ) {

			const uuid = inputNodes[ property ];

			material[ property ] = nodes[ uuid ];

		}

		return material;

	}

	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	createMaterialFromType( type ) {

		const materialClass = this.nodeMaterials[ type ];

		if ( materialClass !== undefined ) {

			return new materialClass();

		}

		return super.createMaterialFromType( type );

	}

}

class NodeObjectLoader extends ObjectLoader {

	constructor( manager ) {

		super( manager );

		this.nodes = {};
		this.nodeMaterials = {};

		this._nodesJSON = null;

	}

	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	parse( json, onLoad ) {

		this._nodesJSON = json.nodes;

		const data = super.parse( json, onLoad );

		this._nodesJSON = null; // dispose

		return data;

	}

	parseNodes( json, textures ) {

		if ( json !== undefined ) {

			const loader = new NodeLoader();
			loader.setNodes( this.nodes );
			loader.setTextures( textures );

			return loader.parseNodes( json );

		}

		return {};

	}

	parseMaterials( json, textures ) {

		const materials = {};

		if ( json !== undefined ) {

			const nodes = this.parseNodes( this._nodesJSON, textures );

			const loader = new NodeMaterialLoader();
			loader.setTextures( textures );
			loader.setNodes( nodes );
			loader.setNodeMaterials( this.nodeMaterials );

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const data = json[ i ];

				materials[ data.uuid ] = loader.parse( data );

			}

		}

		return materials;

	}

}

export { ACESFilmicToneMapping, AONode, AddEquation, AddOperation, AdditiveBlending, AgXToneMapping, AlphaFormat, AlwaysCompare, AlwaysDepth, AlwaysStencilFunc, AmbientLight, AmbientLightNode, AnalyticLightNode, ArrayElementNode, AssignNode, AttributeNode, BRDF_GGX, BRDF_Lambert, BackSide, BasicEnvironmentNode, BatchNode, BoxGeometry, Break, BufferAttribute, BufferAttributeNode, BufferGeometry, BufferNode, BumpMapNode, BundleGroup, BypassNode, ByteType, CacheNode, CineonToneMapping, ClampToEdgeWrapping, ClippingGroup, CodeNode, Color, ColorManagement, ColorSpaceNode, ComputeNode, ConstNode, ContextNode, Continue, ConvertNode, CubeCamera, CubeReflectionMapping, CubeRefractionMapping, CubeTexture, CubeTextureNode, CubeUVReflectionMapping, CullFaceBack, CullFaceFront, CullFaceNone, CustomBlending, DFGApprox, D_GGX, DataArrayTexture, DataTexture, DecrementStencilOp, DecrementWrapStencilOp, DepthFormat, DepthStencilFormat, DepthTexture, DirectionalLight, DirectionalLightNode, Discard, DoubleSide, DstAlphaFactor, DstColorFactor, DynamicDrawUsage, EPSILON, EnvironmentNode, EqualCompare, EqualDepth, EqualStencilFunc, EquirectUVNode, EquirectangularReflectionMapping, EquirectangularRefractionMapping, Euler, EventDispatcher, ExpressionNode, F_Schlick, FileLoader, Float16BufferAttribute, Float32BufferAttribute, FloatType, Fn, FogExp2Node, FogNode, FogRangeNode, FramebufferTexture, FrontFacingNode, FrontSide, Frustum, FunctionCallNode, FunctionNode, FunctionOverloadingNode, GLSLNodeParser, GreaterCompare, GreaterDepth, GreaterEqualCompare, GreaterEqualDepth, GreaterEqualStencilFunc, GreaterStencilFunc, Group, HalfFloatType, HemisphereLight, HemisphereLightNode, IESSpotLight, IESSpotLightNode, INFINITY, If, IncrementStencilOp, IncrementWrapStencilOp, IndexNode, IndirectStorageBufferAttribute, InstanceNode, InstancedBufferAttribute, InstancedInterleavedBuffer, InstancedPointsNodeMaterial, IntType, InterleavedBuffer, InterleavedBufferAttribute, InvertStencilOp, IrradianceNode, JoinNode, KeepStencilOp, LessCompare, LessDepth, LessEqualCompare, LessEqualDepth, LessEqualStencilFunc, LessStencilFunc, LightProbe, LightProbeNode, Lighting, LightingContextNode, LightingModel, LightingNode, LightsNode, Line2NodeMaterial, LineBasicMaterial, LineBasicNodeMaterial, LineDashedMaterial, LineDashedNodeMaterial, LinearFilter, LinearMipMapLinearFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearSRGBColorSpace, LinearToneMapping, Loader, Loop, LoopNode, LuminanceAlphaFormat, LuminanceFormat, MRTNode, MatcapUVNode, Material, MaterialLoader, MaterialNode, MaterialReferenceNode, MathUtils, Matrix3, Matrix4, MaxEquation, MaxMipLevelNode, Mesh, MeshBasicMaterial, MeshBasicNodeMaterial, MeshLambertMaterial, MeshLambertNodeMaterial, MeshMatcapMaterial, MeshMatcapNodeMaterial, MeshNormalMaterial, MeshNormalNodeMaterial, MeshPhongMaterial, MeshPhongNodeMaterial, MeshPhysicalMaterial, MeshPhysicalNodeMaterial, MeshSSSNodeMaterial, MeshStandardMaterial, MeshStandardNodeMaterial, MeshToonMaterial, MeshToonNodeMaterial, MinEquation, MirroredRepeatWrapping, MixOperation, ModelNode, ModelViewProjectionNode, MorphNode, MultiplyBlending, MultiplyOperation, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, NeutralToneMapping, NeverCompare, NeverDepth, NeverStencilFunc, NoBlending, NoColorSpace, NoToneMapping, Node, NodeAttribute, NodeBuilder, NodeCache, NodeCode, NodeFrame, NodeFunctionInput, NodeLoader, NodeMaterial, NodeMaterialLoader, NodeMaterialObserver, NodeObjectLoader, NodeShaderStage, NodeType, NodeUniform, NodeUpdateType, NodeUtils, NodeVar, NodeVarying, NormalBlending, NormalMapNode, NotEqualCompare, NotEqualDepth, NotEqualStencilFunc, Object3D, Object3DNode, ObjectLoader, ObjectSpaceNormalMap, OneFactor, OneMinusDstAlphaFactor, OneMinusDstColorFactor, OneMinusSrcAlphaFactor, OneMinusSrcColorFactor, OrthographicCamera, OutputStructNode, PCFShadowMap$1 as PCFShadowMap, PI, PI2, PMREMGenerator, PMREMNode, ParameterNode, PassNode, PerspectiveCamera, PhongLightingModel, PhysicalLightingModel, Plane, PointLight, PointLightNode, PointUVNode, PointsMaterial, PointsNodeMaterial, PostProcessing, PostProcessingUtils, PosterizeNode, PropertyNode, QuadMesh, RED_GREEN_RGTC2_Format, RED_RGTC1_Format, REVISION, RGBAFormat, RGBAIntegerFormat, RGBA_ASTC_10x10_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_BPTC_Format, RGBA_ETC2_EAC_Format, RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGBFormat, RGBIntegerFormat, RGB_ETC1_Format, RGB_ETC2_Format, RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGB_S3TC_DXT1_Format, RGFormat, RGIntegerFormat, RTTNode, RangeNode, RectAreaLight, RectAreaLightNode, RedFormat, RedIntegerFormat, ReferenceNode, ReflectorNode, ReinhardToneMapping, RemapNode, RenderOutputNode, RenderTarget, RendererReferenceNode, RepeatWrapping, ReplaceStencilOp, Return, ReverseSubtractEquation, RotateNode, SIGNED_RED_GREEN_RGTC2_Format, SIGNED_RED_RGTC1_Format, SRGBColorSpace, SRGBTransfer, Scene, SceneNode, Schlick_to_F0, ScreenNode, ScriptableNode, ScriptableNodeResources, ScriptableValueNode, SetNode, ShaderNode, ShadowMaterial, ShadowNode, ShadowNodeMaterial, ShortType, SkinningNode, SphereGeometry, SplitNode, SpotLight, SpotLightNode, SpriteMaterial, SpriteNodeMaterial, SpriteSheetUVNode, SrcAlphaFactor, SrcAlphaSaturateFactor, SrcColorFactor, StackNode, StaticDrawUsage, StorageArrayElementNode, StorageBufferAttribute, StorageBufferNode, StorageInstancedBufferAttribute, StorageTexture, StorageTextureNode, SubtractEquation, SubtractiveBlending, TBNViewMatrix, TangentSpaceNormalMap, TempNode, Texture, Texture3DNode, TextureNode, TextureSizeNode, ToneMappingNode, ToonOutlinePassNode, TriplanarTexturesNode, UVMapping, Uint16BufferAttribute, Uint32BufferAttribute, UniformArrayNode, UniformGroupNode, UniformNode, UnsignedByteType, UnsignedInt248Type, UnsignedInt5999Type, UnsignedIntType, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedShortType, UserDataNode, VSMShadowMap, V_GGX_SmithCorrelated, VarNode, VaryingNode, Vector2, Vector3, Vector4, VertexColorNode, ViewportDepthNode, ViewportDepthTextureNode, ViewportSharedTextureNode, ViewportTextureNode, VolumeNodeMaterial, WebGLCoordinateSystem, WebGLCubeRenderTarget, WebGPUCoordinateSystem, WebGPURenderer, ZeroFactor, ZeroStencilOp, abs, acesFilmicToneMapping, acos, add, addMethodChaining, addNodeElement, agxToneMapping, all, alphaT, and, anisotropy, anisotropyB, anisotropyT, any, append, arrayBuffer, asin, assign, atan, atan2, atomicAdd, atomicAnd, atomicFunc, atomicMax, atomicMin, atomicOr, atomicStore, atomicSub, atomicXor, attenuationColor, attenuationDistance, attribute, backgroundBlurriness, backgroundIntensity, backgroundRotation, batch, billboarding, bitAnd, bitNot, bitOr, bitXor, bitangentGeometry, bitangentLocal, bitangentView, bitangentWorld, bitcast, blur, bool, buffer, bufferAttribute, bumpMap, burn, bvec2, bvec3, bvec4, bypass, cache, call, cameraFar, cameraNear, cameraNormalMatrix, cameraPosition, cameraProjectionMatrix, cameraProjectionMatrixInverse, cameraViewMatrix, cameraWorldMatrix, cbrt, cdl, ceil, checker, cineonToneMapping, clamp, clearcoat, clearcoatRoughness, code, color, colorSpaceToWorking, colorToDirection, compute, cond, context, convert, convertColorSpace, convertToTexture, cos, createCanvasElement, cross, cubeTexture, dFdx, dFdy, dashSize, defaultBuildStages, defaultShaderStages, defined, degrees, deltaTime, densityFog, depth, depthPass, difference, diffuseColor, directPointLight, directionToColor, dispersion, distance, div, dodge, dot, drawIndex, dynamicBufferAttribute, element, emissive, equal, equals, equirectUV, exp, exp2, expression, faceDirection, faceForward, float, floor, fog, fract, frameGroup, frameId, frontFacing, fwidth, gain, gapSize, getConstNodeType, getCurrentStack, getDirection, getDistanceAttenuation, getGeometryRoughness, getNormalFromDepth, getParallaxCorrectNormal, getRoughness, getScreenPosition, getShIrradianceAt, getTextureIndex, getViewPosition, glsl, glslFn, grayscale, greaterThan, greaterThanEqual, hash, highPrecisionModelNormalViewMatrix, highPrecisionModelViewMatrix, hue, instance, instanceIndex, instancedBufferAttribute, instancedDynamicBufferAttribute, int, inverseSqrt, invocationLocalIndex, invocationSubgroupIndex, ior, iridescence, iridescenceIOR, iridescenceThickness, ivec2, ivec3, ivec4, js, label, length, lengthSq, lessThan, lessThanEqual, lightPosition, lightTargetDirection, lightTargetPosition, lightViewPosition, lightingContext, lights, linearDepth, linearToneMapping, localId, log, log2, loop, luminance, mat2, mat3, mat4, matcapUV, materialAOMap, materialAlphaTest, materialAnisotropy, materialAnisotropyVector, materialAttenuationColor, materialAttenuationDistance, materialClearcoat, materialClearcoatNormal, materialClearcoatRoughness, materialColor, materialDispersion, materialEmissive, materialIOR, materialIridescence, materialIridescenceIOR, materialIridescenceThickness, materialLightMap, materialLineDashOffset, materialLineDashSize, materialLineGapSize, materialLineScale, materialLineWidth, materialMetalness, materialNormal, materialOpacity, materialPointWidth, materialReference, materialReflectivity, materialRefractionRatio, materialRotation, materialRoughness, materialSheen, materialSheenRoughness, materialShininess, materialSpecular, materialSpecularColor, materialSpecularIntensity, materialSpecularStrength, materialThickness, materialTransmission, max$1 as max, maxMipLevel, metalness, min$1 as min, mix, mixElement, mod, modInt, modelDirection, modelNormalMatrix, modelPosition, modelScale, modelViewMatrix, modelViewPosition, modelViewProjection, modelWorldMatrix, modelWorldMatrixInverse, morphReference, mrt, mul, mx_aastep, mx_cell_noise_float, mx_contrast, mx_fractal_noise_float, mx_fractal_noise_vec2, mx_fractal_noise_vec3, mx_fractal_noise_vec4, mx_hsvtorgb, mx_noise_float, mx_noise_vec3, mx_noise_vec4, mx_ramplr, mx_ramptb, mx_rgbtohsv, mx_safepower, mx_splitlr, mx_splittb, mx_srgb_texture_to_lin_rec709, mx_transform_uv, mx_worley_noise_float, mx_worley_noise_vec2, mx_worley_noise_vec3, negate, neutralToneMapping, nodeArray, nodeImmutable, nodeObject, nodeObjects, nodeProxy, normalFlat, normalGeometry, normalLocal, normalMap, normalView, normalWorld, normalize, not, notEqual, numWorkgroups, objectDirection, objectGroup, objectPosition, objectScale, objectViewPosition, objectWorldMatrix, oneMinus, or, orthographicDepthToViewZ, oscSawtooth, oscSine, oscSquare, oscTriangle, output, outputStruct, overlay, overloadingFn, parabola, parallaxDirection, parallaxUV, parameter, pass, passTexture, pcurve, perspectiveDepthToLogarithmicDepth, perspectiveDepthToViewZ, pmremTexture, pointUV, pointWidth, positionGeometry, positionLocal, positionPrevious, positionView, positionViewDirection, positionWorld, positionWorldDirection, posterize, pow, pow2, pow3, pow4, property, radians, rand, range, rangeFog, reciprocal, reference, referenceBuffer, reflect, reflectVector, reflectView, reflector, refract, refractVector, refractView, reinhardToneMapping, remainder, remap, remapClamp, renderGroup, renderOutput, rendererReference, rotate, rotateUV, roughness, round, rtt, sRGBTransferEOTF, sRGBTransferOETF, sampler, saturate, saturation, screen, screenCoordinate, screenSize, screenUV, scriptable, scriptableValue, select, setCurrentStack, shaderStages, shadow, shadows, sharedUniformGroup, sheen, sheenRoughness, shiftLeft, shiftRight, shininess, sign, sin, sinc, skinning, skinningReference, smoothstep, smoothstepElement, specularColor, specularF90, spherizeUV, split, spritesheetUV, sqrt, stack, step, storage, storageBarrier, storageObject, storageTexture, string, sub, subgroupIndex, subgroupSize, tan, tangentGeometry, tangentLocal, tangentView, tangentWorld, temp, texture, texture3D, textureBarrier, textureBicubic, textureCubeUV, textureLoad, textureSize, textureStore, thickness, threshold, time, timerDelta, timerGlobal, timerLocal, toOutputColorSpace, toWorkingColorSpace, toneMapping, toneMappingExposure, toonOutlinePass, transformDirection, transformNormal, transformNormalToView, transformedBentNormalView, transformedBitangentView, transformedBitangentWorld, transformedClearcoatNormalView, transformedNormalView, transformedNormalWorld, transformedTangentView, transformedTangentWorld, transmission, transpose, tri, tri3, triNoise3D, triplanarTexture, triplanarTextures, trunc, tslFn, uint, uniform, uniformArray, uniformGroup, uniforms, userData, uv, uvec2, uvec3, uvec4, varying, varyingProperty, vec2, vec3, vec4, vectorComponents, velocity, vertexColor, vertexIndex, vibrance, viewZToOrthographicDepth, viewZToPerspectiveDepth, viewport, viewportBottomLeft, viewportCoordinate, viewportDepthTexture, viewportLinearDepth, viewportMipTexture, viewportResolution, viewportSafeUV, viewportSharedTexture, viewportSize, viewportTexture, viewportTopLeft, viewportUV, wgsl, wgslFn, workgroupArray, workgroupBarrier, workgroupId, workingToColorSpace, xor };
