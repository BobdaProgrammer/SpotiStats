package main

import (
    "errors"
    "net/http"
    "os"
    "io"
    "html/template"
    "fmt"
    "github.com/labstack/echo/v4"
    "github.com/markbates/goth"
    "github.com/markbates/goth/gothic"
    "context"
    "github.com/markbates/goth/providers/spotify"
    "github.com/labstack/echo-contrib/session"
    //"github.com/labstack/echo/v4/middleware"
    "log/slog"
    "net/url"
    "github.com/joho/godotenv"
    "github.com/gorilla/sessions"
)

type Template struct{
    templates *template.Template
}

func (t *Template) Render(writer io.Writer, name string, data interface{}, c echo.Context) error{
    return t.templates.ExecuteTemplate(writer, name, data)
}

func main(){
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        slog.Error("Error loading .env file", "error", err)
    }
    fmt.Println(os.Getenv("SESSION_SECRET"))
    store := sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))
    gothic.Store = store

    e := echo.New()
    e.Use(
        session.Middleware(store),
    )

    e.HTTPErrorHandler = func(err error, c echo.Context) {
        code := http.StatusInternalServerError
        if he, ok := err.(*echo.HTTPError); ok{
            code = he.Code
        }

        if code == http.StatusNotFound{
            c.Render(http.StatusOK, "404.html", nil)
            return
        }
    }

    e.Static("/static", "static")

    t := &Template{
        templates: template.Must(template.ParseGlob("template/*.html")), // Load all HTML files from /template
    }
    e.Renderer = t

    CLIENT_ID := os.Getenv("CLIENT_ID")
    CLIENT_SECRET := os.Getenv("CLIENT_SECRET")


    goth.UseProviders(
        spotify.New(CLIENT_ID, CLIENT_SECRET, "http://localhost:8080/auth/spotify/callback", "user-read-currently-playing", "user-modify-playback-state", "user-read-playback-state", "user-top-read"),
    )

    e.GET("/refreshToken", func(c echo.Context) error{
        refreshToken := c.FormValue("refresh_token")
        if refreshToken == "" {
            return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing refresh_token"})
        }

        // Make the POST request to Spotify
        resp, err := http.PostForm("https://accounts.spotify.com/api/token", url.Values{
        "grant_type":    {"refresh_token"},
        "refresh_token": {refreshToken},
        "client_id":     {CLIENT_ID},
        "client_secret": {CLIENT_SECRET},
    })
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to send request"})
    }
    defer resp.Body.Close()

    // Stream Spotify's response directly to the client
    return c.Stream(resp.StatusCode, "application/json", resp.Body)

})

e.GET("/", func(c echo.Context) error{
    return c.Render(http.StatusOK, "home.html", nil)
})

e.GET("/playing", func(c echo.Context) error{
    return c.Render(http.StatusOK, "player.html", nil)
})

e.GET("/stats", func(c echo.Context) error{
    return c.Render(http.StatusOK, "stats.html", nil) 
})

e.GET("/auth/:provider", func(c echo.Context) error{
    ctx := context.WithValue(c.Request().Context(), gothic.ProviderParamKey, c.Param("provider"))

    // try to get the user without re-authenticating
    gothUser, err := gothic.CompleteUserAuth(c.Response(), c.Request().WithContext(ctx))
    if err == nil{
        err := c.Redirect(http.StatusSeeOther, "/playing?access_token="+gothUser.AccessToken+"&refresh_token="+gothUser.RefreshToken+"&client_id="+os.Getenv("CLIENT_ID")) 
        slog.Error("couldnt redirect", "error", err)
        return err
    }

    gothic.BeginAuthHandler(c.Response(), c.Request().WithContext(ctx))

    return nil
})

e.GET("/auth/:provider/callback", func(c echo.Context) error{
    ctx := context.WithValue(c.Request().Context(), gothic.ProviderParamKey, c.Param("provider"))

    user, err := gothic.CompleteUserAuth(c.Response(), c.Request().WithContext(ctx))
    if err != nil{
        slog.Error("couldn't complete user auth","error", err)
        return c.String(http.StatusInternalServerError, "Something went wrong! :(")
    }

    err = c.Redirect(http.StatusSeeOther, "/playing?access_token="+user.AccessToken+"&refresh_token="+user.RefreshToken+"&client_id="+os.Getenv("CLIENT_ID")) 
    slog.Error("couldnt redirect", "error", err)
    return err
})


// Start server
if err := e.Start(":8080"); err != nil && !errors.Is(err, http.ErrServerClosed) {
    slog.Error("failed to start server", "error", err)
}
}

