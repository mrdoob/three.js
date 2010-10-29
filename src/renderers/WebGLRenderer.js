/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer = function () {

	var _canvas = document.createElement( 'canvas' ), _gl, _program,
	_modelViewMatrix = new THREE.Matrix4(), _normalMatrix,
	COLORFILL = 0, COLORSTROKE = 1, BITMAP = 2, PHONG = 3; // material constants used in shader

	this.domElement = _canvas;
	this.autoClear = true;

	initGL();
	initProgram();

	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;
		_gl.viewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

	};

	this.setupLights = function ( scene ) {

	var l, ll, lightColor, lightPosition, lightIntensity, light;

		_gl.uniform1i( _program.enableLighting, scene.lights.length );

		for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.AmbientLight ) {

				lightColor = light.color;
				_gl.uniform3f( _program.ambientLightColor, lightColor.r, lightColor.g, lightColor.b );

			} else if ( light instanceof THREE.DirectionalLight ) {

				lightColor = light.color;
				lightPosition = light.position;
				lightIntensity = light.intensity;
				_gl.uniform3f( _program.directionalLightDirection, lightPosition.x, lightPosition.y, lightPosition.z );
				_gl.uniform3f( _program.directionalLightColor, lightColor.r * lightIntensity, lightColor.g * lightIntensity, lightColor.b * lightIntensity );

			} else if( light instanceof THREE.PointLight ) {

				lightColor = light.color;
				lightPosition = light.position;
				lightIntensity = light.intensity;
				_gl.uniform3f( _program.pointLightPosition, lightPosition.x, lightPosition.y, lightPosition.z );
				_gl.uniform3f( _program.pointLightColor, lightColor.r * lightIntensity, lightColor.g * lightIntensity, lightColor.b * lightIntensity );

			}

		}

	};

	this.createBuffers = function ( object, mf ) {

		var f, fl, fi, face, vertexNormals, normal, uv, v1, v2, v3, v4,

		materialFaceGroup = object.materialFaceGroup[ mf ],

		faceArray = [],
		lineArray = [],

		vertexArray = [],
		normalArray = [],
		uvArray = [],

		vertexIndex = 0;

		for ( f = 0, fl = materialFaceGroup.faces.length; f < fl; f++ ) {

			fi = materialFaceGroup.faces[f];

			face = object.geometry.faces[ fi ];
			vertexNormals = face.vertexNormals;
			normal = face.normal;
			uv = object.geometry.uvs[ fi ];

			if ( face instanceof THREE.Face3 ) {

				v1 = object.geometry.vertices[ face.a ].position;
				v2 = object.geometry.vertices[ face.b ].position;
				v3 = object.geometry.vertices[ face.c ].position;

				vertexArray.push( v1.x, v1.y, v1.z );
				vertexArray.push( v2.x, v2.y, v2.z );
				vertexArray.push( v3.x, v3.y, v3.z );

				if ( vertexNormals.length == 3 ) {

					normalArray.push( vertexNormals[0].x, vertexNormals[0].y, vertexNormals[0].z );
					normalArray.push( vertexNormals[1].x, vertexNormals[1].y, vertexNormals[1].z );
					normalArray.push( vertexNormals[2].x, vertexNormals[2].y, vertexNormals[2].z );

				} else {

					normalArray.push( normal.x, normal.y, normal.z );
					normalArray.push( normal.x, normal.y, normal.z );
					normalArray.push( normal.x, normal.y, normal.z );

				}

				if ( uv ) {

					uvArray.push( uv[0].u, uv[0].v );
					uvArray.push( uv[1].u, uv[1].v );
					uvArray.push( uv[2].u, uv[2].v );

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

				if ( vertexNormals.length == 4 ) {

					normalArray.push( vertexNormals[0].x, vertexNormals[0].y, vertexNormals[0].z );
					normalArray.push( vertexNormals[1].x, vertexNormals[1].y, vertexNormals[1].z );
					normalArray.push( vertexNormals[2].x, vertexNormals[2].y, vertexNormals[2].z );
					normalArray.push( vertexNormals[3].x, vertexNormals[3].y, vertexNormals[3].z );

				} else {

					normalArray.push( normal.x, normal.y, normal.z );
					normalArray.push( normal.x, normal.y, normal.z );
					normalArray.push( normal.x, normal.y, normal.z );
					normalArray.push( normal.x, normal.y, normal.z );

				}

				if ( uv ) {

					uvArray.push( uv[0].u, uv[0].v );
					uvArray.push( uv[1].u, uv[1].v );
					uvArray.push( uv[2].u, uv[2].v );
					uvArray.push( uv[3].u, uv[3].v );

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

		if ( material instanceof THREE.MeshPhongMaterial ) {

			mAmbient  = material.ambient;
			mDiffuse  = material.diffuse;
			mSpecular = material.specular;

			_gl.uniform4f( _program.mAmbient,  mAmbient.r,  mAmbient.g,  mAmbient.b,  material.opacity );
			_gl.uniform4f( _program.mDiffuse,  mDiffuse.r,  mDiffuse.g,  mDiffuse.b,  material.opacity );
			_gl.uniform4f( _program.mSpecular, mSpecular.r, mSpecular.g, mSpecular.b, material.opacity );

			_gl.uniform1f( _program.mShininess, material.shininess );
			_gl.uniform1i( _program.material, PHONG );

		} else if ( material instanceof THREE.MeshColorFillMaterial ) {

			color = material.color;
			_gl.uniform4f( _program.mColor,  color.r * color.a, color.g * color.a, color.b * color.a, color.a );
			_gl.uniform1i( _program.material, COLORFILL );

		} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

			lineWidth = material.lineWidth;

			color = material.color;
			_gl.uniform4f( _program.mColor,  color.r * color.a, color.g * color.a, color.b * color.a, color.a );
			_gl.uniform1i( _program.material, COLORSTROKE );

		} else if ( material instanceof THREE.MeshBitmapMaterial ) {

			if ( !material.__webGLTexture && material.loaded ) {

				material.__webGLTexture = _gl.createTexture();
				_gl.bindTexture( _gl.TEXTURE_2D, material.__webGLTexture );
				_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, material.bitmap ) ;
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
				//_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST );
				_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );
				_gl.generateMipmap( _gl.TEXTURE_2D );
				_gl.bindTexture( _gl.TEXTURE_2D, null );

			}

			_gl.activeTexture( _gl.TEXTURE0 );
			_gl.bindTexture( _gl.TEXTURE_2D, material.__webGLTexture );
			_gl.uniform1i( _program.tDiffuse,  0 );

			_gl.uniform1i( _program.material, BITMAP );

		}

		// vertices
        
		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLVertexBuffer );
		_gl.vertexAttribPointer( _program.position, 3, _gl.FLOAT, false, 0, 0 );

		// normals
        
		_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLNormalBuffer );
		_gl.vertexAttribPointer( _program.normal, 3, _gl.FLOAT, false, 0, 0 );

		// uvs
        
		if ( material instanceof THREE.MeshBitmapMaterial ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFaceGroup.__webGLUVBuffer );

			_gl.enableVertexAttribArray( _program.uv );
			_gl.vertexAttribPointer( _program.uv, 2, _gl.FLOAT, false, 0, 0 );

		} else {

			_gl.disableVertexAttribArray( _program.uv );

		}

		// render triangles
        
		if ( material instanceof THREE.MeshBitmapMaterial || 

			material instanceof THREE.MeshColorFillMaterial ||
			material instanceof THREE.MeshPhongMaterial ) {

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLFaceBuffer );
			_gl.drawElements( _gl.TRIANGLES, materialFaceGroup.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );

		// render lines
        
		} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

			_gl.lineWidth( lineWidth );
			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLLineBuffer );
			_gl.drawElements( _gl.LINES, materialFaceGroup.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );

		}

	};

	this.renderMesh = function ( object, camera ) {

		var i, l, m, ml, mf, material, meshMaterial, materialFaceGroup;

		// create separate VBOs per material
        
		for ( mf in object.materialFaceGroup ) {

			materialFaceGroup = object.materialFaceGroup[ mf ];

			// initialise buffers on the first access
            
			if( ! materialFaceGroup.__webGLVertexBuffer ) {

				this.createBuffers( object, mf );

			}

			for ( m = 0, ml = object.material.length; m < ml; m++ ) {

				meshMaterial = object.material[ m ];

				if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

					for ( i = 0, l = materialFaceGroup.material.length; i < l; i++ ) {

						material = materialFaceGroup.material[ i ];
						this.renderBuffer( material, materialFaceGroup );

					}

				} else {

					material = meshMaterial;
					this.renderBuffer( material, materialFaceGroup );

				}

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

	this.render = function ( scene, camera ) {

		var o, ol, object;

		if ( this.autoClear ) {

			this.clear();

		}

		camera.autoUpdateMatrix && camera.updateMatrix();
		_gl.uniform3f( _program.cameraPosition, camera.position.x, camera.position.y, camera.position.z );

		this.setupLights( scene );

		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			this.setupMatrices( object, camera );

			if ( object instanceof THREE.Mesh ) {

				this.renderMesh( object, camera );

			} else if ( object instanceof THREE.Line ) {

				// TODO

				// It would be very inefficient to do lines one-by-one.

				// This will need a complete redesign from how CanvasRenderer does it.

				// Though it could be brute forced, if only used for lightweight
				// stuff (as CanvasRenderer can only handle small number of elements 
				// anyways). 

				// Heavy-duty wireframe lines are handled efficiently in mesh renderer.

			} else if ( object instanceof THREE.Particle ) {

				// TODO

				// The same as with lines, particles shouldn't be handled one-by-one.

				// Again, heavy duty particle system would require different approach,
				// like one VBO per particle system and then update attribute arrays, 
				// though the best would be to move also behavior computation
				// into the shader (ala http://spidergl.org/example.php?id=11)

			}

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

		_gl.enable( _gl.BLEND );
		//_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );
		// _gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE ); // cool!
		_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );
		_gl.clearColor( 0, 0, 0, 0 );

	}

	function initProgram() {

		_program = _gl.createProgram();

		_gl.attachShader( _program, getShader( "fragment", [

			"#ifdef GL_ES",
			"precision highp float;",
			"#endif",
        
			"uniform int material;", // 0 - ColorFill, 1 - ColorStroke, 2 - Bitmap, 3 - Phong

            "uniform sampler2D tDiffuse;",
			"uniform vec4 mColor;",

			"uniform vec4 mAmbient;",
			"uniform vec4 mDiffuse;",
			"uniform vec4 mSpecular;",
			"uniform float mShininess;",

			"varying vec3 vNormal;",
            "varying vec2 vUv;",
            
			"varying vec3 vLightWeighting;",

			"varying vec3 vPointLightVector;",
			"varying vec3 vDirectionalLightVector;",
			"varying vec3 vViewPosition;",

			"void main() {",

				// Blinn-Phong
				// based on o3d example
                
				"if ( material == 3 ) { ", 

					"vec3 normal = normalize( vNormal );",
					"vec3 viewPosition = normalize( vViewPosition );",

                    // point light
                    
					"vec3 pointVector = normalize( vPointLightVector );",
					"vec3 pointHalfVector = normalize( vPointLightVector + vViewPosition );",
                    
					"float pointDotNormalHalf = dot( normal, pointHalfVector );",

					"float pointAmbientWeight = 1.0;",
					"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",
                    
                    // Ternary conditional is from the original o3d shader. Here it produces abrupt dark cutoff artefacts.
                    // Using just pow works ok in Chrome, but makes different artefact in Firefox 4.
                    // Zeroing on negative pointDotNormalHalf seems to work in both.
                    
					//"float specularCompPoint = dot( normal, pointVector ) < 0.0 || pointDotNormalHalf < 0.0 ? 0.0 : pow( pointDotNormalHalf, mShininess );",
					//"float specularCompPoint = pow( pointDotNormalHalf, mShininess );",
					"float pointSpecularWeight = pointDotNormalHalf < 0.0 ? 0.0 : pow( pointDotNormalHalf, mShininess );",

					"vec4 pointAmbient  = mAmbient  * pointAmbientWeight;",
					"vec4 pointDiffuse  = mDiffuse  * pointDiffuseWeight;",
					"vec4 pointSpecular = mSpecular * pointSpecularWeight;",

                    // directional light
                    
					"vec3 dirVector = normalize( vDirectionalLightVector );",
					"vec3 dirHalfVector = normalize( vDirectionalLightVector + vViewPosition );",

					"float dirDotNormalHalf = dot( normal, dirHalfVector );",

					"float dirAmbientWeight = 1.0;",
					"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",                    
					"float dirSpecularWeight = dirDotNormalHalf < 0.0 ? 0.0 : pow( dirDotNormalHalf, mShininess );",

					"vec4 dirAmbient  = mAmbient  * dirAmbientWeight;",
					"vec4 dirDiffuse  = mDiffuse  * dirDiffuseWeight;",
					"vec4 dirSpecular = mSpecular * dirSpecularWeight;",

                    // light contribution summation
                    
                    "vec4 totalLight = vec4( 0.0, 0.0, 0.0, 1.0 );",
                    
					"totalLight += pointAmbient + pointDiffuse + pointSpecular;",
					"totalLight += dirAmbient + dirDiffuse + dirSpecular;",

                    // looks nicer with weighting
                    
					"gl_FragColor = vec4( totalLight.xyz * vLightWeighting, 1.0 );",                    
                    //"gl_FragColor = vec4( totalLight.xyz, 1.0 );", 

				// Bitmap: texture
                
				"} else if ( material==2 ) {", 

					"vec4 texelColor = texture2D( tDiffuse, vUv );",
					"gl_FragColor = vec4( texelColor.rgb * vLightWeighting, texelColor.a );",

				// ColorStroke: wireframe using uniform color
                
				"} else if ( material == 1 ) {", 

					"gl_FragColor = vec4( mColor.rgb * vLightWeighting, mColor.a );",

				// ColorFill: triangle using uniform color
                
				"} else {", 

					"gl_FragColor = vec4( mColor.rgb * vLightWeighting, mColor.a );",
					//"gl_FragColor = vec4( vNormal, 1.0 );",
				"}",

			"}"].join("\n") ) );

		_gl.attachShader( _program, getShader( "vertex", [
            
			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",

			"uniform vec3 cameraPosition;",

			"uniform bool enableLighting;",
            
			"uniform vec3 ambientLightColor;",
			"uniform vec3 directionalLightColor;",
			"uniform vec3 directionalLightDirection;",

			"uniform vec3 pointLightColor;",
			"uniform vec3 pointLightPosition;",

			"uniform mat4 objMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat3 normalMatrix;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",
            
			"varying vec3 vLightWeighting;",

			"varying vec3 vPointLightVector;",
			"varying vec3 vDirectionalLightVector;",
			"varying vec3 vViewPosition;",

			"void main(void) {",

                // eye space
                
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec3 transformedNormal = normalize( normalMatrix * normal );",

				"vec4 lPosition = viewMatrix * vec4( pointLightPosition, 1.0 );",
				"vec4 lDirection = viewMatrix * vec4( directionalLightDirection, 0.0 );",

				"vPointLightVector = normalize( lPosition.xyz - mvPosition.xyz );",
				"vDirectionalLightVector = normalize( lDirection.xyz );",

                // world space
                
                "vec4 mPosition = objMatrix * vec4( position, 1.0 );",
				"vViewPosition = cameraPosition - mPosition.xyz;",

				"if( !enableLighting ) {",

					"vLightWeighting = vec3( 1.0, 1.0, 1.0 );",

				"} else {",

					"float directionalLightWeighting = max( dot( transformedNormal, normalize(lDirection.xyz ) ), 0.0 );",
					"float pointLightWeighting = max( dot( transformedNormal, vPointLightVector ), 0.0 );",
					
                    "vLightWeighting = ambientLightColor + directionalLightColor * directionalLightWeighting + pointLightColor * pointLightWeighting;",

				"}",

				"vNormal = transformedNormal;",
				"vUv = uv;",

				"gl_Position = projectionMatrix * mvPosition;",

			"}"].join("\n") ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

		}

		_gl.useProgram( _program );

        // matrices
        
		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.modelViewMatrix = _gl.getUniformLocation( _program, "modelViewMatrix" );
		_program.projectionMatrix = _gl.getUniformLocation( _program, "projectionMatrix" );
		_program.normalMatrix = _gl.getUniformLocation( _program, "normalMatrix" );
		_program.objMatrix = _gl.getUniformLocation( _program, "objMatrix" );

        _program.cameraPosition = _gl.getUniformLocation(_program, 'cameraPosition');

        // lights
        
		_program.enableLighting = _gl.getUniformLocation(_program, 'enableLighting');
        
		_program.ambientLightColor = _gl.getUniformLocation(_program, 'ambientLightColor');
		_program.directionalLightColor = _gl.getUniformLocation(_program, 'directionalLightColor');
		_program.directionalLightDirection = _gl.getUniformLocation(_program, 'directionalLightDirection');

		_program.pointLightColor = _gl.getUniformLocation(_program, 'pointLightColor');
		_program.pointLightPosition = _gl.getUniformLocation(_program, 'pointLightPosition');

        // material
        
		_program.material = _gl.getUniformLocation(_program, 'material');
        
        // material properties (ColorFill / ColorStroke shader)
        
		_program.mColor = _gl.getUniformLocation(_program, 'mColor');

        // material properties (Blinn-Phong shader)
        
		_program.mAmbient = _gl.getUniformLocation(_program, 'mAmbient');
		_program.mDiffuse = _gl.getUniformLocation(_program, 'mDiffuse');
		_program.mSpecular = _gl.getUniformLocation(_program, 'mSpecular');
		_program.mShininess = _gl.getUniformLocation(_program, 'mShininess');

        // texture (Bitmap shader)
        
		_program.tDiffuse = _gl.getUniformLocation( _program, "tDiffuse");
		_gl.uniform1i( _program.tDiffuse,  0 );

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

	}

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
	}

};
