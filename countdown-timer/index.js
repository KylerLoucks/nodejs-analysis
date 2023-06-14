const countTime = 5;
const countDate = new Date().getTime() + (countTime + 1) * 1000;
console.log(countDate)
let timerId;

const countdown = () => {
  const now = new Date().getTime();
  
  // Check if the countdown has finished
  if (now >= countDate) {
    console.log('Countdown finished!');
    clearInterval(timerId)
    return;
  }

  const diff = countDate - now;

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const m = Math.floor((diff % hour) / minute);
  const s = Math.floor((diff % minute) / second);
  const h = Math.floor((diff % day) / hour);
  const d = Math.floor((diff / day));

  console.log(`${d} : ${h < 10 ? '0' + h : h} : ${m < 10 ? '0' + m : m} : ${s < 10 ? '0' + s : s }`);
};
// Start the countdown timer interval
timerId = setInterval(countdown, 1000);
