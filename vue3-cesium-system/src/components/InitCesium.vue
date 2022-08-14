<template>
  <div id="container">
    <div id="cesiumContainer"></div>
    <panel v-model:visible="dialogVisible" @btnClick="btnClickHandler"></panel>
  </div>
</template>

<script>
import Panel from "@/components/Panel.vue";

import { initCesium } from "@/cesiumUtils/initCesium.js";

import {
  randomGenerateBillboards,
  destroyBillboard,
} from "@/cesiumUtils/randPoints";

import { ref, onMounted } from "vue";

export default {
  name: "InitCesium",
  components: {
    Panel,
  },
  setup() {
    let viewer3D = null;
    const dialogVisible = ref(true);
    const CallBack = (active, resolve, reject) => {
      if (active) {
        resolve();
      } else {
        reject();
      }
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
            }
          );
        }
      }
    };
    onMounted(() => {
      viewer3D = initCesium();
    });

    return {
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
