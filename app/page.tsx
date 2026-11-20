
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const products = [
  {
    id: "door",
    name: "Steel Door Frame",
    category: "DOOR FRAMES",
    description: "Strong and durable steel door frames for modern buildings.",
    material: "Iron / Tata Steel",
    gsm: "Available in 120 GSM galvanized steel",
    dimensions: "Custom dimensions available",
  },
  {
    id: "window",
    name: "Steel Window Frame",
    category: "WINDOW FRAMES",
    description: "Precision-built steel window frames for residential and commercial spaces.",
    material: "Iron / Tata Steel",
    gsm: "Available in 120 GSM galvanized steel",
    dimensions: "Custom dimensions available",
  },
];

function ModelViewer({ type }: { type: string }) {
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
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(4, 6, 5);
    scene.add(light);

    const group = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({
      color: "#aeb7c0",
      metalness: 0.85,
      roughness: 0.25,
    });

    const darkMetal = new THREE.MeshStandardMaterial({
      color: "#505b66",
      metalness: 0.8,
      roughness: 0.35,
    });

    function bar(x: number, y: number, z: number, w: number, h: number, d: number) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), metal);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    // Main rectangular steel frame
    const width = type === "door" ? 2.2 : 2.8;
    const height = type === "door" ? 4 : 2.5;
    const thickness = 0.16;

    bar(-width / 2, 0, 0, thickness, height, thickness);
    bar(width / 2, 0, 0, thickness, height, thickness);
    bar(0, height / 2, 0, width + thickness, thickness, thickness);

    if (type === "window") {
      bar(0, -height / 2, 0, width + thickness, thickness, thickness);
      bar(0, 0, 0, 0.12, height, thickness);
      bar(0, 0, 0, width, 0.12, thickness);
    }

    // Frame depth and folded steel profile
    const depthBar = new THREE.Mesh(
      new THREE.BoxGeometry(width + thickness, 0.08, 0.55),
      darkMetal
    );
    depthBar.position.set(0, height / 2 - 0.1, -0.2);
    group.add(depthBar);

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
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", resize);

    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [type]);

  return (
    <div className="viewer">
      <div className="viewer-label">INTERACTIVE 3D MODEL</div>
      <div ref={mountRef} className="model-canvas" />
      <div className="viewer-hint">Drag to rotate · Pinch to zoom</div>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState("door");
  const product = products.find((p) => p.id === selected)!;

  const whatsapp = `https://wa.me/919745046924?text=${encodeURIComponent(
    `Hello HI-TECH, I am interested in ${product.name}. Please share details and quotation.`
  )}`;

  return (
    <main>
      <nav className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">H</span>
          <span>HI-TECH <small>STEEL SOLUTIONS</small></span>
        </a>
        <a className="nav-contact" href={whatsapp}>GET QUOTE ↗</a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">PRECISION · STRENGTH · QUALITY</p>
          <h1>BUILT STRONG.<br /><span>BUILT TO LAST.</span></h1>
          <p className="hero-text">
            Premium steel door and window frames.
            Made for strength, designed for durability.
          </p>
          <a href="#products" className="primary-btn">EXPLORE PRODUCTS ↘</a>
        </div>
        <div className="hero-mark">HT<span>.</span></div>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading">
          <p className="eyebrow">OUR COLLECTION</p>
          <h2>STEEL FRAME <span>CATALOGUE</span></h2>
          <p>Select a product and explore its interactive 3D model.</p>
        </div>

        <div className="product-tabs">
          {products.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={selected === item.id ? "tab active" : "tab"}
            >
              {item.category}
            </button>
          ))}
        </div>

        <div className="product-layout">
          <ModelViewer type={selected} />

          <div className="product-info">
            <p className="eyebrow">HI-TECH / {product.category}</p>
            <h2>{product.name}</h2>
            <p className="description">{product.description}</p>

            <div className="specs">
              <div><span>MATERIAL</span><strong>{product.material}</strong></div>
              <div><span>GALVANIZATION</span><strong>{product.gsm}</strong></div>
              <div><span>DIMENSIONS</span><strong>{product.dimensions}</strong></div>
            </div>

            <a href={whatsapp} className="primary-btn quote-btn">
              ENQUIRE ON WHATSAPP ↗
            </a>
            <p className="small-note">Contact us for custom sizes and pricing.</p>
          </div>
        </div>
      </section>

      <section className="about">
        <p className="eyebrow">WHY HI-TECH?</p>
        <h2>STRENGTH IN EVERY FRAME.</h2>
        <p>
          Quality steel frame solutions for homes and commercial projects.
          Built with attention to detail and a commitment to durability.
        </p>
      </section>

      <footer>
        <div className="footer-brand">HI-TECH <span>STEEL SOLUTIONS</span></div>
        <p>Koppam, Palakkad, Kerala</p>
        <a href="tel:+919745046924">+91 97450 46924</a>
        <p className="copyright">© 2026 HI-TECH. All rights reserved.</p>
      </footer>

      <a className="floating-whatsapp" href={whatsapp} aria-label="WhatsApp">✆</a>
    </main>
  );
}
