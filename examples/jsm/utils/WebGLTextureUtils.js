import {
	PlaneGeometry,
	ShaderMaterial,
	Uniform,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	CanvasTexture,
	SRGBColorSpace
} from 'three';

/**
 * @module WebGLTextureUtils
 * @three_import import * as WebGLTextureUtils from 'three/addons/utils/WebGLTextureUtils.js';
 */

let _renderer;
let fullscreenQuadGeometry;
let fullscreenQuadMaterial;
let fullscreenQuad;

/**
 * Returns an uncompressed version of the given compressed texture.
 *
 * This module can only be used with {@link WebGLRenderer}. When using {@link WebGPURenderer},
 * import the function from {@link WebGPUTextureUtils}.
 *
 * @param {CompressedTexture} texture - The compressed texture.
 * @param {number} [maxTextureSize=Infinity] - The maximum size of the uncompressed texture.
 * @param {?WebGLRenderer} [renderer=null] - A reference to a renderer.
 * @return {CanvasTexture} The uncompressed texture.
 */
export function decompress( texture, maxTextureSize = Infinity, renderer = null ) {

	if ( ! fullscreenQuadGeometry ) fullscreenQuadGeometry = new PlaneGeometry( 2, 2, 1, 1 );
	if ( ! fullscreenQuadMaterial ) fullscreenQuadMaterial = new ShaderMaterial( {
		uniforms: { blitTexture: new Uniform( texture ) },
		vertexShader: `
			varying vec2 vUv;
			void main(){
				vUv = uv;
				gl_Position = vec4(position.xy * 1.0,0.,.999999);
			}`,
		fragmentShader: `
			uniform sampler2D blitTexture; 
			varying vec2 vUv;

			void main(){ 
				gl_FragColor = vec4(vUv.xy, 0, 1);
				
				#ifdef IS_SRGB
				gl_FragColor = sRGBTransferOETF( texture2D( blitTexture, vUv) );
				#else
				gl_FragColor = texture2D( blitTexture, vUv);
				#endif
			}`
	} );

	fullscreenQuadMaterial.uniforms.blitTexture.value = texture;
	fullscreenQuadMaterial.defines.IS_SRGB = texture.colorSpace == SRGBColorSpace;
	fullscreenQuadMaterial.needsUpdate = true;

	if ( ! fullscreenQuad ) {

		fullscreenQuad = new Mesh( fullscreenQuadGeometry, fullscreenQuadMaterial );
		fullscreenQuad.frustumCulled = false;

	}

	const _camera = new PerspectiveCamera();
	const _scene = new Scene();
	_scene.add( fullscreenQuad );

	if ( renderer === null ) {

		renderer = _renderer = new WebGLRenderer( { antialias: false } );

	}

	const width = Math.min( texture.image.width, maxTextureSize );
	const height = Math.min( texture.image.height, maxTextureSize );

	renderer.setSize( width, height );
	renderer.clear();
	renderer.render( _scene, _camera );

	const canvas = document.createElement( 'canvas' );
	const context = canvas.getContext( '2d' );

	canvas.width = width;
	canvas.height = height;

	context.drawImage( renderer.domElement, 0, 0, width, height );

	const readableTexture = new CanvasTexture( canvas );

	readableTexture.minFilter = texture.minFilter;
	readableTexture.magFilter = texture.magFilter;
	readableTexture.wrapS = texture.wrapS;
	readableTexture.wrapT = texture.wrapT;
	readableTexture.colorSpace = texture.colorSpace;
	readableTexture.name = texture.name;

	if ( _renderer ) {

		_renderer.forceContextLoss();
		_renderer.dispose();
		_renderer = null;

	}

	return readableTexture;

}
