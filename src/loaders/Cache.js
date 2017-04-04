/**
 * @author mrdoob / http://mrdoob.com/
 * @author vladgaidukov / vlad@meliar.ru
 */

var Cache = {

    enabled: false,

    objects: {},

    addObject: function ( key, obj ) {
        
        if ( this.enabled === false ) return;

        this.objects[ key ] = {
            loaded: false,
            object: obj,
            callbacks: []
        };

    },

    addCallback: function ( key, callback ) {
        
        if ( this.enabled === false ) return;

        this.objects[ key ].callbacks.push( callback );

    },

    isCached: function ( key ) {

        if ( this.objects [ key ] ) return true;

        return false;

    },

    getObject: function ( key ) {
        
        if ( this.enabled === false ) return;

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
