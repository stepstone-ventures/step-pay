"use client"
import { useEffect, useMemo, useRef, useState, type SVGProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { LiquidButton } from "@/components/ui/liquid-button"
import { IconButton } from "@/components/ui/icon-button"
import { ThemeTogglerButton } from "@/components/ui/theme-toggler-button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FluidCursor } from "@/components/ui/fluid-cursor"
import { AnimateTabs, AnimateTabsContent, AnimateTabsList, AnimateTabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import { ShareButton } from "@/components/animate-ui/components/community/share-button"
import { RadialIntro } from "@/components/animate-ui/components/community/radial-intro"
import { MobileTopMenu } from "@/components/site/mobile-top-menu"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { getAuthRedirectOrigin } from "@/lib/auth/get-auth-redirect-origin"
import { getCurrencyForCountry } from "@/lib/currency-options"
import { ChevronDown, Eye, EyeOff } from "lucide-react"

const RADIAL_ITEMS = [
  {
    id: 1,
    name: "Framer University",
    src: "https://pbs.twimg.com/profile_images/1602734731728142336/9Bppcs67_400x400.jpg",
  },
  {
    id: 2,
    name: "arhamkhnz",
    src: "https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg",
  },
  {
    id: 3,
    name: "Skyleen",
    src: "https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg",
  },
  {
    id: 4,
    name: "Shadcn",
    src: "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg",
  },
  {
    id: 5,
    name: "Adam Wathan",
    src: "https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg",
  },
  {
    id: 6,
    name: "Guillermo Rauch",
    src: "https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg",
  },
  {
    id: 7,
    name: "Jhey",
    src: "https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg",
  },
  {
    id: 8,
    name: "David Haz",
    src: "https://pbs.twimg.com/profile_images/1927474594102784000/Al0g-I6o_400x400.jpg",
  },
  {
    id: 9,
    name: "Matt Perry",
    src: "https://pbs.twimg.com/profile_images/1690345911149375488/wfD0Ai9j_400x400.jpg",
  },
]

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M22 12.3c0-.8-.1-1.4-.2-2.1H12v4h5.6c-.1 1-.8 2.5-2.3 3.5l3.5 2.7c2.1-1.9 3.2-4.8 3.2-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.5-2.7c-.9.7-2.2 1.2-3.4 1.2-2.8 0-5.2-1.9-6.1-4.4l-3.6 2.8A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M5.9 13.6c-.2-.7-.3-1.1-.3-1.6s.1-1 .3-1.6l-3.6-2.8A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l2.8-2.1Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.9c1.7 0 3.2.6 4.3 1.7L19.1 5C17.2 3.2 14.8 2 12 2a10 10 0 0 0-8.8 5.6l3.6 2.8c.9-2.5 3.3-4.5 6.2-4.5Z"
        fill="#EA4335"
      />
    </svg>
  )
}

type RawPhoneCodeOption = {
  dialCode: string
  label: string
}

type PhoneCodeOption = RawPhoneCodeOption & {
  id: string
  country: string
  flag: string
}

const FALLBACK_PHONE_CODES: RawPhoneCodeOption[] = [
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

const normalizePhoneCodeOptions = (options: RawPhoneCodeOption[]): PhoneCodeOption[] => {
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

const NORMALIZED_FALLBACK_PHONE_CODES = normalizePhoneCodeOptions(FALLBACK_PHONE_CODES)

export default function SignupPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phoneCodeId: "",
    phoneCode: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
  })
  const [activeTab, setActiveTab] = useState("account")
  const [phoneCodeOptions, setPhoneCodeOptions] = useState<PhoneCodeOption[]>(NORMALIZED_FALLBACK_PHONE_CODES)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  const getSupabaseClient = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseBrowserClient()
    }
    return supabaseRef.current
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (dialCode: string, phone: string) => {
    const normalized = `${dialCode}${phone}`.replace(/[^\d+]/g, "")
    const phoneRegex = /^\+[1-9]\d{6,14}$/
    return phoneRegex.test(normalized)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field] || ((field === "phoneCode" || field === "phoneCodeId") && errors.phone)) {
      setErrors({
        ...errors,
        [field]: "",
        ...((field === "phoneCode" || field === "phoneCodeId") ? { phone: "" } : {}),
      })
    }
    setSubmitError(null)
    setSuccessMessage(null)
  }

  useEffect(() => {
    let active = true

    const loadPhoneCodes = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,flag")
        if (!response.ok) return
        const countries = await response.json()
        const fetchedOptions: RawPhoneCodeOption[] = []

        for (const country of countries) {
          const root = country?.idd?.root
          const suffixes: string[] = Array.isArray(country?.idd?.suffixes) ? country.idd.suffixes : []
          const name = country?.name?.common
          const flag = country?.flag ?? "🏳️"
          if (!root || !name || suffixes.length === 0) continue

          const candidateDialCodes = suffixes
            .map((suffix) => `${root}${suffix}`.replace(/[^\d+]/g, ""))
            .filter((dialCode) => dialCode.startsWith("+") && getDialDigitsLength(dialCode) > 0 && getDialDigitsLength(dialCode) <= 3)
            .sort((a, b) => {
              const lengthDiff = getDialDigitsLength(a) - getDialDigitsLength(b)
              return lengthDiff !== 0 ? lengthDiff : a.localeCompare(b)
            })

          for (const dialCode of candidateDialCodes) {
            fetchedOptions.push({
              dialCode,
              label: `${flag} ${name} (${dialCode})`,
            })
          }
        }

        const options = normalizePhoneCodeOptions(fetchedOptions)
        if (active && options.length > 0) {
          setPhoneCodeOptions(options)
        }
      } catch {
        // Keep fallback country code options if network fetch fails.
      }
    }

    loadPhoneCodes()

    return () => {
      active = false
    }
  }, [])

  const selectedPhoneCodeOption = useMemo(
    () => phoneCodeOptions.find((option) => option.id === formData.phoneCodeId),
    [formData.phoneCodeId, phoneCodeOptions]
  )

  const handlePhoneCodeSelect = (optionId: string) => {
    const selectedOption = phoneCodeOptions.find((option) => option.id === optionId)
    setFormData((prev) => ({
      ...prev,
      phoneCodeId: optionId,
      phoneCode: selectedOption?.dialCode ?? "",
    }))
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }))
    }
    setSubmitError(null)
    setSuccessMessage(null)
  }

  const countryOptions = useMemo(
    () =>
      phoneCodeOptions.map((option) => {
        return {
          value: option.country,
          label: `${option.flag} ${option.country}`,
        }
      }),
    [phoneCodeOptions]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSubmitError(null)
    setSuccessMessage(null)

    const newErrors: Record<string, string> = {}

    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address"
    if (!formData.phoneCode) newErrors.phone = "Please select a country code"
    else if (!formData.phone) newErrors.phone = "Phone number is required"
    else if (!validatePhone(formData.phoneCode, formData.phone)) newErrors.phone = "Please enter a valid phone number"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!acceptedTerms) newErrors.terms = "You must accept the terms and privacy policy"

    if (Object.keys(newErrors).length > 0) {
      setActiveTab(newErrors.password || newErrors.confirmPassword || newErrors.terms ? "password" : "account")
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      const fullPhoneNumber = `${formData.phoneCode}${formData.phone}`.replace(/[^\d+]/g, "")
      const preferredCurrency = getCurrencyForCountry(formData.country.trim())

      const { data: { user }, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${getAuthRedirectOrigin()}/auth/confirm`,
          data: {
            business_name: formData.businessName.trim(),
            phone_number: fullPhoneNumber,
            country: formData.country.trim(),
            ...(preferredCurrency ? { preferred_currency: preferredCurrency } : {}),
          },
        },
      })

      if (error) throw error
      if (!user) throw new Error("Signup failed")
      if (Array.isArray(user.identities) && user.identities.length === 0) {
        setSuccessMessage(
          `This email is already registered. Sign in with your existing password or reset your password from the login page.`
        )
        setActiveTab("account")
        return
      }

      setSuccessMessage(
        `Account created! Please check your email (${formData.email}) and click the confirmation link to verify your account.`
      )
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during signup. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setErrors({})
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      const supabase = getSupabaseClient()
      const redirectUrl = new URL("/auth/confirm", getAuthRedirectOrigin())
      redirectUrl.searchParams.set("next", "/dashboard")

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl.toString(),
        },
      })

      if (error) {
        throw error
      }

      if (data.url) {
        window.location.assign(data.url)
        return
      }

      throw new Error("Could not start Google sign up.")
    } catch (err: any) {
      setSubmitError(err.message || "Could not start Google sign up.")
      setGoogleLoading(false)
    }
  }

  const tabDescription =
    activeTab === "account"
      ? "Fill in your business details to get started."
      : "Your password should be at least 8 characters, consisting of letters, at least one number and at least one special character."

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <FluidCursor className="z-0" />
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-1.5">
            <div className="relative h-10 w-14">
              <Image
                src="/steppay-logo-liquid.png?v=3"
                alt="StepPay logo"
                fill
                sizes="64px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-lg sm:text-xl tracking-tight">StepPay</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-4">
            <ThemeTogglerButton variant="secondary" size="default" className="border border-border/60" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                  Receive Payments
                  <ChevronDown className="ml-2 h-4 w-4" />
                </LiquidButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-72 z-[120]">
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full cursor-pointer">
                    Request Money from Anyone Anywhere
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full cursor-pointer">
                    Charge Clients In-Shop
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login" className="w-full cursor-pointer">
                    Integrate Online Checkout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="mailto:support@steppay.com?subject=StepPay%20Contact%20Sales">
              <LiquidButton className="px-4 py-2 text-sm font-semibold border border-border/60">
                Contact Sales
              </LiquidButton>
            </a>
            <ShareButton />
          </div>
          <MobileTopMenu className="sm:hidden" contactSalesAsMenuRow />
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="relative mx-auto mb-5 h-16 aspect-[1597/1172]">
              <Image
                src="/steppay-logo-liquid.png?v=3"
                alt="StepPay logo"
                fill
                sizes="88px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="fx-shield">Create your account</span>
            </h1>
            <p className="text-muted-foreground">
              <span className="fx-shield">Start accepting payments in minutes</span>
            </p>
          </div>
          <RadialIntro className="mb-8 h-48" orbitItems={RADIAL_ITEMS} />
          <Card className="relative overflow-hidden border-border/50 shadow-lg">
            <BorderBeam duration={15} />
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <p className="text-sm text-muted-foreground">{tabDescription}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimateTabs value={activeTab} onValueChange={setActiveTab}>
                  <AnimateTabsList className="grid-cols-2 w-full">
                    <AnimateTabsTrigger value="account">Account</AnimateTabsTrigger>
                    <AnimateTabsTrigger value="password">Password</AnimateTabsTrigger>
                  </AnimateTabsList>

                  <AnimateTabsContent value="account" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="My Business Ltd"
                        value={formData.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        className={errors.businessName ? "border-destructive" : ""}
                      />
                      {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="grid grid-cols-[minmax(9rem,11rem)_1fr] gap-2">
                        <Select
                          value={formData.phoneCodeId}
                          onValueChange={handlePhoneCodeSelect}
                        >
                          <SelectTrigger id="phoneCode" className={errors.phone ? "border-destructive" : ""}>
                            {selectedPhoneCodeOption ? (
                              <span className="truncate">
                                {selectedPhoneCodeOption.flag} {selectedPhoneCodeOption.dialCode}
                              </span>
                            ) : (
                              <SelectValue placeholder="Code" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            {phoneCodeOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="24 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          className={errors.phone ? "border-destructive" : ""}
                        />
                      </div>
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleChange("country", value)}
                      >
                        <SelectTrigger id="country" className={errors.country ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {countryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                    </div>
                  </AnimateTabsContent>

                  <AnimateTabsContent value="password" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          className={errors.password ? "border-destructive pr-10" : "pr-10"}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          hoverScale={1}
                          tapScale={1}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 leading-none"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </span>
                        </IconButton>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                        />
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          hoverScale={1}
                          tapScale={1}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 leading-none"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center">
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </span>
                        </IconButton>
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => {
                            setAcceptedTerms(checked)
                            if (errors.terms) {
                              setErrors({ ...errors, terms: "" })
                            }
                          }}
                          className={errors.terms ? "mt-1 border-destructive" : "mt-1"}
                        />
                        <Label htmlFor="terms" className="font-normal cursor-pointer text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
                    </div>
                  </AnimateTabsContent>
                </AnimateTabs>

                <LiquidButton type="submit" className="w-full py-3 text-lg" disabled={loading || googleLoading}>
                  {loading ? "Submitting..." : "Sign Up"}
                </LiquidButton>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <LiquidButton
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full py-3 text-lg border border-border/60"
                  disabled={loading || googleLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5 shrink-0" />
                  {googleLoading ? "Redirecting..." : "Sign up with Google"}
                </LiquidButton>
                {submitError && <p className="text-sm text-destructive text-center">{submitError}</p>}
                {successMessage && <p className="text-sm text-green-600 text-center font-medium mt-2">{successMessage}</p>}
              </form>
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-8 relative z-20 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 StepPay Incorporated. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
