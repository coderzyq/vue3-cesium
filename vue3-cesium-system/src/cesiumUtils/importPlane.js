import * as Cesium from "cesium"

export default class ImportPlane {
    /**
   *Creates an instance of ImportPlane.
    * @param {*} tc 绕飞时间
    * @param {*} viewer 需要传入
    * @param {*} options.uri 模型的uri 需要传入
    * @param {*} options.position 模型的位置经纬度高度数组 需要传入
    * @param {*} options.vs 模型的速度
    * @memberof ImportPlane
  */
 constructor(viewer, options) {
    this.viewer = viewer
    this.uri = options.uri
    this.arr = options.position
    this.addr = options.addr
    const pos0 = this.arr[0]
    this.position = [pos0[0], pos0[1], pos0[2]]
    // this.position = [99.0, 25.3, 100]
    this.i = 1
    this.pos = options.arrPos
    this.maxLength = options.maxLength
    this.scale = options.scale || 1
    this.cylinderPrimitive = null
    this.airplanePath = null
    this.entity = null
    this.preUpdate = null
    this.InitPlane()
 }

 // 用于加航线，随机生成飞机的id
 randomString(e) {
    e = e || 32
    const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    const a = t.length
    let n = ''
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
    return n
  }

  /**
   * 计算heading
   * A,B是三维坐标数组
   * @memberof ImportPlane
   */
   getHeading(A, B) {
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(A)
    // 向量AB
    const positionvector = Cesium.Cartesian3.subtract(B, A, new Cesium.Cartesian3())
    // 因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
    // AB为世界坐标中的向量
    // 因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
    const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3())
    // 归一化
    const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3())
    // heading
    const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
    return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  }

  /**
   * 计算pitch
   * A,B是三维坐标数组
   * @memberof ImportPlane
   */
   getPitch(A, B) {
    const transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(A)
    const vector = Cesium.Cartesian3.subtract(B, A, new Cesium.Cartesian3())
    const direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector)
    Cesium.Cartesian3.normalize(direction, direction)
    // 因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
    return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z)
  }

  /**
   * 将点转为数组
   * @memberof ImportPlane
   */
   getPosition(positions) {
    const arr = []
    let temp = []
    const { length } = positions
    let j = 0
    for (let i = 0; i < length; i++) {
      if (temp.length < 3) {
        temp[j] = positions[i]
        j++
      } else {
        i--
        arr.push(temp)
        temp = []
        j = 0
      }
    }
    arr.push([this.position[length - 3], this.position[length - 2], this.position[length - 1]])
    return arr
  }

   // 生成实体
   InitPlane() {
    // 控制飞机
    const { viewer } = this
    const { scene, camera } = viewer
    const hpRoll = new Cesium.HeadingPitchRoll(0, 0, 0)
    const A1 = Cesium.Cartesian3.fromDegrees(this.arr[0][0], this.arr[0][1], this.arr[0][2])
    const B1 = Cesium.Cartesian3.fromDegrees(this.arr[1][0], this.arr[1][1], this.arr[1][2])
    // 起点航向
    hpRoll.heading = this.getHeading(A1, B1)
    hpRoll.pitch = this.getPitch(A1, B1)
    const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
      'north',
      'west'
    )
    let cartesian3 = A1
    let r = 0
    const center = new Cesium.Cartesian3()
    const hpRange = new Cesium.HeadingPitchRange()
    let speedVector = new Cesium.Cartesian3()
    // 飞机模型
    this.entity = scene.primitives.add(
      Cesium.Model.fromGltf({
        // 飞机模型位置
        url: this.uri,
        modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
          cartesian3,
          hpRoll,
          Cesium.Ellipsoid.WGS84,
          fixedFrameTransform
        ),
        scale: 2,
        minimumPixelSize: 60
      })
    )
    this.entity.readyPromise.then((model) => {
      // Play and loop all animations at half-speed
      model.activeAnimations.addAll({
        multiplier: 2,
        loop: Cesium.ModelAnimationLoop.REPEAT
      })
      // Zoom to model
      r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near)
      // controller.minimumZoomDistance = r * 0.5
    //   Cesium.Matrix4.multiplyByPoint(
    //     model.modelMatrix,
    //     model.boundingSphere.center,
    //     center
    //   )
      const heading = Cesium.Math.toRadians(230.0)
      const pitch = Cesium.Math.toRadians(-20.0)
      hpRange.heading = heading
      hpRange.pitch = pitch
      hpRange.range = r * 50.0
    //   camera.lookAt(center, hpRange)
    })
    // 飞机移动函数
    const _this = this
    this.preUpdate = viewer.scene.preUpdate.addEventListener((scene, time) => {
      _this.i++
      const A = Cesium.Cartesian3.fromDegrees(_this.arr[_this.i - 1][0], _this.arr[_this.i - 1][1], _this.arr[_this.i - 1][2])
      const B = Cesium.Cartesian3.fromDegrees(_this.arr[_this.i][0], _this.arr[_this.i][1], _this.arr[_this.i][2])
      hpRoll.heading = _this.getHeading(A, B)
      hpRoll.pitch = _this.getPitch(A, B)
      speedVector = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.UNIT_X,
        _this.arr[_this.i][3],
        speedVector
      )
      cartesian3 = Cesium.Matrix4.multiplyByPoint(
        _this.entity.modelMatrix,
        speedVector,
        cartesian3
      )
      // 飞机移动参数
      cartesian3 = Cesium.Cartesian3.fromDegrees(_this.arr[_this.i][0], _this.arr[_this.i][1], _this.arr[_this.i][2])
      Cesium.Transforms.headingPitchRollToFixedFrame(
        cartesian3,
        hpRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform,
        _this.entity.modelMatrix
      )
    })
    // eslint-disable-next-line func-names
    setTimeout(() => {
      camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          this.position[0], this.position[1] - 0.1, 10000
        ),
        orientation: {
        // 指向
          heading: Cesium.Math.toRadians(0, 0),
          // 视角
          pitch: Cesium.Math.toRadians(-25),
          roll: 0.0
        }
      })
    }, 500)
  }

  /**
   * 显示飞机的探测区域
   * @memberof ImportPlane
   */
   addCylinder() {
    // 注意高度要减半
    const position = [this.position[0], this.position[1], this.position[2] / 2]
    const cartesian3 = Cesium.Cartesian3.fromDegrees(...position)
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian3)
    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.CylinderGeometry({
        length: this.position[2],
        topRadius: 0,
        bottomRadius: 500,
        vertexFormat: Cesium.VertexFormat.DEFAULT
      }),
      id: this.randomString(8),
      name: '相机探测区域',
      modelMatrix,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.BLUE.withAlpha(0.15)
        )
      }
    })
    this.cylinderPrimitive = this.viewer.scene.primitives.add(new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: false
      })
    }))
  }

  /**
   * 显示飞机的航迹
   * @memberof ImportPlane
   */
   addPlanePath() {
    const _this = this
    const pathArr = [..._this.position]
    let temp = 0
    const defaultConf = {
      id: this.randomString(9),
      name: '飞机的航迹',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          if (temp < 75) {
            temp++
          } else {
            const sourpos = _this.entity.position.getValue(time)
            const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
            const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
            const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
            const height1 = cartographic1.height
            pathArr.push(lon1, lat1, height1)
            temp = 0
          }
          return Cesium.Cartesian3.fromDegreesArrayHeights(pathArr, Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 0,
          color: Cesium.Color.RED
        })
      }
    }
    this.airplanePath = this.viewer.entities.add(defaultConf)
  }

  /**
   * @param {*} targetPos // 连接其他model的位置的二维数组
   * @memberof ImportPlane
   */
   traceTarget(targetPos) {
    const defaultConf = {
      name: '连线',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          // 获取最短的路径, 连接最近节点
          const latestEntityPosition = this.getLatestEntityPosition(targetPos, lon1, lat1, height1)
          return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, ...latestEntityPosition], Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 5,
          color: Cesium.Color.RED
        })
      }
    }
    this.wave = this.viewer.entities.add(defaultConf)
  }

  /**
   * @param {*} sat // 连接卫星entity
   * @memberof ImportPlane
   */
   traceSat(sat) {
    const defaultConf = {
      name: '卫星连线',
      polyline: {
        positions: new Cesium.CallbackProperty((time, result) => {
          const sourpos = this.entity.position.getValue(time)
          const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos)
          const lon1 = Cesium.Math.toDegrees(cartographic1.longitude)
          const lat1 = Cesium.Math.toDegrees(cartographic1.latitude)
          const height1 = cartographic1.height
          const tarpos = sat.position.getValue(time)
          const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos)
          const lon2 = Cesium.Math.toDegrees(cartographic.longitude)
          const lat2 = Cesium.Math.toDegrees(cartographic.latitude)
          const height2 = cartographic.height
          return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid.WGS84, result)
        }, false),
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          dashLength: 5,
          color: Cesium.Color.RED
        })
      }
    }
    this.viewer.entities.add(defaultConf)
  }

  /**
   * @param {*} targetPos // 连接其他model的位置的二维数组
   * @param {*} lon1 // 目标的经度
   * @param {*} lat1 // 目标的纬度
   * @param {*} height1 // 目标的高度
   * @memberof ImportPlane
   */
   getLatestEntityPosition(poss, lon1, lat1, height1) {
    const distanceObj = {}
    poss.forEach((item) => {
      const lon2 = item[0]
      const lat2 = item[1]
      const height2 = item[2]
      const distance = this.getLineDis([lon1, lat1, height1 <= 0 ? 0 : height1], [lon2, lat2, height2 <= 0 ? 0 : height2])
      distanceObj[distance] = [lon2, lat2, height2]
    })
    const minKey = Math.min(...Object.keys(distanceObj))
    return distanceObj[minKey]
  }

  /**
   * 返回距离单位米
   * @param {*} startPosition // 源点的经纬度高度数组
   * @param {*} endPosition // 终点的经纬度高度数组
   * @memberof ImportPlane
   */
  getLineDis(startPosition, endPosition) {
  // 使用cesium的对象中的方法获取距离数据，而不是根据坐标转换计算，
    const geodesic = new Cesium.EllipsoidGeodesic()
    const startCartographic = Cesium.Cartographic.fromDegrees(...startPosition)
    const endCartographic = Cesium.Cartographic.fromDegrees(...endPosition)
    geodesic.setEndPoints(startCartographic, endCartographic)
    return geodesic.surfaceDistance
  }

  // 删除模型
  deleteModel() {
    this.viewer.scene.primitives.remove(this.entity)
  }

  destroy() {
    this.preUpdate()
    this.deleteModel()
    this.entity = null
  }
}