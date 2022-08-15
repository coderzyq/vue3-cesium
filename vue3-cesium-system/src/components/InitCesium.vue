<template>
  <div id="container">
    <div id="cesiumContainer"></div>
    <panel v-model:visible="dialogVisible" @btnClick="btnClickHandler"></panel>
  </div>
</template>

<script>
import Panel from "@/components/Panel.vue";

import { initCesium } from "@/cesiumUtils/initCesium";
import {
  randomGenerateBillboards,
  destroyBillboard,
} from "@/cesiumUtils/randPoints";
import { addGeoJson, removeGeoJson } from "@/cesiumUtils/geojson";
import { setRain, setSnow, setFog } from "@/cesiumUtils/cesiumEffect";
import { setFlyline, flyLineDestroy } from '@/cesiumUtils/flyLine'

import Roaming from "@/cesiumUtils/satelliteRoaming";
import gerateSatelliteLines from "@/mocks/satellitePath";

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

    const dialogVisible = ref(true);
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
        case "flyline": {
          if (active) {
            back2Home()
            setFlyline(viewer3D);
          } else {
            flyLineDestroy(viewer3D);
          }
          break
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
