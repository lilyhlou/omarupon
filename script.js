
/* EXTRACTING & CACHING INFO FROM SPREADSHEET */
const SPREADSHEET_ID = "1GasetHLhWYkIYfxPPYNBFM4djQfyBWpMK35og7qJY3o";
const TAB_NAME = "omars-links";
const CACHE_NAME = "omarupon-cache";
const EXPIRATION_TIME = 60 * 1000 * 60 * 24 * 7; // Expire after 1 week

async function getLinks(key) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(key);

  if (!response) {
    return fetchSheet(key)
  }

  const { data, expiresAt } = await response.json();
  if (Date.now() > expiresAt) {
    await cache.delete(key);
    fetchSheet(key)
  }
  return data;
}

async function fetchSheet(key) {
  fetch(
    "https://opensheet.elk.sh/1GasetHLhWYkIYfxPPYNBFM4djQfyBWpMK35og7qJY3o/omars-links"
  )
    .then((res) => res.json())
    .then((data) => {
      cacheArray(key, data)
      return data
    });
}

async function cacheArray(key, data) {
  const cache = await caches.open(CACHE_NAME);
  const payload = {
    data,
    expiresAt: Date.now() + EXPIRATION_TIME,
  };

  const response = new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });

  await cache.put(key, response);
}

/* HANDLING EMBEDS/IFRAMES */
function insertiframes(link) {
  if (link.includes('twitter.com') || link.includes('https://x.com/')) {
    embedTweet(link)
  } else {
    embedWebsite(link)
  }
}

function extractTweetId(url) {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

function embedTweet(url) {
  const tweetId = extractTweetId(url);
  const embedContainer = document.getElementById('embed-container')

  twttr.widgets.createTweet(
    tweetId,
    embedContainer,
    {
      align: "center"
    }
  ).catch(err => console.error("Error embedding tweet:", err));
}

function embedWebsite(url) {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.onload = function () { console.log('loaded iframe') };
  iframe.onerror = function () {
    document.getElementById('embed-container').innerHTML = `<a href="${url}" target="_blank">Open in new tab</a>`;
  };

  document.getElementById('embed-container').appendChild(iframe);
}

/*
for pulling title / description from urls
async function fetchMetadata(url) {
  const corsProxy = "https://cors-anywhere.herokuapp.com/"; // Public CORS proxy

  try {
    const response = await fetch(corsProxy + url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const title = doc.querySelector("title")?.innerText || "No title";
    const description = doc.querySelector('meta[name="description"]')?.content || "No description";
    const thumbnail = doc.querySelector('meta[property="og:image"]')?.content || "No image";

    return { title, description, thumbnail, url };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return { title: "Error", description: "Failed to load", thumbnail: "", url };
  }
}*/

let i = 0
let links = getLinks("links").then(function (result) {
  console.log(result)
  let shuffledData = result.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  if (i < 3) {
    insertiframes(shuffledData[i].Link)
    i++
  }
})


