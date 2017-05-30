var QuadBuilder = function () {

};


QuadBuilder.prototype = {

    BuildQuadForGrid: function () {

        var baseIndex, index0, index1, index2, index3, n = new THREE.Vector3(0, 0, 1);

        return function (geo, position, uv, buildTriangles, vertsPerRow, swapOrder) {

            geo.vertices.push(position);
            geo.faceVertexUvs.push(uv);

//            geo.faceVertexUvs[0].push([]);

            if (buildTriangles) {

                baseIndex = geo.vertices.length - 1;
                index0 = baseIndex;
                index1 = baseIndex - 1;
                index2 = baseIndex - vertsPerRow;
                index3 = baseIndex - vertsPerRow - 1;

                if (swapOrder) {
                    geo.faces.push(new THREE.Face3(index0, index1, index3, [n, n, n]));
                    geo.faces.push(new THREE.Face3(index0, index3, index2, [n, n, n]));
                } else {
                    geo.faces.push(new THREE.Face3(index2, index1, index3, [n, n, n]));
                    geo.faces.push(new THREE.Face3(index0, index1, index2, [n, n, n]));
                }
            }
        };
    }()
};