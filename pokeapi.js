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
        if (sprites.front_default) { //남자 이미지 있으면 (false)
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
                .join('<br> '); //스텟 사이사이에 줄바꿈

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
    if (!currentPokemonId) return; //id없으면 종료

    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${currentPokemonId}`; //진화정보url

    fetch(speciesUrl)
        .then(res => res.json()) //json으로 변환
        .then(speciesData => fetch(speciesData.evolution_chain.url)) //진화정보안의 진화체인 요청
        .then(res => res.json()) // json으로 변환
        .then(evoData => {
            const chain = evoData.chain; //진화트리의 최상단 노드
            const evoList = []; //진화 순서 저장 배열
            const evoDetails = new Map(); // 이름과 url매핑

            let current = chain; //진화트리 순회 , chain>>가장 첫단계의 포켓몬 = 가장 첫 단계의 포켓몬으로 초기화
            while (current) { // 진화노드가 존재하는동안 반복
                const name = current.species.name; //현재단계의 포켓몬 이름 가져오기
                const url = current.species.url; // 예: .../pokemon-species/25/ 포켓몬 종 url가져오기
                evoList.push(name); // 진화 순서대로 이름을 배열에 저장, push : 배열 끝에 추가
                evoDetails.set(name, url); // 이름 = 키, url= value로 하는 맵에 저장
                current = current.evolves_to[0]; // 다음 진화단계로 넘어감 --
            }

            const currentName = stat.textContent.split('이름: ')[1]?.split('[')[0]?.trim(); 
            //현재 포켓몬 이름 확인, .trim - 줄바꿈이나 공백 제거
            // .split - 자르기 첫번째 split는 '이름:' 기준으로 두배열로 나눔 여기서 번호로 가져오기. (번호 :nn\n, 포켓몬이름\n\n [스텟]...)
            // '?.'는 에러내지않고 undefined로 변환하기위해 쓰임 (ex/ undefined.split(...)로 나오면 js가 멈춤) 
            // ㄴ 존재하지않는 결과는 undefined로 반환 있을땐 .split실행
            const index = evoList.findIndex(name => name.toLowerCase() === currentName?.toLowerCase());
            // findIndex : 몇번째 인덱스에 있는지 찾는 함수, toLowerCase : 대소문자 무시, 포켓몬 이름이 몇번째 인덱스에 있는지 확인 
            const nextEvo = evoList[index + 1]; //현재 값에서 +1에 잇는 포켓몬이 진화대상

            if (nextEvo) { // 진화대상 포켓몬의 값이 true면
                const nextEvoSpeciesUrl = evoDetails.get(nextEvo); //evoDetails : 이름과 url 매핑되어있는 맵에서 가져오기 진화된 포켓몬
                const parts = nextEvoSpeciesUrl.split('/'); // /를 기준으로 문자열 잘라서 배열 만들기
                const nextEvoId = parts[parts.length - 2];
                // 맨뒤는 빈 문자열이므로 마지막에서 두번째 가져오기, /를 기준으로 잘랐기 때문에 /뒤에는 아무것도 없어서 빈문자열이 생김 

                if (nextEvoId) { // 진화할 포켓몬 id
                    loadPokemon(nextEvoId); // 진화한 포켓몬 덮어쓰기
                } else { // null, undefined 등 잘못될경우 표현텍스트
                    text.textContent = '진화 ID 추출 실패';
                }
            } else { // 진화가 불가능할 경우 표현 텍스트
                text.textContent = '다 성장했어요!';
            }
        })
        .catch(err => { //에러가 발생할 경우
            console.error('진화 정보 요청 실패:', err);
            text.textContent = '포켓몬이 진화하고 싶지 않은가봐요..';
        });
}

//성별버튼
male.addEventListener('click', () => { //남자 버튼을 클릭 했을때
    isFemale = false; // 기본값 출력
    if (currentPokemonData) renderImage(); //조건문 쓰는이유 : 이미지가 로딩 된 후 이미지 추출을 위해 (오류방지)
});

female.addEventListener('click', () => { // 여자 버튼을 클릭했을대
    isFemale = true; // 여자사진 출력
    if (currentPokemonData) renderImage();
});

// 버튼 이벤트
reroll.addEventListener('click', () => loadPokemon());
evolve.addEventListener('click', () => loadEvolution());


// 최초 실행
loadPokemon();