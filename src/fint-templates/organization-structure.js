import { topUnitId } from "../../config.js"

export default () => {
  const base = `
		organisasjonsId {
			identifikatorverdi
		}
		organisasjonsKode {
			identifikatorverdi
		}
		gyldighetsperiode {
			start
			slutt
		}
		navn
		kortnavn
		leder {
			ansattnummer {
				identifikatorverdi
			}
			kontaktinformasjon {
				epostadresse
			}
			person {
				navn {
					fornavn
					mellomnavn
					etternavn
				}
			}
		}
	`
  return {
    query: `
      query {
        organisasjonselement(organisasjonsId: "${topUnitId}") {
					${base}
					underordnet {
						${base}
						underordnet {
							${base}
							underordnet {
								${base}
								underordnet {
									${base}
									underordnet {
										${base}
										underordnet {
											${base}
										}
									}
								}
							}
						}
					}
				}
      }
    `
  }
}
