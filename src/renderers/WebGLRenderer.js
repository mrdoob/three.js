/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer = function () {

	var _canvas = document.createElement( 'canvas' ), _gl, _program,
	viewMatrix = new THREE.Matrix4(), normalMatrix;

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

	this.render = function ( scene, camera ) {

		var face, faceColor, object, material, normal, lightColor, lightPosition, light,
		vertexArray, faceArray, colorArray, normalArray, vertexIndex,
		o, ol, f, fl, m, ml, i, v1, v2, v3, v4,
		l, ll,
        uv, uvArray;

		if ( this.autoClear ) {

			this.clear();

		}

		//lighting
		_gl.uniform1i( _program.enableLighting, scene.lights.length );

		for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.AmbientLight ) {

				lightColor = light.color;
				_gl.uniform3f( _program.ambientColor, lightColor.r, lightColor.g, lightColor.b );

			} else if( light instanceof THREE.DirectionalLight ) {

				lightColor = light.color;
				lightPosition = light.position;
				_gl.uniform3f( _program.lightingDirection, lightPosition.x, lightPosition.y, lightPosition.z );
				_gl.uniform3f( _program.directionalColor, lightColor.r, lightColor.g, lightColor.b );

			}

		}

		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

            var materialFace, fi;

			if ( object instanceof THREE.Mesh ) {

				viewMatrix.multiply( camera.matrix, object.matrix );

				_program.viewMatrixArray = new Float32Array( viewMatrix.flatten() );
				_program.projectionMatrixArray = new Float32Array( camera.projectionMatrix.flatten() );

				normalMatrix =  THREE.Matrix4.makeInvert(viewMatrix).transpose();
				_program.normalMatrixArray = new Float32Array( normalMatrix.flatten() );

				_gl.uniformMatrix4fv( _program.viewMatrix, false, _program.viewMatrixArray );
				_gl.uniformMatrix4fv( _program.projectionMatrix, false, _program.projectionMatrixArray );
				_gl.uniformMatrix4fv( _program.normalMatrix, false, _program.normalMatrixArray );

                // create separate VBOs per material
                for (var m in object.materialFaces ) {

                    materialFace = object.materialFaces[m];
                    material = object.material[m];
                    if( !material ) continue;
                    //log(material);

                    if( !materialFace.__webGLVertexBuffer ) {

                        vertexArray = [];
                        faceArray = [];
                        colorArray = [];
                        normalArray = [];
                        uvArray = [];
                        vertexIndex = 0;

                        //log( "object.geometry.uvs: " + object.geometry.uvs.length + " " + object.geometry.uvs);

                        for ( f = 0, fl = materialFace.faces.length; f < fl; f++ ) {

                            fi = materialFace.faces[f];

                            face = object.geometry.faces[ fi ];
                            faceColor = face.color;
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
                                    
                                }
                                else {
                                    
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    
                                }

                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );

                                if ( uv ) {
                                    
                                    uvArray.push( uv[0].u, uv[0].v );
                                    uvArray.push( uv[1].u, uv[1].v );
                                    uvArray.push( uv[2].u, uv[2].v );
                                    
                                }

                                faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );

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
                                    
                                }
                                else {
                                    
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    normalArray.push( normal.x, normal.y, normal.z );
                                    
                                }

                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );
                                colorArray.push( faceColor.r, faceColor.g, faceColor.b, faceColor.a );

                                if ( uv ) {
                                    
                                    uvArray.push( uv[0].u, uv[0].v );
                                    uvArray.push( uv[1].u, uv[1].v );
                                    uvArray.push( uv[2].u, uv[2].v );
                                    uvArray.push( uv[3].u, uv[3].v );
                                    
                                }
                                
                                faceArray.push( vertexIndex, vertexIndex + 1, vertexIndex + 2 );
                                faceArray.push( vertexIndex, vertexIndex + 2, vertexIndex + 3 );

                                vertexIndex += 4;
                            }
                        }

                        if ( !vertexArray.length ) {

                            continue;

                        }

                        /*
                        log( "vertices: " + vertexArray.length/3 );
                        log( "faces: " + faceArray.length/3 );
                        log( "normals: " + normalArray.length/3 );
                        log( "colors: " + colorArray.length/4 );
                        log( "uvs: " + uvArray.length/2 );
                        */
                        

                        materialFace.__webGLVertexBuffer = _gl.createBuffer();
                        _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLVertexBuffer );
                        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( vertexArray ), _gl.STATIC_DRAW );

                        materialFace.__webGLNormalBuffer = _gl.createBuffer();
                        _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLNormalBuffer );
                        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( normalArray ), _gl.STATIC_DRAW );

                        if( material instanceof THREE.MeshFaceColorFillMaterial || material instanceof THREE.MeshBitmapUVMappingMaterial ) {
                            materialFace.__webGLColorBuffer = _gl.createBuffer();
                            _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLColorBuffer );
                            _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( colorArray ), _gl.STATIC_DRAW );
                        }

                        materialFace.__webGLUVBuffer = _gl.createBuffer();
                        _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLUVBuffer );
                        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( uvArray ), _gl.STATIC_DRAW );

                        materialFace.__webGLFaceBuffer = _gl.createBuffer();
                        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFace.__webGLFaceBuffer );
                        _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( faceArray ), _gl.STATIC_DRAW );

                        materialFace.__webGLFaceCount = faceArray.length;

                    }
                    
					if ( material instanceof THREE.MeshColorFillMaterial ) {

						if ( !materialFace.__webGLColorBuffer ) {

							colorArray = [];

							for ( i = 0; i < materialFace.__webGLFaceCount; i ++ ) {

								colorArray.push( material.color.r, material.color.g, material.color.b, material.color.a );

							}

							materialFace.__webGLColorBuffer = _gl.createBuffer();
							_gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLColorBuffer );
							_gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( colorArray ), _gl.STATIC_DRAW );

						}
                            
                        _gl.uniform1i( _program.enableTexture, 0 );

                    } else if ( material instanceof THREE.MeshFaceColorFillMaterial ) {

                        _gl.uniform1i( _program.enableTexture, 0 );

                    } else if ( material instanceof THREE.MeshBitmapUVMappingMaterial ) {
                        
                        if ( !material.__webGLTexture && material.loaded ) {
                            
                            //log(material.bitmap);

                            material.__webGLTexture = _gl.createTexture();
                            _gl.bindTexture( _gl.TEXTURE_2D, material.__webGLTexture );
                            _gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, material.bitmap ) ;
                            _gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
                            //_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST );
                            _gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );
                            _gl.generateMipmap( _gl.TEXTURE_2D );
                            _gl.bindTexture( _gl.TEXTURE_2D, null );
                            
                        }

                        _gl.uniform1i( _program.enableTexture, 1 );
                        _gl.activeTexture( _gl.TEXTURE0 );
                        _gl.bindTexture( _gl.TEXTURE_2D, material.__webGLTexture );
                        _gl.uniform1i( _program.diffuse,  0 );

                    }

                    // vertices
                    _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLVertexBuffer );
                    _gl.vertexAttribPointer( _program.position, 3, _gl.FLOAT, false, 0, 0 );

                    // normals
                    _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLNormalBuffer );
                    _gl.vertexAttribPointer( _program.normal, 3, _gl.FLOAT, false, 0, 0 );

                    // uvs
                    _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLUVBuffer );
                    if ( object.geometry.uvs.length ) {
                        
                        _gl.enableVertexAttribArray( _program.uv );
                        _gl.vertexAttribPointer( _program.uv, 2, _gl.FLOAT, false, 0, 0 );
                        
                    }
                    else {
                        
                        _gl.disableVertexAttribArray( _program.uv );
                        
                    }

                    // colors
                    _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLColorBuffer );
                    _gl.enableVertexAttribArray( _program.color );
                    _gl.vertexAttribPointer( _program.color, 4, _gl.FLOAT, false, 0, 0 );

                    // render faces
                    _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFace.__webGLFaceBuffer );
                    _gl.drawElements( _gl.TRIANGLES, materialFace.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );
                    
                }
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

            "uniform bool enableTexture;",
            "uniform sampler2D diffuse;",
			"varying vec2 vuv;",

			"varying vec4 vcolor;",
			"varying vec3 lightWeighting;",

			"void main(){",
                "if(enableTexture) {",
                    "vec4 texelColor = texture2D(diffuse, vuv);",
                    "gl_FragColor = vec4(texelColor.rgb * lightWeighting, texelColor.a);",
                "} else {",
                    "gl_FragColor = vec4(vcolor.rgb * lightWeighting, vcolor.a);",
                "}",
			"}"
			].join("\n") ) );

		_gl.attachShader( _program, getShader( "vertex", [
			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec4 color;",
            "attribute vec2 uv;",

			"uniform bool enableLighting;",
			"uniform vec3 ambientColor;",
			"uniform vec3 directionalColor;",
			"uniform vec3 lightingDirection;",

			"uniform mat4 viewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 normalMatrix;",
			"varying vec4 vcolor;",
			"varying vec3 lightWeighting;",
            "varying vec2 vuv;",

			"void main(void) {",

						"if(!enableLighting) {",
							"lightWeighting = vec3(1.0, 1.0, 1.0);",
						"} else {",
							"vec4 transformedNormal = normalMatrix * vec4(normal, 1.0);",
							"float directionalLightWeighting = max(dot(normalize(transformedNormal.xyz), lightingDirection), 0.0);",
							"lightWeighting = ambientColor + directionalColor * directionalLightWeighting;",
						"}",

				"vcolor = color;",
				"vuv = uv;",
				"gl_Position = projectionMatrix * viewMatrix * vec4( position, 1.0 );",

			"}"].join("\n") ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

		}

		_gl.useProgram( _program );

		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.projectionMatrix = _gl.getUniformLocation( _program, "projectionMatrix" );
		_program.normalMatrix = _gl.getUniformLocation( _program, "normalMatrix" );

		_program.enableLighting = _gl.getUniformLocation(_program, 'enableLighting');
		_program.ambientColor = _gl.getUniformLocation(_program, 'ambientColor');
		_program.directionalColor = _gl.getUniformLocation(_program, 'directionalColor');
		_program.lightingDirection = _gl.getUniformLocation(_program, 'lightingDirection');

        _program.enableTexture = _gl.getUniformLocation(_program, 'enableTexture');

		_program.color = _gl.getAttribLocation( _program, "color" );
		_gl.enableVertexAttribArray( _program.color );

		_program.position = _gl.getAttribLocation( _program, "position" );
		_gl.enableVertexAttribArray( _program.position );

		_program.normal = _gl.getAttribLocation( _program, "normal" );
		_gl.enableVertexAttribArray( _program.normal );

		_program.uv = _gl.getAttribLocation( _program, "uv" );
		_gl.enableVertexAttribArray( _program.uv );

        _program.diffuse = _gl.getUniformLocation( _program, "diffuse");
        _gl.uniform1i( _program.diffuse,  0 );

		_program.viewMatrixArray = new Float32Array(16);
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
