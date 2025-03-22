/* INTRO */

const messages = document.querySelectorAll('.message:not(.complete)')
const goToOmarUpon = document.querySelector('.message.link')
const embedContainer = document.getElementById('embed-container')
let current = 1 // start at 1 because searching for nth-of-type css selector
let i = 0
let skippedLinks = 0
let currentLink = null

setTimeout(() => {
  document.querySelector('.message.complete').classList.remove('tail')
  messages[0].classList.add('complete')
  messages[0].classList.add('tail')
  messages[1].style.opacity = '1'
}, 1000);

setTimeout(() => {
  goToOmarUpon.classList.add('complete')
}, 2000);

goToOmarUpon.addEventListener('click', () => {
  document.querySelector('.intro').style.opacity = 0;
  document.querySelectorAll('.loading').forEach((element) => {
    element.classList.remove('loading')
  })
})


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
async function insertiframes(link) {
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

async function embedTweet(url) {
  const tweetId = extractTweetId(url);
  const twitterDiv = document.createElement("div");
  twitterDiv.classList.add('twitter-container')
  embedContainer.insertAdjacentElement('beforeend', twitterDiv)
  if (i === current) {
    if (currentLink) {
      currentLink.classList.remove('current')
    }
    currentLink = twitterDiv
    twitterDiv.classList.add('current')
  }
  twttr.widgets.createTweet(
    tweetId,
    twitterDiv,
    {
      align: "center",
      width: Math.min(window.innerWidth * .65, 548)
    }
  ).catch(err => { 
    console.error("Error embedding tweet:", err)
  });
  i++
}

function embedWebsite(url) {
  console.log(url)
  embedContainer.insertAdjacentHTML('beforeend', `<div class="site-preview"><object type="text/html" data="${url}" style="width:100%; height:100%"><a href="${url}"><img src="https://api.screenshotmachine.com?key=86b561&url=${url}&dimension=1024x768"></a></object></div>`)
  if (i === current) {
    if (currentLink) {
      currentLink.classList.remove('current')
    }
    currentLink = document.querySelector(`#embed-container div:nth-of-type(${current + 1})`)
    currentLink.classList.add('current')
  }
  i++
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

let links = getLinks("links").then(function (result) {
  let shuffledData = result.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  while (i + skippedLinks < 3) {
    insertiframes(shuffledData[i + skippedLinks].Link)
  }
})

/*function prev() {
  if (current > 1) {
    current--
  } else {
    current = i
  }

  if (currentLink) {
    currentLink.classList.remove('current')
  }
  currentLink = document.querySelector(`#embed-container div:nth-of-type(${current + 1})`)
  currentLink.classList.add('current')
  embedContainer.style.transform = `translate3d(${-34 * current}vw, 0px, 0px)`  
}

function next() {
  current++
  if (current > i - 1) {
    i++
    insertiframes(shuffledData[i + skippedLinks].Link)  
  }
  if (currentLink) {
    currentLink.classList.remove('current')
  }
  currentLink = document.querySelector(`#embed-container div:nth-of-type(${current + 1})`)
  currentLink.classList.add('current')
  embedContainer.style.transform = `translate3d(${-34 * current}vw, 0px, 0px)`  

}*/

function next() {
  current++
  if (current > i - 1) {
    i++
    insertiframes(shuffledData[i + skippedLinks].Link)  
  }
  if (currentLink) {
    currentLink.classList.remove('current')
  }
  currentLink = document.querySelector(`#embed-container div:nth-of-type(${current + 1})`)
  currentLink.classList.add('current')
  embedContainer.style.transform = `translate3d(${-34 * current}vw, 0px, 0px)`  
  console.log('next')
}

function prev() {
  console.log('pre')
  if (current > 1) {
    current--
  } else {
    current = i
  }

  if (currentLink) {
    currentLink.classList.remove('current')
  }
  currentLink = document.querySelector(`#embed-container div:nth-of-type(${current + 1})`)
  currentLink.classList.add('current')
  embedContainer.style.transform = `translate3d(${-34 * current}vw, 0px, 0px)`  

}




