/**
 * data/recipes.ts — 魚種別レシピマスターデータ
 *
 * 湘南エリア10魚種 × 3レシピ
 * 将来: Supabase に移行・ユーザー料理記録と連携
 */

export type RecipeCategory = "刺身" | "焼き" | "揚げ" | "煮" | "洋食" | "その他";

export interface Recipe {
  id: string;
  name: string;
  /** 対応魚種（複数可） */
  fish: string[];
  difficulty: 1 | 2 | 3;   // 1=簡単 2=普通 3=本格
  cookTime: string;
  category: RecipeCategory;
  description: string;
  steps: string[];
  tips: string;
  /** 初心者でも作れるか */
  beginnerOk: boolean;
}

export const RECIPES: Recipe[] = [

  /* ── ヒラメ ──────────────────────────────── */
  {
    id: "hirame_kobujime",
    name: "昆布締め",
    fish: ["ヒラメ"],
    difficulty: 2,
    cookTime: "30分＋冷蔵1時間",
    category: "刺身",
    description: "ヒラメの旨みを昆布が引き出す定番。翌日がさらに美味。",
    steps: [
      "ヒラメを3枚おろしにして皮を引く",
      "軽く塩を振り10分おいて水分を拭く",
      "昆布2枚でヒラメを挟み、ラップで包む",
      "冷蔵庫で1〜3時間寝かせる",
      "食べやすい大きさに切り、わさび醤油で供する",
    ],
    tips: "昆布は乾いたものより少し湿らせたものが馴染みやすい。",
    beginnerOk: false,
  },
  {
    id: "hirame_carpaccio",
    name: "カルパッチョ",
    fish: ["ヒラメ", "マゴチ"],
    difficulty: 1,
    cookTime: "15分",
    category: "洋食",
    description: "白身魚の透き通った味わいがオリーブオイルと相性抜群。",
    steps: [
      "ヒラメを薄くそぎ切りにして皿に並べる",
      "塩・白こしょうを軽く振る",
      "オリーブオイルをかける",
      "レモン汁・ケッパー・ディルを散らす",
      "冷蔵庫で5分冷やして供する",
    ],
    tips: "薄くそぎ切りにするほど見栄えと食感がよくなる。",
    beginnerOk: true,
  },
  {
    id: "hirame_meuniere",
    name: "ムニエル",
    fish: ["ヒラメ", "シーバス", "マゴチ"],
    difficulty: 2,
    cookTime: "20分",
    category: "洋食",
    description: "バターの香りで白身の旨みが際立つフランスの定番。",
    steps: [
      "切り身に塩こしょうして10分おく",
      "薄力粉をまぶして余分な粉を払う",
      "フライパンにバターを溶かし中火で皮目から焼く",
      "両面焼いてきつね色になったら取り出す",
      "残ったバターにレモン汁を加えてソースにしてかける",
    ],
    tips: "焦がしバター（ブールノワゼット）にするとより香り高い。",
    beginnerOk: false,
  },

  /* ── シーバス ────────────────────────────── */
  {
    id: "seabass_arai",
    name: "洗い（お造り）",
    fish: ["シーバス"],
    difficulty: 2,
    cookTime: "25分",
    category: "刺身",
    description: "薄切りにして氷水に通すことで身が締まり、独特の食感に。夏に最高。",
    steps: [
      "シーバスを3枚おろしにして皮を引く",
      "できるだけ薄くそぎ切りにする",
      "氷水入りのボウルに入れ、箸でさっとかき混ぜる",
      "身が丸まったらすぐに引き上げ水気をよく取る",
      "皿に盛り、わさびとポン酢で供する",
    ],
    tips: "氷水は本当に冷たくする。温いと台無し。",
    beginnerOk: false,
  },
  {
    id: "seabass_acquapazza",
    name: "アクアパッツァ",
    fish: ["シーバス", "カサゴ"],
    difficulty: 2,
    cookTime: "30分",
    category: "洋食",
    description: "魚から出る旨みがスープに溶け込む、おもてなしにも最適な一皿。",
    steps: [
      "シーバスの切り身に塩こしょうする",
      "フライパンにオリーブオイルとにんにくを入れ香りを出す",
      "魚を皮目から焼いて両面焼き色をつける",
      "白ワイン・水・ミニトマト・あさりを加えフタをして蒸し煮",
      "塩で味を調えイタリアンパセリを散らす",
    ],
    tips: "あさりの旨みが決め手。冷凍でも可。",
    beginnerOk: false,
  },
  {
    id: "seabass_shioyaki",
    name: "塩焼き",
    fish: ["シーバス", "クロダイ", "シロギス"],
    difficulty: 1,
    cookTime: "20分",
    category: "焼き",
    description: "釣りたての鮮度を最もシンプルに味わえる定番。",
    steps: [
      "魚に塩を振って10分おき、出てきた水分を拭く",
      "グリルまたはフライパンで中火でゆっくり焼く",
      "皮に焼き色がついたら裏返し、火が通るまで焼く",
      "大根おろし・すだちと供する",
    ],
    tips: "焼く前に皮に切れ目を入れると火の通りが均一になる。",
    beginnerOk: true,
  },

  /* ── 青物（ブリ/ワカシ/カンパチ想定）──── */
  {
    id: "aomono_namerou",
    name: "なめろう",
    fish: ["青物", "アジ"],
    difficulty: 1,
    cookTime: "20分",
    category: "刺身",
    description: "叩いた身と薬味が一体化した房総発祥の郷土料理。",
    steps: [
      "3枚おろしにして皮と骨を取る",
      "まな板の上でみそ・しょうが・ネギを乗せて包丁で叩く",
      "なめらかなペースト状になるまで叩き続ける",
      "味見をして塩で調整する",
      "大葉を敷いた皿に盛り、青ネギを散らす",
    ],
    tips: "脂の乗った青物ほど美味しい。叩くほど旨みが増す。",
    beginnerOk: true,
  },
  {
    id: "aomono_zuke_don",
    name: "漬け丼",
    fish: ["青物", "クロダイ"],
    difficulty: 1,
    cookTime: "20分",
    category: "その他",
    description: "醤油・みりん・ごまのタレに漬けた魚をご飯にのせる简单丼。",
    steps: [
      "魚を刺身サイズに切る",
      "醤油2・みりん1・酒1を合わせたタレに10分漬ける",
      "ご飯に刺身をのせ、たれをかける",
      "わさび・白ごま・海苔・大葉をトッピング",
    ],
    tips: "漬けすぎると辛くなるので15分以内に。",
    beginnerOk: true,
  },
  {
    id: "aomono_teriyaki",
    name: "照り焼き",
    fish: ["青物", "サバ"],
    difficulty: 1,
    cookTime: "25分",
    category: "焼き",
    description: "甘辛タレが食欲をそそる定番。ご飯がすすむ一品。",
    steps: [
      "魚の切り身に塩を振って10分おき、水気を拭く",
      "フライパンに油を引いて両面を焼く",
      "醤油2・みりん2・砂糖1を合わせたタレを加え絡める",
      "タレが煮詰まってとろみが出たら完成",
    ],
    tips: "タレは焦げやすいので火を弱めてから加える。",
    beginnerOk: true,
  },

  /* ── アジ ────────────────────────────────── */
  {
    id: "aji_fry",
    name: "アジフライ",
    fish: ["アジ", "シロギス"],
    difficulty: 2,
    cookTime: "30分",
    category: "揚げ",
    description: "サクサクの衣と肉厚なアジが最高。ソース派・タルタル派で分かれる名品。",
    steps: [
      "アジを3枚おろし（または背開き）にする",
      "塩こしょうして薄力粉→卵→パン粉の順で衣をつける",
      "170℃の油で片面3分ずつ揚げる",
      "きつね色になったら取り出す",
      "キャベツの千切りとソース・タルタルで供する",
    ],
    tips: "パン粉は細かいものより粗めの方がサクサク感が出る。",
    beginnerOk: false,
  },
  {
    id: "aji_nanban",
    name: "南蛮漬け",
    fish: ["アジ", "シロギス", "サバ"],
    difficulty: 2,
    cookTime: "40分（冷蔵1時間以上推奨）",
    category: "揚げ",
    description: "揚げた魚を甘酢に漬けて野菜と合わせる保存食。翌日がさらに旨い。",
    steps: [
      "アジを3枚おろしにして骨を取る",
      "片栗粉をまぶし180℃で揚げる",
      "酢3・砂糖2・醤油1・みりん1・水3を煮立てて南蛮酢を作る",
      "タマネギ・パプリカ・唐辛子を薄切りにして南蛮酢に入れる",
      "揚げたアジを南蛮酢に漬けて1時間以上冷蔵する",
    ],
    tips: "酢の量はお好みで調整。冷やしながら食べると夏に最高。",
    beginnerOk: false,
  },
  {
    id: "aji_sashimi",
    name: "刺身（あじたたき）",
    fish: ["アジ"],
    difficulty: 2,
    cookTime: "20分",
    category: "刺身",
    description: "新鮮なアジを刺身や叩きに。釣りたてなら格別。",
    steps: [
      "アジを3枚おろしにして皮を引く",
      "刺身は薄めに切り、叩きにする場合はざく切りで叩く",
      "ショウガ・ネギ・みょうが・大葉と合わせる",
      "刺身は醤油わさびで、叩きはポン酢で供する",
    ],
    tips: "ゼイゴ（硬い鱗）を先に取り除くこと。",
    beginnerOk: false,
  },

  /* ── シロギス ──────────────────────────── */
  {
    id: "kisu_tempura",
    name: "天ぷら",
    fish: ["シロギス", "マゴチ", "タチウオ"],
    difficulty: 2,
    cookTime: "30分",
    category: "揚げ",
    description: "シロギスは天ぷらが最高峰。サクッとした衣と淡白な身の組み合わせ。",
    steps: [
      "シロギスを背開きにして骨を取る",
      "天ぷら粉を冷水で軽く混ぜる（ダマが残る程度）",
      "170℃の油でサッと揚げる（2〜3分）",
      "揚げすぎない。衣が固まったら取り出す",
      "天つゆ・大根おろしで供する",
    ],
    tips: "衣は混ぜすぎない。油の温度キープが重要。",
    beginnerOk: false,
  },
  {
    id: "kisu_fry",
    name: "フライ",
    fish: ["シロギス"],
    difficulty: 1,
    cookTime: "25分",
    category: "揚げ",
    description: "衣がしっかりつくフライ。タルタルソースとの相性が最高。",
    steps: [
      "シロギスを三枚おろし（または背開き）にする",
      "塩こしょうして薄力粉→卵→パン粉の順で衣をつける",
      "170℃の油で3分揚げる",
      "タルタルソースと千切りキャベツで供する",
    ],
    tips: "パン粉は押さえてしっかりつける。",
    beginnerOk: true,
  },

  /* ── タチウオ ──────────────────────────── */
  {
    id: "tachiuo_aburi",
    name: "炙り刺し",
    fish: ["タチウオ"],
    difficulty: 2,
    cookTime: "20分",
    category: "刺身",
    description: "バーナーで炙ることで皮目の脂が香ばしく引き立つ絶品。",
    steps: [
      "タチウオを5〜6cm幅の刺身用に切る",
      "皮目に切れ目を細かく入れる",
      "バーナーや魚焼きグリルで皮目だけ炙る",
      "氷水で冷やしてから皿に並べる",
      "ポン酢・もみじおろし・刻みネギで供する",
    ],
    tips: "炙りすぎると身が固くなる。皮がチリチリするくらいでOK。",
    beginnerOk: false,
  },
  {
    id: "tachiuo_shioyaki",
    name: "塩焼き",
    fish: ["タチウオ"],
    difficulty: 1,
    cookTime: "20分",
    category: "焼き",
    description: "タチウオの脂が溢れ出すシンプルな塩焼き。",
    steps: [
      "タチウオを4〜5cm幅に切る",
      "両面に塩を振って5分おく",
      "出てきた水気を拭いてグリルへ",
      "弱火で片面6〜7分ずつじっくり焼く",
    ],
    tips: "弱火でじっくりが鉄則。強火だと外だけ焦げる。",
    beginnerOk: true,
  },
  {
    id: "tachiuo_tempura",
    name: "天ぷら",
    fish: ["タチウオ"],
    difficulty: 2,
    cookTime: "30分",
    category: "揚げ",
    description: "脂の乗ったタチウオの天ぷらは絶品。大葉と一緒に揚げても◎。",
    steps: [
      "タチウオを5cm幅に切る（骨は取っても取らなくてもよい）",
      "天ぷら粉を冷水で混ぜ、タチウオにつける",
      "175℃の油で片面2〜3分揚げる",
      "天つゆで供する",
    ],
    tips: "タチウオは油はねしやすいので注意。",
    beginnerOk: false,
  },

  /* ── カサゴ ──────────────────────────────── */
  {
    id: "kasago_karaage",
    name: "唐揚げ",
    fish: ["カサゴ"],
    difficulty: 1,
    cookTime: "30分",
    category: "揚げ",
    description: "骨ごと揚げて食べる根魚の王道。頭から尻尾まで全部食べられる。",
    steps: [
      "カサゴのウロコとエラ・内臓を取る",
      "深めの切れ目を入れて醤油・酒・生姜に15分漬ける",
      "片栗粉をまぶして180℃の油でじっくり揚げる（7〜10分）",
      "カリッとなったら取り出す",
      "レモンを絞って供する",
    ],
    tips: "低温でじっくり揚げると骨まで食べられる。",
    beginnerOk: true,
  },
  {
    id: "kasago_misoshiru",
    name: "味噌汁",
    fish: ["カサゴ", "アジ", "シーバス"],
    difficulty: 1,
    cookTime: "20分",
    category: "煮",
    description: "あらで取った出汁が最高の贅沢。料理の最後は必ず味噌汁に。",
    steps: [
      "カサゴのウロコ・エラ・内臓を取り、食べやすい大きさに切る",
      "さっと熱湯に通し（霜降り）、水で洗う",
      "水と昆布で煮立て、アクを取る",
      "味噌を溶き入れる",
      "豆腐・わかめ・ネギを加えて完成",
    ],
    tips: "霜降りをしっかりやるとスッキリした出汁になる。",
    beginnerOk: true,
  },

  /* ── クロダイ ──────────────────────────── */
  {
    id: "kurodai_sashimi",
    name: "刺身",
    fish: ["クロダイ", "マゴチ"],
    difficulty: 2,
    cookTime: "20分",
    category: "刺身",
    description: "秋冬に脂の乗ったクロダイの刺身は意外な美味しさ。",
    steps: [
      "3枚おろしにして皮を引く",
      "薄くそぎ切りにする",
      "大葉・わさびと共に皿に並べる",
      "しょう油でいただく",
    ],
    tips: "磯臭さが気になる場合は皮を引いた後に昆布締めにするとよい。",
    beginnerOk: false,
  },
  {
    id: "kurodai_nibitashi",
    name: "煮付け",
    fish: ["クロダイ", "カサゴ"],
    difficulty: 1,
    cookTime: "25分",
    category: "煮",
    description: "甘辛い煮汁が染み込んだご飯のおとも。白身の旨みを最大限に。",
    steps: [
      "魚に切れ目を入れて熱湯で霜降りし水洗いする",
      "鍋に酒・みりん・醤油・砂糖・水を入れて煮立てる",
      "魚を入れ落し蓋をして中火で10〜12分煮る",
      "汁を絡めながら少し煮詰める",
    ],
    tips: "煮汁はしっかり煮立ててから魚を入れる。",
    beginnerOk: true,
  },

  /* ── マゴチ ──────────────────────────────── */
  {
    id: "magochi_sashimi",
    name: "刺身",
    fish: ["マゴチ", "ヒラメ"],
    difficulty: 2,
    cookTime: "20分",
    category: "刺身",
    description: "夏のコチはヒラメに匹敵する白身の旨み。薄造りが絶品。",
    steps: [
      "マゴチを3枚おろしにして皮を引く",
      "薄くそぎ切りにする（薄造り）",
      "菊花・大葉と共に皿に盛る",
      "ポン酢ともみじおろしで供する",
    ],
    tips: "皮下に脂があるので皮霜造りにしても美味しい。",
    beginnerOk: false,
  },
  {
    id: "magochi_aragiri",
    name: "あら汁",
    fish: ["マゴチ", "ヒラメ", "シーバス"],
    difficulty: 1,
    cookTime: "25分",
    category: "煮",
    description: "捌いた後のアラも捨てずに。濃厚な出汁が美味。",
    steps: [
      "アラ（頭・中骨・カマ）を適当に切る",
      "熱湯で霜降りして水洗いする",
      "水と昆布で煮立て、アクをしっかり取る",
      "酒・塩で味を調える",
      "ネギ・ゴボウ・豆腐を加えて5分煮る",
      "仕上げに味噌を溶き入れる",
    ],
    tips: "アクを丁寧に取るほど澄んだ上品な出汁になる。",
    beginnerOk: true,
  },

  /* ── サバ ────────────────────────────────── */
  {
    id: "saba_shime",
    name: "しめ鯖",
    fish: ["サバ"],
    difficulty: 3,
    cookTime: "60分＋冷蔵3時間以上",
    category: "刺身",
    description: "酢で締めたサバは独特の旨み。釣りたての鮮度が命。",
    steps: [
      "サバを3枚おろしにして中骨を抜く",
      "塩をたっぷり振り30分〜1時間おく",
      "水で塩を洗い流し、米酢に1〜2時間漬ける",
      "皮を剥いて薄くそぎ切りにする",
      "ショウガ・ネギ・ポン酢で供する",
    ],
    tips: "アニサキス対策として内臓は釣り場で即処理が鉄則。",
    beginnerOk: false,
  },
  {
    id: "saba_misoni",
    name: "味噌煮",
    fish: ["サバ"],
    difficulty: 1,
    cookTime: "30分",
    category: "煮",
    description: "脂の乗ったサバと味噌の組み合わせは最強の定番。",
    steps: [
      "サバを3〜4切れに切り、熱湯で霜降りする",
      "鍋に水・酒・砂糖・みりんを入れて煮立てる",
      "サバを入れ落し蓋をして7〜8分煮る",
      "味噌を溶き入れてさらに5分煮る",
      "煮汁を絡めながら仕上げる",
    ],
    tips: "生姜を加えると臭みが取れる。煮崩れ注意。",
    beginnerOk: true,
  },
  {
    id: "saba_tatsutagei",
    name: "竜田揚げ",
    fish: ["サバ", "アジ"],
    difficulty: 1,
    cookTime: "30分",
    category: "揚げ",
    description: "醤油・生姜で下味をつけた揚げ物。お弁当にも最適。",
    steps: [
      "サバを食べやすい大きさに切る",
      "醤油・酒・みりん・生姜汁に20分漬ける",
      "水気を拭き取り、片栗粉をまぶす",
      "180℃の油で3〜4分揚げる",
      "レモンと大根おろしで供する",
    ],
    tips: "下味の時間を長くすると臭みが消える。",
    beginnerOk: true,
  },
];

/** 指定した魚種のレシピを返す */
export function getRecipesByFish(fishName: string): Recipe[] {
  return RECIPES.filter((r) => r.fish.includes(fishName));
}

/** 難易度ラベル */
export function difficultyLabel(d: 1 | 2 | 3): string {
  return d === 1 ? "簡単" : d === 2 ? "普通" : "本格";
}

/** カテゴリ絵文字 */
export function categoryIcon(cat: RecipeCategory): string {
  const map: Record<RecipeCategory, string> = {
    刺身: "🔪", 焼き: "🔥", 揚げ: "🍳", 煮: "🥘", 洋食: "🍽️", その他: "🍚",
  };
  return map[cat];
}
