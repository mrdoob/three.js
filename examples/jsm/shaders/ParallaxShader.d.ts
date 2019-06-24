import {
  Uniform
} from '../../../src/Three';

export interface ParallaxShader {
  modes: {
    none: string;
    basic: string;
    steep: string;
    occlusion: string;
    relief: string;
  };
  uniforms: {
    bumpMap: Uniform;
    map: Uniform;
    parallaxScale: Uniform;
    parallaxMinLayers: Uniform;
    parallaxMaxLayers: Uniform;
  };
  vertexShader: string;
  fragmentShader: string;
}
