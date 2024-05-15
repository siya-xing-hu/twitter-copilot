const rspack = require("@rspack/core");
const { VueLoaderPlugin } = require("vue-loader");
const isDev = process.env.NODE_ENV == "development";
/** @type {import('@rspack/cli').Configuration} */
const config = {
  context: __dirname,
  entry: {
    // app: {
    //   import: "./src/app.ts",
    // },
    popup: "./src/popup.ts",
    content_script: "./src/content-script.ts",
    service_worker: { import: "./src/service-worker.ts", chunkLoading: "import" }
  },
  // output: {},
  plugins: [
    new VueLoaderPlugin(),
    new rspack.HtmlRspackPlugin({
      filename: "popup.html",
      chunks: ["popup"]
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'manifest.json',
        },
        {
          from: 'src/static',
          to: 'static',
          globOptions: { ignore: ["**/.gitkeep"] }
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          experimentalInlineMatchResource: true
        }
      },
      {
        test: /\.(js|ts)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: false
                }
              },
              env: {
                targets: [
                  "chrome >= 87",
                  "edge >= 88",
                  "firefox >= 78",
                  "safari >= 14"
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(svg|png)$/,
        type: "asset/resource"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: {},
                  autoprefixer: {},
                },
              },
            },
          },
        ],
        type: 'css',
      },
    ]
  }
};
module.exports = config;
