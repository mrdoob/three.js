import {
  Vector3,
  Vector4
} from '../../../src/Three';

export namespace NURBSUtils {

  export function findSpan(p: number, u: number, U: number[]): number;
  export function calcBasisFunctions(span: number, u: number, p: number, U: number[]): number[];
  export function calcBSplinePoint(p: number, U: number[], P: Vector4[], u: number): Vector4;
  export function calcBasisFunctionDerivatives(span: number,u: number, p: number, n: number, U: number[]): number[][];
  export function calcBSplineDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number): Vector4[];
  export function calcKoverI(k: number, i: number): number;
  export function calcRationalCurveDerivatives(Pders: Vector4[]): Vector3[];
  export function calcNURBSDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number): Vector3[];
  export function calcSurfacePoint(p: number, q: number, U: number[], V: number[], P: Vector4[], u: number, v: number, target: Vector3): Vector3;

}
