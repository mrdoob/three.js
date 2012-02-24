Color - Represents a color
--------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Color(hex)

    Represents a color

    See also :class:`ColorUtils`

    :param integer hex: Hex value to intialize the color


.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Color.r

    Red channel (float between 0 and 1) (default ``1``)

.. attribute:: Color.g

    Green channel (float between 0 and 1) (default ``1``)

.. attribute:: Color.b

    Blue channel (float between 0 and 1) (default ``1``)


.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Color.clone()

    Clones this color

    :returns: New instance identical to this color
    :rtype: :class:`Color`

.. function:: Color.copy( color )

    Copies given ``color`` into this color

    :param Color color: Color to copy
    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.copyGammaToLinear( color )

    Copies given ``color`` into this color, making conversion from gamma to linear color space

    :param Color color: Color to copy
    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.copyLinearToGamma(color)

    Copies given ``color`` into this color, making conversion from linear to gamma color space

    :param Color color: Color to copy
    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.convertGammaToLinear()

    Converts this color from gamma to linear color space

    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.convertLinearToGamma()

    Converts this color from linear to gamma color space

    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.setRGB( r, g, b )

    Sets this color from RGB values

    :param float r: Red channel value (between 0 and 1)
    :param float g: Green channel value (between 0 and 1)
    :param float b: Blue channel value (between 0 and 1)
    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.setHSV( h, s, v )

    Sets this color from HSV values.

    Based on MochiKit implementation by Bob Ippolito.

    :param float h: Hue channel (between 0 and 1)
    :param float s: Saturation channel (between 0 and 1)
    :param float v: Value channel (between 0 and 1)
    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.setHex( hex )

    Sets this color from a hex value

    :param integer hex: Value of the color in hex (between ``0x000000`` and ``0xffffff``)
    :returns: This color
    :rtype: :class:`Color`

.. function:: Color.getHex()

    Gets the value of this color in hex

    :returns: Color value in hex
    :rtype: integer

.. function:: Color.getContextStyle()

    Returns the value of this color in CSS context style.

    Example: ``rgb( r, g, b )``

    :returns: CSS-formatted color value
    :rtype: string


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var colors = [];

    for ( i = 0; i < 5000; i ++ ) {

        x = 2000 * Math.random() - 1000;
        colors[ i ] = new THREE.Color( 0xffffff );
        colors[ i ].setHSV( ( x + 1000 ) / 2000, 1.0, 1.0 );

    }
