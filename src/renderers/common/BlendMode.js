import { NormalBlending, AddEquation, SrcAlphaFactor, OneMinusSrcAlphaFactor } from '../../constants.js';

/**
 * Represents blending configuration.
 *
 * This class encapsulates all blending-related properties that control how
 * a material's colors are combined with the colors already in the frame buffer.
 */
class BlendMode {

	/**
	 * Constructs a new blending configuration.
	 *
	 * @param {(NoBlending|NormalBlending|AdditiveBlending|SubtractiveBlending|MultiplyBlending|CustomBlending|MaterialBlending)} [blending=NormalBlending] - The blending mode.
	 */
	constructor( blending = NormalBlending ) {

		/**
		 * Defines the blending type.
		 *
		 * It must be set to `CustomBlending` if custom blending properties like
		 * {@link BlendMode#blendSrc}, {@link BlendMode#blendDst} or {@link BlendMode#blendEquation}
		 * should have any effect.
		 *
		 * @type {(NoBlending|NormalBlending|AdditiveBlending|SubtractiveBlending|MultiplyBlending|CustomBlending|MaterialBlending)}
		 * @default NormalBlending
		 */
		this.blending = blending;

		/**
		 * Defines the blending source factor.
		 *
		 * This determines how the source (incoming) fragment color is factored before being added
		 * to the destination (existing) fragment color in the frame buffer.
		 *
		 * @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default SrcAlphaFactor
		 */
		this.blendSrc = SrcAlphaFactor;

		/**
		 * Defines the blending destination factor.
		 *
		 * This determines how the destination (existing) fragment color in the frame buffer
		 * is factored before being combined with the source (incoming) fragment color.
		 *
		 * @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default OneMinusSrcAlphaFactor
		 */
		this.blendDst = OneMinusSrcAlphaFactor;

		/**
		 * Defines the blending equation.
		 *
		 * This determines how the source and destination colors are combined.
		 *
		 * @type {(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
		 * @default AddEquation
		 */
		this.blendEquation = AddEquation;

		/**
		 * Defines the blending source alpha factor.
		 *
		 * When set, this allows separate control of the alpha channel's source blending factor.
		 * If `null`, {@link BlendMode#blendSrc} is used for the alpha channel as well.
		 *
		 * @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default null
		 */
		this.blendSrcAlpha = null;

		/**
		 * Defines the blending destination alpha factor.
		 *
		 * When set, this allows separate control of the alpha channel's destination blending factor.
		 * If `null`, {@link BlendMode#blendDst} is used for the alpha channel as well.
		 *
		 * @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		 * @default null
		 */
		this.blendDstAlpha = null;

		/**
		 * Defines the blending equation of the alpha channel.
		 *
		 * When set, this allows separate control of the alpha channel's blending equation.
		 * If `null`, {@link BlendMode#blendEquation} is used for the alpha channel as well.
		 *
		 * @type {?(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
		 * @default null
		 */
		this.blendEquationAlpha = null;

		/**
		 * Defines whether to premultiply the alpha (transparency) value.
		 *
		 * If `true`, the RGB color of the texture or material is multiplied by its alpha value.
		 * This is useful for transparent textures/materials where the color data
		 * should already include the transparency information.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.premultiplyAlpha = false;

	}

	/**
	 * Copies the blending properties from the given source to this instance.
	 *
	 * @param {BlendMode} source - The blending configuration to copy from.
	 * @return {BlendMode} A reference to this instance.
	 */
	copy( source ) {

		this.blending = source.blending;
		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;
		this.premultiplyAlpha = source.premultiplyAlpha;

		return this;

	}

	/**
	 * Returns a clone of this blending configuration.
	 *
	 * @return {BlendMode} A new Blending instance with the same properties.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export default BlendMode;
