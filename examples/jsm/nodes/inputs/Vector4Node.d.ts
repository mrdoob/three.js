import { Vector4 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class Vector4Node extends InputNode {
  constructor(x: Vector4 | number, y?: number, z?: number, w?: number);

  value: Vector4;
  nodeType: string;

  generateReadonly(builder: NodeBuilder, output: string, uuid?: string, type?: string, ns?: string, needsUpdate?: boolean): string;
  copy(source: Vector4Node): this;
}
