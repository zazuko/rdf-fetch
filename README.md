# @zazuko/rdf-fetch

Wrapper for fetch to simplify sending and retrieving RDF data.

> This is a fork of [`@rdfjs/fetch-lite`](https://github.com/rdfjs-base/fetch-lite) which uses native fetch instead of nodeify-fetch.

## Usage

The package exports a `fetch` function which wraps the request and response object for on-the-fly RDF quad processing.
The function accepts the same parameters as [fetch](https://fetch.spec.whatwg.org/) and some additional options. It also provides extra methods.

### Options

The `options` object accepts the following additional parameters:

- `formats`: A [formats-common](https://github.com/rdfjs-base/formats-common)-compatible object which contains a set of parsers and serializers.
  This parameter is required.
- `factory`: If given, the factory will be used to create a Dataset when `dataset()` is called.
  If the parameter is not given, the `dataset()` method will not be attached to the response.
- `fetch`: An alternative fetch implementation.
  By default [nodeify-fetch](https://github.com/bergos/nodeify-fetch) will be used.

The following `options` influence the logic of RDF quad processing: 

- `headers.accept`: The accept header field will be automatically set base on the list of available parsers from the `formats` object.
  If it's already set it will not be overwritten.
  This can be useful when only a subset of the available parsers should be used. 
- `headers.content-type`: When the request has a body, this header field will be automatically set to use matching media type for the corresponding serializer.
  By setting this field manually a specific serializer can be enforced.
- `body`: If the request should send quads, the quads must be given either as a stream or as an iterable.
  Iterables will be converted to streams before they are handed over to the serializer.
- `prefixes`: A map of prefixes that will be handed over to the serializer.

### Response

The following methods are attached to the standard fetch response object:

- async `quadStream()`: This method returns the quads of the response as stream.
  The parser is selected based on the content type header field.
- async `dataset()`: This method uses the `quadStream()` method to parse the content and will pipe it into a dataset, which is also the return value.
  This method is only available when the `factory` option is given.

The `Content-Type` header of the response can be changed or set before calling `quadStream()` or `dataset()`.
That allows enforcing a specific parser or can be used to fix a lacking header.

### Example

This example fetches data from a resource on Wikidata.
The stream API is used to process all quads.
For all `rdfs:label` quads of the defined entity, the object language and value will be written to the console.

### As part of `@zazuko/env-node`

```javascript
import $rdf from '@zazuko/env-node'

const res = await $rdf.fetch('https://www.wikidata.org/wiki/Special:EntityData/Q2.ttl')
const dataset = await res.dataset()

const graph = $rdf.clownface({ dataset })
```

### Standalone

```javascript
import formats from '@rdfjs/formats-common'
import fetch from '@zazuko/rdf-fetch'

const entity = 'http://www.wikidata.org/entity/Q2'
const label = 'http://www.w3.org/2000/01/rdf-schema#label'

const res = await fetch('https://www.wikidata.org/wiki/Special:EntityData/Q2.ttl', { formats })
const quadStream = await res.quadStream()

quadStream.on('error', err => console.error(err))

quadStream.on('data', quad => {
  if (quad.subject.value === entity && quad.predicate.value === label) {
    console.log(`${quad.object.language}: ${quad.object.value}`)
  }
})
```
