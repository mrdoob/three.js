"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.GodRaysFakeSunShader = THREE.GodRaysCombineShader = THREE.GodRaysGenerateShader = THREE.GodRaysDepthMaskShader = void 0;
var GodRaysDepthMaskShader = {
  uniforms: {
    tInput: {
      value: null
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", " vUv = uv;", " gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["varying vec2 vUv;", "uniform sampler2D tInput;", "void main() {", "	gl_FragColor = vec4( 1.0 ) - texture2D( tInput, vUv );", "}"].join("\n")
};
THREE.GodRaysDepthMaskShader = GodRaysDepthMaskShader;
var GodRaysGenerateShader = {
  uniforms: {
    tInput: {
      value: null
    },
    fStepSize: {
      value: 1.0
    },
    vSunPositionScreenSpace: {
      value: new THREE.Vector3()
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", " vUv = uv;", " gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["#define TAPS_PER_PASS 6.0", "varying vec2 vUv;", "uniform sampler2D tInput;", "uniform vec3 vSunPositionScreenSpace;", "uniform float fStepSize;", "void main() {", "	vec2 delta = vSunPositionScreenSpace.xy - vUv;", "	float dist = length( delta );", "	vec2 stepv = fStepSize * delta / dist;", "	float iters = dist/fStepSize;", "	vec2 uv = vUv.xy;", "	float col = 0.0;", "	float f = min( 1.0, max( vSunPositionScreenSpace.z / 1000.0, 0.0 ) );", "	if ( 0.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r * f;", "	uv += stepv;", "	if ( 1.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r * f;", "	uv += stepv;", "	if ( 2.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r * f;", "	uv += stepv;", "	if ( 3.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r * f;", "	uv += stepv;", "	if ( 4.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r * f;", "	uv += stepv;", "	if ( 5.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r * f;", "	uv += stepv;", "	gl_FragColor = vec4( col/TAPS_PER_PASS );", "	gl_FragColor.a = 1.0;", "}"].join("\n")
};
THREE.GodRaysGenerateShader = GodRaysGenerateShader;
var GodRaysCombineShader = {
  uniforms: {
    tColors: {
      value: null
    },
    tGodRays: {
      value: null
    },
    fGodRayIntensity: {
      value: 0.69
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "	vUv = uv;", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["varying vec2 vUv;", "uniform sampler2D tColors;", "uniform sampler2D tGodRays;", "uniform float fGodRayIntensity;", "void main() {", "	gl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity * vec4( 1.0 - texture2D( tGodRays, vUv ).r );", "	gl_FragColor.a = 1.0;", "}"].join("\n")
};
THREE.GodRaysCombineShader = GodRaysCombineShader;
var GodRaysFakeSunShader = {
  uniforms: {
    vSunPositionScreenSpace: {
      value: new Vector3()
    },
    fAspect: {
      value: 1.0
    },
    sunColor: {
      value: new THREE.Color(0xffee00)
    },
    bgColor: {
      value: new Color(0x000000)
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "	vUv = uv;", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["varying vec2 vUv;", "uniform vec3 vSunPositionScreenSpace;", "uniform float fAspect;", "uniform vec3 sunColor;", "uniform vec3 bgColor;", "void main() {", "	vec2 diff = vUv - vSunPositionScreenSpace.xy;", "	diff.x *= fAspect;", "	float prop = clamp( length( diff ) / 0.5, 0.0, 1.0 );", "	prop = 0.35 * pow( 1.0 - prop, 3.0 );", "	gl_FragColor.xyz = ( vSunPositionScreenSpace.z > 0.0 ) ? mix( sunColor, bgColor, 1.0 - prop ) : bgColor;", "	gl_FragColor.w = 1.0;", "}"].join("\n")
};
THREE.GodRaysFakeSunShader = GodRaysFakeSunShader;