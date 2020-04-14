import {
	Uniform
} from '../../../src/Three';

export const BrightnessContrastShader: {
	uniforms: {
		tDiffuse: Uniform;
		brightness: Uniform;
		contrast: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
