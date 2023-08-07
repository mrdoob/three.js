import { BufferGeometry } from '../core/BufferGeometry';

export class EdgesGeometry extends BufferGeometry {
    /**
     * @param geometry
     * @param [thresholdAngle=1]
     */
    constructor(geometry: BufferGeometry, thresholdAngle?: number);

    /**
     * @default 'EdgesGeometry'
     */
    type: string;

    parameters: {
        thresholdAngle: number;
    };
}
