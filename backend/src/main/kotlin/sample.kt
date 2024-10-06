/*
 * ONI Seed Browser Backend
 * Copyright (C) 2024 Stefan Oltmann
 * https://stefan-oltmann.de
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

val sampleWorldJson = """
    {
          "coordinate": "SNDST-C-800782353-0-0-0",
          "cluster": "SNDST-C",
          "dlcs": [
            "FrostyPlanet",
            "SpacedOut"
          ],
          "asteroids": [
            {
              "id": "TerraMoonlet",
              "offsetX": 0,
              "offsetY": 0,
              "sizeX": 160,
              "sizeY": 274,
              "worldTraits": [],
              "pointsOfInterest": [
                {
                  "id": "Headquarters",
                  "posX": 85,
                  "posY": 115
                },
                {
                  "id": "WarpConduitReceiver",
                  "posX": 119,
                  "posY": 99
                },
                {
                  "id": "WarpConduitSender",
                  "posX": 40,
                  "posY": 77
                },
                {
                  "id": "WarpPortal",
                  "posX": 106,
                  "posY": 163
                },
                {
                  "id": "WarpReceiver",
                  "posX": 107,
                  "posY": 157
                }
              ],
              "geysers": [
                {
                  "emitRate": 5730.30664,
                  "idleTime": 335.652161,
                  "eruptionTime": 267.509155,
                  "dormancyCycles": 47.57262,
                  "activeCycles": 72.9005051,
                  "id": "steam",
                  "posX": 131,
                  "posY": 61
                },
                {
                  "emitRate": 5610.22852,
                  "idleTime": 435.2997,
                  "eruptionTime": 409.334259,
                  "dormancyCycles": 40.9644127,
                  "activeCycles": 76.2679,
                  "id": "slush_salt_water",
                  "posX": 80,
                  "posY": 168
                },
                {
                  "emitRate": 5564.505,
                  "idleTime": 350.7011,
                  "eruptionTime": 315.5453,
                  "dormancyCycles": 55.3622665,
                  "activeCycles": 110.48143,
                  "id": "slush_water",
                  "posX": 139,
                  "posY": 149
                },
                {
                  "emitRate": 348.255371,
                  "idleTime": 268.904449,
                  "eruptionTime": 269.776031,
                  "dormancyCycles": 47.74834,
                  "activeCycles": 82.49559,
                  "id": "methane",
                  "posX": 104,
                  "posY": 84
                },
                {
                  "emitRate": 155172.813,
                  "idleTime": 8992.125,
                  "eruptionTime": 60.05321,
                  "dormancyCycles": 41.721386,
                  "activeCycles": 56.678894,
                  "id": "small_volcano",
                  "posX": 34,
                  "posY": 49
                },
                {
                  "emitRate": 104084.188,
                  "idleTime": 8541.996,
                  "eruptionTime": 75.99681,
                  "dormancyCycles": 40.137516,
                  "activeCycles": 61.7788353,
                  "id": "small_volcano",
                  "posX": 83,
                  "posY": 47
                },
                {
                  "emitRate": 137712.766,
                  "idleTime": 9195.643,
                  "eruptionTime": 77.75638,
                  "dormancyCycles": 36.8322525,
                  "activeCycles": 60.1309242,
                  "id": "small_volcano",
                  "posX": 63,
                  "posY": 34
                },
                {
                  "emitRate": 474.628326,
                  "idleTime": 285.599762,
                  "eruptionTime": 171.383423,
                  "dormancyCycles": 50.5250473,
                  "activeCycles": 91.1961,
                  "id": "hot_hydrogen",
                  "posX": 76,
                  "posY": 183
                },
                {
                  "emitRate": 1163.9989,
                  "idleTime": 539.1427,
                  "eruptionTime": 89.80678,
                  "dormancyCycles": 54.6634254,
                  "activeCycles": 81.406395,
                  "id": "hot_hydrogen",
                  "posX": 25,
                  "posY": 65
                },
                {
                  "emitRate": 214228.25,
                  "idleTime": 9197.481,
                  "eruptionTime": 64.19695,
                  "dormancyCycles": 66.10125,
                  "activeCycles": 81.02145,
                  "id": "big_volcano",
                  "posX": 18,
                  "posY": 171
                }
              ]
            },
            {
              "id": "IdealLandingSite",
              "offsetX": 244,
              "offsetY": 0,
              "sizeX": 128,
              "sizeY": 153,
              "worldTraits": [
                "BouldersMixed",
                "BouldersSmall"
              ],
              "pointsOfInterest": [],
              "geysers": [
                {
                  "emitRate": 8842.708,
                  "idleTime": 357.45932,
                  "eruptionTime": 355.40683,
                  "dormancyCycles": 46.8560028,
                  "activeCycles": 81.31434,
                  "id": "salt_water",
                  "posX": 322,
                  "posY": 72
                },
                {
                  "emitRate": 374.6345,
                  "idleTime": 258.112274,
                  "eruptionTime": 384.807526,
                  "dormancyCycles": 35.3464,
                  "activeCycles": 45.8901253,
                  "id": "liquid_co2",
                  "posX": 358,
                  "posY": 15
                },
                {
                  "emitRate": 476.175232,
                  "idleTime": 310.497559,
                  "eruptionTime": 310.106262,
                  "dormancyCycles": 56.7191,
                  "activeCycles": 72.4839859,
                  "id": "liquid_co2",
                  "posX": 268,
                  "posY": 23
                },
                {
                  "emitRate": 7997.88135,
                  "idleTime": 694.113342,
                  "eruptionTime": 39.45594,
                  "dormancyCycles": 40.5027847,
                  "activeCycles": 100.917252,
                  "id": "molten_aluminum",
                  "posX": 297,
                  "posY": 51
                },
                {
                  "emitRate": 6039.78027,
                  "idleTime": 749.957764,
                  "eruptionTime": 51.3985977,
                  "dormancyCycles": 43.4394951,
                  "activeCycles": 95.12373,
                  "id": "molten_gold",
                  "posX": 359,
                  "posY": 31
                },
                {
                  "emitRate": 11318.3076,
                  "idleTime": 557.6114,
                  "eruptionTime": 30.8986816,
                  "dormancyCycles": 55.60663,
                  "activeCycles": 52.65892,
                  "id": "molten_gold",
                  "posX": 337,
                  "posY": 51
                },
                {
                  "emitRate": 6152.31836,
                  "idleTime": 744.762,
                  "eruptionTime": 61.59952,
                  "dormancyCycles": 46.98588,
                  "activeCycles": 73.80041,
                  "id": "molten_aluminum",
                  "posX": 280,
                  "posY": 76
                },
                {
                  "emitRate": 340.782837,
                  "idleTime": 239.791122,
                  "eruptionTime": 257.140961,
                  "dormancyCycles": 61.0039444,
                  "activeCycles": 71.1795959,
                  "id": "hot_po2",
                  "posX": 280,
                  "posY": 44
                },
                {
                  "emitRate": 154238.547,
                  "idleTime": 9230.651,
                  "eruptionTime": 58.4679375,
                  "dormancyCycles": 48.3519363,
                  "activeCycles": 100.466515,
                  "id": "small_volcano",
                  "posX": 301,
                  "posY": 38
                },
                {
                  "emitRate": 8278.502,
                  "idleTime": 726.7366,
                  "eruptionTime": 40.94889,
                  "dormancyCycles": 39.7135429,
                  "activeCycles": 113.756325,
                  "id": "molten_copper",
                  "posX": 356,
                  "posY": 105
                }
              ]
            },
            {
              "id": "WarpOilySwamp",
              "offsetX": 374,
              "offsetY": 0,
              "sizeX": 128,
              "sizeY": 153,
              "worldTraits": [
                "MetalPoor"
              ],
              "pointsOfInterest": [
                {
                  "id": "MassiveHeatSink",
                  "posX": 487,
                  "posY": 94
                },
                {
                  "id": "WarpConduitSender",
                  "posX": 453,
                  "posY": 92
                },
                {
                  "id": "WarpConduitReceiver",
                  "posX": 434,
                  "posY": 52
                },
                {
                  "id": "WarpReceiver",
                  "posX": 439,
                  "posY": 82
                },
                {
                  "id": "WarpPortal",
                  "posX": 417,
                  "posY": 82
                },
                {
                  "id": "GeneShuffler",
                  "posX": 407,
                  "posY": 65
                }
              ],
              "geysers": [
                {
                  "emitRate": 4313.582,
                  "idleTime": 304.609833,
                  "eruptionTime": 369.6119,
                  "dormancyCycles": 69.76982,
                  "activeCycles": 102.674057,
                  "id": "liquid_sulfur",
                  "posX": 475,
                  "posY": 38
                },
                {
                  "emitRate": 3333.33,
                  "idleTime": 0,
                  "eruptionTime": 1,
                  "dormancyCycles": 0,
                  "activeCycles": 1,
                  "id": "OilWell",
                  "posX": 448,
                  "posY": 23
                },
                {
                  "emitRate": 3333.33,
                  "idleTime": 0,
                  "eruptionTime": 1,
                  "dormancyCycles": 0,
                  "activeCycles": 1,
                  "id": "OilWell",
                  "posX": 477,
                  "posY": 25
                },
                {
                  "emitRate": 3333.33,
                  "idleTime": 0,
                  "eruptionTime": 1,
                  "dormancyCycles": 0,
                  "activeCycles": 1,
                  "id": "OilWell",
                  "posX": 463,
                  "posY": 22
                },
                {
                  "emitRate": 3333.33,
                  "idleTime": 0,
                  "eruptionTime": 1,
                  "dormancyCycles": 0,
                  "activeCycles": 1,
                  "id": "OilWell",
                  "posX": 491,
                  "posY": 22
                },
                {
                  "emitRate": 3333.33,
                  "idleTime": 0,
                  "eruptionTime": 1,
                  "dormancyCycles": 0,
                  "activeCycles": 1,
                  "id": "OilWell",
                  "posX": 391,
                  "posY": 25
                },
                {
                  "emitRate": 290.7918,
                  "idleTime": 236.190247,
                  "eruptionTime": 277.799438,
                  "dormancyCycles": 46.24978,
                  "activeCycles": 69.64249,
                  "id": "hot_co2",
                  "posX": 424,
                  "posY": 16
                },
                {
                  "emitRate": 5097.579,
                  "idleTime": 410.874847,
                  "eruptionTime": 349.7078,
                  "dormancyCycles": 36.7617531,
                  "activeCycles": 83.54114,
                  "id": "liquid_sulfur",
                  "posX": 473,
                  "posY": 61
                },
                {
                  "emitRate": 121511.023,
                  "idleTime": 8209.771,
                  "eruptionTime": 60.6881332,
                  "dormancyCycles": 60.03907,
                  "activeCycles": 83.8303452,
                  "id": "small_volcano",
                  "posX": 385,
                  "posY": 99
                }
              ]
            },
            {
              "id": "TundraMoonlet",
              "offsetX": 162,
              "offsetY": 176,
              "sizeX": 64,
              "sizeY": 128,
              "worldTraits": [
                "LushCore",
                "DistressSignal"
              ],
              "pointsOfInterest": [],
              "geysers": [
                {
                  "emitRate": 8814.981,
                  "idleTime": 842.4836,
                  "eruptionTime": 52.57859,
                  "dormancyCycles": 40.4765663,
                  "activeCycles": 68.77276,
                  "id": "molten_iron",
                  "posX": 174,
                  "posY": 200
                },
                {
                  "emitRate": 11258.2666,
                  "idleTime": 655.4837,
                  "eruptionTime": 28.8375149,
                  "dormancyCycles": 45.095192,
                  "activeCycles": 62.1589,
                  "id": "molten_iron",
                  "posX": 203,
                  "posY": 199
                },
                {
                  "emitRate": 6823.41943,
                  "idleTime": 645.459351,
                  "eruptionTime": 59.479538,
                  "dormancyCycles": 57.0480537,
                  "activeCycles": 86.09007,
                  "id": "molten_iron",
                  "posX": 180,
                  "posY": 229
                },
                {
                  "emitRate": 8076.829,
                  "idleTime": 777.6268,
                  "eruptionTime": 50.6777763,
                  "dormancyCycles": 30.3227482,
                  "activeCycles": 47.5203323,
                  "id": "molten_iron",
                  "posX": 183,
                  "posY": 204
                }
              ]
            },
            {
              "id": "MarshyMoonlet",
              "offsetX": 228,
              "offsetY": 176,
              "sizeX": 64,
              "sizeY": 96,
              "worldTraits": [],
              "pointsOfInterest": [
                {
                  "id": "SapTree",
                  "posX": 267,
                  "posY": 226
                }
              ],
              "geysers": [
                {
                  "emitRate": 17942.4316,
                  "idleTime": 789.433838,
                  "eruptionTime": 24.8974552,
                  "dormancyCycles": 30.51959,
                  "activeCycles": 71.13475,
                  "id": "molten_tungsten",
                  "posX": 268,
                  "posY": 204
                },
                {
                  "emitRate": 7074.23,
                  "idleTime": 686.2494,
                  "eruptionTime": 48.8770523,
                  "dormancyCycles": 49.332428,
                  "activeCycles": 92.78291,
                  "id": "molten_tungsten",
                  "posX": 238,
                  "posY": 185
                },
                {
                  "emitRate": 7968.897,
                  "idleTime": 650.775757,
                  "eruptionTime": 45.78785,
                  "dormancyCycles": 15.7060528,
                  "activeCycles": 30.5438862,
                  "id": "molten_tungsten",
                  "posX": 262,
                  "posY": 181
                },
                {
                  "emitRate": 341.878754,
                  "idleTime": 316.61203,
                  "eruptionTime": 261.221832,
                  "dormancyCycles": 39.7135429,
                  "activeCycles": 113.756325,
                  "id": "hot_hydrogen",
                  "posX": 239,
                  "posY": 222
                },
                {
                  "emitRate": 454.769775,
                  "idleTime": 447.2085,
                  "eruptionTime": 282.137634,
                  "dormancyCycles": 48.38964,
                  "activeCycles": 62.47309,
                  "id": "hot_co2",
                  "posX": 251,
                  "posY": 184
                }
              ]
            },
            {
              "id": "MooMoonlet",
              "offsetX": 504,
              "offsetY": 0,
              "sizeX": 96,
              "sizeY": 80,
              "worldTraits": [],
              "pointsOfInterest": [],
              "geysers": [
                {
                  "emitRate": 437.554,
                  "idleTime": 351.025879,
                  "eruptionTime": 231.4467,
                  "dormancyCycles": 57.6215935,
                  "activeCycles": 98.04666,
                  "id": "chlorine_gas",
                  "posX": 588,
                  "posY": 23
                }
              ]
            },
            {
              "id": "WaterMoonlet",
              "offsetX": 162,
              "offsetY": 0,
              "sizeX": 80,
              "sizeY": 174,
              "worldTraits": [],
              "pointsOfInterest": [],
              "geysers": [
                {
                  "emitRate": 4613.907,
                  "idleTime": 292.87326,
                  "eruptionTime": 332.056122,
                  "dormancyCycles": 66.13168,
                  "activeCycles": 102.590347,
                  "id": "slush_water",
                  "posX": 190,
                  "posY": 84
                },
                {
                  "emitRate": 14130.9453,
                  "idleTime": 461.999084,
                  "eruptionTime": 216.909225,
                  "dormancyCycles": 56.8054543,
                  "activeCycles": 80.22411,
                  "id": "salt_water",
                  "posX": 213,
                  "posY": 116
                }
              ]
            },
            {
              "id": "NiobiumMoonlet",
              "offsetX": 294,
              "offsetY": 155,
              "sizeX": 64,
              "sizeY": 96,
              "worldTraits": [
                "LushCore"
              ],
              "pointsOfInterest": [],
              "geysers": [
                {
                  "emitRate": 249859.7,
                  "idleTime": 8706.993,
                  "eruptionTime": 72.3710251,
                  "dormancyCycles": 43.20163,
                  "activeCycles": 72.4345,
                  "id": "molten_niobium",
                  "posX": 348,
                  "posY": 181
                }
              ]
            },
            {
              "id": "RegolithMoonlet",
              "offsetX": 360,
              "offsetY": 155,
              "sizeX": 160,
              "sizeY": 96,
              "worldTraits": [],
              "pointsOfInterest": [
                {
                  "id": "GeneShuffler",
                  "posX": 432,
                  "posY": 192
                }
              ],
              "geysers": [
                {
                  "emitRate": 3125.342,
                  "idleTime": 183.824326,
                  "eruptionTime": 114.913704,
                  "dormancyCycles": 39.811264,
                  "activeCycles": 69.81801,
                  "id": "hot_steam",
                  "posX": 371,
                  "posY": 167
                },
                {
                  "emitRate": 5018.763,
                  "idleTime": 470.875732,
                  "eruptionTime": 273.480957,
                  "dormancyCycles": 59.14207,
                  "activeCycles": 78.86677,
                  "id": "steam",
                  "posX": 399,
                  "posY": 169
                }
              ]
            }
          ],
          "starMapEntriesVanilla": null,
          "starMapEntriesSpacedOut": [
            {
              "id": "TerraMoonlet",
              "q": 0,
              "r": 0
            },
            {
              "id": "IdealLandingSite",
              "q": 1,
              "r": -3
            },
            {
              "id": "WarpOilySwamp",
              "q": -1,
              "r": 5
            },
            {
              "id": "TundraMoonlet",
              "q": 8,
              "r": -2
            },
            {
              "id": "MarshyMoonlet",
              "q": -6,
              "r": 2
            },
            {
              "id": "MooMoonlet",
              "q": -2,
              "r": -5
            },
            {
              "id": "WaterMoonlet",
              "q": -7,
              "r": 8
            },
            {
              "id": "NiobiumMoonlet",
              "q": -9,
              "r": -1
            },
            {
              "id": "RegolithMoonlet",
              "q": 8,
              "r": -9
            },
            {
              "id": "TemporalTear",
              "q": -5,
              "r": -6
            },
            {
              "id": "HarvestableSpacePOI_SandyOreField",
              "q": -3,
              "r": 1
            },
            {
              "id": "HarvestableSpacePOI_OrganicMassField",
              "q": 5,
              "r": -2
            },
            {
              "id": "HarvestableSpacePOI_GildedAsteroidField",
              "q": 1,
              "r": -8
            },
            {
              "id": "HarvestableSpacePOI_HeliumCloud",
              "q": 9,
              "r": 2
            },
            {
              "id": "HarvestableSpacePOI_OilyAsteroidField",
              "q": -2,
              "r": 8
            },
            {
              "id": "HarvestableSpacePOI_GlimmeringAsteroidField",
              "q": 0,
              "r": 10
            },
            {
              "id": "HarvestableSpacePOI_FrozenOreField",
              "q": 9,
              "r": -5
            },
            {
              "id": "HarvestableSpacePOI_RadioactiveAsteroidField",
              "q": -11,
              "r": 6
            },
            {
              "id": "HarvestableSpacePOI_RadioactiveGasCloud",
              "q": -11,
              "r": 11
            },
            {
              "id": "HarvestableSpacePOI_RockyAsteroidField",
              "q": -6,
              "r": 5
            },
            {
              "id": "HarvestableSpacePOI_ForestyOreField",
              "q": 3,
              "r": 2
            },
            {
              "id": "HarvestableSpacePOI_ForestyOreField",
              "q": 2,
              "r": 3
            },
            {
              "id": "HarvestableSpacePOI_RockyAsteroidField",
              "q": 5,
              "r": -6
            },
            {
              "id": "HarvestableSpacePOI_InterstellarOcean",
              "q": -7,
              "r": 0
            },
            {
              "id": "HarvestableSpacePOI_RadioactiveAsteroidField",
              "q": 6,
              "r": -10
            },
            {
              "id": "HarvestableSpacePOI_SatelliteField",
              "q": 5,
              "r": -9
            },
            {
              "id": "HarvestableSpacePOI_GildedAsteroidField",
              "q": 11,
              "r": -11
            },
            {
              "id": "HarvestableSpacePOI_HeliumCloud",
              "q": 11,
              "r": -10
            },
            {
              "id": "HarvestableSpacePOI_HeliumCloud",
              "q": -6,
              "r": 10
            },
            {
              "id": "HarvestableSpacePOI_OilyAsteroidField",
              "q": 4,
              "r": 6
            },
            {
              "id": "HarvestableSpacePOI_RadioactiveAsteroidField",
              "q": 3,
              "r": 6
            },
            {
              "id": "HarvestableSpacePOI_OilyAsteroidField",
              "q": -11,
              "r": 2
            },
            {
              "id": "HarvestableSpacePOI_CarbonAsteroidField",
              "q": 11,
              "r": -3
            },
            {
              "id": "HarvestableSpacePOI_IceAsteroidField",
              "q": 11,
              "r": -2
            },
            {
              "id": "ArtifactSpacePOI_RussellsTeapot",
              "q": -1,
              "r": -10
            }
          ]
        }
""".trimIndent()