#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )

	varying vec2 vUv;
	uniform vec4 offsetRepeat;

#endif

//for now the most convenient place to attach vert transformation logic in global scope ( before main() )
#if defined ( INSTANCE_TRANSFORM )

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

mat4 getInstanceMatrix(){

  vec4 q = instanceQuaternion;
  vec3 s = instanceScale;
  vec3 v = instancePosition;

  float x2 = q.x + q.x;
  float y2 = q.y + q.y;
  float z2 = q.z + q.z;

  float xx = q.x * x2;
  float xy = q.x * y2;
  float xz = q.x * z2;

  float yy = q.y * y2;
  float yz = q.y * z2;
  float zz = q.z * z2;

  float wx = q.w * x2;
  float wy = q.w * y2;
  float wz = q.w * z2;

  return mat4(

      (1.0 - (yy + zz)) * s.x  ,   (xy + wz)  * s.x         ,   (xz - wy)  * s.x          , 0.0 ,

      (xy - wz)  * s.y         ,   (1.0 - (xx + zz)) * s.y  ,  (yz + wx) * s.y            , 0.0 ,

      (xz + wy) * s.z          ,   (yz - wx) * s.z          ,   (1.0 - (xx + yy)) * s.z   , 0.0 ,

      v.x                      ,   v.y                      ,   v.z                       , 1.0

  );

}

#endif