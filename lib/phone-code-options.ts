export type RawPhoneCodeOption = {
  dialCode: string
  label: string
}

export type PhoneCodeOption = RawPhoneCodeOption & {
  id: string
  country: string
  flag: string
}

export const FALLBACK_PHONE_CODES: RawPhoneCodeOption[] = [
  { dialCode: "+1", label: "🇺🇸 United States (+1)" },
  { dialCode: "+7", label: "🇷🇺 Russia (+7)" },
  { dialCode: "+20", label: "🇪🇬 Egypt (+20)" },
  { dialCode: "+27", label: "🇿🇦 South Africa (+27)" },
  { dialCode: "+30", label: "🇬🇷 Greece (+30)" },
  { dialCode: "+33", label: "🇫🇷 France (+33)" },
  { dialCode: "+34", label: "🇪🇸 Spain (+34)" },
  { dialCode: "+39", label: "🇮🇹 Italy (+39)" },
  { dialCode: "+44", label: "🇬🇧 United Kingdom (+44)" },
  { dialCode: "+49", label: "🇩🇪 Germany (+49)" },
  { dialCode: "+52", label: "🇲🇽 Mexico (+52)" },
  { dialCode: "+55", label: "🇧🇷 Brazil (+55)" },
  { dialCode: "+60", label: "🇲🇾 Malaysia (+60)" },
  { dialCode: "+61", label: "🇦🇺 Australia (+61)" },
  { dialCode: "+62", label: "🇮🇩 Indonesia (+62)" },
  { dialCode: "+63", label: "🇵🇭 Philippines (+63)" },
  { dialCode: "+64", label: "🇳🇿 New Zealand (+64)" },
  { dialCode: "+65", label: "🇸🇬 Singapore (+65)" },
  { dialCode: "+81", label: "🇯🇵 Japan (+81)" },
  { dialCode: "+82", label: "🇰🇷 South Korea (+82)" },
  { dialCode: "+86", label: "🇨🇳 China (+86)" },
  { dialCode: "+90", label: "🇹🇷 Turkey (+90)" },
  { dialCode: "+91", label: "🇮🇳 India (+91)" },
  { dialCode: "+92", label: "🇵🇰 Pakistan (+92)" },
  { dialCode: "+93", label: "🇦🇫 Afghanistan (+93)" },
  { dialCode: "+94", label: "🇱🇰 Sri Lanka (+94)" },
  { dialCode: "+95", label: "🇲🇲 Myanmar (+95)" },
  { dialCode: "+98", label: "🇮🇷 Iran (+98)" },
  { dialCode: "+211", label: "🇸🇸 South Sudan (+211)" },
  { dialCode: "+212", label: "🇲🇦 Morocco (+212)" },
  { dialCode: "+213", label: "🇩🇿 Algeria (+213)" },
  { dialCode: "+216", label: "🇹🇳 Tunisia (+216)" },
  { dialCode: "+218", label: "🇱🇾 Libya (+218)" },
  { dialCode: "+220", label: "🇬🇲 Gambia (+220)" },
  { dialCode: "+221", label: "🇸🇳 Senegal (+221)" },
  { dialCode: "+223", label: "🇲🇱 Mali (+223)" },
  { dialCode: "+224", label: "🇬🇳 Guinea (+224)" },
  { dialCode: "+225", label: "🇨🇮 Cote d'Ivoire (+225)" },
  { dialCode: "+226", label: "🇧🇫 Burkina Faso (+226)" },
  { dialCode: "+227", label: "🇳🇪 Niger (+227)" },
  { dialCode: "+228", label: "🇹🇬 Togo (+228)" },
  { dialCode: "+229", label: "🇧🇯 Benin (+229)" },
  { dialCode: "+230", label: "🇲🇺 Mauritius (+230)" },
  { dialCode: "+231", label: "🇱🇷 Liberia (+231)" },
  { dialCode: "+232", label: "🇸🇱 Sierra Leone (+232)" },
  { dialCode: "+233", label: "🇬🇭 Ghana (+233)" },
  { dialCode: "+234", label: "🇳🇬 Nigeria (+234)" },
  { dialCode: "+235", label: "🇹🇩 Chad (+235)" },
  { dialCode: "+236", label: "🇨🇫 Central African Republic (+236)" },
  { dialCode: "+237", label: "🇨🇲 Cameroon (+237)" },
  { dialCode: "+238", label: "🇨🇻 Cabo Verde (+238)" },
  { dialCode: "+239", label: "🇸🇹 Sao Tome and Principe (+239)" },
  { dialCode: "+240", label: "🇬🇶 Equatorial Guinea (+240)" },
  { dialCode: "+241", label: "🇬🇦 Gabon (+241)" },
  { dialCode: "+242", label: "🇨🇬 Congo (+242)" },
  { dialCode: "+243", label: "🇨🇩 DR Congo (+243)" },
  { dialCode: "+244", label: "🇦🇴 Angola (+244)" },
  { dialCode: "+245", label: "🇬🇼 Guinea-Bissau (+245)" },
  { dialCode: "+248", label: "🇸🇨 Seychelles (+248)" },
  { dialCode: "+249", label: "🇸🇩 Sudan (+249)" },
  { dialCode: "+250", label: "🇷🇼 Rwanda (+250)" },
  { dialCode: "+251", label: "🇪🇹 Ethiopia (+251)" },
  { dialCode: "+252", label: "🇸🇴 Somalia (+252)" },
  { dialCode: "+253", label: "🇩🇯 Djibouti (+253)" },
  { dialCode: "+254", label: "🇰🇪 Kenya (+254)" },
  { dialCode: "+255", label: "🇹🇿 Tanzania (+255)" },
  { dialCode: "+256", label: "🇺🇬 Uganda (+256)" },
  { dialCode: "+257", label: "🇧🇮 Burundi (+257)" },
  { dialCode: "+258", label: "🇲🇿 Mozambique (+258)" },
  { dialCode: "+260", label: "🇿🇲 Zambia (+260)" },
  { dialCode: "+261", label: "🇲🇬 Madagascar (+261)" },
  { dialCode: "+263", label: "🇿🇼 Zimbabwe (+263)" },
  { dialCode: "+264", label: "🇳🇦 Namibia (+264)" },
  { dialCode: "+265", label: "🇲🇼 Malawi (+265)" },
  { dialCode: "+266", label: "🇱🇸 Lesotho (+266)" },
  { dialCode: "+267", label: "🇧🇼 Botswana (+267)" },
  { dialCode: "+268", label: "🇸🇿 Eswatini (+268)" },
  { dialCode: "+269", label: "🇰🇲 Comoros (+269)" },
  { dialCode: "+350", label: "🇬🇮 Gibraltar (+350)" },
  { dialCode: "+351", label: "🇵🇹 Portugal (+351)" },
  { dialCode: "+352", label: "🇱🇺 Luxembourg (+352)" },
  { dialCode: "+353", label: "🇮🇪 Ireland (+353)" },
  { dialCode: "+354", label: "🇮🇸 Iceland (+354)" },
  { dialCode: "+355", label: "🇦🇱 Albania (+355)" },
  { dialCode: "+356", label: "🇲🇹 Malta (+356)" },
  { dialCode: "+357", label: "🇨🇾 Cyprus (+357)" },
  { dialCode: "+358", label: "🇫🇮 Finland (+358)" },
  { dialCode: "+359", label: "🇧🇬 Bulgaria (+359)" },
  { dialCode: "+370", label: "🇱🇹 Lithuania (+370)" },
  { dialCode: "+371", label: "🇱🇻 Latvia (+371)" },
  { dialCode: "+372", label: "🇪🇪 Estonia (+372)" },
  { dialCode: "+373", label: "🇲🇩 Moldova (+373)" },
  { dialCode: "+374", label: "🇦🇲 Armenia (+374)" },
  { dialCode: "+375", label: "🇧🇾 Belarus (+375)" },
  { dialCode: "+376", label: "🇦🇩 Andorra (+376)" },
  { dialCode: "+377", label: "🇲🇨 Monaco (+377)" },
  { dialCode: "+378", label: "🇸🇲 San Marino (+378)" },
  { dialCode: "+380", label: "🇺🇦 Ukraine (+380)" },
  { dialCode: "+381", label: "🇷🇸 Serbia (+381)" },
  { dialCode: "+382", label: "🇲🇪 Montenegro (+382)" },
  { dialCode: "+383", label: "🇽🇰 Kosovo (+383)" },
  { dialCode: "+385", label: "🇭🇷 Croatia (+385)" },
  { dialCode: "+386", label: "🇸🇮 Slovenia (+386)" },
  { dialCode: "+387", label: "🇧🇦 Bosnia and Herzegovina (+387)" },
  { dialCode: "+389", label: "🇲🇰 North Macedonia (+389)" },
  { dialCode: "+420", label: "🇨🇿 Czechia (+420)" },
  { dialCode: "+421", label: "🇸🇰 Slovakia (+421)" },
  { dialCode: "+423", label: "🇱🇮 Liechtenstein (+423)" },
  { dialCode: "+502", label: "🇬🇹 Guatemala (+502)" },
  { dialCode: "+503", label: "🇸🇻 El Salvador (+503)" },
  { dialCode: "+504", label: "🇭🇳 Honduras (+504)" },
  { dialCode: "+505", label: "🇳🇮 Nicaragua (+505)" },
  { dialCode: "+506", label: "🇨🇷 Costa Rica (+506)" },
  { dialCode: "+507", label: "🇵🇦 Panama (+507)" },
  { dialCode: "+508", label: "🇵🇲 Saint Pierre and Miquelon (+508)" },
  { dialCode: "+509", label: "🇭🇹 Haiti (+509)" },
  { dialCode: "+590", label: "🇬🇵 Guadeloupe (+590)" },
  { dialCode: "+591", label: "🇧🇴 Bolivia (+591)" },
  { dialCode: "+592", label: "🇬🇾 Guyana (+592)" },
  { dialCode: "+593", label: "🇪🇨 Ecuador (+593)" },
  { dialCode: "+594", label: "🇬🇫 French Guiana (+594)" },
  { dialCode: "+595", label: "🇵🇾 Paraguay (+595)" },
  { dialCode: "+596", label: "🇲🇶 Martinique (+596)" },
  { dialCode: "+597", label: "🇸🇷 Suriname (+597)" },
  { dialCode: "+598", label: "🇺🇾 Uruguay (+598)" },
  { dialCode: "+599", label: "🇨🇼 Curacao (+599)" },
  { dialCode: "+670", label: "🇹🇱 Timor-Leste (+670)" },
  { dialCode: "+672", label: "🇦🇶 Antarctica (+672)" },
  { dialCode: "+673", label: "🇧🇳 Brunei (+673)" },
  { dialCode: "+674", label: "🇳🇷 Nauru (+674)" },
  { dialCode: "+675", label: "🇵🇬 Papua New Guinea (+675)" },
  { dialCode: "+676", label: "🇹🇴 Tonga (+676)" },
  { dialCode: "+677", label: "🇸🇧 Solomon Islands (+677)" },
  { dialCode: "+678", label: "🇻🇺 Vanuatu (+678)" },
  { dialCode: "+679", label: "🇫🇯 Fiji (+679)" },
  { dialCode: "+680", label: "🇵🇼 Palau (+680)" },
  { dialCode: "+681", label: "🇼🇫 Wallis and Futuna (+681)" },
  { dialCode: "+682", label: "🇨🇰 Cook Islands (+682)" },
  { dialCode: "+683", label: "🇳🇺 Niue (+683)" },
  { dialCode: "+685", label: "🇼🇸 Samoa (+685)" },
  { dialCode: "+686", label: "🇰🇮 Kiribati (+686)" },
  { dialCode: "+687", label: "🇳🇨 New Caledonia (+687)" },
  { dialCode: "+688", label: "🇹🇻 Tuvalu (+688)" },
  { dialCode: "+689", label: "🇵🇫 French Polynesia (+689)" },
  { dialCode: "+690", label: "🇹🇰 Tokelau (+690)" },
  { dialCode: "+691", label: "🇫🇲 Micronesia (+691)" },
  { dialCode: "+692", label: "🇲🇭 Marshall Islands (+692)" },
  { dialCode: "+850", label: "🇰🇵 North Korea (+850)" },
  { dialCode: "+852", label: "🇭🇰 Hong Kong (+852)" },
  { dialCode: "+853", label: "🇲🇴 Macao (+853)" },
  { dialCode: "+855", label: "🇰🇭 Cambodia (+855)" },
  { dialCode: "+856", label: "🇱🇦 Laos (+856)" },
  { dialCode: "+880", label: "🇧🇩 Bangladesh (+880)" },
  { dialCode: "+886", label: "🇹🇼 Taiwan (+886)" },
  { dialCode: "+960", label: "🇲🇻 Maldives (+960)" },
  { dialCode: "+961", label: "🇱🇧 Lebanon (+961)" },
  { dialCode: "+962", label: "🇯🇴 Jordan (+962)" },
  { dialCode: "+963", label: "🇸🇾 Syria (+963)" },
  { dialCode: "+964", label: "🇮🇶 Iraq (+964)" },
  { dialCode: "+965", label: "🇰🇼 Kuwait (+965)" },
  { dialCode: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
  { dialCode: "+967", label: "🇾🇪 Yemen (+967)" },
  { dialCode: "+968", label: "🇴🇲 Oman (+968)" },
  { dialCode: "+970", label: "🇵🇸 Palestine (+970)" },
  { dialCode: "+971", label: "🇦🇪 United Arab Emirates (+971)" },
  { dialCode: "+972", label: "🇮🇱 Israel (+972)" },
  { dialCode: "+973", label: "🇧🇭 Bahrain (+973)" },
  { dialCode: "+974", label: "🇶🇦 Qatar (+974)" },
  { dialCode: "+975", label: "🇧🇹 Bhutan (+975)" },
  { dialCode: "+976", label: "🇲🇳 Mongolia (+976)" },
  { dialCode: "+977", label: "🇳🇵 Nepal (+977)" },
  { dialCode: "+992", label: "🇹🇯 Tajikistan (+992)" },
  { dialCode: "+993", label: "🇹🇲 Turkmenistan (+993)" },
  { dialCode: "+994", label: "🇦🇿 Azerbaijan (+994)" },
  { dialCode: "+995", label: "🇬🇪 Georgia (+995)" },
  { dialCode: "+996", label: "🇰🇬 Kyrgyzstan (+996)" },
  { dialCode: "+998", label: "🇺🇿 Uzbekistan (+998)" },
]

const getDialDigitsLength = (dialCode: string) => dialCode.replace(/[^\d]/g, "").length

const extractCountryName = (label: string) =>
  label.replace(/^[^\s]+\s/, "").replace(/\s\(\+\d{1,3}\)$/, "").trim()

const extractFlag = (label: string) => label.split(" ")[0] || "🏳️"

const normalizeCountryName = (countryName: string) => {
  if (countryName === "United States Minor Outlying Islands" || countryName === "United States") {
    return "United States of America"
  }
  return countryName
}

export const normalizePhoneCodeOptions = (options: RawPhoneCodeOption[]): PhoneCodeOption[] => {
  const byCountry = new Map<string, { country: string; flag: string; dialCode: string }>()

  for (const option of options) {
    let normalizedDialCode = option.dialCode.replace(/[^\d+]/g, "")
    if (!normalizedDialCode.startsWith("+")) continue
    if (getDialDigitsLength(normalizedDialCode) > 3) continue

    const countryName = normalizeCountryName(extractCountryName(option.label))
    const flag = extractFlag(option.label)
    if (countryName === "United States of America") {
      normalizedDialCode = "+1"
    }

    const existing = byCountry.get(countryName)
    if (!existing) {
      byCountry.set(countryName, { country: countryName, flag, dialCode: normalizedDialCode })
      continue
    }

    const existingLen = getDialDigitsLength(existing.dialCode)
    const nextLen = getDialDigitsLength(normalizedDialCode)
    if (nextLen < existingLen || (nextLen === existingLen && normalizedDialCode < existing.dialCode)) {
      byCountry.set(countryName, {
        country: countryName,
        flag,
        dialCode: normalizedDialCode,
      })
    }
  }

  return Array.from(byCountry.values())
    .sort((a, b) => a.country.localeCompare(b.country, undefined, { sensitivity: "base" }))
    .map((item) => ({
      id: `${item.country}::${item.dialCode}`,
      country: item.country,
      flag: item.flag,
      dialCode: item.dialCode,
      label: `${item.flag} ${item.country} (${item.dialCode})`,
    }))
}

export const NORMALIZED_FALLBACK_PHONE_CODES = normalizePhoneCodeOptions(FALLBACK_PHONE_CODES)

export type CountryOption = {
  value: string
  label: string
  flag: string
}

export const toCountryOptions = (phoneCodeOptions: PhoneCodeOption[]): CountryOption[] => {
  return phoneCodeOptions.map((option) => ({
    value: option.country,
    label: `${option.flag} ${option.country}`,
    flag: option.flag,
  }))
}
