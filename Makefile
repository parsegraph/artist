DIST_NAME = artist

SCRIPT_FILES = \
	src/Painted.ts \
	src/index.ts \
	src/paintNodeLines.ts \
	src/Transformed.ts \
	src/Artist.ts \
	src/PaintedNode.ts \
	src/Pizza.ts \
	src/glsl.d.ts \
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
	src/WorldTransform.ts \
	src/demo.ts \
	test/test.ts

EXTRA_SCRIPTS = \
	src/freezer/Freezer_VertexShader.glsl \
	src/freezer/Freezer_FragmentShader.glsl

include ./Makefile.microproject
