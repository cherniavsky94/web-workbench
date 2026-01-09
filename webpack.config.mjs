import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin'
import { WebpackPostHtmlPlugin } from './engine/webpack/plugins/posthtml.js'
import { __dirname } from './engine/helpers.js'

export default (env, argv) => {
  const isDevelopment = argv.mode === 'development'

  return {
    mode: argv.mode,

    entry: {
      main: path.resolve(__dirname, 'src/scripts/main.js'),
    },

    output: {
      filename: isDevelopment ? 'assets/js/[name].js' : 'assets/js/[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },

    resolve: {
      extensions: ['.js'],
    },

    devtool: isDevelopment ? 'source-map' : false,

    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: 3000,
      open: true,
      hot: true,
      liveReload: true,
      watchFiles: [
        path.resolve(__dirname, 'src/templates/**/*.html'),
        path.resolve(__dirname, 'src/data/**/*'),
      ],
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          resolve: {
            fullySpecified: false,
          },
        },

        {
          test: /\.scss$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { sourceMap: isDevelopment },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: isDevelopment },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer'],
                },
                sourceMap: isDevelopment,
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new WebpackPostHtmlPlugin({
        pagesDir: path.resolve(__dirname, 'src/templates/pages'),
        templatesDir: path.resolve(__dirname, 'src/templates'),
        dataDir: path.resolve(__dirname, 'src/data'),
      }),

      new MiniCssExtractPlugin({
        filename: isDevelopment ? 'assets/css/[name].css' : 'assets/css/[name].[contenthash].css',
      }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets/img'),
            to: 'assets/img',
          },
          {
            from: path.resolve(__dirname, 'src/assets/fonts'),
            to: 'assets/fonts',
          },
          {
            from: path.resolve(__dirname, 'src/assets/favicon'),
            to: '',
          },
        ],
      }),
    ],

    optimization: {
      minimizer: [
        !isDevelopment &&
          new ImageMinimizerPlugin({
            minimizer: {
              implementation: ImageMinimizerPlugin.sharpMinify,
              options: {
                encodeOptions: {
                  jpeg: {
                    quality: 80,
                  },
                  png: {
                    quality: 80,
                  },
                  webp: {
                    quality: 80,
                  },
                  avif: {
                    quality: 50,
                  },
                },
              },
            },
          }),
      ].filter(Boolean),
    },
  }
}
