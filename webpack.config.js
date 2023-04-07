const {webpackConfig, relDir} = require("./webpack.common");

module.exports = {
  entry: {
    block2d: relDir("src/demo/block2d.ts"),
    block3d: relDir("src/demo/block3d.ts"),
    blockdom: relDir("src/demo/blockdom.ts"),
    blockrandom: relDir("src/demo/blockrandom.ts"),
    block: relDir("src/demo/block.ts"),
    carouselGraph: relDir("src/demo/carouselGraph.ts"),
    carousel: relDir("src/demo/carousel.ts"),
    diagonalBlockDemo: relDir("src/demo/diagonalBlockDemo.ts"),
    dom: relDir("src/demo/dom.ts"),
    graphpainter: relDir("src/demo/graphpainter.ts"),
    html: relDir("src/demo/html.ts"),
    interact: relDir("src/demo/interact.ts"),
    logo: relDir("src/demo/logo.ts"),
    stringtree: relDir("src/demo/stringtree.ts"),
    viewportDom: relDir("src/demo/viewportDom.ts"),
    viewport: relDir("src/demo/viewport.ts"),
    weboverlay: relDir("src/demo/weboverlay.ts"),
    index: relDir("src/index.ts"),
    demo: relDir("src/demo.ts"),
  },
  ...webpackConfig(false),
};
