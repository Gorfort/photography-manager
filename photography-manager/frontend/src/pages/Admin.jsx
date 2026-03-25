import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPhoto } from "../services/photoService";
import { getTags, createTag, deleteTag } from "../services/tagService";
import {
  getLocations,
  createLocation,
  deleteLocation,
} from "../services/locationService";
import exifr from "exifr";
import styles from "./Admin.module.css";

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);

  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [dateTaken, setDateTaken] = useState("");
  const [resolution, setResolution] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [newTag, setNewTag] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  useEffect(() => {
    getTags().then(setTags);
    getLocations().then(setLocations);
  }, []);

  const getExifDate = async (file) => {
    try {
      const exif = await exifr.parse(file, { pick: ["DateTimeOriginal"] });
      if (exif?.DateTimeOriginal) {
        return new Date(exif.DateTimeOriginal).toISOString().split("T")[0];
      }
    } catch {
      // no exif
    }
    return new Date(file.lastModified).toISOString().split("T")[0];
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);

    const first = selectedFiles[0];
    const nameWithoutExtension = first.name.replace(/\.[^/.]+$/, "");
    setTitle(nameWithoutExtension);

    const date = await getExifDate(first);
    setDateTaken(date);

    const img = new Image();
    const url = URL.createObjectURL(first);
    img.onload = () => setResolution(`${img.width}x${img.height}`);
    img.src = url;
  };

  const handleAddPhoto = async () => {
    if (files.length === 0)
      return setMessage("Please select at least one photo");

    let successCount = 0;

    for (const file of files) {
      const fileDateTaken = await getExifDate(file);

      const formData = new FormData();
      formData.append("photo", file);
      formData.append(
        "title",
        files.length === 1 ? title : file.name.replace(/\.[^/.]+$/, "")
      );
      formData.append("dateTaken", fileDateTaken);
      formData.append("resolution", resolution);
      formData.append("location", selectedLocation);
      selectedTags.forEach((t) => formData.append("tags[]", t));

      const data = await createPhoto(formData, user.token);
      if (data._id) successCount++;
    }

    setMessage(`${successCount} photo(s) added successfully!`);
    setTitle("");
    setFiles([]);
    setDateTaken("");
    setResolution("");
    setSelectedTags([]);
    setSelectedLocation("");
  };

  const handleAddTag = async () => {
    if (!newTag) return;
    await createTag(newTag, user.token);
    setNewTag("");
    getTags().then(setTags);
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    await deleteTag(id, user.token);
    getTags().then(setTags);
  };

  const handleAddLocation = async () => {
    if (!newCity || !newCountry) return;
    await createLocation({ city: newCity, country: newCountry }, user.token);
    setNewCity("");
    setNewCountry("");
    getLocations().then(setLocations);
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    await deleteLocation(id, user.token);
    getLocations().then(setLocations);
  };

  const toggleTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Panel</h1>

      {message && <p className={styles.message}>{message}</p>}

      {/* Add Photo */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Add Photo</h2>
        <input
          className={styles.input}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        {files.length > 1 && (
          <p className={styles.fileCount}>
            📸 {files.length} files selected — each will be uploaded with its
            own filename and EXIF date
          </p>
        )}
        {files.length === 1 && (
          <>
            <input
              className={styles.input}
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className={styles.input}
              type="date"
              value={dateTaken}
              onChange={(e) => setDateTaken(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Resolution (e.g. 1920x1080)"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </>
        )}
        <select
          className={styles.input}
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">Select location</option>
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
                selectedTags.includes(t._id) ? styles.tagSelected : ""
              }`}
              onClick={() => toggleTag(t._id)}
            >
              {t.name}
            </span>
          ))}
        </div>
        <button className={styles.buttonPrimary} onClick={handleAddPhoto}>
          {files.length > 1 ? `Upload ${files.length} Photos` : "Add Photo"}
        </button>
      </div>

      {/* Add Tag */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Add Tag</h2>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="Tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button className={styles.buttonPrimary} onClick={handleAddTag}>
            Add
          </button>
        </div>
        <div className={styles.tagList}>
          {tags.map((t) => (
            <span key={t._id} className={styles.tagRow}>
              <span className={styles.tag}>{t.name}</span>
              <button
                className={styles.buttonDeleteSmall}
                onClick={() => handleDeleteTag(t._id)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Add Location */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Add Location</h2>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            placeholder="City"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Country"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
          />
          <button className={styles.buttonPrimary} onClick={handleAddLocation}>
            Add
          </button>
        </div>
        <div className={styles.tagList}>
          {locations.map((l) => (
            <span key={l._id} className={styles.tagRow}>
              <span className={styles.tag}>
                📍 {l.city}, {l.country}
              </span>
              <button
                className={styles.buttonDeleteSmall}
                onClick={() => handleDeleteLocation(l._id)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
