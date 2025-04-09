function fetchManga(endpoint, containerId, isList = false) {
  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      const container = document.querySelector(containerId);
      container.innerHTML = "";

      data.data.forEach((manga, index) => {
        const title = manga.attributes.canonicalTitle || "Untitled";
        const image = manga.attributes.posterImage?.small || "";
        const id = manga.id;
        const likes = manga.attributes.favoritesCount || 0;
        const views = manga.attributes.userCount || 0;
        const slug = manga.attributes.slug;

        if (isList) {
          const li = document.createElement("li");
          li.innerHTML = `
            <span class="ranking-title">${index + 1}. ${title}</span>
            <span class="ranking-stats">❤ ${likes} • 👁 ${views}</span>
          `;
          container.appendChild(li);
        } else {
          const card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <a href="https://kitsu.io/manga/${slug}" target="_blank" rel="noopener noreferrer">
              <img src="${image}" alt="${title}" />
              <h3>${title}</h3>
            </a>
          `;
          container.appendChild(card);
        }
      });
    })
    .catch(() => {
      const container = document.querySelector(containerId);
      container.innerHTML = "<p style='color:red;'>Failed to load manga.</p>";
    });
}

function enableAutoScroll(containerSelector) {
  const container = document.querySelector(containerSelector);
  let isHovered = false;
  let scrollAmount = 1;
  let scrollDirection = 1;
  let isDragging = false;
  let startX;
  let scrollLeft;
  let dragDistance = 0;

  // Mouse events for desktop
  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    dragDistance = 0;
    container.classList.add("grabbing");
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
    container.classList.remove("grabbing");
  });

  container.addEventListener("mouseup", (e) => {
    isDragging = false;
    container.classList.remove("grabbing");
    
    // Only prevent default if we've dragged a significant distance
    if (Math.abs(dragDistance) > 10) {
      e.preventDefault();
    }
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    dragDistance = walk;
    container.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
  container.addEventListener("touchstart", (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    dragDistance = 0;
    container.classList.add("grabbing");
  });

  container.addEventListener("touchend", (e) => {
    isDragging = false;
    container.classList.remove("grabbing");
    
    // Only prevent default if we've dragged a significant distance
    if (Math.abs(dragDistance) > 10) {
      e.preventDefault();
    }
  });

  container.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    dragDistance = walk;
    container.scrollLeft = scrollLeft - walk;
  });

  // Hover events
  container.addEventListener("mouseenter", () => {
    isHovered = true;
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
  });

  // Clone the content for infinite scroll
  const content = container.innerHTML;
  container.innerHTML = content + content;

  setInterval(() => {
    if (!isHovered && !isDragging) {
      container.scrollLeft += scrollAmount * scrollDirection;

      // Check if we've reached the end of the first set of content
      if (container.scrollLeft >= container.scrollWidth / 2) {
        // Smoothly reset to the beginning
        container.scrollLeft = 0;
      }
    }
  }, 25);
}

function createMangaCard(manga) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const img = document.createElement('img');
  img.src = manga.attributes.posterImage?.medium || 'placeholder.jpg';
  img.alt = manga.attributes.canonicalTitle;
  
  const title = document.createElement('h3');
  title.textContent = manga.attributes.canonicalTitle;
  
  const kitsuLink = document.createElement('a');
  kitsuLink.href = `https://kitsu.io/manga/${manga.attributes.slug}`;
  kitsuLink.className = 'kitsu-link';
  kitsuLink.textContent = 'View on Kitsu';
  kitsuLink.target = '_blank';
  
  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(kitsuLink);
  
  return card;
}

function createSkeletonCards(count) {
  const container = document.createElement('div');
  container.className = 'scroll-container';
  
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    container.appendChild(skeleton);
  }
  
  return container;
}

function showLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'loading-container';
  spinner.innerHTML = '<div class="loading-spinner"></div>';
  return spinner;
}

function lazyLoadImage(img) {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
  }
}

async function fetchMangaData(endpoint) {
  const container = document.getElementById(endpoint);
  container.innerHTML = '';
  
  // Show skeleton loading
  const skeletonContainer = createSkeletonCards(5);
  container.appendChild(skeletonContainer);
  
  try {
    const response = await fetch(`https://kitsu.io/api/edge/${endpoint}?page[limit]=5`);
    const data = await response.json();
    
    // Remove skeleton loading
    container.innerHTML = '';
    
    // Create scroll container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'scroll-container';
    
    // Add manga cards
    data.data.forEach(manga => {
      const card = createMangaCard(manga);
      scrollContainer.appendChild(card);
      
      // Lazy load images
      const img = card.querySelector('img');
      lazyLoadImage(img);
    });
    
    container.appendChild(scrollContainer);
  } catch (error) {
    console.error('Error fetching manga data:', error);
    container.innerHTML = '<p class="error-message">Failed to load manga data. Please try again later.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchManga("https://kitsu.io/api/edge/manga?page[limit]=20&sort=-popularityRank", "#popular-scroll");
  fetchManga("https://kitsu.io/api/edge/manga?page[limit]=20&sort=-createdAt", "#recent-scroll");
  fetchManga("https://kitsu.io/api/edge/manga?page[limit]=10&sort=-userCount", "#weekly-list", true);

  enableAutoScroll("#popular-scroll");
  enableAutoScroll("#recent-scroll");
});
