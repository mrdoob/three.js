// ThreeExtras.js r32 - http://github.com/mrdoob/three.js
var GeometryUtils = {

	merge: function ( geometry1, object2 /* mesh | geometry */ ) {

		var isMesh = object2 instanceof THREE.Mesh,
		vertexPosition = geometry1.vertices.length,
		facePosition = geometry1.faces.length,
		uvPosition = geometry1.uvs.length,
		geometry2 = isMesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.uvs,
		uvs2 = geometry2.uvs;

		isMesh && object2.updateMatrix();

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {

			var vertex = vertices2[ i ];

			var vertexCopy = new THREE.Vertex( vertex.position.clone() );

			isMesh && object2.matrix.multiplyVector3( vertexCopy.position );

			vertices1.push( vertexCopy );

		}

		for ( i = 0, il = faces2.length; i < il; i ++ ) {

			var face = faces2[ i ], faceCopy, normal,
			faceVertexNormals = face.vertexNormals;

			if ( face instanceof THREE.Face3 ) {

				faceCopy = new THREE.Face3( face.a + vertexPosition, face.b + vertexPosition, face.c + vertexPosition );

			} else if ( face instanceof THREE.Face4 ) {

				faceCopy = new THREE.Face4( face.a + vertexPosition, face.b + vertexPosition, face.c + vertexPosition, face.d + vertexPosition );

			}

			faceCopy.centroid.copy( face.centroid );
			faceCopy.normal.copy( face.normal );

			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {

				normal = faceVertexNormals[ j ];
				faceCopy.vertexNormals.push( normal.clone() );

			}

			faceCopy.materials = face.materials.slice();

			faces1.push( faceCopy );

		}

		for ( i = 0, il = uvs2.length; i < il; i ++ ) {

			var uv = uvs2[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ ) {

				uvCopy.push( new THREE.UV( uv[ j ].u, uv[ j ].v ) );

			}

			uvs1.push( uvCopy );

		}

	}

};
var ImageUtils = {

	loadTexture: function ( path, mapping ) {

		var image = new Image();
		image.onload = function () { this.loaded = true; };
		image.src = path;

		return new THREE.Texture( image, mapping );

	},

	loadArray: function ( array ) {

		var i, l, images = [];

		images.loadCount = 0;

		for ( i = 0, l = array.length; i < l; ++i ) {

			images[ i ] = new Image();
			images[ i ].loaded = 0;
			images[ i ].onload = function () { images.loadCount += 1; this.loaded = true; };
			images[ i ].src = array[ i ];

		}

		return images;

	}

};
var SceneUtils = {

	addMesh: function ( scene, geometry, scale, x, y, z, rx, ry, rz, material ) {

		var mesh = new THREE.Mesh( geometry, material );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
		mesh.position.x = x;
		mesh.position.y = y;
		mesh.position.z = z;
		mesh.rotation.x = rx;
		mesh.rotation.y = ry;
		mesh.rotation.z = rz;
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCubeWebGL: function ( scene, size, textureCube ) {

		var shader = ShaderUtils.lib["cube"];
		shader.uniforms["tCube"].texture = textureCube;

		var material = new THREE.MeshShaderMaterial( { fragment_shader: shader.fragment_shader,
													   vertex_shader: shader.vertex_shader,
													   uniforms: shader.uniforms
													} ),

			mesh = new THREE.Mesh( new Cube( size, size, size, 1, 1, null, true ), material );

		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCube: function( scene, size, images ) {

		var materials = [], mesh;
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[0] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[1] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[2] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[3] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[4] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[5] ) } ) );

		mesh = new THREE.Mesh( new Cube( size, size, size, 1, 1, materials, true ), new THREE.MeshFaceMaterial() );
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCubePlanes: function ( scene, size, images ) {


		var hsize = size/2, plane = new Plane( size, size ), pi2 = Math.PI/2, pi = Math.PI;

		SceneUtils.addMesh( scene, plane, 1,      0,     0,  -hsize,  0,      0,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[5] ) } ) );
		SceneUtils.addMesh( scene, plane, 1, -hsize,     0,       0,  0,    pi2,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[0] ) } ) );
		SceneUtils.addMesh( scene, plane, 1,  hsize,     0,       0,  0,   -pi2,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[1] ) } ) );
		SceneUtils.addMesh( scene, plane, 1,     0,  hsize,       0,  pi2,    0, pi, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[2] ) } ) );
		SceneUtils.addMesh( scene, plane, 1,     0, -hsize,       0, -pi2,    0, pi, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[3] ) } ) );

	}

};
var ShaderUtils = {

	lib: { 'fresnel': {

			uniforms: {

			"mRefractionRatio": { type: "f", value: 1.02 },
			"mFresnelBias": { type: "f", value: 0.1 },
			"mFresnelPower": { type: "f", value: 2.0 },
			"mFresnelScale": { type: "f", value: 1.0 },
			"tCube": { type: "t", value: 1, texture: null }

			},

			fragment_shader: [

			"uniform samplerCube tCube;",

			"varying vec3 vReflect;",
			"varying vec3 vRefract[3];",
			"varying float vReflectionFactor;",

			"void main() {",
				"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
				"vec4 refractedColor = vec4( 1.0, 1.0, 1.0, 1.0 );",

				"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
				"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
				"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",
				"refractedColor.a = 1.0;",

				"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",
			"}"

			].join("\n"),

			vertex_shader: [

			"uniform float mRefractionRatio;",
			"uniform float mFresnelBias;",
			"uniform float mFresnelScale;",
			"uniform float mFresnelPower;",

			"varying vec3 vReflect;",
			"varying vec3 vRefract[3];",
			"varying float vReflectionFactor;",

			"void main(void) {",
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",

				"vec3 nWorld = normalize ( mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal );",

				"vec3 I = mPosition.xyz - cameraPosition;",

				"vReflect = reflect( I, nWorld );",
				"vRefract[0] = refract( normalize( I ), nWorld, mRefractionRatio );",
				"vRefract[1] = refract( normalize( I ), nWorld, mRefractionRatio * 0.99 );",
				"vRefract[2] = refract( normalize( I ), nWorld, mRefractionRatio * 0.98 );",
				"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), nWorld ), mFresnelPower );",

				"gl_Position = projectionMatrix * mvPosition;",
			"}"

			].join("\n")

		},

		'normal' : {

			uniforms: {

			"enableAO": { type: "i", value: 0 },
			"enableDiffuse": { type: "i", value: 0 },

			"tDiffuse": { type: "t", value: 0, texture: null },
			"tNormal": { type: "t", value: 2, texture: null },
			"tAO": { type: "t", value: 3, texture: null },

			"uNormalScale": { type: "f", value: 1.0 },

			"tDisplacement": { type: "t", value: 4, texture: null },
			"uDisplacementBias": { type: "f", value: -0.5 },
			"uDisplacementScale": { type: "f", value: 2.5 },

			"uPointLightPos": { type: "v3", value: new THREE.Vector3() },
			"uPointLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

			"uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
			"uDirLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

			"uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },

			"uDiffuseColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },
			"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
			"uAmbientColor": { type: "c", value: new THREE.Color( 0x050505 ) },
			"uShininess": { type: "f", value: 30 }

			},

			fragment_shader: [

			"uniform vec3 uDirLightPos;",

			"uniform vec3 uAmbientLightColor;",
			"uniform vec3 uDirLightColor;",
			"uniform vec3 uPointLightColor;",

			"uniform vec3 uAmbientColor;",
			"uniform vec3 uDiffuseColor;",
			"uniform vec3 uSpecularColor;",
			"uniform float uShininess;",

			"uniform bool enableDiffuse;",
			"uniform bool enableAO;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tNormal;",
			"uniform sampler2D tAO;",

			"uniform float uNormalScale;",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vPointLightVector;",
			"varying vec3 vViewPosition;",

			"void main() {",

				"vec3 diffuseTex = vec3( 1.0, 1.0, 1.0 );",
				"vec3 aoTex = vec3( 1.0, 1.0, 1.0 );",

				"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
				"normalTex.xy *= uNormalScale;",
				"normalTex = normalize( normalTex );",

				"if( enableDiffuse )",
					"diffuseTex = texture2D( tDiffuse, vUv ).xyz;",

				"if( enableAO )",
					"aoTex = texture2D( tAO, vUv ).xyz;",

				"mat3 tsb = mat3( vTangent, vBinormal, vNormal );",
				"vec3 finalNormal = tsb * normalTex;",

				"vec3 normal = normalize( finalNormal );",
				"vec3 viewPosition = normalize( vViewPosition );",

				// point light

				"vec4 pointDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );",
				"vec4 pointSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );",

				"vec3 pointVector = normalize( vPointLightVector );",
				"vec3 pointHalfVector = normalize( vPointLightVector + vViewPosition );",

				"float pointDotNormalHalf = dot( normal, pointHalfVector );",
				"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

				"float pointSpecularWeight = 0.0;",
				"if ( pointDotNormalHalf >= 0.0 )",
					"pointSpecularWeight = pow( pointDotNormalHalf, uShininess );",

				"pointDiffuse  += vec4( uDiffuseColor, 1.0 ) * pointDiffuseWeight;",
				"pointSpecular += vec4( uSpecularColor, 1.0 ) * pointSpecularWeight;",

				// directional light

				"vec4 dirDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );",
				"vec4 dirSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );",

				"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",

				"vec3 dirVector = normalize( lDirection.xyz );",
				"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );",

				"float dirDotNormalHalf = dot( normal, dirHalfVector );",
				"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

				"float dirSpecularWeight = 0.0;",
				"if ( dirDotNormalHalf >= 0.0 )",
					"dirSpecularWeight = pow( dirDotNormalHalf, uShininess );",

				"dirDiffuse  += vec4( uDiffuseColor, 1.0 ) * dirDiffuseWeight;",
				"dirSpecular += vec4( uSpecularColor, 1.0 ) * dirSpecularWeight;",

				// all lights contribution summation

				"vec4 totalLight = vec4( uAmbientLightColor * uAmbientColor, 1.0 );",
				"totalLight += vec4( uDirLightColor, 1.0 ) * ( dirDiffuse + dirSpecular );",
				"totalLight += vec4( uPointLightColor, 1.0 ) * ( pointDiffuse + pointSpecular );",

				"gl_FragColor = vec4( totalLight.xyz * aoTex * diffuseTex, 1.0 );",

			"}"
			].join("\n"),

			vertex_shader: [

			"attribute vec4 tangent;",

			"uniform vec3 uPointLightPos;",

			"#ifdef VERTEX_TEXTURES",

				"uniform sampler2D tDisplacement;",
				"uniform float uDisplacementScale;",
				"uniform float uDisplacementBias;",

			"#endif",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vPointLightVector;",
			"varying vec3 vViewPosition;",

			"void main() {",

				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
				"vViewPosition = cameraPosition - mPosition.xyz;",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",

				// tangent and binormal vectors

				"vTangent = normalize( normalMatrix * tangent.xyz );",

				"vBinormal = cross( vNormal, vTangent ) * tangent.w;",
				"vBinormal = normalize( vBinormal );",

				"vUv = uv;",

				// point light

				"vec4 lPosition = viewMatrix * vec4( uPointLightPos, 1.0 );",
				"vPointLightVector = normalize( lPosition.xyz - mvPosition.xyz );",

				// displacement mapping

				"#ifdef VERTEX_TEXTURES",

					"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
					"float df = uDisplacementScale * dv.x + uDisplacementBias;",
					"vec4 displacedPosition = vec4( vNormal.xyz * df, 0.0 ) + mvPosition;",
					"gl_Position = projectionMatrix * displacedPosition;",

				"#else",

					"gl_Position = projectionMatrix * mvPosition;",

				"#endif",

			"}"

			].join("\n")

		},
		/*
		'hatching' : {

			uniforms: {

				"uSampler": { type: "t", value: 2, texture: null },

				"uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
				"uDirLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

				"uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) }

			},

			vertex_shader: [

				"varying vec3 vNormal;",

				"void main() {",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
					"vNormal = normalize( normalMatrix * normal );",

				"}"

			].join("\n"),

			fragment_shader: [

				"uniform vec3 uDirLightPos;",
				"uniform vec3 uDirLightColor;",

				"uniform vec3 uAmbientLightColor;",

				"uniform sampler2D uSampler;",

				"varying vec3 vNormal;",

				"void main() {",

					"float directionalLightWeighting = max(dot(normalize(vNormal), uDirLightPos), 0.0);",
					"vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;",

					"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",

					"if (length(lightWeighting) < 1.00) {",

						"if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {",

							"gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",

						"}",

					"}",

					"if (length(lightWeighting) < 0.75) {",

						"if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {",

							"gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",

						"}",
					"}",

					"if (length(lightWeighting) < 0.50) {",

						"if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {",

							"gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",

						"}",
					"}",

					"if (length(lightWeighting) < 0.3465) {",

						"if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {",

							"gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",

						"}",
					"}",

				"}"

			].join("\n")

		},
		*/
		'basic': {

			uniforms: {},

			vertex_shader: [

				"void main() {",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragment_shader: [

				"void main() {",

					"gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);",

				"}"

			].join("\n")

		},

		'cube': {

			uniforms: { "tCube": { type: "t", value: 1, texture: null } },

			vertex_shader: [

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
					"vViewPosition = cameraPosition - mPosition.xyz;",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragment_shader: [

				"uniform samplerCube tCube;",

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec3 wPos = cameraPosition - vViewPosition;",
					"gl_FragColor = textureCube( tCube, vec3( - wPos.x, wPos.yz ) );",

				"}"

			].join("\n")

		}

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */

var Cube = function ( width, height, depth, segments_width, segments_height, materials, flipped, sides ) {

	THREE.Geometry.call( this );

	var scope = this,
	width_half = width / 2,
	height_half = height / 2,
	depth_half = depth / 2,
	flip = flipped ? - 1 : 1;

	if ( materials !== undefined ) {

		if ( materials instanceof Array ) {

			this.materials = materials;

		} else {

			this.materials = [];

			for ( var i = 0; i < 6; i ++ ) {

				this.materials.push( [ materials ] );

			}

		}

	} else {

		this.materials = [];

	}

	this.sides = { px: true, nx: true, py: true, ny: true, pz: true, nz: true };

	if( sides != undefined ) {

		for( var s in sides ) {

			if ( this.sides[ s ] != undefined ) {

				this.sides[ s ] = sides[ s ];

			}

		}

	}

	this.sides.px && buildPlane( 'z', 'y',   1 * flip, - 1, depth, height, - width_half, this.materials[ 0 ] ); // px
	this.sides.nx && buildPlane( 'z', 'y', - 1 * flip, - 1, depth, height, width_half, this.materials[ 1 ] );   // nx
	this.sides.py && buildPlane( 'x', 'z',   1 * flip,   1, width, depth, height_half, this.materials[ 2 ] );   // py
	this.sides.ny && buildPlane( 'x', 'z',   1 * flip, - 1, width, depth, - height_half, this.materials[ 3 ] ); // ny
	this.sides.pz && buildPlane( 'x', 'y',   1 * flip, - 1, width, height, depth_half, this.materials[ 4 ] );   // pz
	this.sides.nz && buildPlane( 'x', 'y', - 1 * flip, - 1, width, height, - depth_half, this.materials[ 5 ] ); // nz

	mergeVertices();

	function buildPlane( u, v, udir, vdir, width, height, depth, material ) {

		var w, ix, iy,
		gridX = segments_width || 1,
		gridY = segments_height || 1,
		gridX1 = gridX + 1,
		gridY1 = gridY + 1,
		width_half = width / 2,
		height_half = height / 2,
		segment_width = width / gridX,
		segment_height = height / gridY,
		offset = scope.vertices.length;

		if ( ( u == 'x' && v == 'y' ) || ( u == 'y' && v == 'x' ) ) {

			w = 'z';

		} else if ( ( u == 'x' && v == 'z' ) || ( u == 'z' && v == 'x' ) ) {

			w = 'y';

		} else if ( ( u == 'z' && v == 'y' ) || ( u == 'y' && v == 'z' ) ) {

			w = 'x';

		}


		for( iy = 0; iy < gridY1; iy++ ) {

			for( ix = 0; ix < gridX1; ix++ ) {

				var vector = new THREE.Vector3();
				vector[ u ] = ( ix * segment_width - width_half ) * udir;
				vector[ v ] = ( iy * segment_height - height_half ) * vdir;
				vector[ w ] = depth;

				scope.vertices.push( new THREE.Vertex( vector ) );

			}

		}

		for( iy = 0; iy < gridY; iy++ ) {

			for( ix = 0; ix < gridX; ix++ ) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;

				scope.faces.push( new THREE.Face4( a + offset, b + offset, c + offset, d + offset, null, material ) );
				scope.uvs.push( [
							new THREE.UV( ix / gridX, iy / gridY ),
							new THREE.UV( ix / gridX, ( iy + 1 ) / gridY ),
							new THREE.UV( ( ix + 1 ) / gridX, ( iy + 1 ) / gridY ),
							new THREE.UV( ( ix + 1 ) / gridX, iy / gridY )
						] );

			}

		}

	}

	function mergeVertices() {

		var unique = [], changes = [];

		for ( var i = 0, il = scope.vertices.length; i < il; i ++ ) {

			var v = scope.vertices[ i ],
			duplicate = false;

			for ( var j = 0, jl = unique.length; j < jl; j ++ ) {

				var vu = unique[ j ];

				if( v.position.x == vu.position.x && v.position.y == vu.position.y && v.position.z == vu.position.z ) {

					changes[ i ] = j;
					duplicate = true;
					break;

				}

			}

			if ( ! duplicate ) {

				changes[ i ] = unique.length;
				unique.push( new THREE.Vertex( v.position.clone() ) );

			}

		}

		for ( i = 0, il = scope.faces.length; i < il; i ++ ) {

			var face = scope.faces[ i ];

			face.a = changes[ face.a ];
			face.b = changes[ face.b ];
			face.c = changes[ face.c ];
			face.d = changes[ face.d ];

		}

		scope.vertices = unique;

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.sortFacesByMaterial();

};

Cube.prototype = new THREE.Geometry();
Cube.prototype.constructor = Cube;
/**
 * @author kile / http://kile.stravaganza.org/
 */

var Cylinder = function ( numSegs, topRad, botRad, height, topOffset, botOffset ) {

	THREE.Geometry.call( this );

	var scope = this,
	pi = Math.PI, i;

	// VERTICES

	// Top circle vertices
	for ( i = 0; i < numSegs; i ++ ) {

		v( Math.sin( 2 * pi * i / numSegs ) * topRad, Math.cos( 2 * pi * i / numSegs ) * topRad, 0 );

	}

	// Bottom circle vertices
	for ( i = 0; i < numSegs; i ++ ) {

		v( Math.sin( 2 * pi * i / numSegs ) * botRad, Math.cos( 2 * pi * i / numSegs ) * botRad, height );

	}


	// FACES

	// Body
	for ( i = 0; i < numSegs; i++ ) {

		f4( i, i + numSegs, numSegs + ( i + 1 ) % numSegs, ( i + 1 ) % numSegs, '#ff0000' );
	}

	// Bottom circle
	if ( botRad != 0 ) {

		v( 0, 0, - topOffset );

		for ( i = numSegs; i < numSegs + ( numSegs / 2 ); i++ ) {

			f4( 2 * numSegs, ( 2 * i - 2 * numSegs ) % numSegs, ( 2 * i - 2 * numSegs + 1 ) % numSegs, ( 2 * i - 2 * numSegs + 2 ) % numSegs );

		}

	}

	// Top circle
	if ( topRad != 0 ) {

		v( 0, 0, height + topOffset );

		for ( i = numSegs + ( numSegs / 2 ); i < 2 * numSegs; i ++ ) {

			f4( ( 2 * i - 2 * numSegs + 2 ) % numSegs + numSegs, ( 2 * i - 2 * numSegs + 1 ) % numSegs + numSegs, ( 2 * i - 2 * numSegs ) % numSegs+numSegs, 2 * numSegs + 1 );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.sortFacesByMaterial();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f4( a, b, c, d ) {

		scope.faces.push( new THREE.Face4( a, b, c, d ) );

	}

};

Cylinder.prototype = new THREE.Geometry();
Cylinder.prototype.constructor = Cylinder;
/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

var Plane = function ( width, height, segments_width, segments_height ) {

	THREE.Geometry.call( this );

	var ix, iy,
	width_half = width / 2,
	height_half = height / 2,
	gridX = segments_width || 1,
	gridY = segments_height || 1,
	gridX1 = gridX + 1,
	gridY1 = gridY + 1,
	segment_width = width / gridX,
	segment_height = height / gridY;


	for( iy = 0; iy < gridY1; iy++ ) {

		for( ix = 0; ix < gridX1; ix++ ) {

			var x = ix * segment_width - width_half;
			var y = iy * segment_height - height_half;

			this.vertices.push( new THREE.Vertex( new THREE.Vector3( x, - y, 0 ) ) );

		}

	}

	for( iy = 0; iy < gridY; iy++ ) {

		for( ix = 0; ix < gridX; ix++ ) {

			var a = ix + gridX1 * iy;
			var b = ix + gridX1 * ( iy + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			var d = ( ix + 1 ) + gridX1 * iy;

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.uvs.push( [
						new THREE.UV( ix / gridX, iy / gridY ),
						new THREE.UV( ix / gridX, ( iy + 1 ) / gridY ),
						new THREE.UV( ( ix + 1 ) / gridX, ( iy + 1 ) / gridY ),
						new THREE.UV( ( ix + 1 ) / gridX, iy / gridY )
					] );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.sortFacesByMaterial();

};

Plane.prototype = new THREE.Geometry();
Plane.prototype.constructor = Plane;
/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Sphere.as
 */

var Sphere = function ( radius, segments_width, segments_height ) {

	THREE.Geometry.call( this );

	var gridX = segments_width || 8,
	gridY = segments_height || 6;

	var i, j, pi = Math.PI;
	var iHor = Math.max( 3, gridX );
	var iVer = Math.max( 2, gridY );
	var aVtc = [];

	for ( j = 0; j < ( iVer + 1 ) ; j++ ) {

		var fRad1 = j / iVer;
		var fZ = radius * Math.cos( fRad1 * pi );
		var fRds = radius * Math.sin( fRad1 * pi );
		var aRow = [];
		var oVtx = 0;

		for ( i = 0; i < iHor; i++ ) {

			var fRad2 = 2 * i / iHor;
			var fX = fRds * Math.sin( fRad2 * pi );
			var fY = fRds * Math.cos( fRad2 * pi );

			if ( !( ( j == 0 || j == iVer ) && i > 0 ) ) {

				oVtx = this.vertices.push( new THREE.Vertex( new THREE.Vector3( fY, fZ, fX ) ) ) - 1;

			}

			aRow.push( oVtx );

		}

		aVtc.push( aRow );

	}

	var n1, n2, n3, iVerNum = aVtc.length;

	for ( j = 0; j < iVerNum; j++ ) {

		var iHorNum = aVtc[ j ].length;

		if ( j > 0 ) {

			for ( i = 0; i < iHorNum; i++ ) {

				var bEnd = i == ( iHorNum - 1 );
				var aP1 = aVtc[ j ][ bEnd ? 0 : i + 1 ];
				var aP2 = aVtc[ j ][ ( bEnd ? iHorNum - 1 : i ) ];
				var aP3 = aVtc[ j - 1 ][ ( bEnd ? iHorNum - 1 : i ) ];
				var aP4 = aVtc[ j - 1 ][ bEnd ? 0 : i + 1 ];

				var fJ0 = j / ( iVerNum - 1 );
				var fJ1 = ( j - 1 ) / ( iVerNum - 1 );
				var fI0 = ( i + 1 ) / iHorNum;
				var fI1 = i / iHorNum;

				var aP1uv = new THREE.UV( 1 - fI0, fJ0 );
				var aP2uv = new THREE.UV( 1 - fI1, fJ0 );
				var aP3uv = new THREE.UV( 1 - fI1, fJ1 );
				var aP4uv = new THREE.UV( 1 - fI0, fJ1 );

				if ( j < ( aVtc.length - 1 ) ) {

					n1 = this.vertices[ aP1 ].position.clone();
					n2 = this.vertices[ aP2 ].position.clone();
					n3 = this.vertices[ aP3 ].position.clone();
					n1.normalize();
					n2.normalize();
					n3.normalize();

					this.faces.push( new THREE.Face3( aP1, aP2, aP3, [ new THREE.Vector3( n1.x, n1.y, n1.z ), new THREE.Vector3( n2.x, n2.y, n2.z ), new THREE.Vector3( n3.x, n3.y, n3.z ) ] ) );

					this.uvs.push( [ aP1uv, aP2uv, aP3uv ] );

				}

				if ( j > 1 ) {

					n1 = this.vertices[aP1].position.clone();
					n2 = this.vertices[aP3].position.clone();
					n3 = this.vertices[aP4].position.clone();
					n1.normalize();
					n2.normalize();
					n3.normalize();

					this.faces.push( new THREE.Face3( aP1, aP3, aP4, [ new THREE.Vector3( n1.x, n1.y, n1.z ), new THREE.Vector3( n2.x, n2.y, n2.z ), new THREE.Vector3( n3.x, n3.y, n3.z ) ] ) );

					this.uvs.push( [ aP1uv, aP3uv, aP4uv ] );

				}

			}
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
	this.sortFacesByMaterial();

	this.boundingSphere = { radius: radius };

};

Sphere.prototype = new THREE.Geometry();
Sphere.prototype.constructor = Sphere;
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Loader = function( showStatus ) {
	
	this.showStatus = showStatus;
	
	this.statusDomElement = showStatus ? this.addStatusElement() : null;

};

THREE.Loader.prototype = {

	addStatusElement: function ( ) {
		
		var e = document.createElement( "div" );
		
		e.style.fontSize = "0.8em"; 
		e.style.textAlign = "left";
		e.style.background = "#b00"; 
		e.style.color = "#fff"; 
		e.style.width = "140px"; 
		e.style.padding = "0.25em 0.25em 0.25em 0.5em"; 
		e.style.position = "absolute"; 
		e.style.right = "0px"; 
		e.style.top = "0px"; 
		e.style.zIndex = 1000;
		
		e.innerHTML = "Loading ...";
		
		return e;
		
	},
	
	updateProgress: function ( progress ) {

		var message = "Loaded ";

		if ( progress.total ) {

			message += ( 100 * progress.loaded / progress.total ).toFixed(0) + "%";


		} else {

			message += ( progress.loaded / 1000 ).toFixed(2) + " KB";

		}

		this.statusDomElement.innerHTML = message;

	},
	
	// Load models generated by Blender exporter and original OBJ converter (converter_obj_three.py)

	loadAsciiOld: function( url, callback ) {

		var element = document.createElement( 'script' );
		element.type = 'text/javascript';
		element.onload = callback;
		element.src = url;
		document.getElementsByTagName( "head" )[ 0 ].appendChild( element );

	},

	// Load models generated by slim OBJ converter with ASCII option (converter_obj_three_slim.py -t ascii)
	//  - parameters
	//		- model (required)
	//		- callback (required)
	//		- texture_path (optional: if not specified, textures will be assumed to be in the same folder as JS model file)

	loadAscii: function ( parameters ) {

		var url = parameters.model,
			callback = parameters.callback, 
		    texture_path = parameters.texture_path ? parameters.texture_path : THREE.Loader.prototype.extractUrlbase( url ),
		
			s = (new Date).getTime(),
			worker = new Worker( url );

		worker.onmessage = function( event ) {

			THREE.Loader.prototype.createModel( event.data, callback, texture_path );

		};

		worker.postMessage( s );

	},

	// Load models generated by slim OBJ converter with BINARY option (converter_obj_three_slim.py -t binary)
	//  - binary models consist of two files: JS and BIN
	//  - parameters
	//		- model (required)
	//		- callback (required)
	//		- bin_path (optional: if not specified, binary file will be assumed to be in the same folder as JS model file)
	//		- texture_path (optional: if not specified, textures will be assumed to be in the same folder as JS model file)

	loadBinary: function( parameters ) {
	
		// #1 load JS part via web worker

		//  This isn't really necessary, JS part is tiny,
		//  could be done by more ordinary means.

		var url = parameters.model,
			callback = parameters.callback, 
		    texture_path = parameters.texture_path ? parameters.texture_path : THREE.Loader.prototype.extractUrlbase( url ),
			bin_path = parameters.bin_path ? parameters.bin_path : THREE.Loader.prototype.extractUrlbase( url ),

			s = (new Date).getTime(),
			worker = new Worker( url ),
			callback_progress = this.showProgress ? THREE.Loader.prototype.updateProgress : null;
		
		worker.onmessage = function( event ) {

			var materials = event.data.materials,
				buffers = event.data.buffers;

			// #2 load BIN part via Ajax

			//  For some reason it is faster doing loading from here than from within the worker.
			//  Maybe passing of ginormous string as message between threads is costly? 
			//  Also, worker loading huge data by Ajax still freezes browser. Go figure, 
			//  worker with baked ascii JSON data keeps browser more responsive.

			THREE.Loader.prototype.loadAjaxBuffers( buffers, materials, callback, bin_path, texture_path, callback_progress );

		};

		worker.onerror = function (event) {

			alert( "worker.onerror: " + event.message + "\n" + event.data );
			event.preventDefault();

		};

		worker.postMessage( s );

	},

	// Binary AJAX parser based on Magi binary loader
	// https://github.com/kig/magi

	// Should look more into HTML5 File API
	// See also other suggestions by Gregg Tavares
	// https://groups.google.com/group/o3d-discuss/browse_thread/thread/a8967bc9ce1e0978

	loadAjaxBuffers: function( buffers, materials, callback, bin_path, texture_path, callback_progress ) {

		var xhr = new XMLHttpRequest(),
			url = bin_path + "/" + buffers;

		var length = 0;
		
		xhr.onreadystatechange = function() {
			
			if ( xhr.readyState == 4 ) {

				if ( xhr.status == 200 || xhr.status == 0 ) {

					THREE.Loader.prototype.createBinModel( xhr.responseText, callback, texture_path, materials );

				} else {

					alert( "Couldn't load [" + url + "] [" + xhr.status + "]" );

				}
						
			} else if ( xhr.readyState == 3 ) {
				
				if ( callback_progress ) {
				
					if ( length == 0 ) {
						
						length = xhr.getResponseHeader( "Content-Length" );
						
					}
					
					callback_progress( { total: length, loaded: xhr.responseText.length } );
					
				}
				
			} else if ( xhr.readyState == 2 ) {
				
				length = xhr.getResponseHeader( "Content-Length" );
				
			}
			
		}

		xhr.open("GET", url, true);
		xhr.overrideMimeType("text/plain; charset=x-user-defined");
		xhr.setRequestHeader("Content-Type", "text/plain");
		xhr.send(null);

	},

	createBinModel: function ( data, callback, texture_path, materials ) {

		var Model = function ( texture_path ) {

			//var s = (new Date).getTime();

			var scope = this,
				currentOffset = 0, 
				md,
				normals = [],
				uvs = [],
				tri_b, tri_c, tri_m, tri_na, tri_nb, tri_nc,
				quad_b, quad_c, quad_d, quad_m, quad_na, quad_nb, quad_nc, quad_nd,
				tri_uvb, tri_uvc, quad_uvb, quad_uvc, quad_uvd,
				start_tri_flat, start_tri_smooth, start_tri_flat_uv, start_tri_smooth_uv,
				start_quad_flat, start_quad_smooth, start_quad_flat_uv, start_quad_smooth_uv,
				tri_size, quad_size,
				len_tri_flat, len_tri_smooth, len_tri_flat_uv, len_tri_smooth_uv,
				len_quad_flat, len_quad_smooth, len_quad_flat_uv, len_quad_smooth_uv;


			THREE.Geometry.call(this);

			THREE.Loader.prototype.init_materials( scope, materials, texture_path );

			md = parseMetaData( data, currentOffset );
			currentOffset += md.header_bytes;

			// cache offsets
			
			tri_b   = md.vertex_index_bytes, 
			tri_c   = md.vertex_index_bytes*2, 
			tri_m   = md.vertex_index_bytes*3,
			tri_na  = md.vertex_index_bytes*3 + md.material_index_bytes,
			tri_nb  = md.vertex_index_bytes*3 + md.material_index_bytes + md.normal_index_bytes,
			tri_nc  = md.vertex_index_bytes*3 + md.material_index_bytes + md.normal_index_bytes*2,
		
			quad_b  = md.vertex_index_bytes,
			quad_c  = md.vertex_index_bytes*2,
			quad_d  = md.vertex_index_bytes*3,
			quad_m  = md.vertex_index_bytes*4,
			quad_na = md.vertex_index_bytes*4 + md.material_index_bytes,
			quad_nb = md.vertex_index_bytes*4 + md.material_index_bytes + md.normal_index_bytes,
			quad_nc = md.vertex_index_bytes*4 + md.material_index_bytes + md.normal_index_bytes*2,
			quad_nd = md.vertex_index_bytes*4 + md.material_index_bytes + md.normal_index_bytes*3,
		
			tri_uvb = md.uv_index_bytes,
			tri_uvc = md.uv_index_bytes * 2,
		
			quad_uvb = md.uv_index_bytes,
			quad_uvc = md.uv_index_bytes * 2,
			quad_uvd = md.uv_index_bytes * 3;
			
			// buffers sizes
			
			tri_size =  md.vertex_index_bytes * 3 + md.material_index_bytes;
			quad_size = md.vertex_index_bytes * 4 + md.material_index_bytes;

			len_tri_flat      = md.ntri_flat      * ( tri_size );
			len_tri_smooth    = md.ntri_smooth    * ( tri_size + md.normal_index_bytes * 3 );
			len_tri_flat_uv   = md.ntri_flat_uv   * ( tri_size + md.uv_index_bytes * 3 );
			len_tri_smooth_uv = md.ntri_smooth_uv * ( tri_size + md.normal_index_bytes * 3 + md.uv_index_bytes * 3 );

			len_quad_flat      = md.nquad_flat      * ( quad_size );
			len_quad_smooth    = md.nquad_smooth    * ( quad_size + md.normal_index_bytes * 4 );
			len_quad_flat_uv   = md.nquad_flat_uv   * ( quad_size + md.uv_index_bytes * 4 );
			len_quad_smooth_uv = md.nquad_smooth_uv * ( quad_size + md.normal_index_bytes * 4 + md.uv_index_bytes * 4 );
			
			// read buffers
			
			currentOffset += init_vertices( currentOffset );
			currentOffset += init_normals( currentOffset );
			currentOffset += init_uvs( currentOffset );

			start_tri_flat 		= currentOffset; 
			start_tri_smooth    = start_tri_flat    + len_tri_flat;
			start_tri_flat_uv   = start_tri_smooth  + len_tri_smooth;
			start_tri_smooth_uv = start_tri_flat_uv + len_tri_flat_uv;
			
			start_quad_flat     = start_tri_smooth_uv + len_tri_smooth_uv;
			start_quad_smooth   = start_quad_flat     + len_quad_flat;
			start_quad_flat_uv  = start_quad_smooth   + len_quad_smooth;
			start_quad_smooth_uv= start_quad_flat_uv  +len_quad_flat_uv;

			// have to first process faces with uvs
			// so that face and uv indices match
			
			init_triangles_flat_uv( start_tri_flat_uv );
			init_triangles_smooth_uv( start_tri_smooth_uv );

			init_quads_flat_uv( start_quad_flat_uv );
			init_quads_smooth_uv( start_quad_smooth_uv );

			// now we can process untextured faces
			
			init_triangles_flat( start_tri_flat );
			init_triangles_smooth( start_tri_smooth );

			init_quads_flat( start_quad_flat );
			init_quads_smooth( start_quad_smooth );

			this.computeCentroids();
			this.computeFaceNormals();
			this.sortFacesByMaterial();

			//var e = (new Date).getTime();

			//log( "binary data parse time: " + (e-s) + " ms" );

			function parseMetaData( data, offset ) {

				var metaData = {

					'signature'               :parseString( data, offset, 8 ),
					'header_bytes'            :parseUChar8( data, offset + 8 ),

					'vertex_coordinate_bytes' :parseUChar8( data, offset + 9 ),
					'normal_coordinate_bytes' :parseUChar8( data, offset + 10 ),
					'uv_coordinate_bytes'     :parseUChar8( data, offset + 11 ),

					'vertex_index_bytes'      :parseUChar8( data, offset + 12 ),
					'normal_index_bytes'      :parseUChar8( data, offset + 13 ),
					'uv_index_bytes'          :parseUChar8( data, offset + 14 ),
					'material_index_bytes'    :parseUChar8( data, offset + 15 ),

					'nvertices'    :parseUInt32( data, offset + 16 ),
					'nnormals'     :parseUInt32( data, offset + 16 + 4*1 ),
					'nuvs'         :parseUInt32( data, offset + 16 + 4*2 ),

					'ntri_flat'      :parseUInt32( data, offset + 16 + 4*3 ),
					'ntri_smooth'    :parseUInt32( data, offset + 16 + 4*4 ),
					'ntri_flat_uv'   :parseUInt32( data, offset + 16 + 4*5 ),
					'ntri_smooth_uv' :parseUInt32( data, offset + 16 + 4*6 ),

					'nquad_flat'      :parseUInt32( data, offset + 16 + 4*7 ),
					'nquad_smooth'    :parseUInt32( data, offset + 16 + 4*8 ),
					'nquad_flat_uv'   :parseUInt32( data, offset + 16 + 4*9 ),
					'nquad_smooth_uv' :parseUInt32( data, offset + 16 + 4*10 )

				};

				/*
				log( "signature: " + metaData.signature );

				log( "header_bytes: " + metaData.header_bytes );
				log( "vertex_coordinate_bytes: " + metaData.vertex_coordinate_bytes );
				log( "normal_coordinate_bytes: " + metaData.normal_coordinate_bytes );
				log( "uv_coordinate_bytes: " + metaData.uv_coordinate_bytes );

				log( "vertex_index_bytes: " + metaData.vertex_index_bytes );
				log( "normal_index_bytes: " + metaData.normal_index_bytes );
				log( "uv_index_bytes: " + metaData.uv_index_bytes );
				log( "material_index_bytes: " + metaData.material_index_bytes );

				log( "nvertices: " + metaData.nvertices );
				log( "nnormals: " + metaData.nnormals );
				log( "nuvs: " + metaData.nuvs );

				log( "ntri_flat: " + metaData.ntri_flat );
				log( "ntri_smooth: " + metaData.ntri_smooth );
				log( "ntri_flat_uv: " + metaData.ntri_flat_uv );
				log( "ntri_smooth_uv: " + metaData.ntri_smooth_uv );

				log( "nquad_flat: " + metaData.nquad_flat );
				log( "nquad_smooth: " + metaData.nquad_smooth );
				log( "nquad_flat_uv: " + metaData.nquad_flat_uv );
				log( "nquad_smooth_uv: " + metaData.nquad_smooth_uv );

				var total = metaData.header_bytes
						  + metaData.nvertices * metaData.vertex_coordinate_bytes * 3
						  + metaData.nnormals * metaData.normal_coordinate_bytes * 3
						  + metaData.nuvs * metaData.uv_coordinate_bytes * 2
						  + metaData.ntri_flat * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes )
						  + metaData.ntri_smooth * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes + metaData.normal_index_bytes*3 )
						  + metaData.ntri_flat_uv * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes + metaData.uv_index_bytes*3 )
						  + metaData.ntri_smooth_uv * ( metaData.vertex_index_bytes*3 + metaData.material_index_bytes + metaData.normal_index_bytes*3 + metaData.uv_index_bytes*3 )
						  + metaData.nquad_flat * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes )
						  + metaData.nquad_smooth * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes + metaData.normal_index_bytes*4 )
						  + metaData.nquad_flat_uv * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes + metaData.uv_index_bytes*4 )
						  + metaData.nquad_smooth_uv * ( metaData.vertex_index_bytes*4 + metaData.material_index_bytes + metaData.normal_index_bytes*4 + metaData.uv_index_bytes*4 );
				log( "total bytes: " + total );
				*/

				return metaData;

			}

			function parseString( data, offset, length ) {

				return data.substr( offset, length );

			}

			function parseFloat32( data, offset ) {

				var b3 = parseUChar8( data, offset ),
					b2 = parseUChar8( data, offset + 1 ),
					b1 = parseUChar8( data, offset + 2 ),
					b0 = parseUChar8( data, offset + 3 ),

					sign = 1 - ( 2 * ( b0 >> 7 ) ),
					exponent = ((( b0 << 1 ) & 0xff) | ( b1 >> 7 )) - 127,
					mantissa = (( b1 & 0x7f ) << 16) | (b2 << 8) | b3;

					if (mantissa == 0 && exponent == -127)
						return 0.0;

					return sign * ( 1 + mantissa * Math.pow( 2, -23 ) ) * Math.pow( 2, exponent );

			}

			function parseUInt32( data, offset ) {

				var b0 = parseUChar8( data, offset ),
					b1 = parseUChar8( data, offset + 1 ),
					b2 = parseUChar8( data, offset + 2 ),
					b3 = parseUChar8( data, offset + 3 );

				return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
			}

			function parseUInt16( data, offset ) {

				var b0 = parseUChar8( data, offset ),
					b1 = parseUChar8( data, offset + 1 );

				return (b1 << 8) + b0;

			}

			function parseSChar8( data, offset ) {

				var b = parseUChar8( data, offset );
				return b > 127 ? b - 256 : b;

			}

			function parseUChar8( data, offset ) {

				return data.charCodeAt( offset ) & 0xff;
			}

			function init_vertices( start ) {

				var i, x, y, z, 
					stride = md.vertex_coordinate_bytes * 3,
					end = start + md.nvertices * stride;

				for( i = start; i < end; i += stride ) {

					x = parseFloat32( data, i );
					y = parseFloat32( data, i + md.vertex_coordinate_bytes );
					z = parseFloat32( data, i + md.vertex_coordinate_bytes*2 );

					THREE.Loader.prototype.v( scope, x, y, z );

				}

				return md.nvertices * stride;

			}

			function init_normals( start ) {

				var i, x, y, z, 
					stride = md.normal_coordinate_bytes * 3,
					end = start + md.nnormals * stride;

				for( i = start; i < end; i += stride ) {

					x = parseSChar8( data, i );
					y = parseSChar8( data, i + md.normal_coordinate_bytes );
					z = parseSChar8( data, i + md.normal_coordinate_bytes*2 );

					normals.push( x/127, y/127, z/127 );

				}

				return md.nnormals * stride;

			}

			function init_uvs( start ) {

				var i, u, v, 
					stride = md.uv_coordinate_bytes * 2,
					end = start + md.nuvs * stride;

				for( i = start; i < end; i += stride ) {

					u = parseFloat32( data, i );
					v = parseFloat32( data, i + md.uv_coordinate_bytes );

					uvs.push( u, v );

				}
				
				return md.nuvs * stride;

			}			
			
			function add_tri( i ) {

				var a, b, c, m;

				a = parseUInt32( data, i );
				b = parseUInt32( data, i + tri_b );
				c = parseUInt32( data, i + tri_c );

				m = parseUInt16( data, i + tri_m );

				THREE.Loader.prototype.f3( scope, a, b, c, m );

			}

			function add_tri_n( i ) {

				var a, b, c, m, na, nb, nc;

				a  = parseUInt32( data, i );
				b  = parseUInt32( data, i + tri_b );
				c  = parseUInt32( data, i + tri_c );

				m  = parseUInt16( data, i + tri_m );

				na = parseUInt32( data, i + tri_na );
				nb = parseUInt32( data, i + tri_nb );
				nc = parseUInt32( data, i + tri_nc );

				THREE.Loader.prototype.f3n( scope, normals, a, b, c, m, na, nb, nc );

			}

			function add_quad( i ) {

				var a, b, c, d, m;

				a = parseUInt32( data, i );
				b = parseUInt32( data, i + quad_b );
				c = parseUInt32( data, i + quad_c );
				d = parseUInt32( data, i + quad_d );

				m = parseUInt16( data, i + quad_m );

				THREE.Loader.prototype.f4( scope, a, b, c, d, m );

			}

			function add_quad_n( i ) {

				var a, b, c, d, m, na, nb, nc, nd;

				a  = parseUInt32( data, i );
				b  = parseUInt32( data, i + quad_b );
				c  = parseUInt32( data, i + quad_c );
				d  = parseUInt32( data, i + quad_d );

				m  = parseUInt16( data, i + quad_m );

				na = parseUInt32( data, i + quad_na );
				nb = parseUInt32( data, i + quad_nb );
				nc = parseUInt32( data, i + quad_nc );
				nd = parseUInt32( data, i + quad_nd );

				THREE.Loader.prototype.f4n( scope, normals, a, b, c, d, m, na, nb, nc, nd );

			}

			function add_uv3( i ) {

				var uva, uvb, uvc, u1, u2, u3, v1, v2, v3;

				uva = parseUInt32( data, i );
				uvb = parseUInt32( data, i + tri_uvb );
				uvc = parseUInt32( data, i + tri_uvc );

				u1 = uvs[ uva*2 ];
				v1 = uvs[ uva*2 + 1 ];

				u2 = uvs[ uvb*2 ];
				v2 = uvs[ uvb*2 + 1 ];

				u3 = uvs[ uvc*2 ];
				v3 = uvs[ uvc*2 + 1 ];

				THREE.Loader.prototype.uv3( scope, u1, v1, u2, v2, u3, v3 );

			}

			function add_uv4( i ) {

				var uva, uvb, uvc, uvd, u1, u2, u3, u4, v1, v2, v3, v4;

				uva = parseUInt32( data, i );
				uvb = parseUInt32( data, i + quad_uvb );
				uvc = parseUInt32( data, i + quad_uvc );
				uvd = parseUInt32( data, i + quad_uvd );

				u1 = uvs[ uva*2 ];
				v1 = uvs[ uva*2 + 1 ];

				u2 = uvs[ uvb*2 ];
				v2 = uvs[ uvb*2 + 1 ];

				u3 = uvs[ uvc*2 ];
				v3 = uvs[ uvc*2 + 1 ];

				u4 = uvs[ uvd*2 ];
				v4 = uvs[ uvd*2 + 1 ];

				THREE.Loader.prototype.uv4( scope, u1, v1, u2, v2, u3, v3, u4, v4 );

			}

			function init_triangles_flat( start ) {

				var i, stride = md.vertex_index_bytes * 3 + md.material_index_bytes,
					end = start + md.ntri_flat * stride;

				for( i = start; i < end; i += stride ) {

					add_tri( i );

				}

				return end - start;

			}

			function init_triangles_flat_uv( start ) {

				var i, offset = md.vertex_index_bytes * 3 + md.material_index_bytes,
					stride = offset + md.uv_index_bytes * 3,
					end = start + md.ntri_flat_uv * stride;

				for( i = start; i < end; i += stride ) {

					add_tri( i );
					add_uv3( i + offset );

				}

				return end - start;

			}

			function init_triangles_smooth( start ) {

				var i, stride = md.vertex_index_bytes * 3 + md.material_index_bytes + md.normal_index_bytes * 3,
					end = start + md.ntri_smooth * stride;

				for( i = start; i < end; i += stride ) {

					add_tri_n( i );

				}

				return end - start;

			}

			function init_triangles_smooth_uv( start ) {

				var i, offset = md.vertex_index_bytes * 3 + md.material_index_bytes + md.normal_index_bytes * 3,
					stride = offset + md.uv_index_bytes * 3,
					end = start + md.ntri_smooth_uv * stride;

				for( i = start; i < end; i += stride ) {

					add_tri_n( i );
					add_uv3( i + offset );

				}

				return end - start;

			}

			function init_quads_flat( start ) {

				var i, stride = md.vertex_index_bytes * 4 + md.material_index_bytes,
					end = start + md.nquad_flat * stride;

				for( i = start; i < end; i += stride ) {

					add_quad( i );

				}

				return end - start;

			}

			function init_quads_flat_uv( start ) {

				var i, offset = md.vertex_index_bytes * 4 + md.material_index_bytes,
					stride = offset + md.uv_index_bytes * 4,
					end = start + md.nquad_flat_uv * stride;

				for( i = start; i < end; i += stride ) {

					add_quad( i );
					add_uv4( i + offset );

				}

				return end - start;

			}

			function init_quads_smooth( start ) {

				var i, stride = md.vertex_index_bytes * 4 + md.material_index_bytes + md.normal_index_bytes * 4,
					end = start + md.nquad_smooth * stride;

				for( i = start; i < end; i += stride ) {

					add_quad_n( i );
				}

				return end - start;

			}

			function init_quads_smooth_uv( start ) {

				var i, offset = md.vertex_index_bytes * 4 + md.material_index_bytes + md.normal_index_bytes * 4, 
					stride =  offset + md.uv_index_bytes * 4,
					end = start + md.nquad_smooth_uv * stride;

				for( i = start; i < end; i += stride ) {

					add_quad_n( i );
					add_uv4( i + offset );

				}

				return end - start;

			}

		}

		Model.prototype = new THREE.Geometry();
		Model.prototype.constructor = Model;

		callback( new Model( texture_path ) );

	},

	createModel: function ( data, callback, texture_path ) {

		var Model = function ( texture_path ) {

			var scope = this;

			THREE.Geometry.call( this );

			THREE.Loader.prototype.init_materials( scope, data.materials, texture_path );

			init_vertices();
			init_faces();

			this.computeCentroids();
			this.computeFaceNormals();
			this.sortFacesByMaterial();

			function init_vertices() {

				var i, l, x, y, z;

				for( i = 0, l = data.vertices.length; i < l; i += 3 ) {

					x = data.vertices[ i     ];
					y = data.vertices[ i + 1 ];
					z = data.vertices[ i + 2 ];

					THREE.Loader.prototype.v( scope, x, y, z );

				}

			}

			function init_faces() {

				function add_tri( src, i ) {

					var a, b, c, m;

					a = src[ i ];
					b = src[ i + 1 ];
					c = src[ i + 2 ];

					m = src[ i + 3 ];

					THREE.Loader.prototype.f3( scope, a, b, c, m );

				}

				function add_tri_n( src, i ) {

					var a, b, c, m, na, nb, nc;

					a  = src[ i ];
					b  = src[ i + 1 ];
					c  = src[ i + 2 ];

					m  = src[ i + 3 ];

					na = src[ i + 4 ];
					nb = src[ i + 5 ];
					nc = src[ i + 6 ];

					THREE.Loader.prototype.f3n( scope, data.normals, a, b, c, m, na, nb, nc );

				}

				function add_quad( src, i ) {

					var a, b, c, d, m;

					a = src[ i ];
					b = src[ i + 1 ];
					c = src[ i + 2 ];
					d = src[ i + 3 ];

					m = src[ i + 4 ];

					THREE.Loader.prototype.f4( scope, a, b, c, d, m );

				}

				function add_quad_n( src, i ) {

					var a, b, c, d, m, na, nb, nc, nd;

					a  = src[ i ];
					b  = src[ i + 1 ];
					c  = src[ i + 2 ];
					d  = src[ i + 3 ];

					m  = src[ i + 4 ];

					na = src[ i + 5 ];
					nb = src[ i + 6 ];
					nc = src[ i + 7 ];
					nd = src[ i + 8 ];

					THREE.Loader.prototype.f4n( scope, data.normals, a, b, c, d, m, na, nb, nc, nd );

				}

				function add_uv3( src, i ) {

					var uva, uvb, uvc, u1, u2, u3, v1, v2, v3;

					uva = src[ i ];
					uvb = src[ i + 1 ];
					uvc = src[ i + 2 ];

					u1 = data.uvs[ uva * 2 ];
					v1 = data.uvs[ uva * 2 + 1 ];

					u2 = data.uvs[ uvb * 2 ];
					v2 = data.uvs[ uvb * 2 + 1 ];

					u3 = data.uvs[ uvc * 2 ];
					v3 = data.uvs[ uvc * 2 + 1 ];

					THREE.Loader.prototype.uv3( scope, u1, v1, u2, v2, u3, v3 );

				}

				function add_uv4( src, i ) {

					var uva, uvb, uvc, uvd, u1, u2, u3, u4, v1, v2, v3, v4;

					uva = src[ i ];
					uvb = src[ i + 1 ];
					uvc = src[ i + 2 ];
					uvd = src[ i + 3 ];

					u1 = data.uvs[ uva * 2 ];
					v1 = data.uvs[ uva * 2 + 1 ];

					u2 = data.uvs[ uvb * 2 ];
					v2 = data.uvs[ uvb * 2 + 1 ];

					u3 = data.uvs[ uvc * 2 ];
					v3 = data.uvs[ uvc * 2 + 1 ];

					u4 = data.uvs[ uvd * 2 ];
					v4 = data.uvs[ uvd * 2 + 1 ];

					THREE.Loader.prototype.uv4( scope, u1, v1, u2, v2, u3, v3, u4, v4 );

				}

				var i, l;
				
				// need to process first faces with uvs
				// as uvs are indexed by face indices
				
				for ( i = 0, l = data.triangles_uv.length; i < l; i+= 7 ) {

					add_tri( data.triangles_uv, i );
					add_uv3( data.triangles_uv, i + 4 );

				}

				for ( i = 0, l = data.triangles_n_uv.length; i < l; i += 10 ) {

					add_tri_n( data.triangles_n_uv, i );
					add_uv3( data.triangles_n_uv, i + 7 );

				}
				
				for ( i = 0, l = data.quads_uv.length; i < l; i += 9 ) {

					add_quad( data.quads_uv, i );
					add_uv4( data.quads_uv, i + 5 );

				}
				
				for ( i = 0, l = data.quads_n_uv.length; i < l; i += 13 ) {

					add_quad_n( data.quads_n_uv, i );
					add_uv4( data.quads_n_uv, i + 9 );

				}
				
				// now can process untextured faces
				
				for ( i = 0, l = data.triangles.length; i < l; i += 4 ) {

					add_tri( data.triangles, i );

				}

				for ( i = 0, l = data.triangles_n.length; i < l; i += 7 ) {

					add_tri_n( data.triangles_n, i );

				}

				for ( i = 0, l = data.quads.length; i < l; i += 5 ) {

					add_quad( data.quads, i );

				}

				for ( i = 0, l = data.quads_n.length; i < l; i += 9 ) {

					add_quad_n( data.quads_n, i );

				}

			}

		}

		Model.prototype = new THREE.Geometry();
		Model.prototype.constructor = Model;

		callback( new Model( texture_path ) );

	},

	v: function( scope, x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	},

	f3: function( scope, a, b, c, mi ) {

		var material = scope.materials[ mi ];
		scope.faces.push( new THREE.Face3( a, b, c, null, material ) );

	},

	f4: function( scope, a, b, c, d, mi ) {

		var material = scope.materials[ mi ];
		scope.faces.push( new THREE.Face4( a, b, c, d, null, material ) );

	},

	f3n: function( scope, normals, a, b, c, mi, na, nb, nc ) {

		var material = scope.materials[ mi ],
			nax = normals[ na*3     ],
			nay = normals[ na*3 + 1 ],
			naz = normals[ na*3 + 2 ],

			nbx = normals[ nb*3     ],
			nby = normals[ nb*3 + 1 ],
			nbz = normals[ nb*3 + 2 ],

			ncx = normals[ nc*3     ],
			ncy = normals[ nc*3 + 1 ],
			ncz = normals[ nc*3 + 2 ];

		scope.faces.push( new THREE.Face3( a, b, c, 
						  [new THREE.Vector3( nax, nay, naz ), 
						   new THREE.Vector3( nbx, nby, nbz ), 
						   new THREE.Vector3( ncx, ncy, ncz )], 
						  material ) );

	},

	f4n: function( scope, normals, a, b, c, d, mi, na, nb, nc, nd ) {

		var material = scope.materials[ mi ],
			nax = normals[ na*3     ],
			nay = normals[ na*3 + 1 ],
			naz = normals[ na*3 + 2 ],

			nbx = normals[ nb*3     ],
			nby = normals[ nb*3 + 1 ],
			nbz = normals[ nb*3 + 2 ],

			ncx = normals[ nc*3     ],
			ncy = normals[ nc*3 + 1 ],
			ncz = normals[ nc*3 + 2 ],

			ndx = normals[ nd*3     ],
			ndy = normals[ nd*3 + 1 ],
			ndz = normals[ nd*3 + 2 ];

		scope.faces.push( new THREE.Face4( a, b, c, d,
						  [new THREE.Vector3( nax, nay, naz ), 
						   new THREE.Vector3( nbx, nby, nbz ), 
						   new THREE.Vector3( ncx, ncy, ncz ), 
						   new THREE.Vector3( ndx, ndy, ndz )], 
						  material ) );

	},

	uv3: function( scope, u1, v1, u2, v2, u3, v3 ) {

		var uv = [];
		uv.push( new THREE.UV( u1, v1 ) );
		uv.push( new THREE.UV( u2, v2 ) );
		uv.push( new THREE.UV( u3, v3 ) );
		scope.uvs.push( uv );

	},

	uv4: function( scope, u1, v1, u2, v2, u3, v3, u4, v4 ) {

		var uv = [];
		uv.push( new THREE.UV( u1, v1 ) );
		uv.push( new THREE.UV( u2, v2 ) );
		uv.push( new THREE.UV( u3, v3 ) );
		uv.push( new THREE.UV( u4, v4 ) );
		scope.uvs.push( uv );

	},

	init_materials: function( scope, materials, texture_path ) {

		scope.materials = [];

		for ( var i = 0; i < materials.length; ++i ) {

			scope.materials[i] = [ THREE.Loader.prototype.createMaterial( materials[i], texture_path ) ];

		}

	},

	createMaterial: function ( m, texture_path ) {

		function is_pow2( n ) {

			var l = Math.log(n) / Math.LN2;
			return Math.floor(l) == l;

		}

		function nearest_pow2( n ) {

			var l = Math.log(n) / Math.LN2;
			return Math.pow( 2, Math.round(l) );

		}

		var material, texture, image, color;

		if ( m.map_diffuse && texture_path ) {

			texture = document.createElement( 'canvas' );
			material = new THREE.MeshLambertMaterial( { map: new THREE.Texture( texture ) } );

			image = new Image();
			image.onload = function () {

				if ( !is_pow2( this.width ) || !is_pow2( this.height ) ) {

					var w = nearest_pow2( this.width ),
						h = nearest_pow2( this.height );

					material.map.image.width = w;
					material.map.image.height = h;
					material.map.image.getContext("2d").drawImage( this, 0, 0, w, h );

				} else {

					material.map.image = this;

				}

				material.map.image.loaded = 1;

			};

			image.src = texture_path + "/" + m.map_diffuse;

		} else if ( m.col_diffuse ) {

			color = (m.col_diffuse[0]*255 << 16) + (m.col_diffuse[1]*255 << 8) + m.col_diffuse[2]*255;
			material = new THREE.MeshLambertMaterial( { color: color, opacity: m.transparency } );

		} else if ( m.a_dbg_color ) {

			material = new THREE.MeshLambertMaterial( { color: m.a_dbg_color } );

		} else {

			material = new THREE.MeshLambertMaterial( { color: 0xeeeeee } );

		}

		return material;

	},
	
	extractUrlbase: function( url ) {
		
		var chunks = url.split( "/" );
		chunks.pop();
		return chunks.join( "/" );
		
	}

};
