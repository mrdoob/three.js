import { BufferGeometry } from '../core/BufferGeometry';

export class CircleGeometry extends BufferGeometry {
    /**
     * @param [radius=1]
     * @param [segments=8]
     * @param [thetaStart=0]
     * @param [thetaLength=Math.PI * 2]
     */
    constructor(radius?: number, segments?: number, thetaStart?: number, thetaLength?: number);

    /**
     * @default 'CircleGeometry'
     */
    type: string;

    parameters: {
        radius: number;
        segments: number;
        thetaStart: number;
        thetaLength: number;
    };

    static fromJSON(data: any): CircleGeometry;
}

export { CircleGeometry as CircleBufferGeometry };
