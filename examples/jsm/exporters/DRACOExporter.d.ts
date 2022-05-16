import { Mesh, Points } from '../../../src/Three';

export interface DRACOExporterOptions {
    decodeSpeed?: number;
    encodeSpeed?: number;
    encoderMethod?: number;
    quantization?: number[];
    exportUvs?: boolean;
    exportNormals?: boolean;
    exportColor?: boolean;
}

export class DRACOExporter {
    constructor();

    parse(object: Mesh | Points, options: DRACOExporterOptions): Int8Array;
}
