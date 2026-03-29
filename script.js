// ===== SHARED UTILITIES =====

// Google Form URL — replace with your actual form's pre-filled URL
const GOOGLE_FORM_BASE =
  "https://docs.google.com/forms/d/e/1FAIpQLSdPwthb9dYEz8Q0mei5AskzzfI_HF_5UzmalnaC95SFRlSISg/viewform?usp=pp_url&entry.1200124981=";
/*
 * Formats a number as Indian Rupees
 */
function formatPrice(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * Opens Google Form with product name pre-filled
 */
function openOrderForm(productName) {
  const url = GOOGLE_FORM_BASE + encodeURIComponent(productName);
  window.open(url, "_blank");
}

/**
 * Navigate to product detail page
 */
function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

/**
 * Scroll-to-top button logic
 */
function initScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 320);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ===== INDEX PAGE =====

function initHomepage() {
  if (!document.getElementById("productsGrid")) return;

  renderProducts(products);
  initFilterTabs();
  initScrollTop();
  initHeroScroll();
}

/**
 * Render product cards into the grid
 */
function renderProducts(items) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = `<p class="loading">No cakes found in this category yet!</p>`;
    return;
  }

  items.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card fade-in";
    card.style.animationDelay = `${i * 0.07}s`;

    card.innerHTML = `
      <div class="product-card-img">
        <img src="${p.thumb}" alt="${p.name}" loading="lazy" />
        <span class="product-tag">${p.tag}</span>
        <div class="product-quick-view">
          <button class="quick-view-btn">View Details</button>
        </div>
      </div>
      <div class="product-card-body">
        <h3 class="product-card-name">${p.emoji} ${p.name}</h3>
        <p class="product-card-desc">${p.shortDesc}</p>
        <div class="product-card-footer">
          <div class="product-price">
            <span class="product-price-label">Starting from</span>
            <div class="product-price-amount">${formatPrice(p.price)} <span>/ kg</span></div>
          </div>
          <button class="product-buy-btn" data-id="${p.id}" data-name="${p.name}">Order Now</button>
        </div>
      </div>
    `;

    // Click card body / quick-view → go to detail page
    card.querySelector(".product-card-img").addEventListener("click", () => goToProduct(p.id));
    card.querySelector(".product-card-name").addEventListener("click", () => goToProduct(p.id));

    // "Order Now" button → open form directly
    card.querySelector(".product-buy-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openOrderForm(p.name);
    });

    grid.appendChild(card);
  });
}

/**
 * Filter tabs behaviour
 */
function initFilterTabs() {
  const tabs = document.querySelectorAll(".filter-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const filter = tab.dataset.filter;
      if (filter === "all") {
        renderProducts(products);
      } else {
        const filtered = products.filter(
          (p) => p.tag.toLowerCase() === filter.toLowerCase()
        );
        renderProducts(filtered);
      }
    });
  });
}

/**
 * Subtle parallax on hero image on scroll
 */
function initHeroScroll() {
  const heroWrap = document.querySelector(".hero-img-wrap img");
  if (!heroWrap) return;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    heroWrap.style.transform = `scale(1.04) translateY(${y * 0.06}px)`;
  }, { passive: true });
}

// ===== PRODUCT DETAIL PAGE =====

function initDetailPage() {
  const container = document.getElementById("detailContent");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showDetailError(container);
    return;
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    showDetailError(container);
    return;
  }

  // Update page title
  document.title = `${product.name} — SweetCraft Bakery`;

  // Update breadcrumb
  const bcProduct = document.getElementById("bcProduct");
  if (bcProduct) bcProduct.textContent = product.name;

  // Render detail HTML
  container.innerHTML = `
    <div class="detail-grid">
      <div class="detail-img-main fade-in">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="detail-info fade-in" style="animation-delay:0.12s">
        <span class="detail-tag">${product.emoji} ${product.tag}</span>
        <h1 class="detail-name">${product.name}</h1>
        <p class="detail-short-desc">${product.shortDesc}</p>

        <div class="detail-price-wrap">
          <span class="detail-price">${formatPrice(product.price)}</span>
          <span class="detail-price-unit">/ kg</span>
        </div>

        <div class="detail-meta">
          <div class="detail-meta-item">
            <div class="detail-meta-label">Weight</div>
            <div class="detail-meta-value">${product.weight}</div>
          </div>
          <div class="detail-meta-item">
            <div class="detail-meta-label">Serves</div>
            <div class="detail-meta-value">${product.serves} people</div>
          </div>
          <div class="detail-meta-item">
            <div class="detail-meta-label">Delivery</div>
            <div class="detail-meta-value">Same day</div>
          </div>
          <div class="detail-meta-item">
            <div class="detail-meta-label">Freshness</div>
            <div class="detail-meta-value">Baked to order</div>
          </div>
        </div>

        <hr class="detail-divider" />

        <h3 class="detail-desc-title">About this cake</h3>
        <p class="detail-desc">${product.description}</p>

        <div class="detail-actions">
          <button class="detail-buy-btn" id="detailOrderBtn">🎂 Order Now</button>
          <button class="detail-back-btn" onclick="history.back()">← Go Back</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("detailOrderBtn").addEventListener("click", () => {
    openOrderForm(product.name);
  });

  // Render related products (exclude current)
  renderRelated(product.id);
  initScrollTop();
}

/**
 * Render related products
 */
function renderRelated(currentId) {
  const section = document.getElementById("relatedGrid");
  if (!section) return;

  const related = products.filter((p) => p.id !== currentId).slice(0, 3);

  related.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "product-card fade-in";
    card.style.animationDelay = `${i * 0.07}s`;

    card.innerHTML = `
      <div class="product-card-img">
        <img src="${p.thumb}" alt="${p.name}" loading="lazy" />
        <span class="product-tag">${p.tag}</span>
        <div class="product-quick-view">
          <button class="quick-view-btn">View Details</button>
        </div>
      </div>
      <div class="product-card-body">
        <h3 class="product-card-name">${p.emoji} ${p.name}</h3>
        <p class="product-card-desc">${p.shortDesc}</p>
        <div class="product-card-footer">
          <div class="product-price">
            <span class="product-price-label">Starting from</span>
            <div class="product-price-amount">${formatPrice(p.price)} <span>/ kg</span></div>
          </div>
          <button class="product-buy-btn" data-id="${p.id}" data-name="${p.name}">Order</button>
        </div>
      </div>
    `;

    card.querySelector(".product-card-img").addEventListener("click", () => goToProduct(p.id));
    card.querySelector(".product-card-name").addEventListener("click", () => goToProduct(p.id));
    card.querySelector(".product-buy-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openOrderForm(p.name);
    });

    section.appendChild(card);
  });
}

/**
 * Show error state on detail page
 */
function showDetailError(container) {
  container.innerHTML = `
    <div class="error-state">
      <div style="font-size:64px;margin-bottom:16px">🎂</div>
      <h2>Cake not found!</h2>
      <p>This cake might have been eaten already. Please go back and choose another.</p>
      <a href="index.html" class="btn-primary" style="display:inline-block;padding:14px 32px;background:var(--accent);color:white;border-radius:50px;font-weight:600;">← Back to Shop</a>
    </div>
  `;
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initHomepage();
  initDetailPage();
});