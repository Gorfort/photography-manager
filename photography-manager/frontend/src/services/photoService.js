const API = "http://localhost:5001/api";

export const getPhotos = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API}/photos?${params}`);
  return res.json();
};

export const createPhoto = async (formData, token) => {
  const res = await fetch(`${API}/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const updatePhoto = async (id, data, token) => {
  const res = await fetch(`${API}/photos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deletePhoto = async (id, token) => {
  const res = await fetch(`${API}/photos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
