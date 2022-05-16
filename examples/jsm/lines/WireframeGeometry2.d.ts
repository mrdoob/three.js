import { BufferGeometry } from '../../../src/Three';

import { LineSegmentsGeometry } from './LineSegmentsGeometry';

export class WireframeGeometry2 extends LineSegmentsGeometry {
    constructor(geometry: BufferGeometry);
    readonly sWireframeGeometry2: boolean;
}
