import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode.js';

export class LightNode extends TempNode {
  constructor(scope?: string);

  scope: string;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: LightNode): this;

  static TOTAL: string;
}
