// normal is assumed to be unit length!
vec3 shGetAt( const in vec3 shCoefficients[9], const in vec3 worldNormal )
{
    // band 0
    vec3 result = shCoefficients[0];

    // band 1
    result += shCoefficients[1] * worldNormal.y;
    result += shCoefficients[2] * worldNormal.z;
    result += shCoefficients[3] * worldNormal.x;

    // band 2
    result += shCoefficients[4] * ( worldNormal.x*worldNormal.y );
    result += shCoefficients[5] * ( worldNormal.y*worldNormal.z );
    result += shCoefficients[6] * ( 3.0 * worldNormal.z*worldNormal.z - 1.0 );
    result += shCoefficients[7] * ( worldNormal.x*worldNormal.z );
    result += shCoefficients[8] * ( worldNormal.x*worldNormal.x - worldNormal.y*worldNormal.y );

    return result;
}

// constants to convert from radiance to hemispheric irradiance
// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf
#define C1 0.429043
#define C2 0.511664
#define C3 0.743125
#define C4 0.886227
#define C5 0.247708

// normal is assumed to be unit length!
vec3 shGetIrradianceAt( const in vec3 shCoefficients[9], const in vec3 worldNormal )
{
    // band 0
    vec3 result = shCoefficients[0] * C4;

    // band 1
    result += shCoefficients[1] * ( 2.0 * C2 * worldNormal.y );
    result += shCoefficients[2] * ( 2.0 * C2 * worldNormal.z );
    result += shCoefficients[3] * ( 2.0 * C2 * worldNormal.x );

    // band 2
    result += shCoefficients[4] * ( 2.0 * C1 * worldNormal.x * worldNormal.y );
    result += shCoefficients[5] * ( 2.0 * C1 * worldNormal.y * worldNormal.z );
    result += shCoefficients[6] * ( C3 * worldNormal.z * worldNormal.z - C5 );
    result += shCoefficients[7] * ( 2.0 * C1 * worldNormal.x * worldNormal.z );
    result += shCoefficients[8] * ( C1 * ( worldNormal.x * worldNormal.x - worldNormal.y * worldNormal.y ) );

    return result;
}