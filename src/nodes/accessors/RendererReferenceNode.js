import ReferenceBaseNode from './ReferenceBaseNode.js';
import { nodeObject } from '../tsl/TSLCore.js';

class RendererReferenceNode extends ReferenceBaseNode {

	static get type() {

		return 'RendererReferenceNode';

	}

	constructor( property, inputType, renderer = null ) {

		super( property, inputType, renderer );

		this.renderer = renderer;

	}

	updateReference( state ) {

		this.reference = this.renderer !== null ? this.renderer : state.renderer;

		return this.reference;

	}

}

export default RendererReferenceNode;

export const rendererReference = ( name, type, renderer ) => nodeObject( new RendererReferenceNode( name, type, renderer ) );
