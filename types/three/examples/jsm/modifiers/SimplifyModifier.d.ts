import { BufferGeometry } from '../../../src/Three';

export class SimplifyModifier {
    constructor();
    modify(geometry: BufferGeometry, count: number): BufferGeometry;
}
