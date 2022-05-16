import { Mesh } from '../../../src/Three';

export namespace GeometryCompressionUtils {
    function compressNormals(mesh: Mesh, encodeMethod: string): void;
    function compressPositions(mesh: Mesh): void;
    function compressUvs(mesh: Mesh): void;
}
