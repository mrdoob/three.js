import {
	PlaneGeometry,
	ShaderMaterial,
	Uniform,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	Texture,
	sRGBEncoding
} from 'three';

let temporaryRenderer;
let fullscreenQuadGeometry;
let fullscreenQuadMaterial;
let fullscreenQuad;

export function decompress( texture, maxTextureSize, renderer = null ) {

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

            // took from threejs 05fc79cd52b79e8c3e8dec1e7dca72c5c39983a4
            vec4 conv_LinearTosRGB( in vec4 value ) {
                return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
            }

            void main(){ 
                gl_FragColor = vec4(vUv.xy, 0, 1);
                
                #ifdef IS_SRGB
                gl_FragColor = conv_LinearTosRGB( texture2D( blitTexture, vUv) );
                #else
                gl_FragColor = texture2D( blitTexture, vUv);
                #endif
            }`
	} );

	fullscreenQuadMaterial.uniforms.blitTexture.value = texture;
	fullscreenQuadMaterial.defines.IS_SRGB = texture.encoding == sRGBEncoding;
	fullscreenQuadMaterial.needsUpdate = true;

	if ( ! fullscreenQuad ) {

		fullscreenQuad = new Mesh( fullscreenQuadGeometry, fullscreenQuadMaterial );
		fullscreenQuad.frustrumCulled = false;

	}

	const temporaryCam = new PerspectiveCamera();
	const temporaryScene = new Scene();
	temporaryScene.add( fullscreenQuad );

	if ( ! renderer ) {

		if ( ! temporaryRenderer )
			temporaryRenderer = new WebGLRenderer( { antialias: false } );

		renderer = temporaryRenderer;

	}

	renderer.setSize( Math.min( texture.image.width, maxTextureSize ), Math.min( texture.image.height, maxTextureSize ) );
	renderer.clear();
	renderer.render( temporaryScene, temporaryCam );

	const readableTexture = new Texture( renderer.domElement );

	readableTexture.minFilter = texture.minFilter;
	readableTexture.magFilter = texture.magFilter;
	readableTexture.wrapS = texture.wrapS;
	readableTexture.wrapT = texture.wrapT;
	readableTexture.name = texture.name;

	readableTexture.userData.mimeType = 'image/png';

	if ( temporaryRenderer ) {

		temporaryRenderer.dispose();

	}

	return readableTexture;

}
