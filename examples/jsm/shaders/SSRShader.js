import {
  Matrix4,
  Vector2
} from "../../../build/three.module.js";
/**
 * References:
 * https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html
 */

var SSRShader = {

  defines: {
    MAX_STEP: 0,
    isPerspectiveCamera: true,
    isDistanceAttenuation: true,
    isInfiniteThick: false,
    isNoise: false,
    isSelective: false,
  },

  uniforms: {

    "tDiffuse": { value: null },
    "tNormal": { value: null },
    "tMetalness": { value: null },
    "tDepth": { value: null },
    "cameraNear": { value: null },
    "cameraFar": { value: null },
    "resolution": { value: new Vector2() },
    "cameraProjectionMatrix": { value: new Matrix4() },
    "cameraInverseProjectionMatrix": { value: new Matrix4() },
    "opacity": { value: .5 },
    "maxDistance": { value: 200 },
    "cameraRange": { value: 0 },
    "surfDist": { value: .007 },
    "thickTolerance": { value: .03 },
    "noiseIntensity": { value: .1 },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",

    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: `
		// precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		uniform sampler2D tDepth;
		uniform sampler2D tNormal;
		uniform sampler2D tMetalness;
		uniform sampler2D tDiffuse;
		uniform float cameraRange;
		uniform vec2 resolution;
		uniform float opacity;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform float maxDistance;
		uniform float surfDist;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform float thickTolerance;
		uniform float noiseIntensity;
		#include <packing>
		float getDepth( const in vec2 uv ) {
			return texture2D( tDepth, uv ).x;
		}
		float getViewZ( const in float depth ) {
			#ifdef isPerspectiveCamera
				return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
				return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}
		vec3 getViewPosition( const in vec2 uv, const in float depth/*clip space*/, const in float clipW ) {
			vec4 clipPosition = vec4( ( vec3( uv, depth ) - 0.5 ) * 2.0, 1.0 );//ndc
			clipPosition *= clipW; //clip
			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;//view
		}
		vec3 getViewNormal( const in vec2 uv ) {
			return unpackRGBToNormal( texture2D( tNormal, uv ).xyz );
		}
		vec2 viewPositionToXY(vec3 viewPosition){
			vec2 xy;
			vec4 clip=cameraProjectionMatrix*vec4(viewPosition,1);
			xy=clip.xy;//clip
			float clipW=clip.w;
			xy/=clipW;//NDC
			xy=(xy+1.)/2.;//uv
			xy*=resolution;//screen
			return xy;
		}
		vec3 hash3( float n ){
			// http://glslsandbox.com/e#61476.1
			return fract(sin(vec3(n,n+1.0,n+2.0))*vec3(43758.5453123,22578.1459123,19642.3490423));
		}
		void main(){
			#ifdef isSelective
				float metalness=texture2D(tMetalness,vUv).r;
				if(metalness==0.) return;
			#endif

			float depth = getDepth( vUv );
			float viewZ = getViewZ( depth );
			if(-viewZ>=cameraFar) return;

			float clipW = cameraProjectionMatrix[2][3] * viewZ+cameraProjectionMatrix[3][3];
			vec3 viewPosition=getViewPosition( vUv, depth, clipW );

			vec2 d0=gl_FragCoord.xy;
			vec2 d1;

			vec3 viewNormal=getViewNormal( vUv );

			#ifdef isNoise
				viewNormal+=(hash3(viewPosition.x+viewPosition.y+viewPosition.z)-.5)*noiseIntensity;
				viewNormal=normalize(viewNormal);
			#endif

			#ifdef isPerspectiveCamera
				vec3 viewIncidenceDir=normalize(viewPosition);
				vec3 viewReflectDir=reflect(viewIncidenceDir,viewNormal);
			#else
				vec3 viewIncidenceDir=vec3(0,0,-1);
				vec3 viewReflectDir=reflect(viewIncidenceDir,viewNormal);
			#endif
			// float angleCompensation=(dot(viewIncidenceDir,viewReflectDir)+1.)/2.;
			// vec3 d1viewPosition=viewPosition+viewReflectDir*(maxDistance*angleCompensation);
			vec3 d1viewPosition=viewPosition+viewReflectDir*maxDistance;
			#ifdef isPerspectiveCamera
				if(d1viewPosition.z>-cameraNear){
					//https://tutorial.math.lamar.edu/Classes/CalcIII/EqnsOfLines.aspx
					float t=(-cameraNear-viewPosition.z)/viewReflectDir.z;
					d1viewPosition=viewPosition+viewReflectDir*t;
				}
			#endif
			d1=viewPositionToXY(d1viewPosition);

			float totalLen=length(d1-d0);
			float xLen=d1.x-d0.x;
			float yLen=d1.y-d0.y;
			float totalStep=max(abs(xLen),abs(yLen));
			float xSpan=xLen/totalStep;
			float ySpan=yLen/totalStep;
			for(float i=0.;i<MAX_STEP;i++){
				if(i>=totalStep) break;
				vec2 xy=vec2(d0.x+i*xSpan,d0.y+i*ySpan);
				if(xy.x<0.||xy.x>resolution.x||xy.y<0.||xy.y>resolution.y) break;
				float s=length(xy-d0)/totalLen;
				vec2 uv=xy/resolution;

				float d = getDepth(uv);
				float vZ = getViewZ( d );
				if(-vZ>=cameraFar) continue;
				float cW = cameraProjectionMatrix[2][3] * vZ+cameraProjectionMatrix[3][3];
				vec3 vP=getViewPosition( uv, d, cW );

				#ifdef isPerspectiveCamera
					// https://www.comp.nus.edu.sg/~lowkl/publications/lowk_persp_interp_techrep.pdf
					float recipVPZ=1./viewPosition.z;
					float viewReflectRayZ=1./(recipVPZ+s*(1./d1viewPosition.z-recipVPZ));
					float sD=surfDist*cW;
				#else
				float viewReflectRayZ=viewPosition.z+s*(d1viewPosition.z-viewPosition.z);
					float sD=surfDist;
				#endif

				#ifdef isInfiniteThick
					if(viewReflectRayZ+thickTolerance*clipW<vP.z) break;
				#endif
				float away=abs(viewReflectRayZ-vZ);

				float op=opacity;
				#ifdef isDistanceAttenuation
					float one_minus_s=1.-s;
					float attenuation=one_minus_s*one_minus_s;
					op=opacity*attenuation;
				#endif

				if(away<sD){
					vec3 vN=getViewNormal( uv );
					if(dot(viewReflectDir,vN)>=0.) continue;
					vec4 reflectColor=texture2D(tDiffuse,uv);
					gl_FragColor.xyz=reflectColor.xyz;
					gl_FragColor.a=op;
					break;
				}
			}
		}
	`

};

var SSRDepthShader = {

  defines: {
    "PERSPECTIVE_CAMERA": 1
  },

  uniforms: {

    "tDepth": { value: null },
    "cameraNear": { value: null },
    "cameraFar": { value: null },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDepth;",

    "uniform float cameraNear;",
    "uniform float cameraFar;",

    "varying vec2 vUv;",

    "#include <packing>",

		"float getLinearDepth( const in vec2 uv ) {",

		"	#if PERSPECTIVE_CAMERA == 1",

		"		float fragCoordZ = texture2D( tDepth, uv ).x;",
		"		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );",
		"		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );",

		"	#else",

		"		return texture2D( tDepth, uv ).x;",

		"	#endif",

		"}",

    "void main() {",

    "	float depth = getLinearDepth( vUv );",
    "	gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );",

    "}"

  ].join("\n")

};

var SSRBlurShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "resolution": { value: new Vector2() },
    "opacity": { value: .5 },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",

    "uniform vec2 resolution;",

    "varying vec2 vUv;",

    "void main() {",

    "	vec2 texelSize = ( 1.0 / resolution );",
    "	vec4 result = vec4(0);",

    "	for ( int i = - 2; i <= 2; i ++ ) {",

    "		for ( int j = - 2; j <= 2; j ++ ) {",

    "			vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;",
    "			result += texture2D( tDiffuse, vUv + offset );",

    "		}",

    "	}",

    "	gl_FragColor = vec4(  result / ( 25.0 ) ); // 25.0 = 5.0 * 5.0",

    "}"

  ].join("\n")

};

export { SSRShader, SSRDepthShader, SSRBlurShader };
