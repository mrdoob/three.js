import { MeshLambertMaterial } from './MeshLambertMaterial';

class MeshSphereLambertMaterial extends MeshLambertMaterial {
    constructor(parameters) {
        super(parameters);
        this.type = 'MeshSphereLambertMaterial';
        this.isMeshLambertMaterial = false;
        this.isMeshSphereLambertMaterial = true;

    }

}

export { MeshSphereLambertMaterial };