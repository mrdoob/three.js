/**
 * @author abelnation / http://github.com/abelnation
 */

import {Object3D} from '../../core/Object3D';
import {Vector3} from '../../math/Vector3';
import {Shape} from '../../extras/core/Shape';
import {Mesh} from '../../objects/Mesh';
import {MeshBasicMaterial} from '../../materials/MeshBasicMaterial';
import {ShapeGeometry} from '../../geometries/ShapeGeometry';

function RectAreaLightHelper(light) {

    Object3D.call(this);

    this.light = light;
    this.light.updateMatrixWorld();

    // this.matrix = light.matrixWorld;
    // this.matrixAutoUpdate = false;

    this.lightMat = new MeshBasicMaterial({
        color: light.color,
        fog: false
    });

    this.lightWireMat = new MeshBasicMaterial({
        color: light.color,
        fog: false,
        wireframe: true
    });

    var hx = this.light.width / 2.0;
    var hy = this.light.height / 2.0;
    this.lightShape = new ShapeGeometry(new Shape([
        new Vector3(-hx, hy, 0),
        new Vector3(hx, hy, 0),
        new Vector3(hx, -hy, 0),
        new Vector3(-hx, -hy, 0)
    ]));

    // shows the "front" of the light, e.g. where light comes from
    this.lightMesh = new Mesh(this.lightShape, this.lightMat);
    // shows the "back" of the light, which does not emit light
    this.lightWireMesh = new Mesh(this.lightShape, this.lightWireMat);

    this.add(this.lightMesh);
    this.add(this.lightWireMesh);

    this.update();

}

RectAreaLightHelper.prototype = Object.create(Object3D.prototype);
RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;

RectAreaLightHelper.prototype.dispose = function () {

    this.lightMesh.geometry.dispose();
    this.lightMesh.material.dispose();
    this.lightWireMesh.geometry.dispose();
    this.lightWireMesh.material.dispose();

};

RectAreaLightHelper.prototype.update = function () {

    var vector = new Vector3();
    var vector2 = new Vector3();

    // TODO (abelnation) why not just make light helpers a child of the light object?
    if (this.light.target) {

        vector.setFromMatrixPosition(this.light.matrixWorld);
        vector2.setFromMatrixPosition(this.light.target.matrixWorld);

        var lookVec = vector2.clone().sub(vector);
        this.lightMesh.lookAt(lookVec);
        this.lightWireMesh.lookAt(lookVec);

    }

    this.lightMesh.material.color
        .copy(this.light.color)
        .multiplyScalar(this.light.intensity);

    this.lightWireMesh.material.color
        .copy(this.light.color)
        .multiplyScalar(this.light.intensity);

    var oldShape = this.lightShape;

    var hx = this.light.width / 2.0;
    var hy = this.light.height / 2.0;
    this.lightShape = new ShapeGeometry(new Shape([
        new Vector3(-hx, hy, 0),
        new Vector3(hx, hy, 0),
        new Vector3(hx, -hy, 0),
        new Vector3(-hx, -hy, 0)
    ]));

    this.lightMesh.geometry = this.lightShape;
    this.lightWireMesh.geometry = this.lightShape;

    oldShape.dispose();

};

export {RectAreaLightHelper};