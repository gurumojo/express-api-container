#!/bin/bash -e

echo "Installing yarn ..."
npm install yarn &> /dev/null
yarn
for i in `ls library` ;do
	cd library/$i
	yarn
	cd -
done
echo "Cleaning up ..."
yarn cache clean
rm -rf node_modules/yarn
echo "Node package install complete."
