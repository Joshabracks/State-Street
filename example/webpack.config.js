const path = require('path')
// const webpack = require('webpack');

module.exports = (env) => {
  // const mode = ((env.mode === 'production' || env.mode === 'staging') && 'production') || 'development';
  return {
    mode: 'development',
    entry: './index.js',
    // watch: mode === 'development' ? true : false,
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.js',
    },
    // plugins: [
    //   new webpack.DefinePlugin({
    //     'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL),
    //   })
    // ],
    module: {
      rules: [
      //   {
      //     test: /\.css$/,
      //     use: ['to-string-loader', 'css-loader'],
      //   },
      //   {
      //     test: /\.svg$/,
      //     use: ['to-string-loader', 'svg-inline-loader']
      //   }
      ],
    }
  };
};
