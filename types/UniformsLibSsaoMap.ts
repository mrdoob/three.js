import { UniformsLib as Three_UniformsLib, type Texture } from 'three';

export const UniformsLib = Three_UniformsLib as typeof Three_UniformsLib & {ssaomap: Texture | null};