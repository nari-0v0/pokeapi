const img = document.querySelector('.img')
const stat = document.querySelector('.stat')
const text = document.querySelector('.text')
const evolve = document.querySelector('.but1')
const reroll = document.querySelector('.but2')

const pokeNumber = Math.ceil(Math.random()*1000) //.ceil : 정수로 변환
const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokeNumber}`


fetch(apiUrl)  //fetch : api 데이터를 요청 할때 쓰는 함수
    .then(data => data.json())  //json 데이터로 변환
    .then(data => {
        img.innerHTML += `<img src="${data.sprites.front_default}" class="poke-img">`;
        img.innerHTML += `<img src="${data.sprites.front_female}">`
        return data;

    })
