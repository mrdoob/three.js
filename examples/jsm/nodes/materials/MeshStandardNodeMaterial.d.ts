import {
  Color,
  Vector2
} from '../../../../src/Three';

import { NodeMaterial } from './NodeMaterial';
import { StandardNode } from './StandardNodeMaterial';
import { PropertyNode } from "../inputs/PropertyNode";
import { NodeBuilder } from '../core/NodeBuilder';

export class MeshStandardNode extends StandardNode {
  constructor();

  properties: {
    color: Color;
    roughness: number;
    metalness: number;
    normalScale: Vector2;
  }

  inputs: {
    color: PropertyNode
    roughness: PropertyNode
    metalness: PropertyNode
    normalScale: PropertyNode
  }

  build(builder: NodeBuilder): string;
}

export class MeshStandardNodeMaterial extends NodeMaterial {
  constructor();

  color: Color;
  roughness: number;
  metalness: number;
  normalScale: Vector2;
}
