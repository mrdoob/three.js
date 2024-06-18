import { UniformsLib, type Texture } from 'three';

export type UniformsLibSsaoType = typeof UniformsLib & {ssaomap: Texture | null};
