import { Camera } from './Camera';

/**
 * Camera with orthographic projection
 *
 * see {@link https://github.com/mrdoob/three.js/blob/master/src/cameras/OrthographicCamera.js|src/cameras/OrthographicCamera.js}
 *
 * @example
 * const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
 * scene.add( camera );
 */
export class OrthographicCamera extends Camera {
    /**
     * @param left Camera frustum left plane.
     * @param right Camera frustum right plane.
     * @param top Camera frustum top plane.
     * @param bottom Camera frustum bottom plane.
     * @param [near=0.1] Camera frustum near plane.
     * @param [far=2000] Camera frustum far plane.
     */
    constructor(left?: number, right?: number, top?: number, bottom?: number, near?: number, far?: number);

    type: 'OrthographicCamera';

    readonly isOrthographicCamera: true;

    /**
     * @default 1
     */
    zoom: number;

    /**
     * @default null
     */
    view: null | {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    };

    /**
     * Camera frustum left plane.
     * @default -1
     */
    left: number;

    /**
     * Camera frustum right plane.
     * @default 1
     */
    right: number;

    /**
     * Camera frustum top plane.
     * @default 1
     */
    top: number;

    /**
     * Camera frustum bottom plane.
     * @default -1
     */
    bottom: number;

    /**
     * Camera frustum near plane.
     * @default 0.1
     */
    near: number;

    /**
     * Camera frustum far plane.
     * @default 2000
     */
    far: number;

    /**
     * Updates the camera projection matrix. Must be called after change of parameters.
     */
    updateProjectionMatrix(): void;
    setViewOffset(
        fullWidth: number,
        fullHeight: number,
        offsetX: number,
        offsetY: number,
        width: number,
        height: number,
    ): void;
    clearViewOffset(): void;
    toJSON(meta?: any): any;
}
