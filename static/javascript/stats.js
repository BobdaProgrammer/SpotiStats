

document.addEventListener("DOMContentLoaded", function(){
    RefreshrefreshToken()
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

let albums = {}
let genres = {}

let topTracks = [];
let topArtists = [];
let topAlbums = [];

let timeFrame = "short_term"

document.getElementById("4weeks").addEventListener("click", () => {changeTimeFrame("short_term")})
document.getElementById("6months").addEventListener("click", ()=>{changeTimeFrame("medium_term")})
document.getElementById("1year").addEventListener("click", ()=>{changeTimeFrame("long_term")})

document.getElementById("tracksSelect").addEventListener("click", getTopTracks)
document.getElementById("artistsSelect").addEventListener("click", getTopArtists)
document.getElementById("albumsSelect").addEventListener("click", getTopAlbums)
document.getElementById("genresSelect").addEventListener("click", getTopGenres)

let timeButton = null;
let Button = null;

const Timebuttons = document.querySelectorAll(".selectorButtonTime");
const buttons = document.querySelectorAll(".selectorButton");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    // Remove "active" class from all buttons
    buttons.forEach(btn => btn.classList.remove("active"));

    // Add "active" class to clicked button
    button.classList.add("active");
    Button  = button
  });
});

Timebuttons.forEach(button => {
  button.addEventListener("click", () => {
    // Remove "active" class from all buttons
    Timebuttons.forEach(btn => btn.classList.remove("active"));

    // Add "active" class to clicked button
    button.classList.add("active");

    timeButton = button
  });
});

function changeTimeFrame(frame){
    timeFrame = frame
    albums = {}
    genres = {}
    topTracks = []
    topAlbums = []
    topArtists = []
    document.getElementById("statList").innerHTML="";
    buttons.forEach(button => { button.classList.remove("active") } )
    Timebuttons.forEach(button => { button.classList.remove("active") } )
}




async function getTopAlbums(){
    console.log(albums)
    if(Object.keys(albums).length==0){
        console.log("no albums yet")
        await getTopTracks(false)
    }
    if(topAlbums.length==0){
        const sortedAlbums = Object.fromEntries(
            Object.entries(albums).sort((a, b) => b[1] - a[1])
        );
        console.log(albums, sortedAlbums)
        for(let album in sortedAlbums){
            let parts = album.split("|")
             let template = `<div class="stat"><img src="${parts[1]}" class="statCover" crossorigin="anonymous"><div class="currentTrack"><h6 class="trackTitle">${parts[0]}</h6><h6 class="trackTitle">${parts[2]}</h6></div></div>`
            topAlbums.push(template)
        }
        document.getElementById("statList").innerHTML = topAlbums.join("")
        accentThemImages()
    }else{
        document.getElementById("statList").innerHTML = topAlbums.join("")
    }
}

async function getTopGenres(){
    if(Object.keys(genres).length==0){
        console.log("no genres yet")
        await getTopArtists(false)
    }
    document.getElementById("statList").innerHTML="<canvas id='genreChart' width='100%' height='50%'></canvas>"

        const labels = Object.keys(genres);
        const data = Object.values(genres); 
        console.log(data, genres)
        // Create the chart
        const ctx = document.getElementById('genreChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // Bar chart
            data: {
                labels: labels, // Genres as labels
                datasets: [{
                    label: 'Music Genre',
                    data: data, // Number of listens
                    backgroundColor: 'rgba(250, 235, 215, 0.2)', // Bar color
                    borderColor: 'rgba(250, 235, 215, 1)', // Border color
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Ensure Y-axis starts at 0
                    }
                }
            }
        });
}

async function getTopTracks(display = true){
    if(topTracks.length==0){
        const url = "https://api.spotify.com/v1/me/top/tracks?time_range="+timeFrame+"&limit=50&offset=0" 
        let json = await normRequest(url, "GET", "get top tracks")
        if(json!=null){
            console.log(json)
            createTracks(json.items, display)
        }
    }else{
        document.getElementById("statList").innerHTML = topTracks.join("")
        getCardsready()
    }
}

async function getTopArtists(display = true){
    if(topArtists.length==0){
        const url = "https://api.spotify.com/v1/me/top/artists?time_range="+timeFrame+"&limit=50&offset=0" 
        let json = await normRequest(url, "GET", "get top artists")
        if(json!=null){
            console.log(json)
            createArtists(json.items, display)
        }
    }else{
        document.getElementById("statList").innerHTML = topArtists.join("")
        getCardsready()
    }
}

function accentThemImages(){
        document.querySelectorAll(".statCover").forEach(img => {
            img.addEventListener("mouseover", function(event){
                let img = event.target;

                const fac = new FastAverageColor();

                fac.getColorAsync(img).then(color => {
                        img.style.boxShadow = `3px 3px 3px ${color.rgba}`;
                });
            });
            img.addEventListener("mouseleave", function(event){
                event.target.style.boxShadow = "none";
            })
        });
}

function createTracks(items, display){
    for(let item of items){
        let name = item.name
        let image = item.album.images[0].url
        let artist = item.artists[0].name
        let popularity = item.popularity
        let length = Math.round(item.duration_ms / 1000)
        let seconds = length % 60
        let minutes = Math.floor(length/60).toString()+":"+(seconds<10? `0${seconds}`:seconds.toString())
        console.log(minutes)
        let template = `<div class="stat"><img src="${image}" class="statCover" crossorigin="anonymous"><div class="currentTrack"><h6 class="trackTitle">${name}</h6><h6 class="trackTitle">${artist}</h6></div><div class="hidden" id="extraInfo">${popularity}|${minutes}</div></div>`
        //console.log(template)
        topTracks.push(template)

        if(item.album.album_type=="album"){
            albums[item.album.name+"|"+image+"|"+artist]+=1
        }
    }
    if(display){
        console.log(topTracks.join(""))
        document.getElementById("statList").innerHTML = topTracks.join("")
        accentThemImages()
        getCardsready()
    }
}

const closeSVG = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 26 26" fill="antiqueWhite">
<path d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"></path>
</svg>`

function getCardsready(artist=false){
    document.querySelectorAll(".stat").forEach(stat =>{
        stat.addEventListener("click", function(){
            let children = stat.children
            let imageUrl = children[0].src
            console.log(imageUrl)
            let name = children[1].children[0].textContent
            console.log(name)
            if(!artist){
                let artist = children[1].children[1].textContent
                console.log(artist)
                let parts = children[2].textContent.split("|")
                let popularity=parts[0] 
                let duration = parts[1]

                console.log(popularity)
                let template = `<img src="${imageUrl}"><div class="currentTrack"><h3 class="trackTitle">${name}</h3><h3 class="trackTitle">${artist}</h3><h3 class="trackTitle">Popularity: ${popularity}/100</h3><h3 class="trackTitle">Duration: ${duration}</h3><button class="close" onclick="document.querySelector('.pageTaker').style.display='none'">${closeSVG}</button></div>`
                showCard(template)
            }else{
                let popularity = children[1].children[1].textContent.split(": ")[1].split("/")[0]
                
                let followers = children[2].textContent
                let reverse = followers.split("").reverse().join("")
                let res = ""
                for(let i = 0; i < reverse.length; i ++){
                    if(i%3==0&&i!=0){
                        res+=","
                    }
                    res+=reverse[i]
                }
                res = res.split("").reverse().join("")

                let template = `<img src="${imageUrl}"><div class="currentTrack"><h3 class="trackTitle">${name}</h3><h3 class="trackTitle">Popularity: ${popularity}/100</h3><h3 class="trackTitle">Followers: ${res}</h3><button class="close" onclick="document.querySelector('.pageTaker').style.display='none'">${closeSVG}</button></div>`
                showCard(template)
            }

        })
    })
}


function showCard(inner){
    let card = document.getElementById("infoCard")
    card.innerHTML = inner
    document.querySelector(".pageTaker").style.display="flex";
}



function createArtists(items, display){
    for(let item of items){
        let name = item.name
        let image = item.images[0].url
        let popularity = item.popularity
        let followers = item.followers.total
        let template = `<div class="stat"><img src="${image}" class="statCover"crossorigin="anonymous"><div class="currentTrack"><h6 class="trackTitle">${name}</h6><h6 class="trackTitle">popularity: ${popularity}/100</h6></div><div class="hidden" id="extraInfo">${followers}</div></div>`
        //console.log(template)
        topArtists.push(template)

        if(item.genres.length>0){
            for(let genre of item.genres){
                console.log(genres[genre], genre)
                if(genres[genre]!=undefined){
                    genres[genre]+=1
                }else{
                    genres[genre]=1
                }
            }
        }
    }
    if(display){
        document.getElementById("statList").innerHTML = topArtists.join("")
        accentThemImages()
        getCardsready(true)
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
