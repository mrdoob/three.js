THREE.GLTransitioner = function ( width, height, transitionShader, uniforms, isNotFBO ) {

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene = new THREE.Scene();
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) );
	this.scene.add( this.quad );

	this.isNotFBO = isNotFBO;
	
	this.setTransitionShader( transitionShader, uniforms );

	this.fbo = new THREE.WebGLRenderTarget( width || window.innerWidth, height || window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false

	} );

}

THREE.GLTransitioner.prototype.update = function( renderer ) {

	this.material.uniforms.progress.value = Math.min( this.material.uniforms.progress.value, 1 );
	this.material.uniforms.progress.value = Math.max( this.material.uniforms.progress.value, 0 );

	if(this.isNotFBO){

		renderer.render( this.scene, this.camera, undefined, false );

	} else {

		renderer.render( this.scene, this.camera, this.fbo, true );

	}
	

};

THREE.GLTransitioner.prototype.setTransitionShader = function( transitionShader, uniforms ) {

	this.uniforms = {

		tDiffuse1: { value: uniforms.tDiffuse1 },
		tDiffuse2: { value: uniforms.tDiffuse2 },
		mixRatio: { value: 0.0 },
		progress: { value: 0.0 }

	};

	for ( var key in transitionShader.uniforms ) {

		this.uniforms[ key ] = { value: uniforms[ key ] || transitionShader.uniforms[ key ].value };

	}
	
	this.material = new THREE.ShaderMaterial({

		uniforms: this.uniforms,

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float mixRatio;",
			"uniform sampler2D tDiffuse1;",
			"uniform sampler2D tDiffuse2;",
			"uniform float progress;",

			"varying vec2 vUv;",

			"vec4 getFromColor ( vec2 uv ) { ",

				"return texture2D( tDiffuse1, uv ); ",

			"}",

			"vec4 getToColor ( vec2 uv ) { ",

				"return texture2D( tDiffuse2, uv);",

			"}",

			transitionShader.fragmentShader,

			"void main() {",

				"gl_FragColor = transition( vUv );",

			"}"

		].join( "\n" )
	});
	
	this.quad.material = this.material;

};