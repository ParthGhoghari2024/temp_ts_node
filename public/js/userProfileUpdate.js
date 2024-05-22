

function errorMessage(field, message) {
  let span = document.createElement("span");
  field.insertAdjacentElement("afterend", span)
  span.classList.add("solved")
  span.textContent = message;
  span.style.color = "red"
  // span.style.position = "absolute"
  span.style.fontSize = "12px"
  span.style.margin = "0 5px"
}

function profileImageValidation() {
  let flag = true;

  // preview and validate
  let fileTag = document.getElementById("image"),
  preview = document.getElementById("profileImage");

  fileTag.addEventListener("change", function () {
    flag = changeImage(this);
  });
  
  return flag;
}


// preview and validate
let fileTag = document.getElementById("image"),
preview = document.getElementById("profileImage");

fileTag.addEventListener("change", function () {
  changeImage(this);
});

function changeImage(input) {
  let reader;
  if (input.files && input.files[0]) {
    let file = input.files[0];
    if(file.size > 1024 * 1024 * 2){
      rimage.innerHTML = "File must be smaller than 2MB";
      rimage.style.color = "red";
      return false;
    } else {
      rimage.innerHTML = "";
    }

    let allowedImageTypes = ["image/jpeg", "image/gif", "image/png"];
    if(!allowedImageTypes.includes(file.type)){
      rimage.innerHTML = "Invalid File Type";
      rimage.style.color = "red";
      return false;
    } else {
      rimage.innerHTML = "";
    }

    reader = new FileReader();

    reader.onload = function (e) {
      preview.setAttribute('src', e.target.result);
    }

    reader.readAsDataURL(input.files[0]);
  }
}


function whiteSpaceRemove(str) {
  return str.trim();
}

function numberCheck(str) {
  return !isNaN(str)

}

function minLengthCheck(str, n = 1) {
  return str.length < n;
}

function maxLengthCheck(str, n = 30) {
  return str.length > n;
}

function validatation() {
  let validate = document.querySelectorAll(".validate")
  let solved = document.querySelectorAll(".solved");

  let a = true;
  solved.forEach(data => {
    data.remove()
  })

  validate.forEach(data => {
    if (data.value.trim() == "") {
      a = false;
      errorMessage(data, "Required*");
    }
  });

  if (a) {

    if (!checkDate("dob")) {
      const dob = document.querySelector("#dob");
      a = false;
      errorMessage(dob, "enter valid date");
    }

    if (!checkEmail()) {
      a = false;
    }

    if (!valueValidation("phone_no", 4, 15)) {
      a = false;
      document.getElementById("rphone_no").innerHTML = "enter valid phone number";
      document.getElementById("rphone_no").classList.add("solved")
      // errorMessage("phone_no", "enter valid phone number");
    }

    if (document.getElementById("zipcode").value != "") {
      if (!valueValidation("zipcode", 6, 6)) {
        a = false;
        document.getElementById("rzipcode").innerHTML = "enter valid zip code";
      } else {
        document.getElementById("rzipcode").innerHTML = "";
      }
    }
    if (document.getElementById("about").value != "") {
      if (!valueValidation("about", 0, 255)) {
        a = false;
        document.getElementById("rabout").innerHTML = "max character length 255!"
        document.getElementById("rabout").style.fontSize = "12px"
      } else {
        document.getElementById("rabout").innerHTML = "";
      }
    }

    valueValidationFieldArr = ["fname", "lname"];

    valueValidationFieldArr.forEach(field => {
      if (!valueValidation(field, 2, 60)) {
        errorMessage(document.querySelector(`#${field}`), "enter valid values!");
        a = false;
      }
    });

    if (!profileImageValidation()) {
      alert("upload only jpeg, jpg or png file");
      a = false;
    }
  } 


  return a;
}

function futureDateCheck(dates){
  const currentDate = new Date();
  let dd = currentDate.getDate();
  let mm = currentDate.getMonth() + 1;
  const yyyy = currentDate.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  } 
  if (mm < 10) {
    dd = '0' + dd;
  }
  const dateR = `${yyyy}-${mm}-${dd}`;
  const cDate = new Date(dateR);
  const uDate = new Date(dates)
  if(cDate < uDate){
    return false;
  }
  return true;  
}


function checkDate(fieldId) {

  console.log(fieldId);
  let date = document.getElementById(fieldId).value;
  console.log("date", date);

  // Date format: YYYY-MM-DD
  var datePattern = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

  // Check if the date string format is a match
  var matchArray = date.match(datePattern);
  if (matchArray == null) {
    return false;
  }

  // Remove any non digit characters
  var dateString = date.replace(/\D/g, '');

  // Parse integer values from the date string
  var year = parseInt(dateString.substr(0, 4));
  var month = parseInt(dateString.substr(4, 2));
  var day = parseInt(dateString.substr(6, 2));

  // Define the number of days per month
  var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Leap years
  if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
    daysInMonth[1] = 29;
  }

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  if (!futureDateCheck(date)) {
    return false;
  }
  return true;
}

// email check
function checkEmail() {
  var email = document.getElementById('email');
  var filter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!filter.test(email.value)) {
    errorMessage(email, "enter valid email");
    return false;
  } else {
    return true;
  }
}


// max min length and numeric validations
function valueValidation(FieldId, minLen = 2, maxLen = 50) {

  if (FieldId == null || FieldId == undefined) {
    return false;
  }

  const fieldValue = document.getElementById(FieldId).value;
  // console.log(fieldValue)


  const fValue = whiteSpaceRemove(fieldValue);
  // console.log("trmvalue=", fValue);

  if (minLengthCheck(fValue, minLen)) {
    console.log("min check false")
    return false;
  } else {
    console.log("min true");
  }


  if (maxLengthCheck(fValue, maxLen)) {
    console.log("max check false")
    return false;
  } else {
    console.log("max true");
  }

  if (FieldId == "phone_no" || FieldId == "zipcode") {
    if (!numberCheck(fValue)) {
      console.log("phone or zip num check failed");
      return false;
    } else {
      console.log(" phone or zip num true");
    }
  } else {
    if (numberCheck(fValue)) {
      console.log("num chekc failed");
      return false;
    } else {
      console.log("num true");
    }
  }
  return true;
}



// set values
function setValueUser(id, dbValue) {
  console.log("set Value callled");
  console.log(id, dbValue, "set valk")
  document.getElementById(id).value = dbValue;
}

// fetching the data from the db  
async function fetchData() {
  const url = "/user";
  const response = await fetch(url);
  const data = await response.json();

  const ojbectKeys = Object.keys(data.result);
  const ojbectValue = Object.values(data.result);
  try {
    document.getElementById("welcomeUserName").innerHTML = data.result.fname;
    document.getElementById("fnameUser").innerHTML = data.result.fname + " " + data.result.lname;
    document.getElementById("emailUser").innerHTML = data.result.email;
    document.getElementById("profileImage").src = "/user/profileImage";
    document.getElementById("showImage").href = "/user/profileImage";
  } catch (error) {
    console.log("error while setting up the values = ", error);
  }
  ojbectKeys.forEach((key, i) => {
    if (key == "about") {
      document.getElementById("about").innerHTML = ojbectValue[i];
    }
    else if (key == "dob") {
      try {
        document.getElementById(key).value = ojbectValue[i];
      } catch (error) {
        console.log("error while setting dob value = ", error);
      }
    } else {
      try {
        document.getElementById(key).value = ojbectValue[i];
      } catch (error) {
        console.log("error while setting values = ", error);
      }
    }
  });
}


fetchData();



// make exam details hidden and shows the profile
const examDetails = document.querySelector("#examDetails");
if (examDetails) {
  examDetails.hidden = true;
}


async function sendData() {
  if (validatation()) {
    try {
      const formData = new FormData();

      const fields = ["fname", "lname", "email", "dob", "phone_no", "address", "state", "city", "zipcode", "id", "about"];

      fields.forEach((field) => {
        formData.append(field, document.getElementById(field).value)
      })

      let profile = document.getElementById('image');
      formData.append('image', profile.files[0])

      const response = await fetch("/user/userProfile/update", {
        method: 'POST',
        body: formData,
      })
      const data = await response.json();
      if (data.success) {
        window.location = "/user/userProfile";

      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log("error while making fetch request = ", error);
    }
  }
}

const updateUser = document.getElementById("update");
updateUser.addEventListener("click", sendData);

// remove profiel
document.getElementById("remove").addEventListener("click", removeProfile);
async function removeProfile() {
  const ans = confirm("are you sure you want to remove profile?");
  if (ans) {
    try {
      const response = await fetch("/user/removeProfile", {
        method: "POST",
        body: JSON.stringify({ id: document.getElementById("id").value }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      console.log(data.success);
      if (data.success) {
        console.log("user prfile updated")
        window.location = "/user/userProfile/update";
      } else {
        alert("something went wrong I don't know!");
      }
    } catch (error) {
      console.log(error);
    }

  }
}
