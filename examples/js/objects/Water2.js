/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

THREE.Water = function ( width, height, options ) {

	THREE.Mesh.call( this, new THREE.PlaneBufferGeometry( width, height ) );

	this.type = 'Water';

	var scope = this;

	options = options || {};

	var color = ( options.color !== undefined ) !== undefined ? new THREE.Color( options.color ) : new THREE.Color( 0x7F7F7F );
	var textureWidth = options.textureWidth || 512;
	var textureHeight = options.textureHeight || 512;
	var clipBias = options.clipBias || 0;
	var speed = options.speed || 0.03; // water flow speed
	var reflectivity = options.reflectivity || 0.02; // water reflectivity
	var segments = options.segments || 4; // the amount of segments of the water geometry
	var shader = options.shader || THREE.Water.WaterShader;

	var textureLoader = new THREE.TextureLoader();

	var flowMap = options.flowMap || textureLoader.load( 'textures/water/Water_1_M_Flow.jpg' );
	var noiseMap = options.noiseMap || textureLoader.load( 'textures/water/Water_1_M_Noise.jpg' );
	var normalMap0 = options.normalMap0 || textureLoader.load( 'textures/water/Water_1_M_Normal.jpg' );
	var normalMap1 = options.normalMap1 || textureLoader.load( 'textures/water/Water_2_M_Normal.jpg' );

	var cycle = 0.15; // a cycle of a flow map phase
	var halfCycle = cycle * 0.5;
	var textureMatrix = new THREE.Matrix4();
	var clock = new THREE.Clock();

	// internal components

	var mirror = new THREE.Mirror( width, height, {
		color: color,
		textureWidth: textureWidth,
		textureHeight: textureHeight,
		clipBias: clipBias
	} );

	var refractor = new THREE.Refractor( width, height, {
		color: color,
		textureWidth: textureWidth,
		textureHeight: textureHeight,
		clipBias: clipBias
	} );

	mirror.matrixAutoUpdate = false;
	refractor.matrixAutoUpdate = false;

	// material

	this.material = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent: true
	} );

	// maps

	normalMap0.wrapS = normalMap0.wrapT = THREE.RepeatWrapping;
	normalMap1.wrapS = normalMap1.wrapT = THREE.RepeatWrapping;

	this.material.uniforms.tReflectionMap.value = mirror.getRenderTarget().texture;
	this.material.uniforms.tRefractionMap.value = refractor.getRenderTarget().texture;
	this.material.uniforms.tFlowMap.value = flowMap;
	this.material.uniforms.tNoiseMap.value = noiseMap;
	this.material.uniforms.tNormalMap0.value = normalMap0;
	this.material.uniforms.tNormalMap1.value = normalMap1;

	// water

	this.material.uniforms.color.value = color;
	this.material.uniforms.reflectivity.value = reflectivity;
	this.material.uniforms.textureMatrix.value = textureMatrix;

	// inital values

	this.material.uniforms.config.value.x = 0; // flowMapOffset0
	this.material.uniforms.config.value.y = halfCycle; // flowMapOffset1
	this.material.uniforms.config.value.z = halfCycle; // halfCycle
	this.material.uniforms.config.value.w = segments; // segments

	// functions

	function updateTextureMatrix( camera ) {

		textureMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);

		textureMatrix.multiply( camera.projectionMatrix );
		textureMatrix.multiply( camera.matrixWorldInverse );
		textureMatrix.multiply( scope.matrixWorld );

	}

	function updateFlow( delta ) {

		var config = scope.material.uniforms.config;

		config.value.x += speed * delta; // flowMapOffset0
		config.value.y += speed * delta; // flowMapOffset1

		// reset properties if necessary

		if ( config.value.x >= cycle ) {

			config.value.x = 0;

			// avoid 'reset' effect when both offset are set to zero

			if ( config.value.y >= cycle ) {

				config.value.y = halfCycle;

				return;

			}

		}

		if ( config.value.y >= cycle ) {

			config.value.y = 0;

		}

	}

	//

	this.onBeforeRender = function ( renderer, scene, camera ) {

		var delta = clock.getDelta();

		updateTextureMatrix( camera );
		updateFlow( delta );

		scope.visible = false;

		mirror.matrixWorld.copy( scope.matrixWorld );
		refractor.matrixWorld.copy( scope.matrixWorld );

		mirror.onBeforeRender( renderer, scene, camera );
		refractor.onBeforeRender( renderer, scene, camera );

		scope.visible = true;

	};

};

THREE.Water.prototype = Object.create( THREE.Mesh.prototype );
THREE.Water.prototype.constructor = THREE.Water;

THREE.Water.WaterShader = {

	uniforms: {

		'color': {
			type: 'c',
			value: null
		},

		'reflectivity': {
			type: 'f',
			value: 0
		},

		'tReflectionMap': {
			type: 't',
			value: null
		},

		'tRefractionMap': {
			type: 't',
			value: null
		},

		'tFlowMap': {
			type: 't',
			value: null
		},

		'tNoiseMap': {
			type: 't',
			value: null
		},

		'tNormalMap0': {
			type: 't',
			value: null
		},

		'tNormalMap1': {
			type: 't',
			value: null
		},

		'config': {
			type: 'v4',
			value: new THREE.Vector4()
		},

		'textureMatrix': {
			type: 'm4',
			value: null
		}

	},

	vertexShader: [

		'uniform mat4 textureMatrix;',

		'varying vec4 vCoord;',
		'varying vec2 vUv;',
		'varying vec3 vToEye;',

		'void main() {',

		'	vUv = uv;',
		'	vCoord = textureMatrix * vec4( position, 1.0 );',

		' vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
		'	vToEye = cameraPosition - worldPosition.xyz;',

		'	gl_Position = projectionMatrix * viewMatrix * worldPosition;',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform sampler2D tReflectionMap;',
		'uniform sampler2D tRefractionMap;',
		'uniform sampler2D tFlowMap;',
		'uniform sampler2D tNoiseMap;',
		'uniform sampler2D tNormalMap0;',
		'uniform sampler2D tNormalMap1;',

		'uniform vec3 color;',
		'uniform float reflectivity;',

		'uniform vec4 config;',

		'varying vec4 vCoord;',
		'varying vec2 vUv;',
		'varying vec3 vToEye;',

		'void main() {',

		'	float flowMapOffset0 = config.x;',
		'	float flowMapOffset1 = config.y;',
		'	float halfCycle = config.z;',
		'	float segments = config.w;',

		'	vec3 toEye = normalize( vToEye );',

		// sample flow map
		'	vec2 flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;',
		'	flow.r *= -1.0;',

		// sample noise map
		'	float cycleOffset = texture2D( tNoiseMap, vUv ).r;',

		// calculate current phases
		'	float phase0 = cycleOffset * 0.5 + flowMapOffset0;',
		'	float phase1 = cycleOffset * 0.5 + flowMapOffset1;',

		// sample normal maps
		'	vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * segments ) + flow * phase0 );',
		'	vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * segments ) + flow * phase1 );',

		// linear interpolate to get the final normal color
		'	float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;',
		'	vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );',

		// calculate normal vector
		'	vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );',

		// fresnel effect
		'	float theta = max( dot( toEye, normal ), 0.0 );',
		'	float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );',

		// sample textures
		'	vec3 coord = vCoord.xyz / vCoord.w;',
		'	vec2 uv = coord.xy + coord.z * normal.xz * 0.05;',

		'	vec4 reflectColor = texture2D( tReflectionMap, uv );',
		'	vec4 refractColor = texture2D( tRefractionMap, uv );',

		// multiply water color with the mix of both textures. then add lighting
		'	gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );',

		'}'

	].join( '\n' )
};
