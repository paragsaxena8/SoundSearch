import aiohttp, asyncio, json, argparse
from base64 import b64decode
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

class Endpoints:
    search = "https://gaana.com/apiv2?country=IN&page=0&secType=track&type=search&keyword="
    detail = "https://gaana.com/apiv2?type=songDetail&seokey="

class Gaana:
    KEY = b'gy1t#b@jl(b$wtme'    
    
    def __init__(self):
        self.session = aiohttp.ClientSession()
               
    async def close(self):
        await self.session.close()
    
    def decrypt(self, data: str) -> str:
        offset = int(data[0])
        iv = data[offset:offset+16].encode()
        ct = b64decode(data[offset+16:])
        return unpad(AES.new(self.KEY, AES.MODE_CBC, iv).decrypt(ct), 16).decode()
    
    def format_duration(self, seconds: str) -> str:
        secs = int(seconds)
        return f"{secs // 60}:{secs % 60:02d}"
    
    async def search(self, query: str, limit: int = 10) -> list:
        async with self.session.post(Endpoints.search + query) as r:
            data = await r.json()
        
        try:
            ids = [t['seo'] for t in data['gr'][0]['gd'][:limit]]
        except (KeyError, IndexError):
            return {'ERROR': 'No results'}
        
        return await asyncio.gather(*[self.track(i) for i in ids])
    
    async def track(self, seokey: str) -> dict:
        async with self.session.post(Endpoints.detail + seokey) as r:
            t = (await r.json())['tracks'][0]
        
        artists = ', '.join(a['name'] for a in t['artist'])
        streams = {}
        
        try:
            base = self.decrypt(t['urls']['medium']['message'])
            streams = {
                'very_high': base.replace('64.mp4', '320.mp4'),
                'high': base.replace('64.mp4', '128.mp4'),
                'medium': base,
                'low': base.replace('64.mp4', '16.mp4')
            }
        except KeyError:
            pass
        
        return {
            'title': t['track_title'],
            'album': t['album_title'],
            'artists': artists,
            'duration': self.format_duration(t['duration']),
            'language': t['language'],
            'music': streams,
            'thumbnail': {
                'large': t['artwork_large'].strip(),
                'medium': t['artwork_web'].strip(),
                'small': t['artwork'].strip()
            }
        }

async def main():
    p = argparse.ArgumentParser()
    p.add_argument('query', nargs='?', help="Song name")
    p.add_argument('-l', type=int, default=10, help="Limit")
    args = p.parse_args()
    
    g = Gaana()
    try:
        if args.query:
            print(json.dumps(await g.search(args.query, args.l), indent=2, ensure_ascii=False))
        else:
            while True:
                q = input("Song name: ").strip()
                if not q:
                    break
                lim = input("Limit [Default 10]: ").strip() or "10"
                print(json.dumps(await g.search(q, int(lim)), indent=2, ensure_ascii=False))
                print()
    finally:
        await g.close()

if __name__ == "__main__":
    asyncio.run(main())