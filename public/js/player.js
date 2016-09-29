function gid (elem) { return document.getElementById(elem); }
function qs(elem) { return document.querySelector(elem); }
function qsa(elem) { return document.querySelectorAll(elem); }

function renderPlayer() {
  var trackContent = gid('track-list').innerHTML;
  gid('player-track-list-container').innerHTML = '<ol id="player-track-list" class="list-menu">' + trackContent + "</ol>";
  gid('track-list').style.display = "none";
  //lazy load CSS
  var fileref = document.createElement("link");
  fileref.setAttribute("rel", "stylesheet");
  fileref.setAttribute("type", "text/css");
  fileref.setAttribute("href", "/css/player.min.css");
  document.getElementsByTagName("head")[0].appendChild(fileref);
}
function initPlayer() {
  // Check for audio element support.
  if (window.HTMLAudioElement) {
    try {
      renderPlayer();
      var a = document.createElement("AUDIO");
      var tracks = qsa('#player-track-list .track');
      var detectSupport = {
        hasMP3Support: (a.canPlayType('audio/mpeg') == "probably" || a.canPlayType('audio/mpeg') == "maybe"),
        hasOGGSupport: (a.canPlayType('audio/ogg') == "probably" || a.canPlayType('audio/ogg') == "maybe")
      };

      function switchTracks(track, callback) {
        gid("current_track").innerHTML = track.innerText + " - " + window.bookTitle;
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].className = tracks[i].className.replace("active", "");
          tracks[i].parentNode.className = tracks[i].parentNode.className.replace("active", "");
        }
        track.className += " active";
        track.parentNode.className += " active";
        a.src = track.getAttribute('href')
        a.play();
        if (callback) {
          callback();
        }
      }

      if (detectSupport.hasMP3Support) {
        switchTracks(tracks[0], function () {
          //plays the next rack when this one ends
          a.addEventListener("ended", function () {
            goToNextTrack();
          });
        });
      }



      function goToPreviousTrack() {
        var currentIndex = qs('#player-track-list .track.active').getAttribute('id').replace("track_", "") - 1;

        if (!currentIndex <= 0) {
          switchTracks(qsa('#player-track-list .track')[currentIndex - 1]);
        } else {
          // if on the end just reset the time
          a.currentTime = 0;
        }
      };
      function goToNextTrack() {
        var currentIndex = qs('#player-track-list .track.active').getAttribute('id').replace("track_", "") - 1;

        if (currentIndex + 1 <= (tracks.length - 1)) {
          switchTracks(qsa('#player-track-list .track')[currentIndex + 1]);
        } else {
          // if on the end just reset the time
          a.currentTime = 0;
        }
      };

      function bindings() {
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].onclick = function (e) {
            switchTracks(this);
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
          }
        }
        gid('toggle-button').onclick = function () {
          if (qs('.player.player-open') != null) {
            qs('.player').className = "player animated";
            gid('toggle-button').innerHTML = "&#9650; Tracks &#9650;";
          } else {
            qs('.player').className = "player animated player-open";
            gid('toggle-button').innerHTML = "&#9660; Tracks &#9660;";
          }
        };

        gid("playpause").onclick = function () {
          if (a.paused) {
            a.play();
          } else {
            a.pause();
          }
        };
        gid('stop').onclick = function () {
          a.pause();
          a.currentTime = 0;
        };

        gid('rewind').onclick = function () {
          a.currentTime -= 15.0;
        };

        gid('fastforward').onclick = function () {
          a.currentTime += 15.0;
        };

        gid('previous').onclick = goToPreviousTrack;


        gid('next').onclick = goToNextTrack;

      }

      function updateAudioPlayerDetails() {

        var currentTime = Math.round((a.currentTime / 60) * 100) / 100;
        var duration = Math.round((a.duration / 60) * 100) / 100;
        var progression = (currentTime / duration) * 100;

       try{
          var currentTimeArr = (Math.round((a.currentTime / 60) * 100) / 100).toString().split(".");
          var currentTimeFormatted = "";
          currentTimeFormatted += (currentTimeArr[0].length < 2) ? "0" + currentTimeArr[0] : currentTimeArr[0];
          currentTimeFormatted += ":";
          currentTimeFormatted += (currentTimeArr[1].length < 2) ? currentTimeArr[1] + "0" : currentTimeArr[1]

         var durationTimeArr = (Math.round((a.duration / 60) * 100) / 100).toString().split(".");
          var durationTimeFormatted = "";
          durationTimeFormatted += (durationTimeArr[0].length < 2) ? "0" + durationTimeArr[0] : durationTimeArr[0];
          durationTimeFormatted += ":";
          durationTimeFormatted += (durationTimeArr[1].length < 2) ? durationTimeArr[1] + "0" : durationTimeArr[1]
          //console.log(currentTimeFormatted + " -- " + durationTimeFormatted)
          gid('current_time').innerHTML = currentTimeFormatted;
          gid('duration').innerHTML = durationTimeFormatted;
          qs('#slider .progress').style.width = progression + "%";
        } catch(e) {}

        if (a.paused) {
          gid("playpause").className = "play";
        } else {
          gid("playpause").className = "";
        }
      }

      bindings();
      setInterval(function () {
        updateAudioPlayerDetails();
      }, 100);
    }
    catch (e) {
      // Fail silently but show in F12 developer tools console
      if (window.console && console.error("Error:" + e));
    }
  }
}
window.onload = function () {
  renderPlayer();
  initPlayer();
}
