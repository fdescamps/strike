# Strike Makefile

PREFIX = .
PUBLIC_SRC_DIR = ${PREFIX}/../public/javascripts
PUBLIC_BUILD_DIR = ${PUBLIC_SRC_DIR}/build
SRC_DIR = ${PREFIX}/src
DIST_DIR = ${PREFIX}/dist

CLOSURE_COMPILER = ${PREFIX}/google-compiler-20100917.jar
MINJAR ?= java -jar ${CLOSURE_COMPILER}

# Get the source files
BASE_FILES = ${PUBLIC_SRC_DIR}/Strike.js\
	${PUBLIC_SRC_DIR}/strike-manager.js\
	${PUBLIC_SRC_DIR}/strike-controls.js

LIB_FILES = ${PUBLIC_SRC_DIR}/lib/Base.js\
	${PUBLIC_SRC_DIR}/lib/iscroll.js

# Pad the final file with comments and scope function
MODULES = ${SRC_DIR}/intro.js\
	${LIB_FILES}\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

STRIKE = ${DIST_DIR}/strike.js
STRIKE_MIN = ${DIST_DIR}/strike.min.js
# Copy the comments to the min file.
STRIKE_COMMENT_LINES = 6

STRIKE_VER = $(shell cat ./../version.txt)
VER = sed "s/@VERSION/${STRIKE_VER}/"

COMMIT_DATE= $(shell git log -1 --pretty=format:%ad)

all: strike min
	@@echo "Copying Strike to ${PUBLIC_BUILD_DIR}"
	@@cp ${STRIKE_MIN} ${PUBLIC_BUILD_DIR}
	@@cp ${STRIKE} ${PUBLIC_BUILD_DIR}
	@@echo "Strike build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

strike: ${STRIKE}

${STRIKE}: ${MODULES} ${DIST_DIR}
	@@echo "Building Strike version ${STRIKE_VER}:" ${STRIKE}
	@@cat ${MODULES} | \
		sed 's/Date:./&'"${COMMIT_DATE}"'/' | \
		${VER} > ${STRIKE};

min: ${STRIKE_MIN}

${STRIKE_MIN}: ${STRIKE}
	@@echo "Minifying" ${STRIKE_MIN}

	@@head -${STRIKE_COMMENT_LINES} ${STRIKE} > ${STRIKE_MIN}
	@@${MINJAR} --js ${STRIKE} --warning_level QUIET --js_output_file ${STRIKE_MIN}.tmp
	@@cat ${STRIKE_MIN}.tmp >> ${STRIKE_MIN}
	@@rm -f ${STRIKE_MIN}.tmp

clean:
	@@echo "Removing distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
