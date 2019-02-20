import { Geometry } from './../core/Geometry';
import { BufferGeometry } from '../core/BufferGeometry';

export class CylinderBufferGeometry extends BufferGeometry {
  constructor(
    radiusTop?: number,
    radiusBottom?: number,
    height?: number,
    radialSegments?: number,
    heightSegments?: number,
    openEnded?: boolean,
    thetaStart?: number,
    thetaLength?: number
  );

  parameters: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
  };
}

export class CylinderGeometry extends Geometry {
  /**
   * @param radiusTop — Radius of the cylinder at the top.
   * @param radiusBottom — Radius of the cylinder at the bottom.
   * @param height — Height of the cylinder.
   * @param radiusSegments — Number of segmented faces around the circumference of the cylinder.
   * @param heightSegments — Number of rows of faces along the height of the cylinder.
   * @param openEnded - A Boolean indicating whether or not to cap the ends of the cylinder.
   */
  constructor(
    radiusTop?: number,
    radiusBottom?: number,
    height?: number,
    radiusSegments?: number,
    heightSegments?: number,
    openEnded?: boolean,
    thetaStart?: number,
    thetaLength?: number
  );

  parameters: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
  };
}
