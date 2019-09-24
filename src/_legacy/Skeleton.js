import { Skeleton } from "../objects/Skeleton.js";

Object.defineProperty( Skeleton.prototype, 'useVertexTexture', {

	get: function () {

		console.warn( 'THREE.Skeleton: useVertexTexture has been removed.' );

	},
	set: function () {

		console.warn( 'THREE.Skeleton: useVertexTexture has been removed.' );

	}

} );
