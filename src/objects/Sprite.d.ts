import { Material } from './../materials/Material';
import { Vector2 } from './../math/Vector2';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { Intersection } from '../core/Raycaster';

export class Sprite extends Object3D {
  constructor(material?: Material);

  type: 'Sprite';
  isSprite: true;

  material: Material;
  center: Vector2;

  raycast(raycaster: Raycaster, intersects: Intersection[]): void;
  copy(source: this, recursive?: boolean): this;
}
