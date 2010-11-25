/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.WebGLRenderer = function ( scene ) {

	// Currently you can use just up to 4 directional / point lights total.
	// Chrome barfs on shader linking when there are more than 4 lights :(

	// The problem comes from shader using too many varying vectors.

	// This is not GPU limitation as the same shader works ok in Firefox
	// or Chrome with "--use-gl=desktop" flag.
	
	// This difference comes from Chrome on Windows using by default ANGLE,
	// thus going DirectX9 route (while FF uses OpenGL).
	
	// See http://code.google.com/p/chromium/issues/detail?id=63491

	var _canvas = document.createElement( 'canvas' ), _gl, _program,
	_modelViewMatrix = new THREE.Matrix4(), _normalMatrix,

	// material constants used in shader
	
	BASIC = 0, LAMBERT = 1, PHONG = 2, DEPTH = 3, NORMAL = 4, CUBE = 5, 

	// heuristics to create shader parameters according to lights in the scene
	// (not to blow over maxLights budget)

	maxLightCount = allocateLights( scene, 4 );

	this.domElement = _canvas;
	this.autoClear = true;

	initGL();
	initProgram( maxLightCount.directional, maxLightCount.point );

	//alert( dumpObject( getGLParams() ) );

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.setupLights = function ( scene ) {

		var l, ll, light, r, g, b,
			ambientLights = [], pointLights = [], directionalLights = [],
			colors = [], positions = [];

		_gl.uniform1i( _program.enableLighting, scene.lights.length );

		for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.AmbientLight ) {

				ambientLights.push( light );

			} else if ( light instanceof THREE.DirectionalLight ) {

				directionalLights.push( light );

			} else if( light instanceof THREE.PointLight ) {

				pointLights.push( light );

			}

		}

		// sum all ambient lights
		r = g = b = 0.0;

		for ( l = 0, ll = ambientLights.length; l < ll; l++ ) {

			r += ambientLights[ l ].color.r;
			g += ambientLights[ l ].color.g;
			b += ambientLights[ l ].color.b;

		}

		_gl.uniform3f( _program.ambientLightColor, r, g, b );

		// pass directional lights as float arrays

		colors = []; positions = [];

		for ( l = 0, ll = directionalLights.length; l < ll; l++ ) {

			light = directionalLights[ l ];

			colors.push( light.color.r * light.intensity );
			colors.push( light.color.g * light.intensity );
			colors.push( light.color.b * light.intensity );

			positions.push( light.position.x );
			positions.push( light.position.y );
			positions.push( light.position.z );

		}

		if ( directionalLights.length ) {

			_gl.uniform1i(  _program.directionalLightNumber, directionalLights.length );
			_gl.uniform3fv( _program.directionalLightDirection, positions );
			_gl.uniform3fv( _program.directionalLightColor, colors );

		}

		// pass point lights as float arrays

		colors = []; positions = [];

		for ( l = 0, ll = pointLights.length; l < ll; l++ ) {

			light = pointLights[ l ];

			colors.push( light.color.r * light.intensity );
			colors.push( light.color.g * light.intensity );
			colors.push( light.color.b * light.intensity );

			positions.push( light.position.x );
			positions.push( light.position.y );
			positions.push( light.position.z );

		}

		if ( pointLights.length ) {

			_gl.uniform1i(  _program.pointLightNumber, pointLights.length );
			_gl.uniform3fv( _program.pointLightPosition, positions );
			_gl.uniform3fv( _program.pointLightColor, colors );

		}

	};
	
	this.createBuffers = function ( object, mf ) {

		var f, fl, fi, face, vertexNormals, normal, uv, v1, v2, v3, v4, m, ml, i,

		faceArray = [],
		lineArray = [],

		vertexArray = [],
		normalArray = [],
		uvArray = [],

		vertexIndex = 0,

		materialFaceGroup = object.materialFaceGroup[ mf ],

		needsSmoothNormals = bufferNeedsSmoothNormals ( materialFaceGroup, object );

		for ( f = 0, fl = materialFaceGroup.faces.length; f < fl; f++ ) {

			fi = materialFaceGroup.faces[f];

			face = object.geometry.faces[ fi ];
			vertexNormals = face.vertexNormals;
			faceNormal = face.normal;
			uv = object.geometry.uvs[ fi ];

			if ( face instanceof THREE.Face3 ) {

				v1 = object.geometry.vertices[ face.a ].position;
				v2 = object.geometry.vertices[ face.b ].position;
				v3 = object.geometry.vertices[ face.c ].position;

				vertexArray.push( v1.x, v1.y, v1.z );
				vertexArray.push( v2.x, v2.y, v2.z );
				vertexArray.push( v3.x, v3.y, v3.z );

				if ( vertexNormals.length == 3 && needsSmoothNormals ) {

					for ( i = 0; i < 3; i ++ ) {

						normalArray.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

					}

				} else {

					for ( i = 0; i < 3; i ++ ) {

						normalArray.push( faceNormal.x, faceNormal.y, faceNormal.z );

					}

				}

				if ( uv ) {

					for ( i = 0; i < 3; i ++ ) {

						uvArray.push( uv[ i ].u, uv[ i ].v );
						
					}

				}

				faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );

				// TODO: don't add lines that already exist (faces sharing edge)

				lineArray.push( vertexIndex, vertexIndex + 1 );
				lineArray.push( vertexIndex, vertexIndex + 2 );
				lineArray.push( vertexIndex + 1, vertexIndex + 2 );

				vertexIndex += 3;

			} else if ( face instanceof THREE.Face4 ) {

				v1 = object.geometry.vertices[ face.a ].position;
				v2 = object.geometry.vertices[ face.b ].position;
				v3 = object.geometry.vertices[ face.c ].position;
				v4 = object.geometry.vertices[ face.d ].position;

				vertexArray.push( v1.x, v1.y, v1.z );
				vertexArray.push( v2.x, v2.y, v2.z );
				vertexArray.push( v3.x, v3.y, v3.z );
				vertexArray.push( v4.x, v4.y, v4.z );

				if ( vertexNormals.length == 4 && needsSmoothNormals ) {

					for ( i = 0; i < 4; i ++ ) {

						normalArray.push( vertexNormals[ i ].x, vertexNormals[ i ].y, vertexNormals[ i ].z );

					}

				} else {

					for ( i = 0; i < 4; i ++ ) {

						normalArray.push( faceNormal.x, faceNormal.y, faceNormal.z );

					}

				}

				if ( uv ) {

					for ( i = 0; i < 4; i ++ ) {

						uvArray.push( uv[ i ].u, uv[ i ].v );
						
					}

				}

				faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
				faceArray.push( vertexIndex, vertexIndex + 2, vertexIndex + 3 );

				// TODO: don't add lines that already exist (faces sharing edge)

				lineArray.push( vertexIndex, vertexIndex + 1 );
				lineArray.push( vertexIndex, vertexIndex + 2 );
				lineArray.push( vertexIndex, vertexIndex + 3 );
				lineArray.push( vertexIndex + 1, vertexIndex + 2 );
				lineArray.push( vertexIndex + 2, vertexIndex + 3 );

				vertexIndex += 4;

			}
		}

		if ( !vertexArray.length ) {

			return;

		}

		materialFaceGroup.__webGLVertexBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLVertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertexArray ), _gl.STATIC_DRAW );

		materialFaceGroup.__webGLNormalBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLNormalBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( normalArray ), _gl.STATIC_DRAW );

		materialFaceGroup.__webGLUVBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLUVBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( uvArray ), _gl.STATIC_DRAW );

		materialFaceGroup.__webGLFaceBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLFaceBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( faceArray ), _gl.STATIC_DRAW );

		materialFaceGroup.__webGLLineBuffer = _gl.createBuffer();
		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLLineBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( lineArray ), _gl.STATIC_DRAW );

		materialFaceGroup.__webGLFaceCount = faceArray.length;
		materialFaceGroup.__webGLLineCount = lineArray.length;

	};

	this.renderBuffer = function ( material, materialFaceGroup ) {

		var mColor, mOpacity, mReflectivity,
			mWireframe, mLineWidth, mBlending,
			mAmbient, mSpecular, mShininess,
			mMap, envMap, mixEnvMap,
			mRefractionRatio, useRefract;
		

		if ( material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshBasicMaterial ) {

			mColor = material.color;
			mOpacity = material.opacity;

			mWireframe = material.wireframe;
			mLineWidth = material.wireframe_linewidth;

			mBlending = material.blending;

			mMap = material.map;
			envMap = material.env_map;

			mixEnvMap = material.combine == THREE.Mix;
			mReflectivity = material.reflectivity;

			useRefract = material.env_map && material.env_map.mapping == THREE.RefractionMap;
			mRefractionRatio = material.refraction_ratio;

			_gl.uniform4f( _program.mColor,  mColor.r * mOpacity, mColor.g * mOpacity, mColor.b * mOpacity, mOpacity );

			_gl.uniform1i( _program.mixEnvMap, mixEnvMap );
			_gl.uniform1f( _program.mReflectivity, mReflectivity );

			_gl.uniform1i( _program.useRefract, useRefract );
			_gl.uniform1f( _program.mRefractionRatio, mRefractionRatio );

		}

		if ( material instanceof THREE.MeshNormalMaterial ) {

			mOpacity = material.opacity;
			mBlending = material.blending;

			_gl.uniform1f( _program.mOpacity, mOpacity );

			_gl.uniform1i( _program.material, NORMAL );

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			mOpacity = material.opacity;

			mWireframe = material.wireframe;
			mLineWidth = material.wireframe_linewidth;

			_gl.uniform1f( _program.mOpacity, mOpacity );

			_gl.uniform1f( _program.m2Near, material.__2near );
			_gl.uniform1f( _program.mFarPlusNear, material.__farPlusNear );
			_gl.uniform1f( _program.mFarMinusNear, material.__farMinusNear );

			_gl.uniform1i( _program.material, DEPTH );

		} else if ( material instanceof THREE.MeshPhongMaterial ) {

			mAmbient  = material.ambient;
			mSpecular = material.specular;
			mShininess = material.shininess;

			_gl.uniform4f( _program.mAmbient,  mAmbient.r,  mAmbient.g,  mAmbient.b,  mOpacity );
			_gl.uniform4f( _program.mSpecular, mSpecular.r, mSpecular.g, mSpecular.b, mOpacity );
			_gl.uniform1f( _program.mShininess, mShininess );

			_gl.uniform1i( _program.material, PHONG );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			_gl.uniform1i( _program.material, LAMBERT );

		} else if ( material instanceof THREE.MeshBasicMaterial ) {

			_gl.uniform1i( _program.material, BASIC );

		} else if ( material instanceof THREE.MeshCubeMaterial ) {

			_gl.uniform1i( _program.material, CUBE );

			envMap = material.env_map;

		}
		
		if ( mMap ) {

			if ( !material.map.__webGLTexture && material.map.image.loaded ) {

				material.map.__webGLTexture = _gl.createTexture();
				_gl.bindTexture( _gl.TEXTURE_2D, material.map.__webGLTexture );
				_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, material.map.image );
				
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( material.map.wrap_s ) );
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( material.map.wrap_t ) );
				
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );
				_gl.generateMipmap( _gl.TEXTURE_2D );
				_gl.bindTexture( _gl.TEXTURE_2D, null );

			}

			_gl.activeTexture( _gl.TEXTURE0 );
			_gl.bindTexture( _gl.TEXTURE_2D, material.map.__webGLTexture );
			_gl.uniform1i( _program.tMap,  0 );

			_gl.uniform1i( _program.enableMap, 1 );

		} else {

			_gl.uniform1i( _program.enableMap, 0 );

		}

		if ( envMap ) {

			if ( material.env_map && material.env_map instanceof THREE.TextureCube &&
			material.env_map.image.length == 6 ) {

				if ( !material.env_map.image.__webGLTextureCube &&
				!material.env_map.image.__cubeMapInitialized && material.env_map.image.loadCount == 6 ) {

					material.env_map.image.__webGLTextureCube = _gl.createTexture();

					_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, material.env_map.image.__webGLTextureCube );

					_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
					_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

					_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
					_gl.texParameteri( _gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );

					 for ( var i = 0; i < 6; ++i ) {

						_gl.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, material.env_map.image[ i ] );

					}

					_gl.generateMipmap( _gl.TEXTURE_CUBE_MAP );

					_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, null );

					material.env_map.image.__cubeMapInitialized = true;

				}

				_gl.activeTexture( _gl.TEXTURE1 );
				_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, material.env_map.image.__webGLTextureCube );
				_gl.uniform1i( _program.tCube,  1 );

			}

			_gl.uniform1i( _program.enableCubeMap, 1 );

		} else {

			_gl.uniform1i( _program.enableCubeMap, 0 );

		}

		// vertices

		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLVertexBuffer );
		_gl.vertexAttribPointer( _program.position, 3, _gl.FLOAT, false, 0, 0 );

		// normals

		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLNormalBuffer );
		_gl.vertexAttribPointer( _program.normal, 3, _gl.FLOAT, false, 0, 0 );

		// uvs

		if ( mMap ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLUVBuffer );

			_gl.enableVertexAttribArray( _program.uv );
			_gl.vertexAttribPointer( _program.uv, 2, _gl.FLOAT, false, 0, 0 );

		} else {

			_gl.disableVertexAttribArray( _program.uv );

		}

		// render triangles

		if ( ! mWireframe ) {

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLFaceBuffer );
			_gl.drawElements( _gl.TRIANGLES, materialFaceGroup.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );

		// render lines

		} else {

			_gl.lineWidth( mLineWidth );
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLLineBuffer );
			_gl.drawElements( _gl.LINES, materialFaceGroup.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );

		}

	};

	this.renderPass = function ( object, materialFaceGroup, blending, transparent ) {

		var i, l, m, ml, material, meshMaterial;

		for ( m = 0, ml = object.material.length; m < ml; m++ ) {

			meshMaterial = object.material[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = materialFaceGroup.material.length; i < l; i++ ) {

					material = materialFaceGroup.material[ i ];
					if ( material && material.blending == blending && ( material.opacity < 1.0 == transparent ) ) {

						this.setBlending( material.blending );
						this.renderBuffer( material, materialFaceGroup );

					}

				}

			} else {

				material = meshMaterial;
				if ( material && material.blending == blending && ( material.opacity < 1.0 == transparent ) ) {

					this.setBlending( material.blending );
					this.renderBuffer( material, materialFaceGroup );
				}

			}

		}

	};

	this.render = function( scene, camera ) {

		var o, ol;

		this.initWebGLObjects( scene );

		if ( this.autoClear ) {

			this.clear();

		}

		camera.autoUpdateMatrix && camera.updateMatrix();
		_gl.uniform3f( _program.cameraPosition, camera.position.x, camera.position.y, camera.position.z );

		this.setupLights( scene );

		// opaque pass

		for ( o = 0, ol = scene.__webGLObjects.length; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];
			
			if ( webGLObject.__object.visible ) {

				this.setupMatrices( webGLObject.__object, camera );
				this.renderPass( webGLObject.__object, webGLObject, THREE.NormalBlending, false );
				
			}

		}

		// transparent pass

		for ( o = 0, ol = scene.__webGLObjects.length; o < ol; o++ ) {

			webGLObject = scene.__webGLObjects[ o ];

			if ( webGLObject.__object.visible ) {
				
				this.setupMatrices( webGLObject.__object, camera );

				// opaque blended materials
				
				this.renderPass( webGLObject.__object, webGLObject, THREE.AdditiveBlending, false );
				this.renderPass( webGLObject.__object, webGLObject, THREE.SubtractiveBlending, false );
				
				// transparent blended materials
				
				this.renderPass( webGLObject.__object, webGLObject, THREE.AdditiveBlending, true );
				this.renderPass( webGLObject.__object, webGLObject, THREE.SubtractiveBlending, true );

				// transparent normal materials
				
				this.renderPass( webGLObject.__object, webGLObject, THREE.NormalBlending, true );
				
			}

		}

	};

	this.initWebGLObjects = function( scene ) {

		var o, ol, object, mf, materialFaceGroup;

		if ( !scene.__webGLObjects ) {

			scene.__webGLObjects = [];

		}

		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			if ( object instanceof THREE.Mesh ) {

				// create separate VBOs per material

				for ( mf in object.materialFaceGroup ) {

					materialFaceGroup = object.materialFaceGroup[ mf ];

					// initialise buffers on the first access

					if( ! materialFaceGroup.__webGLVertexBuffer ) {

						this.createBuffers( object, mf );
						materialFaceGroup.__object = object;
						scene.__webGLObjects.push( materialFaceGroup );

					}

				}

			}/* else if ( object instanceof THREE.Line ) {

			} else if ( object instanceof THREE.Particle ) {

			}*/

		}

	};

	this.removeObject = function ( scene, object ) {

		var o, ol, zobject;
		
		for ( o = scene.__webGLObjects.length - 1; o >= 0; o-- ) {
			
			zobject = scene.__webGLObjects[ o ].__object;
			
			if ( object == zobject ) {

				scene.__webGLObjects.splice( o, 1 );

			}
			
		}
		
	};

	this.setupMatrices = function ( object, camera ) {

		object.autoUpdateMatrix && object.updateMatrix();

		_modelViewMatrix.multiply( camera.matrix, object.matrix );

		_program.viewMatrixArray = new Float32Array( camera.matrix.flatten() );
		_program.modelViewMatrixArray = new Float32Array( _modelViewMatrix.flatten() );
		_program.projectionMatrixArray = new Float32Array( camera.projectionMatrix.flatten() );

		_normalMatrix = THREE.Matrix4.makeInvert3x3( _modelViewMatrix ).transpose();
		_program.normalMatrixArray = new Float32Array( _normalMatrix.m );

		_gl.uniformMatrix4fv( _program.viewMatrix, false, _program.viewMatrixArray );
		_gl.uniformMatrix4fv( _program.modelViewMatrix, false, _program.modelViewMatrixArray );
		_gl.uniformMatrix4fv( _program.projectionMatrix, false, _program.projectionMatrixArray );
		_gl.uniformMatrix3fv( _program.normalMatrix, false, _program.normalMatrixArray );
		_gl.uniformMatrix4fv( _program.objMatrix, false, new Float32Array( object.matrix.flatten() ) );

	};


	this.setBlending = function( blending ) {

		switch ( blending ) {

			case THREE.AdditiveBlending:

				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ONE, _gl.ONE );

				break;

			case THREE.SubtractiveBlending:

				//_gl.blendEquation( _gl.FUNC_SUBTRACT );
				_gl.blendFunc( _gl.DST_COLOR, _gl.ZERO );

				break;

			default:

				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );

				break;
		}

	};

	this.setFaceCulling = function( cullFace, frontFace ) {

		if ( cullFace ) {

			if ( !frontFace || frontFace == "ccw" ) {

				_gl.frontFace( _gl.CCW );

			} else {

				_gl.frontFace( _gl.CW );
			}

			if( cullFace == "back" ) {

				_gl.cullFace( _gl.BACK );

			} else if( cullFace == "front" ) {

				_gl.cullFace( _gl.FRONT );

			} else {

				_gl.cullFace( _gl.FRONT_AND_BACK );
			}

			_gl.enable( _gl.CULL_FACE );

		} else {

			_gl.disable( _gl.CULL_FACE );
		}

	};

	function initGL() {

		try {

			_gl = _canvas.getContext( 'experimental-webgl', { antialias: true} );

		} catch(e) { }

		if (!_gl) {

			alert("WebGL not supported");
			throw "cannot create webgl context";

		}

		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL );

		_gl.frontFace( _gl.CCW );
		_gl.cullFace( _gl.BACK );
		_gl.enable( _gl.CULL_FACE );

		_gl.enable( _gl.BLEND );
		//_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );
		//_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE ); // cool!
		_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );
		_gl.clearColor( 0, 0, 0, 0 );

	};

	function generateFragmentShader( maxDirLights, maxPointLights ) {

		var chunks = [

			"#ifdef GL_ES",
			"precision highp float;",
			"#endif",

			maxDirLights   ? "#define MAX_DIR_LIGHTS " + maxDirLights     : "",
			maxPointLights ? "#define MAX_POINT_LIGHTS " + maxPointLights : "",

			"uniform int material;", // 0 - Basic, 1 - Lambert, 2 - Phong, 3 - Depth, 4 - Normal, 5 - Cube

			"uniform bool enableMap;",
			"uniform bool enableCubeMap;",
			"uniform bool mixEnvMap;",

			"uniform samplerCube tCube;",
			"uniform float mReflectivity;",

			"uniform sampler2D tMap;",
			"uniform vec4 mColor;",
			"uniform float mOpacity;",

			"uniform vec4 mAmbient;",
			"uniform vec4 mSpecular;",
			"uniform float mShininess;",

			"uniform float m2Near;",
			"uniform float mFarPlusNear;",
			"uniform float mFarMinusNear;",

			"uniform int pointLightNumber;",
			"uniform int directionalLightNumber;",

			maxDirLights ? "uniform mat4 viewMatrix;" : "",
			maxDirLights ? "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];" : "",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vLightWeighting;",

			maxPointLights ? "varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];"     : "",

			"varying vec3 vViewPosition;",

			"varying vec3 vReflect;",

			"uniform vec3 cameraPosition;",

			"void main() {",

				"vec4 mapColor = vec4( 1.0, 1.0, 1.0, 1.0 );",
				"vec4 cubeColor = vec4( 1.0, 1.0, 1.0, 1.0 );",

				// diffuse map

				"if ( enableMap ) {",

					"mapColor = texture2D( tMap, vUv );",

				"}",

				// cube map

				"if ( enableCubeMap ) {",

					"cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",

				"}",

				// Cube

				"if ( material == 5 ) { ",

					"vec3 wPos = cameraPosition - vViewPosition;",
					"gl_FragColor = textureCube( tCube, vec3( -wPos.x, wPos.yz ) );",

				// Normals

				"} else if ( material == 4 ) { ",

					"gl_FragColor = vec4( 0.5*normalize( vNormal ) + vec3(0.5, 0.5, 0.5), mOpacity );",

				// Depth

				"} else if ( material == 3 ) { ",

					// this breaks shader validation in Chrome 9.0.576.0 dev
					// and also latest continuous build Chromium 9.0.583.0 (66089)
					// (curiously it works in Chrome 9.0.576.0 canary build and Firefox 4b7)
					//"float w = 1.0 - ( m2Near / ( mFarPlusNear - gl_FragCoord.z * mFarMinusNear ) );",
					"float w = 0.5;",

					"gl_FragColor = vec4( w, w, w, mOpacity );",

				// Blinn-Phong
				// based on o3d example

				"} else if ( material == 2 ) { ",

					"vec3 normal = normalize( vNormal );",
					"vec3 viewPosition = normalize( vViewPosition );",

					// point lights

					maxPointLights ? "vec4 pointDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",
					maxPointLights ? "vec4 pointSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",

					maxPointLights ? "for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {" : "",

					maxPointLights ? 	"vec3 pointVector = normalize( vPointLightVector[ i ] );" : "",
					maxPointLights ? 	"vec3 pointHalfVector = normalize( vPointLightVector[ i ] + vViewPosition );" : "",

					maxPointLights ? 	"float pointDotNormalHalf = dot( normal, pointHalfVector );" : "",
					maxPointLights ? 	"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );" : "",

					// Ternary conditional is from the original o3d shader. Here it produces abrupt dark cutoff artefacts.
					// Using just pow works ok in Chrome, but makes different artefact in Firefox 4.
					// Zeroing on negative pointDotNormalHalf seems to work in both.

					//"float specularCompPoint = dot( normal, pointVector ) < 0.0 || pointDotNormalHalf < 0.0 ? 0.0 : pow( pointDotNormalHalf, mShininess );",
					//"float specularCompPoint = pow( pointDotNormalHalf, mShininess );",
					//"float pointSpecularWeight = pointDotNormalHalf < 0.0 ? 0.0 : pow( pointDotNormalHalf, mShininess );",

					// Ternary conditional inside for loop breaks Chrome shader linking.
					// Must do it with if.

					maxPointLights ? 	"float pointSpecularWeight = 0.0;" : "",
					maxPointLights ? 	"if ( pointDotNormalHalf >= 0.0 )" : "",
					maxPointLights ? 		"pointSpecularWeight = pow( pointDotNormalHalf, mShininess );" : "",

					maxPointLights ? 	"pointDiffuse  += mColor * pointDiffuseWeight;" : "",
					maxPointLights ? 	"pointSpecular += mSpecular * pointSpecularWeight;" : "",

					maxPointLights ? "}" : "",

					// directional lights

					maxDirLights ? "vec4 dirDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",
					maxDirLights ? "vec4 dirSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",

					maxDirLights ? "for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {" : "",

					maxDirLights ?		"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );" : "",

					maxDirLights ? 		"vec3 dirVector = normalize( lDirection.xyz );" : "",
					maxDirLights ? 		"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );" : "",

					maxDirLights ? 		"float dirDotNormalHalf = dot( normal, dirHalfVector );" : "",

					maxDirLights ? 		"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );" : "",

					maxDirLights ? 		"float dirSpecularWeight = 0.0;" : "",
					maxDirLights ? 		"if ( dirDotNormalHalf >= 0.0 )" : "",
					maxDirLights ? 			"dirSpecularWeight = pow( dirDotNormalHalf, mShininess );" : "",

					maxDirLights ? 		"dirDiffuse  += mColor * dirDiffuseWeight;" : "",
					maxDirLights ? 		"dirSpecular += mSpecular * dirSpecularWeight;" : "",

					maxDirLights ? "}" : "",

					// all lights contribution summation

					"vec4 totalLight = mAmbient;",
					maxDirLights   ? "totalLight += dirDiffuse + dirSpecular;" : "",
					maxPointLights ? "totalLight += pointDiffuse + pointSpecular;" : "",

					// looks nicer with weighting

					"if ( mixEnvMap ) {",

						"gl_FragColor = vec4( mix( mapColor.rgb * totalLight.xyz * vLightWeighting, cubeColor.rgb, mReflectivity ), mapColor.a );",

					"} else {",

						"gl_FragColor = vec4( mapColor.rgb * cubeColor.rgb * totalLight.xyz * vLightWeighting, mapColor.a );",

					"}",

				// Lambert: diffuse lighting

				"} else if ( material == 1 ) {",

				"if ( mixEnvMap ) {",

						"gl_FragColor = vec4( mix( mColor.rgb * mapColor.rgb * vLightWeighting, cubeColor.rgb, mReflectivity ), mColor.a * mapColor.a );",

					"} else {",

						"gl_FragColor = vec4( mColor.rgb * mapColor.rgb * cubeColor.rgb * vLightWeighting, mColor.a * mapColor.a );",

					"}",

				// Basic: unlit color / texture

				"} else {",

					"if ( mixEnvMap ) {",

						"gl_FragColor = mix( mColor * mapColor, cubeColor, mReflectivity );",

					"} else {",

						"gl_FragColor = mColor * mapColor * cubeColor;",

					"}",

				"}",

			"}" ];

		return chunks.join("\n");

	};

	function generateVertexShader( maxDirLights, maxPointLights ) {

		var chunks = [

			maxDirLights   ? "#define MAX_DIR_LIGHTS " + maxDirLights     : "",
			maxPointLights ? "#define MAX_POINT_LIGHTS " + maxPointLights : "",

			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",

			"uniform vec3 cameraPosition;",

			"uniform bool enableLighting;",
			"uniform bool useRefract;",

			"uniform int pointLightNumber;",
			"uniform int directionalLightNumber;",

			"uniform vec3 ambientLightColor;",

			maxDirLights ? "uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];"     : "",
			maxDirLights ? "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];" : "",

			maxPointLights ? "uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];"    : "",
			maxPointLights ? "uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];" : "",

			"uniform mat4 objMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat3 normalMatrix;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vLightWeighting;",

			maxPointLights ? "varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];"     : "",

			"varying vec3 vViewPosition;",

			"varying vec3 vReflect;",
			"uniform float mRefractionRatio;",

			"void main(void) {",

				// world space

				"vec4 mPosition = objMatrix * vec4( position, 1.0 );",
				"vViewPosition = cameraPosition - mPosition.xyz;",

				// this doesn't work on Mac
				//"vec3 nWorld = mat3(objMatrix) * normal;",
				"vec3 nWorld = mat3( objMatrix[0].xyz, objMatrix[1].xyz, objMatrix[2].xyz ) * normal;",

				// eye space

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec3 transformedNormal = normalize( normalMatrix * normal );",

				"if ( !enableLighting ) {",

					"vLightWeighting = vec3( 1.0, 1.0, 1.0 );",

				"} else {",

					"vLightWeighting = ambientLightColor;",

					// directional lights

					maxDirLights ? "for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {" : "",
					maxDirLights ?		"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );" : "",
					maxDirLights ?		"float directionalLightWeighting = max( dot( transformedNormal, normalize(lDirection.xyz ) ), 0.0 );" : "",
					maxDirLights ?		"vLightWeighting += directionalLightColor[ i ] * directionalLightWeighting;" : "",
					maxDirLights ? "}" : "",

					// point lights

					maxPointLights ? "for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {" : "",
					maxPointLights ? 	"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );" : "",
					maxPointLights ? 	"vPointLightVector[ i ] = normalize( lPosition.xyz - mvPosition.xyz );" : "",
					maxPointLights ? 	"float pointLightWeighting = max( dot( transformedNormal, vPointLightVector[ i ] ), 0.0 );" : "",
					maxPointLights ? 	"vLightWeighting += pointLightColor[ i ] * pointLightWeighting;" : "",
					maxPointLights ? "}" : "",

				"}",

				"vNormal = transformedNormal;",
				"vUv = uv;",

				"if ( useRefract ) {",

					"vReflect = refract( normalize(mPosition.xyz - cameraPosition), normalize(nWorld.xyz), mRefractionRatio );",

				"} else {",

					"vReflect = reflect( normalize(mPosition.xyz - cameraPosition), normalize(nWorld.xyz) );",

				"}",

				"gl_Position = projectionMatrix * mvPosition;",

			"}" ];

		return chunks.join("\n");

	};

	function initProgram( maxDirLights, maxPointLights ) {

		_program = _gl.createProgram();

		//log ( generateVertexShader( maxDirLights, maxPointLights ) );
		//log ( generateFragmentShader( maxDirLights, maxPointLights ) );

		_gl.attachShader( _program, getShader( "fragment", generateFragmentShader( maxDirLights, maxPointLights ) ) );
		_gl.attachShader( _program, getShader( "vertex",   generateVertexShader( maxDirLights, maxPointLights ) ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

			alert( "VALIDATE_STATUS: " + _gl.getProgramParameter( _program, _gl.VALIDATE_STATUS ) );
			alert( _gl.getError() );
			
		}


		_gl.useProgram( _program );

		// matrices

		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.modelViewMatrix = _gl.getUniformLocation( _program, "modelViewMatrix" );
		_program.projectionMatrix = _gl.getUniformLocation( _program, "projectionMatrix" );
		_program.normalMatrix = _gl.getUniformLocation( _program, "normalMatrix" );
		_program.objMatrix = _gl.getUniformLocation( _program, "objMatrix" );

		_program.cameraPosition = _gl.getUniformLocation( _program, 'cameraPosition' );

		// lights

		_program.enableLighting = _gl.getUniformLocation( _program, 'enableLighting' );

		_program.ambientLightColor = _gl.getUniformLocation( _program, 'ambientLightColor' );

		if ( maxDirLights ) {

			_program.directionalLightNumber = _gl.getUniformLocation( _program, 'directionalLightNumber' );
			_program.directionalLightColor = _gl.getUniformLocation( _program, 'directionalLightColor' );
			_program.directionalLightDirection = _gl.getUniformLocation( _program, 'directionalLightDirection' );

		}

		if ( maxPointLights ) {

			_program.pointLightNumber = _gl.getUniformLocation( _program, 'pointLightNumber' );
			_program.pointLightColor = _gl.getUniformLocation( _program, 'pointLightColor' );
			_program.pointLightPosition = _gl.getUniformLocation( _program, 'pointLightPosition' );

		}

		// material

		_program.material = _gl.getUniformLocation( _program, 'material' );

		// material properties (Basic / Lambert / Blinn-Phong shader)

		_program.mColor = _gl.getUniformLocation( _program, 'mColor' );
		_program.mOpacity = _gl.getUniformLocation( _program, 'mOpacity' );
		_program.mReflectivity = _gl.getUniformLocation( _program, 'mReflectivity' );

		// material properties (Blinn-Phong shader)

		_program.mAmbient = _gl.getUniformLocation( _program, 'mAmbient' );
		_program.mSpecular = _gl.getUniformLocation( _program, 'mSpecular' );
		_program.mShininess = _gl.getUniformLocation( _program, 'mShininess' );

		// texture (diffuse map)

		_program.enableMap = _gl.getUniformLocation( _program, "enableMap" );
		_gl.uniform1i( _program.enableMap, 0 );

		_program.tMap = _gl.getUniformLocation( _program, "tMap" );
		_gl.uniform1i( _program.tMap, 0 );

		// cube texture

		_program.enableCubeMap = _gl.getUniformLocation( _program, "enableCubeMap" );
		_gl.uniform1i( _program.enableCubeMap, 0 );

		_program.tCube = _gl.getUniformLocation( _program, "tCube" );
		_gl.uniform1i( _program.tCube, 1 ); // it's important to use non-zero texture unit, otherwise it doesn't work

		_program.mixEnvMap = _gl.getUniformLocation( _program, "mixEnvMap" );
		_gl.uniform1i( _program.mixEnvMap, 0 );

		// refraction

		_program.mRefractionRatio = _gl.getUniformLocation( _program, 'mRefractionRatio' );

		_program.useRefract = _gl.getUniformLocation( _program, "useRefract" );
		_gl.uniform1i( _program.useRefract, 0 );

		// material properties (Depth)

		_program.m2Near = _gl.getUniformLocation( _program, 'm2Near' );
		_program.mFarPlusNear = _gl.getUniformLocation( _program, 'mFarPlusNear' );
		_program.mFarMinusNear = _gl.getUniformLocation( _program, 'mFarMinusNear' );

		// vertex arrays

		_program.position = _gl.getAttribLocation( _program, "position" );
		_gl.enableVertexAttribArray( _program.position );

		_program.normal = _gl.getAttribLocation( _program, "normal" );
		_gl.enableVertexAttribArray( _program.normal );

		_program.uv = _gl.getAttribLocation( _program, "uv" );
		_gl.enableVertexAttribArray( _program.uv );


		_program.viewMatrixArray = new Float32Array(16);
		_program.modelViewMatrixArray = new Float32Array(16);
		_program.projectionMatrixArray = new Float32Array(16);

	};

	function getShader( type, string ) {

		var shader;

		if ( type == "fragment" ) {

			shader = _gl.createShader( _gl.FRAGMENT_SHADER );

		} else if ( type == "vertex" ) {

			shader = _gl.createShader( _gl.VERTEX_SHADER );

		}

		_gl.shaderSource( shader, string );
		_gl.compileShader( shader );

		if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {

			alert( _gl.getShaderInfoLog( shader ) );
			return null;

		}

		return shader;

	};

	function paramThreeToGL( p ) {
	
		switch ( p ) {
		
		case THREE.Repeat: 	  	   return _gl.REPEAT; break;
		case THREE.ClampToEdge:    return _gl.CLAMP_TO_EDGE; break;
		case THREE.MirroredRepeat: return _gl.MIRRORED_REPEAT; break;
		
		}
		
		return 0;
		
	};

	function materialNeedsSmoothNormals( material ) {

		return material && material.shading != undefined && material.shading == THREE.SmoothShading;

	};
	
	function bufferNeedsSmoothNormals ( materialFaceGroup, object ) {
		
		var m, ml, i, l, needsSmoothNormals = false;
		
		for ( m = 0, ml = object.material.length; m < ml; m++ ) {

			meshMaterial = object.material[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = materialFaceGroup.material.length; i < l; i++ ) {

					if ( materialNeedsSmoothNormals( materialFaceGroup.material[ i ] ) ) {

						needsSmoothNormals = true;
						break;

					}

				}

			} else {

				if ( materialNeedsSmoothNormals( meshMaterial ) ) {

					needsSmoothNormals = true;
					break;

				}

			}

			if ( needsSmoothNormals ) break;

		}
		
		return needsSmoothNormals;
		
	};
	
	function allocateLights( scene, maxLights ) {

		if ( scene ) {

			var l, ll, light, dirLights = pointLights = maxDirLights = maxPointLights = 0;

			for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

				light = scene.lights[ l ];

				if ( light instanceof THREE.DirectionalLight ) dirLights++;
				if ( light instanceof THREE.PointLight ) pointLights++;

			}

			if ( ( pointLights + dirLights ) <= maxLights ) {

				maxDirLights = dirLights;
				maxPointLights = pointLights;

			} else {

				maxDirLights = Math.ceil( maxLights * dirLights / ( pointLights + dirLights ) );
				maxPointLights = maxLights - maxDirLights;

			}

			return { 'directional' : maxDirLights, 'point' : maxPointLights };

		}

		return { 'directional' : 1, 'point' : maxLights - 1 };

	};
	
	/* DEBUG
	function getGLParams() {

		var params  = {

			'MAX_VARYING_VECTORS': _gl.getParameter( _gl.MAX_VARYING_VECTORS ),
			'MAX_VERTEX_ATTRIBS': _gl.getParameter( _gl.MAX_VERTEX_ATTRIBS ),

			'MAX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_TEXTURE_IMAGE_UNITS ),
			'MAX_VERTEX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ),
			'MAX_COMBINED_TEXTURE_IMAGE_UNITS' : _gl.getParameter( _gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS ),

			'MAX_VERTEX_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_VERTEX_UNIFORM_VECTORS ),
			'MAX_FRAGMENT_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_FRAGMENT_UNIFORM_VECTORS )
		}

		return params;
	};

	function dumpObject( obj ) {

		var p, str = "";
		for ( p in obj ) {

			str += p + ": " + obj[p] + "\n";

		}

		return str;
	}
	*/

};
