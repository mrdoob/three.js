import {
  Uniform
} from '../../../src/Three';

export const BokehShader: {
  uniforms: {
    textureWidth: Uniform;
    textureHeight: Uniform;
    focalDepth: Uniform;
    focalLength: Uniform;
    fstop: Uniform;
    tColor: Uniform;
    tDepth: Uniform;
    maxblur: Uniform;
    showFocus: Uniform;
    manualdof: Uniform;
    vignetting: Uniform;
    depthblur: Uniform;
    threshold: Uniform;
    gain: Uniform;
    bias: Uniform;
    fringe: Uniform;
    znear: Uniform;
    zfar: Uniform;
    noise: Uniform;
    dithering: Uniform;
    pentagon: Uniform;
    shaderFocus: Uniform;
    focusCoords: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};

export const BokehDepthShader: {
  uniforms: {
    mNear: Uniform;
    mFar: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
};
