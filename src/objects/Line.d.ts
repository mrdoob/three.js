import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

export class Line extends Object3D {
  constructor(
    geometry?: Geometry | BufferGeometry,
    material?: Material | Material[],
    mode?: number
  );

  geometry: Geometry | BufferGeometry;
  material: Material | Material[];

  type: 'Line';
  isLine: true;

  computeLineDistances(): this;
  raycast(raycaster: Raycaster, intersects: Intersection[]): void;
}
