/**
 * Will draw a mesh with backside material or color set to the passed value.
 * Can be used for faking the cutting plane of a sliced geometry.
 *
 * @author Wilt
 * Based on THREE.EdgesHelper by WestLangley / http://github.com/WestLangley
 * @param {THREE.Mesh} object THREE.Mesh whose geometry will be used
 * @param {string|THREE.Material} hexOrMaterial line color
 */
THREE.SectionHelper = function( object, hexOrMaterial ) {

    var material;
    if ( hexOrMaterial instanceof THREE.MeshBasicMaterial ) {

        material = hexOrMaterial;

    } else {

        var color = ( hexOrMaterial !== undefined ) ? hexOrMaterial : 0xffffff;
        material = new THREE.MeshBasicMaterial( { color: color, side: THREE.BackSide } );

    }

    THREE.Mesh.call( this, object.geometry, material );

    this.matrix = object.matrixWorld;
    this.matrixAutoUpdate = false;

};

THREE.SectionHelper.prototype = Object.create( THREE.Mesh.prototype );
THREE.SectionHelper.prototype.constructor = THREE.SectionHelper;
