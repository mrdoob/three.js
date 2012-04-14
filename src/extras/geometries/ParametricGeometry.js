/*
 * @author zz85 / https://github.com/zz85
 * Parametric Surfaces Geometry
 * based on the brilliant article by @prideout http://prideout.net/blog/?p=44
 */

THREE.ParametricGeometry = function(slices, stacks, func) {

    THREE.Geometry.call(this);

    var verts = this.vertices,
        faces = this.faces,
        uvs = this.faceVertexUvs[0];

    var i, il, theta, j, phi, p;

    for (i = 0; i <= slices; i++) {
        theta = i / slices;

        for (j = 0; j < stacks; j++) {
            phi = j / stacks;

            p = func(theta, phi);
            verts.push(p);

        }
    }

    var v = 0,
        next;

    // Some UV / Face orientation work needs to be done here...
    for (i = 0; i < slices; i++) {
        for (j = 0; j < stacks; j++) {
            next = (j + 1) % stacks;

            faces.push(new THREE.Face3(v + j, v + next, v + j + stacks));
            faces.push(new THREE.Face3(v + next, v + next + stacks, v + j + stacks));

            uvs.push([
                new THREE.UV(i / slices, j / stacks),
                new THREE.UV(i / slices, (j + 1) / stacks),
                new THREE.UV((i + 1) / slices, j / stacks)
                ]);
            uvs.push([
                new THREE.UV(i / slices, (j + 1) / stacks),
                new THREE.UV((i + 1) / slices, (j + 1) / stacks),
                new THREE.UV((i + 1) / slices, j / stacks)
                ]);
        }
        v += stacks;
    }


    this.computeCentroids();
    this.computeFaceNormals();
    this.computeVertexNormals();

};

THREE.ParametricGeometry.prototype = new THREE.Geometry();
THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry;