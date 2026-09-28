const API_BASE_URL = "https://tsang-invitation-cards.onrender.com/api";

const INVITATION_DATA = {
  hostName: "Hoàng Giáp",
  title: "Đz PRO VIP SIÊU CẤP VÔ ĐỊCH VŨ TRỤ",
  degree: "Kĩ Sư Công Nghệ Thông Tin Hệ Đẳng Cấp 🥴",
  university: "Trường Đại học Công nghệ Đông Á",
  time: "13h – 16h, Thứ 7, ngày 03/10/2026",
  location: "Hội trường – Tầng 6 – Tòa nhà Việt Nam, Trường Đại học Công nghệ Đông Á",
  mapUrl: "https://maps.app.goo.gl/YwjxLEZrLsKVNkf97",
};

let attendanceStatus = "Tham dự";
let currentGuestName = "Bạn";
const music = document.getElementById("bg-music");
const musicIcon = document.getElementById("music-icon");
let isPlaying = false;

function parseGuestNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  let rawName = urlParams.get("to") || urlParams.get("name");
  if (!rawName) return "Bạn";

  try {
    rawName = decodeURIComponent(rawName);
  } catch (_) {
    // Giữ nguyên nếu tham số URL không hợp lệ.
  }

  rawName = rawName.replace(/-/g, " ").trim();
  return rawName || "Bạn";
}

function updateGuestNameUI(name) {
  [
    document.getElementById("guest-name-preview"),
    document.getElementById("guest-name"),
    document.getElementById("presence-guest-name"),
  ].forEach((element) => {
    if (element) element.innerText = name;
  });
}

function applyInvitationData() {
  const hostName = document.getElementById("host-name");
  const degree = document.getElementById("host-degree");
  const university = document.getElementById("host-university");
  const time = document.getElementById("event-time");
  const location = document.getElementById("event-location");
  const map = document.getElementById("event-map");

  if (hostName) {
    hostName.innerHTML = `${INVITATION_DATA.hostName}<br><span class="font-sans text-sm sm:text-base text-amber-400 font-bold tracking-normal">${INVITATION_DATA.title}</span>`;
  }
  if (degree) degree.innerText = INVITATION_DATA.degree;
  if (university) university.innerText = INVITATION_DATA.university;
  if (time) time.innerText = INVITATION_DATA.time;
  if (location) location.innerText = INVITATION_DATA.location;
  if (map) map.href = INVITATION_DATA.mapUrl;
}

window.addEventListener("DOMContentLoaded", () => {
  currentGuestName = parseGuestNameFromURL();
  updateGuestNameUI(currentGuestName);
  applyInvitationData();
});

function playMusic() {
  if (!music) return;
  music
    .play()
    .then(() => {
      isPlaying = true;
      if (musicIcon) {
        musicIcon.innerText = "🎵";
        musicIcon.classList.add("spin-music");
      }
    })
    .catch((e) => console.log("Autoplay blocked:", e));
}

function toggleMusic() {
  if (!music) return;
  if (isPlaying) {
    music.pause();
    isPlaying = false;
    if (musicIcon) {
      musicIcon.innerText = "🔇";
      musicIcon.classList.remove("spin-music");
    }
  } else {
    playMusic();
  }
}

function openInvitation() {
  const envelope = document.getElementById("envelope-screen");
  const invitation = document.getElementById("invitation-screen");

  if (envelope) envelope.classList.add("hidden");
  if (invitation) invitation.classList.remove("hidden");

  playMusic();
  if (typeof confetti === "function") {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }
}

function setAttendance(status) {
  attendanceStatus = status;
}

async function submitRSVP(event) {
  event.preventDefault();
  const wishesInput = document.getElementById("rsvp-wishes")?.value || "";
  const guestNameToSend = currentGuestName || parseGuestNameFromURL();

  try {
    const response = await fetch(`${API_BASE_URL}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: guestNameToSend,
        attendanceStatus,
        wishes: wishesInput,
      }),
    });

    const result = await response.json();
    if (result.success) {
      document.getElementById("rsvp-form")?.classList.add("hidden");
      document.getElementById("thank-you-msg")?.classList.remove("hidden");
      if (typeof confetti === "function") {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      }
    } else {
      alert("❌ Lỗi từ Server: " + (result.message || "Không thể gửi lời chúc."));
    }
  } catch (error) {
    console.error("❌ Lỗi kết nối Server:", error);
    alert("⚠️ Không kết nối được máy chủ. Vui lòng thử lại sau ít giây.");
  }
}

const trailEmojis = ["🎓", "✨", "📜", "🥳", "🔥", "⭐", "🎉"];

function spawnStickerAt(x, y) {
  const trailItem = document.createElement("div");
  trailItem.className = "mouse-trail-sticker";
  trailItem.innerText = trailEmojis[Math.floor(Math.random() * trailEmojis.length)];
  trailItem.style.left = `${x}px`;
  trailItem.style.top = `${y}px`;
  document.body.appendChild(trailItem);
  setTimeout(() => trailItem.remove(), 800);
}

let lastTouchX = 0;
let lastTouchY = 0;

window.addEventListener(
  "touchmove",
  (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    const dist = Math.hypot(touch.clientX - lastTouchX, touch.clientY - lastTouchY);
    if (dist > 25) {
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      spawnStickerAt(touch.clientX, touch.clientY);
    }
  },
  { passive: true },
);

window.addEventListener("click", (e) => {
  if (e.target.closest("#music-btn")) return;
  spawnStickerAt(e.clientX, e.clientY);
});

const cursorSticker = document.getElementById("cursor-sticker");
let mouseX = 0;
let mouseY = 0;
let stickerX = 0;
let stickerY = 0;

if (window.innerWidth > 768) {
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dist = Math.hypot(e.clientX - lastTouchX, e.clientY - lastTouchY);
    if (dist > 30) {
      lastTouchX = e.clientX;
      lastTouchY = e.clientY;
      spawnStickerAt(e.clientX, e.clientY);
    }
  });

  function animateStickerFollower() {
    stickerX += (mouseX - stickerX) * 0.12;
    stickerY += (mouseY - stickerY) * 0.12;
    const deltaX = mouseX - stickerX;
    const rotateAngle = Math.max(-25, Math.min(25, deltaX * 0.8));

    if (cursorSticker) {
      cursorSticker.style.transform = `translate3d(${stickerX + 15}px, ${stickerY + 15}px, 0) rotate(${rotateAngle}deg)`;
    }
    requestAnimationFrame(animateStickerFollower);
  }

  animateStickerFollower();

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const maxTilt = 4;
      const rotateX = (-y * maxTilt).toFixed(2);
      const rotateY = (x * maxTilt).toFixed(2);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });
}
