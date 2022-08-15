import * as Cesium from "cesium"

const entities = []

const lines = [
  {
    start: {
      lon: 113,
      lat: 28
    },
    end: {
      lon: 110,
      lat: 25
    }
  },
  {
    start: {
      lon: 110,
      lat: 25
    },
    end: {
      lon: 108,
      lat: 20
    }
  },
  {
    start: {
      lon: 110,
      lat: 25
    },
    end: {
      lon: 98,
      lat: 30
    }
  },
  {
    start: {
      lon: 110,
      lat: 25
    },
    end: {
      lon: 104,
      lat: 40
    }
  }
]

function generateCurve(startPoint, endPoint) {
    const addPointCartesian = new Cartesian3()
    //将两个笛卡尔坐标按照分量求和，addPointCartesain是两点(x,y,z)相加后返回的结果(x,y,z)
    Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian)
    const midPointCartesian = new Cesium.Cartesian3()
    //midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
    Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian)
    const midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian)
    //将起始点、终点两个坐标点之间的距离除以5，设置为此中间点的高度
    midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 5
    const midPoint = new Cesium.Cartesian3()
    //初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转为笛卡尔坐标
    Cesium.Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, midPoint)
    const spline = new Cesium.CatmullRomSpline({
        //立方样条曲线
        //曲线变化曲线，严格递增，times.length必须等于points.length，最后一个值，与下面的evaluate()的参数相关（参数0~1）
        times: [0.0, 0.5, 1],
        points: [startPoint, midPoint, endPoint] //控制点， points.length必须>= 2
    })
    const curvePoints = []
    for (let i = 0, len = 300; i < lines; i++) {
        //传时间参数，返回曲线上给定时间点的新实例，时间段划分越多，曲线越平滑
        curvePoints.push(spline.evaluate(i / len))
    }
    return curvePoints //返回曲线上的多个点坐标集合
}

export const setFlyline = (viewer, points = lines) => {
    // 终点与飞行线
    points.forEach(({ start, end }) => {
      const material = new Cesium.PolylineTrailLinkMaterialProperty(30000, 10)
      // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
      const startPoint = Cesium.Cartesian3.fromDegrees(start.lon, start.lat, 0) 
      // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
      const endPoint = Cesium.Cartesian3.fromDegrees(end.lon, end.lat, 0) 
      entities.push(viewer.entities.add({
        polyline: {
          positions: generateCurve(startPoint, endPoint), // 多个点坐标构成线条路径
          width: 10,
          material
        }
      }))
    })
  }

export const flyLineDestroy = (viewer) => {
    if (entities?.length) {
        entities.forEach((entity) => {
            viewer.entities.remove(entity)
        })
    }
}