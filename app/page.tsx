
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  Box,
  ShieldCheck,
  Settings,
  ChevronRight
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: "Door" | "Window";
  size: string;
  description: string;
  kurumbadi?: string;
  poli?: string;
};

const products: Product[] = [
  ...[
    ["4 × 3", "Without Kurumbadi"],
    ["4 × 3", "With Kurumbadi"],
    ["4 × 2.5", "Without Kurumbadi"],
    ["4 × 2.5", "With Kurumbadi"],
    ["9 × 4", "Without Kurumbadi"],
    ["9 × 4", "With Kurumbadi"],
    ["6 × 4", "Without Kurumbadi"],
    ["6 × 4", "With Kurumbadi"],
    ["5 × 3", "Without Kurumbadi"],
    ["5 × 3", "With Kurumbadi"]
  ].map((item, i) => ({
    id: i + 1,
    name: `Steel Door ${item[0]}`,
    category: "Door" as const,
    size: item[0],
    kurumbadi: item[1],
    description: "Premium GI steel door frame with durable finishing."
  })),

  ...[
    ["4 × 3", "With Poli"],
    ["4 × 3", "Without Poli"],
    ["4 × 2.5", "With Poli"],
    ["4 × 2.5", "Without Poli"]
  ].map((item, i) => ({
    id: i + 11,
    name: `Steel Window ${item[0]}`,
    category: "Window" as const,
    size: item[0],
    poli: item[1],
    description: "Strong and stylish steel window frame."
  }))
];

function ThreeViewer({
  category
}: {
  category: "Door" | "Window";
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#171b21");

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );

    camera.position.set(3, 3, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );

    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.DirectionalLight(
      0xffffff,
      2
    );

    light.position.set(4, 5, 6);
    scene.add(light);

    const metal = new THREE.MeshStandardMaterial({
      color: "#9299a2",
      metalness: 0.8,
      roughness: 0.3
    });

    const darkMetal = new THREE.MeshStandardMaterial({
      color: "#252b33",
      metalness: 0.7,
      roughness: 0.35
    });

    const group = new THREE.Group();

    const width = category === "Door" ? 2 : 2.5;
    const height = category === "Door" ? 4 : 2.5;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.15),
      metal
    );

    frame.position.y = height / 2;
    group.add(frame);

    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(
        width - 0.18,
        height - 0.18,
        0.12
      ),
      darkMetal
    );

    inner.position.y = height / 2;
    group.add(inner);

    if (category === "Door") {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(
          width - 0.35,
          height - 0.35,
          0.08
        ),
        metal
      );

      panel.position.set(0, height / 2, 0.12);
      group.add(panel);

      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.4, 0.1),
        new THREE.MeshStandardMaterial({
          color: "#d9a441",
          metalness: 0.9
        })
      );

      handle.position.set(width / 2 - 0.35, height / 2, 0.22);
      group.add(handle);
    } else {
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(
          width - 0.35,
          height - 0.35,
          0.04
        ),
        new THREE.MeshStandardMaterial({
          color: "#6b9caa",
          metalness: 0.3,
          roughness: 0.15,
          transparent: true,
          opacity: 0.8
        })
      );

      glass.position.set(0, height / 2, 0.12);
      group.add(glass);

      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, height - 0.35, 0.1),
        metal
      );

      bar.position.set(0, height / 2, 0.2);
      group.add(bar);
    }

    scene.add(group);

    const floor = new THREE.GridHelper(10, 10, 0x555555, 0x333333);
    floor.position.y = -0.05;
    scene.add(floor);

    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const resize = () => {
      if (!mount) return;

      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(
        mount.clientWidth,
        mount.clientHeight
      );
    };

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });
    };
  }, [category]);

  return <div ref={mountRef} className="model-view" />;
}

export default function Home() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      filter === "All" || product.category === filter;

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.size.includes(search);

    return matchesFilter && matchesSearch;
  });

  const whatsapp = (product: Product) => {
    const message = [
      "Hello HI-TECH!",
      "",
      "I am interested in:",
      product.name,
      `Size: ${product.size}`,
      product.kurumbadi || "",
      product.poli || "",
      "",
      "Please share the price and details."
    ].filter(Boolean).join("\n");

    window.open(
      `https://wa.me/919745046924?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <main>
      <nav className="navbar">
        <a href="#" className="logo">
          HI<span>-</span>TECH
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div className={`navlinks ${menuOpen ? "open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#products" onClick={() => setMenuOpen(false)}>Products</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="container hero-content">
          <span className="eyebrow">
            PREMIUM STEEL SOLUTIONS
          </span>

          <h1>
            STRONGER<br />
            <span>BY DESIGN.</span>
          </h1>

          <p>
            Discover premium quality steel doors and windows.
            Built for strength, durability and modern style.
            Quality steel solutions from HI-TECH, Koppam.
          </p>

          <a href="#products" className="btn">
            Explore Products <ChevronRight size={18} />
          </a>

          <a href="#contact" className="btn btn-outline">
            Contact Us
          </a>
        </div>
      </section>

      <section className="section" id="products">
        <div className="container">
          <span className="eyebrow">OUR COLLECTION</span>

          <h2 className="section-title">
            Doors & Windows
          </h2>

          <p className="section-subtitle">
            Explore our product collection. Select a product
            to request pricing through WhatsApp.
          </p>

          <div className="filters">
            {["All", "Door", "Window"].map((item) => (
              <button
                key={item}
                className={`filter-btn ${
                  filter === item ? "active" : ""
                }`}
                onClick={() => setFilter(item)}
              >
                {item === "All" ? "All Products" : item + "s"}
              </button>
            ))}
          </div>

          <input
            type="search"
            placeholder="Search by size or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <ThreeViewer category={product.category} />

                <div className="product-info">
                  <span className="eyebrow">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p>
                    Size: {product.size}
                    <br />
                    {product.kurumbadi || product.poli}
                    <br />
                    {product.description}
                  </p>

                  <button
                    className="btn"
                    onClick={() => setSelected(product)}
                  >
                    View Details
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => whatsapp(product)}
                  >
                    <MessageCircle size={16} />
                    Enquire
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p>No products found. Try another search.</p>
          )}
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <span className="eyebrow">WHY HI-TECH</span>

          <h2 className="section-title">
            Built With Quality
          </h2>

          <p className="section-subtitle">
            Quality materials and careful manufacturing
            for dependable steel products.
          </p>

          <div className="specs">
            <div className="spec-card">
              <ShieldCheck size={32} color="#d9a441" />
              <h3>GI Steel Sheet</h3>
              <p>
                16 kg Tata Galvano, 120 GSM galvanized
                iron sheet specification.
              </p>
            </div>

            <div className="spec-card">
              <Settings size={32} color="#d9a441" />
              <h3>Quality Finish</h3>
              <p>
                Epoxy primer, laser cutting and
                durable steel hinges.
              </p>
            </div>

            <div className="spec-card">
              <Box size={32} color="#d9a441" />
              <h3>Custom Options</h3>
              <p>
                Customer-choice grill designs and
                locking system options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>

            <span className="eyebrow">PRODUCT DETAILS</span>

            <h2>{selected.name}</h2>

            <ThreeViewer category={selected.category} />

            <p>Size: {selected.size}</p>
            <p>{selected.kurumbadi || selected.poli}</p>
            <p>{selected.description}</p>

            <button
              className="btn"
              onClick={() => whatsapp(selected)}
            >
              <MessageCircle size={17} />
              Enquire on WhatsApp
            </button>
          </div>
        </div>
      )}

      <section className="section contact" id="contact">
        <div className="container">
          <span className="eyebrow">GET IN TOUCH</span>

          <h2>Let's Build Something Strong.</h2>

          <p>
            HI-TECH Steel Doors & Windows
            <br />
            Koppam, Palakkad, Kerala
            <br />
            Phone: +91 9745046924
          </p>

          <a
            className="btn"
            href="https://wa.me/919745046924"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            WhatsApp Us
          </a>

          <a
            className="btn btn-outline"
            href="tel:+919745046924"
          >
            <Phone size={18} />
            Call Now
          </a>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} HI-TECH Steel Doors & Windows.
        All Rights Reserved.
      </footer>
    </main>
  );
}
