const path = require('path');

module.exports = {
  entry: {
    bundle: "./src/index.tsx", // エントリーポイント
  },
  mode: 'development', // 開発モード
  output: {
    path: path.resolve(__dirname, 'dist'), // 出力先のディレクトリ
    filename: 'bundle.js', // 出力ファイル名
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // 拡張子を省略できるようにする
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts|jsx|js)$/, // 拡張子を1つにまとめる
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
  }
};
