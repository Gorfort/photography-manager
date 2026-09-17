import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPhotos, updatePhoto, deletePhoto } from "../services/photoService";
import { getTags } from "../services/tagService";
import { getLocations } from "../services/locationService";
import { useAuth } from "../context/AuthContext";
import exifr from "exifr";
import { API_BASE_URL } from "../config";
import styles from "./PhotoDetail.module.css";

function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exif, setExif] = useState(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDateTaken, setEditDateTaken] = useState("");
  const [editResolution, setEditResolution] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    getTags().then(setTags);
    getLocations().then(setLocations);
  }, []);

  useEffect(() => {
    const passedPhotos = location.state?.allPhotos;
    if (passedPhotos && passedPhotos.length > 0) {
      setPhotos(passedPhotos);
      const index = passedPhotos.findIndex((p) => p._id === id);
      setCurrentIndex(index >= 0 ? index : 0);
      setLoading(false);
    } else {
      getPhotos().then((data) => {
        setPhotos(data);
        const index = data.findIndex((p) => p._id === id);
        setCurrentIndex(index >= 0 ? index : 0);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (photos.length === 0) return;
    const photo = photos[currentIndex];
    setExif(null);
    setEditing(false);
    exifr
      .parse(`${API_BASE_URL}${photo.url}`, {
        pick: [
          "Make",
          "Model",
          "ISO",
          "ExposureTime",
          "FNumber",
          "FocalLength",
          "DateTimeOriginal",
        ],
      })
      .then((data) => {
        if (data) setExif(data);
      })
      .catch(() => setExif(null));
  }, [currentIndex, photos]);

  useEffect(() => {
    const handleKey = (e) => {
      if (editing) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, photos, editing]);

  const goNext = () => {
    if (currentIndex < photos.length - 1) {
      const next = photos[currentIndex + 1];
      navigate(`/photos/${next._id}`, { state: { allPhotos: photos } });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      const prev = photos[currentIndex - 1];
      navigate(`/photos/${prev._id}`, { state: { allPhotos: photos } });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleEditClick = () => {
    const photo = photos[currentIndex];
    setEditTitle(photo.title);
    setEditDateTaken(photo.dateTaken ? photo.dateTaken.split("T")[0] : "");
    setEditResolution(photo.resolution || "");
    setEditLocation(photo.location?._id || "");
    setEditTags(photo.tags ? photo.tags.map((t) => t._id) : []);
    setEditing(true);
  };

  const handleEditSave = async () => {
    const photo = photos[currentIndex];
    const data = {
      title: editTitle,
      dateTaken: editDateTaken || null,
      resolution: editResolution,
      location: editLocation || null,
      tags: editTags,
    };
    const updated = await updatePhoto(photo._id, data, user.token);
    const updatedPhotos = photos.map((p) =>
      p._id === photo._id ? { ...p, ...updated } : p
    );
    setPhotos(updatedPhotos);
    setEditing(false);
    setEditMessage("Photo updated successfully!");
    setTimeout(() => setEditMessage(""), 3000);
  };

  const handleDelete = async () => {
    const photo = photos[currentIndex];
    if (!window.confirm(`Delete "${photo.title}"?`)) return;
    await deletePhoto(photo._id, user.token);
    const updatedPhotos = photos.filter((p) => p._id !== photo._id);
    if (updatedPhotos.length === 0) {
      navigate("/");
    } else {
      const newIndex = Math.min(currentIndex, updatedPhotos.length - 1);
      const next = updatedPhotos[newIndex];
      navigate(`/photos/${next._id}`, { state: { allPhotos: updatedPhotos } });
      setPhotos(updatedPhotos);
      setCurrentIndex(newIndex);
    }
  };

  const toggleEditTag = (id) => {
    setEditTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;

  const photo = photos[currentIndex];
  if (!photo) return <p className={styles.loading}>Photo not found.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Gallery
        </button>
      </div>

      <div className={styles.viewer}>
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ❮
        </button>
        <div className={styles.photoWrapper}>
          <img
            src={`${API_BASE_URL}${photo.url}`}
            alt={photo.title}
            className={styles.image}
          />
        </div>
        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={goNext}
          disabled={currentIndex === photos.length - 1}
        >
          ❯
        </button>
      </div>

      {editMessage && <p className={styles.successMessage}>{editMessage}</p>}

      {editing ? (
        <div className={styles.editForm}>
          <h3 className={styles.editTitle}>✏️ Edit Photo</h3>
          <input
            className={styles.input}
            type="text"
            placeholder="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            className={styles.input}
            type="date"
            value={editDateTaken}
            onChange={(e) => setEditDateTaken(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Resolution"
            value={editResolution}
            onChange={(e) => setEditResolution(e.target.value)}
          />
          <select
            className={styles.input}
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
          >
            <option value="">No location</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>
                {l.city}, {l.country}
              </option>
            ))}
          </select>
          <div className={styles.tagList}>
            {tags.map((t) => (
              <span
                key={t._id}
                className={`${styles.tag} ${
                  editTags.includes(t._id) ? styles.tagSelected : ""
                }`}
                onClick={() => toggleEditTag(t._id)}
              >
                {t.name}
              </span>
            ))}
          </div>
          <div className={styles.editActions}>
            <button className={styles.saveButton} onClick={handleEditSave}>
              Save Changes
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              🗑️ Delete
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.meta}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{photo.title}</h2>
            {user && (
              <button className={styles.editButton} onClick={handleEditClick}>
                ✏️ Edit
              </button>
            )}
          </div>
          <div className={styles.metaGrid}>
            {photo.location && (
              <p>
                📍 {photo.location.city}, {photo.location.country}
              </p>
            )}
            {photo.dateTaken && (
              <p>📅 {new Date(photo.dateTaken).toLocaleDateString()}</p>
            )}
            {photo.resolution && <p>🖥️ {photo.resolution}</p>}
            {photo.tags && photo.tags.length > 0 && (
              <div className={styles.tags}>
                {photo.tags.map((tag) => (
                  <span key={tag._id} className={styles.tag}>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {exif && (
            <div className={styles.exifSection}>
              <h3 className={styles.exifTitle}>📷 Camera Info</h3>
              <div className={styles.exifGrid}>
                {exif.Make && (
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Make</span>
                    <span>{exif.Make}</span>
                  </div>
                )}
                {exif.Model && (
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Model</span>
                    <span>{exif.Model}</span>
                  </div>
                )}
                {exif.ISO && (
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>ISO</span>
                    <span>{exif.ISO}</span>
                  </div>
                )}
                {exif.ExposureTime && (
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Shutter</span>
                    <span>1/{Math.round(1 / exif.ExposureTime)}s</span>
                  </div>
                )}
                {exif.FNumber && (
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Aperture</span>
                    <span>f/{exif.FNumber}</span>
                  </div>
                )}
                {exif.FocalLength && (
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Focal Length</span>
                    <span>{exif.FocalLength}mm</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className={styles.counter}>
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  );
}

export default PhotoDetail;
