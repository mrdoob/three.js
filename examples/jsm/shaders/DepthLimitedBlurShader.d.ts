import {
	Uniform,
	Vector2,
	Material
} from '../../../src/Three';

export const DepthLimitedBlurShader: {
	defines: {
		KERNEL_RADIUS: number;
		DEPTH_PACKING: number;
		PERSPECTIVE_CAMERA: number;
	};
	uniforms: {
		tDiffuse: Uniform;
		size: Uniform;
		sampleUvOffsets: Uniform;
		sampleWeights: Uniform;
		tDepth: Uniform;
		cameraNear: Uniform;
		cameraFar: Uniform;
		depthCutoff: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};

export interface BlurShaderUtils {
	createSampleWeights( kernelRadius: number, stdDev: number ): number[];
	createSampleOffsets( kernelRadius: number, uvIncrement: Vector2 ): Vector2[];
	configure( configure: Material, kernelRadius: number, stdDev: number, uvIncrement: Vector2 ): void;
}
