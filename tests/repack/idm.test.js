import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { organizationFixed, fint } from '../../config.js'
const { url } = fint
import { getExceptionRules } from '../../src/lib/fint-organization-fixed/exception-rules.js'
import { repackFintIdmEnheter, vgsNameChain } from '../../src/lib/fint-organization-fixed/idm.js'
import { validateRawOrganizationUnits } from '../../src/lib/fint-organization-fixed/idm-validation.js'
import { createTestOrgUnit, createAditroUnits, getValidExcepttionRules } from './test-org.js'

const createTestOrg = () => {
  const units = [
    {
      id: 'test-fylkeskommune-1', // Mangler correspondingBottomUnit
      overordnetId: 'test-fylkeskommune-1',
      underordnetIds: ['test-opplaring-11', 'test-tannhelse-12', 'test-organisasjon-13'],
      navn: 'Test Fylkeskommune',
      kortnavn: undefined
    },
    // Underordnet til test-fylkeskommune-1
    {
      id: 'test-opplaring-11',
      overordnetId: 'test-fylkeskommune-1',
      underordnetIds: ['test-opplaring-110', 'test-fellesvgs-111', 'annen-drit-112'],
      navn: 'Opplæring',
      kortnavn: undefined
    },
    {
      id: 'test-tannhelse-12',
      overordnetId: 'test-fylkeskommune-1',
      underordnetIds: ['test-tannhelse-120', 'test-tannklinikk-121'],
      navn: 'Tannhelse',
      kortnavn: undefined
    },
    {
      id: 'test-organisasjon-13',
      overordnetId: 'test-fylkeskommune-1',
      underordnetIds: ['test-organisasjon-130'],
      navn: 'Organisasjon',
      kortnavn: undefined
    },
    // Underordnet til test-opplaring-11
    {
      id: 'test-opplaring-110',
      overordnetId: 'test-opplaring-11',
      underordnetIds: ['test-opplaring-1100'],
      navn: 'Opplærings', // Tuller litt med navnet her - slengt på en s
      kortnavn: undefined
    },
    {
      id: 'test-fellesvgs-111',
      overordnetId: 'test-opplaring-11',
      underordnetIds: ['test-fellesvgs-1111', 'test-fellesvgs-1110'], // Tuller med nextlink her - test-fellesvgs-1110 går til en skole - trengs nextLink regel mot 1111 i stedet
      navn: 'Felles VGS',
      kortnavn: undefined
    },
    {
      id: 'annen-drit-112',
      overordnetId: 'test-opplaring-11',
      underordnetIds: ['annen-drit-1120', 'annen-drit-1121'], // Denne har enhet på bunniva via vanlig regel - men peker til feil. Trengs useAbstractAsUnitOverride for å få riktig
      navn: 'Annen drit',
      kortnavn: undefined
    },
    // Underordnet til test-tannhelse-12
    {
      id: 'test-tannhelse-120',
      overordnetId: 'test-tannhelse-12',
      underordnetIds: ['test-tannhelse-1200'],
      navn: 'Tannhelse',
      kortnavn: undefined
    },
    {
      id: 'test-tannklinikk-121',
      overordnetId: 'test-tannhelse-12',
      underordnetIds: ['test-tannklinikk-1210'],
      navn: 'Tannklinikk 1',
      kortnavn: undefined
    },
    // Underordnet til test-organisasjon-13
    {
      id: 'test-organisasjon-130',
      overordnetId: 'test-organisasjon-13',
      underordnetIds: ['test-organisasjon-1300', 'test-digi-1301', 'test-arkiv-1302'],
      navn: 'Organisasjon',
      kortnavn: undefined
    },
    // Underordnet til test-opplaring-110
    {
      id: 'test-opplaring-1100',
      overordnetId: 'test-opplaring-110',
      navn: 'Opplæring',
      kortnavn: 'OP'
    },
    // Underordnet til test-fellesvgs-111
    {
      id: 'test-fellesvgs-1110',
      overordnetId: 'test-fellesvgs-111',
      navn: 'Tull videregående skole',
      underordnetIds: ['test-fellesvgs-11100', 'test-fellesvgs-11101'],
      kortnavn: undefined
    },
    {
      id: 'test-fellesvgs-1111',
      overordnetId: 'test-fellesvgs-111',
      navn: 'Felles VGS',
      underordnetIds: ['test-fellesvgs-11110'],
      kortnavn: undefined
    },
    // Underordnet til annen-drit-112
    {
      id: 'annen-drit-1120',
      overordnetId: 'annen-drit-112',
      navn: 'Kompetansebyggeren ellerno',
      kortnavn: 'AD-KB'
    },
    {
      id: 'annen-drit-1121',
      overordnetId: 'annen-drit-112',
      navn: 'Lærlingskolen ellerno',
      kortnavn: 'AD-LK'
    },
    // Underordnet til test-tannhelse-120
    {
      id: 'test-tannhelse-1200',
      overordnetId: 'test-tannhelse-120',
      underordnetIds: ['test-tannhelse-12000'],
      navn: 'Tannhelse',
      kortnavn: undefined
    },
    // Underordnet til test-tannklinikk-121
    {
      id: 'test-tannklinikk-1210',
      overordnetId: 'test-tannklinikk-121',
      underordnetIds: ['test-tannklinikk-12100'],
      navn: 'Tannklinikk 1',
      kortnavn: undefined
    },
    // Underordnet til test-organisasjon-130
    {
      id: 'test-organisasjon-1300',
      overordnetId: 'test-organisasjon-130',
      underordnetIds: ['test-organisasjon-13000'],
      navn: 'Organisasjon',
      kortnavn: undefined
    },
    {
      id: 'test-digi-1301',
      overordnetId: 'test-organisasjon-130',
      underordnetIds: ['test-digi-13010', 'test-utvkling-13011'],
      navn: 'Digitalisering',
      kortnavn: undefined
    },
    {
      id: 'test-arkiv-1302',
      overordnetId: 'test-organisasjon-130',
      underordnetIds: ['test-arkiv-13020'],
      navn: 'Arkiv',
      kortnavn: undefined
    },
    // Underordnet til test-fellesvgs-1110
    {
      id: 'test-fellesvgs-11100',
      overordnetId: 'test-fellesvgs-1110',
      navn: 'Tull videregående skole',
      kortnavn: 'OP-TVS'
    },
    {
      id: 'test-fellesvgs-11101',
      overordnetId: 'test-fellesvgs-1110',
      navn: 'Tull videregående skole - renhold',
      kortnavn: 'OP-TVS-REN'
    },
    // Underordnet til test-fellesvgs-1111
    {
      id: 'test-fellesvgs-11110',
      overordnetId: 'test-fellesvgs-1111',
      navn: 'Felles VGS',
      kortnavn: 'OP-FVGS'
    },
    // Underordnet til test-tannhelse-1200
    {
      id: 'test-tannhelse-12000',
      overordnetId: 'test-tannhelse-1200',
      navn: 'Tannhelse',
      kortnavn: 'TH'
    },
    // Underordnet til test-tannklinikk-1210
    {
      id: 'test-tannklinikk-12100',
      overordnetId: 'test-tannklinikk-1210',
      navn: 'Tannklinikk 1',
      kortnavn: 'TH-TK1'
    },
    // Underordnet til test-organisasjon-1300
    {
      id: 'test-organisasjon-13000',
      overordnetId: 'test-organisasjon-1300',
      navn: 'Organisasjon',
      kortnavn: 'ORG'
    },
    // Underordnet til test-digi-1301
    {
      id: 'test-digi-13010',
      overordnetId: 'test-digi-1301',
      navn: 'Digitalisering',
      kortnavn: 'ORG-DIGI'
    },
    {
      id: 'test-utvkling-13011',
      overordnetId: 'test-digi-1301',
      navn: 'Utvikling',
      kortnavn: 'ORG-DIGI-UTV'
    },
    // Underordnet til test-arkiv-1302
    {
      id: 'test-arkiv-13020',
      overordnetId: 'test-arkiv-1302',
      navn: 'Arkiv',
      kortnavn: 'ORG-ARK'
    }
  ]

  const orgUnits = units.map(unit => createTestOrgUnit(unit))
  const aditroUnits = createAditroUnits(units)

  return { units: orgUnits, aditroUnits }
}

// OBS OBS tweak config max and min units settings!!!
organizationFixed.idmMinimumUnits = 0
organizationFixed.idmMaximumUnits = 1000

describe('vgsNameChain', () => {
  it('Returns true when all names in namechain startswith same schoolName and ends with vgs, videregående skole, or vidaregående skule', () => {
    const nameChain = ['Tull vgs', 'Tull videregående skole', 'Tull videregåande skule']
    assert.strictEqual(vgsNameChain(nameChain), true)
  })
  it('Returns false when not all starts with same school name', () => {
    const nameChain = ['Felles VGS', 'Tull videregående skole', 'Tull videregående skole']
    const nameChain2 = ['Felles VGS', 'Tull videregående skole', 'felles vgs']
    const nameChain3 = ['Felles VGS', 'Felles VGS', 'tull vgs']
    assert.strictEqual(vgsNameChain(nameChain), false)
    assert.strictEqual(vgsNameChain(nameChain2), false)
    assert.strictEqual(vgsNameChain(nameChain3), false)
  })
  it('Returns false when not all ends with correct suffx', () => {
    const nameChain = ['Tull vgs', 'Tull videregående skole', 'Tull']
    const nameChain2 = ['Tull vgs', 'Tull videregående skoler']
    const nameChain3 = ['Tull vgs', 'Tullball skole', 'Tull vidaregående skule']
    assert.strictEqual(vgsNameChain(nameChain), false)
    assert.strictEqual(vgsNameChain(nameChain2), false)
    assert.strictEqual(vgsNameChain(nameChain3), false)
  })
  it('Returns true when there are only uppercase differences', () => {
    const nameChain = ['TULL VGS', 'tULL VIdEREGÅENDE SKOLE', 'TULL VIDEReGÅANDE SKULE']
    const nameChain2 = ['tull videregående skole', 'Tull vgs', 'tULL VIDEREGÅaNDE SKuLE']
    assert.strictEqual(vgsNameChain(nameChain), true)
    assert.strictEqual(vgsNameChain(nameChain2), true)
  })
})

describe('createTestOrg', () => {
  it('Works', () => {
    const { units, aditroUnits } = createTestOrg()
    assert.ok(units !== undefined)
    assert.ok(units.length > 0)
    assert.ok(aditroUnits !== undefined)
    assert.ok(aditroUnits.size > 0)
  })
  it('Is valid raw organizations', () => {
    const { units } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    assert.strictEqual(validationResult.valid, true)
  })
})

describe('repackFintIdmEnheter works as expected when', () => {
  it('throws when arguments are missing', () => {
    const units = []
    assert.throws(() => repackFintIdmEnheter(units))
    assert.throws(() => repackFintIdmEnheter([], [], undefined))
  })
  it('test org is repacked, but has validation errors when no exceptions are defined', () => {
    const { units, aditroUnits } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, getExceptionRules())
    const expectedTopUnits = ['test-fylkeskommune-1']
    const topUnitsPresent = expectedTopUnits.every(topUnit => validationResult.tests.topUnits.data.some(unit => unit.organisasjonsId.identifikatorverdi === topUnit))
    assert.strictEqual(validationResult.tests.topUnits.data.length, expectedTopUnits.length)
    assert.strictEqual(topUnitsPresent, true)

    const expectedNoBottomUnits = ['test-fylkeskommune-1']
    const correspondingBottomUnitMissing = expectedNoBottomUnits.every(expectedNoBottomUnit => repackResult.tests.correspondingBottomUnitMissing.data.some(unit => unit.organisasjonsId.identifikatorverdi === expectedNoBottomUnit))
    assert.strictEqual(repackResult.tests.correspondingBottomUnitMissing.data.length, expectedNoBottomUnits.length)
    assert.strictEqual(correspondingBottomUnitMissing, true)

    const expectedDifferentNameChain = ['test-opplaring-11', 'test-fellesvgs-111', 'annen-drit-112']
    const differentNameChain = expectedDifferentNameChain.every(expectedDifferentNameChainUnit => repackResult.tests.correspondingBottomUnitDifferentName.data.some(unit => unit.organisasjonsId.identifikatorverdi === expectedDifferentNameChainUnit))
    assert.strictEqual(repackResult.tests.correspondingBottomUnitDifferentName.data.length, expectedDifferentNameChain.length)
    assert.strictEqual(differentNameChain, true)

    assert.strictEqual(repackResult.valid, false)
  })
})

describe('repackFintIdmEnheter works as expected when', () => {
  it('We add exception rule for overrideNextProbableLink', () => {
    const { aditroUnits, units } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    const exceptionRules = getExceptionRules()
    exceptionRules.overrideNextProbableLink = {
      'test-fellesvgs-111': {
        navn: 'Felles VGS',
        nextLink: {
          href: `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/test-fellesvgs-1111`,
          navn: 'Felles VGS'
        }
      }
    }
    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, exceptionRules)

    const expectedDifferentNameChain = ['test-opplaring-11', 'annen-drit-112']
    const differentNameChain = expectedDifferentNameChain.every(expectedDifferentNameChainUnit => repackResult.tests.correspondingBottomUnitDifferentName.data.some(unit => unit.organisasjonsId.identifikatorverdi === expectedDifferentNameChainUnit))
    assert.strictEqual(repackResult.tests.correspondingBottomUnitDifferentName.data.length, expectedDifferentNameChain.length)
    assert.strictEqual(differentNameChain, true)

    const ruleWasUsed = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'overrideNextProbableLink' && usedRule.data.organisasjonsId === 'test-fellesvgs-111')
    assert.strictEqual(ruleWasUsed, true)

    assert.strictEqual(repackResult.valid, false)
  })
  it('We add exception rule for useAbstractAsUnit', () => {
    const { units, aditroUnits } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    const exceptionRules = getExceptionRules()
    exceptionRules.useAbstractAsUnitOverride = {
      'test-fylkeskommune-1': {
        navn: 'Test Fylkeskommune'
      }
    }
    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, exceptionRules)

    const expectedNoBottomUnits = []
    const correspondingBottomUnitMissing = expectedNoBottomUnits.every(expectedNoBottomUnit => repackResult.tests.correspondingBottomUnitMissing.data.some(unit => unit.organisasjonsId.identifikatorverdi === expectedNoBottomUnit))
    assert.strictEqual(repackResult.tests.correspondingBottomUnitMissing.data.length, expectedNoBottomUnits.length)
    assert.strictEqual(correspondingBottomUnitMissing, true)

    const ruleWasUsed = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'useAbstractAsUnitOverride' && usedRule.data.organisasjonsId === 'test-fylkeskommune-1')
    assert.strictEqual(ruleWasUsed, true)

    assert.strictEqual(repackResult.valid, false)
  })
  it('We add exception rule for nameChainOverride', () => {
    const { units, aditroUnits } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    const exceptionRules = getExceptionRules()
    exceptionRules.nameChainOverride = {
      'test-opplaring-11': {
        navn: 'Opplæring',
        allowedNameChain: ['Opplæring', 'Opplærings', 'Opplæring']
      }
    }
    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, exceptionRules)

    const expectedDifferentNameChain = ['test-fellesvgs-111', 'annen-drit-112']
    const differentNameChain = expectedDifferentNameChain.every(expectedDifferentNameChainUnit => repackResult.tests.correspondingBottomUnitDifferentName.data.some(unit => unit.organisasjonsId.identifikatorverdi === expectedDifferentNameChainUnit))
    assert.strictEqual(repackResult.tests.correspondingBottomUnitDifferentName.data.length, expectedDifferentNameChain.length)
    assert.strictEqual(differentNameChain, true)

    const ruleWasUsed = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'nameChainOverride' && usedRule.data.organisasjonsId === 'test-opplaring-11')
    assert.strictEqual(ruleWasUsed, true)

    assert.strictEqual(repackResult.valid, false)
  })
  it('We add needed exception rules and get valid result', () => {
    const { aditroUnits, units } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    const exceptionRules = getValidExcepttionRules()

    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, exceptionRules)

    assert.strictEqual(repackResult.tests.correspondingBottomUnitMissing.data.length, 0)
    assert.strictEqual(repackResult.tests.correspondingBottomUnitDifferentName.data.length, 0)
    assert.ok(repackResult.tests.missingLeader.data.length > 0)

    assert.strictEqual(repackResult.handledByExceptionRules.length, 4)
    const overrideNextProbableLinkRule = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'overrideNextProbableLink' && usedRule.data.organisasjonsId === 'test-fellesvgs-111')
    const useAbstractAsUnitRule1 = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'useAbstractAsUnitOverride' && usedRule.data.organisasjonsId === 'test-fylkeskommune-1')
    const useAbstractAsUnitRule2 = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'useAbstractAsUnitOverride' && usedRule.data.organisasjonsId === 'annen-drit-112')
    const nameChainOverrideRule = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'nameChainOverride' && usedRule.data.organisasjonsId === 'test-opplaring-11')

    assert.strictEqual(overrideNextProbableLinkRule, true)
    assert.strictEqual(useAbstractAsUnitRule1, true)
    assert.strictEqual(useAbstractAsUnitRule2, true)
    assert.strictEqual(nameChainOverrideRule, true)

    assert.ok(repackResult.resultingUnitsFlat.length > 0)

    const overrideNextLinkResult = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'test-fellesvgs-111')
    assert.strictEqual(overrideNextLinkResult.organisasjonsId.identifikatorverdi, 'test-fellesvgs-11110')

    const abstractUnitResult1 = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'test-fylkeskommune-1')
    assert.strictEqual(abstractUnitResult1.organisasjonsId.identifikatorverdi, 'test-fylkeskommune-1')
    const abstractUnitResult2 = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'annen-drit-112')
    assert.strictEqual(abstractUnitResult2.organisasjonsId.identifikatorverdi, 'annen-drit-112')

    const nameChainOverrideResult = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'test-opplaring-11')
    assert.strictEqual(nameChainOverrideResult.organisasjonsId.identifikatorverdi, 'test-opplaring-1100')

    assert.strictEqual(repackResult.valid, true)
  })
  it('We add extra exception rules and get valid result', () => {
    const { units, aditroUnits } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)
    const exceptionRules = getValidExcepttionRules()
    exceptionRules.absorbChildrenOverrides = {
      'test-opplaring-11': {
        navn: 'Opplæring',
        absorbChildren: [
          {
            href: `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/annen-drit-112`,
            navn: 'Annen drit'
          },
          {
            href: `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/test-fellesvgs-111`,
            navn: 'Felles VGS'
          }
        ]
      }
    }
    exceptionRules.manualLeaders = {
      'test-fylkeskommune-1': {
        navn: 'Opplæring',
        leader: {
          href: `${url}/administrasjon/personal/personalressurs/ansattnummer/1234567`
        }
      }
    }
    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, exceptionRules)

    assert.strictEqual(repackResult.tests.correspondingBottomUnitMissing.data.length, 0)
    assert.strictEqual(repackResult.tests.correspondingBottomUnitDifferentName.data.length, 0)

    assert.strictEqual(repackResult.handledByExceptionRules.length, 6)
    const overrideNextProbableLinkRule = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'overrideNextProbableLink' && usedRule.data.organisasjonsId === 'test-fellesvgs-111')
    const useAbstractAsUnitRule1 = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'useAbstractAsUnitOverride' && usedRule.data.organisasjonsId === 'test-fylkeskommune-1')
    const useAbstractAsUnitRule2 = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'useAbstractAsUnitOverride' && usedRule.data.organisasjonsId === 'annen-drit-112')
    const nameChainOverrideRule = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'nameChainOverride' && usedRule.data.organisasjonsId === 'test-opplaring-11')
    const absorbChildrenOverrideRule = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'absorbChildrenOverrides' && usedRule.data.organisasjonsId === 'test-opplaring-11')
    const manualLeaderRule = repackResult.handledByExceptionRules.some(usedRule => usedRule.rule === 'manualLeaders' && usedRule.data.organisasjonsId === 'test-fylkeskommune-1')

    assert.strictEqual(overrideNextProbableLinkRule, true)
    assert.strictEqual(useAbstractAsUnitRule1, true)
    assert.strictEqual(useAbstractAsUnitRule2, true)
    assert.strictEqual(nameChainOverrideRule, true)
    assert.strictEqual(absorbChildrenOverrideRule, true)
    assert.strictEqual(manualLeaderRule, true)

    assert.ok(repackResult.resultingUnitsFlat.length > 0)

    const abstractUnitResult1 = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'test-fylkeskommune-1')
    assert.strictEqual(abstractUnitResult1.organisasjonsId.identifikatorverdi, 'test-fylkeskommune-1')

    const nameChainOverrideResult = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'test-opplaring-11')
    assert.strictEqual(nameChainOverrideResult.organisasjonsId.identifikatorverdi, 'test-opplaring-1100')

    const absorbChildrenOverrideResult = repackResult.resultingUnitsFlat.find(unit => unit.abstractEnhetOrganisasjonsId === 'test-opplaring-11')
    const inheritedGrandchildren = absorbChildrenOverrideResult._links.underordnet.filter(child => [`${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/annen-drit-1120`, `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/annen-drit-1121`, `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/test-fellesvgs-11100`].includes(child.href))
    assert.strictEqual(inheritedGrandchildren.length, 3)

    const absorbedChildren = repackResult.resultingUnitsFlat.filter(unit => ['annen-drit-112', 'test-fellesvgs-111', 'test-fellesvgs-1111', 'test-fellesvgs-11110'].includes(unit.organisasjonsId.identifikatorverdi) || ['annen-drit-112', 'test-fellesvgs-111', 'test-fellesvgs-1111', 'test-fellesvgs-11110'].includes(unit.abstractEnhetOrganisasjonsId))
    assert.strictEqual(absorbedChildren.length, 0)

    const manualLeaderUnit = repackResult.resultingUnitsFlat.find(unit => unit.organisasjonsId.identifikatorverdi === 'test-fylkeskommune-1')
    assert.strictEqual(manualLeaderUnit._links.leder[0].href, `${url}/administrasjon/personal/personalressurs/ansattnummer/1234567`)

    assert.strictEqual(repackResult.tests.notTriggeredExceptionRules.data.length, 0)
    assert.strictEqual(repackResult.tests.handledMoreThanOneTimeUnits.data.length, 0)
    assert.strictEqual(repackResult.tests.notHandledUnits.data.length, 0)

    assert.strictEqual(repackResult.resultingUnitsFlat.some(unit => typeof unit.organisasjonsType.navn !== 'string' || unit.organisasjonsType.navn.length < 1), false)

    assert.strictEqual(repackResult.valid, true)
  })
  it('We mess with aditro units and get invalid result', () => {
    const { aditroUnits, units } = createTestOrg()
    const validationResult = validateRawOrganizationUnits(units)

    const bottomUnitOrganisasjonsId = 'annen-drit-1120'
    aditroUnits.delete(bottomUnitOrganisasjonsId)

    aditroUnits.set('test-organisasjon-13000', { lonnOrganizationId: 'test-organisasjon-13000', description: 'samma det', projectDimension6Hours: undefined })
    aditroUnits.set('test-fellesvgs-11110', { lonnOrganizationId: 'test-fellesvgs-11110', description: 'samma det', projectDimension6Hours: { id: 'halla holder ikke' } })
    aditroUnits.set('test-digi-13010', { lonnOrganizationId: 'test-digi-13010', description: 'samma det da', projectDimension6Hours: { id: 'prupp', kode: '', beskrivelse: '' } })

    const exceptionRules = getValidExcepttionRules()

    const repackResult = repackFintIdmEnheter(validationResult.tests.topUnits.data, validationResult.validUnits, aditroUnits, exceptionRules)

    console.log(repackResult.tests.missingAditroOrgType.data)

    assert.strictEqual(repackResult.tests.missingAditroUnit.data.length, 1)
    assert.strictEqual(repackResult.tests.missingAditroUnit.data[0].organisasjonsId, bottomUnitOrganisasjonsId)

    assert.strictEqual(repackResult.tests.missingAditroOrgType.data.length, 3)
    assert.strictEqual(repackResult.tests.missingAditroOrgType.data.some(unit => unit.organisasjonsId === 'test-organisasjon-13000'), true)
    assert.strictEqual(repackResult.tests.missingAditroOrgType.data.some(unit => unit.organisasjonsId === 'test-fellesvgs-11110'), true)
    assert.strictEqual(repackResult.tests.missingAditroOrgType.data.some(unit => unit.organisasjonsId === 'test-digi-13010'), true)

    assert.strictEqual(repackResult.valid, false)
  })
})
