Matrix4 - A 4x4 Matrix
----------------------

.. ...............................................................................
.. rubric:: Constructor
.. ...............................................................................

.. class:: Matrix4( [ n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43,n44 ] )

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

.. function:: Matrix4.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43,n44)

    Sets all fields of this matrix

.. function:: Matrix4.identity()

    //todo:description

.. function:: Matrix4.copy(m)

    Copies a matrix into this matrix

    :param Matrix4 m: Matrix to be copied

.. function:: Matrix4.lookAt(eye,center,up)

    //todo:description

    :param Vector3 eye: //todo
    :param Vector3 center: //todo
    :param Vector3 up: //todo

.. function:: Matrix4.multiply(a,b)

    //todo:description

    :param Matrix4 a: //todo
    :param Matrix4 b: //todo

.. function:: Matrix4.multiplySelf(a)

    //todo:description

    :param Matrix4 a: //todo

.. function:: Matrix4.multiplyToArray(a,b,r)

    //todo:description

    :param Matrix4 a: //todo
    :param Matrix4 b: //todo
    :param array r: //todo

.. function:: Matrix4.multiplyScalar(s)

    //todo:description

    :param float  a: //todo

.. function:: Matrix4.multiplyVector3(v)

    Applys this matrix to a :class:`Vector3`

    :param Vector3 v: //todo
    :rtype: Vector3

.. function:: Matrix4.multiplyVector4(v)

    Applys this matrix to a :class:`Vector4`

    :param Vector4 v: //todo
    :rtype: Vector4

.. function:: Matrix4.rotateAxis(v)

    //todo:description

    :param Vector3 v: //todo

.. function:: Matrix4.crossVector(a)

    //todo:description

    :param Vector4 a: //todo

.. function:: Matrix4.determinant()

    //todo:description

.. function:: Matrix4.transpose()

    //todo:description

.. function:: Matrix4.clone()

    Clones this matrix

    :returns: New instance of this matrix
    :rtype: Matrix4

.. function:: Matrix4.flatten()

    //todo:description

.. function:: Matrix4.flattenToArray(flat)

    //todo:description

    :param array flat: //todo
    :rtype: array

.. function:: Matrix4.flattenToArrayOffset(flat,offset)

    //todo:description

    :param array flat: //todo
    :param integer offset: //todo
    :rtype: array

.. function:: Matrix4.setTranslation(x,y,z)

    //todo:description

    :param float x: //todo
    :param float y: //todo
    :param float z: //todo

.. function:: Matrix4.setScale(x,y,z)

    //todo:description

    :param float x: //todo
    :param float y: //todo
    :param float z: //todo

.. function:: Matrix4.setRotationX(theta)

    //todo:description
    :param float theta: Rotation angle in radians

.. function:: Matrix4.setRotationY(theta)

    //todo:description
    :param float theta: Rotation angle in radians

.. function:: Matrix4.setRotationZ(theta)

    //todo:description
    :param float theta: Rotation angle in radians

.. function:: Matrix4.setRotationAxis(axis,angle)

    //todo:description

    :param Vector3 axis: //todo:description
    :param float angle: //todo:description

.. function:: Matrix4.setPosition(v)

    //todo:description

    :param Vector3 v: //todo

.. function:: Matrix4.getPosition()

    //todo:description

.. function:: Matrix4.getColumnX()

    //todo:description

.. function:: Matrix4.getColumnY()

    //todo:description

.. function:: Matrix4.getColumnZ()

    //todo:description

.. function:: Matrix4.getInverse(m)

    //todo:description

    :param Matrix4 m: //todo

.. function:: Matrix4.setRotationFromEuler(v,order)

    //todo:description

    :param Vector3 v: Vector3 with all the rotations
    :param string order: The order of rotations eg. 'XYZ'

.. function:: Matrix4.setRotationFromQuaternion(q)

    //todo:description

    :param Quaternion q: //todo

.. function:: Matrix4.scale(v)

    //todo:description

    :param Vector3 v: //todo

.. function:: Matrix4.compose(translation, rotation, scale)

    //todo:description

    :param Vector3 translation: //todo
    :param Quaternion rotation: //todo
    :param Vector3 scale: //todo

.. function:: Matrix4.decompose(translation, rotation, scale)

    //todo:description

    :param Vector3 translation: //todo
    :param Quaternion rotation: //todo
    :param Vector3 scale: //todo
    :returns: //todo
    :rtype: //todo

.. function:: Matrix4.extractPosition(m)

    //todo:description

    :param Matrix4 m:

.. function:: Matrix4.extractRotation(m)

    //todo:description

    :param Matrix4 m:

.. function:: Matrix4.rotateByAxis(axis,angle)

    //todo:description

    :param Vector3 axis: //todo:description
    :param float angle: //todo:description

.. function:: Matrix4.rotateX(angle)

    //todo:description

    :param float angle: //todo:description

.. function:: Matrix4.rotateY(angle)

    //todo:description

    :param float angle: //todo:description

.. function:: Matrix4.rotateZ(angle)

    //todo:description

    :param float angle: //todo:description

.. function:: Matrix4.translate(v)

    :param Vector3 v: //todo:description

.. function:: Matrix4.makeInvert3x3(m)(static)

    //todo:description

    :param Matrix4 v:
    :returns: A 3x3 Matrix
    :rtype: Matrix3

.. function:: Matrix4.makeFrustum( left, right, bottom, top, near, far )(static)

    //todo:description and parameters

    :returns: //todo
    :rtype: Matrix4

.. function:: Matrix4.makePerspective( fov, aspect, near, far )(static)

    //todo:description and parameters

    :returns: //todo
    :rtype: Matrix4

.. function:: Matrix4.makeOrtho( left, right, top, bottom, near, far )(static)

    //todo:description and parameters

    :returns: //todo
    :rtype: Matrix4

.. ...............................................................................
.. rubric:: Example
.. ...............................................................................

::

//todo::example