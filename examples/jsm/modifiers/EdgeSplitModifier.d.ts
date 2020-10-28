import { BufferGeometry, Geometry } from "../../../src/Three";

export class EdgeSplitModifier {

	constructor();
	modify( geometry: Geometry, cutOffPoint: number ): BufferGeometry;

}
