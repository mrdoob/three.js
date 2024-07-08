class RenderBundle {

	constructor( scene, camera ) {

		this.scene = scene;
		this.camera = camera;

	}

	clone() {

		return Object.assign( new this.constructor(), this );

	}

}

export default RenderBundle;
