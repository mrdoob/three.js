import { Mapping } from '../constants';
import { Texture } from '../textures/Texture';

// Extras /////////////////////////////////////////////////////////////////////

/**
 * @deprecated Use {@link TextureLoader} instead.
 */
export namespace ImageUtils {
	/**
   * @deprecated
   */
	export let crossOrigin: string;

	/**
   * @deprecated Use {@link TextureLoader THREE.TextureLoader()} instead.
   */
	export function loadTexture(
		url: string,
		mapping?: Mapping,
		onLoad?: ( texture: Texture ) => void,
		onError?: ( message: string ) => void
	): Texture;

	/**
   * @deprecated Use {@link CubeTextureLoader THREE.CubeTextureLoader()} instead.
   */
	export function loadTextureCube(
		array: string[],
		mapping?: Mapping,
		onLoad?: ( texture: Texture ) => void,
		onError?: ( message: string ) => void
	): Texture;
}
