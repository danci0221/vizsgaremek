import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const CITY_COORDS = {
  Budapest: { lat: 47.497912, lng: 19.040235 },
  Debrecen: { lat: 47.531604, lng: 21.627312 },
  Szeged: { lat: 46.253010, lng: 20.141425 },
  Győr: { lat: 47.687013, lng: 17.650376 },
  Pécs: { lat: 46.072730, lng: 18.232265 },
  Miskolc: { lat: 48.103987, lng: 20.778439 },
  Székesfehérvár: { lat: 47.186433, lng: 18.421558 },
  Nyíregyháza: { lat: 47.949527, lng: 21.724597 },
};

const ADDRESS_COORDS = {
  "1138 Budapest, Váci út 144-150.": { lat: 47.53308, lng: 19.07053 },
  "1117 Budapest, Irinyi József utca 4.": { lat: 47.47362, lng: 19.06139 },
  "1024 Budapest, Lövőház utca 2-6.": { lat: 47.50978, lng: 19.02469 },
  "4025 Debrecen, Piac utca 32.": { lat: 47.5311, lng: 21.6279 },
  "4032 Debrecen, Egyetem tér 1.": { lat: 47.55309, lng: 21.62134 },
  "6720 Szeged, Tisza Lajos körút 54.": { lat: 46.25303, lng: 20.14562 },
  "6725 Szeged, Boldogasszony sugárút 12.": { lat: 46.24856, lng: 20.14854 },
  "9021 Győr, Káptalandomb 3.": { lat: 47.68738, lng: 17.63551 },
  "9022 Győr, Árpád út 45.": { lat: 47.68427, lng: 17.64088 },
  "7621 Pécs, Király utca 12.": { lat: 46.07548, lng: 18.22713 },
  "7632 Pécs, Aidinger János út 18.": { lat: 46.06084, lng: 18.20179 },
  "3525 Miskolc, Széchenyi utca 88.": { lat: 48.10118, lng: 20.78041 },
  "3530 Miskolc, Görgey Artúr utca 6.": { lat: 48.10808, lng: 20.79156 },
  "8000 Székesfehérvár, Palotai út 1.": { lat: 47.19934, lng: 18.40372 },
  "8000 Székesfehérvár, Sóstói út 7.": { lat: 47.18671, lng: 18.43846 },
  "4400 Nyíregyháza, Országzászló tér 3.": { lat: 47.95575, lng: 21.71671 },
  "4400 Nyíregyháza, Stadion utca 12.": { lat: 47.96322, lng: 21.73147 },
};

export default function MapPage({ sports, mapFocusId, onFocusItem }) {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const normalizeTypeKey = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "default";

  const coinHash = (text) =>
    Array.from(text).reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 1000, 0);

  const markers = useMemo(() => {
    const grouped = new Map();

    sports.forEach((item) => {
        const city = item.location || "Ismeretlen";
        const address = item.address || "Nincs cím";
        const name = item.name || "Sportlehetőség";
        const sportType = item.sportType || "Ismeretlen";
        const groupKey = `${city}|${address}`;

        if (grouped.has(groupKey)) {
          const existing = grouped.get(groupKey);
          existing.sportTypes.add(sportType);
          existing.names.add(name);
          return;
        }

        const exactCoords =
          item.latitude !== null && item.longitude !== null
            ? { lat: item.latitude, lng: item.longitude }
            : ADDRESS_COORDS[address];
        const base = CITY_COORDS[city] || { lat: 47.1625, lng: 19.5033 };
        const hashOffset = coinHash(`${name}-${address}`) / 2000;
        const lonOffset = ((coinHash(`${name}-${address}-lon`) % 100) - 50) / 5000;
        const latOffset = ((coinHash(`${name}-${address}-lat`) % 100) - 50) / 5000;

        const position = {
          lat: exactCoords ? exactCoords.lat : base.lat + latOffset + hashOffset / 50,
          lng: exactCoords ? exactCoords.lng : base.lng + lonOffset - hashOffset / 50,
        };

        grouped.set(groupKey, {
          id: String(item.id ?? `${city}-${address}-${name}`),
          city,
          address,
          name,
          sportType,
          sportTypeKey: normalizeTypeKey(sportType),
          sportTypes: new Set([sportType]),
          names: new Set([name]),
          ...position,
        });
      });

    return Array.from(grouped.values()).map((entry) => {
      const sportTypes = Array.from(entry.sportTypes).sort((a, b) => a.localeCompare(b, "hu"));
      const names = Array.from(entry.names).sort((a, b) => a.localeCompare(b, "hu"));
      return {
        ...entry,
        sportTypes,
        names,
      };
    });
  }, [sports]);

  const cities = useMemo(
    () => [...new Set(markers.map((marker) => marker.city))].sort((a, b) => a.localeCompare(b, "hu")),
    [markers]
  );

  const typeCounts = useMemo(() => {
    const source =
      selectedCity === "all" ? markers : markers.filter((marker) => marker.city === selectedCity);

    return source.reduce((acc, marker) => {
      marker.sportTypes.forEach((type) => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {});
  }, [markers, selectedCity]);

  const types = useMemo(
    () => Object.keys(typeCounts).sort((a, b) => a.localeCompare(b, "hu")),
    [typeCounts]
  );

  const filteredMarkers = useMemo(
    () =>
      markers.filter(
        (marker) =>
          (selectedCity === "all" || marker.city === selectedCity) &&
          (selectedType === "all" || marker.sportTypes.includes(selectedType))
      ),
    [markers, selectedCity, selectedType]
  );

  const sortedMarkers = useMemo(
    () =>
      [...filteredMarkers].sort(
        (a, b) => a.city.localeCompare(b.city, "hu") || a.name.localeCompare(b.name, "hu")
      ),
    [filteredMarkers]
  );

  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerByIdRef = useRef({});

  const focusMarker = useCallback(
    (markerId) => {
      onFocusItem?.(markerId);

      const map = mapRef.current;
      const leafletMarker = markerByIdRef.current[markerId];
      if (!map || !leafletMarker) return;

      const latLng = leafletMarker.getLatLng();
      const targetZoom = Math.max(map.getZoom(), 13);
      map.flyTo([latLng.lat, latLng.lng], targetZoom, {
        animate: true,
        duration: 0.35,
      });
      setTimeout(() => leafletMarker.openPopup(), 220);
    },
    [onFocusItem]
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [47.1625, 19.5033],
        zoom: 6,
        minZoom: 5,
        maxZoom: 16,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      markerLayerRef.current = L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 52,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="map-cluster"><span>${childCount}</span></div>`,
            className: "map-cluster-wrapper",
            iconSize: [44, 44],
          });
        },
      }).addTo(mapRef.current);

      markerLayerRef.current.on("clusterclick", (event) => {
        const childMarkers = event.layer.getAllChildMarkers();
        const items = childMarkers
          .map((child) => child.options.meta)
          .filter(Boolean)
          .map((meta) => `<li><strong>${meta.name}</strong> - ${meta.city}</li>`)
          .join("");

        const popupHtml = `
          <div class="cluster-popup">
            <strong>Közeli sporthelyek:</strong>
            <ul>${items}</ul>
            <small>Nagyíts rá a térképre, és a pontok külön jelennek meg.</small>
          </div>
        `;

        L.popup({ maxWidth: 300 })
          .setLatLng(event.layer.getLatLng())
          .setContent(popupHtml)
          .openOn(mapRef.current);
      });
    }

    if (!markerLayerRef.current) return;
    markerLayerRef.current.clearLayers();
    markerByIdRef.current = {};

    const popupByLocation = {};

    filteredMarkers.forEach((marker) => {
      const visualType = selectedType === "all" ? marker.sportTypes[0] : selectedType;
      const mainType = normalizeTypeKey(visualType) || "default";
      const markerInitial = String(visualType || "S").trim().charAt(0).toUpperCase();
      const focusedClass = mapFocusId === marker.id ? "is-focused" : "";
      const iconHtml = `
        <div class="sport-marker sport-marker-${mainType} ${focusedClass}">
          <span class="marker-halo"></span>
          <span class="marker-dot"></span>
          <span class="marker-glyph">${markerInitial}</span>
          <span class="marker-tip"></span>
        </div>
      `;

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        meta: marker,
        icon: L.divIcon({
          className: "",
          html: iconHtml,
          iconSize: [36, 48],
          iconAnchor: [18, 46],
        }),
      }).addTo(markerLayerRef.current);

      leafletMarker.bindPopup(`
        <strong>${marker.names[0]}</strong><br />
        <strong>${marker.city}</strong><br />
        ${marker.address}<br />
        Sportág: ${marker.sportTypes.join(", ")}
      `);

      leafletMarker.on("click", () => {
        focusMarker(marker.id);
      });

      popupByLocation[marker.id] = leafletMarker;
      markerByIdRef.current[marker.id] = leafletMarker;
    });

    if (mapFocusId && popupByLocation[mapFocusId]) {
      const focusedLatLng = popupByLocation[mapFocusId].getLatLng();
      const targetZoom = Math.max(mapRef.current.getZoom(), 13);
      popupByLocation[mapFocusId].openPopup();
      mapRef.current.setView([focusedLatLng.lat, focusedLatLng.lng], targetZoom, { animate: true });
    } else if (filteredMarkers.length > 0) {
      const latLngs = filteredMarkers.map((m) => [m.lat, m.lng]);
      mapRef.current.fitBounds(latLngs, { padding: [40, 40], maxZoom: 10 });
    }
  }, [filteredMarkers, focusMarker, mapFocusId]);

  return (
    <section className="map-section surface-panel">
      <div className="section-heading">
        <p className="eyebrow">Térkép</p>
        <h2>Sporthelyek térképes nézetben</h2>
        <p className="muted-mini">
          Sportág és város szerint is szűrhető térképes nézet.
        </p>
      </div>

      <div className="map-filters" aria-label="Térkép kategóriák">
        <div className="map-type-filters">
          <button
            type="button"
            className={`map-filter-chip ${selectedType === "all" ? "active" : ""}`}
            onClick={() => setSelectedType("all")}
          >
            Minden sport ({filteredMarkers.length})
          </button>
          {types.map((type) => (
            <button
              key={type}
              type="button"
              className={`map-filter-chip ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type} ({typeCounts[type] || 0})
            </button>
          ))}
        </div>

        <label className="map-city-filter">
          Város
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="all">Összes város</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="map-layout">
        <div className="map-canvas" aria-label="Magyarország sporthely térképe" ref={mapContainerRef} id="sporthub-map" />

        <aside className="map-list">
          {sortedMarkers.length > 0 ? (
            sortedMarkers.map((marker) => (
              <article
                key={marker.id}
                className={`map-item ${mapFocusId === marker.id ? "active" : ""}`}
                onClick={() => focusMarker(marker.id)}
              >
                <h4>{marker.names[0]}</h4>
                <p>{marker.city}</p>
                <p>{marker.address}</p>
                <p className="muted-mini">Sportág: {marker.sportTypes.join(", ")}</p>
              </article>
            ))
          ) : (
            <p>Nincsenek sporthelyek a térképhez.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
