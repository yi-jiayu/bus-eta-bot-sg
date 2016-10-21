rm -Recurse -Force lib
rm -Recurse -Force out
mkdir lib
npm run build
mkdir out
cp -Recurse lib/* out
cp .env out/.env
cp package.json out/package.json
cd out
npm install --production
