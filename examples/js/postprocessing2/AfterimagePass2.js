/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 * @author Oletus / http://oletus.fi/ - ported to EffectComposer2
 */

THREE.AfterimagePass2 = function ( damp ) {

	THREE.Pass2.call( this );

	this.colorWriteBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorWriteBufferConfig.clear = true;

	this.colorReadBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorReadBufferConfig.isOutput = false;
	this.colorReadBufferConfig.isInput = true;

	this.bufferConfigs = [ this.colorWriteBufferConfig, this.colorReadBufferConfig ];

	if ( THREE.AfterimageShader === undefined )
		console.error( "THREE.AfterimagePass relies on THREE.AfterimageShader" );

	this.shader = THREE.AfterimageShader;

	this.uniforms = THREE.UniformsUtils.clone( this.shader.uniforms );

	this.uniforms[ "damp" ].value = damp !== undefined ? damp : 0.96;

	this.textureComp = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.textureOld = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.shader.vertexShader,
		fragmentShader: this.shader.fragmentShader

	} );

	this.compQuad = THREE.Pass2.createFillQuadScene( this.shaderMaterial );

	var material = new THREE.MeshBasicMaterial( { 
		map: this.textureComp.texture
	} );
	this.copyQuad = THREE.Pass2.createFillQuadScene( material );

};

THREE.AfterimagePass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.AfterimagePass2,

	render: function ( renderer, buffers ) {

		var writeBuffer = buffers[0];
		var readBuffer = buffers[1];

		this.uniforms[ "tOld" ].value = this.textureOld.texture;
		this.uniforms[ "tNew" ].value = readBuffer.texture;

		this.compQuad.quad.material = this.shaderMaterial;

		renderer.render( this.compQuad.scene, this.compQuad.camera, this.textureComp );
		renderer.render( this.copyQuad.scene, this.copyQuad.camera, this.textureOld );

		THREE.Pass2.renderWithClear( renderer, this.copyQuad.scene, this.copyQuad.camera, writeBuffer, this.colorWriteBufferConfig.clear );

	},

	setSize: function ( width, height ) {

		this.textureComp.setSize( width, height );
		this.textureOld.setSize( width, height );

	}

} );
