#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )

	varying vec2 vUv;
	uniform vec4 offsetRepeat;

#endif

//@author pailhead
//for now the most convenient place to attach vert transformation logic in global scope ( before main() )
#if defined( INSTANCE_TRANSFORM )

mat3 inverse(mat3 m) {
  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

  float b01 = a22 * a11 - a12 * a21;
  float b11 = -a22 * a10 + a12 * a20;
  float b21 = a21 * a10 - a11 * a20;

  float det = a00 * b01 + a01 * b11 + a02 * b21;

  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}
  
//for dynamic, avoid computing the matrices on the cpu
attribute vec3 instancePosition;
attribute vec4 instanceQuaternion;
attribute vec3 instanceScale;

#if defined( INSTANCE_COLOR )
  attribute vec3 instanceColor;
  varying vec3 vInstanceColor;
#endif 

mat4 getInstanceMatrix(){

  vec4 q = instanceQuaternion;
  vec3 s = instanceScale;
  vec3 v = instancePosition;

  vec3 q2 = q.xyz + q.xyz;
  vec3 a = q.xxx * q2.xyz;
  vec3 b = q.yyz * q2.yzz;
  vec3 c = q.www * q2.xyz;

  return mat4(

      (1.0 - (b.x + b.z)) * s.x  ,   (a.y + c.z)  * s.x         ,   (a.z - c.y)  * s.x          , 0.0 ,

      (a.y - c.z)  * s.y         ,   (1.0 - (a.x + b.z)) * s.y  ,  (b.y + c.x) * s.y            , 0.0 ,

      (a.z + c.y) * s.z          ,   (b.y - c.x) * s.z          ,   (1.0 - (a.x + b.x)) * s.z   , 0.0 ,

      v.x                      ,   v.y                      ,   v.z                       , 1.0

  );

}

#endif