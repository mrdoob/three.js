import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class TorusKnotBufferGeometry extends BufferGeometry {

	constructor(
    radius?: number,
    tube?: number,
    tubularSegments?: number,
    radialSegments?: number,
    p?: number,
    q?: number
  );

  parameters: {
    radius: number;
    tube: number;
    tubularSegments: number;
    radialSegments: number;
    p: number;
    q: number;
    heightScale: number;
  };

}

export class TorusKnotGeometry extends Geometry {

	constructor(
    radius?: number,
    tube?: number,
    tubularSegments?: number,
    radialSegments?: number,
    p?: number,
    q?: number
  );

  parameters: {
    radius: number;
    tube: number;
    tubularSegments: number;
    radialSegments: number;
    p: number;
    q: number;
    heightScale: number;
  };

}
