const checkCode = async () => {
    const inputData = inputCode.value;
    const inputId = ids("examRowId").value;
    if (inputData == "" || inputData == null) {
      console.log(ids("errMsg"));
      ids("errorMsg").innerHTML = "Please enter code";
      return;
    } else {
      try {
        const bodyObject = { id: inputId, code: inputData };
        console.log(bodyObject);
        const response = await fetch("/exam/examList", {
          method: "POST",
          body: JSON.stringify(bodyObject),
          headers: { "Content-Type": "application/json; charset=UTF-8" },
        });
        const data = await response.json();
      
        if (data.validation) {
          
          window.location=`/exam/startexam?exam=${data.examid}`
        }else{
          invalidValidation();
         
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  
  const invalidValidation = () => {
    ids("invalidPopup").style.display = "block";
    ids("popup").style.display = "none";
  };
  
  const backToPopup = () => {
    inputCode.value = "";
    ids("invalidPopup").style.display = "none";
    ids("popup").style.display = "block";
    ids("errorMsg").innerHTML = "";
  };
  

