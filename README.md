# openjev

Official JavaScript library for the OpenJEV API

```sh
npm i openjev
```

https://openjev.sh

## Usage

```js
import OpenJev from 'openjev'

const jev = new OpenJev()

const response = await jev.ask('My card was charged twice. Please help ASAP.', {
  urgent: {
    type: 'noul',
    instructions: 'Does this message convey urgency?',
    criteria: {
      true: 'Explicitly time-sensitive',
      false: 'No urgency expressed'
    }
  },
  team: {
    type: 'choice',
    instructions: 'Which team should handle this?',
    criteria: {
      billing: 'Payments and refunds',
      technical: 'Bugs and integrations',
      sales: 'Pricing and new accounts'
    }
  }
})

console.log(response) /* => {
  ...,
  "answers": {
    "urgent": {
      "type": "noul",
      "noul": 0.98
    },
    "team": {
      "type": "choice",
      "choice": "billing",
      "confidence": 1,
      "probabilities": {
        "technical": 0,
        "billing": 1,
        "sales": 0
      }
    }
  },
  ...
} */
```

## API

#### `jev = new OpenJev(options = {})`

Create a client.

```js
{
  apiKey: process.env.OPENJEV_API_KEY, // This is the default and can be omitted
  baseUrl: 'https://api.openjev.sh'
}
```

#### `response = await jev.ask(state, questions)`

Send one state and any number of questions.

- `state`: a string, object, or array.
- `questions`: a map of question ids to `noul`, `choice`, or `score` questions.

#### `response = await jev.bool(state, instructions, criteria)`

Send one `noul` question. The result is returned under `response.answers.answer.noul`.

#### `response = await jev.choice(state, instructions, criteria)`

Send one `choice` question. The result is returned under `response.answers.answer.choice`.

#### `response = await jev.score(state, instructions, criteria)`

Send one `score` question. The result is returned under `response.answers.answer.score`.

#### `response = await jev.request(pathname, body)`

Send a raw request.

```js
const response = await jev.request('/v1/systemone', {
  model: 'openjev',
  state: 'My card was charged twice.',
  questions: {
    urgent: {
      type: 'noul',
      instructions: 'Does this message convey urgency?',
      criteria: {
        true: 'Explicitly time-sensitive',
        false: 'No urgency expressed'
      }
    }
  }
})
```

## Response

Responses include the model, one answer per question, and token usage:

```js
{
  model: 'openjev',
  answers: {
    urgent: {
      type: 'noul',
      noul: 0.26
    }
  },
  usage: {
    input_tokens: 302,
    output_tokens: 20,
    cost: 0.000012684
  }
}
```

Choice and score answers also include the probabilities, confidence, or legend returned by the API.

## Errors

```js
try {
  await jev.ask('My card was charged twice.', {})
} catch (err) {
  console.error(err.code, err.message)
}
```

Request errors use `ErrorJEV` and may include `status`, `body`, and `headers`.

- `API_CONNECTION_ERROR`: the API could not be reached.
- `BAD_REQUEST_ERROR`: HTTP 400.
- `AUTHENTICATION_ERROR`: HTTP 401 or a missing API key.
- `UNPROCESSABLE_ENTITY_ERROR`: HTTP 422.
- `SERVICE_UNAVAILABLE_ERROR`: HTTP 503.

## License

MIT
