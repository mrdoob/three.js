/**
 * @author Emmett Lalish / elalish
 *
 * This class generates a Prefiltered, Mipmapped Radiance Environment Map
 * (PMREM) from a cubeMap environment texture. This allows different levels of
 * blur to be quickly accessed based on material roughness. It is packed into a
 * special CubeUV format that allows us to perform custom interpolation so that
 * we can support nonlinear formats such as RGBE. Unlike a traditional mipmap
 * chain, it only goes down to the LOD_MIN level (above), and then creates extra
 * even more filtered 'mips' at the same LOD_MIN resolution, associated with
 * higher roughness levels. In this way we maintain resolution to smoothly
 * interpolate diffuse lighting while limiting sampling computation.
 */

THREE.PMREMGenerator = ( function () {

	const LOD_MIN = 4;
	const LOD_MAX = 8;
	const SIZE_MAX = Math.pow( 2, LOD_MAX );
	// The standard deviations (radians) associated with the extra mips. These are
	// chosen to approximate a Trowbridge-Reitz distribution function times the
	// geometric shadowing function.
	const EXTRA_LOD_SIGMA = [ 0.125, 0.215, 0.35, 0.446, 0.526, 0.582 ];
	const TOTAL_LODS = LOD_MAX - LOD_MIN + 1 + EXTRA_LOD_SIGMA.length;
	const ENCODINGS = {
		[ THREE.LinearEncoding ]: 0,
		[ THREE.sRGBEncoding ]: 1,
		[ THREE.RGBEEncoding ]: 2,
		[ THREE.RGBM7Encoding ]: 3,
		[ THREE.RGBM16Encoding ]: 4,
		[ THREE.RGBDEncoding ]: 5,
		[ THREE.GammaEncoding ]: 6
	  };

	var _flatCamera = new THREE.OrthographicCamera();
	var _blurMaterial = getShader();

	var { _lodPlanes, _sizeLods, _sigmas } = createPlanes();
	var _pingPongRenderTarget = null;

	// Golden Ratio
	const PHI = ( 1 + Math.sqrt( 5 ) ) / 2;
	const INV_PHI = 1 / PHI;
	// Vertices of a dodecahedron (except the opposites, which represent the
	// same axis), used as axis directions evenly spread on a sphere.
	var _axisDirections = [
		new THREE.Vector3( 1, 1, 1 ),
		new THREE.Vector3( - 1, 1, 1 ),
		new THREE.Vector3( 1, 1, - 1 ),
		new THREE.Vector3( - 1, 1, - 1 ),
		new THREE.Vector3( 0, PHI, - INV_PHI ),
		new THREE.Vector3( INV_PHI, 0, PHI ),
		new THREE.Vector3( - INV_PHI, 0, PHI ),
		new THREE.Vector3( PHI, INV_PHI, 0 ),
		new THREE.Vector3( - PHI, INV_PHI, 0 ) ];

	var PMREMGenerator = function ( renderer ) {

		this.renderer = renderer;

	};

	PMREMGenerator.prototype = {

		constructor: PMREMGenerator,

		/**
		 * Generates a PMREM from a supplied Scene, which can be faster than using an
		 * image if networking bandwidth is low. Optional near and far planes ensure
		 * the scene is rendered in its entirety (the cubeCamera is placed at the
		 * origin).
		 */
		fromScene: function ( scene, near = 0.1, far = 100 ) {

			const cubeUVRenderTarget = allocateTargets();
			sceneToCubeUV( scene, near, far, cubeUVRenderTarget );
			applyPMREM( cubeUVRenderTarget );

			_pingPongRenderTarget.dispose();
			return cubeUVRenderTarget;

		},

		/**
		 * Generates a PMREM from an equirectangular texture, which can be either LDR
		 * (RGBFormat) or HDR (RGBEFormat).
		 */
		fromEquirectangular: function ( equirectangular ) {

			equirectangular.magFilter = THREE.NearestFilter;
			equirectangular.minFilter = THREE.NearestFilter;
			equirectangular.generateMipmaps = false;

			const cubeUVRenderTarget = allocateTargets( equirectangular );
			equirectangularToCubeUV( equirectangular, cubeUVRenderTarget );
			applyPMREM( cubeUVRenderTarget );

			_pingPongRenderTarget.dispose();
			return cubeUVRenderTarget;

		},

	};

	function createPlanes() {

		var _lodPlanes = [];
		var _sizeLods = [];
		var _sigmas = [];

		let lod = LOD_MAX;
		for ( let i = 0; i < TOTAL_LODS; i ++ ) {

			const sizeLod = Math.pow( 2, lod );
			_sizeLods.push( sizeLod );
			let sigma = 1.0 / sizeLod;
			if ( i > LOD_MAX - LOD_MIN ) {

				sigma = EXTRA_LOD_SIGMA[ i - LOD_MAX + LOD_MIN - 1 ];

			} else if ( i == 0 ) {

				sigma = 0;

			}
			_sigmas.push( sigma );

			const texelSize = 1.0 / ( sizeLod - 1 );
			const min = - texelSize / 2;
			const max = 1 + texelSize / 2;
			const uv1 = [ min, min, max, min, max, max, min, min, max, max, min, max ];

			const cubeFaces = 6;
			const vertices = 6;
			const positionSize = 3;
			const uvSize = 2;
			const faceIndexSize = 1;

			const position = new Float32Array( positionSize * vertices * cubeFaces );
			const uv = new Float32Array( uvSize * vertices * cubeFaces );
			const faceIndex = new Float32Array( faceIndexSize * vertices * cubeFaces );

			for ( let face = 0; face < cubeFaces; face ++ ) {

				const x = ( face % 3 ) * 2 / 3 - 1;
				const y = face > 2 ? 0 : - 1;
				const coordinates = [
					[ x, y, 0 ],
					[ x + 2 / 3, y, 0 ],
					[ x + 2 / 3, y + 1, 0 ],
					[ x, y, 0 ],
					[ x + 2 / 3, y + 1, 0 ],
					[ x, y + 1, 0 ]
				];
				position.set( Array.concat( ...coordinates ),
					positionSize * vertices * face );
				uv.set( uv1, uvSize * vertices * face );
				const fill = [ face, face, face, face, face, face ];
				faceIndex.set( fill, faceIndexSize * vertices * face );

			}
			const planes = new THREE.BufferGeometry();
			planes.addAttribute(
				'position', new THREE.BufferAttribute( position, positionSize ) );
			planes.addAttribute( 'uv', new THREE.BufferAttribute( uv, uvSize ) );
			planes.addAttribute(
				'faceIndex', new THREE.BufferAttribute( faceIndex, faceIndexSize ) );
			_lodPlanes.push( planes );

			if ( lod > LOD_MIN ) {

				lod --;

			}

		}
		return { _lodPlanes, _sizeLods, _sigmas };

	}

	function allocateTargets( equirectangular ) {

		const params = {
		  magFilter: THREE.NearestFilter,
		  minFilter: THREE.NearestFilter,
		  generateMipmaps: false,
		  type: equirectangular ? equirectangular.type : THREE.UnsignedByteType,
		  format: equirectangular ? equirectangular.format : THREE.RGBEFormat,
		  encoding: equirectangular ? equirectangular.encoding : THREE.RGBEEncoding,
		  depthBuffer: false,
		  stencilBuffer: false
		};
		const cubeUVRenderTarget = createRenderTarget(
			{ ...params, depthBuffer: ( equirectangular ? false : true ) } );
		_pingPongRenderTarget = createRenderTarget( params );
		return cubeUVRenderTarget;

	}

	function sceneToCubeUV(
		scene, near, far,
		cubeUVRenderTarget ) {

	  const fov = 90;
	  const aspect = 1;
	  const cubeCamera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	  const upSign = [ 1, 1, 1, 1, - 1, 1 ];
	  const forwardSign = [ 1, 1, - 1, - 1, - 1, 1 ];

	  const gammaOutput = this.renderer.gammaOutput;
	  const toneMapping = this.renderer.toneMapping;
	  const toneMappingExposure = this.renderer.toneMappingExposure;

	  this.renderer.toneMapping = THREE.LinearToneMapping;
	  this.renderer.toneMappingExposure = 1.0;
	  this.renderer.gammaOutput = false;
	  scene.scale.z *= - 1;

	  this.renderer.setRenderTarget( cubeUVRenderTarget );
	  for ( let i = 0; i < 6; i ++ ) {

			const col = i % 3;
			if ( col == 0 ) {

		  cubeCamera.up.set( 0, upSign[ i ], 0 );
		  cubeCamera.lookAt( forwardSign[ i ], 0, 0 );

			} else if ( col == 1 ) {

		  cubeCamera.up.set( 0, 0, upSign[ i ] );
		  cubeCamera.lookAt( 0, forwardSign[ i ], 0 );

			} else {

		  cubeCamera.up.set( 0, upSign[ i ], 0 );
		  cubeCamera.lookAt( 0, 0, forwardSign[ i ] );

			}
			setViewport(
				col * SIZE_MAX, i > 2 ? SIZE_MAX : 0, SIZE_MAX, SIZE_MAX );
			this.renderer.render( scene, cubeCamera );

		}

	  this.renderer.toneMapping = toneMapping;
	  this.renderer.toneMappingExposure = toneMappingExposure;
	  this.renderer.gammaOutput = gammaOutput;
	  scene.scale.z *= - 1;

	}

	function equirectangularToCubeUV(
		equirectangular, cubeUVRenderTarget ) {

	  const scene = new THREE.Scene();
	  scene.add( new THREE.Mesh( _lodPlanes[ 0 ], _blurMaterial ) );
	  const uniforms = _blurMaterial.uniforms;

	  uniforms[ 'envMap' ].value = equirectangular;
	  uniforms[ 'copyEquirectangular' ].value = true;
	  uniforms[ 'texelSize' ].value.set(
		  1.0 / equirectangular.image.width, 1.0 / equirectangular.image.height );
	  uniforms[ 'inputEncoding' ].value = ENCODINGS[ equirectangular.encoding ];
	  uniforms[ 'outputEncoding' ].value = ENCODINGS[ equirectangular.encoding ];

	  this.renderer.setRenderTarget( cubeUVRenderTarget );
	  setViewport( 0, 0, 3 * SIZE_MAX, 2 * SIZE_MAX );
	  this.renderer.render( scene, _flatCamera );

	}

	function createRenderTarget( params ) {

	  const cubeUVRenderTarget =
		  new THREE.WebGLRenderTarget( 3 * SIZE_MAX, 3 * SIZE_MAX, params );
	  cubeUVRenderTarget.texture.mapping = THREE.CubeUVReflectionMapping;
	  cubeUVRenderTarget.texture.name = 'PMREM.cubeUv';
	  return cubeUVRenderTarget;

	}

	function setViewport( x, y, width, height ) {

		const dpr = this.threeRenderer.getPixelRatio();
		this.threeRenderer.setViewport( x / dpr, y / dpr, width / dpr, height / dpr );

	}

	function applyPMREM( cubeUVRenderTarget ) {

	  for ( let i = 1; i < TOTAL_LODS; i ++ ) {

			const sigma = Math.sqrt(
				_sigmas[ i ] * _sigmas[ i ] -
			_sigmas[ i - 1 ] * _sigmas[ i - 1 ] );
			const poleAxis =
			_axisDirections[ ( i - 1 ) % _axisDirections.length ];
			blur( cubeUVRenderTarget, i - 1, i, sigma, poleAxis );

		}

	}

	/**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   */
	function blur(
		cubeUVRenderTarget, lodIn, lodOut,
		sigma, poleAxis ) {

		halfBlur(
	  cubeUVRenderTarget,
	  _pingPongRenderTarget,
	  lodIn,
	  lodOut,
	  sigma,
	  'latitudinal',
	  poleAxis );

		halfBlur(
	  _pingPongRenderTarget,
	  cubeUVRenderTarget,
	  lodOut,
	  lodOut,
	  sigma,
	  'longitudinal',
	  poleAxis );

	}

	function halfBlur(
		targetIn, targetOut, lodIn,
		lodOut, sigmaRadians, direction,
		poleAxis ) {

		if ( direction !== 'latitudinal' && direction !== 'longitudinal' ) {

			console.error(
				'blur direction must be either latitudinal or longitudinal!' );

		}

		// The maximum length of the blur for loop, chosen to equal the number needed
		// for GENERATED_SIGMA. Smaller _sigmas will use fewer samples and exit early,
		// but not recompile the shader.
		const MAX_SAMPLES = 20;
		// Number of standard deviations at which to cut off the discrete approximation.
		const STANDARD_DEVIATIONS = 3;

		const blurScene = new THREE.Scene();
		blurScene.add( new THREE.Mesh( _lodPlanes[ lodOut ], _blurMaterial ) );
		const blurUniforms = _blurMaterial.uniforms;

		const pixels = _sizeLods[ lodIn ] - 1;
		const radiansPerPixel = isFinite( sigmaRadians ) ? Math.PI / ( 2 * pixels ) : 2 * Math.PI / ( 2 * MAX_SAMPLES - 1 );
		const sigmaPixels = sigmaRadians / radiansPerPixel;
		const samples = isFinite( sigmaRadians ) ? 1 + Math.floor( STANDARD_DEVIATIONS * sigmaPixels ) : MAX_SAMPLES;

		if ( samples > MAX_SAMPLES ) {

			console.warn( `sigmaRadians, ${
				sigmaRadians}, is too large and will clip, as it requested ${
				samples} samples when the maximum is set to ${MAX_SAMPLES}` );

		}

		let weights = [];
		let sum = 0;
		for ( let i = 0; i < MAX_SAMPLES; ++ i ) {

			const x = i / sigmaPixels;
			const weight = Math.exp( - x * x / 2 );
			weights.push( weight );
			if ( i == 0 ) {

	  			 sum += weight;

			} else if ( i < samples ) {

	  			sum += 2 * weight;

			}

		}
		weights = weights.map( w => w / sum );

		blurUniforms[ 'envMap' ].value = targetIn.texture;
		blurUniforms[ 'copyEquirectangular' ].value = false;
		blurUniforms[ 'samples' ].value = samples;
		blurUniforms[ 'weights' ].value = weights;
		blurUniforms[ 'latitudinal' ].value = direction === 'latitudinal';
		if ( poleAxis ) {

			blurUniforms[ 'poleAxis' ].value = poleAxis;

		}
		blurUniforms[ 'dTheta' ].value = radiansPerPixel;
		blurUniforms[ 'mipInt' ].value = LOD_MAX - lodIn;
		blurUniforms[ 'inputEncoding' ].value = ENCODINGS[ targetIn.texture.encoding ];
		blurUniforms[ 'outputEncoding' ].value = ENCODINGS[ targetIn.texture.encoding ];

		const outputSize = _sizeLods[ lodOut ];
		const x = 3 * Math.max( 0, SIZE_MAX - 2 * outputSize );
		const y = ( lodOut === 0 ? 0 : 2 * SIZE_MAX ) +
	  2 * outputSize *
		  ( lodOut > LOD_MAX - LOD_MIN ? lodOut - LOD_MAX + LOD_MIN : 0 );
		this.renderer.autoClear = false;

		this.renderer.setRenderTarget( targetOut );
		setViewport( x, y, 3 * outputSize, 2 * outputSize );
		this.renderer.render( blurScene, _flatCamera );

	}

	function getShader( maxSamples ) {

		const weights = new Float32Array( maxSamples );
		const texelSize = new THREE.Vector2( 1, 1 );
		const poleAxis = new THREE.Vector3( 0, 1, 0 );
		var shaderMaterial = new THREE.RawShaderMaterial( {

			defines: { 'n': maxSamples },

			uniforms: {
				'envMap': { value: null },
				'copyEquirectangular': { value: false },
				'texelSize': { value: texelSize },
				'samples': { value: 1 },
				'weights': { value: weights },
				'latitudinal': { value: false },
				'dTheta': { value: 0 },
				'mipInt': { value: 0 },
				'poleAxis': { value: poleAxis },
				'inputEncoding': { value: ENCODINGS[ THREE.LinearEncoding ] },
				'outputEncoding': { value: ENCODINGS[ THREE.LinearEncoding ] }
			},

			vertexShader: `
precision mediump float;
precision mediump int;
attribute vec3 position;
attribute vec2 uv;
attribute float faceIndex;
varying vec2 vUv;
varying float vFaceIndex;
void main() {
	vUv = uv;
	vFaceIndex = faceIndex;
    gl_Position = vec4( position, 1.0 );
}
      		`,

			fragmentShader: `
precision mediump float;
precision mediump int;
varying vec2 vUv;
varying float vFaceIndex;
uniform sampler2D envMap;
uniform bool copyEquirectangular;
uniform vec2 texelSize;
uniform int samples;
uniform float weights[n];
uniform bool latitudinal;
uniform float dTheta;
uniform float mipInt;
uniform vec3 poleAxis;
uniform int inputEncoding;
uniform int outputEncoding;

#include <encodings_pars_fragment>

vec4 inputTexelToLinear(vec4 value){
    if(inputEncoding == 0){
        return value;
    }else if(inputEncoding == 1){
        return sRGBToLinear(value);
    }else if(inputEncoding == 2){
        return RGBEToLinear(value);
    }else if(inputEncoding == 3){
        return RGBMToLinear(value, 7.0);
    }else if(inputEncoding == 4){
        return RGBMToLinear(value, 16.0);
    }else if(inputEncoding == 5){
        return RGBDToLinear(value, 256.0);
    }else{
        return GammaToLinear(value, 2.2);
    }
}

vec4 linearToOutputTexel(vec4 value){
    if(outputEncoding == 0){
        return value;
    }else if(outputEncoding == 1){
        return LinearTosRGB(value);
    }else if(outputEncoding == 2){
        return LinearToRGBE(value);
    }else if(outputEncoding == 3){
        return LinearToRGBM(value, 7.0);
    }else if(outputEncoding == 4){
        return LinearToRGBM(value, 16.0);
    }else if(outputEncoding == 5){
        return LinearToRGBD(value, 256.0);
    }else{
        return LinearToGamma(value, 2.2);
    }
}

vec4 envMapTexelToLinear(vec4 color) {
  return inputTexelToLinear(color);
}

#define ENVMAP_TYPE_CUBE_UV
#include <cube_uv_reflection_fragment>

#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494

void main() {
  gl_FragColor = vec4(0.0);
  outputDirection = getDirection(vUv, vFaceIndex);
  if (copyEquirectangular) {
    vec3 direction = normalize(outputDirection);
    vec2 uv;
    uv.y = asin(clamp(direction.y, -1.0, 1.0)) * RECIPROCAL_PI + 0.5;
    uv.x = atan(direction.z, direction.x) * RECIPROCAL_PI2 + 0.5;
    vec2 f = fract(uv / texelSize - 0.5);
    uv -= f * texelSize;
    vec3 tl = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
    uv.x += texelSize.x;
    vec3 tr = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
    uv.y += texelSize.y;
    vec3 br = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
    uv.x -= texelSize.x;
    vec3 bl = envMapTexelToLinear(texture2D(envMap, uv)).rgb;
    vec3 tm = mix(tl, tr, f.x);
    vec3 bm = mix(bl, br, f.x);
    gl_FragColor.rgb = mix(tm, bm, f.y);
  } else {
    for (int i = 0; i < n; i++) {
      if (i >= samples)
        break;
      for (int dir = -1; dir < 2; dir += 2) {
        if (i == 0 && dir == 1)
          continue;
        vec3 axis = latitudinal ? poleAxis : cross(poleAxis, outputDirection);
        if (all(equal(axis, vec3(0.0))))
          axis = cross(vec3(0.0, 1.0, 0.0), outputDirection);
        axis = normalize(axis);
        float theta = dTheta * float(dir * i);
        float cosTheta = cos(theta);
        // Rodrigues' axis-angle rotation
        vec3 sampleDirection = outputDirection * cosTheta 
            + cross(axis, outputDirection) * sin(theta) 
            + axis * dot(axis, outputDirection) * (1.0 - cosTheta);
        gl_FragColor.rgb +=
            weights[i] * bilinearCubeUV(envMap, sampleDirection, mipInt);
      }
    }
  }
  gl_FragColor = linearToOutputTexel(gl_FragColor);
}
     		`,

			blending: THREE.NoBlending,
			depthTest: false,
	   		depthWrite: false

		} );

		shaderMaterial.type = 'SphericalGaussianBlur';

		return shaderMaterial;

	}

	return PMREMGenerator;

} )();
