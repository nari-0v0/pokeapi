const img = document.querySelector('.img');
const stat = document.querySelector('.stat');
const text = document.querySelector('.text');
const evolve = document.querySelector('.but1');
const reroll = document.querySelector('.but2');
const male = document.querySelector('.male')
const female = document.querySelector('.female')

//HTML요소 가져오기
let currenPokemonId = null;
let currentPokemonData = null;
let isFemale = false; //기본값 남자이미지

//이미지 랜더링 함수
function renderImage() {
    img.innerHTML = '';
    const sprites = currentPokemonData.sprites; 

    let imageUrl = null;

    if (isFemale) {
        imageUrl = sprites.front_female || sprites.front_default;
    } else {
        imageUrl = sprites.front_default || sprites.front_female;
    }

    if (imageUrl) {
        img.innerHTML = `<img src="${imageUrl}" class="poke-img">`;
    } else {
        img.textContent = '포켓몬이 쉬러 갔어요..';
    }
}

// 포켓몬 불러오기 함수
function loadPokemon(id = Math.ceil(Math.random() * 1000)) { //랜덤 포켓몬 id 추출
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
    img.innerHTML = '포켓몬 데려오는 중...'; //로딩표시
    stat.textContent = '정보 가져오는 중..';
    text.textContent = '로딩중 ...';

    fetch(apiUrl) //apiUrl에 해당하는 json데이터 반환
        .then(data => data.json()) //json으로 변환
        .then(data => {
            currenPokemonId = data.id; // 포켓몬 id를 currenPokemonId에 저장
            currentPokemonData = data;

            renderImage(); //현재 성별에 맞춰 이미지 표시

            const statNameKorMap = {
                hp: '체력',
                attack: '공격',
                defense: '방어',
                'special-attck': '특수공격',
                'special-defense': '특수방어',
                speed: '스피드'
            };

            const statsText = data.stats
                .map(stat => `${statNameKorMap[stat.stat.name] || stat.stat.name} : ${stat.base_stat}`)
                .join(', ');

            stat.textContent = `이름: ${data.name} | 번호: ${data.id} | 스텟: ${statsText}`;
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
            const evoDetails = new Map();

            let current = chain;
            while (current) {
                const name = current.species.name;
                const url = current.species.url; // 예: .../pokemon-species/25/
                evoList.push(name);
                evoDetails.set(name, url);
                current = current.evolves_to[0];
            }

            const currentName = stat.textContent.split('이름: ')[1]?.split('|')[0]?.trim();
            const index = evoList.findIndex(name => name.toLowerCase() === currentName?.toLowerCase());
            const nextEvo = evoList[index + 1];

            if (nextEvo) {
                const nextEvoSpeciesUrl = evoDetails.get(nextEvo);
                const nextEvoId = nextEvoSpeciesUrl.match(/\/(\d+)\/$/)?.[1];

                if (nextEvoId) {
                    loadPokemon(nextEvoId);
                } else {
                    text.textContent = '진화 ID 추출 실패';
                }
            } else {
                text.textContent = '다 성장했어요!';
            }
        })
        .catch(err => {
            console.error('진화 정보 요청 실패:', err);
            text.textContent = '포켓몬이 진화하고 싶지 않은가봐요..';
        });
}

//성별버튼
male.addEventListener('click', () => {
    isFemale = false;
    if (currentPokemonData) renderImage();
});

female.addEventListener('click', () => {
    isFemale = true;
    if (currentPokemonData) renderImage();
});

// 버튼 이벤트
reroll.addEventListener('click', () => loadPokemon());
evolve.addEventListener('click', () => loadEvolution());


// 최초 실행
loadPokemon();