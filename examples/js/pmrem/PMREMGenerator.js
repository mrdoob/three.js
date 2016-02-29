/**
 * @author Prashant Sharma / spidersharma03
 * @author Ben Houston / bhouston, https://clara.io
 */

 THREE.PMREMGenerator = function( cubeTexture ) {
	if ( cubeTexture instanceof THREE.CubeTexture ) {

		if ( cubeTexture.images[ 0 ] === undefined )
		  console.error( "CubeTexture Not Initialized" );
      if(cubeTexture.images[ 0 ] instanceof THREE.DataTexture) {
          this.resolution = cubeTexture.images[ 0 ].image.width;
      }
      else {
          this.resolution = cubeTexture.images[ 0 ].width;
      }

	}
	else if ( cubeTexture instanceof THREE.WebGLRenderTargetCube ) {
		if ( cubeTexture === undefined ) console.error( "Render Target Not Initialized" );
		this.resolution = cubeTexture.width;
	}
	else {
		console.error( "Wrong Input to PMREMGenerator" );
	}
	this.sourceTexture = cubeTexture;

	this.cubeLods = [];

	var size = this.resolution;
  var params = { format: this.sourceTexture.format, magFilter: this.sourceTexture.magFilter, minFilter: this.sourceTexture.minFilter, type: this.sourceTexture.type };

	this.numLods = Math.log2( size ) - 2;
  for ( var i = 0; i < this.numLods; i ++ ) {
		var renderTarget = new THREE.WebGLRenderTargetCube( size, size, params );
		renderTarget.texture.generateMipmaps = this.sourceTexture.generateMipmaps;
    renderTarget.texture.anisotropy = this.sourceTexture.anisotropy;
    renderTarget.texture.encoding = this.sourceTexture.encoding;
    renderTarget.texture.minFilter = this.sourceTexture.minFilter;
    renderTarget.texture.magFilter = this.sourceTexture.magFilter;
		this.cubeLods.push( renderTarget );
		size = Math.max( 16, size / 2 );
	}

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0.0, 1000 );

  this.shader = this.getShader();
	this.planeMesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2, 0 ), this.shader );
	this.planeMesh.material.side = THREE.DoubleSide;
	this.scene = new THREE.Scene();
	this.scene.add( this.planeMesh );
	this.scene.add( this.camera );

	this.shader.uniforms[ "envMap" ].value = this.sourceTexture;
  this.shader.envMap = this.sourceTexture;
};

THREE.PMREMGenerator.prototype = {

	constructor : THREE.PMREMGenerator,

	update: function( renderer ) {

		this.shader.uniforms[ "envMap" ].value = this.sourceTexture;
    this.shader.envMap = this.sourceTexture;

    var gammaInput = renderer.gammaInput;
    var gammaOutput = renderer.gammaOutput;
    renderer.gammaInput = false;
    renderer.gammaOutput = false;
		for ( var i = 0; i < this.numLods; i ++ ) {

			var r = i / ( this.numLods - 1 );
			this.shader.uniforms[ "roughness" ].value = r * 0.9;
			var size = this.cubeLods[ i ].width;
			this.shader.uniforms[ "mapSize" ].value = size;
			this.renderToCubeMapTarget( renderer, this.cubeLods[ i ] );
			if ( i < 5 )
			this.shader.uniforms[ "envMap" ].value = this.cubeLods[ i ];

		}

    renderer.gammaInput = renderer.gammaInput;
    renderer.gammaOutput = renderer.gammaOutput;

	},

	renderToCubeMapTarget: function( renderer, renderTarget ) {

		for ( var i = 0; i < 6; i ++ ) {
		  this.renderToCubeMapTargetFace( renderer, renderTarget, i )
    }

	},

	renderToCubeMapTargetFace: function( renderer, renderTarget, faceIndex ) {
		renderTarget.activeCubeFace = faceIndex;
		this.shader.uniforms[ "faceIndex" ].value = faceIndex;
		renderer.render( this.scene, this.camera, renderTarget, true );

	},

  getShader: function() {

    return new THREE.ShaderMaterial( {

      uniforms: {
        "faceIndex": { type: 'i', value: 0 },
        "roughness": { type: 'f', value: 0.5 },
        "mapSize": { type: 'f', value: 0.5 },
        "envMap": { type: 't', value: null },
        "testColor": { type: 'v3', value: new THREE.Vector3( 1, 1, 1 ) }
      },

      vertexShader:
        "varying vec2 vUv;\n\
        void main() {\n\
           vUv = uv;\n\
           gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
        }",

      fragmentShader:
        "varying vec2 vUv;\n\
        uniform int faceIndex;\n\
        uniform float roughness;\n\
        uniform samplerCube envMap;\n\
        uniform float mapSize;\n\
        uniform vec3 testColor;\n\
        \n\
        float rnd(vec2 uv) {\n\
           return fract(sin(dot(uv, vec2(12.9898, 78.233) * 2.0)) * 43758.5453);\n\
        }\n\
        float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n\
           float a = ggxRoughness + 0.0001;\n\
           a *= a;\n\
           return ( 2.0 / a - 2.0 );\n\
        }\n\
        const float PI = 3.14159265358979;\n\
        vec3 ImportanceSamplePhong(vec2 uv, mat3 vecSpace, float specPow) {\n\
           float phi = uv.y * 2.0 * PI;\n\
           float cosTheta = pow(1.0 - uv.x, 1.0 / (specPow + 1.0));\n\
           float sinTheta = sqrt(1.0 - cosTheta * cosTheta);\n\
           vec3 sampleDir = vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);\n\
           return vecSpace * sampleDir;\n\
        }\n\
        vec3 ImportanceSampleGGX( vec2 uv, mat3 vecSpace, float Roughness )\n\
        {\n\
               float a = Roughness * Roughness;\n\
               float Phi = 2.0 * PI * uv.x;\n\
               float CosTheta = sqrt( (1.0 - uv.y) / ( 1.0 + (a*a - 1.0) * uv.y ) );\n\
               float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );\n\
               return vecSpace * vec3(SinTheta * cos( Phi ), SinTheta * sin( Phi ), CosTheta);\n\
        }\n\
        mat3 matrixFromVector(vec3 n) {\n\
           float a = 1.0 / (1.0 + n.z);\n\
           float b = -n.x * n.y * a;\n\
           vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);\n\
           vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);\n\
           return mat3(b1, b2, n);\n\
        }\n\
        \n\
        vec4 testColorMap(float Roughness) {\n\
           vec4 color;\n\
           if(faceIndex == 0)\n\
               color = vec4(1.0,0.0,0.0,1.0);\n\
           else if(faceIndex == 1)\n\
               color = vec4(0.0,1.0,0.0,1.0);\n\
           else if(faceIndex == 2)\n\
               color = vec4(0.0,0.0,1.0,1.0);\n\
           else if(faceIndex == 3)\n\
               color = vec4(1.0,1.0,0.0,1.0);\n\
           else if(faceIndex == 4)\n\
               color = vec4(0.0,1.0,1.0,1.0);\n\
           else\n\
               color = vec4(1.0,0.0,1.0,1.0);\n\
           color *= ( 1.0 - Roughness );\n\
           return color;\n\
        }\n\
        void main() {\n\
           vec3 sampleDirection;\n\
           vec2 uv = vUv*2.0 - 1.0;\n\
           float offset = -1.0/mapSize;\n\
           const float a = -1.0;\n\
           const float b = 1.0;\n\
           float c = -1.0 + offset;\n\
           float d = 1.0 - offset;\n\
           float bminusa = b - a;\n\
           uv.x = (uv.x - a)/bminusa * d - (uv.x - b)/bminusa * c;\n\
           uv.y = (uv.y - a)/bminusa * d - (uv.y - b)/bminusa * c;\n\
           if (faceIndex==0) {\n\
               sampleDirection = vec3(1.0, -uv.y, -uv.x);\n\
           }\n\
           else if (faceIndex==1) {\n\
               sampleDirection = vec3(-1.0, -uv.y, uv.x);\n\
           } else if (faceIndex==2) {\n\
               sampleDirection = vec3(uv.x, 1.0, uv.y);\n\
           } else if (faceIndex==3) {\n\
               sampleDirection = vec3(uv.x, -1.0, -uv.y);\n\
           } else if (faceIndex==4) {\n\
               sampleDirection = vec3(uv.x, -uv.y, 1.0);\n\
           } else {\n\
               sampleDirection = vec3(-uv.x, -uv.y, -1.0);\n\
           }\n\
           mat3 vecSpace = matrixFromVector(normalize(sampleDirection));\n\
           vec3 rgbColor = vec3(0.0);\n\
           const int NumSamples = 1024;\n\
           vec3 vect;\n\
           float weight = 0.0;\n\
           for(int i=0; i<NumSamples; i++) {\n\
               float sini = sin(float(i));\n\
               float cosi = cos(float(i));\n\
               float rand = rnd(vec2(sini, cosi));\n\
               vect = ImportanceSampleGGX(vec2(float(i) / float(NumSamples), rand), vecSpace, roughness);\n\
               float dotProd = dot(vect, normalize(sampleDirection));\n\
               weight += dotProd;\n\
               vec3 color = envMapTexelToLinear(textureCube(envMap,vect)).rgb;\n\
               rgbColor.rgb += color;\n\
           }\n\
           rgbColor /= float(NumSamples);\n\
           //rgbColor = testColorMap( roughness ).rgb;\n\
           gl_FragColor = linearToOutputTexel( vec4( rgbColor, 1.0 ) );\n\
        }",
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.ZeroFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.ZeroFactor,
        blendEquation: THREE.AddEquation
      }
    );
  }
};
