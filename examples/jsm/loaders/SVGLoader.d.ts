import {
	Loader,
	LoadingManager,
	ShapePath,
	BufferGeometry,
	Vector3
} from '../../../src/Three';

interface SVGResultPaths extends ShapePath {
	userData?: {
		[key: string]: any
	}
}

export interface SVGResult {
	paths: SVGResultPaths[];
	xml: XMLDocument;
}

export interface StrokeStyle {
	strokeColor: string;
	strokeWidth: number;
	strokeLineJoin: string;
	strokeLineCap: string;
	strokeMiterLimit: number;
}

export class SVGLoader extends Loader {

	constructor( manager?: LoadingManager );

	defaultDPI: number;
	defaultUnit: string;

	load( url: string, onLoad: ( data: SVGResult ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<SVGResult>;
	parse( text: string ) : SVGResult;

	static getStrokeStyle( width?: number, color?: string, lineJoin?: string, lineCap?: string, miterLimit?: number ): StrokeStyle;
	static pointsToStroke( points: Vector3[], style: StrokeStyle, arcDivisions?: number, minDistance?: number ): BufferGeometry;
	static pointsToStrokeWithBuffers( points: Vector3[], style: StrokeStyle, arcDivisions?: number, minDistance?: number, vertices?: number[], normals?: number[], uvs?: number[], vertexOffset?: number ): number;

}
