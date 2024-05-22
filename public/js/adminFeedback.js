const socket = io();

async function openForm(uid, eid) {
  // console.log("form open");
  let instructionsdetails = {
    uid: uid,
    eid: eid,
  };
  let result = await fetch("/admin/students/selectFeedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instructionsdetails),
  });

  let resultJsonData = await result.json();
  // console.log(resultJsonData);
  let resultLength = resultJsonData[0].length;
  if (resultLength > 0) {
    document.getElementById("myForm1").style.display = "block";

  } else {
    document.getElementById("myForm").style.display = "block";
    dataSend(uid, eid);
  }
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
  document.getElementById("myForm1").style.display = "none";
}

function dataSend(uid, eid) {
  document
    .getElementById("submit-feedback")
    .addEventListener("click", (event) => {
      event.preventDefault();

      let feedback = document.getElementById("feedback").value;
      let databody = {
        uid: uid,
        eid: eid,
        feedback: feedback,
      };
      socket.emit("send feedback", databody);
    });
}

socket.on("send feedback", async (databody) => {
  let textObject = {
    feedback: databody.feedback,
    uid: databody.uid,
    eid: databody.eid,
  };

  try {
    const response = await fetch("/admin/students/adminFeedbackPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(textObject),
    });

    let resData = await response.json();

    if (resData.success == "success") {
      closeForm();
      window.location.reload();
    }
  } catch (error) {
    console.log(error);
  }
});

const feed_btn = document.getElementById("submit-feedback");
feed_btn.style.opacity = 0.5;
feed_btn.disabled = true;

document
  .getElementById("feedback")
  .addEventListener("input", function notBlur() {
    let val;
    val = document.getElementById("feedback").value;
    let  pattern =   /^(\\"`'|[^"`'])*$/
    let errSpan = document.getElementById('err1');
    if ((!pattern.test(val))) {
      errSpan.innerText = "(single,double quotes and bactics are not allowed!!)"
      feed_btn.style.opacity = 0.5;
      feed_btn.disabled = true;
    }
    else if (val == "") {
      feed_btn.style.opacity = 0.5;
      feed_btn.disabled = true;
    }
    else {
      errSpan.innerText = ""
      feed_btn.style.opacity = "";
      feed_btn.disabled = false;
    }
  });


  async function openViewForm(uid, eid) {
    try {
      let instructionsdetails = {
        uid: uid,
        eid: eid,
      };
      
      // console.log(JSON.stringify(instructionsdetails));
      let result = await fetch("/admin/students/viewAdminFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instructionsdetails),
      });

      let resultJsonData = await result.json();


      // console.log(resultJsonData);
      if (resultJsonData.success == "success" ) {
        document.getElementById("myForm2").style.display = "block";
        document.getElementById('show-feedback').innerText = resultJsonData.feedbackVAL;
      }
      else if (resultJsonData.success == "fail") {
        document.getElementById("myForm3").style.display = "block";
      }
    } catch (error) {
      console.log(error);
    }
    
  }
  
  function closeViewForm() {
    document.getElementById("myForm2").style.display = "none";
    document.getElementById("myForm3").style.display = "none";
  }
