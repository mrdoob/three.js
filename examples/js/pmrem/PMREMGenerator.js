/**
 * @author Prashant Sharma / spidersharma03
 * @author Ben Houston / bhouston, https://clara.io
 *
 * To avoid cube map seams, I create an extra pixel around each face. This way when the cube map is
 * sampled by an application later(with a little care by sampling the centre of the texel), the extra 1 border
 *	of pixels makes sure that there is no seams artifacts present. This works perfectly for cubeUV format as
 *	well where the 6 faces can be arranged in any manner whatsoever.
 * Code in the beginning of fragment shader's main function does this job for a given resolution.
 */

THREE.PMREMGenerator = ( function () {

	var shader = getShader();
	var camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0.0, 1000 );
	var scene = new THREE.Scene();
	var planeMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2, 0 ), shader );
	planeMesh.material.side = THREE.DoubleSide;
	scene.add( planeMesh );
	scene.add( camera );

	var PMREMGenerator = function ( sourceTexture, params = {} ) {

		this.sourceTexture = sourceTexture;
		this.sourceResolution = ( params.sourceResolution !== undefined ) ? params.sourceResolution : 512;
		this.targetResolution = ( params.targetResolution !== undefined ) ? params.targetResolution : 256; // NODE: 256 is currently hard coded in the glsl code for performance reasons
		this.samplesPerLevel = ( params.samplesPerLevel !== undefined ) ? params.samplesPerLevel : 32;
		this.useImportanceSampling = ( params.useImportanceSampling !== undefined ) ? params.useImportanceSampling : false;

		var monotonicEncoding = ( this.sourceTexture.encoding === THREE.LinearEncoding ) ||
			( this.sourceTexture.encoding === THREE.GammaEncoding ) || ( this.sourceTexture.encoding === THREE.sRGBEncoding );

		this.sourceTexture.minFilter = ( monotonicEncoding ) ? THREE.LinearFilter : THREE.NearestFilter;
		this.sourceTexture.magFilter = ( monotonicEncoding ) ? THREE.LinearFilter : THREE.NearestFilter;
		this.sourceTexture.generateMipmaps = this.sourceTexture.generateMipmaps && monotonicEncoding;

		this.cubeLods = [];

		var size = this.targetResolution;
		var params = {
			format: this.sourceTexture.format,
			magFilter: this.sourceTexture.magFilter,
			minFilter: this.sourceTexture.minFilter,
			type: this.sourceTexture.type,
			generateMipmaps: this.sourceTexture.generateMipmaps,
			anisotropy: this.sourceTexture.anisotropy,
			encoding: this.sourceTexture.encoding
		 };

		// how many LODs fit in the given CubeUV Texture.
		this.numLods = Math.log( size ) / Math.log( 2 ) - 2; // IE11 doesn't support Math.log2

		for ( var i = 0; i < this.numLods; i ++ ) {

			var renderTarget = new THREE.WebGLRenderTargetCube( size, size, params );
			renderTarget.texture.name = "PMREMGenerator.cube" + i;
			this.cubeLods.push( renderTarget );
			size = Math.max( 16, size / 2 );

		}

		var extraUniforms = this.useImportanceSampling? getImportanceSamplingUniforms() : getRandomSamplingUniforms();
		shader.uniforms = Object.assign(getBaseUniforms(), extraUniforms);

		var shaderMain = this.useImportanceSampling? getImportanceSamplingFragmentShader() : getRandomSamplingShader();
		shader.fragmentShader = getBaseFragmentShader() + shaderMain;

	};

	PMREMGenerator.prototype = {

		constructor: PMREMGenerator,

		update: function ( renderer ) {

			// Texture should only be flipped for CubeTexture, not for
			// a Texture created via THREE.WebGLRenderTargetCube.
			var tFlip = ( this.sourceTexture.isCubeTexture ) ? - 1 : 1;

			shader.defines[ 'SAMPLES_PER_LEVEL' ] = this.samplesPerLevel;
			shader.uniforms[ 'faceIndex' ].value = 0;
			shader.uniforms[ 'envMap' ].value = this.sourceTexture;
			shader.envMap = this.sourceTexture;
			if ( this.useImportanceSampling ) {

				shader.uniforms[ 'sourceResolution' ].value = this.sourceResolution;

			}
			shader.needsUpdate = true;

			var gammaInput = renderer.gammaInput;
			var gammaOutput = renderer.gammaOutput;
			var toneMapping = renderer.toneMapping;
			var toneMappingExposure = renderer.toneMappingExposure;
			var currentRenderTarget = renderer.getRenderTarget();

			renderer.toneMapping = THREE.LinearToneMapping;
			renderer.toneMappingExposure = 1.0;
			renderer.gammaInput = false;
			renderer.gammaOutput = false;

			for ( var i = 0; i < this.numLods; i ++ ) {

				var r = i / ( this.numLods - 1 );
				if ( this.useImportanceSampling ) {

					shader.uniforms[ 'roughness' ].value = r;

				} else {

					shader.uniforms[ 'roughness' ].value = r * 0.9; // see comment below, pragmatic choice

				}
				// Only apply the tFlip for the first LOD
				shader.uniforms[ 'tFlip' ].value = ( i == 0 ) ? tFlip : 1;
				shader.uniforms[ 'mapSize' ].value = this.cubeLods[ i ].width;
				this.renderToCubeMapTarget( renderer, this.cubeLods[ i ] );

				if ( !this.useImportanceSampling && i < 5 ) shader.uniforms[ 'envMap' ].value = this.cubeLods[ i ].texture;

			}

			renderer.setRenderTarget( currentRenderTarget );
			renderer.toneMapping = toneMapping;
			renderer.toneMappingExposure = toneMappingExposure;
			renderer.gammaInput = gammaInput;
			renderer.gammaOutput = gammaOutput;

		},

		renderToCubeMapTarget: function ( renderer, renderTarget ) {

			for ( var i = 0; i < 6; i ++ ) {

				this.renderToCubeMapTargetFace( renderer, renderTarget, i );

			}

		},

		renderToCubeMapTargetFace: function ( renderer, renderTarget, faceIndex ) {

			renderTarget.activeCubeFace = faceIndex;
			shader.uniforms[ 'faceIndex' ].value = faceIndex;
			renderer.render( scene, camera, renderTarget, true );

		},

		dispose: function () {

			for ( var i = 0, l = this.cubeLods.length; i < l; i ++ ) {

				this.cubeLods[ i ].dispose();

			}

		},

	};

	function getShader() {

		var shaderMaterial = new THREE.ShaderMaterial( {

			defines: {
				"SAMPLES_PER_LEVEL": 20,
			},

			uniforms: { },

			vertexShader:
				"varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader: "",

			blending: THREE.NoBlending

		} );

		shaderMaterial.type = 'PMREMGenerator';

		return shaderMaterial;

	}

	function getBaseUniforms() {

		return {
			"faceIndex": { value: 0 },
			"roughness": { value: 0.5 },
			"mapSize": { value: 0.5 },
			"envMap": { value: null },
			"tFlip": { value: - 1 },
		};
	}

	function getBaseFragmentShader() {

		return `#include <common>
			varying vec2 vUv;
			uniform int faceIndex;
			uniform float roughness;
			uniform float mapSize;
			uniform samplerCube envMap;
			uniform float tFlip;
			mat3 MatrixFromVector(vec3 n) {
				float a = 1.0 / (1.0 + n.z);
				float b = -n.x * n.y * a;
				vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);
				vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);
				return mat3(b1, b2, n);
			}
			vec3 GetSampleDirection() {
				vec2 uv = vUv*2.0 - 1.0;
				float offset = -1.0/mapSize;
				const float a = -1.0;
				const float b = 1.0;
				float c = -1.0 + offset;
				float d = 1.0 - offset;
				float bminusa = b - a;
				uv.x = (uv.x - a)/bminusa * d - (uv.x - b)/bminusa * c;
				uv.y = (uv.y - a)/bminusa * d - (uv.y - b)/bminusa * c;
				if (faceIndex==0) {
					return vec3(tFlip * 1.0, -uv.y, -uv.x);
				} else if (faceIndex==1) {
					return vec3(tFlip * -1.0, -uv.y, uv.x);
				} else if (faceIndex==2) {
					return vec3(tFlip * uv.x, 1.0, uv.y);
				} else if (faceIndex==3) {
					return vec3(tFlip * uv.x, -1.0, -uv.y);
				} else if (faceIndex==4) {
					return vec3(tFlip * uv.x, -uv.y, 1.0);
				} else {
					return vec3(tFlip * -uv.x, -uv.y, -1.0);
				}
			}
			vec3 testColorMap() {
				vec3 color;
				if(faceIndex == 0)
					color = vec3(1.0,0.0,0.0);
				else if(faceIndex == 1)
					color = vec3(0.0,1.0,0.0);
				else if(faceIndex == 2)
					color = vec3(0.0,0.0,1.0);
				else if(faceIndex == 3)
					color = vec3(1.0,1.0,0.0);
				else if(faceIndex == 4)
					color = vec3(0.0,1.0,1.0);
				else
					color = vec3(1.0,0.0,1.0);
				color *= ( 1.0 - roughness );
				return color;
			}
			vec3 ImportanceSampleGGX(vec2 Xi, mat3 vecSpace)
			{
				float a = roughness * roughness;
				float Phi = 2.0 * PI * Xi.x;
				float CosTheta = sqrt( (1.0 - Xi.y) / ( 1.0 + (a*a - 1.0) * Xi.y ) );
				float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );
				return vecSpace * vec3(SinTheta * cos( Phi ), SinTheta * sin( Phi ), CosTheta);
			}
		`

	}

	function getRandomSamplingUniforms() {

		return { };

	}

	function getRandomSamplingShader() {

		/*
		 * Prashant Sharma / spidersharma03: More thought and work is needed here.
		 * Right now it's a kind of a hack to use the previously convolved map to convolve the current one.
		 * I tried to use the original map to convolve all the lods, but for many textures(specially the high frequency)
		 * even a high number of samples(1024) dosen't lead to satisfactory results.
		 * By using the previous convolved maps, a lower number of samples are generally sufficient(right now 32, which
		 * gives okay results unless we see the reflection very carefully, or zoom in too much), however the math
		 * goes wrong as the distribution function tries to sample a larger area than what it should be. So I simply scaled
		 * the roughness by 0.9(totally empirical) to try to visually match the original result.
		 * The condition "if(i <5)" is also an attemt to make the result match the original result.
		 * This method requires the most amount of thinking I guess. Here is a paper which we could try to implement in future::
		 * https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch20.html
		 */
		return `
			void main() {
				vec3 sampleDirection = GetSampleDirection();
				mat3 vecSpace = MatrixFromVector( normalize( sampleDirection ) );
				vec3 rgbColor = vec3(0.0);
				const int NumSamples = SAMPLES_PER_LEVEL;
				vec3 vect;
				float weight = 0.0;
				for( int i = 0; i < NumSamples; i ++ ) {
					float sini = sin(float(i));
					float cosi = cos(float(i));
					float r = rand(vec2(sini, cosi));
					vect = ImportanceSampleGGX(vec2(float(i) / float(NumSamples), r), vecSpace);
					float dotProd = dot(vect, normalize(sampleDirection));
					weight += dotProd;
					vec3 color = envMapTexelToLinear(textureCube(envMap, vect)).rgb;
					rgbColor.rgb += color;
				}
				rgbColor /= float(NumSamples);
				//rgbColor = testColorMap( roughness ).rgb;
				gl_FragColor = linearToOutputTexel( vec4( rgbColor, 1.0 ) );
			}
		`;

	}

	function getImportanceSamplingUniforms() {

		return { "sourceResolution": { value : 256.0 } };

	}

	function getImportanceSamplingFragmentShader() {

		/* Andrew Khosravian: Hammersley2d functionality from 
		 * https://learnopengl.com/PBR/IBL/Specular-IBL
		 * more info at 
		 * https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
		 */
		return `
			uniform float sourceResolution;
			/*
			float RadicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}
			*/
			// slow version using mod since glsl es 2.0 doesn't support bit operations
			float RadicalInverse_VdC(int bits) {
				float result = 0.0;
				float denom = 1.0;
				float invBase = 0.5;
				for (int i = 0; i < 32; ++i) {
					denom = mod(float(bits), 2.0);
					result += denom * invBase;
					invBase *= 0.5;
					bits = int(float(bits) * 0.5);
					if (bits == 0) break;
				}
				return result;
			}
			vec2 Hammersley2d(/*uint*/int i, /*uint*/int N) {
				return vec2(float(i)/float(N), RadicalInverse_VdC(i) + rand(vUv)/float(N));
			}
			float DistributionGGX(float NdotH) {
				float rSq = roughness * roughness;
				float NdotHSq = NdotH * NdotH;
				return rSq / pow(NdotHSq * (rSq - 1.0) + 1.0, 2.0);
			}
			void main() {
				vec3 sampleDirection = GetSampleDirection();
				vec3 N = normalize(sampleDirection);
				vec3 V = N;
				mat3 vecSpace = MatrixFromVector(N);
				vec3 rgbColor = vec3(0.0);
				const int NumSamples = SAMPLES_PER_LEVEL;
				float solidAngleOfTexel = 4.0 * PI / (6.0 * sourceResolution * sourceResolution);
				float weight = 0.0;
				for( int i = 0; i < NumSamples; i ++ ) {
					vec2 Xi = Hammersley2d(i, NumSamples);
					vec3 H = ImportanceSampleGGX(Xi, vecSpace);
					vec3 L = -reflect(V, H);
					float NdotL = saturate(dot(N, L));
					float NdotH = saturate(dot(N, H));
					float HdotV = saturate(dot(H, V));
					if (NdotL > 0.0) {
						float D = DistributionGGX(NdotH);
						float pdf = (D * NdotH / (4.0 * HdotV));
						float solidAngleOfSample = 1.0 / (float(SAMPLES_PER_LEVEL) * pdf);
						float mipLevel = roughness == 0.0 ? 0.0 : 0.5 * log2(solidAngleOfSample / solidAngleOfTexel);
						rgbColor.rgb += envMapTexelToLinear(textureCube(envMap, L, mipLevel)).rgb * NdotL;
						weight += NdotL;
					}
				}
				if (weight > 0.0) {
					rgbColor /= weight;
				}
				//rgbColor = testColorMap();
				gl_FragColor = linearToOutputTexel( vec4( rgbColor, 1.0 ) );
			}`;

	}

	return PMREMGenerator;

} )();
