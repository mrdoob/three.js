/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.WebGLRenderer = function ( scene ) {
	
	// Currently you can use just up to 5 directional / point lights total.
	// Chrome barfs on shader linking when there are more than 5 lights :(
		
	// It seems problem comes from having too many varying vectors.
	
	// Weirdly, this is not GPU limitation as the same shader works ok in Firefox.
	// This difference could come from Chrome using ANGLE on Windows, 
	// thus going DirectX9 route (while FF uses OpenGL).
	
	var _canvas = document.createElement( 'canvas' ), _gl, _program,
	_modelViewMatrix = new THREE.Matrix4(), _normalMatrix,
	
	COLORFILL = 0, COLORSTROKE = 1, BITMAP = 2, PHONG = 3, // material constants used in shader
	
	maxLightCount = allocateLights( scene, 5 );
	
	this.domElement = _canvas;
	this.autoClear = true;

	initGL();
	initProgram( maxLightCount.directional, maxLightCount.point );
	
	// Querying via gl.getParameter() reports different values for CH and FF for many max parameters.
	// On my GPU Chrome reports MAX_VARYING_VECTORS = 8, FF reports 0 yet compiles shaders with many
	// more varying vectors (up to 29 lights are ok, more start to throw warnings to FF error console
	// and then crash the browser).
	
	//alert( dumpObject( getGLParams() ) );
	
	
	function allocateLights( scene, maxLights ) {

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)
		
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
		// _gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE ); // cool!
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
		
			"uniform int material;", // 0 - ColorFill, 1 - ColorStroke, 2 - Bitmap, 3 - Phong

			"uniform sampler2D tDiffuse;",
			"uniform vec4 mColor;",

			"uniform vec4 mAmbient;",
			"uniform vec4 mDiffuse;",
			"uniform vec4 mSpecular;",
			"uniform float mShininess;",

			"uniform int pointLightNumber;",
			"uniform int directionalLightNumber;",
			
			maxDirLights ? "uniform mat4 viewMatrix;" : "",
			maxDirLights ? "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];" : "",
			
			"varying vec3 vNormal;",
			"varying vec2 vUv;",
			
			"varying vec3 vLightWeighting;",

			maxPointLights ? "varying vec3 vPointLightVector[ MAX_POINT_LIGHTS ];"     : "",
			
			"varying vec3 vViewPosition;",

			"void main() {",

				// Blinn-Phong
				// based on o3d example

				"if ( material == 3 ) { ", 

					"vec3 normal = normalize( vNormal );",
					"vec3 viewPosition = normalize( vViewPosition );",

					// point lights
					
					maxPointLights ? "vec4 pointDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",
					maxPointLights ? "vec4 pointSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",

					maxPointLights ? "for( int i = 0; i < pointLightNumber; i++ ) {" : "",
					
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
						
					maxPointLights ? 	"pointDiffuse  += mDiffuse  * pointDiffuseWeight;" : "",
					maxPointLights ? 	"pointSpecular += mSpecular * pointSpecularWeight;" : "",
						
					maxPointLights ? "}" : "",

					// directional lights

					maxDirLights ? "vec4 dirDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",
					maxDirLights ? "vec4 dirSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );" : "",
					
					maxDirLights ? "for( int i = 0; i < directionalLightNumber; i++ ) {" : "",

					maxDirLights ?		"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );" : "",

					maxDirLights ? 		"vec3 dirVector = normalize( lDirection.xyz );" : "",
					maxDirLights ? 		"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );" : "",
						
					maxDirLights ? 		"float dirDotNormalHalf = dot( normal, dirHalfVector );" : "",

					maxDirLights ? 		"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );" : "",  
						
					maxDirLights ? 		"float dirSpecularWeight = 0.0;" : "",
					maxDirLights ? 		"if ( dirDotNormalHalf >= 0.0 )" : "",
					maxDirLights ? 			"dirSpecularWeight = pow( dirDotNormalHalf, mShininess );" : "",

					maxDirLights ? 		"dirDiffuse  += mDiffuse  * dirDiffuseWeight;" : "",
					maxDirLights ? 		"dirSpecular += mSpecular * dirSpecularWeight;" : "",

					maxDirLights ? "}" : "",

					// all lights contribution summation
					
					"vec4 totalLight = mAmbient;",
					maxDirLights   ? "totalLight += dirDiffuse + dirSpecular;" : "",
					maxPointLights ? "totalLight += pointDiffuse + pointSpecular;" : "",

					// looks nicer with weighting
					
					"gl_FragColor = vec4( totalLight.xyz * vLightWeighting, 1.0 );",                    
					//"gl_FragColor = vec4( totalLight.xyz, 1.0 );", 

				// Bitmap: texture
				
				"} else if ( material == 2 ) {", 

					"vec4 texelColor = texture2D( tDiffuse, vUv );",
					"gl_FragColor = vec4( texelColor.rgb * vLightWeighting, texelColor.a );",

				// ColorStroke: wireframe using uniform color
				
				"} else if ( material == 1 ) {", 

					"gl_FragColor = vec4( mColor.rgb * vLightWeighting, mColor.a );",

				// ColorFill: triangle using uniform color
				
				"} else {", 

					"gl_FragColor = vec4( mColor.rgb * vLightWeighting, mColor.a );",
					
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

			"void main(void) {",

				// world space
				
				"vec4 mPosition = objMatrix * vec4( position, 1.0 );",
				"vViewPosition = cameraPosition - mPosition.xyz;",

				// eye space
				
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec3 transformedNormal = normalize( normalMatrix * normal );",

				"if ( !enableLighting ) {",

					"vLightWeighting = vec3( 1.0, 1.0, 1.0 );",

				"} else {",

					"vLightWeighting = ambientLightColor;",
					
					// directional lights
					
					maxDirLights ? "for( int i = 0; i < directionalLightNumber; i++ ) {" : "",
					maxDirLights ?		"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );" : "",
					maxDirLights ?		"float directionalLightWeighting = max( dot( transformedNormal, normalize(lDirection.xyz ) ), 0.0 );" : "",						
					maxDirLights ?		"vLightWeighting += directionalLightColor[ i ] * directionalLightWeighting;" : "",
					maxDirLights ? "}" : "",
					
					// point lights
					
					maxPointLights ? "for( int i = 0; i < pointLightNumber; i++ ) {" : "",
					maxPointLights ? 	"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );" : "",
					maxPointLights ? 	"vPointLightVector[ i ] = normalize( lPosition.xyz - mvPosition.xyz );" : "",
					maxPointLights ? 	"float pointLightWeighting = max( dot( transformedNormal, vPointLightVector[ i ] ), 0.0 );" : "",
					maxPointLights ? 	"vLightWeighting += pointLightColor[ i ] * pointLightWeighting;" : "",
					maxPointLights ? "}" : "",
					
				"}",

				"vNormal = transformedNormal;",
				"vUv = uv;",

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

			//alert( "VALIDATE_STATUS: " + _gl.getProgramParameter( _program, _gl.VALIDATE_STATUS ) );
			//alert( _gl.getError() );
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
		
		if ( maxDirLights ) {
			
			_program.directionalLightNumber = _gl.getUniformLocation(_program, 'directionalLightNumber');
			_program.directionalLightColor = _gl.getUniformLocation(_program, 'directionalLightColor');
			_program.directionalLightDirection = _gl.getUniformLocation(_program, 'directionalLightDirection');
			
		}

		if ( maxPointLights ) {
			
			_program.pointLightNumber = _gl.getUniformLocation(_program, 'pointLightNumber');
			_program.pointLightColor = _gl.getUniformLocation(_program, 'pointLightColor');
			_program.pointLightPosition = _gl.getUniformLocation(_program, 'pointLightPosition');
			
		}

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
	
};
