import { Group, Object3D } from '../../../src/Three';

import { XRHandPrimitiveModel, XRHandPrimitiveModelOptions } from './XRHandPrimitiveModel';
import { XRHandMeshModel } from './XRHandMeshModel';

export type XRHandModelHandedness = 'left' | 'right';

export class XRHandModel extends Object3D {
    constructor();

    motionController: XRHandPrimitiveModel | XRHandMeshModel;
}

export class XRHandModelFactory {
    constructor();
    path: string;

    setPath(path: string): XRHandModelFactory;

    createHandModel(
        controller: Group,
        profile?: 'spheres' | 'boxes' | 'oculus',
        options?: XRHandPrimitiveModelOptions,
    ): XRHandModel;
}
