let currentPage = 1;
let recordsPerPage = 5;
let totalPages;
let recordsJson;
let allRecords;
let optionExams = ``;
let examsGlobalData;
let resultsData;
let selectedExam = document.getElementById("allexams");

// search function

let search = document.getElementById("searchText");
search.addEventListener("input", () => {
  currentPage = 1;
  let filteredResult;
  let search = document.getElementById("searchText");
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
    document.getElementById("norecordsfound").innerText = "";
    document.getElementById("paginationController").classList.remove("hide");
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
  }
});

async function run() {
  let fetchRecords = () => {
    return fetch("/admin/students/getrecords");
  };
  resultsData = await fetchRecords();
  recordsJson = await resultsData.json();
  allRecords = recordsJson;
  if (allRecords.msg) {
    document.getElementById("norecordsfound").innerText =
      "No Exam Records";
    document.getElementById("norecordsfound").style.color = "red";
    document.getElementById("paginationController").classList.add("hide");
    document.getElementById("searchText").classList.add("hide");
  } else {
    document.getElementById("norecordsfound").innerText = ""
    document.getElementById("searchText").classList.remove("hide");
    document.getElementById("paginationController").classList.remove("hide");
    let totalRecords = recordsJson.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById("pageTagSpan").innerText = currentPage;

    recordsJson.forEach((element) => {
      let dateTimeString = element.StartTime
      dateTimeString = dateTimeConverter(dateTimeString)
      element.StartTime = dateTimeString.dateString + " " + dateTimeString.timeString
    })

    let tempRecords = recordsJson.slice(
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

    let tempRecords = recordsJson.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords, selectedExam.value);
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
    let tempRecords = recordsJson.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords, selectedExam.value);
    document.getElementById("paggingLink-next").disabled = false;
    document.getElementById("pageTagSpan").innerText = currentPage;
    if (currentPage === 1) {
      document.getElementById("paggingLink-prev").disabled = true;
    }
  }
}

function generateTable(arr) {
  if (!arr || !arr[0]) return;
  if (currentPage == totalPages) {
    document.getElementById("paggingLink-next").disabled = true;
  } else {
    document.getElementById("paggingLink-next").disabled = false;
  }
  let tableHtml = "<table  class='resultsTable table  table-hover'>";
  tableHtml += "<tr class='headRow'>";
  tableHtml += "<th class= 'bigFont'>No.</th>";
  const excludedKeys = ["ID", "uid", "eid"];
  for (const key in arr[0]) {
    if (arr[0].hasOwnProperty(key) && !excludedKeys.includes(key)) {
      tableHtml += `<th class = 'bigFont'>${key}</th>`;
    }
  }
  tableHtml += `<th  class= 'bigFont'>View Answers</th>`;
  tableHtml += `<th colspan = "2" style= "text-align:center;"  class= 'bigFont'>Feedback Section</th>`;
  tableHtml += "</tr>";
  arr.forEach((result, index) => {

    // let dateTimeString=dateTimeConverter(result.StartTime)
    // result.StartTime=dateTimeString.dateString + " " +dateTimeString.timeString
    tableHtml += "<tr>";
    let serialNumber = (currentPage - 1) * recordsPerPage + index + 1;
    tableHtml += `<td>${serialNumber}</td>`;
    let id;
    for (const key in result) {
      id = result.id || 1;
      if (result.hasOwnProperty(key) && !excludedKeys.includes(key)) {
        tableHtml += `<td class='${key === "content" ? "contentRow" : ""
          }'><div>`;

        tableHtml += result[key];

        tableHtml += `</div></td>`;
      }
    }
    tableHtml += `<td><button onclick = "window.location.href = '/admin/students/answerkey?examid=${result.ID}&userid=${result.uid}'";
    class="gridBtn" >Answer Key</button></td>`;
    tableHtml += `<td><button id = "feedbackbtn" onclick = "openForm(${result.uid},${result.eid})"   class="gridBtn">Give Feedback</button></td>`;
    tableHtml += `<td><button id = "feedbackbtn" onclick = "openViewForm(${result.uid},${result.eid})"  class="gridBtn">View Feedback</button></td>`;
    tableHtml += "</tr>";
  });

  tableHtml += "</table>";

  return tableHtml;
}
run();

window.onload = async () => {
  let adminExams = await fetch("/admin/students/getallexams");
  const result = await adminExams.json();
  examsGlobalData = result.result;
  //console.log(examsGlobalData);
  for (let i = 0; i < examsGlobalData.length; i++) {
    optionExams += `<option value="${examsGlobalData[i].title}">${examsGlobalData[i].title}</option>`;
  }
  let examsTag = document.getElementById("allexams");
  examsTag.innerHTML = `<option disabled selected value> Filter By Exams </option> ${optionExams}`;
};

selectedExam.addEventListener("change", async () => {
  // console.log("sample:",allRecords);
  currentPage = 1;
  let examTitle = selectedExam.value;
  // console.log("Our data:",examsGlobalData);
  // console.log(examTitle);
  // console.log("all records are: ",allRecords);
  let filteredData = allRecords.filter(data => data.ExamName == examTitle)
  if (filteredData.length == 0) {
    document.getElementById("searchText").classList.add("hide");
    document.getElementById("paginationController").classList.add("hide");
    document.getElementById("recordsContainer").classList.add("hide");
    document.getElementById("norecordsfound").innerHTML =
      "No Records Found";
    document.getElementById("norecordsfound").style.color = "red";
  } else {
    currentPage = 1;
    document.getElementById("searchText").classList.remove("hide");
    document.getElementById("paginationController").classList.remove("hide");
    document.getElementById("recordsContainer").classList.remove("hide");
    document.getElementById("norecordsfound").innerHTML = "";
    // allRecords = jsondata;
    let totalRecords = filteredData.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById("pageTagSpan").innerText = currentPage;

    let tempRecords = filteredData.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
  }
});

