let recordList;
let tempRecordsList;
let page = 0;

(async () => {
  try {
    let result = await fetch("/user/userFeedback/getAllFeedbacks");
    let jsonData = await result.json();
    recordList = jsonData[0];
    tempRecordsList = jsonData[0];
    if (recordList.length == 0) {
      norecord = "<tr><td colspan=5 id='nr'>No Record Found :(</td></tr>";
      tableBody.innerHTML = norecord;
      document.querySelector("#nr").style.color = "#075e91";
      document.querySelector("#nr").style.fontWeight = "bold";
      document.querySelector("#nr").style.textAlign = "center";
      return;
    } else {
      recordList.forEach((element) => {
        let dateTimeString = element.date
        dateTimeString = dateTimeConverter(dateTimeString)
        element.date = dateTimeString.dateString
      })
        viewData(recordList, 0,10);
    }
  } catch (error) {
    console.log(error);
  }
})();

socket.on("receive feedback", async () => {
  let result = await fetch("/user/userFeedback/getAllFeedbacks");
  let resultJsonData = await result.json();
  recordList = await resultJsonData[0];
  recordList.forEach((element) => {
    let dateTimeString = element.date
    dateTimeString = dateTimeConverter(dateTimeString)
    element.date = dateTimeString.dateString
  })
  viewData(recordList, 0,10);
  document.querySelector(".pagination").hidden = false;
});

// Paggination Code
const nextPage = () => {
  page++;
  var start = page * 10,
  end = (page + 1) * 10;
  viewData(recordList, start, end);
};

const previousPage = () => {
  page--;
  if (page <= 0) {
    viewData(recordList, 0, 10);
    page = 0;
  } else {
    viewData(recordList, page * 10, (page + 1) * 10);
  }
};

const lastPage = () => {
  if (recordList.length == 0) {
    page = 0;
    viewData(recordList, 0, 10);
  }
  else {
    page = Math.floor(recordList.length / 10);
    start = page * 10;
    end = start + (recordList.length % 10);
    viewData(recordList, start, end);

  }
};

const firstPage = () => {
  page = 0;
  viewData(recordList, 0, 10);
};



const tableBody = document.querySelector(".feedbackTable #tbody");
const viewData = (recordList, start, end) => {
  const list = recordList;
  let html = "";
  if (end > recordList.length && recordList.length % 10 != 0) {
    end = start + (recordList.length % 10);
    if (end > recordList.length) {
      page--;
      return;
    }
  } else if (end > recordList.length) {
    page--;
    return;
  }
  // console.log(list);
  for (let index = start; index < end; index++) {
    html += `<tr>
    <td>${index + 1}</td> 
    <td>${list[index].fname} ${list[index].lname}</td>
    <td>${list[index].title}</td>
    <td>${list[index].date}</td>
    <td><p class="viewBtn viewBtnP" onclick="openForm(${
      list[index].feedback
    })">View</p></td>`;
  }

  tableBody.innerHTML = html;
};

// pop up

const searchResults = () => {
  const lValue = document.querySelector("#searchBar").value.toLowerCase();
  const match = recordList.filter(data => {
    if(data.title.toLowerCase().includes(lValue) || data.date.includes(lValue) || data.fname.toLowerCase().includes(lValue)||data.lname.toLowerCase().includes(lValue)){
      return data;
    }
  })
  // console.log(match);
  if(match.length){
    viewData(match, 0, 10);
    if(match.length >= 10){
      document.querySelector(".pagination").hidden = false;
    }
  } else {
    norecord = "<tr><td colspan=5 id='nr'>No Record Found :(</td></tr>";
    tableBody.innerHTML = norecord;
    document.querySelector("#nr").style.color = "#075e91";
    document.querySelector("#nr").style.fontWeight = "bold";
    document.querySelector("#nr").style.textAlign = "center";
    document.querySelector(".pagination").hidden = true;
  }
} 
document.querySelector("#searchBar").addEventListener("input", searchResults);
// the pops
function openForm(FEEDVAL) {
  document.getElementById("myForm").style.display = "block";
  document.getElementById("feedback-popup-id").innerText = FEEDVAL;
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}



