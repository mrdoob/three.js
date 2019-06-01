import {
  Uniform
} from '../../../src/Three';

export interface FresnelShader {
  uniforms: {
    mRefractionRatio: Uniform;
    mFresnelBias: Uniform;
    mFresnelPower: Uniform;
    mFresnelScale: Uniform;
    tCube: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
