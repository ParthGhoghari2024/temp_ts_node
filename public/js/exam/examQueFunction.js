
//give first question of topic

const getQuestionByTopic = () => {

  const topic = document.querySelectorAll(".topic");
  const que = document.querySelectorAll(".queans");
  const topicname = document.querySelectorAll(".topicname");

  topic.forEach((element) => {
    element.addEventListener("click", () => {

      const arr = []
      topicname.forEach((data, j) => {
        if (element.id == data.value) {
          arr.push(j);
        }
      })


      getQueBoxes(element.id)
      getSpecificQue()
      attemptedQuestion();

      que[i].style.display = "none";
      styleAttemptedQue(i)
      i = arr[0];

      getViewsofButton(i)
      styleActiveQuestion(i)
      que[i].style.display = "flex"
    })
  })
}

//to jump on specific question of topic

const getSpecificQue = () => {

  const queboxes = document.querySelectorAll(".box-span");
  const que = document.querySelectorAll(".queans");

  queboxes.forEach((element, j) => {
    element.addEventListener("click", () => {
      attemptedQuestion();
      styleAttemptedQue(i)

      que[i].style.display = "none";
      i = element.innerHTML - 1;
      que[i].style.display = "flex";

      styleActiveQuestion(i)
      getViewsofButton(i)

    })
  })
}

//show question boxes of current topic

const getQueBoxes = (topicname) => {
  const queboxes = document.querySelectorAll(`.que-boxes`);

  queboxes.forEach((element) => {
    element.style.display = "none"
  })

  const titlequeboxes = document.querySelectorAll(`.topic-${topicname}`)

  titlequeboxes.forEach((element) => {
    element.style.display = "flex";
  })
}

//to decide view of button and give color to current topic

const getViewsofButton = (i) => {

  const topicname = document.querySelectorAll(".topicname");
  const que = document.querySelectorAll(".queans");

  if (que.length === 1) {
    prev.style.visibility = "hidden"
    next.classList.add("submit")
    next.innerHTML = "Submit"
  } else {
    if (i === 0) {
      prev.style.visibility = "hidden"
      next.classList.remove("submit")
      next.innerHTML = "Next"
    }
    if (i !== 0) {
      prev.style.visibility = "visible"
      next.classList.remove("submit")
      next.innerHTML = "Next";

      if (i == que.length - 1) {
        next.classList.add("submit")
        next.innerHTML = "Submit"
      }
    }
  }


  removeColorFromTopic()
  document.getElementById(`${topicname[i].value}`).style = `background-color: green
  ;border:1px solid green;color:white`
}

//remove style from topic

const removeColorFromTopic = () => {
  const topic = document.querySelectorAll(".topic")
  topic.forEach((element) => {
    element.style = `background-color: white
    ;border:1px solid black;color:black`
  })
};

//give attempted and remaining question

const attemptedQuestion = () => {
  const que = document.querySelectorAll(".queans");
  let attempted = 0;
  for (let i = 0; i < que.length; i++) {
    const options = document.querySelectorAll(`input[name="opt${i + 1}"]:checked`)
    if (options[0]) {
      attempted++;
    }
  }
  let remaining = que.length - attempted;
  attemptedque.innerHTML = attempted;
  remainingque.innerHTML = remaining;

}

//give style to current,attempted and remaining question

const styleAttemptedQue = (i) => {

  const options = document.querySelectorAll(`input[name="opt${i + 1}"]:checked`)

  if (options[0]) {
    document.getElementById(`quebox${i + 1}`).style = `background-color: green
      ;border:1px solid green;color:white`;
  } else {
    document.getElementById(`quebox${i + 1}`).style = `background-color: white
      ;border:1px solid black;color:black`;
  }

};



const styleActiveQuestion = (i) => {
  document.getElementById(`quebox${i + 1}`).style = `background-color: orange
      ;border:1px solid orange;color:white`;

}

//timer for exam

const timer = () => {
  setInterval(() => {
    let time = duration.innerHTML
    if (time !== null) {
      time = time.split(":")
      let min = time[0]
      let sec = time[1];
      if (sec > 0) {
        sec = --sec;
      } else {
        if (min > 0) {
          min = --min;
          sec = 59
        } else {
          submitExam()
          clearInterval(timer)
        }
      }
      if (sec < 10) {
        sec = "0" + Number(sec);
      }
      if (min < 10) {
        min = "0" + Number(min);
      }
      duration.innerHTML = `${min}:${sec}`
    }
  }, 1000)
}

//submit exam answers

const submitAnswer = async () => {


  const question = document.querySelectorAll(`input[name="que[]"]`)
  const options = document.querySelectorAll(`input[name="opt${i + 1}"]:checked`)

  const queAnswer = []
  const obj = {}
  obj.queId = question[i].value;
  if (options[0]) {
    obj.ansId = options[0].value;
  } else {
    obj.ansId = null;
  }

  queAnswer.push(obj)

  const examId = document.getElementById("examid").value;

  // post data
  let data = await fetch("/exam/submitexam", {
    method: "post",
    body: JSON.stringify({ queAnswer, examId }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  data = await data.json()

  if (data.success) {
    return true
  }

};

const submitExam = async () => {


  let queAnswer = []
  const question = document.querySelectorAll(`input[name="que[]"]`)
  question.forEach((element, j) => {
    let obj = {};
    obj.queId = element.value;
    const options = document.querySelectorAll(`input[name="opt${j + 1}"]:checked`)
    if (options[0]) {
      obj.ansId = options[0].value;
    } else {
      obj.ansId = null;
    }
    queAnswer.push(obj)
  })

  let examId = document.getElementById("examid").value;

  //post data
  let data = await fetch("/exam/submitexam", {
    method: "post",
    body: JSON.stringify({ queAnswer, examId }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  data = await data.json()
  if (data.success) {

    let container = document.querySelector(".container")
    container.innerHTML = `    <div class="statusImage">
    <div>
      <img id="statusImage" src="/assets/submittedImage1.webp" alt="">
    </div>
    <div>
      <h2 id="statusMessage">Exam Submited Successfully</h2>
    </div>
  </div>`;
    window.removeEventListener("beforeunload", beforeunload)
    window.removeEventListener("unload", unload)
    document.removeEventListener("keydown", restrictInspect)
    window.removeEventListener("blur", tabAlert);
  }

};


const getCheckedQuestionDB = async (savedAnswer) => {
  const radio = document.querySelectorAll(`input[type="radio"]`)

  savedAnswer.forEach(d => {

    radio.forEach(element => {
      if (d.answer_id == element.value) {
        document.getElementById(element.id).setAttribute("checked", true)
        const i = element.id.split("-")[1]
        document.getElementById(`quebox${i}`).style = `background-color: green
        ;border:1px solid green;color:white`;
      }
    })
  })

}
 


//clear responsebutton

const clearResponse = async () => {
  const clearBtn = document.querySelectorAll(".clear-response")
  clearBtn.forEach((element) => {
    element.addEventListener("click", (e) => {
      const question = document.getElementsByName(element.id);
      for (let i = 0; i < question.length; i++) {
        question[i].checked = false;
      }
      attemptedQuestion()

    })
  })
}

let count = 0, tabcount = 0;
const restrictInspect = (e) => {
  e.preventDefault()
  if (e.keyCode == 123) {
    inspectAlert()
    return false;
  } else if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
    inspectAlert()
    return false;
  } else if (e.ctrlKey && e.keyCode == 85) {
    inspectAlert()
    return false;
  }

}

const contextmenuEvent = (e) => {
  inspectAlert()
  e.preventDefault();
}


const inspectAlert = () => {
  count++
  if (count < 4) {
    Swal.fire({
      icon: "warning",
      title: `Your cannot Open Inspect during Exam`,
      text: `If You Try to open ${5 - count} time Your Exam will Submitted`,
      showConfirmButton: false,
      timer: 1000
    })

  } else if (count == 4) {
    Swal.fire({
      icon: "warning",
      title: `Your cannot Open Inspect during Exam`,
      text: 'If You Try to open Inspect Another Time Your Exam will Submitted',
      showConfirmButton: false,
      timer: 1000
    })
  } else {
    submitExam()
  }



}

const tabAlert = () => {
  tabcount++;
  if (tabcount < 4) {
    Swal.fire({
      icon: "warning",
      title: `Your Can't Change tab during Exam`,
      text: `If You Try to Change tab ${5 - tabcount} time then Your Exam will Submitted`
      
    })

  } else if (tabcount == 4) {
    Swal.fire({
      icon: "warning",
      title: `Your Can't Change tab during Exam`,
      text: 'If You Try to Change tab Another Time Your Exam will Submitted'
      
    })
  } else {
    submitExam()
  }

}


