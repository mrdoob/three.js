import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

/**
 * This class can only be used in combination with `copyFramebufferToTexture()` methods
 * of renderers. It extracts the contents of the current bound framebuffer and provides it
 * as a texture for further usage.
 *
 * ```js
 * const pixelRatio = window.devicePixelRatio;
 * const textureSize = 128 * pixelRatio;
 *
 * const frameTexture = new FramebufferTexture( textureSize, textureSize );
 *
 * // calculate start position for copying part of the frame data
 * const vector = new Vector2();
 * vector.x = ( window.innerWidth * pixelRatio / 2 ) - ( textureSize / 2 );
 * vector.y = ( window.innerHeight * pixelRatio / 2 ) - ( textureSize / 2 );
 *
 * renderer.render( scene, camera );
 *
 * // copy part of the rendered frame into the framebuffer texture
 * renderer.copyFramebufferToTexture( frameTexture, vector );
 * ```
 *
 * @augments Texture
 */
class FramebufferTexture extends Texture {

	/**
	 * Constructs a new framebuffer texture.
	 *
	 * @param {number} width - The width of the texture.
	 * @param {number} height - The height of the texture.
	 */
	constructor( width, height ) {

		super( { width, height } );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isFramebufferTexture = true;

		/**
		 * How the texture is sampled when a texel covers more than one pixel.
		 *
		 * Overwritten and set to `NearestFilter` by default to disable filtering.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.magFilter = NearestFilter;

		/**
		 * How the texture is sampled when a texel covers less than one pixel.
		 *
		 * Overwritten and set to `NearestFilter` by default to disable filtering.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.minFilter = NearestFilter;

		/**
		 * Whether to generate mipmaps (if possible) for a texture.
		 *
		 * Overwritten and set to `false` by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.generateMipmaps = false;

		this.needsUpdate = true;

	}

}

export { FramebufferTexture };
