import { API_URL as API } from "../config";

export const getTags = async () => {
  const res = await fetch(`${API}/tags`);
  return res.json();
};

export const createTag = async (name, token) => {
  const res = await fetch(`${API}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const deleteTag = async (id, token) => {
  const res = await fetch(`${API}/tags/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
