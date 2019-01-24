import { Line } from './Line.js';
import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { BufferGeometry } from '../core/BufferGeometry';

export class LineLoop extends Line {
  constructor(
    geometry?: Geometry | BufferGeometry,
    material?: Material | Material[]
  );
}
