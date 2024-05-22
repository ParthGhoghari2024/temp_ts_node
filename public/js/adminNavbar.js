//profile photo
let card = document.querySelector(".logout-navigate"); //declearing profile card element
let displayPicture = document.querySelector(".display-picture"); //declearing profile picture

displayPicture.addEventListener("click", function () {
  card.classList.toggle("hidden")
});

// document.addEventListener("click", (e) => {
//   if(!e.target.classList.contains("logout-navigate"))
//   {
//     card.classList.toggle("hidden");
//   }
// })


const displayTime = document.querySelector(".display-time");
function showTime() {
  let time = new Date();
  displayTime.innerText = time.toLocaleString({ hour12: true }).toUpperCase();
  setTimeout(showTime, 1000);
}



showTime();
const dateTimeConverter = (dateTimeString) => {
  const offset = new Date().getTimezoneOffset()
  dateTimeString = new Date(dateTimeString).getTime() - (offset * 60 * 1000)
  const timeString = new Date(dateTimeString).toLocaleTimeString()
  const dateString = new Date(dateTimeString).toLocaleDateString('fr-CA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return { timeString, dateString }
}




