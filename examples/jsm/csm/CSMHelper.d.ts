import {
    Box3Helper,
    BufferGeometry,
    Group,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
} from '../../../src/Three';

import { CSM } from './CSM';

export class CSMHelper<TCSM extends CSM = CSM> extends Group {
    constructor(csm: TCSM);
    csm: TCSM;
    displayFrustum: boolean;
    displayPlanes: boolean;
    displayShadowBounds: boolean;
    frustumLines: LineSegments<BufferGeometry, LineBasicMaterial>;
    cascadeLines: Box3Helper[];
    cascadePlanes: Array<Mesh<PlaneGeometry, MeshBasicMaterial>>;
    shadowLines: Box3Helper[];
    updateVisibility(): void;
    update(): void;
}
