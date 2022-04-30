import TempNode from '../core/Node.js';
import VarNode from '../core/VarNode.js';
import ConstNode from '../core/UniformNode.js';
import OperatorNode from '../math/OperatorNode.js';
import { Vector3 } from 'three';

class ReflectedLightNode extends TempNode {

	constructor() {

		super( 'vec3' );

		this.directDiffuse = new VarNode( new ConstNode( new Vector3() ), 'DirectDiffuse' );
		this.directSpecular = new VarNode( new ConstNode( new Vector3() ), 'DirectSpecular' );
		this.indirectDiffuse = new VarNode( new ConstNode( new Vector3() ), 'IndirectDiffuse' );
		this.indirectSpecular = new VarNode( new ConstNode( new Vector3() ), 'IndirectSpecular' );

	}

	generate( builder ) {

		const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = this;

		const totalLight = new OperatorNode( '+', directDiffuse, directSpecular, indirectDiffuse, indirectSpecular );

		return totalLight.build( builder );

	}

}

export default ReflectedLightNode;
