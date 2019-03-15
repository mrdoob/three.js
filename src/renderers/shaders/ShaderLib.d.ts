import { IUniform } from './UniformsLib';

export interface Shader {
  uniforms: { [uniform: string]: IUniform };
  vertexShader: string;
  fragmentShader: string;
}

export let ShaderLib: {
  [name: string]: Shader;
  basic: Shader;
  lambert: Shader;
  phong: Shader;
  standard: Shader;
  points: Shader;
  dashed: Shader;
  depth: Shader;
  normal: Shader;
  cube: Shader;
  equirect: Shader;
  depthRGBA: Shader;
  distanceRGBA: Shader;
  physical: Shader;
};
