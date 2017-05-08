#!/bin/bash -e

echo "Installing yarn ..."
npm install yarn &> /dev/null

echo "Installing dependencies ..."
yarn
for i in `ls library` ;do
	echo "library/$i ..."
	cd library/$i
	yarn
	cd - 1&>/dev/null
done

echo "Cleaning up ..."
yarn cache clean
rm -rf node_modules/yarn

echo "Node package install complete."
