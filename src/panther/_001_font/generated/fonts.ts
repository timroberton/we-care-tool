// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import type { FontInfo, KeyFonts } from "../types.ts";

type TimFontOption =
  // Alegreya
  | "Alegreya_500_Italic"
  | "Alegreya_900"
  | "Alegreya_500"
  | "Alegreya_700"
  | "Alegreya_400_Italic"
  | "Alegreya_900_Italic"
  | "Alegreya_800_Italic"
  | "Alegreya_800"
  | "Alegreya_400"
  | "Alegreya_600"
  | "Alegreya_600_Italic"
  | "Alegreya_700_Italic"
  // Cambria
  | "Cambria_700_Italic"
  | "Cambria_400_Italic"
  | "Cambria_700"
  | "Cambria_400"
  // Fira Mono
  | "FiraMono_400"
  | "FiraMono_700"
  | "FiraMono_500"
  // Fira Sans
  | "FiraSans_700_Italic"
  | "FiraSans_800_Italic"
  | "FiraSans_100"
  | "FiraSans_200_Italic"
  | "FiraSans_300_Italic"
  | "FiraSans_300"
  | "FiraSans_500"
  | "FiraSans_600_Italic"
  | "FiraSans_700"
  | "FiraSans_200"
  | "FiraSans_600"
  | "FiraSans_100_Italic"
  | "FiraSans_500_Italic"
  | "FiraSans_400"
  | "FiraSans_800"
  | "FiraSans_400_Italic"
  | "FiraSans_900"
  | "FiraSans_900_Italic"
  // Fira Sans Condensed
  | "FiraSansCondensed_300"
  | "FiraSansCondensed_800"
  | "FiraSansCondensed_700_Italic"
  | "FiraSansCondensed_600"
  | "FiraSansCondensed_200_Italic"
  | "FiraSansCondensed_600_Italic"
  | "FiraSansCondensed_400_Italic"
  | "FiraSansCondensed_300_Italic"
  | "FiraSansCondensed_200"
  | "FiraSansCondensed_400"
  | "FiraSansCondensed_500_Italic"
  | "FiraSansCondensed_800_Italic"
  | "FiraSansCondensed_500"
  | "FiraSansCondensed_900"
  | "FiraSansCondensed_900_Italic"
  | "FiraSansCondensed_700"
  // Gibson
  | "Gibson_800"
  | "Gibson_600_Italic"
  | "Gibson_400_Italic"
  | "Gibson_300"
  | "Gibson_800_Italic"
  | "Gibson_300_Italic"
  | "Gibson_200"
  | "Gibson_100"
  | "Gibson_500_Italic"
  | "Gibson_400"
  | "Gibson_100_Italic"
  | "Gibson_900_Italic"
  | "Gibson_600"
  | "Gibson_700_Italic"
  | "Gibson_700"
  | "Gibson_900"
  | "Gibson_500"
  | "Gibson_200_Italic"
  // Gibson VF
  | "GibsonVF_100_Italic"
  | "GibsonVF_100"
  // IBM Plex Sans Condensed
  | "IBMPlexSansCondensed_600_Italic"
  | "IBMPlexSansCondensed_100_Italic"
  | "IBMPlexSansCondensed_300"
  | "IBMPlexSansCondensed_400"
  | "IBMPlexSansCondensed_700_Italic"
  | "IBMPlexSansCondensed_400_Italic"
  | "IBMPlexSansCondensed_100"
  | "IBMPlexSansCondensed_500"
  | "IBMPlexSansCondensed_700"
  | "IBMPlexSansCondensed_200"
  | "IBMPlexSansCondensed_500_Italic"
  | "IBMPlexSansCondensed_200_Italic"
  | "IBMPlexSansCondensed_300_Italic"
  | "IBMPlexSansCondensed_600"
  // Inter
  | "Inter_500"
  | "Inter_900"
  | "Inter_400"
  | "Inter_300"
  | "Inter_200"
  | "Inter_200_Italic"
  | "Inter_100_Italic"
  | "Inter_100"
  | "Inter_600_Italic"
  | "Inter_700"
  | "Inter_500_Italic"
  | "Inter_800"
  | "Inter_600"
  | "Inter_300_Italic"
  | "Inter_700_Italic"
  | "Inter_800_Italic"
  | "Inter_400_Italic"
  | "Inter_900_Italic"
  // Inter Display
  | "InterDisplay_400_Italic"
  | "InterDisplay_900_Italic"
  | "InterDisplay_200_Italic"
  | "InterDisplay_700"
  | "InterDisplay_800"
  | "InterDisplay_100"
  | "InterDisplay_500"
  | "InterDisplay_200"
  | "InterDisplay_100_Italic"
  | "InterDisplay_600"
  | "InterDisplay_300"
  | "InterDisplay_700_Italic"
  | "InterDisplay_400"
  | "InterDisplay_900"
  | "InterDisplay_300_Italic"
  | "InterDisplay_800_Italic"
  | "InterDisplay_600_Italic"
  | "InterDisplay_500_Italic"
  // Inter Variable
  | "InterVariable_400"
  | "InterVariable_400_Italic"
  // Merriweather
  | "Merriweather_300"
  | "Merriweather_700"
  | "Merriweather_400"
  | "Merriweather_400_Italic"
  | "Merriweather_900"
  | "Merriweather_700_Italic"
  | "Merriweather_900_Italic"
  | "Merriweather_300_Italic"
  // National 2
  | "National2_400_Italic"
  | "National2_700_Italic"
  | "National2_900"
  | "National2_400"
  | "National2_700"
  // National 2 Extrabold
  | "National2Extrabold_800"
  // National 2 Narrow
  | "National2Narrow_400"
  | "National2Narrow_400_Italic"
  // Noto Sans
  | "NotoSans_400_Italic"
  | "NotoSans_700"
  | "NotoSans_500"
  | "NotoSans_900"
  | "NotoSans_100"
  | "NotoSans_100_Italic"
  | "NotoSans_600_Italic"
  | "NotoSans_700_Italic"
  | "NotoSans_300"
  | "NotoSans_200_Italic"
  | "NotoSans_500_Italic"
  | "NotoSans_600"
  | "NotoSans_300_Italic"
  | "NotoSans_800"
  | "NotoSans_900_Italic"
  | "NotoSans_200"
  | "NotoSans_800_Italic"
  | "NotoSans_400"
  // Noto Sans Ethiopic
  | "NotoSansEthiopic_600"
  | "NotoSansEthiopic_500"
  | "NotoSansEthiopic_200"
  | "NotoSansEthiopic_700"
  | "NotoSansEthiopic_800"
  | "NotoSansEthiopic_900"
  | "NotoSansEthiopic_300"
  | "NotoSansEthiopic_400"
  // Poppins
  | "Poppins_300"
  | "Poppins_600"
  | "Poppins_500"
  | "Poppins_500_Italic"
  | "Poppins_200_Italic"
  | "Poppins_400"
  | "Poppins_300_Italic"
  | "Poppins_700_Italic"
  | "Poppins_200"
  | "Poppins_800"
  | "Poppins_800_Italic"
  | "Poppins_700"
  | "Poppins_900_Italic"
  | "Poppins_600_Italic"
  | "Poppins_400_Italic"
  | "Poppins_900"
  // Pragati Narrow
  | "PragatiNarrow_700"
  | "PragatiNarrow_400"
  // Reddit Sans
  | "RedditSans_500"
  | "RedditSans_800_Italic"
  | "RedditSans_300_Italic"
  | "RedditSans_600_Italic"
  | "RedditSans_700"
  | "RedditSans_600"
  | "RedditSans_500_Italic"
  | "RedditSans_200"
  | "RedditSans_300"
  | "RedditSans_400"
  | "RedditSans_900_Italic"
  | "RedditSans_200_Italic"
  | "RedditSans_700_Italic"
  | "RedditSans_900"
  | "RedditSans_400_Italic"
  | "RedditSans_800"
  // Roboto
  | "Roboto_500"
  | "Roboto_300"
  | "Roboto_200"
  | "Roboto_400"
  | "Roboto_500_Italic"
  | "Roboto_400_Italic"
  | "Roboto_300_Italic"
  | "Roboto_900"
  | "Roboto_200_Italic"
  | "Roboto_700_Italic"
  | "Roboto_700"
  | "Roboto_900_Italic"
  // Roboto Condensed
  | "RobotoCondensed_700_Italic"
  | "RobotoCondensed_300"
  | "RobotoCondensed_400"
  | "RobotoCondensed_400_Italic"
  | "RobotoCondensed_700"
  | "RobotoCondensed_300_Italic"
  // Roboto Mono
  | "RobotoMono_500"
  | "RobotoMono_600"
  | "RobotoMono_700"
  | "RobotoMono_600_Italic"
  | "RobotoMono_400_Italic"
  | "RobotoMono_200_Italic"
  | "RobotoMono_300"
  | "RobotoMono_400"
  | "RobotoMono_300_Italic"
  | "RobotoMono_700_Italic"
  | "RobotoMono_200"
  | "RobotoMono_500_Italic"
  // Sarabun
  | "Sarabun_400_Italic"
  | "Sarabun_300_Italic"
  | "Sarabun_800"
  | "Sarabun_300"
  | "Sarabun_200"
  | "Sarabun_200_Italic"
  | "Sarabun_700_Italic"
  | "Sarabun_400"
  | "Sarabun_700"
  | "Sarabun_600"
  | "Sarabun_600_Italic"
  | "Sarabun_500"
  | "Sarabun_800_Italic"
  | "Sarabun_500_Italic"
  // Source Sans 3
  | "SourceSans3_500_Italic"
  | "SourceSans3_700"
  | "SourceSans3_800"
  | "SourceSans3_900"
  | "SourceSans3_600"
  | "SourceSans3_800_Italic"
  | "SourceSans3_300_Italic"
  | "SourceSans3_200_Italic"
  | "SourceSans3_600_Italic"
  | "SourceSans3_400_Italic"
  | "SourceSans3_700_Italic"
  | "SourceSans3_400"
  | "SourceSans3_300"
  | "SourceSans3_500"
  | "SourceSans3_900_Italic"
  | "SourceSans3_200"
  // Source Serif 4
  | "SourceSerif4_600_Italic"
  | "SourceSerif4_300_Italic"
  | "SourceSerif4_700_Italic"
  | "SourceSerif4_700"
  | "SourceSerif4_200_Italic"
  | "SourceSerif4_500"
  | "SourceSerif4_300"
  | "SourceSerif4_900_Italic"
  | "SourceSerif4_600"
  | "SourceSerif4_500_Italic"
  | "SourceSerif4_400_Italic"
  | "SourceSerif4_200"
  | "SourceSerif4_800_Italic"
  | "SourceSerif4_900"
  | "SourceSerif4_400"
  | "SourceSerif4_800";

export const TIM_FONTS: Record<TimFontOption, FontInfo> = {
  // Alegreya
  Alegreya_500_Italic: {
    fontFamily: "'Alegreya Medium'",
    weight: 500,
    italic: true,
  },
  Alegreya_900: {
    fontFamily: "'Alegreya Black'",
    weight: 900,
    italic: false,
  },
  Alegreya_500: {
    fontFamily: "'Alegreya Medium'",
    weight: 500,
    italic: false,
  },
  Alegreya_700: {
    fontFamily: "'Alegreya'",
    weight: 700,
    italic: false,
  },
  Alegreya_400_Italic: {
    fontFamily: "'Alegreya'",
    weight: 400,
    italic: true,
  },
  Alegreya_900_Italic: {
    fontFamily: "'Alegreya Black'",
    weight: 900,
    italic: true,
  },
  Alegreya_800_Italic: {
    fontFamily: "'Alegreya ExtraBold'",
    weight: 800,
    italic: true,
  },
  Alegreya_800: {
    fontFamily: "'Alegreya ExtraBold'",
    weight: 800,
    italic: false,
  },
  Alegreya_400: {
    fontFamily: "'Alegreya'",
    weight: 400,
    italic: false,
  },
  Alegreya_600: {
    fontFamily: "'Alegreya SemiBold'",
    weight: 600,
    italic: false,
  },
  Alegreya_600_Italic: {
    fontFamily: "'Alegreya SemiBold'",
    weight: 600,
    italic: true,
  },
  Alegreya_700_Italic: {
    fontFamily: "'Alegreya'",
    weight: 700,
    italic: true,
  },

  // Cambria
  Cambria_700_Italic: {
    fontFamily: "'Cambria'",
    weight: 700,
    italic: true,
  },
  Cambria_400_Italic: {
    fontFamily: "'Cambria'",
    weight: 400,
    italic: true,
  },
  Cambria_700: {
    fontFamily: "'Cambria'",
    weight: 700,
    italic: false,
  },
  Cambria_400: {
    fontFamily: "'Cambria'",
    weight: 400,
    italic: false,
  },

  // Fira Mono
  FiraMono_400: {
    fontFamily: "'Fira Mono'",
    weight: 400,
    italic: false,
  },
  FiraMono_700: {
    fontFamily: "'Fira Mono'",
    weight: 700,
    italic: false,
  },
  FiraMono_500: {
    fontFamily: "'Fira Mono Medium'",
    weight: 500,
    italic: false,
  },

  // Fira Sans
  FiraSans_700_Italic: {
    fontFamily: "'Fira Sans'",
    weight: 700,
    italic: true,
  },
  FiraSans_800_Italic: {
    fontFamily: "'Fira Sans ExtraBold'",
    weight: 800,
    italic: true,
  },
  FiraSans_100: {
    fontFamily: "'Fira Sans Thin'",
    weight: 100,
    italic: false,
  },
  FiraSans_200_Italic: {
    fontFamily: "'Fira Sans ExtraLight'",
    weight: 200,
    italic: true,
  },
  FiraSans_300_Italic: {
    fontFamily: "'Fira Sans Light'",
    weight: 300,
    italic: true,
  },
  FiraSans_300: {
    fontFamily: "'Fira Sans Light'",
    weight: 300,
    italic: false,
  },
  FiraSans_500: {
    fontFamily: "'Fira Sans Medium'",
    weight: 500,
    italic: false,
  },
  FiraSans_600_Italic: {
    fontFamily: "'Fira Sans SemiBold'",
    weight: 600,
    italic: true,
  },
  FiraSans_700: {
    fontFamily: "'Fira Sans'",
    weight: 700,
    italic: false,
  },
  FiraSans_200: {
    fontFamily: "'Fira Sans ExtraLight'",
    weight: 200,
    italic: false,
  },
  FiraSans_600: {
    fontFamily: "'Fira Sans SemiBold'",
    weight: 600,
    italic: false,
  },
  FiraSans_100_Italic: {
    fontFamily: "'Fira Sans Thin'",
    weight: 100,
    italic: true,
  },
  FiraSans_500_Italic: {
    fontFamily: "'Fira Sans Medium'",
    weight: 500,
    italic: true,
  },
  FiraSans_400: {
    fontFamily: "'Fira Sans'",
    weight: 400,
    italic: false,
  },
  FiraSans_800: {
    fontFamily: "'Fira Sans ExtraBold'",
    weight: 800,
    italic: false,
  },
  FiraSans_400_Italic: {
    fontFamily: "'Fira Sans'",
    weight: 400,
    italic: true,
  },
  FiraSans_900: {
    fontFamily: "'Fira Sans Black'",
    weight: 900,
    italic: false,
  },
  FiraSans_900_Italic: {
    fontFamily: "'Fira Sans Black'",
    weight: 900,
    italic: true,
  },

  // Fira Sans Condensed
  FiraSansCondensed_300: {
    fontFamily: "'Fira Sans Condensed ExtraLight'",
    weight: 300,
    italic: false,
  },
  FiraSansCondensed_800: {
    fontFamily: "'Fira Sans Condensed ExtraBold'",
    weight: 800,
    italic: false,
  },
  FiraSansCondensed_700_Italic: {
    fontFamily: "'Fira Sans Condensed'",
    weight: 700,
    italic: true,
  },
  FiraSansCondensed_600: {
    fontFamily: "'Fira Sans Condensed SemiBold'",
    weight: 600,
    italic: false,
  },
  FiraSansCondensed_200_Italic: {
    fontFamily: "'Fira Sans Condensed Thin'",
    weight: 200,
    italic: true,
  },
  FiraSansCondensed_600_Italic: {
    fontFamily: "'Fira Sans Condensed SemiBold'",
    weight: 600,
    italic: true,
  },
  FiraSansCondensed_400_Italic: {
    fontFamily: "'Fira Sans Condensed'",
    weight: 400,
    italic: true,
  },
  FiraSansCondensed_300_Italic: {
    fontFamily: "'Fira Sans Condensed Light'",
    weight: 300,
    italic: true,
  },
  FiraSansCondensed_200: {
    fontFamily: "'Fira Sans Condensed Thin'",
    weight: 200,
    italic: false,
  },
  FiraSansCondensed_400: {
    fontFamily: "'Fira Sans Condensed'",
    weight: 400,
    italic: false,
  },
  FiraSansCondensed_500_Italic: {
    fontFamily: "'Fira Sans Condensed Medium'",
    weight: 500,
    italic: true,
  },
  FiraSansCondensed_800_Italic: {
    fontFamily: "'Fira Sans Condensed ExtraBold'",
    weight: 800,
    italic: true,
  },
  FiraSansCondensed_500: {
    fontFamily: "'Fira Sans Condensed Medium'",
    weight: 500,
    italic: false,
  },
  FiraSansCondensed_900: {
    fontFamily: "'Fira Sans Condensed Black'",
    weight: 900,
    italic: false,
  },
  FiraSansCondensed_900_Italic: {
    fontFamily: "'Fira Sans Condensed Black'",
    weight: 900,
    italic: true,
  },
  FiraSansCondensed_700: {
    fontFamily: "'Fira Sans Condensed'",
    weight: 700,
    italic: false,
  },

  // Gibson
  Gibson_800: {
    fontFamily: "'Gibson ExtraBold'",
    weight: 800,
    italic: false,
  },
  Gibson_600_Italic: {
    fontFamily: "'Gibson SemiBold'",
    weight: 600,
    italic: true,
  },
  Gibson_400_Italic: {
    fontFamily: "'Gibson'",
    weight: 400,
    italic: true,
  },
  Gibson_300: {
    fontFamily: "'Gibson Book'",
    weight: 300,
    italic: false,
  },
  Gibson_800_Italic: {
    fontFamily: "'Gibson ExtraBold'",
    weight: 800,
    italic: true,
  },
  Gibson_300_Italic: {
    fontFamily: "'Gibson Book'",
    weight: 300,
    italic: true,
  },
  Gibson_200: {
    fontFamily: "'Gibson Light'",
    weight: 200,
    italic: false,
  },
  Gibson_100: {
    fontFamily: "'Gibson Thin'",
    weight: 100,
    italic: false,
  },
  Gibson_500_Italic: {
    fontFamily: "'Gibson Medium'",
    weight: 500,
    italic: true,
  },
  Gibson_400: {
    fontFamily: "'Gibson'",
    weight: 400,
    italic: false,
  },
  Gibson_100_Italic: {
    fontFamily: "'Gibson Thin'",
    weight: 100,
    italic: true,
  },
  Gibson_900_Italic: {
    fontFamily: "'Gibson Heavy'",
    weight: 900,
    italic: true,
  },
  Gibson_600: {
    fontFamily: "'Gibson SemiBold'",
    weight: 600,
    italic: false,
  },
  Gibson_700_Italic: {
    fontFamily: "'Gibson'",
    weight: 700,
    italic: true,
  },
  Gibson_700: {
    fontFamily: "'Gibson'",
    weight: 700,
    italic: false,
  },
  Gibson_900: {
    fontFamily: "'Gibson Heavy'",
    weight: 900,
    italic: false,
  },
  Gibson_500: {
    fontFamily: "'Gibson Medium'",
    weight: 500,
    italic: false,
  },
  Gibson_200_Italic: {
    fontFamily: "'Gibson Light'",
    weight: 200,
    italic: true,
  },

  // Gibson VF
  GibsonVF_100_Italic: {
    fontFamily: "'Gibson VF Thin'",
    weight: 100,
    italic: true,
  },
  GibsonVF_100: {
    fontFamily: "'Gibson VF Thin'",
    weight: 100,
    italic: false,
  },

  // IBM Plex Sans Condensed
  IBMPlexSansCondensed_600_Italic: {
    fontFamily: "'IBM Plex Sans Condensed SemiBold'",
    weight: 600,
    italic: true,
  },
  IBMPlexSansCondensed_100_Italic: {
    fontFamily: "'IBM Plex Sans Condensed Thin'",
    weight: 100,
    italic: true,
  },
  IBMPlexSansCondensed_300: {
    fontFamily: "'IBM Plex Sans Condensed Light'",
    weight: 300,
    italic: false,
  },
  IBMPlexSansCondensed_400: {
    fontFamily: "'IBM Plex Sans Condensed'",
    weight: 400,
    italic: false,
  },
  IBMPlexSansCondensed_700_Italic: {
    fontFamily: "'IBM Plex Sans Condensed'",
    weight: 700,
    italic: true,
  },
  IBMPlexSansCondensed_400_Italic: {
    fontFamily: "'IBM Plex Sans Condensed'",
    weight: 400,
    italic: true,
  },
  IBMPlexSansCondensed_100: {
    fontFamily: "'IBM Plex Sans Condensed Thin'",
    weight: 100,
    italic: false,
  },
  IBMPlexSansCondensed_500: {
    fontFamily: "'IBM Plex Sans Condensed Medium'",
    weight: 500,
    italic: false,
  },
  IBMPlexSansCondensed_700: {
    fontFamily: "'IBM Plex Sans Condensed'",
    weight: 700,
    italic: false,
  },
  IBMPlexSansCondensed_200: {
    fontFamily: "'IBM Plex Sans Condensed ExtraLight'",
    weight: 200,
    italic: false,
  },
  IBMPlexSansCondensed_500_Italic: {
    fontFamily: "'IBM Plex Sans Condensed Medium'",
    weight: 500,
    italic: true,
  },
  IBMPlexSansCondensed_200_Italic: {
    fontFamily: "'IBM Plex Sans Condensed ExtraLight'",
    weight: 200,
    italic: true,
  },
  IBMPlexSansCondensed_300_Italic: {
    fontFamily: "'IBM Plex Sans Condensed Light'",
    weight: 300,
    italic: true,
  },
  IBMPlexSansCondensed_600: {
    fontFamily: "'IBM Plex Sans Condensed SemiBold'",
    weight: 600,
    italic: false,
  },

  // Inter
  Inter_500: {
    fontFamily: "'Inter Medium'",
    weight: 500,
    italic: false,
  },
  Inter_900: {
    fontFamily: "'Inter Black'",
    weight: 900,
    italic: false,
  },
  Inter_400: {
    fontFamily: "'Inter'",
    weight: 400,
    italic: false,
  },
  Inter_300: {
    fontFamily: "'Inter Light'",
    weight: 300,
    italic: false,
  },
  Inter_200: {
    fontFamily: "'Inter ExtraLight'",
    weight: 200,
    italic: false,
  },
  Inter_200_Italic: {
    fontFamily: "'Inter ExtraLight'",
    weight: 200,
    italic: true,
  },
  Inter_100_Italic: {
    fontFamily: "'Inter Thin'",
    weight: 100,
    italic: true,
  },
  Inter_100: {
    fontFamily: "'Inter Thin'",
    weight: 100,
    italic: false,
  },
  Inter_600_Italic: {
    fontFamily: "'Inter SemiBold'",
    weight: 600,
    italic: true,
  },
  Inter_700: {
    fontFamily: "'Inter'",
    weight: 700,
    italic: false,
  },
  Inter_500_Italic: {
    fontFamily: "'Inter Medium'",
    weight: 500,
    italic: true,
  },
  Inter_800: {
    fontFamily: "'Inter ExtraBold'",
    weight: 800,
    italic: false,
  },
  Inter_600: {
    fontFamily: "'Inter SemiBold'",
    weight: 600,
    italic: false,
  },
  Inter_300_Italic: {
    fontFamily: "'Inter Light'",
    weight: 300,
    italic: true,
  },
  Inter_700_Italic: {
    fontFamily: "'Inter'",
    weight: 700,
    italic: true,
  },
  Inter_800_Italic: {
    fontFamily: "'Inter ExtraBold'",
    weight: 800,
    italic: true,
  },
  Inter_400_Italic: {
    fontFamily: "'Inter'",
    weight: 400,
    italic: true,
  },
  Inter_900_Italic: {
    fontFamily: "'Inter Black'",
    weight: 900,
    italic: true,
  },

  // Inter Display
  InterDisplay_400_Italic: {
    fontFamily: "'Inter Display'",
    weight: 400,
    italic: true,
  },
  InterDisplay_900_Italic: {
    fontFamily: "'Inter Display Black'",
    weight: 900,
    italic: true,
  },
  InterDisplay_200_Italic: {
    fontFamily: "'Inter Display ExtraLight'",
    weight: 200,
    italic: true,
  },
  InterDisplay_700: {
    fontFamily: "'Inter Display'",
    weight: 700,
    italic: false,
  },
  InterDisplay_800: {
    fontFamily: "'Inter Display ExtraBold'",
    weight: 800,
    italic: false,
  },
  InterDisplay_100: {
    fontFamily: "'Inter Display Thin'",
    weight: 100,
    italic: false,
  },
  InterDisplay_500: {
    fontFamily: "'Inter Display Medium'",
    weight: 500,
    italic: false,
  },
  InterDisplay_200: {
    fontFamily: "'Inter Display ExtraLight'",
    weight: 200,
    italic: false,
  },
  InterDisplay_100_Italic: {
    fontFamily: "'Inter Display Thin'",
    weight: 100,
    italic: true,
  },
  InterDisplay_600: {
    fontFamily: "'Inter Display SemiBold'",
    weight: 600,
    italic: false,
  },
  InterDisplay_300: {
    fontFamily: "'Inter Display Light'",
    weight: 300,
    italic: false,
  },
  InterDisplay_700_Italic: {
    fontFamily: "'Inter Display'",
    weight: 700,
    italic: true,
  },
  InterDisplay_400: {
    fontFamily: "'Inter Display'",
    weight: 400,
    italic: false,
  },
  InterDisplay_900: {
    fontFamily: "'Inter Display Black'",
    weight: 900,
    italic: false,
  },
  InterDisplay_300_Italic: {
    fontFamily: "'Inter Display Light'",
    weight: 300,
    italic: true,
  },
  InterDisplay_800_Italic: {
    fontFamily: "'Inter Display ExtraBold'",
    weight: 800,
    italic: true,
  },
  InterDisplay_600_Italic: {
    fontFamily: "'Inter Display SemiBold'",
    weight: 600,
    italic: true,
  },
  InterDisplay_500_Italic: {
    fontFamily: "'Inter Display Medium'",
    weight: 500,
    italic: true,
  },

  // Inter Variable
  InterVariable_400: {
    fontFamily: "'Inter Variable'",
    weight: 400,
    italic: false,
  },
  InterVariable_400_Italic: {
    fontFamily: "'Inter Variable'",
    weight: 400,
    italic: true,
  },

  // Merriweather
  Merriweather_300: {
    fontFamily: "'Merriweather Light'",
    weight: 300,
    italic: false,
  },
  Merriweather_700: {
    fontFamily: "'Merriweather'",
    weight: 700,
    italic: false,
  },
  Merriweather_400: {
    fontFamily: "'Merriweather'",
    weight: 400,
    italic: false,
  },
  Merriweather_400_Italic: {
    fontFamily: "'Merriweather'",
    weight: 400,
    italic: true,
  },
  Merriweather_900: {
    fontFamily: "'Merriweather Black'",
    weight: 900,
    italic: false,
  },
  Merriweather_700_Italic: {
    fontFamily: "'Merriweather'",
    weight: 700,
    italic: true,
  },
  Merriweather_900_Italic: {
    fontFamily: "'Merriweather UltraBold'",
    weight: 900,
    italic: true,
  },
  Merriweather_300_Italic: {
    fontFamily: "'Merriweather Light'",
    weight: 300,
    italic: true,
  },

  // National 2
  National2_400_Italic: {
    fontFamily: "'National 2'",
    weight: 400,
    italic: true,
  },
  National2_700_Italic: {
    fontFamily: "'National 2'",
    weight: 700,
    italic: true,
  },
  National2_900: {
    fontFamily: "'National 2 Black'",
    weight: 900,
    italic: false,
  },
  National2_400: {
    fontFamily: "'National 2'",
    weight: 400,
    italic: false,
  },
  National2_700: {
    fontFamily: "'National 2'",
    weight: 700,
    italic: false,
  },

  // National 2 Extrabold
  National2Extrabold_800: {
    fontFamily: "'National 2 Extrabold'",
    weight: 800,
    italic: false,
  },

  // National 2 Narrow
  National2Narrow_400: {
    fontFamily: "'National 2 Narrow'",
    weight: 400,
    italic: false,
  },
  National2Narrow_400_Italic: {
    fontFamily: "'National 2 Narrow'",
    weight: 400,
    italic: true,
  },

  // Noto Sans
  NotoSans_400_Italic: {
    fontFamily: "'Noto Sans'",
    weight: 400,
    italic: true,
  },
  NotoSans_700: {
    fontFamily: "'Noto Sans'",
    weight: 700,
    italic: false,
  },
  NotoSans_500: {
    fontFamily: "'Noto Sans Medium'",
    weight: 500,
    italic: false,
  },
  NotoSans_900: {
    fontFamily: "'Noto Sans Black'",
    weight: 900,
    italic: false,
  },
  NotoSans_100: {
    fontFamily: "'Noto Sans Thin'",
    weight: 100,
    italic: false,
  },
  NotoSans_100_Italic: {
    fontFamily: "'Noto Sans Thin'",
    weight: 100,
    italic: true,
  },
  NotoSans_600_Italic: {
    fontFamily: "'Noto Sans SemiBold'",
    weight: 600,
    italic: true,
  },
  NotoSans_700_Italic: {
    fontFamily: "'Noto Sans'",
    weight: 700,
    italic: true,
  },
  NotoSans_300: {
    fontFamily: "'Noto Sans Light'",
    weight: 300,
    italic: false,
  },
  NotoSans_200_Italic: {
    fontFamily: "'Noto Sans ExtraLight'",
    weight: 200,
    italic: true,
  },
  NotoSans_500_Italic: {
    fontFamily: "'Noto Sans Medium'",
    weight: 500,
    italic: true,
  },
  NotoSans_600: {
    fontFamily: "'Noto Sans SemiBold'",
    weight: 600,
    italic: false,
  },
  NotoSans_300_Italic: {
    fontFamily: "'Noto Sans Light'",
    weight: 300,
    italic: true,
  },
  NotoSans_800: {
    fontFamily: "'Noto Sans ExtraBold'",
    weight: 800,
    italic: false,
  },
  NotoSans_900_Italic: {
    fontFamily: "'Noto Sans Black'",
    weight: 900,
    italic: true,
  },
  NotoSans_200: {
    fontFamily: "'Noto Sans ExtraLight'",
    weight: 200,
    italic: false,
  },
  NotoSans_800_Italic: {
    fontFamily: "'Noto Sans ExtraBold'",
    weight: 800,
    italic: true,
  },
  NotoSans_400: {
    fontFamily: "'Noto Sans'",
    weight: 400,
    italic: false,
  },

  // Noto Sans Ethiopic
  NotoSansEthiopic_600: {
    fontFamily: "'Noto Sans Ethiopic SemiBold'",
    weight: 600,
    italic: false,
  },
  NotoSansEthiopic_500: {
    fontFamily: "'Noto Sans Ethiopic Medium'",
    weight: 500,
    italic: false,
  },
  NotoSansEthiopic_200: {
    fontFamily: "'Noto Sans Ethiopic Thin'",
    weight: 200,
    italic: false,
  },
  NotoSansEthiopic_700: {
    fontFamily: "'Noto Sans Ethiopic'",
    weight: 700,
    italic: false,
  },
  NotoSansEthiopic_800: {
    fontFamily: "'Noto Sans Ethiopic ExtraBold'",
    weight: 800,
    italic: false,
  },
  NotoSansEthiopic_900: {
    fontFamily: "'Noto Sans Ethiopic Black'",
    weight: 900,
    italic: false,
  },
  NotoSansEthiopic_300: {
    fontFamily: "'Noto Sans Ethiopic Light'",
    weight: 300,
    italic: false,
  },
  NotoSansEthiopic_400: {
    fontFamily: "'Noto Sans Ethiopic'",
    weight: 400,
    italic: false,
  },

  // Poppins
  Poppins_300: {
    fontFamily: "'Poppins Light'",
    weight: 300,
    italic: false,
  },
  Poppins_600: {
    fontFamily: "'Poppins SemiBold'",
    weight: 600,
    italic: false,
  },
  Poppins_500: {
    fontFamily: "'Poppins Medium'",
    weight: 500,
    italic: false,
  },
  Poppins_500_Italic: {
    fontFamily: "'Poppins Medium'",
    weight: 500,
    italic: true,
  },
  Poppins_200_Italic: {
    fontFamily: "'Poppins Thin'",
    weight: 200,
    italic: true,
  },
  Poppins_400: {
    fontFamily: "'Poppins'",
    weight: 400,
    italic: false,
  },
  Poppins_300_Italic: {
    fontFamily: "'Poppins ExtraLight'",
    weight: 300,
    italic: true,
  },
  Poppins_700_Italic: {
    fontFamily: "'Poppins'",
    weight: 700,
    italic: true,
  },
  Poppins_200: {
    fontFamily: "'Poppins Thin'",
    weight: 200,
    italic: false,
  },
  Poppins_800: {
    fontFamily: "'Poppins ExtraBold'",
    weight: 800,
    italic: false,
  },
  Poppins_800_Italic: {
    fontFamily: "'Poppins ExtraBold'",
    weight: 800,
    italic: true,
  },
  Poppins_700: {
    fontFamily: "'Poppins'",
    weight: 700,
    italic: false,
  },
  Poppins_900_Italic: {
    fontFamily: "'Poppins Black'",
    weight: 900,
    italic: true,
  },
  Poppins_600_Italic: {
    fontFamily: "'Poppins SemiBold'",
    weight: 600,
    italic: true,
  },
  Poppins_400_Italic: {
    fontFamily: "'Poppins'",
    weight: 400,
    italic: true,
  },
  Poppins_900: {
    fontFamily: "'Poppins Black'",
    weight: 900,
    italic: false,
  },

  // Pragati Narrow
  PragatiNarrow_700: {
    fontFamily: "'Pragati Narrow'",
    weight: 700,
    italic: false,
  },
  PragatiNarrow_400: {
    fontFamily: "'Pragati Narrow'",
    weight: 400,
    italic: false,
  },

  // Reddit Sans
  RedditSans_500: {
    fontFamily: "'Reddit Sans Medium'",
    weight: 500,
    italic: false,
  },
  RedditSans_800_Italic: {
    fontFamily: "'Reddit Sans ExtraBold'",
    weight: 800,
    italic: true,
  },
  RedditSans_300_Italic: {
    fontFamily: "'Reddit Sans Light'",
    weight: 300,
    italic: true,
  },
  RedditSans_600_Italic: {
    fontFamily: "'Reddit Sans SemiBold'",
    weight: 600,
    italic: true,
  },
  RedditSans_700: {
    fontFamily: "'Reddit Sans'",
    weight: 700,
    italic: false,
  },
  RedditSans_600: {
    fontFamily: "'Reddit Sans SemiBold'",
    weight: 600,
    italic: false,
  },
  RedditSans_500_Italic: {
    fontFamily: "'Reddit Sans Medium'",
    weight: 500,
    italic: true,
  },
  RedditSans_200: {
    fontFamily: "'Reddit Sans ExtraLight'",
    weight: 200,
    italic: false,
  },
  RedditSans_300: {
    fontFamily: "'Reddit Sans Light'",
    weight: 300,
    italic: false,
  },
  RedditSans_400: {
    fontFamily: "'Reddit Sans'",
    weight: 400,
    italic: false,
  },
  RedditSans_900_Italic: {
    fontFamily: "'Reddit Sans Black'",
    weight: 900,
    italic: true,
  },
  RedditSans_200_Italic: {
    fontFamily: "'Reddit Sans ExtraLight'",
    weight: 200,
    italic: true,
  },
  RedditSans_700_Italic: {
    fontFamily: "'Reddit Sans'",
    weight: 700,
    italic: true,
  },
  RedditSans_900: {
    fontFamily: "'Reddit Sans Black'",
    weight: 900,
    italic: false,
  },
  RedditSans_400_Italic: {
    fontFamily: "'Reddit Sans'",
    weight: 400,
    italic: true,
  },
  RedditSans_800: {
    fontFamily: "'Reddit Sans ExtraBold'",
    weight: 800,
    italic: false,
  },

  // Roboto
  Roboto_500: {
    fontFamily: "'Roboto Medium'",
    weight: 500,
    italic: false,
  },
  Roboto_300: {
    fontFamily: "'Roboto Light'",
    weight: 300,
    italic: false,
  },
  Roboto_200: {
    fontFamily: "'Roboto Thin'",
    weight: 200,
    italic: false,
  },
  Roboto_400: {
    fontFamily: "'Roboto'",
    weight: 400,
    italic: false,
  },
  Roboto_500_Italic: {
    fontFamily: "'Roboto Medium'",
    weight: 500,
    italic: true,
  },
  Roboto_400_Italic: {
    fontFamily: "'Roboto'",
    weight: 400,
    italic: true,
  },
  Roboto_300_Italic: {
    fontFamily: "'Roboto Light'",
    weight: 300,
    italic: true,
  },
  Roboto_900: {
    fontFamily: "'Roboto Black'",
    weight: 900,
    italic: false,
  },
  Roboto_200_Italic: {
    fontFamily: "'Roboto Thin'",
    weight: 200,
    italic: true,
  },
  Roboto_700_Italic: {
    fontFamily: "'Roboto'",
    weight: 700,
    italic: true,
  },
  Roboto_700: {
    fontFamily: "'Roboto'",
    weight: 700,
    italic: false,
  },
  Roboto_900_Italic: {
    fontFamily: "'Roboto Black'",
    weight: 900,
    italic: true,
  },

  // Roboto Condensed
  RobotoCondensed_700_Italic: {
    fontFamily: "'Roboto Condensed'",
    weight: 700,
    italic: true,
  },
  RobotoCondensed_300: {
    fontFamily: "'Roboto Condensed Light'",
    weight: 300,
    italic: false,
  },
  RobotoCondensed_400: {
    fontFamily: "'Roboto Condensed'",
    weight: 400,
    italic: false,
  },
  RobotoCondensed_400_Italic: {
    fontFamily: "'Roboto Condensed'",
    weight: 400,
    italic: true,
  },
  RobotoCondensed_700: {
    fontFamily: "'Roboto Condensed'",
    weight: 700,
    italic: false,
  },
  RobotoCondensed_300_Italic: {
    fontFamily: "'Roboto Condensed Light'",
    weight: 300,
    italic: true,
  },

  // Roboto Mono
  RobotoMono_500: {
    fontFamily: "'Roboto Mono Medium'",
    weight: 500,
    italic: false,
  },
  RobotoMono_600: {
    fontFamily: "'Roboto Mono SemiBold'",
    weight: 600,
    italic: false,
  },
  RobotoMono_700: {
    fontFamily: "'Roboto Mono'",
    weight: 700,
    italic: false,
  },
  RobotoMono_600_Italic: {
    fontFamily: "'Roboto Mono SemiBold'",
    weight: 600,
    italic: true,
  },
  RobotoMono_400_Italic: {
    fontFamily: "'Roboto Mono'",
    weight: 400,
    italic: true,
  },
  RobotoMono_200_Italic: {
    fontFamily: "'Roboto Mono Thin'",
    weight: 200,
    italic: true,
  },
  RobotoMono_300: {
    fontFamily: "'Roboto Mono Light'",
    weight: 300,
    italic: false,
  },
  RobotoMono_400: {
    fontFamily: "'Roboto Mono'",
    weight: 400,
    italic: false,
  },
  RobotoMono_300_Italic: {
    fontFamily: "'Roboto Mono Light'",
    weight: 300,
    italic: true,
  },
  RobotoMono_700_Italic: {
    fontFamily: "'Roboto Mono'",
    weight: 700,
    italic: true,
  },
  RobotoMono_200: {
    fontFamily: "'Roboto Mono ExtraLight'",
    weight: 200,
    italic: false,
  },
  RobotoMono_500_Italic: {
    fontFamily: "'Roboto Mono Medium'",
    weight: 500,
    italic: true,
  },

  // Sarabun
  Sarabun_400_Italic: {
    fontFamily: "'Sarabun'",
    weight: 400,
    italic: true,
  },
  Sarabun_300_Italic: {
    fontFamily: "'Sarabun ExtraLight'",
    weight: 300,
    italic: true,
  },
  Sarabun_800: {
    fontFamily: "'Sarabun ExtraBold'",
    weight: 800,
    italic: false,
  },
  Sarabun_300: {
    fontFamily: "'Sarabun ExtraLight'",
    weight: 300,
    italic: false,
  },
  Sarabun_200: {
    fontFamily: "'Sarabun Thin'",
    weight: 200,
    italic: false,
  },
  Sarabun_200_Italic: {
    fontFamily: "'Sarabun Thin'",
    weight: 200,
    italic: true,
  },
  Sarabun_700_Italic: {
    fontFamily: "'Sarabun'",
    weight: 700,
    italic: true,
  },
  Sarabun_400: {
    fontFamily: "'Sarabun'",
    weight: 400,
    italic: false,
  },
  Sarabun_700: {
    fontFamily: "'Sarabun'",
    weight: 700,
    italic: false,
  },
  Sarabun_600: {
    fontFamily: "'Sarabun SemiBold'",
    weight: 600,
    italic: false,
  },
  Sarabun_600_Italic: {
    fontFamily: "'Sarabun SemiBold'",
    weight: 600,
    italic: true,
  },
  Sarabun_500: {
    fontFamily: "'Sarabun Medium'",
    weight: 500,
    italic: false,
  },
  Sarabun_800_Italic: {
    fontFamily: "'Sarabun ExtraBold'",
    weight: 800,
    italic: true,
  },
  Sarabun_500_Italic: {
    fontFamily: "'Sarabun Medium'",
    weight: 500,
    italic: true,
  },

  // Source Sans 3
  SourceSans3_500_Italic: {
    fontFamily: "'Source Sans 3 Medium'",
    weight: 500,
    italic: true,
  },
  SourceSans3_700: {
    fontFamily: "'Source Sans 3'",
    weight: 700,
    italic: false,
  },
  SourceSans3_800: {
    fontFamily: "'Source Sans 3 ExtraBold'",
    weight: 800,
    italic: false,
  },
  SourceSans3_900: {
    fontFamily: "'Source Sans 3 Black'",
    weight: 900,
    italic: false,
  },
  SourceSans3_600: {
    fontFamily: "'Source Sans 3 SemiBold'",
    weight: 600,
    italic: false,
  },
  SourceSans3_800_Italic: {
    fontFamily: "'Source Sans 3 ExtraBold'",
    weight: 800,
    italic: true,
  },
  SourceSans3_300_Italic: {
    fontFamily: "'Source Sans 3 Light'",
    weight: 300,
    italic: true,
  },
  SourceSans3_200_Italic: {
    fontFamily: "'Source Sans 3 ExtraLight'",
    weight: 200,
    italic: true,
  },
  SourceSans3_600_Italic: {
    fontFamily: "'Source Sans 3 SemiBold'",
    weight: 600,
    italic: true,
  },
  SourceSans3_400_Italic: {
    fontFamily: "'Source Sans 3'",
    weight: 400,
    italic: true,
  },
  SourceSans3_700_Italic: {
    fontFamily: "'Source Sans 3'",
    weight: 700,
    italic: true,
  },
  SourceSans3_400: {
    fontFamily: "'Source Sans 3'",
    weight: 400,
    italic: false,
  },
  SourceSans3_300: {
    fontFamily: "'Source Sans 3 Light'",
    weight: 300,
    italic: false,
  },
  SourceSans3_500: {
    fontFamily: "'Source Sans 3 Medium'",
    weight: 500,
    italic: false,
  },
  SourceSans3_900_Italic: {
    fontFamily: "'Source Sans 3 Black'",
    weight: 900,
    italic: true,
  },
  SourceSans3_200: {
    fontFamily: "'Source Sans 3 ExtraLight'",
    weight: 200,
    italic: false,
  },

  // Source Serif 4
  SourceSerif4_600_Italic: {
    fontFamily: "'Source Serif 4 SemiBold'",
    weight: 600,
    italic: true,
  },
  SourceSerif4_300_Italic: {
    fontFamily: "'Source Serif 4 Light'",
    weight: 300,
    italic: true,
  },
  SourceSerif4_700_Italic: {
    fontFamily: "'Source Serif 4'",
    weight: 700,
    italic: true,
  },
  SourceSerif4_700: {
    fontFamily: "'Source Serif 4'",
    weight: 700,
    italic: false,
  },
  SourceSerif4_200_Italic: {
    fontFamily: "'Source Serif 4 ExtraLight'",
    weight: 200,
    italic: true,
  },
  SourceSerif4_500: {
    fontFamily: "'Source Serif 4 Medium'",
    weight: 500,
    italic: false,
  },
  SourceSerif4_300: {
    fontFamily: "'Source Serif 4 Light'",
    weight: 300,
    italic: false,
  },
  SourceSerif4_900_Italic: {
    fontFamily: "'Source Serif 4 Black'",
    weight: 900,
    italic: true,
  },
  SourceSerif4_600: {
    fontFamily: "'Source Serif 4 SemiBold'",
    weight: 600,
    italic: false,
  },
  SourceSerif4_500_Italic: {
    fontFamily: "'Source Serif 4 Medium'",
    weight: 500,
    italic: true,
  },
  SourceSerif4_400_Italic: {
    fontFamily: "'Source Serif 4'",
    weight: 400,
    italic: true,
  },
  SourceSerif4_200: {
    fontFamily: "'Source Serif 4 ExtraLight'",
    weight: 200,
    italic: false,
  },
  SourceSerif4_800_Italic: {
    fontFamily: "'Source Serif 4 ExtraBold'",
    weight: 800,
    italic: true,
  },
  SourceSerif4_900: {
    fontFamily: "'Source Serif 4 Black'",
    weight: 900,
    italic: false,
  },
  SourceSerif4_400: {
    fontFamily: "'Source Serif 4'",
    weight: 400,
    italic: false,
  },
  SourceSerif4_800: {
    fontFamily: "'Source Serif 4 ExtraBold'",
    weight: 800,
    italic: false,
  },
};

type TimFontSetOption =
  | "Alegreya"
  | "Cambria"
  | "FiraMono"
  | "FiraSans"
  | "FiraSansCondensed"
  | "Gibson"
  | "IBMPlexSansCondensed"
  | "Inter"
  | "InterDisplay"
  | "Merriweather"
  | "National2"
  | "NotoSans"
  | "NotoSansEthiopic"
  | "Poppins"
  | "PragatiNarrow"
  | "RedditSans"
  | "Roboto"
  | "RobotoCondensed"
  | "RobotoMono"
  | "Sarabun"
  | "SourceSans3"
  | "SourceSerif4";

export const TIM_FONT_SETS: Record<TimFontSetOption, KeyFonts> = {
  Alegreya: {
    main400: TIM_FONTS.Alegreya_400,
    main700: TIM_FONTS.Alegreya_700,
  },
  Cambria: {
    main400: TIM_FONTS.Cambria_400,
    main700: TIM_FONTS.Cambria_700,
  },
  FiraMono: {
    main400: TIM_FONTS.FiraMono_400,
    main700: TIM_FONTS.FiraMono_700,
  },
  FiraSans: {
    main400: TIM_FONTS.FiraSans_400,
    main700: TIM_FONTS.FiraSans_700,
  },
  FiraSansCondensed: {
    main400: TIM_FONTS.FiraSansCondensed_400,
    main700: TIM_FONTS.FiraSansCondensed_700,
  },
  Gibson: {
    main400: TIM_FONTS.Gibson_400,
    main700: TIM_FONTS.Gibson_700,
  },
  IBMPlexSansCondensed: {
    main400: TIM_FONTS.IBMPlexSansCondensed_400,
    main700: TIM_FONTS.IBMPlexSansCondensed_700,
  },
  Inter: {
    main400: TIM_FONTS.Inter_400,
    main700: TIM_FONTS.Inter_700,
  },
  InterDisplay: {
    main400: TIM_FONTS.InterDisplay_400,
    main700: TIM_FONTS.InterDisplay_700,
  },
  Merriweather: {
    main400: TIM_FONTS.Merriweather_400,
    main700: TIM_FONTS.Merriweather_700,
  },
  National2: {
    main400: TIM_FONTS.National2_400,
    main700: TIM_FONTS.National2_700,
  },
  NotoSans: {
    main400: TIM_FONTS.NotoSans_400,
    main700: TIM_FONTS.NotoSans_700,
  },
  NotoSansEthiopic: {
    main400: TIM_FONTS.NotoSansEthiopic_400,
    main700: TIM_FONTS.NotoSansEthiopic_700,
  },
  Poppins: {
    main400: TIM_FONTS.Poppins_400,
    main700: TIM_FONTS.Poppins_700,
  },
  PragatiNarrow: {
    main400: TIM_FONTS.PragatiNarrow_400,
    main700: TIM_FONTS.PragatiNarrow_700,
  },
  RedditSans: {
    main400: TIM_FONTS.RedditSans_400,
    main700: TIM_FONTS.RedditSans_700,
  },
  Roboto: {
    main400: TIM_FONTS.Roboto_400,
    main700: TIM_FONTS.Roboto_700,
  },
  RobotoCondensed: {
    main400: TIM_FONTS.RobotoCondensed_400,
    main700: TIM_FONTS.RobotoCondensed_700,
  },
  RobotoMono: {
    main400: TIM_FONTS.RobotoMono_400,
    main700: TIM_FONTS.RobotoMono_700,
  },
  Sarabun: {
    main400: TIM_FONTS.Sarabun_400,
    main700: TIM_FONTS.Sarabun_700,
  },
  SourceSans3: {
    main400: TIM_FONTS.SourceSans3_400,
    main700: TIM_FONTS.SourceSans3_700,
  },
  SourceSerif4: {
    main400: TIM_FONTS.SourceSerif4_400,
    main700: TIM_FONTS.SourceSerif4_700,
  },};
