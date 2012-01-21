Vector4 - 4D vector
-------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Vector4( x, y, z, w )

    4D vector

    :param float x: x-coordinate
    :param float y: y-coordinate
    :param float z: z-coordinate
    :param float w: w-coordinate

.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Vector4.x

    float - default ``0``

.. attribute:: Vector4.y

    float - default ``0``

.. attribute:: Vector4.z

    float - default ``0``

.. attribute:: Vector4.w

    float - default ``1``


.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Vector4.clone( )

    Clones this vector

    :returns: New instance identical to this vector
    :rtype: :class:`Vector4`

.. function:: Vector4.set( x, y, z, w )

    Sets value of this vector

    :param float x: x-coordinate
    :param float y: y-coordinate
    :param float z: z-coordinate
    :param float w: w-coordinate
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.copy( v )

    Copies value of ``v`` to this vector

    Sets ``w`` to 1 if ``v.w`` is undefined

    :param Vector4 v: source vector
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.add( v1, v2 )

    Sets this vector to ``v1 + v2``

    :param Vector4 v1: source vector 1
    :param Vector4 v2: source vector 2
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.addSelf( v )

    Adds ``v`` to this vector

    :param Vector4 v: source vector
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.sub( v1, v2 )

    Sets this vector to ``v1 - v2``

    :param Vector4 v1: source vector 1
    :param Vector4 v2: source vector 2

.. function:: Vector4.subSelf( v )

    Subtracts ``v`` from this vector

    :param Vector4 v: source vector
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.multiplyScalar( s )

    Multiplies this vector by scalar ``s``

    :param float s: scalar
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.divideScalar( s )

    Divides this vector by scalar ``s``

    Set vector to ``( 0, 0, 0, 1 )`` if ``s == 0``

    :param float s: scalar
    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.negate( )

    Inverts this vector

    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.dot( v )

    Computes dot product of this vector and ``v``

    :param Vector4 v: vector
    :returns: dot product
    :rtype: float

.. function:: Vector4.lengthSq( )

    Computes squared length of this vector

    :returns: squared length
    :rtype: float

.. function:: Vector4.length( )

    Computes length of this vector

    :returns: length
    :rtype: float

.. function:: Vector4.normalize( )

    Normalizes this vector

    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.setLength( l )

    Normalizes this vector and multiplies it by ``l``

    :returns: This vector
    :rtype: :class:`Vector4`

.. function:: Vector4.lerpSelf( v, alpha )

    Linearly interpolate between this vector and ``v`` with ``alpha`` factor

    :param Vector4 v: vector
    :param float alpha: interpolation factor
    :returns: This vector
    :rtype: :class:`Vector4`


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var a = new THREE.Vector4( 1, 0, 0, 0 );