import patchRequest from './lib/patchRequest.js'
import patchResponse from './lib/patchResponse.js'

async function rdfFetch (url, options = {}) {
  const factory = options.factory
  const _fetch = options.fetch || fetch
  const formats = options.formats

  if (!formats) {
    throw new Error('no formats given')
  }

  options = patchRequest(options, formats)

  const res = await _fetch(url, options)

  return patchResponse(res, factory, _fetch, formats.parsers)
}

export {
  rdfFetch as default
}
