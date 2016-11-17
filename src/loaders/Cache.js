/**
 * @author mrdoob / http://mrdoob.com/
 * @author vladgaidukov / vlad@meliar.ru
 */

var Cache = {

    objects: {},

    addObject: function ( key, obj ) {

        this.objects[ key ] = {
            loaded: false,
            object: obj,
            callbacks: []
        };

    },

    addCallback: function ( key, callback ) {

        this.objects[ key ].callbacks.push( callback );

    },

    isCached: function ( key ) {

        if ( this.objects [ key ] ) return true;

        return false;

    },

    getObject: function ( key ) {

        return this.objects[ key ];

    },

    loaded: function ( key, obj ) {

        if ( !this.objects[ key ] ) return;

        this.objects[ key ].object = obj;
        this.objects[ key ].loaded = true;

    },

    isLoaded: function ( key ) {

        if ( !this.objects[ key ] ) return false;

        return this.objects[ key ].loaded;

    },

    remove: function ( key ) {

        delete this.objects[ key ];

    },

    clear: function () {

        this.objects = {};

    }
};

export { Cache };
