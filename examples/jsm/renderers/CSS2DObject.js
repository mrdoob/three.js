/**
 * @author mrdoob / http://mrdoob.com/
 */
import * as THREE from 'three';
export default class CSS2DObject extends THREE.Object3D {
    constructor(element) {
        super();
        this.element = element;
        this.element.style.position = 'absolute';
        this.addEventListener('removed', function () {
            if (this.element.parentNode !== null) {
                this.element.parentNode.removeChild(this.element);
            }
        });
    }
}
