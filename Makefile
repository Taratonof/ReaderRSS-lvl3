link:
	npm link
unlink:
	npm unlink
start:
	npx babel-node src/bin/gendiff.js
publish:
	npm publish --dry-run
lint:
	npx eslint .
build:
	rm -rf dist
	npm run build
test:
	npm run test