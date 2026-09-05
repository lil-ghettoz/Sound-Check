const tracks = [
  { title: "Sino", file: "audio/Unique Salonga - Sino.mp3", length: "04:47" },
  { title: "Panaginip", file: "audio/Panaginip - nicole.mp3", length: "05:12" },
  { title: "2:17 AM", file: "audio/217-am.mp3", length: "--:--" },
  { title: "First Train Home", file: "audio/first-train-home.mp3", length: "--:--",},
];

const audio = document.querySelector("#audio");
const playBtn = document.querySelector("#play");
const seek = document.querySelector("#seek");
const current = document.querySelector("#current");
const total = document.querySelector("#total");
const durationLabel = document.querySelector("#duration");
const trackTitle = document.querySelector("#trackTitle");
const trackMeta = document.querySelector("#trackMeta");
const trackList = document.querySelector("#trackList");
const visualizer = document.querySelector("#visualizer");
const hint = document.querySelector("#playerHint");
let currentTrack = 0;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

function renderTracks() {
  trackList.innerHTML = tracks
    .map(
      (track, i) => `
    <li class="${i === currentTrack ? "active" : ""}" data-index="${i}">
      <span>${String(i + 1).padStart(2, "0")} &nbsp; ${track.title}</span>
      <span>${track.length}</span>
    </li>
  `,
    )
    .join("");
}

function loadTrack(index) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  audio.src = track.file;
  trackTitle.textContent = track.title;
  trackMeta.textContent = `After Midnight · ${String(currentTrack + 1).padStart(2, "0")}`;
  current.textContent = "0:00";
  total.textContent = "0:00";
  durationLabel.textContent = "--:--";
  seek.value = 0;
  renderTracks();
  hint.textContent =
    "Demo player — add matching MP3 files to the audio folder.";
}

function togglePlay() {
  if (!audio.src) loadTrack(currentTrack);
  if (audio.paused) {
    audio
      .play()
      .then(() => {
        playBtn.textContent = "Ⅱ";
        visualizer.classList.add("playing");
        hint.textContent = "Now playing.";
      })
      .catch(() => {
        hint.textContent =
          "No audio file found. Add an MP3 to the audio folder.";
      });
  } else {
    audio.pause();
  }
}

playBtn.addEventListener("click", togglePlay);
document.querySelector("#prev").addEventListener("click", () => {
  loadTrack(currentTrack - 1);
  togglePlay();
});
document.querySelector("#next").addEventListener("click", () => {
  loadTrack(currentTrack + 1);
  togglePlay();
});

trackList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const wasPlaying = !audio.paused;
  loadTrack(Number(li.dataset.index));
  if (wasPlaying) togglePlay();
});

audio.addEventListener("loadedmetadata", () => {
  total.textContent = formatTime(audio.duration);
  durationLabel.textContent = formatTime(audio.duration);
  tracks[currentTrack].length = formatTime(audio.duration);
  renderTracks();
});
audio.addEventListener("timeupdate", () => {
  current.textContent = formatTime(audio.currentTime);
  seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
});
audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
  visualizer.classList.remove("playing");
});
audio.addEventListener("play", () => {
  playBtn.textContent = "Ⅱ";
  visualizer.classList.add("playing");
});
audio.addEventListener("ended", () => {
  loadTrack(currentTrack + 1);
  audio.play().catch(() => {});
});

loadTrack(0);

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Mobile navigation
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
nav
  .querySelectorAll("a")
  .forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open")),
  );

// Subtle hero parallax
const heroTitle = document.querySelector(".hero-title");
window.addEventListener(
  "scroll",
  () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const y = Math.min(window.scrollY, 500);
    heroTitle.style.transform = `translateY(${y * 0.08}px)`;
  },
  { passive: true },
);

// Newsletter
const form = document.querySelector("#newsletterForm");
const email = document.querySelector("#email");
const formMessage = document.querySelector("#formMessage");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!email.validity.valid) {
    formMessage.textContent = "Enter a valid email address.";
    email.focus();
    return;
  }
  formMessage.textContent = "You're on the list. See you after midnight.";
  form.reset();
});
