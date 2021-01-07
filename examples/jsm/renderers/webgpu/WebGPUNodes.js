
class WebGPUNodes {

	constructor( ) {

		this.uniformsData = new WeakMap();

	}

	get( material ) {

		let data = this.uniformsData.get( object );

		if ( data === undefined ) {
			
			this.uniformsData.set( object, data );

		}

		return data;

	}

	update( object, camera ) {

		

	}

	dispose() {

		this.uniformsData = new WeakMap();

	}

}

export default WebGPUNodes;
