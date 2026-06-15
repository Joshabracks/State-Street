const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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
      // ".sst.ts" must come before ".ts" so `import X from "./X.sst"` resolves the
      // State Street component file. Plain ".ts" still matches "*.sst.ts" too.
      extensions: [".sst.ts", ".ts", ".js"],
      alias: {
        // Types come from src/state-street.d.ts; runtime resolves to the locally
        // built framework so the site always dogfoods the current 2.0.0 source.
        "@state-street/state-street": path.resolve(__dirname, "../build/index.js"),
      },
    },
    module: {
      rules: [
        { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
        { test: /\.css$/, use: ["style-loader", "css-loader"] },
        { test: /\.(png|jpe?g|gif|svg|webp|woff2?)$/i, type: "asset/resource" },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
        inject: "body",
        favicon: "./static/state_street_icon_256.png",
      }),
      // Agent-onboarding assets served at the site root: /llms.txt (index) and
      // /llms-full.txt (the full guide, single-sourced from the repo's AGENTS.md).
      new CopyPlugin({
        patterns: [
          { from: "static/llms.txt", to: "llms.txt" },
          { from: path.resolve(__dirname, "../AGENTS.md"), to: "llms-full.txt" },
        ],
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, "static"),
      port: 9100,
      hot: true,
      historyApiFallback: true,
    },
    devtool: isProd ? "source-map" : "eval-source-map",
  };
};
