
"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Trash2,
  LogOut,
  Image as ImageIcon,
  ExternalLink,
  LockKeyhole,
  RefreshCw
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  size: string;
  option: string;
  description?: string;
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
        setMessage("Unable to connect. Please refresh.");
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
      setMessage("");
    } catch {
      setMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(id: number, file?: File) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Only JPG, PNG and WEBP photos are allowed.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Photo must be smaller than 8 MB.");
      return;
    }

    setLoading(true);
    setMessage("Uploading photo...");

    try {
      const form = new FormData();

      form.append("productId", String(id));
      form.append("file", file);

      // Correct API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || `Upload failed (${response.status})`);
        return;
      }

      await loadProducts();
      setMessage("Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Check your internet and Blob Storage settings.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePhoto(id: number) {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setLoading(true);
    setMessage("Deleting photo...");

    try {
      // Correct API route
      const response = await fetch("/api/upload", {
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
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Delete failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshProducts() {
    setLoading(true);
    setMessage("Refreshing products...");

    try {
      await loadProducts();
      setMessage("Products refreshed!");
    } catch {
      setMessage("Unable to refresh products.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST"
      });

      setLogged(false);
      setItems([]);
      setMessage("Logged out successfully.");
    } catch {
      setMessage("Logout failed.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter((product) =>
    filter === "All" || product.category === filter
  );

  if (!logged) {
    return (
      <main className="admin-page">
        <form className="login-card" onSubmit={login}>
          <div className="admin-icon">
            <LockKeyhole size={34} />
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
            <ExternalLink size={16} />
            Website
          </a>

          <button
            className="admin-link"
            onClick={refreshProducts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="logout-btn"
            onClick={logout}
            disabled={loading}
          >
            <LogOut size={16} />
            Logout
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
        <div className="admin-message">
          {message}
        </div>
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
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                  />
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

              {product.description && (
                <p>{product.description}</p>
              )}

              <label className="upload-btn">
                <Upload size={17} />
                {product.imageUrl ? "Replace Photo" : "Upload Photo"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={loading}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      uploadPhoto(product.id, file);
                    }

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

      {filtered.length === 0 && (
        <p className="empty-message">
          No products found.
        </p>
      )}
    </main>
  );
}
