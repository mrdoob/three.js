import {
    EventDispatcher,
    Plane,
    Raycaster,
    Vector2,
    Vector3
} from 'three';
class PointerControls extends EventDispatcher {
    #__cache__
    constructor(objects, camera, domElement) {
        super();
        this.#__cache__={
            plane : new Plane(),
            raycaster : new Raycaster(),
            pointer : new Vector2(),
            previousPointer : new Vector2(),
            worldPosition : new Vector3(),
            hovered : null,
            selected : null,
            intersections : []
        }
        this.objects = objects;
        this.camera = camera;
        this.domElement = domElement;
        this.domElement.style.touchAction = 'none'; 
        this.enabled = true;
        this.recursive = true;
        this.transformGroup = false;
        this.activate();
    }
    activate() {
        this.domElement.addEventListener('pointermove', this.#onPointerMove.bind(this));
        this.domElement.addEventListener('pointerdown', this.#onPointerDown.bind(this));
        this.domElement.addEventListener('pointerup', this.#onPointerCancel.bind(this));
        this.domElement.addEventListener('pointerleave', this.#onPointerCancel.bind(this));
    }
    deactivate() {
        this.domElement.removeEventListener('pointermove', this.#onPointerMove.bind(this));
        this.domElement.removeEventListener('pointerdown', this.#onPointerDown.bind(this));
        this.domElement.removeEventListener('pointerup', this.#onPointerCancel.bind(this));
        this.domElement.removeEventListener('pointerleave', this.#onPointerCancel.bind(this));
        this.domElement.style.cursor = '';
    }
    dispose() {
        this.deactivate();
    }
    getObjects() {
        return this.objects;
    }
    setObjects(objects) {
        this.objects = objects;
    }
    #onPointerMove(event) {
        if (this.enabled === false) return;
        this.#updatePointer(event);
        this.#__cache__.raycaster.setFromCamera(this.#__cache__.pointer, this.camera);
        if(!this.#__cache__.selected) {
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
                this.#__cache__.intersections.length = 0;
                this.#__cache__.raycaster.setFromCamera(this.#__cache__.pointer, this.camera);
                this.#__cache__.raycaster.intersectObjects(this.objects, this.recursive, this.#__cache__.intersections);
                if (this.#__cache__.intersections.length > 0) {
                    const object = this.#__cache__.intersections[0].object;
                    this.#__cache__.plane.setFromNormalAndCoplanarPoint(
                        this.camera.getWorldDirection(this.#__cache__.plane.normal),
                        this.#__cache__.worldPosition.setFromMatrixPosition(object.matrixWorld)
                    );
                    if (this.#__cache__.hovered !== object && this.#__cache__.hovered !== null) {
                        this.dispatchEvent({ type: 'hoveroff', object: this.#__cache__.hovered });
                        this.domElement.style.cursor = 'auto';
                        this.#__cache__.hovered = null;
                    }
                    if (this.#__cache__.hovered !== object) {
                        this.dispatchEvent({ type: 'hoveron', object: object });
                        this.domElement.style.cursor = 'pointer';
                        this.#__cache__.hovered = object;
                    }
                } else {
                    if (this.#__cache__.hovered !== null) {
                        this.dispatchEvent({ type: 'hoveroff', object: this.#__cache__.hovered });
                        this.domElement.style.cursor = 'auto';
                        this.#__cache__.hovered = null;
                    }
                }
            }
        }
        this.#__cache__.previousPointer.copy(this.#__cache__.pointer);
    }
    #onPointerDown(event) {
        if (this.enabled === false) return;
        this.#updatePointer(event);
        this.#__cache__.intersections.length = 0;
        this.#__cache__.raycaster.setFromCamera(this.#__cache__.pointer, this.camera);
        this.#__cache__.raycaster.intersectObjects(this.objects, this.recursive, this.#__cache__.intersections);
        if (this.#__cache__.intersections.length > 0) {
            if (this.transformGroup === true) {
                this.#__cache__.selected = this.#findGroup(this.#__cache__.intersections[0].object);
            } else {
                this.#__cache__.selected = this.#__cache__.intersections[0].object;
            }
            this.domElement.style.cursor = 'move';
            this.dispatchEvent({ type: 'click', object: this.#__cache__.selected });
        }
        this.#__cache__.previousPointer.copy(this.#__cache__.pointer);
    }
    #onPointerCancel() {
        if (this.enabled === false) return;
        if (this.#__cache__.selected) {
            this.dispatchEvent({ type: 'pointerup', object: this.#__cache__.selected });
            this.#__cache__.selected = null;
        }
        this.domElement.style.cursor = this.#__cache__.hovered ? 'pointer' : 'auto';
    }
    #updatePointer(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.#__cache__.pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
        this.#__cache__.pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1;
    }
    #findGroup(obj, group = null) {
        if (obj.isGroup) group = obj;
        if (obj.parent === null) return group;
        return this.#findGroup(obj.parent, group);
    }
}

export { PointerControls };
