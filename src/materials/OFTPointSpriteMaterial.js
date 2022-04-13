import { ShaderMaterial } from './ShaderMaterial.js';
import { AdditiveBlending } from '../constants.js';

/**
 * Point Sprite Materials Extension
 *
 * Specification: https://github.com/oppenfuture/glTF/tree/pointSprite/extensions/2.0/Vendor/OFT_materials_pointSprite
 */
class OFTPointSpriteMaterial extends ShaderMaterial {

	constructor( params ) {

		const localParams = {

			vertexShader: /* glsl */`
			attribute float size;

			uniform float pointSize;

			varying vec4 vColor;
			varying float vIntensity;
			varying float vRandom;
			varying vec4 vMvpPosition;

			#define PI 3.14159265359
			#define PI2 6.28318530718

			const float Threshold = 0.65;

			highp float rand( const in vec2 uv ) {
				const highp float a = 12.9898, b = 78.233, c = 43758.5453;
				highp float dt = dot( uv.xy, vec2( a, b ) ), sn = mod( dt, PI );
				return fract(sin(sn) * c);
			}

			void main() {

				vColor.rgb = color.rgb;

				vRandom = rand(position.xy);
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				vec3 ViewPosition = - mvPosition.xyz;
				vec3 viewDir = normalize(ViewPosition);

				vec3 n = normalize(normalMatrix * normal);
				float dotNV = dot(viewDir, n);
				// cos func to liner func
				vIntensity = 1.0 - acos(dotNV);
				// map Threshold ~ 1.0 to 0 ~ 1.0
				vIntensity = vIntensity < Threshold ? 0.0 : (vIntensity - Threshold) / (1.0 - Threshold);
				// sharp the curve
				vIntensity = pow(vIntensity, 1.1);

				vColor.a = 0.2 + vIntensity * 0.8;

				gl_Position = projectionMatrix * mvPosition;

				vMvpPosition = gl_Position;
				gl_PointSize = ((vRandom * 0.2 + 1.8) * pointSize) * vIntensity * (0.5/-mvPosition.z);

			}
			`,
			fragmentShader: /* glsl */`
			precision highp float;
			#include <packing>

			#define PI 3.14159265359
			#define PI2 6.28318530718

			uniform sampler2D pointTexture;
			uniform sampler2D depthTexture;
			uniform float depthBias;

			varying vec4 vColor;
			varying float vRandom;
			varying float vDotNV;
			varying float vIntensity;
			varying vec4 vMvpPosition;

			vec2 rotateUV(vec2 uv, float rotation) {
				float mid = 0.5;
				return vec2(
					cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
					cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
				);
			}

			vec3 rgb2hsv(vec3 c) {
				vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
				vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
				vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

				float d = q.x - min(q.w, q.y);
				float e = 1.0e-10;
				return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
			}

			vec3 hsv2rgb(vec3 c) {
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}

			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, 0.1, 2.0 );
				return viewZToOrthographicDepth( viewZ, 0.1, 2.0 );
			}

			void main() {
				vec3 projCoords = vMvpPosition.xyz / vMvpPosition.w;
				projCoords = projCoords * 0.5 + 0.5;
				float depth = unpackRGBAToDepth(texture2D(depthTexture, projCoords.xy));
				if (projCoords.z - depth >= depthBias) discard;

				if (vIntensity <= 0.0) discard;
				gl_FragColor = vColor;
				vec2 rotateUv = rotateUV(gl_PointCoord, vRandom * vIntensity * PI * 0.6);
				rotateUv = clamp(rotateUv, 0.0, 1.0);
				gl_FragColor = gl_FragColor * mapTexelToLinear(texture2D( pointTexture, rotateUv ));

				#include <encodings_fragment>
			}
			`,

			blending: AdditiveBlending,
			depthTest: false,
			transparent: true,
			vertexColors: true

		};

		super( localParams );

		if ( params != undefined ) {

			this._pointSize = params.pointSize || 50;
			this._depthBias = params.depthBias || 0.001;
			this._pointTexture = params.pointTexture || null;
			this._depthTexture = params.depthTexture || null;

		}

		this.uniforms = {

			pointSize: { value: this.pointSize },
			pointTexture: { value: this.pointTexture },
			depthTexture: { value: this.depthTexture },
			depthBias: { value: this.depthBias }

		};

		this.type = 'OFTPointSpriteMaterial';

	}

	get pointSize() {

		return this._pointSize;

	}

	set pointSize( value ) {

		this._pointSize = value;
		this.uniforms.pointSize.value = value;

	}

	get depthBias() {

		return this._depthBias;

	}

	set depthBias( value ) {

		this._depthBias = value;
		this.uniforms.depthBias.value = value;

	}

	// enable code injection: mapTexelToLinear
	get map() {

		return this._pointTexture;

	}

	get pointTexture() {

		return this._pointTexture;

	}

	set pointTexture( value ) {

		this._pointTexture = value;
		this.uniforms.pointTexture.value = value;

	}

	get depthTexture() {

		return this._depthTexture;

	}

	set depthTexture( value ) {

		this._depthTexture = value;
		this.uniforms.depthTexture.value = value;

	}

}

OFTPointSpriteMaterial.prototype.isOFTPointSpriteMaterial = true;

export { OFTPointSpriteMaterial };
