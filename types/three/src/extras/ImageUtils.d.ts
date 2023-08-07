import { Mapping } from '../constants';
import { Texture } from '../textures/Texture';

export namespace ImageUtils {
    function getDataURL(image: any): string;

    /**
     * @deprecated
     */
    let crossOrigin: string;

    /**
     * @deprecated Use {@link TextureLoader THREE.TextureLoader()} instead.
     */
    function loadTexture(
        url: string,
        mapping?: Mapping,
        onLoad?: (texture: Texture) => void,
        onError?: (message: string) => void,
    ): Texture;

    /**
     * @deprecated Use {@link CubeTextureLoader THREE.CubeTextureLoader()} instead.
     */
    function loadTextureCube(
        array: string[],
        mapping?: Mapping,
        onLoad?: (texture: Texture) => void,
        onError?: (message: string) => void,
    ): Texture;
}
