let fname = document.getElementById("fname");
let lname = document.getElementById("lname");
let email = document.getElementById("email");
let dob = document.getElementById("dob");
let contactno = document.getElementById("contactno");
let password = document.getElementById("password");
let confirmpassword = document.getElementById("confirmpassword");
let firstnameerror = document.getElementById("firstnameerror");
let lastnameerror = document.getElementById("lastnameerror");
let emailerror = document.getElementById("emailerror");
let doberror = document.getElementById("doberror");
let contacterror = document.getElementById("contacterror");
let pwderror = document.getElementById("pwderror");
let confirmpwderror = document.getElementById("confirmpwderror");
let emptyerror = document.getElementById("emptyerror");
let successspan = document.getElementById("successmsg");
let signupButton = document.getElementById("signupButton");
let registrationerror = document.getElementById("registrationerror");
let linkspan = document.getElementById("linkmsg");
let linkbutton = document.getElementById("link");

const isLoggedin = async () => {
  let data = await fetch("/currentUser", {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });
  data = await data.json();

  if (data.success) {
    window.location = data.location;
  }
};

isLoggedin();

fname.addEventListener("blur", (e) => {
  let namePattern = /^[a-zA-Z\s-]+$/;
  if(e.target.value == ""){
    firstnameerror.innerText = "Please Enter Name"
  }
  else if (!namePattern.test(e.target.value)) {
    firstnameerror.innerText = "Invalid Name";
  } else {
    firstnameerror.innerText = "";
  }
});


lname.addEventListener("blur", (e) => {
  let namePattern = /^[a-zA-Z\s-]+$/;
  if(e.target.value == ""){
    lastnameerror.innerText = "Please Enter Surname"
  }
  else if (!namePattern.test(e.target.value)) {
    lastnameerror.innerText = "Invalid Surname.";
  } else {
    lastnameerror.innerText = "";
  }
});

email.addEventListener("blur", (e) => {
  let validRegexEmail =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if(e.target.value == ""){
    emailerror.innerText = "Please Enter Email"
  }
  else if(!validRegexEmail.test(e.target.value)) {
    emailerror.innerText = "Invalid Email.";
  } else {
    emailerror.innerText = "";
  }
});

contactno.addEventListener("blur", (e) => {
  let contactRegex = /^\d{10}$/;
  if(e.target.value == ""){
    contacterror.innerText = "Please Enter Contact No"
  }
  else if (!contactRegex.test(e.target.value)) {
    contacterror.innerText = "Invalid Contact No";
  } else {
    contacterror.innerText = "";
  }
});

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
    // console.log("FAIL");
    return false;
  }
  return true;  
}

dob.addEventListener("blur", (e) => {
  let regxDate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g;
  console.log(!futureDateCheck(e.target.value))
  if(e.target.value == ""){
    doberror.innerText = "Please Enter Date"
  }
  else if (!regxDate.test(e.target.value) || !futureDateCheck(e.target.value)) {
    doberror.innerText = "Invalid Date.";
  } else {
    doberror.innerText = "";
  }
});

password.addEventListener("blur", (e) => {
  let passwordRegex =/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if(e.target.value == ""){
    pwderror.innerText = "Please Enter Password"
  }
  else if(e.target.value < 8) {
    pwderror.innerText = "Password should be of 8 characters long and number";
  } else {
    pwderror.innerText = "";
  }
});

confirmpassword.addEventListener("blur", (e) => {
  if(e.target.value == ""){
    confirmpwderror.innerText = "Please Enter Confirm Password"
  }
  else if(e.target.value != password.value) {
    confirmpwderror.innerText = "Password And Confirm Password Are Not Same..";
  } else {
    confirmpwderror.innerText = "";
  }
});


signupButton.addEventListener("click", async () => {
  let fname = document.getElementById("fname").value;
  let lname = document.getElementById("lname").value;
  let email = document.getElementById("email").value;
  let contactno = document.getElementById("contactno").value;
  let dob = document.getElementById("dob").value;
  let password = document.getElementById("password").value;
  let confirmpassword = document.getElementById("confirmpassword").value;

  if (
    fname == "" ||
    lname == "" ||
    email == "" ||
    dob == "" ||
    contactno == "" ||
    password == "" ||
    confirmpassword == ""
  ) {
    emptyerror.innerText = "Please Fill All The Required Fields..";
  } else if (
    firstnameerror.innerText == "" &&
    lastnameerror.innerText == "" &&
    emailerror.innerText == "" &&
    contacterror.innerText == "" &&
    doberror.innerText == "" &&
    pwderror.innerText == "" &&
    confirmpwderror.innerText == ""
  ) {
    emptyerror.style.display = "none";
    let basicDetails = {
      fname,
      lname,
      email,
      contactno,
      dob,
      password,
      confirmpassword,
    };

    let registrationApi = await fetch("/registration",{
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basicDetails),
    });
    let response = await registrationApi.json();
    
    if(response.success){
      successspan.innerText = "";
      Swal.fire({
        icon: "success",
        title: "Registered Succesfully",
        showConfirmButton: false,
        timer: 2000
      }).then((result) => {
        window.location.href = `registration/activationlink/:${response.activation_code}`;      })
      }

    else{
      Swal.fire({
        title: "Error",
        text: response.message,
        icon: "error"
      });
    }
  } 
  else {
    emptyerror.innerText = "Invalid Inputs...";
  }
});
