<template>
  <div id="container">
    <div id="cesiumContainer"></div>
    <panel v-model:visible="dialogVisible" @btnClick="btnClickHandler"></panel>
  </div>
</template>

<script>
import Panel from "@/components/Panel.vue";

import { initCesium } from "@/cesiumUtils/initCesium"
import {
  randomGenerateBillboards,
  destroyBillboard,
} from "@/cesiumUtils/randPoints";
import Roaming from '@/cesiumUtils/satelliteRoaming'
import gerateSatelliteLines from '@/mocks/satellitePath';

import { ref, onMounted } from "vue";

export default {
  name: "InitCesium",
  components: {
    Panel,
  },
  setup() {
    let sat
    let viewer3D = null;
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
              destroyBillboard()
              back2Home()
            }
          )
          break
        }
        case "sat": {
          CallBack(active, () => {
            back2Home()
            sat = new Roaming(viewer3D, {
              uri: '../../public/models/Satellite.glb',
              Lines: gerateSatelliteLines(0, 0)
            }); 
          }, () => {
            sat?.EndRoaming()
          })
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
