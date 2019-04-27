/**
 * @author mrdoob / http://mrdoob.com/
 */
import * as THREE from 'three';
export default class CSS2DRenderer {
    public domElement: HTMLDivElement;
    private width;
    private height;
    private widthHalf;
    private heightHalf;
    private viewMatrix;
    private viewProjectionMatrix;
    private vector;
    private cache;
    private getDistanceToSquaredA;
    private getDistanceToSquaredB;
    private filterAndFlatten;
    private renderObject;
    constructor();
    public zOrder(scene: THREE.Scene): void;
    public getDistanceToSquared(object1: THREE.Object3D, object2: THREE.Object3D): any;
    public render(scene: THREE.Scene, camera: THREE.Camera): void;
    public getSize(): {
        width: number;
        height: number;
    };
    public setSize(width: number, height: number): void;
}
