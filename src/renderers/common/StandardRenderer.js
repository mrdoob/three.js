import Renderer from './Renderer.js';
import StandardNodeLibrary from './nodes/StandardNodeLibrary.js';

class StandardRenderer extends Renderer {

	constructor( backend, parameters = {} ) {

		super( backend, parameters );

		this.isStandardRenderer = true;

		this.nodes.library = new StandardNodeLibrary();

	}

}

export default StandardRenderer;
