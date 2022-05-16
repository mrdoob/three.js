import { BufferGeometry } from './../core/BufferGeometry';

export class TorusGeometry extends BufferGeometry {
    /**
     * @param [radius=1]
     * @param [tube=0.4]
     * @param [radialSegments=8]
     * @param [tubularSegments=6]
     * @param [arc=Math.PI * 2]
     */
    constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, arc?: number);

    /**
     * @default 'TorusGeometry'
     */
    type: string;

    parameters: {
        radius: number;
        tube: number;
        radialSegments: number;
        tubularSegments: number;
        arc: number;
    };

    static fromJSON(data: any): TorusGeometry;
}

export { TorusGeometry as TorusBufferGeometry };
