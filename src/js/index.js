const API_KEY = config.apikey;
const PLAYLIST_ID = 'PLRdiaanKAFQliJh8AMvlV6t7NBrmNXCo-';
const CHANNEL_ID = 'UChwgNUWPM-ksOP3BbfQHS5Q';
const MAX_RESULTS = 50;
const MAX_CONTENTS = 3;

const GOLD_BORDER = 1000000;
const SILVER_BORDER = 400000;


let pagetoken = '';

document.addEventListener('DOMContentLoaded', () => {
    display();
});

const generatePlaylistApiUrl = (token) => {
    let url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet';
    url += `&playlistId=${PLAYLIST_ID}`;
    url += `&maxResults=${MAX_RESULTS}`;
    if(pagetoken !== '') {
        url += `&pageToken=${token}`;
    }
    url += `&key=${API_KEY}`;

    return url;
}

const generateVideoApiUrl = (ids) => {
    let url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics'
    url += `&id=${ids}`;
    url += `&key=${API_KEY}`;

    return url;
}

const dataToArray = async () => {

    const items = sessionStorage.getItem('videoIds');
    if(items !== null) return items.split(',');

    let results = [];
    while(pagetoken !== undefined) {
        let res = await fetch(generatePlaylistApiUrl(pagetoken));
        let data = await res.json();

        for(let i = 0; i < data.items.length; ++i) {
            pagetoken = data.nextPageToken;
            results.push(data.items[i].snippet.resourceId.videoId);
        }
    }

    sessionStorage.setItem('videoIds', results.toString());

    return results;
}

const getContents = async () => {
    const ids = await dataToArray();
    const len = ids.length;

    let selectedIds = [];
    for(let i = 0; i < MAX_CONTENTS; i++) {
        selectedIds.push(ids[Math.floor(len * Math.random())]);
    }

    const res = await fetch(generateVideoApiUrl(selectedIds.toString()));
    const contents = await res.json();

    return contents;
}

const extractTitle = (str) => {
    const start = str.indexOf('『');
    const last = str.indexOf('』');

    return str.substring(start + 1, last);
}

const setRankColor = (board, score) => {
    if(score >= GOLD_BORDER) {
        board.style.background = "linear-gradient(45deg, #B67B03 0%, #DAAF08 45%, #FEE9A0 70%, #DAAF08 85%, #B67B03 90% 100%)";
    }
    else if(score >= SILVER_BORDER) {
        board.style.background = "linear-gradient(45deg, #757575 0%, #9E9E9E 45%, #E8E8E8 70%, #9E9E9E 85%, #757575 90% 100%)";
    }
    else {
        board.style.backgroundColor = "#EEEEEE";
    }
}

const createBoard = (obj) => {
    let board = document.createElement('div');
    board.classList.add("board", "m-5", "p-3", "border");

    const publishedAt = obj.snippet.publishedAt;
    const date = publishedAt.substring(0, publishedAt.indexOf('T'));
    const viewCount = obj.statistics.viewCount;
    let htmlString = `
        <p class="h3 text-center">${extractTitle(obj.snippet.title)}</h3>
        <p class="h4 text-center">再生回数 : ${viewCount}</p>
        <p class="h4 text-center">アップロード日 : ${date}</p>
        <div class="video p-4 text-center">
            <iframe src="https://www.youtube.com/embed/${obj.id}"
        frameborder="0" allowfullscreen rel="0"></iframe>
        </div>`;
    board.innerHTML = htmlString;

    setRankColor(board, parseInt(viewCount));

    return board;
}

const display = async () => {

    const contents = await getContents();

    let ele = document.getElementById('list');
    for(let i = 0; i < contents.items.length; ++i) {
        ele.append(createBoard(contents.items[i]));
    }

}