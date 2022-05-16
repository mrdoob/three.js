import { PolyhedronGeometry } from './PolyhedronGeometry';

export class IcosahedronGeometry extends PolyhedronGeometry {
    /**
     * @param [radius=1]
     * @param [detail=0]
     */
    constructor(radius?: number, detail?: number);

    /**
     * @default 'IcosahedronGeometry'
     */
    type: string;

    static fromJSON(data: any): IcosahedronGeometry;
}

export { IcosahedronGeometry as IcosahedronBufferGeometry };
