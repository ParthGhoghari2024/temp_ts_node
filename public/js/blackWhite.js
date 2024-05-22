const eye = document.querySelector("#eyeProtection");
eye.addEventListener("click", setDark);
const body = document.querySelector(".body");
const nav = document.querySelector("#nav");
const searchBarP = document.querySelector(".searchBarP");
const searchBar = document.querySelector(".searchBar");
const profile = document.querySelector("#profile")
const buttons = document.querySelectorAll(".tab ul li a");
const card = document.querySelectorAll(".card");
const ititle = document.querySelectorAll(".ititle");
const vtitle = document.querySelectorAll(".vtitle");
const blueBtn = document.querySelectorAll(".blueBtn");
const formContainer = document.querySelector("#myForm");
const input = document.querySelectorAll(".inputStyle");
eye.addEventListener("mouseover", ()=>{ eye.style.color = "#0a6faa"});
eye.addEventListener("mouseout", ()=>{ eye.style.color = "black"});

// window.addEventListener("load", ()=>{
//   if(localStorage.getItem("theme")=="black"){
//     dayNight();
//   } else {
//     localStorage.setItem("theme", "white");
//   }
// });


function theme(){
  if(localStorage.getItem("theme")=="black"){
    dayNight();
  } else {
    localStorage.setItem("theme", "white");
  }
}
theme();

function setDark(){
  console.log(localStorage.getItem("theme"), "xxxxxxxxxx");
  if(localStorage.getItem("theme") == null || localStorage.getItem("theme")=="white"){
    localStorage.setItem("theme", "black");
    dayNight();
  }else {
    localStorage.setItem("theme", "white");
    window.location = window.location;
  }
}



function dayNight(){
  try {
    if(document.querySelector(".white")){
      eye.addEventListener("mouseout", ()=>{ eye.style.color = "white"});
      eye.setAttribute("class", "black");
      eye.removeAttribute("white");

      body.style.backgroundColor = "#000";
      body.style.color = "whitesmoke";
      nav.style.backgroundColor = "#002f4b";
      nav.style.color = "whitesmoke";
      
      if(input.length){
        input.forEach(element => {
          element.style.backgroundColor = "#97a7b8";
          element.style.color = "#fff";
          // element.placeholder.color = "red";
          console.log(element.placeholder);
        })
      }

      if(formContainer){
        formContainer.style.color = "black";
      }
      if(searchBarP){
        searchBarP.style.backgroundColor = "white";
        searchBarP.style.color = "black";
      }
      if(card.length){
        card.forEach(element => {
          element.style.backgroundColor = "#002f4b";
          element.style.backgroundColor = "#002f4b";
        })
      }
  
      if(ititle.length){
        ititle.forEach((element) => {
          element.style.color = "white";
        })
      }
  
      if(vtitle.length){
        vtitle.forEach((element) => {
          element.style.color = "white";
        })
      }
  
      if(blueBtn.length){
        blueBtn.forEach((element) => {
          element.style.backgroundColor = "#0a6faa";
        })
      }
      
   
      buttons[0].style.color = "#ffffff";  
      buttons[1].style.color = "#ffffff";  
    } 
  } catch (error) {
    console.log(error);
  }
}