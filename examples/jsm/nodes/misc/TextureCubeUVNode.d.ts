import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { FloatNode } from '../inputs/FloatNode';
import { StructNode } from '../core/StructNode';
import { FunctionNode } from '../core/FunctionNode';
import { BlinnExponentToRoughnessNode } from '../bsdfs/BlinnExponentToRoughnessNode';
import { Node } from '../core/Node';

export class TextureCubeUVNode extends TempNode {
  constructor(uv: Node, textureSize: FloatNode, blinnExponentToRoughness: BlinnExponentToRoughnessNode);

  uv: Node;
  textureSize: FloatNode;
  blinnExponentToRoughness: BlinnExponentToRoughnessNode;
  nodeType: string;

  generate(builder: NodeBuilder, output: string): string;

  static Nodes: {
    TextureCubeUVData: StructNode;
    textureCubeUV: FunctionNode;
  }

}
