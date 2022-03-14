const {webpackConfig, relDir} = require("./webpack.common");

module.exports = {
  entry: {
    index: relDir("src/index.ts"),
    demo: relDir("src/demo.ts"),
    demoDom: relDir("src/demoDom.ts"),
  },
  ...webpackConfig(false),
};
