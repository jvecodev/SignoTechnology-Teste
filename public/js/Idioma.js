
const btnPt = document.getElementById('btn-pt');
const btnEn = document.getElementById('btn-en');
const pt = document.querySelectorAll('[data-lang="pt"]');
const en = document.querySelectorAll('[data-lang="en"]');

btnPt.addEventListener('click', () => {
    pt.forEach(element => {
        element.style.display = 'block';
    });
    en.forEach(element => {
        element.style.display = 'none';
    });
});

btnEn.addEventListener('click', () => {
    pt.forEach(element => {
        element.style.display = 'none';
    });
    en.forEach(element => {
        element.style.display = 'block';

    });
});