import { NodeBuilder } from '../core/NodeBuilder';
import { TextureNode } from './TextureNode';
import { UVNode } from '../accessors/UVNode';

export class ScreenNode extends TextureNode {
  constructor(uv?: UVNode);

  nodeType: string;

  getTexture(builder: NodeBuilder, output: string): string;
}
