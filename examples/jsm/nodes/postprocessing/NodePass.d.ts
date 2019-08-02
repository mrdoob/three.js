import { NodeMaterial } from '../materials/NodeMaterial';
import { ShaderPass } from '../../postprocessing/ShaderPass';
import { ScreenNode } from '../inputs/ScreenNode';

export class NodePass extends ShaderPass {
  constructor();

  name: string;
  uuid: string;
  userData: object;
  input: ScreenNode;
  needsUpdate: boolean;

  copy(source: NodePass): this;
  toJSON(meta?: object | string): object;
}
