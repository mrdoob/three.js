import { ExtrudeGeometry } from '../../../src/Three';

import { Font } from '../loaders/FontLoader';

export interface TextGeometryParameters {
    font: Font;
    size?: number | undefined;
    height?: number | undefined;
    curveSegments?: number | undefined;
    bevelEnabled?: boolean | undefined;
    bevelThickness?: number | undefined;
    bevelSize?: number | undefined;
    bevelOffset?: number | undefined;
    bevelSegments?: number | undefined;
}

export class TextGeometry extends ExtrudeGeometry {
    /**
     * @default 'TextGeometry'
     */
    type: string;

    constructor(text: string, parameters: TextGeometryParameters);

    parameters: {
        font: Font;
        size: number;
        height: number;
        curveSegments: number;
        bevelEnabled: boolean;
        bevelThickness: number;
        bevelSize: number;
        bevelOffset: number;
        bevelSegments: number;
    };
}

export { TextGeometry as TextBufferGeometry };
