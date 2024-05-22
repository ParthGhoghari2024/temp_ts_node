
let signin = document.getElementById("signinButton")
const emailTag = document.getElementById("email")
const passwordTag = document.getElementById("password")
const validRegexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
let success = true

const isLoggedin= async()=>{
  let data = await fetch("/currentUser", {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });

  data = await data.json();

  if (data.success) {
    window.location = data.location;
  }
}

isLoggedin()

const validate = () => {
  success = true
  let validate = document.querySelectorAll(".validate");
  validate.forEach(data => {
    data.remove()
  })
  if (emailTag.value.trim() === "") {
    getErrorMessege(emailTag, "*required")

  } else if (emailTag.value.trim() !== "" && !emailTag.value.match(validRegexEmail)) {
    getErrorMessege(emailTag, "email not valid")
  }

  if (passwordTag.value.trim() == "") {
    getErrorMessege(passwordTag, "*required")
  } else if (passwordTag.value.trim() != "" && passwordTag.value.trim().length < 8) {
    getErrorMessege(passwordTag, "Password must minimum 8 Character")
  }


}


emailTag.addEventListener("input", validate)


passwordTag.addEventListener("input", validate)
const formElement = document.querySelector("#register-form");

formElement.addEventListener("submit", async (e) => {
  e.preventDefault()
  const email = emailTag.value.trim()
  const password = passwordTag.value.trim()
  validate()
  success = true;
  if (success) {
    let data = await fetch("/", {
      method: "post",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    data = await data.json()
    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "Logged In Succesfully",
        showConfirmButton: false,
        timer: 2000
      }).then((result) => {
        window.location = data.location;
      })
    } else {
      Swal.fire({
        title: "Error",
        text: data.message,
        icon: "error"
      });
    }
  }
})

const getErrorMessege = (element, text) => {
  let span = document.createElement("span");
  element.insertAdjacentElement("afterend", span)
  span.classList.add("validate")
  span.innerHTML = text
  span.style.color = "red"
  span.style.fontSize = "12px"
  span.style.margin = "0 5px"
  success = false
}



//added cookie of timezone offset to track the timezone of user 
const setTimezoneOffsetInCookies = () => {
  document.cookie = `timezoneOffset=${new Date().getTimezoneOffset()};sameSite=Strict;path=/;` + document.cookie;
}
setTimezoneOffsetInCookies();