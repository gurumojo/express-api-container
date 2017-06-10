#!/bin/bash -e

echo "Installing yarn ..."
npm install yarn &> /dev/null

echo "Installing dependencies ..."
yarn
for lib in `ls library` ;do
	# isolate name from file extension (if any)
	name=$(echo "$lib" | sed -e 's;\(.*\)\.[a-z]*$;\1;')
	# filter directories from files
	if [ "$name" == "$lib" ] ;then
		echo "library/$name dependencies ..."
		cd "library/$name"
		yarn
		cd - 1&> /dev/null
	else
		echo "library/$name is not a package ... skipped"
	fi
done

echo "Cleaning up ..."
yarn cache clean
rm -rf node_modules/yarn

echo "Node package install complete."
