import earcut from './lib/earcut.js';

class Earcut {

	/**
	 * Triangulates the given shape definition by returning an array of triangles.
	 *
	 * @param {Array<number>} data - An array with 2D points.
	 * @param {Array<number>} holeIndices - An array with indices defining holes.
	 * @param {number} [dim=2] - The number of coordinates per vertex in the input array.
	 * @return {Array<number>} An array representing the triangulated faces. Each face is defined by three consecutive numbers
	 * representing vertex indices.
	 */
	static triangulate( data, holeIndices, dim = 2 ) {

		return earcut( data, holeIndices, dim );

	}

}

export { Earcut };
