class Clock {

	constructor( autoStart = true ) {

		this.autoStart = autoStart;

		this.startTime = 0;
		this.oldTime = 0;
		this.elapsedTime = 0;

		this.running = false;

	}

	start() {

		this.startTime = now();

		this.oldTime = this.startTime;
		this.elapsedTime = 0;
		this.running = true;

	}

	stop() {

		this.getElapsedTime();
		this.running = false;
		this.autoStart = false;

	}

	getElapsedTime() {

		this.getDelta();
		return this.elapsedTime;

	}

	getDelta() {

		if ( this.running ) {

			const current = now();
			const delta = ( current - this.oldTime ) / 1000;

			this.oldTime = current;
			this.elapsedTime += delta;

			return delta;

		}

		if ( this.autoStart ) this.start();

		return 0;

	}

}

function now() {

	return ( typeof performance === 'undefined' ? Date : performance ).now(); // see #10732

}

export { Clock };
