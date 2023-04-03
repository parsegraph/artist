DIST_NAME = artist

SCRIPT_FILES = \
	src/paintNodeBounds.ts \
	src/Painted.ts \
	src/index.ts \
	src/paintNodeLines.ts \
	src/Artist.ts \
	src/PaintedNode.ts \
	src/BasicPainted.ts \
	src/Pizza.ts \
	src/demoDom.ts \
	src/glsl.d.ts \
	src/computeInnerPos.ts \
	src/DOMContent.ts \
	src/freezer/FreezerCache.ts \
	src/freezer/Freezable.ts \
	src/freezer/Freezer.ts \
	src/freezer/FrozenNode.ts \
	src/freezer/FrozenNodeFragment.ts \
	src/freezer/FreezerSlot.ts \
	src/freezer/FreezerRow.ts \
	src/freezer/FreezerSlice.ts \
	src/PaintedCaret.ts \
	src/NodeValues.ts \
	src/Label.ts \
	src/DOMPainter.ts \
	src/RenderArtist.ts \
	src/demo.ts \
	src/stringtree.ts \
	test/test.ts

EXTRA_SCRIPTS = \
	src/freezer/Freezer_VertexShader.glsl \
	src/freezer/Freezer_FragmentShader.glsl

include ./Makefile.microproject
