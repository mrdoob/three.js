import { Object3D } from './../core/Object3D';

export class Group extends Object3D {
    constructor();
    type: 'Group';
    readonly isGroup: true;
}
