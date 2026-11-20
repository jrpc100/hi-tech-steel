
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
  LockKeyhole
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load products");
        return response.json();
      })
      .then(setProducts)
      .catch(() => setError("Products could not be loaded."));
  }, []);

  const filtered = products.filter((product) => {
    const matchCategory =
      filter === "All" || product.category === filter;

    const query = search.toLowerCase();

    const matchSearch =
      product.name.toLowerCase().includes(query) ||
      product.size.toLowerCase().includes(query) ||
      product.option.toLowerCase().includes(query);

    return matchCategory && matchSearch;
  });

  function whatsapp(product: Product) {
    const message = [
      "Hello HI-TECH!",
      "",
      "I am interested in:",
      product.name,
      `Size: ${product.size}`,
      product.option,
      "",
      "Please share price and details."
    ].join("\n");

    window.open(
      `https://wa.me/919745046924?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main>
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

      <section className="hero" id="home">
        <div className="container hero-content">
          <span className="eyebrow">
            PREMIUM STEEL DOORS & WINDOWS
          </span>

          <h1>
            STRENGTH<br />
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

      <section className="section" id="products">
        <div className="container">
          <span className="eyebrow">OUR COLLECTION</span>

          <h2 className="section-title">
            Our Products
          </h2>

          <p className="section-description">
            Browse our original steel door and window
            product photographs.
          </p>

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
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}

          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className="product-image"
                  onClick={() => setSelected(product)}
                  aria-label={`View original photo of ${product.name}`}
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
                    VIEW ORIGINAL PHOTO
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
                    View Original Photo
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

          {filtered.length === 0 && !error && (
            <p className="empty-message">
              No products found.
            </p>
          )}
        </div>
      </section>

      {selected && (
        <div
          className="photo-modal"
          onClick={() => setSelected(null)}
        >
          <div
            className="photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close photo"
            >
              <X />
            </button>

            <h2>{selected.name}</h2>
            <p>{selected.size} · {selected.option}</p>

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

            <button
              className="whatsapp-btn"
              onClick={() => whatsapp(selected)}
            >
              <MessageCircle size={18} />
              Enquire on WhatsApp
            </button>
          </div>
        </div>
      )}

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

      <footer className="footer">
        <a href="/" className="logo">
          HI<span>-</span>TECH
        </a>

        <p>
          © {new Date().getFullYear()} HI-TECH.
          All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
