let _id = 0;

class BindGroup {

	constructor( name = '', bindings = [], id = _id ++ ) {

		this.name = name;
		this.bindings = bindings;

		this.id = id;

	}

}

export default BindGroup;
