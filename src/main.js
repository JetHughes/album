function expandAlbumCard(album){
    console.log(album.isExpanded)
    let span = album.isExpanded? 1: 2;
    let card = document.getElementById(album.img)
    card.style.gridColumn = `span ${span}`
    card.style.gridRow = `span ${span}`
    album.isExpanded = !album.isExpanded
}

fetch("./albums.json").then(response => {
    return response.json()
}).then(data => {
    data.forEach(album => {
        album.isExpanded = false
        const cardContent = `
            <img src="./assets/${album.img}" alt="">
            <div class="album-info">
                <h2 class="album-title">title</h2>
                <h3 class="album-artist">artist</h3>
                <h4 class="album-year">year</h4>
            </div>`

        const card = document.createElement("div");
        card.className = "album-card"
        card.id = album.img
        card.addEventListener('click', e => {
            expandAlbumCard(album)
        })
        card.innerHTML = cardContent;
        document.getElementById("album-grid").appendChild(card)
    })
}).catch(err => {
    console.error(err)
})