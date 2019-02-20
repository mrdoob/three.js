import { Vector2 } from './../math/Vector2';
import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class LatheBufferGeometry extends BufferGeometry {
  constructor(
    points: Vector2[],
    segments?: number,
    phiStart?: number,
    phiLength?: number
  );

  parameters: {
    points: Vector2[];
    segments: number;
    phiStart: number;
    phiLength: number;
  };
}

export class LatheGeometry extends Geometry {
  constructor(
    points: Vector2[],
    segments?: number,
    phiStart?: number,
    phiLength?: number
  );

  parameters: {
    points: Vector2[];
    segments: number;
    phiStart: number;
    phiLength: number;
  };
}
