let menubar_checkbox=document.querySelector("#menubarCheckbox");
let navbar=document.querySelector(".navbar");
let navbar_first_part=document.querySelector(".navbar-first-part");
let navbar_first_part_text = document.querySelectorAll(".navbar-first-part-text");
let user_register_panel = document.querySelector(".user-register-login-panel");

menubar_checkbox.addEventListener("change",function(event){
    if(menubar_checkbox.checked){
        if(navbar_first_part_text.length === 4){
            navbar.style.height="173px";
        }
        else if(navbar_first_part_text.length === 3){
            navbar.style.height="130px";
        }
        navbar.style.borderBottom="1px solid rgba(0, 0, 0, 0.215)";
        navbar_first_part.style.flexDirection="column";
        navbar_first_part.style.alignItems="start";
        navbar_first_part.style.gap="10px";
        navbar_first_part.style.paddingTop="10px";
        user_register_panel.style.flexDirection="column";
        user_register_panel.style.gap="10px";
        for(i of navbar_first_part_text){
            i.style.visibility="visible";
            i.style.transition="all 0.2s linear 0.3s";
        }   
    }
    else{
        navbar.style.height="40px";
        navbar.style.border="none";
        navbar_first_part.style.flexDirection="row";
        user_register_panel.style.flexDirection="row";
        setTimeout(()=>{
            navbar_first_part.style.alignItems="center";
            navbar_first_part.style.paddingTop="0px";
        },350);
        navbar_first_part.style.gap="20px";
        for(i of navbar_first_part_text){
            i.style.visibility="hidden";
            i.style.transition="all 0s linear 0s";
        } 
    }
});