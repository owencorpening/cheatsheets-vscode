#!/bin/bash
TARGET=~/.vscode/extensions/cheatsheets
SRC=~/dev/cheatsheets-vscode

echo "Deploying to $TARGET..."
cp $SRC/package.json $TARGET/
cp $SRC/src/extension.js $TARGET/src/
cp $SRC/media/marked.min.js $TARGET/media/
echo "Done. Reload VS Code window to apply changes."
