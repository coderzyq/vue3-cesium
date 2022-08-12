import * as Cesium from "cesium"

const initCesium = () => {
  // 设置在中国
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    80,
    4,
    130,
    55
  );
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNmE3NWNiMi1iNGRmLTRlNWUtYmE5ZS0xMWM3YjEyNzMxNjEiLCJpZCI6OTk5MzUsImlhdCI6MTY1NjkxMzY3MX0.S8rhi8SLw6eHjz9VtbdHqfYhkw_x3v97R-hbLKdhZKw";

  const baseConf = {
    geocoder: false,
    homeButton: true,
    sceneModePicker: true,
    baseLayerPicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    scene3DOnly: false,
  };

  const viewer = new Cesium.Viewer("cesiumContainer", { ...baseConf });

  // Bing地图影像，可以指定mapStyle，详见BingMapsStyle类
  var terrainProvider = Cesium.createWorldTerrain({
    requestWaterMask: true, // 请求水体效果所需要的海岸线数据
    requestVertexNormals: true, // 请求地形照明数据
  });
  viewer.terrainProvider = terrainProvider;
  // viewer.scene.setTerrainExaggeration(2.0); // 地形夸张
  viewer.scene.globe.depthTestAgainstTerrain = true; // 启用深度测试，让地形后面的东西消失。

  // 提示错误Blocked script execution in ‘about:blank’ because the document’s frame is sandboxed and the ‘allow-scripts’ permission is not set.的解决方法
  let iframe = document.getElementsByClassName("cesium-infoBox-iframe")[0];
  iframe.setAttribute(
    "sandbox",
    "allow-same-origin allow-scripts allow-popups allow-forms"
  );
  iframe.setAttribute("src", ""); //必须设置src为空 否则不会生效

  // 去除版权信息
  viewer._cesiumWidget._creditContainer.style.display = "none";
  viewer.camera.setView({
    // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
    // fromDegrees()方法，将经纬度和高程转换为世界坐标
    destination: Cesium.Cartesian3.fromDegrees(...[104, 30, 30000000]),
    orientation: {
      // 指向
      heading: Cesium.Math.toRadians(0, 0),
      // 视角
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0,
    },
  });

  return viewer;
};

export { initCesium };