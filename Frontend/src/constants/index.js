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
];

export const prepTips = [
  "Kezdd 5-8 perc átmozgatással.",
  "Az első 10 perc legyen könnyebb tempó.",
  "Ellenőrizd cipő, víz, törölköző.",
  "Hetente legalább 1 teljes pihenő.",
];

export const recoveryTips = [
  "Edzés után 10-15 perc levezetés.",
  "Napi 7-8 óra alvás szinte kötelező.",
  "Magas intenzitás után másnap könnyű mozgás.",
  "Fehérje + szénhidrát + víz legyen meg.",
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
