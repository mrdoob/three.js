import { ImageLoader } from './ImageLoader.js';
import { Texture } from '../textures/Texture.js';
import { Loader } from './Loader.js';

class TextureLoader extends Loader {

    /**
     * A cache object to store previously loaded textures
     * @type {Map<string, Texture>}
     */
    cache = new Map();

    /**
     * Maximum size of the cache
     * @type {number}
     */
    maxCacheSize = 100;

    constructor(manager) {
        super(manager);
    }

    /**
     * Loads a texture from the given URL
     * @param {string} url - The URL of the texture to load
     * @param {function} onLoad - A callback function to be called when the texture is loaded
     * @param {function} onProgress - A callback function to be called while the texture is loading
     * @param {function} onError - A callback function to be called if an error occurs while loading the texture
     * @returns {Texture}
     */
    load(url, onLoad, onProgress, onError) {
        // Check if the texture is already in the cache
        let texture = this.cache.get(url);
        if (texture) {
            // If it is, return the cached texture
            if (onLoad) onLoad(texture);
            return texture;
        }

        // If not, create a new Texture object
        texture = new Texture();

        // create a new ImageLoader
        const loader = new ImageLoader(this.manager);
        loader.setCrossOrigin(this.crossOrigin);
        loader.setPath(this.path);

        // load the image
        loader.load(url, image => {
            // set the image to the texture
            texture.image = image;
            texture.needsUpdate = true;

            // add the texture to the cache
            this.cache.set(url, texture);
            // if the cache size exceeds the maximum size, remove the least recently used texture
            if (this.cache.size > this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            // call the onLoad callback
            if (onLoad) onLoad(texture);
        }, onProgress, onError);

        return texture;
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

export { TextureLoader };
