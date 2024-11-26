// DOM Elements
const modal = document.getElementById("upload-modal");
const modalTrigger = document.getElementById("upload-modal-trigger");
const closeButton = document.querySelector(".close-button");

// Open modal
modalTrigger.addEventListener("click", () => {
  modal.style.display = "block";
  window.dispatchEvent(new CustomEvent('fs-modal-opened'));
});

// Close modal
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// // Image preview in modal
// imageUploadInput.addEventListener("change", (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       modalImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
//     };
//     reader.readAsDataURL(file);
//   }
// });
