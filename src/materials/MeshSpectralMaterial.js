import { TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';
import { Euler } from '../math/Euler.js';

/**
 * A spectral rendering material that simulates light transport in wavelength space.
 *
 * Unlike traditional RGB rendering, spectral rendering works by:
 * 1. Converting material colors to wavelength-dependent reflectance spectra
 * 2. Simulating light interaction in the spectral domain
 * 3. Converting the final spectrum back to RGB for display
 *
 * This approach enables physically accurate rendering of:
 * - Dispersion effects (prisms, rainbows)
 * - Interference patterns
 * - Fluorescence
 * - More accurate color mixing
 * - Metamerism (colors that match under one light but differ under another)
 *
 * The material extends the standard PBR workflow with spectral calculations.
 *
 * @augments Material
 */
class MeshSpectralMaterial extends Material {

	/**
	 * Constructs a new mesh spectral material.
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
		this.isMeshSpectralMaterial = true;

		this.type = 'MeshSpectralMaterial';

		this.defines = { 'SPECTRAL': '' };

		/**
		 * Base color of the material. This will be converted to a spectrum
		 * internally for spectral calculations.
		 *
		 * @type {Color}
		 * @default (1,1,1)
		 */
		this.color = new Color( 0xffffff );

		/**
		 * How rough the material appears. `0.0` means a smooth mirror reflection, `1.0`
		 * means fully diffuse. If `roughnessMap` is also provided,
		 * both values are multiplied.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.roughness = 1.0;

		/**
		 * How much the material is like a metal. Non-metallic materials such as wood
		 * or stone use `0.0`, metallic use `1.0`, with nothing (usually) in between.
		 * If `metalnessMap` is also provided, both values are multiplied.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.metalness = 0.0;

		/**
		 * Enable dispersion effects (wavelength-dependent refraction).
		 * This simulates how prisms and diamonds split white light into colors.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.dispersion = 0.0;

		/**
		 * The color map. May optionally include an alpha channel, typically combined
		 * with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
		 * color is modulated by the diffuse `color` and converted to spectrum.
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
		 * Intensity of the ambient occlusion effect.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aoMapIntensity = 1.0;

		/**
		 * Emissive (light) color of the material, essentially a solid color
		 * unaffected by other lighting. Converted to spectrum for emission.
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
		 * Set emissive (glow) map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.emissiveMap = null;

		/**
		 * The texture to create a bump map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.bumpMap = null;

		/**
		 * How much the bump map affects the material.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.bumpScale = 1;

		/**
		 * The texture to create a normal map.
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
		 * How much the normal map affects the material.
		 *
		 * @type {Vector2}
		 * @default (1,1)
		 */
		this.normalScale = new Vector2( 1, 1 );

		/**
		 * The displacement map affects the position of the mesh's vertices.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.displacementMap = null;

		/**
		 * How much the displacement map affects the mesh.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.displacementScale = 1;

		/**
		 * The offset of the displacement map's values on the mesh's vertices.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.displacementBias = 0;

		/**
		 * The green channel of this texture is used to alter the roughness of the
		 * material.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.roughnessMap = null;

		/**
		 * The blue channel of this texture is used to alter the metalness of the
		 * material.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.metalnessMap = null;

		/**
		 * The alpha map is a grayscale texture that controls the opacity across the
		 * surface.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.alphaMap = null;

		/**
		 * The environment map. Pre-processed with {@link PMREMGenerator}.
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
		 * Scales the effect of the environment map by multiplying its color.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.envMapIntensity = 1.0;

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
		 * @type {number}
		 * @default 1
		 */
		this.wireframeLinewidth = 1;

		/**
		 * Defines appearance of wireframe ends.
		 *
		 * @type {('round'|'bevel'|'miter')}
		 * @default 'round'
		 */
		this.wireframeLinecap = 'round';

		/**
		 * Defines appearance of wireframe joints.
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

		this.defines = { 'SPECTRAL': '' };

		this.color.copy( source.color );
		this.roughness = source.roughness;
		this.metalness = source.metalness;
		this.dispersion = source.dispersion;

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

		this.roughnessMap = source.roughnessMap;

		this.metalnessMap = source.metalnessMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapRotation.copy( source.envMapRotation );
		this.envMapIntensity = source.envMapIntensity;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

export { MeshSpectralMaterial };
