/**
 * @author daron1337 / http://daron1337.github.io/
 */

THREE.Lut = function ( colormap, numberofcolors ) {

  this.lut = new Array();
  this.map = THREE.ColorMapKeywords[ colormap ];
  this.n = numberofcolors;
  
  var step = 1. / this.n;
  
  for ( var i = 0; i <= 1; i+=step ) {
  
    for ( var j = 0; j < this.map.length - 1; j++ ) {
    
      if ( i >= this.map[ j ][ 0 ] && i < this.map[ j+1 ][ 0 ] ) {
      
        var min = this.map[ j ][ 0 ];
        var max = this.map[ j+1 ][ 0 ];	
        var color = new THREE.Color( 0xffffff ); 
        var minColor = new THREE.Color( 0xffffff ).setHex( this.map[ j ][ 1 ] );
        var maxColor = new THREE.Color( 0xffffff ).setHex( this.map[ j+1 ][ 1 ] );	
        			
        color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );
        
        this.lut.push(color);
        
      }
      
    }
    
  }
  
  return this.set( this );
  
};

THREE.Lut.prototype = {

	constructor: THREE.Lut,
  
        lut: [], map: [], mapname: 'rainbow' , n: 256, minV: 0, maxV: 1,
  
	set: function ( value ) {

		if ( value instanceof THREE.Lut ) {

			this.copy( value );

		} 

		return this;

	},

	setMin: function ( min ) {

		this.minV = min;
		
		return this;

	},

	setMax: function ( max ) {

		this.maxV = max;
		
		return this;

	},
	
	changeNumberOfColors: function ( numberofcolors ) {

		this.n = numberofcolors;
		
		return new THREE.Lut( this.mapname, this.n );

	},
	
	changeColorMap: function ( colormap ) {
    
                this.mapname = colormap;
		
		return new THREE.Lut( this.mapname, this.n );

	},
  
        copy: function ( lut ) {

		this.lut = lut.lut;
		this.mapname = lut.mapname;
		this.map = lut.map;
		this.n = lut.n;
                this.minV = lut.minV;
                this.maxV = lut.maxV;

		return this;

	},
  
	getColor: function ( alpha ) {
                
                
                if ( alpha <= this.minV ) {
                
                            alpha = this.minV;
                
                }
                
                else if ( alpha >= this.maxV ) {
                
                            alpha = this.maxV;               
                
                }
                
                
                alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );
                
                var colorPosition = Math.round ( alpha * this.n );
                colorPosition == this.n ? colorPosition -= 1 : colorPosition;
		
                return this.lut[ colorPosition ];
		
	},

        addColorMap: function ( colormapName, arrayOfColors ) {
        
                THREE.ColorMapKeywords[ colormapName ] = arrayOfColors;

        },
	
};

THREE.ColorMapKeywords = {

                "rainbow": [ [ 0.0, '0x0000FF' ], [ 0.2, '0x00FFFF' ], [ 0.5, '0x00FF00' ], [ 0.8, '0xFFFF00'],  [1.0, '0xFF0000' ] ],
                "cooltowarm": [ [ 0.0, '0x3C4EC2' ], [ 0.2, '0x9BBCFF' ], [ 0.5, '0xDCDCDC' ], [ 0.8, '0xF6A385'],  [1.0, '0xB40426' ] ],
                "blackbody" : [ [ 0.0, '0x000000' ], [ 0.2, '0x780000' ], [ 0.5, '0xE63200' ], [ 0.8, '0xFFFF00'],  [1.0, '0xFFFFFF' ] ]

}
