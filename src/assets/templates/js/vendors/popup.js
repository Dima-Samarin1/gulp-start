export function popup() {
  const popupLinks = document.querySelectorAll(".popup-link");
  const body = document.body;
  const lockPagging = document.querySelectorAll(".fix-blocks");
  let unlock = true;
  const timeout = 500;

  function init() {
    popupLinks.forEach((popupLink) => {
      popupLink.addEventListener("click", (e) => {
        const popupName = popupLink.getAttribute("href").replace("#", "");
        const curentPopup = document.getElementById(popupName);
        open(curentPopup);
        e.preventDefault();
      });
    });

    const popupCloseIcon = document.querySelectorAll(".close-popup");
    popupCloseIcon.forEach((el) => {
      el.addEventListener("click", (e) => {
        close(el.closest(".popup"));
        e.preventDefault();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const popupActive = document.querySelector(".popup.open");
        close(popupActive);
      }
    });
  }

  function open(curentPopup) {
    if (curentPopup && unlock) {
      const popupActive = document.querySelector(".popup.open");
      if (popupActive) {
        close(popupActive, false);
      } else {
        bodyLock();
      }
      curentPopup.classList.add("open");
      curentPopup.addEventListener("click", (e) => {
        if (!e.target.closest(".popup__content")) {
          close(e.target.closest(".popup"));
        }
      });
    }
  }

  function close(popupActive, doUnlock = true) {
    if (unlock) {
      popupActive.classList.remove("open");
      if (doUnlock) {
        bodyUnLock();
      }
    }
  }

  function bodyLock() {
    const lockPaddingValue =
      window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
    lockPagging.forEach((el) => {
      el.style.paddingRight = lockPaddingValue;
    });

    body.style.paddingRight = lockPaddingValue;
    body.classList.add("stop-scroll");

    unlock = false;
    setTimeout(() => {
      unlock = true;
    }, timeout);
  }

  function bodyUnLock() {
    setTimeout(() => {
      lockPagging.forEach((el) => {
        el.style.paddingRight = "0px";
      });
      body.style.paddingRight = "0px";
      body.classList.remove("stop-scroll");
    }, 0);

    unlock = false;

    setTimeout(() => {
      unlock = true;
    }, timeout);
  }

  init();
}
