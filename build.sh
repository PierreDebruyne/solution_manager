mkdir tmp

mkdir tmp/linux
cp apps/linux/* tmp/linux/
cp binaries/solution_manager-linux tmp/linux

rm -rf builds
mkdir builds
zip -j builds/solution_manager-linux.zip tmp/linux/*

rm -rf tmp/
