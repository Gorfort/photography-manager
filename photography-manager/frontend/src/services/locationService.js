const API = "http://localhost:5001/api";

export const getLocations = async () => {
  const res = await fetch(`${API}/locations`);
  return res.json();
};

export const createLocation = async (data, token) => {
  const res = await fetch(`${API}/locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteLocation = async (id, token) => {
  const res = await fetch(`${API}/locations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
