import { Color } from '../math/Color.js';
import { EventDispatcher } from '../core/EventDispatcher.js';
import { FrontSide, NormalBlending, LessEqualDepth, AddEquation, OneMinusSrcAlphaFactor, SrcAlphaFactor, AlwaysStencilFunc, KeepStencilOp } from '../constants.js';
import { generateUUID } from '../math/MathUtils.js';

let _materialId = 0;

/**
 * Abstract base class for materials.
 *
 * Materials define the appearance of renderable 3D objects.
 *
 * @abstract
 * @augments EventDispatcher
 */
class Material extends EventDispatcher {

	/**
	 * Constructs a new material.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMaterial = true;

		/**
		 * The ID of the material.
		 *
		 * @name Material#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _materialId ++ } );

		/**
		 * The UUID of the material.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The name of the material.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The type property is used for detecting the object type
		 * in context of serialization/deserialization.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.type = 'Material';

		/**
		 * Defines the blending type of the material.
		 *
		 * It must be set to `CustomBlending` if custom blending properties like
		 * {@link Material#blendSrc}, {@link Material#blendDst} or {@link Material#blendEquation}
		 * should have any effect.
		 *
		 * @type {(NoBlending|NormalBlending|AdditiveBlending|SubtractiveBlending|MultiplyBlending|CustomBlending)}
		 * @default NormalBlending
		 */
		this.blending = NormalBlending;

		/**
		 * Defines which side of faces will be rendered - front, back or both.
		 *
		 * @type {(FrontSide|BackSide|DoubleSide)}
		 * @default FrontSide
		 */
		this.side = FrontSide;

		/**
		 * If set to `true`, vertex colors should be used.
		 *
		 * The engine supports RGB and RGBA vertex colors depending on whether a three (RGB) or
		 * four (RGBA) component color buffer attribute is used.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.vertexColors = false;

		/**
		 * Defines how transparent the material is.
		 * A value of `0.0` indicates fully transparent, `1.0` is fully opaque.
		 *
		 * If the {@link Material#transparent} is not set to `true`,
		 * the material will remain fully opaque and this value will only affect its color.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.opacity = 1;

		/**
		 * Defines whether this material is transparent. This has an effect on
		 * rendering as transparent objects need special treatment and are rendered
		 * after non-transparent objects.
		 *
		 * When set to true, the extent to which the material is transparent is
		 * controlled by {@link Material#opacity}.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.transparent = false;

		/**
		 * Enables alpha hashed transparency, an alternative to {@link Material#transparent} or
		 * {@link Material#alphaTest}. The material will not be rendered if opacity is lower than
		 * a random threshold. Randomization introduces some grain or noise, but approximates alpha
		 * blending without the associated problems of sorting. Using TAA can reduce the resulting noise.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.alphaHash = false;

		/**
		 * Defines the blending source factor.
		 *
		 * @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default SrcAlphaFactor
		 */
		this.blendSrc = SrcAlphaFactor;

		/**
		 * Defines the blending destination factor.
		 *
		 * @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default OneMinusSrcAlphaFactor
		 */
		this.blendDst = OneMinusSrcAlphaFactor;

		/**
		 * Defines the blending equation.
		 *
		 * @type {(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
		 * @default AddEquation
		 */
		this.blendEquation = AddEquation;

		/**
		 * Defines the blending source alpha factor.
		 *
		 * @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default null
		 */
		this.blendSrcAlpha = null;

		/**
		 * Defines the blending destination alpha factor.
		 *
		 * @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default null
		 */
		this.blendDstAlpha = null;

		/**
		 * Defines the blending equation of the alpha channel.
		 *
		 * @type {?(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
		 * @default null
		 */
		this.blendEquationAlpha = null;

		/**
		 * Represents the RGB values of the constant blend color.
		 *
		 * This property has only an effect when using custom blending with `ConstantColor` or `OneMinusConstantColor`.
		 *
		 * @type {Color}
		 * @default (0,0,0)
		 */
		this.blendColor = new Color( 0, 0, 0 );

		/**
		 * Represents the alpha value of the constant blend color.
		 *
		 * This property has only an effect when using custom blending with `ConstantAlpha` or `OneMinusConstantAlpha`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.blendAlpha = 0;

		/**
		 * Defines the depth function.
		 *
		 * @type {(NeverDepth|AlwaysDepth|LessDepth|LessEqualDepth|EqualDepth|GreaterEqualDepth|GreaterDepth|NotEqualDepth)}
		 * @default LessEqualDepth
		 */
		this.depthFunc = LessEqualDepth;

		/**
		 * Whether to have depth test enabled when rendering this material.
		 * When the depth test is disabled, the depth write will also be implicitly disabled.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.depthTest = true;

		/**
		 * Whether rendering this material has any effect on the depth buffer.
		 *
		 * When drawing 2D overlays it can be useful to disable the depth writing in
		 * order to layer several things together without creating z-index artifacts.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.depthWrite = true;

		/**
		 * The bit mask to use when writing to the stencil buffer.
		 *
		 * @type {number}
		 * @default 0xff
		 */
		this.stencilWriteMask = 0xff;

		/**
		 * The stencil comparison function to use.
		 *
		 * @type {NeverStencilFunc|LessStencilFunc|EqualStencilFunc|LessEqualStencilFunc|GreaterStencilFunc|NotEqualStencilFunc|GreaterEqualStencilFunc|AlwaysStencilFunc}
		 * @default AlwaysStencilFunc
		 */
		this.stencilFunc = AlwaysStencilFunc;

		/**
		 * The value to use when performing stencil comparisons or stencil operations.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.stencilRef = 0;

		/**
		 * The bit mask to use when comparing against the stencil buffer.
		 *
		 * @type {number}
		 * @default 0xff
		 */
		this.stencilFuncMask = 0xff;

		/**
		 * Which stencil operation to perform when the comparison function returns `false`.
		 *
		 * @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
		 * @default KeepStencilOp
		 */
		this.stencilFail = KeepStencilOp;

		/**
		 * Which stencil operation to perform when the comparison function returns
		 * `true` but the depth test fails.
		 *
		 * @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
		 * @default KeepStencilOp
		 */
		this.stencilZFail = KeepStencilOp;

		/**
		 * Which stencil operation to perform when the comparison function returns
		 * `true` and the depth test passes.
		 *
		 * @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
		 * @default KeepStencilOp
		 */
		this.stencilZPass = KeepStencilOp;

		/**
		 * Whether stencil operations are performed against the stencil buffer. In
		 * order to perform writes or comparisons against the stencil buffer this
		 * value must be `true`.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.stencilWrite = false;

		/**
		 * User-defined clipping planes specified as THREE.Plane objects in world
		 * space. These planes apply to the objects this material is attached to.
		 * Points in space whose signed distance to the plane is negative are clipped
		 * (not rendered). This requires {@link WebGLRenderer#localClippingEnabled} to
		 * be `true`.
		 *
		 * @type {?Array<Plane>}
		 * @default null
		 */
		this.clippingPlanes = null;

		/**
		 * Changes the behavior of clipping planes so that only their intersection is
		 * clipped, rather than their union.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.clipIntersection = false;

		/**
		 * Defines whether to clip shadows according to the clipping planes specified
		 * on this material.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.clipShadows = false;

		/**
		 * Defines which side of faces cast shadows. If `null`, the side casting shadows
		 * is determined as follows:
		 *
		 * - When {@link Material#side} is set to `FrontSide`, the back side cast shadows.
		 * - When {@link Material#side} is set to `BackSide`, the front side cast shadows.
		 * - When {@link Material#side} is set to `DoubleSide`, both sides cast shadows.
		 *
		 * @type {?(FrontSide|BackSide|DoubleSide)}
		 * @default null
		 */
		this.shadowSide = null;

		/**
		 * Whether to render the material's color.
		 *
		 * This can be used in conjunction with {@link Object3D#renderOder} to create invisible
		 * objects that occlude other objects.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.colorWrite = true;

		/**
		 * Override the renderer's default precision for this material.
		 *
		 * @type {?('highp'|'mediump'|'lowp')}
		 * @default null
		 */
		this.precision = null;

		/**
		 * Whether to use polygon offset or not. When enabled, each fragment's depth value will
		 * be offset after it is interpolated from the depth values of the appropriate vertices.
		 * The offset is added before the depth test is performed and before the value is written
		 * into the depth buffer.
		 *
		 * Can be useful for rendering hidden-line images, for applying decals to surfaces, and for
		 * rendering solids with highlighted edges.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.polygonOffset = false;

		/**
		 * Specifies a scale factor that is used to create a variable depth offset for each polygon.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.polygonOffsetFactor = 0;

		/**
		 * Is multiplied by an implementation-specific value to create a constant depth offset.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.polygonOffsetUnits = 0;

		/**
		 * Whether to apply dithering to the color to remove the appearance of banding.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.dithering = false;

		/**
		 * Whether alpha to coverage should be enabled or not. Can only be used with MSAA-enabled contexts
		 * (meaning when the renderer was created with *antialias* parameter set to `true`). Enabling this
		 * will smooth aliasing on clip plane edges and alphaTest-clipped edges.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.alphaToCoverage = false;

		/**
		 * Whether to premultiply the alpha (transparency) value.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.premultipliedAlpha = false;

		/**
		 * Whether double-sided, transparent objects should be rendered with a single pass or not.
		 *
		 * The engine renders double-sided, transparent objects with two draw calls (back faces first,
		 * then front faces) to mitigate transparency artifacts. There are scenarios however where this
		 * approach produces no quality gains but still doubles draw calls e.g. when rendering flat
		 * vegetation like grass sprites. In these cases, set the `forceSinglePass` flag to `true` to
		 * disable the two pass rendering to avoid performance issues.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.forceSinglePass = false;

		/**
		 * Whether it's possible to override the material with {@link Scene#overrideMaterial} or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.allowOverride = true;

		/**
		 * Defines whether 3D objects using this material are visible.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.visible = true;

		/**
		 * Defines whether this material is tone mapped according to the renderer's tone mapping setting.
		 *
		 * It is ignored when rendering to a render target or using post processing or when using
		 * `WebGPURenderer`. In all these cases, all materials are honored by tone mapping.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.toneMapped = true;

		/**
		 * An object that can be used to store custom data about the Material. It
		 * should not hold references to functions as these will not be cloned.
		 *
		 * @type {Object}
		 */
		this.userData = {};

		/**
		 * This starts at `0` and counts how many times {@link Material#needsUpdate} is set to `true`.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

		this._alphaTest = 0;

	}

	/**
	 * Sets the alpha value to be used when running an alpha test. The material
	 * will not be rendered if the opacity is lower than this value.
	 *
	 * @type {number}
	 * @readonly
	 * @default 0
	 */
	get alphaTest() {

		return this._alphaTest;

	}

	set alphaTest( value ) {

		if ( this._alphaTest > 0 !== value > 0 ) {

			this.version ++;

		}

		this._alphaTest = value;

	}

	/**
	 * An optional callback that is executed immediately before the material is used to render a 3D object.
	 *
	 * This method can only be used when rendering with {@link WebGLRenderer}.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera that is used to render the scene.
	 * @param {BufferGeometry} geometry - The 3D object's geometry.
	 * @param {Object3D} object - The 3D object.
	 * @param {Object} group - The geometry group data.
	 */
	onBeforeRender( /* renderer, scene, camera, geometry, object, group */ ) {}

	/**
	 * An optional callback that is executed immediately before the shader
	 * program is compiled. This function is called with the shader source code
	 * as a parameter. Useful for the modification of built-in materials.
	 *
	 * This method can only be used when rendering with {@link WebGLRenderer}. The
	 * recommended approach when customizing materials is to use `WebGPURenderer` with the new
	 * Node Material system and [TSL]{@link https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language}.
	 *
	 * @param {{vertexShader:string,fragmentShader:string,uniforms:Object}} shaderobject - The object holds the uniforms and the vertex and fragment shader source.
	 * @param {WebGLRenderer} renderer - A reference to the renderer.
	 */
	onBeforeCompile( /* shaderobject, renderer */ ) {}

	/**
	 * In case {@link Material#onBeforeCompile} is used, this callback can be used to identify
	 * values of settings used in `onBeforeCompile()`, so three.js can reuse a cached
	 * shader or recompile the shader for this material as needed.
	 *
	 * This method can only be used when rendering with {@link WebGLRenderer}.
	 *
	 * @return {string} The custom program cache key.
	 */
	customProgramCacheKey() {

		return this.onBeforeCompile.toString();

	}

	/**
	 * This method can be used to set default values from parameter objects.
	 * It is a generic implementation so it can be used with different types
	 * of materials.
	 *
	 * @param {Object} [values] - The material values to set.
	 */
	setValues( values ) {

		if ( values === undefined ) return;

		for ( const key in values ) {

			const newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( `THREE.Material: parameter '${ key }' has value of undefined.` );
				continue;

			}

			const currentValue = this[ key ];

			if ( currentValue === undefined ) {

				console.warn( `THREE.Material: '${ key }' is not a property of THREE.${ this.type }.` );
				continue;

			}

			if ( currentValue && currentValue.isColor ) {

				currentValue.set( newValue );

			} else if ( ( currentValue && currentValue.isVector3 ) && ( newValue && newValue.isVector3 ) ) {

				currentValue.copy( newValue );

			} else {

				this[ key ] = newValue;

			}

		}

	}

	/**
	 * Serializes the material into JSON.
	 *
	 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized material.
	 * @see {@link ObjectLoader#parse}
	 */
	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( isRootObject ) {

			meta = {
				textures: {},
				images: {}
			};

		}

		const data = {
			metadata: {
				version: 4.7,
				type: 'Material',
				generator: 'Material.toJSON'
			}
		};

		// standard Material serialization
		data.uuid = this.uuid;
		data.type = this.type;

		if ( this.name !== '' ) data.name = this.name;

		if ( this.color && this.color.isColor ) data.color = this.color.getHex();

		if ( this.roughness !== undefined ) data.roughness = this.roughness;
		if ( this.metalness !== undefined ) data.metalness = this.metalness;

		if ( this.sheen !== undefined ) data.sheen = this.sheen;
		if ( this.sheenColor && this.sheenColor.isColor ) data.sheenColor = this.sheenColor.getHex();
		if ( this.sheenRoughness !== undefined ) data.sheenRoughness = this.sheenRoughness;
		if ( this.emissive && this.emissive.isColor ) data.emissive = this.emissive.getHex();
		if ( this.emissiveIntensity !== undefined && this.emissiveIntensity !== 1 ) data.emissiveIntensity = this.emissiveIntensity;

		if ( this.specular && this.specular.isColor ) data.specular = this.specular.getHex();
		if ( this.specularIntensity !== undefined ) data.specularIntensity = this.specularIntensity;
		if ( this.specularColor && this.specularColor.isColor ) data.specularColor = this.specularColor.getHex();
		if ( this.shininess !== undefined ) data.shininess = this.shininess;
		if ( this.clearcoat !== undefined ) data.clearcoat = this.clearcoat;
		if ( this.clearcoatRoughness !== undefined ) data.clearcoatRoughness = this.clearcoatRoughness;

		if ( this.clearcoatMap && this.clearcoatMap.isTexture ) {

			data.clearcoatMap = this.clearcoatMap.toJSON( meta ).uuid;

		}

		if ( this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture ) {

			data.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON( meta ).uuid;

		}

		if ( this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture ) {

			data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON( meta ).uuid;
			data.clearcoatNormalScale = this.clearcoatNormalScale.toArray();

		}

		if ( this.sheenColorMap && this.sheenColorMap.isTexture ) {

			data.sheenColorMap = this.sheenColorMap.toJSON( meta ).uuid;

		}

		if ( this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture ) {

			data.sheenRoughnessMap = this.sheenRoughnessMap.toJSON( meta ).uuid;

		}

		if ( this.dispersion !== undefined ) data.dispersion = this.dispersion;

		if ( this.iridescence !== undefined ) data.iridescence = this.iridescence;
		if ( this.iridescenceIOR !== undefined ) data.iridescenceIOR = this.iridescenceIOR;
		if ( this.iridescenceThicknessRange !== undefined ) data.iridescenceThicknessRange = this.iridescenceThicknessRange;

		if ( this.iridescenceMap && this.iridescenceMap.isTexture ) {

			data.iridescenceMap = this.iridescenceMap.toJSON( meta ).uuid;

		}

		if ( this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture ) {

			data.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON( meta ).uuid;

		}

		if ( this.anisotropy !== undefined ) data.anisotropy = this.anisotropy;
		if ( this.anisotropyRotation !== undefined ) data.anisotropyRotation = this.anisotropyRotation;

		if ( this.anisotropyMap && this.anisotropyMap.isTexture ) {

			data.anisotropyMap = this.anisotropyMap.toJSON( meta ).uuid;

		}

		if ( this.map && this.map.isTexture ) data.map = this.map.toJSON( meta ).uuid;
		if ( this.matcap && this.matcap.isTexture ) data.matcap = this.matcap.toJSON( meta ).uuid;
		if ( this.alphaMap && this.alphaMap.isTexture ) data.alphaMap = this.alphaMap.toJSON( meta ).uuid;

		if ( this.lightMap && this.lightMap.isTexture ) {

			data.lightMap = this.lightMap.toJSON( meta ).uuid;
			data.lightMapIntensity = this.lightMapIntensity;

		}

		if ( this.aoMap && this.aoMap.isTexture ) {

			data.aoMap = this.aoMap.toJSON( meta ).uuid;
			data.aoMapIntensity = this.aoMapIntensity;

		}

		if ( this.bumpMap && this.bumpMap.isTexture ) {

			data.bumpMap = this.bumpMap.toJSON( meta ).uuid;
			data.bumpScale = this.bumpScale;

		}

		if ( this.normalMap && this.normalMap.isTexture ) {

			data.normalMap = this.normalMap.toJSON( meta ).uuid;
			data.normalMapType = this.normalMapType;
			data.normalScale = this.normalScale.toArray();

		}

		if ( this.displacementMap && this.displacementMap.isTexture ) {

			data.displacementMap = this.displacementMap.toJSON( meta ).uuid;
			data.displacementScale = this.displacementScale;
			data.displacementBias = this.displacementBias;

		}

		if ( this.roughnessMap && this.roughnessMap.isTexture ) data.roughnessMap = this.roughnessMap.toJSON( meta ).uuid;
		if ( this.metalnessMap && this.metalnessMap.isTexture ) data.metalnessMap = this.metalnessMap.toJSON( meta ).uuid;

		if ( this.emissiveMap && this.emissiveMap.isTexture ) data.emissiveMap = this.emissiveMap.toJSON( meta ).uuid;
		if ( this.specularMap && this.specularMap.isTexture ) data.specularMap = this.specularMap.toJSON( meta ).uuid;
		if ( this.specularIntensityMap && this.specularIntensityMap.isTexture ) data.specularIntensityMap = this.specularIntensityMap.toJSON( meta ).uuid;
		if ( this.specularColorMap && this.specularColorMap.isTexture ) data.specularColorMap = this.specularColorMap.toJSON( meta ).uuid;

		if ( this.envMap && this.envMap.isTexture ) {

			data.envMap = this.envMap.toJSON( meta ).uuid;

			if ( this.combine !== undefined ) data.combine = this.combine;

		}

		if ( this.envMapRotation !== undefined ) data.envMapRotation = this.envMapRotation.toArray();
		if ( this.envMapIntensity !== undefined ) data.envMapIntensity = this.envMapIntensity;
		if ( this.reflectivity !== undefined ) data.reflectivity = this.reflectivity;
		if ( this.refractionRatio !== undefined ) data.refractionRatio = this.refractionRatio;

		if ( this.gradientMap && this.gradientMap.isTexture ) {

			data.gradientMap = this.gradientMap.toJSON( meta ).uuid;

		}

		if ( this.transmission !== undefined ) data.transmission = this.transmission;
		if ( this.transmissionMap && this.transmissionMap.isTexture ) data.transmissionMap = this.transmissionMap.toJSON( meta ).uuid;
		if ( this.thickness !== undefined ) data.thickness = this.thickness;
		if ( this.thicknessMap && this.thicknessMap.isTexture ) data.thicknessMap = this.thicknessMap.toJSON( meta ).uuid;
		if ( this.attenuationDistance !== undefined && this.attenuationDistance !== Infinity ) data.attenuationDistance = this.attenuationDistance;
		if ( this.attenuationColor !== undefined ) data.attenuationColor = this.attenuationColor.getHex();

		if ( this.size !== undefined ) data.size = this.size;
		if ( this.shadowSide !== null ) data.shadowSide = this.shadowSide;
		if ( this.sizeAttenuation !== undefined ) data.sizeAttenuation = this.sizeAttenuation;

		if ( this.blending !== NormalBlending ) data.blending = this.blending;
		if ( this.side !== FrontSide ) data.side = this.side;
		if ( this.vertexColors === true ) data.vertexColors = true;

		if ( this.opacity < 1 ) data.opacity = this.opacity;
		if ( this.transparent === true ) data.transparent = true;

		if ( this.blendSrc !== SrcAlphaFactor ) data.blendSrc = this.blendSrc;
		if ( this.blendDst !== OneMinusSrcAlphaFactor ) data.blendDst = this.blendDst;
		if ( this.blendEquation !== AddEquation ) data.blendEquation = this.blendEquation;
		if ( this.blendSrcAlpha !== null ) data.blendSrcAlpha = this.blendSrcAlpha;
		if ( this.blendDstAlpha !== null ) data.blendDstAlpha = this.blendDstAlpha;
		if ( this.blendEquationAlpha !== null ) data.blendEquationAlpha = this.blendEquationAlpha;
		if ( this.blendColor && this.blendColor.isColor ) data.blendColor = this.blendColor.getHex();
		if ( this.blendAlpha !== 0 ) data.blendAlpha = this.blendAlpha;

		if ( this.depthFunc !== LessEqualDepth ) data.depthFunc = this.depthFunc;
		if ( this.depthTest === false ) data.depthTest = this.depthTest;
		if ( this.depthWrite === false ) data.depthWrite = this.depthWrite;
		if ( this.colorWrite === false ) data.colorWrite = this.colorWrite;

		if ( this.stencilWriteMask !== 0xff ) data.stencilWriteMask = this.stencilWriteMask;
		if ( this.stencilFunc !== AlwaysStencilFunc ) data.stencilFunc = this.stencilFunc;
		if ( this.stencilRef !== 0 ) data.stencilRef = this.stencilRef;
		if ( this.stencilFuncMask !== 0xff ) data.stencilFuncMask = this.stencilFuncMask;
		if ( this.stencilFail !== KeepStencilOp ) data.stencilFail = this.stencilFail;
		if ( this.stencilZFail !== KeepStencilOp ) data.stencilZFail = this.stencilZFail;
		if ( this.stencilZPass !== KeepStencilOp ) data.stencilZPass = this.stencilZPass;
		if ( this.stencilWrite === true ) data.stencilWrite = this.stencilWrite;

		// rotation (SpriteMaterial)
		if ( this.rotation !== undefined && this.rotation !== 0 ) data.rotation = this.rotation;

		if ( this.polygonOffset === true ) data.polygonOffset = true;
		if ( this.polygonOffsetFactor !== 0 ) data.polygonOffsetFactor = this.polygonOffsetFactor;
		if ( this.polygonOffsetUnits !== 0 ) data.polygonOffsetUnits = this.polygonOffsetUnits;

		if ( this.linewidth !== undefined && this.linewidth !== 1 ) data.linewidth = this.linewidth;
		if ( this.dashSize !== undefined ) data.dashSize = this.dashSize;
		if ( this.gapSize !== undefined ) data.gapSize = this.gapSize;
		if ( this.scale !== undefined ) data.scale = this.scale;

		if ( this.dithering === true ) data.dithering = true;

		if ( this.alphaTest > 0 ) data.alphaTest = this.alphaTest;
		if ( this.alphaHash === true ) data.alphaHash = true;
		if ( this.alphaToCoverage === true ) data.alphaToCoverage = true;
		if ( this.premultipliedAlpha === true ) data.premultipliedAlpha = true;
		if ( this.forceSinglePass === true ) data.forceSinglePass = true;

		if ( this.wireframe === true ) data.wireframe = true;
		if ( this.wireframeLinewidth > 1 ) data.wireframeLinewidth = this.wireframeLinewidth;
		if ( this.wireframeLinecap !== 'round' ) data.wireframeLinecap = this.wireframeLinecap;
		if ( this.wireframeLinejoin !== 'round' ) data.wireframeLinejoin = this.wireframeLinejoin;

		if ( this.flatShading === true ) data.flatShading = true;

		if ( this.visible === false ) data.visible = false;

		if ( this.toneMapped === false ) data.toneMapped = false;

		if ( this.fog === false ) data.fog = false;

		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

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

		if ( isRootObject ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;

		}

		return data;

	}

	/**
	 * Returns a new material with copied values from this instance.
	 *
	 * @return {Material} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given material to this instance.
	 *
	 * @param {Material} source - The material to copy.
	 * @return {Material} A reference to this instance.
	 */
	copy( source ) {

		this.name = source.name;

		this.blending = source.blending;
		this.side = source.side;
		this.vertexColors = source.vertexColors;

		this.opacity = source.opacity;
		this.transparent = source.transparent;

		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;
		this.blendColor.copy( source.blendColor );
		this.blendAlpha = source.blendAlpha;

		this.depthFunc = source.depthFunc;
		this.depthTest = source.depthTest;
		this.depthWrite = source.depthWrite;

		this.stencilWriteMask = source.stencilWriteMask;
		this.stencilFunc = source.stencilFunc;
		this.stencilRef = source.stencilRef;
		this.stencilFuncMask = source.stencilFuncMask;
		this.stencilFail = source.stencilFail;
		this.stencilZFail = source.stencilZFail;
		this.stencilZPass = source.stencilZPass;
		this.stencilWrite = source.stencilWrite;

		const srcPlanes = source.clippingPlanes;
		let dstPlanes = null;

		if ( srcPlanes !== null ) {

			const n = srcPlanes.length;
			dstPlanes = new Array( n );

			for ( let i = 0; i !== n; ++ i ) {

				dstPlanes[ i ] = srcPlanes[ i ].clone();

			}

		}

		this.clippingPlanes = dstPlanes;
		this.clipIntersection = source.clipIntersection;
		this.clipShadows = source.clipShadows;

		this.shadowSide = source.shadowSide;

		this.colorWrite = source.colorWrite;

		this.precision = source.precision;

		this.polygonOffset = source.polygonOffset;
		this.polygonOffsetFactor = source.polygonOffsetFactor;
		this.polygonOffsetUnits = source.polygonOffsetUnits;

		this.dithering = source.dithering;

		this.alphaTest = source.alphaTest;
		this.alphaHash = source.alphaHash;
		this.alphaToCoverage = source.alphaToCoverage;
		this.premultipliedAlpha = source.premultipliedAlpha;
		this.forceSinglePass = source.forceSinglePass;

		this.visible = source.visible;

		this.toneMapped = source.toneMapped;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		return this;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires Material#dispose
	 */
	dispose() {

		/**
		 * Fires when the material has been disposed of.
		 *
		 * @event Material#dispose
		 * @type {Object}
		 */
		this.dispatchEvent( { type: 'dispose' } );

	}

	/**
	 * Setting this property to `true` indicates the engine the material
	 * needs to be recompiled.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

}

export { Material };
