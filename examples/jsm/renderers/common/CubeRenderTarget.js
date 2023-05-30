import MeshBasicNodeMaterial from '../../nodes/materials/MeshBasicNodeMaterial.js';
import { WebGLCubeRenderTarget, Scene, CubeCamera, BoxGeometry, Mesh, BackSide, NoBlending, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, NoColorSpace, FloatType, HalfFloatType } from 'three';
import { equirectUV } from '../../nodes/utils/EquirectUVNode.js';
import { texture as TSL_Texture } from '../../nodes/accessors/TextureNode.js';
import { positionWorldDirection } from '../../nodes/accessors/PositionNode.js';
import { vec2, vec3 } from '../../nodes/shadernode/ShaderNode.js';
import { transformedNormalWorld } from '../../nodes/accessors/NormalNode.js';

// @TODO: Consider rename WebGLCubeRenderTarget to just CubeRenderTarget

class CubeRenderTarget extends WebGLCubeRenderTarget {

	constructor( size = 1, options = {} ) {

		super( size, options );

		this.isCubeRenderTarget = true;

	}

	fromEquirectangularTexture( renderer, texture ) {

		this.texture.type = HalfFloatType;
		this.texture.format = NoColorSpace;

		this.texture.format = RGBAFormat;
		this.texture.type = texture.type;
		this.texture.colorSpace = texture.colorSpace;

		this.texture.generateMipmaps = texture.generateMipmaps;
		this.texture.minFilter = texture.minFilter;
		this.texture.magFilter = texture.magFilter;

		const geometry = new BoxGeometry( 5, 5, 5 );

		let uvNode = equirectUV( positionWorldDirection );
		//uvNode = vec2( uvNode.x, uvNode.y.oneMinus() );

		const material = new MeshBasicNodeMaterial();
		material.colorNode = TSL_Texture( texture, uvNode, 0 ); //material.uniforms.tEquirect.value = texture;
		material.side = BackSide;
		material.blending = NoBlending;

		const mesh = new Mesh( geometry, material );
		mesh.name = 'fromEquirectangularTexture';

		const scene = new Scene();
		scene.add( mesh );

		const currentMinFilter = texture.minFilter;

		// Avoid blurred poles
		if ( texture.minFilter === LinearMipmapLinearFilter ) texture.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );
		camera.update( renderer, scene );

		texture.minFilter = currentMinFilter;

		mesh.geometry.dispose();
		mesh.material.dispose();

		return this;

	}

}

export default CubeRenderTarget;
