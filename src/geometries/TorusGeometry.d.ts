import { TextGeometryParameters } from './TextGeometry';
import { Font } from './../extras/core/Font';
import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class TorusBufferGeometry extends BufferGeometry {
  constructor(
    radius?: number,
    tube?: number,
    radialSegments?: number,
    tubularSegments?: number,
    arc?: number
  );

  parameters: {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
    arc: number;
  };
}

export class TorusGeometry extends Geometry {
  constructor(
    radius?: number,
    tube?: number,
    radialSegments?: number,
    tubularSegments?: number,
    arc?: number
  );

  parameters: {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
    arc: number;
  };
}
