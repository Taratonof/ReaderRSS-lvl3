link:
	npm link
unlink:
	npm unlink
develop:
	npx webpack-dev-server
start:
	npm start
publish:
	npm publish --dry-run
lint:
	npx eslint .
build:
	rm -rf dist
	NODE_ENV=production npx webpack
test:
	npm run test
