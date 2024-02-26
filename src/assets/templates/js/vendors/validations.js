import JustValidate from "just-validate";
import "../../../../../node_modules/inputmask/dist/inputmask.js"

export function validations() {
  let selectors = document.querySelectorAll(".phone");
  let im = new Inputmask("+7 (999) 999-99-99");
  im.mask(selectors);

  const validation = new JustValidate(".form");

  validation
    .addField(".form-name", [
      {
        rule: "required",
        errorMessage: "Введите ваше имя!",
      },
      {
        rule: "minLength",
        value: 2,
        errorMessage: "Не менее 2 символов!",
      },
    ])
    .addField(".form-email", [
      {
        rule: "required",
        errorMessage: "Введите E-mail!",
      },
      {
        rule: "email",
        errorMessage: "Введите корректный E-mail!",
      },
    ])

    .addField(".form-phone", [
      {
        rule: "required",
        errorMessage: "Введите ваш телефон!",
      },
    ])
    .addField(".form-messager", [
      {
        rule: "required",
        errorMessage: "Введите ваше сообщение!",
      },
    ])
    .onSuccess((event) => {
      console.log("Validation passes and form submitted", event);

      let formData = new FormData(event.target);

      console.log(...formData);

      let xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log("Отправлено");
          }
        }
      };

      xhr.open("POST", "mail.php", true);
      xhr.send(formData);

      event.target.reset();
    });
}
