/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLRenderer = function () {

	var _canvas = document.createElement( 'canvas' ), 
    _gl, _program,
	_modelViewMatrix = new THREE.Matrix4(), _normalMatrix;

	this.domElement = _canvas;
	this.autoClear = true;

	initGL();
	initProgram();

    // material constants used in shader
    var COLORFILL = 0, COLORSTROKE = 1, BITMAP = 2, PHONG = 3;
    
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
    
    this.createBuffers = function ( object, mf ) {
        
        var materialFaceGroup = object.materialFaceGroup[ mf ];
        
        var faceArray = [];
        var lineArray = [];
        
        var vertexArray = [];
        var normalArray = [];
        var uvArray = [];
        
        var vertexIndex = 0;

        var f, fl, fi, face, vertexNormals, normal, uv, v1, v2, v3, v4;
        
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
                    
                }
                else {
                    
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
                    
                }
                else {
                    
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
            _gl.uniform4f( _program.uniformColor,  color.r * color.a, color.g * color.a, color.b * color.a, color.a );
            
            _gl.uniform1i( _program.material, COLORFILL );
            
        } else if ( material instanceof THREE.MeshColorStrokeMaterial ) {
            
            lineWidth = material.lineWidth;
            
            color = material.color;
            _gl.uniform4f( _program.uniformColor,  color.r * color.a, color.g * color.a, color.b * color.a, color.a );
            
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
            _gl.uniform1i( _program.diffuse,  0 );
            
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
                
        }
        else {
                
            _gl.disableVertexAttribArray( _program.uv );
                
        }

        // render triangles

        if ( material instanceof THREE.MeshBitmapMaterial || 
             material instanceof THREE.MeshColorFillMaterial ||
             material instanceof THREE.MeshPhongMaterial ) {
            
            _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLFaceBuffer );
            _gl.drawElements( _gl.TRIANGLES, materialFaceGroup.__webGLFaceCount, _gl.UNSIGNED_SHORT, 0 );
            
        } 
        
        // render lines
        
        else if ( material instanceof THREE.MeshColorStrokeMaterial ) {
            
            _gl.lineWidth( lineWidth );
            _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, materialFaceGroup.__webGLLineBuffer );
            _gl.drawElements( _gl.LINES, materialFaceGroup.__webGLLineCount, _gl.UNSIGNED_SHORT, 0 );
            
        }
    };
    
    this.renderMesh = function ( object, camera ) {
        
        var i, l, m, ml, mf, material, meshMaterial, materialFaceGroup, fi, lineWidth, mAmbient, mDiffuse, mSpecular;

        // create separate VBOs per material
        
        for ( var mf in object.materialFaceGroup ) {

            materialFaceGroup = object.materialFaceGroup[ mf ];
            
            // initialise on the first access
            
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

        //_normalMatrix = THREE.Matrix4.makeInvert3x3( object.matrix ).transpose();
        _normalMatrix = THREE.Matrix4.makeInvert3x3( _modelViewMatrix ).transpose();
        _program.normalMatrixArray = new Float32Array( _normalMatrix.m );
        
        _gl.uniformMatrix4fv( _program.viewMatrix, false, _program.viewMatrixArray );
        _gl.uniformMatrix4fv( _program.modelViewMatrix, false, _program.modelViewMatrixArray );
        _gl.uniformMatrix4fv( _program.projectionMatrix, false, _program.projectionMatrixArray );
        _gl.uniformMatrix3fv( _program.normalMatrix, false, _program.normalMatrixArray );
        _gl.uniformMatrix4fv( _program.objMatrix, false, new Float32Array( object.matrix.flatten() ) );
        
    };
    
	this.render = function ( scene, camera ) {
        
        camera.autoUpdateMatrix && camera.updateMatrix();
        _gl.uniform3f( _program.cameraPosition, camera.position.x, camera.position.y, camera.position.z );
        
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
			"varying vec3 lightWeighting;",

            "varying vec3 vNormal;",
        
            "uniform int material;", // 0 - ColorFill, 1 - ColorStroke, 2 - Bitmap, 3 - Phong

            "uniform vec4 mAmbient;",
			"uniform vec4 mDiffuse;",
			"uniform vec4 mSpecular;",
            "uniform float mShininess;",

            "varying vec3 pLightVectorPoint;",
            "varying vec3 pLightVectorDirection;",
            "varying vec3 pViewPosition;",

			"void main(){",
                
                // Blinn-Phong
                // based on o3d example
                "if(material==3) { ", 
                    "vec3 lightVectorPoint = normalize(pLightVectorPoint);",
                    "vec3 lightVectorDir = normalize(pLightVectorDirection);",
                    
                    "vec3 normal = normalize(vNormal);",
                    "vec3 viewPosition = normalize(pViewPosition);",
                    
                    "vec3 halfVectorPoint = normalize(pLightVectorPoint + pViewPosition);",
                    
                    "float dotNormalHalfPoint = dot(normal, halfVectorPoint);",

                    "float ambientCompPoint = 1.0;",
                    "float diffuseCompPoint = max(dot(normal, lightVectorPoint), 0.0);",
                    "float specularCompPoint = pow(dotNormalHalfPoint, mShininess);",
                    //"float specularCompPoint = dot(normal, lightVectorPoint) < 0.0 || dotNormalHalfPoint < 0.0 ? 0.0 : pow(dotNormalHalfPoint, mShininess);",

                    "vec4 ambientPoint  = mAmbient * ambientCompPoint;",
                    "vec4 diffusePoint  = mDiffuse * diffuseCompPoint;",
                    "vec4 specularPoint = mSpecular * specularCompPoint;",

                    "vec3 halfVectorDir = normalize(pLightVectorDirection + pViewPosition);",
                    
                    "float dotNormalHalfDir = dot(normal, halfVectorDir);",

                    "float ambientCompDir = 1.0;",
                    "float diffuseCompDir = max(dot(normal, lightVectorDir), 0.0);",
                    "float specularCompDir = pow(dotNormalHalfDir, mShininess);",
                    
                    "vec4 ambientDir  = mAmbient * ambientCompDir;",
                    "vec4 diffuseDir  = mDiffuse * diffuseCompDir;",
                    "vec4 specularDir = mSpecular * specularCompDir;",
                    
                    "vec4 pointLight = ambientPoint + diffusePoint + specularPoint;",
                    "vec4 dirLight = ambientDir + diffuseDir + specularDir;",
                    
                    "gl_FragColor = vec4((pointLight.xyz + dirLight.xyz) * lightWeighting, 1.0);",                    
                    
                // Bitmap: texture
                "} else if(material==2) {", 
                    "vec4 texelColor = texture2D(diffuse, vertexUv);",
                    "gl_FragColor = vec4(texelColor.rgb * lightWeighting, texelColor.a);",
                
                // ColorStroke: wireframe using uniform color
                "} else if(material==1) {", 
                    "gl_FragColor = vec4(uniformColor.rgb * lightWeighting, uniformColor.a);",
                
                // ColorFill: triangle using uniform color
                "} else {", 
                    "gl_FragColor = vec4(uniformColor.rgb * lightWeighting, uniformColor.a);",
                    //"gl_FragColor = vec4(vNormal, 1.0);",
                "}",
			"}"
			].join("\n") ) );

		_gl.attachShader( _program, getShader( "vertex", [
			"attribute vec3 position;",
			"attribute vec3 normal;",
            "attribute vec2 uv;",

			"uniform bool enableLighting;",
			"uniform vec3 ambientColor;",
			"uniform vec3 directionalColor;",
			"uniform vec3 lightingDirection;",

			"uniform vec3 pointColor;",
			"uniform vec3 pointPosition;",

			"uniform mat4 objMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat3 normalMatrix;",
			
            "varying vec4 vertexColor;",
            "varying vec2 vertexUv;",
			"varying vec3 lightWeighting;",

            "varying vec3 vNormal;",
            
            "varying vec3 pLightVectorPoint;",
            "varying vec3 pLightVectorDirection;",
            "varying vec3 pViewPosition;",
            
            "uniform vec3 cameraPosition;",
            
			"void main(void) {",

                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vec3 transformedNormal = normalize(normalMatrix * normal);",

                // Blinn-Phong
                "vec4 lPosition = viewMatrix * vec4( pointPosition, 1.0 );",
                "vec4 lDirection = viewMatrix * vec4( lightingDirection, 0.0 );",
                
                "pLightVectorPoint = normalize(pointPosition.xyz - position.xyz);",
                "pLightVectorDirection = normalize(lDirection.xyz);",
                
                "vec4 mPosition = objMatrix * vec4( position, 1.0 );",                
                "pViewPosition = cameraPosition - mPosition.xyz;",

                "if(!enableLighting) {",
                    "lightWeighting = vec3(1.0, 1.0, 1.0);",
                    
                "} else {",
                    "vec3 pointLight = normalize(lPosition.xyz - mvPosition.xyz);",
                    "float directionalLightWeighting = max(dot(transformedNormal, normalize(lDirection.xyz)), 0.0);",
                    "float pointLightWeighting = max(dot(transformedNormal, pointLight), 0.0);",
                    "lightWeighting = ambientColor + directionalColor * directionalLightWeighting + pointColor * pointLightWeighting;",
                "}",

				"vNormal = transformedNormal;",
				"vertexUv = uv;",
                
				"gl_Position = projectionMatrix * mvPosition;",

			"}"].join("\n") ) );

		_gl.linkProgram( _program );

		if ( !_gl.getProgramParameter( _program, _gl.LINK_STATUS ) ) {

			alert( "Could not initialise shaders" );

		}

		_gl.useProgram( _program );

		_program.viewMatrix = _gl.getUniformLocation( _program, "viewMatrix" );
		_program.modelViewMatrix = _gl.getUniformLocation( _program, "modelViewMatrix" );
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

        _program.mAmbient = _gl.getUniformLocation(_program, 'mAmbient');
        _program.mDiffuse = _gl.getUniformLocation(_program, 'mDiffuse');
        _program.mSpecular = _gl.getUniformLocation(_program, 'mSpecular');
        _program.mShininess = _gl.getUniformLocation(_program, 'mShininess');
        
        _program.cameraPosition = _gl.getUniformLocation(_program, 'cameraPosition');

		_program.position = _gl.getAttribLocation( _program, "position" );
		_gl.enableVertexAttribArray( _program.position );

		_program.normal = _gl.getAttribLocation( _program, "normal" );
		_gl.enableVertexAttribArray( _program.normal );

		_program.uv = _gl.getAttribLocation( _program, "uv" );
		_gl.enableVertexAttribArray( _program.uv );

        _program.diffuse = _gl.getUniformLocation( _program, "diffuse");
        _gl.uniform1i( _program.diffuse,  0 );

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
