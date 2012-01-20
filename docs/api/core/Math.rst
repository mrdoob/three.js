Math - Math utility functions
-----------------------------

.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Math.clamp( x, a, b )

    Clamps the x to be between a and b

    :param float x: value to be clamped
    :param float a: minimum value
    :param float b: maximum value
    :returns: Clamped value
    :rtype: float

.. function:: Math.clampBottom( x, a )

    Clamps the x to be larger than a

    :param float x: value to be clamped
    :param float a: minimum value
    :returns: Clamped value
    :rtype: float

.. function:: Math.mapLinear( x, a1, a2, b1, b2 )

    Linear mapping of x from range <a1, a2> to range <b1, b2>

    :param float x: value to be mapped
    :param float a1: minimum value for range A
    :param float a2: maximum value for range A
    :param float b1: minimum value for range B
    :param float b2: maximum value for range B
    :returns: mapped value
    :rtype: float

.. function:: Math.random16()

    Random float from <0, 1> with 16 bits of randomness
    (standard Math.random() creates repetitive patterns when applied over larger space)

    :returns: Random float from <0, 1> with 16 bits of randomness
    :rtype: float

.. function:: Math.randInt( low, high )

    :returns: Random integer from *low* to *high* interval
    :rtype: integer

.. function:: Math.randFloat( low, high )

    :returns: Random float from *low* to *high* interval
    :rtype: float

.. function:: Math.randFloatSpread( range )

    :returns: Random float from -range/2 to range/2 interval
    :rtype: float
