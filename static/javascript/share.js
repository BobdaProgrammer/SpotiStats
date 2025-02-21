let tracks = []
let timeFrame = "short_term"
let artists = []
let TrackLimit = 3
let ArtistLimit = 3

document.addEventListener("DOMContentLoaded", async function(){
    await RefreshrefreshToken()
    await getTopTracks()
    await getTopArtists()
    createImage()
})


async function createImage(){
    const url = "https://api.spotify.com/v1/me"
    const json = await normRequest(url, "GET", "get profile")
    let username = json.display_name
    let profilePic = json.images[0].url
    let HTML = `<div class="whoFor"><span class="statLine">Stats for: <span class="highlight">${username}</span></span><img src="${profilePic}" class="profilePic" crossorigin="anonymous"></div><h3 class="imageTitle">Top Artists</h3><div class="line" style="margin-top: 0px;display:flex; gap: 20px; text-align: center; justify-content: center; align-items: stretch;">`
    for(let a=0; a<ArtistLimit; a++){
        let template = `<div class="artist"><img src="${artists[a].image}" class="imageImage" cross-origin="anonymous"><h4 class="imageCaption">${artists[a].name}</h4></div>`
        HTML+=template
    }
    HTML+=`</div><h3 class="imageTitle">Top Tracks</h3><div class="line" style="margin-top: 0px;display:flex; gap: 20px; text-align: center; justify-content: center; align-items: stretch;">`
    for(let t=0; t<TrackLimit; t++){
        let template = `<div class="track"><img src="${tracks[t].image}" class="imageImage" cross-origin="anonymous"><h4 class="imageCaption">${tracks[t].name}</h4></div>`
        HTML+=template
    }
    document.querySelector(".imagePreview").innerHTML = HTML+"</div>"

}

async function getImage(){
  domtoimage.toPng(document.querySelector(".imagePreview"), {
        quality: 1
  })
    .then(async function(dataUrl) {
        var img = new Image();
        img.src = dataUrl;

            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], "SpotiStats.png", { type: blob.type });
                console.log(file)

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: "SpotiStats",
                        text: "Spotify stats of last 4 weeks",
                    });
                    console.log("Shared successfully!");
                } else {
                    // Create a download link
                    var link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = 'SpotiStats.png';
                    link.click();
                    console.log("Sharing not supported for files.");
                }
            } catch (error) {
                // Create a download link
                var link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'SpotiStats.png';
                link.click();
            }

    })
    .catch(function(error) {
      console.error('oops, something went wrong!', error);
    });
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

async function getTopTracks(){
        const url = "https://api.spotify.com/v1/me/top/tracks?time_range="+timeFrame+"&limit=5&offset=0" 
        let json = await normRequest(url, "GET", "get top tracks")
        if(json!=null){
            createTracks(json.items)
        }
}

async function getTopArtists(){
        const url = "https://api.spotify.com/v1/me/top/artists?time_range="+timeFrame+"&limit=5&offset=0" 
        let json = await normRequest(url, "GET", "get top artists")
        if(json!=null){
            createArtists(json.items)
        }
}

function createArtists(items){
    for(let item of items){
        let name = item.name
        let image = item.images[0].url

        const artist ={
            "name":name,
            "image":image,
        }

        artists.push(artist)
    }
}

function createTracks(items){
    for(let item of items){
        let name = item.name
        let image = item.album.images[0].url

        const track = {
            "name": name,
            "image": image
        }

        tracks.push(track)
    }
}

async function normRequest(url, method, errObj){
    const payload = {
        method: method,
        headers : {
            "Authorization": "Bearer "+localStorage.getItem("access_token")
        }
    }
    const body = await fetch(url, payload)

    if(!body.ok){
        console.log("ERROR: Couldn't "+errObj)
    }
    const json = await body.json()  
    return json
}
