import {
	Texture,
	WebGLRenderer
} from '../../../../src/Three';

import { Node } from './Node';

export class NodeFrame {

	constructor( time: number );
	time: number;
	id: number;
	delta: number | undefined;
	renderer: WebGLRenderer | undefined;
	renderTexture: Texture | undefined;

	update( delta: number ): this;
	setRenderer( renderer: WebGLRenderer ): this;
	setRenderTexture( renderTexture: Texture ): this;
	updateNode( node: Node ): this;

}
