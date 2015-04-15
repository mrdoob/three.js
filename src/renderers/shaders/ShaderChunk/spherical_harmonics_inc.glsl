// normal is assumed to be unit length!
vec3 shGetRadianceAt( vec3 shCoefficients[9], vec3 normal )
{

    float x = normal.x, y = normal.y, z = normal.z;

    vec3 result = vec3( 0 );

    // band 0
    result += shCoefficients[0];

    // band 1
    result += shCoefficients[1] * y;
    result += shCoefficients[2] * z;
    result += shCoefficients[3] * x;

    // band 2
    result += shCoefficients[4] * ( x*y );
    result += shCoefficients[5] * ( y*z );
    result += shCoefficients[6] * ( 3.0 * z*z - 1.0 );
    result += shCoefficients[7] * ( x*z );
    result += shCoefficients[8] * ( x*x - y*y );

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
vec3 shGetIrradianceAt( vec3 shCoefficients[9], vec3 normal )
{

    float x = normal.x, y = normal.y, z = normal.z;

    vec3 result = vec3( 0 );

    // band 0
    result += shCoefficients[0] * C4;

    // band 1
    result += shCoefficients[1] * ( 2.0 * C2 * y );
    result += shCoefficients[2] * ( 2.0 * C2 * z );
    result += shCoefficients[3] * ( 2.0 * C2 * x );

    // band 2
    result += shCoefficients[4] * ( 2.0 * C1 * x*y );
    result += shCoefficients[5] * ( 2.0 * C1 * y*z );
    result += shCoefficients[6] * ( C3 * z*z - C5 );
    result += shCoefficients[7] * ( 2.0 * C1 * x*z );
    result += shCoefficients[8] * ( C1 * ( x*x - y*y ) );

    return result;

}