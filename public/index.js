function getCardIndex(card) {
    var c = card.parentNode.children,
      i = 0;
    for (; i < c.length; i++) if (c[i] == card) return i;
  }

function expandAlbumCard(album){
    let grid = document.getElementById("album-grid")
    console.log(getComputedStyle(grid).getPropertyValue("grid-template-columns"));
    let r = document.querySelector(':root');
    let rs = getComputedStyle(r);
    let widthString = rs.getPropertyValue('--width-album');
    let heightString = rs.getPropertyValue('--width-album');
    let card = document.getElementById(album.img)  
    console.log(getComputedStyle(card).getPropertyValue("grid-column-start"))
    if(album.isExpanded){
        card.style.gridColumn = `span 1`
        card.style.gridRow = `span 1`
        card.style.width = widthString;
        card.style.height = heightString;
    } else {
        card.style.gridColumn = `span 2`
        card.style.gridRow = `span 2`
        card.style.width = widthString.substring(0,widthString.length-2)*2 + "px";
        card.style.height = heightString.substring(0,heightString.length-2)*2 + "px";
    }
    album.isExpanded = !album.isExpanded
}

// fetch("https://1001albumsgenerator.com/api/v1/groups/companyx").then(response => {
//     return response.json()
// }).then(data => {
//     console.log(data)
//     let currentAlbum = data.getElementById("current-album")
//     currentAlbum.innerHTML = `
//         <h2>${data.currentAlbum.name}<h2>
//     `
// }).catch(err => {
//     console.err(err)
// })

fetch("/albums/").then(response => {
    return response.json()
}).then(data => {
    data.forEach(album => {
        album.isExpanded = false
        const cardContent = `
            <img src="/assets/${album.img}" alt="">
            <div class="album-info">
                <h2 class="album-title">${album.name}</h2>
                <h3 class="album-artist">${album.artist}</h3>
                <h4 class="album-year">${album.year}</h4>
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
    console.error("error"+ err)
})