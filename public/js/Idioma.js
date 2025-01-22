const btnPt = document.getElementById('btn-pt');
const btnEn = document.getElementById('btn-en');

btnPt.addEventListener('click', () => {
    
    const pt = document.querySelectorAll('[data-lang="pt"]');
    const en = document.querySelectorAll('[data-lang="en"]');

    pt.forEach(element => {
        element.style.display = 'block';
    });
    en.forEach(element => {
        element.style.display = 'none';
    });
});

btnEn.addEventListener('click', () => {
    
    const pt = document.querySelectorAll('[data-lang="pt"]');
    const en = document.querySelectorAll('[data-lang="en"]');

    pt.forEach(element => {
        element.style.display = 'none';
    });
    en.forEach(element => {
        element.style.display = 'block';
    });
});
