import { PerspectiveCamera } from './PerspectiveCamera.js';

class ArrayCamera extends PerspectiveCamera {

	constructor( array ) {

		super();

		this.cameras = array || [];

		this.isArrayCamera = true;

	}

}

export { ArrayCamera };
