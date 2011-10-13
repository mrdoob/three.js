/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Clock = function ( autoStart ) {

	this.autoStart = ( autoStart !== undefined ) ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;

};

THREE.Clock.prototype.start = function () {

	this.startTime = Date.now();
	this.oldTime = this.startTime;

	this.running = true;

};

THREE.Clock.prototype.stop = function () {

	this.elapsed();

	this.running = false;

};

THREE.Clock.prototype.elapsed = function () {

	this.elapsedTime += this.delta();

	return this.elapsedTime;

};


THREE.Clock.prototype.delta = function () {

	var diff = 0;

	if ( this.autoStart && ! this.running ) {

		this.start();

	}

	if ( this.running ) {

		var newTime = Date.now();
		diff = newTime - this.oldTime;
		this.oldTime = newTime;

		this.elapsedTime += diff;

	}

	return diff;

};