app="democrm"

docker run -d --rm -p 7072:5000 \
	--name=${app} \
	atlekbai/${app}