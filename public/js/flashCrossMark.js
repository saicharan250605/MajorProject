const cross = document.querySelector("#flash-message-cross-mark");

cross.addEventListener("click",(event)=>{
    event.target.parentElement.parentElement.remove();
});