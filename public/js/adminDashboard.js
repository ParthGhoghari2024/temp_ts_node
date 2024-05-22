//table pagination
let currentPage = 1;
let recordsPerPage = 5;
let totalPages;
let recordsJson;
let allRecords;

async function run() {

  let fetchRecords = () => {
    return fetch("/admin/examTable");
  };

  let resultsData = await fetchRecords();
  //console.log(resultsData,'1');

  recordsJson = await resultsData.json();


  allRecords = recordsJson;
  if (allRecords.msg) {
    document.getElementById("pagination").classList.add("hide");
    document.getElementById("recordsContainer").classList.add("hide");
    document.getElementById("norecordsfound").innerText =
      "There is no such upcoming exams....!";
    document.getElementById("norecordsfound").style.color = "red";
  }
  else {
    document.getElementById("norecordsfound").innerText = ""
    document.getElementById("pagination").classList.remove("hide");
    document.getElementById("recordsContainer").classList.remove("hide");
    // console.log("records are: ", allRecords);

    let totalRecords = recordsJson.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);

    //  console.log(totalRecords,totalPages,'3');

    document.getElementById("pageTagSpan").innerText = currentPage;

    console.log(allRecords);
    allRecords.forEach((element) => {
      let dateTimeString = element.start_time
      dateTimeString = dateTimeConverter(dateTimeString)
      element.start_time = dateTimeString.dateString + " " + dateTimeString.timeString

    })
    let tempRecords = allRecords.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );

    //   console.log(tempRecords);

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
    // console.log("total pages are: ", totalPages);
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

function generateTable(arr) {
  if (!arr || !arr[0]) return;

  var tableHtml = "<table  class=' table table-hover'>";
  tableHtml += "<tr class='headRow' >";
  // console.log(arr[0],'arr0');
 
    if (arr[0].hasOwnProperty('title')) {  
      tableHtml += `<th class = "fontSize">Exam Name</th>`;
    }
    if (arr[0].hasOwnProperty('total_marks')) {
      tableHtml += `<th class = "fontSize">Total Marks</th>`;
    }
    if (arr[0].hasOwnProperty('passing_marks')) {
    tableHtml += `<th class = "fontSize">Passing Marks</th>`;
  }
  if (arr[0].hasOwnProperty('start_time')) {
    tableHtml += `<th class = "fontSize">Start Time</th>`;
  }
  if (arr[0].hasOwnProperty('duration_minute')) {
    tableHtml += `<th class = "fontSize">Duration(Minute)</th>`;
  }
  if (arr[0].hasOwnProperty('exam_activation_code')) {
    tableHtml += `<th class = "fontSize"  >Exam Activation Code</th>`;
  }

  // tableHtml += `<th>action </th>`;
  tableHtml += "</tr>";
  arr.forEach((result) => {
    tableHtml += "<tr>";
    var id;
    for (const key in result) {
      id = result.id || 1;
      if (result.hasOwnProperty(key)) {
        tableHtml += `<td class='${key === "content" ? "contentRow" : ""
          }'><div>`;

        tableHtml += result[key];

        tableHtml += `</div></td>`;
      }
    }
    tableHtml += "</tr>";
  });

  tableHtml += "</table>";

  return tableHtml;
}
run();

let selectedStatus = document.getElementById('status');
selectedStatus.addEventListener('change',async()=>{
  // console.log("change called");
  currentPage = 1;
  let status = selectedStatus.value;
  // console.log(status);
  let statusJson = JSON.stringify({ status: status });

  let resultsData = await fetch(
    "/admin/examTable",
    {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: statusJson,
    }
  );
  let jsondata = await resultsData.json();
  if (jsondata.msg) {
    document.getElementById("pagination").classList.add("hide");
    document.getElementById("recordsContainer").classList.add("hide");
    document.getElementById("norecordsfound").innerHTML =
      "Sorry No Records Found";
    document.getElementById("norecordsfound").style.color = "red";
  } else {
    currentPage = 1;
    document.getElementById("pagination").classList.remove("hide");
    document.getElementById("recordsContainer").classList.remove("hide");
    document.getElementById("norecordsfound").innerText = "";
    allRecords = jsondata;
    //  console.log("records are: ", allRecords);
    console.log(jsondata, "jsondata");
    allRecords.forEach((element) => {
      let dateTimeString = element.start_time
      dateTimeString = dateTimeConverter(dateTimeString)
      element.start_time = dateTimeString.dateString + " " + dateTimeString.timeString

    })
    console.log(allRecords, "allrecord");
    let totalRecords = jsondata.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById("pageTagSpan").innerText = currentPage;
    let tempRecords = jsondata.slice(
      (currentPage - 1) * recordsPerPage,
      (currentPage - 1) * recordsPerPage + recordsPerPage
    );
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
  }
});




//search functionality

let search = document.getElementById("searchText");
search.addEventListener("input", () => {
  currentPage = 1;
  let filteredResult;
  let search = document.getElementById("searchText");
  let input;
  if (allRecords.length > 0) {
    document.getElementById("pagination").classList.remove("hide");
    if (search.value === "" || !search.value) {
      recordsJson = allRecords;
    } else {
      if (isNaN(Number(search.value))) {
        input = search.value;
      } else {
        input = Number(search.value);
      }
      filteredResult = allRecords.filter((obj) => {
        return obj.title.match(input) || obj.title.match(input.toUpperCase()) || obj.title.match(input.toLowerCase());
      });
      recordsJson = filteredResult;
    }
  }
  else {
    document.getElementById("pagination").classList.add("hide");

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
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      "<p style= 'text-align: center; margin-top: 20px; font-size: 1.4em; font-weight:500;color:red;'>No Such record Matched<p>";
    document.getElementsByClassName("recordsContainer")[0].style = "color :red; text-align: center; margin-top: 20px;";
    document.getElementById("pagination").classList.add("hide");
  } else {
    document.getElementById("pagination").classList.remove("hide");
    // console.log("temp records",tempRecords);
    document.getElementsByClassName("recordsContainer")[0].innerHTML =
      generateTable(tempRecords);
  }
});

