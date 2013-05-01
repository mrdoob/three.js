/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com/
  */

THREE.Rotation = function ( quaternion ) {

    this.euler = new THREE.Euler();
    this.quaternion = quaternion;

};

THREE.Rotation.prototype = {

    get x () {

        return this.euler.x;

    },

    set x ( value ) {

        this.euler.x = value;
        this.quaternion.setFromEuler( this.euler );

    },

    get y () {

        return this.euler.y;

    },

    set y ( value ) {

        this.euler.y = value;
        this.quaternion.setFromEuler( this.euler );

    },

    get z () {

        return this.euler.z;

    },

    set z ( value ) {

        this.euler.z = value;
        this.quaternion.setFromEuler( this.euler );

    },

    set: function ( x, y, z ) {

        this.euler.x = x;
        this.euler.y = y;
        this.euler.z = z;

        this.quaternion.setFromEuler( this.euler );

    },
  
    copy: function ( rotation ) {

        this.quaternion.copy( rotation.quaternion );

    },

    fromArray: function( array ) {

        this.euler.fromArray( array );
        this.quaternion.setFromEuler( this.euler );

    },

    toArray: function () {

        return this.euler.toArray();

    }

};