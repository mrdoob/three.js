import {
  Matrix4,
  Vector2
} from "../../../build/three.module.js";
/**
 * References:
 * https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html
 */

var OrthographicSSRShader = {

  defines: {
    "PERSPECTIVE_CAMERA": 1,
  },

  uniforms: {

    "tDiffuse": { value: null },
    "tNormal": { value: null },
    "tDepth": { value: null },
    "cameraNear": { value: null },
    "cameraFar": { value: null },
    "resolution": { value: new Vector2() },
    "cameraProjectionMatrix": { value: new Matrix4() },
    "cameraInverseProjectionMatrix": { value: new Matrix4() },
    "opacity": { value: .5 },
    "minDistance": { value: 0.005 },
    "maxDistance": { value: 1 },
    "cameraRange": { value: 0 },
    "frustumSize": { value: 0 },
    // "stepStride": { value: null },
    "surfDist": { value: null },
    "isFade": { value: null },
    "fadeIntensity": { value: null },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",

    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: `
		#define MAX_STEP TO_BE_REPLACE
		varying vec2 vUv;
		uniform sampler2D tDepth;
		uniform sampler2D tNormal;
		uniform sampler2D tDiffuse;
		uniform float cameraNear;
		uniform float cameraRange;
		uniform float frustumSize;
		uniform vec2 resolution;
		uniform float opacity;
		uniform float maxDistance;//uv unit
		// uniform float stepStride;
		uniform float surfDist;
		uniform bool isFade;
		uniform float fadeIntensity;
		float depthToDistance(float depth){
			return depth*cameraRange+cameraNear;
		}
		vec3 getPos(vec2 uv,float depth){
			vec3 pos;
			vec3 viewDir=vec3(0,0,-1);
			float distance=depthToDistance(depth)/frustumSize;
			vec3 viewRay=viewDir*distance;
			pos=vec3(uv,0)+viewRay;
			return pos;
		}
		vec3 getPos(vec2 uv){
			float depth=texture2D(tDepth,uv).r;
			return getPos(uv,depth);
		}
		void main(){
			//use uv unit/coordinate primarily

			float depth=texture2D(tDepth,vUv).r;
			if(depth<=0.) return;
			vec2 d0=gl_FragCoord.xy;
			vec2 d1;
			vec3 pos=getPos(vUv,depth);

			vec3 normal=texture2D(tNormal,vUv).xyz*2.-1.;
			vec3 reflectDir=reflect(vec3(0,0,-1),normal);
			d1=d0+(reflectDir*maxDistance).xy*resolution;
			float totalLen=length(d1-d0);
			float xLen=d1.x-d0.x;
			float yLen=d1.y-d0.y;
			float totalStep=max(abs(xLen),abs(yLen));
			float xSpan=xLen/totalStep;
			float ySpan=yLen/totalStep;
			for(float i=0.;i<MAX_STEP;i++){
				if(i>=totalStep) break;
				vec2 xy=vec2(d0.x+i*xSpan,d0.y+i*ySpan);
				if(xy.x<0.||xy.x>resolution.x) break;
				if(xy.y<0.||xy.y>resolution.y) break;
				vec2 uv=xy/resolution;
				vec3 p=getPos(uv);
				vec3 ray=(length(xy-d0)/totalLen)*(reflectDir*maxDistance);
				float op=opacity;
				if(isFade){
					op=opacity*(1.-length(ray)*fadeIntensity);
					if(op<=.0) break;
				}
				vec3 rayPos=pos+ray;
				float away=length(rayPos-p);
				if(away<surfDist){
					vec3 n=texture2D(tNormal,uv).xyz*2.-1.;
					if(dot(reflectDir,n)>=0.) continue;
					vec4 reflectColor=texture2D(tDiffuse,uv);
					gl_FragColor=vec4(reflectColor.xyz,op);
					break;
				}
			}
		}
	`

};

var OrthographicSSRDepthShader = {

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

    "float getLinearDepth( const in vec2 screenPosition ) {",

    "	#if PERSPECTIVE_CAMERA == 1",

    "		float fragCoordZ = texture2D( tDepth, screenPosition ).x;",
    "		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );",
    "		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );",

    "	#else",

    "		return texture2D( depthSampler, coord ).x;",

    "	#endif",

    "}",

    "void main() {",

    "	float depth = getLinearDepth( vUv );",
    "	gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );",

    "}"

  ].join("\n")

};

var OrthographicSSRBlurShader = {

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

    "	gl_FragColor = vec4(  result / ( 5.0 * 5.0 ) );",

    "}"

  ].join("\n")

};

export { OrthographicSSRShader, OrthographicSSRDepthShader, OrthographicSSRBlurShader };
