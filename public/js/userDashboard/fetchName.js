
async function fetchName(){
  try {
    const response = await fetch("/user");
    const data = await response.json();
    document.querySelector("#profileName").innerHTML = data.result.fname;
  } catch (error) {
    console.log(error);
  }
}


fetchName();