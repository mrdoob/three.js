import {
	Matrix4,
	Vector2
} from 'three';

const SSRrShader = {

	defines: {
		MAX_STEP: 0,
		PERSPECTIVE_CAMERA: true,
		SPECULAR: true,
		FILL_HOLE: true,
		INFINITE_THICK: false,
	},

	uniforms: {

		'tDiffuse': { value: null },
		'tSpecular': { value: null },
		'tNormalSelects': { value: null },
		'tRefractive': { value: null },
		'tDepth': { value: null },
		'tDepthSelects': { value: null },
		'cameraNear': { value: null },
		'cameraFar': { value: null },
		'resolution': { value: new Vector2() },
		'cameraProjectionMatrix': { value: new Matrix4() },
		'cameraInverseProjectionMatrix': { value: new Matrix4() },
		'ior': { value: 1.03 },
		'cameraRange': { value: 0 },
		'maxDistance': { value: 180 },
		'surfDist': { value: .007 },

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
		uniform sampler2D tDepthSelects;
		uniform sampler2D tNormalSelects;
		uniform sampler2D tRefractive;
		uniform sampler2D tDiffuse;
		uniform sampler2D tSpecular;
		uniform float cameraRange;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform float ior;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform float maxDistance;
		uniform float surfDist;
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
		float getDepthSelects( const in vec2 uv ) {
			return texture2D( tDepthSelects, uv ).x;
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
		vec3 getViewNormalSelects( const in vec2 uv ) {
			return unpackRGBToNormal( texture2D( tNormalSelects, uv ).xyz );
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
		void setResultColor(vec2 uv){
			vec4 refractColor=texture2D(tDiffuse,uv);
			#ifdef SPECULAR
				vec4 specularColor=texture2D(tSpecular,vUv);
				gl_FragColor.xyz=mix(refractColor.xyz,vec3(1),specularColor.r);
				// gl_FragColor.xyz=refractColor.xyz*(1.+specularColor.r*3.);
			#else
				gl_FragColor.xyz=refractColor.xyz;
			#endif
			gl_FragColor.a=1.;

		}
		void main(){
			if(ior==1.) return; // Adding this line may have better performance, but more importantly, it can avoid display errors at the very edges of the model when IOR is equal to 1.

			float refractive=texture2D(tRefractive,vUv).r;
			if(refractive<=0.) return;

			// gl_FragColor=vec4(0,0,.5,1);return;
			vec3 viewNormalSelects=getViewNormalSelects( vUv );
			// gl_FragColor=vec4(viewNormalSelects,1);return;

			// if(viewNormalSelects.x<=0.&&viewNormalSelects.y<=0.&&viewNormalSelects.z<=0.) return;

			float depth = getDepthSelects( vUv );
			float viewZ = getViewZ( depth );
			// if(-viewZ>=cameraFar) return;

			float clipW = cameraProjectionMatrix[2][3] * viewZ+cameraProjectionMatrix[3][3];
			vec3 viewPosition=getViewPosition( vUv, depth, clipW );

			vec2 d0=gl_FragCoord.xy;
			vec2 d1;

			#ifdef PERSPECTIVE_CAMERA
				vec3 viewIncidentDir=normalize(viewPosition);
			#else
				vec3 viewIncidentDir=vec3(0,0,-1);
			#endif

			vec3 viewRefractDir=refract(viewIncidentDir,viewNormalSelects,1./ior);
			// https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/refract.xhtml

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
			#ifdef FILL_HOLE
				bool isRough=false;
				vec2 uvRough;
			#endif
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
					// https://comp.nus.edu.sg/~lowkl/publications/lowk_persp_interp_techrep.pdf
					float recipVPZ=1./viewPosition.z;
					float viewRefractRayZ=1./(recipVPZ+s*(1./d1viewPosition.z-recipVPZ));
					float sD=surfDist*cW;
				#else
					float viewRefractRayZ=viewPosition.z+s*(d1viewPosition.z-viewPosition.z);
					float sD=surfDist;
				#endif

				#ifdef FILL_HOLE // TODO: May can improve performance by check if INFINITE_THICK too.
					if(viewRefractRayZ<=vZ){
						if(!isRough){
							uvRough=uv;
							isRough=true;
						}
					}
				#endif

				bool hit;
				#ifdef INFINITE_THICK
					hit=viewRefractRayZ<=vZ;
				#else
					if(viewRefractRayZ-sD>vZ) continue;
					float away=pointToLineDistance(vP,viewPosition,d1viewPosition);
					hit=away<=sD;
				#endif
				if(hit){
					setResultColor(uv);
					return;
				}
			}

			#ifdef FILL_HOLE
				if(isRough){
					setResultColor(uvRough);
				}
				// else{
				// 	gl_FragColor=texture2D(tDiffuse,vUv);//For afterward add color mix feature.
				// }
			#else
				// gl_FragColor=texture2D(tDiffuse,vUv);//For afterward add color mix feature.
			#endif
		}
	`

};

var SSRrDepthShader = {

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

export { SSRrShader, SSRrDepthShader };
