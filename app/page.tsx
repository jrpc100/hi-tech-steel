"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Product = {
  id: string;
  name: string;
  category: "Door Frames" | "Window Frames";
  size: string;
  variant: string;
  description: string;
};

const products: Product[] = [
  ...["4 × 3", "4 × 2.5", "9 × 4", "6 × 4", "5 × 3"].flatMap(
    (size, index) => [
      {
        id: `door-${index}-step`,
        name: `Door Frame ${size} With Kurumbadi`,
        category: "Door Frames" as const,
        size,
        variant: "With Bottom Step",
        description: "Steel door frame with bottom step",
      },
      {
        id: `door-${index}-plain`,
        name: `Door Frame ${size} Without Kurumbadi`,
        category: "Door Frames" as const,
        size,
        variant: "Without Bottom Step",
        description: "Steel door frame without bottom step",
      },
    ]
  ),

  ...["4 × 3", "4 × 2.5"].flatMap((size, index) => [
    {
      id: `window-${index}-plain`,
      name: `Window Frame ${size} Plain`,
      category: "Window Frames" as const,
      size,
      variant: "Plain Frame",
      description: "Three-section window frame without shutters",
    },
    {
      id: `window-${index}-diamond`,
      name: `Window Frame ${size} Diamond`,
      category: "Window Frames" as const,
      size,
      variant: "12 Pipe Diamond Grill",
      description: "Three-section frame with diamond grill",
    },
    {
      id: `window-${index}-poli`,
      name: `Window Frame ${size} With Poli`,
      category: "Window Frames" as const,
      size,
      variant: "Three Poli Shutters",
      description: "Three outward-opening sample shutters",
    },
  ]),
];
function ModelViewer({ product }: { product: Product }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#17191d");

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(4, 3, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(5, 8, 6);
    scene.add(light);

    const steel = new THREE.MeshStandardMaterial({
      color: "#aeb7c2",
      metalness: 0.85,
      roughness: 0.28,
    });

    const darkSteel = new THREE.MeshStandardMaterial({
      color: "#555e68",
      metalness: 0.8,
      roughness: 0.35,
    });

    const black = new THREE.MeshStandardMaterial({
      color: "#252a31",
      metalness: 0.65,
      roughness: 0.4,
    });

    const root = new THREE.Group();
    scene.add(root);

    function box(
      x: number,
      y: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      material = steel
    ) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
      );
      mesh.position.set(x, y, z);
      root.add(mesh);
      return mesh;
    }

    function pipe(
      start: THREE.Vector3,
      end: THREE.Vector3,
      radius = 0.025
    ) {
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, length, 12),
        darkSteel
      );

      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
      );
      root.add(mesh);
    }

    const isDoor = product.category === "Door Frames";
    const width = isDoor ? 3.6 : 4.2;
    const height = isDoor ? 5.5 : 4.2;
    const depth = 0.32;

    // Outer frame
    box(-width / 2, 0, 0, 0.22, height, depth);
    box(width / 2, 0, 0, 0.22, height, depth);
    box(0, height / 2, 0, width + 0.22, 0.22, depth);

    if (isDoor) {
      if (product.id.endsWith("step")) {
        box(0, -height / 2 + 0.18, 0, width - 0.22, 0.22, depth);
      }

      box(-width / 2 - 0.11, 0, -0.22, 0.06, height, 0.12, darkSteel);
      box(width / 2 + 0.11, 0, -0.22, 0.06, height, 0.12, darkSteel);
    } else {
      // Two dividers create three sections
      box(-width / 6, 0, 0, 0.12, height, depth);
      box(width / 6, 0, 0, 0.12, height, depth);

      if (product.id.includes("diamond")) {
        const bayWidth = width / 3;

        for (let bay = 0; bay < 3; bay++) {
          const left = -width / 2 + bay * bayWidth + 0.12;
          const right = left + bayWidth - 0.24;
          const top = height / 2 - 0.2;
          const bottom = -height / 2 + 0.2;

          for (let i = 0; i < 4; i++) {
            const x = left + ((right - left) * i) / 3;

            pipe(
              new THREE.Vector3(x, bottom, 0.1),
              new THREE.Vector3(
                Math.min(x + 0.55, right),
                Math.min(bottom + 0.75, top),
                0.1
              )
            );

            pipe(
              new THREE.Vector3(x, top, 0.1),
              new THREE.Vector3(
                Math.min(x + 0.55, right),
                Math.max(top - 0.75, bottom),
                0.1
              )
            );
          }
        }
      }

      if (product.id.includes("poli")) {
        const bayWidth = width / 3;

        for (let i = 0; i < 3; i++) {
          const x = -width / 2 + bayWidth * i + bayWidth / 2;

          box(
            x,
            0,
            0.12,
            bayWidth - 0.16,
            height - 0.35,
            0.08,
            black
          );
        }
      }
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15),
      new THREE.MeshStandardMaterial({ color: "#24282e" })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -height / 2 - 0.2;
    scene.add(floor);

    let frameId = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function resize() {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }
      });

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [product]);

  return <div ref={mountRef} className="model-viewer" />;
}
export default function Home() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(products[0]);

  const filtered = products.filter(
    (product) =>
      category === "All" || product.category === category
  );

  function whatsapp(product: Product) {
    const message = `Hello HI-TECH, I am interested in ${product.name}. Please share details and quotation.`;

    window.open(
      `https://wa.me/919745046924?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <main>
      <header className="header">
        <div>
          <div className="brand">HI-TECH</div>
          <div className="brand-sub">
            STEEL DOOR & WINDOW FRAMES
          </div>
        </div>

        <a href="#contact" className="header-button">
          Contact
        </a>
      </header>

      <section className="hero">
        <p className="eyebrow">
          QUALITY • STRENGTH • PRECISION
        </p>

        <h1>
          Premium Steel
          <br />
          <span>Door & Window Frames</span>
        </h1>

        <p className="hero-text">
          Strong, stylish and carefully crafted steel frames for your home.
        </p>

        <a href="#catalogue" className="primary-button">
          Explore Catalogue
        </a>
      </section>

      <section className="features">
        <div>
          <strong>16 kg</strong>
          <span>Tata Galvano GI Sheet</span>
        </div>

        <div>
          <strong>120 GSM</strong>
          <span>GI Coating</span>
        </div>

        <div>
          <strong>Custom</strong>
          <span>Size & Enquiry</span>
        </div>
      </section>

      <section className="catalogue" id="catalogue">
        <p className="eyebrow">OUR PRODUCTS</p>
        <h2>Product Catalogue</h2>

        <p className="section-text">
          Select a model to view its sample 3D design.
        </p>

        <div className="filters">
          {["All", "Door Frames", "Window Frames"].map((item) => (
            <button
              key={item}
              className={
                category === item ? "filter active" : "filter"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="catalogue-layout">
          <div className="product-list">
            {filtered.map((product) => (
              <button
                key={product.id}
                className={
                  selected.id === product.id
                    ? "product-card selected"
                    : "product-card"
                }
                onClick={() => setSelected(product)}
              >
                <span>{product.category}</span>
                <strong>{product.name}</strong>
                <small>{product.variant}</small>
              </button>
            ))}
          </div>

          <div className="viewer-panel">
            <div className="viewer-heading">
              <div>
                <span className="viewer-label">
                  3D MODEL PREVIEW
                </span>
                <h3>{selected.name}</h3>
              </div>

              <span className="live-dot">● 3D</span>
            </div>

            <ModelViewer product={selected} />

            <p className="viewer-hint">
              Touch and drag to rotate • Pinch to zoom
            </p>

            <div className="product-info">
              <div>
                <span>Section Size</span>
                <strong>{selected.size}</strong>
              </div>

              <div>
                <span>Outer Size</span>
                <strong>
                  {selected.category === "Door Frames"
                    ? "210 × 90 cm"
                    : "150 × 150 cm"}
                </strong>
              </div>

              <div>
                <span>Variant</span>
                <strong>{selected.variant}</strong>
              </div>
            </div>

            <button
              className="whatsapp-button"
              onClick={() => whatsapp(selected)}
            >
              Enquire on WhatsApp
            </button>
          </div>
        </div>
      </section>

      <section className="specifications">
        <p className="eyebrow">MATERIAL & FEATURES</p>
        <h2>Built with Quality</h2>

        <div className="spec-grid">
          {[
            ["GI Sheet", "16 kg Tata Galvano 120 GSM"],
            ["Surface", "Epoxy Primer"],
            ["Technology", "Laser Cutting"],
            ["Hardware", "Steel Hinges"],
            ["Locking", "Locking System"],
            ["Grill", "Customer's Choice"],
          ].map(([title, detail]) => (
            <div className="spec-card" key={title}>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <p className="eyebrow">GET IN TOUCH</p>
        <h2>Let's Build Something Strong.</h2>

        <p>
          Contact us for custom dimensions, product details and quotations.
        </p>

        <a
          className="primary-button"
          href="https://wa.me/919745046924"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp: 9745046924
        </a>

        <p className="address">
          Koppam, Palakkad, Kerala
        </p>
      </section>

      <footer>
        <strong>HI-TECH</strong>
        <p>Steel Door & Window Frames</p>
        <small>
          © {new Date().getFullYear()} HI-TECH. All rights reserved.
        </small>
      </footer>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #0d0f12;
          color: #f4f5f7;
          font-family: Arial, Helvetica, sans-serif;
        }

        a {
          text-decoration: none;
        }

        .header {
          min-height: 75px;
          padding: 15px 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #292d33;
          background: #111419;
        }

        .brand {
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .brand-sub {
          color: #aab1bb;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .header-button {
          color: white;
          border: 1px solid #707985;
          border-radius: 5px;
          padding: 10px 17px;
        }

        .hero {
          padding: 100px 8%;
          min-height: 440px;
          background:
            linear-gradient(90deg, #101419 20%, #101419dd 65%, #10141988),
            radial-gradient(circle at 80% 30%, #48515d, #171b20 65%);
        }

        .eyebrow {
          color: #b6c0cc;
          font-size: 11px;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .hero h1 {
          font-size: clamp(38px, 7vw, 72px);
          line-height: 1.08;
          margin: 20px 0;
        }

        .hero h1 span {
          color: #aab7c6;
        }

        .hero-text,
        .section-text {
          color: #aeb5bf;
          line-height: 1.7;
        }

        .primary-button,
        .whatsapp-button {
          display: inline-block;
          background: #dce2e9;
          color: #11151a;
          border: 0;
          border-radius: 5px;
          padding: 14px 22px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 18px;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #191e24;
          padding: 25px 8%;
          gap: 15px;
          text-align: center;
        }

        .features div {
          display: grid;
          gap: 7px;
        }

        .features strong {
          font-size: 23px;
        }

        .features span {
          color: #aeb5bf;
          font-size: 12px;
        }

        .catalogue,
        .specifications {
          padding: 75px 7%;
        }

        .catalogue h2,
        .specifications h2,
        .contact h2 {
          font-size: clamp(28px, 5vw, 42px);
          margin: 12px 0;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 28px 0;
        }

        .filter {
          background: #1c2229;
          color: #d9dee5;
          border: 1px solid #3a424d;
          padding: 11px 16px;
          border-radius: 5px;
          cursor: pointer;
        }

        .filter.active {
          background: #dce2e9;
          color: #11151a;
        }

        .catalogue-layout {
          display: grid;
          grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.8fr);
          gap: 22px;
          align-items: start;
        }

        .product-list {
          display: grid;
          gap: 9px;
          max-height: 650px;
          overflow-y: auto;
        }

        .product-card {
          text-align: left;
          display: grid;
          gap: 7px;
          background: #171c22;
          color: white;
          border: 1px solid #303842;
          padding: 15px;
          border-radius: 6px;
          cursor: pointer;
        }

        .product-card.selected {
          border-color: #c4ceda;
          background: #252c35;
        }

        .product-card span,
        .product-card small {
          color: #aab4c0;
          font-size: 11px;
        }

        .product-card strong {
          font-size: 14px;
        }

        .viewer-panel {
          background: #171c22;
          border: 1px solid #303842;
          border-radius: 8px;
          padding: 17px;
          min-width: 0;
        }

        .viewer-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .viewer-label {
          font-size: 10px;
          color: #aeb8c5;
          letter-spacing: 2px;
        }

        .viewer-heading h3 {
          margin: 8px 0;
          font-size: 18px;
        }

        .live-dot {
          color: #b8c5d3;
          font-size: 12px;
        }

        .model-viewer {
          width: 100%;
          height: 390px;
          overflow: hidden;
          border-radius: 6px;
          touch-action: none;
        }

        .model-viewer canvas {
          display: block;
        }

        .viewer-hint {
          color: #aeb5bf;
          font-size: 11px;
          text-align: center;
        }

        .product-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          border-top: 1px solid #343b45;
          padding-top: 15px;
          margin-top: 15px;
        }

        .product-info div {
          display: grid;
          gap: 8px;
        }

        .product-info span {
          color: #aeb5bf;
          font-size: 11px;
        }

        .product-info strong {
          font-size: 13px;
        }

        .whatsapp-button {
          width: 100%;
          background: #dce2e9;
        }

        .specifications {
          background: #171c22;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 28px;
        }

        .spec-card {
          background: #20262e;
          border: 1px solid #343b45;
          border-radius: 6px;
          padding: 20px;
        }

        .spec-card p {
          color: #aeb5bf;
          font-size: 13px;
          line-height: 1.6;
        }

        .contact {
          padding: 75px 8%;
          text-align: center;
        }

        .contact p {
          color: #aeb5bf;
          line-height: 1.7;
        }

        .address {
          margin-top: 25px;
        }

        footer {
          padding: 30px 8%;
          text-align: center;
          background: #171c22;
          color: #aeb5bf;
        }

        footer strong {
          color: white;
          font-size: 22px;
          letter-spacing: 2px;
        }

        footer small {
          font-size: 11px;
        }

        @media (max-width: 750px) {
          .hero {
            padding: 75px 7%;
          }

          .catalogue-layout {
            grid-template-columns: 1fr;
          }

          .product-list {
            max-height: 260px;
          }

          .model-viewer {
            height: 320px;
          }

          .spec-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .brand-sub {
            font-size: 8px;
          }
        }

        @media (max-width: 430px) {
          .features {
            padding: 22px 4%;
          }

          .features strong {
            font-size: 18px;
          }

          .features span {
            font-size: 10px;
          }

          .product-info {
            grid-template-columns: 1fr 1fr;
          }

          .spec-grid {
            grid-template-columns: 1fr;
          }

          .header {
            padding: 14px 4%;
          }

          .brand {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}