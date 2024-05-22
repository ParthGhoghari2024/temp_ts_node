

function popupFn(){
  document.getElementById('category').value = "";
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popupDialog").style.display = "block";
  document.getElementById("editCategory").style.display = "none";
  document.getElementById("saveCategory").style.display = "block";
  document.getElementById("addcategory").style.display = "block";
  document.getElementById("editCategoryy").style.display = "none";
}

function closeFn(){
  document.getElementById('categoryError').innerText = "";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popupDialog").style.display = "none";
}

async function saveCategory(){
  let namePattern = /([a-zA-Z0-9_\s]+)/;
  let categoryName = document.getElementById('category').value.trim();
  if(categoryName == ""){
    document.getElementById('categoryError').innerText = "please enter category";
  }
  else if(!namePattern.test(categoryName)){
    document.getElementById('categoryError').innerText ="please enter valid Category"
  }
  else{
  document.getElementById('categoryError').innerText = "";
  let category = await fetch(`/admin/exams/topics?category=${categoryName}`,{method:"post"}); 
  let response = await category.json();
  if(response.success == 1){
    document.getElementById('categoryError').innerText = "";
    Swal.fire({
      icon: "success",
      title: "Category Added Succesfully",
      showConfirmButton: false,
      timer: 2000
    }).then((result) => {
      window.location.href = '/admin/exams/topics'
    })
  }
   if(response.success == 0){
    document.getElementById('categoryError').innerText = response.message;
  }     
  }
}

async function editCategory(id){
  let namePattern = /([a-zA-Z0-9_\s]+)/;
  document.getElementById('category').value = "";
  document.getElementById("saveCategory").style.display = "none";
  document.getElementById("editCategory").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popupDialog").style.display = "block";
  document.getElementById("addcategory").style.display = "none";
  document.getElementById("editCategoryy").style.display = "block";

  let editCategory= document.getElementById('editCategory');
  editCategory.addEventListener("click", async function(){
  let categoryName = document.getElementById('category').value.trim();
  if(categoryName == ""){
    document.getElementById('categoryError').innerText = "please enter category";
  }
  else if(!namePattern.test(categoryName)){
    document.getElementById('categoryError').innerText ="please enter valid Category"
  }
  else{
    document.getElementById('categoryError').innerText = ""; 
    let editCategory = await fetch(`/admin/exams/topics/editCategory?id=${id}&category=${categoryName}`, {method:"post",  headers: { 'Content-Type': 'application/json' }});
    let response = await editCategory.json();
    if(response.success == 0){
      document.getElementById('categoryError').innerText = response.message;
    }   
    if(response.success == 1){
      document.getElementById('categoryError').innerText = ""; 
      Swal.fire({
        icon: "success",
        title: "Category Edited Succesfully",
        showConfirmButton: false,
        timer: 2000
      }).then((result) => {
        window.location.href = '/admin/exams/topics'
      })
    } 
  }
  })
}

async function deleteCategory(id){
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(async(result) => {

      if (result.isConfirmed) {
          Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
          }).then(async()=>{
              let deleteCategory = await fetch(`/admin/exams/topics/deleteCategory/${id}`,{method:"post"});   
              let response = await deleteCategory.json();
              if(response.success == 1){
                 window.location.href ='/admin/exams/topics'
               }
            })
      }
    });
}

