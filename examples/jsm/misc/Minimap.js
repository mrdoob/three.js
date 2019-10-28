/**
 * @author Yuan Yao https://github.com/LeonYuanYao
 * 
 * A Minimap viewing tool for three.js
 *
 * @param {WebGLRenderer} renderer
 * @param {Scene} scene
 * @param {Camera} mainCamera
 * @param {Object} params
 */

import {
	Camera,
	CameraHelper,
	CircleBufferGeometry,
	DoubleSide,
	FrontSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneBufferGeometry,
	Scene,
	Vector3,
	Vector4,
	WebGLRenderer
} from "../../../build/three.module.js";

var Minimap = function(renderer, scene, mainCamera, params) {

    this.renderer = renderer;
    this.scene = scene;
    this.object = mainCamera;
    this.viewRange = params.viewRange !== undefined ? params.viewRange : 1000;
    this.mapSize = params.mapSize !== undefined ? params.mapSize : 300;
    this.heightOffset = params.heightOffset !== undefined ? params.heightOffset : 10;

    var scope = this;
    var clientWidth, clientHeight;
    var updatePos, idcPos;

    var viewport = new Vector4();
    renderer.getCurrentViewport(viewport);

    var up = mainCamera.up.clone(), lookat = new Vector3(), lastLookat = new Vector3();
    getLookatVecProjected(mainCamera, lastLookat);

    var minimapGroup = new Group();
    var minimapCamera = new OrthographicCamera(
        - scope.viewRange / 2,
        scope.viewRange / 2,
        scope.viewRange / 2,
        - scope.viewRange / 2,
        0.01,
        10000
    );
    
    // set orthographic camera always look downward
    minimapCamera.lookAt(up.clone().negate());
    minimapGroup.add(minimapCamera);

    var mainCameraHelper = new CameraHelper(mainCamera);
    minimapGroup.add(mainCameraHelper);

    scene.add(minimapGroup);

    initBackplane(0x000000);

    initIndicator();


    Minimap.prototype.getCamera = function () {
        return minimapCamera;
    };


    Minimap.prototype.setMinimapVisibility = function (flag) {
        minimapCamera.backplane.visible = flag;
        minimapCamera.indicator.visible = flag;
        mainCameraHelper.visible = flag;
    };


    Minimap.prototype.renderMinimap = function (){

        setAutoClear(false);

        // render minimap
        scope.setMinimapVisibility(true);
        renderMinimap();

        // set the render state back to original
        scope.renderer.setViewport(0, 0, clientWidth, clientHeight);
		scope.renderer.setScissor(0, 0, clientWidth, clientHeight);
        scope.renderer.setScissorTest(true);
        setAutoClear(true);
    };



    /**
     * Private functions
     */
    function setAutoClear(flag) {
        scope.renderer.autoClear = flag;
        scope.renderer.autoClearColor = flag;
        scope.renderer.autoClearDepth = flag;
    }


    function renderMinimap() {
        updateMinimapCamera();
        scope.renderer.setViewport(0, 0, scope.mapSize, scope.mapSize);
        scope.renderer.render(scene, minimapCamera);
    }


    function initBackplane(color) {
        var width = Math.abs(minimapCamera.left - minimapCamera.right);
        var height = Math.abs(minimapCamera.top - minimapCamera.bottom);
        var plane = new Mesh(
            new PlaneBufferGeometry(width, height, 1),
            new MeshBasicMaterial({ color: color, side: FrontSide })
        );
        plane.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
        minimapGroup.add(plane);
        minimapCamera.backplane = plane;
    }


    function initIndicator() {
        var dot = new Mesh(
            new CircleBufferGeometry(scope.mapSize / 45, 16, 0, 2 * Math.PI),
            new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide })
        );
        dot.rotateX(Math.PI / 2);
        dot.visible = false;
        minimapGroup.add(dot);

        minimapCamera.indicator = dot;
    }


    function getLookatVecProjected(object, result) {
        object.getWorldDirection(result);
        result.projectOnPlane(up); // get the lookat vector projected on the orthographic camera
    }


    function updateMinimapCamera() {
        clientWidth = scope.renderer.domElement.clientWidth;
        clientHeight = scope.renderer.domElement.clientHeight;

        // update view frustum
        minimapCamera.left = - scope.viewRange / 2;
        minimapCamera.right = scope.viewRange / 2;
        minimapCamera.top = scope.viewRange / 2;
        minimapCamera.bottom = - scope.viewRange / 2;
        minimapCamera.updateProjectionMatrix();

        // update position
        updatePos = mainCamera.position.clone().add(up.clone().multiplyScalar(scope.heightOffset));
        minimapCamera.position.set(updatePos.x, updatePos.y, updatePos.z);
        minimapCamera.updateMatrixWorld();

        minimapCamera.backplane.position.set(minimapCamera.position.x, minimapCamera.position.y, minimapCamera.position.z - minimapCamera.far);
        minimapCamera.backplane.updateMatrixWorld();

        var idc = minimapCamera.indicator;
        idcPos = minimapCamera.position.clone().add(up.clone().negate().multiplyScalar(0.02));
        // idcPos = mainCamera.position.clone().add(up.clone().negate().multiplyScalar(0.02));
        idc.position.set(idcPos.x, idcPos.y, idcPos.z);
        idc.updateMatrixWorld();

        getLookatVecProjected(mainCamera, lastLookat); // store the last lookat vector
    }
}
export { Minimap };
