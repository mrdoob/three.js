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

function SimulatorRenderer(WIDTH, renderer) {

	WIDTH = WIDTH || 4;
	var camera = new THREE.Camera();
	camera.position.z = 1;

	// Init RTT stuff
	gl = renderer.getContext();

	if( !gl.getExtension( "OES_texture_float" )) {
		alert( "No OES_texture_float support for float textures!" );
		return;
	}

	if( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
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

	var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), passThruShader );

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

	this.getRenderTarget = function() {
		var renderTarget = new THREE.WebGLRenderTarget(WIDTH, WIDTH, {
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false
		});

		return renderTarget;
	}

	// Takes a texture, and render out as another texture
	this.renderTexture = function( input, output ) {
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
	}

	this.renderVelocity = function(position, velocity, output, delta) {
		mesh.material = velocityShader;
		velocityShader.uniforms.texturePosition.value = position;
		velocityShader.uniforms.textureVelocity.value = velocity;
		velocityShader.uniforms.time.value = performance.now();
		velocityShader.uniforms.delta.value = delta;
		renderer.render( scene, camera, output );
	}

}