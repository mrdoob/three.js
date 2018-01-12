/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

THREE.LensFlareGroup = function () {

	THREE.Group.call( this );

	this.type = 'LensFlareGroup';

	this.positionScreen = new THREE.Vector3();
	this.customUpdateCallback = undefined;
	this.flareVisible = false;

	// textures

	var tempMap = new THREE.CanvasTexture( document.createElement( 'canvas' ) );
	tempMap.image.width = tempMap.image.height = 16;
	tempMap.format = THREE.RGBFormat;
	tempMap.minFilter = tempMap.magFilter = THREE.NearestFilter;
	tempMap.needsUpdate = true;

	var occlusionMap = new THREE.CanvasTexture( document.createElement( 'canvas' ) );
	occlusionMap.image.width = occlusionMap.image.height = 16;
	occlusionMap.format = THREE.RGBAFormat;
	occlusionMap.minFilter = occlusionMap.magFilter = THREE.NearestFilter;
	occlusionMap.needsUpdate = true;

	// material

	var shader = THREE.LensFlareGroup.Shader;

	var material = new THREE.RawShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		depthWrite: false
	} );

	// the following object is used for occlusionMap generation

	var occluder = new THREE.Mesh( THREE.LensFlare.Geometry, material );
	occluder.frustumCulled = false;

	//

	var scale = new THREE.Vector2();
	var screenPositionPixels = new THREE.Vector2();
	var validArea = new THREE.Box2();
	var currentFrame = 0;

	this.update = function ( renderer, camera, viewport ) {

		var frame = renderer.info.render.frame;

		if ( currentFrame === frame ) return;

		currentFrame = frame;

		var invAspect = viewport.w / viewport.z;
		var halfViewportWidth = viewport.z * 0.5;
		var halfViewportHeight = viewport.w * 0.5;

		var size = 16 / viewport.w;
		scale.set( size * invAspect, size );

		validArea.min.set( viewport.x, viewport.y );
		validArea.max.set( viewport.x + ( viewport.z - 16 ), viewport.y + ( viewport.w - 16 ) );

		// calculate position in screen space

		this.positionScreen.setFromMatrixPosition( this.matrixWorld );

		this.positionScreen.applyMatrix4( camera.matrixWorldInverse );
		this.positionScreen.applyMatrix4( camera.projectionMatrix );

		// horizontal and vertical coordinate of the lower left corner of the pixels to copy

		screenPositionPixels.x = viewport.x + ( this.positionScreen.x * halfViewportWidth ) + halfViewportWidth - 8;
		screenPositionPixels.y = viewport.y + ( this.positionScreen.y * halfViewportHeight ) + halfViewportHeight - 8;

		// screen cull

		if ( validArea.containsPoint( screenPositionPixels ) === true ) {

			this.flareVisible = true;

			// save current RGB to temp texture

			renderer.copyFramebufferToTexture( screenPositionPixels.x, screenPositionPixels.y, tempMap );

			// render pink quad

			occluder.material.uniforms.renderType.value = 0;
			occluder.material.uniforms.scale.value = scale;
			occluder.material.uniforms.screenPosition.value = this.positionScreen;
			occluder.material.depthTest = true;

			renderer.render( occluder, camera );

			// copy result to occlusionMap

			renderer.copyFramebufferToTexture( screenPositionPixels.x, screenPositionPixels.y, occlusionMap );

			// restore graphics

			occluder.material.uniforms.renderType.value = 1;
			occluder.material.uniforms.map.value = tempMap;
			occluder.material.depthTest = false;

			renderer.render( occluder, camera );

			// update object positions

			if ( this.customUpdateCallback ) {

				this.customUpdateCallback( this );

			} else {

				this.updateLensFlares();

			}

		} else {

			this.flareVisible = false;

		}

	};

	this.updateLensFlares = function () {

		var vecX = - this.positionScreen.x * 2;
		var vecY = - this.positionScreen.y * 2;

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var flare = this.children[ i ];

			flare.flarePosition.x = this.positionScreen.x + vecX * flare.flareDistance;
			flare.flarePosition.y = this.positionScreen.y + vecY * flare.flareDistance;

			flare.flareRotation += 0.25;

		}

	};

	this.getOcclusionMap = function () {

		return occlusionMap;

	};

	this.dispose = function () {

		occluder.material.dispose();

		tempMap.dispose();
		occlusionMap.dispose();

	};

};

THREE.LensFlareGroup.prototype = Object.create( THREE.Group.prototype );
THREE.LensFlareGroup.prototype.constructor = THREE.LensFlareGroup;
THREE.LensFlareGroup.prototype.isLensFlareGroup = true;

THREE.LensFlareGroup.Shader = {

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

		'		gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );',

		// restore

		'	} else {',

		'		gl_FragColor = texture2D( map, vUV );',

		'	}',

		'}'

	].join( '\n' )

};

//

THREE.LensFlare = function ( texture, size, distance, blending, color, opacity ) {

	THREE.Mesh.call( this );

	this.type = 'LensFlare';
	this.frustumCulled = false;

	this.flareTexture = texture;
	this.flareSize = size || 1;
	this.flareDistance = distance || 0;
	this.flareBlending = blending || THREE.NormalBlending,
	this.flareColor = color || new THREE.Color( 0xffffff );
	this.flareOpacity = opacity || 1;
	this.flarePosition = new THREE.Vector3();
	this.flareScale = 1;
	this.flareRotation = 0;

	this.geometry = THREE.LensFlare.Geometry;

	var shader = THREE.LensFlare.Shader;

	this.material = new THREE.RawShaderMaterial( {
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		blending: blending,
		transparent: true,
		depthWrite: false
	} );

	//

	var scale = new THREE.Vector2();
	var viewport = new THREE.Vector4();

	this.onBeforeRender = function ( renderer, scene, camera, geometry, material, group ) {

		var group = this.parent;

		if ( group === null ) {

			console.error( 'THREE.LensFlare: LensFlare not assigned to a LensFlareGroup. Rendering not possible.' );
			return;

		}

		//

		renderer.getViewport( viewport );

		group.update( renderer, camera, viewport );

		//

		var size = this.flareSize * this.flareScale / viewport.w;
		var invAspect = viewport.w / viewport.z;

		scale.set( size * invAspect, size );

		this.material.uniforms.map.value = this.flareTexture;
		this.material.uniforms.occlusionMap.value = group.getOcclusionMap();
		this.material.uniforms.opacity.value = this.flareOpacity;
		this.material.uniforms.color.value = this.flareColor;
		this.material.uniforms.scale.value = scale;
		this.material.uniforms.rotation.value = this.flareRotation;
		this.material.uniforms.screenPosition.value = this.flarePosition;

		if ( group.flareVisible === false ) {

			this.material.uniforms.opacity.value = 0;

		}

	};

	this.dispose = function () {

		this.material.dispose();

	};

};

THREE.LensFlare.prototype = Object.create( THREE.Mesh.prototype );
THREE.LensFlare.prototype.constructor = THREE.LensFlare;
THREE.LensFlare.prototype.isLensFlare = true;

THREE.LensFlare.Shader = {

	uniforms: {

		'map': { value: null },
		'occlusionMap': { value: null },
		'opacity': { value: 1 },
		'color': { value: null },
		'scale': { value: null },
		'rotation': { value: 1 },
		'screenPosition': { value: null }

	},

	vertexShader: [

		'precision highp float;',

		'uniform vec3 screenPosition;',
		'uniform vec2 scale;',
		'uniform float rotation;',

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
		' visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );',
		'	visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );',

		'	vVisibility =        visibility.r / 9.0;',
		'	vVisibility *= 1.0 - visibility.g / 9.0;',
		'	vVisibility *=       visibility.b / 9.0;',
		'	vVisibility *= 1.0 - visibility.a / 9.0;',

		'	pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;',
		'	pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;',

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
