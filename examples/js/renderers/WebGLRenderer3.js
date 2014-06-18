/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *   canvas: canvas,
 *   contextAttributes: {
 *     alpha: false,
 *     depth: true,
 *     stencil: false,
 *     antialias: true,
 *     premultipliedAlpha: true,
 *     preserveDrawingBuffer: false
 *   }
 * }
 *
 */

THREE.WebGLRenderer3 = function ( parameters ) {

	console.log( 'THREE.WebGLRenderer3', THREE.REVISION );

	parameters = parameters || {};

	var scope = this;

	var canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' );

	var devicePixelRatio = parameters.devicePixelRatio !== undefined
				? parameters.devicePixelRatio
				: self.devicePixelRatio !== undefined
					? self.devicePixelRatio
					: 1;

	var gl;

	try {

		var attributes = parameters.contextAttributes || {};
		
		if ( attributes.alpha === undefined ) attributes.alpha = false;

		gl = canvas.getContext( 'webgl', attributes ) || canvas.getContext( 'experimental-webgl', attributes );

		if ( gl === null ) {

			throw 'Error creating WebGL context.';

		}

	} catch ( exception ) {

		console.error( exception );

	}

	var precision = 'highp';
	var extensions = {};

	if ( gl !== null ) {

		extensions.element_index_uint = gl.getExtension( 'OES_element_index_uint' );
		extensions.texture_float = gl.getExtension( 'OES_texture_float' );
		extensions.texture_float_linear = gl.getExtension( 'OES_texture_float_linear' );
		extensions.standard_derivatives = gl.getExtension( 'OES_standard_derivatives' );
		extensions.texture_filter_anisotropic = gl.getExtension( 'EXT_texture_filter_anisotropic' ) || gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
		extensions.compressed_texture_s3tc = gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );

		gl.clearColor( 0, 0, 0, 1 );
		gl.clearDepth( 1 );
		gl.clearStencil( 0 );

		gl.enable( gl.DEPTH_TEST );
		gl.depthFunc( gl.LEQUAL );

		gl.enable( gl.CULL_FACE );
		gl.frontFace( gl.CCW );
		gl.cullFace( gl.BACK );

		gl.enable( gl.BLEND );
		gl.blendEquation( gl.FUNC_ADD );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		gl.clearColor( 0, 0, 0, 0 );

	}

	var clearColor = new THREE.Color( 0x000000 );
	var clearAlpha = 0;

	//

	var vector3 = new THREE.Vector3();
	var frustum = new THREE.Frustum();
	var normalMatrix = new THREE.Matrix3();
	var modelViewMatrix = new THREE.Matrix4();
	var cameraViewProjectionMatrix = new THREE.Matrix4();

	// buffers

	var buffers = {};

	var getBuffer = function ( geometry, material ) {

		var hash = geometry.id.toString() + '+' + material.id.toString();

		if ( buffers[ hash ] !== undefined ) {

			return buffers[ hash ];

		}

		var vertices = geometry.vertices;
		var faces = geometry.faces;

		//

		var positions = [];
		var addPosition = function ( position ) {

			positions.push( position.x, position.y, position.z );

		}

		var normals = [];
		var addNormal = function ( normal ) {

			normals.push( normal.x, normal.y, normal.z );

		}

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];
			var vertexNormals = face.vertexNormals.length > 0;

			addPosition( vertices[ face.a ] );
			addPosition( vertices[ face.b ] );
			addPosition( vertices[ face.c ] );

			if ( vertexNormals === true ) {

				addNormal( face.vertexNormals[ 0 ] );
				addNormal( face.vertexNormals[ 1 ] );
				addNormal( face.vertexNormals[ 2 ] );

			} else {

				addNormal( face.normal );
				addNormal( face.normal );
				addNormal( face.normal );

			}

		}

		var buffer = {
			positions: gl.createBuffer(),
			normals: gl.createBuffer(),
			count: positions.length / 3
		};

		gl.bindBuffer( gl.ARRAY_BUFFER, buffer.positions );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, buffer.normals );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );

		buffers[ hash ] = buffer;

		scope.info.memory.geometries ++;

		return buffer;

	};

	// programs

	var programs = {};
	var programsCache = {};

	var getProgram = function ( material ) {

		if ( programs[ material.id ] !== undefined ) {

			return programs[ material.id ];

		}

		var vertexShader = [
			'precision ' + precision + ' float;',
			"precision " + precision + " int;",
			'attribute vec3 position;',
			'attribute vec3 normal;',
			'uniform mat4 modelViewMatrix;',
			'uniform mat3 normalMatrix;',
			'uniform mat4 projectionMatrix;',
			''
		].join( '\n' );

		var fragmentShader = [
			'precision ' + precision + ' float;',
			"precision " + precision + " int;",
			''
		].join( '\n' );

		if ( material instanceof THREE.ShaderMaterial ) {

			vertexShader += material.vertexShader;
			fragmentShader += material.fragmentShader;

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			vertexShader += [
				'varying vec3 vNormal;',
				'void main() {',
				'	vNormal = normalize( normalMatrix * normal );',
				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'}'
			].join( '\n' );

			fragmentShader += [
				'varying vec3 vNormal;',
				'uniform float opacity;',
				'void main() {',
				'	gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );',
				'}'
			].join( '\n' );

		} else {

			vertexShader += [
				'void main() {',
				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'}'
			].join( '\n' );

			fragmentShader += [
				'void main() {',
				'	gl_FragColor = vec4( 1.0, 0, 0, 1.0 );',
				'}'
			].join( '\n' );

		}

		var program;
		var code = vertexShader + fragmentShader;

		if ( programsCache[ code ] !== undefined ) {

			program = programsCache[ code ];
			programs[ material.id ] = program;

		} else {

			program = gl.createProgram();

			gl.attachShader( program, createShader( gl.VERTEX_SHADER, vertexShader ) );
			gl.attachShader( program, createShader( gl.FRAGMENT_SHADER, fragmentShader ) );
			gl.linkProgram( program );

			if ( gl.getProgramParameter( program, gl.LINK_STATUS ) === true ) {

				programsCache[ code ] = program;
				programs[ material.id ] = program;

				scope.info.memory.programs ++;

			} else {

				console.error( 'Program Info Log: ' + gl.getProgramInfoLog( program ) );
				console.error( 'VALIDATE_STATUS: ' + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) );
				console.error( 'GL_ERROR: ' + gl.getError() );

				// fallback

				program = getProgram( new THREE.MeshBasicMaterial() );
				programs[ material.id ] = program;

			}

		}

		return program;

	};

	var createShader = function ( type, string ) {

		var shader = gl.createShader( type );

		gl.shaderSource( shader, string );
		gl.compileShader( shader );

		if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === true ) {

			// console.log( string );

		} else {

			console.error( gl.getShaderInfoLog( shader ), string );
			return null;

		}

		return shader;

	};

	this.info = {

		memory: {

			programs: 0,
			geometries: 0,
			textures: 0

		},

		render: {

			calls: 0,
			vertices: 0,
			faces: 0,
			points: 0

		}

	};

	this.domElement = canvas;
	this.extensions = extensions;

	this.autoClear = true; // TODO: Make private

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );
		clearAlpha = alpha !== undefined ? alpha : 1;

		gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );

	};

	this.setSize = function ( width, height, updateStyle ) {

		canvas.width = width * devicePixelRatio;
		canvas.height = height * devicePixelRatio;

		if ( devicePixelRatio !== 1 && updateStyle !== false ) {

			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';

		}

		gl.viewport( 0, 0, canvas.width, canvas.height );

	};

	this.clear = function ( color, depth, stencil ) {

		var bits = 0;

		if ( color === undefined || color ) bits |= gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth ) bits |= gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil ) bits |= gl.STENCIL_BUFFER_BIT;

		gl.clear( bits );

	};

	// blending

	var currentBlending = null;

	var setBlending = function ( blending ) {

		if ( blending !== currentBlending ) {

			if ( blending === THREE.NoBlending ) {

				gl.disable( gl.BLEND );

			} else {

				gl.enable( gl.BLEND );

			}

			currentBlending = blending;

		}

	};

	// depthTest

	var currentDepthTest = null;

	var setDepthTest = function ( value ) {

		if ( value !== currentDepthTest ) {

			value === true ? gl.enable( gl.DEPTH_TEST ) : gl.disable( gl.DEPTH_TEST );
			currentDepthTest = value;

		}

	};

	// depthWrite

	var currentDepthWrite = null;

	var setDepthWrite = function ( value ) {

		if ( value !== currentDepthWrite ) {

			gl.depthMask( value );
			currentDepthWrite = value;

		}

	};

	var objectsOpaque = [];
	var objectsTransparent = [];

	var projectObject = function ( object ) {

		if ( object.visible === false ) return;

		if ( object instanceof THREE.Mesh && frustum.intersectsObject( object ) === true ) {

			// TODO: Do not polute scene graph with .z

			if ( object.renderDepth !== null ) {

				object.z = object.renderDepth;

			} else {

				vector3.setFromMatrixPosition( object.matrixWorld );
				vector3.applyProjection( cameraViewProjectionMatrix );

				object.z = vector3.z;

			}

			if ( object.material.transparent === true ) {

				objectsTransparent.push( object );

			} else {

				objectsOpaque.push( object );

			}

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			projectObject( object.children[ i ] );

		}

	};

	var sortOpaque = function ( a, b ) {

		return a.z - b.z;

	};

	var sortTransparent = function ( a, b ) {

		return a.z !== b.z ? b.z - a.z : b.id - a.id;

	};

	var currentBuffer, currentMaterial, currentProgram;
	var locations = {};

	var renderObject = function ( object, camera ) {

		var buffer = getBuffer( object.geometry, object.material );

		var material = object.material;

		if ( material !== currentMaterial ) {

			var program = getProgram( object.material );

			if ( program !== currentProgram ) {

				gl.useProgram( program );

				locations.modelViewMatrix = gl.getUniformLocation( program, 'modelViewMatrix' );
				locations.normalMatrix = gl.getUniformLocation( program, 'normalMatrix' );
				locations.projectionMatrix = gl.getUniformLocation( program, 'projectionMatrix' );

				locations.position = gl.getAttribLocation( program, 'position' );
				locations.normal = gl.getAttribLocation( program, 'normal' );

				gl.uniformMatrix4fv( locations.projectionMatrix, false, camera.projectionMatrix.elements );

				currentProgram = program;

			}

			if ( material instanceof THREE.MeshNormalMaterial ) {

				gl.uniform1f( gl.getUniformLocation( program, 'opacity' ), material.opacity );

			} else if ( material instanceof THREE.ShaderMaterial ) {

				var uniforms = material.uniforms;

				for ( var uniform in uniforms ) {

					var location = gl.getUniformLocation( program, uniform );

					var type = uniforms[ uniform ].type;
					var value = uniforms[ uniform ].value;

					if ( type === "i" ) { // single integer

						gl.uniform1i( location, value );

					} else if ( type === "f" ) { // single float

						gl.uniform1f( location, value );

					} else if ( type === "v2" ) { // single THREE.Vector2

						gl.uniform2f( location, value.x, value.y );

					} else if ( type === "v3" ) { // single THREE.Vector3

						gl.uniform3f( location, value.x, value.y, value.z );

					} else if ( type === "v4" ) { // single THREE.Vector4

						gl.uniform4f( location, value.x, value.y, value.z, value.w );

					} else if ( type === "c" ) { // single THREE.Color

						gl.uniform3f( location, value.r, value.g, value.b );

					}

				}

			}

			currentMaterial = material;

		}

		if ( buffer !== currentBuffer ) {

			gl.bindBuffer( gl.ARRAY_BUFFER, buffer.positions );
			gl.enableVertexAttribArray( locations.position );
			gl.vertexAttribPointer( locations.position, 3, gl.FLOAT, false, 0, 0 );

			if ( locations.normal >= 0 ) {

				gl.bindBuffer( gl.ARRAY_BUFFER, buffer.normals );
				gl.enableVertexAttribArray( locations.normal );
				gl.vertexAttribPointer( locations.normal, 3, gl.FLOAT, false, 0, 0 );

			}

			currentBuffer = buffer;

		}

		modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		normalMatrix.getNormalMatrix( modelViewMatrix );

		gl.uniformMatrix4fv( locations.modelViewMatrix, false, modelViewMatrix.elements );
		gl.uniformMatrix3fv( locations.normalMatrix, false, normalMatrix.elements );

		gl.drawArrays( gl.TRIANGLES, 0, buffer.count );

		scope.info.render.calls ++;

	};

	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		scene.updateMatrixWorld();

		if ( camera.parent === undefined ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		frustum.setFromMatrix( cameraViewProjectionMatrix );

		objectsOpaque.length = 0;
		objectsTransparent.length = 0;

		scope.info.render.calls = 0;

		currentBuffer = undefined;
		currentMaterial = undefined;
		currentProgram = undefined;

		projectObject( scene );

		if ( objectsOpaque.length > 0 ) {

			objectsOpaque.sort( sortOpaque );

			setBlending( THREE.NoBlending );

			for ( var i = 0, l = objectsOpaque.length; i < l; i ++ ) {

				renderObject( objectsOpaque[ i ], camera );

			}

		}

		if ( objectsTransparent.length > 0 ) {

			objectsTransparent.sort( sortTransparent );

			setBlending( THREE.NormalBlending );

			for ( var i = 0, l = objectsTransparent.length; i < l; i ++ ) {

				renderObject( objectsTransparent[ i ], camera );

			}

		}

	};

};
