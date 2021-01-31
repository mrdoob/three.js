import {
  Matrix4,
} from "../../../build/three.module.js";

var WorldPositionShader = {

  defines: {
  },

  uniforms: {

    "tDepth": { value: null },
    "cameraNear": { value: null },
    "cameraFar": { value: null },
    "cameraMatrix": { value: null },
    "cameraProjectionMatrix": { value: new Matrix4() },
    "cameraInverseProjectionMatrix": { value: new Matrix4() },

  },

  vertexShader: /* glsl */`

    varying vec2 vUv;

    void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }

  `,

  fragmentShader: /* glsl */`
		// precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraMatrix;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		#include <packing>
		float getDepth( const in vec2 uv ) {
			return texture2D( tDepth, uv ).x;
		}
		float getViewZ( const in float depth ) {
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
		}
		vec3 getViewPosition( const in vec2 uv, const in float depth/*clip space*/, const in float clipW ) {
			vec4 clipPosition = vec4( ( vec3( uv, depth ) - 0.5 ) * 2.0, 1.0 );//ndc
			clipPosition *= clipW; //clip
			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;//view
		}
		void main(){
			float depth = getDepth( vUv );
			float viewZ = getViewZ( depth );
			if(-viewZ>=cameraFar) return;
			float clipW = cameraProjectionMatrix[2][3] * viewZ+cameraProjectionMatrix[3][3];
			vec3 viewPosition=getViewPosition( vUv, depth, clipW );
			vec3 worldPosition=(cameraMatrix*vec4(viewPosition,1)).xyz;
			gl_FragColor=vec4(worldPosition,1);return;
		}
	`
};

var WorldNormalShader = {

  defines: {
  },

  uniforms: {

    "tNormal": { value: null },
    "cameraRotationMatrix": { value: null },

  },

  vertexShader: /* glsl */`

    varying vec2 vUv;

    void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }

  `,

  fragmentShader: /* glsl */`
		// precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		uniform sampler2D tNormal;
		uniform mat4 cameraRotationMatrix;
		#include <packing>
		vec3 getViewNormal( const in vec2 uv ) {
			return unpackRGBToNormal( texture2D( tNormal, uv ).xyz );
		}
		void main(){
			vec3 viewNormal=getViewNormal( vUv );
			// viewNormal=normalize(viewNormal);
			// gl_FragColor=vec4(viewNormal,1);return;
			vec3 worldNormal=(cameraRotationMatrix*vec4(viewNormal,1)).xyz;
			// worldNormal=normalize(worldNormal);
			gl_FragColor=vec4(worldNormal,1);return;
		}
	`
};

export { WorldPositionShader, WorldNormalShader };
