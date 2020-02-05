import {
	EdgesGeometry,
	InstancedBufferGeometry,
	LineSegments,
	Matrix4,
	Mesh,
	WireframeGeometry
} from '../../../src/Three';

export class LineSegmentsGeometry extends InstancedBufferGeometry {

	constructor();
	readonly isLineSegmentsGeometry: true;

	applyMatrix4( matrix: Matrix4 ): this;
	computeBoundingBox(): void;
	computeBoundingSphere(): void;
	fromEdgesGeometry( geometry: WireframeGeometry ): this;
	fromLineSegements( lineSegments: LineSegments ): this;
	fromMesh( mesh: Mesh ): this;
	fromWireframeGeometry( geometry: EdgesGeometry ): this;
	setColors( array: number[] | Float32Array ): this;
	setPositions( array: number[] | Float32Array ): this;

}
