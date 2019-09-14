import {
  ShaderMaterial,
  WebGLRenderer
} from '../../../../src/Three';

import { Node } from '../core/Node';
import { NodeBuilder } from '../core/NodeBuilder';
import { NodeFrame } from '../core/NodeFrame';

export interface NodeMaterialBuildParams {
  builder?: NodeBuilder;
  renderer?: WebGLRenderer;
}

export class NodeMaterial extends ShaderMaterial {
  constructor(vertex: Node, fragment: Node);

  vertex: Node;
  fragment: Node;

  updaters: object[];

  isNodeMaterial: boolean;
  properties: object;

  updateFrame(frame: NodeFrame): void;
  build(params?: NodeMaterialBuildParams): this;
  copy(source: NodeMaterial): this;
}
