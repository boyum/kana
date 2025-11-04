export interface KanaCharacter {
	character: string;
	romanization: string;
	type: 'hiragana' | 'katakana';
}

export const hiraganaCharacters: KanaCharacter[] = [
	// Vowels
	{ character: 'あ', romanization: 'a', type: 'hiragana' },
	{ character: 'い', romanization: 'i', type: 'hiragana' },
	{ character: 'う', romanization: 'u', type: 'hiragana' },
	{ character: 'え', romanization: 'e', type: 'hiragana' },
	{ character: 'お', romanization: 'o', type: 'hiragana' },
	
	// K-series
	{ character: 'か', romanization: 'ka', type: 'hiragana' },
	{ character: 'き', romanization: 'ki', type: 'hiragana' },
	{ character: 'く', romanization: 'ku', type: 'hiragana' },
	{ character: 'け', romanization: 'ke', type: 'hiragana' },
	{ character: 'こ', romanization: 'ko', type: 'hiragana' },
	
	// S-series
	{ character: 'さ', romanization: 'sa', type: 'hiragana' },
	{ character: 'し', romanization: 'shi', type: 'hiragana' },
	{ character: 'す', romanization: 'su', type: 'hiragana' },
	{ character: 'せ', romanization: 'se', type: 'hiragana' },
	{ character: 'そ', romanization: 'so', type: 'hiragana' },
	
	// T-series
	{ character: 'た', romanization: 'ta', type: 'hiragana' },
	{ character: 'ち', romanization: 'chi', type: 'hiragana' },
	{ character: 'つ', romanization: 'tsu', type: 'hiragana' },
	{ character: 'て', romanization: 'te', type: 'hiragana' },
	{ character: 'と', romanization: 'to', type: 'hiragana' },
	
	// N-series
	{ character: 'な', romanization: 'na', type: 'hiragana' },
	{ character: 'に', romanization: 'ni', type: 'hiragana' },
	{ character: 'ぬ', romanization: 'nu', type: 'hiragana' },
	{ character: 'ね', romanization: 'ne', type: 'hiragana' },
	{ character: 'の', romanization: 'no', type: 'hiragana' },
	
	// H-series
	{ character: 'は', romanization: 'ha', type: 'hiragana' },
	{ character: 'ひ', romanization: 'hi', type: 'hiragana' },
	{ character: 'ふ', romanization: 'fu', type: 'hiragana' },
	{ character: 'へ', romanization: 'he', type: 'hiragana' },
	{ character: 'ほ', romanization: 'ho', type: 'hiragana' },
	
	// M-series
	{ character: 'ま', romanization: 'ma', type: 'hiragana' },
	{ character: 'み', romanization: 'mi', type: 'hiragana' },
	{ character: 'む', romanization: 'mu', type: 'hiragana' },
	{ character: 'め', romanization: 'me', type: 'hiragana' },
	{ character: 'も', romanization: 'mo', type: 'hiragana' },
	
	// Y-series
	{ character: 'や', romanization: 'ya', type: 'hiragana' },
	{ character: 'ゆ', romanization: 'yu', type: 'hiragana' },
	{ character: 'よ', romanization: 'yo', type: 'hiragana' },
	
	// R-series
	{ character: 'ら', romanization: 'ra', type: 'hiragana' },
	{ character: 'り', romanization: 'ri', type: 'hiragana' },
	{ character: 'る', romanization: 'ru', type: 'hiragana' },
	{ character: 'れ', romanization: 're', type: 'hiragana' },
	{ character: 'ろ', romanization: 'ro', type: 'hiragana' },
	
	// W-series
	{ character: 'わ', romanization: 'wa', type: 'hiragana' },
	{ character: 'を', romanization: 'wo', type: 'hiragana' },
	
	// N
	{ character: 'ん', romanization: 'n', type: 'hiragana' }
];

export const katakanaCharacters: KanaCharacter[] = [
	// Vowels
	{ character: 'ア', romanization: 'a', type: 'katakana' },
	{ character: 'イ', romanization: 'i', type: 'katakana' },
	{ character: 'ウ', romanization: 'u', type: 'katakana' },
	{ character: 'エ', romanization: 'e', type: 'katakana' },
	{ character: 'オ', romanization: 'o', type: 'katakana' },
	
	// K-series
	{ character: 'カ', romanization: 'ka', type: 'katakana' },
	{ character: 'キ', romanization: 'ki', type: 'katakana' },
	{ character: 'ク', romanization: 'ku', type: 'katakana' },
	{ character: 'ケ', romanization: 'ke', type: 'katakana' },
	{ character: 'コ', romanization: 'ko', type: 'katakana' },
	
	// S-series
	{ character: 'サ', romanization: 'sa', type: 'katakana' },
	{ character: 'シ', romanization: 'shi', type: 'katakana' },
	{ character: 'ス', romanization: 'su', type: 'katakana' },
	{ character: 'セ', romanization: 'se', type: 'katakana' },
	{ character: 'ソ', romanization: 'so', type: 'katakana' },
	
	// T-series
	{ character: 'タ', romanization: 'ta', type: 'katakana' },
	{ character: 'チ', romanization: 'chi', type: 'katakana' },
	{ character: 'ツ', romanization: 'tsu', type: 'katakana' },
	{ character: 'テ', romanization: 'te', type: 'katakana' },
	{ character: 'ト', romanization: 'to', type: 'katakana' },
	
	// N-series
	{ character: 'ナ', romanization: 'na', type: 'katakana' },
	{ character: 'ニ', romanization: 'ni', type: 'katakana' },
	{ character: 'ヌ', romanization: 'nu', type: 'katakana' },
	{ character: 'ネ', romanization: 'ne', type: 'katakana' },
	{ character: 'ノ', romanization: 'no', type: 'katakana' },
	
	// H-series
	{ character: 'ハ', romanization: 'ha', type: 'katakana' },
	{ character: 'ヒ', romanization: 'hi', type: 'katakana' },
	{ character: 'フ', romanization: 'fu', type: 'katakana' },
	{ character: 'ヘ', romanization: 'he', type: 'katakana' },
	{ character: 'ホ', romanization: 'ho', type: 'katakana' },
	
	// M-series
	{ character: 'マ', romanization: 'ma', type: 'katakana' },
	{ character: 'ミ', romanization: 'mi', type: 'katakana' },
	{ character: 'ム', romanization: 'mu', type: 'katakana' },
	{ character: 'メ', romanization: 'me', type: 'katakana' },
	{ character: 'モ', romanization: 'mo', type: 'katakana' },
	
	// Y-series
	{ character: 'ヤ', romanization: 'ya', type: 'katakana' },
	{ character: 'ユ', romanization: 'yu', type: 'katakana' },
	{ character: 'ヨ', romanization: 'yo', type: 'katakana' },
	
	// R-series
	{ character: 'ラ', romanization: 'ra', type: 'katakana' },
	{ character: 'リ', romanization: 'ri', type: 'katakana' },
	{ character: 'ル', romanization: 'ru', type: 'katakana' },
	{ character: 'レ', romanization: 're', type: 'katakana' },
	{ character: 'ロ', romanization: 'ro', type: 'katakana' },
	
	// W-series
	{ character: 'ワ', romanization: 'wa', type: 'katakana' },
	{ character: 'ヲ', romanization: 'wo', type: 'katakana' },
	
	// N
	{ character: 'ン', romanization: 'n', type: 'katakana' }
];
