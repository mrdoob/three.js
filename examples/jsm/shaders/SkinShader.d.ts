import {
  Uniform
} from '../../../src/Three';

export interface SkinShaderBasic {
  uniforms: {
    ambientLightColor: Uniform;
    bumpMap: Uniform;
    bumpScale: Uniform;
    diffuse: Uniform;
    directionalLights: Uniform;
    directionalShadowMap: Uniform;
    directionalShadowMatrix: Uniform;
    enableBump: Uniform;
    enableSpecular: Uniform;
    fogColor: Uniform;
    fogDensity: Uniform;
    fogFar: Uniform;
    fogNear: Uniform;
    hemisphereLights: Uniform;
    lightProbe: Uniform;
    offsetRepeat: Uniform;
    opacity: Uniform;
    pointLights: Uniform;
    pointShadowMap: Uniform;
    pointShadowMatrix: Uniform;
    rectAreaLights: Uniform;
    specular: Uniform;
    specularMap: Uniform;
    spotLights: Uniform;
    spotShadowMap: Uniform;
    spotShadowMatrix: Uniform;
    tBeckmann: Uniform;
    tDiffuse: Uniform;
    uRoughness: Uniform;
    uSpecularBrightness: Uniform;
    uWrapRGB: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface SkinShaderAdvanced {
  uniforms: {
    ambientLightColor: Uniform;
    diffuse: Uniform;
    directionalLights: Uniform;
    directionalShadowMap: Uniform;
    directionalShadowMatrix: Uniform;
    fogColor: Uniform;
    fogDensity: Uniform;
    fogFar: Uniform;
    fogNear: Uniform;
    hemisphereLights: Uniform;
    lightProbe: Uniform;
    opacity: Uniform;
    passID: Uniform;
    pointLights: Uniform;
    pointShadowMap: Uniform;
    pointShadowMatrix: Uniform;
    rectAreaLights: Uniform;
    specular: Uniform;
    spotLights: Uniform;
    spotShadowMap: Uniform;
    spotShadowMatrix: Uniform;
    tBeckmann: Uniform;
    tBlur1: Uniform;
    tBlur2: Uniform;
    tBlur3: Uniform;
    tBlur4: Uniform;
    tDiffuse: Uniform;
    tNormal: Uniform;
    uNormalScale: Uniform;
    uRoughness: Uniform;
    uSpecularBrightness: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface SkinShaderBeckmann {
  uniforms: {};
  vertexShader: string;
  fragmentShader: string;
}
