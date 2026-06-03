const mobileMenu = document.querySelector('.mobile-menu');
const mobileReviewNav = document.querySelector('#mobile-review-nav');

if (mobileMenu && mobileReviewNav) {
  mobileMenu.addEventListener('click', () => {
    const isOpen = mobileReviewNav.classList.toggle('open');
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
  });
}
