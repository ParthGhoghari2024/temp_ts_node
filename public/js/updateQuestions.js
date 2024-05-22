let questions = [];

let questionIndex;//next question index


var topics;
var difficulties;
let optionsTopics = ``;
let optionDifficulties = ``;
let qusIndexes = [];
const urlParams = new URLSearchParams(window.location.search);
const globalExamId = urlParams.get('examid');
window.onload = async () => {
  questionIndex = document.getElementsByClassName("question").length + 1;

  let fetchTopics = await fetch("/admin/exams/api/topics")
  let fetchTopicsJson = await fetchTopics.json();
  topics = fetchTopicsJson.result.topic;
  //setting options for dynamic questions
  topics.forEach(topic => {
    optionsTopics += `<option value="${topic}">${topic}</option>`;
  });

  let fetchDifficulties = await fetch("/admin/exams/api/difficulties")
  let fetchDifficultiesJson = await fetchDifficulties.json();
  // console.log(fetchDifficultiesJson);
  difficulties = fetchDifficultiesJson.result.difficulty;
  //setting options for dynamic questions
  difficulties.forEach(difficulty => {
    optionDifficulties += `<option value="${difficulty}">${difficulty}</option>`;
  });

  let allQuestions = document.getElementsByClassName("question");
  Object.values(allQuestions).forEach((que, index) => {
    qusIndexes.push(index + 1)
  });

  // console.log(qusIndexes);


}

const openModal = (id) => {
  let Modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
  Modal.show();
}

const validateInput = (event) => {
  if (!event.target.value || event.target.value === "") {
    addErrorTag(event.target, "Fill the details correctly")
  } else {
    removeErrorTag(event.target)
  }
}

const addQuestionBodyDiv = () => {
  qusIndexes.push(questionIndex);
  // console.log(qusIndexes);
  let questionHtml = `<div class="question border border-dark rounded p-4 flex-dir-col-gap-1" id="question-${questionIndex}">
  <div class="form-group ">
    <div class="que-head">
      <input type="hidden" name="id-${questionIndex}" value="-1">
      <input class="deleteHiddenInput" type="hidden" name="delete-${questionIndex}" value="0">
      <label for="formGroupExampleInput " class="fs-4">Question <span>${questionIndex}</span> </label>
      <div class="selectContainer">
        <select class="form-select select-topic" name="topic-${questionIndex}" aria-label="Default select example">
          <option disabled selected value>Select Topic</option>
          ${optionsTopics}
        </select>
      </div>
      <div class="selectContainer">

        <select class="form-select select-difficulty" name="difficulty-${questionIndex}" aria-label="Default select example">
          <option disabled selected value>Select Difficulty</option>
          ${optionDifficulties}
        </select>
      </div>
      <div class="d-flex align-items-center gap-2">
        <label class="form-check-label " for="score-<%= i+1 %>">Marks(score)</label>
        <input type="number" class="form-control queScore smallInput" id="formGroupScoreInput" placeholder="Score" name="scoreInput-${questionIndex}" value="1">
        <input type="button" class="btn btn-danger deleteQuestionBtn" value="delete"
                              onclick="deleteQuestionBody(${questionIndex})">
        </div>
    </div>
    <textarea type="text" class="form-control queInput " id="formGroupExampleInput"
      placeholder="Question Body" name="questionInput-${questionIndex}" spellcheck="true"></textarea>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input type="hidden" name="optionId-${questionIndex}-1" value="-1">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="1" checked>
    <label class="form-check-label " for="optionRadios-${questionIndex}-1">
      <input type="text" name="optionInput-${questionIndex}-1" class="form-control optionInput"
        id="formGroupExampleInput" placeholder="Question option" spellcheck="true">
    </label>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
  <input type="hidden" name="optionId-${questionIndex}-2" value="-1">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="2" checked>
    <label class="form-check-label " for="optionRadios-${questionIndex}-2">
      <input type="text" name="optionInput-${questionIndex}-2" class="form-control optionInput"
        id="formGroupExampleInput" placeholder="Question option" spellcheck="true">
    </label>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input type="hidden" name="optionId-${questionIndex}-3" value="-1">

    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="3" checked>
    <label class="form-check-label " for="optionRadios-${questionIndex}-3">
      <input type="text" name="optionInput-${questionIndex}-3" class="form-control optionInput"
        id="formGroupExampleInput" placeholder="Question option" spellcheck="true">
    </label>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input type="hidden" name="optionId-${questionIndex}-4" value="-1">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="4" checked>
    <label class="form-check-label " for="optionRadios-${questionIndex}-4">
      <input type="text" name="optionInput-${questionIndex}-4" class="form-control optionInput"
        id="formGroupExampleInput" placeholder="Question option" spellcheck="true">
    </label>
  </div>
</div>`

  let questionContainerTag = document.getElementById("questionContainer");
  //creating temp div and appending questionHtml to main container 
  var child = document.createElement('div');
  child.innerHTML = questionHtml;
  child = child.firstChild;

  //adding up on change event listner in all input field  
  let allInputInNewQuesion = child.querySelectorAll("input,select");

  allInputInNewQuesion.forEach(input => {
    input.addEventListener("change", validateInput)
  });

  questionContainerTag.appendChild(child);

  questionIndex++;
}


let deleteQuestionBody = (id) => {
  let allQuestions = document.getElementsByClassName("question");
  let selectedQuestion = Object.values(allQuestions)[id - 1];
  // console.log(id);
  qusIndexes = qusIndexes.filter((ind) => ind != id).sort();
  // console.log(qusIndexes);
  let selectedQuestionInputs = selectedQuestion.querySelectorAll("input ,select,textarea");
  let deleteQuestionBtn = selectedQuestion.querySelector(".deleteQuestionBtn");
  let deleteHiddenInput = selectedQuestion.querySelector(".deleteHiddenInput");

  if (selectedQuestion.classList.contains("deletedQue")) {
    selectedQuestion.classList.remove("deletedQue");
    selectedQuestionInputs.forEach(input => {
      input.disabled = false;
    });
    deleteQuestionBtn.value = "delete"

    deleteHiddenInput.value = 0;
  } else {

    selectedQuestion.classList.add("deletedQue");

    selectedQuestionInputs.forEach(input => {
      input.disabled = true;
    });

    deleteQuestionBtn.value = "undo"
    deleteHiddenInput.value = 1;
  }
  deleteQuestionBtn.disabled = false;
}

let updateQuestionsSubmit = async () => {
  let allQuestions = document.getElementsByClassName("question");
  questions = [];

  let validationFlag = 0;
  Object.values(allQuestions).forEach((question, index) => {
    // console.log(index);
    var questionText = question.querySelector(`textarea[name="questionInput-${index + 1}"]`);
    var optionText1 = question.querySelector(`input[name="optionInput-${index + 1}-1"]`);
    var optionText2 = question.querySelector(`input[name="optionInput-${index + 1}-2"]`);
    var optionText3 = question.querySelector(`input[name="optionInput-${index + 1}-3"]`);
    var optionText4 = question.querySelector(`input[name="optionInput-${index + 1}-4"]`);
    var id = question.querySelector(`input[name="id-${index + 1}"]`);
    var optionId1 = question.querySelector(`input[name="optionId-${index + 1}-1"]`);
    var optionId2 = question.querySelector(`input[name="optionId-${index + 1}-2"]`);
    var optionId3 = question.querySelector(`input[name="optionId-${index + 1}-3"]`);
    var optionId4 = question.querySelector(`input[name="optionId-${index + 1}-4"]`);
    let deleteHiddenInput = question.querySelector(".deleteHiddenInput");

    var score = question.querySelector(`input[name="scoreInput-${index + 1}"]`);

    // console.log(questionText.value, index);
    var correctOption = question.querySelector(`input[name=optionRadios-${index + 1}]:checked`)
    var difficultyInput = question.querySelector(".select-difficulty");
    var topicInput = question.querySelector(".select-topic");

    if (!correctOption) {
      validationFlag = 1;
      alert("select Right  option properly")
      return;
    }


    let questionObj = {
      index: index + 1,
      text: questionText.value,
      topic: topicInput.value,
      difficulty: difficultyInput.value,
      options: [optionText1.value, optionText2.value, optionText3.value, optionText4.value],
      correctId: parseInt(correctOption.value),
      score: parseFloat(score.value),
      id: parseInt(id.value),
      optionIds: [optionId1.value, optionId2.value, optionId3.value, optionId4.value],
      isDeleted: parseInt(deleteHiddenInput.value)
    }

    if (questionObj.id === -1 && questionObj.isDeleted === 1) return;


    if (!questionText || questionText.value.trim() === "") {
      addErrorTag(questionText, "Enter Question text properly");
      validationFlag = 1;
    } else removeErrorTag(questionText);
    if (!optionText1 || optionText1.value.trim() === "") {
      addErrorTag(optionText1, "Enter option text properly");
      validationFlag = 1;
    } else removeErrorTag(optionText1);
    if (!optionText2 || optionText2.value.trim() === "") {
      addErrorTag(optionText2, "Enter option text properly");
      validationFlag = 1;
    } else removeErrorTag(optionText2);
    if (!optionText3 || optionText3.value.trim() === "") {
      addErrorTag(optionText3, "Enter option text properly");
      validationFlag = 1;
    } else removeErrorTag(optionText3);
    if (!optionText4 || optionText4.value.trim() === "") {
      addErrorTag(optionText4, "Enter option text properly");
      validationFlag = 1;
    } else removeErrorTag(optionText4);

    if (!score || score === "") {
      addErrorTag(score, "Enter option text properly");
      validationFlag = 1;
    } else removeErrorTag(score);



    questions.push(questionObj);
  })
  // console.log(validationFlag);
  if (validationFlag === 1) {
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('examid');
  const updateQuestionsReqBody = {
    examId: parseInt(examId),
    questions,
    updateExamTotalMarksFlag: 0
  }

  openModal("submitLoadingModal");
  let updateQuestions = await fetch("/admin/exams/api/questions/update", {
    method: "post",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateQuestionsReqBody)
  })
  let updateQuestionsJson = await updateQuestions.json();

  // console.log(updateQuestionsJson);
  closeModal("submitLoadingModal");
  handleResponseOfUpdateQue(updateQuestionsJson);



}

const updateExamTotal = async (type) => {
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get("examid");
  // console.log(questions);
  const passingMarks = document.getElementById("updatedPassingMarks").value || -1;
  const updateQuestionsReqBody = {
    examId: parseInt(examId),
    questions,
    updateExamTotalMarks: 1,
    newPassingMarks: passingMarks,
  };
  openModal("submitLoadingModal");
  let updateQuestions = await fetch("/admin/exams/api/questions/update", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateQuestionsReqBody),
  });
  let updateQuestionsJson = await updateQuestions.json();
  // console.log(updateQuestionsJson);
  closeModal("submitLoadingModal");
  handleResponseOfUpdateQue(updateQuestionsJson);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("insertQuestionConflictModal")).hide();
};
const openConfirmModal = () => {
  bootstrap.Modal.getInstance(
    document.getElementById("insertQuestionConflictModal")
  ).hide();
  let insertQuestionConflictModal = new bootstrap.Modal(
    document.getElementById("confirmModal")
  );
  insertQuestionConflictModal.show();
};
const closeModal = (id) => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
};

const handleResponseOfUpdateQue = (updateQuestionsJson) => {
  if (updateQuestionsJson && updateQuestionsJson.success) {
    // alert("updated")//temp

    closeModal("confirmModal");
    openModal("updatedMsgModal");
    let allErrror = document.getElementsByClassName("invalid-feedback");
    if (allErrror.length != 0) {
      Array.from(allErrror).forEach((errTag) => {
        errTag.remove();
      });
    }
  } else if (updateQuestionsJson && updateQuestionsJson.success === 0) {
    if (updateQuestionsJson && updateQuestionsJson.totalMarksError === 1) {
      openModal("totalMarksErrorMsgModal");
    }
    let updatedPassingMarksInput = document.getElementById(
      "updatedPassingMarks"
    );
    if (updateQuestionsJson && updateQuestionsJson.startingTimeError === 1) {
      alert("updation for upcoming or completed exam is not allowed");//temp
      return;
    }
    if (updateQuestionsJson &&
      updateQuestionsJson.passingMarksValidate === 1) {
      addErrorTag(updatedPassingMarksInput, "Passign Marks must be less than total marks and should be greater than or equal to 0");
      return;
    }
    if (
      updateQuestionsJson.totalExamMarks != null &&
      updateQuestionsJson.newTotalMarks != null
    ) {
      // console.log(updateQuestionsJson);

      let insertQuestionConflictModal = new bootstrap.Modal(
        document.getElementById("insertQuestionConflictModal")
      );
      insertQuestionConflictModal.show();
      if (updateQuestionsJson.currentPassingMarks != null) {

        updatedPassingMarksInput.value = updateQuestionsJson.currentPassingMarks;
      }
      let modalTotalMarksSpan = document.getElementById("modalTotalMarks");
      modalTotalMarksSpan.innerText = updateQuestionsJson.totalExamMarks;
      let modalNewTotalMarksSpan = document.getElementById("modalNewTotalMarks");
      modalNewTotalMarksSpan.innerText = updateQuestionsJson.newTotalMarks;
    }
    if (updateQuestionsJson.message) alert(updateQuestionsJson.message);
    if (updateQuestionsJson.validationsFailedObj) {
      // alert("Fill details properly");
      openModal("errorMsgModal");


      // console.log(updateQuestionsJson.validationsFailedObj);

      let validationsFailedObj = updateQuestionsJson.validationsFailedObj;
      let allQuestions = document.querySelectorAll(".question:not(.deletedQue)");
      // console.log(allQuestions);
      // console.log(allQuestions);


      let validationsFailedKeys = Object.keys(validationsFailedObj);
      let validationsFailedArray = Object.values(validationsFailedObj);

      let allErrror = document.getElementsByClassName("invalid-feedback");
      if (allErrror.length != 0) {
        Array.from(allErrror).forEach((errTag) => {
          errTag.remove();
        });
      }
      // console.log(allQuestions);
      // console.log(qusIndexes);
      Object.keys(validationsFailedObj).forEach((questionIndex) => {
        let qus = document.getElementById(`question-${questionIndex}`);


        let questionText = qus.querySelector(
          `textarea[name="questionInput-${questionIndex}"]`
        );
        let optionText1 = qus.querySelector(
          `input[name="optionInput-${questionIndex}-1"]`
        );
        let optionText2 = qus.querySelector(
          `input[name="optionInput-${questionIndex}-2"]`
        );
        let optionText3 = qus.querySelector(
          `input[name="optionInput-${questionIndex}-3"]`
        );
        let optionText4 = qus.querySelector(
          `input[name="optionInput-${questionIndex}-4"]`
        );
        // let score = allQuestions[questionIndex - 1].querySelector(
        //   `input[name="scoreInput-${qusIndexes[questionIndex - 1]}"]`
        // );
        // console.log(qus);
        let score = qus.querySelector(
          `input[name="scoreInput-${questionIndex}"]`
        );
        // console.log(score.value);

        // console.log(questionText.value, index);
        let correctOption = qus.querySelector(
          `input[name=optionRadios-${questionIndex}]:checked`
        );
        let difficultyInput =
          qus.querySelector(".select-difficulty");
        let topicInput =
          qus.querySelector(".select-topic");
        if (validationsFailedObj[questionIndex].includes("text"))
          addErrorTag(questionText, "Enter Question text properly");
        else removeErrorTag(questionText);

        if (validationsFailedObj[questionIndex].includes("difficulty"))
          addErrorTag(difficultyInput, "select difficulty  properly");
        else removeErrorTag(difficultyInput);

        if (validationsFailedObj[questionIndex].includes("topic"))
          addErrorTag(topicInput, "select topic  properly");
        else removeErrorTag(topicInput);

        if (validationsFailedObj[questionIndex].includes("option-1"))
          addErrorTag(optionText1, "Enter option-1 text properly");
        else removeErrorTag(optionText1);

        if (validationsFailedObj[questionIndex].includes("option-2"))
          addErrorTag(optionText2, "Enter option-2 text properly");
        else removeErrorTag(optionText2);

        if (validationsFailedObj[questionIndex].includes("option-3"))
          addErrorTag(optionText3, "Enter option-3 text properly");
        else removeErrorTag(optionText3);

        if (validationsFailedObj[questionIndex].includes("option-4"))
          addErrorTag(optionText4, "Enter option-4 text properly");
        else removeErrorTag(optionText4);

        if (validationsFailedObj[questionIndex].includes("score"))
          addErrorTag(score, "Enter score  properly (1-5)");
        else removeErrorTag(score);
      });
    }

  }
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

const exportPdfBtnClick = () => {
  let pdfSpinner = document.getElementById("pdf-spinner")
  if (pdfSpinner) {
    pdfSpinner.classList.remove("d-none");
    setTimeout(() => {
      pdfSpinner.classList.add("d-none");
    }, 3000);
  }
}
const exportCsvBtnClick = () => {
  let pdfSpinner = document.getElementById("csv-spinner")
  if (pdfSpinner) {
    pdfSpinner.classList.remove("d-none");
    setTimeout(() => {
      pdfSpinner.classList.add("d-none");
    }, 3000);
  }
}


const openRedirectModal = (type) => {
  let redirectingModal = new bootstrap.Modal(document.getElementById('redirectingModal'));
  redirectingModal.show();
  let redirectBtn = document.getElementById("redirectBtn");
  if (type === "add") {
    redirectBtn && redirectBtn.addEventListener("click", () => {
      window.location = `/admin/exams/addquestions?examid=${globalExamId}`
    })
    redirectBtn.innerText = "Redirect to Add Questions";
  } else if (type === "view") {
    redirectBtn && redirectBtn.addEventListener("click", () => {
      window.location = `/admin/exams/questions/view?examid=${globalExamId}`
    })
    redirectBtn.innerText = "Redirect to view Questions";
  }
}


const closeModalById = (id) => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
}



let allQuestions = document.getElementsByClassName("question");

Object.values(allQuestions).forEach(qus => {
  let allInputs = qus.querySelectorAll("input,select");
  // console.log(allInputs);

  allInputs.forEach(input => {
    input.addEventListener("change", validateInput)
  });
});


// submit modal on enter click
let submitModalOnEnter = (modalId, btnId) => {
  let modal = document.getElementById(modalId);

  if (modal) {
    modal.addEventListener("keypress", (event) => {
      if (event.target.tagName === "button" || event.target.tagName === "BUTTON") return;

      var keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == '13') {
        let confirmBtn = document.getElementById(btnId)
        confirmBtn && confirmBtn.click();
      }
    })
  }

}

submitModalOnEnter("insertQuestionConflictModal", "confirmBtn-insertConflict");
submitModalOnEnter("errorMsgModal", "errorMsgBtn-errorMsgModal");
submitModalOnEnter("totalMarksErrorMsgModal", "errorMsgBtn-totalMarksErrorMsgModal");
submitModalOnEnter("updatedMsgModal", "closeUpdateMsgModal");
submitModalOnEnter("confirmModal", "submitFormWithPassingMarksBtn");
submitModalOnEnter("redirectingModal", "redirectBtn");