let form = document.querySelector("form");
let allFormInputs = document.querySelectorAll(".all-form-inputs");
form.addEventListener("submit",(event)=>{
    for( eachFormInput of allFormInputs){
        if(eachFormInput.value.trim() === ""){
            eachFormInput.style.border="1px solid #fe424d";
            eachFormInput.nextElementSibling.style.display="inline-block";
            event.preventDefault();
        }
        eachFormInput.addEventListener("input",(event)=>{
            if(event.target.value.trim()!==""){
                event.target.style.border="1px solid green";
                event.target.nextElementSibling.nextElementSibling.style.display="inline-block";
                event.target.nextElementSibling.style.display="none";
            }
            if(event.target.value.trim() ===""){
                event.target.style.border="1px solid #fe424d";
                event.target.nextElementSibling.style.display="inline-block";
                event.target.nextElementSibling.nextElementSibling.style.display="none";
            }
        });   
    }
});