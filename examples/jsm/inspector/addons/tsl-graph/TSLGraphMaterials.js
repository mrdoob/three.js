import { MeshStandardNodeMaterial, MeshBasicNodeMaterial, MeshPhysicalNodeMaterial, MeshPhongNodeMaterial, SpriteNodeMaterial } from 'three/webgpu';

let _graphId = 0;

export class GraphStandardNodeMaterial extends MeshStandardNodeMaterial {

	constructor( parameters = {} ) {

		super();

		this.graphId = parameters.graphId || `tslGraph${ _graphId ++ }`;
		this.graphType = 'material/standard';

		this.isGraphStandardNodeMaterial = true;

		this.isTSLGraphMaterial = true;

		this.setValues( parameters );

	}

}

export class GraphBasicNodeMaterial extends MeshBasicNodeMaterial {

	constructor( parameters = {} ) {

		super();

		this.graphId = parameters.graphId || `tslGraph${ _graphId ++ }`;
		this.graphType = 'material/basic';

		this.isGraphBasicNodeMaterial = true;

		this.isTSLGraphMaterial = true;

		this.setValues( parameters );

	}

}

export class GraphPhysicalNodeMaterial extends MeshPhysicalNodeMaterial {

	constructor( parameters = {} ) {

		super();

		this.graphId = parameters.graphId || `tslGraph${ _graphId ++ }`;
		this.graphType = 'material/physical';

		this.isGraphPhysicalNodeMaterial = true;

		this.isTSLGraphMaterial = true;

		this.setValues( parameters );

	}

}

export class GraphPhongNodeMaterial extends MeshPhongNodeMaterial {

	constructor( parameters = {} ) {

		super();

		this.graphId = parameters.graphId || `tslGraph${ _graphId ++ }`;
		this.graphType = 'material/phong';

		this.isGraphPhongNodeMaterial = true;

		this.isTSLGraphMaterial = true;

		this.setValues( parameters );

	}

}

export class GraphSpriteNodeMaterial extends SpriteNodeMaterial {

	constructor( parameters = {} ) {

		super();

		this.graphId = parameters.graphId || `tslGraph${ _graphId ++ }`;
		this.graphType = 'material/sprite';

		this.isGraphSpriteNodeMaterial = true;

		this.isTSLGraphMaterial = true;

		this.setValues( parameters );

	}

}
