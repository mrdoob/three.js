export default /* glsl */`

#if NUM_RECT_AREA_LIGHTS > 0

// Rect Area Light

// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// code: https://github.com/selfshadow/ltc_code/

vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	float dotNV = saturate( dot( N, V ) );

	// texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );

	uv = uv * LUT_SCALE + LUT_BIAS;

	return uv;

}

float LTC_ClippedSphereFormFactor( const in vec3 f ) {

	// Real-Time Area Lighting: a Journey from Research to Production (p.102)
	// An approximation of the form factor of a horizon-clipped rectangle.

	float l = length( f );

	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );

}

vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {

	float x = dot( v1, v2 );

	float y = abs( x );

	// rational polynomial approximation to theta / sin( theta ) / 2PI
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;

	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;

	return cross( v1, v2 ) * theta_sintheta;

}

vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );

	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );

	// construct orthonormal basis around N
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 ); // negated from paper; possibly due to a different handedness of world coordinate system

	// compute transform
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );

	// transform rect
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );

	// project rect onto sphere
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );

	// calculate vector form factor
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );

	// adjust for horizon clipping
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );

	return vec3( result );

}

// Interpolate smooth correction fields, then reconstruct at the actual view angle.
// This preserves narrow highlights and normal-incidence rotational symmetry.
mat3 LTC_DecodeMatrix( const in vec4 parameters, const in float roughness, const in float dotNV ) {

	float c = clamp( dotNV, 1e-8, 1.0 );
	float s = sqrt( max( 1.0 - c * c, 0.0 ) );
	float alpha = max( roughness * roughness, 1e-5 );
	float base = sqrt( c * c + alpha * alpha );
	float width = base / sqrt( 1.0 + alpha * alpha ) * exp( ( 1.0 - c ) * parameters.x );
	float correction = alpha * s * parameters.y;
	float cs = cos( correction );
	float sn = sin( correction );
	float angleCos = c * cs - s * sn;
	float angleSin = s * cs + c * sn;
	float shear = 2.0 * alpha * s * parameters.z;
	float height = 2.0 * alpha * base * exp( parameters.w );

	return mat3(
		vec3( width * angleCos, 0.0, shear * angleCos - height * angleSin ),
		vec3( 0.0, 1.0, 0.0 ),
		vec3( width * angleSin, 0.0, shear * angleSin + height * angleCos )
	);

}

vec2 LTC_AmplitudeUv( const in float roughness, const in float dotNV ) {

	const float LUT_SIZE = 32.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	float c = saturate( dotNV );
	float alpha = max( roughness * roughness, 1e-5 );

	// Resolve the grazing transition around N.V = alpha.
	float v = alpha * ( 1.0 - c ) / ( c + alpha );
	return vec2( roughness, v ) * LUT_SCALE + LUT_BIAS;

}

vec2 LTC_DecodeAmplitude( const in vec2 value, const in float dotNV ) {

	float f = 1.0 - saturate( dotNV );
	float f2 = f * f;

	// Restore the analytic Fresnel term after filtering the residual.
	return vec2( value.x, clamp( value.y + value.x * f2 * f2 * f, 0.0, value.x ) );

}

float LTC_PhysicalMass( const in mat3 mInv ) {

	// Fraction of the LTC cosine distribution above the physical surface horizon.
	float a = mInv[ 0 ][ 0 ];
	float b = mInv[ 0 ][ 2 ];
	return 0.5 * ( 1.0 + a / sqrt( max( a * a + b * b, 1e-30 ) ) );

}

// Stable LTC integration. At most six vertices after clipping both horizons.
vec3 LTC_SafeNormalize( const in vec3 v ) {

	float scale = max( max( abs( v.x ), abs( v.y ) ), abs( v.z ) );
	if ( scale == 0.0 ) return vec3( 0.0 );
	vec3 scaled = v / scale;
	return scaled * inversesqrt( dot( scaled, scaled ) );

}

vec3 LTC_StableEdgeVector( const in vec3 a, const in vec3 b ) {

	float cosine = dot( a, b );
	float x = abs( cosine );
	float v = ( 0.8543985 + ( 0.4965155 + 0.0145206 * x ) * x ) / ( 3.4175940 + ( 4.1616724 + x ) * x );
	// Sum/difference avoids cancellation for nearly collinear edges.
	vec3 c = cross( a, cosine < 0.0 ? b + a : b - a );

	// Normalize the cross product directly instead of dividing by sqrt( 1 - cosine^2 ).
	return cosine > 0.0 ? c * v : 0.5 * LTC_SafeNormalize( c ) - c * v;

}

void LTC_AddEdge( const in float term, inout float sum, inout float correction ) {

	// Compensated accumulation of signed edge integrals.
	float corrected = term - correction;
	float nextSum = sum + corrected;
	correction = ( nextSum - sum ) - corrected;
	sum = nextSum;

}

float LTC_IntegrateQuad( const in vec3 q0, const in vec3 q1, const in vec3 q2, const in vec3 q3 ) {

	vec3 a = LTC_SafeNormalize( q0 );
	vec3 b = LTC_SafeNormalize( q1 );
	vec3 c = LTC_SafeNormalize( q2 );
	vec3 d = LTC_SafeNormalize( q3 );
	float sum = 0.0;
	float correction = 0.0;
	LTC_AddEdge( LTC_StableEdgeVector( d, a ).z, sum, correction );
	LTC_AddEdge( LTC_StableEdgeVector( a, b ).z, sum, correction );
	LTC_AddEdge( LTC_StableEdgeVector( b, c ).z, sum, correction );
	LTC_AddEdge( LTC_StableEdgeVector( c, d ).z, sum, correction );
	return max( sum, 0.0 );

}

int LTC_ClipToHorizon( inout vec3 vertices[ 6 ], const in int count ) {

	if ( count < 3 ) return 0;
	vec3 clipped[ 6 ];
	int outputCount = 0;
	vec3 previous = vertices[ count - 1 ];
	bool previousInside = previous.z > 0.0;
	for ( int i = 0; i < 6; i ++ ) {

		if ( i >= count ) break;
		vec3 current = vertices[ i ];
		bool inside = current.z > 0.0;
		if ( inside != previousInside ) {

			float t = previous.z / ( previous.z - current.z );
			vec3 intersection = mix( previous, current, t );
			intersection.z = 0.0;
			clipped[ outputCount ++ ] = intersection;

		}
		if ( inside ) clipped[ outputCount ++ ] = current;
		previous = current;
		previousInside = inside;

	}
	for ( int i = 0; i < 6; i ++ ) {

		if ( i >= outputCount ) break;
		vertices[ i ] = clipped[ i ];

	}
	return outputCount;

}

float LTC_IntegrateClipped( inout vec3 vertices[ 6 ], const in int count ) {

	int clippedCount = LTC_ClipToHorizon( vertices, count );
	if ( clippedCount < 3 ) return 0.0;
	if ( clippedCount == 4 ) return LTC_IntegrateQuad( vertices[ 0 ], vertices[ 1 ], vertices[ 2 ], vertices[ 3 ] );
	vec3 previous = LTC_SafeNormalize( vertices[ clippedCount - 1 ] );
	float sum = 0.0;
	float correction = 0.0;
	for ( int i = 0; i < 6; i ++ ) {

		if ( i >= clippedCount ) break;
		vec3 current = LTC_SafeNormalize( vertices[ i ] );
		LTC_AddEdge( LTC_StableEdgeVector( previous, current ).z, sum, correction );
		previous = current;

	}
	return max( sum, 0.0 );

}

vec3 LTC_EvaluateSpecular( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {

	vec3 lightNormal = cross( rectCoords[ 1 ] - rectCoords[ 0 ], rectCoords[ 3 ] - rectCoords[ 0 ] );
	if ( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	// Handle normal incidence even when floating-point roundoff leaves a tiny tangent.
	vec3 tangent = cross( cross( N, V ), N );
	if ( dot( tangent, tangent ) < 1e-12 ) tangent = cross( N, abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 0.0, 1.0, 0.0 ) );
	vec3 T1 = LTC_SafeNormalize( tangent );
	vec3 T2 = - cross( N, T1 );
	mat3 basis = transpose( mat3( T1, T2, N ) );
	vec3 q0 = basis * ( rectCoords[ 0 ] - P );
	vec3 q1 = basis * ( rectCoords[ 1 ] - P );
	vec3 q2 = basis * ( rectCoords[ 2 ] - P );
	vec3 q3 = basis * ( rectCoords[ 3 ] - P );
	vec3 vertices[ 6 ];

	// Clip the rectangle against the physical surface before transforming it.
	float minimumPhysicalZ = min( min( q0.z, q1.z ), min( q2.z, q3.z ) );
	float maximumPhysicalZ = max( max( q0.z, q1.z ), max( q2.z, q3.z ) );
	if ( maximumPhysicalZ <= 0.0 ) return vec3( 0.0 );
	if ( minimumPhysicalZ < 0.0 ) {

		vertices[ 0 ] = q0;
		vertices[ 1 ] = q1;
		vertices[ 2 ] = q2;
		vertices[ 3 ] = q3;
		int count = LTC_ClipToHorizon( vertices, 4 );
		for ( int i = 0; i < 6; i ++ ) {

			if ( i >= count ) break;
			vertices[ i ] = mInv * vertices[ i ];

		}
		return vec3( LTC_IntegrateClipped( vertices, count ) );

	}

	// Unclipped quads avoid the dynamic polygon loops.
	q0 = mInv * q0;
	q1 = mInv * q1;
	q2 = mInv * q2;
	q3 = mInv * q3;
	float minimumZ = min( min( q0.z, q1.z ), min( q2.z, q3.z ) );
	float maximumZ = max( max( q0.z, q1.z ), max( q2.z, q3.z ) );
	if ( maximumZ <= 0.0 ) return vec3( 0.0 );
	if ( minimumZ >= 0.0 ) return vec3( LTC_IntegrateQuad( q0, q1, q2, q3 ) );
	vertices[ 0 ] = q0;
	vertices[ 1 ] = q1;
	vertices[ 2 ] = q2;
	vertices[ 3 ] = q3;
	return vec3( LTC_IntegrateClipped( vertices, 4 ) );

}

void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	vec3 normal = geometryNormal;
	vec3 viewDir = geometryViewDir;
	vec3 position = geometryPosition;
	vec3 lightPos = rectAreaLight.position;
	vec3 halfWidth = rectAreaLight.halfWidth;
	vec3 halfHeight = rectAreaLight.halfHeight;
	vec3 lightColor = rectAreaLight.color;
	float roughness = material.roughness;

	vec3 rectCoords[ 4 ];
	rectCoords[ 0 ] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
	rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
	rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
	rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;

	vec2 uv = LTC_Uv( normal, viewDir, roughness );

	float dotNV = saturate( dot( normal, viewDir ) );
	vec4 t1 = texture2D( ltc_1, uv );
	vec2 t2 = LTC_DecodeAmplitude( texture2D( ltc_2, LTC_AmplitudeUv( roughness, dotNV ) ).rg, dotNV );

	mat3 mInv = LTC_DecodeMatrix( t1, roughness, dotNV );
	t2 /= LTC_PhysicalMass( mInv );

	// LTC Fresnel Approximation by Stephen Hill
	// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
	vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );

	reflectedLight.directSpecular += lightColor * fresnel * LTC_EvaluateSpecular( normal, viewDir, position, mInv, rectCoords );

	reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );

	#ifdef USE_CLEARCOAT

		vec3 Ncc = geometryClearcoatNormal;

		vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );

		float dotNVcc = saturate( dot( Ncc, viewDir ) );
		vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
		vec2 t2Clearcoat = LTC_DecodeAmplitude( texture2D( ltc_2, LTC_AmplitudeUv( material.clearcoatRoughness, dotNVcc ) ).rg, dotNVcc );

		mat3 mInvClearcoat = LTC_DecodeMatrix( t1Clearcoat, material.clearcoatRoughness, dotNVcc );
		t2Clearcoat /= LTC_PhysicalMass( mInvClearcoat );

		// LTC Fresnel Approximation for clearcoat
		vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;

		clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_EvaluateSpecular( Ncc, viewDir, position, mInvClearcoat, rectCoords );

	#endif

}

#define RE_Direct_RectArea RE_Direct_RectArea_Physical

#endif

`;
