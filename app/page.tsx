
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Product = {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  dimensions: string;
};

const products: Product[] = [
  ...[
    "4 × 3",
    "4 × 2.5",
    "9 × 4",
    "6 × 4",
    "5 × 3",
  ].flatMap((size, index) => [
    {
      id: `door-${index}-with`,
      name: `${size} Door Frame – With Bottom Step`,
      category: "DOOR FRAMES",
      type: `${size} · With Bottom Step`,
      description: "Steel door frame with bottom step (Kurumbadi).",
      dimensions: size,
    },
    {
      id: `door-${index}-without`,
      name: `${size} Door Frame – Without Bottom Step`,
      category: "DOOR FRAMES",
      type: `${size} · Without Bottom Step`,
      description: "Steel door frame without bottom step.",
      dimensions: size,
    },
  ]),
  ...[
    "4 × 3",
    "4 × 2.5",
  ].flatMap((size, index) => [
    {
      id: `window-${index}-with`,
      name: `${size} Window Frame – With Poli`,
      category: "WINDOW FRAMES",
      type: `${size} · With Poli`,
      description: "Window frame with openable and closable shutter arrangement.",
      dimensions: size,
    },
    {
      id: `window-${index}-without`,
      name: `${size} Window Frame – Without Poli`,
      category: "WINDOW FRAMES",
      type: `${size} · Hinges Only`,
      description: "Customer provides the poli. HI-TECH provides and fits steel hinges.",
      dimensions: size,
    },
  ]),
];

function ModelViewer({ product }: { product: Product }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#15191e");

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(4, 3, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(4, 6, 5);
    scene.add(light);

    const group = new THREE.Group();

    const isWindow = product.category === "WINDOW FRAMES";
    const hasBottom = product.id.endsWith("-with");
    const hasPoli = product.id.startsWith("window") && hasBottom;

    const metal = new THREE.MeshStandardMaterial({
      color: "#c5d0d8",
      metalness: 0.85,
      roughness: 0.25,
    });

    const darkMetal = new THREE.MeshStandardMaterial({
      color: "#505b66",
      metalness: 0.8,
      roughness: 0.35,
    });

    function bar(
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      material = metal
    ) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
      );
      mesh.position.set(x, y, z);
      group.add(mesh);
    }

    const width = isWindow ? 2.8 : 2.2;
    const height = 4;
    const thickness = 0.16;

    // Main frame
    bar(-width / 2, 0, 0, thickness, height, thickness);
    bar(width / 2, 0, 0, thickness, height, thickness);
    bar(0, height / 2, 0, width + thickness, thickness, thickness);

    // Bottom frame
    if (isWindow || hasBottom) {
      bar(0, -height / 2, 0, width + thickness, thickness, thickness);
    }

    if (isWindow) {
      // Window shutter / poli sample
      if (hasPoli) {
        bar(-width / 4, 0, 0.12, 0.06, height - 0.3, 0.08, darkMetal);
        bar(width / 4, 0, 0.12, 0.06, height - 0.3, 0.08, darkMetal);
        bar(0, 0, 0.12, width / 2, 0.06, 0.08, darkMetal);
      }

      // Window tracks
      for (let i = 0; i < 2; i++) {
        bar(
          0,
          -height / 2 + 0.15,
          -0.1 + i * 0.16,
          width - 0.12,
          0.07,
          0.07,
          darkMetal
        );
      }

      // Hinges
      for (let i = 0; i < 3; i++) {
        bar(
          -width / 2 - 0.04,
          -1 + i,
          0.08,
          0.12,
          0.22,
          0.12,
          darkMetal
        );
      }
    }

    // Frame depth
    bar(width / 2 - 0.04, 0, -0.22, 0.07, height, 0.48, darkMetal);
    bar(0, height / 2 - 0.04, -0.22, width, 0.07, 0.48, darkMetal);

    // Door locking sample
    if (!isWindow) {
      bar(width / 2 - 0.12, 0, 0.12, 0.08, 0.35, 0.08, darkMetal);
    }

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: "#252b32" })
    );
    floor.position.y = -height / 2 - 0.12;
    scene.add(floor);
    scene.add(group);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 12;

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", resize);

    let animationId = 0;

    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

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
  }, [product]);

  return (
    <div className="viewer">
      <div className="viewer-label">INTERACTIVE 3D MODEL · SAMPLE</div>
      <div ref={mountRef} className="model-canvas" />
      <div className="viewer-hint">Drag to rotate · Pinch to zoom</div>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState("door-0-with");
  const [category, setCategory] = useState("DOOR FRAMES");

  const product =
    products.find((p) => p.id === selected) ?? products[0];

  const visibleProducts = products.filter(
    (p) => p.category === category
  );

  const whatsapp = `https://wa.me/919745046924?text=${encodeURIComponent(
    `Hello HI-TECH, I am interested in ${product.name}. Please share details and quotation.`
  )}`;

  function changeCategory(next: string) {
    setCategory(next);
    const first = products.find((p) => p.category === next);
    if (first) setSelected(first.id);
  }

  return (
    <main>
      <nav className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">H</span>
          <span>
            HI-TECH
            <small>STEEL SOLUTIONS</small>
          </span>
        </a>
        <a className="nav-contact" href={whatsapp}>
          GET QUOTE ↗
        </a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">PRECISION · STRENGTH · QUALITY</p>
          <h1>
            BUILT STRONG.
            <br />
            <span>BUILT TO LAST.</span>
          </h1>
          <p className="hero-text">
            Premium steel door and window frames.
            Made for strength, designed for durability.
          </p>
          <a href="#products" className="primary-btn">
            EXPLORE PRODUCTS ↘
          </a>
        </div>
        <div className="hero-mark">
          HT<span>.</span>
        </div>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading">
          <p className="eyebrow">OUR COLLECTION</p>
          <h2>
            STEEL FRAME <span>CATALOGUE</span>
          </h2>
          <p>
            Select your frame size and variation to explore
            its sample 3D model.
          </p>
        </div>

        <div className="product-tabs">
          <button
            onClick={() => changeCategory("DOOR FRAMES")}
            className={category === "DOOR FRAMES" ? "tab active" : "tab"}
          >
            DOOR FRAMES
          </button>
          <button
            onClick={() => changeCategory("WINDOW FRAMES")}
            className={category === "WINDOW FRAMES" ? "tab active" : "tab"}
          >
            WINDOW FRAMES
          </button>
        </div>

        <div className="design-list">
          {visibleProducts.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={
                selected === item.id
                  ? "design-card selected"
                  : "design-card"
              }
            >
              <span>{item.category}</span>
              <strong>{item.name}</strong>
              <small>
                {selected === item.id ? "SELECTED ✓" : "VIEW MODEL"}
                <span className="card-arrow">→</span>
              </small>
            </button>
          ))}
        </div>

        <div className="product-layout">
          <ModelViewer product={product} />

          <div className="product-info">
            <p className="eyebrow">
              HI-TECH / {product.category} / {product.type.toUpperCase()}
            </p>
            <h2>{product.name}</h2>
            <p className="description">{product.description}</p>

            <div className="specs">
              <div>
                <span>FRAME MATERIAL</span>
                <strong>16 kg Tata Galvano · 120 GSM GI Sheet</strong>
              </div>
              <div>
                <span>GRILL</span>
                <strong>Customer's Choice</strong>
              </div>
              <div>
                <span>PRIMER</span>
                <strong>Epoxy Primer</strong>
              </div>
              <div>
                <span>CUTTING</span>
                <strong>Laser Cutting</strong>
              </div>
              <div>
                <span>LOCKING SYSTEM</span>
                <strong>Included</strong>
              </div>
              <div>
                <span>HINGES</span>
                <strong>Steel Hinges</strong>
              </div>
              <div>
                <span>SELECTED SIZE</span>
                <strong>{product.dimensions}</strong>
              </div>
              <div>
                <span>VARIATION</span>
                <strong>{product.type}</strong>
              </div>
            </div>

            <a href={whatsapp} className="primary-btn quote-btn">
              ENQUIRE ON WHATSAPP ↗
            </a>

            <p className="small-note">
              3D models are illustrative samples. Confirm exact
              section and dimensions with HI-TECH.
            </p>
          </div>
        </div>
      </section>

      <section className="about">
        <p className="eyebrow">WHY HI-TECH?</p>
        <h2>STRENGTH IN EVERY FRAME.</h2>
        <p>
          Quality steel frame solutions for homes and
          commercial projects. Built with attention to
          detail and a commitment to durability.
        </p>
      </section>

      <footer>
        <div className="footer-brand">
          HI-TECH <span>STEEL SOLUTIONS</span>
        </div>
        <p>Koppam, Palakkad, Kerala</p>
        <a href="tel:+919745046924">+91 97450 46924</a>
        <p className="copyright">
          © 2026 HI-TECH. All rights reserved.
        </p>
      </footer>

      <a
        className="floating-whatsapp"
        href={whatsapp}
        aria-label="WhatsApp"
      >
        ✆
      </a>
    </main>
  );
}
