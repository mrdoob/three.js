import { EventDispatcher } from '../core/EventDispatcher.js';

class Controls extends EventDispatcher {

	constructor( object, domElement ) {

		super();

		this.object = object;
		this.domElement = domElement;

		this.enabled = true;

		this.state = - 1;

		this.keys = {};
		this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null };
		this.touches = { ONE: null, TWO: null };

	}

	connect() {}

	disconnect() {}

	dispose() {}

	update( /* delta */ ) {}

}

export { Controls };
