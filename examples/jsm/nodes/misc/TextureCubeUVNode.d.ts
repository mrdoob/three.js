import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { FloatNode } from '../inputs/FloatNode';
import { StructNode } from '../core/StructNode';
import { FunctionNode } from '../core/FunctionNode';
import { Node } from '../core/Node';

export class TextureCubeUVNode extends TempNode {
  constructor(uv: Node, textureSize: FloatNode);

  uv: Node;
  textureSize: FloatNode;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;

  static Nodes: {
    TextureCubeUVData: StructNode;
    textureCubeUV: FunctionNode;
  }

}
