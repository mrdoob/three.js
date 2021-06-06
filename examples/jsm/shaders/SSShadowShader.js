import {
	Matrix4,
	Vector2,
	Vector3
} from '../../../build/three.module.js';

const SSShadowShader = {

	defines: {
		MAX_STEP: 0,
		PERSPECTIVE_CAMERA: true,
		INFINITE_THICK: false,
		WORLD_LIGHT_POSITION: false,
	},

	uniforms: {

		'tDiffuse': { value: null },
		'tNormal': { value: null },
		'tRefractive': { value: null },
		'tDepth': { value: null },
		'cameraNear': { value: null },
		'cameraFar': { value: null },
		'resolution': { value: new Vector2() },
		'cameraProjectionMatrix': { value: new Matrix4() },
		'cameraInverseProjectionMatrix': { value: new Matrix4() },
		'cameraMatrixWorldInverse': { value: new Matrix4() },
		'lightPosition': { value: new Vector3(1.7,1.7,0) },
		'cameraRange': { value: 0 },
		'maxDistance': { value: 180 },
		'surfDist': { value: .007 },
		'doubleSideCheckStartFrom': { value: .01 },

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
		uniform sampler2D tNormal;
		uniform sampler2D tRefractive;
		uniform sampler2D tDiffuse;
		uniform float cameraRange;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform vec3 lightPosition;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform mat4 cameraMatrixWorldInverse;
		uniform float maxDistance;
		uniform float surfDist;
		uniform float doubleSideCheckStartFrom;
		#include <packing>
		float pointToLineDistance(vec3 x0, vec3 x1, vec3 x2) {
			//x0: point, x1: linePointA, x2: linePointB
			//https://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
			return length(cross(x0-x1,x0-x2))/length(x2-x1);
		}
		float pointPlaneDistance(vec3 point,vec3 planePoint,vec3 planeNormal){
			// https://mathworld.wolfram.com/Point-PlaneDistance.html
			//// https://en.wikipedia.org/wiki/Plane_(geometry)
			//// http://paulbourke.net/geometry/pointlineplane/
			float a=planeNormal.x,b=planeNormal.y,c=planeNormal.z;
			float x0=point.x,y0=point.y,z0=point.z;
			float x=planePoint.x,y=planePoint.y,z=planePoint.z;
			float d=-(a*x+b*y+c*z);
			float distance=(a*x0+b*y0+c*z0+d)/sqrt(a*a+b*b+c*c);
			return distance;
		}
		float getDepth( const in vec2 uv ) {
			return texture2D( tDepth, uv ).x;
		}
		float getViewZ( const in float depth ) {
			#ifdef PERSPECTIVE_CAMERA
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
		void main(){

			// gl_FragColor=vec4(0,0,.5,1);return;

			float depth = getDepth( vUv );
			float viewZ = getViewZ( depth );
			// if(-viewZ>=cameraFar) return;

			float clipW = cameraProjectionMatrix[2][3] * viewZ+cameraProjectionMatrix[3][3];
			vec3 viewPosition=getViewPosition( vUv, depth, clipW );

			vec2 d0=gl_FragCoord.xy;
			vec2 d1;

			vec3 viewNormal=getViewNormal( vUv );

			#ifdef WORLD_LIGHT_POSITION
				vec3 viewLightPosition=(cameraMatrixWorldInverse*vec4(lightPosition,1.)).xyz;
			#else
				vec3 viewLightPosition=lightPosition;
			#endif
			vec3 viewRefractDir=normalize(viewLightPosition-viewPosition);

			vec3 d1viewPosition=viewPosition+viewRefractDir*maxDistance;
			#ifdef PERSPECTIVE_CAMERA
				if(d1viewPosition.z>-cameraNear){
					//https://tutorial.math.lamar.edu/Classes/CalcIII/EqnsOfLines.aspx
					float t=(-cameraNear-viewPosition.z)/viewRefractDir.z;
					d1viewPosition=viewPosition+viewRefractDir*t;
				}
			#endif
			d1=viewPositionToXY(d1viewPosition);

			float totalLen=length(d1-d0);
			float xLen=d1.x-d0.x;
			float yLen=d1.y-d0.y;
			float totalStep=max(abs(xLen),abs(yLen));
			float xSpan=xLen/totalStep;
			float ySpan=yLen/totalStep;
			for(float i=0.;i<float(MAX_STEP);i++){
				if(i>=totalStep) break;
				vec2 xy=vec2(d0.x+i*xSpan,d0.y+i*ySpan);
				if(xy.x<0.||xy.x>resolution.x||xy.y<0.||xy.y>resolution.y) break;
				float s=length(xy-d0)/totalLen;
				vec2 uv=xy/resolution;

				float d = getDepth(uv);
				float vZ = getViewZ( d );
				float cW = cameraProjectionMatrix[2][3] * vZ+cameraProjectionMatrix[3][3];
				vec3 vP=getViewPosition( uv, d, cW );

				#ifdef PERSPECTIVE_CAMERA
					// https://www.comp.nus.edu.sg/~lowkl/publications/lowk_persp_interp_techrep.pdf
					float recipVPZ=1./viewPosition.z;
					float viewRefractRayZ=1./(recipVPZ+s*(1./d1viewPosition.z-recipVPZ));
					float sD=surfDist*cW;
				#else
					float viewRefractRayZ=viewPosition.z+s*(d1viewPosition.z-viewPosition.z);
					float sD=surfDist;
				#endif

				bool hit;
				#ifdef INFINITE_THICK
					hit=viewRefractRayZ<=vZ;
				#else
					if(viewRefractRayZ-sD>vZ) continue;
					float away=pointToLineDistance(vP,viewPosition,d1viewPosition);
					hit=away<=sD;
				#endif
				gl_FragColor=texture2D(tDiffuse,vUv);
				if(hit){
					vec3 vN=getViewNormal( uv );

					// if(dot(viewRefractDir,vN)>=0.) continue;

					if((length(viewPosition-vP)<doubleSideCheckStartFrom)&&(dot(viewRefractDir,vN)>=0.)) continue;
					// May not need "doubleSideCheckStartFrom", use "surfDist" or change starting "i" of "for(float i=1.;i<float(MAX_STEP);i++){" instead.

					gl_FragColor.rgb*=.5;
					return;
				}
			}
		}
	`

};

var SSShadowDepthShader = {

	defines: {
		'PERSPECTIVE_CAMERA': 1
	},

	uniforms: {

		'tDepth': { value: null },
		'cameraNear': { value: null },
		'cameraFar': { value: null },

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}

	`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;

		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 uv ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, uv ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, uv ).x;

			#endif

		}

		void main() {

			float depth = getLinearDepth( vUv );
			float d = 1.0 - depth;
			// d=(d-.999)*1000.;
			gl_FragColor = vec4( vec3( d ), 1.0 );

		}

	`

};

export { SSShadowShader, SSShadowDepthShader };
