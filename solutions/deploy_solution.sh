#npm run build-binaries

zip -j builds/official_solution.zip official_solution.json

export URL="http://localhost:25565"

export HOST="localhost"
export TYPE="solutions"

export RESOURCE="official_solution"

export FILE_PATH="builds/official_solution.zip"

node "/home/pierre/Documents/Mega/repos/resource_uploader/src/index.js"

read -p "Press [Enter] key to exit..."