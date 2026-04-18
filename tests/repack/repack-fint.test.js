const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { aktivPeriode, repackPeriode, repackLeder, createStruktur } = require('../../lib/helpers/repack-fint')

describe('aktivPeriode is aktiv when', () => {
  it('Sluttdato is null', () => {
    const periode = {
      start: '2019-08-01T00:00:00Z',
      slutt: null
    }
    assert.strictEqual(aktivPeriode(periode), true)
  })
  it('Sluttdato is false', () => {
    const periode = {
      start: '2019-08-01T00:00:00Z',
      slutt: false
    }
    assert.strictEqual(aktivPeriode(periode), true)
  })
  it('Sluttdato is invalid date', () => {
    const periode = {
      start: '2019-08-01T00:00:00Z',
      slutt: 'trompetsolo'
    }
    assert.strictEqual(aktivPeriode(periode), true)
  })
  it('Sluttdato is not reached', () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const periode = {
      start: '2019-08-01T00:00:00Z',
      slutt: tomorrow.toISOString()
    }
    assert.strictEqual(aktivPeriode(periode), true)
  })
})

describe('aktivPeriode is NOT aktiv when', () => {
  it('Sluttdato is reached', () => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const periode = {
      start: '2019-08-01T00:00:00Z',
      slutt: yesterday.toISOString()
    }
    assert.strictEqual(aktivPeriode(periode), false)
  })
  it('Startdato is not reached yet', () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const periode = {
      start: tomorrow.toISOString(),
      slutt: false
    }
    assert.strictEqual(aktivPeriode(periode), false)
  })
  it('Startdato is invalid date', () => {
    const periode = {
      start: 'tubasolo',
      slutt: 'trompetsolo'
    }
    assert.strictEqual(aktivPeriode(periode), false)
  })
})

describe('repackPeriode works as expected', () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  it('Regular FINT periode has values and is aktiv', () => {
    const periode = {
      beskrivelse: 'Test periode',
      start: '2019-08-01T12:00:00.000Z',
      slutt: '2051-08-31T12:00:00.000Z'
    }
    const repacked = repackPeriode(periode)
    assert.deepStrictEqual(repacked, {
      beskrivelse: 'Test periode',
      start: '2019-08-01T00:00:00.000Z',
      slutt: '2051-08-31T23:59:59.999Z',
      fintStart: '2019-08-01T12:00:00.000Z',
      fintSlutt: '2051-08-31T12:00:00.000Z',
      aktiv: true
    })
  })
  it('Regular FINT periode has values and is not aktiv', () => {
    const periode = {
      beskrivelse: 'Test periode',
      start: '2019-08-01T12:00:00.000Z',
      slutt: '2019-08-31T12:00:00.000Z'
    }
    const repacked = repackPeriode(periode)
    assert.deepStrictEqual(repacked, {
      beskrivelse: 'Test periode',
      start: '2019-08-01T00:00:00.000Z',
      slutt: '2019-08-31T23:59:59.999Z',
      fintStart: '2019-08-01T12:00:00.000Z',
      fintSlutt: '2019-08-31T12:00:00.000Z',
      aktiv: false
    })
  })
  it('Regular FINT periode has values and has funny case where start is today but timstamp not reached yet - should be aktiv', () => {
    const inTenMinutes = new Date(today.getTime() + 10 * 60 * 1000).toISOString()
    const periode = {
      beskrivelse: 'Test periode',
      start: inTenMinutes,
      slutt: '2051-08-31T12:00:00.000Z'
    }
    const repacked = repackPeriode(periode)
    assert.deepStrictEqual(repacked, {
      beskrivelse: 'Test periode',
      start: `${inTenMinutes.substring(0, 11)}00:00:00.000Z`,
      slutt: '2051-08-31T23:59:59.999Z',
      fintStart: inTenMinutes,
      fintSlutt: '2051-08-31T12:00:00.000Z',
      aktiv: true
    })
  })
  it('Regular FINT periode has values and has funny case where end is today and timstamp is reached - should be aktiv', () => {
    const tenMinutesAgo = new Date(today.getTime() - 10 * 60 * 1000).toISOString()
    const periode = {
      beskrivelse: 'Test periode',
      start: '2021-08-31T12:00:00.000Z',
      slutt: tenMinutesAgo
    }
    const repacked = repackPeriode(periode)
    assert.deepStrictEqual(repacked, {
      beskrivelse: 'Test periode',
      start: '2021-08-31T00:00:00.000Z',
      slutt: `${tenMinutesAgo.substring(0, 11)}23:59:59.999Z`,
      fintStart: '2021-08-31T12:00:00.000Z',
      fintSlutt: tenMinutesAgo,
      aktiv: true
    })
  })
  it('No periode... should be aktiv and null values', () => {
    const repacked = repackPeriode(null)
    assert.deepStrictEqual(repacked, {
      beskrivelse: null,
      start: null,
      slutt: null,
      fintStart: null,
      fintSlutt: null,
      aktiv: true
    })
  })
  it('Slutt is null, start is in the past - should be aktiv', () => {
    const periode = {
      beskrivelse: 'Test periode',
      start: '2019-08-01T12:00:00.000Z',
      slutt: null
    }
    const repacked = repackPeriode(periode)
    assert.deepStrictEqual(repacked, {
      beskrivelse: 'Test periode',
      start: '2019-08-01T00:00:00.000Z',
      slutt: null,
      fintStart: '2019-08-01T12:00:00.000Z',
      fintSlutt: null,
      aktiv: true
    })
  })
  it('Start is null, should not be aktiv', () => {
    const periode = {
      beskrivelse: 'Test periode',
      start: null,
      slutt: 'Promp'
    }
    const repacked = repackPeriode(periode)
    assert.deepStrictEqual(repacked, {
      beskrivelse: 'Test periode',
      start: null,
      slutt: null,
      fintStart: null,
      fintSlutt: 'Promp',
      aktiv: false
    })
  })
})

describe('repackLeder work as excpected when', () => {
  it('there is no leder', () => {
    const repackedLeder = repackLeder(null)
    assert.deepStrictEqual(repackedLeder, {
      ansattnummer: null,
      navn: null,
      fornavn: null,
      etternavn: null,
      kontaktEpostadresse: null
    })
  })
  it('there is a leder with some props missing', () => {
    const leder = {
      ansattnummer: {
        identifikatorverdi: '12345'
      },
      person: {
        navn: {
          fornavn: 'Arne',
          etternavn: 'Bjarne'
        }
      }
    }
    const repackedLeder = repackLeder(leder)
    assert.deepStrictEqual(repackedLeder, {
      ansattnummer: '12345',
      navn: 'Arne Bjarne',
      fornavn: 'Arne',
      etternavn: 'Bjarne',
      kontaktEpostadresse: null
    })
  })
  it('there is a leder with all props', () => {
    const leder = {
      ansattnummer: {
        identifikatorverdi: '12345'
      },
      person: {
        navn: {
          fornavn: 'Arne',
          etternavn: 'Bjarne'
        }
      },
      kontaktinformasjon: {
        epostadresse: 'arne.bjarne@fylke.no'
      }
    }
    const repackedLeder = repackLeder(leder)
    assert.deepStrictEqual(repackedLeder, {
      ansattnummer: '12345',
      navn: 'Arne Bjarne',
      fornavn: 'Arne',
      etternavn: 'Bjarne',
      kontaktEpostadresse: 'arne.bjarne@fylke.no'
    })
  })
})

describe('createStruktur works as expected when', () => {
  it('using fixedOrgFlat and graphQlFlat', () => {
    const fixedOrgFlat = [
      {
        organisasjonsId: { identifikatorverdi: '1' },
        navn: 'Fylke',
        _links: {
          overordnet: [{ href: '/organisasjonsid/1' }]
        }
      },
      {
        organisasjonsId: { identifikatorverdi: '2' },
        navn: 'Sektor',
        _links: {
          overordnet: [{ href: '/organisasjonsid/1' }]
        }
      },
      {
        organisasjonsId: { identifikatorverdi: '3' },
        navn: 'Seksjon',
        _links: {
          overordnet: [{ href: '/organisasjonsid/2' }]
        }
      },
      {
        organisasjonsId: { identifikatorverdi: '4' },
        navn: 'Team',
        _links: {
          overordnet: [{ href: '/organisasjonsid/3' }]
        }
      }
    ]
    const graphQlFlat = [
      {
        organisasjonsId: { identifikatorverdi: '1' },
        organisasjonsKode: { identifikatorverdi: '1' },
        navn: 'Fylke',
        kortnavn: null,
        leder: {
          person: { navn: { fornavn: 'Fylkes', etternavn: 'Leder' } },
          kontaktinformasjon: { epostadresse: 'fylkes.leder@fylke.no' },
          ansattnummer: { identifikatorverdi: '12345' }
        }
      },
      {
        organisasjonsId: { identifikatorverdi: '2' },
        organisasjonsKode: { identifikatorverdi: '2' },
        navn: 'Sektor',
        kortnavn: 'F-S',
        leder: {
          person: { navn: { fornavn: 'Sektor', etternavn: 'Leder' } },
          kontaktinformasjon: { epostadresse: 'sektor.leder@fylke.no' },
          ansattnummer: { identifikatorverdi: '12346' }
        }
      },
      {
        organisasjonsId: { identifikatorverdi: '3' },
        organisasjonsKode: { identifikatorverdi: '3' },
        kortnavn: 'F-S-S',
        navn: 'Seksjon',
        leder: null
      },
      {
        organisasjonsId: { identifikatorverdi: '4' },
        organisasjonsKode: { identifikatorverdi: '4' },
        navn: 'Team',
        kortnavn: 'F-S-S-T',
        leder: {
          person: { navn: { fornavn: 'Team', etternavn: 'Leder' } },
          kontaktinformasjon: { epostadresse: 'team.leder@fylke.no' },
          ansattnummer: { identifikatorverdi: '12348' }
        }
      }
    ]
    const shouldBeOk = createStruktur({ organisasjonsId: { identifikatorverdi: '4' } }, fixedOrgFlat, graphQlFlat)
    assert.deepStrictEqual(shouldBeOk, [
      {
        kortnavn: 'F-S-S-T',
        navn: 'Team',
        organisasjonsId: '4',
        organisasjonsKode: '4',
        leder: {
          ansattnummer: '12348',
          navn: 'Team Leder',
          etternavn: 'Leder',
          fornavn: 'Team',
          kontaktEpostadresse: 'team.leder@fylke.no'
        }
      },
      {
        kortnavn: 'F-S-S',
        navn: 'Seksjon',
        organisasjonsId: '3',
        organisasjonsKode: '3',
        leder: {
          ansattnummer: null,
          navn: null,
          etternavn: null,
          fornavn: null,
          kontaktEpostadresse: null
        }
      },
      {
        kortnavn: 'F-S',
        navn: 'Sektor',
        organisasjonsId: '2',
        organisasjonsKode: '2',
        leder: {
          ansattnummer: '12346',
          navn: 'Sektor Leder',
          etternavn: 'Leder',
          fornavn: 'Sektor',
          kontaktEpostadresse: 'sektor.leder@fylke.no'
        }
      },
      {
        kortnavn: null,
        navn: 'Fylke',
        organisasjonsId: '1',
        organisasjonsKode: '1',
        leder: {
          ansattnummer: '12345',
          navn: 'Fylkes Leder',
          etternavn: 'Leder',
          fornavn: 'Fylkes',
          kontaktEpostadresse: 'fylkes.leder@fylke.no'
        }
      }
    ])
    const shouldAlsoBeOk = createStruktur({ organisasjonsId: { identifikatorverdi: '2' } }, fixedOrgFlat, graphQlFlat)
    assert.strictEqual(shouldAlsoBeOk.length, 2)
    assert.strictEqual(shouldAlsoBeOk[0].navn, 'Sektor')
    const shouldAlsoAlsoBeOk = createStruktur({ organisasjonsId: { identifikatorverdi: '1' } }, fixedOrgFlat, graphQlFlat)
    assert.strictEqual(shouldAlsoAlsoBeOk.length, 1)
    assert.strictEqual(shouldAlsoAlsoBeOk[0].navn, 'Fylke')
    const shouldReturnEmptyArray = createStruktur({ organisasjonsId: { identifikatorverdi: '5' } }, fixedOrgFlat, graphQlFlat)
    assert.deepStrictEqual(shouldReturnEmptyArray, [])
  })
})
