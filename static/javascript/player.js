//import { RefreshrefreshToken } from "./utils.js"

let params = new URLSearchParams(document.location.search)
let accessToken = params.get("access_token")
if(accessToken==null){
    accessToken = localStorage.getItem("access_token")
}
let refreshToken = params.get("refresh_token")
if(refreshToken==null){
    refreshToken = localStorage.getItem("refresh_token")
}
localStorage.setItem("access_token", accessToken)
localStorage.setItem("refresh_token", refreshToken)
let clientId = params.get("client_id")
if(clientId==null){
    clientId = localStorage.getItem("client_id")
}
localStorage.setItem("client_id", clientId)
let playing = true;
let ISshuffling = true;

document.addEventListener("keydown", function(event){
    if(event.key==" "){
        pausePlay()
    }
})

const playPauseButton = document.getElementById("playPauseButton")
const prevButton = document.getElementById("prevButton")
const nextButton = document.getElementById("nextButton")

const shuffle = document.getElementById("shuffle")
const queue = document.getElementById("queue")
const queueButton = document.getElementById("queueButton")

queueButton.addEventListener("click", async function(){
    console.log(queue.style.display)
    if(queue.style.display == "none"){
        queue.innerHTML  = "";
        queue.style.display = "inherit";
        getQueue()
        queueButton.children[0].style.fill = "Crimson";
    }else{
        queue.style.display = "none"
        queueButton.children[0].style.fill = "antiqueWhite";
    }
})

shuffle.addEventListener("click", async function(){
    const url = "https://api.spotify.com/v1/me/player/shuffle?state="+!ISshuffling
    const payload = {
        method: "PUT",
        headers: {
            "Authorization": "Bearer "+accessToken
        }
    }
    const body = await fetch(url, payload)
    if(body.ok){
        ISshuffling = !ISshuffling
        updateShuffleButton()
    }
})

function updateShuffleButton(){
    if(ISshuffling){
        shuffle.children[0].style.fill = "Crimson"
    }else{
        shuffle.children[0].style.fill = "antiqueWhite"
    }
}

const pausedSVG=`<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	width="10" height="10" viewBox="0 0 277.338 277.338"
	xml:space="preserve">
<g>
	<path d="M14.22,45.665v186.013c0,25.223,16.711,45.66,37.327,45.66c20.618,0,37.339-20.438,37.339-45.66V45.665
		c0-25.211-16.721-45.657-37.339-45.657C30.931,0,14.22,20.454,14.22,45.665z"/>
	<path d="M225.78,0c-20.614,0-37.325,20.446-37.325,45.657V231.67c0,25.223,16.711,45.652,37.325,45.652s37.338-20.43,37.338-45.652
		V45.665C263.109,20.454,246.394,0,225.78,0z"/>
</g>
</svg>`

const playSVG = `<svg fill="#000000" height="10" width="10" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	viewBox="0 0 17.804 17.804" xml:space="preserve">
<g>
	<g id="c98_play">
		<path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313
			c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04
			c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"/>
	</g>
	<g id="Capa_1_78_">
	</g>
</g>
</svg>`


function SetPlayPauseButtonState(){
    if(playing){
        playPauseButton.innerHTML = pausedSVG
    }else{
        playPauseButton.innerHTML = playSVG
    }
}



async function getPlaying(){
    getShuffling()

    const url = "https://api.spotify.com/v1/me/player/currently-playing"

    const payload = {
        method: "GET",
        headers: {
            'Authorization': "Bearer "+accessToken
        }
    }

    const body = await fetch(url, payload)
    if(body.ok){
        const resp = await body.json()

        playing = resp.is_playing
        SetPlayPauseButtonState()
        extractData(resp)
    }else{
        RefreshrefreshToken()
    }
}

async function RefreshrefreshToken(){
    const url = "/refreshToken?refresh_token="+localStorage.getItem("refresh_token")
    
    const payload = {
      method: 'GET',
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    if(response.access_token){
        accessToken = response.access_token;
        console.log(accessToken)
        localStorage.setItem("access_token", accessToken)
    }
    if (response.refresh_token) {
        refreshToken = response.refresh_token;
        localStorage.setItem("refresh_token", refreshToken)
    }
}

function extractData(json){
    const item = json.item


    const trackName = item.name
    document.getElementById("trackTitle").textContent = trackName

    const artist = item.artists[0].name
    document.getElementById("artist").textContent = artist

    const cover = item.album.images[0].url

    document.getElementById("cover").src = cover
    let img = document.getElementById("cover")
    const fac = new FastAverageColor();

    fac.getColorAsync(img).then(color => {
        img.style.boxShadow = `0px 0px 10px 5px ${color.rgba}`;
    });

    const length = item.duration_ms / 1000
    const pos = json.progress_ms / 1000

    const playbar = document.getElementById("playbar")
    
    playbar.min = 0;
    playbar.max = length;
    playbar.value = pos;

}

// if needed
async function getShuffling(){
    const url = "https://api.spotify.com/v1/me/player"
    
    const payload = {
        method: "GET",
        headers: {
            "Authorization": "Bearer "+accessToken
        }
    }

    const body = await fetch(url, payload)

    const json = await body.json()

    ISshuffling = json.shuffle_state
    updateShuffleButton()
}

async function pausePlay(){
    if(!playing){
        const url = "https://api.spotify.com/v1/me/player/play"
        if (normRequest(url, "PUT", "play")){
            SetPlayPauseButtonState()
        }
    }else{
        const url = "https://api.spotify.com/v1/me/player/pause" 
        if(normRequest(url, "PUT", "pause")){
            SetPlayPauseButtonState()
        }
    }
}

async function next(){
    const url = "https://api.spotify.com/v1/me/player/next"
    normRequest(url, "POST", "skip to next")
}

async function previous(){
    const url = "https://api.spotify.com/v1/me/player/previous"
    normRequest(url, "POST", "skip to previous")
}

async function move(pos){
    const url = "https://api.spotify.com/v1/me/player/seek?position_ms="+pos.toString()
    normRequest(url, "PUT", "seek to position")
}


async function normRequest(url, method, errObj, resp = false){
    const payload = {
        method: method,
        headers : {
            "Authorization": "Bearer "+accessToken
        }
    }
    const body = await fetch(url, payload)

    if(!body.ok){
        console.log("ERROR: Couldn't "+errObj)
    }
    
    if (!resp){
        return body.ok
    }else{
        const json = await body.json()
        return json
    }
}



document.addEventListener("DOMContentLoaded", function(){
    getPlaying()
    setInterval(getPlaying, 1000)
    setInterval(getQueue, 10000)
})

playPauseButton.addEventListener("click", pausePlay)
prevButton.addEventListener("click", previous)
nextButton.addEventListener("click", next)
document.getElementById("playbar").addEventListener("change", function(event){
    move(Math.round(event.target.value * 1000))
})


async function getQueue(){
    console.log(queue.style.display)
    if(queue.style.display != "none"){
        const url = "https://api.spotify.com/v1/me/player/queue"

    let json = await normRequest(url, "GET", "get queue", true)

    document.getElementById("queue").innerHTML = ""   
    let queue = json.queue
    for(let item of queue){
        let name = item.name
        let image = item.album.images[0].url
        let artist = item.artists[0].name
        let template = `<div class="recentTrack"><img class="recentCover" src="${image}"><div class="currentTrack"><h4>${name}</h4><h5>${artist}</h5></div></div>`
        document.getElementById("queue").innerHTML+=template
    }
    }
}
