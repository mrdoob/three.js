import {
  BufferGeometry,
  Geometry
} from '../../../src/Three';

export class SimplifyModifier {
  constructor();
  modify(geometry: BufferGeometry | Geometry, count: number): BufferGeometry;
}
