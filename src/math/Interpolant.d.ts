export abstract class Interpolant {

	constructor(
		parameterPositions: any,
		sampleValues: any,
		sampleSize: number,
		resultBuffer?: any
	);

	parameterPositions: any;
	sampleValues: any;
	valueSize: number;
	resultBuffer: any;

	evaluate( time: number ): any;

}
