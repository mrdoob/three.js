import {
  BufferGeometry,
  Object3D,
  ShaderMaterial,
  Texture,
} from '../../../src/Three';


export interface GPUParticleSystemOptions {
  maxParticles?: number;
  containerCount?: number;
  particleNoiseTex?: Texture;
  particleSpriteTex?: Texture;
}

export class GPUParticleSystem extends Object3D {
  constructor( options: GPUParticleSystemOptions );

  PARTICLE_COUNT: number;
  PARTICLE_CONTAINERS: number;

  PARTICLE_NOISE_TEXTURE: Texture;
  PARTICLE_SPRITE_TEXTURE: Texture;

  PARTICLES_PER_CONTAINER: number;
  PARTICLE_CURSOR: number;
  time: number;
  particleContainers: number[];
  rand: number[];

  particleNoiseTex: Texture;
  particleSpriteTex: Texture;

  particleShaderMat: ShaderMaterial;

  random(): number;
  init(): void;
  spawnParticle( option: object ): void;
  update( time: number ): void;
  dispose(): void;

}

export class GPUParticleContainer extends Object3D {
  constructor( maxParticles: number, particleSystem: GPUParticleSystem );

	PARTICLE_COUNT: number;
	PARTICLE_CURSOR: number;
	time: number;
	offset: number;
	count: number;
	DPR: number;
	GPUParticleSystem: GPUParticleSystem;
	particleUpdate: number;

  particleShaderGeo: BufferGeometry;

  particleShaderMat: ShaderMaterial;

  init(): void;
  spawnParticle( option: object ): void;
  update( time: number ): void;
  dispose(): void;

}
