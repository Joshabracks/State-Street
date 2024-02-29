const path = require('path')

module.exports = () => {
  return {
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.js',
    },
  };
};

