Quaternion - Implementation of a quaternion
-------------------------------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Quaternion( x, y, z, w )

    Implementation of a quaternion

    :param float x: x-coordinate
    :param float y: y-coordinate
    :param float z: z-coordinate
    :param float w: w-coordinate

.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Quaternion.x

    float - default ``0``

.. attribute:: Quaternion.y

    float - default ``0``

.. attribute:: Quaternion.z

    float - default ``0``

.. attribute:: Quaternion.w

    float - default ``1``

.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Quaternion.clone( )

    Clones this quaternion

    :returns: New instance identical to this quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.set( x, y, z, w )

    Sets value of this vector

    :param float x: x-coordinate
    :param float y: y-coordinate
    :param float z: z-coordinate
    :param float w: w-coordinate
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.copy( q )

    Copies value of ``q`` to this quaternion

    :param Quaternion v: source quaternion
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.setFromEuler ( vec3 )

    Sets this quaternion from rotation specified by Euler angles

    Angles are in degrees

    :param Vector3 vec3: Euler angles vector
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.setFromAxisAngle ( axis, angle )

    Sets this quaternion from rotation specified by axis and angle

    Adapted from: http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

    Axis have to be normalized, angle is in radians

    :param Vector3 axis: axis vector
    :param float angle: angle
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.setFromRotationMatrix ( m )

    Sets this quaternion from rotation specified by matrix

    Adapted from: http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

    :param Matrix4 m: rotation matrix
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.calculateW( )

    Calculates ``w`` component of this quaternion

    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.inverse( )

    Inverts this quaternion

    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.length( )

    Computes length of this quaternion

    :returns: length
    :rtype: float

.. function:: Quaternion.normalize( )

    Normalizes this quaternion

    :returns: This vector
    :rtype: :class:`Quaternion`

.. function:: Quaternion.multiplySelf( quat2 )

    Multiplies this quaternion by ``quat2``

    :param Quaternion quat2: quaternion
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.multiply( q1, q2 )

    Sets this quaternion to ``q1 * q2``

    Adapted from: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

    :param Quaternion q1: quaternion 1
    :param Quaternion q2: quaternion 2
    :returns: This quaternion
    :rtype: :class:`Quaternion`

.. function:: Quaternion.multiplyVector3( vec, dest )

    Rotates ``vec`` by this quaternion into ``dest``

    If ``dest`` is not specified, result goes to ``vec``

    :param Vector3 vec: source vector
    :param Vector3 dest: destination vector
    :returns: Rotated vector
    :rtype: :class:`Vector3`


.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    var q = new THREE.Quaternion();
    q.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );

    var v = new THREE.Vector3( 1, 0, 0 );
    q.multiplyVector3( v );
