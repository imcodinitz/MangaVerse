const KITSU_API = 'https://kitsu.io/api/edge/manga?page[limit]=20';

async function fetchManga(sectionId, sortType = 'popularityRank') {
  const res = await fetch(`${KITSU_API}&sort=${sortType}`);
  const data = await res.json();

  const container = document.getElementById(sectionId);
  container.innerHTML = '';

  data.data.forEach(manga => {
    const title = manga.attributes.canonicalTitle;
    const desc = manga.attributes.synopsis || 'No description.';
    const img = manga.attributes.posterImage?.medium || '';
    const link = '#'; // Placeholder for future detail page

    const card = document.createElement('a');
    card.href = link;
    card.classList.add('manga-card');
    card.innerHTML = `
      <img src="${img}" alt="${title}">
      <h3>${title}</h3>
      <p>${desc.slice(0, 100)}...</p>
    `;
    container.appendChild(card);
  });
}

function scrollLeft(sectionId) {
  document.getElementById(sectionId).scrollBy({ left: -320, behavior: 'smooth' });
}

function scrollRight(sectionId) {
  document.getElementById(sectionId).scrollBy({ left: 320, behavior: 'smooth' });
}

fetchManga('popularManga', 'popularityRank');
fetchManga('recentManga', '-createdAt');
