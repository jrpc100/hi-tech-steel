
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const products = [
  {
    id: "door-standard",
    name: "Standard Steel Door Frame",
    category: "DOOR FRAMES",
    type: "Standard",
    description: "A simple rectangular steel door-frame concept for everyday building projects.",
    material: "Iron / Tata Steel",
    gsm: "Galvanized option: 120 GSM",
    dimensions: "Custom dimensions on enquiry",
  },
  {
    id: "door-heavy",
    name: "Heavy Duty Door Frame",
    category: "DOOR FRAMES",
    type: "Heavy Duty",
    description: "A sample heavier-profile door-frame concept with a wider steel section.",
    material: "Iron / Tata Steel",
    gsm: "Confirm finish and GSM with HI-TECH",
    dimensions: "Custom dimensions on enquiry",
  },
  {
    id: "door-galvanized",
    name: "Galvanized Steel Door Frame",
    category: "DOOR FRAMES",
    type: "Galvanized",
    description: "A door-frame concept representing a galvanized steel finish.",
    material: "Tata Galvanized Steel",
    gsm: "120 GSM option",
    dimensions: "Custom dimensions on enquiry",
  },
  {
    id: "window-2track",
    name: "2-Track Window Frame",
    category: "WINDOW FRAMES",
    type: "2-Track",
    description: "A sample two-track window-frame layout.",
    material: "Iron / Tata Steel",
    gsm: "Galvanized option: 120 GSM",
    dimensions: "Custom dimensions on enquiry",
  },
  {
    id: "window-3track",
    name: "3-Track Window Frame",
    category: "WINDOW FRAMES",
    type: "3-Track",
    description: "A sample three-track window-frame layout.",
    material: "Iron / Tata Steel",
    gsm: "Galvanized option: 120 GSM",
    dimensions: "Custom dimensions on enquiry",
  },
  {
    id: "window-grill",
    name: "Window Frame with Grill",
    category: "WINDOW FRAMES",
    type: "Grill Type",
    description: "A sample window-frame concept with simple internal grill bars.",
    material: "Iron / Tata Steel",
    gsm: "Galvanized option: 120 GSM",
    dimensions: "Custom dimensions on enquiry",
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

    const isWindow = type.startsWith("window");
    const isHeavy = type === "door-heavy";
    const isGalvanized = type === "door-galvanized";
    const isGrill = type === "window-grill";

    const metal = new THREE.MeshStandardMaterial({
      color: isGalvanized ? "#c5d0d8" : "#aeb7c0",
      metalness: 0.85,
      roughness: isGalvanized ? 0.32 : 0.25,
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
      d: number
    ) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        metal
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    const width = isWindow ? 2.8 : 2.2;
    const height = isWindow ? 2.5 : 4;
    const thickness = isHeavy ? 0.23 : 0.16;

    // Outer steel frame
    bar(-width / 2, 0, 0, thickness, height, thickness);
    bar(width / 2, 0, 0, thickness, height, thickness);
    bar(0, height / 2, 0, width + thickness, thickness, thickness);

    if (isWindow) {
      bar(0, -height / 2, 0, width + thickness, thickness, thickness);

      // Window track channels
      const trackCount = type === "window-3track" ? 3 : 2;

      for (let i = 0; i < trackCount; i++) {
        const z = -0.12 + i * 0.16;

        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(width - 0.12, 0.07, 0.07),
          darkMetal
        );

        rail.position.set(
          0,
          -height / 2 + 0.16 + i * 0.12,
          z
        );

        group.add(rail);
      }

      // Window grill
      if (isGrill) {
        for (let i = 1; i <= 4; i++) {
          bar(
            -width / 2 + (width / 5) * i,
            0,
            0.08,
            0.055,
            height - 0.2,
            0.08
          );
        }

        for (let i = 1; i <= 2; i++) {
          bar(
            0,
            -height / 2 + (height / 3) * i,
            0.08,
            width - 0.2,
            0.055,
            0.08
          );
        }
      }
    }

    // Folded steel profile
    const sideDepth = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, height, 0.48),
      darkMetal
    );

    sideDepth.position.set(width / 2 - 0.04, 0, -0.22);
    group.add(sideDepth);

    const topDepth = new THREE.Mesh(
      new THREE.BoxGeometry(width + thickness, 0.07, 0.48),
      darkMetal
    );

    topDepth.position.set(0, height / 2 - 0.04, -0.22);
    group.add(topDepth);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: "#252b32" })
    );

    floor.position.y = -height / 2 - 0.12;
    scene.add(floor);
    scene.add(group);

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 12;

    const resize = () => {
      if (!container) return;

      camera.aspect =
        container.clientWidth / container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
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

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

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
      <div className="viewer-label">
        INTERACTIVE 3D MODEL · SAMPLE
      </div>

      <div ref={mountRef} className="model-canvas" />

      <div className="viewer-hint">
        Drag to rotate · Pinch to zoom
      </div>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState("door-standard");
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

    const first = products.find(
      (p) => p.category === next
    );

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
          <p className="eyebrow">
            PRECISION · STRENGTH · QUALITY
          </p>

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
            Select a category, choose a design and explore
            its interactive 3D model.
          </p>
        </div>

        <div className="product-tabs">
          <button
            onClick={() => changeCategory("DOOR FRAMES")}
            className={
              category === "DOOR FRAMES"
                ? "tab active"
                : "tab"
            }
          >
            DOOR FRAMES
          </button>

          <button
            onClick={() => changeCategory("WINDOW FRAMES")}
            className={
              category === "WINDOW FRAMES"
                ? "tab active"
                : "tab"
            }
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
              <span>{item.type}</span>
              <strong>{item.name}</strong>

              <small>
                {selected === item.id
                  ? "SELECTED ✓"
                  : "VIEW MODEL ↗"}
              </small>
            </button>
          ))}
        </div>

        <div className="product-layout">
          <ModelViewer type={selected} />

          <div className="product-info">
            <p className="eyebrow">
              HI-TECH / {product.category} /{" "}
              {product.type.toUpperCase()}
            </p>

            <h2>{product.name}</h2>

            <p className="description">
              {product.description}
            </p>

            <div className="specs">
              <div>
                <span>MATERIAL</span>
                <strong>{product.material}</strong>
              </div>

              <div>
                <span>GALVANIZATION</span>
                <strong>{product.gsm}</strong>
              </div>

              <div>
                <span>DIMENSIONS</span>
                <strong>{product.dimensions}</strong>
              </div>
            </div>

            <a
              href={whatsapp}
              className="primary-btn quote-btn"
            >
              ENQUIRE ON WHATSAPP ↗
            </a>

            <p className="small-note">
              Illustrative sample model only. Confirm exact
              section, dimensions and finish with HI-TECH.
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

        <a href="tel:+919745046924">
          +91 97450 46924
        </a>

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
