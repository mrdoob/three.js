import {
  Mesh,
} from '../../../src/Three';

import { LineMaterial } from './LineMaterial';
import { LineSegmentsGeometry } from './LineSegmentsGeometry';

export class Wireframe extends Mesh {
  constructor(geometry?: LineSegmentsGeometry, material?: LineMaterial);
  isWireframe: boolean;

  computeLineDistances(): this;
}
