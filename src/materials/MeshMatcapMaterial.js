import { TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';

/**
 * This material is defined by a MatCap (or Lit Sphere) texture, which encodes the
 * material color and shading.
 *
 * `MeshMatcapMaterial` does not respond to lights since the matcap image file encodes
 * baked lighting. It will cast a shadow onto an object that receives shadows
 * (and shadow clipping works), but it will not self-shadow or receive
 * shadows.
 *
 * @augments Material
 */
class MeshMatcapMaterial extends Material {

	/**
	 * Constructs a new mesh matcap material.
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
		this.isMeshMatcapMaterial = true;

		this.defines = { 'MATCAP': '' };

		this.type = 'MeshMatcapMaterial';

		/**
		 * Color of the material.
		 *
		 * @type {Color}
		 * @default (1,1,1)
		 */
		this.color = new Color( 0xffffff ); // diffuse

		/**
		 * The matcap map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.matcap = null;

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

		this.defines = { 'MATCAP': '' };

		this.color.copy( source.color );

		this.matcap = source.matcap;

		this.map = source.map;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.alphaMap = source.alphaMap;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

export { MeshMatcapMaterial };
