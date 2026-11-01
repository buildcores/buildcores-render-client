import React from "react";
import Link from "@docusaurus/Link";
import models from "@site/static/assets/images/sdk-models.webp";
import rgb from "@site/static/assets/images/sdk-rgb.webp";
import setup from "@site/static/assets/images/sdk-setup.webp";
import viewer from "@site/static/assets/images/local-configurator.png";
import styles from "./styles.module.css";

// Artwork and card treatment adapted from the BuildCores website's landing bento.
export default function SdkBenefits() {
  return (
    <section className={styles.grid} aria-label="Why use the BuildCores SDK">
      <article className={`${styles.card} ${styles.models}`}>
        <img
          className={styles.modelImage}
          src={models}
          alt="Detailed 3D models of a motherboard, graphics card, memory, processor, and case fan"
          width="936"
          height="700"
        />
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Over 5,000 accurate 3D models</span>
          <h2>The most accurate 3D models of PC parts</h2>
          <p>Give shoppers a faithful preview of the parts they are buying.</p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.specs}`}>
        <div className={styles.catalog} aria-hidden="true">
          <span>Dimensions &amp; fit</span>
          <span>Technical specs</span>
          <span>Product identifiers</span>
        </div>
        <div className={styles.copy}>
          <h2>A large, maintained specs database</h2>
          <p>Build on a catalog of real PC hardware and detailed product specifications.</p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.rendering}`}>
        <div className={styles.viewer}>
          <img
            src={viewer}
            alt="BuildCores 3D PC configurator with part and lighting controls"
            width="1938"
            height="1148"
            loading="lazy"
          />
        </div>
        <div className={styles.copy}>
          <h2>Fast on desktop and mobile</h2>
          <p>Responsive 3D rendering, directly in the browser.</p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.customization}`}>
        <img
          className={styles.rgbImage}
          src={rgb}
          alt="A detailed PC model with purple RGB lighting and multiple case fans"
          width="720"
          height="720"
          loading="lazy"
        />
        <div className={styles.copy}>
          <h2>Make every build their own</h2>
          <p>Customize RGB, case fans, cooling, and supported model options.</p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.setup}`}>
        <img
          className={styles.setupImage}
          src={setup}
          alt="A complete 3D desk setup with a PC, monitor, keyboard, and mouse"
          width="1100"
          height="1100"
          loading="lazy"
        />
        <div className={styles.copy}>
          <span className={styles.beta}>Setup Builder · Beta</span>
          <h2>Go beyond the PC</h2>
          <p>Expand into full 3D setups with desks, monitors, and peripherals.</p>
          <Link to="/sdk/setup-builder/" className={styles.link}>
            Explore Setup Builder <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </article>
    </section>
  );
}
