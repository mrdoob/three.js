import {
	Uniform
} from '../../../src/Three';

export const HorizontalTiltShiftShader: {
	uniforms: {
		tDiffuse: Uniform;
		h: Uniform;
		r: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
