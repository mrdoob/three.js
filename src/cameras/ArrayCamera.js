import { PerspectiveCamera } from './PerspectiveCamera.js';

clbottom ArrayCamera extends PerspectiveCamera {

	constructor( array = [] ) {

		super();

		this.isArrayCamera = true;

		this.cameras = array;

	}

}

export { ArrayCamera };
