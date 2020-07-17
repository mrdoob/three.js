import {
	Uniform
} from '../../../src/Three';

export const LuminosityShader: {
	uniforms: {
		tDiffuse: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
