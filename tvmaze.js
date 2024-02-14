"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMG = 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300';

$showsList.on("click", ".Show-getEpisodes", getAndDisplayEpisodes);

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(showName) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await fetch(`${BASE_URL}/search/shows?q=${showName}`);
  const showData = await response.json();
  console.log(showData);
  return showData.map(show => {
    return ({
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary === null ? 'No Summary Available' : show.show.summary,
      image: show.show.image === null ? DEFAULT_IMG : show.show.image.medium,
    }
    );
  });
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${BASE_URL}/shows/${id}/episodes`);
  const episodesData = await response.json();

  return episodesData.map(epData => {
    return {
      id: epData.id,
      name: epData.name,
      season: epData.season,
      number: epData.number
    }
  });
}

/** Takes an array of episode objects and displays then in the DOM. */
function displayEpisodes(episodes) {
  const $episodesList = $('<ul>');
  for (const ep of episodes) {
    $episodesList.append($(`
      <li>${ep.name} (season ${ep.season}, number ${ep.number})</li>
    `));
  }
  $episodesArea.append($episodesList);
  $episodesArea.show();
 }

/** Controller function to fetch episode data and display in DOM.  */
 async function getAndDisplayEpisodes(evt) {
    const showId = $(evt.target).closest(".Show").attr("data-show-id");
    const episodes = await getEpisodesOfShow(showId);
    displayEpisodes(episodes);
 }
