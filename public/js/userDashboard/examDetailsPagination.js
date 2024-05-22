
//PopUp Box 

inputCode = ids("activation-code");

const show = (id, recordId) => {
  inputCode.value = "";

  ids(id).style.display = "block";
  ids("examRowId").value = `${recordId}`;
};

const hide = (id) => {
  ids(id).style.display = "none";
  inputCode.value = "";
  ids("errorMsg").innerHTML = "";
};



// Display Exam Count in Card Section
const displayMissedExamCount = querrySelect('#missedExamCount p:nth-child(2)'),
  displayTodayExamCount = querrySelect('#todayExamCount p:nth-child(2)'),
  displayUpcomingExamCount = querrySelect('#upcomingExamCount p:nth-child(2)'),
  displayGivenExamCount = querrySelect('#givenExamCount p:nth-child(2)');


const showExamCount = () => {
  let examCount = data.examCount;
  displayMissedExamCount.innerHTML = examCount.missedExamCount;
  displayTodayExamCount.innerHTML = examCount.ongoingExamCount
  displayUpcomingExamCount.innerHTML = examCount.upcomingExamCount
  displayGivenExamCount.innerHTML = examCount.givenExamCount
}

// Fetching Exam Details 
let page = 0;
let data;
let recordData;
const tableBody = querrySelect(".examtable table tbody");
const tableHeadExamStatus = querrySelect(".examtable table thead tr :last-child");
const examStatusDisplay = ids('examStatus');
const examsHavingCountdown = []
let showCountDown = false;
const fetchExamDetails = async () => {
  try {
    const result = await fetch("/exam/examList");
    data = await result.json();
    recordData = data.list.totalExamList;
    if(recordData.length<10){
      pagginationElement.style = "visibility:hidden;";
  }
  else{
    pagginationElement.style= "visibility:visible;"
    
  }
    showCountDown = true;
    viewData(page * 0, (page + 1) * 10);
    showCountDownCondition(showCountDown);
    examStatusDisplay.innerHTML = "Total Exams";
    showExamCount();
  } catch (error) {
  }
};

window.addEventListener("load", fetchExamDetails);

const showOngoingExamData = () => {
  tableHeadExamStatus.innerHTML = `Start Exam`;
  recordData = data.list.ongoingExamList;
  showCountDown = false;
  searchModuleCodeBlock(recordData);
  examStatusDisplay.innerHTML = "Ongoing Exams";


}

const showGivenExamData = () => {
  tableHeadExamStatus.innerHTML = `Given Exam`;
  recordData = data.list.givenExamList;
  showCountDown = false;
  searchModuleCodeBlock(recordData);
  examStatusDisplay.innerHTML = 'Given Exams';


}

const showMissedExamData = () => {
  tableHeadExamStatus.innerHTML = `Missed Exam`;
  recordData = data.list.missedExamList;
  showCountDown = false;
  searchModuleCodeBlock(recordData);
  examStatusDisplay.innerHTML = 'Missed Exam';

}

const showUpcomingExamData = () => {
  tableHeadExamStatus.innerHTML = `Start In`;
  examsHavingCountdown.length = 0;
  recordData = data.list.upcomingExamList;
  showCountDown = true;
  searchModuleCodeBlock(recordData);
  examStatusDisplay.innerHTML = "Upcoming Exams"
}

const emptyListHandle = (data) => {
  if (data.length == 0) {    
    examsHavingCountdown.length =0;
    tableBody.innerHTML = `<tr><td colspan ="6" style="text-align:center; color:red; font-weight:bold;">No Record Found!</td></tr>`;
    return;
  }
  page = 0;
  viewData(page * 10, (page + 1) * 10);
  showCountDownCondition(showCountDown);
}

const pagginationElement = querrySelect(".pagination");
const searchAreaBlock  = querrySelect(".searchBox");
const searchModuleCodeBlock =(recordData)=>{
  inputElement.value ="";
  flag = true;
  if(recordData.length<10){
    pagginationElement.style = "visibility:hidden;";
  }
  else{
    pagginationElement.style= "visibility:visible;"
    
  }
  if(recordData.length==0){
    searchAreaBlock.style = "visibility:hidden;"
  }else{
    searchAreaBlock.style = "visibility:visible;"
    
  }
  emptyListHandle(recordData);

}

// Paggination Code
const nextPage = () => {
  page++;
  viewData(page * 10, (page + 1) * 10);
  showCountDownCondition(showCountDown);
};

const previousPage = () => {
  page--;
  if (page <= 0) {
    page = 0;
    viewData(page * 10, (page + 1) * 10);
    showCountDownCondition(showCountDown);
  } else {
    viewData(page * 10, (page + 1) * 10);
    showCountDownCondition(showCountDown);
  }
};

const lastPage = () => {
  if (recordData.length == 0) {
    page = 0;
    viewData(page * 10, (page + 1) * 10);
    showCountDownCondition(showCountDown)
  }
  else {
    page = Math.floor(recordData.length / 10);
    viewData(page * 10, (page + 1) * 10);
    showCountDownCondition(showCountDown);

  }
};


const firstPage = () => {
  page = 0;
  viewData(page * 10, (page + 1) * 10);
  showCountDownCondition(showCountDown);
};

const updateTimer = (idArray) => {
  idArray.forEach(id => {
    querrySelect(`#${id.id} td:last-child a`).innerHTML = remainTime(id.examRecord);
  });
}

// Generate table Row
const viewData = (start, end) => {
  examsHavingCountdown.length = 0;
  const list = recordData;
  let html = "";
  if (end > recordData.length && recordData.length % 10 != 0) {
    end = start + (recordData.length % 10);
    if (end > recordData.length) {
      page--;
      return;
    }
  }
  else if (end > recordData.length) {
    page--;
    viewData(page * 10, (page + 1) * 10);
    return;
  }
  for (let index = start; index < end; index++) {


    let timeString = list[index].dateString + " " + list[index].timeString
    timeString = dateTimeConverter(timeString)
   
   


    let html1 = `<tr id=row${index}>
    <td>${index + 1}</td> 
    <td>${list[index].title}</td>
    <td>${timeString.dateString}</td>
    <td>${timeString.timeString}</td>
    <td>${list[index].duration_minute} </td>`;

    let html2 = `<td><button  class="btn  btn-outline-success" onclick="show('popup', ${list[index].id
      })"   >Start Exam</button></td>`;

    let html3 = `</tr>`;
    // console.log(list[index]);
    if (list[index].isGiven) {
      html2 = `<td><a class="given noExam  btn-outline-success btn " href="/user/userscore/?exam_id=${list[index].id}">Show Result </a></td>`;

    }
    else if (list[index].isUpcoming) {

      const examRowObject = {
        id: `row${index}`,
        examRecord: list[index]
      }
      examsHavingCountdown.push(examRowObject);


      html2 = `<td><a class="upcoming noExam ">${remainTime(examRowObject.examRecord)} </a></td>`;
    }

    else if (list[index].isMissed) {
      html2 = `<td><a class="missed noExam text-danger ">Missed <i class="fa-solid fa-exclamation"></i></a></td>`;
    }


    html += html1 + html2 + html3;


  }

  tableBody.innerHTML = html;
};



//Count remaining time for exam


const remainTime = (examRecordObject) => {
  const examStartTime = examRecordObject.dateString + " " + examRecordObject.timeString;

  let offset = new Date().getTimezoneOffset()

  let newexamStartTime = new Date(examStartTime).getTime() - (offset * 60 * 1000)

  const timeDifference = Math.ceil((newexamStartTime - new Date().getTime()) / 1000);

  let html;
  if(timeDifference==0 ){
      examRecordObject.isUpcoming = 0;
      data.list.upcomingExamList.shift();
      data.examCount.upcomingExamCount--;
      data.examCount.ongoingExamCount++;
      data.list.ongoingExamList.unshift(examRecordObject);
      
      showExamCount();
      if (data.list.upcomingExamList.length == 0) {
        examsHavingCountdown.length =0;
        tableBody.innerHTML = `<tr><td colspan ="6" style="text-align:center; color:red; font-weight:bold;">No Record Found!</td></tr>`;
    return;
      }


      viewData(page*10, (page+1)*10);  

  
  }
  else {

  }
  let hours = Math.floor(timeDifference / 3600);
  let minute = Math.floor((timeDifference % 3600) / 60);
  let sec = Math.floor((timeDifference % 3600) % 60);
  if (hours < 10) {
    hours = "0" + Number(hours)
  }
  if (minute < 10) {
    minute = "0" + Number(minute)
  } if (sec < 10) {
    sec = "0" + Number(sec)
  }

  html = `${hours}:${minute}:${sec} <i class="fa-regular fa-clock"></i> `
  return html;
}

let myInterval;

const remainTimeCountDown = () => {
  updateTimer(examsHavingCountdown);
}

const showCountDownCondition = (isCountDown) => {
  if (!isCountDown) {
    clearInterval(myInterval);
  }
  else {
    myInterval = setInterval(remainTimeCountDown, 1000);
  }
}



// Search Functionality based on Exam name
let tempRecordData;
let flag = true;
const searchExamRecord = () => {
  if (flag) {
    tempRecordData = recordData;
    flag = false;
  }
  recordData = tempRecordData;
  console.log(tempRecordData.length);
  showCountDown = false;
  const searchString = inputElement.value;
  console.log(searchString);
  if (searchString.trim() == "") {
    emptyListHandle(recordData);
    return;
  }
  let resultExamRecordArray = [];
  recordData.forEach(element => {
    if (element.title.toLowerCase().startsWith(searchString.trim().toLowerCase())) {
      if (element.isUpcoming) {
        showCountDown = true;
      }
      resultExamRecordArray.push(element)
    }

  });
  recordData = resultExamRecordArray;
  console.log(recordData.length);
  emptyListHandle(recordData);

}
const inputElement = ids("searchExam");
inputElement.addEventListener("input", searchExamRecord);

