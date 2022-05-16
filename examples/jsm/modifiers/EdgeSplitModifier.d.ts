import { BufferGeometry } from '../../../src/Three';

export class EdgeSplitModifier {
    constructor();

    /**
     * @param geometry					The geometry to modify by splitting edges.
     * 									This geometry can be any of any type: Geometry or BufferGeometry, indexed or
     * 									not...
     *
     * @param cutOffPoint				The cutoff angle in radians. If the angle between two face normals is higher
     * 									than this value, a split will be made.
     *
     * @param [tryKeepNormals = true]	Set to true to keep the normal values for vertices that won't be split.
     * 									To use this feature, you also need to pass an indexed geometry with a 'normal'
     * 									BufferAttribute.
     */
    modify(geometry: BufferGeometry, cutOffPoint: number, tryKeepNormals: boolean): BufferGeometry;
}
