let reviewForm = document.querySelector("#review_form");
let allStars_radioButtons = document.querySelectorAll(".allStars");
allStars_radioButtons.forEach((single_option)=>{
    single_option.addEventListener("change",(event)=>{
       if(event.target.checked){
        for(let i=0; i<5; i++){
            allStars_radioButtons[i].previousElementSibling.children[0].classList.remove("fa-solid");
            allStars_radioButtons[i].previousElementSibling.children[0].classList.add("fa-regular");
        }
       }
        for(let i=0; i<event.target.value;i++){
            allStars_radioButtons[i].previousElementSibling.children[0].classList.remove("fa-regular");
            allStars_radioButtons[i].previousElementSibling.children[0].classList.add("fa-solid");
        }
    })
});