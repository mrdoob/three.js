import { Vector2 } from '../../../../build/three.module.js';

import { NodeBuilder } from '../core/NodeBuilder';
import { NodeFrame } from '../core/NodeFrame';
import { Vector2Node } from '../inputs/Vector2Node';

export class ResolutionNode extends Vector2Node {
  constructor();

  size: Vector2;
  nodeType: string;

  updateFrame(frame: NodeFrame): void;
  copy(source: ResolutionNode): this;
}
