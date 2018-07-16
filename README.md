# DOJOT Google Cloud Text To Speech

Provides a Docker image that adds a 'text-to-speech' node type to DOJOT dataflow.


## Building

```shell
docker build -t fberanizo/text-to-speech:latest -f Dockerfile .
```

## Adding the node type to DOJOT

```shell
JWT=$(curl -sSL -X POST "http://$(kubectl get service external-kong --namespace dojot --output jsonpath='{.status.loadBalancer.ingress[0].ip}')/auth" -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"passwd\":\"admin\"}"|perl -ne 'if(/"jwt":\s*"(.*?)"/){print"$1"}')

curl -H "Authorization: Bearer ${JWT}" "http://$(kubectl get service external-kong --namespace dojot --output jsonpath='{.status.loadBalancer.ingress[0].ip}')/flows/v1/node" -H "Content-Type: application/json" -d '{"image":"fberanizo/text-to-speech:latest","id":"text-to-speech"}'
```
