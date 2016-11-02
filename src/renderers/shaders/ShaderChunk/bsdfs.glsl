float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

		if( decayExponent > 0.0 ) {

#if defined ( PHYSICALLY_CORRECT_LIGHTS )

			// based upon Frostbite 3 Moving to Physically-based Rendering
			// page 32, equation 26: E[window1]
			// http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
			// this is intended to be used on spot and point lights who are represented as luminous intensity
			// but who must be converted to luminous irradiance for surface lighting calculation
			float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
			float maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
			return distanceFalloff * maxDistanceCutoffFactor;

#else

			return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

#endif

		}

		return 1.0;
}

vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

} // validated


vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	//;float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );

	return ( 1.0 - specularColor ) * fresnel + specularColor;

} // validated


// Microfacet Models for Refraction through Rough Surfaces - equation (34)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {

	// geometry term = G(l)⋅G(v) / 4(n⋅l)(n⋅v)

	float a2 = pow2( alpha );

	float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );

	return 1.0 / ( gl * gv );

} // validated

// from page 12, listing 2 of http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
float G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {

	float a2 = pow2( alpha );

	// dotNL and dotNV are explicitly swapped. This is not a mistake.
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );

	return 0.5 / max( gv + gl, EPSILON );
}



// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX( const in float alpha, const in float dotNH ) {

	float a2 = pow2( alpha );

	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return RECIPROCAL_PI * a2 / pow2( denom );

}


// GGX Distribution, Schlick Fresnel, GGX-Smith Visibility
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {

	float alpha = pow2( roughness ); // UE4's roughness

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );

	float D = D_GGX( alpha, dotNH );

	return F * ( G * D );

} // validated

// LTC BRDF approximation only used if Area Lights are used
#if NUM_RECT_AREA_LIGHTS > 0

#define LTC

// Pre-computed values of LinearTransformedCosine approximation of BRDF
uniform sampler2D ltcMat; // RGBA Float
uniform sampler2D ltcMag; // Alpha Float (only has w component)

// Texture is 64x64
// LUT SCALE and BIAS are used to avoid edge case interpolations of param values
// TODO (abelnation): confirm above comment
const float LUT_SIZE  = 64.0;
const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
const float LUT_BIAS  = 0.5 / LUT_SIZE;

// Ray/Rect Intersection code from:
// http://blog.selfshadow.com/sandbox/ltc.html
// struct Ray
// {
// 	vec3 origin;
// 	vec3 dir;
// };

struct Rect
{
	vec3  center;
	vec3  dirx;
	vec3  diry;
	float halfx;
	float halfy;

	vec4  plane;
};

// bool RayPlaneIntersect(Ray ray, vec4 plane, out float t)
// {
// 	t = -dot(plane, vec4(ray.origin, 1.0))/dot(plane.xyz, ray.dir);
// 	return t > 0.0;
// }
//
// bool RayRectIntersect(Ray ray, Rect rect, out float t)
// {
// 	bool intersect = RayPlaneIntersect(ray, rect.plane, t);
// 	if (intersect)
// 	{
// 		vec3 pos  = ray.origin + ray.dir*t;
// 		vec3 lpos = pos - rect.center;
//
// 		float x = dot(lpos, rect.dirx);
// 		float y = dot(lpos, rect.diry);
//
// 		if (abs(x) > rect.halfx || abs(y) > rect.halfy)
// 			intersect = false;
// 	}
//
// 	return intersect;
// }

mat3 transpose( const in mat3 v ) {

    mat3 tmp;
    tmp[0] = vec3(v[0].x, v[1].x, v[2].x);
    tmp[1] = vec3(v[0].y, v[1].y, v[2].y);
    tmp[2] = vec3(v[0].z, v[1].z, v[2].z);

    return tmp;

}

vec2 ltcTextureCoords( const in GeometricContext geometry, const in float roughness ) {

	vec3 N = geometry.normal;
	vec3 V = geometry.viewDir;
	vec3 P = geometry.position;

	// view angle on surface determines which LTC BRDF values we use
	float theta = acos( dot( N, V ) );

	// TODO (abelnation) ensure square root of roughness is needed
	// Parameterization of texture:
	// sqrt(roughness) -> [0,1]
	// theta -> [0, PI/2]
	vec2 uv = vec2(
		sqrt( saturate( roughness ) ),
		saturate( theta / ( 0.5 * PI ) ) );

	uv = uv * LUT_SCALE + LUT_BIAS;

	return uv;

}

void clipQuadToHorizon( inout vec3 L[5], out int n ) {

    // detect clipping config
    int config = 0;
    if (L[0].z > 0.0) config += 1;
    if (L[1].z > 0.0) config += 2;
    if (L[2].z > 0.0) config += 4;
    if (L[3].z > 0.0) config += 8;

    // clip
    n = 0;

    if (config == 0)
    {
        // clip all
    }
    else if (config == 1) // V1 clip V2 V3 V4
    {
        n = 3;
        L[1] = -L[1].z * L[0] + L[0].z * L[1];
        L[2] = -L[3].z * L[0] + L[0].z * L[3];
    }
    else if (config == 2) // V2 clip V1 V3 V4
    {
        n = 3;
        L[0] = -L[0].z * L[1] + L[1].z * L[0];
        L[2] = -L[2].z * L[1] + L[1].z * L[2];
    }
    else if (config == 3) // V1 V2 clip V3 V4
    {
        n = 4;
        L[2] = -L[2].z * L[1] + L[1].z * L[2];
        L[3] = -L[3].z * L[0] + L[0].z * L[3];
    }
    else if (config == 4) // V3 clip V1 V2 V4
    {
        n = 3;
        L[0] = -L[3].z * L[2] + L[2].z * L[3];
        L[1] = -L[1].z * L[2] + L[2].z * L[1];
    }
    else if (config == 5) // V1 V3 clip V2 V4) impossible
    {
        n = 0;
    }
    else if (config == 6) // V2 V3 clip V1 V4
    {
        n = 4;
        L[0] = -L[0].z * L[1] + L[1].z * L[0];
        L[3] = -L[3].z * L[2] + L[2].z * L[3];
    }
    else if (config == 7) // V1 V2 V3 clip V4
    {
        n = 5;
        L[4] = -L[3].z * L[0] + L[0].z * L[3];
        L[3] = -L[3].z * L[2] + L[2].z * L[3];
    }
    else if (config == 8) // V4 clip V1 V2 V3
    {
        n = 3;
        L[0] = -L[0].z * L[3] + L[3].z * L[0];
        L[1] = -L[2].z * L[3] + L[3].z * L[2];
        L[2] =  L[3];
    }
    else if (config == 9) // V1 V4 clip V2 V3
    {
        n = 4;
        L[1] = -L[1].z * L[0] + L[0].z * L[1];
        L[2] = -L[2].z * L[3] + L[3].z * L[2];
    }
    else if (config == 10) // V2 V4 clip V1 V3) impossible
    {
        n = 0;
    }
    else if (config == 11) // V1 V2 V4 clip V3
    {
        n = 5;
        L[4] = L[3];
        L[3] = -L[2].z * L[3] + L[3].z * L[2];
        L[2] = -L[2].z * L[1] + L[1].z * L[2];
    }
    else if (config == 12) // V3 V4 clip V1 V2
    {
        n = 4;
        L[1] = -L[1].z * L[2] + L[2].z * L[1];
        L[0] = -L[0].z * L[3] + L[3].z * L[0];
    }
    else if (config == 13) // V1 V3 V4 clip V2
    {
        n = 5;
        L[4] = L[3];
        L[3] = L[2];
        L[2] = -L[1].z * L[2] + L[2].z * L[1];
        L[1] = -L[1].z * L[0] + L[0].z * L[1];
    }
    else if (config == 14) // V2 V3 V4 clip V1
    {
        n = 5;
        L[4] = -L[0].z * L[3] + L[3].z * L[0];
        L[0] = -L[0].z * L[1] + L[1].z * L[0];
    }
    else if (config == 15) // V1 V2 V3 V4
    {
        n = 4;
    }

    if (n == 3)
        L[3] = L[0];
    if (n == 4)
        L[4] = L[0];
}

float integrateLtcBrdfOverRectEdge( vec3 v1, vec3 v2 ) {

    float cosTheta = dot( v1, v2 );
    float theta = acos( cosTheta );
    float res = cross( v1, v2 ).z * ( ( theta > 0.001 ) ? theta / sin( theta ) : 1.0 );

    return res;
}

void initRectPoints( const in Rect rect, out vec3 rectPoints[4] ) {

	vec3 ex = rect.halfx * rect.dirx;
	vec3 ey = rect.halfy * rect.diry;
	rectPoints[0] = rect.center - ex - ey;
	rectPoints[1] = rect.center + ex - ey;
	rectPoints[2] = rect.center + ex + ey;
	rectPoints[3] = rect.center - ex + ey;

}

vec3 integrateLtcBrdfOverRect( const in GeometricContext geometry, const in mat3 brdfMat, const in vec3 rectPoints[4] ) {

	vec3 N = geometry.normal;
	vec3 V = geometry.viewDir;
	vec3 P = geometry.position;

	// construct orthonormal basis around N
    vec3 T1, T2;
    T1 = normalize(V - N * dot( V, N ));
    T2 = - cross( N, T1 );

	// rotate area light in (T1, T2, N) basis
	mat3 brdfWrtSurface = brdfMat * transpose( mat3( T1, T2, N ) );

	// need to clip light rect to horizon, resulting in at most 5 points
	vec3 clippedRect[5];
	clippedRect[0] = brdfWrtSurface * ( rectPoints[0] - P );
	clippedRect[1] = brdfWrtSurface * ( rectPoints[1] - P );
	clippedRect[2] = brdfWrtSurface * ( rectPoints[2] - P );
	clippedRect[3] = brdfWrtSurface * ( rectPoints[3] - P );

	int n;
	clipQuadToHorizon(clippedRect, n);

	if ( n == 0 )
		return vec3( 0, 0, 0 );

	// project clipped rect onto sphere
    clippedRect[0] = normalize( clippedRect[0] );
    clippedRect[1] = normalize( clippedRect[1] );
    clippedRect[2] = normalize( clippedRect[2] );
    clippedRect[3] = normalize( clippedRect[3] );
    clippedRect[4] = normalize( clippedRect[4] );

    // integrate
    float sum = 0.0;

    sum += integrateLtcBrdfOverRectEdge( clippedRect[0], clippedRect[1] );
    sum += integrateLtcBrdfOverRectEdge( clippedRect[1], clippedRect[2] );
    sum += integrateLtcBrdfOverRectEdge( clippedRect[2], clippedRect[3] );
    if (n >= 4)
        sum += integrateLtcBrdfOverRectEdge( clippedRect[3], clippedRect[4] );
    if (n == 5)
        sum += integrateLtcBrdfOverRectEdge( clippedRect[4], clippedRect[0] );

	// TODO (abelnation): two-sided area light
    // sum = twoSided ? abs(sum) : max(0.0, sum);
	sum = max( 0.0, sum );
	// sum = abs( sum );

    vec3 Lo_i = vec3( sum, sum, sum );

    return Lo_i;

}

vec3 Rect_Area_Light_Specular_Reflectance( const in GeometricContext geometry, const in Rect areaLightRect, const in float roughness ) {

	vec3 rectPoints[4];
	initRectPoints( areaLightRect, rectPoints );

	vec2 uv = ltcTextureCoords( geometry, roughness );

	vec4 brdfLtcApproxParams, t;

	brdfLtcApproxParams = texture2D( ltcMat, uv );
	t = texture2D( ltcMat, uv );

	float brdfLtcScalar = texture2D( ltcMag, uv ).a;

	// inv(M) matrix referenced by paper loaded from texture
	mat3 brdfLtcApproxMat = mat3(
		vec3(   1,   0, t.y ),
		vec3(   0, t.z,   0 ),
		vec3( t.w,   0, t.x )
	);

	vec3 specularReflectance = integrateLtcBrdfOverRect( geometry, brdfLtcApproxMat, rectPoints );
	specularReflectance *= brdfLtcScalar;

	return specularReflectance;

}

vec3 Rect_Area_Light_Diffuse_Reflectance( const in GeometricContext geometry, const in Rect areaLightRect ) {

	vec3 rectPoints[4];
	initRectPoints( areaLightRect, rectPoints );

	mat3 diffuseBrdfMat = mat3(1);
	vec3 diffuseReflectance = integrateLtcBrdfOverRect( geometry, diffuseBrdfMat, rectPoints );

	return diffuseReflectance;

}

#endif

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {

	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

	return specularColor * AB.x + AB.y;

} // validated


float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	//float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	//float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated

// source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html
float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
	return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
}

float BlinnExponentToGGXRoughness( const in float blinnExponent ) {
	return sqrt( 2.0 / ( blinnExponent + 2.0 ) );
}
