Vector3 - 3D vector
-------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Vector3()

    3D vector

    :param float x: x-coordinate
    :param float y: y-coordinate
    :param float z: z-coordinate

.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Vector3.x

    float - default ``0``

.. attribute:: Vector3.y

    float - default ``0``

.. attribute:: Vector3.z

    float - default ``0``

.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Vector3.clone( )

    Clones this vector

    :returns: New instance identical to this vector
    :rtype: :class:`Vector3`

.. function:: Vector3.set( x, y, z )

    Sets value of this vector

    :param float x: x-coordinate
    :param float y: y-coordinate
    :param float z: z-coordinate
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.setX( x )

    Sets x-value of this vector

    :param float x: x-coordinate
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.setY( y )

    Sets y-value of this vector

    :param float y: y-coordinate
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.setZ( z )

    Sets z-value of this vector

    :param float z: z-coordinate
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.copy( v )

    Copies value of ``v`` to this vector

    :param Vector3 v: source vector
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.add( v1, v2 )

    Sets this vector to ``v1 + v2``

    :param Vector3 v1: source vector 1
    :param Vector3 v2: source vector 2
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.addSelf( v )

    Adds ``v`` to this vector

    :param Vector3 v: source vector
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.sub( v1, v2 )

    Sets this vector to ``v1 - v2``

    :param Vector3 v1: source vector 1
    :param Vector3 v2: source vector 2

.. function:: Vector3.subSelf( v )

    Subtracts ``v`` from this vector

    :param Vector3 v: source vector
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.multiplyScalar( s )

    Multiplies this vector by scalar ``s``

    :param float s: scalar
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.divideScalar( s )

    Divides this vector by scalar ``s``

    Set vector to ``( 0, 0, 0 )`` if ``s == 0``

    :param float s: scalar
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.negate( )

    Inverts this vector

    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.dot( v )

    Computes dot product of this vector and ``v``

    :param Vector3 v: vector
    :returns: dot product
    :rtype: float

.. function:: Vector3.lengthSq( )

    Computes squared length of this vector

    :returns: squared length
    :rtype: float

.. function:: Vector3.length( )

    Computes length of this vector

    :returns: length
    :rtype: float

.. function:: Vector3.lengthManhattan( )

    Computes Manhattan length of this vector

    http://en.wikipedia.org/wiki/Taxicab_geometry

    :returns: length
    :rtype: float

.. function:: Vector3.normalize( )

    Normalizes this vector

    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.distanceTo( v )

    Computes distance of this vector to ``v``

    :param Vector3 v: vector
    :returns: squared distance
    :rtype: float

.. function:: Vector3.distanceToSquared( v )

    Computes squared distance of this vector to ``v``

    :param Vector3 v: vector
    :returns: squared distance
    :rtype: float

.. function:: Vector3.setLength( l )

    Normalizes this vector and multiplies it by ``l``

    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.cross( a, b )

    Sets this vector to cross product of ``a`` and ``b``

    :param Vector3 a: vector
    :param Vector3 b: vector
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.crossSelf( v )

    Sets this vector to cross product of itself and ``v``

    :param Vector3 v: vector
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.setPositionFromMatrix( m )

    Sets this vector extracting position from matrix transform

    :param Matrix4 m: matrix
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.setRotationFromMatrix( m )

    Sets this vector extracting Euler angles rotation from matrix transform

    :param Matrix4 m: matrix
    :returns: This vector
    :rtype: :class:`Vector3`

.. function:: Vector3.equals( v )

    Checks for strict equality of this vector and ``v``

    :param Vector3 v: vector
    :returns: true if this vector equals ``v``
    :rtype: boolean

.. function:: Vector3.isZero( )

    Checks if length of this vector is within small epsilon (``0.0001``)

    :returns: true if this vector is zero
    :rtype: boolean

.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var a = new THREE.Vector3( 1, 0, 0 );
    var b = new THREE.Vector3( 0, 1, 0 );

    var c = new THREE.Vector3();
    c.cross( a, b );
