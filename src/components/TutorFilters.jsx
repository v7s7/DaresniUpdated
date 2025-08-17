// src/components/TutorFilters.jsx
import { useEffect, useMemo, useState } from "react";
import { debounce } from "../utils/debounce";

export default function TutorFilters({
  tutors,
  value,
  onChange,
}) {
  // Build subjects & locations from current tutor list
  const { subjects, locations } = useMemo(() => {
    const subjSet = new Set();
    const locSet = new Set();
    (tutors || []).forEach(t => {
      if (t.location) locSet.add((t.location || '').trim());
      // subjects array
      if (Array.isArray(t.subjects)) {
        t.subjects.forEach(s => s?.name && subjSet.add(s.name.trim()));
      }
      // fall back to expertise string as a “subject”
      if (t.expertise) subjSet.add(t.expertise.trim());
    });
    return {
      subjects: Array.from(subjSet).sort(),
      locations: Array.from(locSet).sort(),
    };
  }, [tutors]);

  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  // debounce text input only
  const debouncedTextChange = useMemo(
    () => debounce((q) => onChange({ ...local, query: q }), 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [local, onChange]
  );

  const set = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    if (!patch.query) onChange(next);
  };

  return (
    <div style={{
      display: "grid",
      gap: "0.75rem",
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
      alignItems: "end",
      marginBottom: "1rem"
    }}>
      {/* Search */}
      <div style={{ display: "grid", gap: 4 }}>
        <label style={{ fontWeight: 600 }}>Search</label>
        <input
          type="text"
          placeholder="Name, subject, location…"
          defaultValue={local.query}
          onChange={(e) => debouncedTextChange(e.target.value)}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </div>

      {/* Subject */}
      <div style={{ display: "grid", gap: 4 }}>
        <label style={{ fontWeight: 600 }}>Subject</label>
        <select
          value={local.subject || ""}
          onChange={(e) => set({ subject: e.target.value || null })}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">Any</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Location */}
      <div style={{ display: "grid", gap: 4 }}>
        <label style={{ fontWeight: 600 }}>Location</label>
        <select
          value={local.location || ""}
          onChange={(e) => set({ location: e.target.value || null })}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">Anywhere</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Price min/max */}
      <div style={{ display: "grid", gap: 4 }}>
        <label style={{ fontWeight: 600 }}>Min Price</label>
        <input
          type="number"
          value={local.minPrice ?? ""}
          onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : null })}
          placeholder="BHD"
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        <label style={{ fontWeight: 600 }}>Max Price</label>
        <input
          type="number"
          value={local.maxPrice ?? ""}
          onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : null })}
          placeholder="BHD"
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </div>

      {/* Second row: rating + sort */}
      <div style={{
        gridColumn: "1 / -1",
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "end"
      }}>
        <div style={{ display: "grid", gap: 4 }}>
          <label style={{ fontWeight: 600 }}>Min Rating</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={local.minRating ?? ""}
            onChange={(e) => set({ minRating: e.target.value ? Number(e.target.value) : null })}
            placeholder="e.g., 4.0"
            style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <label style={{ fontWeight: 600 }}>Sort by</label>
          <select
            value={local.sortBy || ""}
            onChange={(e) => set({ sortBy: e.target.value || null })}
            style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="">Relevance</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="rating_desc">Rating ↓</option>
            <option value="rating_asc">Rating ↑</option>
          </select>
        </div>
      </div>
    </div>
  );
}
