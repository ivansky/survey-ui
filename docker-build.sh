#!/bin/bash
set -e

__START_TIME=$(date +%s)

appName=$1
appVersion=$2
buildImage="$appName-build:latest"
image="$appName:$appVersion"

echo "Clean up"
rm -rf ./.build
rm -rf ./node_modules

echo "Start build for $image..."

echo "Building build-image $buildImage..."
docker build -f ./Dockerfile -t $buildImage .
__BUILD_TIME=$(date +%s)

echo "Running build container..."
docker run -d $buildImage tail -f /src/package.json
buildContainerId=`docker ps | grep $buildImage | awk '{print $1}'`
echo "Container id running $buildContainerId"

echo "Export build from build container..."
docker cp $buildContainerId:/src/.build ./.build
docker cp $buildContainerId:/src/node_modules ./node_modules
__EXPORT_TIME=$(date +%s)

echo "Import build to app container..."
docker build -f ./Dockerfile -t $image .
__IMPORT_TIME=$(date +%s)

docker rm -f $buildContainerId

__END_TIME=$(date +%s)
echo "Build time: $(( $__BUILD_TIME - $__START_TIME ))s"
echo "Export time: $(( $__EXPORT_TIME - $__BUILD_TIME ))s"
echo "Import time: $(( $__END_TIME - $__IMPORT_TIME ))s"
echo "Total time: $(( $__END_TIME - $__START_TIME ))s"

docker push $image
