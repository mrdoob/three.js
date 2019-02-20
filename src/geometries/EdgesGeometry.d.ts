import { BufferGeometry } from '../core/BufferGeometry';
import { Geometry } from '../core/Geometry';

export class EdgesGeometry extends BufferGeometry {
  constructor(geometry: BufferGeometry | Geometry, thresholdAngle?: number);
}
