class Clock {

    constructor( autoStart = true ) {

        this.autoStart = autoStart;
        this.running = this.autoStart;

        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;

        this.running && this.start();

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

    }

    getElapsedTime() {

        this.getDelta();

        return this.elapsedTime;

    }

    getDelta() {

        let diff = 0;

        if ( this.running ) {

            const newTime = now();

            diff = ( newTime - this.oldTime ) / 1000;

            this.oldTime = newTime;
            this.elapsedTime += diff;

        }

        return diff;

    }

}

function now() {

	return ( typeof performance === 'undefined' ? Date : performance ).now(); // see #10732

}

export { Clock };
