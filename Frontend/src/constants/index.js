// ============== KEYS ==============
export const FAVORITES_KEY = "sporthub_favorites_v1";
export const FAVORITES_OWNER_KEY = "sporthub_favorites_owner_v1";
export const AUTH_USER_KEY = "sporthub_auth_user_v1";

// ============== DEFAULTS ==============
export const signUpDefaults = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const signInDefaults = {
  identifier: "",
  password: "",
};

export const defaultFilters = {
  type: "all",
  location: "all",
  category: "all",
  timeSlot: "all",
  price: "all",
  sort: "recommended",
  onlyFavorites: false,
};

export const plannerDefaults = {
  type: "all",
  location: "all",
  timeSlot: "all",
  budget: "all",
};

export const emptyForm = {
  name: "",
  sportType: "",
  category: "",
  location: "",
  address: "",
  price: "",
  timeSlot: "morning",
  openingHours: "",
  contact: "",
  description: "",
  image: "",
};

// ============== GALLERY & TIPS ==============
export const galleryCards = [
  {
    title: "Úszás - teljes testes fókusz",
    place: "Szeged",
    image:
      "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Tenisz - gyors reakció",
    place: "Budapest",
    image:
      "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Futás - ritmus és állóképesség",
    place: "Debrecen",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
  },
];

export const tipsCards = [
  {
    title: "Bemelegítés 8 perc alatt",
    text: "Rövid mobilizálás + fokozatos pulzusemelés segít megelőzni a sérüléseket.",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hidratálás tervezetten",
    text: "Edzés előtt 30 perccel igyál vizet, hosszú blokkban pedig 15 percenként pótold.",
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Regeneráció komolyan",
    text: "Alvás, nyújtás és könnyű átmozgatás adja a tartós fejlődés valódi alapját.",
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Táplálkozás az erőért",
    text: "Egyél kiegyensúlyozottan: fehérje, szénhidrát és zsír aránya segít a teljesítményben.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Mentális wellness",
    text: "Figyelj a stresszre és a motivációra. Rövid meditáció vagy vizualizáció segíthet.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Technika fejlesztése",
    text: "Fókuszálj a helyes formára. Lassú ismétlések és videók segítenek javítani.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  },
];

export const prepTips = [
  "Kezdd 5-8 perc átmozgatással.",
  "Az első 10 perc legyen könnyebb tempó.",
  "Ellenőrizd cipő, víz, törölköző.",
  "Hetente legalább 1 teljes pihenő.",
  "Egyél edzés előtt 1-2 órával.",
  "Figyelj az időjárásra és ruházatra.",
  "Melegítsd fel az izmokat nyújtással.",
  "Állítsd be a célokat az edzésre.",
];

export const recoveryTips = [
  "Edzés után 10-15 perc levezetés.",
  "Napi 7-8 óra alvás szinte kötelező.",
  "Magas intenzitás után másnap könnyű mozgás.",
  "Fehérje + szénhidrát + víz legyen meg.",
  "Nyújtás segít az izomlazításban.",
  "Használj jég vagy meleg pakolást sérülés esetén.",
  "Figyelj a test jeleire, ne erőltesd.",
  "Pihenj, ha fáradt vagy.",
];

export const nutritionTips = [
  "Egyél fehérjét minden étkezéskor az izomépítéshez.",
  "Szénhidrátok adják az energiát, de mértékkel.",
  "Zöldségek és gyümölcsök a vitaminokért.",
  "Hidratálj rendszeresen, ne csak edzéskor.",
  "Kerüld a feldolgozott ételeket.",
  "Tervezd meg az étkezéseket előre.",
];

export const mentalTips = [
  "Állíts be reális célokat.",
  "Motiváld magad pozitív gondolatokkal.",
  "Kerüld az összehasonlítást másokkal.",
  "Ünnepeld a kis sikereket.",
  "Használj vizualizációt a teljesítményhez.",
  "Kérj támogatást, ha szükséges.",
];

export const randomTips = [
  "Egyél banánt edzés előtt energiaért!",
  "Próbáld ki a HIIT-et rövid idő alatt.",
  "Figyelj a légzésedre minden mozdulatnál.",
  "Változtasd meg a rutint hetente egyszer.",
  "Mosolyogj edzés közben - jobb lesz a hangulat!",
  "Hallgass zenét, ami motivál.",
  "Jegyezd fel az edzéseidet egy naplóba.",
  "Kérdezd meg a tested: mit szeretnél ma csinálni?",
];

export const motivationalQuotes = [
  "\"A siker nem végleges, a kudarc nem végzetes: a folytatás bátorsága számít.\" - Winston Churchill",
  "\"Ne várj a tökéletes pillanatra, tedd meg most.\"",
  "\"Minden nagy utazás egyetlen lépéssel kezdődik.\" - Lao Tzu",
  "\"Az edzés nem büntetés, jutalom.\"",
];

export const quizQuestions = [
  {
    question: "Mi a legjobb időpont az edzés előtt enni?",
    options: ["Pontosan edzés előtt", "1-2 órával előtte", "Edzés után azonnal", "Nem számít"],
    correct: 1,
  },
  {
    question: "Hány óra alvás ajánlott sportolóknak?",
    options: ["4-5 óra", "6-7 óra", "7-9 óra", "10+ óra"],
    correct: 2,
  },
  {
    question: "Mi segít a leggyorsabban a regenerációban?",
    options: ["Forró fürdő", "Aktív pihenés és nyújtás", "Teljes mozdulatlanság", "Több edzés"],
    correct: 1,
  },
  {
    question: "Miért fontos a bemelegítés edzés előtt?",
    options: ["Növeli a sérülésveszélyt", "Csak időpazarlás", "Felkészíti az izmokat és ízületeket", "Csak profiknak kell"],
    correct: 2,
  },
  {
    question: "Mikor érdemes pótolni a folyadékot?",
    options: ["Csak edzés után", "Csak ha szomjas vagy", "Edzés előtt, közben és után is", "Csak nyáron"],
    correct: 2,
  },
  {
    question: "Melyik jel utalhat túledzésre?",
    options: ["Folyamatos fáradtság és romló teljesítmény", "Jobb alvásminőség", "Gyorsabb regeneráció", "Javuló motiváció"],
    correct: 0,
  },
  {
    question: "Mi a fehérje fő szerepe a sporttáplálkozásban?",
    options: ["Csak energiaforrás", "Izomregeneráció és izomépítés támogatása", "Hidratáció pótlása", "Pulzus csökkentése"],
    correct: 1,
  },
  {
    question: "Mit érdemes tenni, ha edzés közben szédülést érzel?",
    options: ["Növelni az intenzitást", "Figyelmen kívül hagyni", "Megállni, pihenni és folyadékot pótolni", "Azonnal sprintelni"],
    correct: 2,
  },
  {
    question: "Melyik intenzitás ideális a zsírégető, hosszabb kardióhoz?",
    options: ["Közepes, tartós intenzitás", "Mindig maximális terhelés", "Csak nagyon alacsony intenzitás", "Nincs jelentősége"],
    correct: 0,
  },
  {
    question: "Melyik étkezés lehet jó választás edzés utáni regenerációhoz?",
    options: ["Csak cukros üdítő", "Fehérje + összetett szénhidrát", "Semmit ne egyél 6 óráig", "Csak koffein"],
    correct: 1,
  },
];

export const momentumItems = [
  { label: "Aktív idősáv", value: "06-22" },
  { label: "Sablon tervek", value: "3 perc" },
  { label: "Okos szűrők", value: "azonnal" },
  { label: "Közösség", value: "heti kihívás" },
  { label: "Térképes nézet", value: "élő" },
  { label: "Kedvencek", value: "mentve" },
];

export const featureHighlights = [
  {
    index: "01",
    title: "Okos szűrők és keresők",
    text: "Egyetlen panelen váltasz sporttípus, idősáv és árszint között.",
  },
  {
    index: "02",
    title: "Kedvencek és összehasonlítás",
    text: "Azonnal látod a legjobb helyeket, és képtelen vagy elfelejteni őket.",
  },
  {
    index: "03",
    title: "Sportkvíz pár perc alatt",
    text: "Pár kérdésre válaszolva megtudod, mely sportok illeszkednek hozzád.",
  },
  {
    index: "04",
    title: "Térképes tájékozódás",
    text: "Gyorsan átlátod, melyik városban milyen opciók vannak.",
  },
];

export const challengeCards = [
  {
    title: "3x45 perc mozgáskihívás",
    text: "Válassz három különböző sporthelyet, hogy változatos legyen a heted.",
    actionLabel: "Indítom",
    actionPath: "/kinalat",
  },
  {
    title: "Hétvégi közösség",
    text: "Fókusz az ingyenes, közösségi eseményekre szombaton vagy vasárnap.",
    actionLabel: "Hétvégi lista",
    actionPath: "/kinalat",
  },
  {
    title: "Regenerációs blokk",
    text: "Építs be egy pihenőnapot, hogy tartós legyen a fejlődés.",
    actionLabel: "Tippek",
    actionPath: "/tippek",
  },
];

export const ctaHighlights = [
  "Valós idejű ajánlások és okos szűrők",
  "Kedvencek automatikus mentése",
  "Sportkvíz, mely személyre szabott ajánlásokat ad",
];

export const footerLinksBase = [
  { to: "/", label: "Főoldal" },
  { to: "/kinalat", label: "Kínálat" },
  { to: "/tippek", label: "Tippek" },
  { to: "/sportkviz", label: "Sportkvíz" },
  { to: "/terkep", label: "Térkép" },
];

export const timeSlotLabels = {
  morning: "Reggel",
  afternoon: "Délután",
  evening: "Este",
  weekend: "Hétvége",
};

// ============== SPORT AJÂNLÓ QUIZ ==============
export const sportQuizQuestions = [
  {
    id: "intensity",
    question: "Milyen intenzitáson szeretsz edzeni?",
    type: "single",
    options: [
      { label: "Könnyű, relaxálóbb mozgás", value: "light" },
      { label: "Közepes, kihívó de fenntartható", value: "moderate" },
      { label: "Magas, verítékes intenzitás", value: "high" },
    ],
  },
  {
    id: "type",
    question: "Mi vonz meg jobban?",
    type: "single",
    options: [
      { label: "Kardió (futás, úszás, kerékpár)", value: "cardio" },
      { label: "Erőedzés és izomépítés", value: "strength" },
      { label: "Egyensúly és rugalmasság (jóga, pilates)", value: "balance" },
      { label: "Csapat és verseng (labdajáték)", value: "team" },
    ],
  },
  {
    id: "group",
    question: "Hogyan szeretsz edzeni?",
    type: "single",
    options: [
      { label: "Egyénileg, saját tempóban", value: "individual" },
      { label: "Kiscsoportban, barátokkal", value: "small_group" },
      { label: "Nagyobb csoportban vagy osztályon", value: "class" },
      { label: "Csapatsportban", value: "team_sport" },
    ],
  },
  {
    id: "location",
    question: "Hol szeretsz edzeni?",
    type: "single",
    options: [
      { label: "Kültéren (park, pályák)", value: "outdoor" },
      { label: "Beltéren (edzőterem, stúdió)", value: "indoor" },
      { label: "Mindegy, felváltva szívesen", value: "both" },
    ],
  },
  {
    id: "budget",
    question: "Mi a te költségvetési kereteid?",
    type: "single",
    options: [
      { label: "Ingyenes vagy nagyon olcsó", value: "free" },
      { label: "Kedvező (1-5000 Ft körül)", value: "budget" },
      { label: "Prémium (5000+ Ft)", value: "premium" },
    ],
  },
  {
    id: "time",
    question: "Mikor szívesen mozgolnál?",
    type: "single",
    options: [
      { label: "Reggel, még munkakezdés előtt", value: "morning" },
      { label: "Délután, munka vagy iskola után", value: "afternoon" },
      { label: "Este, levezetésként", value: "evening" },
      { label: "Hétvégén, ha van idő", value: "weekend" },
    ],
  },
  {
    id: "duration",
    question: "Mennyi időt tudsz edzésre szánni egy alkalommal?",
    type: "single",
    options: [
      { label: "30 perc vagy kevesebb", value: "short" },
      { label: "30-60 perc", value: "medium" },
      { label: "60+ perc", value: "long" },
    ],
  },
];
