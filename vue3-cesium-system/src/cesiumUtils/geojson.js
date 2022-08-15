import * as Cesium from "cesium";

const viewPosition = [116.388404, 39.8960601];
let geojson;

export const addGeoJson = async (viewer) => {
  const url = `${process.env.VUE_APP_BUILD_PATH_PREFIX}/geojson/gugong.geojson`
  geojson = await Cesium.GeoJsonDataSource.load(url, {
    stroke: Cesium.Color.WHITE,
    fill: Cesium.Color.BLUE.withAlpha(0.3),
    strokeWidth: 5,
  });
  viewer.dataSources.add(geojson);
  const entities = geojson.entities.values;
  const colorHash = {};
  entities.forEach((entity) => {
    const { name } = entity;
    let color = colorHash[name];
    if (!color) {
      color = Cesium.Color.fromCssColorString(entity.properties._value || "#000000");
      colorHash[name] = color;
    }
    entity.polygon.material = color;
    entity.polygon.outline = false;
    entity.polygon.extrudedHeight = entity.properties.height._value * 50 || 0;
  });
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(...viewPosition, 1000),
    orientation: {
      // 指向
      heading: Cesium.Math.toRadians(0, 0),
      // 视角
      pitch: Cesium.Math.toRadians(-20),
      roll: 0.0,
    },
  });
}

export const removeGeoJson = (viewer) => {
    if (geojson) {
        viewer.dataSources.remove(geojson)
    }
}
