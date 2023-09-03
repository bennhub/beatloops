  // Create an audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let source;
  const buffers = {};
  let isPlaying = false;
  let activeLoop = null;
  const playbackRates = {};
  const taps = [];
  let lastTapTime = 0;

  // Function to load audio from a URL and decode it
  function loadAudio(url, loopNumber) {
      const request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      request.onload = () => {
          audioContext.decodeAudioData(request.response, (decodedBuffer) => {
              buffers[loopNumber] = decodedBuffer;
              setInitialBpm(loopNumber);
          });
      };
      request.send();
  }

  // Set initial BPM values in the buttons
  function setInitialBpm(loopNumber) {
      const bpmElement = document.getElementById("bpm" + loopNumber);
      if (bpmElement) {
          bpmElement.innerText = trackInfoMap[loopNumber].bpm + "";
      }
  }

  // Function to play a loaded audio buffer
  function playBuffer(loopNumber) {
      const buffer = buffers[loopNumber];
      if (buffer) {
          if (source) {
              source.stop();
          }
          source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          source.connect(audioContext.destination);
          source.playbackRate.value = playbackRates[loopNumber] || 1;
          source.start(0);
          isPlaying = true;
          activeLoop = loopNumber;
      }
  }

  // Function to stop the currently playing buffer
  function stopBuffer() {
      if (source) {
          source.stop();
          isPlaying = false;
          activeLoop = null;
      }
  }

  // Function to toggle play/pause for a loop
  function togglePlay(loopNumber) {
      const buttonElement = document.getElementById("play-button" + loopNumber);
      const activeButtonElement = document.getElementById("play-button" + activeLoop);

      if (loopNumber === activeLoop) {
          stopBuffer();
          buttonElement.innerText = trackInfoMap[loopNumber].bpm + "";
          buttonElement.style.opacity = "1";
      } else {
          if (activeButtonElement) {
              activeButtonElement.innerText = trackInfoMap[activeLoop].bpm + "";
              activeButtonElement.style.opacity = "1";
          }
          playBuffer(loopNumber);
          buttonElement.innerHTML = "" + trackInfoMap[loopNumber].bpm + "";
          buttonElement.style.opacity = "0.5";
      }
  }

  // Function to change the playback rate of a loop
  function changePlaybackRate(loopNumber, rate) {
      playbackRates[loopNumber] = rate;
      if (activeLoop === loopNumber && source) {
          source.playbackRate.value = rate;
      }
  }

  // Define a BPM for each loop
  const trackInfoMap = {
      // B.Hayes bpm
      5: { bpm: 70 },
      6: { bpm: 75 },
      7: { bpm: 91 },
      8: { bpm: 75 },
      9: { bpm: 102 },
      10: { bpm: 103 },
      11: { bpm: 77 },
      // 89 Elements bpm
      12: { bpm: 91 },
      13: { bpm: 77 },
      14: { bpm: 68 },
  };

  // Load audio start //

  // Zoum loops
  loadAudio("audio/oxu_Les Notres (Bootleg by Zoum).mp3", 1);
  loadAudio("audio/eti_Dont Matter (Bootleg by Zoum).mp3", 2);
  loadAudio("audio/txl_Hymn (Bootleg by Zoum).mp3", 3);
  loadAudio("audio/bfo_Opium (Bootleg by Zoum).mp3", 4);
  // B.Hayes loops
  loadAudio("audio/beforeDawn2.mp3", 5);
  loadAudio("audio/loopTrap1.mp3", 6);
  loadAudio("audio/daysOfWonder2.mp3", 7);
  loadAudio("audio/drumsOnly.mp3", 8);
  loadAudio("audio/frontinFlip2.mp3", 9);
  loadAudio("audio/landsOfTheMist2.mp3", 10);
  loadAudio("audio/qwerty2.mp3", 11);
  // 89 elements loops
  loadAudio("audio/89 elements/byp_jeru-tha-damaja-999-pa-cent-instrumental.mp3", 12);
  loadAudio("audio/89 elements/gwa_schlass12.mp3", 13);
  loadAudio("audio/89 elements/jca_plusma-x-loopacca-tan.mp3", 14);
  // Pharaon loops
  loadAudio("audio/Pharaon looper/bpy_Loop2 - 97 bpm.mp3", 15);
  loadAudio("audio/Pharaon looper/fvg_Loop3 - 100 bpm.mp3", 16);
  loadAudio("audio/Pharaon looper/pxf_Loop4 - 90 bpm.mp3", 17);

  // Load Audio End //



  // Global Pitch Control
  const globalPitchControl = document.getElementById("global-pitch-control");

  function changeGlobalPitch(pitchValue) {
      for (let loopNumber = 1; loopNumber <= 17; loopNumber++) {
          changePlaybackRate(loopNumber, pitchValue);
      }
  }

  function resetGlobalPitch() {
      globalPitchControl.value = 1;
      changeGlobalPitch(1);
  }

  // Toggle Pitch Control
  const pitchControl = document.getElementById('global-pitch-control');
  const toggleBtn = document.getElementById('pitch-toggle');
  let isPitchEnabled = true;

  toggleBtn.addEventListener('click', () => {
      isPitchEnabled = !isPitchEnabled;

      if (isPitchEnabled) {
          pitchControl.disabled = false;
      } else {
          pitchControl.disabled = true;
      }

      toggleBtn.textContent = isPitchEnabled ? '[Lock Pitch]' : 'Unlock Pitch';
      toggleBtn.style.color = isPitchEnabled ? "rgb(222, 222, 222)" : "rgb(156, 45, 20)";
  });

  // Hide Pitch control on page load
  document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('.pitch-controls').style.display = 'none';
  });

  // BPM Button
  const tapButton = document.getElementById("tap-button");
  const bpmDisplay = document.getElementById("bpm-display");

  tapButton.addEventListener("click", function () {
      const currentTime = new Date().getTime();

      if (lastTapTime !== 0) {
          const timeDifference = currentTime - lastTapTime;
          const bpm = calculateBPM(timeDifference);

          if (!isNaN(bpm)) {
              taps.push(bpm);
              if (taps.length > 2) {
                  taps.shift();
              }

              const averageBPM = calculateAverageBPM();
              bpmDisplay.textContent = "BPM: " + averageBPM.toFixed(2);
          }
      }

      lastTapTime = currentTime;
  });

  function calculateBPM(timeDifference) {
      return 60000 / timeDifference;
  }

  function calculateAverageBPM() {
      const totalBPM = taps.reduce((sum, bpm) => sum + bpm, 0);
      return totalBPM / taps.length;
  }

  // Tabs Logic
  function switchTab(tabIndex) {

      // Hide all tabs
      const tabs = document.querySelectorAll(".tab");
      tabs.forEach((tab) => {
          tab.style.display = "none";
      });

      // Show the selected tab
      const selectedTab = document.querySelectorAll(".tab")[tabIndex];
      selectedTab.style.display = "block";

      // Scroll to tab on desktop
      selectedTab.scrollIntoView();

      // Check if it's a mobile resolution
      if (window.innerWidth <= 768) {
          // Scroll to the top of the selected tab
          selectedTab.scrollIntoView();
      }

      // Hide all labels
      const labels = document.querySelectorAll(".tabs label");
      labels.forEach((label) => {
          label.style.display = "none";
      });

      // Show selected label
      const selectedLabel = labels[tabIndex];
      selectedLabel.style.display = "block";

      if (selectedTab) {
          document.querySelector('.pitch-controls').style.display = 'block';
      } else {
          document.querySelector('.pitch-controls').style.display = 'none';
      }
  }

  // Back button load
  document.getElementById("go-to-loop-selector").addEventListener("click", function () {
      // Scroll to the element with id "loops-title"
      const loopsTitle = document.getElementById("loops-title");
      loopsTitle.scrollIntoView({ behavior: "smooth" });

      // Refresh the page after a short delay (e.g., 500 milliseconds)
      setTimeout(function () {
          window.location.reload();
      }, 500);
  });

  // Back Button Logic
  const backBtn = document.getElementById("back-btn");

  backBtn.addEventListener("click", function () {
      // Hide tabs
      const tabs = document.querySelectorAll(".tab");
      tabs.forEach((tab) => {
          tab.style.display = "none";
      });

      // Hide pitch control
      document.querySelector('.pitch-controls').style.display = 'none';

      // Show labels
      const labels = document.querySelectorAll(".tabs label");
      labels.forEach((label) => {
          label.style.display = "block";
      });
  });

  // Modal Logic
  const modal = document.getElementById('modal');
  const btn = document.getElementById("float-btn");
  const close = document.getElementsByClassName("close")[0];

  // Function to open the modal
  function openModal() {
      modal.style.display = "block";
  }

  // Function to close the modal
  close.onclick = function () {
      modal.style.display = "none";
  }

  // Function to close the modal when clicking outside
  window.onclick = function (event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
// Modal Logic End