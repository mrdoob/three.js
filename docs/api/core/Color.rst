Color - Represents a color
--------------------------

.. rubric:: Constructor

.. class:: Color(hex)

    Represents a color
    
    :param integer hex: Hex value to intialize the color

.. rubric:: Attributes

.. attribute:: Color.r

    Red channel (float between 0 and 1)
    
.. attribute:: Color.g

    Green channel (float between 0 and 1)

.. attribute:: Color.b

    Blue channel (float between 0 and 1)

.. rubric:: Methods

.. function:: Color.copy(color)

    Copies the given color into this color
    
    :param Color color: Color to copy
    
.. function:: Color.copyGammaToLinear(color)

    Creates a gamma color from a linear color
    
    :param Color color: Color to copy
    :returns: Linear color
    :rtype: Color
    
.. function:: Color.copyLinearToGamma(color)

    Creates a linear color from a gamma color
    
    :param Color color: Color to copy
    :returns: Gamma color
    :rtype: Color
    
.. function:: Color.setRGB(r, g, b)

    Sets the RGB value of this color
    
    :param float r: Red channel value (between 0 and 1)
    :param float g: Green channel value (between 0 and 1)
    :param float b: Blue channel value (between 0 and 1)

.. function:: Color.setHSV(h, s, v)

    Sets the HSV value of this color. Based on MochiKit implementation by
    Bob Ippolito.
    
    :param float h: Hue channel (between 0 and 1)
    :param float s: Saturation channel (between 0 and 1)
    :param float v: Value channel (between 0 and 1)
    
.. function:: Color.setHex(hex)

    Sets the value of this color from a hex value
    
    :param integer hex: Value of the color in hex

.. function:: Color.getHex()

    Gets the value of this color in hex
    
    :returns: The color value in hex
    :rtype: integer
    
.. function:: Color.getContextStyle()

    Returns the value of this color in CSS context style.
    
    Example: ``rgb(r,g,b)``
    
    :returns: A CSS-formatted color value
    :rtype: string
    
.. function:: Color.clone()

    Clones this color
    
    :returns: New instance identical to this color
    :rtype: Color

.. rubric:: Example

::

    var colors = [];
    for ( i = 0; i < 5000; i ++ ) {
        x = 2000 * Math.random() - 1000;
        colors[ i ] = new THREE.Color( 0xffffff );
        colors[ i ].setHSV( (x+1000)/2000, 1.0, 1.0 );
    }
