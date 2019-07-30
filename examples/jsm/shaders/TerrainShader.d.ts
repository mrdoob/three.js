import {
  Uniform
} from '../../../src/Three';

export const TerrainShader: {
  uniforms: {
    ambientLightColor: Uniform;
    diffuse: Uniform;
    directionalLights: Uniform;
    directionalShadowMap: Uniform;
    directionalShadowMatrix: Uniform;
    enableDiffuse1: Uniform;
    enableDiffuse2: Uniform;
    enableReflection: Uniform;
    enableSpecular: Uniform;
    fogColor: Uniform;
    fogDensity: Uniform;
    fogFar: Uniform;
    fogNear: Uniform;
    hemisphereLights: Uniform;
    lightProbe: Uniform;
    opacity: Uniform;
    pointLights: Uniform;
    pointShadowMap: Uniform;
    pointShadowMatrix: Uniform;
    rectAreaLights: Uniform;
    shininess: Uniform;
    specular: Uniform;
    spotLights: Uniform;
    spotShadowMap: Uniform;
    spotShadowMatrix: Uniform;
    tDetail: Uniform;
    tDiffuse1: Uniform;
    tDiffuse2: Uniform;
    tDisplacement: Uniform;
    tNormal: Uniform;
    tSpecular: Uniform;
    uDisplacementBias: Uniform;
    uDisplacementScale: Uniform;
    uNormalScale: Uniform;
    uOffset: Uniform;
    uRepeatBase: Uniform;
    uRepeatOverlay: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
