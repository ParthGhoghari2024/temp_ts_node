window.onload = () => {

  var form = document.getElementById("tempQuestionsForm");
  var elements = form.elements;
  for (var i = 0, len = elements.length; i < len; ++i) {
    elements[i].disabled = true;
  }
}

const openRedirectModal = (type) => {
  let redirectingModal = new bootstrap.Modal(document.getElementById('redirectingModal'));
  redirectingModal.show();
  let redirectBtn = document.getElementById("redirectBtn");
  if (type === "add") {
    redirectBtn && redirectBtn.addEventListener("click", () => {
      window.location = `/admin/exams/addquestions?examid=${examId}`
    })
    redirectBtn.innerText = "Redirect to Add Questions";
  } else if (type === "update") {
    redirectBtn && redirectBtn.addEventListener("click", () => {
      window.location = `/admin/exams/updatequestions?examid=${examId}`
    })
    redirectBtn.innerText = "Redirect to Update Questions";
  }
}

const closeModalById = (id) => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
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
submitModalOnEnter("redirectingModal", "redirectBtn");
