import { useState, useEffect } from "react";
import { getPhotos } from "../services/photoService";
import { getTags } from "../services/tagService";
import { getLocations } from "../services/locationService";
import PhotoCard from "../components/PhotoCard";
import FilterBar from "../components/FilterBar";
import styles from "./Gallery.module.css";

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("galleryFilters");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    getTags().then(setTags);
    getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPhotos(filters).then((data) => {
      const sorted = sortPhotos(data, filters.sort);
      setPhotos(sorted);
      setLoading(false);
    });
  }, [filters]);

  const handleFilter = (newFilters) => {
    localStorage.setItem("galleryFilters", JSON.stringify(newFilters));
    setFilters(newFilters);
  };

  const sortPhotos = (data, sort) => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      if (sort === "date_asc")
        return new Date(a.dateTaken) - new Date(b.dateTaken);
      if (sort === "date_desc")
        return new Date(b.dateTaken) - new Date(a.dateTaken);
      if (sort === "title_asc") return a.title.localeCompare(b.title);
      if (sort === "title_desc") return b.title.localeCompare(a.title);
      return 0;
    });
  };

  return (
    <div className={styles.container}>
      <FilterBar
        tags={tags}
        locations={locations}
        onFilter={handleFilter}
        initialFilters={filters}
      />
      {loading ? (
        <p className={styles.message}>Loading...</p>
      ) : photos.length === 0 ? (
        <p className={styles.message}>No photos found.</p>
      ) : (
        <div className={styles.grid}>
          {photos.map((photo) => (
            <PhotoCard key={photo._id} photo={photo} allPhotos={photos} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;
