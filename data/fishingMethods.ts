export interface LureOption {
  name:   string;
  weight: string;
  note?:  string;
}

export interface FishingMethod {
  fish:        string;
  emoji:       string;
  targetSpots: string[];
  depth:       string;
  lures:       LureOption[];
  technique:   string;
  timing:      string;
  notes:       string;
  beginnerTip: string;
  difficulty:  1 | 2 | 3;
}

export const FISHING_METHODS: FishingMethod[] = [
  {
    fish: "ヒラメ",
    emoji: "🐡",
    targetSpots: ["茅ヶ崎サーフ（波打ち際〜30m）", "平塚サーフ（離岸流の脇）"],
    depth: "ボトム（底〜50cm のレンジ）",
    lures: [
      { name: "メタルジグ",         weight: "28〜40g", note: "飛距離を出したい時" },
      { name: "ヘビーシンキングミノー", weight: "14〜18g", note: "140mm前後。ボトムをゆっくり引く" },
      { name: "ジグヘッド+ワーム",    weight: "14〜21g", note: "コアマン VJ-22 が実績高" },
    ],
    technique: "着底確認後、ゆっくりリフト＆フォール。ボトム意識の低速引きが基本。離岸流（白泡の帯）を重点的に狙う。",
    timing: "朝マズメ（日の出前後2時間）が最高潮。夕マズメも有効。",
    notes: "歯が鋭い。取り込みはネット推奨。ドラグ緩めでバラシ防止。",
    beginnerTip: "着底をしっかり感じてから引くのがコツ。根掛かりに注意。",
    difficulty: 2,
  },
  {
    fish: "シーバス",
    emoji: "🐠",
    targetSpots: ["相模川河口（テトラ周り・流芯）", "江ノ島西側テトラ", "平塚新港"],
    depth: "表層〜中層（ナイトは表層、デイは中層〜ボトム）",
    lures: [
      { name: "シンキングペンシル",     weight: "18〜28g", note: "90〜120mm。流れの中でドリフト" },
      { name: "バイブレーション",        weight: "14〜21g", note: "リアクションバイト狙い" },
      { name: "フローティングミノー",    weight: "9〜14g",  note: "ナイト表層引きに最適" },
    ],
    technique: "流れの変化点（反転流・ヨレ）を集中攻撃。ルアーを流れに乗せてドリフト。ナイトは常夜灯の明暗の境界を狙う。",
    timing: "夕マズメ〜夜が最活性。朝マズメも有効。",
    notes: "歯が荒く鰓蓋も鋭い。ランディングはフィッシュグリップ必携。",
    beginnerTip: "川の流れを利用してルアーを流すのが基本。テトラ際の根掛かりに注意。",
    difficulty: 2,
  },
  {
    fish: "青物",
    emoji: "🐟",
    targetSpots: ["茅ヶ崎沖（ナブラ周辺）", "江ノ島沖", "平塚沖（回遊待ち）"],
    depth: "表層〜中層（ナブラ直撃）",
    lures: [
      { name: "メタルジグ",       weight: "40〜60g", note: "シルバー・ゴールド系。高速ジャーク" },
      { name: "ダイビングペンシル", weight: "35〜50g", note: "水面ドッグウォーク" },
      { name: "鉄板バイブ",       weight: "28〜40g", note: "遠投から素早いただ巻き" },
    ],
    technique: "ナブラ（鳥山）を見つけたら素早くキャスト。群れの向こう側に投げて手前に引いてくる。",
    timing: "朝マズメ〜朝が勝負。潮の変わり目に回遊が多い。",
    notes: "引きが強烈。ドラグ設定を確認。歯が鋭いのでフィッシュグリップ必携。",
    beginnerTip: "鳥が群れている場所を目印にする。ナブラがなければジグをボトムまで落として探る。",
    difficulty: 2,
  },
  {
    fish: "アジ",
    emoji: "🐟",
    targetSpots: ["江ノ島堤防（外側・先端）", "平塚港", "大磯港（常夜灯周り）"],
    depth: "中層〜表層（回遊タナに合わせる）",
    lures: [
      { name: "サビキ仕掛け",             weight: "おもり8〜12号", note: "コマセ（アミエビ）を使った釣り" },
      { name: "ジグヘッド+アジング用ワーム", weight: "0.5〜2g",     note: "表層〜中層をゆっくり引く" },
    ],
    technique: "サビキ：コマセカゴを上下に振りコマセを散らす。アジング：ゆっくり一定速で引くかフォールで食わせる。",
    timing: "夕マズメ〜夜の常夜灯周りが最高。朝マズメのサビキも◎",
    notes: "背びれが鋭い。鮮度落ちが早いのでクーラーに即入れ。",
    beginnerTip: "サビキ釣りは入門に最適。タナ（深さ）を変えながら魚のいる層を探す。",
    difficulty: 1,
  },
  {
    fish: "シロギス",
    emoji: "🦈",
    targetSpots: ["茅ヶ崎サーフ（波打ち際〜30m）", "平塚サーフ（砂地の浅場）"],
    depth: "ボトム（砂地の底近く）",
    lures: [
      { name: "投げ釣り仕掛け（キス針5〜7号）", weight: "おもり20〜25号", note: "キャスト後ゆっくり引く" },
      { name: "ちょい投げ仕掛け",               weight: "おもり10〜15号", note: "ファミリー向け" },
    ],
    technique: "仕掛けをキャストして底に着いたら、ゆっくりズル引き。プルプルというアタリが来たら少し待ってから合わせる。",
    timing: "朝〜昼間が活発。夏〜秋が最盛期。",
    notes: "ヒレが鋭い。イシゴカイ（ジャリメ）がエサの定番。",
    beginnerTip: "ゆっくり引くのがコツ。急いで引くと食わない。竿先のプルプルでアタリを感じる。",
    difficulty: 1,
  },
  {
    fish: "タチウオ",
    emoji: "🐟",
    targetSpots: ["江ノ島沖", "平塚沖", "夕方〜夜の堤防際"],
    depth: "中層〜表層（季節・時間帯で変化）",
    lures: [
      { name: "テンヤ（エサ：サンマ短冊）",   weight: "30〜60号", note: "船釣り向け" },
      { name: "ジグヘッド+ソフトルアー",       weight: "14〜21g",  note: "ワインド釣法向け" },
      { name: "メタルバイブ",                   weight: "28〜40g",  note: "ただ巻き〜ジャーク" },
    ],
    technique: "ワインド：ジャーク＋フォールの繰り返し。「シャクリ→フォール→シャクリ」のリズム。テンヤは底から探り上げていく。",
    timing: "夕マズメ〜夜が最高潮。秋（10〜11月）がベストシーズン。",
    notes: "歯が非常に鋭い！必ずフィッシュグリップを使用。素手で掴むと深く切れる。",
    beginnerTip: "夕マズメ以降に狙うのが基本。グリップで持つこと必須。",
    difficulty: 2,
  },
  {
    fish: "カサゴ",
    emoji: "🐡",
    targetSpots: ["江ノ島磯・堤防際", "大磯港テトラ周り", "岩礁帯の穴"],
    depth: "ボトム（根周り、穴の中）",
    lures: [
      { name: "ジグヘッド+ワーム", weight: "7〜14g", note: "根周りをゆっくり探る" },
      { name: "穴釣り仕掛け（ブラクリ）", weight: "5〜10号", note: "テトラや岩穴に直接落とす" },
    ],
    technique: "根周りや岩の隙間（穴）に仕掛けを落とし底付近でゆっくり誘う。穴釣りは穴に入れて待つだけ。",
    timing: "朝・夕を中心に夜も活性高い。年中狙える。",
    notes: "背びれのトゲに毒がある。取り込み時は素手でつかまない。フィッシュグリップ必携。",
    beginnerTip: "穴釣りは最も簡単な釣りのひとつ。テトラの隙間に落として待つだけ。",
    difficulty: 1,
  },
  {
    fish: "クロダイ",
    emoji: "🐟",
    targetSpots: ["相模川河口（橋周り）", "江ノ島大橋周辺", "堤防際・際釣り"],
    depth: "中層〜ボトム（際・根周り）",
    lures: [
      { name: "フカセ釣り仕掛け（チヌ針3〜4号）", weight: "ウキ釣り",  note: "コマセ：配合餌+オキアミ" },
      { name: "ヘチ釣り",                           weight: "ヘチ専用", note: "堤防の際を落とし込む" },
    ],
    technique: "フカセ：コマセを撒きながらオキアミを自然に流す。ウキが沈んだ瞬間に合わせる。ヘチ：カニやフナムシで落とし込む。",
    timing: "潮の変わり目・朝マズメが狙い目。夜釣りも有効。",
    notes: "非常に警戒心が強い。大きな音・影を出すと逃げる。",
    beginnerTip: "静かに釣ること。強い引きに備えてドラグは緩めに。",
    difficulty: 3,
  },
  {
    fish: "マゴチ",
    emoji: "🐡",
    targetSpots: ["茅ヶ崎サーフ（浅場の砂地）", "相模川河口（砂泥底）"],
    depth: "ボトム（砂地の底）",
    lures: [
      { name: "ジグヘッド+ビッグワーム", weight: "21〜28g", note: "4〜5インチのシャッドテール" },
      { name: "メタルジグ（ボトム引き）",  weight: "28〜40g", note: "底を跳ね上げる" },
    ],
    technique: "着底→リフト（50cm程度）→フォール（フワッと落とす）の繰り返し。ヒラメより着底を長くとる。",
    timing: "朝マズメ〜朝が基本。夏〜秋が最盛期。",
    notes: "引きは鋭いが体が柔らかくバレやすい。ゆっくり取り込む。",
    beginnerTip: "ヒラメより更にゆっくり引くのがコツ。フォールで食ってくることが多い。",
    difficulty: 2,
  },
  {
    fish: "サバ",
    emoji: "🐟",
    targetSpots: ["江ノ島沖・堤防", "平塚沖", "茅ヶ崎沖（回遊時）"],
    depth: "表層〜中層（回遊層）",
    lures: [
      { name: "サビキ仕掛け", weight: "おもり8〜15号", note: "群れが来たら爆釣" },
      { name: "メタルジグ",   weight: "20〜40g",       note: "ただ巻きで高速リトリーブ" },
    ],
    technique: "サビキ：群れが来たらコマセを撒き続けて数釣り。ジグ：中層を高速でただ巻き。",
    timing: "朝マズメ〜朝、秋〜初冬の回遊時が狙い目。",
    notes: "血抜き必須。内臓を早めに処理。大量に釣れたら持ち帰れる分だけキープ。",
    beginnerTip: "群れを見つけたら動かずその場でコマセを撒き続けるのがコツ。",
    difficulty: 1,
  },
];

export function getMethodByFish(fishName: string): FishingMethod | undefined {
  return FISHING_METHODS.find((m) => m.fish === fishName);
}
