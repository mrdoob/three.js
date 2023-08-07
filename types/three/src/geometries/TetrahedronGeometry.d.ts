import { PolyhedronGeometry } from './PolyhedronGeometry';

export class TetrahedronGeometry extends PolyhedronGeometry {
    /**
     * @param [radius=1]
     * @param [detail=0]
     */
    constructor(radius?: number, detail?: number);

    /**
     * @default 'TetrahedronGeometry'
     */
    type: string;

    static fromJSON(data: any): TetrahedronGeometry;
}

export { TetrahedronGeometry as TetrahedronBufferGeometry };
