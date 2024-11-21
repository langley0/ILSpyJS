import assert from "assert";
import { CalendarId, CalendarData, CultureInfo } from "System.Globalization";

export class CultureData {
    private static readonly LocaleNameMaxLength = 85;
    private static readonly NaN = -1;

    // Override flag
    private _sRealName?: string = undefined!; // Name you passed in (ie: en-US, en, or de-DE_phoneb). Initialized by helper called during initialization.
    private _sWindowsName?: string; // Name OS thinks the object is (ie: de-DE_phoneb, or en-US (even if en was passed in))

    // Identity
    private _sName?: string; // locale name (ie: en-us, NO sort info, but could be neutral)
    private _sParent?: string; // Parent name (which may be a custom locale/culture)
    private _sEnglishDisplayName?: string; // English pretty name for this locale
    private _sNativeDisplayName?: string; // Native pretty name for this locale
    private _sSpecificCulture?: string; // The culture name to be used in CultureInfo.CreateSpecificCulture(), en-US form if neutral, sort name if sort

    // Language
    private _sISO639Language?: string; // ISO 639 Language Name
    private _sISO639Language2?: string; // ISO 639 Language Name
    private _sEnglishLanguage?: string; // English name for this language
    private _sNativeLanguage?: string; // Native name of this language
    private _sAbbrevLang?: string; // abbreviated language name (Windows Language Name) ex: ENU
    private _sConsoleFallbackName?: string; // The culture name for the console fallback UI culture
    private _iInputLanguageHandle: number = NaN; // input language handle

    // Region
    private _sRegionName?: string; // (RegionInfo)
    private _sLocalizedCountry?: string; // localized country name
    private _sEnglishCountry?: string; // english country name (RegionInfo)
    private _sNativeCountry?: string; // native country name
    private _sISO3166CountryName?: string; // ISO 3166 (RegionInfo), ie: US
    private _sISO3166CountryName2?: string; // 3 char ISO 3166 country name 2 2(RegionInfo) ex: USA (ISO)
    private _iGeoId: number = NaN; // GeoId

    // Numbers
    private _sPositiveSign?: string; // (user can override) positive sign
    private _sNegativeSign?: string; // (user can override) negative sign
    // (nfi populates these 5, don't have to be = NaN)
    private _iDigits: number = 0; // (user can override) number of fractional digits
    private _iNegativeNumber: number = 0; // (user can override) negative number format
    private _waGrouping?: number[]; // (user can override) grouping of digits
    private _sDecimalSeparator?: string; // (user can override) decimal separator
    private _sThousandSeparator?: string; // (user can override) thousands separator
    private _sNaN?: string; // Not a Number
    private _sPositiveInfinity?: string; // + Infinity
    private _sNegativeInfinity?: string; // - Infinity

    // Percent
    private _iNegativePercent: number = NaN; // Negative Percent (0-3)
    private _iPositivePercent: number = NaN; // Positive Percent (0-11)
    private _sPercent?: string; // Percent (%) symbol
    private _sPerMille?: string; // PerMille symbol

    // Currency
    private _sCurrency?: string; // (user can override) local monetary symbol
    private _sIntlMonetarySymbol?: string; // international monetary symbol (RegionInfo)
    private _sEnglishCurrency?: string; // English name for this currency
    private _sNativeCurrency?: string; // Native name for this currency
    // (nfi populates these 4, don't have to be = NaN)
    private _iCurrencyDigits: number = 0; // (user can override) # local monetary fractional digits
    private _iCurrency: number = 0; // (user can override) positive currency format
    private _iNegativeCurrency: number = 0; // (user can override) negative currency format
    private _waMonetaryGrouping?: number[]; // (user can override) monetary grouping of digits
    private _sMonetaryDecimal?: string; // (user can override) monetary decimal separator
    private _sMonetaryThousand?: string; // (user can override) monetary thousands separator

    // Misc
    private _iMeasure: number = NaN; // (user can override) system of measurement 0=metric, 1=US (RegionInfo)
    private _sListSeparator?: string; // (user can override) list separator

    // Time
    private _sAM1159?: string; // (user can override) AM designator
    private _sPM2359?: string; // (user can override) PM designator
    private _sTimeSeparator?: string;
    private _saLongTimes: string[] | undefined; // (user can override) time format
    private _saShortTimes: string[] | undefined; // (user can override) short time format

    // Calendar specific data
    private _iFirstDayOfWeek: number = NaN; // (user can override) first day of week (gregorian really)
    private _iFirstWeekOfYear: number = NaN; // (user can override) first week of year (gregorian really)
    private _waCalendars?: CalendarId[]; // all available calendar type(s).  The first one is the default calendar

    // Store for specific data about each calendar
    private _calendars?: (CalendarData | undefined)[]; // Store for specific calendar data

    // Text information
    private _iReadingLayout: number = NaN; // Reading layout data
    // 0 - Left to right (eg en-US)
    // 1 - Right to left (eg arabic locales)
    // 2 - Vertical top to bottom with columns to the left and also left to right (ja-JP locales)
    // 3 - Vertical top to bottom with columns proceeding to the right

    // CoreCLR depends on this even though its not exposed publicly.

    private _iDefaultAnsiCodePage: number = NaN; // default ansi code page ID (ACP)
    private _iDefaultOemCodePage: number = NaN; // default oem code page ID (OCP or OEM)
    private _iDefaultMacCodePage: number = NaN; // default macintosh code page
    private _iDefaultEbcdicCodePage: number = NaN; // default EBCDIC code page

    private _iLanguage: number = 0; // locale ID (0409) - NO sort information
    private _bUseOverrides: boolean = false; // use user overrides? this depends on user setting and if is user default locale.
    private _bUseOverridesUserSetting: boolean = false; // the setting the user requested for.
    private _bNeutral: boolean = false; // Flags for the culture (ie: neutral or not right now)

    /// <summary>
    /// Region Name to Culture Name mapping table
    /// </summary>
    /// <remarks>
    /// Using a property so we avoid creating the dictionary until we need it
    /// </remarks>
    private static get RegionNames(): Map<string, string> {
        if (CultureData.s_regionNames == undefined) {
            const form = new Map<string, string>();
            form.set("001", "en-001");

            form.set("029", "en-029");
            form.set("150", "en-150");
            form.set("419", "es-419");
            form.set("AD", "ca-AD");
            form.set("AE", "ar-AE");
            form.set("AF", "prs-AF");
            form.set("AG", "en-AG");
            form.set("AI", "en-AI");
            form.set("AL", "sq-AL");
            form.set("AM", "hy-AM");
            form.set("AO", "pt-AO");
            form.set("AQ", "en-AQ");
            form.set("AR", "es-AR");
            form.set("AS", "en-AS");
            form.set("AT", "de-AT");
            form.set("AU", "en-AU");
            form.set("AW", "nl-AW");
            form.set("AX", "sv-AX");
            form.set("AZ", "az-Cyrl-AZ");
            form.set("BA", "bs-Latn-BA");
            form.set("BB", "en-BB");
            form.set("BD", "bn-BD");
            form.set("BE", "nl-BE");
            form.set("BF", "fr-BF");
            form.set("BG", "bg-BG");
            form.set("BH", "ar-BH");
            form.set("BI", "rn-BI");
            form.set("BJ", "fr-BJ");
            form.set("BL", "fr-BL");
            form.set("BM", "en-BM");
            form.set("BN", "ms-BN");
            form.set("BO", "es-BO");
            form.set("BQ", "nl-BQ");
            form.set("BR", "pt-BR");
            form.set("BS", "en-BS");
            form.set("BT", "dz-BT");
            form.set("BV", "nb-BV");
            form.set("BW", "en-BW");
            form.set("BY", "be-BY");
            form.set("BZ", "en-BZ");
            form.set("CA", "en-CA");
            form.set("CC", "en-CC");
            form.set("CD", "fr-CD");
            form.set("CF", "sg-CF");
            form.set("CG", "fr-CG");
            form.set("CH", "it-CH");
            form.set("CI", "fr-CI");
            form.set("CK", "en-CK");
            form.set("CL", "es-CL");
            form.set("CM", "fr-CM");
            form.set("CN", "zh-CN");
            form.set("CO", "es-CO");
            form.set("CR", "es-CR");
            form.set("CS", "sr-Cyrl-CS");
            form.set("CU", "es-CU");
            form.set("CV", "pt-CV");
            form.set("CW", "nl-CW");
            form.set("CX", "en-CX");
            form.set("CY", "el-CY");
            form.set("CZ", "cs-CZ");
            form.set("DE", "de-DE");
            form.set("DJ", "fr-DJ");
            form.set("DK", "da-DK");
            form.set("DM", "en-DM");
            form.set("DO", "es-DO");
            form.set("DZ", "ar-DZ");
            form.set("EC", "es-EC");
            form.set("EE", "et-EE");
            form.set("EG", "ar-EG");
            form.set("ER", "tig-ER");
            form.set("ES", "es-ES");
            form.set("ET", "am-ET");
            form.set("FI", "fi-FI");
            form.set("FJ", "en-FJ");
            form.set("FK", "en-FK");
            form.set("FM", "en-FM");
            form.set("FO", "fo-FO");
            form.set("FR", "fr-FR");
            form.set("GA", "fr-GA");
            form.set("GB", "en-GB");
            form.set("GD", "en-GD");
            form.set("GE", "ka-GE");
            form.set("GF", "fr-GF");
            form.set("GG", "en-GG");
            form.set("GH", "en-GH");
            form.set("GI", "en-GI");
            form.set("GL", "kl-GL");
            form.set("GM", "en-GM");
            form.set("GN", "fr-GN");
            form.set("GP", "fr-GP");
            form.set("GQ", "es-GQ");
            form.set("GR", "el-GR");
            form.set("GS", "en-GS");
            form.set("GT", "es-GT");
            form.set("GU", "en-GU");
            form.set("GW", "pt-GW");
            form.set("GY", "en-GY");
            form.set("HK", "zh-HK");
            form.set("HM", "en-HM");
            form.set("HN", "es-HN");
            form.set("HR", "hr-HR");
            form.set("HT", "fr-HT");
            form.set("HU", "hu-HU");
            form.set("ID", "id-ID");
            form.set("IE", "en-IE");
            form.set("IL", "he-IL");
            form.set("IM", "gv-IM");
            form.set("IN", "hi-IN");
            form.set("IO", "en-IO");
            form.set("IQ", "ar-IQ");
            form.set("IR", "fa-IR");
            form.set("IS", "is-IS");
            form.set("IT", "it-IT");
            form.set("IV", "");
            form.set("JE", "en-JE");
            form.set("JM", "en-JM");
            form.set("JO", "ar-JO");
            form.set("JP", "ja-JP");
            form.set("KE", "sw-KE");
            form.set("KG", "ky-KG");
            form.set("KH", "km-KH");
            form.set("KI", "en-KI");
            form.set("KM", "ar-KM");
            form.set("KN", "en-KN");
            form.set("KP", "ko-KP");
            form.set("KR", "ko-KR");
            form.set("KW", "ar-KW");
            form.set("KY", "en-KY");
            form.set("KZ", "kk-KZ");
            form.set("LA", "lo-LA");
            form.set("LB", "ar-LB");
            form.set("LC", "en-LC");
            form.set("LI", "de-LI");
            form.set("LK", "si-LK");
            form.set("LR", "en-LR");
            form.set("LS", "st-LS");
            form.set("LT", "lt-LT");
            form.set("LU", "lb-LU");
            form.set("LV", "lv-LV");
            form.set("LY", "ar-LY");
            form.set("MA", "ar-MA");
            form.set("MC", "fr-MC");
            form.set("MD", "ro-MD");
            form.set("ME", "sr-Latn-ME");
            form.set("MF", "fr-MF");
            form.set("MG", "mg-MG");
            form.set("MH", "en-MH");
            form.set("MK", "mk-MK");
            form.set("ML", "fr-ML");
            form.set("MM", "my-MM");
            form.set("MN", "mn-MN");
            form.set("MO", "zh-MO");
            form.set("MP", "en-MP");
            form.set("MQ", "fr-MQ");
            form.set("MR", "ar-MR");
            form.set("MS", "en-MS");
            form.set("MT", "mt-MT");
            form.set("MU", "en-MU");
            form.set("MV", "dv-MV");
            form.set("MW", "en-MW");
            form.set("MX", "es-MX");
            form.set("MY", "ms-MY");
            form.set("MZ", "pt-MZ");
            form.set("NA", "en-NA");
            form.set("NC", "fr-NC");
            form.set("NE", "fr-NE");
            form.set("NF", "en-NF");
            form.set("NG", "ig-NG");
            form.set("NI", "es-NI");
            form.set("NL", "nl-NL");
            form.set("NO", "nn-NO");
            form.set("NP", "ne-NP");
            form.set("NR", "en-NR");
            form.set("NU", "en-NU");
            form.set("NZ", "en-NZ");
            form.set("OM", "ar-OM");
            form.set("PA", "es-PA");
            form.set("PE", "es-PE");
            form.set("PF", "fr-PF");
            form.set("PG", "en-PG");
            form.set("PH", "en-PH");
            form.set("PK", "ur-PK");
            form.set("PL", "pl-PL");
            form.set("PM", "fr-PM");
            form.set("PN", "en-PN");
            form.set("PR", "es-PR");
            form.set("PS", "ar-PS");
            form.set("PT", "pt-PT");
            form.set("PW", "en-PW");
            form.set("PY", "es-PY");
            form.set("QA", "ar-QA");
            form.set("RE", "fr-RE");
            form.set("RO", "ro-RO");
            form.set("RS", "sr-Latn-RS");
            form.set("RU", "ru-RU");
            form.set("RW", "rw-RW");
            form.set("SA", "ar-SA");
            form.set("SB", "en-SB");
            form.set("SC", "fr-SC");
            form.set("SD", "ar-SD");
            form.set("SE", "sv-SE");
            form.set("SG", "zh-SG");
            form.set("SH", "en-SH");
            form.set("SI", "sl-SI");
            form.set("SJ", "nb-SJ");
            form.set("SK", "sk-SK");
            form.set("SL", "en-SL");
            form.set("SM", "it-SM");
            form.set("SN", "wo-SN");
            form.set("SO", "so-SO");
            form.set("SR", "nl-SR");
            form.set("SS", "en-SS");
            form.set("ST", "pt-ST");
            form.set("SV", "es-SV");
            form.set("SX", "nl-SX");
            form.set("SY", "ar-SY");
            form.set("SZ", "ss-SZ");
            form.set("TC", "en-TC");
            form.set("TD", "fr-TD");
            form.set("TF", "fr-TF");
            form.set("TG", "fr-TG");
            form.set("TH", "th-TH");
            form.set("TJ", "tg-Cyrl-TJ");
            form.set("TK", "en-TK");
            form.set("TL", "pt-TL");
            form.set("TM", "tk-TM");
            form.set("TN", "ar-TN");
            form.set("TO", "to-TO");
            form.set("TR", "tr-TR");
            form.set("TT", "en-TT");
            form.set("TV", "en-TV");
            form.set("TW", "zh-TW");
            form.set("TZ", "sw-TZ");
            form.set("UA", "uk-UA");
            form.set("UG", "sw-UG");
            form.set("UM", "en-UM");
            form.set("US", "en-US");
            form.set("UY", "es-UY");
            form.set("UZ", "uz-Cyrl-UZ");
            form.set("VA", "it-VA");
            form.set("VC", "en-VC");
            form.set("VE", "es-VE");
            form.set("VG", "en-VG");
            form.set("VI", "en-VI");
            form.set("VN", "vi-VN");
            form.set("VU", "fr-VU");
            form.set("WF", "fr-WF");
            form.set("WS", "en-WS");
            form.set("XK", "sq-XK");
            form.set("YE", "ar-YE");
            form.set("YT", "fr-YT");
            form.set("ZA", "af-ZA");
            form.set("ZM", "en-ZM");
            form.set("ZW", "en-ZW");


            CultureData.s_regionNames = form;
        }
        return CultureData.s_regionNames;
    };

    // Cache of regions we've already looked up
    private static s_cachedRegions?: Map<string, CultureData>;
    private static s_regionNames?: Map<string, string>;

    //     /// <summary>
    //     /// The culture name to use to interop with the underlying native globalization libraries like ICU or Windows NLS APIs.
    //     /// For example, we can have the name de_DE@collation=phonebook when using ICU for the German culture de-DE with the phonebook sorting behavior.
    //     /// </summary>
    //     public string? InteropName => _sWindowsName;

    //     public static CultureData? GetCultureDataForRegion(string? cultureName, bool useUserOverride)
    //     {
    //         // First do a shortcut for Invariant
    //         if (string.IsNullOrEmpty(cultureName))
    //         {
    //             return Invariant;
    //         }

    //         // First check if GetCultureData() can find it (ie: its a real culture)
    //         CultureData? retVal = GetCultureData(cultureName, useUserOverride);
    //         if (retVal != undefined && !retVal.IsNeutralCulture)
    //         {
    //             return retVal;
    //         }

    //         // If it was neutral remember that so that RegionInfo() can throw the right exception
    //         CultureData? neutral = retVal;

    //         // Try the hash table next
    //         string hashName = AnsiToLower(useUserOverride ? cultureName : cultureName + '*');
    //         Dictionary<string, CultureData>? tempHashTable = s_cachedRegions;

    //         if (tempHashTable == undefined)
    //         {
    //             // No table yet, make a new one
    //             tempHashTable = new Dictionary<string, CultureData>();
    //         }
    //         else
    //         {
    //             // Check the hash table
    //             lock (s_lock)
    //             {
    //                 tempHashTable.TryGetValue(hashName, out retVal);
    //             }
    //             if (retVal != undefined)
    //             {
    //                 return retVal;
    //             }
    //         }

    //         // Not found in the hash table, look it up the hard way

    //         // If not a valid mapping from the registry we'll have to try the hard coded table
    //         if (retVal == undefined || retVal.IsNeutralCulture)
    //         {
    //             // Not a valid mapping, try the hard coded table
    //             if (RegionNames.TryGetValue(cultureName, out string? name))
    //             {
    //                 // Make sure we can get culture data for it
    //                 retVal = GetCultureData(name, useUserOverride);
    //             }
    //         }

    //         // If not found in the hard coded table we'll have to find a culture that works for us
    //         if (!GlobalizationMode.Invariant && (retVal == undefined || retVal.IsNeutralCulture))
    //         {
    //             retVal = GlobalizationMode.UseNls ? NlsGetCultureDataFromRegionName(cultureName) : IcuGetCultureDataFromRegionName();
    //         }

    //         // If we found one we can use, then cache it for next time
    //         if (retVal != undefined && !retVal.IsNeutralCulture)
    //         {
    //             // first add it to the cache
    //             lock (s_lock)
    //             {
    //                 tempHashTable[hashName] = retVal;
    //             }

    //             // Copy the hashtable to the corresponding member variables.  This will potentially overwrite
    //             // new tables simultaneously created by a new thread, but maximizes thread safety.
    //             s_cachedRegions = tempHashTable;
    //         }
    //         else
    //         {
    //             // Unable to find a matching culture/region, return undefined or neutral
    //             // (regionInfo throws a more specific exception on neutrals)
    //             retVal = neutral;
    //         }

    //         // Return the found culture to use, undefined, or the neutral culture.
    //         return retVal;
    //     }

    //     // Clear our public caches
    //     public static void ClearCachedData()
    //     {
    //         s_cachedCultures = undefined;
    //         s_cachedRegions = undefined;
    //     }

    //     public static CultureInfo[] GetCultures(CultureTypes types)
    //     {
    //         // Disable  warning 618: System.Globalization.CultureTypes.FrameworkCultures' is obsolete
    // #pragma warning disable 618
    //         // Validate flags
    //         if ((int)types <= 0 || ((int)types & (int)~(CultureTypes.NeutralCultures | CultureTypes.SpecificCultures |
    //                                                     CultureTypes.InstalledWin32Cultures | CultureTypes.UserCustomCulture |
    //                                                     CultureTypes.ReplacementCultures | CultureTypes.WindowsOnlyCultures |
    //                                                     CultureTypes.FrameworkCultures)) != 0)
    //         {
    //             throw new ArgumentOutOfRangeException(nameof(types),
    //                           SR.Format(SR.ArgumentOutOfRange_Range, CultureTypes.NeutralCultures, CultureTypes.FrameworkCultures));
    //         }

    //         // We have deprecated CultureTypes.FrameworkCultures.
    //         // When this enum is used, we will enumerate Whidbey framework cultures (for compatibility).

    //         // We have deprecated CultureTypes.WindowsOnlyCultures.
    //         // When this enum is used, we will return an empty array for this enum.
    //         if ((types & CultureTypes.WindowsOnlyCultures) != 0)
    //         {
    //             // Remove the enum as it is an no-op.
    //             types &= (~CultureTypes.WindowsOnlyCultures);
    //         }

    //         if (GlobalizationMode.Invariant)
    //         {
    //             // in invariant mode we always return invariant culture only from the enumeration
    //             return [new CultureInfo("")];
    //         }

    // #pragma warning restore 618
    //         return GlobalizationMode.UseNls ? NlsEnumCultures(types) : IcuEnumCultures(types);
    //     }

    private static CreateCultureWithInvariantData(): CultureData {
        // Make a new culturedata
        const invariant = new CultureData();

        // Basics
        // Note that we override the resources since this IS NOT supposed to change (by definition)
        invariant._bUseOverrides = false;
        invariant._bUseOverridesUserSetting = false;
        invariant._sRealName = "";                     // Name you passed in (ie: en-US, en, or de-DE_phoneb)
        invariant._sWindowsName = "";                     // Name OS thinks the object is (ie: de-DE_phoneb, or en-US (even if en was passed in))

        // Identity
        invariant._sName = "";                     // locale name (ie: en-us)
        invariant._sParent = "";                     // Parent name (which may be a custom locale/culture)
        invariant._bNeutral = false;                   // Flags for the culture (ie: neutral or not right now)
        invariant._sEnglishDisplayName = "Invariant Language (Invariant Country)"; // English pretty name for this locale
        invariant._sNativeDisplayName = "Invariant Language (Invariant Country)";  // Native pretty name for this locale
        invariant._sSpecificCulture = "";                     // The culture name to be used in CultureInfo.CreateSpecificCulture()

        // Language
        invariant._sISO639Language = "iv";                   // ISO 639 Language Name
        invariant._sISO639Language2 = "ivl";                  // 3 char ISO 639 lang name 2
        invariant._sEnglishLanguage = "Invariant Language";   // English name for this language
        invariant._sNativeLanguage = "Invariant Language";   // Native name of this language
        invariant._sAbbrevLang = "IVL";                  // abbreviated language name (Windows Language Name)
        invariant._sConsoleFallbackName = "";            // The culture name for the console fallback UI culture
        invariant._iInputLanguageHandle = 0x07F;         // input language handle

        // Region
        invariant._sRegionName = "IV";                    // (RegionInfo)
        invariant._sEnglishCountry = "Invariant Country"; // english country name (RegionInfo)
        invariant._sNativeCountry = "Invariant Country";  // native country name (Windows Only)
        invariant._sISO3166CountryName = "IV";            // (RegionInfo), ie: US
        invariant._sISO3166CountryName2 = "ivc";          // 3 char ISO 3166 country name 2 2(RegionInfo)
        invariant._iGeoId = 244;                          // GeoId (Windows Only)

        // Numbers
        invariant._sPositiveSign = "+";                    // positive sign
        invariant._sNegativeSign = "-";                    // negative sign
        invariant._iDigits = 2;                      // number of fractional digits
        invariant._iNegativeNumber = 1;                      // negative number format
        invariant._waGrouping = [3];          // grouping of digits
        invariant._sDecimalSeparator = ".";                    // decimal separator
        invariant._sThousandSeparator = ",";                    // thousands separator
        invariant._sNaN = "NaN";                  // Not a Number
        invariant._sPositiveInfinity = "Infinity";             // + Infinity
        invariant._sNegativeInfinity = "-Infinity";            // - Infinity

        // Percent
        invariant._iNegativePercent = 0;                      // Negative Percent (0-3)
        invariant._iPositivePercent = 0;                      // Positive Percent (0-11)
        invariant._sPercent = "%";                    // Percent (%) symbol
        invariant._sPerMille = "\x2030";               // PerMille symbol

        // Currency
        invariant._sCurrency = "\x00a4";                // local monetary symbol: for international monetary symbol
        invariant._sIntlMonetarySymbol = "XDR";                  // international monetary symbol (RegionInfo)
        invariant._sEnglishCurrency = "International Monetary Fund"; // English name for this currency (Windows Only)
        invariant._sNativeCurrency = "International Monetary Fund"; // Native name for this currency (Windows Only)
        invariant._iCurrencyDigits = 2;                      // # local monetary fractional digits
        invariant._iCurrency = 0;                      // positive currency format
        invariant._iNegativeCurrency = 0;                      // negative currency format
        invariant._waMonetaryGrouping = [3];          // monetary grouping of digits
        invariant._sMonetaryDecimal = ".";                    // monetary decimal separator
        invariant._sMonetaryThousand = ",";                    // monetary thousands separator

        // Misc
        invariant._iMeasure = 0;                      // system of measurement 0=metric, 1=US (RegionInfo)
        invariant._sListSeparator = ",";                    // list separator

        // Time
        invariant._sTimeSeparator = ":";
        invariant._sAM1159 = "AM";                   // AM designator
        invariant._sPM2359 = "PM";                   // PM designator
        invariant._saLongTimes = ["HH:mm:ss"];                             // time format
        invariant._saShortTimes = ["HH:mm", "hh:mm tt", "H:mm", "h:mm tt"]; // short time format

        // Calendar specific data
        invariant._iFirstDayOfWeek = 0;                      // first day of week
        invariant._iFirstWeekOfYear = 0;                      // first week of year

        // all available calendar type(s).  The first one is the default calendar
        invariant._waCalendars = [CalendarId.GREGORIAN];

        // if (!GlobalizationMode.InvariantNoLoad)
        // {
        //     // Store for specific data about each calendar
        //     invariant._calendars = new CalendarData[CalendarData.MAX_CALENDARS];
        //     invariant._calendars[0] = CalendarData.Invariant;
        // }

        // Text information
        invariant._iReadingLayout = 0;

        // These are .NET Framework only, not coreclr

        invariant._iLanguage = CultureInfo.LOCALE_INVARIANT;   // locale ID (0409) - NO sort information
        invariant._iDefaultAnsiCodePage = 1252;         // default ansi code page ID (ACP)
        invariant._iDefaultOemCodePage = 437;           // default oem code page ID (OCP or OEM)
        invariant._iDefaultMacCodePage = 10000;         // default macintosh code page
        invariant._iDefaultEbcdicCodePage = 37;        // default EBCDIC code page

        // if (GlobalizationMode.InvariantNoLoad)
        // {
        //     invariant._sLocalizedCountry = invariant._sNativeCountry;
        // }

        return invariant;
    }

    /// <summary>
    /// Build our invariant information
    /// We need an invariant instance, which we build hard-coded
    /// </summary>
    public static get Invariant(): CultureData {
        CultureData.s_Invariant = CultureData.s_Invariant || CultureData.CreateCultureWithInvariantData();
        return CultureData.s_Invariant;
    }
    private static s_Invariant?: CultureData;

    // Cache of cultures we've already looked up
    private static s_cachedCultures?: Map<string, CultureData>;

    public static GetCultureData(cultureName: string, useUserOverride: boolean): CultureData | undefined {
        // First do a shortcut for Invariant
        if (cultureName == "") {
            return CultureData.Invariant;
        }

        // if (GlobalizationMode.PredefinedCulturesOnly)
        // {
        //     if (GlobalizationMode.Invariant || (GlobalizationMode.UseNls ? !NlsIsEnsurePredefinedLocaleName(cultureName) : !IcuIsEnsurePredefinedLocaleName(cultureName))) {
        //         return undefined;
        //     }
        // }

        // Try the hash table first
        const hashName = this.AnsiToLower(useUserOverride ? cultureName : cultureName + '*');
        let tempHashTable = CultureData.s_cachedCultures;
        if (tempHashTable == undefined) {
            // No table yet, make a new one
            tempHashTable = new Map<string, CultureData>();
        }
        else {
            // Check the hash table

            let retVal = tempHashTable.get(hashName)
            if (retVal != undefined) {
                return retVal;
            }
        }
        // Not found in the hash table, need to see if we can build one that works for us
        const culture = this.CreateCultureData(cultureName, useUserOverride);
        if (culture == undefined) {
            return undefined;
        }

        // Found one, add it to the cache
        tempHashTable.set(hashName, culture);


        // Copy the hashtable to the corresponding member variables.  This will potentially overwrite
        // new tables simultaneously created by a new thread, but maximizes thread safety.
        CultureData.s_cachedCultures = tempHashTable;

        return culture;
    }

    //     private static string NormalizeCultureName(string name, out bool isNeutralName)
    //     {
    //         isNeutralName = true;
    //         int i = 0;

    //         if (name.Length > LocaleNameMaxLength)
    //         {
    //             // Theoretically we shouldn't hit this exception.
    //             throw new ArgumentException(SR.Format(SR.Argument_InvalidId, nameof(name)));
    //         }

    //         Span<char> normalizedName = stackalloc char[name.Length];

    //         bool changed = false;

    //         while (i < name.Length && name[i] != '-' && name[i] != '_')
    //         {
    //             if (char.IsAsciiLetterUpper(name[i]))
    //             {
    //                 // lowercase characters before '-'
    //                 normalizedName[i] = (char)(((int)name[i]) + 0x20);
    //                 changed = true;
    //             }
    //             else
    //             {
    //                 normalizedName[i] = name[i];
    //             }
    //             i++;
    //         }

    //         if (i < name.Length)
    //         {
    //             // this is not perfect to detect the non neutral cultures but it is good enough when we are running in invariant mode
    //             isNeutralName = false;
    //         }

    //         while (i < name.Length)
    //         {
    //             if (char.IsAsciiLetterLower(name[i]))
    //             {
    //                 normalizedName[i] = (char)(((int)name[i]) - 0x20);
    //                 changed = true;
    //             }
    //             else
    //             {
    //                 normalizedName[i] = name[i];
    //             }
    //             i++;
    //         }

    //         if (changed)
    //         {
    //             return new string(normalizedName);
    //         }

    //         return name;
    //     }

    private static CreateCultureData(cultureName: string, useUserOverride: boolean): CultureData | undefined {
        throw new Error("Not implemented");
        // if (GlobalizationMode.Invariant)
        // {
        //     if (cultureName.Length > LocaleNameMaxLength || !CultureInfo.VerifyCultureName(cultureName, false))
        //     {
        //         return undefined;
        //     }
        //     CultureData cd = CreateCultureWithInvariantData();
        //     cd._sName = NormalizeCultureName(cultureName, out cd._bNeutral);
        //     cd._bUseOverridesUserSetting = useUserOverride;
        //     cd._sRealName = cd._sName;
        //     cd._sWindowsName = cd._sName;
        //     cd._iLanguage = CultureInfo.LOCALE_CUSTOM_UNSPECIFIED;

        //     return cd;
        // }

        // if (cultureName.Length == 1 && (cultureName[0] == 'C' || cultureName[0] == 'c'))
        // {
        //     // Always map the "C" locale to Invariant to avoid mapping it to en_US_POSIX on Linux because POSIX
        //     // locale collation doesn't support case insensitive comparisons.
        //     // We do the same mapping on Windows for the sake of consistency.
        //     return Invariant;
        // }

        // CultureData culture = new CultureData();
        // culture._sRealName = cultureName;
        // culture._bUseOverridesUserSetting = useUserOverride;

        // // Ask native code if that one's real, populate _sWindowsName
        // if (!culture.InitCultureDataCore() && !culture.InitCompatibilityCultureData())
        // {
        //     return undefined;
        // }


        // // We need _sWindowsName to be initialized to know if we're using overrides.
        // culture.InitUserOverride(useUserOverride);
        // return culture;
    }

    //     private bool InitCompatibilityCultureData()
    //     {
    //         // for compatibility handle the deprecated ids: zh-chs, zh-cht
    //         string cultureName = _sRealName!;

    //         string fallbackCultureName;
    //         string realCultureName;
    //         switch (AnsiToLower(cultureName))
    //         {
    //             case "zh-chs":
    //                 fallbackCultureName = "zh-Hans";
    //                 realCultureName = "zh-CHS";
    //                 break;
    //             case "zh-cht":
    //                 fallbackCultureName = "zh-Hant";
    //                 realCultureName = "zh-CHT";
    //                 break;
    //             default:
    //                 return false;
    //         }

    //         _sRealName = fallbackCultureName;
    //         if (!InitCultureDataCore())
    //         {
    //             return false;
    //         }

    //         // fixup our data
    //         _sName = realCultureName; // the name that goes back to the user
    //         _sParent = fallbackCultureName;

    //         return true;
    //     }

    //     /// We'd rather people use the named version since this doesn't allow custom locales
    //     public static CultureData GetCultureData(int culture, bool bUseUserOverride)
    //     {
    //         CultureData? retVal = undefined;

    //         if (culture == CultureInfo.LOCALE_INVARIANT)
    //         {
    //             return Invariant;
    //         }

    //         if (GlobalizationMode.Invariant)
    //         {
    //             if (!GlobalizationMode.PredefinedCulturesOnly)
    //             {
    //                 if (culture is < 1 or > 0xf_ffff)
    //                 {
    //                     throw new CultureNotFoundException(nameof(culture), culture, SR.Argument_CultureNotSupported);
    //                 }

    //                 return Invariant;
    //             }

    //             // LCID is not supported in the InvariantMode
    //             throw new CultureNotFoundException(nameof(culture), culture, SR.Argument_CultureNotSupportedInInvariantMode);
    //         }

    //         // Convert the lcid to a name, then use that
    //         string? localeName = LCIDToLocaleName(culture);

    //         if (!string.IsNullOrEmpty(localeName))
    //         {
    //             // Valid name, use it
    //             retVal = GetCultureData(localeName, bUseUserOverride);
    //         }

    //         // If not successful, throw
    //         if (retVal == undefined)
    //         {
    //             throw new CultureNotFoundException(nameof(culture), culture, SR.Argument_CultureNotSupported);
    //         }

    //         // Return the one we found
    //         return retVal;
    //     }

    /// <summary>
    /// The real name used to construct the locale (ie: de-DE_phoneb)
    /// </summary>
    public get CultureName(): string {
        assert(this._sRealName != undefined, "[CultureData.CultureName] Expected _sRealName to be populated by already");
        // since windows doesn't know about zh-CHS and zh-CHT,
        // we leave sRealName == zh-Hanx but we still need to
        // pretend that it was zh-CHX.
        return this._sName == "zh-CHS" || this._sName == "zh-CHT" ? this._sName : this._sRealName;

    }

    /// <summary>
    /// Did the user request to use overrides?
    /// </summary>
    public get UseUserOverride(): boolean {
        return this._bUseOverridesUserSetting;
    }

    /// <summary>
    /// locale name (ie: de-DE, NO sort information)
    /// </summary>
    public get Name(): string {
        return this._sName ?? "";
    }

    // Parent name (which may be a custom locale/culture)
    // Ask using the real name, so that we get parents of neutrals
    public get ParentName(): string {
        // this._sParent == this._sParent ?? this.GetLocaleInfoCore(this._sRealName!, LocaleStringData.ParentName);
        // return this._sParent;
        throw new Error("Not implemented");
    }

    //     // Localized pretty name for this locale (ie: Inglis (estados Unitos))
    //     public string DisplayName
    //     {
    //         get
    //         {
    //             string? localizedDisplayName = NativeName;
    //             if (!GlobalizationMode.Invariant && Name.Length > 0)
    //             {
    //                 try
    //                 {
    //                     localizedDisplayName = GetLanguageDisplayNameCore(
    //                         Name.Equals("zh-CHT", StringComparison.OrdinalIgnoreCase) ? "zh-Hant" :
    //                         Name.Equals("zh-CHS", StringComparison.OrdinalIgnoreCase) ? "zh-Hans" :
    //                         Name);
    //                 }
    //                 catch
    //                 {
    //                     // do nothing
    //                 }

    //                 // If it hasn't been found (Windows 8 and up), fallback to the system
    //                 if (string.IsNullOrEmpty(localizedDisplayName) && IsNeutralCulture)
    //                 {
    //                     localizedDisplayName = LocalizedLanguageName;
    //                 }
    //             }

    //             return localizedDisplayName!;
    //         }
    //     }

    //     private string GetLanguageDisplayNameCore(string cultureName) => GlobalizationMode.UseNls ?
    //                                                                         NlsGetLanguageDisplayName(cultureName) :
    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //                                                                      GlobalizationMode.Hybrid ?
    //                                                                         GetLocaleInfoNative(cultureName, LocaleStringData.LocalizedDisplayName, CultureInfo.CurrentUICulture.Name) :
    // #endif
    //                                                                         IcuGetLanguageDisplayName(cultureName);

    //     /// <summary>
    //     /// English pretty name for this locale (ie: English (United States))
    //     /// </summary>
    //     public string EnglishName
    //     {
    //         get
    //         {
    //             string? englishDisplayName = _sEnglishDisplayName;
    //             if (englishDisplayName == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 // If its neutral use the language name
    //                 if (IsNeutralCulture)
    //                 {
    //                     englishDisplayName = GetLocaleInfoCore(LocaleStringData.EnglishDisplayName);
    //                     if (string.IsNullOrEmpty(englishDisplayName))
    //                     {
    //                         englishDisplayName = EnglishLanguageName;
    //                     }

    //                     // differentiate the legacy display names
    //                     switch (_sName)
    //                     {
    //                         case "zh-CHS":
    //                         case "zh-CHT":
    //                             englishDisplayName += " Legacy";
    //                             break;
    //                     }
    //                 }
    //                 else
    //                 {
    //                     englishDisplayName = GetLocaleInfoCore(LocaleStringData.EnglishDisplayName);

    //                     // if it isn't found build one:
    //                     if (string.IsNullOrEmpty(englishDisplayName))
    //                     {
    //                         // Our existing names mostly look like:
    //                         // "English" + "United States" -> "English (United States)"
    //                         // "Azeri (Latin)" + "Azerbaijan" -> "Azeri (Latin, Azerbaijan)"
    //                         if (EnglishLanguageName.EndsWith(')'))
    //                         {
    //                             // "Azeri (Latin)" + "Azerbaijan" -> "Azeri (Latin, Azerbaijan)"
    //                             englishDisplayName = string.Concat(
    //                                 EnglishLanguageName.AsSpan(0, _sEnglishLanguage!.Length - 1),
    //                                 ", ",
    //                                 EnglishCountryName,
    //                                 ")");
    //                         }
    //                         else
    //                         {
    //                             // "English" + "United States" -> "English (United States)"
    //                             englishDisplayName = EnglishLanguageName + " (" + EnglishCountryName + ")";
    //                         }
    //                     }
    //                 }

    //                 _sEnglishDisplayName = englishDisplayName;
    //             }

    //             return englishDisplayName!;
    //         }
    //     }

    //     /// <summary>
    //     /// Native pretty name for this locale (ie: Deutsch (Deutschland))
    //     /// </summary>
    //     public string NativeName
    //     {
    //         get
    //         {
    //             string? nativeDisplayName = _sNativeDisplayName;
    //             if (nativeDisplayName == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 // If its neutral use the language name
    //                 if (IsNeutralCulture)
    //                 {
    //                     nativeDisplayName = GetLocaleInfoCore(LocaleStringData.NativeDisplayName);
    //                     if (string.IsNullOrEmpty(nativeDisplayName))
    //                     {
    //                         nativeDisplayName = NativeLanguageName;
    //                     }

    //                     // differentiate the legacy display names
    //                     switch (_sName)
    //                     {
    //                         case "zh-CHS":
    //                             nativeDisplayName += " \u65E7\u7248";
    //                             break;
    //                         case "zh-CHT":
    //                             nativeDisplayName += " \u820A\u7248";
    //                             break;
    //                     }
    //                 }
    //                 else
    //                 {
    //                     nativeDisplayName = GetLocaleInfoCore(LocaleStringData.NativeDisplayName);

    //                     // if it isn't found build one:
    //                     if (string.IsNullOrEmpty(nativeDisplayName))
    //                     {
    //                         // These should primarily be "Deutsch (Deutschland)" type names
    //                         nativeDisplayName = NativeLanguageName + " (" + NativeCountryName + ")";
    //                     }
    //                 }

    //                 _sNativeDisplayName = nativeDisplayName;
    //             }

    //             return nativeDisplayName!;
    //         }
    //     }

    //     /// <summary>
    //     /// The culture name to be used in CultureInfo.CreateSpecificCulture()
    //     /// </summary>
    //     public string SpecificCultureName
    //     {
    //         get
    //         {
    //             // This got populated during the culture initialization
    //             assert(_sSpecificCulture != undefined, "[CultureData.SpecificCultureName] Expected this.sSpecificCulture to be populated by culture data initialization already");
    //             return _sSpecificCulture;
    //         }
    //     }

    //     /// <summary>
    //     /// iso 639 language name, ie: en
    //     /// </summary>
    //     public string TwoLetterISOLanguageName => _sISO639Language ??= GetLocaleInfoCore(LocaleStringData.Iso639LanguageTwoLetterName);

    //     /// <summary>
    //     /// iso 639 language name, ie: eng
    //     /// </summary>
    //     public string ThreeLetterISOLanguageName => _sISO639Language2 ??= GetLocaleInfoCore(LocaleStringData.Iso639LanguageThreeLetterName);

    //     /// <summary>
    //     /// abbreviated windows language name (ie: enu) (non-standard, avoid this)
    //     /// </summary>
    //     public string ThreeLetterWindowsLanguageName => _sAbbrevLang ??= GlobalizationMode.UseNls ?
    //                                                                         NlsGetThreeLetterWindowsLanguageName(_sRealName!) :
    //                                                                         IcuGetThreeLetterWindowsLanguageName(_sRealName!);

    //     /// <summary>
    //     /// Localized name for this language
    //     /// </summary>
    //     private string LocalizedLanguageName
    //     {
    //         get
    //         {
    //             string localizedLanguage = NativeLanguageName;
    //             if (!GlobalizationMode.Invariant && Name.Length > 0)
    //             {
    //                 // If ICU is enabled we call it anyway. If NLS, we call it only if the Windows UI language match the Current UI language
    //                 if (!GlobalizationMode.UseNls || CultureInfo.UserDefaultUICulture?.Name == CultureInfo.CurrentUICulture.Name)
    //                 {
    //                     localizedLanguage = GetLocaleInfoCore(LocaleStringData.LocalizedLanguageName, CultureInfo.CurrentUICulture.Name);
    //                 }
    //             }

    //             return localizedLanguage;
    //         }
    //     }

    //     /// <summary>
    //     /// English name for this language (Windows Only) ie: German
    //     /// </summary>
    //     private string EnglishLanguageName => _sEnglishLanguage ??= GetLocaleInfoCore(LocaleStringData.EnglishLanguageName);

    //     /// <summary>
    //     /// Native name of this language (Windows Only) ie: Deutsch
    //     /// </summary>
    //     private string NativeLanguageName => _sNativeLanguage ??= GetLocaleInfoCore(LocaleStringData.NativeLanguageName);

    //     /// <summary>
    //     /// region name (eg US)
    //     /// </summary>
    //     public string RegionName => _sRegionName ??= GetLocaleInfoCore(LocaleStringData.Iso3166CountryName);

    //     public int GeoId
    //     {
    //         get
    //         {
    //             if (_iGeoId == NaN && !GlobalizationMode.Invariant)
    //             {
    //                 _iGeoId = GlobalizationMode.UseNls ? NlsGetLocaleInfo(LocaleNumberData.GeoId) : IcuGetGeoId(_sRealName!);
    //             }
    //             return _iGeoId;
    //         }
    //     }

    //     /// <summary>
    //     /// localized name for the country
    //     /// </summary>
    //     public string LocalizedCountryName
    //     {
    //         get
    //         {
    //             string? localizedCountry = _sLocalizedCountry;
    //             if (localizedCountry == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 try
    //                 {
    //                     localizedCountry = GlobalizationMode.UseNls ? NlsGetRegionDisplayName() : IcuGetRegionDisplayName();
    //                 }
    //                 catch
    //                 {
    //                     // do nothing. we'll fallback
    //                 }

    //                 localizedCountry ??= NativeCountryName;
    //                 _sLocalizedCountry = localizedCountry;
    //             }

    //             return localizedCountry!;
    //         }
    //     }

    //     /// <summary>
    //     /// english country name (RegionInfo) ie: Germany
    //     /// </summary>
    //     public string EnglishCountryName => _sEnglishCountry ??= GetLocaleInfoCore(LocaleStringData.EnglishCountryName);

    //     /// <summary>
    //     /// native country name (RegionInfo) ie: Deutschland
    //     /// </summary>
    //     public string NativeCountryName => _sNativeCountry ??= GetLocaleInfoCore(LocaleStringData.NativeCountryName);

    //     /// <summary>
    //     /// ISO 3166 Country Name
    //     /// </summary>
    //     public string TwoLetterISOCountryName => _sISO3166CountryName ??= GetLocaleInfoCore(LocaleStringData.Iso3166CountryName);

    //     /// <summary>
    //     /// 3 letter ISO 3166 country code
    //     /// </summary>
    //     public string ThreeLetterISOCountryName => _sISO3166CountryName2 ??= GetLocaleInfoCore(LocaleStringData.Iso3166CountryName2);

    //     public int KeyboardLayoutId
    //     {
    //         get
    //         {
    //             if (_iInputLanguageHandle == NaN)
    //             {
    //                 if (IsSupplementalCustomCulture)
    //                 {
    //                     _iInputLanguageHandle = 0x0409;
    //                 }
    //                 else
    //                 {
    //                     // Input Language is same as LCID for built-in cultures
    //                     _iInputLanguageHandle = LCID;
    //                 }
    //             }
    //             return _iInputLanguageHandle;
    //         }
    //     }

    //     /// <summary>
    //     /// Console fallback name (ie: locale to use for console apps for unicode-only locales)
    //     /// </summary>
    //     public string SCONSOLEFALLBACKNAME => _sConsoleFallbackName ??= GlobalizationMode.UseNls ?
    //                                                                         NlsGetConsoleFallbackName(_sRealName!) :
    //                                                                         IcuGetConsoleFallbackName(_sRealName!);

    //     /// <summary>
    //     /// grouping of digits
    //     /// (user can override)
    //     /// </summary>
    //     public int[] NumberGroupSizes => _waGrouping ??= GetLocaleInfoCoreUserOverride(LocaleGroupingData.Digit);

    //     /// <summary>
    //     /// Not a Number
    //     /// </summary>
    //     private string NaNSymbol => _sNaN ??= GetLocaleInfoCore(LocaleStringData.NaNSymbol);

    //     /// <summary>
    //     /// + Infinity
    //     /// </summary>
    //     private string PositiveInfinitySymbol => _sPositiveInfinity ??= GetLocaleInfoCore(LocaleStringData.PositiveInfinitySymbol);

    //     /// <summary>
    //     /// - Infinity
    //     /// </summary>
    //     private string NegativeInfinitySymbol => _sNegativeInfinity ??= GetLocaleInfoCore(LocaleStringData.NegativeInfinitySymbol);

    //     /// <summary>
    //     /// Negative Percent (0-3)
    //     /// </summary>
    //     private int PercentNegativePattern
    //     {
    //         get
    //         {
    //             if (_iNegativePercent == NaN)
    //             {
    //                 // Note that <= Windows Vista this is synthesized by native code
    //                 _iNegativePercent = GetLocaleInfoCore(LocaleNumberData.NegativePercentFormat);
    //             }
    //             return _iNegativePercent;
    //         }
    //     }

    //     /// <summary>
    //     /// Positive Percent (0-11)
    //     /// </summary>
    //     private int PercentPositivePattern
    //     {
    //         get
    //         {
    //             if (_iPositivePercent == NaN)
    //             {
    //                 // Note that <= Windows Vista this is synthesized by native code
    //                 _iPositivePercent = GetLocaleInfoCore(LocaleNumberData.PositivePercentFormat);
    //             }
    //             return _iPositivePercent;
    //         }
    //     }

    //     /// <summary>
    //     /// Percent (%) symbol
    //     /// </summary>
    //     private string PercentSymbol => _sPercent ??= GetLocaleInfoCore(LocaleStringData.PercentSymbol);

    //     /// <summary>
    //     /// PerMille symbol
    //     /// </summary>
    //     private string PerMilleSymbol => _sPerMille ??= GetLocaleInfoCore(LocaleStringData.PerMilleSymbol);

    //     /// <summary>
    //     /// local monetary symbol, eg: $
    //     /// (user can override)
    //     /// </summary>
    //     public string CurrencySymbol => _sCurrency ??= GetLocaleInfoCoreUserOverride(LocaleStringData.MonetarySymbol);

    //     /// <summary>
    //     /// international monetary symbol (RegionInfo), eg: USD
    //     /// </summary>
    //     public string ISOCurrencySymbol => _sIntlMonetarySymbol ??= GetLocaleInfoCore(LocaleStringData.Iso4217MonetarySymbol);

    //     /// <summary>
    //     /// English name for this currency (RegionInfo), eg: US Dollar
    //     /// </summary>
    //     public string CurrencyEnglishName => _sEnglishCurrency ??= GetLocaleInfoCore(LocaleStringData.CurrencyEnglishName);

    //     /// <summary>
    //     /// Native name for this currency (RegionInfo), eg: Schweiz Frank
    //     /// </summary>
    //     public string CurrencyNativeName => _sNativeCurrency ??= GetLocaleInfoCore(LocaleStringData.CurrencyNativeName);

    //     /// <summary>
    //     /// monetary grouping of digits
    //     /// (user can override)
    //     /// </summary>
    //     public int[] CurrencyGroupSizes => _waMonetaryGrouping ??= GetLocaleInfoCoreUserOverride(LocaleGroupingData.Monetary);

    //     /// <summary>
    //     /// system of measurement 0=metric, 1=US (RegionInfo)
    //     /// (user can override)
    //     /// </summary>
    //     public int MeasurementSystem
    //     {
    //         get
    //         {
    //             if (_iMeasure == NaN)
    //             {
    //                 _iMeasure = GetLocaleInfoCoreUserOverride(LocaleNumberData.MeasurementSystem);
    //             }
    //             return _iMeasure;
    //         }
    //     }

    //     /// <summary>
    //     /// list Separator
    //     /// (user can override)
    //     /// </summary>
    //     public string ListSeparator => _sListSeparator ??= ShouldUseUserOverrideNlsData ? NlsGetLocaleInfo(LocaleStringData.ListSeparator) : IcuGetListSeparator(_sWindowsName);

    //     /// <summary>
    //     /// AM designator
    //     /// (user can override)
    //     /// </summary>
    //     public string AMDesignator => _sAM1159 ??= GetLocaleInfoCoreUserOverride(LocaleStringData.AMDesignator);

    //     /// <summary>
    //     /// PM designator
    //     /// (user can override)
    //     /// </summary>
    //     public string PMDesignator => _sPM2359 ??= GetLocaleInfoCoreUserOverride(LocaleStringData.PMDesignator);

    //     /// <summary>
    //     /// time format
    //     /// (user can override)
    //     /// </summary>
    //     public string[] LongTimes
    //     {
    //         get
    //         {
    //             if (_saLongTimes == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 string[]? longTimes = GetTimeFormatsCore(shortFormat: false);
    //                 _saLongTimes = longTimes != undefined && longTimes.Length != 0 ? longTimes : Invariant._saLongTimes!;
    //             }

    //             return _saLongTimes!;
    //         }
    //     }

    //     /// <summary>
    //     /// Short times (derived from long times format)
    //     /// (user can override)
    //     /// </summary>
    //     public string[] ShortTimes
    //     {
    //         get
    //         {
    //             if (_saShortTimes == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 // Try to get the short times from the OS/culture.dll
    //                 // If we couldn't find short times, then compute them from long times
    //                 // (eg: CORECLR on < Win7 OS & fallback for missing culture.dll)
    //                 string[]? shortTimes = GetTimeFormatsCore(shortFormat: true);
    //                 _saShortTimes = shortTimes != undefined && shortTimes.Length != 0 ? shortTimes : DeriveShortTimesFromLong();
    //             }

    //             return _saShortTimes!;
    //         }
    //     }

    //     private string[] DeriveShortTimesFromLong()
    //     {
    //         // Our logic is to look for h,H,m,s,t.  If we find an s, then we check the string
    //         // between it and the previous marker, if any.  If its a short, unescaped separator,
    //         // then we don't retain that part.
    //         // We then check after the ss and remove anything before the next h,H,m,t...
    //         string[] longTimes = LongTimes;
    //         string[] shortTimes = new string[longTimes.Length];

    //         for (int i = 0; i < longTimes.Length; i++)
    //         {
    //             shortTimes[i] = StripSecondsFromPattern(longTimes[i]);
    //         }
    //         return shortTimes;
    //     }

    //     private static string StripSecondsFromPattern(string time)
    //     {
    //         bool bEscape = false;
    //         int iLastToken = -1;

    //         // Find the seconds
    //         for (int j = 0; j < time.Length; j++)
    //         {
    //             // Change escape mode?
    //             if (time[j] == '\'')
    //             {
    //                 // Continue
    //                 bEscape = !bEscape;
    //                 continue;
    //             }

    //             // See if there was a single \
    //             if (time[j] == '\\')
    //             {
    //                 // Skip next char
    //                 j++;
    //                 continue;
    //             }

    //             if (bEscape)
    //             {
    //                 continue;
    //             }

    //             switch (time[j])
    //             {
    //                 // Check for seconds
    //                 case 's':
    //                     // Found seconds, see if there was something unescaped and short between
    //                     // the last marker and the seconds.  Windows says separator can be a
    //                     // maximum of three characters (without undefined)
    //                     // If 1st or last characters were ', then ignore it
    //                     if ((j - iLastToken) <= 4 && (j - iLastToken) > 1 &&
    //                         (time[iLastToken + 1] != '\'') &&
    //                         (time[j - 1] != '\''))
    //                     {
    //                         // There was something there we want to remember
    //                         if (iLastToken >= 0)
    //                         {
    //                             j = iLastToken + 1;
    //                         }
    //                     }

    //                     bool containsSpace;
    //                     int endIndex = GetIndexOfNextTokenAfterSeconds(time, j, out containsSpace);

    //                     string sep;

    //                     if (containsSpace)
    //                     {
    //                         sep = " ";
    //                     }
    //                     else
    //                     {
    //                         sep = "";
    //                     }

    //                     time = string.Concat(time.AsSpan(0, j), sep, time.AsSpan(endIndex));
    //                     break;
    //                 case 'm':
    //                 case 'H':
    //                 case 'h':
    //                     iLastToken = j;
    //                     break;
    //             }
    //         }
    //         return time;
    //     }

    //     private static int GetIndexOfNextTokenAfterSeconds(string time, int index, out bool containsSpace)
    //     {
    //         bool shouldEscape = false;
    //         containsSpace = false;
    //         for (; index < time.Length; index++)
    //         {
    //             switch (time[index])
    //             {
    //                 case '\'':
    //                     shouldEscape = !shouldEscape;
    //                     continue;
    //                 case '\\':
    //                     index++;
    //                     if (time[index] == ' ')
    //                     {
    //                         containsSpace = true;
    //                     }
    //                     continue;
    //                 case ' ':
    //                     containsSpace = true;
    //                     break;
    //                 case 't':
    //                 case 'm':
    //                 case 'H':
    //                 case 'h':
    //                     if (shouldEscape)
    //                     {
    //                         continue;
    //                     }
    //                     return index;
    //             }
    //         }
    //         containsSpace = false;
    //         return index;
    //     }

    //     /// <summary>
    //     /// first day of week
    //     /// (user can override)
    //     /// </summary>
    //     public int FirstDayOfWeek
    //     {
    //         get
    //         {
    //             if (_iFirstDayOfWeek == NaN && !GlobalizationMode.Invariant)
    //             {
    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //                 if (GlobalizationMode.Hybrid)
    //                 {
    //                     _iFirstDayOfWeek = GetLocaleInfoNative(LocaleNumberData.FirstDayOfWeek);
    //                 }
    //                 else
    // #elif TARGET_BROWSER
    //                 if (GlobalizationMode.Hybrid)
    //                 {
    //                     assert(_sName != undefined, "[FirstDayOfWeek] Expected _sName to be populated already");
    //                     _iFirstDayOfWeek = GetFirstDayOfWeek(_sName);
    //                 }
    //                 else
    // #endif
    //                 {
    //                     _iFirstDayOfWeek = ShouldUseUserOverrideNlsData ? NlsGetFirstDayOfWeek() : IcuGetLocaleInfo(LocaleNumberData.FirstDayOfWeek);
    //                 }
    //             }
    //             return _iFirstDayOfWeek;
    //         }
    //     }

    //     /// <summary>
    //     /// first week of year
    //     /// (user can override)
    //     /// </summary>
    //     public int CalendarWeekRule
    //     {
    //         get
    //         {
    //             if (_iFirstWeekOfYear == NaN)
    //             {
    // #if TARGET_BROWSER
    //                 if (GlobalizationMode.Hybrid)
    //                 {
    //                     assert(_sName != undefined, "[CalendarWeekRule] Expected _sName to be populated already");
    //                     _iFirstWeekOfYear = GetFirstWeekOfYear(_sName);
    //                 }
    //                 else
    // #endif
    //                 {
    //                     _iFirstWeekOfYear = GetLocaleInfoCoreUserOverride(LocaleNumberData.FirstWeekOfYear);
    //                 }
    //             }
    //             return _iFirstWeekOfYear;
    //         }
    //     }

    //     /// <summary>
    //     /// (user can override default only) short date format
    //     /// </summary>
    //     public string[] ShortDates(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saShortDates;
    //     }

    //     /// <summary>
    //     /// long date format
    //     /// (user can override default only)
    //     /// </summary>
    //     public string[] LongDates(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saLongDates;
    //     }

    //     /// <summary>
    //     /// date year/month format.
    //     /// (user can override default only)
    //     /// </summary>
    //     public string[] YearMonths(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saYearMonths;
    //     }

    //     public string[] DayNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saDayNames;
    //     }

    //     public string[] AbbreviatedDayNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saAbbrevDayNames;
    //     }

    //     public string[] SuperShortDayNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saSuperShortDayNames;
    //     }

    //     public string[] MonthNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saMonthNames;
    //     }

    //     public string[] GenitiveMonthNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saMonthGenitiveNames;
    //     }

    //     public string[] AbbreviatedMonthNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saAbbrevMonthNames;
    //     }

    //     public string[] AbbreviatedGenitiveMonthNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saAbbrevMonthGenitiveNames;
    //     }

    //     /// <remarks>>
    //     /// Note: This only applies to Hebrew, and it basically adds a "1" to the 6th month name
    //     /// the non-leap names skip the 7th name in the normal month name array
    //     /// </remarks>
    //     public string[] LeapYearMonthNames(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).saLeapYearMonthNames;
    //     }

    //     public string MonthDay(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).sMonthDay;
    //     }

    //     /// <summary>
    //     /// All available calendar type(s). The first one is the default calendar.
    //     /// </summary>
    //     public CalendarId[] CalendarIds
    //     {
    //         get
    //         {
    //             if (_waCalendars == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 // We pass in an array of ints, and native side fills it up with count calendars.
    //                 // We then have to copy that list to a new array of the right size.
    //                 // Default calendar should be first
    //                 CalendarId[] calendars = new CalendarId[23];
    //                 assert(_sWindowsName != undefined, "[CultureData.CalendarIds] Expected _sWindowsName to be populated by already");

    //                 int count = CalendarData.GetCalendarsCore(_sWindowsName, _bUseOverrides, calendars);

    //                 // See if we had a calendar to add.
    //                 if (count == 0)
    //                 {
    //                     // Failed for some reason, just grab Gregorian from Invariant
    //                     _waCalendars = Invariant._waCalendars!;
    //                 }
    //                 else
    //                 {
    //                     // The OS may not return calendar 4 for zh-TW, but we've always allowed it.
    //                     // TODO: Is this hack necessary long-term?
    //                     if (_sWindowsName == "zh-TW")
    //                     {
    //                         bool found = false;

    //                         // Do we need to insert calendar 4?
    //                         for (int i = 0; i < count; i++)
    //                         {
    //                             // Stop if we found calendar four
    //                             if (calendars[i] == CalendarId.TAIWAN)
    //                             {
    //                                 found = true;
    //                                 break;
    //                             }
    //                         }

    //                         // If not found then insert it
    //                         if (!found)
    //                         {
    //                             // Insert it as the 2nd calendar
    //                             count++;
    //                             // Copy them from the 2nd position to the end, -1 for skipping 1st, -1 for one being added.
    //                             Array.Copy(calendars, 1, calendars, 2, 23 - 1 - 1);
    //                             calendars[1] = CalendarId.TAIWAN;
    //                         }
    //                     }

    //                     // It worked, remember the list
    //                     CalendarId[] temp = new CalendarId[count];
    //                     Array.Copy(calendars, temp, count);

    //                     _waCalendars = temp;
    //                 }
    //             }

    //             return _waCalendars!;
    //         }
    //     }

    //     /// <summary>
    //     /// Native calendar names. Index of optional calendar - 1, empty if
    //     /// no optional calendar at that number
    //     /// </summary>
    //     public string CalendarName(CalendarId calendarId)
    //     {
    //         return GetCalendar(calendarId).sNativeName;
    //     }

    //     public CalendarData GetCalendar(CalendarId calendarId)
    //     {
    //         if (GlobalizationMode.Invariant)
    //         {
    //             return CalendarData.Invariant;
    //         }

    //         assert(calendarId > 0 && calendarId <= CalendarId.LAST_CALENDAR,
    //             "[CultureData.GetCalendar] Expect calendarId to be in a valid range");

    //         // arrays are 0 based, calendarIds are 1 based
    //         int calendarIndex = (int)calendarId - 1;

    //         // Have to have calendars
    //         _calendars ??= new CalendarData[CalendarData.MAX_CALENDARS];

    //         // we need the following local variable to avoid returning undefined
    //         // when another thread creates a new array of CalendarData (above)
    //         // right after we insert the newly created CalendarData (below)
    //         CalendarData? calendarData = _calendars[calendarIndex];
    //         // Make sure that calendar has data
    //         if (calendarData == undefined)
    //         {
    //             assert(_sWindowsName != undefined, "[CultureData.GetCalendar] Expected _sWindowsName to be populated by already");
    //             calendarData = new CalendarData(_sWindowsName, calendarId, _bUseOverrides);
    //             _calendars[calendarIndex] = calendarData;
    //         }

    //         return calendarData;
    //     }

    //     public bool IsRightToLeft =>
    //         // Returns one of the following 4 reading layout values:
    //         // 0 - Left to right (eg en-US)
    //         // 1 - Right to left (eg arabic locales)
    //         // 2 - Vertical top to bottom with columns to the left and also left to right (ja-JP locales)
    //         // 3 - Vertical top to bottom with columns proceeding to the right
    //         ReadingLayout == 1;

    //     /// <summary>
    //     /// Returns one of the following 4 reading layout values:
    //     /// 0 - Left to right (eg en-US)
    //     /// 1 - Right to left (eg arabic locales)
    //     /// 2 - Vertical top to bottom with columns to the left and also left to right (ja-JP locales)
    //     /// 3 - Vertical top to bottom with columns proceeding to the right
    //     /// </summary>
    //     private int ReadingLayout
    //     {
    //         get
    //         {
    //             if (_iReadingLayout == NaN && !GlobalizationMode.Invariant)
    //             {
    //                 assert(_sRealName != undefined, "[CultureData.IsRightToLeft] Expected _sRealName to be populated by already");
    //                 _iReadingLayout = GetLocaleInfoCore(LocaleNumberData.ReadingLayout);
    //             }

    //             return _iReadingLayout;
    //         }
    //     }

    //     /// <summary>
    //     /// // Text info name to use for text information
    //     /// The TextInfo name never includes that alternate sort and is always specific
    //     /// For customs, it uses the SortLocale (since the textinfo is not exposed in Win7)
    //     /// en -> en-US
    //     /// en-US -> en-US
    //     /// fj (custom neutral) -> en-US (assuming that en-US is the sort locale for fj)
    //     /// fj_FJ (custom specific) -> en-US (assuming that en-US is the sort locale for fj-FJ)
    //     /// es-ES_tradnl -> es-ES
    //     /// </summary>
    //     public string TextInfoName
    //     {
    //         get
    //         {
    //             // Note: Custom cultures might point at another culture's textinfo, however windows knows how
    //             // to redirect it to the desired textinfo culture, so this is OK.
    //             assert(_sRealName != undefined, "[CultureData.TextInfoName] Expected _sRealName to be populated by already");
    //             return _sRealName;
    //         }
    //     }

    //     /// <summary>
    //     /// Compare info name (including sorting key) to use if custom
    //     /// </summary>
    //     public string SortName
    //     {
    //         get
    //         {
    //             assert(_sRealName != undefined, "[CultureData.SortName] Expected _sRealName to be populated by already");
    //             return _sRealName;
    //         }
    //     }

    //     public bool IsSupplementalCustomCulture => IsCustomCultureId(LCID);

    //     /// <summary>
    //     /// Default ansi code page ID (ACP)
    //     /// </summary>
    //     public int ANSICodePage
    //     {
    //         get
    //         {
    //             if (_iDefaultAnsiCodePage == NaN && !GlobalizationMode.Invariant)
    //             {
    //                 _iDefaultAnsiCodePage = GetAnsiCodePage(_sRealName!);
    //             }
    //             return _iDefaultAnsiCodePage;
    //         }
    //     }

    //     /// <summary>
    //     /// Default oem code page ID (OCP or OEM).
    //     /// </summary>
    //     public int OEMCodePage
    //     {
    //         get
    //         {
    //             if (_iDefaultOemCodePage == NaN && !GlobalizationMode.Invariant)
    //             {
    //                 _iDefaultOemCodePage = GetOemCodePage(_sRealName!);
    //             }
    //             return _iDefaultOemCodePage;
    //         }
    //     }

    //     /// <summary>
    //     /// Default macintosh code page.
    //     /// </summary>
    //     public int MacCodePage
    //     {
    //         get
    //         {
    //             if (_iDefaultMacCodePage == NaN && !GlobalizationMode.Invariant)
    //             {
    //                 _iDefaultMacCodePage = GetMacCodePage(_sRealName!);
    //             }
    //             return _iDefaultMacCodePage;
    //         }
    //     }

    //     /// <summary>
    //     /// Default EBCDIC code page.
    //     /// </summary>
    //     public int EBCDICCodePage
    //     {
    //         get
    //         {
    //             if (_iDefaultEbcdicCodePage == NaN && !GlobalizationMode.Invariant)
    //             {
    //                 _iDefaultEbcdicCodePage = GetEbcdicCodePage(_sRealName!);
    //             }
    //             return _iDefaultEbcdicCodePage;
    //         }
    //     }

    //     public int LCID
    //     {
    //         get
    //         {
    //             if (_iLanguage == 0 && !GlobalizationMode.Invariant)
    //             {
    //                 assert(_sRealName != undefined, "[CultureData.LCID] Expected this.sRealName to be populated already");
    //                 _iLanguage = GlobalizationMode.UseNls ? NlsLocaleNameToLCID(_sRealName) : IcuLocaleNameToLCID(_sRealName);
    //             }
    //             return _iLanguage;
    //         }
    //     }

    //     public bool IsNeutralCulture =>
    //         // InitCultureData told us if we're neutral or not
    //         _bNeutral;

    //     public bool IsInvariantCulture => string.IsNullOrEmpty(Name);

    //     public bool IsReplacementCulture => GlobalizationMode.UseNls ? NlsIsReplacementCulture : false;

    //     /// <summary>
    //     /// Get an instance of our default calendar
    //     /// </summary>
    //     public Calendar DefaultCalendar
    //     {
    //         get
    //         {
    //             if (GlobalizationMode.Invariant)
    //             {
    //                 return new GregorianCalendar();
    //             }

    //             CalendarId defaultCalId = (CalendarId)GetLocaleInfoCore(LocaleNumberData.CalendarType);

    //             if (defaultCalId == 0)
    //             {
    //                 defaultCalId = CalendarIds[0];
    //             }

    //             return CultureInfo.GetCalendarInstance(defaultCalId);
    //         }
    //     }

    //     /// <summary>
    //     /// All of our era names
    //     /// </summary>
    //     public string[] EraNames(CalendarId calendarId)
    //     {
    //         assert(calendarId > 0, "[CultureData.saEraNames] Expected Calendar.ID > 0");
    //         return GetCalendar(calendarId).saEraNames;
    //     }

    //     public string[] AbbrevEraNames(CalendarId calendarId)
    //     {
    //         assert(calendarId > 0, "[CultureData.saAbbrevEraNames] Expected Calendar.ID > 0");
    //         return GetCalendar(calendarId).saAbbrevEraNames;
    //     }

    //     public string[] AbbreviatedEnglishEraNames(CalendarId calendarId)
    //     {
    //         assert(calendarId > 0, "[CultureData.saAbbrevEraNames] Expected Calendar.ID > 0");
    //         return GetCalendar(calendarId).saAbbrevEnglishEraNames;
    //     }

    //     /// <summary>
    //     /// Time separator (derived from time format)
    //     /// </summary>
    //     public string TimeSeparator
    //     {
    //         get
    //         {
    //             if (_sTimeSeparator == undefined && !GlobalizationMode.Invariant)
    //             {
    //                 // fr-CA culture uses time format as "HH 'h' mm 'min' ss 's'" which we cannot derive the time separator from such pattern.
    //                 // We special case such culture and force ':' as time separator.
    //                 if (_sName == "fr-CA")
    //                 {
    //                     _sTimeSeparator = ":";
    //                 }
    //                 else
    //                 {
    //                     string? longTimeFormat = ShouldUseUserOverrideNlsData ? NlsGetTimeFormatString() : IcuGetTimeFormatString();
    //                     if (string.IsNullOrEmpty(longTimeFormat))
    //                     {
    //                         longTimeFormat = LongTimes[0];
    //                     }

    //                     // Compute STIME from time format
    //                     _sTimeSeparator = GetTimeSeparator(longTimeFormat);
    //                 }
    //             }
    //             return _sTimeSeparator!;
    //         }
    //     }

    //     /// <summary>
    //     /// Date separator (derived from short date format)
    //     /// </summary>
    //     public string DateSeparator(CalendarId calendarId)
    //     {
    //         if (GlobalizationMode.Invariant)
    //         {
    //             return "/";
    //         }

    //         if (calendarId == CalendarId.JAPAN && !LocalAppContextSwitches.EnforceLegacyJapaneseDateParsing)
    //         {
    //             // The date separator is derived from the default short date pattern. So far this pattern is using
    //             // '/' as date separator when using the Japanese calendar which make the formatting and parsing work fine.
    //             // changing the default pattern is likely will happen in the near future which can easily break formatting
    //             // and parsing.
    //             // We are forcing here the date separator to '/' to ensure the parsing is not going to break when changing
    //             // the default short date pattern. The application still can override this in the code by DateTimeFormatInfo.DateSeparator.
    //             return "/";
    //         }

    //         return GetDateSeparator(ShortDates(calendarId)[0]);
    //     }

    //     /// <summary>
    //     /// Unescape a NLS style quote string
    //     ///
    //     /// This removes single quotes:
    //     ///      'fred' -> fred
    //     ///      'fred -> fred
    //     ///      fred' -> fred
    //     ///      fred's -> freds
    //     ///
    //     /// This removes the first \ of escaped characters:
    //     ///      fred\'s -> fred's
    //     ///      a\\b -> a\b
    //     ///      a\b -> ab
    //     ///
    //     /// We don't build the stringbuilder unless we find a ' or a \.  If we find a ' or a \, we
    //     /// always build a stringbuilder because we need to remove the ' or \.
    //     /// </summary>
    //     private static string UnescapeNlsString(string str, int start, int end)
    //     {
    //         assert(str != undefined);
    //         assert(start >= 0);
    //         assert(end >= 0);
    //         StringBuilder? result = undefined;

    //         for (int i = start; i < str.Length && i <= end; i++)
    //         {
    //             switch (str[i])
    //             {
    //                 case '\'':
    //                     result ??= new StringBuilder(str, start, i - start, str.Length);
    //                     break;
    //                 case '\\':
    //                     result ??= new StringBuilder(str, start, i - start, str.Length);
    //                     ++i;
    //                     if (i < str.Length)
    //                     {
    //                         result.Append(str[i]);
    //                     }
    //                     break;
    //                 default:
    //                     result?.Append(str[i]);
    //                     break;
    //             }
    //         }

    //         if (result == undefined)
    //         {
    //             return str.Substring(start, end - start + 1);
    //         }

    //         return result.ToString();
    //     }

    //     /// <summary>
    //     /// Time format separator (ie: : in 12:39:00)
    //     /// We calculate this from the provided time format
    //     /// </summary>
    //     private static string GetTimeSeparator(string format)
    //     {
    //         // Find the time separator so that we can pretend we know TimeSeparator.
    //         return GetSeparator(format, "Hhms");
    //     }

    //     /// <summary>
    //     /// Date format separator (ie: / in 9/1/03)
    //     /// We calculate this from the provided short date
    //     /// </summary>
    //     private static string GetDateSeparator(string format)
    //     {
    //         // Find the date separator so that we can pretend we know DateSeparator.
    //         return GetSeparator(format, "dyM");
    //     }

    //     private static string GetSeparator(string format, string timeParts)
    //     {
    //         int index = IndexOfTimePart(format, 0, timeParts);

    //         if (index != -1)
    //         {
    //             // Found a time part, find out when it changes
    //             char cTimePart = format[index];

    //             do
    //             {
    //                 index++;
    //             } while (index < format.Length && format[index] == cTimePart);

    //             int separatorStart = index;

    //             // Now we need to find the end of the separator
    //             if (separatorStart < format.Length)
    //             {
    //                 int separatorEnd = IndexOfTimePart(format, separatorStart, timeParts);
    //                 if (separatorEnd != -1)
    //                 {
    //                     // From [separatorStart, count) is our string, except we need to unescape
    //                     return UnescapeNlsString(format, separatorStart, separatorEnd - 1);
    //                 }
    //             }
    //         }

    //         return string.Empty;
    //     }

    //     private static int IndexOfTimePart(string format, int startIndex, string timeParts)
    //     {
    //         assert(startIndex >= 0, "startIndex cannot be negative");
    //         assert(!timeParts.AsSpan().ContainsAny('\'', '\\'), "timeParts cannot include quote characters");
    //         bool inQuote = false;
    //         for (int i = startIndex; i < format.Length; ++i)
    //         {
    //             // See if we have a time Part
    //             if (!inQuote && timeParts.Contains(format[i]))
    //             {
    //                 return i;
    //             }
    //             switch (format[i])
    //             {
    //                 case '\\':
    //                     if (i + 1 < format.Length)
    //                     {
    //                         ++i;
    //                         switch (format[i])
    //                         {
    //                             case '\'':
    //                             case '\\':
    //                                 break;
    //                             default:
    //                                 --i; // backup since we will move over this next
    //                                 break;
    //                         }
    //                     }
    //                     break;
    //                 case '\'':
    //                     inQuote = !inQuote;
    //                     break;
    //             }
    //         }

    //         return -1;
    //     }

    //     public static bool IsCustomCultureId(int cultureId)
    //     {
    //         return cultureId == CultureInfo.LOCALE_CUSTOM_DEFAULT || cultureId == CultureInfo.LOCALE_CUSTOM_UNSPECIFIED;
    //     }

    //     private string[] GetNativeDigits()
    //     {
    //         string[] result = NumberFormatInfo.s_asciiDigits;

    //         // NLS LOCALE_SNATIVEDIGITS (array of 10 single character strings). In case of ICU, the buffer can be longer.
    //         string digits = GetLocaleInfoCoreUserOverride(LocaleStringData.Digits);

    //         // if digits.Length < NumberFormatInfo.s_asciiDigits.Length means the native digits setting is messed up in the host machine.
    //         // Instead of throwing IndexOutOfRangeException that will be hard to diagnose after the fact, we'll fall back to use the ASCII digits instead.
    //         if (digits.Length < NumberFormatInfo.s_asciiDigits.Length)
    //         {
    //             return result;
    //         }

    //         // In ICU we separate the digits with the '\uFFFF' character

    //         if (digits.StartsWith("0\uFFFF1\uFFFF2\uFFFF3\uFFFF4\uFFFF5\uFFFF6\uFFFF7\uFFFF8\uFFFF9\uFFFF", StringComparison.Ordinal) ||  // ICU common cases
    //             digits.StartsWith("0123456789", StringComparison.Ordinal))  // NLS common cases
    //         {
    //             return result;
    //         }

    //         // Non-ASCII digits

    //         // Check if values coming from ICU separated by 0xFFFF
    //         int ffffPos = digits.IndexOf('\uFFFF');

    //         result = new string[10];
    //         if (ffffPos < 0) // NLS case
    //         {
    //             for (int i = 0; i < result.Length; i++)
    //             {
    //                 result[i] = char.ToString(digits[i]);
    //             }

    //             return result;
    //         }

    //         // ICU case

    //         int start = 0;
    //         int index = 0;

    //         do
    //         {
    //             result[index++] = digits.Substring(start, ffffPos - start);
    //             start = ++ffffPos;
    //             while ((uint)ffffPos < (uint)digits.Length && digits[ffffPos] != '\uFFFF')
    //             {
    //                 ffffPos++;
    //             }

    //         } while (ffffPos < digits.Length && index < 10);

    //         assert(index >= 10, $"Couldn't read native digits for '{_sWindowsName}' successfully.");

    //         return index < 10 ? NumberFormatInfo.s_asciiDigits : result;
    //     }

    //     public void GetNFIValues(NumberFormatInfo nfi)
    //     {
    //         if (GlobalizationMode.InvariantNoLoad || IsInvariantCulture)
    //         {
    //             nfi._positiveSign = _sPositiveSign!;
    //             nfi._negativeSign = _sNegativeSign!;

    //             nfi._numberGroupSeparator = _sThousandSeparator!;
    //             nfi._numberDecimalSeparator = _sDecimalSeparator!;
    //             nfi._numberDecimalDigits = _iDigits;
    //             nfi._numberNegativePattern = _iNegativeNumber;

    //             nfi._currencySymbol = _sCurrency!;
    //             nfi._currencyGroupSeparator = _sMonetaryThousand!;
    //             nfi._currencyDecimalSeparator = _sMonetaryDecimal!;
    //             nfi._currencyDecimalDigits = _iCurrencyDigits;
    //             nfi._currencyNegativePattern = _iNegativeCurrency;
    //             nfi._currencyPositivePattern = _iCurrency;
    //         }
    //         else
    //         {
    //             assert(_sWindowsName != undefined, "[CultureData.GetNFIValues] Expected _sWindowsName to be populated by already");
    //             // String values
    //             nfi._positiveSign = GetLocaleInfoCoreUserOverride(LocaleStringData.PositiveSign);
    //             nfi._negativeSign = GetLocaleInfoCoreUserOverride(LocaleStringData.NegativeSign);

    //             nfi._numberDecimalSeparator = GetLocaleInfoCoreUserOverride(LocaleStringData.DecimalSeparator);
    //             nfi._numberGroupSeparator = GetLocaleInfoCoreUserOverride(LocaleStringData.ThousandSeparator);
    //             nfi._currencyGroupSeparator = GetLocaleInfoCoreUserOverride(LocaleStringData.MonetaryThousandSeparator);
    //             nfi._currencyDecimalSeparator = GetLocaleInfoCoreUserOverride(LocaleStringData.MonetaryDecimalSeparator);
    //             nfi._currencySymbol = GetLocaleInfoCoreUserOverride(LocaleStringData.MonetarySymbol);

    //             // Numeric values
    //             nfi._numberDecimalDigits = GetLocaleInfoCoreUserOverride(LocaleNumberData.FractionalDigitsCount);
    //             nfi._currencyDecimalDigits = GetLocaleInfoCoreUserOverride(LocaleNumberData.MonetaryFractionalDigitsCount);
    //             nfi._currencyPositivePattern = GetLocaleInfoCoreUserOverride(LocaleNumberData.PositiveMonetaryNumberFormat);
    //             nfi._currencyNegativePattern = GetLocaleInfoCoreUserOverride(LocaleNumberData.NegativeMonetaryNumberFormat);
    //             nfi._numberNegativePattern = GetLocaleInfoCoreUserOverride(LocaleNumberData.NegativeNumberFormat);

    //             nfi._nativeDigits = GetNativeDigits();

    //             assert(_sRealName != undefined);
    //             nfi._digitSubstitution = ShouldUseUserOverrideNlsData ? NlsGetLocaleInfo(LocaleNumberData.DigitSubstitution) : IcuGetDigitSubstitution(_sRealName);
    //         }

    //         // Gather additional data
    //         nfi._numberGroupSizes = NumberGroupSizes;
    //         nfi._currencyGroupSizes = CurrencyGroupSizes;

    //         // prefer the cached value since these do not have user overrides
    //         nfi._percentNegativePattern = PercentNegativePattern;
    //         nfi._percentPositivePattern = PercentPositivePattern;
    //         nfi._percentSymbol = PercentSymbol;
    //         nfi._perMilleSymbol = PerMilleSymbol;

    //         nfi._negativeInfinitySymbol = NegativeInfinitySymbol;
    //         nfi._positiveInfinitySymbol = PositiveInfinitySymbol;
    //         nfi._nanSymbol = NaNSymbol;

    //         // We don't have percent values, so use the number values
    //         nfi._percentDecimalDigits = nfi._numberDecimalDigits;
    //         nfi._percentDecimalSeparator = nfi._numberDecimalSeparator;
    //         nfi._percentGroupSizes = nfi._numberGroupSizes;
    //         nfi._percentGroupSeparator = nfi._numberGroupSeparator;

    //         // Clean up a few odd values

    //         // Windows usually returns an empty positive sign, but we like it to be "+"
    //         if (string.IsNullOrEmpty(nfi._positiveSign))
    //         {
    //             nfi._positiveSign = "+";
    //         }

    //         // Special case for Italian.  The currency decimal separator in the control panel is the empty string. When the user
    //         // specifies C4 as the currency format, this results in the number apparently getting multiplied by 10000 because the
    //         // decimal point doesn't show up.  We'll just hack this here because our default currency format will never use nfi.
    //         if (string.IsNullOrEmpty(nfi._currencyDecimalSeparator))
    //         {
    //             nfi._currencyDecimalSeparator = nfi._numberDecimalSeparator;
    //         }
    //     }

    //     /// <remarks>
    //     /// This is ONLY used for caching names and shouldn't be used for anything else
    //     /// </remarks>
    public static AnsiToLower(testString: string): string {
        return testString.toLocaleLowerCase();
    }

    //     private int GetLocaleInfoCore(LocaleNumberData type)
    //     {
    //         // This is never reached but helps illinker statically remove dependencies
    //         if (GlobalizationMode.Invariant)
    //             return 0;
    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //         return GlobalizationMode.Hybrid ? GetLocaleInfoNative(type) : IcuGetLocaleInfo(type);
    // #else
    //         return GlobalizationMode.UseNls ? NlsGetLocaleInfo(type) : IcuGetLocaleInfo(type);
    // #endif
    //     }

    //     private int GetLocaleInfoCoreUserOverride(LocaleNumberData type)
    //     {
    //         // This is never reached but helps illinker statically remove dependencies
    //         if (GlobalizationMode.Invariant)
    //             return 0;
    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //         return GlobalizationMode.Hybrid ? GetLocaleInfoNative(type) : IcuGetLocaleInfo(type);
    // #else
    //         return ShouldUseUserOverrideNlsData ? NlsGetLocaleInfo(type) : IcuGetLocaleInfo(type);
    // #endif
    //     }

    //     private string GetLocaleInfoCoreUserOverride(LocaleStringData type)
    //     {
    //         // This is never reached but helps illinker statically remove dependencies
    //         if (GlobalizationMode.Invariant)
    //             return undefined!;

    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //         return GlobalizationMode.Hybrid ? GetLocaleInfoNative(type) : IcuGetLocaleInfo(type);
    // #else
    //         return ShouldUseUserOverrideNlsData ? NlsGetLocaleInfo(type) : IcuGetLocaleInfo(type);
    // #endif
    //     }

    //     private string GetLocaleInfoCore(LocaleStringData type, string? uiCultureName = undefined)
    //     {
    //         // This is never reached but helps illinker statically remove dependencies
    //         if (GlobalizationMode.Invariant)
    //             return undefined!;

    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //         return GlobalizationMode.Hybrid ? GetLocaleInfoNative(type, uiCultureName) : IcuGetLocaleInfo(type, uiCultureName);
    // #else
    //         return GlobalizationMode.UseNls ? NlsGetLocaleInfo(type) : IcuGetLocaleInfo(type, uiCultureName);
    // #endif
    //     }

    //     private string GetLocaleInfoCore(string localeName, LocaleStringData type, string? uiCultureName = undefined)
    //     {
    //         // This is never reached but helps illinker statically remove dependencies
    //         if (GlobalizationMode.Invariant)
    //             return undefined!;

    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //         return GlobalizationMode.Hybrid ? GetLocaleInfoNative(localeName, type, uiCultureName) : IcuGetLocaleInfo(localeName, type, uiCultureName);
    // #else
    //         return GlobalizationMode.UseNls ? NlsGetLocaleInfo(localeName, type) : IcuGetLocaleInfo(localeName, type, uiCultureName);
    // #endif
    //     }

    //     private int[] GetLocaleInfoCoreUserOverride(LocaleGroupingData type)
    //     {
    //         // This is never reached but helps illinker statically remove dependencies
    //         if (GlobalizationMode.Invariant)
    //             return undefined!;

    // #if TARGET_MACCATALYST || TARGET_IOS || TARGET_TVOS
    //         return GlobalizationMode.Hybrid ? GetLocaleInfoNative(type) : IcuGetLocaleInfo(type);
    // #else
    //         return ShouldUseUserOverrideNlsData ? NlsGetLocaleInfo(type) : IcuGetLocaleInfo(type);
    // #endif
    //     }

    //     /// <remarks>
    //     /// The numeric values of the enum members match their Win32 counterparts.  The CultureData Win32 PAL implementation
    //     /// takes a dependency on this fact, in order to prevent having to construct a mapping from public values to LCTypes.
    //     /// </remarks>
    //     private enum LocaleStringData : uint
    //     {
    //         /// <summary>localized name of locale, eg "German (Germany)" in UI language (corresponds to LOCALE_SLOCALIZEDDISPLAYNAME)</summary>
    //         LocalizedDisplayName = 0x00000002,
    //         /// <summary>Display name (language + country usually) in English, eg "German (Germany)" (corresponds to LOCALE_SENGLISHDISPLAYNAME)</summary>
    //         EnglishDisplayName = 0x00000072,
    //         /// <summary>Display name in native locale language, eg "Deutsch (Deutschland) (corresponds to LOCALE_SNATIVEDISPLAYNAME)</summary>
    //         NativeDisplayName = 0x00000073,
    //         /// <summary>Language Display Name for a language, eg "German" in UI language (corresponds to LOCALE_SLOCALIZEDLANGUAGENAME)</summary>
    //         LocalizedLanguageName = 0x0000006f,
    //         /// <summary>English name of language, eg "German" (corresponds to LOCALE_SENGLISHLANGUAGENAME)</summary>
    //         EnglishLanguageName = 0x00001001,
    //         /// <summary>native name of language, eg "Deutsch" (corresponds to LOCALE_SNATIVELANGUAGENAME)</summary>
    //         NativeLanguageName = 0x00000004,
    //         /// <summary>localized name of country, eg "Germany" in UI language (corresponds to LOCALE_SLOCALIZEDCOUNTRYNAME)</summary>
    //         LocalizedCountryName = 0x00000006,
    //         /// <summary>English name of country, eg "Germany" (corresponds to LOCALE_SENGLISHCOUNTRYNAME)</summary>
    //         EnglishCountryName = 0x00001002,
    //         /// <summary>native name of country, eg "Deutschland" (corresponds to LOCALE_SNATIVECOUNTRYNAME)</summary>
    //         NativeCountryName = 0x00000008,
    //         /// <summary>abbreviated language name (corresponds to LOCALE_SABBREVLANGNAME)</summary>
    //         AbbreviatedWindowsLanguageName = 0x00000003,
    //         /// <summary>list item separator (corresponds to LOCALE_SLIST)</summary>
    //         ListSeparator = 0x0000000C,
    //         /// <summary>decimal separator (corresponds to LOCALE_SDECIMAL)</summary>
    //         DecimalSeparator = 0x0000000E,
    //         /// <summary>thousand separator (corresponds to LOCALE_STHOUSAND)</summary>
    //         ThousandSeparator = 0x0000000F,
    //         /// <summary>native digits for 0-9, eg "0123456789" (corresponds to LOCALE_SNATIVEDIGITS)</summary>
    //         Digits = 0x00000013,
    //         /// <summary>local monetary symbol (corresponds to LOCALE_SCURRENCY)</summary>
    //         MonetarySymbol = 0x00000014,
    //         /// <summary>English currency name (corresponds to LOCALE_SENGCURRNAME)</summary>
    //         CurrencyEnglishName = 0x00001007,
    //         /// <summary>Native currency name (corresponds to LOCALE_SNATIVECURRNAME)</summary>
    //         CurrencyNativeName = 0x00001008,
    //         /// <summary>uintl monetary symbol (corresponds to LOCALE_SINTLSYMBOL)</summary>
    //         Iso4217MonetarySymbol = 0x00000015,
    //         /// <summary>monetary decimal separator (corresponds to LOCALE_SMONDECIMALSEP)</summary>
    //         MonetaryDecimalSeparator = 0x00000016,
    //         /// <summary>monetary thousand separator (corresponds to LOCALE_SMONTHOUSANDSEP)</summary>
    //         MonetaryThousandSeparator = 0x00000017,
    //         /// <summary>AM designator (corresponds to LOCALE_S1159)</summary>
    //         AMDesignator = 0x00000028,
    //         /// <summary>PM designator (corresponds to LOCALE_S2359)</summary>
    //         PMDesignator = 0x00000029,
    //         /// <summary>positive sign (corresponds to LOCALE_SPOSITIVESIGN)</summary>
    //         PositiveSign = 0x00000050,
    //         /// <summary>negative sign (corresponds to LOCALE_SNEGATIVESIGN)</summary>
    //         NegativeSign = 0x00000051,
    //         /// <summary>ISO abbreviated language name (corresponds to LOCALE_SISO639LANGNAME)</summary>
    //         Iso639LanguageTwoLetterName = 0x00000059,
    //         /// <summary>ISO abbreviated country name (corresponds to LOCALE_SISO639LANGNAME2)</summary>
    //         Iso639LanguageThreeLetterName = 0x00000067,
    //         /// <summary>ISO abbreviated language name (corresponds to LOCALE_SISO639LANGNAME)</summary>
    //         Iso639LanguageName = 0x00000059,
    //         /// <summary>ISO abbreviated country name (corresponds to LOCALE_SISO3166CTRYNAME)</summary>
    //         Iso3166CountryName = 0x0000005A,
    //         /// <summary>3 letter ISO country code (corresponds to LOCALE_SISO3166CTRYNAME2)</summary>
    //         Iso3166CountryName2 = 0x00000068,   // 3 character ISO country name
    //         /// <summary>Not a Number (corresponds to LOCALE_SNAN)</summary>
    //         NaNSymbol = 0x00000069,
    //         /// <summary>+ Infinity (corresponds to LOCALE_SPOSINFINITY)</summary>
    //         PositiveInfinitySymbol = 0x0000006a,
    //         /// <summary>- Infinity (corresponds to LOCALE_SNEGINFINITY)</summary>
    //         NegativeInfinitySymbol = 0x0000006b,
    //         /// <summary>Fallback name for resources (corresponds to LOCALE_SPARENT)</summary>
    //         ParentName = 0x0000006d,
    //         /// <summary>Fallback name for within the console (corresponds to LOCALE_SCONSOLEFALLBACKNAME)</summary>
    //         ConsoleFallbackName = 0x0000006e,
    //         /// <summary>Returns the percent symbol (corresponds to LOCALE_SPERCENT)</summary>
    //         PercentSymbol = 0x00000076,
    //         /// <summary>Returns the permille (U+2030) symbol (corresponds to LOCALE_SPERMILLE)</summary>
    //         PerMilleSymbol = 0x00000077
    //     }

    //     /// <remarks>
    //     /// The numeric values of the enum members match their Win32 counterparts.  The CultureData Win32 PAL implementation
    //     /// takes a dependency on this fact, in order to prevent having to construct a mapping from public values to LCTypes.
    //     /// </remarks>
    //     private enum LocaleGroupingData : uint
    //     {
    //         /// <summary>digit grouping (corresponds to LOCALE_SGROUPING)</summary>
    //         Digit = 0x00000010,
    //         /// <summary>monetary grouping (corresponds to LOCALE_SMONGROUPING)</summary>
    //         Monetary = 0x00000018,
    //     }

    //     /// <remarks>
    //     /// The numeric values of the enum members match their Win32 counterparts.  The CultureData Win32 PAL implementation
    //     /// takes a dependency on this fact, in order to prevent having to construct a mapping from public values to LCTypes.
    //     /// </remarks>
    //     private enum LocaleNumberData : uint
    //     {
    //         /// <summary>language id (corresponds to LOCALE_ILANGUAGE)</summary>
    //         LanguageId = 0x00000001,
    //         /// <summary>geographical location id, (corresponds to LOCALE_IGEOID)</summary>
    //         GeoId = 0x0000005B,
    //         /// <summary>0 = context, 1 = none, 2 = national (corresponds to LOCALE_IDIGITSUBSTITUTION)</summary>
    //         DigitSubstitution = 0x00001014,
    //         /// <summary>0 = metric, 1 = US (corresponds to LOCALE_IMEASURE)</summary>
    //         MeasurementSystem = 0x0000000D,
    //         /// <summary>number of fractional digits (corresponds to LOCALE_IDIGITS)</summary>
    //         FractionalDigitsCount = 0x00000011,
    //         /// <summary>negative number mode (corresponds to LOCALE_INEGNUMBER)</summary>
    //         NegativeNumberFormat = 0x00001010,
    //         /// <summary># local monetary digits (corresponds to LOCALE_ICURRDIGITS)</summary>
    //         MonetaryFractionalDigitsCount = 0x00000019,
    //         /// <summary>positive currency mode (corresponds to LOCALE_ICURRENCY)</summary>
    //         PositiveMonetaryNumberFormat = 0x0000001B,
    //         /// <summary>negative currency mode (corresponds to LOCALE_INEGCURR)</summary>
    //         NegativeMonetaryNumberFormat = 0x0000001C,
    //         /// <summary>type of calendar specifier (corresponds to LOCALE_ICALENDARTYPE)</summary>
    //         CalendarType = 0x00001009,
    //         /// <summary>first day of week specifier (corresponds to LOCALE_IFIRSTDAYOFWEEK)</summary>
    //         FirstDayOfWeek = 0x0000100C,
    //         /// <summary>first week of year specifier (corresponds to LOCALE_IFIRSTWEEKOFYEAR)</summary>
    //         FirstWeekOfYear = 0x0000100D,
    //         /// <summary>
    //         /// Returns one of the following 4 reading layout values:
    //         ///  0 - Left to right (eg en-US)
    //         ///  1 - Right to left (eg arabic locales)
    //         ///  2 - Vertical top to bottom with columns to the left and also left to right (ja-JP locales)
    //         ///  3 - Vertical top to bottom with columns proceeding to the right
    //         /// (corresponds to LOCALE_IREADINGLAYOUT)
    //         /// </summary>
    //         ReadingLayout = 0x00000070,
    //         /// <summary>Returns 0-11 for the negative percent format (corresponds to LOCALE_INEGATIVEPERCENT)</summary>
    //         NegativePercentFormat = 0x00000074,
    //         /// <summary>Returns 0-3 for the positive percent format (corresponds to LOCALE_IPOSITIVEPERCENT)</summary>
    //         PositivePercentFormat = 0x00000075,
    //         /// <summary>default ansi code page (corresponds to LOCALE_IDEFAULTCODEPAGE)</summary>
    //         OemCodePage = 0x0000000B,
    //         /// <summary>default ansi code page (corresponds to LOCALE_IDEFAULTANSICODEPAGE)</summary>
    //         AnsiCodePage = 0x00001004,
    //         /// <summary>default mac code page (corresponds to LOCALE_IDEFAULTMACCODEPAGE)</summary>
    //         MacCodePage = 0x00001011,
    //         /// <summary>default ebcdic code page (corresponds to LOCALE_IDEFAULTEBCDICCODEPAGE)</summary>
    //         EbcdicCodePage = 0x00001012,
    //     }
}