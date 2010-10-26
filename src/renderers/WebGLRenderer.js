/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer = function () {

	var _canvas = document.createElement( 'canvas' ), 
    _gl, _program,
	_viewMatrix = new THREE.Matrix4(), _normalMatrix;

	this.domElement = _canvas;
	this.autoClear = true;

	initGL();
	initProgram();

    // material constants used in shader
    var COLORFILL = 0, COLORSTROKE = 1, FACECOLORFILL = 2, FACECOLORSTROKE = 3, BITMAP = 4;
    
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
				_gl.uniform3f( _program.ambientColor, lightColor.r, lightColor.g, lightColor.b );

			} else if ( light instanceof THREE.DirectionalLight ) {

				lightColor = light.color;
				lightPosition = light.position;
                lightIntensity = light.intensity;
				_gl.uniform3f( _program.lightingDirection, lightPosition.x, lightPosition.y, lightPosition.z );
				_gl.uniform3f( _program.directionalColor, lightColor.r * lightIntensity, lightColor.g * lightIntensity, lightColor.b * lightIntensity );

			} else if( light instanceof THREE.PointLight ) {

				lightColor = light.color;
				lightPosition = light.position;
                lightIntensity = light.intensity;
				_gl.uniform3f( _program.pointPosition, lightPosition.x, lightPosition.y, lightPosition.z );
				_gl.uniform3f( _program.pointColor, lightColor.r * lightIntensity, lightColor.g * lightIntensity, lightColor.b * lightIntensity );
                
            }

		}
    };
    
    this.createBuffers = function ( object, materialIndex ) {
        
        var materialFace = object.materialFaces[ materialIndex ];
        var material = object.material[ materialIndex ];
        
        var faceArray = [];
        var lineArray = [];
        
        var vertexArray = [];
        var colorArray = [];
        var normalArray = [];
        var uvArray = [];
        
        var vertexIndex = 0;

        var f, fl, fi, face, faceColor, vertexNormals, normal, uv, v1, v2, v3, v4;
        
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

        materialFace.__webGLColorBuffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLColorBuffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( colorArray ), _gl.STATIC_DRAW );

        materialFace.__webGLUVBuffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLUVBuffer );
        _gl.bufferData( _gl.ARRAY_BUFFER, new Float32Array( uvArray ), _gl.STATIC_DRAW );

        materialFace.__webGLFaceBuffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFace.__webGLFaceBuffer );
        _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( faceArray ), _gl.STATIC_DRAW );

        materialFace.__webGLLineBuffer = _gl.createBuffer();
        _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFace.__webGLLineBuffer );
        _gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( lineArray ), _gl.STATIC_DRAW );

        materialFace.__webGLFaceCount = faceArray.length;
        materialFace.__webGLLineCount = lineArray.length;

    }
    
    this.renderMesh = function ( object, camera ) {
        
        var m, ml, mf, material, materialFace, fi, lineWidth;

        // create separate VBOs per material
        for (var mf in object.materialFaces ) {

            materialFace = object.materialFaces[ mf ];
            material = object.material[ mf ];
            if( !material ) continue;

            // initialise on the first access
            if( !materialFace.__webGLVertexBuffer ) {
                
                this.createBuffers( object, mf );
                
            }
            
            for ( m = 0, ml = object.material.length; m < ml; m++ ) {
                
                material = object.material[ m ];
                
                // these materials can be either the only material for whole mesh
                // or if they are overlays in multimaterials, they apply only to
                // group of faces with single material (specified by decalIndex)
                
                if ( ( material instanceof THREE.MeshBitmapUVMappingMaterial || 
                       material instanceof THREE.MeshFaceColorFillMaterial ||
                       material instanceof THREE.MeshColorFillMaterial
                     ) 
                    &&
                     ! ( m == mf || mf == material.decalIndex ) ) {
                    
                    continue;
                    
                }
                
                if ( material instanceof THREE.MeshColorFillMaterial ) {

                    color = material.color;
                    _gl.uniform4f( _program.uniformColor,  color.r, color.g, color.b, color.a );
                    
                    _gl.uniform1i( _program.material, COLORFILL );
                    
                } else if ( material instanceof THREE.MeshColorStrokeMaterial ) {
                    
                    lineWidth = material.lineWidth;
                    
                    color = material.color;
                    _gl.uniform4f( _program.uniformColor,  color.r, color.g, color.b, color.a );
                    
                    _gl.uniform1i( _program.material, COLORSTROKE );
                    
                } else if ( material instanceof THREE.MeshFaceColorFillMaterial ) {
                    
                    _gl.uniform1i( _program.material, FACECOLORFILL );
                
                } else if ( material instanceof THREE.MeshFaceColorStrokeMaterial ) {

                    lineWidth = material.lineWidth;
                    
                    _gl.uniform1i( _program.material, FACECOLORSTROKE );

                } else if ( material instanceof THREE.MeshBitmapUVMappingMaterial ) {
                    
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
                    _gl.uniform1i( _program.diffuse,  0 );
                    
                    _gl.uniform1i( _program.material, BITMAP );
                    
                }
                

                // vertices
                _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLVertexBuffer );
                _gl.vertexAttribPointer( _program.position, 3, _gl.FLOAT, false, 0, 0 );

                // normals
                _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLNormalBuffer );
                _gl.vertexAttribPointer( _program.normal, 3, _gl.FLOAT, false, 0, 0 );

                // colors
                _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLColorBuffer );
                _gl.vertexAttribPointer( _program.color, 4, _gl.FLOAT, false, 0, 0 );
                
                // uvs
                
                if ( material instanceof THREE.MeshBitmapUVMappingMaterial ) {
                    
                    _gl.bindBuffer( _gl.ARRAY_BUFFER, materialFace.__webGLUVBuffer );
                        
                    _gl.enableVertexAttribArray( _program.uv );
                    _gl.vertexAttribPointer( _program.uv, 2, _gl.FLOAT, false, 0, 0 );
                        
                }
                else {
                        
                    _gl.disableVertexAttribArray( _program.uv );
                        
                }

                // render triangles

                if ( material instanceof THREE.MeshBitmapUVMappingMaterial || 
                     material instanceof THREE.MeshFaceColorFillMaterial ||
                     material instanceof THREE.MeshColorFillMaterial ) {
                    
                    _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFace.__webGLFaceBuffer );
                    _gl.drawElements( _gl.TRIANGLES, materialFace.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );
                    
                } 
                
                // render lines
                
                else if ( material instanceof THREE.MeshColorStrokeMaterial ||
                          material instanceof THREE.MeshFaceColorStrokeMaterial ) {
                    
                    _gl.lineWidth( lineWidth );
                    _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFace.__webGLLineBuffer );
                    _gl.drawElements( _gl.LINES, materialFace.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );
                    
                }
                
            }

        }
    };
    
    this.setupMatrices = function ( object, camera ) {
        
        camera.autoUpdateMatrix && camera.updateMatrix();
        object.autoUpdateMatrix && object.updateMatrix();

        _viewMatrix.multiply( camera.matrix, object.matrix );

        _program.viewMatrixArray = new Float32Array( _viewMatrix.flatten() );
        _program.projectionMatrixArray = new Float32Array( camera.projectionMatrix.flatten() );

        _normalMatrix = THREE.Matrix4.makeInvert3x3( object.matrix ).transpose();
        _program.normalMatrixArray = new Float32Array( _normalMatrix.m );
        
        _gl.uniformMatrix4fv( _program.viewMatrix, false, _program.viewMatrixArray );
        _gl.uniformMatrix4fv( _program.projectionMatrix, false, _program.projectionMatrixArray );
        _gl.uniformMatrix3fv( _program.normalMatrix, false, _program.normalMatrixArray );
        _gl.uniformMatrix4fv( _program.objMatrix, false, new Float32Array( object.matrix.flatten() ) );
        
    };
    
	this.render = function ( scene, camera ) {
        
        var o, ol, object;

		if ( this.autoClear ) {

			this.clear();

		}

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

            "uniform sampler2D diffuse;",

			"uniform vec4 uniformColor;",
        
            "varying vec2 vertexUv;",
			"varying vec4 vertexColor;",
			"varying vec3 lightWeighting;",

            "varying vec3 vNormal;",
        
            "uniform int material;", // 0 - ColorFill, 1 - ColorStroke, 2 - FaceColorFill, 3 - FaceColorStroke, 4 - Bitmap

			"void main(){",
                "if(material==4) {", // texture
                    "vec4 texelColor = texture2D(diffuse, vertexUv);",
                    "gl_FragColor = vec4(texelColor.rgb * lightWeighting, texelColor.a);",
                
                "} else if(material==3) {", // wireframe using vertex color 
                    "gl_FragColor = vec4(vertexColor.rgb * lightWeighting, vertexColor.a);",
                
                "} else if(material==2) {", // triangle using vertex color
                    "gl_FragColor = vec4(vertexColor.rgb * lightWeighting, vertexColor.a);",
                
                "} else if(material==1) {", // wireframe using uniform color
                    "gl_FragColor = vec4(uniformColor.rgb * lightWeighting, uniformColor.a);",
                
                "} else {", // triangle using uniform color
                    "gl_FragColor = vec4(uniformColor.rgb * lightWeighting, uniformColor.a);",
                    //"gl_FragColor = vec4(vNormal, 1.0);",
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

			"uniform vec3 pointColor;",
			"uniform vec3 pointPosition;",

			"uniform mat4 viewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 objMatrix;",
			"uniform mat3 normalMatrix;",
			
            "varying vec4 vertexColor;",
            "varying vec2 vertexUv;",
			"varying vec3 lightWeighting;",

            "varying vec3 vNormal;",
            
			"void main(void) {",
                "vec4 mvPosition = viewMatrix * vec4( position, 1.0 );",
                "vec4 mPosition = objMatrix * vec4( position, 1.0 );",
                "vec3 transformedNormal = normalize(normalMatrix * normal);",

                "if(!enableLighting) {",
                    "lightWeighting = vec3(1.0, 1.0, 1.0);",
                "} else {",
                    "vec3 pointLight = normalize(pointPosition.xyz - mPosition.xyz);",
                    "float directionalLightWeighting = max(dot(transformedNormal, normalize(lightingDirection)), 0.0);",
                    "float pointLightWeighting = max(dot(transformedNormal, pointLight), 0.0);",
                    "lightWeighting = ambientColor + directionalColor * directionalLightWeighting + pointColor * pointLightWeighting;",
                "}",

				"vNormal = transformedNormal;",
                "vertexColor = color;",
				"vertexUv = uv;",
                
				"gl_Position = projectionMatrix * mvPosition;",

			"}"].join("\n") ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

		}

		_gl.useProgram( _program );

		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.projectionMatrix = _gl.getUniformLocation( _program, "projectionMatrix" );
		_program.normalMatrix = _gl.getUniformLocation( _program, "normalMatrix" );
		_program.objMatrix = _gl.getUniformLocation( _program, "objMatrix" );

		_program.enableLighting = _gl.getUniformLocation(_program, 'enableLighting');
		_program.ambientColor = _gl.getUniformLocation(_program, 'ambientColor');
		_program.directionalColor = _gl.getUniformLocation(_program, 'directionalColor');
		_program.lightingDirection = _gl.getUniformLocation(_program, 'lightingDirection');

		_program.pointColor = _gl.getUniformLocation(_program, 'pointColor');
		_program.pointPosition = _gl.getUniformLocation(_program, 'pointPosition');
        
        _program.material = _gl.getUniformLocation(_program, 'material');
        _program.uniformColor = _gl.getUniformLocation(_program, 'uniformColor');

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
