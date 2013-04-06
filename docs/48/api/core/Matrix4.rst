Matrix4 - A 4x4 Matrix
----------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Matrix4( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44  )

    A 4x4 Matrix

.. ...............................................................................
.. rubric:: Attributes
.. ...............................................................................

.. attribute:: Matrix4.n11
.. attribute:: Matrix4.n12
.. attribute:: Matrix4.n13
.. attribute:: Matrix4.n14
.. attribute:: Matrix4.n21
.. attribute:: Matrix4.n22
.. attribute:: Matrix4.n23
.. attribute:: Matrix4.n24
.. attribute:: Matrix4.n31
.. attribute:: Matrix4.n32
.. attribute:: Matrix4.n33
.. attribute:: Matrix4.n34
.. attribute:: Matrix4.n41
.. attribute:: Matrix4.n42
.. attribute:: Matrix4.n43
.. attribute:: Matrix4.n44


.. ...............................................................................
.. rubric:: Methods
.. ...............................................................................

.. function:: Matrix4.clone( )

    Clones this matrix

    :returns: New instance identical to this matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 )

    Sets all fields of this matrix

    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.identity()

    Resets this matrix to identity

    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.copy( m )

    Copies a matrix ``m`` into this matrix

    :param Matrix4 m: Matrix to be copied
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.lookAt( eye, center, up )

    Constructs rotation matrix, looking from ``eye`` towards ``center`` with defined ``up`` vector

    :param Vector3 eye: vector
    :param Vector3 center: vector
    :param Vector3 up: vector
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.multiply( a, b )

    Sets this matrix to ``a * b``

    :param Matrix4 a: source matrix A
    :param Matrix4 b: source matrix B
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.multiplyToArray( a, b, r )

    Sets this matrix to ``a * b`` and sets result into flat array ``r``

    Destination array can be regular JS array or Typed Array

    :param Matrix4 a: source matrix A
    :param Matrix4 b: source matrix B
    :param array r: destination array
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.multiplySelf( a )

    Multiplies this matrix by ``a``

    :param Matrix4 a: matrix
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.multiplyScalar( s )

    Multiplies this matrix by ``s``

    :param float  a: number
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.multiplyVector3( v )

    Applies this matrix to a :class:`Vector3`

    :param Vector3 v: vector
    :returns: Multiplied vector
    :rtype: :class:`Vector3`

.. function:: Matrix4.multiplyVector4( v )

    Applies this matrix to a :class:`Vector4`

    :param Vector4 v: vector
    :returns: Multiplied vector
    :rtype: :class:`Vector4`

.. function:: Matrix4.rotateAxis( v )

    Applies rotation submatrix of this matrix to vector ``v`` and then normalizes it

    :param Vector3 v: vector
    :returns: Rotated vector
    :rtype: :class:`Vector3`

.. function:: Matrix4.crossVector( a )

    //todo:description

    :param Vector4 a: vector
    :rtype: :class:`Vector4`

.. function:: Matrix4.determinant()

    Computes determinant of this matrix

    Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

    :returns: Determinant
    :rtype: float

.. function:: Matrix4.transpose()

    Transposes this matrix

    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.flatten()

    Flattens this matrix into internal :attr:`Matrix4.flat` array

    :returns: Flat array with this matrix values
    :rtype: array

.. function:: Matrix4.flattenToArray( flat )

    Flattens this matrix into supplied ``flat`` array

    :param array flat: array
    :returns: Flat array with this matrix values
    :rtype: array

.. function:: Matrix4.flattenToArrayOffset( flat, offset )

    Flattens this matrix into supplied ``flat`` array starting from ``offset`` position in the array

    :param array flat: array
    :param integer offset: offset
    :returns: Flat array with this matrix values
    :rtype: array

.. function:: Matrix4.setTranslation( x, y, z )

    Sets this matrix as translation transform

    :param float x: x-translation
    :param float y: y-translation
    :param float z: z-translation
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setScale( x, y, z )

    Sets this matrix as scale transform

    :param float x: x-scale
    :param float y: y-scale
    :param float z: z-scale
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setRotationX( theta )

    Sets this matrix as rotation transform around x-axis by ``theta`` radians

    :param float theta: Rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setRotationY( theta )

    Sets this matrix as rotation transform around y-axis by ``theta`` radians

    :param float theta: Rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setRotationZ( theta )

    Sets this matrix as rotation transform around z-axis by ``theta`` radians

    :param float theta: Rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setRotationAxis( axis, angle )

    Sets this matrix as rotation transform around ``axis`` by ``angle`` radians

    Based on http://www.gamedev.net/reference/articles/article1199.asp

    :param Vector3 axis: Rotation axis
    :param float angle: Rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setPosition( v )

    Sets just position component for this matrix from vector ``v``

    :param Vector3 v: position vector
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.getPosition()

    Returns position component from this matrix

    Note: this method returns a reference to internal class vector, make copy or clone if you don't use it right away.

    :returns: Vector with position
    :rtype: :class:`Vector3`

.. function:: Matrix4.getColumnX()

    Returns x-column component from this matrix

    Note: this method returns a reference to internal class vector, make copy or clone if you don't use it right away.

    :returns: Vector with x-column
    :rtype: :class:`Vector3`

.. function:: Matrix4.getColumnY()

    Returns y-column component from this matrix

    Note: this method returns a reference to internal class vector, make copy or clone if you don't use it right away.

    :returns: Vector with y-column
    :rtype: :class:`Vector3`

.. function:: Matrix4.getColumnZ()

    Returns z-column component from this matrix

    Note: this method returns a reference to internal class vector, make copy or clone if you don't use it right away.

    :returns: Vector with z-column
    :rtype: :class:`Vector3`

.. function:: Matrix4.getInverse( m )

    Sets this matrix to inverse of matrix ``m``

    Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

    :param Matrix4 m: source matrix
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setRotationFromEuler( v, order )

    Sets rotation submatrix of this matrix to rotation specified by Euler angles

    Default order ``XYZ``

    :param Vector3 v: Vector3 with all the rotations
    :param string order: The order of rotations eg. 'XYZ'
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.setRotationFromQuaternion( q )

    Sets rotation submatrix of this matrix to rotation specified by quaternion

    :param Quaternion q: rotation
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.scale( v )

    Multiplies columns of this matrix by vector ``v``

    :param Vector3 v: scale vector
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.compose( translation, rotation, scale )

    Sets this matrix to transform composed of ``translation``, ``rotation`` and ``scale``

    :param Vector3 translation: vector
    :param Quaternion rotation: quaternion
    :param Vector3 scale: vector
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.decompose( translation, rotation, scale )

    Decomposes this matrix into `translation``, ``rotation`` and ``scale`` components

    If parameters are not supplied, new instances will be created

    :param Vector3 translation: destination translation vector
    :param Quaternion rotation: destination rotation quaternion
    :param Vector3 scale: destination scale vector
    :returns: Array [ translation, rotation, scale ]
    :rtype: Array

.. function:: Matrix4.extractPosition( m )

    Copies translation component of supplied matrix ``m`` into this matrix translation

    :param Matrix4 m: source matrix
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.extractRotation( m )

    Copies rotation component of supplied matrix ``m`` into this matrix rotation

    :param Matrix4 m: source matrix
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.rotateByAxis( axis, angle )

    Rotates this matrix around supplied ``axis`` by ``angle``

    :param Vector3 axis: rotation axis
    :param float angle: rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.rotateX( angle )

    Rotates this matrix around x-axis by ``angle``

    :param float angle: rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.rotateY( angle )

    Rotates this matrix around y-axis by ``angle``

    :param float angle: rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.rotateZ( angle )

    Rotates this matrix around z-axis by ``angle``

    :param float angle: rotation angle in radians
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.translate( v )

    Translates this matrix by vector ``v``

    :param Vector3 v: translation vector
    :returns: This matrix
    :rtype: :class:`Matrix4`

.. ...............................................................................
.. rubric:: Static methods
.. ...............................................................................

.. function:: Matrix4.makeInvert3x3( m )

    Inverts just rotation submatrix of matrix ``m``

    Note: this method returns a reference to internal 3x3 matrix, make copy or clone if you don't use it right away.

    Based on http://code.google.com/p/webgl-mjs/

    :param Matrix4 m: source matrix
    :returns: inverted submatrix
    :rtype: :class:`Matrix3`

.. function:: Matrix4.makeFrustum( left, right, bottom, top, near, far )

    Creates frustum matrix

    :param float left: left
    :param float right: right
    :param float bottom: bottom
    :param float top: top
    :param float near: near
    :param float far: far
    :returns: New instance of frustum matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.makePerspective( fov, aspect, near, far )

    Creates perspective projection matrix

    :param float fov: vertical field of view in degrees
    :param float aspect: aspect ratio
    :param float near: near plane
    :param float far: far plane
    :returns: New instance of projection matrix
    :rtype: :class:`Matrix4`

.. function:: Matrix4.makeOrtho( left, right, top, bottom, near, far )

    Creates orthographic projection matrix

    :param float left: left
    :param float right: right
    :param float top: top
    :param float bottom: bottom
    :param float near: near plane
    :param float far: far plane
    :returns: New instance of projection matrix
    :rtype: :class:`Matrix4`

.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

    // simple rig for rotation around 3 axes

    var m = new THREE.Matrix4();

    var m1 = new THREE.Matrix4();
    var m2 = new THREE.Matrix4();
    var m3 = new THREE.Matrix4();

    var alpha = 0;
    var beta = Math.PI;
    var gamma = Math.PI/2;

    m1.setRotationX( alpha );
    m2.setRotationY( beta );
    m3.setRotationZ( gamma );

    m.multiply( m1, m2 );
    m.multiplySelf( m3 );
