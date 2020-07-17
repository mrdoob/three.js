import { Mapping } from '../constants';
import { Texture } from '../textures/Texture';

export namespace ImageUtils {

	export function getDataURL(
		image: any,
	): string;

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
