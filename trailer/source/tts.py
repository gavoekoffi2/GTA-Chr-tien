import sys, certifi, asyncio
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
import edge_tts
async def main(text, out, voice, rate, pitch):
    c = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary='WordBoundary')
    words = []
    with open(out, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append((ch['offset']/1e7, ch['duration']/1e7, ch['text']))
    import json; json.dump(words, open(out + '.json', 'w'), ensure_ascii=False)
asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]))
