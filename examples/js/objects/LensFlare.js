/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LensFlare = function () {

	THREE.Mesh.call( this );

	this.type = 'LensFlare';

	this.renderOrder = Infinity; // see #12883
	this.frustumCulled = false;

	//

	var flareVisible = false;
	var positionScreen = new THREE.Vector3();

	// textures

	var tempMap = new THREE.DataTexture( new Uint8Array( 16 * 16 * 3 ), 16, 16, THREE.RGBFormat );
	tempMap.minFilter = THREE.NearestFilter;
	tempMap.magFilter = THREE.NearestFilter;
	tempMap.needsUpdate = true;

	var occlusionMap = new THREE.DataTexture( new Uint8Array( 16 * 16 * 3 ), 16, 16, THREE.RGBFormat );
	occlusionMap.minFilter = THREE.NearestFilter;
	occlusionMap.magFilter = THREE.NearestFilter;
	occlusionMap.needsUpdate = true;

	// material

	var shader = THREE.LensFlare.Shader;

	var material = new THREE.RawShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		depthWrite: false,
		transparent: false
	} );

	// the following object is used for occlusionMap generation

	var occluder = new THREE.Mesh( THREE.LensFlare.Geometry, material );
	occluder.frustumCulled = false;

	//

	var scale = new THREE.Vector2();
	var screenPositionPixels = new THREE.Vector2();
	var validArea = new THREE.Box2();
	var viewport = new THREE.Vector4();

	this.onBeforeRender = function ( renderer, scene, camera ) {

		viewport.copy( renderer.getCurrentViewport() );

		var invAspect = viewport.w / viewport.z;
		var halfViewportWidth = viewport.z / 2.0;
		var halfViewportHeight = viewport.w / 2.0;

		var size = 16 / viewport.w;
		scale.set( size * invAspect, size );

		validArea.min.set( viewport.x, viewport.y );
		validArea.max.set( viewport.x + ( viewport.z - 16 ), viewport.y + ( viewport.w - 16 ) );

		// calculate position in screen space

		positionScreen.setFromMatrixPosition( this.matrixWorld );

		positionScreen.applyMatrix4( camera.matrixWorldInverse );
		positionScreen.applyMatrix4( camera.projectionMatrix );

		// horizontal and vertical coordinate of the lower left corner of the pixels to copy

		screenPositionPixels.x = viewport.x + ( positionScreen.x * halfViewportWidth ) + halfViewportWidth - 8;
		screenPositionPixels.y = viewport.y + ( positionScreen.y * halfViewportHeight ) + halfViewportHeight - 8;

		// screen cull

		flareVisible = validArea.containsPoint( screenPositionPixels );

		if ( flareVisible ) {

			var currentAutoClear = renderer.autoClear;

			renderer.autoClear = false;


			// save current RGB to temp texture

			renderer.copyFramebufferToTexture( screenPositionPixels, tempMap );

			// render pink quad

			occluder.material.uniforms.renderType.value = 0;
			occluder.material.uniforms.scale.value = scale;
			occluder.material.uniforms.screenPosition.value = positionScreen;
			occluder.material.depthTest = true;

			renderer.render( occluder, camera );

			// copy result to occlusionMap

			renderer.copyFramebufferToTexture( screenPositionPixels, occlusionMap );

			// restore graphics

			occluder.material.uniforms.renderType.value = 1;
			occluder.material.uniforms.map.value = tempMap;
			occluder.material.depthTest = false;

			renderer.render( occluder, camera );

			//

			renderer.autoClear = currentAutoClear;

		}

		// update object positions

		var children = this.children;

		var vecX = - positionScreen.x * 2;
		var vecY = - positionScreen.y * 2;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			var flare = children[ i ];

			var flarePosition = flare.material.uniforms.screenPosition.value;
			flarePosition.x = positionScreen.x + vecX * flare.flareDistance;
			flarePosition.y = positionScreen.y + vecY * flare.flareDistance;

			//

			var size = flare.flareSize / viewport.w;
			var invAspect = viewport.w / viewport.z;

			flare.material.uniforms.occlusionMap.value = occlusionMap;
			flare.material.uniforms.scale.value.set( size * invAspect, size );

			flare.material.uniforms.opacity.value = flareVisible ? 1 : 0;

		}

	};

	this.dispose = function () {

		occluder.material.dispose();

		tempMap.dispose();
		occlusionMap.dispose();

	};

};

THREE.LensFlare.prototype = Object.create( THREE.Mesh.prototype );
THREE.LensFlare.prototype.constructor = THREE.LensFlare;
THREE.LensFlare.prototype.isLensFlare = true;

THREE.LensFlare.Shader = {

	uniforms: {

		'renderType': { value: 0 },
		'map': { value: null },
		'scale': { value: null },
		'screenPosition': { value: null }

	},

	vertexShader: [

		'precision highp float;',

		'uniform vec3 screenPosition;',
		'uniform vec2 scale;',

		'attribute vec3 position;',
		'attribute vec2 uv;',

		'varying vec2 vUV;',

		'void main() {',

		'	vUV = uv;',

		'	vec2 pos = position.xy;',

		'	gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'precision highp float;',

		'uniform lowp int renderType;',
		'uniform sampler2D map;',

		'varying vec2 vUV;',

		'void main() {',

		// pink square

		'	if ( renderType == 0 ) {',

		'		gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );',

		// restore

		'	} else {',

		'		gl_FragColor = texture2D( map, vUV );',

		'	}',

		'}'

	].join( '\n' )

};

//

THREE.LensFlareElement = function ( texture, size, distance, color, blending ) {

	THREE.Mesh.call( this );

	this.type = 'LensFlareElement';
	this.frustumCulled = false;

	this.flareSize = size || 1;
	this.flareDistance = distance || 0;

	this.geometry = THREE.LensFlare.Geometry;

	var shader = THREE.LensFlareElement.Shader;

	this.material = new THREE.RawShaderMaterial( {
		// uniforms: Object.assign( {}, shader.uniforms ),
		uniforms: {
			'map': { value: texture },
			'occlusionMap': { value: null },
			'opacity': { value: 1 },
			'color': { value: color || new THREE.Color( 0xffffff ) },
			'scale': { value: new THREE.Vector2() },
			'screenPosition': { value: new THREE.Vector3() }
		},
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		blending: blending || THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false
	} );

	this.dispose = function () {

		this.material.dispose();

	};

};

THREE.LensFlareElement.prototype = Object.create( THREE.Mesh.prototype );
THREE.LensFlareElement.prototype.constructor = THREE.LensFlareElement;
THREE.LensFlareElement.prototype.isLensFlareElement = true;

THREE.LensFlareElement.Shader = {

	uniforms: {

		'map': { value: null },
		'occlusionMap': { value: null },
		'opacity': { value: 1 },
		'color': { value: null },
		'scale': { value: null },
		'screenPosition': { value: null }

	},

	vertexShader: [

		'precision highp float;',

		'uniform vec3 screenPosition;',
		'uniform vec2 scale;',

		'uniform sampler2D occlusionMap;',

		'attribute vec3 position;',
		'attribute vec2 uv;',

		'varying vec2 vUV;',
		'varying float vVisibility;',

		'void main() {',

		'	vUV = uv;',

		'	vec2 pos = position.xy;',

		'	vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );',

		'	vVisibility =        visibility.r / 9.0;',
		'	vVisibility *= 1.0 - visibility.g / 9.0;',
		'	vVisibility *=       visibility.b / 9.0;',

		'	gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'precision highp float;',

		'uniform sampler2D map;',
		'uniform float opacity;',
		'uniform vec3 color;',

		'varying vec2 vUV;',
		'varying float vVisibility;',

		'void main() {',

		'	vec4 texture = texture2D( map, vUV );',
		'	texture.a *= opacity * vVisibility;',
		'	gl_FragColor = texture;',
		'	gl_FragColor.rgb *= color;',

		'}'

	].join( '\n' )

};

THREE.LensFlare.Geometry = ( function () {

	var geometry = new THREE.BufferGeometry();

	var float32Array = new Float32Array( [
		- 1, - 1, 0, 0, 0,
		1, - 1, 0, 1, 0,
		1, 1, 0, 1, 1,
		- 1, 1, 0, 0, 1
	] );

	var interleavedBuffer = new THREE.InterleavedBuffer( float32Array, 5 );

	geometry.setIndex( [ 0, 1, 2,	0, 2, 3 ] );
	geometry.addAttribute( 'position', new THREE.InterleavedBufferAttribute( interleavedBuffer, 3, 0, false ) );
	geometry.addAttribute( 'uv', new THREE.InterleavedBufferAttribute( interleavedBuffer, 2, 3, false ) );

	return geometry;

} )();
