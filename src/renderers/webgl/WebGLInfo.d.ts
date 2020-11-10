import { WebGLProgram } from './WebGLProgram';

/**
 * An object with a series of statistical information about the graphics board memory and the rendering process.
 */
export class WebGLInfo {

	constructor( gl: WebGLRenderingContext );

	/**
	 * @default true
	 */
	autoReset: boolean;

	/**
	 * @default { geometries: 0, textures: 0 }
	 */
	memory: {
		geometries: number;
		textures: number;
	};

	/**
	 * @default null
	 */
	programs: WebGLProgram[] | null;

	/**
	 * @default { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 }
	 */
	render: {
		calls: number;
		frame: number;
		lines: number;
		points: number;
		triangles: number;
	};
	update( count: number, mode: number, instanceCount: number ): void;
	reset(): void;

}
