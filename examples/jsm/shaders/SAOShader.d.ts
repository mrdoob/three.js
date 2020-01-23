import {
	Uniform
} from '../../../src/Three';

export const SAOShader: {
	defines: {
		NUM_SAMPLES: number;
		NUM_RINGS: number;
		NORMAL_TEXTURE: number;
		DIFFUSE_TEXTURE: number;
		DEPTH_PACKING: number;
		PERSPECTIVE_CAMERA: number;
	};
	uniforms: {
		tDepth: Uniform;
		tDiffuse: Uniform;
		tNormal: Uniform;
		size: Uniform;
		cameraNear: Uniform;
		cameraFar: Uniform;
		cameraProjectionMatrix: Uniform;
		cameraInverseProjectionMatrix: Uniform;
		scale: Uniform;
		intensity: Uniform;
		bias: Uniform;
		minResolution: Uniform;
		kernelRadius: Uniform;
		randomSeed: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
