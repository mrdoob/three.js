/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus / http://oletus.fi/ - Ported to EffectComposer2
 */

THREE.GlitchPass2 = function ( dt_size ) {

	THREE.Pass2.call( this );

	this.colorWriteBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorWriteBufferConfig.clear = true;

	this.colorReadBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorReadBufferConfig.isOutput = false;
	this.colorReadBufferConfig.isInput = true;

	this.bufferConfigs = [ this.colorWriteBufferConfig, this.colorReadBufferConfig ];

	if ( THREE.DigitalGlitch === undefined ) console.error( "THREE.GlitchPass2 relies on THREE.DigitalGlitch" );

	var shader = THREE.DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( dt_size == undefined ) dt_size = 64;


	this.uniforms[ "tDisp" ].value = this.generateHeightmap( dt_size );


	this.material = new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.fillQuad = THREE.Pass2.createFillQuadScene( this.material );

	this.goWild = false;
	this.curF = 0;
	this.generateTrigger();

};

THREE.GlitchPass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.GlitchPass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		var writeBuffer = buffers[0];
		var readBuffer = buffers[1];

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ 'seed' ].value = Math.random();//default seeding
		this.uniforms[ 'byp' ].value = 0;

		if ( this.curF % this.randX == 0 || this.goWild == true ) {

			this.uniforms[ 'amount' ].value = Math.random() / 30;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.curF = 0;
			this.generateTrigger();

		} else if ( this.curF % this.randX < this.randX / 5 ) {

			this.uniforms[ 'amount' ].value = Math.random() / 90;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );

		} else if ( this.goWild == false ) {

			this.uniforms[ 'byp' ].value = 1;

		}

		this.curF ++;
		this.fillQuad.quad.material = this.material;

		THREE.Pass2.renderWithClear( renderer, this.fillQuad.scene, this.fillQuad.camera, writeBuffer, this.colorWriteBufferConfig.clear );

	},

	generateTrigger: function() {

		this.randX = THREE.Math.randInt( 120, 240 );

	},

	generateHeightmap: function( dt_size ) {

		var data_arr = new Float32Array( dt_size * dt_size * 3 );
		var length = dt_size * dt_size;

		for ( var i = 0; i < length; i ++ ) {

			var val = THREE.Math.randFloat( 0, 1 );
			data_arr[ i * 3 + 0 ] = val;
			data_arr[ i * 3 + 1 ] = val;
			data_arr[ i * 3 + 2 ] = val;

		}

		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		texture.needsUpdate = true;
		return texture;

	}

} );
