/* INTRO */

const messages = document.querySelectorAll('.message:not(.complete)')
const goToOmarUpon = document.querySelector('.message.link')
const embedContainer = document.getElementById('embed-container')
const prevBtn = document.querySelector('.btn.prev')
let currentSlide = null
let i = 0
let linksLoaded = 0

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
  document.querySelector('.intro').style.display = 'none';
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
  twitterDiv.setAttribute('data-idx', i)
  twitterDiv.classList.add('twitter-container')
  
  currentSlide = twitterDiv
  linksLoaded++
  embedContainer.insertAdjacentElement('beforeend', twitterDiv)
  twttr.widgets.createTweet(
    tweetId,
    twitterDiv,
    {
      align: "center"
    }
  ).catch(err => { 
    console.error("Error embedding tweet:", err)
  });
}

function embedWebsite(url) {
  embedContainer.insertAdjacentHTML('beforeend', `<div class="site-preview ${i === linksLoaded ? '' : 'hide'}" data-idx="${linksLoaded}"><object type="text/html" data="${url}" style="width:100%; height:100%"><a href="${url}"><img src="https://api.screenshotmachine.com?key=86b561&url=${url}&dimension=1024x768"></a></object></div>`)
  currentSlide = embedContainer.lastChild
  linksLoaded++
}

let links = getLinks("links").then(function (result) {
  links = result.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    insertiframes(links[i].Link)
})

function next() {
  currentSlide.classList.add('hide')
  i++
  if (i > 0) {
    prevBtn.classList.remove('disabled')
  }

  if (i >= links.length) {
    i = 0
    prevBtn.classList.add('disabled')
  }
  currentSlide = document.querySelector(`.site-preview[data-idx="${i}"], .twitter-container[data-idx="${i}"]`)
  if (currentSlide) {
    currentSlide.classList.remove('hide')
  } else {
    insertiframes(links[i].Link)
  }
}

function prev() {
  currentSlide.classList.add('hide')
  i--
  if (i === 0) {
    prevBtn.classList.add('disabled')
  } 
  const slide = document.querySelector(`.site-preview[data-idx="${i}"], .twitter-container[data-idx="${i}"]`)
  if (slide) {
    currentSlide = slide
    slide.classList.remove('hide')
  }
}




