import {
  Uniform
} from '../../../src/Three';

export const GodRaysDepthMaskShader: {
  uniforms: {
    tInput: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};

export const GodRaysGenerateShader: {
  uniforms: {
    tInput: Uniform;
    fStepSize: Uniform;
    vSunPositionScreenSpace: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};

export const GodRaysCombineShader: {
  uniforms: {
    tColors: Uniform;
    tGodRays: Uniform;
    fGodRayIntensity: Uniform;
    vSunPositionScreenSpace: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export const GodRaysFakeSunShader: {
  uniforms: {
    vSunPositionScreenSpace: Uniform;
    fAspect: Uniform;
    sunColor: Uniform;
    bgColor: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
