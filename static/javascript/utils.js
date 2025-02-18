

export async function RefreshrefreshToken(clientId){
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: localStorage.getItem("refresh_token"),
        client_id: clientId
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    if(response.accessToken){
        let accessToken = response.accessToken;
        console.log("accessToken = "+accessToken)

        localStorage.setItem("access_token", accessToken)
    }
    if (response.refreshToken) {
        let refreshToken = response.refreshToken;
        localStorage.setItem("refresh_token", refreshToken)
    }
}
