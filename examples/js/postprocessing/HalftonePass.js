console.warn( "THREE.HalftonePass: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author meatbags / xavierburrow.com, github/meatbags
 *
 * RGB Halftone pass for three.js effects composer. Requires THREE.HalftoneShader.
 *
 */

THREE.HalftonePass = function ( width, height, params ) {

	THREE.Pass.call( this );

 	if ( THREE.HalftoneShader === undefined ) {

 		console.error( 'THREE.HalftonePass requires THREE.HalftoneShader' );

 	}

 	this.uniforms = THREE.UniformsUtils.clone( THREE.HalftoneShader.uniforms );
 	this.material = new THREE.ShaderMaterial( {
 		uniforms: this.uniforms,
 		fragmentShader: THREE.HalftoneShader.fragmentShader,
 		vertexShader: THREE.HalftoneShader.vertexShader
 	} );

	// set params
	this.uniforms.width.value = width;
	this.uniforms.height.value = height;

	for ( var key in params ) {

		if ( params.hasOwnProperty( key ) && this.uniforms.hasOwnProperty( key ) ) {

			this.uniforms[ key ].value = params[ key ];

		}

	}

	this.fsQuad = new THREE.Pass.FullScreenQuad( this.material );

};

THREE.HalftonePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.HalftonePass,

	render: function ( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

 		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;

 		if ( this.renderToScreen ) {

 			renderer.setRenderTarget( null );
 			this.fsQuad.render( renderer );

		} else {

 			renderer.setRenderTarget( writeBuffer );
 			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

 	},

 	setSize: function ( width, height ) {

 		this.uniforms.width.value = width;
 		this.uniforms.height.value = height;

 	}
} );
