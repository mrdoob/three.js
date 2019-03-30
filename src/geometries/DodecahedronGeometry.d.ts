import { Geometry } from './../core/Geometry';
import { PolyhedronBufferGeometry } from './PolyhedronGeometry';

export class DodecahedronBufferGeometry extends PolyhedronBufferGeometry {
  constructor(radius?: number, detail?: number);
}

export class DodecahedronGeometry extends Geometry {
  constructor(radius?: number, detail?: number);

  parameters: {
    radius: number;
    detail: number;
  };
}
