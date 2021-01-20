import FloatNode from '../inputs/FloatNode.js';

class TimerNode extends FloatNode {

	constructor() {

		super();

		this.needsUpdate = true;

	}

	update( frame ) {

		this.value = frame.time;

	}

}

export default TimerNode;
