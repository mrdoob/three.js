/**
 * Reusable wrapper around `GPUTexelCopyTextureInfo`. Mutates in place to avoid
 * per-frame GC pressure while keeping call sites readable via chainable setters.
 *
 * @private
 */
class TexelCopyTextureInfo {

	/**
	 * Constructs a new texel-copy texture info.
	 */
	constructor() {

		/**
		 * The source/destination GPU texture.
		 *
		 * @type {?GPUTexture}
		 * @default null
		 */
		this.texture = null;

		/**
		 * The mip level of the texture to copy from/to.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.mipLevel = 0;

		/**
		 * The origin of the copy within the texture.
		 *
		 * @type {{x: number, y: number, z: number}}
		 */
		this.origin = { x: 0, y: 0, z: 0 };

	}

	/**
	 * Sets the texture.
	 *
	 * @param {GPUTexture} texture - The GPU texture.
	 * @return {TexelCopyTextureInfo} A reference to this instance.
	 */
	setTexture( texture ) {

		this.texture = texture;
		return this;

	}

	/**
	 * Sets the mip level.
	 *
	 * @param {number} mipLevel - The mip level.
	 * @return {TexelCopyTextureInfo} A reference to this instance.
	 */
	setMipLevel( mipLevel ) {

		this.mipLevel = mipLevel;
		return this;

	}

	/**
	 * Sets the origin of the copy.
	 *
	 * @param {number} x - The x coordinate.
	 * @param {number} y - The y coordinate.
	 * @param {number} z - The z coordinate.
	 * @return {TexelCopyTextureInfo} A reference to this instance.
	 */
	setOrigin( x, y, z ) {

		this.origin.x = x;
		this.origin.y = y;
		this.origin.z = z;
		return this;

	}

	/**
	 * Clears the texture reference so the scratch doesn't retain a GPU object across frames.
	 */
	reset() {

		this.texture = null;

	}

}

export default TexelCopyTextureInfo;
