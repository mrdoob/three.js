import {
	Uniform
} from '../../../src/Three';

export const DOFMipMapShader: {
	uniforms: {
		tColor: Uniform;
		tDepth: Uniform;
		focus: Uniform;
		maxblur: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
