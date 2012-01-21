Vector2 - 2D vector
-------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Vector2( x, y )

    2D vector

    :param float x: x-coordinate
    :param float y: y-coordinate

.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Vector2.x

    float - default ``0``

.. attribute:: Vector2.y

    float - default ``0``

.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Vector2.clone( )

    Clones this vector

    :returns: New instance identical to this vector
    :rtype: :class:`Vector2`

.. function:: Vector2.set( x, y )

    Sets value of this vector

    :param float x: x-coordinate
    :param float y: y-coordinate
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.copy( v )

    Copies value of ``v`` to this vector

    :param Vector2 v: source vector
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.add( v1, v2 )

    Sets this vector to ``v1 + v2``

    :param Vector2 v1: source vector 1
    :param Vector2 v2: source vector 2
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.addSelf( v )

    Adds ``v`` to this vector

    :param Vector2 v: source vector
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.sub( v1, v2 )

    Sets this vector to ``v1 - v2``

    :param Vector2 v1: source vector 1
    :param Vector2 v2: source vector 2

.. function:: Vector2.subSelf( v )

    Subtracts ``v`` from this vector

    :param Vector2 v: source vector
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.multiplyScalar( s )

    Multiplies this vector by scalar ``s``

    :param float s: scalar
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.divideScalar( s )

    Divides this vector by scalar ``s``

    Set vector to ``( 0, 0 )`` if ``s == 0``

    :param float s: scalar
    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.negate( )

    Inverts this vector

    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.dot( v )

    Computes dot product of this vector and ``v``

    :returns: dot product
    :rtype: float

.. function:: Vector2.lengthSq( )

    Computes squared length of this vector

    :returns: squared length
    :rtype: float

.. function:: Vector2.length( )

    Computes length of this vector

    :returns: length
    :rtype: float

.. function:: Vector2.normalize( )

    Normalizes this vector

    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.distanceTo( v )

    Computes distance of this vector to ``v``

    :returns: squared distance
    :rtype: float

.. function:: Vector2.distanceToSquared( v )

    Computes squared distance of this vector to ``v``

    :returns: squared distance
    :rtype: float

.. function:: Vector2.setLength( l )

    Normalizes this vector and multiplies it by ``l``

    :returns: This vector
    :rtype: :class:`Vector2`

.. function:: Vector2.equals( v )

    Checks for strict equality of this vector and ``v``

    :returns: true if this vector equals ``v``
    :rtype: boolean

.. function:: Vector2.isZero( )

    Checks if length of this vector is within small epsilon (``0.0001``)

    :returns: true if this vector is zero
    :rtype: boolean

.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var a = new THREE.Vector2( 0, 1 );
    var b = new THREE.Vector2( 1, 0 );

    var d = a.distanceTo( b );
