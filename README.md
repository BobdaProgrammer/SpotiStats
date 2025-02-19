<div align="center">
  <h1>SpotiStats</h1>  
  <p>SpotiStats is the web app to bring your music experience to the next level. All you need to do is authenticate with spotify and you will shown SpotiStats, SpotiStats doesn't just give statistics for your spotify, you can control your currently playing, and soon even find nearby concerts based on your tastes</p>
</div>

## Current Progress
- [x] Currently playing
- [x] Queue
- [x] Statistics
- [x] Recently played
- [ ] Make playlist of top tracks over a time frame
- [ ] Share stats as image
- [ ] nearby concerts based on taste

## Project overview
### Backend
The backend is written in go and uses echo to host the webserver with goth for authentication with spotify, we then pass in the tokens to the client side, where the currently playing and everything else is handled with javascript
### Frontend
Simple HTML, CSS and JS, the js is handed the tokens from the backend and so almost everything is client side
