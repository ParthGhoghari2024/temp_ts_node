window.onload = () => {
  let startingTimeInput = document.getElementById("startingTime");
  let currentDate = new Date().toISOString().slice(0, -8);
  if (startingTimeInput) startingTimeInput.min = currentDate
}
let examId = null;
const isNumber = (num) => !isNaN(num);

const createExamSubmit = async () => {
  // const socketIo = io("")
  const form = document.getElementById("createExamForm");
  // console.log(new FormData(form));

  let errorTag = document.querySelectorAll(".invalid-feedback");
  errorTag.forEach(err => {
    err.remove();
  });


  const titleTag = document.querySelector("input[name=title]")
  const startingTimeTag = document.querySelector("input[name=startingTime]")
  const durationTag = document.querySelector("input[name=duration]")
  const totalMarksTag = document.querySelector("input[name=totalMarks]")
  const passingMarksTag = document.querySelector("input[name=passingMarks]")
  const instructionsTag = document.querySelector("textarea[name=instructions]")

  let validationsFlag = 0;
  if (!titleTag.value || titleTag.value === "") {
    addErrorTag(titleTag, "Fill detail correctly")
    validationsFlag = 1;
  } else {
    removeErrorTag(titleTag)
  }

  if (!startingTimeTag.value || startingTimeTag.value === "") {
    addErrorTag(startingTimeTag, "Fill detail correctly")
    validationsFlag = 1;
  } else {
    removeErrorTag(startingTimeTag)
  }

  if (!durationTag.value || durationTag.value === "") {
    addErrorTag(durationTag, "Fill detail correctly")
    validationsFlag = 1;
  } else if (!isNumber(durationTag.value)) {
    addErrorTag(durationTag, "Duration must be in minutes (number) ")
    validationsFlag = 1;
  } else if (durationTag.value <= 0 || durationTag.value > 300) {
    addErrorTag(durationTag, "Duration must be less between 1-300 minutes  ")
    validationsFlag = 1;
  } else {
    removeErrorTag(durationTag)
  }

  if (!totalMarksTag.value || totalMarksTag.value === "") {
    addErrorTag(totalMarksTag, "Fill detail correctly")
    validationsFlag = 1;
  } else if (!isNumber(totalMarksTag.value)) {
    addErrorTag(totalMarksTag, "Total Marks must be in number ")
    validationsFlag = 1;
  } else {
    removeErrorTag(totalMarksTag)
  }

  if (!passingMarksTag.value || passingMarksTag.value === "") {
    addErrorTag(passingMarksTag, "Fill detail correctly")
    validationsFlag = 1;
  } else if (!isNumber(passingMarksTag.value)) {
    addErrorTag(passingMarksTag, "Passing Marks must be in number ")
    validationsFlag = 1;
  } else if (parseInt(passingMarksTag.value) > parseInt(totalMarksTag.value)) {
    addErrorTag(passingMarksTag, "Passing Marks must be less than Totals Marks  ")
    validationsFlag = 1;
  } else {
    removeErrorTag(passingMarksTag)
  }
  if (!instructionsTag.value || instructionsTag.value === "") {
    if (instructionsTag.value.length > 65535) addErrorTag(instructionsTag, "Instruction is too long")
    else addErrorTag(instructionsTag, "Fill detail correctly")
    validationsFlag = 1;
  } else {
    removeErrorTag(instructionsTag)
  }
  if (document.getElementById("confirmModal")) {
    bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide();
  }

  // if (validationsFlag === 1) {
  //   return;
  // }
  openModal("submitLoadingModal");
  let createExam = await fetch("/admin/exams/api/create", {
    method: "post",
    body: new URLSearchParams(new FormData(form)),
    credentials: "same-origin"
  })
  let createExamJson = await createExam.json();

  // if(createExamJson.success){
  //   socketIo.emit('send notifications',1)
  // }
  closeModal("submitLoadingModal");
  if (createExamJson && createExamJson.success === 1 && createExamJson.examId !== -1) {
    examId = createExamJson.examId;
    let redirectingModal = new bootstrap.Modal(document.getElementById("redirectingModal"));
    redirectingModal.show();
  } else if (createExamJson && createExamJson.success === 0 && createExamJson.message) {

    if (createExamJson.validationsFailedArray) {
      const validationsFailedArray = createExamJson.validationsFailedArray;

      if (validationsFailedArray.includes("title")) {
        addErrorTag(titleTag, "Fill detail correctly")
      } else {
        removeErrorTag(titleTag)
      }

      if (validationsFailedArray.includes("startingTime")) {
        addErrorTag(startingTimeTag, "Fill detail correctly")
      } else {
        removeErrorTag(startingTimeTag)
      }

      if (validationsFailedArray.includes("duration")) {
        addErrorTag(durationTag, "Fill detail correctly")
      } else {
        removeErrorTag(durationTag)
      }

      if (validationsFailedArray.includes("totalMarks")) {
        addErrorTag(totalMarksTag, "Fill detail correctly")
      } else {
        removeErrorTag(totalMarksTag)
      }

      if (validationsFailedArray.includes("passingMarks")) {
        addErrorTag(passingMarksTag, "Fill detail correctly")
      } else {
        removeErrorTag(passingMarksTag)
      }

      if (validationsFailedArray.includes("instructions")) {
        addErrorTag(instructionsTag, "Fill detail correctly")
      } else {
        removeErrorTag(instructionsTag)
      }
    }

  }
  // console.log(createExamJson);
}

const openConfirmModal = () => {
  let confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
  confirmModal.show();
}
const closeModalBtEvent = (event) => {
  let modal = event.target.closest(".modal");
  modal && bootstrap.Modal.getInstance(document.getElementById(modal.id)).hide();
}
const addErrorTag = (tag, errorMsg) => {
  let errorTag = tag.parentNode.querySelector(".invalid-feedback");
  if (!errorTag) {
    tag.parentNode.appendChild(getErrorMsgTag(errorMsg));
  }
};
const removeErrorTag = (tag) => {
  let errorTag = tag.parentNode.querySelector(".invalid-feedback");
  if (errorTag) {
    errorTag.remove();
  }
};

const getErrorMsgTag = (errorMsg) => {
  let errorHtml = `<div class="invalid-feedback">
  ${errorMsg}
</div>`;

  let child = document.createElement("div");
  child.innerHTML = errorHtml;
  child = child.firstChild;

  return child;
};

const redirectToQue = () => {
  window.location = `/admin/exams/addquestions?examid=${examId}`
}
const openModal = (id) => {
  console.log("cbdjcndj")
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
};
const closeModal = (id) => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
};


// press button on enter
let confirmModal = document.getElementById("confirmModal");

if (confirmModal) {
  confirmModal.addEventListener("keypress", (event) => {
    if (event.target.tagName === "button" || event.target.tagName === "BUTTON") return;
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      let confirmCreateBtn = document.getElementById('confirmCreateBtn')
      confirmCreateBtn && confirmCreateBtn.click();
    }
  })
}


let redirectingModal = document.getElementById("redirectingModal");

if (redirectingModal) {
  redirectingModal.addEventListener("keypress", (event) => {
    if (event.target.tagName === "button" || event.target.tagName === "BUTTON") return;

    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      let confirmBtn = document.getElementById('confirmBtn-redirectingModal');
      confirmBtn && confirmBtn.click();
    }
  })
}