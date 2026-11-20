
"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Trash2,
  LogOut,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  size: string;
  option: string;
  imageUrl: string | null;
};

export default function AdminPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  async function loadProducts() {
    const response = await fetch("/api/products", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Unable to load products");
    }

    const data = await response.json();
    setItems(data);
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store"
        });

        const data = await response.json();

        if (data.authenticated) {
          setLogged(true);
          await loadProducts();
        }
      } catch {
        setMessage("Unable to connect");
      }
    }

    checkSession();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Login failed");
        return;
      }

      setPassword("");
      await loadProducts();
      setLogged(true);
    } catch {
      setMessage("Connection error");
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(id: number, file?: File) {
    if (!file) return;

    setLoading(true);
    setMessage("Uploading photo...");

    try {
      const form = new FormData();

      form.append("productId", String(id));
      form.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }

      await loadProducts();
      setMessage("Photo uploaded successfully!");
    } catch {
      setMessage("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function deletePhoto(id: number) {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setLoading(true);
    setMessage("Deleting...");

    try {
      const response = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Delete failed");
        return;
      }

      await loadProducts();
      setMessage("Photo deleted successfully!");
    } catch {
      setMessage("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST"
    });

    setLogged(false);
    setItems([]);
    setMessage("Logged out");
  }

  const filtered = items.filter((product) =>
    filter === "All" || product.category === filter
  );

  if (!logged) {
    return (
      <main className="admin-page">
        <form className="login-card" onSubmit={login}>
          <div className="admin-icon">
            <ImageIcon size={34} />
          </div>

          <h1>HI-TECH</h1>
          <p>ADMIN CONTROL PANEL</p>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "PLEASE WAIT..." : "LOGIN"}
          </button>

          <div className="admin-message">{message}</div>

          <a href="/">Back to Website</a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-label">CONTROL PANEL</span>
          <h1>HI-TECH ADMIN</h1>
          <p>Manage original product photos</p>
        </div>

        <div className="admin-actions">
          <a href="/" className="admin-link">
            <ExternalLink size={16} /> Website
          </a>

          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-stats">
        <div>
          <strong>{items.length}</strong>
          <span>Total Products</span>
        </div>
        <div>
          <strong>{items.filter(p => p.imageUrl).length}</strong>
          <span>Photos Uploaded</span>
        </div>
        <div>
          <strong>{items.filter(p => !p.imageUrl).length}</strong>
          <span>Photos Pending</span>
        </div>
      </div>

      <div className="admin-toolbar">
        <h2>Products</h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Products</option>
          <option value="Door">Doors</option>
          <option value="Window">Windows</option>
        </select>
      </div>

      {message && (
        <div className="admin-message">{message}</div>
      )}

      {loading && (
        <p className="loading-text">Please wait...</p>
      )}

      <div className="admin-grid">
        {filtered.map((product) => (
          <article className="admin-product" key={product.id}>
            <div className="admin-photo">
              {product.imageUrl ? (
                <a
                  href={product.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={product.imageUrl} alt={product.name} />
                </a>
              ) : (
                <div className="no-photo">
                  <ImageIcon size={35} />
                  <span>No Original Photo</span>
                </div>
              )}
            </div>

            <div className="admin-product-info">
              <span className="admin-label">
                {product.category}
              </span>

              <h3>{product.name}</h3>
              <p>Size: {product.size}</p>
              <p>{product.option}</p>

              <label className="upload-btn">
                <Upload size={17} />
                {product.imageUrl ? "Replace Photo" : "Upload Photo"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={loading}
                  hidden
                  onChange={(e) => {
                    uploadPhoto(
                      product.id,
                      e.target.files?.[0]
                    );
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              {product.imageUrl && (
                <button
                  className="delete-btn"
                  disabled={loading}
                  onClick={() => deletePhoto(product.id)}
                >
                  <Trash2 size={16} />
                  Delete Photo
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
