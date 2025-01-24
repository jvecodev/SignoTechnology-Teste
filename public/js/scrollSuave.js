
var deslizar = [
    document.getElementById('header'),
    document.getElementById('form-container'),
    document.getElementById('enquete-form'),
    
    document.getElementById('footer'),
    document.getElementById('welcome'),
    document.getElementById('enquetes-container'),
];

ScrollReveal().reveal(deslizar, { 
    duration: 1000,
    origin: 'bottom',
    distance: '50px', 
    easing: 'ease-in-out', 
    reset: true 
});

