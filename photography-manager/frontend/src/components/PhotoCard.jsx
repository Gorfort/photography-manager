import { useNavigate } from "react-router-dom";
import styles from "./PhotoCard.module.css";

function PhotoCard({ photo, allPhotos }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/photos/${photo._id}`, { state: { allPhotos } });
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <img
        src={`http://localhost:5001${photo.url}`}
        alt={photo.title}
        className={styles.image}
      />
      <div className={styles.info}>
        <h3 className={styles.title}>{photo.title}</h3>
        {photo.location && (
          <p className={styles.meta}>
            📍 {photo.location.city}, {photo.location.country}
          </p>
        )}
        {photo.dateTaken && (
          <p className={styles.meta}>
            📅 {new Date(photo.dateTaken).toLocaleDateString()}
          </p>
        )}
        {photo.resolution && (
          <p className={styles.meta}>🖥️ {photo.resolution}</p>
        )}
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
    </div>
  );
}

export default PhotoCard;
