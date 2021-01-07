import FloatNode from '../inputs/FloatNode.js';

class TimerNode extends FloatNode {

	constructor() {

		super();

		this.time = performance.now();

	}
	
	update() {
		
		const time = performance.now();
		
		this.value += ( time - this.time ) / 1000;
		
		this.time = time;
		
	}

}

export default TimerNode;
