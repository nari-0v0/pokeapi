const img = document.querySelector('.img');
const stat = document.querySelector('.stat');
const text = document.querySelector('.text');
const evolve = document.querySelector('.but1');
const reroll = document.querySelector('.but2');

let currenPokemonId = null;

// 포켓몬 불러오기 함수
function loadPokemon(id = Math.ceil(Math.random() * 1000)) {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
    img.innerHTML = '포켓몬 데려오는 중...';
    stat.textContent = '정보 가져오는 중..';
    text.textContent = '로딩중 ...';

    fetch(apiUrl)
        .then(data => data.json())
        .then(data => {
            currenPokemonId = data.id;

            img.innerHTML = '';
            if (data.sprites.front_default || data.sprites.front_female) {
                if (data.sprites.front_default) {
                    img.innerHTML += `<img src="${data.sprites.front_default}" class="poke-img">`;
                }
                if (data.sprites.front_female) {
                    img.innerHTML += `<img src="${data.sprites.front_female}" class="poke-img">`;
                }
            } else {
                img.textContent = "포켓몬이 쉬러 갔어요..";
                stat.textContent = "쉬러간 포켓몬을 잡으러 갔어요..";
                text.textContent = "zzZ...";
                return;
            }

            stat.textContent = `이름: ${data.name} | 번호: ${data.id}`;
            text.textContent = `포켓몬 ${data.name}이(가) 나타났다!`;
            console.log('현재 포켓몬 번호:', data.id);
        })
        .catch(error => {
            console.error('요청 실패:', error);
            img.textContent = '서버가 쉬러 갔어요...';
            stat.textContent = '서버를 불러오는중 ...';
            text.textContent = 'zzZ...';
        });
}

// 진화 포켓몬 불러오기
function loadEvolution() {
    if (!currenPokemonId) return;

    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${currenPokemonId}`;

    fetch(speciesUrl)
        .then(res => res.json())
        .then(speciesData => fetch(speciesData.evolution_chain.url))
        .then(res => res.json())
        .then(evoData => {
            const chain = evoData.chain;
            const evoList = [];

            let current = chain;
            while (current) {
                evoList.push(current.species.name);
                current = current.evolves_to[0];
            }

            const currentName = stat.textContent.split('이름: ')[1]?.split('|')[0]?.trim();
            const index = evoList.findIndex(name => currentName?.includes(name));
            const nextEvo = evoList[index + 1];

            if (nextEvo) {
                loadPokemon(nextEvo); // 이름으로 호출 가능!
            } else {
                text.textContent = '다 성장했어요!';
            }
        })
        .catch(err => {
            console.error('진화 정보 요청 실패:', err);
            text.textContent = '포켓몬이 진화하고 싶지 않은가봐요..';
        });
}

// 최초 실행
loadPokemon();

// 버튼 이벤트
reroll.addEventListener('click', () => loadPokemon());
evolve.addEventListener('click', () => loadEvolution());
