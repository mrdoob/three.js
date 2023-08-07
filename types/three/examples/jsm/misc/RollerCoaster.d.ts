import { BufferGeometry, Curve, Mesh, Vector3 } from '../../../src/Three';

export class RollerCoasterGeometry extends BufferGeometry {
    constructor(curve: Curve<Vector3>, divisions: number);
}

export class RollerCoasterLiftersGeometry extends BufferGeometry {
    constructor(curve: Curve<Vector3>, divisions: number);
}

export class RollerCoasterShadowGeometry extends BufferGeometry {
    constructor(curve: Curve<Vector3>, divisions: number);
}

export class SkyGeometry extends BufferGeometry {
    constructor(curve: Curve<Vector3>, divisions: number);
}

export class TreesGeometry extends BufferGeometry {
    constructor(landscape: Mesh);
}
