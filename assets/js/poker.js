(() => {
    // カードクラス
    class Card {
        constructor(suit, num) {
            this.suit = suit;
            this.num = num;
            this.front = `${this.suit}${('0' + this.num).slice(-2)}.svg`;
            return this;
        };
    };

    // シャッフル済みカードの山のクラス
    // suits,numbers,jokerが引数
    // suits:使用するカードマーク頭文字のリスト、通常は['s','h','d','c']
    // numbers:使用する数字のリスト、通常は[1,2,3,･･･,12,13]
    // joker:含めるjokerの枚数を指定、使用しない場合は0
    class Deck {
        constructor(suits,numbers,joker){
            this.array = [];
            // カード情報を配列に格納
            for (let i = 0; i < suits.length; i++) {
                for (let j = 0; j < numbers.length; j++) {
                    const card = new Card(suits[i], numbers[j]);
                    this.array.push(card);
                }
            };
            // jokerの追加
            if(joker>0){
                for(let k = 0;k < joker; k++){
                    const card = new Card('j',99);
                    this.array.push(card);
                }
            };
            // カードのシャッフル
            this.array = this.shuffle(this.array);
        }
        // シャッフルする関数
        shuffle = (arrays) => {
            const array = arrays.slice();
            for (let i = array.length - 1; i >= 0; i--) {
                const randomIndex = Math.floor(Math.random() * (i + 1));
                [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
            }
            return array;
        };
        // Deckに残っているカード枚数を返すメソッド
        remain = () => {
            return this.array.length;
        };
        // 必要なカード枚数(num)をDeckより配列で渡すメソッド
        deal = (num) => {
            const cardArray = this.array.splice(0,num)
            return cardArray;
        };
    };

    // document操作
    const $dom = document;

    // 配列の最大最小合計をreduce()で取得するための関数
    const aryMax = (a, b) => {return Math.max(a, b);};
    const aryMin = (a, b) => {return Math.min(a, b);};
    const arySum = (a, b) => {
        let sum = 0;
        if(b === 1){sum = a + 14;}else{sum = a + b;};
        return sum;
    };

    //カードをクリックしたときの処理
    let exchangeF = 0;
    const clickCard = (e) => {
        const clickedCard = e.target;
        if(exchangeF === 1){
            return;
        };
        if(clickedCard.textContent === 'exchange'){
            clickedCard.textContent = '';
        }else{
            clickedCard.textContent = 'exchange';
        }
    };

    // 初期カードの設定関数
    const setCard = (deck) => {
        const cards = deck.deal(5);
        const tr = $dom.createElement('tr');
        tr.setAttribute('id','js-yourCards');
        const $cardTable = $dom.getElementById('js-yourCards');
        $cardTable.appendChild(tr);
        for (let i = 0; i < cards.length; i++) {
            const td = $dom.createElement('td');
            td.style.backgroundImage = `url(./assets/cards_svg/${cards[i].front})`;
            td.num = cards[i].num;
            td.suit = cards[i].suit;
            td.classList.add('card');
            td.onclick = clickCard;
            tr.appendChild(td);
        };
    };

    // 利用するカード番号の配列を作成、今回は１〜１３全て
    const numbers = [...Array(13)].map((_, i) => i+1);
    // s : スペード, d : ダイヤ, h : ハート, c : クローバー
    const suits = ['s', 'd', 'h', 'c'];
    // 初期カードの設定
    const deck = new Deck(suits,numbers,1);
    setCard(deck);

    // 役の判定
    const judgment = () => {
        let joker = 0;
        let suits = [];
        let numbers = [];
        let flash = 1;
        let matching = 0;
        //結果カードより変数の集計
        const tr = $dom.getElementById('js-yourCards');
        const cards = tr.getElementsByTagName('td');
        for (let index = 0; index < cards.length; index++) {
            const suit = cards[index].suit;
            const num = cards[index].num;
            if (suit === 'j') {
                joker = 1;
            }else{
                suits.push(suit);
                if (suits[0] !== suit && flash === 1) {
                    flash = 0;
                }
                numbers.push(num);
            }
        }
        const maxNumber = numbers.reduce(aryMax);
        const minNumber = numbers.reduce(aryMin);
        //ロイヤルストレートを判断するためのカード合計
        const sumNumber = numbers.reduce(arySum,0);
        //５枚から２枚を選ぶ組み合わせで同じ番号である回数をカウント
        //ワンペア：１、ツーペア：２、スリーカード：３、フルハウス：４，フォーカード：６
        for (let i = 0; i < numbers.length - 1; i++) {
            for (let j = i+1; j < numbers.length; j++) {
                if (numbers[i] === numbers[j]) {
                    matching++;
                }
            }
        }
        //joker,flash,numbers及びmaxNumber,minNumber,sumNumberで結果判定
        const message = $dom.getElementById('js-message');
        if (matching === 1 && joker === 0) {
            message.textContent = 'ワンペア';
        }else if (matching === 1 && joker ===1) {
            message.textContent = 'スリーカード';
        }else if (matching === 2 && joker === 0){
            message.textContent = 'ツーペア';
        }else if ((matching === 2 && joker === 1) || matching === 4){
            message.textContent = 'フルハウス';
        }else if (matching === 3 && joker === 0){
            message.textContent = 'スリーカード';
        }else if ((matching === 3 && joker === 1) || (matching === 6 && joker === 0)){
            message.textContent = 'フォーカード';
        }else if (matching === 6 && joker === 1) {
            message.textContent = 'ファイブカード';
        }else if (maxNumber - minNumber <= 4 && flash === 0){
            message.textContent = 'ストレート';
        }else if (maxNumber - minNumber <= 4 && flash === 1){
            message.textContent = 'ストレートフラッシュ';
        }else if (sumNumber === 60 && flash === 0){
            message.textContent = 'ロイヤルストレート';
        }else if (sumNumber === 60 && flash === 1){
            message.textContent = 'ロイヤルストレートフラッシュ'
        }else if (flash === 1){
            message.textContent = 'フラッシュ';
        }else if(joker === 1){
            message.textContent = 'ワンペア';
        }else{
            message.textContent = '役無し'
        }
    };

    //Card Exchange ボタン押下時の処理
    const exchangeClickHandler = (e) => {
        e.preventDefault();
        e.target.classList.add('hidden');
        exchangeF = 1;
        const message = $dom.getElementById('js-message');
        message.textContent = '';
        const tr = $dom.getElementById('js-yourCards');
        const tds = tr.getElementsByTagName('td');
        for(i=0;i < tds.length;i++){
            if(tds[i].textContent === 'exchange'){
                tds[i].textContent = '';
                const cards = deck.deal(1);
                tds[i].style.backgroundImage = `url(./assets/cards_svg/${
                    cards[0].front
                })`;
                tds[i].num = cards[0].num;
                tds[i].suit = cards[0].suit;
            };
        };
        judgment();
    }

    //Card Exchange ボタン押下
    const $cardExchange = $dom.getElementById('js-cardExchange');
    $cardExchange.addEventListener('click',(e) => {
        exchangeClickHandler(e);
    });

})();