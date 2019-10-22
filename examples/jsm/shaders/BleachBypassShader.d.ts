import {
	Uniform
} from '../../../src/Three';

export const BleachBypassShader: {
	uniforms: {
		tDiffuse: Uniform;
		opacity: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
