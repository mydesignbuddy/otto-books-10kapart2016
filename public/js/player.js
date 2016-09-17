function renderPlayer(){
    var playerTemplate = document.getElementById('player-template').innerText;
    document.getElementById('player').innerHTML = playerTemplate;
}
function initPlayer(){
    // Check for audio element support.
    if (window.HTMLAudioElement) {
        try {
            renderPlayer();
            var a = document.createElement("AUDIO");
            var tracks = document.getElementsByClassName('track');
            var detectSupport = {
                hasMP3Support: (a.canPlayType('audio/mpeg')=="probably"||a.canPlayType('audio/mpeg')=="maybe"),
                hasOGGSupport: (a.canPlayType('audio/ogg')=="probably"||a.canPlayType('audio/ogg')=="maybe")
            };
            if(detectSupport.hasMP3Support){
                switchTracks(tracks[0]);
            }

            function switchTracks(track){
                document.getElementById("current_track").innerText = track.innerText;
                for(var i=0; i<tracks.length; i++){
                    tracks[i].className = tracks[i].className.replace("active","");
                    tracks[i].parentNode.className = tracks[i].parentNode.className.replace("active","");
                }
                track.className += " active";
                track.parentNode.className += " active";
                a.src = track.getAttribute('href')
                a.play();
            }
            function bindings() {
                for(var i=0; i<tracks.length; i++){
                    tracks[i].onclick = function(e){
                        switchTracks(this);
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                }
                document.getElementById("playpause").onclick = function(){
                    if(a.paused){
                        a.play();
                    } else {
                        a.pause();
                    }
                };
                document.getElementById('stop').onclick = function(){
                    a.pause();
                    a.currentTime = 0;
                };

                document.getElementById('rewind').onclick = function(){
                    a.currentTime -= 15.0;
                };

                document.getElementById('fastforward').onclick = function(){
                    a.currentTime += 15.0;
                };

                document.getElementById('previous').onclick = function(){
                    var currentIndex = document.querySelector('.track.active').getAttribute('id').replace("track_", "")-1;

                    if(!currentIndex<=0){
                        switchTracks(document.getElementsByClassName('track')[currentIndex-1]);
                    } else {
                        // if on the end just reset the time
                        a.currentTime = 0;
                    }
                };

                document.getElementById('next').onclick = function(){
                    var currentIndex = document.querySelector('.track.active').getAttribute('id').replace("track_", "")-1;

                    if(currentIndex+1<=(tracks.length-1)){
                        switchTracks(document.getElementsByClassName('track')[currentIndex+1]);
                    } else {
                        // if on the end just reset the time
                        a.currentTime = 0;
                    }
                };
            }

            function updateAudioPlayerDetails(){
                var currentTime = Math.round((a.currentTime/60) * 100) / 100;
                var duration = Math.round((a.duration/60) * 100) / 100;
                var progression = (currentTime / duration) * 100;
                document.getElementById('current_time').innerText = currentTime;
                document.getElementById('duration').innerText = duration;
                document.querySelector('#slider .progress').style.width = progression+"%";
                if(a.paused){
                    document.getElementById("playpause").className = "play";
                } else {
                    document.getElementById("playpause").className = "";
                }
            }

            bindings();
            setInterval(function(){
                updateAudioPlayerDetails();
            }, 100);
        }
        catch (e) {
            // Fail silently but show in F12 developer tools console
            if(window.console && console.error("Error:" + e));
        }
    }
}
window.onload = function(){
    renderPlayer();
    initPlayer();
}
