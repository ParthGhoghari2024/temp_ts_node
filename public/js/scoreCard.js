const href = window.location.href;

function setProgress(setValue) {
  const style = document.createElement("style");
  let user = navigator.userAgent;
  // console.log(user);
  if (user.match("Firefox")) {
    // alert("the percentage chart is only compitible with chromium based browser! \nPlease Open It Chrome for better results");
    const marksChart = document.querySelector(".marks");
    marksChart.remove();
    createDonutCharForPercent(setValue);
  } else {
    const donutCanvas = document.querySelector("#myChartDonut");
    donutCanvas.remove();

  }
  document.head.appendChild(style);
  const sheet = style.sheet;
  sheet.insertRule(`@keyframes progress { to { --progress-value : ${setValue}; } }`, 0);
}
async function fetchData() {
  try {

    const response = await fetch(`/user/getScores?examid=${href.split("=")[1]}`);
    // console.log(`/user/getScores?examid=${href.split("=")[1]}`);
    const data = await response.json();
    // console.log(data);
    if(data.success){
      const dt = data.result[0];
      const duration=timeConverter(dt.duration_minute)
    
      document.getElementById("fname").innerHTML = dt.fname;
      document.getElementById("lname").innerHTML = dt.lname;
      document.getElementById("title").innerHTML = dt.title;
      document.getElementById("exam_date").innerHTML = dt.exam_date;
      document.getElementById("duration_minute").innerHTML = `${duration.hours}:${duration.minute}:${duration.sec}`;
      document.getElementById("exam_id").innerHTML = "examss" + dt.exam_id;
      document.getElementById("total_marks").innerHTML = dt.total_marks;
      document.getElementById("marks").innerHTML = dt.marks;
      document.getElementById("setImage").src = "/user/profileImage";

      if (dt.passing_marks <= dt.marks) {
        document.getElementById("status").innerHTML = "PASS"
      } else {
        document.getElementById("status").innerHTML = "FAIL"
        document.getElementById("status").style.color = "red"
      }

      const percetange = (dt.marks * 100) / dt.total_marks;
      setProgress(percetange, dt.total_marks);
      pieCharScores(data.result2);

      createScoreTable(data.result, data.result2, data.result3);
    } else {
      const main = document.querySelector(".examDatail");
      const download = document.querySelector("#download");
      main.innerHTML = data.message;
      main.style.color = "red";
      main.style.fontSize = "26px";
      main.style.margin = "20%";
      download.removeEventListener("click", generateScoreCardPDF);
      download.style.color = "red";
    }


  } catch (error) {
    console.log(error)
  }
}

fetchData();

document.getElementById("download").addEventListener("click", generateScoreCardPDF);

function generateScoreCardPDF() {
  window.location = `/user/generateScoreCardPDF?examid=${href.split("=")[1]}`
}


document.getElementById("advanced").addEventListener("click", showAnswerKeys);
async function showAnswerKeys() {
  const url = `/user/getAnswerKey?examid=${href.split("/:")[1]}`
  const response = await fetch(url);
  const data = await response.json();
  // console.log(data);
}


// for char 
function pieCharScores(resultData) {
  // console.log(resultData);
  const xValues = Array();
  const yValues = [];
  const barColors = [
    "#03045e",
    "#0077b6",
    "#00b4d8",
    "#90e0ef",
    "#caf0f8",
    "#daf0f8",
    "#de0ff9"
  ];
  // console.log(Array.isArray( xValues));
  resultData.forEach((data, i) => {
    xValues[i] = data.topic;
    yValues[i] = data.score;
  });

  new Chart("myChart", {
    type: "pie",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      title: {
        display: 0,
        text: "World Wide Wine Production 2018"
      }
    }
  });
}




function createScoreTable(result, result1, result2) {
  const tbody = document.querySelector("#scoreTableBody");
  let counter = 0;
  let html = "";
  const topicID = [];
  result2.forEach((data, i) => {
    counter++;
    topicID.push(data.topic_id)
    html += `<tr><td>${counter}</td><td>${data.topic}</td><td id="s${data.topic_id}">${0}</td><td>${data.total}</td></tr>`;
  })



  tbody.innerHTML = html
  result1.forEach((data, i) => {
    topicID.forEach((id) => {

      const tdId = document.querySelector(`#s${id}`).id;
      if (tdId.match(data.topic_id)) {
        document.querySelector(`#s${id}`).innerHTML = data.score;
      }
    })
  })




  tbody.innerHTML += `<tr><td> </td><td><b> Total Marks </b></td><td><b> ${result[0].marks} </b></td><td><b>  ${result[0].total_marks}</b></td></tr>`
}


function createScoreTable2(result, result1, result2) {
  const tbody = document.querySelector("#scoreTableBody");
  let counter = 0;
  let html = "";
  const sameTopicId = [];
  const dbTopicID = [];
  result2.forEach((data, i) => {
    result1.forEach((data2, j) => {
      if (data.topic_id == data2.topic_id) {
        counter++;
        sameTopicId.push(data.topic_id);
        // console.log(sameTopicId);
        html += `<tr><td>${counter}</td><td>${data.topic}</td><td>${data2.score}</td><td>${data.total}</td></tr>`;
      }
    });
    dbTopicID.push(data.topic_id);
    // console.log(sameTopicId, "outer", dbTopicID);
  });


  html += `<tr><td> </td><td><b> Total Marks </b></td><td><b> ${result[0].marks} </b></td><td><b>  ${result[0].total_marks}</b></td></tr>`
  tbody.innerHTML = html

}


function createDonutCharForPercent(percetange, totalMarks) {

  const xValues = ["percentage", "rest left"];
  const yValues = [];
  const barColors = [
    "#03045e",
    "#90e0ef"
  ];
  yValues.push(percetange);
  let restValue = 100 - percetange;
  yValues.push(restValue);
  new Chart("myChartDonut", {
    type: "doughnut",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },

  });
}

function timeConverter(time) {
  let hours = Math.floor(time / 3600);
  let minute = Math.floor((time % 3600) / 60);
  let sec = Math.floor((time % 3600) % 60);
  if (hours < 10) {
    hours = "0" + Number(hours)
  }
  if (minute < 10) {
    minute = "0" + Number(minute)
  } if (sec < 10) {
    sec = "0" + Number(sec)
  }

  return { hours, minute, sec }
}