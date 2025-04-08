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
            <a href="#">
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

  container.addEventListener("mouseenter", () => (isHovered = true));
  container.addEventListener("mouseleave", () => (isHovered = false));

  setInterval(() => {
    if (!isHovered) {
      container.scrollLeft += 1;
    }
  }, 25);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchManga("https://kitsu.io/api/edge/manga?page[limit]=20&sort=-popularityRank", "#popular-scroll");
  fetchManga("https://kitsu.io/api/edge/manga?page[limit]=20&sort=-createdAt", "#recent-scroll");
  fetchManga("https://kitsu.io/api/edge/manga?page[limit]=10&sort=-userCount", "#weekly-list", true);

  enableAutoScroll("#popular-scroll");
  enableAutoScroll("#recent-scroll");
});
