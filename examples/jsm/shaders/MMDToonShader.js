/**
 * MMD Toon Shader
 *
 */

import { UniformsUtils, ShaderLib } from '../../../build/three.module.js';

const lights_mmd_toon_pars_fragment = `
varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif


struct BlinnPhongMaterial {

	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;

};

void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	vec3 irradiance = 0.5 * getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	irradiance += 0.5 * saturate( dot( geometry.normal, directLight.direction ) ) * directLight.color;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong

#define Material_LightProbeLOD( material )	(0)
`;

const MMDToonShader = {

	uniforms: UniformsUtils.merge( [
    ShaderLib.toon.uniforms,
    ShaderLib.phong.uniforms,
    ShaderLib.matcap.uniforms,
  ] ),

	vertexShader: '#define TOON' + '\n' + ShaderLib.phong.vertexShader,

  // Combined algorithm:
  // * Extend from phong fragment shader
  // * Add gradientmap_pars_fragment.
  // * Combine dotNL and gradient irradiences as total irradience.
  //   (Replace lights_phong_pars_fragment with lights_mmd_toon_pars_fragment)
	fragmentShader:
    ShaderLib.phong.fragmentShader
      .replace(
        '#include <envmap_common_pars_fragment>',
        `
          #include <gradientmap_pars_fragment>
          #include <envmap_common_pars_fragment>
        `
      )
      .replace(
        '#include <lights_phong_pars_fragment>',
        lights_mmd_toon_pars_fragment
      ),
      //) + 'c',
 
};

export { MMDToonShader };
