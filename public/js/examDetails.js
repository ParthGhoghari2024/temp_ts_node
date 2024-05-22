let currentPage = 1;
let recordsPerPage = 5;
let totalPages;
let recordsJson;
let allRecords;
let optionExams = ``;
let examStatusGlobal = "upcoming";

document.getElementById("exam-form");

let search = document.getElementById("search");
search.addEventListener("input", () => {
  currentPage = 1;
  let filteredResult;
  let search = document.getElementById("search");
  let input;
  if (search.value === "" || !search.value) {
    recordsJson = allRecords;
  } else {
    if (isNaN(Number(search.value))) {
      input = search.value;
    } else {
      input = Number(search.value);
    }
    if (isNaN(input)) {
      input = input.toLowerCase();
    }
    filteredResult = allRecords.filter((obj) => {
      return Object.values(obj).some((val) => {
        if (isNaN(val)) {
          val = val.toString().toLowerCase();
        } else {
          val = val.toString();
        }
        return val.match(input);
      });
    });
    recordsJson = filteredResult;
  }
  let tempRecords = recordsJson.slice(
    (currentPage - 1) * recordsPerPage,
    (currentPage - 1) * recordsPerPage + recordsPerPage
  );
  totalPages = Math.ceil(recordsJson.length / recordsPerPage);
  document.getElementById("paggingLink-prev").disabled = true;
  document.getElementById("pageTagSpan").innerText = currentPage;
  if (currentPage === totalPages) {
    document.getElementById("paggingLink-next").disabled = true;
  } else {
    document.getElementById("paggingLink-next").disabled = false;
  }

  if (tempRecords.length === 0) {
    document.getElementById("norecordsfound").innerText = "No Records Found";
    document.getElementsByClassName("recordsContainer")[0].innerHTML = "";

    document.getElementById("paginationController").classList.add("hide");
  } else {
    document.getElementById("norecordsfound").innerHTML = "";
    document.getElementById("paginationController").classList.remove("hide");
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
  }
});

async function run() {
  let fetchRecords = () => {
    return fetch("/admin/students/allexams");
  };
  let resultsData = await fetchRecords();
  recordsJson = await resultsData.json();
  
 
  if (recordsJson.length == 0) {
    document.getElementById("norecordsfound").innerText =
      "There Are No Upcoming Exams";

    document.getElementById("paginationController").classList.add("hide");
    document.getElementById("search").classList.add("hide");
  } else {
    document.getElementById("norecordsfound").innerText = "";
    document.getElementById("search").classList.remove("hide");
    document.getElementById("paginationController").classList.remove("hide");
    allRecords = recordsJson;
    allRecords.forEach((element) => {
      let dateTimeString = element.ExamDate + " " + element.StartTime
      dateTimeString = dateTimeConverter(dateTimeString)
      element.ExamDate = dateTimeString.dateString
      element.StartTime = dateTimeString.timeString
    })
    let totalRecords = allRecords.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById("pageTagSpan").innerText = currentPage;
    let tempRecords = allRecords.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;

    let tempRecords = allRecords.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
    document.getElementById("paggingLink-prev").disabled = false;
    document.getElementById("pageTagSpan").innerText = currentPage;
    if (currentPage === totalPages) {
      document.getElementById("paggingLink-next").disabled = true;
    }
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;

    let tempRecords = allRecords.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
    document.getElementById("paggingLink-next").disabled = false;
    document.getElementById("pageTagSpan").innerText = currentPage;
    if (currentPage === 1) {
      document.getElementById("paggingLink-prev").disabled = true;
    }
  }
}

function generateTable(arr, examstatus) {
  examstatus = examStatusGlobal;
  if (currentPage == totalPages) {
    document.getElementById("paggingLink-next").disabled = true;
  } else {
    document.getElementById("paggingLink-next").disabled = false;
  }
  if (!arr || !arr[0]) return;
  var tableHtml =
    "<table  class='resultsTable table table-hover'>";
  tableHtml += "<tr class='headRow'>";
  tableHtml += "<th class='bigfont'>No.</th>";

  const excludedKeys = ["ID"];
  for (const key in arr[0]) {
    if (arr[0].hasOwnProperty(key) && !excludedKeys.includes(key)) {
      tableHtml += `<th class="bigfont">${key}</th>`;
    }
  }
  if (examstatus == "upcoming") {
    tableHtml += `<th class="bigfont">Details</th>`;
    tableHtml += `<th class="bigfont">Questions</th>`;
    tableHtml += `<th class="bigfont">View</th>`;
    tableHtml += `<th colspan=2 style="text-align:center" class="bigfont">Export</th>`;
    tableHtml += `<th class="bigfont">Delete Exam<th>`;
  } else {
    tableHtml += `<th class="bigfont">View</th>`;
    tableHtml += `<th class="bigfont" colspan=2 style="text-align:center">Export</th>`;
  }

  tableHtml += "</tr>";

  arr.forEach((result, index) => {
    let examId = result.ID;

    tableHtml += "<tr>";
    let serialNumber = (currentPage - 1) * recordsPerPage + index + 1;
    tableHtml += `<td>${serialNumber}</td>`;
    var id;
    for (const key in result) {

      id = result.id || 1;
      if (result.hasOwnProperty(key) && !excludedKeys.includes(key)) {
        tableHtml += `<td class='${
          key === "content" ? "contentRow" : ""
        }'><div>`;

        tableHtml += result[key];
      }
    }
    if (examstatus === "upcoming") {
      tableHtml += `<td> 
    <button  class="gridBtn"  
      onclick="openForm(${result.ID})" >Update </button></td>`;
      tableHtml += `<td> 
    <button  class="gridBtn"
     onclick = "window.location.href = '/admin/exams/updatequestions?examid=${examId}'">Update</button></td>`;
      tableHtml += `<td> 
     <button  class="gridBtn"
      onclick = "window.location.href = '/admin/exams/questions/view?examid=${examId}'">Questions</button></td>`;
      tableHtml += `<td> 
    <button  class="gridBtn"
     onclick = "window.location.href = '/admin/exams/questions/export/pdf?examid=${examId}'">PDF</button></td><td>
    <button  class="gridBtn"
     onclick = "window.location.href = '/admin/exams/questions/export/csv?examid=${examId}'">CSV</button></td>`;

      tableHtml += `<td>
      <button class="gridBtn"
       onclick=" openDeleteForm(${result.ID});" >Delete</button></td>`;
    } else {
      tableHtml += `<td> 
      <button  class="gridBtn"
       onclick = "window.location.href = '/admin/exams/questions/view?examid=${examId}'">Questions</button></td>`;
      tableHtml += `<td> 
      <button  class="gridBtn"
       onclick = "window.location.href = '/admin/exams/questions/export/pdf?examid=${examId}'">PDF</button></td><td>
      <button class="gridBtn"
       onclick = "window.location.href = '/admin/exams/questions/export/csv?examid=${examId}'">CSV</button></td>`;
    }
    tableHtml += "</tr>";
  });

  tableHtml += "</table>";

  return tableHtml;
}
run();

let selectedStatus = document.getElementById("allstatus");
selectedStatus.addEventListener("change", async () => {
  currentPage = 1;
  let status = selectedStatus.value;
  let examStatusJson = JSON.stringify({ status: status });

  let resultsData = await fetch("/admin/students/getexamrecords", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: examStatusJson,
  });
  let jsondata = await resultsData.json();

  
  if (jsondata.msg) {
    // console.log("hello");
    document.getElementById("norecordsfound").innerText = "No Records Found";
    // examtitle.innerText = "";
    document.getElementById("search").classList.add("hide");
    document.getElementById("paginationController").classList.add("hide");
    document.getElementById("recordsContainer").classList.add("hide");
  } else {
    document.getElementById("norecordsfound").innerText = "";
    allRecords = jsondata.result;
    allRecords.forEach((element) => {
      let dateTimeString = element.ExamDate + " " + element.StartTime
      dateTimeString = dateTimeConverter(dateTimeString)
      element.ExamDate = dateTimeString.dateString
      element.StartTime = dateTimeString.timeString
    })
    
    examStatus = jsondata.examTitle;
    examStatusGlobal = examStatus;
    currentPage = 1;
    document.getElementById("search").classList.remove("hide");
    document.getElementById("paginationController").classList.remove("hide");
    document.getElementById("recordsContainer").classList.remove("hide");
    document.getElementById("norecordsfound").innerHTML = "";
    let totalRecords = allRecords.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById("pageTagSpan").innerText = currentPage;
    let tempRecords = allRecords.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );

    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords, examStatus);
  }
});

async function openForm(examid) {
  document.getElementById("myForm").style.display = "block";
  let fetchRecords = () => {
    return fetch(`/admin/students/examsrecord?examid=${examid}`);
  };
  try {
    let resultsData = await fetchRecords();
    resultsData = await resultsData.json();
    resultsData = resultsData[0];

    //to select time in calender
    const dateTimeString = dateTimeConverter(resultsData.start_time)
    let timeString = dateTimeString.timeString.split(" ")
    if (timeString[1] == "am") {
      timeString = timeString[0].split(":")
      if (timeString[0] < 10) {
        timeString[0] = "0" + Number(timeString[0])
      }
      timeString = timeString.join(":")
    } else {
      timeString = timeString[0].split(":")
      timeString[0] = Number(timeString[0]) + 12
      if (timeString[0] === 24) {
        timeString[0] = "00"
      }
      timeString = timeString.join(":")
    }

    document.getElementById("examid").value = examid;
    document.getElementById("title").value = resultsData.title;
    document.getElementById("start_time").value = dateTimeString.dateString + " " + timeString
    document.getElementById("duration_minute").value = resultsData.duration_minute;
    document.getElementById("passingmarks").value = resultsData.passing_marks;
    document.getElementById("instructions").value = resultsData.instructions;
  } catch (error) {
    console.log(error);
  }
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

let title = document.getElementById("title");
let start_time = document.getElementById("start_time");
let duration_minute = document.getElementById("duration_minute");
let passing_marks = document.getElementById("passingmarks");
let instructions = document.getElementById("instructions");
let btn = document.getElementById("submit");

// fields
let titlevalidation = document.getElementById("titlevalidation");
let starttimevalidation = document.getElementById("starttimevalidation");
let durationvalidation = document.getElementById("durationvalidation");
let passingmarksvalidation = document.getElementById("passingmarksvalidation");
let instructionsvalidation = document.getElementById("instructionsvalidation");

title.addEventListener("blur", (e) => {
  if (e.target.value.length >= 255) {
    titlevalidation.innerText =
      " (Length of title must be less than 255 characters.)";
    titlevalidation.style.color = "red";
  } else {
    titlevalidation.innerText = "";
  }
});

start_time.addEventListener("blur", (e) => {
  let validateUpcomingDateAndTime = (date) => new Date(date) > new Date();
  if (!validateUpcomingDateAndTime(e.target.value)) {
    starttimevalidation.innerText = " (invalid date)";
    starttimevalidation.style.color = "red";
  } else {
    starttimevalidation.innerText = "";
  }
});

duration_minute.addEventListener("blur", (e) => {
  if (!isNaN(e.target.value)) {
    if (e.target.value > 300) {
      durationvalidation.innerText = " (invalid duration)";
      durationvalidation.style.color = "red";
    } else {
      durationvalidation.innerText = "";
    }
  } else {
    durationvalidation.innerText = " (invalid duration)";
    durationvalidation.style.color = "red";
  }
});

instructions.addEventListener("blur", (e) => {
  if (e.target.value.length > 65535) {
    instructionsvalidation.innerText = " (invalid instructions)";
    durationvalidation.style.color = "red";
  } else {
    instructionsvalidation.innerText = "";
  }
});

document
  .getElementById("exam-form")
  .addEventListener("submit", async function (event) {
    let title = document.getElementById("title").value;
    let start_time = document.getElementById("start_time").value;
    let duration_minute = document.getElementById("duration_minute").value;
    let passing_marks = document.getElementById("passingmarks").value;
    let instructions = document.getElementById("instructions").value;
    if (
      title == "" ||
      start_time == "" ||
      duration_minute == "" ||
      passing_marks == "" ||
      instructions == ""
    ) {
      document.getElementById("requirederror").innerText =
        "Please Fill All The Required Fields";
      document.getElementById("requirederror").style.color = "red";
      event.preventDefault();
    } else {
      event.preventDefault();
      document.getElementById("requirederror").innerText = "";
      let examid = document.getElementById("examid").value;
      const formData = new FormData(this);
      formData.append("id", examid);
      const formDataObject = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });

      let updateRecords = () => {
        return fetch(`/admin/students/updateexamsrecord`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formDataObject),
        });
      };

      let updatedRecordStatus = await updateRecords();
      updatedRecordStatus = await updatedRecordStatus.json();
      if (updatedRecordStatus.incorrect) {
        document.getElementById("requirederror").innerText =
          "Incorrect Details";
        document.getElementById("requirederror").style.color = "red";
      } else {
        document.getElementById("requirederror").innerText = "";
        if (updatedRecordStatus.success == true) {
          closeForm();
          location.reload();
        } else {
          closeForm();
          location.reload();
        }
      }
    }
  });

let requireFields = Array.from(document.querySelectorAll(".requireField"));
requireFields.map((field) => {
  field.addEventListener("input", (e) => { });
});

function openDeleteForm(eid) {
  // console.log(eid);
  document.getElementById("deleteForm").style.display = "block";
  document.getElementById("exam-cancle").addEventListener("click", async () => {
    // console.log("dahdashdad");
    // console.log(eid);
    let deleteBody;

    deleteBody = {
      examID: eid,
    };

    // console.log(deleteBody);

    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          }).then(async () => {
            let fetchRecords = () => {
              return fetch(`/admin/exams/deleteExam`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deleteBody),
              });
            };
            let resultsData = await fetchRecords();
            resultsData = await resultsData.json();
            // console.log(resultsData);
            closeDeleteForm();
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
}

function closeDeleteForm() {
  document.getElementById("deleteForm").style.display = "none";
}


