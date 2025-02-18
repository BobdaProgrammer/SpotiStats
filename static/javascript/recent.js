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
        let template = `<div class="recentTrack"><img class="recentCover" src="${image}"><div class="currentTrack"><h3>${name}</h3><h4>${artist}</h4><h4>Popularity: ${popularity}/100</h4></div></div>`
        document.querySelector(".recents").innerHTML+=template
    }
}
