export abstract class Interpolant {
  constructor(
    parameterPositions: any,
    samplesValues: any,
    sampleSize: number,
    resultBuffer?: any
  );

  parameterPositions: any;
  samplesValues: any;
  valueSize: number;
  resultBuffer: any;

  evaluate(time: number): any;
}
