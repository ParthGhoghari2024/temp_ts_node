const container = document.querySelector("#alinkDiv");
function removeMessage(){
  const msgOld = document.querySelectorAll(".msg");
  if(msgOld){
    msgOld.forEach(element => {
      element.innerHTML = ""
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

const hrefLink = window.location.href;
document.getElementById("activateLinkInput").value = hrefLink.split("/:")[1];
const activationLinkVarify = document.getElementById("activateLink").addEventListener("click", varifyActivationLink);
async function varifyActivationLink(){
  try {
    const response = await fetch("/forgotPassword/varifyLink",{
      method : "post",
      body : JSON.stringify({activeLink : document.getElementById("activateLinkInput").value}),
      headers : {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json();
    if(data.success) {
      window.location = `/setpassword/:${data.activationKey}`;
    } else {
      document.getElementById("activateLink").innerHTML = `Link Expired`;
      if(data.message == "activation link expired"){
        removeMessage();
        const p = document.createElement("p");
        const a = document.createElement("a");
        p.innerHTML = "Click Here To Regenerate Token";
        p.style.fontWeight = "bolder"
        p.style.textAlign = "center"
        p.style.color = "blue";
        a.style.textDecoration = "none"; 
        a.href = "/forgotPassword";
        a.setAttribute("class", "msg");
        a.appendChild(p);
        container.appendChild(a);
      } else {
        showMessage(data.message);
      }
    
    }
  } catch (error) {
    console.log(error);
  }
}
