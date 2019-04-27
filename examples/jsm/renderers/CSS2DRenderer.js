/**
 * @author mrdoob / http://mrdoob.com/
 */
import * as THREE from 'three';
import CSS2DObject from './CSS2DObject';
export default class CSS2DRenderer {
    constructor() {
        this.domElement = document.createElement('div');
        this.viewMatrix = new THREE.Matrix4();
        this.viewProjectionMatrix = new THREE.Matrix4();
        this.vector = new THREE.Vector3();
        this.cache = {
            objects: new WeakMap(),
        };
        this.getDistanceToSquaredA = new THREE.Vector3();
        this.getDistanceToSquaredB = new THREE.Vector3();
        this.domElement.style.overflow = 'hidden';
    }
    zOrder(scene) {
        const sorted = this.filterAndFlatten(scene).sort(function (a, b) {
            const distanceA = this.cache.objects.get(a).distanceToCameraSquared;
            const distanceB = this.cache.objects.get(b).distanceToCameraSquared;
            return distanceA - distanceB;
        });
        const zMax = sorted.length;
        for (let i = 0, l = sorted.length; i < l; i++) {
            sorted[i].element.style.zIndex = String(zMax - i);
        }
    }
    getDistanceToSquared(object1, object2) {
        this.getDistanceToSquaredA.setFromMatrixPosition(object1.matrixWorld);
        this.getDistanceToSquaredB.setFromMatrixPosition(object2.matrixWorld);
        return this.getDistanceToSquaredA.distanceToSquared(this.getDistanceToSquaredB);
    }
    render(scene, camera) {
        scene.updateMatrixWorld();
        if (camera.parent === null) {
            camera.updateMatrixWorld(false);
        }
        this.viewMatrix.copy(camera.matrixWorldInverse);
        this.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, this.viewMatrix);
        this.renderObject(scene, camera);
        this.zOrder(scene);
    }
    getSize() {
        return {
            width: this.width,
            height: this.height,
        };
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.widthHalf = this.width / 2;
        this.heightHalf = this.height / 2;
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
    }
    filterAndFlatten(scene) {
        const result = [];
        scene.traverse(object => {
            if (object instanceof CSS2DObject) {
                result.push(object);
            }
        });
        return result;
    }
    renderObject(object, camera) {
        if (object instanceof CSS2DObject) {
            this.vector.setFromMatrixPosition(object.matrixWorld);
            this.vector.applyMatrix4(this.viewProjectionMatrix);
            const element = object.element;
            const style = 'translate(-50%,-50%) translate(' +
                (this.vector.x * this.widthHalf + this.widthHalf) +
                'px,' +
                (-this.vector.y * this.heightHalf + this.heightHalf) +
                'px)';
            element.style.transform = style;
            element.style.display = object.visible && this.vector.z >= -1 && this.vector.z <= 1 ? '' : 'none';
            const objectData = {
                distanceToCameraSquared: this.getDistanceToSquared(camera, object),
            };
            this.cache.objects.set(object, objectData);
            if (element.parentNode !== this.domElement) {
                this.domElement.appendChild(element);
            }
        }
        for (let i = 0, l = object.children.length; i < l; i++) {
            this.renderObject(object.children[i], camera);
        }
    }
}
