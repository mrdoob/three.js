Color - Represents a color
--------------------------

.. rubric:: Constructor

**class**:: Color(*hex*)

+------------+------------+------------------------------------+ 
| Parameter  | Type       | Description                        | 
+============+============+====================================+ 
| *hex*      | integer    | Hex value to intialize the color   | 
+------------+------------+------------------------------------+ 

.. rubric:: Attributes

+------------+------------+------------------------------------+ 
| Attribute  | Type       | Description                        | 
+============+============+====================================+ 
| Color.r    | float      | Red channel (between 0 and 1)      | 
+------------+------------+------------------------------------+ 
| Color.g    | float      | Green channel (between 0 and 1)    | 
+------------+------------+------------------------------------+ 
| Color.b    | float      | Blue channel (between 0 and 1)     | 
+------------+------------+------------------------------------+ 

.. rubric:: Methods

**function**:: Color.copy(*color*)

Copies the given color into this color

+------------+------------+----------------+ 
| Parameter  | Type       | Description    | 
+============+============+================+ 
| *color*    | THREE.Color| Color to copy  | 
+------------+------------+----------------+  

**function**:: Color.copyGammaToLinear(*color*)

Creates a gamma color from a linear color
    
+------------+------------+----------------+ 
| Parameter  | Type       | Description    | 
+============+============+================+ 
| *color*    | THREE.Color| Color to copy  | 
+------------+------------+----------------+  
| returns    | THREE.Color| Linear color   | 
+------------+------------+----------------+  
    
**function**:: Color.copyLinearToGamma(*color*)

Creates a linear color from a gamma color
    
+------------+------------+----------------+ 
| Parameter  | Type       | Description    | 
+============+============+================+ 
| *color*    | THREE.Color| Color to copy  | 
+------------+------------+----------------+  
| returns    | THREE.Color| Gamma color    | 
+------------+------------+----------------+  
    
**function**:: Color.setRGB(*r*, *g*, *b*)

Sets the RGB value of this color
    
+-----------+-------+--------------------------------------+ 
| Parameter | Type  | Description                          | 
+===========+=======+======================================+ 
| *r*       | float | Red channel value (between 0 and 1)  | 
+-----------+-------+--------------------------------------+  
| *g*       | float | Green channel value (between 0 and 1)| 
+-----------+-------+--------------------------------------+ 
| *b*       | float | Blue channel value (between 0 and 1) | 
+-----------+-------+--------------------------------------+ 

**function**:: Color.setHSV(*h*, *s*, *v*)

Sets the HSV value of this color. Based on MochiKit implementation by
Bob Ippolito.
    
+-----------+-------+--------------------------------------+ 
| Parameter | Type  | Description                          | 
+===========+=======+======================================+ 
| *h*       | float | Hue channel  (between 0 and 1)       | 
+-----------+-------+--------------------------------------+  
| *s*       | float | Saturation channel  (between 0 and 1)| 
+-----------+-------+--------------------------------------+ 
| *v*       | float | Value channel (between 0 and 1)      | 
+-----------+-------+--------------------------------------+ 
    
**function**:: Color.setHex(*hex*)

Sets the value of this color from a hex value
   
+-----------+---------+---------------------------+ 
| Parameter | Type    | Description               |
+===========+=========+===========================+ 
| *hex*     | integer | Value of the color in hex | 
+-----------+---------+---------------------------+  

**function**:: Color.getHex()

Gets the value of this color in hex
    
+-----------+---------+------------------------+ 
| Parameter | Type    | Description            |
+===========+=========+========================+ 
| returns   | integer | The color value in hex | 
+-----------+---------+------------------------+  

**function**:: Color.getContextStyle()

Returns the value of this color in CSS context style.
    
+-----------+--------+-----------------------------+--------------+
| Parameter | Type   | Description                 | Example      |
+===========+========+=============================+==============+ 
| returns   | string | A CSS-formatted color value | "rgb(r,g,b)" |
+-----------+--------+-----------------------------+--------------+ 
    
**function**:: Color.clone()

Clones this color
    
+-----------+-------------+--------------------------------------+ 
| Parameter | Type        | Description                          |
+===========+=============+======================================+ 
| returns   | THREE.Color | New instance identical to this color | 
+-----------+-------------+--------------------------------------+  

.. rubric:: Example 
 
::

    var colors = [];
    for ( i = 0; i < 5000; i ++ ) {
        x = 2000 * Math.random() - 1000;
        colors[ i ] = new THREE.Color( 0xffffff );
        colors[ i ].setHSV( (x+1000)/2000, 1.0, 1.0 );
    }
