/**
 * @author mrdoob / http://mrdoob.com/
 */

import { PerspectiveCamera } from './PerspectiveCamera.js';

class ArrayCamera extends PerspectiveCamera {

	constructor( array ) {

		super();

		this.cameras = array || [];

	}

}

ArrayCamera.prototype.isArrayCamera = true;


export { ArrayCamera };
