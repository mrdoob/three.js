import { Vector3 } from './../math/Vector3';
import { BufferGeometry } from './../core/BufferGeometry';

export class ParametricGeometry extends BufferGeometry {
    constructor(func: (u: number, v: number, dest: Vector3) => void, slices: number, stacks: number);

    /**
     * @default 'ParametricGeometry'
     */
    type: string;

    parameters: {
        func: (u: number, v: number, dest: Vector3) => void;
        slices: number;
        stacks: number;
    };
}

export { ParametricGeometry as ParametricBufferGeometry };
