import { equirectUV } from '../../nodes/utils/EquirectUVNode.js';
import { texture as TSL_Texture } from '../../nodes/accessors/TextureNode.js';
import { positionWorldDirection } from '../../nodes/accessors/PositionNode.js';
import { createNodeMaterialFromType } from '../../nodes/materials/NodeMaterial.js';

import { WebGLCubeRenderTarget } from '../../renderers/WebGLCubeRenderTarget.js';
import { Scene } from '../../scenes/Scene.js';
import { CubeCamera } from '../../cameras/CubeCamera.js';
import { BoxGeometry } from '../../geometries/BoxGeometry.js';
import { Mesh } from '../../objects/Mesh.js';
import { BackSide, NoBlending, LinearFilter, LinearMipmapLinearFilter } from '../../constants.js';

// @TODO: Consider rename WebGLCubeRenderTarget to just CubeRenderTarget

class CubeRenderTarget extends WebGLCubeRenderTarget {

	constructor( size = 1, options = {} ) {

		super( size, options );

		this.isCubeRenderTarget = true;

	}

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

		const material = createNodeMaterialFromType( 'MeshBasicNodeMaterial' );
		material.colorNode = TSL_Texture( texture, uvNode, 0 );
		material.side = BackSide;
		material.blending = NoBlending;

		const mesh = new Mesh( geometry, material );

		const scene = new Scene();
		scene.add( mesh );

		// Avoid blurred poles
		if ( texture.minFilter === LinearMipmapLinearFilter ) texture.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );
		camera.update( renderer, scene );

		texture.minFilter = currentMinFilter;
		texture.currentGenerateMipmaps = currentGenerateMipmaps;

		mesh.geometry.dispose();
		mesh.material.dispose();

		return this;

	}

}

export default CubeRenderTarget;
