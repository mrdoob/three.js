class RenderBundle {

	constructor( scene, camera, name = '' ) {

		this.name = name;
		this.scene = scene;
		this.camera = camera;

	}

	clone() {

		return Object.assign( new this.constructor(), this );

	}

}

export default RenderBundle;
