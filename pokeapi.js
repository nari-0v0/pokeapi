//DOM 요소 선택
const img = document.querySelector('.img');
const stat = document.querySelector('.stat');
const text = document.querySelector('.text');
const evolve = document.querySelector('.but1');
const reroll = document.querySelector('.but2');
const male = document.querySelector('.male')
const female = document.querySelector('.female')

//기본값
let currentPokemonId = null;
let currentPokemonData = null;
let isFemale = false; //기본값 남자이미지

//이미지 랜더링 함수
function renderImage() {
    img.innerHTML = ''; //이미지칸 비우기
    const sprites = currentPokemonData.sprites; //포케api에서 sprites속성 가져오기

    let imageUrl = null; //이미지 저장 공간

    if (isFemale) {  // 기본값 = false일때 남자로 여자부터 시작
        if (sprites.front_female) { //포케api에서 여자 이미지 있으면(true)
            imageUrl = sprites.front_female; //이미지 가져오기
        } else {
            img.textContent = '여자 이미지가 없어요!'; //여자 이미지 없을땐
            return; //조건을 만족하지않을땐 종료
        }
    } else {
        if (sprites.front_default){ //남자 이미지 있으면 (false)
            imageUrl = sprites.front_default; //이미지 가져오기
        } else {
            img.textContent = '남자 이미지가 없어요!'; // 남자 이미지 없을땐
            return; //조건을 만족하지 않을땐 종료
        }
    }

    if (imageUrl) { //위 코드에 이미지가 있을경우
        img.innerHTML = `<img src="${imageUrl}" class="poke-img">`; // 이미지칸에 출력
    } else {
        img.textContent = '포켓몬이 쉬러 갔어요..'; //이미지 없으면 출력문구
    }
}

// 포켓몬 불러오기 함수
function loadPokemon(id = Math.ceil(Math.random() * 1000)) { //랜덤 포켓몬 id 추출
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}`; // 포케api를 가져오는 링크
    img.innerHTML = '포켓몬 데려오는 중...'; //로딩표시
    stat.textContent = '정보 가져오는 중..';
    text.textContent = '로딩중 ...';

    fetch(apiUrl) //웹서버에 요청 및 응답받는 함수
        .then(data => data.json()) //json으로 변환 (자바스크립트 객체로 다룰수있게 변환(텍스트로 들고있는걸 자바스크립트에서 운용할수있게 변환))
        .then(data => {
            currentPokemonId = data.id; //포켓몬 고유번호
            currentPokemonData = data; //포켓몬 데이터

            renderImage(); //현재 성별에 맞춰 이미지 표시

            const statNameKorMap = { //스텟 출력 시 한글이름
                hp: '체력',
                attack: '공격',
                defense: '방어',
                'special-attack': '특수공격',
                'special-defense': '특수방어',
                speed: '스피드'
            };

            const statsText = data.stats //능력치 배열설정
                .map(stat => `${statNameKorMap[stat.stat.name] || stat.stat.name} : ${stat.base_stat}`) // 스텟명 매칭 후 한글로 가져오고, 수치 불러오기
                .join('<br> '); //스텟 사이사이에 쉼표

            stat.innerHTML = `번호: ${data.id} <br> 이름: ${data.name} <br> <br>[스텟] <br> ${statsText}`; // 표시될 방식
            text.textContent = `포켓몬 ${data.name}이(가) 나타났다!`;
            console.log('현재 포켓몬 번호:', data.id);
        })
        .catch(error => { //불러오기 실패 시
            console.error('요청 실패:', error);
            img.textContent = '서버가 쉬러 갔어요...';
            stat.textContent = '서버를 불러오는중 ...';
            text.textContent = 'zzZ...';
        });
}

// 진화 포켓몬 불러오기
function loadEvolution() {
    if (!currentPokemonId) return;

    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${currentPokemonId}`;

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