import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode.js';

export class PositionNode extends TempNode {
  constructor(scope?: string);

  scope: string;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: PositionNode): this;

  static LOCAL: string;
  static WORLD: string;
  static VIEW: string;
  static PROJECTION: string;
}
