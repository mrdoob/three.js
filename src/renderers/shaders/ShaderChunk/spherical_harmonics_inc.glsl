// normal is assumed to be unit length!
vec3 shGetRadianceAt( vec3 shCoefficients[9], vec3 normal )
{
    // band 0
    vec3 result = shCoefficients[0];

    // band 1
    result += shCoefficients[1] * normal.y;
    result += shCoefficients[2] * normal.z;
    result += shCoefficients[3] * normal.x;

    // band 2
    result += shCoefficients[4] * ( normal.x*normal.y );
    result += shCoefficients[5] * ( normal.y*normal.z );
    result += shCoefficients[6] * ( 3.0 * normal.z*normal.z - 1.0 );
    result += shCoefficients[7] * ( normal.x*normal.z );
    result += shCoefficients[8] * ( normal.x*normal.x - normal.y*normal.y );

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
    // band 0
    vec3 result = shCoefficients[0] * C4;

    // band 1
    result += shCoefficients[1] * ( 2.0 * C2 * normal.y );
    result += shCoefficients[2] * ( 2.0 * C2 * normal.z );
    result += shCoefficients[3] * ( 2.0 * C2 * normal.x );

    // band 2
    result += shCoefficients[4] * ( 2.0 * C1 * normal.x*normal.y );
    result += shCoefficients[5] * ( 2.0 * C1 * normal.y*normal.z );
    result += shCoefficients[6] * ( C3 * normal.z*normal.z - C5 );
    result += shCoefficients[7] * ( 2.0 * C1 * normal.x*normal.z );
    result += shCoefficients[8] * ( C1 * ( normal.x*normal.x - normal.y*normal.y ) );

    return result;
}