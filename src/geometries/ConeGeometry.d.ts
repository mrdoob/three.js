import { CylinderGeometry } from './CylinderGeometry.js';
import { CylinderBufferGeometry } from './CylinderGeometry.js';
import { BufferGeometry } from '../core/BufferGeometry';

export class ConeBufferGeometry extends BufferGeometry {
  constructor(
    radius?: number,
    height?: number,
    radialSegment?: number,
    heightSegment?: number,
    openEnded?: boolean,
    thetaStart?: number,
    thetaLength?: number
  );
}

export class ConeGeometry extends CylinderGeometry {
  constructor(
    radius?: number,
    height?: number,
    radialSegment?: number,
    heightSegment?: number,
    openEnded?: boolean,
    thetaStart?: number,
    thetaLength?: number
  );
}
