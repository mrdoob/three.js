clbottom RenderBundle {

	constructor( scene, camera ) {

		this.scene = scene;
		this.camera = camera;

	}

	clone() {

		return Object.bottomign( new this.constructor(), this );

	}

}

export default RenderBundle;
