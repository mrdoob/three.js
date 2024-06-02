export default /* glsl */`
varying vec3 vViewPosition;

struct LambertMaterial {

	vec3 diffuseColor;
	float specularStrength;

};
float safeacos(const float x) {
    return acos(clamp(x, -1.0, 1.0));
}

float phase(float u) {
    return (2.0*(sqrt(1.0 - u*u) - u*acos(u)))/(3.0*PI*PI);
}
vec3 shadeLambertianSphereBRDF(vec3 wi, vec3 wo, vec3 norm,vec3 kd) { 

    float ui = dot(wi, norm);
    float uo = dot(wo, norm);
    if (ui < 0.0 || uo < 0.0) return vec3(0.0);
    
	float uIuO = ui*uo;
	vec3 c =  (1.0 - pow(1.0 - kd, vec3(2.73556))) / (1.0 - 0.184096*pow(1.0 - kd, vec3(2.48423)));
	float minusiodot = -dot(wi, wo);
    float ui2 = ui*ui;
    float uo2 = uo*uo;
    float S = sqrt((1.0-ui2)*(1.0-uo2));
    float cp = -((minusiodot + uIuO)/S);
    float phi = safeacos(cp);
    
    
    // Single-Scattering component, corresponds to "f_1" in the paper.
    vec3 SS = c*(phase(minusiodot) / (ui + uo));
    
    // The  block is a literal coding of Equation 48 from the paper.

	vec3 fr = max( 
        vec3(0.0), 
        SS + 0.234459*pow(kd, vec3(1.85432)) \
           + (0.0151829*(c-0.24998)*(abs(phi)+sqrt(uIuO))) / (0.113706 + (safeacos(S)/S))
    );
    return PI * uo * fr;
    
}
/* struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};

struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
}; */
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {


	vec3 kd = material.diffuseColor;
	vec3 wo = directLight.direction;
	vec3 wi = geometryViewDir;
	vec3 irradiance  = shadeLambertianSphereBRDF(wi,wo,geometryNormal,kd);
	reflectedLight.directDiffuse +=   irradiance;  // no need to multiply with BRDF_Lambert( material.diffuseColor );
	
}

void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {



	reflectedLight.indirectDiffuse +=  irradiance * BRDF_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert
`;
