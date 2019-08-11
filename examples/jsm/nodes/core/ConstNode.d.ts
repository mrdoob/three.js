import { TempNode } from './TempNode';
import { NodeBuilder } from './NodeBuilder';

export class ConstNode extends TempNode {
  constructor(src: string, useDefine?: boolean);

  src: string;
  useDefine: boolean;
  nodeType: string;

  getType(builder: NodeBuilder): string;
  parse(src: string, useDefine?: boolean): void;
  build(builder: NodeBuilder, output: string): string;
  generate(builder: NodeBuilder, output: string): string;
  copy(source: ConstNode): this;

  static PI: string;
  static PI2: string;
  static RECIPROCAL_PI: string;
  static RECIPROCAL_PI2: string;
  static LOG2: string;
  static EPSILON: string;
}
