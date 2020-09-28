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
    "maxDistance": { value: 0.05 },
    "cameraRange": { value: 0 },
    "surfDist": { value: 0 },
    "isSelective": { value: null },
    "isPerspectiveCamera": { value: null },
    "isDistanceAttenuation": { value: null },
    "attenuationDistance": { value: null },

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",

    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: `
		precision highp float;
		precision highp sampler2D;
		#define MAX_STEP TO_BE_REPLACE
		varying vec2 vUv;
		uniform sampler2D tDepth;
		uniform sampler2D tNormal;
		uniform sampler2D tMetalness;
		uniform sampler2D tDiffuse;
		uniform bool isSelective;
		uniform float cameraRange;
		uniform vec2 resolution;
		uniform float opacity;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform float maxDistance;
		uniform float surfDist;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform bool isPerspectiveCamera;
		uniform bool isDistanceAttenuation;
		uniform float attenuationDistance;
		#include <packing>
		float getDepth( const in vec2 screenPosition ) {
			return texture2D( tDepth, screenPosition ).x;
		}
		float getLinearDepth( const in vec2 screenPosition ) {
			float fragCoordZ = texture2D( tDepth, screenPosition ).x;
			float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
			return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
		}
		float getViewZ( const in float depth ) {
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
		}
		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ, const in float clipW ) {
			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
			clipPosition *= clipW; // unprojection.
			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
		}
		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			return getViewPosition(screenPosition, depth, viewZ, clipW);
		}
		vec3 getViewNormal( const in vec2 screenPosition ) {
			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );
		}
		vec2 viewPositionToXY(vec3 viewPosition){
			vec2 xy;
			vec4 clip=cameraProjectionMatrix*vec4(viewPosition,1);
			xy=clip.xy;//clip
			float clipW=clip.w;
			xy/=clipW;//NDC
			xy+=1.;
			xy/=2.;
			xy*=resolution;
			return xy;
		}
		vec3 lineLineIntersection(vec3 line1Point1, vec3 line1Point2,
			vec3 line2Point1, vec3 line2Point2)
		{
			// http://paulbourke.net/geometry/pointlineplane/calclineline.cs
			// http://paulbourke.net/geometry/pointlineplane/
			// https://stackoverflow.com/a/2316934/3596736

			/////////////////////////////////////////////////////////////////////////////////////

		  // Algorithm is ported from the C algorithm of
		  // Paul Bourke at http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline3d/
		  vec3 resultSegmentPoint1 = vec3(0,0,0);
		  // resultSegmentPoint2 = vec3(0,0,0);

		  vec3 p1 = line1Point1;
		  vec3 p2 = line1Point2;
		  vec3 p3 = line2Point1;
		  vec3 p4 = line2Point2;
		  vec3 p13 = p1 - p3;
		  vec3 p43 = p4 - p3;

		  vec3 p21 = p2 - p1;

		  float d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
		  float d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
		  float d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
		  float d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
		  float d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

		  float denom = d2121 * d4343 - d4321 * d4321;
		  float numer = d1343 * d4321 - d1321 * d4343;

		  float mua = numer / denom;
		  // float mub = (d1343 + d4321 * (mua)) / d4343;

		  resultSegmentPoint1.x = p1.x + mua * p21.x;
		  resultSegmentPoint1.y = p1.y + mua * p21.y;
		  resultSegmentPoint1.z = p1.z + mua * p21.z;
		  // resultSegmentPoint2.x = p3.x + mub * p43.x;
		  // resultSegmentPoint2.y = p3.y + mub * p43.y;
		  // resultSegmentPoint2.z = p3.z + mub * p43.z;

			return resultSegmentPoint1;
		}
		void main(){
			if(isSelective){
				float metalness=texture2D(tMetalness,vUv).r;
				if(metalness==0.) return;
			}

			float depth = getDepth( vUv );
			float viewZ = getViewZ( depth );
			if(-viewZ>=cameraFar) return;

			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			vec3 viewPosition=getViewPosition( vUv, depth, viewZ, clipW );

			vec2 d0=gl_FragCoord.xy;
			vec2 d1;

			vec3 viewNormal=getViewNormal( vUv );
			vec3 viewReflectDir;
			if(isPerspectiveCamera){
				viewReflectDir=reflect(normalize(viewPosition),viewNormal);
			}else{
				viewReflectDir=reflect(vec3(0,0,-1),viewNormal);
			}
			vec3 d1viewPosition=viewPosition+viewReflectDir*maxDistance;
			if(d1viewPosition.z>-cameraNear){
				vec2 tempXY=viewPosition.xy;
				viewPosition.x=0.;
				viewPosition.y=0.;
				d1viewPosition.xy-=tempXY;

				float ratio=(viewPosition.z+cameraNear)/(viewPosition.z-d1viewPosition.z);
				d1viewPosition.xy*=ratio;
				d1viewPosition.z=-cameraNear;

				viewPosition.xy=tempXY;
				d1viewPosition.xy+=tempXY;
			}
			d1=viewPositionToXY(d1viewPosition);

			float totalLen=length(d1-d0);
			float xLen=d1.x-d0.x;
			float yLen=d1.y-d0.y;
			float totalStep=max(abs(xLen),abs(yLen));
			float xSpan=xLen/totalStep;
			float ySpan=yLen/totalStep;
			vec3 vec3_0=vec3(0,0,0);
			for(float i=0.;i<MAX_STEP;i++){
				if(i>=totalStep) break;
				vec2 xy=vec2(d0.x+i*xSpan,d0.y+i*ySpan);
				if(xy.x<0.||xy.x>resolution.x) break;
				if(xy.y<0.||xy.y>resolution.y) break;
				vec2 uv=xy/resolution;

				float d = getDepth(uv);
				float vZ = getViewZ( d );
				if(-vZ>=cameraFar) continue;
				float clipW = cameraProjectionMatrix[2][3] * vZ + cameraProjectionMatrix[3][3];
				vec3 vP=getViewPosition( uv, d, vZ, clipW );

				vec3 viewNearPlanePoint;

				vec2 viewNearPlanePointXY=uv;//uv
				viewNearPlanePointXY*=2.;
				viewNearPlanePointXY-=1.;//ndc
				float cw=cameraNear;
				viewNearPlanePointXY*=cw;//clip
				viewNearPlanePointXY=(cameraInverseProjectionMatrix*vec4(viewNearPlanePointXY,0,cw)).xy;//view

				viewNearPlanePoint=vec3(viewNearPlanePointXY,-cameraNear);//view

				vec3 viewRayPoint;
				if(isPerspectiveCamera){
					viewRayPoint=lineLineIntersection(viewPosition,d1viewPosition,vec3_0,viewNearPlanePoint);
				}else{
					viewRayPoint=lineLineIntersection(viewPosition,d1viewPosition,vec3(viewNearPlanePoint.x,viewNearPlanePoint.y,0),viewNearPlanePoint);
				}


				float away=length(vP-viewRayPoint);

				float op=opacity;
				if(isDistanceAttenuation){

					vec3 viewRay=viewRayPoint-viewPosition;
					float rayLen=length(viewRay);
					if(rayLen>=attenuationDistance) break;
					float attenuation=(1.-rayLen/attenuationDistance);

					attenuation=attenuation*attenuation;
					op=opacity*attenuation;
				}

				float sD=surfDist*clipW;
				if(away<sD){
					vec3 vN=getViewNormal( uv );
					if(dot(viewReflectDir,vN)>=0.) continue;
					vec4 reflectColor=texture2D(tDiffuse,uv);
					gl_FragColor=reflectColor;
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

    "float getLinearDepth( const in vec2 screenPosition ) {",

    "	#if PERSPECTIVE_CAMERA == 1",

    "		float fragCoordZ = texture2D( tDepth, screenPosition ).x;",
    "		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );",
    "		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );",

    "	#else",

    "		return texture2D( tDepth, screenPosition ).x;",

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

    "	gl_FragColor = vec4(  result / ( 5.0 * 5.0 ) );",

    "}"

  ].join("\n")

};

export { SSRShader, SSRDepthShader, SSRBlurShader };
