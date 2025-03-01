document.addEventListener("DOMContentLoaded", async function(){
    await RefreshrefreshToken()
    getRecentlyPlayed()
})

async function RefreshrefreshToken(){
    const url = "/refreshToken?refresh_token="+localStorage.getItem("refresh_token")
    
    const payload = {
      method: 'GET',
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    if(response.access_token){
        let accessToken = response.access_token;
        console.log("accessToken = "+accessToken)

        localStorage.setItem("access_token", accessToken)
    }
    if (response.refresh_token) {
        let refreshToken = response.refresh_token;
        localStorage.setItem("refresh_token", refreshToken)
    }
}

const playSVG = `<svg class="playIcon" fill="antiqueWhite" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
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

async function getRecentlyPlayed(){
    const url = "https://api.spotify.com/v1/me/player/recently-played?limit=50";
    const payload = {
        method: "GET",
        headers: {
            "Authorization": "Bearer "+localStorage.getItem("access_token")
        }
    }
    const body = await fetch(url, payload)
    const json = await body.json()

    document.querySelector(".recents").innerHTML=""
    let items = json.items
    for(let item of items){
        item = item.track
        console.log(item)
        let name = item.name
        if(name.length>35){
            name = name.substring(0, 37)+"..."
        }
        let popularity = item.popularity
        let artist = item.artists[0].name
        let image = item.album.images[0].url
        let uri = item.uri
        let template = `<div class="recentTrack"><div class="ric"><img class="recentCover" src="${image}"><div class="playCent" style="position: absolute" onclick="play('${uri}')">${playSVG}</div></div><div class="currentTrack"><h4>${name}</h4><h5 class="recentartist">${artist}</h5><h5 class="recenttrackpopularity">Popularity: ${popularity}/100</h5></div></div>`
        document.querySelector(".recents").innerHTML+=template
    }
    const images = document.querySelectorAll(".recentCover");

    images.forEach((img) => {
        img.onload = function () {
            console.log("loaded")
            // Make sure the parent div (.ric) matches the image width
            img.parentElement.style.width = img.width + "px";
        };

        // If the image is already cached, force trigger onload
        if (img.complete) {
            img.onload();
        }
    });
}

async function play(uri){
    const url = "https://api.spotify.com/v1/me/player/play"
    const payload = {
        method: "PUT",
        headers:{
            "Authorization":"Bearer "+localStorage.getItem("access_token")
        },
        body: JSON.stringify({
            "uris": [uri]
        })
    }
    const body = await fetch(url, payload)
    if(!body.ok){
        console.error("Error couldnt play song")
    }
}
