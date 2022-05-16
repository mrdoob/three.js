import { Camera, EventDispatcher, MOUSE, Vector3 } from '../../../src/Three';

export class TrackballControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);

    object: Camera;
    domElement: HTMLElement;

    // API
    enabled: boolean;
    screen: { left: number; top: number; width: number; height: number };
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    noRotate: boolean;
    noZoom: boolean;
    noPan: boolean;
    noRoll: boolean;
    staticMoving: boolean;
    dynamicDampingFactor: number;
    minDistance: number;
    maxDistance: number;
    keys: string[];
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };

    target: Vector3;
    position0: Vector3;
    target0: Vector3;
    up0: Vector3;

    update(): void;

    reset(): void;

    dispose(): void;

    checkDistances(): void;

    zoomCamera(): void;

    panCamera(): void;

    rotateCamera(): void;

    handleResize(): void;
}
