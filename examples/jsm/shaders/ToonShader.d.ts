import {
  Uniform
} from '../../../src/Three';

export const ToonShader1: {
  uniforms: {
    uDirLightPos: Uniform;
    uDirLightColor: Uniform;
    uAmbientLightColor: Uniform;
    uBaseColor: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};

export const ToonShader2: {
  uniforms: {
    uDirLightPos: Uniform;
    uDirLightColor: Uniform;
    uAmbientLightColor: Uniform;
    uBaseColor: Uniform;
    uLineColor1: Uniform;
    uLineColor2: Uniform;
    uLineColor3: Uniform;
    uLineColor4: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};

export const ToonShaderHatching: {
  uniforms: {
    uDirLightPos: Uniform;
    uDirLightColor: Uniform;
    uAmbientLightColor: Uniform;
    uBaseColor: Uniform;
		uLineColor1: Uniform;
    uLineColor2: Uniform;
    uLineColor3: Uniform;
    uLineColor4: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};

export const ToonShaderDotted: {
  uniforms: {
    uDirLightPos: Uniform;
    uDirLightColor: Uniform;
    uAmbientLightColor: Uniform;
    uBaseColor: Uniform;
    uLineColor1: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
