# azf-fint-folk-api
API for getting predifned data from FINT (easier usage - predefined graph-templates)

[FINT informasjonmodell](https://informasjonsmodell.felleskomponent.no/?v=v3.14.10)


# Usage and endpoints

## Optional query params
- *?includeRaw=true* Defaults to false. Can be used on **all endpoints** (if you want to include the raw data from FINT in the response)
- *?skipCache=true* Defaults to false/undefined. Can be used on **all endpoints**. If you want latest data and not from cache. Cache is maximum RESPONSE_CACHE_TTL seconds old (default 1 hour)
- *?includeInactiveEmployees=true* Defaults to false. Can be used on **/organization/{identifikator}/{identifikatorverdi}** (if you want to include inactive "arbeidsforhold" in the response)
- *?includeInactiveUnits=true* Defaults to false. Can be used on **/organization/flat** and **/organization/structure** (if you want to include inactive "organisasjonselement" in the response)
- *?includeStudentSsn=true* Defaults to false. Can be used on **/teacher/{identifikator}/{identifikatorverdi}** (if you want to include "fodselsnummer" on "elever" in the response. Should only be used server-side, when needed)

## /student/{identifikator}/{identifikatorverdi}
Valid "identifikator"-values:
 - **upn** (Will first fetch feidenavn from AzureAD, so is more resource expensive)
 - **feidenavn**
 - **fodselsnummer** (Will first fetch feidenavn from FINT, so is more resource expensive)

### Example calls
```
GET https://{base_url}/student/upn/elev.elevesen@skole.domene.no
```

```
GET https://{base_url}/student/feidenavn/elev.elevesen@domene.no
```

```
GET https://{base_url}/student/fodselsnummer/12345678910
```

### Returns
<details>
  <summary>Click here to view return example</summary>

  ```json
  {
    "feidenavn": "elev.elevesen@domene.no",
    "elevnummer": "12345678",
    "upn": "elev.elevesen@skole.domene.no",
    "navn": "Elev Elevesen",
    "fornavn": "Elev",
    "etternavn": "Elevesen",
    "fodselsnummer": "12345678910",
    "fodselsdato": "2005-07-09T00:00:00Z",
    "alder": 17,
    "kjonn": "1",
    "kontaktEpostadresse": "elev.elevesen@gmail.com",
    "kontaktMobiltelefonnummer": "12345678",
    "privatEpostadresse": "elev.elevesen@gmail.com",
    "privatMobiltelefonnummer": "12345678",
    "bostedsadresse": {
      "adresselinje": "Tower of Sauron 6",
      "postnummer": "6666",
      "poststed": "Mordor"
    },
    "hybeladresse": {
      "adresselinje": null,
      "postnummer": null,
      "poststed": null
    },
    "hovedskole": {
      "navn": "Mordor videregående skole",
      "skolenummer": "123455"
    },
    "kontaktlarere": [
      {
        "feidenavn": "sauron@skole.no",
        "ansattnummer": "1111111",
        "navn": "Sauron Hanson",
        "fornavn": "Sauron",
        "etternavn": "Hanson",
        "kontaktlarer": true,
        "gruppe": "2TMA",
        "skole": {
          "navn": "Mordor videregående skole",
          "skolenummer": "12345",
          "hovedskole": true
        }
      }
    ],
    "elevforhold": [
      {
        "systemId": "9144823",
        "aktiv": true,
        "beskrivelse": null,
        "avbruddsdato": null,
        "gyldighetsperiode": {
          "start": "2022-08-17T00:00:00Z",
          "slutt": "2023-07-31T00:00:00Z",
          "aktiv": true
        },
        "skole": {
          "navn": "Mordor videregående skole",
          "kortnavn": "OF-MRD",
          "skolenummer": "12345",
          "organisasjonsnummer": "12345678",
          "organisasjonsId": "87",
          "hovedskole": true
        },
        "kategori": {
          "kode": "2",
          "navn": "heltid"
        },
        "programomrademedlemskap": [
          {
            "medlemskapgyldighetsperiode": {
              "start": "2023-08-21T00:00:00Z",
              "slutt": "9999-12-31T00:00:00Z",
              "aktiv": true
            },
            "aktiv": true,
            "navn": "Tømrer",
            "systemId": "BATMF2----",
            "grepreferanse": [
              "https://psi.udir.no/kl06/BATMF2----"
            ],
            "utdanningsprogram": [
              {
                "systemId": {
                  "identifikatorverdi": "BA"
                },
                "navn": "Bygg- og anleggsteknikk",
                "grepreferanse": [
                  "https://psi.udir.no/kl06/BA"
                ]
              }
            ]
          }
        ],
        "basisgruppemedlemskap": [
          {
            "medlemskapgyldighetsperiode": {
              "start": "2023-08-21T00:00:00Z",
              "slutt": "9999-12-31T00:00:00Z",
              "aktiv": true
            },
            "navn": "2TMA",
            "systemId": "1476223",
            "aktiv": true, // Om både medlemskap og basisgruppen er aktiv
            "trinn": "VG2",
            "skole": {
              "navn": "Mordor videregående skole",
              "skolenummer": "12345",
              "hovedskole": true
            },
            "termin": [
              {
                "kode": "H1",
                "gyldighetsperiode": {
                  "start": "2022-08-01T00:00:00Z",
                  "slutt": "2023-01-13T00:00:00Z",
                  "aktiv": false
                }
              },
              {
                "kode": "H2",
                "gyldighetsperiode": {
                  "start": "2023-01-14T00:00:00Z",
                  "slutt": "2023-07-31T00:00:00Z",
                  "aktiv": true
                }
              }
            ],
            "skolear": {
              "kode": "20222023",
              "gyldighetsperiode": {
                "start": "2022-08-01T00:00:00Z",
                "slutt": "2023-07-31T00:00:00Z",
                "aktiv": true
              }
            },
            "undervisningsforhold": [
              {
                "feidenavn": "sauron@skole.no",
                "ansattnummer": "1111111",
                "navn": "Sauron Hanson",
                "fornavn": "Sauron",
                "etternavn": "Hanson",
                "kontaktlarer": true
              }
            ]
          }
        ],
        "undervisningsgruppemedlemskap": [
          {
            "medlemskapgyldighetsperiode": {
              "start": "2023-08-21T00:00:00Z",
              "slutt": "9999-12-31T00:00:00Z",
              "aktiv": true
            },
            "navn": "2TMA/KRO1018",
            "systemId": "12029734",
            "aktiv": true, // Om både medlemskap og undervisningsgruppen er aktiv
            "fag": [
              {
                "systemId": {
                  "identifikatorverdi": "KRO1018"
                },
                "navn": "Kroppsøving vg2",
                "grepreferanse": [
                  "https://psi.udir.no/kl06/KRO1018"
                ]
              }
            ],
            "skole": {
              "navn": "Mordor videregående skole",
              "skolenummer": "12345",
              "hovedskole": true
            },
            "termin": [
              {
                "kode": "H1",
                "gyldighetsperiode": {
                  "start": "2022-08-01T00:00:00Z",
                  "slutt": "2023-01-13T00:00:00Z",
                  "aktiv": false
                }
              },
              {
                "kode": "H2",
                "gyldighetsperiode": {
                  "start": "2023-01-14T00:00:00Z",
                  "slutt": "2023-07-31T00:00:00Z",
                  "aktiv": true
                }
              }
            ],
            "skolear": {
              "kode": "20222023",
              "gyldighetsperiode": {
                "start": "2022-08-01T00:00:00Z",
                "slutt": "2023-07-31T00:00:00Z",
                "aktiv": true
              }
            },
            "undervisningsforhold": [
              {
                "feidenavn": "nasgul@skole.no",
                "ansattnummer": "1234566",
                "navn": "Nasgul Gulesen",
                "fornavn": "Nasgul",
                "etternavn": "Gulesen",
                "kontaktlarer": false
              }
            ]
          }
        ],
        "faggruppemedlemskap": [
          {
            "medlemskapgyldighetsperiode": {
              "start": "2023-08-21T00:00:00Z",
              "slutt": "9999-12-31T00:00:00Z",
              "aktiv": true
            },
            "aktiv": true, // Om både medlemskapet er aktivt
            "navn": "B6/REA3036",
            "systemId": "48889",
            "fag": {
              "systemId": {
                "identifikatorverdi": "REA3036"
              },
              "navn": "Biologi 2",
              "grepreferanse": [
                "https://psi.udir.no/kl06/REA3036"
              ]
            }
          },
          {
            "navn": "3STK/NOR1267",
            "systemId": "34451",
            "fag": {
              "systemId": {
                "identifikatorverdi": "NOR1267"
              },
              "navn": "Norsk hovedmål, skriftlig",
              "grepreferanse": [
                "https://psi.udir.no/kl06/NOR1267"
              ]
            }
          }
        ],
        "kontaktlarergruppemedlemskap": [
          {
            "medlemskapgyldighetsperiode": {
              "start": "2023-08-21T00:00:00Z",
              "slutt": "9999-12-31T00:00:00Z",
              "aktiv": true
            },
            "navn": "2TMA",
            "systemId": "1476214_528823",
            "aktiv": true, // Om både medlemskap og kontaktlærergruppen er aktiv
            "skole": {
              "navn": "Mordor videregående skole",
              "skolenummer": "123456",
              "hovedskole": true
            },
            "termin": [
              {
                "kode": "H1",
                "gyldighetsperiode": {
                  "start": "2022-08-01T00:00:00Z",
                  "slutt": "2023-01-13T00:00:00Z",
                  "aktiv": false
                }
              },
              {
                "kode": "H2",
                "gyldighetsperiode": {
                  "start": "2023-01-14T00:00:00Z",
                  "slutt": "2023-07-31T00:00:00Z",
                  "aktiv": true
                }
              }
            ],
            "skolear": {
              "kode": "20222023",
              "gyldighetsperiode": {
                "start": "2022-08-01T00:00:00Z",
                "slutt": "2023-07-31T00:00:00Z",
                "aktiv": true
              }
            },
            "undervisningsforhold": [
              {
                "feidenavn": "sauron@skole.no",
                "ansattnummer": "11111111",
                "navn": "Sauron Hanson",
                "fornavn": "Sauron",
                "etternavn": "Hanson",
                "kontaktlarer": true
              }
            ]
          }
        ]
      }
    ]
  }
  ```
</details>

## /teacher/{identifikator}/{identifikatorverdi}
Valid "identifikator"-values:
 - **upn** (Will first fetch feidenavn from AzureAD, so is more resource expensive)
 - **feidenavn**

### Example calls
```
GET https://{base_url}/teacher/upn/larer.laresen@domene.no
```

```
GET https://{base_url}/teacher/feidenavn/larer.laresen@domene.no
```

### Options
- *?includeStudentSsn=true* Defaults to false. [See query params](#optional-query-params)

### Returns
<details>
  <summary>Click here to view return example</summary>

  ```json
  {
    "feidenavn": "larer.laresen@domene.no",
    "ansattnummer": "12345678",
    "upn": "larer.laresen@domene.no",
    "navn": "Lærer Læresen",
    "fornavn": "Lærer",
    "etternavn": "Læresen",
    "fodselsnummer": "12345678911",
    "fodselsdato": "1978-01-26T00:00:00Z",
    "alder": 45,
    "kjonn": "1",
    "larerEpostadresse": "larer.laresen@domene.no",
    "larerMobiltelefonnummer": null,
    "kontaktEpostadresse": "larer.laresen@domene.no",
    "kontaktMobiltelefonnummer": null,
    "privatEpostadresse": null,
    "privatMobiltelefonnummer": "12345678",
    "bostedsadresse": {
      "adresselinje": "Lærergata 19",
      "postnummer": "1234",
      "poststed": "SKOLESTEDET"
    },
    "azureOfficeLocation": "Mordor vgs",
    "hovedskole": {
      "navn": "Mordor videregående skole",
      "skolenummer": "12345"
    },
    "undervisningsforhold": [
      {
        "systemId": "26017341--1--20230512",
        "beskrivelse": "Lærer -",
        "aktiv": true,
        "arbeidsforhold": {
          "arbeidsforholdstype": {
            "kode": "FA",
            "navn": "Fast ansatt"
          },
          "gyldighetsperiode": {
            "start": "2023-05-01T00:00:00Z",
            "slutt": null,
            "aktiv": true
          },
          "arbeidsforholdsperiode": {
            "start": "2019-08-01T00:00:00Z",
            "slutt": null,
            "aktiv": true
          },
          "ansettelsesprosent": 6000,
          "lonnsprosent": 6000
        },
        "skole": {
          "navn": "Mordor videregående skole",
          "kortnavn": "OF-MRD",
          "skolenummer": "12345",
          "organisasjonsnummer": "974568023",
          "organisasjonsId": "23",
          "hovedskole": true
        },
        "basisgrupper": [
          {
            "navn": "2BU",
            "systemId": "1472079",
            "aktiv": true,
            "trinn": "VG2",
            "skole": {
              "navn": "Mordor videregående skole",
              "skolenummer": "12345",
              "hovedskole": true
            },
            "termin": [
              {
                "kode": "H1",
                "gyldighetsperiode": {
                  "start": "2022-08-01T00:00:00Z",
                  "slutt": "2023-01-13T00:00:00Z",
                  "aktiv": false
                }
              },
              {
                "kode": "H2",
                "gyldighetsperiode": {
                  "start": "2023-01-14T00:00:00Z",
                  "slutt": "2023-07-31T00:00:00Z",
                  "aktiv": true
                }
              }
            ],
            "skolear": {
              "kode": "20222023",
              "gyldighetsperiode": {
                "start": "2022-08-01T00:00:00Z",
                "slutt": "2023-07-31T00:00:00Z",
                "aktiv": true
              }
            },
            "elever": [
              {
                "navn": "Elev Elevesen",
                "fornavn": "Elev",
                "etternavn": "Elevesen",
                "feidenavn": "elev.elevesen@skole.domene.no",
                "elevnummer": "1234567",
                "kontaktlarer": true
              },
              {
                "navn": "Frodo Baggins",
                "fornavn": "Frodo",
                "etternavn": "Baggins",
                "feidenavn": "fro12345@domene.no",
                "elevnummer": "1234568",
                "kontaktlarer": false
              }
            ]
          }
        ],
        "kontaktlarergrupper": [
          {
            "navn": "2BU",
            "systemId": "1472079_461323",
            "aktiv": true,
            "skole": {
              "navn": "Mordor videregående skole",
              "skolenummer": "12345",
              "hovedskole": true
            },
            "termin": [
              {
                "kode": "H1",
                "gyldighetsperiode": {
                  "start": "2022-08-01T00:00:00Z",
                  "slutt": "2023-01-13T00:00:00Z",
                  "aktiv": false
                }
              },
              {
                "kode": "H2",
                "gyldighetsperiode": {
                  "start": "2023-01-14T00:00:00Z",
                  "slutt": "2023-07-31T00:00:00Z",
                  "aktiv": true
                }
              }
            ],
            "skolear": {
              "kode": "20222023",
              "gyldighetsperiode": {
                "start": "2022-08-01T00:00:00Z",
                "slutt": "2023-07-31T00:00:00Z",
                "aktiv": true
              }
            }
          }
        ],
        "undervisningsgrupper": [
          {
            "navn": "2PI/KRO1018",
            "systemId": "12041923",
            "aktiv": true,
            "fag": [
              {
		"systemId": {
		  "KRO1001"
		}
                "navn": "Kroppsøving vg2",
                "grepreferanse": [
                  "https://psi.udir.no/kl06/KRO1018"
                ]
              }
            ],
            "skole": {
              "navn": "Mordor videregående skole",
              "skolenummer": "12345",
              "hovedskole": true
            },
            "termin": [
              {
                "kode": "H1",
                "gyldighetsperiode": {
                  "start": "2022-08-01T00:00:00Z",
                  "slutt": "2023-01-13T00:00:00Z",
                  "aktiv": false
                }
              },
              {
                "kode": "H2",
                "gyldighetsperiode": {
                  "start": "2023-01-14T00:00:00Z",
                  "slutt": "2023-07-31T00:00:00Z",
                  "aktiv": true
                }
              }
            ],
            "skolear": {
              "kode": "20222023",
              "gyldighetsperiode": {
                "start": "2022-08-01T00:00:00Z",
                "slutt": "2023-07-31T00:00:00Z",
                "aktiv": true
              }
            },
            "elever": [
              {
                "navn": "Elev Elevesen",
                "fornavn": "Elev",
                "etternavn": "Elevesen",
                "feidenavn": "elev.elevesen@skole.domene.no",
                "elevnummer": "1234567",
                "kontaktlarer": true
              },
              {
                "navn": "Frodo Baggins",
                "fornavn": "Frodo",
                "etternavn": "Baggins",
                "feidenavn": "fro12345@domene.no",
                "elevnummer": "1234568",
                "kontaktlarer": false
              }
            ]
          }
        ]
      }
    ]
  }
  ```
</details>

## /school/{identifikator}/{identifikatorverdi}
Valid "identifikator"-values:
 - **skolenummer**

### Example calls
```
GET https://{base_url}/school/skolenummer/123456
```

### Returns
<details>
  <summary>Click here to view return example</summary>

  ```json
  {
    "skolenummer": "12345",
    "navn": "Mordor videregående skole",
    "organisasjonsnummer": "123456789",
    "postadresse": {
      "adresselinje": "Saurongata 14",
      "postnummer": "6666",
      "poststed": "Mordor"
    },
    "forretningsadresse": {
      "adresselinje": null,
      "postnummer": null,
      "poststed": null
    },
    "organisasjon": {
      "navn": "Mordor videregående skole",
      "kortnavn": "OPT-MRD",
      "organisasjonsId": "23",
      "organisasjonsKode": "1234",
      "leder": {
        "ansattnummer": "12345678",
        "navn": {
          "fulltnavn": "Sauron Ond",
          "fornavn": "Sauron",
          "etternavn": "Ond"
        }
      }
    },
    "elever": [
      {
        "navn": "Elev Elevesen",
        "fornavn": "Elev",
        "etternavn": "Elevesen",
        "feidenavn": "elev.elevesen@skole.domene.no",
        "elevnummer": "1234567",
        "elevforholdId": "9145581"
      },
      {
        "navn": "Frodo Baggins",
        "fornavn": "Frodo",
        "etternavn": "Baggins",
        "feidenavn": "fro12345@domene.no",
        "elevnummer": "1234568",
        "elevforholdId": "9030845"
      }
    ],
    "basisgrupper": [
      {
        "navn": "2BU",
        "systemId": "1472079",
        "aktiv": true,
        "trinn": "VG2",
        "termin": [
          {
            "kode": "H1",
            "gyldighetsperiode": {
              "start": "2024-08-01T00:00:00Z",
              "slutt": "2025-01-10T00:00:00Z",
              "aktiv": true
            }
          },
          {
            "kode": "H2",
            "gyldighetsperiode": {
              "start": "2025-01-11T00:00:00Z",
              "slutt": "2025-07-31T00:00:00Z",
              "aktiv": false
            }
          }
        ],
        "skolear": {
          "kode": "20242025",
          "gyldighetsperiode": {
            "start": "2024-08-01T00:00:00Z",
            "slutt": "2025-07-31T00:00:00Z",
            "aktiv": true
          }
        },
        "elever": [
          {
            "navn": "Elev Elevesen",
            "fornavn": "Elev",
            "etternavn": "Elevesen",
            "feidenavn": "elev.elevesen@skole.domene.no",
            "elevnummer": "1234567",
            "elevforholdId": "9145581"
          },
          {
            "navn": "Frodo Baggins",
            "fornavn": "Frodo",
            "etternavn": "Baggins",
            "feidenavn": "fro12345@domene.no",
            "elevnummer": "1234568",
            "elevforholdId": "9030845"
          }
        ]
      }
    ]
  }
  ```
</details>


## /employee/{identifikator}/{identifikatorverdi}
upn, ansattnummer, fodselsnummer
Valid "identifikator"-values:
 - **upn** (Will first fetch feidenavn from AzureAD, so is more resource expensive)
 - **ansattnummer**
 - **fodselsnummer** (Will first fetch feidenavn from FINT, so is more resource expensive)

### Example calls
```
GET https://{base_url}/employee/upn/ansatt.fyr@domene.no
```

```
GET https://{base_url}/employee/ansattnummer/12345678
```

```
GET https://{base_url}/employee/fodselsnummer/12345678910
```

### Returns
<details>
  <summary>Click here to view return example</summary>

```json
{
	"ansattnummer": "12345678",
	"upn": "ansatt.fyr@domene.no",
	"aktiv": true,
	"navn": "Ansatt Fyr",
	"fornavn": "Ansatt",
	"etternavn": "Fyr",
	"fodselsnummer": "12345678910",
	"fodselsdato": "1993-01-29T00:00:00Z",
	"alder": 30,
	"kjonn": "1",
	"privatEpostadresse": "ansatt.fyr@gmail.com",
	"privatMobiltelefonnummer": null,
	"brukernavn": "ANS2901",
	"kontaktEpostadresse": "ansatt.fyr@domene.no",
	"kontaktMobiltelefonnummer": "12345678",
	"bostedsadresse": {
		"adresselinje": "Ansattgaten 43",
		"postnummer": "1234",
		"poststed": "GOKK"
	},
	"azureOfficeLocation": "Fylkeshuset i Sumpen",
	"ansiennitet": null,
	"ansettelsesperiode": {
		"start": "2020-05-01T00:00:00Z",
		"slutt": null,
		"aktiv": true
	},
	"arbeidsforhold": [
		{
			"aktiv": false,
			"systemId": "29019323--3--20220521",
			"gyldighetsperiode": {
				"start": "2022-05-01T00:00:00Z",
				"slutt": "2022-11-23T23:59:59Z",
				"aktiv": false
			},
			"arbeidsforholdsperiode": {
				"start": "2021-05-01T00:00:00Z",
				"slutt": null,
				"aktiv": true
			},
			"hovedstilling": true,
			"ansettelsesprosent": 10000,
			"lonnsprosent": 10000,
			"stillingsnummer": "3",
			"stillingstittel": "Rådgiver",
			"stillingskode": {
				"kode": "8530",
				"navn": "Rådgiver"
			},
			"arbeidsforholdstype": {
				"kode": "FA",
				"navn": "Fast ansatt"
			},
			"ansvar": {
				"kode": "123456",
				"navn": "Avdeling for Shrek"
			},
			"funksjon": {
				"kode": "420",
				"navn": "Administrasjon"
			},
      "narmesteLeder": {
        "navn": "Grev Farquaad",
        "fornavn": "Grev",
        "etternavn": "Farquaad",
        "kontaktEpostadresse": "grev.farquaad@domene.no",
        "ansattnummer": "2343455"
      },
			"arbeidssted": {
				"organisasjonsId": "1234",
				"kortnavn": "SHREK-TEK",
				"navn": "Shrek teknologi",
				"organisasjonsKode": "11200-23",
				"leder": {
					"navn": "Grev Farquaad",
          "kontaktEpostadresse": "grev.farquaad@domene.no",
					"ansattnummer": "2343455"
				}
			},
			"strukturlinje": [ // Sorted hierarchy, bottom up
				{
					"kortnavn": "SHREK-TEK",
					"navn": "Shrek teknologi",
					"organisasjonsId": "1234",
					"leder": {
            "fornavn": "Grev",
            "etternavn": "Farquaad",
						"navn": "Grev Farquaad",
            "kontaktEpostadresse": "grev.farquaad@domene.no",
						"ansattnummer": "2343455"
					}
				},
				{
					"kortnavn": "SHREK",
					"navn": "Avdeling for Shrek",
					"organisasjonsId": "1",
					"leder": {
						"navn": "Drømmeprinsen",
            "fornavn": "Drømmeprinsen",
            "etternavn": null,
            "kontaktEpostadresse": "drommeprinsen@domene.no",
						"ansattnummer": "324435445"
					}
				}
			]
		}
	],
	"fullmakter": []
}
```
</details>

## /person/{identifikator}/{identifikatorverdi}
Valid "identifikator"-values:
 - **fodselsnummer**

### Example calls
```
GET https://{base_url}/person/fodselsnummer/12345678910
```

### Returns
<details>
  <summary>Click here to view return example</summary>

```json
{
  "navn": "Shrek Sump",
  "fornavn": "Shrek",
  "etternavn": "Sump",
  "fodselsnummer": "11112345677",
  "fodselsdato": "1993-01-29T00:00:00Z",
  "alder": 30,
  "kjonn": "1",
  "privatEpostadresse": "shrek@swamp.no",
  "privatMobiltelefonnummer": null,
  "bostedsadresse": {
    "adresselinje": "Sumpen 1",
    "postnummer": "1234",
    "poststed": "SUMPSTAD"
  },
  "postadresse": {
    "adresselinje": null,
    "postnummer": null,
    "poststed": null
  },
  "statsborgerskap": [
    {
      "kode": "NO",
      "navn": "Norge"
    }
  ],
  "kommune": {
    "kode": null,
    "navn": null,
    "fylke": {
      "kode": null,
      "navn": null
    }
  },
  "morsmal": {
    "kode": null,
    "navn": null
  },
  "malform": {
    "kode": null,
    "navn": null
  },
  "bilde": null,
  "foreldreansvar": "Kommer forhåpentligvis",
  "parorende": "Kommer forhåpentligvis"
}
```
</details>

## /organization/{identfikator}/{identifikatorverdi}
Valid "identifikator"-values:
 - **organisasjonsId**
 - **organisasjonsKode**

### Example calls
```
GET https://{base_url}/organization/organisasjonsId/1234
```

```
GET https://{base_url}/organization/organisasjonsKode/1950-23
```

### Returns
<details>
  <summary>Click here to view return example</summary>

```json
{
  "aktiv": true,
  "organisasjonsId": "123",
  "organisasjonsKode": "11210-10",
  "navn": "Team Shrek Teknologi",
  "kortnavn": "SHREK-TEK",
  "gyldighetsperiode": {
    "start": "2022-05-01T00:00:00Z",
    "slutt": null,
    "aktiv": true
  },
  "kontaktEpostadresse": null,
  "kontaktMobiltelefonnummer": null,
  "kontaktTelefonnummer": null,
  "kontaktNettsted": null,
  "postadresse": {
    "adresselinje": null,
    "postnummer": null,
    "poststed": null
  },
  "forretningsadresse": {
    "adresselinje": null,
    "postnummer": null,
    "poststed": null
  },
  "organisasjonsnavn": null,
  "organisasjonsnummer": "12345678",
  "leder": {
    "ansattnummer": "123456",
    "navn": "Grev Farquaad",
    "fornavn": "Grev",
    "etternavn": "Farquaad",
    "kontaktEpostadresse": "grev.farquaad@domene.no"
  },
  "ansvar": [],
  "overordnet": {
    "organisasjonsId": "31",
    "organisasjonsKode": "11210",
    "aktiv": true,
    "gyldighetsperiode": {
      "start": "2019-11-01T00:00:00Z",
      "slutt": null,
      "aktiv": true
    },
    "navn": "Avdeling for Shrek",
    "kortnavn": "SHREK"
  },
  "underordnet": [],
  "arbeidsforhold": [
    {
      "aktiv": true,
      "systemId": "24047531--2--20221121",
      "ansattnummer": "24047531",
      "navn": "Grev Farquaad",
      "fornavn": "Grev",
      "etternavn": "Farquaad",
      "gyldighetsperiode": {
        "start": "2022-11-24T00:00:00Z",
        "slutt": "2023-12-31T23:59:59Z",
        "aktiv": true
      },
      "arbeidsforholdsperiode": {
        "start": "2022-05-01T00:00:00Z",
        "slutt": "2023-12-31T23:59:59Z",
        "aktiv": true
      },
      "stillingstittel": "Teamleder",
      "arbeidsforholdstype": {
        "kode": "MB",
        "navn": "Midl. aml§14-9(2) b"
      },
      "ansettelsesperiode": {
        "start": "2012-08-06T00:00:00Z",
        "slutt": null,
        "aktiv": true
      }
    },
    {
      "aktiv": true,
      "systemId": "26107423--2--20230111",
      "ansattnummer": "26104401",
      "navn": "Pepper Kake",
      "fornavn": "Pepper",
      "etternavn": "Kake",
      "gyldighetsperiode": {
        "start": "2023-01-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "arbeidsforholdsperiode": {
        "start": "2023-01-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "stillingstittel": "Rådgiver",
      "arbeidsforholdstype": {
        "kode": "FA",
        "navn": "Fast ansatt"
      },
      "ansettelsesperiode": {
        "start": "2005-06-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      }
    }
  ]
}
```
</details>

## /organization/structure
Get nested structure top down for the entire organization
### Example calls
```
GET https://{base_url}/organization/structure
```

### Returns
<details>
  <summary>Click here to view return example</summary>

```json
{
  "organisasjonsId": "hoved",
  "organisasjonsKode": "selskapId_1",
  "gyldighetsperiode": {
    "start": "2019-01-01T00:00:00Z",
    "slutt": null,
    "aktiv": true
  },
  "navn": "Shrek INC",
  "kortnavn": null,
  "leder": {
    "ansattnummer": null,
    "navn": null,
    "fornavn": null,
    "etternavn": null,
    "kontaktEpostadresse": null
  },
  "underordnet": [
    {
      "organisasjonsId": "6",
      "organisasjonsKode": "11210-10",
      "gyldighetsperiode": {
        "start": "2019-11-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "navn": "Avdeling for Shrek",
      "kortnavn": "SHREK",
      "leder": {
        "ansattnummer": "5056034",
        "navn": "Grev Farquaad",
        "fornavn": "Grev",
        "etternavn": "Farquaad",
        "kontaktEpostadresse": "grev.farquaad@domene.no"
      },
      "underordnet": [
        {
          "organisasjonsId": "19",
          "organisasjonsKode": "11210-10-1",
          "gyldighetsperiode": {
            "start": "2019-11-01T00:00:00Z",
            "slutt": null,
            "aktiv": true
          },
          "navn": "Shrek Teknologi",
          "kortnavn": "SHREK-TEK",
          "leder": {
            "ansattnummer": "17102303",
            "navn": "Kaptein Sabeltann",
            "fornavn": "Kaptein",
            "etternavn": "Sabeltann",
            "kontaktEpostadresse": "kapterin.sabeltann@domene.no"
          }
        },
        {
          "organisasjonsId": "21",
          "gyldighetsperiode": {
            "start": "2019-11-01T00:00:00Z",
            "slutt": null,
            "aktiv": true
          },
          "navn": "Shrek HR",
          "kortnavn": "SHREK-HR",
          "leder": {
            "ansattnummer": "17106423",
            "navn": "Mulle Mekk",
            "fornavn": "Mulle",
            "etternavn": "Mekk",
            "kontaktEpostadresse": "mulle.mekk@domene.no"
          }
        }
      ]
    }
  ]
}
```
</details>

## /organization/flat
Flat list of all org units, sorted by hierarchy. Each element will always have index higher than the parent element. (Overordnet ligger alltid før underordnet i lista)

### Example calls
```
GET https://{base_url}/organization/flat
```

### Returns
<details>
  <summary>Click here to view return example</summary>

```json
[
  {
    "organisasjonsId": "hoved",
    "organisasjonsKode": "selskapId_1",
    "gyldighetsperiode": {
      "start": "2019-01-01T00:00:00Z",
      "slutt": null,
      "aktiv": true
    },
    "navn": "SHREK INC",
    "kortnavn": null,
    "leder": {
      "ansattnummer": null,
      "navn": null,
      "fornavn": null,
      "etternavn": null,
      "kontaktEpostadresse": null
    },
    "overordnet": {
      "aktiv": true,
      "organisasjonsId": "hoved",
      "organisasjonsKode": "selskapId_1",
      "gyldighetsperiode": {
        "start": "2019-01-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "navn": "SHREK INC",
      "kortnavn": null
    },
    "aktiv": true,
    "level": 0
  },
  {
    "overordnet": {
      "aktiv": true,
      "organisasjonsId": "hoved",
      "organisasjonsKode": "selskapId_1",
      "gyldighetsperiode": {
        "start": "2019-11-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "navn": "SHREK INC",
      "kortnavn": null
    },
    "organisasjonsId": "6",
    "organisasjonsKode": "11210-10",
    "gyldighetsperiode": {
      "start": "2019-11-01T00:00:00Z",
      "slutt": null,
      "aktiv": true
    },
    "navn": "Avdeling for Shrek",
    "kortnavn": "SHREK",
    "leder": {
      "ansattnummer": "24434554",
      "navn": "Grev Farquaad",
      "fornavn": "Grev",
      "etternavn": "Farquaad",
      "kontaktEpostadresse": "grev.farquaad@domene.no"
    },
    "aktiv": true,
    "level": 1
  },
  {
    "overordnet": {
      "aktiv": true,
      "organisasjonsId": "6",
      "organisasjonsKode": "11210-10",
      "gyldighetsperiode": {
        "start": "2019-11-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "navn": "Avdeling for Shrek",
      "kortnavn": "SHREK"
    },
    "organisasjonsId": "15",
    "organisasjonsKode": "11210-10-1",
    "gyldighetsperiode": {
      "start": "2019-11-01T00:00:00Z",
      "slutt": null,
      "aktiv": true
    },
    "navn": "Shrek Teknologi",
    "kortnavn": "SHREK-TEK",
    "leder": {
      "ansattnummer": "435454",
      "navn": "Kaptein Sabeltann",
      "fornavn": "Kaptein",
      "etternavn": "Sabeltann",
      "kontaktEpostadresse": "kaptein.sabeltann@domene.no"
    },
    "aktiv": true,
    "level": 2
  },
  {
    "overordnet": {
      "aktiv": true,
      "organisasjonsId": "6",
      "organisasjonsKode": "11210-10",
      "gyldighetsperiode": {
        "start": "2019-11-01T00:00:00Z",
        "slutt": null,
        "aktiv": true
      },
      "navn": "Avdeling for Shrek",
      "kortnavn": "SHREK"
    },
    "organisasjonsId": "16",
    "organisasjonsKode": "11210-10-2",
    "gyldighetsperiode": {
      "start": "2019-11-01T00:00:00Z",
      "slutt": null,
      "aktiv": true
    },
    "navn": "Shrek HR",
    "kortnavn": "SHREK-HR",
    "leder": {
      "ansattnummer": "435254",
      "navn": "Mulle Mekk",
      "fornavn": "Mulle",
      "etternavn": "Mekk",
      "kontaktEpostadresse": "mulle.mekk@domene.no"
    },
    "aktiv": true,
    "level": 2
  }
]
```
</details>

## /organizationfixed/idm
An unfortunate endpoint, due to new HR-structure with abstract levels we do not wan't in certain integrations

### Om endepunket
Tar det på norsk her altså...

Ny struktur har abstrakte nivåer uten arbeidsforhold som ikke gir oss det reelle bildet av organisasjonen. F. eks
- Test fylkeskommune (id: O-FYLKE-0)
  - Organisasjon (abstrakt enhet) (id: O-FYLKE-1)
    - Digitale tjenester (abstrakt enhet) (id: O-FYLKE-11)
      - Digitale tjenester (enda en abstrakt enhet) (id: O-FYLKE-110)
        - Digitale tjenster (faktisk enhet med arbeidsforhold) (id: O-FYLKE-11000)
        - Team utvikling (faktisk enhet, som er underordnet av Digitale Tjenester) (id: O-FYLKE-11001)
        - Team støtte (faktisk enhet, som er underordnet av Digitale Tjenester) (id: O-FYLKE-11002)
    - Organisasjon (abstrakt enhet igjen) (id: O-FYLKE-10)
      - Organisasjon (abstrakt enhet igjen) (id: O-FYLKE-100)
        - Organisasjon (faktisk enhet med arbeidsforhold) (id: O-FYLKE-10000)

Hva endepunktet gjør:
- Slår sammen de abstrakte nivåene av en enhet med den faktiske enheten, og slår sammen ALLE underordnede fra de abstrakte nivåene, slik at den faktiske enheten ender opp med forhåpentligvis korrekte underordnede
- F. eks Organisasjon fra eksempelet over:
  - Starter på Organisasjon O-FYLKE-1, sjekker om den er abstrakt (om det finnes underordnede)
  - While det fortsatt finnes underordnede
    - Finner underordnet enhet med "{currentId}0", eller "{currentId}00", dette er neste nivå som sjekkes underordnet eksisterer med en av id-ene
    - Let etter underordnet fra den underordnede enhet til vi har kommet til bunn
  - Nå har vi funnet tilsvarende enhet på bunnivå (organisasjon O-FYLKE-10000), med arbeidsforhold, og vi har også funnet alle underordnede enheter på vei ned
  - Så gjør vi den samme jobben for alle de underordnede av Organisasjon, og ender opp med (forenklet):

```json
{
  "id": "O-FYLKE-10000",
  "navn": "Organisasjon",
  "traversedAbstract": "O-FYLKE-1 --> O-FYLKE-10 --> O-FYLKE-100 --> O-FYLKE-10000",
  "arbeidsforhold": ["..."],
  "underordnet": [
    {
      "id": "O-FYLKE-11000",
      "navn": "Digitale tjenester",
      "traversedAbstract": "O-FYLKE-11 --> O-FYLKE-110 --> O-FYLKE-11000",
      "arbeidsforhold": ["..."],
      "underordnet": [
        {
          "id": "O-FYLKE-11001",
          "navn": "Team utvikling",
          "traversedAbstract": "O-FYLKE-11001",
          "arbeidsforhold": ["..."]
        },
        {
          "id": "O-FYLKE-11002",
          "navn": "Team støtte",
          "traversedAbstract": "O-FYLKE-11002",
          "arbeidsforhold": ["..."]
        }
      ]
    }
  ]
}
```

### Unntaksregler
Selfølgelig følger ikke alle enheter en fast struktur der vi bare kan følge id med "{currentId}0" eller "{currentId}00" for å finne faktisk enhet på bunnivå. Og det kan trengs andre tilpasninger, det er derfor satt opp [mulighet for unntaksregler](./lib/fint-organization-fixed/exception-rules.js)

#### overrideNextProbableLink
Denner regelen overstyrer hvilken underordnet enhet man går videre til for å finne faktisk enhet på bunnivå. Eksempelvis hvis Organsiasjon (O-FYLKE-10) ikke følger strukture, og neste abstrakte enhet har id O-FYLKE-101, kan vi legge inn regel:
```js
{
  overrideNextProbableLink: {
    'O-FYLKE-10': {
      navn: 'Organisasjon' // MÅ matche navnet på enhet 'O-FYLKE-10' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
      nextLink: {
        href: `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-101`, // Overstyrer neste enhet i abstrakt nivå, slik at vi får riktig bunn/faktisk enhet
        navn: 'Organisasjon' // MÅ matche navnet på enhet 'O-FYLKE-101' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
      }
    }
  }
}
```

#### useAbstractAsUnitOverride
Noen enheter har ingen faktisk tilsvarende enhet på bunnivå - og vil resultere i feil, disse kan overstyres ved å akseptere og bruke den abstrakte enheten som en faktisk enhet ved å legge inn regel:
```js
{
  useAbstractAsUnitOverride: {
    'O-FYLKE-1': {
      navn: 'Test Fylkeskommune' // MÅ matche navnet på enhet 'O-FYLKE-1' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
    }
  }
}
```

#### nameChainOverride
Det sjekkes også at alle abstrakte enheter har samme navn hele veien ned til bunnivå - for å fange opp dersom enheter bytter navn/id og ikke skape krøll. Enheter som ikke har samme navn på alle abstrakte nivåer krever derfor nameChainOverride for å ikke skape feil. Se typisk eksempel nedenfor
```js
{
  nameChainOverride: {
    'O-FYLKE-13': {
      navn: 'Politiske tjenester og økonomi', // MÅ matche navnet på enhet 'O-FYLKE-13' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
      allowedNameChain: ['Politiske tjenester og økonomi', 'Politisk tjenester og økonomi', 'Pol. tjenester og økonomi']
    }
  }
}
```

#### absorbChildrenOverrides
Det kan også være ønskelig å fjerne noen abstrakte enheter fullstendig fra org-strukturen dersom de ikke har noen hensikt for oss. Da har vi en regel for å absorbere en underenhet, slik at parent arver alle underordnede, og underenheten fjernes fra org-strukturen. Se eksempel nedenfor
```js
{
  absorbChildrenOverrides: {
    'O-FYLKE-4': {
      navn: 'Opplæring og tannhelse', // MÅ matche navnet på enhet 'O-FYLKE-4' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
      absorbChildren: [
        {
          href: `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-42`,
          navn: 'Andre virksomheter' // MÅ matche navnet på enhet 'O-FYLKE-42' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
        },
        {
          href: `${url}/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-41`,
          navn: 'VGS Felles' // MÅ matche navnet på enhet 'O-FYLKE-41' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
        }
      ]
    }
  }
}
```

#### manualLeaders
Det kan være ønskelig å legge til en leder på en enhet som f.eks mangler leder, eller har feil, dette kan overstyres av en manualLeader exception-rule. Se eksempel nedenfor
```js
{
  manualLeaders: {
    'O-FYLKE-1': {
      navn: 'Test Fylkeskommune', // MÅ matche navnet på enhet 'O-FYLKE-1' fra rawdata - for å unngå krøll dersom enheter bytter id/navn
      leader: {
        href: `${url}/administrasjon/personal/personalressurs/ansattnummer/123456` // Lederen du ønsker for Test Fylkeskommune
      }
    }
  }
}
```

### Returns
<details>
  <summary>Click here to view return example</summary>

```json
{
	"_embedded": {
		"_entries": [
						{
				"abstractEnhetOrganisasjonsId": "O-FYLKE-18",
				"abstractEnhetNavn": "Kontrollutvalg",
				"abstractTraversedUnits": [
					{
						"organisasjonsId": "O-FYLKE-18",
						"navn": "Kontrollutvalg",
						"href": "https://greier.no/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-18"
					},
					{
						"organisasjonsId": "O-FYLKE-180",
						"navn": "Kontrollutvalg",
						"href": "https://greier.no/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-180"
					},
					{
						"organisasjonsId": "O-FYLKE-1800",
						"navn": "Kontrollutvalg",
						"href": "https://greier.no/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-1800"
					}
				],
				"gyldighetsperiode": {
					"start": "1900-01-01T12:00:00Z"
				},
				"navn": "Kontrollutvalg",
				"organisasjonsId": {
					"identifikatorverdi": "O-FYLKE-1800"
				},
				"organisasjonsKode": {
					"identifikatorverdi": "1800"
				},
				"_links": {
					"ansvar": [
						{
							"href": "https://greier.no/administrasjon/kodeverk/ansvar/systemid/TC-FYLKE-A-1800"
						}
					],
					"leder": [
						{
							"href": "https://greier.no/administrasjon/personal/personalressurs/ansattnummer/12345490"
						}
					],
          "arbeidsforhold": ["..."],
					"overordnet": [
						{
							"href": "https://greier.no/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-170000"
						}
					],
					"self": [
						{
							"href": "https://greier.no/administrasjon/organisasjon/organisasjonselement/organisasjonsid/O-FYLKE-1800"
						},
						{
							"href": "https://greier.no/administrasjon/organisasjon/organisasjonselement/organisasjonskode/1800"
						}
					],
					"underordnet": []
				}
			},
      "..."
    ]
  },
  "total_items": 268,
	"offset": 0,
	"size": 268
}
```
</details>

## /organizationfixed/idm/validate
Kverner data og returnerer en valideringsrapport for om organization/idm sine data fungerer og om exception rules er satt opp korrekt

See [idm-validation.js](./lib/fint-organization-fixed/idm-validation.js) for detaljer

## TIMER TRIGGER IdmTeamsStatus
Bruker resultatet fra idm/validate og sender en overordnet rapport til Teams-kanal-webhook-workflow(er) i process.env.TEAMS_STATUS_ALERT_URLS

## /organizationfixed/structure
Samme som [/organization/structure](#organizationstructure) men bruker orgstrukturen fra [organizationfixed/idm](#organizationfixedidm)

## /organizationfixed/flat
Samme som [/organization/flat](#organizationflat) men bruker orgstrukturen fra [organizationfixed/idm](#organizationfixedidm)

## /organizationfixed/{identifikator}/{identifikatorverdi}
Samme som [/organization//{identifikator}/{identifikatorverdi}](#organizationfixedidentifikatoridentifikatorverdi) men bruker orgstrukturen fra [organizationfixed/idm](#organizationfixedidm)

# Local development
- git clone
- make sure you have installed [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Cwindows%2Ccsharp%2Cportal%2Cbash#v2)
- `cd <to cloned project>`
- `npm i`
- create file *local.settings.json* with values:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FINT_CLIENT_ID": "your fint client id",
    "FINT_CLIENT_SECRET": "your fint client secret",
    "FINT_USERNAME": "your fint client username",
    "FINT_PASSWORD": "your fint client password",
    "FINT_TOKEN_URL": "tokenurl for FINT tokens",
    "FINT_SCOPE": "fint-client",
    "FINT_URL": "url for fint requests (https://api.fintblablaba.no)",
    "GRAPH_SCOPE": "https://graph.microsoft.com/.default",
    "GRAPH_TENANT_ID": "app reg tenant id",
    "GRAPH_CLIENT_SECRET": "app reg client secret",
    "GRAPH_CLIENT_ID": "app reg client id",
    "GRAPH_URL": "https://graph.microsoft.com/v1.0",
    "FEIDENAVN_DOMAIN": "what is the feidenavn domain for your users",
    "EMPLOYEE_NUMBER_EXTENSION_ATTRIBUTE": "in which extension attribute do you store ansattnummer for users",
    "RESPONSE_CACHE_ENABLED": "true/false",
    "RESPONSE_CACHE_TTL": "3600 (seconds to keep responses i cache)",
    "TOP_UNIT_ID": "hoved (id for top organization unit)",
    "TEAMS_STATUS_ALERT_URLS": "teamswebhook.com/workflow" // optional, if you want a status alert for idm-validation
  }
}
```
- `func start`
- Fire away

# Azure function setup
- Must have azure ad authentication enabled
- App reg representing the func must have application permission User.Read.All
- App reg needs to expose App roles as defined by roles in local.settings.json (e.g. "Teacher.Read")
- Reccomended to store environment secrets in key vault. Use managed identity on the function app to access

# Contribute
feel free

