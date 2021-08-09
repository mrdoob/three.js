import {
    EventDispatcher,
    MOUSE,
    Quaternion,
    Vector2,
    Vector3
} from '../../../build/three.module.js';

// This set of controls performs turning, dollying (zooming), and panning. It is an update of OrbitControls
// Pan up / down / left / right  - middle mouse / touch: one finger move
// Move forward / backward  - mousewheel / touch: two finger spread or squish
// Turn  - right mouse, or arrow keys / touch: three finger swipe

// Updates compared to OrbitControls:
// 1. The dollying of PerspectiveCamera is replaced with panning forward and backward.Therefore, this component can be used to move the PerspectiveCamera to six directions including forward, backward, up, down, left and right from current perspective.
// 2. The turning will be conducted using the PerspectiveCamera as the center.

class CameraControls extends EventDispatcher {
    constructor(object, domElement) {
        super();
        this.angleX = 0;
        this.angleY = 0;
        this.stop = false;

        this.o = new Vector3(0, 0, 0)

        this.object = object;

        // The sensibility of panning and Dolly
        this.sensibility = 1;
        // Dynamically change the sensibility according to the distance between the object and center of the scene
        this.dynamicSensibility = true;

        this.domElement = (domElement !== undefined) ? domElement : document;

        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the object orbits around
        this.target = new Vector3();

        // "look" sets the direction of the focus
        this.look = new Vector3();

        // How far you can dolly and pan ( PerspectiveCamera only )
        this.maxDistance = Infinity;

        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;

        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 0.1;

        // Set to false to disable panning
        this.enablePan = true;
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 0.2;

        // Set to false to disable use of the keys
        this.enableKeys = true;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        // Mouse buttons
        this.mouseButtons = { ORBIT: MOUSE.RIGHT, ZOOM: false, PAN: MOUSE.MIDDLE };

        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        this.look0 = this.look.clone();
        this.angleX0 = this.angleX;
        this.angleY0 = this.angleY;

        //
        // public methods
        //

        this.saveState = function () {

            scope.target0.copy(scope.target);
            scope.position0.copy(scope.object.position);
            scope.zoom0 = scope.object.zoom;
            scope.look0.copy(scope.look);
            scope.angleX0 = scope.angleX;
            scope.angleY0 = scope.angleY;

        };

        this.reset = function () {

            scope.target.copy(scope.target0);
            scope.object.position.copy(scope.position0);
            scope.object.zoom = scope.zoom0;
            scope.look.copy(scope.look0);
            scope.angleX = scope.angleX0;
            scope.angleY = scope.angleY0;

            scope.object.updateProjectionMatrix();
            scope.dispatchEvent(changeEvent);

            scope.update();

            state = STATE.NONE;

        };

        // this method is exposed, but perhaps it would be better if we can make it private...
        this.update = function () {

            var offset = new Vector3();

            // so camera.up is the orbit axis
            var quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
            var quatInverse = quat.clone().invert();

            var lastPosition = new Vector3();
            var lastQuaternion = new Quaternion();

            return function update() {

                var position = scope.object.position;

                if (scope.dynamicSensibility) {
                    scope.sensibility = Math.max(1, scope.object.position.distanceTo(scope.o))
                }

                offset.copy(position).sub(scope.target);

                // rotate offset to "y-axis-is-up" space
                offset.applyQuaternion(quat);

                if (scope.autoRotate && state === STATE.NONE) {

                    rotate(getAutoRotationAngle(), 0);

                }

                // move target to panned location
                scope.target.add(panOffset);
                let distance = scope.target.distanceTo(scope.o)
                if (distance > scope.maxDistance) {
                    scope.target.multiplyScalar(scope.maxDistance / distance)
                }

                // rotate offset back to "camera-up-vector-is-up" space
                offset.applyQuaternion(quatInverse);

                position.copy(scope.target).add(offset);


                let look = position.clone();
                look.add(scope.look);
                scope.object.lookAt(look);

                panOffset.set(0, 0, 0);

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                if (zoomChanged ||
                    lastPosition.distanceToSquared(scope.object.position) > EPS ||
                    8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

                    scope.dispatchEvent(changeEvent);

                    lastPosition.copy(scope.object.position);
                    lastQuaternion.copy(scope.object.quaternion);
                    zoomChanged = false;

                    return true;

                }

                return false;

            };

        }();

        this.dispose = function () {

            scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
            scope.domElement.removeEventListener('mousedown', onMouseDown, false);
            scope.domElement.removeEventListener('wheel', onMouseWheel, false);

            scope.domElement.removeEventListener('touchstart', onTouchStart, false);
            scope.domElement.removeEventListener('touchend', onTouchEnd, false);
            scope.domElement.removeEventListener('touchmove', onTouchMove, false);

            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);

            window.removeEventListener('keydown', onKeyDown, false);

        };

        //
        // internals
        //

        var scope = this;

        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };

        var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

        var state = STATE.NONE;

        var EPS = 0.000001;


        var panOffset = new Vector3();
        var zoomChanged = false;

        var rotateStart = new Vector2();
        var rotateEnd = new Vector2();
        var rotateDelta = new Vector2();

        var panStart = new Vector2();
        var panEnd = new Vector2();
        var panDelta = new Vector2();

        var dollyStart = new Vector2();
        var dollyEnd = new Vector2();
        var dollyDelta = new Vector2();

        function getAutoRotationAngle() {

            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

        }

        function getZoomScale() {

            return Math.pow(0.95, scope.zoomSpeed);

        }

        function rotate(angleX, angleY) {
            scope.angleX += angleX * 50 * scope.rotateSpeed
            scope.angleY = Math.max(-Math.PI / 2.001, Math.min(scope.angleY - angleY * 50 * scope.rotateSpeed, Math.PI / 2.001))
            scope.look.x = Math.sin(scope.angleX) * (Math.PI / 2 - Math.abs(scope.angleY))
            scope.look.z = -Math.cos(scope.angleX) * (Math.PI / 2 - Math.abs(scope.angleY))
            scope.look.y = Math.sin(scope.angleY)
            //scope.look.normalize()
        }

        var panLeft = function () {

            var v = new Vector3();

            return function panLeft(distance, objectMatrix) {

                v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
                v.multiplyScalar(- distance);

                panOffset.add(v);

            };

        }();

        var panUp = function () {

            var v = new Vector3();

            return function panUp(distance, objectMatrix) {

                v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
                v.multiplyScalar(distance);

                panOffset.add(v);

            };

        }();

        var moveForward = function () {

            var v = new Vector3();

            return function moveForward(distance, objectMatrix) {

                v.setFromMatrixColumn(objectMatrix, 2); // get Z column of objectMatrix

                v.multiplyScalar(-distance);

                panOffset.add(v);

            };

        }();

        // deltaX and deltaY are in pixels; right and down are positive
        var pan = function () {

            return function pan(deltaX, deltaY) {

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

                if (scope.object.isPerspectiveCamera) {
                    // we actually don't use screenWidth, since perspective camera is fixed to screen height
                    panLeft(deltaX / element.clientHeight, scope.object.matrix);
                    panUp(deltaY / element.clientHeight, scope.object.matrix);

                } else if (scope.object.isOrthographicCamera) {

                    // orthographic
                    panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                    panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);

                } else {

                    // camera neither orthographic nor perspective
                    console.warn('WARNING: CameraControls.js encountered an unknown camera type - pan disabled.');
                    scope.enablePan = false;

                }

            };

        }();

        function dollyIn(dollyScale) {
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if (scope.object.isPerspectiveCamera) {

                moveForward(-50 * scope.sensibility * dollyScale / element.clientHeight, scope.object.matrix);

            } else if (scope.object.isOrthographicCamera) {

                scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
                scope.object.updateProjectionMatrix();
                zoomChanged = true;

            } else {

                console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.');
                scope.enableZoom = false;

            }

        }

        function dollyOut(dollyScale) {
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if (scope.object.isPerspectiveCamera) {

                moveForward(50 * scope.sensibility * dollyScale / element.clientHeight, scope.object.matrix);

            } else if (scope.object.isOrthographicCamera) {

                scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
                scope.object.updateProjectionMatrix();
                zoomChanged = true;

            } else {

                console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.');
                scope.enableZoom = false;

            }

        }

        //
        // event callbacks - update the object state
        //

        function handleMouseDownRotate(event) {

            rotateStart.set(event.clientX, event.clientY);

        }

        function handleMouseDownDolly(event) {

            dollyStart.set(event.clientX, event.clientY);

        }

        function handleMouseDownPan(event) {

            panStart.set(event.clientX, event.clientY);

        }

        function handleMouseMoveRotate(event) {

            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            // rotating across whole screen goes 360 degrees around
            rotate(1.2 * (element.clientWidth / element.clientHeight) * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed, 1.2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);

            scope.update();

        }

        function handleMouseMoveDolly(event) {

            dollyEnd.set(event.clientX, event.clientY);

            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {

                dollyIn(getZoomScale());

            } else if (dollyDelta.y < 0) {

                dollyOut(getZoomScale());

            }

            dollyStart.copy(dollyEnd);

            scope.update();

        }

        function handleMouseMovePan(event) {

            panEnd.set(event.clientX, event.clientY);

            panDelta.subVectors(panEnd, panStart);

            pan(panDelta.x * scope.sensibility, panDelta.y * scope.sensibility);

            panStart.copy(panEnd);

            scope.update();

        }

        function handleMouseUp(event) {

        }

        function handleMouseWheel(event) {

            if (event.deltaY < 0) {

                dollyOut(getZoomScale());

            } else if (event.deltaY > 0) {

                dollyIn(getZoomScale());

            }

            scope.update();

        }

        function handleKeyDown(event) {

            switch (event.keyCode) {

                case scope.keys.UP:
                    pan(0, scope.keyPanSpeed);
                    scope.update();
                    break;

                case scope.keys.BOTTOM:
                    pan(0, - scope.keyPanSpeed);
                    scope.update();
                    break;

                case scope.keys.LEFT:
                    pan(scope.keyPanSpeed, 0);
                    scope.update();
                    break;

                case scope.keys.RIGHT:
                    pan(- scope.keyPanSpeed, 0);
                    scope.update();
                    break;

            }

        }

        function handleTouchStartRotate(event) {

            rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

        }

        function handleTouchStartDolly(event) {

            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;

            var distance = Math.sqrt(dx * dx + dy * dy);

            dollyStart.set(0, distance);

        }

        function handleTouchStartPan(event) {

            panStart.set(event.touches[0].pageX, event.touches[0].pageY);

        }

        function handleTouchMoveRotate(event) {

            rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            rotate(1.2 * (element.clientWidth / element.clientHeight) * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed, 1.2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);

            scope.update();

        }

        function handleTouchMoveDolly(event) {

            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;

            var distance = Math.sqrt(dx * dx + dy * dy);

            dollyEnd.set(0, distance);

            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {

                dollyOut(getZoomScale());

            } else if (dollyDelta.y < 0) {

                dollyIn(getZoomScale());

            }

            dollyStart.copy(dollyEnd);

            scope.update();

        }

        function handleTouchMovePan(event) {

            panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

            panDelta.subVectors(panEnd, panStart);

            pan(panDelta.x * scope.sensibility, panDelta.y * scope.sensibility);

            panStart.copy(panEnd);

            scope.update();

        }

        function handleTouchEnd(event) {

        }

        //
        // event handlers - FSM: listen for events and reset state
        //

        function onMouseDown(event) {

            if (scope.enabled === false) return;

            event.preventDefault();

            switch (event.button) {

                case scope.mouseButtons.ORBIT:

                    if (scope.enableRotate === false) return;

                    handleMouseDownRotate(event);

                    state = STATE.ROTATE;

                    break;

                case scope.mouseButtons.ZOOM:

                    if (scope.enableZoom === false) return;

                    handleMouseDownDolly(event);

                    state = STATE.DOLLY;

                    break;

                case scope.mouseButtons.PAN:

                    if (scope.enablePan === false) return;

                    handleMouseDownPan(event);

                    state = STATE.PAN;

                    break;

            }

            if (state !== STATE.NONE) {

                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('mouseup', onMouseUp, false);


            }

        }

        function onMouseMove(event) {
            if (scope.stop) {
                onMouseUp(event);
                scope.stop = false;
            }

            if (scope.enabled === false) return;

            event.preventDefault();

            switch (state) {

                case STATE.ROTATE:

                    if (scope.enableRotate === false) return;

                    handleMouseMoveRotate(event);

                    break;

                case STATE.DOLLY:

                    if (scope.enableZoom === false) return;

                    handleMouseMoveDolly(event);

                    break;

                case STATE.PAN:

                    if (scope.enablePan === false) return;

                    handleMouseMovePan(event);

                    break;

            }

        }

        function onMouseUp(event) {

            if (scope.enabled === false) return;

            handleMouseUp(event);

            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);

            scope.dispatchEvent(endEvent);

            state = STATE.NONE;

        }

        function onMouseWheel(event) {

            if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;

            event.preventDefault();
            event.stopPropagation();

            handleMouseWheel(event);

            scope.dispatchEvent(startEvent); // not sure why these are here...
            scope.dispatchEvent(endEvent);
        }

        function onKeyDown(event) {

            if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

            handleKeyDown(event);

        }

        function onTouchStart(event) {

            if (scope.enabled === false) return;

            switch (event.touches.length) {

                case 1:	// one-fingered touch: rotate

                    if (scope.enableRotate === false) return;

                    handleTouchStartRotate(event);

                    state = STATE.TOUCH_ROTATE;

                    break;

                case 2:	// two-fingered touch: dolly

                    if (scope.enableZoom === false) return;

                    handleTouchStartDolly(event);

                    state = STATE.TOUCH_DOLLY;

                    break;

                case 3: // three-fingered touch: pan

                    if (scope.enablePan === false) return;

                    handleTouchStartPan(event);

                    state = STATE.TOUCH_PAN;

                    break;

                default:

                    state = STATE.NONE;

            }

            if (state !== STATE.NONE) {

                scope.dispatchEvent(startEvent);

            }

        }

        function onTouchMove(event) {

            if (scope.enabled === false) return;

            event.preventDefault();
            event.stopPropagation();

            switch (event.touches.length) {

                case 1: // one-fingered touch: rotate

                    if (scope.enableRotate === false) return;
                    if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...

                    handleTouchMoveRotate(event);

                    break;

                case 2: // two-fingered touch: dolly

                    if (scope.enableZoom === false) return;
                    if (state !== STATE.TOUCH_DOLLY) return; // is this needed?...

                    handleTouchMoveDolly(event);

                    break;

                case 3: // three-fingered touch: pan

                    if (scope.enablePan === false) return;
                    if (state !== STATE.TOUCH_PAN) return; // is this needed?...

                    handleTouchMovePan(event);

                    break;

                default:

                    state = STATE.NONE;

            }

        }

        function onTouchEnd(event) {

            if (scope.enabled === false) return;

            handleTouchEnd(event);

            scope.dispatchEvent(endEvent);

            state = STATE.NONE;

        }

        function onContextMenu(event) {

            if (scope.enabled === false) return;

            event.preventDefault();

        }

        //

        scope.domElement.addEventListener('contextmenu', onContextMenu, false);

        scope.domElement.addEventListener('mousedown', onMouseDown, false);
        scope.domElement.addEventListener('wheel', onMouseWheel, false);

        scope.domElement.addEventListener('touchstart', onTouchStart, false);
        scope.domElement.addEventListener('touchend', onTouchEnd, false);
        scope.domElement.addEventListener('touchmove', onTouchMove, false);

        window.addEventListener('keydown', onKeyDown, false);

        // force an update at start

        this.update();

    };
}


export { CameraControls };
