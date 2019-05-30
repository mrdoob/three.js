import {
  Uniform
} from '../../../src/Three';

export interface SSAOShader {
  defines: {
    PERSPECTIVE_CAMERA: number;
    KERNEL_SIZE: number;
  };
  uniforms: {
    tDiffuse: Uniform;
    tNormal: Uniform;
    tDepth: Uniform;
    tNoise: Uniform;
    kernel: Uniform;
    cameraNear: Uniform;
    cameraFar: Uniform;
    resolution: Uniform;
    cameraProjectionMatrix: Uniform;
    cameraInverseProjectionMatrix: Uniform;
    kernelRadius: Uniform;
    minDistance: Uniform;
    maxDistance: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface SSAODepthShader {
  defines: {
    PERSPECTIVE_CAMERA: number;
  };
  uniforms: {
    tDepth: Uniform;
    cameraNear: Uniform;
    cameraFar: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}

export interface SSAOBlurShader {
  uniforms: {
    tDiffuse: Uniform;
    resolution: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
