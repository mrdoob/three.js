import {
  PolyhedronGeometry,
  PolyhedronBufferGeometry,
} from './PolyhedronGeometry';

export class OctahedronBufferGeometry extends PolyhedronBufferGeometry {
  constructor(radius?: number, detail?: number);
}

export class OctahedronGeometry extends PolyhedronGeometry {
  constructor(radius?: number, detail?: number);
}
