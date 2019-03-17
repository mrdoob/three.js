import { Curve } from './../extras/core/Curve';
import { Vector3 } from './../math/Vector3';
import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class TubeBufferGeometry extends BufferGeometry {
  constructor(
    path: Curve<Vector3>,
    tubularSegments?: number,
    radius?: number,
    radiusSegments?: number,
    closed?: boolean
  );

  parameters: {
    path: Curve<Vector3>;
    tubularSegments: number;
    radius: number;
    radialSegments: number;
    closed: boolean;
  };
  tangents: Vector3[];
  normals: Vector3[];
  binormals: Vector3[];
}

export class TubeGeometry extends Geometry {
  constructor(
    path: Curve<Vector3>,
    tubularSegments?: number,
    radius?: number,
    radiusSegments?: number,
    closed?: boolean
  );

  parameters: {
    path: Curve<Vector3>;
    tubularSegments: number;
    radius: number;
    radialSegments: number;
    closed: boolean;
  };
  tangents: Vector3[];
  normals: Vector3[];
  binormals: Vector3[];
}
