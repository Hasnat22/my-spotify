let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinuteSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./SVG/pause.svg";
    }

    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00-00:00";

    let songUL = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear current list
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img src="./SVG/music.svg" alt="" class="invert">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Hasnat</div>
                </div>
                <div class="play-now">
                    <span>Play Now</span>
                    <img class="invert" src="./SVG/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach an event listener to each song in the new list
    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            if (!isScrolling) {
                let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
                playMusic(track);
            }
        });
    });
};

// Touch scroll handling
let isScrolling = false;

document.addEventListener("touchstart", (e) => {
    isScrolling = false;
});

document.addEventListener("touchmove", (e) => {
    isScrolling = true;
});

// Improve play/pause button responsiveness for mobile
const handlePlayPause = () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "./SVG/pause.svg";
    } else {
        currentSong.pause();
        play.src = "./SVG/play.svg";
    }
};

async function main() {
    songs = await getSongs("Songs/happy");
    playMusic(songs[0], true);

    // Use both click and touchstart for better mobile support
    play.addEventListener("click", handlePlayPause);
    play.addEventListener("touchstart", handlePlayPause);

    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".song-time").innerHTML = `00:00-${secondsToMinuteSeconds(currentSong.duration)}`;
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinuteSeconds(currentSong.currentTime)}-${secondsToMinuteSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Event listeners for card clicks
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.querySelector('.play-button').dataset.folder;
            if (folder) {
                songs = await getSongs(`Songs/${folder}`);
                console.log("Songs loaded for new album:", songs);
                
                // Only load the songs, don't play the first one automatically
                let songUL = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
                songUL.innerHTML = ""; // Clear current list
                for (const song of songs) {
                    songUL.innerHTML += `
                        <li>
                            <img src="./SVG/music.svg" alt="" class="invert">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Hasnat</div>
                            </div>
                            <div class="play-now">
                                <span>Play Now</span>
                                <img class="invert" src="./SVG/play.svg" alt="">
                            </div>
                        </li>`;
                }
                
                // Keep current song playing, only replace the song list
                Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach((e) => {
                    e.addEventListener("click", () => {
                        let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
                        playMusic(track);
                    });
                });
            } else {
                console.log("No folder found in dataset");
            }
        });
    });
}

main();
