const API_URL = 'https://api.openjev.sh'

module.exports = class OpenJev {
  constructor (opts = {}) {
    this.baseUrl = (opts.baseUrl || API_URL).replace(/\/+$/, '')
    this.apiKey = opts.apiKey || (typeof process !== 'undefined' && process.env.OPENJEV_API_KEY)
  }

  async ask (state, questions) {
    if (!state) throw new ErrorJEV('State is required', 'VALIDATION_ERROR')
    if (!questions) throw new ErrorJEV('Questions are required', 'VALIDATION_ERROR')

    return this.request('/v1/systemone', { model: 'openjev', state, questions })
  }

  async bool (state, instructions, criteria) {
    return this.ask(state, {
      answer: { type: 'noul', instructions, criteria }
    })
  }

  async choice (state, instructions, criteria) {
    return this.ask(state, {
      answer: { type: 'choice', instructions, criteria }
    })
  }

  async score (state, instructions, criteria) {
    return this.ask(state, {
      answer: { type: 'score', instructions, criteria }
    })
  }

  async request (pathname, body) {
    let response = null

    try {
      response = await fetch(this.baseUrl + pathname, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    } catch (err) {
      throw new ErrorJEV(err.message, 'API_CONNECTION_ERROR', err)
    }

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (response.ok) {
      return result
    }

    const ERROR_CODES = {
      400: 'BAD_REQUEST_ERROR',
      401: 'AUTHENTICATION_ERROR',
      422: 'UNPROCESSABLE_ENTITY_ERROR',
      503: 'SERVICE_UNAVAILABLE_ERROR'
    }

    let message = 'Request failed with status ' + response.status

    if (result && result.error && result.error.message) {
      message = result.error.message
    } else if (result && result.message) {
      message = result.message
    }

    throw new ErrorJEV(message, ERROR_CODES[response.status] || 'API_ERROR')
  }
}

class ErrorJEV extends Error {
  constructor (message, code, cause) {
    super(code + ': ' + message)

    this.code = code

    if (cause) {
      this.cause = cause
    }
  }

  get name () {
    return 'ErrorJEV'
  }
}
