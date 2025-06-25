// Countdown to next race (next Saturday)
function getNextRaceDate() {
  const today = new Date();
  const nextRace = new Date();
  nextRace.setDate(today.getDate() + (13 - today.getDay()) % 14); // Biweekly Saturday
  nextRace.setHours(12, 0, 0, 0); // Noon start
  return nextRace;
}

function updateCountdown() {
  const now = new Date();
  const raceDate = getNextRaceDate();
  const diff = raceDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById("countdown").textContent =
    `${days}d ${hours}h ${mins}m ${secs}s`;
}

setInterval(updateCountdown, 1000);

// Form logic
const form = document.getElementById("carForm");
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const driver = document.getElementById("driverName").value;
  const carClass = document.getElementById("classSelector").value;

  const match = `Driver ${driver}, your car is classed under '${carClass}'.\nRival match pending... stay tuned!`;

  document.getElementById("result").textContent = match;
  form.reset();
});
