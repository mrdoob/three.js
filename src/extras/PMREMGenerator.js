/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*
 * To avoid cube map seams, I create an extra pixel around each face. This way when the cube map is
 * sampled by an application later(with a little care by sampling the centre of the texel), the extra 1 border
 *  of pixels makes sure that there is no seams artifacts present. This works perfectly for cubeUV format as
 *  well where the 6 faces can be arranged in any manner whatsoever.
 * Code in the beginning of fragment shader's main function does this job for a given resolution.
 *  Run Scene_PMREM_Test.html in the examples directory to see the sampling from the cube lods generated
 *  by this class.
 */
var vertexShaderPMREM = "varying vec2 vUv;\
                   void main() {\
                        vUv = uv;\
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
                   }";

var fragmentShaderPMREM = "varying vec2 vUv;\
                    uniform int faceIndex;\
                    uniform float roughness;\
                    uniform samplerCube sourceTexture;\
                    uniform float mapSize;\
                    uniform vec3 testColor;\
                    \
                    float rnd(vec2 uv) {\
                        return fract(sin(dot(uv, vec2(12.9898, 78.233) * 2.0)) * 43758.5453);\
                    }\
                    float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\
                        float a = ggxRoughness + 0.0001;\
                        a *= a;\
                        return ( 2.0 / a - 2.0 );\
                    }\
                    const float PI = 3.14159265358979;\
                    vec3 ImportanceSamplePhong(vec2 uv, mat3 vecSpace, float specPow) {\
                        float phi = uv.y * 2.0 * PI;\
                        float cosTheta = pow(1.0 - uv.x, 1.0 / (specPow + 1.0));\
                        float sinTheta = sqrt(1.0 - cosTheta * cosTheta);\
                        vec3 sampleDir = vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);\
                        return vecSpace * sampleDir;\
                    }\
                    vec3 ImportanceSampleGGX( vec2 uv, mat3 vecSpace, float Roughness )\
                    {\
                            float a = Roughness * Roughness;\
                            float Phi = 2.0 * PI * uv.x;\
                            float CosTheta = sqrt( (1.0 - uv.y) / ( 1.0 + (a*a - 1.0) * uv.y ) );\
                            float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );\
                            return vecSpace * vec3(SinTheta * cos( Phi ), SinTheta * sin( Phi ), CosTheta);\
                    }\
                    mat3 matrixFromVector(vec3 n) {\
                        float a = 1.0 / (1.0 + n.z);\
                        float b = -n.x * n.y * a;\
                        vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);\
                        vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);\
                        return mat3(b1, b2, n);\
                    }\
                    \
                    vec4 testColorMap() {\
                        vec4 color;\
                        if(faceIndex == 0)\
                            color = vec4(1.0,0.0,0.0,1.0);\
                        else if(faceIndex == 1)\
                            color = vec4(0.0,1.0,0.0,1.0);\
                        else if(faceIndex == 2)\
                            color = vec4(0.0,0.0,1.0,1.0);\
                        else if(faceIndex == 3)\
                            color = vec4(1.0,1.0,0.0,1.0);\
                        else if(faceIndex == 4)\
                            color = vec4(0.0,1.0,1.0,1.0);\
                        else\
                            color = vec4(1.0,0.0,1.0,1.0);\n\
                        return color;\
                    }\
                    \
                    void main() {\
                        vec3 sampleDirection;\
                        vec2 uv = vUv*2.0 - 1.0;\
                        float offset = -1.0/mapSize;\
                        const float a = -1.0;\
                        const float b = 1.0;\
                        float c = -1.0 + offset;\
                        float d = 1.0 - offset;\
                        float bminusa = b - a;\
                        uv.x = (uv.x - a)/bminusa * d - (uv.x - b)/bminusa * c;\
                        uv.y = (uv.y - a)/bminusa * d - (uv.y - b)/bminusa * c;\
                        if (faceIndex==0) {\
                            sampleDirection = vec3(1.0, -uv.y, -uv.x);\
                        }\
                        else if (faceIndex==1) {\
                            sampleDirection = vec3(-1.0, -uv.y, uv.x);\
                        } else if (faceIndex==2) {\
                            sampleDirection = vec3(uv.x, 1.0, uv.y);\
                        } else if (faceIndex==3) {\
                            sampleDirection = vec3(uv.x, -1.0, -uv.y);\
                        } else if (faceIndex==4) {\
                            sampleDirection = vec3(uv.x, -uv.y, 1.0);\
                        } else {\
                            sampleDirection = vec3(-uv.x, -uv.y, -1.0);\
                        }\
                        mat3 vecSpace = matrixFromVector(normalize(sampleDirection));\
                        vec3 color = vec3(0.0);\
                        const int NumSamples = 32;\
                        vec3 vect;\
                        float weight = 0.0;\
                        for(int i=0; i<NumSamples; i++) {\
                            float sini = sin(float(i));\
                            float cosi = cos(float(i));\
                            float rand = rnd(vec2(sini, cosi));\
                            vect = ImportanceSampleGGX(vec2(float(i) / float(NumSamples), rand), vecSpace, roughness);\
                            float dotProd = dot(vect, normalize(sampleDirection));\
                            weight += dotProd;\
                            color += textureCube(sourceTexture, vect).rgb * dotProd;\
                        }\
                        color /= float(weight);\
                        gl_FragColor = vec4( color, 1.0);\
                   }";

var materialPMREM = new THREE.ShaderMaterial(
        {
	uniforms: {
		"faceIndex": { type: 'i', value: 0 },
		"roughness": { type: 'f', value: 0.5 },
		"mapSize": { type: 'f', value: 0.5 },
		"sourceTexture": { type: 't', value: null },
		"testColor": { type: 'v3', value: new THREE.Vector3( 1, 1, 1 ) }
	},
	vertexShader: vertexShaderPMREM,
	fragmentShader: fragmentShaderPMREM
        }
);

var PMREMGenerator = function( cubeTexture ) {

	if ( cubeTexture instanceof THREE.CubeTexture ) {

		if ( cubeTexture.images[ 0 ] === undefined )
		console.error( "CubeTexture Not Initialized" );
		this.resolution = cubeTexture.images[ 0 ].width;

	}
	else if ( cubeTexture instanceof THREE.WebGLRenderTargetCube ) {

		if ( cubeTexture === undefined )
		console.error( "Render Target Not Initialized" );
		this.resolution = cubeTexture.width;

	}
	else {

		console.error( "Wrong Input to PMREMGenerator" );

	}
	this.sourceTexture = cubeTexture;
	this.cubeLods = [];
	var size = this.resolution;
	this.numLods = Math.log2( size ) - 2;
	for ( var i = 0; i < this.numLods; i ++ ) {

		var renderTarget = new THREE.WebGLRenderTargetCube( size, size,
		{ format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter } );
		renderTarget.texture.generateMipmaps = false;
		this.cubeLods.push( renderTarget );
		if ( size > 16 )
		size /= 2;

	}

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0.0, 1000 );

	this.planeMesh = new THREE.Mesh(
	new THREE.PlaneGeometry( 2, 2, 0 ),
	materialPMREM );
	this.planeMesh.material.side = THREE.DoubleSide;
	this.scene = new THREE.Scene();
	this.scene.add( this.planeMesh );
	this.scene.add( this.camera );

	materialPMREM.uniforms[ "sourceTexture" ].value = this.sourceTexture;

};

PMREMGenerator.prototype = {
	constructor : PMREMGenerator,

	/*
	     * More thought and work is needed here.
	     * Right now it's a kind of a hack to use the previously convolved map to convolve the current one.
	     * I tried to use the original map to convolve all the lods, but for many textures(specially the high frequency)
	     * even a high number of samples(1024) dosen't lead to satisfactory results.
	     * By using the previous convolved maps, a lower number of samples are generally sufficient(right now 32, which
	     * gives okay results unless we see the reflection very carefully, or zoom in too much), however the math
	     * goes wrong as the distribution function tries to sample a larger area than what it should be. So I simply scaled
	     * the roughness by 0.9(totally empirical) to try to visually match the original result.
	     * The condition "if(i <5)" is also an attemt to make the result match the original result.
	     * This method requires the most amount of thinking I guess. Here is a paper which we could try to implement in future::
	     * http://http.developer.nvidia.com/GPUGems3/gpugems3_ch20.html
	     */
	update: function( renderer ) {

		materialPMREM.uniforms[ "sourceTexture" ].value = this.sourceTexture;
		for ( var i = 0; i < this.numLods; i ++ ) {

			var r = i / ( this.numLods - 1 );
			materialPMREM.uniforms[ "roughness" ].value = r * 0.9;
			var size = this.cubeLods[ i ].width;
			materialPMREM.uniforms[ "mapSize" ].value = size;
			this.renderToCubeMapTarget( renderer, this.cubeLods[ i ] );
			if ( i < 5 )
			materialPMREM.uniforms[ "sourceTexture" ].value = this.cubeLods[ i ];

		}

	},

	renderToCubeMapTarget: function( renderer, renderTarget ) {

		for ( var i = 0; i < 6; i ++ )
		this.renderToCubeMapTargetFace( renderer, renderTarget, i )

	},

	renderToCubeMapTargetFace: function( renderer, renderTarget, faceIndex ) {

		renderTarget.texture.generateMipmaps = false;
		renderTarget.activeCubeFace = faceIndex;
		materialPMREM.uniforms[ "faceIndex" ].value = faceIndex;
		renderer.render( this.scene, this.camera, renderTarget, true );

	}
};
