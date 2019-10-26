import {
	Uniform
} from '../../../src/Three';

export const FreiChenShader: {
	uniforms: {
		tDiffuse: Uniform;
		aspect: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
