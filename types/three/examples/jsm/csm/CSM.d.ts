export class CSM {
    constructor(data: any);
    camera: any;
    parent: any;
    cascades: any;
    maxFar: any;
    mode: any;
    shadowMapSize: any;
    shadowBias: any;
    lightDirection: any;
    lightIntensity: any;
    lightNear: any;
    lightFar: any;
    lightMargin: any;
    customSplitsCallback: any;
    fade: boolean;
    mainFrustum: Frustum;
    frustums: any[];
    breaks: any[];
    lights: any[];
    shaders: Map<any, any>;
    createLights(): void;
    initCascades(): void;
    updateShadowBounds(): void;
    getBreaks(): void;
    update(): void;
    injectInclude(): void;
    setupMaterial(material: any): void;
    updateUniforms(): void;
    getExtendedBreaks(target: any): void;
    updateFrustums(): void;
    remove(): void;
    dispose(): void;
}

import Frustum from './Frustum.js';
