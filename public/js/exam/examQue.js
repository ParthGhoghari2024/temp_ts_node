const start = document.getElementById("start");
const container = document.querySelector(".container");
const instructions = document.querySelector(".instructions");
const questions = document.querySelector(".questions");
const next = document.getElementById("next");
const prev = document.getElementById("previous");
const topics = document.querySelector(".topics");
const duration = document.getElementById("duration")
const boxes = document.querySelector(".boxes");
const totalque = document.getElementById("total-que");
const attemptedque = document.getElementById("attempted-que");
const remainingque = document.getElementById("remaining-que");
const questatus = document.querySelector(".que-status");

let i = 0;

//to start exam

start.addEventListener("click", async () => {
  let searchParams = new URLSearchParams(window.location.search)

  const exam = searchParams.get('exam')

  let data = await fetch(`/exam/showexam?exam=${exam}`, {
    method: "get",
    headers: {
      "Content-Type": "application/json"
    }
  })

  data = await data.json();

  if (data.success) {

    start.style.display = "none";
    instructions.style.display = "none"
    container.style.display = "flex";
    questions.innerHTML = data.question;
    topics.innerHTML = data.topics;

    
    duration.innerHTML = `${data.duration}:00`

    //show only first question
    const que = document.querySelectorAll(".queans");
    que.forEach((element, i) => {
      if (i !== 0) {
        element.style.display = "none"
      }
    })


    //create question boxes
    const topicname = document.querySelectorAll(".topicname");

    let boxesdiv = "";
    topicname.forEach((element, j) => {

      boxesdiv += `<div class="topic-${element.value} que-boxes">
        <span class="box-span" id="quebox${j + 1}">${j + 1}</span>
      </div>`

    })
    boxes.innerHTML = boxesdiv;


    //give first topic que boxes
    const topic = document.querySelectorAll(".topic");

    getQueBoxes(topic[0].id)

    //give color to first span
    styleActiveQuestion(i)

    //for examid
    let input = document.createElement("input");
    input.type = "hidden";
    input.value = data.examid;
    input.setAttribute("id", "examid")
    questatus.appendChild(input);

    timer()
    getViewsofButton(i)
    getQuestionByTopic()
    getSpecificQue()
    clearResponse()

    //restriction events
    window.addEventListener("beforeunload", beforeunload)
    window.addEventListener("unload", unload);
    document.addEventListener("keydown", restrictInspect);
    if (document.addEventListener) {
      document.addEventListener('contextmenu', contextmenuEvent);
    }
    window.addEventListener("blur",tabAlert);


    if (data.savedAnswer.length > 0) {
      getCheckedQuestionDB(data.savedAnswer)
    }

    totalque.innerHTML = que.length;
    attemptedQuestion()
  }
})

next.addEventListener("click", () => {
  const que = document.querySelectorAll(".queans");
  const topicname = document.querySelectorAll(".topicname")

  attemptedQuestion();

  if (next.classList.contains("submit")) {
    Swal.fire({
      title: "Are you want to Submit Exam?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit it!"
    }).then((result) => {

      if (result.isConfirmed) {
        submitExam()
      }
    });
  }

  if (que.length - 1 > i) {

    styleAttemptedQue(i)

    que[i].style.display = "none";
    const success = submitAnswer()
    if (success) {
      i++;
      que[i].style.display = "flex"
    }


    getViewsofButton(i)
    styleActiveQuestion(i)
    getQueBoxes(topicname[i].value)
  }

  if (que.length - 1 == i) {
    getQueBoxes(topicname[i].value)
    styleActiveQuestion(i)
    getViewsofButton(i);
  }
});


prev.addEventListener("click", () => {

  const que = document.querySelectorAll(".queans");
  const topicname = document.querySelectorAll(".topicname");

  attemptedQuestion();

  if (i > 0) {

    styleAttemptedQue(i)

    que[i].style.display = "none";
    i--;
    que[i].style.display = "flex"

    getViewsofButton(i)

    styleActiveQuestion(i)

    getQueBoxes(topicname[i].value);

  }

  if (i == 0) {
    getViewsofButton(i)

    styleActiveQuestion(i)

    getQueBoxes(topicname[i].value)
  }

});

const beforeunload = (e) => { e.preventDefault() }

const unload = (e) => {
  e.preventDefault()
  submitExam()
}





(() => {
  container.style.display = "none"
})();



// fulll screen mode
window.onload = function () {

    let start = document.getElementById("start");
    start.onclick = toggleFullScreen();
}

function toggleFullScreen() {
    document.addEventListener('click', function (e) {

      window.onbeforeunload = null;
      if (!e.target.hasAttribute('data-toggle-fullscreen')) return;

      if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      document.documentElement.requestFullscreen();

    })
}





