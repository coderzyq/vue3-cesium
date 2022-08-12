const { defineConfig } = require("@vue/cli-service");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
// let cesiumSource = "./node_modules/cesium";
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./",
  outputDir: "dist", // Output file directory
  lintOnSave: false, // eslint Whether to check when saving
  assetsDir: "static", // To configure js、css The location of the secondary directory of static resources
  devServer: {
    open: true,
    host: "localhost",
    port: 8081
  },
  configureWebpack: {
    output: {
      sourcePrefix: " ",
    },
    amd: {
      //Enanble webpack-friendly use of require in Cesium
      toUrlUndefined: true,
    },
    resolve: {
      alias: {
        "@": path.resolve("src"),
        // cesium: path.resolve(__dirname, cesiumSource),
      },
    },
    plugins: [
      //Copy Cesium Assets, Widgets, and Workers to a static dirctory
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join("./node_modules/cesium/Source", "Workers"),
            to: "Workers",
          },
          {
            from: path.join("./node_modules/cesium/Source", "Assets"),
            to: "Assets",
          },
          {
            from: path.join("./node_modules/cesium/Source", "Widgets"),
            to: "Widgets",
          },
          {
            from: path.join("./node_modules/cesium/Source", "ThirdParty/Workers"),
            to: "ThirdParty/Workers",
          },
        ],
      }),
      new webpack.DefinePlugin({
        //Define relate base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify("./"),
      }),
    ],
  },
});
