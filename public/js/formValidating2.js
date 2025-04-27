let form = document.querySelector("form");
let allFormInputs = document.querySelectorAll(".all-form-inputs");
let preview = document.querySelector("#preview");
let previewDiv = document.querySelector("#previewDiv");
let listingImage = document.querySelector(".listing_image");
form.addEventListener("submit",(event)=>{
    for(eachFormInput of allFormInputs){
        if(eachFormInput.value.trim() === ""  &&  eachFormInput.getAttribute("id") !== "listing[image]" ){
            event.preventDefault();
        }
    }
});
for(eachFormInput of allFormInputs){
    eachFormInput.addEventListener("input",(event)=>{
        if(event.target.value.trim() !=="" && event.target.getAttribute("id") !== "listing[image]" ){
            event.target.nextElementSibling.style.display="none";
            event.target.style.border="1px solid rgba(128, 128, 128, 0.856)";
        }
        if(event.target.value.trim() ==="" && event.target.getAttribute("id") !== "listing[image]" ){
            event.target.style.border="1px solid red";
            event.target.nextElementSibling.style.display="inline-block";
            event.target.nextElementSibling.nextElementSibling.style.display="none"; 
        }
    });
}
listingImage.addEventListener("change",(event)=>{
    let file = listingImage.files[0];
    if(file){
        previewDiv.style.height="150px";
        previewDiv.style.width="150px";
        previewDiv.style.borderRadius="15px";
        preview.style.borderRadius="15px";
        previewDiv.style.marginBottom="10px";
        preview.src = URL.createObjectURL(file);
    }
})