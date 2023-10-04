// document.addEventListener("DOMContentLoaded", (e) => {
//   const login__username = document.getElementById("login__username");
//   const login_submit = document.getElementById("login_submit");
//   const login__password = document.getElementById("login__password")

//   const usernameErrMsg = document.getElementById("error-message-username");
//   const passwordErrMsg = document.getElementById("error-message-password")

//   const regexUsername = /^[a-zA-Z\s]+$/;
//   const regexPassword = /^.{4,}$/;
  
//   const correctUser = false;
//   const correctPass = false;


//   function correctUsername(){

//     login__username.addEventListener("input", () => {
//         const usernameValue = login__username.value;
//         const regex = /^[a-zA-Z\s]+$/;
    
//         if (!regex.test(usernameValue)) {
//           passwordErrMsg.textContent = "El nombre de usuario contiene caracteres no permitidos.";
//           passwordErrMsg.style.display = "flex";
//           passwordErrMsg.style.flexDirection = "column";
//           login_submit.disabled = true;

//           correctUser = false;
//         } 
//         else {
//           login_submit.disabled = false;
//           passwordErrMsg.textContent = "";
//           passwordErrMsg.style.display = "none";
//           correctUser = true;
//         }
//       });

//     return correctUser;
//   }

//   function correctPassword(){
//     login__password.addEventListener("input", ()=>{
//         const passordValue = login__password.value;
//         const regex = /^.{4,}$/;
    
//         if (!regex.test(passordValue)) {
//             passwordErrMsg.textContent = "Minimo 4 caracteres.";
//             passwordErrMsg.style.display = "flex";
//             login_submit.disabled = true;
//             correctPass = false;
//           } 
//           else {
//             login_submit.disabled = false;
      
//             passwordErrMsg.textContent = "";
//             passwordErrMsg.style.display = "none";
//             correctPass = true
//           }
//       });

//       return correctPass;
//   }

// });