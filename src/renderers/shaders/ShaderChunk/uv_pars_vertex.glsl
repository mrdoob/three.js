#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )

	varying vec2 vUv;
	uniform vec4 offsetRepeat;

#endif

//for now the most convenient place to attach vert transformation logic in global scope
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

  //precompute some stuff
  vec4 q = vec4(
    instanceQuaternion.x,
    instanceQuaternion.y,
    instanceQuaternion.z,
    instanceQuaternion.w
  );

  //do one instruction?
  vec4 q2 = q * q;

  vec3 s = instanceScale;

  //halve the number of mult?
  float qxy = q.x * q.y;
  float qxz = q.x * q.z;
  float qxw = q.x * q.w;
  float qyw = q.y * q.w;
  float qyz = q.y * q.z;
  float qzw = q.z * q.w;

  return mat4(

      (1.0 - 2.0 * ( q2.y + q2.z )) * s.x ,   2.0 * ( qxy - qzw ) * s.x           ,   2.0 * ( qxz + qyw ) * s.x           , 0.0 ,
      
      2.0 * ( qxy + qzw ) * s.y           ,   (1.0 - 2.0 * ( q2.x + q2.z )) * s.y ,   2.0 * ( qyz - qxw ) * s.y           , 0.0 ,
      
      2.0 * ( qxz - qyw ) * s.z           ,   2.0 * ( qyz + qxw ) * s.z           ,   (1.0 - 2.0 * ( q2.x + q2.y )) * s.z , 0.0 ,

      instancePosition.x                  ,   instancePosition.y                  ,   instancePosition.z                  , 1.0 

  );

}




#endif