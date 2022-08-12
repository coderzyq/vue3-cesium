<template>
  <div id="container">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import * as Cesium from "cesium"
import "cesium/widgets.css"

import { initCesium } from "@/cesiumUtils/initCesium.js"

import { onMounted } from "vue";

export default {
    name: 'HelloCesium',
    props: {},
    setup() {
      let viewer = null
        onMounted(() => {
            viewer = initCesium()
        })
    }
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
