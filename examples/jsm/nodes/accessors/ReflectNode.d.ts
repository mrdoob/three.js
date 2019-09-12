import { Vector2 } from '../../../../src/Three';

import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode';

export class ReflectNode extends TempNode {
  constructor(scope?: string);

  scope: string;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;

  static CUBE: string;
  static SPHERE: string;
  static VECTOR: string;
}