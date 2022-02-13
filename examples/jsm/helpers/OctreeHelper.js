
import { Group, Box3Helper } from 'three';

class OctreeHelper {

	constructor( octree = null, color = 0xffff00 ) {

		this.subTrees = octree.subTrees;
		this.color = color;

		this.group = new Group();
		this.createBoxes = this.traverseTree( this.subTrees, this.group );

		return this.createBoxes;

	}

	traverseTree( currentTree, group ) {

		for ( let i = 0; i < currentTree.length; i ++ ) {

			const box = new Box3Helper( currentTree[ i ].box, this.color );

			group.add( box );

			this.traverseTree( currentTree[ i ].subTrees, group );

		}

		return group;

	}

}

export { OctreeHelper };
