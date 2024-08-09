let _id = 0;

class BindGroup {

	constructor( name = '', bindings = [], index = 0 ) {

		this.name = name;
		this.bindings = bindings;
		this.index = index;

		this.id = _id ++;

	}

}

export default BindGroup;
