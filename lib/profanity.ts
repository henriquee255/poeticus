const BAD_WORDS = [
    'merda','porra','caralho','foda','fodase','viado','puta','vadia','cuzão','cu',
    'buceta','xoxota','piroca','rola','pau','otário','idiota','imbecil','burro',
    'retardado','lixo','desgraça','filho da puta','vai se foder','vai tomar no cu',
    'puta que pariu','arrombado','babaca','corno','safado','vagabunda','prostituta',
    'pederasta','travesti','bosta','bostinha','caga','cagão','punheta','punheteiro'
]

export function filterProfanity(text: string): string {
    let result = text
    for (const word of BAD_WORDS) {
        const regex = new RegExp(word, 'gi')
        result = result.replace(regex, (match) => '*'.repeat(match.length))
    }
    return result
}
