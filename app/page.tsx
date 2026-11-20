
"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  Image as ImageIcon,
  LockKeyhole,
  ArrowLeft,
  Sun,
  Moon
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

type Theme = "light" | "dark";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("hi-tech-theme");
    const initialTheme: Theme =
      savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  // Change and save theme
  function toggleTheme() {
    const newTheme: Theme =
      theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem("hi-tech-theme", newTheme);
  }

  // Load products
  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load products");
        }
        return response.json();
      })
      .then(setProducts)
      .catch(() => setError("Products could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((product) => {
    const matchCategory =
      filter === "All" || product.category === filter;

    const query = search.trim().toLowerCase();

    const searchableText = [
      product.name,
      product.category,
      product.size,
      product.option,
      product.description
    ].join(" ").toLowerCase();

    const matchSearch = searchableText.includes(query);

    return matchCategory && matchSearch;
  });

  function whatsapp(product: Product) {
    const message = [
      "Hello HI-TECH!",
      "",
      "I am interested in this product:",
      product.name,
      `Category: ${product.category}`,
      `Size: ${product.size}`,
      `Type: ${product.option}`,
      `Description: ${product.description || "Not available"}`,
      "",
      "Please share price and more details."
    ].join("\n");

    window.open(
      `https://wa.me/919745046924?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main>
      {/* NAVIGATION */}

      <nav className="navbar">
        <a href="#home" className="logo">
          HI<span>-</span>TECH
          <small>STEEL SOLUTIONS</small>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div className={`navlinks ${menuOpen ? "open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="#products" onClick={() => setMenuOpen(false)}>
            Products
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>

          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>

          {/* THEME TOGGLE */}

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <>
                <Moon size={17} />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={17} />
                <span>Light Mode</span>
              </>
            )}
          </button>

          <a
            href="/admin"
            className="admin-nav-btn"
            onClick={() => setMenuOpen(false)}
          >
            <LockKeyhole size={16} />
            Admin
          </a>
        </div>
      </nav>

      {/* HERO */}

      <section className="hero" id="home">
        <div className="container hero-content">
          <span className="eyebrow">
            PREMIUM STEEL DOORS & WINDOWS
          </span>

          <h1>
            STRENGTH
            <br />
            MEETS <span>STYLE.</span>
          </h1>

          <p>
            Discover quality steel doors and windows
            designed for durability, strength and
            modern architecture.
          </p>

          <a href="#products" className="primary-btn">
            Explore Products →
          </a>

          <a href="#contact" className="secondary-btn">
            Contact Us
          </a>
        </div>

        <div className="hero-decoration">
          <ShieldCheck size={90} strokeWidth={0.8} />
          <span>QUALITY STEEL</span>
        </div>
      </section>

      {/* PRODUCTS */}

      <section className="section" id="products">
        <div className="container">
          <span className="eyebrow">OUR COLLECTION</span>

          <h2 className="section-title">
            Our Products
          </h2>

          <p className="section-description">
            Explore our original steel door and window collection.
            Find the right product for your project.
          </p>

          {/* SEARCH AND FILTER */}

          <div className="product-controls">
            <div className="filters">
              {["All", "Door", "Window"].map((item) => (
                <button
                  key={item}
                  className={filter === item ? "active" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item === "All" ? "All Products" : item + "s"}
                </button>
              ))}
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search name, size, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>

          <div className="results-count">
            Showing {filtered.length} of {products.length} products
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}

          {loading && (
            <p className="loading-text">Loading products...</p>
          )}

          {/* PRODUCT GRID */}

          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className="product-image"
                  onClick={() => setSelected(product)}
                  aria-label={`View ${product.name} details`}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  ) : (
                    <div className="placeholder">
                      <ImageIcon size={40} />
                      <span>Original Photo Coming Soon</span>
                    </div>
                  )}

                  <span className="photo-label">
                    VIEW PRODUCT DETAILS
                  </span>
                </button>

                <div className="product-info">
                  <span className="category-label">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p>Size: {product.size}</p>
                  <p>{product.option}</p>

                  <button
                    className="primary-btn full-btn"
                    onClick={() => setSelected(product)}
                  >
                    View Details
                  </button>

                  <button
                    className="whatsapp-btn"
                    onClick={() => whatsapp(product)}
                  >
                    <MessageCircle size={17} />
                    Enquire on WhatsApp
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && !error && !loading && (
            <p className="empty-message">
              No products found. Try another search.
            </p>
          )}
        </div>
      </section>

      {/* PRODUCT DETAILS */}

      {selected && (
        <div
          className="photo-modal"
          onClick={() => setSelected(null)}
        >
          <div
            className="photo-modal-content product-details-view"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              <X />
            </button>

            <span className="category-label">
              {selected.category}
            </span>

            <h2>{selected.name}</h2>

            {selected.imageUrl ? (
              <img
                className="large-product-photo"
                src={selected.imageUrl}
                alt={selected.name}
              />
            ) : (
              <div className="placeholder large-placeholder">
                <ImageIcon size={45} />
                <span>Original Photo Not Uploaded Yet</span>
              </div>
            )}

            <div className="details-information">
              <h3>Product Information</h3>

              <div className="detail-row">
                <span>Product Name</span>
                <strong>{selected.name}</strong>
              </div>

              <div className="detail-row">
                <span>Category</span>
                <strong>{selected.category}</strong>
              </div>

              <div className="detail-row">
                <span>Size</span>
                <strong>{selected.size}</strong>
              </div>

              <div className="detail-row">
                <span>Type / Option</span>
                <strong>{selected.option}</strong>
              </div>

              <div className="detail-description">
                <h3>Description</h3>
                <p>
                  {selected.description ||
                    "Product description is not available."}
                </p>
              </div>
            </div>

            <button
              className="whatsapp-btn"
              onClick={() => whatsapp(selected)}
            >
              <MessageCircle size={18} />
              Enquire About This Product
            </button>

            <button
              className="back-products-btn"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft size={17} />
              Back to Products
            </button>
          </div>
        </div>
      )}

      {/* ABOUT */}

      <section className="section about-section" id="about">
        <div className="container">
          <span className="eyebrow">ABOUT HI-TECH</span>

          <h2 className="section-title">
            Built With Quality.
            Designed For Strength.
          </h2>

          <p className="section-description">
            HI-TECH provides steel door and window
            solutions with a focus on quality,
            durability and customer satisfaction.
          </p>

          <div className="features-grid">
            <div className="feature">
              <ShieldCheck size={35} />
              <h3>Quality Materials</h3>
              <p>Quality-focused steel solutions.</p>
            </div>

            <div className="feature">
              <ImageIcon size={35} />
              <h3>Original Products</h3>
              <p>View our actual product photographs.</p>
            </div>

            <div className="feature">
              <MessageCircle size={35} />
              <h3>Direct Enquiry</h3>
              <p>Contact us directly through WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}

      <section className="section contact-section" id="contact">
        <div className="container">
          <span className="eyebrow">CONTACT US</span>

          <h2>Let's Talk About Your Project.</h2>

          <p>
            HI-TECH Steel Doors & Windows
            <br />
            Koppam, Palakkad, Kerala
            <br />
            India
          </p>

          <p className="phone-number">
            +91 9745046924
          </p>

          <a
            href="https://wa.me/919745046924"
            target="_blank"
            rel="noreferrer"
            className="whatsapp-btn contact-btn"
          >
            <MessageCircle size={18} />
            WhatsApp Us
          </a>

          <a
            href="tel:+919745046924"
            className="primary-btn contact-btn"
          >
            <Phone size={18} />
            Call Now
          </a>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <a href="/" className="logo">
          HI<span>-</span>TECH
        </a>

        <p>
          © {new Date().getFullYear()} HI-TECH.
          All Rights Reserved.
        </p>
      </footer>

      {/* EXTRA STYLES */}

      <style jsx>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          color: var(--text);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: .2s;
        }

        .theme-toggle:hover {
          border-color: var(--gold);
          color: var(--gold);
        }

        .results-count {
          margin: 14px 0;
          font-size: 13px;
          opacity: 0.7;
        }

        .search-box button {
          border: 0;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .product-details-view {
          max-height: 90vh;
          overflow-y: auto;
          width: 100%;
          max-width: 650px;
          box-sizing: border-box;
        }

        .details-information {
          margin: 20px 0;
          text-align: left;
        }

        .details-information h3 {
          margin-bottom: 14px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .detail-row span {
          opacity: 0.7;
        }

        .detail-row strong {
          text-align: right;
        }

        .detail-description {
          padding: 15px 0;
        }

        .detail-description p {
          line-height: 1.7;
        }

        .back-products-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
        }

        @media (max-width: 800px) {
          .theme-toggle {
            width: fit-content;
          }
        }

        @media (max-width: 500px) {
          .product-details-view {
            padding: 15px;
          }

          .detail-row {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
