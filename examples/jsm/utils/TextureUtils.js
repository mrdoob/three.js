import {
	PlaneGeometry,
	ShaderMaterial,
	Uniform,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	Texture,
	SRGBColorSpace
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
                gl_FragColor = vec4(vUv.xy, 0, 1);
                
                #ifdef IS_SRGB
                gl_FragColor = LinearTosRGB( texture2D( blitTexture, vUv) );
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
		fullscreenQuad.frustrumCulled = false;

	}

	const _camera = new PerspectiveCamera();
	const _scene = new Scene();
	_scene.add( fullscreenQuad );

	if ( ! renderer ) {

		renderer = _renderer = new WebGLRenderer( { antialias: false } );

	}

	renderer.setSize( Math.min( texture.image.width, maxTextureSize ), Math.min( texture.image.height, maxTextureSize ) );
	renderer.clear();
	renderer.render( _scene, _camera );

	const readableTexture = new Texture( renderer.domElement );

	readableTexture.minFilter = texture.minFilter;
	readableTexture.magFilter = texture.magFilter;
	readableTexture.wrapS = texture.wrapS;
	readableTexture.wrapT = texture.wrapT;
	readableTexture.name = texture.name;

	if ( _renderer ) {

		_renderer.dispose();
		_renderer = null;

	}

	return readableTexture;

}
