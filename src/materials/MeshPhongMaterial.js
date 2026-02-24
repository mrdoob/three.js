import { MultiplyOperation, TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';
import { Euler } from '../math/Euler.js';

/**
 * A material for shiny surfaces with specular highlights.
 *
 * The material uses a non-physically based [Blinn-Phong](https://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
 * model for calculating reflectance. Unlike the Lambertian model used in the
 * {@link MeshLambertMaterial} this can simulate shiny surfaces with specular
 * highlights (such as varnished wood). `MeshPhongMaterial` uses per-fragment shading.
 *
 * Performance will generally be greater when using this material over the
 * {@link MeshStandardMaterial} or {@link MeshPhysicalMaterial}, at the cost of
 * some graphical accuracy.
 *
 * @augments Material
 * @demo scenes/material-browser.html#MeshPhongMaterial
 */
class MeshPhongMaterial extends Material {

	/**
	 * Constructs a new mesh phong material.
	 *
	 * @param {Object} [parameters] - An object with one or more properties
	 * defining the material's appearance. Any property of the material
	 * (including any property from inherited materials) can be passed
	 * in here. Color values can be passed any type of value accepted
	 * by {@link Color#set}.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMeshPhongMaterial = true;

		this.type = 'MeshPhongMaterial';

		/**
		 * Color of the material.
		 *
		 * @type {Color}
		 * @default (1,1,1)
		 */
		this.color = new Color( 0xffffff ); // diffuse

		/**
		 * Specular color of the material. The default color is set to `0x111111` (very dark grey)
		 *
		 * This defines how shiny the material is and the color of its shine.
		 *
		 * @type {Color}
		 */
		this.specular = new Color( 0x111111 );

		/**
		 * How shiny the specular highlight is; a higher value gives a sharper highlight.
		 *
		 * @type {number}
		 * @default 30
		 */
		this.shininess = 30;

		/**
		 * The color map. May optionally include an alpha channel, typically combined
		 * with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
		 * color is modulated by the diffuse `color`.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.map = null;

		/**
		 * The light map. Requires a second set of UVs.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.lightMap = null;

		/**
		 * Intensity of the baked light.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.lightMapIntensity = 1.0;

		/**
		 * The red channel of this texture is used as the ambient occlusion map.
		 * Requires a second set of UVs.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.aoMap = null;

		/**
		 * Intensity of the ambient occlusion effect. Range is `[0,1]`, where `0`
		 * disables ambient occlusion. Where intensity is `1` and the AO map's
		 * red channel is also `1`, ambient light is fully occluded on a surface.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aoMapIntensity = 1.0;

		/**
		 * Emissive (light) color of the material, essentially a solid color
		 * unaffected by other lighting.
		 *
		 * @type {Color}
		 * @default (0,0,0)
		 */
		this.emissive = new Color( 0x000000 );

		/**
		 * Intensity of the emissive light. Modulates the emissive color.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.emissiveIntensity = 1.0;

		/**
		 * Set emissive (glow) map. The emissive map color is modulated by the
		 * emissive color and the emissive intensity. If you have an emissive map,
		 * be sure to set the emissive color to something other than black.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.emissiveMap = null;

		/**
		 * The texture to create a bump map. The black and white values map to the
		 * perceived depth in relation to the lights. Bump doesn't actually affect
		 * the geometry of the object, only the lighting. If a normal map is defined
		 * this will be ignored.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.bumpMap = null;

		/**
		 * How much the bump map affects the material. Typical range is `[0,1]`.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.bumpScale = 1;

		/**
		 * The texture to create a normal map. The RGB values affect the surface
		 * normal for each pixel fragment and change the way the color is lit. Normal
		 * maps do not change the actual shape of the surface, only the lighting. In
		 * case the material has a normal map authored using the left handed
		 * convention, the `y` component of `normalScale` should be negated to compensate
		 * for the different handedness.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.normalMap = null;

		/**
		 * The type of normal map.
		 *
		 * @type {(TangentSpaceNormalMap|ObjectSpaceNormalMap)}
		 * @default TangentSpaceNormalMap
		 */
		this.normalMapType = TangentSpaceNormalMap;

		/**
		 * How much the normal map affects the material. Typical value range is `[0,1]`.
		 *
		 * @type {Vector2}
		 * @default (1,1)
		 */
		this.normalScale = new Vector2( 1, 1 );

		/**
		 * The displacement map affects the position of the mesh's vertices. Unlike
		 * other maps which only affect the light and shade of the material the
		 * displaced vertices can cast shadows, block other objects, and otherwise
		 * act as real geometry. The displacement texture is an image where the value
		 * of each pixel (white being the highest) is mapped against, and
		 * repositions, the vertices of the mesh.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.displacementMap = null;

		/**
		 * How much the displacement map affects the mesh (where black is no
		 * displacement, and white is maximum displacement). Without a displacement
		 * map set, this value is not applied.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.displacementScale = 1;

		/**
		 * The offset of the displacement map's values on the mesh's vertices.
		 * The bias is added to the scaled sample of the displacement map.
		 * Without a displacement map set, this value is not applied.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.displacementBias = 0;

		/**
		 * The specular map value affects both how much the specular surface
		 * highlight contributes and how much of the environment map affects the
		 * surface.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.specularMap = null;

		/**
		 * The alpha map is a grayscale texture that controls the opacity across the
		 * surface (black: fully transparent; white: fully opaque).
		 *
		 * Only the color of the texture is used, ignoring the alpha channel if one
		 * exists. For RGB and RGBA textures, the renderer will use the green channel
		 * when sampling this texture due to the extra bit of precision provided for
		 * green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and
		 * luminance/alpha textures will also still work as expected.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.alphaMap = null;

		/**
		 * The environment map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.envMap = null;

		/**
		 * The rotation of the environment map in radians.
		 *
		 * @type {Euler}
		 * @default (0,0,0)
		 */
		this.envMapRotation = new Euler();

		/**
		 * How to combine the result of the surface's color with the environment map, if any.
		 *
		 * When set to `MixOperation`, the {@link MeshBasicMaterial#reflectivity} is used to
		 * blend between the two colors.
		 *
		 * @type {(MultiplyOperation|MixOperation|AddOperation)}
		 * @default MultiplyOperation
		 */
		this.combine = MultiplyOperation;

		/**
		 * How much the environment map affects the surface.
		 * The valid range is between `0` (no reflections) and `1` (full reflections).
		 *
		 * @type {number}
		 * @default 1
		 */
		this.reflectivity = 1;

		/**
		 * Scales the effect of the environment map by multiplying its color.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.envMapIntensity = 1.0;

		/**
		 * The index of refraction (IOR) of air (approximately 1) divided by the
		 * index of refraction of the material. It is used with environment mapping
		 * modes {@link CubeRefractionMapping} and {@link EquirectangularRefractionMapping}.
		 * The refraction ratio should not exceed `1`.
		 *
		 * @type {number}
		 * @default 0.98
		 */
		this.refractionRatio = 0.98;

		/**
		 * Renders the geometry as a wireframe.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.wireframe = false;

		/**
		 * Controls the thickness of the wireframe.
		 *
		 * Can only be used with {@link SVGRenderer}.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.wireframeLinewidth = 1;

		/**
		 * Defines appearance of wireframe ends.
		 *
		 * Can only be used with {@link SVGRenderer}.
		 *
		 * @type {('round'|'bevel'|'miter')}
		 * @default 'round'
		 */
		this.wireframeLinecap = 'round';

		/**
		 * Defines appearance of wireframe joints.
		 *
		 * Can only be used with {@link SVGRenderer}.
		 *
		 * @type {('round'|'bevel'|'miter')}
		 * @default 'round'
		 */
		this.wireframeLinejoin = 'round';

		/**
		 * Whether the material is rendered with flat shading or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.flatShading = false;

		/**
		 * Whether the material is affected by fog or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );
		this.specular.copy( source.specular );
		this.shininess = source.shininess;

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy( source.emissive );
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.specularMap = source.specularMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapRotation.copy( source.envMapRotation );
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.envMapIntensity = source.envMapIntensity;
		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

export { MeshPhongMaterial };
