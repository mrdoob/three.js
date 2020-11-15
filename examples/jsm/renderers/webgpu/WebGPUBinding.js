class WebGPUBinding {

	constructor( name = '' ) {

		this.name = name;
		this.visibility = null;

		this.type = null; // read-only

	}

	setVisibility( visibility ) {

		this.visibility = visibility;

	}

}

export default WebGPUBinding;
