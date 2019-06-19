import {
  Uniform
} from '../../../src/Three';

export interface GodRaysDepthMaskShader {
  uniforms: {
    tInput: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface GodRaysGenerateShader {
  uniforms: {
    tInput: Uniform;
    fStepSize: Uniform;
    vSunPositionScreenSpace: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface GodRaysCombineShader {
  uniforms: {
    tColors: Uniform;
    tGodRays: Uniform;
    fGodRayIntensity: Uniform;
    vSunPositionScreenSpace: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface GodRaysFakeSunShader {
  uniforms: {
    vSunPositionScreenSpace: Uniform;
    fAspect: Uniform;
    sunColor: Uniform;
    bgColor: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
