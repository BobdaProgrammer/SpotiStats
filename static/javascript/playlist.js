uris = []

async function PlaylistgetTopTracks(){
    const url = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50"
    const json = await normRequest(url, "GET", "get top tracks")
    let items = json.items
    for(let item of items){
        uris.push(item.uri)
    }
}


async function normRequest(url, method, errObj, Reqbody = null) {
    const payload = {
        method: method,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
            "Content-Type": "application/json" // Important for JSON requests
        },
    };
    
    if (Reqbody && method!="GET") {
        payload.body = JSON.stringify(Reqbody); // Ensure the body is a string
    }

    console.log(payload);

    try {
        const response = await fetch(url, payload);
        
        if (!response.ok) {
            console.error(`ERROR: Couldn't ${errObj} - ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Fetch failed: ${error.message}`);
        return null;
    }
}


document.addEventListener("DOMContentLoaded", function(){
    PlaylistgetTopTracks()
})

async function getUserId(){
    const url = "https://api.spotify.com/v1/me"
    const json = await normRequest(url, "GET", "get user id")
    return json.id
}

function toaster(text, show = true){
    let toaster = document.querySelector(".toaster")
    toaster.innerHTML = `<span>${text}</span>`
    toaster.style.display = show ? "inline": "none";
}

async function createPlaylist(){
    await getTopTracks()
    const UserId = await getUserId()

    const url = `https://api.spotify.com/v1/users/${UserId}/playlists`
    const body = {
        name: "Your top tracks!",
        description: "These are the tracks you have listened to the most in the last 4 weeks",
        public: false,
    }
    const json = await normRequest(url, "POST", "create playlist", body)
    
    const id = json.id

    const addTracksUrl = `https://api.spotify.com/v1/playlists/${id}/tracks`
    const Trackbody = {
        position: 0,
        uris: uris,
    }
    normRequest(addTracksUrl, "POST", "add tracks to playlist", Trackbody)
    toaster("created playlist!")
    setTimeout(toaster, 1000, "", false)
}
