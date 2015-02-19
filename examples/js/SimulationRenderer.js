/**
 * @author zz85 https://github.com/zz85 / http://www.lab4games.net/zz85/blog
 *
 * Bird Simulation Render
 *
 * 	A simple scene rendering a quad of the following shaders
 *	1. Pass-thru Shader,
 *	2. Bird Position Update Shader,
 *	3. Bird Velocity Update Shader
 *
 */

function SimulationRenderer(WIDTH, renderer) {

	WIDTH = WIDTH || 4;
	var camera = new THREE.Camera();
	camera.position.z = 1;

	// Init RTT stuff
	gl = renderer.getContext();

	if ( !gl.getExtension( "OES_texture_float" )) {
		alert( "No OES_texture_float support for float textures!" );
		return;
	}

	if ( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
		alert( "No support for vertex shader textures!" );
		return;
	}

	var scene = new THREE.Scene();

	var uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2( WIDTH, WIDTH ) },
		texture: { type: "t", value: null }
	};

	var passThruShader = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	} );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), passThruShader );

	var positionShader = new THREE.ShaderMaterial( {

		uniforms: {
			time: { type: "f", value: 1.0 },
			delta: { type: "f", value: 0.0 },
			resolution: { type: "v2", value: new THREE.Vector2( WIDTH, WIDTH ) },
			texturePosition: { type: "t", value: null },
			textureVelocity: { type: "t", value: null },
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderPosition' ).textContent

	} );

	this.positionShader = positionShader;

	var velocityShader = new THREE.ShaderMaterial( {

		uniforms: {
			time: { type: "f", value: 1.0 },
			delta: { type: "f", value: 0.0 },
			resolution: { type: "v2", value: new THREE.Vector2( WIDTH, WIDTH ) },
			texturePosition: { type: "t", value: null },
			textureVelocity: { type: "t", value: null },
			testing: { type: "f", value: 1.0 },
			seperationDistance: { type: "f", value: 1.0 },
			alignmentDistance: { type: "f", value: 1.0 },
			cohesionDistance: { type: "f", value: 1.0 },
			freedomFactor: { type: "f", value: 1.0 },
			predator: { type: "v3", value: new THREE.Vector3() }
		},
		defines: {
			WIDTH: WIDTH.toFixed(2)
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderVelocity' ).textContent

	} );

	this.velocityUniforms = velocityShader.uniforms;

	scene.add( mesh );

	var flipflop = true;
	var rtPosition1, rtPosition2, rtVelocity1, rtVelocity2;

	function init() {
		var dtPosition = generatePositionTexture();
		var dtVelocity = generateVelocityTexture();

		rtPosition1 = getRenderTarget( THREE.RGBAFormat );
		rtPosition2 = rtPosition1.clone();
		rtVelocity1 = getRenderTarget( THREE.RGBFormat );
		rtVelocity2 = rtVelocity1.clone();

		simulator.renderTexture(dtPosition, rtPosition1);
		simulator.renderTexture(rtPosition1, rtPosition2);

		simulator.renderTexture(dtVelocity, rtVelocity1);
		simulator.renderTexture(rtVelocity1, rtVelocity2);

		simulator.velocityUniforms.testing.value = 10;
	}

	this.init = init;

	function getRenderTarget( type ) {
		var renderTarget = new THREE.WebGLRenderTarget(WIDTH, WIDTH, {
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: type,
			type: THREE.FloatType,
			stencilBuffer: false
		});

		return renderTarget;
	}

	// Takes a texture, and render out as another texture
	this.renderTexture = function ( input, output ) {
		mesh.material = passThruShader;
		uniforms.texture.value = input;
		renderer.render( scene, camera, output );
	}


	this.renderPosition = function(position, velocity, output, delta) {
		mesh.material = positionShader;
		positionShader.uniforms.texturePosition.value = position;
		positionShader.uniforms.textureVelocity.value = velocity;
		positionShader.uniforms.time.value = performance.now();
		positionShader.uniforms.delta.value = delta;
		renderer.render( scene, camera, output );
		this.currentPosition = output;
	}

	this.renderVelocity = function(position, velocity, output, delta) {
		mesh.material = velocityShader;
		velocityShader.uniforms.texturePosition.value = position;
		velocityShader.uniforms.textureVelocity.value = velocity;
		velocityShader.uniforms.time.value = performance.now();
		velocityShader.uniforms.delta.value = delta;
		renderer.render( scene, camera, output );
		this.currentVelocity = output;
	}

	this.simulate = function( delta ) {

		if (flipflop) {

			simulator.renderVelocity( rtPosition1, rtVelocity1, rtVelocity2, delta );
			simulator.renderPosition( rtPosition1, rtVelocity2, rtPosition2, delta );

		} else {

			simulator.renderVelocity( rtPosition2, rtVelocity2, rtVelocity1, delta );
			simulator.renderPosition( rtPosition2, rtVelocity1, rtPosition1, delta );

		}

		flipflop = !flipflop;

	}

	function generatePositionTexture() {

		var a = new Float32Array( PARTICLES * 4 );

		for ( var k = 0, kl = a.length; k < kl; k += 4 ) {

			var x = Math.random() * BOUNDS - BOUNDS_HALF;
			var y = Math.random() * BOUNDS - BOUNDS_HALF;
			var z = Math.random() * BOUNDS - BOUNDS_HALF;

			a[ k + 0 ] = x;
			a[ k + 1 ] = y;
			a[ k + 2 ] = z;
			a[ k + 3 ] = 1;

		}

		var texture = new THREE.DataTexture( a, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType );
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		texture.flipY = false;

		return texture;

	}

	function generateVelocityTexture() {

		var a = new Float32Array( PARTICLES * 3 );

		for ( var k = 0, kl = a.length; k < kl; k += 3 ) {

			var x = Math.random() - 0.5;
			var y = Math.random() - 0.5;
			var z = Math.random() - 0.5;

			a[ k + 0 ] = x * 10;
			a[ k + 1 ] = y * 10;
			a[ k + 2 ] = z * 10;

		}

		var texture = new THREE.DataTexture( a, WIDTH, WIDTH, THREE.RGBFormat, THREE.FloatType );
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		texture.flipY = false;

		return texture;

	}

}
