/**
 * @author Prashant Sharma / spidersharma03
 * @author Ben Houston / bhouston, https://clara.io
 */


THREE.PMREM_CubeUVPacker = function( cubeTextureLods, numLods ) {

	this.cubeLods = cubeTextureLods;
	this.numLods = numLods;
	var size = cubeTextureLods[ 0 ].width * 4;

	this.CubeUVRenderTarget = new THREE.WebGLRenderTarget( size, size,
	{ format: THREE.RGBAFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter, type:cubeTextureLods[ 0 ].type } );
	this.CubeUVRenderTarget.texture.generateMipmaps = false;
  this.CubeUVRenderTarget.mapping = THREE.CubeUVReflectionMapping;
	this.camera = new THREE.OrthographicCamera( - size * 0.5, size * 0.5, - size * 0.5, size * 0.5, 0.0, 1000 );

	this.scene = new THREE.Scene();
	this.scene.add( this.camera );

	this.objects = [];
	var xOffset = 0;
	var faceOffsets = [];
	faceOffsets.push( new THREE.Vector2( 0, 0 ) );
	faceOffsets.push( new THREE.Vector2( 1, 0 ) );
	faceOffsets.push( new THREE.Vector2( 2, 0 ) );
	faceOffsets.push( new THREE.Vector2( 0, 1 ) );
	faceOffsets.push( new THREE.Vector2( 1, 1 ) );
	faceOffsets.push( new THREE.Vector2( 2, 1 ) );
	var yOffset = 0;
	var textureResolution = size;
	size = cubeTextureLods[ 0 ].width;

	var offset2 = 0;
	var c = 4.0;
	this.numLods = Math.log2( cubeTextureLods[ 0 ].width ) - 2;
	for ( var i = 0; i < this.numLods; i ++ ) {

		var offset1 = ( textureResolution - textureResolution / c ) * 0.5;
		if ( size > 16 )
		c *= 2;
		var nMips = size > 16 ? 6 : 1;
		var mipOffsetX = 0;
		var mipOffsetY = 0;
		var mipSize = size;

    /*
    var testColor = [];
    testColor.push( new THREE.Vector3( 1, 0, 0 ) );
    testColor.push( new THREE.Vector3( 0, 1, 0 ) );
    testColor.push( new THREE.Vector3( 0, 0, 1 ) );
    testColor.push( new THREE.Vector3( 1, 1, 0 ) );
    testColor.push( new THREE.Vector3( 0, 1, 1 ) );
    testColor.push( new THREE.Vector3( 1, 0, 1 ) );
    testColor.push( new THREE.Vector3( 1, 1, 1 ) );
    testColor.push( new THREE.Vector3( 0.5, 1, 0.5 ) );*/

		for ( var j = 0; j < nMips; j ++ ) {

			// Mip Maps
			for ( var k = 0; k < 6; k ++ ) {

				// 6 Cube Faces
				var material = this.getShader();
				material.uniforms[ "envMap" ].value = this.cubeLods[ i ];
				material.envMap = this.cubeLods[ i ]
				material.uniforms[ "faceIndex" ].value = k;
				material.uniforms[ "mapSize" ].value = mipSize;
				var color = material.uniforms[ "testColor" ].value;
				//color.copy(testColor[j]);
				var planeMesh = new THREE.Mesh(
				new THREE.PlaneGeometry( mipSize, mipSize, 0 ),
				material );
				planeMesh.position.x = faceOffsets[ k ].x * mipSize - offset1 + mipOffsetX;
				planeMesh.position.y = faceOffsets[ k ].y * mipSize - offset1 + offset2 + mipOffsetY;
				planeMesh.material.side = THREE.DoubleSide;
				this.scene.add( planeMesh );
				this.objects.push( planeMesh );

			}
			mipOffsetY += 1.75 * mipSize;
			mipOffsetX += 1.25 * mipSize;
			mipSize /= 2;

		}
		offset2 += 2 * size;
		if ( size > 16 )
		size /= 2;

	}

};

THREE.PMREM_CubeUVPacker.prototype = {

	constructor : THREE.PMREM_CubeUVPacker,

	update: function( renderer ) {

		renderer.render( this.scene, this.camera, this.CubeUVRenderTarget, true );

	},

  getShader: function() {

    var shaderMaterial = new THREE.ShaderMaterial( {

      uniforms: {
       	"faceIndex": { type: 'i', value: 0 },
       	"mapSize": { type: 'f', value: 0 },
       	"envMap": { type: 't', value: null },
       	"testColor": { type: 'v3', value: new THREE.Vector3( 1, 1, 1 ) }
      },

      vertexShader:
        "precision highp float;\
         varying vec2 vUv;\
         void main() {\
            vUv = uv;\
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
         }",

      fragmentShader:
       "precision highp float;\
        varying vec2 vUv;\
        uniform samplerCube envMap;\
        uniform float mapSize;\
        uniform vec3 testColor;\
        uniform int faceIndex;\
        \
        const float PI = 3.14159265358979;\
        vec4 sampleCubeMap(float phi, float theta) {\
          float sinTheta = sin(theta);\
          float cosTheta = cos(theta);\
          vec3 sampleDir = vec3(cos(phi) * sinTheta, cosTheta, sin(phi) * sinTheta);\
          vec4 color = envMapTexelToLinear( textureCube(envMap, sampleDir) );\
          return color * vec4(testColor, 1.0);\
        }\
        void main() {\
          vec3 sampleDirection;\
          vec2 uv = vUv;\
          uv = uv * 2.0 - 1.0;\
          uv.y *= -1.0;\
          if(faceIndex == 0) {\
              sampleDirection = normalize(vec3(1.0, uv.y, -uv.x));\
          }\
          else if(faceIndex == 1) {\
              sampleDirection = normalize(vec3(uv.x, 1.0, uv.y));\
          }\
          else if(faceIndex == 2) {\
              sampleDirection = normalize(vec3(uv.x, uv.y, 1.0));\
          }\
          else if(faceIndex == 3) {\
              sampleDirection = normalize(vec3(-1.0, uv.y, uv.x));\
          }\
          else if(faceIndex == 4) {\
              sampleDirection = normalize(vec3(uv.x, -1.0, -uv.y));\
          }\
          else {\
              sampleDirection = normalize(vec3(-uv.x, uv.y, -1.0));\
          }\
          vec4 color = envMapTexelToLinear( textureCube( envMap, sampleDirection ) );\
          gl_FragColor = linearToOutputTexel( color * vec4(testColor, 1.0) );\
        }",

			blending: THREE.CustomBlending,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.ZeroFactor,
			blendSrcAlpha: THREE.OneFactor,
			blendDstAlpha: THREE.ZeroFactor,
			blendEquation: THREE.AddEquation
    });

		return shaderMaterial;

  }

};
