import { PerspectiveCamera } from './PerspectiveCamera.js';

class ArrayCamera extends PerspectiveCamera {

	constructor( array = [] ) {

		super();

		this.isArrayCamera = true;

		this.cameras = array;

	}

}

export { ArrayCamera };
