export class Timer {

	constructor();

	disableFixedDelta(): this;
	dispose(): this;
	enableFixedDelta(): this;
	getDelta(): number;
	getElapsed(): number;
	getFixedDelta(): number;
	getTimescale(): number;
	reset(): this;
	setFixedDelta( fixedDelta: number ): this;
	setTimescale( timescale: number ): this;
	update(): this;

}
