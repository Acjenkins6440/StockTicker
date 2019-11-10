const path = require('path');

module.exports = (env) => {
  return {
    mode: env,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.development.js',
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js']
    },
  };
};
