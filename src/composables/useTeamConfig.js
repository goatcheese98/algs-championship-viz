/**
 * Vue Composable for Team Configuration
 * Optimized replacement for js/teamConfig.js
 */

import { ref, computed } from 'vue'

// Team configuration data
const teamData = {
  // Team logo mappings with cleaned URLs
  logoUrls: {
    // Existing teams (Year 4 Championship)
    "Team Falcons": "https://apexlegendsstatus.com/algs/assets/teams/teamfalcons.png",
    "Alliance": "https://apexlegendsstatus.com/algs/assets/teams/alliance.png",
    "Aurora": "https://apexlegendsstatus.com/algs/assets/teams/aurora.png",
    "FNATIC": "https://apexlegendsstatus.com/algs/assets/teams/fnatuc.png",
    "SR": "https://apexlegendsstatus.com/algs/assets/teams/shopifyrebellion.png",
    "Noctem": "https://apexlegendsstatus.com/algs/assets/teams/noctem.png",
    "VK GAMING": "https://apexlegendsstatus.com/algs/assets/teams/vkgaming.png",
    "Virtus.pro": "https://apexlegendsstatus.com/algs/assets/teams/virtuspro.png",
    "GoNext": "https://apexlegendsstatus.com/algs/assets/teams/gonext.png",
    "FURIA": "https://apexlegendsstatus.com/algs/assets/teams/furia.png",
    "GUILD": "https://apexlegendsstatus.com/algs/assets/teams/guild.png",
    "Envy": "https://apexlegendsstatus.com/algs/assets/teams/envy.png",
    "LG": "https://apexlegendsstatus.com/algs/assets/teams/lg.png",
    "ENTER FORCE.36": "https://apexlegendsstatus.com/algs/assets/teams/enterforce36.png",
    "Exo Clan": "https://apexlegendsstatus.com/algs/assets/teams/exoclan.png",
    "Cloud9": "https://apexlegendsstatus.com/algs/assets/teams/cloud9.png",
    "100 Thieves": "https://apexlegendsstatus.com/algs/assets/teams/100T.png",
    "OrglessAndHungry": "https://apexlegendsstatus.com/algs/assets/teams/orglessandhungry.png",
    "GaiminGladiators": "https://apexlegendsstatus.com/algs/assets/teams/gaimingladiators.png",
    "CRAZY RACCOON": "https://apexlegendsstatus.com/algs/assets/teams/crazyraccoon.png",
    "AlQadsiahEsports": "https://apexlegendsstatus.com/algs/assets/teams/alqadsiahesports.png",
    "Zero Tenacity (Disbanded)": "https://apexlegendsstatus.com/algs/assets/teams/zerotenacity(disbanded).png",
    "GREEN STEGO": "https://apexlegendsstatus.com/algs/assets/teams/greenstego.png",
    "disguised": "https://apexlegendsstatus.com/algs/assets/teams/disguised.png",
    "GHS Professional": "https://apexlegendsstatus.com/algs/assets/teams/GHS.png",
    "DRAGONS": "https://apexlegendsstatus.com/algs/assets/teams/dragons.png",
    "JD GAMING": "https://apexlegendsstatus.com/algs/assets/teams/jdgaming.png",
    "FaZe": "https://apexlegendsstatus.com/algs/assets/teams/faze.png",
    "STALLIONS": "https://apexlegendsstatus.com/algs/assets/teams/stallions.png",
    "NRG": "https://apexlegendsstatus.com/algs/assets/teams/nrg.png",
    "Ninjas": "https://apexlegendsstatus.com/algs/assets/teams/ninjas.png",
    "REIGNITE": "https://apexlegendsstatus.com/algs/assets/teams/reignite.png",
    "shadow3690": "https://apexlegendsstatus.com/algs/assets/teams/shadow3690.png",
    "Meteor": "https://apexlegendsstatus.com/algs/assets/teams/meteor.png",
    "Supernova": "https://apexlegendsstatus.com/algs/assets/teams/supernova.png",
    "TSM": "https://apexlegendsstatus.com/algs/assets/teams/tsm.png",
    "Team SoloMid": "https://apexlegendsstatus.com/algs/assets/teams/tsm.png",

    // Year 5 Open - New Teams (Added from user list)
    "NOEZ FOXX": "https://apexlegendsstatus.com/algs/assets/teams/noezfoxx.png",
    "Legion Gaming": "https://apexlegendsstatus.com/algs/assets/teams/legiongaming.png",
    "Unleash": "https://apexlegendsstatus.com/algs/assets/teams/unleash.png",
    "SGB": "https://apexlegendsstatus.com/algs/assets/teams/sgb.png",
    "DXAEsports": "https://apexlegendsstatus.com/algs/assets/teams/dxaesports.png",
    "F.W.G": "https://apexlegendsstatus.com/algs/assets/teams/f.w.g.png",
    "EXO Clan": "https://apexlegendsstatus.com/algs/assets/teams/exo.png",
    "RTS": "https://apexlegendsstatus.com/algs/assets/teams/rts.png",
    "O2esports": "https://apexlegendsstatus.com/algs/assets/teams/o2esports.png",
    "SOTEN": "https://apexlegendsstatus.com/algs/assets/teams/soten.png",
    "Team Nemesis": "https://apexlegendsstatus.com/algs/assets/teams/teamnemesis.png",
    "No Surrender": "https://apexlegendsstatus.com/algs/assets/teams/nosurrender.png",
    "Most Hated": "https://apexlegendsstatus.com/algs/assets/teams/mosthated.png",
    "Oxygen None arEa": "https://apexlegendsstatus.com/algs/assets/teams/oxygennonearea.png",
    "Virtue": "https://apexlegendsstatus.com/algs/assets/teams/virtue.png",
    "RIDDLE ORDER": "https://apexlegendsstatus.com/algs/assets/teams/riddleorder.png",
    "Team Inferno": "https://apexlegendsstatus.com/algs/assets/teams/teaminferno.png",
    "ARU ARMY": "https://apexlegendsstatus.com/algs/assets/teams/aruarmy.png",
    "HEROEZ": "https://apexlegendsstatus.com/algs/assets/teams/heroez.png",
    "MPIRE": "https://apexlegendsstatus.com/algs/assets/teams/mpire.png",
    "XNY": "https://apexlegendsstatus.com/algs/assets/teams/XNY.png",
    "FLAT": "https://apexlegendsstatus.com/algs/assets/teams/flat.png",
    "SBI e-Sports": "https://apexlegendsstatus.com/algs/assets/teams/sbie-sports.png",
    "Zone Spammers": "https://apexlegendsstatus.com/algs/assets/teams/zonespammers.png",
    "Pioneers": "https://apexlegendsstatus.com/algs/assets/teams/pioneers.png",
    "Soleil Gaming": "https://apexlegendsstatus.com/algs/assets/teams/soleilgaming.png",
    "Danish": "https://apexlegendsstatus.com/algs/assets/teams/danish.png",
    "AAAAAAAAAAHHHHHH": "https://apexlegendsstatus.com/algs/assets/teams/aaaaaaaaaahhhhhh.png",
    "BBL": "https://apexlegendsstatus.com/algs/assets/teams/bbl.png",
    "SVP Water": "https://apexlegendsstatus.com/algs/assets/teams/svpwater.png",
    "Reject Winnity": "https://apexlegendsstatus.com/algs/assets/teams/rejectwinnity.png",
    "Falcons": "https://apexlegendsstatus.com/algs/assets/teams/falcons.png",
    "Purple Slushee": "https://apexlegendsstatus.com/algs/assets/teams/purpleslushee.png",
    "REDRams": "https://apexlegendsstatus.com/algs/assets/teams/redrams.png",
    "1OK": "https://apexlegendsstatus.com/algs/assets/teams/1ok.png",
    "OMiT": "https://apexlegendsstatus.com/algs/assets/teams/omit.png",
    "VVV": "https://apexlegendsstatus.com/algs/assets/teams/vvv.png",
    "Lonely Let Gone": "https://apexlegendsstatus.com/algs/assets/teams/lonelyletgone.png",
    "CCG": "https://apexlegendsstatus.com/algs/assets/teams/ccg.png",
    "GUPPED UP": "https://apexlegendsstatus.com/algs/assets/teams/guppedup.png",
    "Gamblers": "https://apexlegendsstatus.com/algs/assets/teams/gamblers.png",
    "RYH": "https://apexlegendsstatus.com/algs/assets/teams/ryh.png",
    "WLG": "https://apexlegendsstatus.com/algs/assets/teams/wlg.png",
    "CIMJ": "https://apexlegendsstatus.com/algs/assets/teams/cimj.png",
    "Annex eSports": "https://apexlegendsstatus.com/algs/assets/teams/annexesports.png",
    "Nemesis": "https://apexlegendsstatus.com/algs/assets/teams/nemesis.png",
    "Team Orchid": "https://apexlegendsstatus.com/algs/assets/teams/teamorchid.png",
    "Green Stego": "https://apexlegendsstatus.com/algs/assets/teams/greenstego.png",
    "KINOTROPE gaming": "https://apexlegendsstatus.com/algs/assets/teams/kinotropegaming.png",
    "CAT": "https://apexlegendsstatus.com/algs/assets/teams/cat.png",
    "FUSION": "https://apexlegendsstatus.com/algs/assets/teams/fusion.png",
    "BABO": "https://apexlegendsstatus.com/algs/assets/teams/babo.png",
    "Alqadsiah": "https://apexlegendsstatus.com/algs/assets/teams/alqadsiah.png",
    "Arneb": "https://apexlegendsstatus.com/algs/assets/teams/arneb.png",
    "PenguPower": "https://apexlegendsstatus.com/algs/assets/teams/pengupower.png",
    "Ninjas in Pyjamas": "https://apexlegendsstatus.com/algs/assets/teams/ninjasinpyjamas.png",
    "DOOM": "https://apexlegendsstatus.com/algs/assets/teams/doom.png",
    "TEMPR": "https://apexlegendsstatus.com/algs/assets/teams/tempr.png",
    "Ronin": "https://apexlegendsstatus.com/algs/assets/teams/ronin.png",
    "geeked vs locked": "https://apexlegendsstatus.com/algs/assets/teams/geekedvslocked.png",
    "Remarkable Team": "https://apexlegendsstatus.com/algs/assets/teams/remarkableteam.png",
    "ambitionone (A1)": "https://apexlegendsstatus.com/algs/assets/teams/ambitionone(a1).png",
    "Natus Vincere": "https://apexlegendsstatus.com/algs/assets/teams/navi.png",
    "SJP2": "https://apexlegendsstatus.com/algs/assets/teams/sjp2.png",
    "Unreal Nightmare": "https://apexlegendsstatus.com/algs/assets/teams/unrealnightmare.png",
    "CrazyRaccoon": "https://apexlegendsstatus.com/algs/assets/teams/crazy racoons.png",
    "Twerkaholics": "https://apexlegendsstatus.com/algs/assets/teams/twerkaholics.png",
    "CTE": "https://apexlegendsstatus.com/algs/assets/teams/cte.png",
    "Monster": "https://apexlegendsstatus.com/algs/assets/teams/monster.png",
    "Activist YOTTA": "https://apexlegendsstatus.com/algs/assets/teams/activistyotta.png",
    "Never On Time": "https://apexlegendsstatus.com/algs/assets/teams/neverontime.png",
    "ORB GARDEN": "https://apexlegendsstatus.com/algs/assets/teams/orbgarden.png",
    "GROW Gaming": "https://apexlegendsstatus.com/algs/assets/teams/growgaming.png",
    "Reply Totem": "https://apexlegendsstatus.com/algs/assets/teams/replytotem.png",
    "LEAVENOWITNESS": "https://apexlegendsstatus.com/algs/assets/teams/leavenowitness.png",
    "3 Muppets": "https://apexlegendsstatus.com/algs/assets/teams/3muppets.png",
    "Boo": "https://apexlegendsstatus.com/algs/assets/teams/boo.png",
    "OutSide": "https://apexlegendsstatus.com/algs/assets/teams/outside.png",
    "DeeSports": "https://apexlegendsstatus.com/algs/assets/teams/deesports.png",

    // Fallback entries for teams without specific logos
    "SOURCE XNY": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "Oblivion": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "Team Liquid": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "Complexity (Disbanded)": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "ROC Esports": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "MOVISTAR KOI": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "EDward Gaming": "https://apexlegendsstatus.com/algs/assets/teams/fa.png"
  },

  // Team name mappings for consistency
  teamNameMappings: {
    // Existing mappings
    "ShopifyRebellion": "SR",
    "Shopify Rebellion": "SR",
    "FaZe Clan": "FaZe",
    "Complexity": "Complexity (Disbanded)",
    "100T": "100 Thieves",
    "C9": "Cloud9",
    "TSM": "Team SoloMid",
    "Falcons": "Team Falcons",
    "TEAM FALCONS": "Team Falcons",
    "team falcons": "Team Falcons",
    "100 THIEVES": "100 Thieves",
    "100thieves": "100 Thieves",
    "fnatic": "FNATIC",
    "Fnatic": "FNATIC",
    "nrg": "NRG",
    "Nrg": "NRG",
    "cloud9": "Cloud9",
    "CLOUD9": "Cloud9",
    "virtus.pro": "Virtus.pro",
    "VIRTUS.PRO": "Virtus.pro",
    "VirtusPro": "Virtus.pro",
    "faze": "FaZe",
    "FAZE": "FaZe",
    "Faze": "FaZe",
    "guild": "GUILD",
    "Guild": "GUILD",
    "vk gaming": "VK GAMING",
    "VK Gaming": "VK GAMING",

    // Year 5 Open team name variations
    "noez foxx": "NOEZ FOXX",
    "NOEZFOXX": "NOEZ FOXX",
    "Noez Foxx": "NOEZ FOXX",
    "legion gaming": "Legion Gaming",
    "LEGION GAMING": "Legion Gaming",
    "unleash": "Unleash",
    "UNLEASH": "Unleash",
    "sgb": "SGB",
    "Sgb": "SGB",
    "dxaesports": "DXAEsports",
    "DXAESPORTS": "DXAEsports",
    "DXA Esports": "DXAEsports",
    "dxa esports": "DXAEsports",
    "f.w.g": "F.W.G",
    "FWG": "F.W.G",
    "F W G": "F.W.G",
    "exo clan": "EXO Clan",
    "EXO CLAN": "EXO Clan",
    "ExoClan": "EXO Clan",
    "EXO": "EXO Clan",
    "rts": "RTS",
    "Rts": "RTS",
    "o2esports": "O2esports",
    "O2 Esports": "O2esports",
    "O2ESPORTS": "O2esports",
    "soten": "SOTEN",
    "Soten": "SOTEN",
    "team nemesis": "Team Nemesis",
    "TEAM NEMESIS": "Team Nemesis",
    "TeamNemesis": "Team Nemesis",
    "no surrender": "No Surrender",
    "NO SURRENDER": "No Surrender",
    "NoSurrender": "No Surrender",
    "most hated": "Most Hated",
    "MOST HATED": "Most Hated",
    "MostHated": "Most Hated",
    "oxygen none area": "Oxygen None arEa",
    "OXYGEN NONE AREA": "Oxygen None arEa",
    "OxygenNoneArea": "Oxygen None arEa",
    "virtue": "Virtue",
    "VIRTUE": "Virtue",
    "riddle order": "RIDDLE ORDER",
    "RiddleOrder": "RIDDLE ORDER",
    "Riddle Order": "RIDDLE ORDER",
    "team inferno": "Team Inferno",
    "TEAM INFERNO": "Team Inferno",
    "TeamInferno": "Team Inferno",
    "aru army": "ARU ARMY",
    "AruArmy": "ARU ARMY",
    "Aru Army": "ARU ARMY",
    "heroez": "HEROEZ",
    "Heroez": "HEROEZ",
    "HEROES": "HEROEZ",
    "mpire": "MPIRE",
    "Mpire": "MPIRE",
    "Empire": "MPIRE",
    "xny": "XNY",
    "Xny": "XNY",
    "flat": "FLAT",
    "Flat": "FLAT",
    "sbi e-sports": "SBI e-Sports",
    "SBI E-SPORTS": "SBI e-Sports",
    "SBI eSports": "SBI e-Sports",
    "SBI esports": "SBI e-Sports",
    "zone spammers": "Zone Spammers",
    "ZONE SPAMMERS": "Zone Spammers",
    "ZoneSpammers": "Zone Spammers",
    "pioneers": "Pioneers",
    "PIONEERS": "Pioneers",
    "soleil gaming": "Soleil Gaming",
    "SOLEIL GAMING": "Soleil Gaming",
    "SoleilGaming": "Soleil Gaming",
    "Soleil Gaming": "Soleil Gaming",
    "danish": "Danish",
    "DANISH": "Danish",
    "bbl": "BBL",
    "Bbl": "BBL",
    "svp water": "SVP Water",
    "SVP WATER": "SVP Water",
    "SvpWater": "SVP Water",
    "reject winnity": "Reject Winnity",
    "REJECT WINNITY": "Reject Winnity",
    "RejectWinnity": "Reject Winnity",
    "purple slushee": "Purple Slushee",
    "PURPLE SLUSHEE": "Purple Slushee",
    "PurpleSlushee": "Purple Slushee",
    "redrams": "REDRams",
    "RED RAMS": "REDRams",
    "Red Rams": "REDRams",
    "1ok": "1OK",
    "1Ok": "1OK",
    "omit": "OMiT",
    "OMIT": "OMiT",
    "Omit": "OMiT",
    "vvv": "VVV",
    "Vvv": "VVV",
    "lonely let gone": "Lonely Let Gone",
    "LONELY LET GONE": "Lonely Let Gone",
    "LonelyLetGone": "Lonely Let Gone",
    "ccg": "CCG",
    "Ccg": "CCG",
    "gupped up": "GUPPED UP",
    "GuppedUp": "GUPPED UP",
    "Gupped Up": "GUPPED UP",
    "gamblers": "Gamblers",
    "GAMBLERS": "Gamblers",
    "ryh": "RYH",
    "Ryh": "RYH",
    "wlg": "WLG",
    "Wlg": "WLG",
    "cimj": "CIMJ",
    "Cimj": "CIMJ",
    "annex esports": "Annex eSports",
    "ANNEX ESPORTS": "Annex eSports",
    "AnnexeSports": "Annex eSports",
    "Annex Esports": "Annex eSports",
    "nemesis": "Nemesis",
    "NEMESIS": "Nemesis",
    "team orchid": "Team Orchid",
    "TEAM ORCHID": "Team Orchid",
    "TeamOrchid": "Team Orchid",
    "green stego": "Green Stego",
    "GREEN STEGO": "Green Stego",
    "GreenStego": "Green Stego",
    "kinotrope gaming": "KINOTROPE gaming",
    "KINOTROPE GAMING": "KINOTROPE gaming",
    "KinotropeGaming": "KINOTROPE gaming",
    "Kinotrope Gaming": "KINOTROPE gaming",
    "cat": "CAT",
    "Cat": "CAT",
    "fusion": "FUSION",
    "Fusion": "FUSION",
    "babo": "BABO",
    "Babo": "BABO",
    "alqadsiah": "Alqadsiah",
    "ALQADSIAH": "Alqadsiah",
    "AlQadsiah": "Alqadsiah",
    "Al Qadsiah": "Alqadsiah",
    "arneb": "Arneb",
    "ARNEB": "Arneb",
    "pengupower": "PenguPower",
    "PENGUPOWER": "PenguPower",
    "Pengu Power": "PenguPower",
    "pengu power": "PenguPower",
    "ninjas in pyjamas": "Ninjas in Pyjamas",
    "NINJAS IN PYJAMAS": "Ninjas in Pyjamas",
    "NinjasInPyjamas": "Ninjas in Pyjamas",
    "NIP": "Ninjas in Pyjamas",
    "nip": "Ninjas in Pyjamas",
    "doom": "DOOM",
    "Doom": "DOOM",
    "tempr": "TEMPR",
    "Tempr": "TEMPR",
    "ronin": "Ronin",
    "RONIN": "Ronin",
    "remarkable team": "Remarkable Team",
    "REMARKABLE TEAM": "Remarkable Team",
    "RemarkableTeam": "Remarkable Team",
    "ambitionone": "ambitionone (A1)",
    "AMBITIONONE": "ambitionone (A1)",
    "AmbitionOne": "ambitionone (A1)",
    "Ambition One": "ambitionone (A1)",
    "A1": "ambitionone (A1)",
    "a1": "ambitionone (A1)",
    "natus vincere": "Natus Vincere",
    "NATUS VINCERE": "Natus Vincere",
    "NatusVincere": "Natus Vincere",
    "NAVI": "Natus Vincere",
    "navi": "Natus Vincere",
    "Na'Vi": "Natus Vincere",
    "sjp2": "SJP2",
    "Sjp2": "SJP2",
    "SJP 2": "SJP2",
    "unreal nightmare": "Unreal Nightmare",
    "UNREAL NIGHTMARE": "Unreal Nightmare",
    "UnrealNightmare": "Unreal Nightmare",
    "crazyraccoon": "CrazyRaccoon",
    "CRAZYRACCOON": "CrazyRaccoon",
    "Crazy Raccoon": "CrazyRaccoon",
    "crazy raccoon": "CrazyRaccoon",
    "CR": "CrazyRaccoon",
    "twerkaholics": "Twerkaholics",
    "TWERKAHOLICS": "Twerkaholics",
    "cte": "CTE",
    "Cte": "CTE",
    "monster": "Monster",
    "MONSTER": "Monster",
    "activist yotta": "Activist YOTTA",
    "ACTIVIST YOTTA": "Activist YOTTA",
    "ActivistYOTTA": "Activist YOTTA",
    "never on time": "Never On Time",
    "NEVER ON TIME": "Never On Time",
    "NeverOnTime": "Never On Time",
    "orb garden": "ORB GARDEN",
    "OrbGarden": "ORB GARDEN",
    "Orb Garden": "ORB GARDEN",
    "grow gaming": "GROW Gaming",
    "GROW GAMING": "GROW Gaming",
    "GrowGaming": "GROW Gaming",
    "reply totem": "Reply Totem",
    "REPLY TOTEM": "Reply Totem",
    "ReplyTotem": "Reply Totem",
    "leavenowitness": "LEAVENOWITNESS",
    "Leave No Witness": "LEAVENOWITNESS",
    "leave no witness": "LEAVENOWITNESS",
    "3 muppets": "3 Muppets",
    "3 MUPPETS": "3 Muppets",
    "3Muppets": "3 Muppets",
    "Three Muppets": "3 Muppets",
    "boo": "Boo",
    "BOO": "Boo",
    "outside": "OutSide",
    "OUTSIDE": "OutSide",
    "Out Side": "OutSide",
    "deesports": "DeeSports",
    "DEESPORTS": "DeeSports",
    "Dee Sports": "DeeSports",
    "dee sports": "DeeSports"
  }
}

// Image cache for performance
const imageCache = new Map()

export function useTeamConfig() {
  // Reactive state for loaded images
  const loadedImages = ref(new Set())
  
  // Computed properties for better performance
  const teamLogos = computed(() => teamData.logoUrls)
  const teamMappings = computed(() => teamData.teamNameMappings)
  
  /**
   * Get team logo URL with caching
   * @param {string} teamName - Team name
   * @returns {string|null} Logo URL or null
   */
  const getTeamLogo = (teamName) => {
    if (!teamName) return null
    
    // Direct match
    let logoUrl = teamLogos.value[teamName]
    if (logoUrl) return logoUrl
    
    // Mapped name lookup
    const mappedName = teamMappings.value[teamName]
    if (mappedName && teamLogos.value[mappedName]) {
      return teamLogos.value[mappedName]
    }
    
    // Fuzzy match (simplified)
    const normalizedName = teamName.toLowerCase().trim()
    for (const [key, value] of Object.entries(teamLogos.value)) {
      if (key.toLowerCase().includes(normalizedName) || 
          normalizedName.includes(key.toLowerCase())) {
        return value
      }
    }
    
    return null
  }
  
  /**
   * Generate fallback configuration for teams
   * @param {string} teamName - Team name
   * @returns {object} Fallback config
   */
  const getFallbackConfig = (teamName) => {
    if (!teamName) return { backgroundColor: '#6b7280', initials: '??', icon: '❓' }
    
    // Generate color based on team name hash
    const hash = teamName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    const colors = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#c2410c']
    const backgroundColor = colors[Math.abs(hash) % colors.length]
    
    // Generate initials
    const words = teamName.split(/\s+/).filter(word => word.length > 0)
    let initials = words.length > 1 
      ? words.slice(0, 2).map(word => word[0].toUpperCase()).join('')
      : teamName.substring(0, 2).toUpperCase()
    
    return {
      backgroundColor,
      initials,
      icon: '🏆'
    }
  }
  
  /**
   * Preload image for better performance
   * @param {string} url - Image URL
   * @returns {Promise<void>}
   */
  const preloadImage = (url) => {
    if (!url || imageCache.has(url)) return Promise.resolve()
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        imageCache.set(url, true)
        loadedImages.value.add(url)
        resolve()
      }
      img.onerror = reject
      img.src = url
    })
  }
  
  /**
   * Preload all team logos
   * @returns {Promise<void>}
   */
  const preloadAllLogos = async () => {
    const urls = Object.values(teamLogos.value).filter(url => url && !url.includes('fa.png'))
    
    try {
      await Promise.allSettled(urls.map(url => preloadImage(url)))
      console.log('✅ Team logos preloaded successfully')
    } catch (error) {
      console.warn('⚠️ Some team logos failed to preload:', error)
    }
  }
  
  /**
   * Get team initials for display
   * @param {string} teamName - Team name
   * @returns {string} Team initials
   */
  const getTeamInitials = (teamName) => {
    return getFallbackConfig(teamName).initials
  }
  
  /**
   * Check if image is loaded
   * @param {string} url - Image URL
   * @returns {boolean} Is loaded
   */
  const isImageLoaded = (url) => {
    return loadedImages.value.has(url)
  }
  
  return {
    // Reactive state
    loadedImages,
    
    // Computed properties
    teamLogos,
    teamMappings,
    
    // Methods
    getTeamLogo,
    getFallbackConfig,
    preloadImage,
    preloadAllLogos,
    getTeamInitials,
    isImageLoaded
  }
}

// Export team configuration for backward compatibility
export { teamData } 