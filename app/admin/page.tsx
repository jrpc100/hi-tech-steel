
"use client";

import { useEffect, useState } from "react";

import {
  Upload,
  Trash2,
  LogOut,
  Image as ImageIcon,
  ExternalLink,
  LockKeyhole,
  RefreshCw,
  Plus,
  Pencil,
  X,
  Save,
  FileText
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: "Door" | "Window";
  size: string;
  option: string;
  description: string;
  imageUrl: string | null;
};

type ProductForm = {
  name: string;
  category: "Door" | "Window";
  size: string;
  option: string;
  description: string;
};

const emptyForm: ProductForm = {
  name: "",
  category: "Door",
  size: "Custom Size",
  option: "Standard",
  description: ""
};

export default function AdminPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

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

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowEditor(true);
    setMessage("");
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      size: product.size,
      option: product.option,
      description: product.description || ""
    });

    setShowEditor(true);
    setMessage("");
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.size.trim() ||
      !form.option.trim()
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setMessage("Saving product...");

    try {
      const isEditing = editingId !== null;

      const response = await fetch("/api/admin/products", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...(isEditing ? { id: editingId } : {}),
          ...form
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to save product.");
        return;
      }

      await loadProducts();

      setShowEditor(false);
      setEditingId(null);
      setForm(emptyForm);

      setMessage(
        isEditing
          ? "Product updated successfully!"
          : "New product added successfully!"
      );

    } catch {
      setMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Delete this product and its photo permanently?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("Deleting product...");

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Delete failed.");
        return;
      }

      await loadProducts();
      setMessage("Product deleted successfully!");

    } catch {
      setMessage("Unable to delete product.");
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

    if (file.size > 4 * 1024 * 1024) {
      setMessage("Photo must be smaller than 4 MB.");
      return;
    }

    setLoading(true);
    setMessage("Uploading photo...");

    try {
      const formData = new FormData();

      formData.append("productId", String(id));
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Upload failed.");
        return;
      }

      await loadProducts();
      setMessage("Photo uploaded successfully!");

    } catch {
      setMessage("Upload failed. Check your internet connection.");
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
        setMessage(data.error || "Delete failed.");
        return;
      }

      await loadProducts();
      setMessage("Photo deleted successfully!");

    } catch {
      setMessage("Unable to delete photo.");
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
          <p>Manage products, details and photos</p>
        </div>

        <div className="admin-actions">
          <a href="/" className="admin-link">
            <ExternalLink size={16} />
            Website
          </a>

          <a href="/admin/estimate" className="admin-link">
            <FileText size={16} />
            Create Estimate
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

        <div className="admin-toolbar-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Products</option>
            <option value="Door">Doors</option>
            <option value="Window">Windows</option>
          </select>

          <button
            className="add-product-btn"
            onClick={openAddForm}
            disabled={loading}
          >
            <Plus size={17} />
            Add Product
          </button>
        </div>
      </div>

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {loading && (
        <p className="loading-text">Please wait...</p>
      )}

      {showEditor && (
        <div className="product-editor">
          <div className="editor-heading">
            <h2>
              {editingId === null ? "Add New Product" : "Edit Product"}
            </h2>

            <button
              type="button"
              onClick={() => setShowEditor(false)}
              disabled={loading}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={saveProduct}>
            <label>
              Product Name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Example: Premium Steel Door"
                required
                maxLength={100}
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as "Door" | "Window"
                  })
                }
              >
                <option value="Door">Door</option>
                <option value="Window">Window</option>
              </select>
            </label>

            <label>
              Size
              <input
                value={form.size}
                onChange={(e) =>
                  setForm({ ...form, size: e.target.value })
                }
                placeholder="Example: 90 x 210 cm"
                required
                maxLength={100}
              />
            </label>

            <label>
              Option / Type
              <input
                value={form.option}
                onChange={(e) =>
                  setForm({ ...form, option: e.target.value })
                }
                placeholder="Example: Standard"
                required
                maxLength={100}
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Enter product description"
                maxLength={1000}
                rows={4}
              />
            </label>

            <div className="editor-buttons">
              <button
                type="submit"
                disabled={loading}
                className="save-product-btn"
              >
                <Save size={17} />
                {loading ? "Saving..." : "Save Product"}
              </button>

              <button
                type="button"
                className="cancel-product-btn"
                onClick={() => setShowEditor(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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

              <div className="product-admin-buttons">
                <button
                  className="edit-product-btn"
                  onClick={() => openEditForm(product)}
                  disabled={loading}
                >
                  <Pencil size={16} />
                  Edit Details
                </button>

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

                <button
                  className="delete-product-btn"
                  disabled={loading}
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 size={16} />
                  Delete Product
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-message">
          No products found.
        </p>
      )}

      <style jsx>{`
        .admin-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }

        .add-product-btn,
        .edit-product-btn,
        .save-product-btn,
        .cancel-product-btn,
        .delete-product-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 15px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .add-product-btn,
        .save-product-btn {
          background: #1769e0;
          color: white;
        }

        .edit-product-btn {
          background: #e8efff;
          color: #174ea6;
        }

        .cancel-product-btn {
          background: #e5e7eb;
          color: #222;
        }

        .delete-product-btn {
          background: #fee2e2;
          color: #b91c1c;
        }

        .product-admin-buttons {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 15px;
        }

        .product-admin-buttons button,
        .product-admin-buttons label {
          width: 100%;
          box-sizing: border-box;
        }

        .product-editor {
          background: white;
          color: #111827;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
          margin: 20px 0;
          max-width: 650px;
          box-shadow: 0 8px 30px rgba(0,0,0,.08);
        }

        .editor-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .editor-heading h2 {
          margin: 0;
          font-size: 21px;
        }

        .editor-heading button {
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 6px;
        }

        .product-editor form {
          display: grid;
          gap: 14px;
        }

        .product-editor label {
          display: grid;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
        }

        .product-editor input,
        .product-editor select,
        .product-editor textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font: inherit;
          background: white;
          color: #111827;
        }

        .editor-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 600px) {
          .admin-toolbar-actions {
            width: 100%;
          }

          .admin-toolbar-actions select,
          .admin-toolbar-actions button {
            flex: 1;
          }

          .product-editor {
            padding: 14px;
          }

          .admin-actions {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
