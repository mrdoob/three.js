import { equirectUV } from '../../nodes/utils/EquirectUVNode.js';
import { texture as TSL_Texture } from '../../nodes/accessors/TextureNode.js';
import { positionWorldDirection } from '../../nodes/accessors/Position.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { blur, getBlurParams } from '../../../nodes/pmrem/PMREMUtils.js';

import { WebGLCubeRenderTarget } from '../../renderers/WebGLCubeRenderTarget.js';
import { Scene } from '../../scenes/Scene.js';
import { CubeCamera } from '../../cameras/CubeCamera.js';
import { BoxGeometry } from '../../geometries/BoxGeometry.js';
import { Mesh } from '../../objects/Mesh.js';
import { BackSide, NoBlending, LinearFilter, LinearMipmapLinearFilter } from '../../constants.js';
import {cubeTexture as TSL_CubeTexture} from '../../nodes/accessors/CubeTextureNode.js';

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

	fromBlur(renderer, cubeMap, sigmaRadians, poleAxis=new Vector3(0, 1, 0)){
		// The maximum length of the blur for loop. Smaller sigmas will use fewer
		// samples and exit early, but not recompile the shader.
		const MAX_SAMPLES = 20;

		const blurTarget=new CubeRenderTarget(Math.min(this.width, cubeMap.width));

		const geometry = new BoxGeometry( 5, 5, 5 );

		const blurMaterial = new NodeMaterial();
		blurMaterial.side = BackSide;
		blurMaterial.depthTest = false;
		blurMaterial.depthWrite = false;
		blurMaterial.blending = NoBlending;

		const weights = uniformArray( new Array( MAX_SAMPLES ).fill( 0 ) );
		const dTheta = uniform( 0 );
		const n = float( MAX_SAMPLES );
		const latitudinal = uniform( 0 ); // false, bool
		const samples = uniform( 1 ); // int
		const envMap = texture( null );

		const cubeSampler=Fn(( [ sampleDirection ] )=>{
				return TSL_CubeTexture(envMap, sampleDirection, 0);
			});
		blurMaterial.fragmentNode = blur( { n, latitudinal: latitudinal.equal( 1 ), poleAxis: vec3(poleAxis), outputDirection: positionWorldDirection, weights, samples, dTheta, sampler: cubeSampler } );

		const mesh = new Mesh( geometry, blurMaterial );

		const scene = new Scene();
		scene.add( mesh );

		const camera = new CubeCamera( 1, 10, blurTarget );

		envMap.value=cubeMap.texture;
		latitudinal.value=1;
		const blurParams1=getBlurParams(sigmaRadians, cubeMap.width, MAX_SAMPLES);
		weights.value=blurParams1.weights;
		samples.value=blurParams1.samples;
		dTheta.value=blurParams1.radiansPerPixel;

		camera.update( renderer, scene );

		camera.renderTarget=this;
		envMap.value=blurTarget.texture;
		latitudinal.value=0;
		const blurParams2=getBlurParams(sigmaRadians, blurTarget.width, MAX_SAMPLES);
		weights.value=blurParams2.weights;
		samples.value=blurParams2.samples;
		dTheta.value=blurParams2.radiansPerPixel;

		camera.update( renderer, scene );

		blurTarget.dispose();
	}

}

export default CubeRenderTarget;
