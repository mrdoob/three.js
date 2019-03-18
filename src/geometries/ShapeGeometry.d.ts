import { Shape } from './../extras/core/Shape';
import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class ShapeBufferGeometry extends BufferGeometry {
  constructor(shapes: Shape | Shape[], curveSegments?: number);
}

export class ShapeGeometry extends Geometry {
  constructor(shapes: Shape | Shape[], curveSegments?: number);

  addShapeList(shapes: Shape[], options: any): ShapeGeometry;
  addShape(shape: Shape, options?: any): void;
}
