import { Geometry, Material, Mesh } from '../../../build/three.module';
import {
	DataTexture,
	Curve,
	Uniform,
	Material,
	InstancedMesh
} from '../../../src/Three';
import { Flow } from './CurveModifier';

interface SplineUniform {
	spineTexture: Uniform,
	pathOffset: Uniform,
	pathSegment: Uniform,
	spineOffset: Uniform,
	Uniform,
	flow: Uniform,
}
export function initSplineTexture( size?: number ): DataTexture;

export function updateSplineTexture( texture: DataTexture, splineCurve: Curve, offset?: number );

export function getUniforms( splineTexture: DataTexture ): SplineUniform;

export function modifyShader( material: Material, uniforms: SplineUniform, numberOfCurves?: number );

export class Flow {

	constructor( mesh: Mesh, numberOfCurves?: number );
	curveArray: number[];
	curveLengthArray: number[];
	object3D: Mesh;
	splineTexure: DataTexture;
	uniforms: SplineUniform;
	updateCurve( index: number, curve: Curve );
	moveAlongCurve( amount: number );

}

export class InstancedFlow extends Flow {

	constructor( count: Number, curveCount: Number, geometry: Geometry, material: Material );
	object3D: InstancedMesh;
	offsets: number[];
	whichCurve: number[];

	moveIndividualAlongCurve( index: number, offset: number );
	setCurve( index: number, curveNo: number )

}
