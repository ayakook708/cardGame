(() => {
    // カードクラス
    class Card {
        constructor(suit, num) {
            this.suit = suit;
            this.num = num;
            this.front = `${this.suit}${('0' + this.num).slice(-2)}.svg`;
            return this;
        }
    }

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
            }
            // jokerの追加
            if(joker>0){
                for(let k = 0;k < joker; k++){
                    const card = new Card('j',99);
                    this.array.push(card);
                }
            }
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
            const cardArray = this.array.splice(0,num);
            return cardArray;
        };
    };

    // 利用するカード番号の配列を作成、今回は１〜１３全て
    const numbers = [...Array(13)].map((_, i) => i+1);

    // s : スペード, d : ダイヤ, h : ハート, c : クローバー
    const suits = ['s', 'd', 'h', 'c'];

    // 神経衰弱用のカードを作成
    const deck = new Deck(suits,numbers,0);

    // 残カード数,操作カウンターの変数設定
    let remain = deck.remain();
    let counter = 0;

    // 1枚目のカードの変数を宣言 最初はnull
    let firstCard = null;
    // setTimeoutを格納する変数
    let flipTimerId = NaN;

    // カードをめくった時の処理
    const flip = (e) => {
        const flippedCard = e.target;
        // カードにクラスbackがついていないか、flipTimerIdが動作しているとき
        if (!flippedCard.classList.contains('back') || flipTimerId) {
            return; //表のカードをクリックしても何も反応させない。
        }

        flippedCard.classList.remove('back'); //backを取り除いて、カードを表にする。

        // めくるのが1枚目の時
        if (firstCard === null) {
            firstCard = flippedCard; // めくったカードをfirstCardに設定
        } else {
            //2枚目だったら1枚目と比較して結果を判定する。
            counter++;
            if (firstCard.num === flippedCard.num) {
                //2枚が同じだった時、firstCardを初期値に戻す
                firstCard.classList.add('fadeout');
                flippedCard.classList.add('fadeout');
                firstCard = null;
                remain = remain - 2;
            } else {
                // 2枚が違う数字だった時の処理
                flipTimerId = setTimeout(function () {
                    // 2枚のカードを裏返す
                    firstCard.classList.add('back');
                    flippedCard.classList.add('back');
                    // 初期値に戻す
                    flipTimerId = NaN;
                    firstCard = null;
                }, 1300); // 1.3秒後に処理を完了
            }
        }
        if (remain <= 0){
            window.alert('おめでとうございます！'+ counter + '回の操作で完了しました。');
        }
    };

    // カードのセット
    const table = document.querySelector('.cardTable');
    const setCard = () => {
        const cardArray = deck.deal(52);
        for (let i = 0; i < suits.length; i++) {
            const tr = document.createElement('tr');
            table.appendChild(tr);
            for (let j = 0; j < 13; j++) {
                const td = document.createElement('td');
                td.num = cardArray[i*13+j].num;
                td.style.backgroundImage = `url(./assets/cards_svg/${
                    cardArray[i * 13 + j].front
                })`;
                td.classList.add('card', 'back');
                td.onclick = flip; // カードをクリックしたときの関数
                tr.appendChild(td);
            }
        }
    };
    setCard();
})();
