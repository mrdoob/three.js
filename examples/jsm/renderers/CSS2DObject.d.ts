/**
 * @author mrdoob / http://mrdoob.com/
 */
import * as THREE from 'three';
export default class CSS2DObject extends THREE.Object3D {
    public element: HTMLElement;
    constructor(element: HTMLElement);
}
