
const displayCurrentTime = ()=>{
    var date = new Date()
    ids("currentTime").innerHTML = date.toLocaleTimeString('en-US',{hour12:true});
  }
  displayCurrentTime();
  setInterval(displayCurrentTime, 1000);