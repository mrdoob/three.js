/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.LensFlarePlugin = function () {

	var _gl, _renderer, _precision;
	
	var flares = [];
	
	var vertexBuffer, elementBuffer;
	var program, attributes, uniforms;
	var hasVertexTexture;
	
	var tempTexture, occlusionTexture;

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		_precision = renderer.getPrecision();

		var vertices = new Float32Array( [
			-1, -1,  0, 0,
			 1, -1,  1, 0,
			 1,  1,  1, 1,
			-1,  1,  0, 1
		] );

		var faces = new Uint16Array( [
			0, 1, 2,
			0, 2, 3
		] );

		// buffers

		vertexBuffer     = _gl.createBuffer();
		elementBuffer    = _gl.createBuffer();

		_gl.bindBuffer( _gl.ARRAY_BUFFER, vertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, vertices, _gl.STATIC_DRAW );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, elementBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, faces, _gl.STATIC_DRAW );

		// textures

		tempTexture      = _gl.createTexture();
		occlusionTexture = _gl.createTexture();

		_gl.bindTexture( _gl.TEXTURE_2D, tempTexture );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, 16, 16, 0, _gl.RGB, _gl.UNSIGNED_BYTE, null );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST );

		_gl.bindTexture( _gl.TEXTURE_2D, occlusionTexture );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, 16, 16, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, null );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST );

		hasVertexTexture = _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) > 0;

		if ( hasVertexTexture ) {

			program = createProgram( THREE.ShaderFlares[ "lensFlare" ], _precision );

		} else {

			program = createProgram( THREE.ShaderFlares[ "lensFlareVertexTexture" ], _precision );

		}

		attributes = {
			vertex: _gl.getAttribLocation ( program, "position" ),
			uv:     _gl.getAttribLocation ( program, "uv" )
		}

		uniforms = {
			renderType:     _gl.getUniformLocation( program, "renderType" ),
			map:            _gl.getUniformLocation( program, "map" ),
			occlusionMap:   _gl.getUniformLocation( program, "occlusionMap" ),
			opacity:        _gl.getUniformLocation( program, "opacity" ),
			color:          _gl.getUniformLocation( program, "color" ),
			scale:          _gl.getUniformLocation( program, "scale" ),
			rotation:       _gl.getUniformLocation( program, "rotation" ),
			screenPosition: _gl.getUniformLocation( program, "screenPosition" )
		};

	};


	/*
	 * Render lens flares
	 * Method: renders 16x16 0xff00ff-colored points scattered over the light source area,
	 *         reads these back and calculates occlusion.
	 */

	this.render = function ( scene, camera, viewportWidth, viewportHeight ) {

		flares.length = 0;

		scene.traverseVisible( function ( child ) {

			if ( child instanceof THREE.LensFlare ) {

				flares.push( child );

			}

		} );

		if ( flares.length === 0 ) return;

		var tempPosition = new THREE.Vector3();

		var invAspect = viewportHeight / viewportWidth,
			halfViewportWidth = viewportWidth * 0.5,
			halfViewportHeight = viewportHeight * 0.5;

		var size = 16 / viewportHeight,
			scale = new THREE.Vector2( size * invAspect, size );

		var screenPosition = new THREE.Vector3( 1, 1, 0 ),
			screenPositionPixels = new THREE.Vector2( 1, 1 );

		_gl.useProgram( program );

		_gl.enableVertexAttribArray( attributes.vertex );
		_gl.enableVertexAttribArray( attributes.uv );

		// loop through all lens flares to update their occlusion and positions
		// setup gl and common used attribs/unforms

		_gl.uniform1i( uniforms.occlusionMap, 0 );
		_gl.uniform1i( uniforms.map, 1 );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, vertexBuffer );
		_gl.vertexAttribPointer( attributes.vertex, 2, _gl.FLOAT, false, 2 * 8, 0 );
		_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 2 * 8, 8 );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, elementBuffer );

		_gl.disable( _gl.CULL_FACE );
		_gl.depthMask( false );

		for ( var i = 0, l = flares.length; i < l; i ++ ) {

			size = 16 / viewportHeight;
			scale.set( size * invAspect, size );

			// calc object screen position

			var flare = flares[ i ];
			
			tempPosition.set( flare.matrixWorld.elements[12], flare.matrixWorld.elements[13], flare.matrixWorld.elements[14] );

			tempPosition.applyMatrix4( camera.matrixWorldInverse );
			tempPosition.applyProjection( camera.projectionMatrix );

			// setup arrays for gl programs

			screenPosition.copy( tempPosition )

			screenPositionPixels.x = screenPosition.x * halfViewportWidth + halfViewportWidth;
			screenPositionPixels.y = screenPosition.y * halfViewportHeight + halfViewportHeight;

			// screen cull

			if ( hasVertexTexture || (
				screenPositionPixels.x > 0 &&
				screenPositionPixels.x < viewportWidth &&
				screenPositionPixels.y > 0 &&
				screenPositionPixels.y < viewportHeight ) ) {

				// save current RGB to temp texture

				_gl.activeTexture( _gl.TEXTURE1 );
				_gl.bindTexture( _gl.TEXTURE_2D, tempTexture );
				_gl.copyTexImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, screenPositionPixels.x - 8, screenPositionPixels.y - 8, 16, 16, 0 );


				// render pink quad

				_gl.uniform1i( uniforms.renderType, 0 );
				_gl.uniform2f( uniforms.scale, scale.x, scale.y );
				_gl.uniform3f( uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z );

				_gl.disable( _gl.BLEND );
				_gl.enable( _gl.DEPTH_TEST );

				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


				// copy result to occlusionMap

				_gl.activeTexture( _gl.TEXTURE0 );
				_gl.bindTexture( _gl.TEXTURE_2D, occlusionTexture );
				_gl.copyTexImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, screenPositionPixels.x - 8, screenPositionPixels.y - 8, 16, 16, 0 );


				// restore graphics

				_gl.uniform1i( uniforms.renderType, 1 );
				_gl.disable( _gl.DEPTH_TEST );

				_gl.activeTexture( _gl.TEXTURE1 );
				_gl.bindTexture( _gl.TEXTURE_2D, tempTexture );
				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


				// update object positions

				flare.positionScreen.copy( screenPosition )

				if ( flare.customUpdateCallback ) {

					flare.customUpdateCallback( flare );

				} else {

					flare.updateLensFlares();

				}

				// render flares

				_gl.uniform1i( uniforms.renderType, 2 );
				_gl.enable( _gl.BLEND );

				for ( var j = 0, jl = flare.lensFlares.length; j < jl; j ++ ) {

					var sprite = flare.lensFlares[ j ];

					if ( sprite.opacity > 0.001 && sprite.scale > 0.001 ) {

						screenPosition.x = sprite.x;
						screenPosition.y = sprite.y;
						screenPosition.z = sprite.z;

						size = sprite.size * sprite.scale / viewportHeight;

						scale.x = size * invAspect;
						scale.y = size;

						_gl.uniform3f( uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z );
						_gl.uniform2f( uniforms.scale, scale.x, scale.y );
						_gl.uniform1f( uniforms.rotation, sprite.rotation );

						_gl.uniform1f( uniforms.opacity, sprite.opacity );
						_gl.uniform3f( uniforms.color, sprite.color.r, sprite.color.g, sprite.color.b );

						_renderer.setBlending( sprite.blending, sprite.blendEquation, sprite.blendSrc, sprite.blendDst );
						_renderer.setTexture( sprite.texture, 1 );

						_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );

					}

				}

			}

		}

		// restore gl

		_gl.enable( _gl.CULL_FACE );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( true );

		_renderer.resetGLState();

	};

	function createProgram ( shader, precision ) {

		var program = _gl.createProgram();

		var fragmentShader = _gl.createShader( _gl.FRAGMENT_SHADER );
		var vertexShader = _gl.createShader( _gl.VERTEX_SHADER );

		var prefix = "precision " + precision + " float;\n";

		_gl.shaderSource( fragmentShader, prefix + shader.fragmentShader );
		_gl.shaderSource( vertexShader, prefix + shader.vertexShader );

		_gl.compileShader( fragmentShader );
		_gl.compileShader( vertexShader );

		_gl.attachShader( program, fragmentShader );
		_gl.attachShader( program, vertexShader );

		_gl.linkProgram( program );

		return program;

	};

};
