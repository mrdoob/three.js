import { ColorRepresentation } from '../utils';
import { Object3D } from './../core/Object3D';
import { LineSegments } from './../objects/LineSegments';

export class BoxHelper extends LineSegments {
    /**
     * @param object
     * @param [color=0xffff00]
     */
    constructor(object: Object3D, color?: ColorRepresentation);

    /**
     * @default 'BoxHelper'
     */
    type: string;

    update(object?: Object3D): void;

    setFromObject(object: Object3D): this;
}
