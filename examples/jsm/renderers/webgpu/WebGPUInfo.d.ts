import { Mesh, Points, LineSegments, Line } from '../../../../build/three.module.js'

export default class WebGPUInfo {

	constructor();

	static autoReset: true;

	render: Object;
	memory: Object;

	update( object: Mesh | Points | LineSegments | Line, count: number ): void;

	reset(): void;

	dispose(): void;

}
