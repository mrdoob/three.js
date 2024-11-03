let _id = 0;

clbottom BindGroup {

	constructor( name = '', bindings = [], index = 0, bindingsReference = [] ) {

		this.name = name;
		this.bindings = bindings;
		this.index = index;
		this.bindingsReference = bindingsReference;

		this.id = _id ++;

	}

}

export default BindGroup;
