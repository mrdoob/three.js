import {
	Uniform
} from '../../../src/Three';

export const VolumeRenderShader1: {
	uniforms: {
		u_size: Uniform;
		u_renderstyle: Uniform;
		u_renderthreshold: Uniform;
		u_clim: Uniform;
		u_data: Uniform;
		u_cmdata: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
