let isBodyClicked = false;
const socket = io();
let notifications = [];
let notificationsCount;
document.getElementById("notification-description").style.display = "none";

socket.emit("send notifications", 1);

socket.on("notifications", (obj) => {
  notifications = obj;
  document.getElementById("notificationsCount").innerHTML = notifications.length
});

// socket.on("notificationsCount", (obj) => {
//   notificationsCount = obj[0].notifications;
//   console.log(notificationsCount);
//   document.getElementById("notificationsCount").innerHTML = notificationsCount;
// });

document.getElementById("closeButton").addEventListener("click", function () {
  document.getElementById("notification-description").style.display = "none";
});

document.getElementById("notification").onclick = async () => {
  document.getElementById("notification-description").style.display = "block";
  // let notifications = await fetch("/exam/examnotifications", {
  //   method: "get",
  //   headers: { "Content-Type": "application/json" },
  // });
  // console.log(notifications)
  // let response = await notifications.json();
  //   notifications = response.message;
  if (isBodyClicked === false){
    if (notifications.length == 0){
      document.getElementById("empty-notifications").style.display = "block";
      document.getElementById("empty-notifications").innerHTML ="No Notifications Found";
    } else {
      document.getElementById("empty-notifications").innerHTML ="Upcoming Exams";
      let ul = document.getElementById("ul");
      document.getElementById("notification-description").appendChild(ul);
      notifications.forEach((element) => {
        const timeString = dateTimeConverter(element.start_time);
        let li = document.createElement("li");
        li.innerHTML =
          element.title.charAt(0).toUpperCase() +
          element.title.slice(1) +
          " will Start at : " +
          timeString.timeString;
        li.style.width = "100%";
        li.style.textAlign = "center";
        li.style.color = "#002f4b";
        ul.appendChild(li);
      });
    }
    isBodyClicked = true;
  }
};

const dateTimeConverter = (dateTimeString) => {
  const offset = new Date().getTimezoneOffset()
  dateTimeString = new Date(dateTimeString).getTime() - (offset * 60 * 1000)
  const timeString = new Date(dateTimeString).toLocaleTimeString()
  const dateString = new Date(dateTimeString).toLocaleDateString('fr-CA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return { timeString, dateString }
}
