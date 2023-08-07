import {
    BufferAttribute,
    BufferGeometry,
    InterleavedBufferAttribute,
    TrianglesDrawModes,
    Mesh,
    Line,
    Points,
} from '../../../src/Three';

export namespace BufferGeometryUtils {
    function mergeBufferGeometries(geometries: BufferGeometry[], useGroups?: boolean): BufferGeometry;
    function mergeBufferAttributes(attributes: BufferAttribute[]): BufferAttribute;
    function interleaveAttributes(attributes: BufferAttribute[]): InterleavedBufferAttribute;
    function estimateBytesUsed(geometry: BufferGeometry): number;
    function mergeVertices(geometry: BufferGeometry, tolerance?: number): BufferGeometry;
    function toTrianglesDrawMode(geometry: BufferGeometry, drawMode: TrianglesDrawModes): BufferGeometry;
    function computeMorphedAttributes(object: Mesh | Line | Points): object;
}
