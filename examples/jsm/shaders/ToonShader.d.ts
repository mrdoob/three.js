import {
  Uniform
} from '../../../src/Three';

export interface ToonShader1 {
  uniforms: {
    uDirLightPos: Uniform;
    uDirLightColor: Uniform;
    uAmbientLightColor: Uniform;
    uBaseColor: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface ToonShader2 {
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
}

export interface ToonShaderHatching {
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
}

export interface ToonShaderDotted {
  uniforms: {
    uDirLightPos: Uniform;
    uDirLightColor: Uniform;
    uAmbientLightColor: Uniform;
    uBaseColor: Uniform;
    uLineColor1: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
