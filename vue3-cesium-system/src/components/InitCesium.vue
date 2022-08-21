<template>
  <div id="container">
    <div id="cesiumContainer"></div>
    <panel v-model:visible="dialogVisible" @btnClick="btnClickHandler"></panel>
  </div>
</template>

<script>
import * as Cesium from "cesium";

import Panel from "@/components/Panel.vue";

import { initCesium } from "@/cesiumUtils/initCesium";
import {
  randomGenerateBillboards,
  destroyBillboard,
} from "@/cesiumUtils/randPoints";
import { addGeoJson, removeGeoJson } from "@/cesiumUtils/geojson";
import {
  WallRegularDiffuse,
  removeWall,
} from "@/cesiumUtils/wallRegularDiffuse";
import { setRiverDynamic } from "@/cesiumUtils/riverDynamic";
import { setTrackPlane } from "@/cesiumUtils/trackPalne";
import { setRain, setSnow, setFog } from "@/cesiumUtils/cesiumEffect";
import {
  setSpreadEllipse,
  destroy as SpreadDestroy,
} from "@/cesiumUtils/spreadEllipse";
import { setScan } from "@/cesiumUtils/scan";
import { setFlyline, flyLineDestroy } from "@/cesiumUtils/airline";
import { setRadarStaticScan } from "@/cesiumUtils/radarStaticScan";
import { setEmitter } from "@/cesiumUtils/emitter";
import { setRadarDynamicScan } from "@/cesiumUtils/radarDynamicScan";
import { setRiverFlood } from '@/cesiumUtils/riverFlood'

import * as paths from "@/assets/paths";
import Roaming from "@/cesiumUtils/satelliteRoaming";
import gerateSatelliteLines from "@/mocks/satellitePath";
import ImportPlane from "@/cesiumUtils/importPlane";
import DrawLines from "@/cesiumUtils/drawLines";

import { ref, onMounted } from "vue";
import { process } from "ipaddr.js";

export default {
  name: "InitCesium",
  components: {
    Panel,
  },
  setup() {
    let viewer3D = null;

    let sat;

    let rain;
    let snow;
    let fog;

    let direct;
    let round;
    let circle;

    const addresses = [];

    const dialogVisible = ref(true);
    // const videoShow = ref(false);
    // const clickedDrone = ref(false);

    const CallBack = (active, resolve, reject) => {
      if (active) {
        resolve();
      } else {
        reject();
      }
    };
    const back2Home = () => {
      document.querySelector(".cesium-home-button").click();
    };

    const setPlanePath = (viewer, arr, pos, addr) => {
      const plane = new ImportPlane(viewer, {
        uri: `${process.env.VUE_APP_BUILD_PATH_PREFIX}/models/CesiumAir.glb`,
        position: arr,
        addr,
        arrPos: pos,
        maxLength: arr.length - 1,
        reduce: pos + 1,
      });
      const line = new DrawLines(viewer, {
        lines: arr,
        model: plane.entity,
      });
      return {
        plane,
        line,
      };
    };
    const setRoutes = (type = "direct") => {
      const pathArr = paths[type];
      addresses.push(1);
      return setPlanePath(
        viewer3D,
        pathArr[0],
        addresses.length - 1,
        addresses
      );
    };
    const destroyPlaneLine = (flyObj) => {
      if (flyObj) {
        const { plane, line } = flyObj;
        plane.destroy();
        line.removeLine();
      }
    };

    const destroyOther = () => {
      destroyPlaneLine(direct);
      destroyPlaneLine(round);
      destroyPlaneLine(circle);
      // if (clickedDrone.value) {
      //   videoShow.value = false
      //   toggleVideo('h5sVideo1')
      //   destroyDrone(viewer3D)
      // }
    };

    const btnClickHandler = (btn) => {
      const { id, active } = btn;
      switch (id) {
        case "billboard": {
          CallBack(
            active,
            () => {
              randomGenerateBillboards(viewer3D, 1000);
            },
            () => {
              destroyBillboard();
              back2Home();
            }
          );
          break;
        }
        case "sat": {
          CallBack(
            active,
            () => {
              back2Home();
              sat = new Roaming(viewer3D, {
                uri: `${process.env.VUE_APP_BUILD_PATH_PREFIX}/models/Satellite.glb`,
                Lines: gerateSatelliteLines(0, 0),
              });
            },
            () => {
              sat?.EndRoaming();
            }
          );
          break;
        }
        case "geojson": {
          CallBack(
            active,
            () => {
              addGeoJson(viewer3D);
            },
            () => {
              back2Home();
              removeGeoJson(viewer3D);
            }
          );
          break;
        }
        case "spreadEllipse": {
          if (active) {
            back2Home();
            setSpreadEllipse(viewer3D);
          } else {
            SpreadDestroy(viewer3D);
          }
          break;
        }
        case "scan": {
          back2Home();
          setScan(viewer3D, !active);
          break;
        }
        case "spreadWall": {
          // 打开geojson更能看出效果
          CallBack(
            active,
            () => {
              const viewPosition = [116.390646, 39.9126084];
              viewer3D.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                  viewPosition[0],
                  viewPosition[1] - 0.04,
                  1000
                ),
                orientation: {
                  // 指向
                  heading: Cesium.Math.toRadians(0, 0),
                  // 视角
                  pitch: Cesium.Math.toRadians(-20),
                  roll: 0.0,
                },
              });
              WallRegularDiffuse({
                viewer: viewer3D,
                center: viewPosition,
                radius: 400.0,
                edge: 8,
                height: 50.0,
                speed: 15,
                minRidus: 100,
              });
            },
            () => {
              back2Home();
              removeWall(viewer3D);
            }
          );
          break;
        }
        case "flyline": {
          if (active) {
            back2Home();
            setFlyline(viewer3D);
          } else {
            flyLineDestroy(viewer3D);
          }
          break;
        }
        case "radarStatic": {
          back2Home();
          setRadarStaticScan(viewer3D, active);
          setEmitter(viewer3D, active);
          break;
        }
        case "radarDynamic": {
          if (active) {
            back2Home();
            setRadarDynamicScan(viewer3D);
          } else {
            viewer3D.entities.removeById("radarD1");
            viewer3D.entities.removeById("radarScanD1");
            viewer3D.entities.removeById("yuanzhu");
            return;
          }
          break;
        }
        case "riverFlood": {
          back2Home();
          setRiverFlood(viewer3D, active);
          break;
        }
        case "riverDynamic": {
          back2Home();
          setRiverDynamic(viewer3D, active);
          break;
        }
        case "trackPlane": {
          back2Home();
          setTrackPlane(viewer3D, active);
          break;
        }
        case "rain": {
          CallBack(
            active,
            () => {
              rain = setRain(viewer3D);
            },
            () => {
              viewer3D?.scene?.postProcessStages.remove(rain.rainStage);
            }
          );
          break;
        }
        case "snow": {
          CallBack(
            active,
            () => {
              snow = setSnow(viewer3D);
            },
            () => {
              viewer3D?.scene?.postProcessStages.remove(snow.snowStage);
              // snow.destroy()
            }
          );
          break;
        }
        case "fog": {
          CallBack(
            active,
            () => {
              fog = setFog(viewer3D);
            },
            () => {
              viewer3D?.scene?.postProcessStages.remove(fog.fogStage);
            }
          );
          break;
        }
        case "direct": {
          destroyOther();
          CallBack(
            active,
            () => {
              direct = setRoutes("direct");
            },
            () => {
              back2Home();
            }
          );
          break;
        }
        case "round": {
          destroyOther();
          CallBack(
            active,
            () => {
              round = setRoutes("round");
            },
            () => {
              back2Home();
            }
          );
          break;
        }
        case "circle": {
          destroyOther();
          CallBack(
            active,
            () => {
              circle = setRoutes("circle");
            },
            () => {
              back2Home();
            }
          );
          break;
        }
      }
    };
    onMounted(() => {
      viewer3D = initCesium();
    });

    return {
      back2Home,
      dialogVisible,
      btnClickHandler,
    };
  },
};
</script>

<style lang="scss" scoped>
#container {
  width: 100vw;
  height: 100vh;
  #cesiumContainer {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
}
</style>
