import { equirectUV } from '../../nodes/utils/EquirectUV.js';
import { texture as TSL_Texture } from '../../nodes/accessors/TextureNode.js';
import { positionWorldDirection } from '../../nodes/accessors/Position.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

import { RenderTarget } from '../../core/RenderTarget.js';
import { Scene } from '../../scenes/Scene.js';
import { CubeCamera } from '../../cameras/CubeCamera.js';
import { BoxGeometry } from '../../geometries/BoxGeometry.js';
import { Mesh } from '../../objects/Mesh.js';
import { CubeTexture } from '../../textures/CubeTexture.js';
import { BackSide, NoBlending, LinearFilter, LinearMipmapLinearFilter } from '../../constants.js';

/**
 * This class represents a cube render target. It is a special version
 * of `WebGLCubeRenderTarget` which is compatible with `WebGPURenderer`.
 *
 * @augments RenderTarget
 */
class CubeRenderTarget extends RenderTarget {

	/**
	 * Constructs a new cube render target.
	 *
	 * @param {number} [size=1] - The size of the render target.
	 * @param {RenderTarget~Options} [options] - The configuration object.
	 */
	constructor( size = 1, options = {} ) {

		super( size, size, options );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeRenderTarget = true;

		const image = { width: size, height: size, depth: 1 };
		const images = [ image, image, image, image, image, image ];

		/**
		 * Overwritten with a different texture type.
		 *
		 * @type {DataArrayTexture}
		 */
		this.texture = new CubeTexture( images );
		this._setTextureOptions( options );

		// By convention -- likely based on the RenderMan spec from the 1990's -- cube maps are specified by WebGL (and three.js)
		// in a coordinate system in which positive-x is to the right when looking up the positive-z axis -- in other words,
		// in a left-handed coordinate system. By continuing this convention, preexisting cube maps continued to render correctly.

		// three.js uses a right-handed coordinate system. So environment maps used in three.js appear to have px and nx swapped
		// and the flag isRenderTargetTexture controls this conversion. The flip is not required when using WebGLCubeRenderTarget.texture
		// as a cube texture (this is detected when isRenderTargetTexture is set to true for cube textures).

		this.texture.isRenderTargetTexture = true;

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

	/**
	 * Clears this cube render target.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
	 * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
	 * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
	 */
	clear( renderer, color = true, depth = true, stencil = true ) {

		const currentRenderTarget = renderer.getRenderTarget();

		for ( let i = 0; i < 6; i ++ ) {

			renderer.setRenderTarget( this, i );

			renderer.clear( color, depth, stencil );

		}

		renderer.setRenderTarget( currentRenderTarget );

	}

}

export default CubeRenderTarget;
