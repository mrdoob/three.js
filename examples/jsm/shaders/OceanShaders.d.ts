import {
  Texture,
  Uniform,
  Vector2,
} from '../../../src/Three';

export const OceanShaders: {

  ocean_sim_vertex: {
    vertexShader: string;
  }
  ocean_subtransform: {
    uniforms: {
      u_input: Uniform,
      u_transformSize: Uniform,
      u_subtransformSize: Uniform,
    },
    fragmentShader: string;
  }
  ocean_initial_spectrum: {
    uniforms: {
      u_wind: Uniform,
      u_resolution: Uniform,
      u_size: Uniform,
    },
    vertexShader: string;
    fragmentShader: string;
  }
  ocean_phase: {
    uniforms: {
      u_phases: Uniform,
      u_deltaTime: Uniform,
      u_resolution: Uniform,
      u_size: Uniform,
    },
    vertexShader: string;
    fragmentShader: string;
  }
  ocean_spectrum: {
    uniforms: {
      u_size: Uniform,
      u_resolution: Uniform,
      u_choppiness: Uniform,
      u_phases: Uniform,
      u_initialSpectrum: Uniform,
    },
    fragmentShader: string;
  }
  ocean_normals: {
    uniforms: {
      u_displacementMap: Uniform,
      u_resolution: Uniform,
      u_size: Uniform,
    },
    fragmentShader: string;
  }
  ocean_main: {
    uniforms: {
      u_displacementMap: Uniform,
      u_normalMap: Uniform,
      u_geometrySize: Uniform,
      u_size: Uniform,
      u_projectionMatrix: Uniform,
      u_viewMatrix: Uniform,
      u_cameraPosition: Uniform,
      u_skyColor: Uniform,
      u_oceanColor: Uniform,
      u_sunDirection: Uniform,
      u_exposure: Uniform,
    },
    vertexShader: string;
    fragmentShader: string;
  }

};
