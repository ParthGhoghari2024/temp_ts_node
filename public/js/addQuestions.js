var questionIndex = 2;
let questions = [];
let optionsTopics = ``;
let optionDifficulties = ``;
let qusIndexes = [1];
let topics;
let difficulties;

let examIdGlobal = null;
const addListner = (tag, msg) => {
  tag.addEventListener("blur", (event) => {
    let value = event.target.value.trim();
    if (!value || value === "") {
      addErrorTag(event.target, msg);
    } else {
      removeErrorTag(event.target);
    }
  });
};
const addQuestionBodyDiv = () => {
  qusIndexes.push(questionIndex);
  let questionHtml = `<div class="question border border-dark rounded p-4 flex-dir-col-gap-1" id="question-${questionIndex}">
  <div class="form-group ">
    <div class="que-head">
      <label  class="fs-4">Question <span class="indexSpan" >${qusIndexes.length}</span> </label>
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
      <div class="scoreInputContainer d-flex align-items-center gap-2">
          <label class="form-check-label " for="score-${questionIndex}">Marks(score)</label>
          <div>
            <input type="number" class="form-control queScore smallInput" id="formGroupScoreInput" placeholder="Score" name="scoreInput-${questionIndex}" value="1">
          </div>
      </div>
      <button type="button" class=" btn  btn-danger removeBtn" onclick="removeQuestion(${questionIndex})">Remove</button>
    </div>
    <div>
    <textarea type="text" class="form-control queInput " 
      placeholder="Question Body" name="questionInput-${questionIndex}"  spellcheck="true"></textarea>
    </div>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="1" checked>
    <label class="form-check-label " for="optionRadios-${questionIndex}-1">
      <input type="text" name="optionInput-${questionIndex}-1" class="form-control optionInput"
         placeholder="Question option"  spellcheck="true">
    </label>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="2" >
    <label class="form-check-label " for="optionRadios-${questionIndex}-2">
      <input type="text" name="optionInput-${questionIndex}-2" class="form-control optionInput"
         placeholder="Question option"  spellcheck="true">
    </label>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="3" >
    <label class="form-check-label " for="optionRadios-${questionIndex}-3">
      <input type="text" name="optionInput-${questionIndex}-3" class="form-control optionInput"
         placeholder="Question option"  spellcheck="true">
    </label>
  </div>
  <div class="form-check d-flex align-items-center gap-2">
    <input class="form-check-input" type="radio" name="optionRadios-${questionIndex}" id="optionRadios-${questionIndex}"
      value="4" >
    <label class="form-check-label " for="optionRadios-${questionIndex}-4">
      <input type="text" name="optionInput-${questionIndex}-4" class="form-control optionInput"
         placeholder="Question option"  spellcheck="true">
    </label>
  </div>
</div>`;

  let questionContainerTag = document.getElementById("questionContainer");
  //creating temp div and appending questionHtml to main container
  let child = document.createElement("div");
  child.innerHTML = questionHtml;
  child = child.firstChild;
  questionContainerTag.appendChild(child);

  let questionText = child.querySelector(
    `textarea[name="questionInput-${questionIndex}"]`
  );
  let optionText1 = child.querySelector(
    `input[name="optionInput-${questionIndex}-1"]`
  );
  let optionText2 = child.querySelector(
    `input[name="optionInput-${questionIndex}-2"]`
  );
  let optionText3 = child.querySelector(
    `input[name="optionInput-${questionIndex}-3"]`
  );
  let optionText4 = child.querySelector(
    `input[name="optionInput-${questionIndex}-4"]`
  );


  addListner(questionText, "Fill out question correctly");
  addListner(optionText1, "Fill out option correctly");
  addListner(optionText2, "Fill out option correctly");
  addListner(optionText3, "Fill out option correctly");
  addListner(optionText4, "Fill out option correctly");
  questionIndex++;
};

let activeCSVSectionBtn = document.getElementById("activeCSVSectionBtn");
let activeManualSectionBtn = document.getElementById("activeManualSectionBtn");
const activeImportCSVSection = () => {
  let csvSectionTag = document.getElementById("csvSection");
  let manualSectionTag = document.getElementById("manuallyAddSection");

  activeCSVSectionBtn && activeCSVSectionBtn.classList.add("sectionBtn-active");
  activeManualSectionBtn && activeManualSectionBtn.classList.remove("sectionBtn-active");
  let submitFormWithPassingMarksBtn = document.getElementById("submitFormWithPassingMarksBtn");

  submitFormWithPassingMarksBtn.setAttribute("onclick", "updateExamTotal('csv')");
  if (manualSectionTag) {
    manualSectionTag.classList.remove("section-active");
  }

  if (csvSectionTag) {
    csvSectionTag.classList.add("section-active");
  }
};

const activeManualSection = () => {
  let csvSectionTag = document.getElementById("csvSection");
  let manualSectionTag = document.getElementById("manuallyAddSection");

  activeManualSectionBtn && activeManualSectionBtn.classList.add("sectionBtn-active");
  activeCSVSectionBtn && activeCSVSectionBtn.classList.remove("sectionBtn-active");

  let submitFormWithPassingMarksBtn = document.getElementById("submitFormWithPassingMarksBtn");

  submitFormWithPassingMarksBtn && submitFormWithPassingMarksBtn.setAttribute("onclick", "updateExamTotal('manual')");
  if (csvSectionTag) {
    csvSectionTag.classList.remove("section-active");
  }
  if (manualSectionTag) {
    manualSectionTag.classList.add("section-active");
  }
};

let CSVForm = document.getElementById("CSVForm");
let CSVFormData = null;

const getTopics = async () => {
  let fetchTopics = await fetch("/admin/exams/api/topics");
  let fetchTopicsJson = await fetchTopics.json();
  return fetchTopicsJson.result.topic;
};

const getDifficulties = async () => {
  let fetchDifficulties = await fetch("/admin/exams/api/difficulties");
  let fetchDifficultiesJson = await fetchDifficulties.json();
  return fetchDifficultiesJson.result.difficulty;
};
window.onload = async () => {
  CSVForm = document.getElementById("CSVForm");


  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get("examid");
  examIdGlobal = examId;

  const csvInputHiddenExamId = document.querySelector("input[name='examid']");
  csvInputHiddenExamId.value = examId;

  topics = await getTopics();
  //setting topics for dynamic questions
  topics.forEach((topic) => {
    optionsTopics += `<option value="${topic}">${topic}</option>`;
  });

  difficulties = await getDifficulties();
  //setting difficulties for dynamic questions
  difficulties.forEach((difficulty) => {
    optionDifficulties += `<option value="${difficulty}">${difficulty}</option>`;
  });

  //updaing options for first question
  let question1TopicTag = document.getElementById("select-topic-1");

  question1TopicTag.innerHTML = `<option disabled selected value>Select Topic</option>${optionsTopics}`;
  let question1DifficultyTag = document.getElementById("select-difficulty-1");
  question1DifficultyTag.innerHTML = `<option disabled selected value>Select Topic</option>${optionDifficulties}`;

  //adding topics and difficulties in format table for CSV File upload section
  let difficltyFormatTable = document.getElementById("difficltyFormatTable");
  if (difficltyFormatTable) {
    let trHtml = ``;

    difficulties.forEach((difficulty, index) => {
      trHtml += ` <tr>
          
          <td scope="col">${difficulty}</td>
        </tr> `;
    });
    difficltyFormatTable.innerHTML += trHtml;
  }

  let topicFormatTable = document.getElementById("topicFormatTable");
  if (topicFormatTable) {
    let trHtml = `<tbody class='table-hide'>`;

    topics.forEach((topic, index) => {
      trHtml += ` <tr>
         
          <td scope="col">${topic}</td>
        </tr> `;
    });
    topicFormatTable.innerHTML += (trHtml + "</tbody>");
  }
  let totalQuestionsDetailsBody = {
    examId: examId,
  };
  let totalQuestionsDetails = await fetch(
    "/admin/exams/api/questions/details",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(totalQuestionsDetailsBody),
    }
  );
  let totalQuestionsDetailsJson = await totalQuestionsDetails.json();

  let totalQuestionsCountSpan = document.getElementById("totalQuestionsCount");
  let totalScoreCountSpan = document.getElementById("totalScoreCount");

  if (totalQuestionsDetailsJson) {
    if (totalQuestionsDetailsJson.success === 1) {
      totalQuestionsCountSpan.innerText = totalQuestionsDetailsJson.totalQuestions;
      totalScoreCountSpan.innerText = totalQuestionsDetailsJson.totalScore;
    }
  }
};

const validateAllQuestions = (allQuestions) => {
  let validationsFlag = 0;
  Object.values(allQuestions).forEach((question, index) => {
    Object.values(question).forEach((que, index) => {
      if (typeof que === "object") {
        //option array
        Array.from(que).forEach((option) => {
          if (option === "") validationsFlag = 1;
        });
      } else if (typeof que === "string") {
        if (!que || que === "") validationsFlag = 1;
      } else if (typeof que === "number") {
        if (!que || isNaN(que)) validationsFlag = 1;
      }
    });
  });
  return validationsFlag;
};
const openModal = (id) => {
  let Modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
  Modal.show();
}
const submitQuestions = async () => {
  questions = [];
  let allQuestions = document.getElementsByClassName("question");
  let validationFlag = 0;

  Object.values(allQuestions).forEach((question, index) => {
    // console.log(index);
    let questionText = question.querySelector(
      `textarea[name="questionInput-${qusIndexes[index]}"]`
    );
    let optionText1 = question.querySelector(
      `input[name="optionInput-${qusIndexes[index]}-1"]`
    );
    let optionText2 = question.querySelector(
      `input[name="optionInput-${qusIndexes[index]}-2"]`
    );
    let optionText3 = question.querySelector(
      `input[name="optionInput-${qusIndexes[index]}-3"]`
    );
    let optionText4 = question.querySelector(
      `input[name="optionInput-${qusIndexes[index]}-4"]`
    );

    let score = question.querySelector(
      `input[name="scoreInput-${qusIndexes[index]}"]`
    );

    // console.log(questionText.value, index);
    let correctOption = question.querySelector(
      `input[name=optionRadios-${qusIndexes[index]}]:checked`
    );

    if (!correctOption) {
      validationFlag = 1;
      alert("select Right  option properly")
      return;
    }
    let difficultyInput = question.querySelector(".select-difficulty");
    let topicInput = question.querySelector(".select-topic");
    questionText.value = questionText.value && questionText.value.trim();
    optionText1.value = optionText1.value && optionText1.value.trim();
    optionText2.value = optionText2.value && optionText2.value.trim();
    optionText3.value = optionText3.value && optionText3.value.trim();
    optionText4.value = optionText4.value && optionText4.value.trim();

    if (
      !questionText.value ||
      !optionText1.value ||
      !optionText2.value ||
      !optionText3.value ||
      !optionText4.value ||
      !score ||
      !score.value ||
      !difficultyInput.value ||
      !topicInput.value
    ) {
      validationFlag = 1;
      setBorderToQue(question, "red");
    } else {
      setBorderToQue(question, "green");
    }
    if (!questionText.value)
      addErrorTag(questionText, "Fill out question correctly");
    else removeErrorTag(questionText);

    if (!optionText1.value)
      addErrorTag(optionText1, "Fill out option correctly");
    else removeErrorTag(optionText1);

    if (!optionText2.value)
      addErrorTag(optionText2, "Fill out option correctly");
    else removeErrorTag(optionText2);

    if (!optionText3.value)
      addErrorTag(optionText3, "Fill out option correctly");
    else removeErrorTag(optionText3);

    if (!optionText4.value)
      addErrorTag(optionText4, "Fill out option correctly");
    else removeErrorTag(optionText4);

    if (!score.value) addErrorTag(score, "Fill out score correctly");
    else removeErrorTag(score);

    // if (!correctOption.value) //todo

    if (!difficultyInput.value)
      addErrorTag(difficultyInput, "Fill out difficulty correctly");
    else removeErrorTag(difficultyInput);

    if (!topicInput.value) addErrorTag(topicInput, "Fill out topic correctly");
    else removeErrorTag(topicInput);

    let questionObj = {
      index: qusIndexes[index],
      text: questionText.value,
      topic: topicInput.value,
      difficulty: difficultyInput.value,
      options: [
        optionText1.value,
        optionText2.value,
        optionText3.value,
        optionText4.value,
      ],
      correctId: parseInt(correctOption.value),
      score: parseInt(score.value),
    };

    questions.push(questionObj);
  });
  let validateAllQuestionsRes = validateAllQuestions(questions);
  if (validateAllQuestionsRes === 1) {
    setTimeout(() => {
      Object.values(allQuestions).forEach((que) => {
        que.style.removeProperty("border");
        que.borderColor = "black"
      })
    }, 2000);
    return;
  }
  // console.log(validationFlag,questions);
  if (validationFlag === 1) {
    openModal("errorMsgModal");
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get("examid");
  const submitQuestionsReqBody = {
    examId: parseInt(examId),
    questions,
    updateExamTotalMarks: 0,
  };

  openModal("submitLoadingModal");
  let postQuestions = await fetch("/admin/exams/api/questions", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submitQuestionsReqBody),
  });
  let postQuestionsJson = await postQuestions.json();

  Object.values(allQuestions).forEach((question, index) => {
    setBorderToQue(question, "black");
  })
  // console.log(postQuestionsJson);
  closeModal("submitLoadingModal");
  handleResponseOfPostQue(postQuestionsJson);

};

const removeQuestion = (id) => {
  // console.log(questions, typeof (questions));
  qusIndexes = qusIndexes.filter((ind) => ind != id).sort();
  document.getElementById(`question-${id}`).remove();
  if (questionIndex === 2) questionIndex--;

  //updating display of question number all of
  let allQuestionsindexSpan = document.getElementsByClassName("indexSpan");
  Object.values(allQuestionsindexSpan).forEach((span, index) => {
    span.innerText = index + 1;
  });
};

const handleResponseOfPostQue = (postQuestionsJson) => {
  if (postQuestionsJson && postQuestionsJson.success) {
    // alert("inserted"); //temp
    // console.log(postQuestionsJson.success);
    const socketIo = io("");

    if(postQuestionsJson.success){
      socketIo.emit('send notifications',1)
    }

    let confirmModal = document.getElementById("confirmModal");
    confirmModal && bootstrap.Modal.getOrCreateInstance(document.getElementById("confirmModal")).hide();
    openModal("redirectingModal");
  } else if (postQuestionsJson && postQuestionsJson.success === 0) {
    // console.log(postQuestionsJson);
    if (postQuestionsJson && postQuestionsJson.totalMarksError === 1) {
      openModal("errorMsgModal");
    }
    let updatedPassingMarksInput = document.getElementById(
      "updatedPassingMarks"
    );
    if (postQuestionsJson && postQuestionsJson.passingMarksValidate === 1) {
      addErrorTag(updatedPassingMarksInput, "Passign Marks must be less than total marks and greter or equal to 0");
      return;
    }

    if (postQuestionsJson && postQuestionsJson.startingTimeError === 1) {
      alert("insertion for upcoming or completed exam is not allowed");//temp
      return;
    }
    if (
      postQuestionsJson.totalExamMarks != null &&
      postQuestionsJson.newTotalMarks != null
    ) {
      // console.log(postQuestionsJson);

      let insertQuestionConflictModal = new bootstrap.Modal(
        document.getElementById("insertQuestionConflictModal")
      );
      insertQuestionConflictModal.show();
      if (postQuestionsJson.currentPassingMarks != null) {

        updatedPassingMarksInput.value = postQuestionsJson.currentPassingMarks;
      }
      let modalTotalMarksSpan = document.getElementById("modalTotalMarks");
      modalTotalMarksSpan.innerText = postQuestionsJson.totalExamMarks;
      let modalNewTotalMarksSpan =
        document.getElementById("modalNewTotalMarks");
      modalNewTotalMarksSpan.innerText = postQuestionsJson.newTotalMarks;
    }

    if (postQuestionsJson.message) alert(postQuestionsJson.message);
    if (postQuestionsJson.validationsFailedObj) {
      // alert("Fill details properly");
      openModal("errorMsgModal");


      let validationsFailedObj = postQuestionsJson.validationsFailedObj;
      let allQuestions = document.getElementsByClassName("question");
      // console.log(allQuestions);
      let allErrror = document.getElementsByClassName("invalid-feedback");
      if (allErrror.length != 0) {
        Array.from(allErrror).forEach((errTag) => {
          errTag.remove();
        });
      }
      Object.keys(validationsFailedObj).forEach((questionIndex) => {
        // console.log(qusIndexes[questionIndex - 1]);
        let questionText = allQuestions[questionIndex - 1].querySelector(
          `textarea[name="questionInput-${qusIndexes[questionIndex - 1]}"]`
        );
        let optionText1 = allQuestions[questionIndex - 1].querySelector(
          `input[name="optionInput-${qusIndexes[questionIndex - 1]}-1"]`
        );
        let optionText2 = allQuestions[questionIndex - 1].querySelector(
          `input[name="optionInput-${qusIndexes[questionIndex - 1]}-2"]`
        );
        let optionText3 = allQuestions[questionIndex - 1].querySelector(
          `input[name="optionInput-${qusIndexes[questionIndex - 1]}-3"]`
        );
        let optionText4 = allQuestions[questionIndex - 1].querySelector(
          `input[name="optionInput-${qusIndexes[questionIndex - 1]}-4"]`
        );

        let score = allQuestions[questionIndex - 1].querySelector(
          `input[name="scoreInput-${qusIndexes[questionIndex - 1]}"]`
        );

        // console.log(score, validationsFailedObj[questionIndex]);
        // console.log(questionText.value, index);
        let correctOption = allQuestions[questionIndex - 1].querySelector(
          `input[name=optionRadios-${qusIndexes[questionIndex - 1]}]:checked`
        );
        let difficultyInput =
          allQuestions[questionIndex - 1].querySelector(".select-difficulty");
        let topicInput =
          allQuestions[questionIndex - 1].querySelector(".select-topic");
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
};

const closeModal = (id) => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
};
const openConfirmModal = () => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById("insertQuestionConflictModal")).hide();
  let insertQuestionConflictModal = new bootstrap.Modal(document.getElementById("confirmModal"));
  insertQuestionConflictModal.show();
};

const uploadCSV = async () => {
  CSVFormData = new FormData(CSVForm);

  const file = CSVFormData.get('csv');
  closeModal('csvConfirmSubmitModal')

  if (file) {
    if (file && file.size > 1 * 1024 * 1024) {
      // alert("Too big File")
      openModal("fileValidationModal");
      return;
    }
  }

  openModal("fileUploadingModal");


  let CSVUploadReq = await fetch("/admin/exams/insertCSV", {
    method: "POST",
    body: CSVFormData,
  });

  let CSVUploadResJson = await CSVUploadReq.json();
  // console.log(CSVUploadResJson);
  closeModal("fileUploadingModal");
  handleResponseOfCSVUpload(CSVUploadResJson);
};
const updateExamTotal = async (type) => {
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get("examid");
  if (type === "manual") {
    // console.log(questions);
    const passingMarks = document.getElementById("updatedPassingMarks").value || -1;
    const submitQuestionsReqBody = {
      examId: parseInt(examId),
      questions,
      updateExamTotalMarks: 1,
      newPassingMarks: passingMarks,
    };
    openModal("submitLoadingModal");

    // console.log(submitQuestionsReqBody);
    let postQuestions = await fetch("/admin/exams/api/questions", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitQuestionsReqBody),
    });
    // console.log(postQuestions);
    let postQuestionsJson = await postQuestions.json();
    
    // console.log(postQuestionsJson);
    closeModal("submitLoadingModal");
    handleResponseOfPostQue(postQuestionsJson);
  } else if (type === "csv") {
    const passingMarks = document.getElementById("updatedPassingMarks").value || -1;

    openModal("submitLoadingModal");
    let CSVUploadReq = await fetch(`/admin/exams/insertCSV?updateExamTotalMarks=1&newPassingMarks=${passingMarks}`, {
      method: "POST",
      body: CSVFormData,
    }
    );

    let CSVUploadResJson = await CSVUploadReq.json();
    closeModal("submitLoadingModal");
    handleResponseOfCSVUpload(CSVUploadResJson);
  }
  // console.log(questions);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("insertQuestionConflictModal")).hide();
};

const checkAllFiledOfQue = (que) => {
  let allInput = que.querySelectorAll("input[type=text] , input[type=number],select");

  let flag = 0;
  allInput.forEach((inputField) => {
    if (!inputField.value || inputField.value === "") flag = 1;
    if ((flag = 1)) return 1;
  });
  return flag;

  // console.log(allInput);
};

const setBorderToQue = (questionTag, color) => {
  questionTag.style.cssText = ` border : 2px solid ${color} !important`;
};

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

  //making html element from html string  
  let child = document.createElement("div");
  child.innerHTML = errorHtml;
  child = child.firstChild;

  return child;
};

const handleResponseOfCSVUpload = (CSVUploadResJson) => {
  const socketIo = io("");
  if(CSVUploadResJson.success){
      socketIo.emit('send notifications',1)
  }
  let csvSectionTag = document.getElementById("csvSection");
  let fileSuccessAlert = document.getElementById("fileSuccessAlert");
  fileSuccessAlert && fileSuccessAlert.remove();
  let fileErrorTag = document.getElementById("fileError");

  let errorContainer = document.getElementById("errorContainer");
  fileErrorTag && fileErrorTag.remove();
  if (!CSVUploadResJson) return alert("something went wrong");
  if (CSVUploadResJson.noFiles) {
    let noFileErrorMsgHtml = getFileErrorMsgHtml(
      "No file selected",
      "Plese select a file"
    );
    
    // alert("Plese select a file")
    // csvSectionTag.innerHTML = noFileErrorMsgHtml + csvSectionTag.innerHTML;
    errorContainer.innerHTML = noFileErrorMsgHtml;
  } else if (CSVUploadResJson.success === 0) {
    if (CSVUploadResJson && CSVUploadResJson.totalMarksError === 1) {
      openModal("errorMsgModal");
    }
    let updatedPassingMarksInput = document.getElementById(
      "updatedPassingMarks"
    );
    if (CSVUploadResJson && CSVUploadResJson.startingTimeError === 1) {
      alert("insertion for upcoming or completed exam is not allowed");
      return;
    }
    if (CSVUploadResJson &&
      CSVUploadResJson.passingMarksValidate === 1) {
      addErrorTag(updatedPassingMarksInput, "Passign Marks must be less than total marks and greater than or equal 0");
      return;
    }
    let fileTypeErrorMsgHtml = null;
    if (CSVUploadResJson.fileLimitError) {
      fileTypeErrorMsgHtml = getFileErrorMsgHtml(
        "File size limit exceeded",
        "Please select CSV files that satisfy our file-size limit, check the file extension and content of the selected file, and re-upload it"
      );
    }
    if (CSVUploadResJson.CSVParseError === 1) {
      fileTypeErrorMsgHtml = getFileErrorMsgHtml(
        `CSV FORMAT ERROR AT ROW <span class="fs-2"> ${CSVUploadResJson.errorAt} <span>  `,
        "Please check CSV file format  and content of the selected file, and re-upload it"
      );
    } else if (
      CSVUploadResJson.totalExamMarks != null &&
      CSVUploadResJson.newTotalMarks != null
    ) {
      // console.log(CSVUploadResJson);
      let insertQuestionConflictModal = new bootstrap.Modal(
        document.getElementById("insertQuestionConflictModal")
      );
      insertQuestionConflictModal.show();
      if (CSVUploadResJson.currentPassingMarks != null) {

        updatedPassingMarksInput.value = CSVUploadResJson.currentPassingMarks;
      }
      let modalTotalMarksSpan = document.getElementById("modalTotalMarks");
      modalTotalMarksSpan.innerText = CSVUploadResJson.totalExamMarks;
      let modalNewTotalMarksSpan =
        document.getElementById("modalNewTotalMarks");
      modalNewTotalMarksSpan.innerText = CSVUploadResJson.newTotalMarks;
    } else {
      fileTypeErrorMsgHtml = getFileErrorMsgHtml(
        "Wrong File Selected Only csv allowed",
        "Please select CSV Files only, check file extention and content of selected file and re-upload it "
      );
    }

    if (fileTypeErrorMsgHtml) errorContainer.innerHTML = fileTypeErrorMsgHtml;
  } else {
    // alert("submitted")
    let fileUploadSuccessMsgHtml = getFileUploadSuccessMsgHtml(
      "File uploaded and question are inserted succesfully"
    );
    errorContainer.innerHTML = fileUploadSuccessMsgHtml;
    closeModal("confirmModal");
  }
};

const getFileErrorMsgHtml = (messageHead, messageDescription) => {
  return `<div class="alert alert-danger alert-dismissible fade show p-5 mt-1 w-75" id="fileError">
  <h4 class="alert-heading "><i class="bi-exclamation-octagon-fill"></i> ${messageHead}
  </h4>
  <p>${messageDescription}</p>
</div>`;
};

const getFileUploadSuccessMsgHtml = (message) => {
  return `<div class="alert alert-success alert-dismissible d-flex align-items-center fade show mt-1 w-75" id="fileSuccessAlert">
  <i class="bi-check-circle-fill"></i>
  <strong class="mx-2">Success!</strong>${message}
</div>`;
};

const allQuestions = document.getElementsByClassName("question");
Object.values(allQuestions).forEach((question, index) => {
  let questionText = question.querySelector(
    `textarea[name="questionInput-${qusIndexes[index]}"]`
  );
  let optionText1 = question.querySelector(
    `input[name="optionInput-${qusIndexes[index]}-1"]`
  );
  let optionText2 = question.querySelector(
    `input[name="optionInput-${qusIndexes[index]}-2"]`
  );
  let optionText3 = question.querySelector(
    `input[name="optionInput-${qusIndexes[index]}-3"]`
  );
  let optionText4 = question.querySelector(
    `input[name="optionInput-${qusIndexes[index]}-4"]`
  );

  let score = question.querySelector(
    `input[name="scoreInput-${qusIndexes[index]}"]`
  );

  addListner(questionText, "Fill out question correctly");
  addListner(optionText1, "Fill out option correctly");
  addListner(optionText2, "Fill out option correctly");
  addListner(optionText3, "Fill out option correctly");
  addListner(optionText4, "Fill out option correctly");
});

let allQues = document.getElementsByClassName("question");

const redirectingToUpdate = () => {
  window.location = `/admin/exams/updatequestions?examid=${examIdGlobal}`
}

const removePreviewOfCSV = () => {
  const tableBody = document.getElementById("table-body");

  if (tableBody) tableBody.innerHTML = "";

  const showPreviewCSVBtn = document.getElementById("showPreviewCSVBtn");

  if (showPreviewCSVBtn) showPreviewCSVBtn.classList.add("preview")
}

const removeCSV = () => {
  var fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.value = "";
  }

  removePreviewOfCSV();
}
const previewCSV = (event) => {
  var fileInput = document.getElementById("fileInput");

  const reader = new FileReader();
  const inputedFile = fileInput.files && fileInput.files[0];
  const fileName = inputedFile && inputedFile.name;
  var csvRegex = /(\.csv)$/i;
  const previewNoteTag = document.getElementById("previewNote")

  let previewFlag = 0;


  if (event.target.classList.contains("preview")) {

    previewFlag = 1;
  }

  if (!fileInput || !fileInput.files[0]) {
    previewNoteTag.innerText = "Inputed file is not CSV";
    return;
  }
  // console.log(event.target.classList);
  // console.log(previewFlag);
  const tableBody = document.getElementById("table-body");
  if (previewFlag === 1) {
    event.target.classList.remove("preview")
    if (!csvRegex.exec(fileName)) {
      previewNoteTag.innerText = "Inputed file is not CSV";
      return;
    }
    previewNoteTag.innerText = "CSV File contents will appear here";
    event.target.innerText = "Hide Preview"

    reader.readAsBinaryString(fileInput.files[0])

    reader.onload = () => {
      tableBody.innerHTML = "";
      let data = reader.result;


      let csvParsed = Papa.parse(data);//from papaparse.min.js

      let csvArray = csvParsed.data;

      // console.log(csvArray);

      csvArray.forEach((row, index) => {
        // const columns = row.split(',')
        const tr = document.createElement("tr");
        let trHtml = "<tr>";
        row.forEach(cell => {
          cell = cell.replace("â\u0080\u009c", '"')//this pacakage use â\u0080\u009c as placeholder for forward " if " is in field
          // i get to know about that usign console.log 
          cell = cell.replace("â\u0080\u009d", '"')//this pacakage use â\u0080\u009d as placeholder for backward " if " is in field

          trHtml += `<td>${cell} </td>`
        });
        trHtml += "</tr>"
        tableBody.innerHTML += trHtml;
      })
    }
  } else {
    previewNoteTag.innerText = "CSV File contents will appear here";
    tableBody.innerHTML = "";
    event.target.classList.add("preview")
    event.target.innerText = "Show Preview"
  }
}

const removeErrByEvent = (event) => {
  if (event.target.value && event.target.value != "") removeErrorTag(event.target)
}

const changeBtnText = (event, newText, prevText) => {
  // console.log(text);
  const htmlElement = event.target;

  console.log(htmlElement);
  if (htmlElement) {
    htmlElement.innerText = newText
    setTimeout(() => {
      htmlElement.innerText = prevText
    }, 5000);
  }

}

// enter press button press

let submitModalOnEnter = (modalId, btnId) => {
  let modal = document.getElementById(modalId);

  if (modal) {
    modal.addEventListener("keypress", (event) => {
      console.log(event.target.tagName);
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
submitModalOnEnter("confirmModal", "submitFormWithPassingMarksBtn");
submitModalOnEnter("redirectingToUpdateModal", "confirmBtn-redirectingToUpdateModal");
submitModalOnEnter("CSVFormatModal", "CSVFormatModalCloseBtn");
submitModalOnEnter("errorMsgModal", "errorMsgBtn-errorMsgModal");
submitModalOnEnter("fileValidationModal", "errorMsgBtn-fileValidationModal");
submitModalOnEnter("redirectingModal", "confirmBtn-redirectingModal");
submitModalOnEnter("csvConfirmSubmitModal", "confirmBtn-csvConfirmSubmitModal");
submitModalOnEnter("CSVInstructionModal", "CSVInstructionModalCloseBtn");




document.onreadystatechange = function () {
  if (document.readyState !== "complete") {
    openModal("loadingModal")
  } else {
    closeModal("loadingModal");
  }
};