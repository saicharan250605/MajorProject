let review_comment = document.querySelector("#review_comment");
let form = document.querySelector("#review_form");
form.addEventListener("submit",(event)=>{
   if(review_comment.value.trim() ===""){
    event.preventDefault();
    review_comment.style.border="1px solid red";
    review_comment.nextElementSibling.style.display="inline-block";
   }
   review_comment.addEventListener("input",(event)=>{
    if(review_comment.value.trim() !==""){
        review_comment.nextElementSibling.nextElementSibling.style.display="inline-block";
        review_comment.nextElementSibling.style.display="none";
        review_comment.style.border="1px solid green";
    }
    else if(review_comment.value.trim() ===""){
        review_comment.nextElementSibling.style.display="inline-block";
        review_comment.nextElementSibling.nextElementSibling.style.display="none";
    }
   }); 
});