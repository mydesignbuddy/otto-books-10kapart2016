function renderPlayer() {
  document.getElementById('player').innerHTML = document.getElementById('player-template').innerText;
  document.getElementById('player-track-list').innerHTML = '<ol id="player-track-list" class="list-menu">' + document.getElementById('track-list').innerHTML + "</ol>";
  document.getElementById('track-list').style.display = "none";
}
function initPlayer() {
  // Check for audio element support.
  if (window.HTMLAudioElement) {
    try {
      renderPlayer();
      var a = document.createElement("AUDIO");
      var tracks = document.querySelectorAll('#player-track-list .track');
      var detectSupport = {
        hasMP3Support: (a.canPlayType('audio/mpeg') == "probably" || a.canPlayType('audio/mpeg') == "maybe"),
        hasOGGSupport: (a.canPlayType('audio/ogg') == "probably" || a.canPlayType('audio/ogg') == "maybe")
      };
      if (detectSupport.hasMP3Support) {
        switchTracks(tracks[0], function () {
          //plays the next rack when this one ends
          a.addEventListener("ended", function () {
            goToNextTrack();
          });
        });
      }

      function switchTracks(track, callback) {
        document.getElementById("current_track").innerText = track.innerText + " - " + window.bookTitle;
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

      function goToPreviousTrack() {
        var currentIndex = document.querySelector('#player-track-list .track.active').getAttribute('id').replace("track_", "") - 1;

        if (!currentIndex <= 0) {
          switchTracks(document.querySelectorAll('#player-track-list .track')[currentIndex - 1]);
        } else {
          // if on the end just reset the time
          a.currentTime = 0;
        }
      };
      function goToNextTrack() {
        var currentIndex = document.querySelector('#player-track-list .track.active').getAttribute('id').replace("track_", "") - 1;

        if (currentIndex + 1 <= (tracks.length - 1)) {
          switchTracks(document.querySelectorAll('#player-track-list .track')[currentIndex + 1]);
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
        document.getElementById('toggle-button').onclick = function () {
          if (document.querySelector('.player.player-open') != null) {
            document.querySelector('.player').className = "player";
            document.getElementById('toggle-button').innerHTML = "&#9650; Tracks &#9650;";
          } else {
            document.querySelector('.player').className = "player player-open";
            document.getElementById('toggle-button').innerHTML = "&#9660; Tracks &#9660;";
          }
        };

        document.getElementById("playpause").onclick = function () {
          if (a.paused) {
            a.play();
          } else {
            a.pause();
          }
        };
        document.getElementById('stop').onclick = function () {
          a.pause();
          a.currentTime = 0;
        };

        document.getElementById('rewind').onclick = function () {
          a.currentTime -= 15.0;
        };

        document.getElementById('fastforward').onclick = function () {
          a.currentTime += 15.0;
        };

        document.getElementById('previous').onclick = goToPreviousTrack;


        document.getElementById('next').onclick = goToNextTrack;

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

          document.getElementById('current_time').innerText = currentTimeFormatted;
          document.getElementById('duration').innerText = durationTimeFormatted;
          document.querySelector('#slider .progress').style.width = progression + "%";
        } catch(e) {}

        if (a.paused) {
          document.getElementById("playpause").className = "play";
        } else {
          document.getElementById("playpause").className = "";
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
