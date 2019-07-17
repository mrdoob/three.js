import {
  Matrix4,
  Texture 
} from '../../../../src/Three';

import { InputNode } from '../core/InputNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { Node } from '../core/Node';
import { UVNode } from '../accessors/UVNode';

export class TextureNode extends InputNode {
  constructor(value: Texture, uv?: UVNode, bias?: Node, project?: boolean);

  value: Matrix4;
  uv: UVNode;
  bias: Matrix4;
  project: boolean;
  nodeType: string;

  getTexture(builder: NodeBuilder, output: string): string;
  generate(builder: NodeBuilder, output: string): string;
  copy(source: TextureNode): this;
}
