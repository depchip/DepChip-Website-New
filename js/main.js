document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-link");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");

  const closeNav = () => {
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = event.target.closest(".navbar");
    if (!clickedInsideNav && body.classList.contains("nav-open")) {
      closeNav();
    }
  });

  const setScrolledState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const sections = [...document.querySelectorAll("main section[id]")];

  const syncActiveLink = () => {
    const scrollPosition = window.scrollY + 140;
    let activeId = sections[0]?.id;

    sections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  setScrolledState();
  syncActiveLink();
  window.addEventListener("scroll", setScrolledState, { passive: true });
  window.addEventListener("scroll", syncActiveLink, { passive: true });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton?.textContent;
      const formData = new FormData(contactForm);

      formStatus.className = "form-status";
      formStatus.textContent = "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("We could not send your message right now.");
        }

        contactForm.reset();
        formStatus.classList.add("is-success");
        formStatus.textContent = "Thanks, your message has been sent. We will get back to you shortly.";
      } catch (error) {
        formStatus.classList.add("is-error");
        formStatus.textContent = error.message || "Something went wrong. Please try again in a moment.";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel || "Send message";
        }
      }
    });
  }
});
