/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpritePlugin = function () {

	var _gl, _renderer, _precision;

	var vertices, faces, vertexBuffer, elementBuffer;
	var program, attributes, uniforms;

	this.init = function ( renderer ) {

		_gl = renderer.context;
		_renderer = renderer;

		_precision = renderer.getPrecision();

		vertices = new Float32Array( [
			- 0.5, - 0.5, 0, 0, 
			  0.5, - 0.5, 1, 0,
			  0.5,   0.5, 1, 1,
			- 0.5,   0.5, 0, 1
		] );

		faces = new Uint16Array( [
			0, 1, 2,
			0, 2, 3
		] );

		vertexBuffer  = _gl.createBuffer();
		elementBuffer = _gl.createBuffer();

		_gl.bindBuffer( _gl.ARRAY_BUFFER, vertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, vertices, _gl.STATIC_DRAW );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, elementBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, faces, _gl.STATIC_DRAW );

		program = createProgram( THREE.ShaderSprite[ 'sprite' ], _precision );

		attributes = {
			position:			_gl.getAttribLocation ( program, 'position' ),
			uv:					_gl.getAttribLocation ( program, 'uv' )
		};

		uniforms = {
			uvOffset:			_gl.getUniformLocation( program, 'uvOffset' ),
			uvScale:			_gl.getUniformLocation( program, 'uvScale' ),

			rotation:			_gl.getUniformLocation( program, 'rotation' ),
			scale:				_gl.getUniformLocation( program, 'scale' ),
			halfViewport: 		_gl.getUniformLocation( program, 'halfViewport' ),

			color:				_gl.getUniformLocation( program, 'color' ),
			map:				_gl.getUniformLocation( program, 'map' ),
			opacity:			_gl.getUniformLocation( program, 'opacity' ),

			modelViewMatrix: 	_gl.getUniformLocation( program, 'modelViewMatrix' ),
			projectionMatrix:	_gl.getUniformLocation( program, 'projectionMatrix' ),

			fogType: 			_gl.getUniformLocation( program, 'fogType' ),
			fogDensity: 		_gl.getUniformLocation( program, 'fogDensity' ),
			fogNear: 			_gl.getUniformLocation( program, 'fogNear' ),
			fogFar: 			_gl.getUniformLocation( program, 'fogFar' ),
			fogColor: 			_gl.getUniformLocation( program, 'fogColor' ),

			alphaTest: 			_gl.getUniformLocation( program, 'alphaTest' )
		};

	};

	this.render = function ( scene, camera, viewportWidth, viewportHeight ) {

		var sprites = scene.__webglSprites,
			nSprites = sprites.length;

		if ( ! nSprites ) return;

		var halfViewportWidth = viewportWidth * 0.5,
			halfViewportHeight = viewportHeight * 0.5;

		// setup gl

		_gl.useProgram( program );

		_gl.enableVertexAttribArray( attributes.position );
		_gl.enableVertexAttribArray( attributes.uv );

		_gl.disable( _gl.CULL_FACE );
		_gl.enable( _gl.BLEND );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, vertexBuffer );
		_gl.vertexAttribPointer( attributes.position, 2, _gl.FLOAT, false, 2 * 8, 0 );
		_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 2 * 8, 8 );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, elementBuffer );

		_gl.uniformMatrix4fv( uniforms.projectionMatrix, false, camera.projectionMatrix.elements );

		_gl.activeTexture( _gl.TEXTURE0 );
		_gl.uniform1i( uniforms.map, 0 );

		var oldFogType = 0;
		var sceneFogType = 0;
		var fog = scene.fog;

		if ( fog ) {

			_gl.uniform3f( uniforms.fogColor, fog.color.r, fog.color.g, fog.color.b );

			if ( fog instanceof THREE.Fog ) {

				_gl.uniform1f( uniforms.fogNear, fog.near );
				_gl.uniform1f( uniforms.fogFar, fog.far );

				_gl.uniform1i( uniforms.fogType, 1 );
				oldFogType = 1;
				sceneFogType = 1;

			} else if ( fog instanceof THREE.FogExp2 ) {

				_gl.uniform1f( uniforms.fogDensity, fog.density );

				_gl.uniform1i( uniforms.fogType, 2 );
				oldFogType = 2;
				sceneFogType = 2;

			}

		} else {

			_gl.uniform1i( uniforms.fogType, 0 );
			oldFogType = 0;
			sceneFogType = 0;

		}


		// update positions and sort

		var i, sprite, material, fogType, scale = [];

		for( i = 0; i < nSprites; i ++ ) {

			sprite = sprites[ i ];
			material = sprite.material;

			if ( ! sprite.visible || material.opacity === 0 ) continue;

			sprite._modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, sprite.matrixWorld );
			sprite.z = - sprite._modelViewMatrix.elements[ 14 ];

		}

		sprites.sort( painterSortStable );

		// render all sprites

		for( i = 0; i < nSprites; i ++ ) {

			sprite = sprites[ i ];
			material = sprite.material;

			if ( ! sprite.visible || material.opacity === 0 ) continue;

			if ( material.map && material.map.image && material.map.image.width ) {

				_gl.uniform1f( uniforms.alphaTest, material.alphaTest );
				_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, sprite._modelViewMatrix.elements );

				scale[ 0 ] = sprite.scale.x;
				scale[ 1 ] = sprite.scale.y;

				if ( scene.fog && material.fog ) {

					fogType = sceneFogType;

				} else {

					fogType = 0;

				}

				if ( oldFogType !== fogType ) {

					_gl.uniform1i( uniforms.fogType, fogType );
					oldFogType = fogType;

				}

				_gl.uniform2f( uniforms.uvScale, material.uvScale.x, material.uvScale.y );
				_gl.uniform2f( uniforms.uvOffset, material.uvOffset.x, material.uvOffset.y );

				_gl.uniform1f( uniforms.opacity, material.opacity );
				_gl.uniform3f( uniforms.color, material.color.r, material.color.g, material.color.b );

				_gl.uniform1f( uniforms.rotation, material.rotation );
				_gl.uniform2fv( uniforms.scale, scale );
				_gl.uniform2f( uniforms.halfViewport, halfViewportWidth, halfViewportHeight );

				_renderer.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );
				_renderer.setDepthTest( material.depthTest );
				_renderer.setDepthWrite( material.depthWrite );
				_renderer.setTexture( material.map, 0 );

				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );

			}

		}

		// restore gl

		_gl.enable( _gl.CULL_FACE );

	};

	function createProgram ( shader, precision ) {

		var program = _gl.createProgram();

		var fragmentShader = _gl.createShader( _gl.FRAGMENT_SHADER );
		var vertexShader = _gl.createShader( _gl.VERTEX_SHADER );

		var prefix = 'precision ' + precision + ' float;\n';

		_gl.shaderSource( fragmentShader, prefix + shader.fragmentShader );
		_gl.shaderSource( vertexShader, prefix + shader.vertexShader );

		_gl.compileShader( fragmentShader );
		_gl.compileShader( vertexShader );

		_gl.attachShader( program, fragmentShader );
		_gl.attachShader( program, vertexShader );

		_gl.linkProgram( program );

		return program;

	};

	function painterSortStable ( a, b ) {

		if ( a.z !== b.z ) {

			return b.z - a.z;

		} else {

			return b.id - a.id;

		}

	};

};
