import { Texture } from './Texture.js';
import { CubeReflectionMapping } from '../constants.js';

/**
 * Creates an array of cube textures. Each cube occupies six consecutive
 * layers, so `depth` must be a multiple of six. Sample a specific cube by
 * passing its index to `depth()` of a cube texture node.
 *
 * ```js
 * const renderTarget = new THREE.RenderTarget( size, size, { depth: cubeCount * 6, mapping: THREE.CubeReflectionMapping } );
 * renderTarget.texture = new THREE.CubeArrayTexture().copy( renderTarget.texture );
 *
 * const color = cubeTexture( renderTarget.texture, direction ).depth( cubeIndex );
 * ```
 *
 * Only supported by `WebGPURenderer` with a WebGPU backend.
 *
 * @augments Texture
 */
class CubeArrayTexture extends Texture {

	/**
	 * Constructs a new cube array texture.
	 *
	 * @param {number} [width=1] - The width of each cube face.
	 * @param {number} [height=1] - The height of each cube face.
	 * @param {number} [depth=6] - The number of layers (six per cube).
	 */
	constructor( width = 1, height = 1, depth = 6 ) {

		super( { width, height, depth }, CubeReflectionMapping );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeArrayTexture = true;

	}

}

export { CubeArrayTexture };
