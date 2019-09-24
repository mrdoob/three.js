import { CubeCamera } from "../cameras/CubeCamera.js";

CubeCamera.prototype.updateCubeMap = function ( renderer, scene ) {

	console.warn( 'THREE.CubeCamera: .updateCubeMap() is now .update().' );
	return this.update( renderer, scene );

};
