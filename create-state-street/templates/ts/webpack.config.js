const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_env, argv) => {
  const isProd = argv.mode === "production";
  return {
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.[contenthash].js",
      clean: true,
    },
    resolve: {
      // ".sst.ts" first so `import { App } from "./App.sst"` resolves the component file.
      extensions: [".sst.ts", ".ts", ".js"],
    },
    module: {
      rules: [
        { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
      ],
    },
    plugins: [new HtmlWebpackPlugin({ template: "./index.html", inject: "body" })],
    devServer: {
      static: __dirname,
      port: 8080,
      hot: true,
    },
    devtool: isProd ? "source-map" : "eval-source-map",
  };
};
