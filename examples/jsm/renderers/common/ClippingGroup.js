import { Group } from 'three';

class ClippingGroup extends Group {

    constructor() {

        super();

        this.isClippingGroup = true;
        this.clippingPlanes = [];

    }

}

export default ClippingGroup;
