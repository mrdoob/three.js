/*
 * GPU Particle System
 * @author flimshaw - Charlie Hoey - http://charliehoey.com
 *
 * A simple to use, general purpose GPU system. Particles are spawn-and-forget with
 * several options available, and do not require monitoring or cleanup after spawning.
 * Because the paths of all particles are completely deterministic once spawned, the scale
 * and direction of time is also variable.
 *
 * Currently uses a static wrapping perlin noise texture for turbulence, and a small png texture for
 * particles, but adding support for a particle texture atlas or changing to a different type of turbulence
 * would be a fairly light day's work.
 *
 * Shader and javascript packing code derrived from several Stack Overflow examples.
 *
 */

THREE.GPUParticleSystem = function( options ) {

	THREE.Object3D.apply( this, arguments );

	options = options || {};

	// parse options and use defaults

	this.PARTICLE_COUNT = options.maxParticles || 1000000;
	this.PARTICLE_CONTAINERS = options.containerCount || 1;

	this.PARTICLE_NOISE_TEXTURE = options.particleNoiseTex || null;
	this.PARTICLE_SPRITE_TEXTURE = options.particleSpriteTex || null;

	this.PARTICLES_PER_CONTAINER = Math.ceil( this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS );
	this.PARTICLE_CURSOR = 0;
	this.time = 0;


	// custom vertex and fragement shader

	var GPUParticleShader = {

		vertexShader: [

			'precision highp float;',

			'#define FLOAT_MAX	1.70141184e38',
			'#define FLOAT_MIN	1.17549435e-38',

			'lowp vec4 encode_float( highp float v ) {',

			'	highp float av = abs( v );',

				// handle special cases

			'	if( av < FLOAT_MIN ) {',

			'		return vec4( 0.0 );',

			'	} else if ( v > FLOAT_MAX ) {',

			'		return vec4( 127.0, 128.0, 0.0, 0.0 ) / 255.0;',

			'	} else if( v < -FLOAT_MAX ) {',

			'		return vec4( 255.0, 128.0, 0.0, 0.0 ) / 255.0;',

			'	}',

			'	highp vec4 c = vec4( 0 );',

			// compute exponent and mantissa

			'	highp float e = floor( log2( av ) );',
			'	highp float m = av * pow( 2.0, - e ) - 1.0;',

			// unpack mantissa

			'	c[ 1 ] = floor( 128.0 * m );',
			'	m -= c[ 1 ] / 128.0;',
			'	c[ 2 ] = floor( 32768.0 * m );',
			'	m -= c[ 2 ] / 32768.0;',
			'	c[ 3 ] = floor( 8388608.0 * m );',

			// unpack exponent

			'	highp float ebias = e + 127.0;',
			'	c[ 0 ] = floor( ebias / 2.0 );',
			'	ebias -= c[ 0 ] * 2.0;',
			'	c[ 1 ] += floor( ebias ) * 128.0;',

			// unpack sign bit

			'	c[ 0 ] += 128.0 * step( 0.0, - v );',

			// scale back to range

			'	return c / 255.0;',

			'}',

			'uniform float uTime;',
			'uniform float uScale;',
			'uniform sampler2D tNoise;',

			'attribute vec4 particlePositionsStartTime;',
			'attribute vec4 particleVelColSizeLife;',

			'varying vec4 vColor;',
			'varying float lifeLeft;',

			'void main() {',

			// unpack things from our attributes'

			'	vColor = encode_float( particleVelColSizeLife.y );',

			// convert our velocity back into a value we can use'

			'	vec4 velTurb = encode_float( particleVelColSizeLife.x );',
			'	vec3 velocity = vec3( velTurb.xyz );',
			'	float turbulence = velTurb.w;',

			'	vec3 newPosition;',

			'	float timeElapsed = uTime - particlePositionsStartTime.a;',

			'	lifeLeft = 1.0 - ( timeElapsed / particleVelColSizeLife.w );',

			'	gl_PointSize = ( uScale * particleVelColSizeLife.z ) * lifeLeft;',

			'	velocity.x = ( velocity.x - 0.5 ) * 3.0;',
			'	velocity.y = ( velocity.y - 0.5 ) * 3.0;',
			'	velocity.z = ( velocity.z - 0.5 ) * 3.0;',

			'	newPosition = particlePositionsStartTime.xyz + ( velocity * 10.0 ) * ( uTime - particlePositionsStartTime.a );',

			'	vec3 noise = texture2D( tNoise, vec2( newPosition.x * 0.015 + ( uTime * 0.05 ), newPosition.y * 0.02 + ( uTime * 0.015 ) ) ).rgb;',
			'	vec3 noiseVel = ( noise.rgb - 0.5 ) * 30.0;',

			'	newPosition = mix( newPosition, newPosition + vec3( noiseVel * ( turbulence * 5.0 ) ), ( timeElapsed / particleVelColSizeLife.a ) );',

			'	if( velocity.y > 0. && velocity.y < .05 ) {',

			'		lifeLeft = 0.0;',

			'	}',

			'	if( velocity.x < - 1.45 ) {',

			'		lifeLeft = 0.0;',

			'	}',

			'	if( timeElapsed > 0.0 ) {',

			'		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );',

			'	} else {',

			'		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'		lifeLeft = 0.0;',
			'		gl_PointSize = 0.;',

			'	}',

			'}'

		].join( '\n' ),

		fragmentShader: [

			'float scaleLinear( float value, vec2 valueDomain ) {',

			'	return ( value - valueDomain.x ) / ( valueDomain.y - valueDomain.x );',

			'}',

			'float scaleLinear( float value, vec2 valueDomain, vec2 valueRange ) {',

			'	return mix( valueRange.x, valueRange.y, scaleLinear( value, valueDomain ) );',

			'}',

			'varying vec4 vColor;',
			'varying float lifeLeft;',

			'uniform sampler2D tSprite;',

			'void main() {',

			'float alpha = 0.;',

			'if( lifeLeft > 0.995 ) {',

			'	alpha = scaleLinear( lifeLeft, vec2( 1.0, 0.995 ), vec2( 0.0, 1.0 ) );',

			'} else {',

			'	alpha = lifeLeft * 0.75;',

			'}',

			'vec4 tex = texture2D( tSprite, gl_PointCoord );',
			'gl_FragColor = vec4( vColor.rgb * tex.a, alpha * tex.a );',

			'}'

		].join( '\n' )

	};

	// preload a million random numbers

	this.rand = [];
	var i;

	for ( i = 1e5; i > 0; i-- ) {

		this.rand.push( Math.random() - 0.5 );

	}

	this.random = function() {

		return ++ i >= this.rand.length ? this.rand[ i = 1 ] : this.rand[ i ];

	};

	var textureLoader = new THREE.TextureLoader();

	this.particleNoiseTex = this.PARTICLE_NOISE_TEXTURE || textureLoader.load( 'textures/perlin-512.png' );
	this.particleNoiseTex.wrapS = this.particleNoiseTex.wrapT = THREE.RepeatWrapping;

	this.particleSpriteTex = this.PARTICLE_SPRITE_TEXTURE || textureLoader.load( 'textures/particle2.png' );
	this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

	this.particleShaderMat = new THREE.ShaderMaterial( {
		transparent: true,
		depthWrite: false,
		uniforms: {
			'uTime': {
				value: 0.0
			},
			'uScale': {
				value: 1.0
			},
			'tNoise': {
				value: this.particleNoiseTex
			},
			'tSprite': {
				value: this.particleSpriteTex
			}
		},
		blending: THREE.AdditiveBlending,
		vertexShader: GPUParticleShader.vertexShader,
		fragmentShader: GPUParticleShader.fragmentShader
	} );

	// define defaults for all values

	this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [ 0, 0, 0, 0 ];
	this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [ 0, 0, 0, 0 ];

	this.particleContainers = [];

	this.init = function() {

		for ( var i = 0; i < this.PARTICLE_CONTAINERS; i ++ ) {

			var c = new THREE.GPUParticleContainer( this.PARTICLES_PER_CONTAINER, this );
			this.particleContainers.push( c );
			this.add( c );

		}

	};

	this.spawnParticle = function( options ) {

		this.PARTICLE_CURSOR ++;

		if ( this.PARTICLE_CURSOR >= this.PARTICLE_COUNT ) {

			this.PARTICLE_CURSOR = 1;

		}

		var currentContainer = this.particleContainers[ Math.floor( this.PARTICLE_CURSOR / this.PARTICLES_PER_CONTAINER ) ];

		currentContainer.spawnParticle( options );

	};

	this.update = function( time ) {

		for ( var i = 0; i < this.PARTICLE_CONTAINERS; i ++ ) {

			this.particleContainers[ i ].update( time );

		}

	};

	this.dispose = function() {

		this.particleShaderMat.dispose();
		this.particleNoiseTex.dispose();
		this.particleSpriteTex.dispose();

		for ( var i = 0; i < this.PARTICLE_CONTAINERS; i ++ ) {

			this.particleContainers[ i ].dispose();

		}

	};

	this.init();

};

THREE.GPUParticleSystem.prototype = Object.create( THREE.Object3D.prototype );
THREE.GPUParticleSystem.prototype.constructor = THREE.GPUParticleSystem;


// Subclass for particle containers, allows for very large arrays to be spread out

THREE.GPUParticleContainer = function( maxParticles, particleSystem ) {

	THREE.Object3D.apply( this, arguments );

	this.PARTICLE_COUNT = maxParticles || 100000;
	this.PARTICLE_CURSOR = 0;
	this.time = 0;
	this.DPR = window.devicePixelRatio;
	this.GPUParticleSystem = particleSystem;

	// construct a couple small arrays used for packing variables into floats etc.

	var UINT8_VIEW = new Uint8Array( 4 );
	var FLOAT_VIEW = new Float32Array( UINT8_VIEW.buffer );

	function decodeFloat( x, y, z, w ) {

		UINT8_VIEW[ 0 ] = Math.floor( w );
		UINT8_VIEW[ 1 ] = Math.floor( z );
		UINT8_VIEW[ 2 ] = Math.floor( y );
		UINT8_VIEW[ 3 ] = Math.floor( x );

		return FLOAT_VIEW[ 0 ];

	}

	function hexToRgb( hex ) {

		var r = hex >> 16;
		var g = ( hex & 0x00FF00 ) >> 8;
		var b = hex & 0x0000FF;

		if ( r > 0 ) r--;
		if ( g > 0 ) g--;
		if ( b > 0 ) b--;

		return [ r, g, b ];

	}

	this.particles = [];
	this.deadParticles = [];
	this.particlesAvailableSlot = [];

	// create a container for particles

	this.particleUpdate = false;

	// shader based particle system

	this.particleShaderGeo = new THREE.BufferGeometry();

	// new hyper compressed attributes

	this.particleVertices = new Float32Array( this.PARTICLE_COUNT * 3 ); // position
	this.particlePositionsStartTime = new Float32Array( this.PARTICLE_COUNT * 4 ); // position
	this.particleVelColSizeLife = new Float32Array( this.PARTICLE_COUNT * 4 );

	var i;

	for ( i = 0; i < this.PARTICLE_COUNT; i ++ ) {

		this.particlePositionsStartTime[ i * 4 + 0 ] = 100; // x
		this.particlePositionsStartTime[ i * 4 + 1 ] = 0; // y
		this.particlePositionsStartTime[ i * 4 + 2 ] = 0.0; // z
		this.particlePositionsStartTime[ i * 4 + 3 ] = 0.0; // startTime

		this.particleVertices[ i * 3 + 0 ] = 0; // x
		this.particleVertices[ i * 3 + 1 ] = 0; // y
		this.particleVertices[ i * 3 + 2 ] = 0.0; // z

		this.particleVelColSizeLife[ i * 4 + 0 ] = decodeFloat( 128, 128, 0, 0 ); // velocity
		this.particleVelColSizeLife[ i * 4 + 1 ] = decodeFloat( 0, 254, 0, 254 ); // color
		this.particleVelColSizeLife[ i * 4 + 2 ] = 1.0; // size
		this.particleVelColSizeLife[ i * 4 + 3 ] = 0.0; // lifespan

	}

	this.particleShaderGeo.addAttribute( 'position', new THREE.BufferAttribute( this.particleVertices, 3 ) );
	this.particleShaderGeo.addAttribute( 'particlePositionsStartTime', new THREE.BufferAttribute( this.particlePositionsStartTime, 4 ).setDynamic( true ) );
	this.particleShaderGeo.addAttribute( 'particleVelColSizeLife', new THREE.BufferAttribute( this.particleVelColSizeLife, 4 ).setDynamic( true ) );

	this.posStart = this.particleShaderGeo.getAttribute( 'particlePositionsStartTime' );
	this.velCol = this.particleShaderGeo.getAttribute( 'particleVelColSizeLife' );

	this.particleShaderMat = this.GPUParticleSystem.particleShaderMat;

	this.init = function() {

		this.particleSystem = new THREE.Points( this.particleShaderGeo, this.particleShaderMat );
		this.particleSystem.frustumCulled = false;
		this.add( this.particleSystem );

	};

	var options = {},
		position = new THREE.Vector3(),
		velocity = new THREE.Vector3(),
		positionRandomness = 0,
		velocityRandomness = 0,
		color = 0xffffff,
		colorRandomness = 0,
		turbulence = 0,
		lifetime = 0,
		size = 0,
		sizeRandomness = 0,
		smoothPosition = false;

	var maxVel = 2;
	var maxSource = 250;
	this.offset = 0;
	this.count = 0;

	this.spawnParticle = function( options ) {

		options = options || {};

		// setup reasonable default values for all arguments

		position = options.position !== undefined ? position.copy( options.position ) : position.set( 0, 0, 0 );
		velocity = options.velocity !== undefined ? velocity.copy( options.velocity ) : velocity.set( 0, 0, 0 );
		positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0;
		velocityRandomness = options.velocityRandomness !== undefined ? options.velocityRandomness : 0;
		color = options.color !== undefined ? options.color : 0xffffff;
		colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 1;
		turbulence = options.turbulence !== undefined ? options.turbulence : 1;
		lifetime = options.lifetime !== undefined ? options.lifetime : 5;
		size = options.size !== undefined ? options.size : 10;
		sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
		smoothPosition = options.smoothPosition !== undefined ? options.smoothPosition : false;

		if ( this.DPR !== undefined ) size *= this.DPR;

		i = this.PARTICLE_CURSOR;

		this.posStart.array[ i * 4 + 0 ] = position.x + ( ( particleSystem.random() ) * positionRandomness ); // - ( velocity.x * particleSystem.random() ); //x
		this.posStart.array[ i * 4 + 1 ] = position.y + ( ( particleSystem.random() ) * positionRandomness ); // - ( velocity.y * particleSystem.random() ); //y
		this.posStart.array[ i * 4 + 2 ] = position.z + ( ( particleSystem.random() ) * positionRandomness ); // - ( velocity.z * particleSystem.random() ); //z
		this.posStart.array[ i * 4 + 3 ] = this.time + ( particleSystem.random() * 2e-2 ); //startTime

		if ( smoothPosition === true ) {

			this.posStart.array[ i * 4 + 0 ] += - ( velocity.x * particleSystem.random() ); //x
			this.posStart.array[ i * 4 + 1 ] += - ( velocity.y * particleSystem.random() ); //y
			this.posStart.array[ i * 4 + 2 ] += - ( velocity.z * particleSystem.random() ); //z

		}

		var velX = velocity.x + ( particleSystem.random() ) * velocityRandomness;
		var velY = velocity.y + ( particleSystem.random() ) * velocityRandomness;
		var velZ = velocity.z + ( particleSystem.random() ) * velocityRandomness;

		// convert turbulence rating to something we can pack into a vec4

		var turbulence = Math.floor( turbulence * 254 );

		// clamp our value to between 0.0 and 1.0

		velX = Math.floor( maxSource * ( ( velX - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ) ) );
		velY = Math.floor( maxSource * ( ( velY - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ) ) );
		velZ = Math.floor( maxSource * ( ( velZ - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ) ) );

		this.velCol.array[ i * 4 + 0 ] = decodeFloat( velX, velY, velZ, turbulence ); // vel

		var rgb = hexToRgb( color );

		for ( var c = 0; c < rgb.length; c ++ ) {

			rgb[ c ] = Math.floor( rgb[ c ] + ( ( particleSystem.random() ) * colorRandomness ) * 254 );
			if ( rgb[ c ] > 254 ) rgb[ c ] = 254;
			if ( rgb[ c ] < 0 ) rgb[ c ] = 0;

		}

		this.velCol.array[ i * 4 + 1 ] = decodeFloat( rgb[ 0 ], rgb[ 1 ], rgb[ 2 ], 254 ); // color
		this.velCol.array[ i * 4 + 2 ] = size + ( particleSystem.random() ) * sizeRandomness; // size
		this.velCol.array[ i * 4 + 3 ] = lifetime; // lifespan

		if ( this.offset === 0 ) {

			this.offset = this.PARTICLE_CURSOR;

		}

		this.count ++;
		this.PARTICLE_CURSOR ++;

		if ( this.PARTICLE_CURSOR >= this.PARTICLE_COUNT ) {

			this.PARTICLE_CURSOR = 0;

		}

		this.particleUpdate = true;

	};

	this.update = function( time ) {

		this.time = time;
		this.particleShaderMat.uniforms.uTime.value = time;

		this.geometryUpdate();

	};

	this.geometryUpdate = function() {

		if ( this.particleUpdate === true ) {

			this.particleUpdate = false;

			// if we can get away with a partial buffer update, do so

			if ( ( this.offset + this.count ) < this.PARTICLE_COUNT ) {

				this.posStart.updateRange.offset = this.velCol.updateRange.offset = this.offset * 4;
				this.posStart.updateRange.count = this.velCol.updateRange.count = this.count * 4;

			} else {

				this.posStart.updateRange.offset = 0;
				this.posStart.updateRange.count = this.velCol.updateRange.count = ( this.PARTICLE_COUNT * 4 );

			}

			this.posStart.needsUpdate = true;
			this.velCol.needsUpdate = true;

			this.offset = 0;
			this.count = 0;

		}

	};

	this.dispose = function() {

		this.particleShaderGeo.dispose();

	};

	this.init();

};

THREE.GPUParticleContainer.prototype = Object.create( THREE.Object3D.prototype );
THREE.GPUParticleContainer.prototype.constructor = THREE.GPUParticleContainer;
