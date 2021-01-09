import { BufferGeometry } from './../core/BufferGeometry';

export class PolyhedronGeometry extends BufferGeometry {

	/**
	 * @param vertices
	 * @param indices
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor(
		vertices: number[],
		indices: number[],
		radius?: number,
		detail?: number
	);

	/**
	 * @default 'PolyhedronGeometry'
	 */
	type: string;

	parameters: {
		vertices: number[];
		indices: number[];
		radius: number;
		detail: number;
	};

}

export { PolyhedronGeometry as PolyhedronBufferGeometry };
