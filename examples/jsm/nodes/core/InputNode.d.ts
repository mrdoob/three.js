import { TempNode, TempNodeParams } from './TempNode';
import { NodeBuilder } from './NodeBuilder';

export class InputNode extends TempNode {
  constructor(type: string, params?: TempNodeParams);

  readonly: boolean;

  setConst(value: boolean): this;
  getConst(builder: NodeBuilder): boolean;
  copy(source: InputNode): this;
  generate(builder: NodeBuilder, output: string, uuid?: string, type?: string, ns?: string, needsUpdate?: boolean): string;
}
