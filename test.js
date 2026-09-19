const test = require('brittle')
const OpenJev = require('./index.js')

process.loadEnvFile()

test('ask returns an answer', async function (t) {
  const jev = new OpenJev()

  const response = await jev.ask('My card was charged twice. Please help ASAP.', {
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

  t.is(response.model, 'openjev')
  t.is(response.answers.team.type, 'choice')
  t.is(response.answers.team.choice, 'billing')
})

test('bool returns an answer', async function (t) {
  const jev = new OpenJev()

  const response = await jev.bool(
    'My card was charged twice. Please help ASAP.',
    'Does this message convey urgency?',
    {
      true: 'Explicitly time-sensitive',
      false: 'No urgency expressed'
    }
  )

  t.is(response.model, 'openjev')
  t.is(response.answers.answer.type, 'noul')
  t.ok(response.answers.answer.noul >= 0.9)
})

test('choice returns an answer', async function (t) {
  const jev = new OpenJev()

  const response = await jev.choice(
    'My card was charged twice. Please help ASAP.',
    'Which team should handle this?',
    {
      billing: 'Payments and refunds',
      technical: 'Bugs and integrations',
      sales: 'Pricing and new accounts'
    }
  )

  t.is(response.model, 'openjev')
  t.is(response.answers.answer.type, 'choice')
  t.is(response.answers.answer.choice, 'billing')
})

test('score returns an answer', async function (t) {
  const jev = new OpenJev()

  const response = await jev.score(
    'My card was charged twice. Please help ASAP.',
    'How frustrated is this customer?',
    ['Calm', 'Frustrated', 'Very angry']
  )

  t.is(response.model, 'openjev')
  t.is(response.answers.answer.type, 'score')
  t.is(response.answers.answer.legend['0'], 'Calm')
  t.is(response.answers.answer.legend['1'], 'Frustrated')
  t.is(response.answers.answer.legend['2'], 'Very angry')
  t.ok(response.answers.answer.probabilities['0'] <= 0.05)
  t.ok(response.answers.answer.probabilities['1'] >= 0.9)
  t.ok(response.answers.answer.probabilities['2'] <= 0.05)
  t.ok(response.answers.answer.confidence >= 0.9)
})

test('invalid key returns an authentication error', async function (t) {
  const jev = new OpenJev({ apiKey: 'invalid-test-key' })

  try {
    await jev.request('/v1/systemone', {})

    t.fail('request should fail')
  } catch (err) {
    t.is(err.name, 'ErrorJEV')
    t.is(err.code, 'AUTHENTICATION_ERROR')
  }
})
