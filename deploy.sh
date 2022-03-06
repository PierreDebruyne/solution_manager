##npm run build-binaries

export URL="http://localhost:25565"

export HOST="localhost"
export TYPE="apps"
export RESOURCE="solution_manager-linux"

export FILE_PATH="builds/solution_manager-linux.zip"

node "/home/pierre/Documents/Mega/repos/resource_uploader/src/index.js"

read -p "Press [Enter] key to exit..."