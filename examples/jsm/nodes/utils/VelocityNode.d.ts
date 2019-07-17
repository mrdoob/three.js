import { 
  Object3D,
  Vector3
} from '../../../../build/three.module';

import { NodeFrame } from '../core/NodeFrame';
import { Vector3Node } from '../inputs/Vector3Node';

export interface VelocityNodeParams {
  damping: number;
  spring: number;
  type: string;
}

export class VelocityNode extends Vector3Node {
  constructor(target: Object3D, params?: VelocityNodeParams);

  velocity: Vector3;
  moment: Vector3 | undefined;
  speed: Vector3 | undefined;
  springVelocity: Vector3 | undefined;
  lastVelocity: Vector3 | undefined;

  nodeType: string;

  setParams(params: VelocityNodeParams): void;
  setTarget(target: Object3D): void;
  updateFrameVelocity(frame: NodeFrame): void;
  updateFrame(frame: NodeFrame): void;
  copy(source: VelocityNode): this;

}
