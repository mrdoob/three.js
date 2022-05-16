import { BufferGeometry } from '../core/BufferGeometry';

export class EdgesGeometry<TBufferGeometry extends BufferGeometry = BufferGeometry> extends BufferGeometry {
    /**
     * @param geometry
     * @param [thresholdAngle=1]
     */
    constructor(geometry?: TBufferGeometry, thresholdAngle?: number);

    /**
     * @default 'EdgesGeometry'
     */
    type: string;

    parameters: {
        geometry: TBufferGeometry;
        thresholdAngle: number;
    };
}
