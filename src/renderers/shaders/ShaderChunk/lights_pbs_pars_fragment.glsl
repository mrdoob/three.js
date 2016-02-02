#define texture2DLod texture2DLodEXT
#define texture2DProjLod texture2DProjLodEXT
#define textureCubeLod textureCubeLodEXT

varying vec3 var_position_es;
varying vec3 var_normal_es;
varying vec3 var_tangent_es;

varying vec2 var_mainUv;
varying vec2 var_d1Uv;
varying vec2 var_d2Uv;

// ---------------------------------
// Uniforms
// ---------------------------------

#if LIGHT_DIR_COUNT > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ LIGHT_DIR_COUNT ];

#endif

#if LIGHT_SPOT_COUNT > 0

	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float angleCos;
		float exponent;
	};

	uniform SpotLight spotLights[ LIGHT_SPOT_COUNT ];

#endif

#if LIGHT_POINT_COUNT > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ LIGHT_POINT_COUNT ];

#endif

#ifdef MAP_ENVIRONMENT
	uniform samplerCube in_map_environment;
	uniform float in_map_environment_intensity;
	uniform float in_map_environment_mipmapcount;
#endif

uniform mat4 ivMat;

uniform vec3 in_albedo;
uniform vec3 in_f0;
uniform float in_roughness;
uniform float in_light_roughness_offset;

uniform vec2 in_offset_main;
uniform vec2 in_scale_main;
uniform vec2 in_offset_d1;
uniform vec2 in_scale_d1;
uniform vec2 in_offset_d2;
uniform vec2 in_scale_d2;

 // main maps
#ifdef MAP_MAIN_ALBEDO
	uniform sampler2D in_map_main_albedo;
	uniform float in_blendfactor1_main_albedo;
#endif
#ifdef MAP_MAIN_NORMALR
	uniform sampler2D in_map_main_normalr;
	uniform float in_blendfactor1_main_normalr;
	uniform float in_blendfactor2_main_normalr;
#endif
#ifdef MAP_MAIN_F0
	uniform sampler2D in_map_main_f0;
	uniform float in_blendfactor1_main_f0;
#endif


 // detail maps 1
#ifdef MAP_D1_ALBEDO
	uniform sampler2D in_map_d1_albedo;
	uniform float in_blendfactor1_d1_albedo;
#endif
#ifdef MAP_D1_NORMALR
	uniform sampler2D in_map_d1_normalr;
	uniform float in_blendfactor1_d1_normalr;
	uniform float in_blendfactor2_d1_normalr;
#endif
#ifdef MAP_D1_F0
	uniform sampler2D in_map_d1_f0;
	uniform float in_blendfactor1_d1_f0;
#endif


 // detail maps 2
#ifdef MAP_D2_ALBEDO
	uniform sampler2D in_map_d2_albedo;
	uniform float in_blendfactor1_d2_albedo;
#endif
#ifdef MAP_D2_NORMALR
	uniform sampler2D in_map_d2_normalr;
	uniform float in_blendfactor1_d2_normalr;
	uniform float in_blendfactor2_d2_normalr;
#endif
#ifdef MAP_D2_F0
	uniform sampler2D in_map_d2_f0;
	uniform float in_blendfactor1_d2_f0;
#endif

// ---------------------------------
// Pysicaly base shading functins
// ---------------------------------

// geometricShadowing / (4 * NoL * NoV)
float visibilityTermGgx(float NoV, float NoL, float a2)
{
    float G_V = NoV + sqrt( (NoV - NoV * a2) * NoV + a2 );
    float G_L = NoL + sqrt( (NoL - NoL * a2) * NoL + a2 );
    return 1.0 / (G_V * G_L);
}

vec3 microfacetBRDF_GGX( float NoV, float NoL, float NoH, float VoH, vec3 halfVec, vec3 tangent, vec3 binormal, vec3 alpha, vec3 alpha2 , vec3 f0)
{
    // D
    float denom, D;
    if(length(tangent) > 0.5)
    {
    	// Anisotropic GGX Distribution
		float ToH = dot( tangent, halfVec);
		float BoH = dot( binormal, halfVec);
		denom = (ToH * ToH) / alpha2.x + (BoH * BoH) / alpha2.y + NoH * NoH;
		D = 1.0 / (alpha.x * alpha.y * denom * denom);
	}
	else
	{
		// if the tangent is 0 use the
		// isotropic GGX Distribution
	    denom = NoH * NoH * (alpha2.z - 1.0) + 1.0;
        D = alpha2.z / (denom * denom);
	}

	// F
	vec3 F = f0 + (1.0 - f0) * pow( 1.0 - VoH, 5.0 );

	// Vis
	float vis = visibilityTermGgx(NoV, NoL, alpha2.z);

    return D * F * vis;
}

vec3 diffuseBRDF_Disney(float NoV, float NoL, float NoH, float VoH, float roughness, vec3 f0)
{
    float Fd90 = 0.5 + 2.0 * roughness * VoH * VoH;
    vec3 invF0 = vec3(1.0, 1.0, 1.0) - f0;
    float dim = min(invF0.r, min(invF0.g, invF0.b));
    float result = ((1.0 + (Fd90 - 1.0) * pow(1.0 - NoL, 5.0 )) * (1.0 + (Fd90 - 1.0) * pow(1.0 - NoV, 5.0 ))) * dim;
    return vec3(result, result, result);
}

// ----------------------------------------------------------------------------------
// Blend functions
// ----------------------------------------------------------------------------------

// Alpha blending (NormalNonPremul)
vec4 blendFunc0(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, inColor2, inColor2.a * f );
}

// Alpha blending premul (NormalPremul)
vec4 blendFunc1(vec4 inColor1, vec4 inColor2, float f)
{
	return (1.0 - (inColor2.a * f)) * inColor1 + inColor2;
}

// Add
vec4 blendFunc2(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, inColor1 + inColor2, inColor2.a * f );
}

// Subtract
vec4 blendFunc3(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, inColor1 - inColor2, inColor2.a * f );
}

// Multiply
vec4 blendFunc4(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, inColor1 * inColor2, inColor2.a * f );
}

// Multiply2x
vec4 blendFunc5(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, min(inColor1 * inColor2 * 2.0, vec4(1.0, 1.0, 1.0, 1.0)), inColor2.a * f );
}

// Screen
vec4 blendFunc6(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, 1.0 - (1.0 - inColor1) * (1.0 - inColor2), inColor2.a * f );
}

// Overlay
vec4 blendFunc7(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, inColor1 * ( inColor1 + 2.0 * inColor2 * (1.0 - inColor1) ), inColor2.a * f );
}

// Lighten
vec4 blendFunc8(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, max(inColor1, inColor2), inColor2.a * f );
}

// Darken
vec4 blendFunc9(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, min(inColor1, inColor2), inColor2.a * f );
}

// GrainExtract
vec4 blendFunc10(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, (inColor1 - inColor2) + 0.5, inColor2.a * f );
}

// GrainMerge
vec4 blendFunc11(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, (inColor1 + inColor2) - 0.5, inColor2.a * f );
}

// Difference
vec4 blendFunc12(vec4 inColor1, vec4 inColor2, float f)
{
	return mix( inColor1, abs(inColor1 - inColor2) - 0.5, inColor2.a * f );
}