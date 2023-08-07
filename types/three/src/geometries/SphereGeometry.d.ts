import { BufferGeometry } from './../core/BufferGeometry';

export class SphereGeometry extends BufferGeometry {
    /**
     * @param [radius=50] — sphere radius. Default is 50.
     * @param [widthSegments=8] — number of horizontal segments. Minimum value is 3, and the default is 8.
     * @param [heightSegments=6] — number of vertical segments. Minimum value is 2, and the default is 6.
     * @param [phiStart=0] — specify horizontal starting angle. Default is 0.
     * @param [phiLength=Math.PI * 2] — specify horizontal sweep angle size. Default is Math.PI * 2.
     * @param [thetaStart=0] — specify vertical starting angle. Default is 0.
     * @param [thetaLength=Math.PI * 2] — specify vertical sweep angle size. Default is Math.PI.
     */
    constructor(
        radius?: number,
        widthSegments?: number,
        heightSegments?: number,
        phiStart?: number,
        phiLength?: number,
        thetaStart?: number,
        thetaLength?: number,
    );

    /**
     * @default 'SphereGeometry'
     */
    type: string;

    parameters: {
        radius: number;
        widthSegments: number;
        heightSegments: number;
        phiStart: number;
        phiLength: number;
        thetaStart: number;
        thetaLength: number;
    };

    static fromJSON(data: any): SphereGeometry;
}

export { SphereGeometry as SphereBufferGeometry };
