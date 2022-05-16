import { PolyhedronGeometry } from './PolyhedronGeometry';

export class DodecahedronGeometry extends PolyhedronGeometry {
    /**
     * @param [radius=1]
     * @param [detail=0]
     */
    constructor(radius?: number, detail?: number);

    /**
     * @default 'DodecahedronGeometry'
     */
    type: string;

    static fromJSON(data: any): DodecahedronGeometry;
}

export { DodecahedronGeometry as DodecahedronBufferGeometry };
