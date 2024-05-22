// forget password send data
const singin = document.getElementById("signinButton").addEventListener("click", sendData);
async function sendData(){
  try {
    const response = await fetch("/forgotPassword/varify",{
      method : "post",
      body : JSON.stringify({email : document.getElementById("email").value}),
      headers : {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json();
  
    if(data.success){
      removeMessage();
      window.location = `/activationLink/:${data.activationKey}`;
    } else {
      showMessage(data.message);
    }
  } catch (error) {
    console.log(error);
  }
}

  

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

