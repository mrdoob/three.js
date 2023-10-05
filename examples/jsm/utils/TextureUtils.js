import {
	PlaneGeometry,
	ShaderMaterial,
	Uniform,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	SRGBColorSpace,
	WebGLRenderTarget,
	LinearSRGBColorSpace,
} from 'three';

let _renderer;
let fullscreenQuadGeometry;
let fullscreenQuadMaterial;
let fullscreenQuad;

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
				#ifdef IS_SRGB
				gl_FragColor = LinearTosRGB( texture2D( blitTexture, vUv) );
				#else
				gl_FragColor = texture2D( blitTexture, vUv);
				#endif
			}`
	} );

	fullscreenQuadMaterial.uniforms.blitTexture.value = texture;
	const IS_SRGB = texture.colorSpace == SRGBColorSpace;
	fullscreenQuadMaterial.defines.IS_SRGB = IS_SRGB;
	fullscreenQuadMaterial.needsUpdate = true;

	if ( ! fullscreenQuad ) {

		fullscreenQuad = new Mesh( fullscreenQuadGeometry, fullscreenQuadMaterial );
		fullscreenQuad.frustrumCulled = false;

	}

	const _camera = new PerspectiveCamera();
	const _scene = new Scene();
	_scene.add( fullscreenQuad );

	if ( ! renderer ) {

		renderer = _renderer = new WebGLRenderer( { antialias: false } );

	}

	const width = Math.min( texture.image.width, maxTextureSize );
	const height = Math.min( texture.image.height, maxTextureSize );

	renderer.setSize( width, height );
	renderer.clear();

	const renderTarget = new WebGLRenderTarget( width, height, {
		stencilBuffer: true,
		colorSpace: IS_SRGB ? SRGBColorSpace : LinearSRGBColorSpace,
	} );
	renderer.setRenderTarget( renderTarget );
	renderer.render( _scene, _camera );
	renderer.setRenderTarget( null );

	const pixelBuffer = new Uint8Array( width * height * 4 );
	renderer.readRenderTargetPixels(
		renderTarget,
		0, 0,
		width, height,
		pixelBuffer
	);
	const imageData = new ImageData( new Uint8ClampedArray( pixelBuffer ), width, height );

	renderTarget.texture.image = imageData;
	renderTarget.dispose();

	const readableTexture = renderTarget.texture;

	readableTexture.minFilter = texture.minFilter;
	readableTexture.magFilter = texture.magFilter;
	readableTexture.wrapS = texture.wrapS;
	readableTexture.wrapT = texture.wrapT;
	readableTexture.name = texture.name;

	if ( _renderer ) {

		_renderer.dispose();
		_renderer.forceContextLoss();
		_renderer = null;

	}

	return readableTexture;

}
