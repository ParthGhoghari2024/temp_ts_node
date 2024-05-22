
//for messages
function removeMessage(){
  const msgOld = document.querySelectorAll(".msg");
  const container = document.querySelector("#container");
  if(msgOld){
    msgOld.forEach(element => {
      element.innerHTML = "";
    })
  }
}
function showMessage(message){
  removeMessage();
  const p = document.createElement("p");
  container.appendChild(p);
  p.setAttribute("class", "msg");
  p.innerHTML = message;
  p.style.textAlign = "center"
  p.style.color = "red";
}

const submit = document.getElementById("submit").addEventListener("click", updatePassword);
const hrefLink = window.location.href;
async function updatePassword(){
  try {
    const aKey = hrefLink.split("/:")[1];
    const password = document.getElementById("password").value;
    const rePassword = document.getElementById("repassword").value;
    const response = await fetch("/forgotPassword/newPassword", {
      method: "post",
      body: JSON.stringify({password : password , repassword: rePassword, aKey: aKey}),
      headers : { 
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json();
    // console.log(response);
    // console.log(data);
  
  
    const container = document.getElementById("container");
    if(data.success) {
      showMessage("");
      alert("Password Updated Successfully");
      window.location = `/`;
    } else {
      // document.getElementById("activateLink").innerHTML = "";
      showMessage(data.message);
    }
  } catch (error) {
    console.log(error);
  }
}

document.getElementById("cancel").addEventListener("click", ()=>{
  window.location = "/"
})