
const hrefLink = window.location.href; 
document.getElementById("activateLinkInput").value = hrefLink.split("/:")[1];

document.getElementById("activatationLink").onclick = async()=>{
  try{
    // console.log("hello")
    const response = await fetch("/registration/verifyLink",{
      method : "post",
      body : JSON.stringify({activationLink : document.getElementById("activateLinkInput").value}),
      headers : {
        'Content-Type': 'application/json'
      }
})
    const data = await response.json();
    if(data.success){
      Swal.fire({
        icon: "success",
        title: "Activated Succesfully",
        showConfirmButton: false,
        timer: 2000
      }).then((result) => {
        window.location.href = `/`;      })
    } 
    else {
      if(data.message == "Invalid user"){
        Swal.fire({
          title: "Error",
          text: data.message,
          icon: "error"
        });
      }
      else if(data.message == "user already activated"){
        Swal.fire({
          title: "Error",
          text: data.message,
          icon: "error"
        });
      }
      else{
        document.getElementById("activatationLink").innerHTML = `Link Expired`;
        Swal.fire({
          title: "Error",
          text: "Link Expires please register again",
          icon: "error",
        }).then((result) => {
          window.location.href = `/registration`      })
      }
    }
  } catch (error) {
    console.log(error);
  }
}
