const link = document.querySelector('#btnSubmit a'),
    form = document.querySelector('#form'),
    input = document.querySelector('#nome');


function setNameInLocalStorage(name) {
    localStorage.setItem('name', name);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (input.value === '') return alert('Preencha o campo nome');

    setNameInLocalStorage(input.value);
    window.location.href = './game.html';
});
