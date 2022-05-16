import { BufferGeometry } from '../../../src/Three';

export class TeapotGeometry extends BufferGeometry {
    constructor(
        size?: number,
        segments?: number,
        bottom?: boolean,
        lid?: boolean,
        body?: boolean,
        fitLid?: boolean,
        blinn?: number,
    );
}
