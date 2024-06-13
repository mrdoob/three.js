import type { Texture } from 'three';

declare module "three" {
    interface Material {
        ssaoMap: Texture | null;
    }
}

export * from './Cone';
export * from './UniformsLibSsaoMap';