// set values
function setValueUser(id, dbValue){
  document.getElementById(id).innerHTML = dbValue;
}

// fetching the data from the db  
async function fetchData(){
  try {
    const url = "/user";
    const response = await fetch(url);
    const data = await response.json();

    const ojbectKeys =  Object.keys(data.result);
    const ojbectValue =  Object.values(data.result);
    
    document.getElementById("welcomeUserName").innerHTML = data.result.fname;
    document.getElementById("fnameUser").innerHTML = data.result.fname + " " + data.result.lname;
    document.getElementById("profileName").innerHTML = data.result.fname;
    document.getElementById("emailUser").innerHTML = data.result.email;
    document.getElementById("profileImage").src = "/user/profileImage";
    document.getElementById("showImage").href = "/user/profileImage";
    ojbectKeys.forEach((key, i)=>{
      if(key == "dob"){
        setValueUser(key, ojbectValue[i]);
      } else {
        setValueUser(key,ojbectValue[i]);
      }
    });
    
  } catch (error) {
    console.log("error while setting up the value of profile = ", error);
  }
}

fetchData();

//  make exam details hidden and shows the profile
const examDetail = document.querySelector("#examDetails");
if(examDetail){
    examDetail  .hidden = true;
}
