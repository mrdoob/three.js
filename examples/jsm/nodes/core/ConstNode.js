import InputNode from './InputNode.js';

class ConstNode extends InputNode {

	generateConst( builder ) {

		return builder.getConst( this.getNodeType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		return builder.format( this.generateConst( builder ), type, output );

	}

}

ConstNode.prototype.isConstNode = true;

export default ConstNode;
