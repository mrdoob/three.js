import { LoadingManager } from './LoadingManager';
import { Texture } from './../textures/Texture';

/**
 * Class for loading a texture.
 * Unlike other loaders, this one emits events instead of using predefined callbacks. So if you're interested in getting notified when things happen, you need to add listeners to the object.
 */
export class TextureLoader {
  constructor(manager?: LoadingManager);

  manager: LoadingManager;
  crossOrigin: string;
  withCredentials: string;
  path: string;

  /**
   * Begin loading from url
   *
   * @param url
   */
  load(
    url: string,
    onLoad?: (texture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): Texture;
  setCrossOrigin(crossOrigin: string): TextureLoader;
  setWithCredentials(value: string): TextureLoader;
  setPath(path: string): TextureLoader;
}
