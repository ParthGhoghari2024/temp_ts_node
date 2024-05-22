let currentPage = 1;
let recordsPerPage = 5;
let totalPages;
let recordsJson;
let allRecords;
let optionExams = ``;

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
    input = input.toLowerCase();
    filteredResult = allRecords.filter((obj) => {
      return Object.values(obj).some(
        (val) =>
          val.match(input.toLowerCase()) || val.match(input.toUpperCase())
      );
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
    return fetch("/admin/students/getstudentdetails");
  };
  let resultsData = await fetchRecords();
  recordsJson = await resultsData.json();
  if (recordsJson.msg) {
    document.getElementById("title").classList.add("hide");
    document.getElementById("norecordsfound").innerText =
      "There Are No Students";
    document.getElementById("norecordsfound").style.color = "red";
    document.getElementById("paginationController").classList.add("hide");
    document.getElementById("searchText").classList.add("hide");
  } else {
    document.getElementById("paginationController").classList.remove("hide");
    document.getElementById("searchText").classList.remove("hide");
    allRecords = recordsJson;
    let totalRecords = recordsJson.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById("pageTagSpan").innerText = currentPage;
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
    let tempRecords = recordsJson.slice(
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
  if (currentPage == totalPages) {
    document.getElementById("paggingLink-next").disabled = true;
  } else {
    document.getElementById("paggingLink-next").disabled = false;
  }
  var tableHtml = "<table  class='resultsTable table table-hover'>";
  tableHtml += "<tr class='headRow'>";
  tableHtml += "<th class='bigfont'> No.</th>";
  for (const key in arr[0]) {
    if (arr[0].hasOwnProperty(key)) {
      tableHtml += `<th class="bigfont">${key}</th>`;
    }
  }
  tableHtml += "</tr>";

  arr.forEach((result, index) => {
    tableHtml += "<tr>";
    let serialNumber = (currentPage - 1) * recordsPerPage + index + 1;
    tableHtml += `<td>${serialNumber}</td>`;
    let id;
    for (const key in result) {
      id = result.id || 1;
      if (result.hasOwnProperty(key)) {
        tableHtml += `<td class='${
          key === "content" ? "contentRow" : ""
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
