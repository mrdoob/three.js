/**
 * @author Mike Piecuch / https://github.com/mikepiecuch
 *
 * Based on research paper "Real-Time Fluid Dynamics for Games" by Jos Stam
 * http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/GDC03.pdf
 *
 */

import {
	Clock,
	Color,
	DataTexture,
	LinearFilter,
	Math as _Math,
	Mesh,
	NearestFilter,
	NoToneMapping,
	OrthographicCamera,
	PlaneBufferGeometry,
	RGBAFormat,
	Scene,
	ShaderMaterial,
	Vector2,
	WebGLRenderTarget
} from "../../../build/three.module.js";

var Fire = function ( geometry, options ) {

	Mesh.call( this, geometry );

	this.type = 'Fire';

	this.clock = new Clock();

	options = options || {};

	var textureWidth = options.textureWidth || 512;
	var textureHeight = options.textureHeight || 512;
	var oneOverWidth = 1.0 / textureWidth;
	var oneOverHeight = 1.0 / textureHeight;

	var debug = ( options.debug === undefined ) ? false : options.debug;
	this.color1 = options.color1 || new Color( 0xffffff );
	this.color2 = options.color2 || new Color( 0xffa000 );
	this.color3 = options.color3 || new Color( 0x000000 );
	this.colorBias = ( options.colorBias === undefined ) ? 0.8 : options.colorBias;
	this.diffuse = ( options.diffuse === undefined ) ? 1.33 : options.diffuse;
	this.viscosity = ( options.viscosity === undefined ) ? 0.25 : options.viscosity;
	this.expansion = ( options.expansion === undefined ) ? - 0.25 : options.expansion;
	this.swirl = ( options.swirl === undefined ) ? 50.0 : options.swirl;
	this.burnRate = ( options.burnRate === undefined ) ? 0.3 : options.burnRate;
	this.drag = ( options.drag === undefined ) ? 0.35 : options.drag;
	this.airSpeed = ( options.airSpeed === undefined ) ? 6.0 : options.airSpeed;
	this.windVector = options.windVector || new Vector2( 0.0, 0.75 );
	this.speed = ( options.speed === undefined ) ? 500.0 : options.speed;
	this.massConservation = ( options.massConservation === undefined ) ? false : options.massConservation;

	var size = textureWidth * textureHeight;
	this.sourceData = new Uint8Array( 4 * size );

	this.clearSources = function () {

		for ( var y = 0; y < textureHeight; y ++ ) {

			for ( var x = 0; x < textureWidth; x ++ ) {

				var i = y * textureWidth + x;
				var stride = i * 4;

				this.sourceData[ stride ] = 0;
				this.sourceData[ stride + 1 ] = 0;
				this.sourceData[ stride + 2 ] = 0;
				this.sourceData[ stride + 3 ] = 0;

			}

		}

		this.sourceMaterial.uniforms[ "sourceMap" ].value = this.internalSource;
		this.sourceMaterial.needsUpdate = true;

		return this.sourceData;

	};

	this.addSource = function ( u, v, radius, density = null, windX = null, windY = null ) {

		var startX = Math.max( Math.floor( ( u - radius ) * textureWidth ), 0 );
		var startY = Math.max( Math.floor( ( v - radius ) * textureHeight ), 0 );
		var endX = Math.min( Math.floor( ( u + radius ) * textureWidth ), textureWidth );
		var endY = Math.min( Math.floor( ( v + radius ) * textureHeight ), textureHeight );

		for ( var y = startY; y < endY; y ++ ) {

			for ( var x = startX; x < endX; x ++ ) {

				var diffX = x * oneOverWidth - u;
				var diffY = y * oneOverHeight - v;

				if ( diffX * diffX + diffY * diffY < radius * radius ) {

					var i = y * textureWidth + x;
					var stride = i * 4;

					if ( density != null ) {

						this.sourceData[ stride ] = Math.min( Math.max( density, 0.0 ), 1.0 ) * 255;

					}
					if ( windX != null ) {

						var wind = Math.min( Math.max( windX, - 1.0 ), 1.0 );
						wind = ( wind < 0.0 ) ? Math.floor( wind * 127 ) + 255 : Math.floor( wind * 127 );
						this.sourceData[ stride + 1 ] = wind;

					}
					if ( windY != null ) {

						var wind = Math.min( Math.max( windY, - 1.0 ), 1.0 );
						wind = ( wind < 0.0 ) ? Math.floor( wind * 127 ) + 255 : Math.floor( wind * 127 );
						this.sourceData[ stride + 2 ] = wind;

					}

				}

			}

		}

		this.internalSource.needsUpdate = true;

		return this.sourceData;

	};

	// When setting source map, red channel is density. Green and blue channels
	// encode x and y velocity respectively as signed chars:
	// (0 -> 127 = 0.0 -> 1.0, 128 -> 255 = -1.0 -> 0.0 )
	this.setSourceMap = function ( texture ) {

		this.sourceMaterial.uniforms[ "sourceMap" ].value = texture;

	};

	var parameters = {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		depthBuffer: false,
		stencilBuffer: false
	};


	this.field0 = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

	this.field0.background = new Color( 0x000000 );

	this.field1 = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

	this.field0.background = new Color( 0x000000 );

	this.fieldProj = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

	this.field0.background = new Color( 0x000000 );

	if ( ! _Math.isPowerOfTwo( textureWidth ) ||
		 ! _Math.isPowerOfTwo( textureHeight ) ) {

		this.field0.texture.generateMipmaps = false;
		this.field1.texture.generateMipmaps = false;
		this.fieldProj.texture.generateMipmaps = false;

	}


	this.fieldScene = new Scene();
	this.fieldScene.background = new Color( 0x000000 );

	this.orthoCamera = new OrthographicCamera( textureWidth / - 2, textureWidth / 2, textureHeight / 2, textureHeight / - 2, 1, 2 );
	this.orthoCamera.position.z = 1;

	this.fieldGeometry = new PlaneBufferGeometry( textureWidth, textureHeight );

	this.internalSource = new DataTexture( this.sourceData, textureWidth, textureHeight, RGBAFormat );

	// Source Shader

	var shader = Fire.SourceShader;
	this.sourceMaterial = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: false
	} );

	this.clearSources();

	this.sourceMesh = new Mesh( this.fieldGeometry, this.sourceMaterial );
	this.fieldScene.add( this.sourceMesh );

	// Diffuse Shader

	var shader = Fire.DiffuseShader;
	this.diffuseMaterial = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: false
	} );

	this.diffuseMaterial.uniforms[ "oneOverWidth" ].value = oneOverWidth;
	this.diffuseMaterial.uniforms[ "oneOverHeight" ].value = oneOverHeight;

	this.diffuseMesh = new Mesh( this.fieldGeometry, this.diffuseMaterial );
	this.fieldScene.add( this.diffuseMesh );

	// Drift Shader

	shader = Fire.DriftShader;
	this.driftMaterial = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: false
	} );

	this.driftMaterial.uniforms[ "oneOverWidth" ].value = oneOverWidth;
	this.driftMaterial.uniforms[ "oneOverHeight" ].value = oneOverHeight;

	this.driftMesh = new Mesh( this.fieldGeometry, this.driftMaterial );
	this.fieldScene.add( this.driftMesh );

	// Projection Shader 1

	shader = Fire.ProjectionShader1;
	this.projMaterial1 = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: false
	} );

	this.projMaterial1.uniforms[ "oneOverWidth" ].value = oneOverWidth;
	this.projMaterial1.uniforms[ "oneOverHeight" ].value = oneOverHeight;

	this.projMesh1 = new Mesh( this.fieldGeometry, this.projMaterial1 );
	this.fieldScene.add( this.projMesh1 );

	// Projection Shader 2

	shader = Fire.ProjectionShader2;
	this.projMaterial2 = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: false
	} );


	this.projMaterial2.uniforms[ "oneOverWidth" ].value = oneOverWidth;
	this.projMaterial2.uniforms[ "oneOverHeight" ].value = oneOverHeight;

	this.projMesh2 = new Mesh( this.fieldGeometry, this.projMaterial2 );
	this.fieldScene.add( this.projMesh2 );

	// Projection Shader 3

	shader = Fire.ProjectionShader3;
	this.projMaterial3 = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: false
	} );


	this.projMaterial3.uniforms[ "oneOverWidth" ].value = oneOverWidth;
	this.projMaterial3.uniforms[ "oneOverHeight" ].value = oneOverHeight;

	this.projMesh3 = new Mesh( this.fieldGeometry, this.projMaterial3 );
	this.fieldScene.add( this.projMesh3 );

	// Color Shader

	if ( debug ) {

		shader = Fire.DebugShader;

	} else {

		shader = Fire.ColorShader;

	}
	this.material = new ShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: true
	} );

	this.material.uniforms[ "densityMap" ].value = this.field1.texture;

	this.configShaders = function ( dt ) {

		this.diffuseMaterial.uniforms[ "diffuse" ].value = dt * 0.05 * this.diffuse;
		this.diffuseMaterial.uniforms[ "viscosity" ].value = dt * 0.05 * this.viscosity;
		this.diffuseMaterial.uniforms[ "expansion" ].value = Math.exp( this.expansion * - 1.0 );
		this.diffuseMaterial.uniforms[ "swirl" ].value = Math.exp( this.swirl * - 0.1 );
		this.diffuseMaterial.uniforms[ "drag" ].value = Math.exp( this.drag * - 0.1 );
		this.diffuseMaterial.uniforms[ "burnRate" ].value = this.burnRate * dt * 0.01;
		this.driftMaterial.uniforms[ "windVector" ].value = this.windVector;
		this.driftMaterial.uniforms[ "airSpeed" ].value = dt * this.airSpeed * 0.001 * textureHeight;
		this.material.uniforms[ "color1" ].value = this.color1;
		this.material.uniforms[ "color2" ].value = this.color2;
		this.material.uniforms[ "color3" ].value = this.color3;
		this.material.uniforms[ "colorBias" ].value = this.colorBias;

	};

	this.clearDiffuse = function () {

		this.diffuseMaterial.uniforms[ "expansion" ].value = 1.0;
		this.diffuseMaterial.uniforms[ "swirl" ].value = 1.0;
		this.diffuseMaterial.uniforms[ "drag" ].value = 1.0;
		this.diffuseMaterial.uniforms[ "burnRate" ].value = 0.0;

	};

	this.swapTextures = function () {

		var swap = this.field0;
		this.field0 = this.field1;
		this.field1 = swap;

	};

	this.saveRenderState = function ( renderer ) {

		this.savedRenderTarget = renderer.getRenderTarget();
		this.savedXrEnabled = renderer.xr.enabled;
		this.savedShadowAutoUpdate = renderer.shadowMap.autoUpdate;
		this.savedAntialias = renderer.antialias;
		this.savedToneMapping = renderer.toneMapping;

	};

	this.restoreRenderState = function ( renderer ) {

		renderer.xr.enabled = this.savedXrEnabled;
		renderer.shadowMap.autoUpdate = this.savedShadowAutoUpdate;
		renderer.setRenderTarget( this.savedRenderTarget );
		renderer.antialias = this.savedAntialias;
		renderer.toneMapping = this.savedToneMapping;

	};

	this.renderSource = function ( renderer ) {

		this.sourceMesh.visible = true;

		this.sourceMaterial.uniforms[ "densityMap" ].value = this.field0.texture;

		renderer.setRenderTarget( this.field1 );
		renderer.render( this.fieldScene, this.orthoCamera );

		this.sourceMesh.visible = false;

		this.swapTextures();

	};

	this.renderDiffuse = function ( renderer ) {

		this.diffuseMesh.visible = true;

		this.diffuseMaterial.uniforms[ "densityMap" ].value = this.field0.texture;

		renderer.setRenderTarget( this.field1 );
		renderer.render( this.fieldScene, this.orthoCamera );

		this.diffuseMesh.visible = false;

		this.swapTextures();

	};

	this.renderDrift = function ( renderer ) {

		this.driftMesh.visible = true;

		this.driftMaterial.uniforms[ "densityMap" ].value = this.field0.texture;

		renderer.setRenderTarget( this.field1 );
		renderer.render( this.fieldScene, this.orthoCamera );

		this.driftMesh.visible = false;

		this.swapTextures();

	};

	this.renderProject = function ( renderer ) {

		// Projection pass 1

		this.projMesh1.visible = true;

		this.projMaterial1.uniforms[ "densityMap" ].value = this.field0.texture;

		renderer.setRenderTarget( this.fieldProj );
		renderer.render( this.fieldScene, this.orthoCamera );

		this.projMesh1.visible = false;

		this.projMaterial2.uniforms[ "densityMap" ].value = this.fieldProj.texture;

		// Projection pass 2

		this.projMesh2.visible = true;

		for ( var i = 0; i < 20; i ++ ) {

			renderer.setRenderTarget( this.field1 );
			renderer.render( this.fieldScene, this.orthoCamera );

			var temp = this.field1;
			this.field1 = this.fieldProj;
			this.fieldProj = temp;

			this.projMaterial2.uniforms[ "densityMap" ].value = this.fieldProj.texture;

		}

		this.projMesh2.visible = false;

		this.projMaterial3.uniforms[ "densityMap" ].value = this.field0.texture;
		this.projMaterial3.uniforms[ "projMap" ].value = this.fieldProj.texture;

		// Projection pass 3

		this.projMesh3.visible = true;

		renderer.setRenderTarget( this.field1 );
		renderer.render( this.fieldScene, this.orthoCamera );

		this.projMesh3.visible = false;

		this.swapTextures();

	};

	this.onBeforeRender = function ( renderer ) {

		var delta = this.clock.getDelta();
		if ( delta > 0.1 ) {

			delta = 0.1;

		}
		var dt = delta * ( this.speed * 0.1 );

		this.configShaders( dt );

		this.saveRenderState( renderer );

		renderer.xr.enabled = false; // Avoid camera modification and recursion
		renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
		renderer.antialias = false;
		renderer.toneMapping = NoToneMapping;

		this.sourceMesh.visible = false;
		this.diffuseMesh.visible = false;
		this.driftMesh.visible = false;
		this.projMesh1.visible = false;
		this.projMesh2.visible = false;
		this.projMesh3.visible = false;

		this.renderSource( renderer );

		this.clearDiffuse();
		for ( var i = 0; i < 21; i ++ ) {

			this.renderDiffuse( renderer );

		}
		this.configShaders( dt );
		this.renderDiffuse( renderer );

		this.renderDrift( renderer );

		if ( this.massConservation ) {

			this.renderProject( renderer );
			this.renderProject( renderer );

		}

		// Final result out for coloring

		this.material.map = this.field1.texture;
		this.material.transparent = true;
		this.material.minFilter = LinearFilter,
		this.material.magFilter = LinearFilter,

		this.restoreRenderState( renderer );

	};

};


Fire.prototype = Object.create( Mesh.prototype );
Fire.prototype.constructor = Fire;

Fire.SourceShader = {

	uniforms: {
		'sourceMap': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform sampler2D sourceMap;',
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    vec4 source = texture2D( sourceMap, vUv );',
		'    vec4 current = texture2D( densityMap, vUv );',

		'    vec2 v0 = (current.gb - step(0.5, current.gb)) * 2.0;',
		'    vec2 v1 = (source.gb - step(0.5, source.gb)) * 2.0;',

		'    vec2 newVel = v0 + v1;',

		'    newVel = clamp(newVel, -0.99, 0.99);',
		'    newVel = newVel * 0.5 + step(0.0, -newVel);',

		'    float newDensity = source.r + current.a;',
		'    float newTemp = source.r + current.r;',

		'    newDensity = clamp(newDensity, 0.0, 1.0);',
		'    newTemp = clamp(newTemp, 0.0, 1.0);',

		'    gl_FragColor = vec4(newTemp, newVel.xy, newDensity);',

		'}'

	].join( "\n" )
};


Fire.DiffuseShader = {

	uniforms: {
		'oneOverWidth': {
			value: null
		},
		'oneOverHeight': {
			value: null
		},
		'diffuse': {
			value: null
		},
		'viscosity': {
			value: null
		},
		'expansion': {
			value: null
		},
		'swirl': {
			value: null
		},
		'drag': {
			value: null
		},
		'burnRate': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform float oneOverWidth;',
		'uniform float oneOverHeight;',
		'uniform float diffuse;',
		'uniform float viscosity;',
		'uniform float expansion;',
		'uniform float swirl;',
		'uniform float burnRate;',
		'uniform float drag;',
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',

		'    vec4 dC = texture2D( densityMap, vUv );',
		'    vec4 dL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y) );',
		'    vec4 dR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y) );',
		'    vec4 dU = texture2D( densityMap, vec2(vUv.x, vUv.y - oneOverHeight) );',
		'    vec4 dD = texture2D( densityMap, vec2(vUv.x, vUv.y + oneOverHeight) );',
		'    vec4 dUL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y - oneOverHeight) );',
		'    vec4 dUR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y - oneOverHeight) );',
		'    vec4 dDL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y + oneOverHeight) );',
		'    vec4 dDR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y + oneOverHeight) );',

		'    dC.yz = (dC.yz - step(0.5, dC.yz)) * 2.0;',
		'    dL.yz = (dL.yz - step(0.5, dL.yz)) * 2.0;',
		'    dR.yz = (dR.yz - step(0.5, dR.yz)) * 2.0;',
		'    dU.yz = (dU.yz - step(0.5, dU.yz)) * 2.0;',
		'    dD.yz = (dD.yz - step(0.5, dD.yz)) * 2.0;',
		'    dUL.yz = (dUL.yz - step(0.5, dUL.yz)) * 2.0;',
		'    dUR.yz = (dUR.yz - step(0.5, dUR.yz)) * 2.0;',
		'    dDL.yz = (dDL.yz - step(0.5, dDL.yz)) * 2.0;',
		'    dDR.yz = (dDR.yz - step(0.5, dDR.yz)) * 2.0;',

		'    vec4 result = (dC + vec4(diffuse, viscosity, viscosity, diffuse) * ( dL + dR + dU + dD + dUL + dUR + dDL + dDR )) / (1.0 + 8.0 * vec4(diffuse, viscosity, viscosity, diffuse)) - vec4(0.0, 0.0, 0.0, 0.001);',

		'    float temperature = result.r;',
		'    temperature = clamp(temperature - burnRate, 0.0, 1.0);',

		'    vec2 velocity = result.yz;',

		'    vec2 expansionVec = vec2(dL.w - dR.w, dU.w - dD.w);',

		'    vec2 swirlVec = vec2((dL.z - dR.z) * 0.5, (dU.y - dD.y) * 0.5);',

		'    velocity = velocity + (1.0 - expansion) * expansionVec + (1.0 - swirl) * swirlVec;',

		'    velocity = velocity - (1.0 - drag) * velocity;',

		'    gl_FragColor = vec4(temperature, velocity * 0.5 + step(0.0, -velocity), result.w);',

		'    gl_FragColor = gl_FragColor * step(oneOverWidth, vUv.x);',
		'    gl_FragColor = gl_FragColor * step(oneOverHeight, vUv.y);',
		'    gl_FragColor = gl_FragColor * step(vUv.x, 1.0 - oneOverWidth);',
		'    gl_FragColor = gl_FragColor * step(vUv.y, 1.0 - oneOverHeight);',

		'}'

	].join( "\n" )
};

Fire.DriftShader = {

	uniforms: {
		'oneOverWidth': {
			value: null
		},
		'oneOverHeight': {
			value: null
		},
		'windVector': {
			value: new Vector2( 0.0, 0.0 )
		},
		'airSpeed': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform float oneOverWidth;',
		'uniform float oneOverHeight;',
		'uniform vec2 windVector;',
		'uniform float airSpeed;',
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    vec2 velocity = texture2D( densityMap, vUv ).gb;',
		'    velocity = (velocity - step(0.5, velocity)) * 2.0;',

		'    velocity = velocity + windVector;',

		'    vec2 sourcePos = vUv - airSpeed * vec2(oneOverWidth, oneOverHeight) * velocity;',

		'    vec2 units = sourcePos / vec2(oneOverWidth, oneOverHeight);',

		'    vec2 intPos = floor(units);',
		'    vec2 frac = units - intPos;',
		'    intPos = intPos * vec2(oneOverWidth, oneOverHeight);',

		'    vec4 dX0Y0 = texture2D( densityMap, intPos + vec2(0.0, -oneOverHeight) );',
		'    vec4 dX1Y0 = texture2D( densityMap, intPos + vec2(oneOverWidth, 0.0) );',
		'    vec4 dX0Y1 = texture2D( densityMap, intPos + vec2(0.0, oneOverHeight) );',
		'    vec4 dX1Y1 = texture2D( densityMap, intPos + vec2(oneOverWidth, oneOverHeight) );',


		'    dX0Y0.gb = (dX0Y0.gb - step(0.5, dX0Y0.gb)) * 2.0;',
		'    dX1Y0.gb = (dX1Y0.gb - step(0.5, dX1Y0.gb)) * 2.0;',
		'    dX0Y1.gb = (dX0Y1.gb - step(0.5, dX0Y1.gb)) * 2.0;',
		'    dX1Y1.gb = (dX1Y1.gb - step(0.5, dX1Y1.gb)) * 2.0;',

		'    vec4 source = mix(mix(dX0Y0, dX1Y0, frac.x), mix(dX0Y1, dX1Y1, frac.x), frac.y);',

		'    source.gb = source.gb * 0.5 + step(0.0, -source.gb);',

		'    gl_FragColor = source;',

		'}'

	].join( "\n" )
};


Fire.ProjectionShader1 = {

	uniforms: {
		'oneOverWidth': {
			value: null
		},
		'oneOverHeight': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform float oneOverWidth;',
		'uniform float oneOverHeight;',
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    float dL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y) ).g;',
		'    float dR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y) ).g;',
		'    float dU = texture2D( densityMap, vec2(vUv.x, vUv.y - oneOverHeight) ).b;',
		'    float dD = texture2D( densityMap, vec2(vUv.x, vUv.y + oneOverHeight) ).b;',

		'    dL = (dL - step(0.5, dL)) * 2.0;',
		'    dR = (dR - step(0.5, dR)) * 2.0;',
		'    dU = (dU - step(0.5, dU)) * 2.0;',
		'    dD = (dD - step(0.5, dD)) * 2.0;',

		'    float h = (oneOverWidth + oneOverHeight) * 0.5;',
		'    float div = -0.5 * h * (dR - dL + dD - dU);',

		'    gl_FragColor = vec4( 0.0, 0.0, div * 0.5 + step(0.0, -div), 0.0);',

		'}'

	].join( "\n" )
};


Fire.ProjectionShader2 = {

	uniforms: {
		'oneOverWidth': {
			value: null
		},
		'oneOverHeight': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform float oneOverWidth;',
		'uniform float oneOverHeight;',
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    float div = texture2D( densityMap, vUv ).b;',
		'    float pL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y) ).g;',
		'    float pR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y) ).g;',
		'    float pU = texture2D( densityMap, vec2(vUv.x, vUv.y - oneOverHeight) ).g;',
		'    float pD = texture2D( densityMap, vec2(vUv.x, vUv.y + oneOverHeight) ).g;',

		'    float divNorm = (div - step(0.5, div)) * 2.0;',
		'    pL = (pL - step(0.5, pL)) * 2.0;',
		'    pR = (pR - step(0.5, pR)) * 2.0;',
		'    pU = (pU - step(0.5, pU)) * 2.0;',
		'    pD = (pD - step(0.5, pD)) * 2.0;',

		'    float p = (divNorm + pR + pL + pD + pU) * 0.25;',

		'    gl_FragColor = vec4( 0.0, p * 0.5 + step(0.0, -p), div, 0.0);',

		'}'

	].join( "\n" )
};


Fire.ProjectionShader3 = {

	uniforms: {
		'oneOverWidth': {
			value: null
		},
		'oneOverHeight': {
			value: null
		},
		'densityMap': {
			value: null
		},
		'projMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform float oneOverWidth;',
		'uniform float oneOverHeight;',
		'uniform sampler2D densityMap;',
		'uniform sampler2D projMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    vec4 orig = texture2D(densityMap, vUv);',

		'    float pL = texture2D( projMap, vec2(vUv.x - oneOverWidth, vUv.y) ).g;',
		'    float pR = texture2D( projMap, vec2(vUv.x + oneOverWidth, vUv.y) ).g;',
		'    float pU = texture2D( projMap, vec2(vUv.x, vUv.y - oneOverHeight) ).g;',
		'    float pD = texture2D( projMap, vec2(vUv.x, vUv.y + oneOverHeight) ).g;',

		'    float uNorm = (orig.g - step(0.5, orig.g)) * 2.0;',
		'    float vNorm = (orig.b - step(0.5, orig.b)) * 2.0;',

		'    pL = (pL - step(0.5, pL)) * 2.0;',
		'    pR = (pR - step(0.5, pR)) * 2.0;',
		'    pU = (pU - step(0.5, pU)) * 2.0;',
		'    pD = (pD - step(0.5, pD)) * 2.0;',

		'    float h = (oneOverWidth + oneOverHeight) * 0.5;',
		'    float u = uNorm - (0.5 * (pR - pL) / h);',
		'    float v = vNorm - (0.5 * (pD - pU) / h);',

		'    gl_FragColor = vec4( orig.r, u * 0.5 + step(0.0, -u), v * 0.5 + step(0.0, -v), orig.a);',

		'}'

	].join( "\n" )
};

Fire.ColorShader = {

	uniforms: {
		'color1': {
			value: null
		},
		'color2': {
			value: null
		},
		'color3': {
			value: null
		},
		'colorBias': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform vec3 color1;',
		'uniform vec3 color2;',
		'uniform vec3 color3;',
		'uniform float colorBias;',
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    float density = texture2D( densityMap, vUv ).a;',
		'    float temperature = texture2D( densityMap, vUv ).r;',

		'    float bias = clamp(colorBias, 0.0001, 0.9999);',

		'    vec3 blend1 = mix(color3, color2, temperature / bias) * (1.0 - step(bias, temperature));',
		'    vec3 blend2 = mix(color2, color1, (temperature - bias) / (1.0 - bias) ) * step(bias, temperature);',

		'    gl_FragColor = vec4(blend1 + blend2, density);',
		'}'

	].join( "\n" )
};


Fire.DebugShader = {

	uniforms: {
		'color1': {
			value: null
		},
		'color2': {
			value: null
		},
		'color3': {
			value: null
		},
		'colorBias': {
			value: null
		},
		'densityMap': {
			value: null
		}
	},

	vertexShader: [
		'varying vec2 vUv;',

		'void main() {',

		' 	  vUv = uv;',

		'     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'     gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( "\n" ),

	fragmentShader: [
		'uniform sampler2D densityMap;',

		'varying vec2 vUv;',

		'void main() {',
		'    float density;',
		'    density = texture2D( densityMap, vUv ).a;',

		'    vec2 vel = texture2D( densityMap, vUv ).gb;',

		'    vel = (vel - step(0.5, vel)) * 2.0;',

		'    float r = density;',
		'    float g = max(abs(vel.x), density * 0.5);',
		'    float b = max(abs(vel.y), density * 0.5);',
		'    float a = max(density * 0.5, max(abs(vel.x), abs(vel.y)));',

		'    gl_FragColor = vec4(r, g, b, a);',

		'}'

	].join( "\n" )
};

export { Fire };
