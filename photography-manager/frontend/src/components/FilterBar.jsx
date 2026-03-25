import { useState, useEffect, useMemo } from "react";
import styles from "./FilterBar.module.css";

function FilterBar({ tags, locations, onFilter, initialFilters = {} }) {
  const [tag, setTag] = useState(initialFilters.tag || "");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState(initialFilters.location || "");
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialFilters.dateTo || "");
  const [sort, setSort] = useState(initialFilters.sort || "");

  // Restore country once locations are loaded
  useEffect(() => {
    if (locations.length === 0) return;
    if (initialFilters.location) {
      const loc = locations.find((l) => l._id === initialFilters.location);
      if (loc) setCountry(loc.country);
    } else if (initialFilters.locations) {
      const ids = initialFilters.locations.split(",");
      const loc = locations.find((l) => ids.includes(l._id));
      if (loc) setCountry(loc.country);
    }
  }, [locations]);

  const countries = useMemo(() => {
    const unique = [...new Set(locations.map((l) => l.country))];
    return unique.sort();
  }, [locations]);

  const cities = useMemo(() => {
    if (!country) return [];
    return locations.filter((l) => l.country === country);
  }, [locations, country]);

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setCity("");
  };

  const handleApply = () => {
    const filters = {};
    if (tag) filters.tag = tag;
    if (city) filters.location = city;
    else if (country) {
      const cityIds = locations
        .filter((l) => l.country === country)
        .map((l) => l._id);
      filters.locations = cityIds.join(",");
    }
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (sort) filters.sort = sort;
    onFilter(filters);
  };

  const handleReset = () => {
    setTag("");
    setCountry("");
    setCity("");
    setDateFrom("");
    setDateTo("");
    setSort("");
    onFilter({});
  };

  return (
    <div className={styles.container}>
      <select
        className={styles.select}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      >
        <option value="">🏷️ All Tags</option>
        {tags.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={country}
        onChange={handleCountryChange}
      >
        <option value="">🌍 All Countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        disabled={!country}
      >
        <option value="">🏙️ All Cities</option>
        {cities.map((l) => (
          <option key={l._id} value={l._id}>
            {l.city}
          </option>
        ))}
      </select>

      <input
        className={styles.input}
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
      />
      <input
        className={styles.input}
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
      />

      <select
        className={styles.select}
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">↕️ Sort by</option>
        <option value="date_asc">📅 Date (oldest first)</option>
        <option value="date_desc">📅 Date (newest first)</option>
        <option value="title_asc">🔤 Title (A-Z)</option>
        <option value="title_desc">🔤 Title (Z-A)</option>
      </select>

      <button className={styles.buttonApply} onClick={handleApply}>
        Apply
      </button>
      <button className={styles.buttonReset} onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}

export default FilterBar;
