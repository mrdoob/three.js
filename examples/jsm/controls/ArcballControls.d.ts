import { EventDispatcher, Camera, Scene, Vector3, Raycaster } from '../../../src/Three';

export enum ArcballControlsMouseActionOperations {
    PAN = 'PAN',
    ROTATE = 'ROTATE',
    ZOOM = 'ZOOM',
    FOV = 'FOV',
}

export type ArcballControlsMouseActionMouse = 0 | 1 | 2 | 'WHEEL';

export enum ArcballControlsMouseActionKeys {
    SHIFT = 'SHIFT',
    CTRL = 'CTRL',
}

export class ArcballControls extends EventDispatcher {
    camera: Camera | null;
    domElement: HTMLElement;
    scene?: Scene | null | undefined;

    /**
     * @default 500
     */
    focusAnimationTime: number;

    /**
     * @default true
     */
    enabled: boolean;

    /**
     * @default true
     */
    enablePan: boolean;

    /**
     * @default true
     */
    enableRotate: boolean;

    /**
     * @default true
     */
    enableZoom: boolean;

    /**
     * @default true
     */
    enableGizmos: boolean;

    /**
     * @default true
     */
    adjustNearFar: boolean;

    /**
     * @default 1.1
     */
    scaleFactor: number;

    /**
     * @default 25
     */
    dampingFactor: number;

    /**
     * @default 20
     */
    wMax: number; // maximum angular velocity allowed

    /**
     * @default true
     */
    enableAnimations: boolean; // if animations should be performed

    /**
     * @default false
     */
    enableGrid: boolean; // if grid should be showed during pan operation

    /**
     * @default false
     */
    cursorZoom: boolean; // if wheel zoom should be cursor centered

    /**
     * @default 5
     */
    minFov: number;

    /**
     * @default 90
     */
    maxFov: number;

    /**
     * @default 0
     */
    minDistance: number;

    /**
     * @default Infinity
     */
    maxDistance: number;

    /**
     * @default 0
     */
    minZoom: number;

    /**
     * @default Infinity
     */
    maxZoom: number;

    /**
     * @default Vector3(0,0,0)
     */
    target: Vector3;

    /**
     * @default 0.67
     */
    radiusFactor: number;

    constructor(camera: Camera, domElement: HTMLElement, scene?: Scene | null);

    getRaycaster(): Raycaster;

    activateGizmos(isActive: boolean): void;

    copyState(): void;

    pasteState(): void;

    saveState(): void;

    reset(): void;

    setCamera(camera: Camera): void;

    setGizmosVisible(value: boolean): void;

    setTbRadius(value: number): void;

    setMouseAction(
        operation: ArcballControlsMouseActionOperations,
        mouse: ArcballControlsMouseActionMouse,
        key?: ArcballControlsMouseActionKeys,
    ): boolean;

    unsetMouseAction(mouse: ArcballControlsMouseActionMouse, key?: ArcballControlsMouseActionKeys): boolean;

    update(): void;

    dispose(): void;
}
