import { Material } from './Material.js';
import { BasicDepthPacking } from '../constants.js';

/**
 * A material for drawing geometry by depth. Depth is based off of the camera
 * near and far plane. White is nearest, black is farthest.
 *
 * @augments Material
 * @demo scenes/material-browser.html#MeshDepthMaterial
 */
class MeshDepthMaterial extends Material {

	/**
	 * Constructs a new mesh depth material.
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
		this.isMeshDepthMaterial = true;

		this.type = 'MeshDepthMaterial';

		/**
		 * Type for depth packing.
		 *
		 * @type {(BasicDepthPacking|RGBADepthPacking|RGBDepthPacking|RGDepthPacking)}
		 * @default BasicDepthPacking
		 */
		this.depthPacking = BasicDepthPacking;

		/**
		 * The color map. May optionally include an alpha channel, typically combined
		 * with {@link Material#transparent} or {@link Material#alphaTest}.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.map = null;

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
		 * Renders the geometry as a wireframe.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.wireframe = false;

		/**
		 * Controls the thickness of the wireframe.
		 *
		 * WebGL and WebGPU ignore this property and always render
		 * 1 pixel wide lines.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.wireframeLinewidth = 1;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.depthPacking = source.depthPacking;

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		return this;

	}

}

export { MeshDepthMaterial };
