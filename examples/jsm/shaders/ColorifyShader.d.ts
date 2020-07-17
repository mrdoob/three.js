import {
	Uniform
} from '../../../src/Three';

export const ColorifyShader: {
	uniforms: {
		tDiffuse: Uniform;
		color: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
