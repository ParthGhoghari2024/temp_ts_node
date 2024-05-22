//profile-photo
var photo = document
  .getElementById("camera-icon")
  .addEventListener("click", function openFile() {
    document.getElementById("myForm").style.display = "block";
  });

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

//Profile validation
let fname = document.getElementById("fname");
let lname = document.getElementById("lname");
let email = document.getElementById("email");
let phone_no = document.getElementById("phone_no");
let dob = document.getElementById("dob");
let address = document.getElementById("address");
let city = document.getElementById("city");
let state = document.getElementById("state");
let zipcode = document.getElementById("zipcode");
let about = document.getElementById("aboutinput");
let update = document.getElementById("update");
let err10 = document.getElementById("err10");

let required_field = Array.from(
  document.querySelectorAll(".form-control.userProfile.notnull")
);
let error_span = Array.from(document.querySelectorAll(".errorspan"));

required_field.map((field) => {
  field.addEventListener("input", (e) => {
    if (e.target.value == fname.value && e.target.value == "") {
      err1.innerText = "(Required)";
    } else if (e.target.value == fname.value && e.target.value != "") {
      err1.innerText = "";
      if (e.target.value.length > 30) {
        err1.innerText = "(Invalid length of First Name)";
      } else {
        err1.innerText = "";
      }
    }
    if (e.target.value == lname.value && e.target.value == "") {
      err2.innerText = "(Required)";
    } else if (e.target.value == lname.value && e.target.value != "") {
      err2.innerText = "";
      if (e.target.value.length > 30) {
        err2.innerText = "(Invalid length of Last Name)";
      } else {
        err2.innerText = "";
      }
    }
    if (e.target.value == email.value && e.target.value == "") {
      err3.innerText = "(Required)";
    } else if (e.target.value == email.value && e.target.value != "") {
      err3.innerText = "";

      let emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!emailRegex.test(email.value) || email.value.length > 70) {
        err3.innerText = "(Invalid Email Address)";
      } else {
        err3.innerText = "";
      }
    }
    if (e.target.value == phone_no.value && e.target.value == "") {
      err4.innerText = "(Required)";
    } else if (e.target.value == phone_no.value && e.target.value != "") {
      err4.innerText = "";
      let phone_no_Regex = /^\d{10}$/;

      if (!phone_no_Regex.test(e.target.value)) {
        err4.innerText = "(Invalid Contact Number)";
      } else {
        err4.innerText = "";
      }
    }
    if (e.target.value == dob.value && e.target.value == "") {
      err5.innerText = "(Required)";
    } else if (e.target.value == dob.value && e.target.value != "") {
      err5.innerText = "";
    }

    if (e.target.value == address.value && e.target.value != "") {
      if (e.target.value.length > 200) {
        err6.innerText = "(Invalid length of Address)";
      } else {
        err6.innerText = "";
      }
    }

    if (e.target.value == city.value && e.target.value != "") {
      if (e.target.value.length > 30) {
        err7.innerText = "(Invalid length of city)";
      } else {
        err7.innerText = "";
      }
    }

    if (e.target.value == state.value && e.target.value != "") {
      if (e.target.value.length > 45) {
        err8.innerText = "(Invalid length of state)";
      } else {
        err8.innerText = "";
      }
    }

    if (e.target.value == zipcode.value && e.target.value != "") {
      let zipcode_regex = /^\d{6}$/;
      if (!zipcode_regex.test(e.target.value)) {
        err9.innerText = "(Invalid Zipcode)";
      } else {
        err9.innerText = "";
      }
    }
    if (e.target == about && e.target.value != "") {
      if (e.target.value.length > 230) {
        err10.innerText = "(Invalid length of about)";
      } else {
        err10.innerText = "";
      }
    }
  });
});

required_field.map((field) => {
  field.addEventListener("input", function BTN() {
    let isNull = error_span.every((span) => span.innerText == "");
    if (!isNull) {
      update.disabled = true;
    } else {
      update.disabled = false;
    }
  });
});

// Upload Photo

const form = document.querySelector("#updateProfileImgForm");

async function sendData() {
  // Associate the FormData object with the form element
  const formData = new FormData(form);

  formData.append("image", document.getElementById("myphoto").value);

  console.log(formData);
  try {
    const response = await fetch("/admin/adminProfilePhotoUpload", {
      method: "POST",
      body: formData,
    });
    let resData = await response.json();
    console.log(resData);
    if (resData.success == "Success") {
      Swal.fire({
        title: "Yeah....",
        text: "Profile Photo Uploaded Successfully.",
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
          closeForm();
          window.location.reload();
        } else {
          closeForm();
          window.location.reload();
        }
      });
    } else if (resData.success == "Fail") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please upload valid file type '.jpg','.jpeg','.png'",
      });
    } else if (resData.fileLimitError == 1) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please upload valid file size must be less than 2MB",
      });
    }
  } catch (error) {
    console.log(error);
  }
}

document.getElementById("photo-submit").addEventListener("click", (event) => {
  event.preventDefault();
  sendData();
});

let file, upload;
file = document.getElementById("myphoto");
upload = document.getElementById("photo-submit");
upload.disabled = true;

file.addEventListener("change", function notBlur() {
  upload.disabled = false;
});

async function removePhoto() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Remove it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const response = await fetch("/admin/removePhoto", {
        method: "POST",
      });
      let resData = await response.json();
      if (resData.success == "success") {
        Swal.fire({
          title: "Then.....",
          text: "Your Profile Photo has been removed.",
          icon: "warning",
        }).then((result) => {
          if (result.isConfirmed) {
            closeForm();
            window.location.reload();
          } else {
            closeForm();
            window.location.reload();
          }
        });
      }
    }
  });
}

document.getElementById("remove-photo").addEventListener("click", (event) => {
  event.preventDefault();
  removePhoto();
});
