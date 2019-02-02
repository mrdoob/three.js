/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus / http://oletus.fi/
 */

THREE.TexturePass2 = function ( map, opacity ) {

	THREE.Pass2.call( this );

	this.colorBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorBufferConfig.clear = true;
	this.colorBufferConfig.isInput = true;

	this.bufferConfigs = [ this.colorBufferConfig ];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.TexturePass2 relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.map = map;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		depthTest: false,
		depthWrite: false

	} );

	this.fillQuad = THREE.Pass2.createFillQuadScene( this.material );

};

THREE.TexturePass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.TexturePass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		var writeBuffer = buffers[0];

		this.uniforms[ "opacity" ].value = this.opacity;
		this.uniforms[ "tDiffuse" ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		THREE.Pass2.renderWithClear( renderer, this.fillQuad.scene, this.fillQuad.camera, writeBuffer, this.colorBufferConfig.clear );
	}

} );
