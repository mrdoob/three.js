import {
  Matrix4,
  Vector2
} from "../../../build/three.module.js";
/**
 * References:
 * http://john-chapman-graphics.blogspot.com/2013/01/ssr-tutorial.html
 * https://learnopengl.com/Advanced-Lighting/SSR
 * https://github.com/McNopper/OpenGL/blob/master/Example28/shader/ssr.frag.glsl
 */

var SSRShader = {

  defines: {
    "PERSPECTIVE_CAMERA": 1,
    "KERNEL_SIZE": 32
  },

  uniforms: {

    "tDiffuse": { value: null },
    "tNormal": { value: null },
    "tDepth": { value: null },
    "tNoise": { value: null },
    "kernel": { value: null },
    "cameraNear": { value: null },
    "cameraFar": { value: null },
    "resolution": { value: new Vector2() },
    "cameraProjectionMatrix": { value: new Matrix4() },
    "cameraInverseProjectionMatrix": { value: new Matrix4() },
    "kernelRadius": { value: 8 },
    "minDistance": { value: 0.005 },
    "maxDistance": { value: 0.05 },
    "cameraNear2": { value: 0 },
    "cameraRange": { value: 0 },
    "UVWR": { value: 0 },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",

    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: `
		#define MAX_DISTuv 1. //uv unit
		#define MAX_STEP ${innerWidth * Math.sqrt(2)}
		#define SURF_DISTuv .01
		varying vec2 vUv;
		uniform sampler2D tDepth;
		uniform sampler2D tNormal;
		uniform sampler2D tDiffuse;
		uniform float cameraRange;
		uniform float cameraNear2;
		uniform float UVWR; //uv unit to world unit ratio
		float depthToDistance(float depth){
			return (1.-depth)*cameraRange+cameraNear2;
		}
		vec3 getPos(vec2 uv,float depth){
			vec3 pos;
			vec3 viewDir=vec3(0,0,-1);
			float distance=depthToDistance(depth)/UVWR;
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
			vec2 uv=vUv;

			// gl_FragColor=texture2D(tDepth,uv);
			// gl_FragColor=texture2D(tNormal,uv);
			// gl_FragColor=texture2D(tDiffuse,uv);
			// gl_FragColor=texture2D(tNormal,uv)*2.-1.;
			// gl_FragColor.x=abs(gl_FragColor.x);
			// gl_FragColor=vec4(depthToDistance(texture2D(tDepth,uv).r)/UVWR);
			// gl_FragColor.a=1.;
			// return;

			// vec4 color=texture2D(tDiffuse,uv);
			// vec4 reflectDiffuse;
			// gl_FragColor=color;

			float depth=texture2D(tDepth,uv).r;
			if(depth<=0.) return;
			vec2 d0=gl_FragCoord.xy;
			vec2 d1;
			vec3 pos=getPos(uv,depth);
			// gl_FragColor.xyz=abs(pos);
			// gl_FragColor.a=1.;
			// return;

			vec3 normal=texture2D(tNormal,uv).xyz*2.-1.;//screen rigth always red
			vec3 reflectDir=reflect(vec3(0,0,-1),normal);
			// float reflectDirLen=length(reflectDir);
			// if(reflectDirLen<=0.) return;
			// reflectDir.x=abs(reflectDir.x);
			// reflectDir=normalize(vec3(-1,-1,0));
			d1=d0+(reflectDir*MAX_DISTuv).xy*vec2(${innerWidth}.,${innerHeight}.);
			float totalLen=length(d1-d0);
			float xLen=d1.x-d0.x;
			float yLen=d1.y-d0.y;
			float totalStep=max(abs(xLen),abs(yLen));
			float xSpan=xLen/totalStep;
			float ySpan=yLen/totalStep;
			for(float i=0.;i<MAX_STEP;i++){
				if(i>=totalStep) break;
				float x=d0.x+i*xSpan;
				float y=d0.y+i*ySpan;
				if(x<0.||x>${innerWidth}.) break;
				if(y<0.||y>${innerHeight}.) break;
				float u=x/${innerWidth}.;
				float v=y/${innerHeight}.;
				vec3 p=getPos(vec2(u,v));
				vec3 rayPos=pos+(length(vec2(x,y)-d0)/totalLen)*(reflectDir*MAX_DISTuv);
				float away=length(rayPos-p);
				if(away<SURF_DISTuv){
					// float d=texture2D(tDepth,vec2(u,v)).r;
					// if(d<=0.) continue;
					vec3 n=texture2D(tNormal,vec2(u,v)).xyz*2.-1.;
					// gl_FragColor=vec4(dot(reflectDir,n));
					// gl_FragColor.a=1.;
					// break;
					if(dot(reflectDir,n)>=0.) continue;
					// gl_FragColor=vec4(away*100.,0,0,1);
					// break;
					// gl_FragColor=vec4(u,v,0,1);
					// break;
					vec4 reflect=texture2D(tDiffuse,vec2(u,v));
					// gl_FragColor=color;
					gl_FragColor=reflect;
					gl_FragColor.a=.5;
					// gl_FragColor=mix(color,reflect,.5);
					// gl_FragColor=vec4(u,v,0,1);
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

var SSRBlurShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "resolution": { value: new Vector2() }

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
    "	vec3 result = vec3(0);",

    "	for ( int i = - 2; i <= 2; i ++ ) {",

    "		for ( int j = - 2; j <= 2; j ++ ) {",

    "			vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;",
    "			result += texture2D( tDiffuse, vUv + offset ).xyz;",

    "		}",

    "	}",

    "	gl_FragColor = vec4(  result / ( 5.0 * 5.0 ) , 1.0 );",

    "}"

  ].join("\n")

};

export { SSRShader, SSRDepthShader, SSRBlurShader };
