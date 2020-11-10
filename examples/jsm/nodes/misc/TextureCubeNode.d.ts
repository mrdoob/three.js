import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { TextureNode } from '../inputs/TextureNode';
import { FloatNode } from '../inputs/FloatNode';
import { TextureCubeUVNode } from './TextureCubeUVNode';

export class TextureCubeNode extends TempNode {

	constructor( value: TextureNode, textureSize?: FloatNode );

	value: TextureNode;
	textureSize: FloatNode;
	radianceCache: {
		uv: TextureCubeUVNode
	};
	irradianceCache: {
		uv: TextureCubeUVNode
	};
	nodeType: string;

	generateTextureCubeUV( builder: NodeBuilder, output: string ): string;

}
