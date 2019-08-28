import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode';
import { ResolutionNode } from './ResolutionNode';

export class ScreenUVNode extends TempNode {
  constructor(resolution?: ResolutionNode);

  resolution: ResolutionNode;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;
  copy(source: ScreenUVNode): this;
}
