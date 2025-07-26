import { equirectUV } from '../../nodes/utils/EquirectUV.js';
import { texture as TSL_Texture } from '../../nodes/accessors/TextureNode.js';
import { positionWorldDirection } from '../../nodes/accessors/Position.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

import { WebGLCubeRenderTarget } from '../../renderers/WebGLCubeRenderTarget.js';
import { Scene } from '../../scenes/Scene.js';
import { CubeCamera } from '../../cameras/CubeCamera.js';
import { BoxGeometry } from '../../geometries/BoxGeometry.js';
import { Mesh } from '../../objects/Mesh.js';
import { BackSide, NoBlending, LinearFilter, LinearMipmapLinearFilter } from '../../constants.js';

// @TODO: Consider rename WebGLCubeRenderTarget to just CubeRenderTarget

/**
 * This class represents a cube render target. It is a special version
 * of `WebGLCubeRenderTarget` which is compatible with `WebGPURenderer`.
 *
 * @augments WebGLCubeRenderTarget
 */
class CubeRenderTarget extends WebGLCubeRenderTarget {

	/**
	 * Constructs a new cube render target.
	 *
	 * @param {number} [size=1] - The size of the render target.
	 * @param {RenderTarget~Options} [options] - The configuration object.
	 */
	constructor( size = 1, options = {} ) {

		super( size, options );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeRenderTarget = true;

	}

	/**
	 * Converts the given equirectangular texture to a cube map.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Texture} texture - The equirectangular texture.
	 * @return {CubeRenderTarget} A reference to this cube render target.
	 */
	fromEquirectangularTexture( renderer, texture ) {

		const currentMinFilter = texture.minFilter;
		const currentGenerateMipmaps = texture.generateMipmaps;

		texture.generateMipmaps = true;

		this.texture.type = texture.type;
		this.texture.colorSpace = texture.colorSpace;

		this.texture.generateMipmaps = texture.generateMipmaps;
		this.texture.minFilter = texture.minFilter;
		this.texture.magFilter = texture.magFilter;

		const geometry = new BoxGeometry( 5, 5, 5 );

		const uvNode = equirectUV( positionWorldDirection );

		const material = new NodeMaterial();
		material.colorNode = TSL_Texture( texture, uvNode, 0 );
		material.side = BackSide;
		material.blending = NoBlending;

		const mesh = new Mesh( geometry, material );

		const scene = new Scene();
		scene.add( mesh );

		// Avoid blurred poles
		if ( texture.minFilter === LinearMipmapLinearFilter ) texture.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );

		const currentMRT = renderer.getMRT();
		renderer.setMRT( null );

		camera.update( renderer, scene );

		renderer.setMRT( currentMRT );

		texture.minFilter = currentMinFilter;
		texture.currentGenerateMipmaps = currentGenerateMipmaps;

		mesh.geometry.dispose();
		mesh.material.dispose();

		return this;

	}

}

export default CubeRenderTarget;
