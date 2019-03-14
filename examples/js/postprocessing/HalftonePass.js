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

	this.fillQuad = THREE.Pass.createFillQuadScene( this.material );

};

THREE.HalftonePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.HalftonePass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

 		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;

 		if ( this.renderToScreen ) {

 			renderer.setRenderTarget( null );
 			renderer.render( this.fillQuad.quad, this.fillQuad.camera );

		} else {

 			renderer.setRenderTarget( writeBuffer );
 			if ( this.clear ) renderer.clear();
			renderer.render( this.fillQuad.quad, this.fillQuad.camera );

		}

 	},

 	setSize: function ( width, height ) {

 		this.uniforms.width.value = width;
 		this.uniforms.height.value = height;

 	}
} );
