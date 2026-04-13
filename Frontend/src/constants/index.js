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
    text: "Edzés előtt 30 percvel igyál vizet, hosszú blokkban pedig 15 percenként pótold.",
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
    title: "Programterv pár perc alatt",
    text: "Állíts össze heti ritmust presetekkel, és tartsd a fókuszt.",
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
  "Programterv, ami a heti ritmushoz igazodik",
];

export const footerLinksBase = [
  { to: "/", label: "Főoldal" },
  { to: "/kinalat", label: "Kínálat" },
  { to: "/tippek", label: "Tippek" },
  { to: "/programterv", label: "Programterv" },
  { to: "/terkep", label: "Térkép" },
];

export const timeSlotLabels = {
  morning: "Reggel",
  afternoon: "Délután",
  evening: "Este",
  weekend: "Hétvége",
};
